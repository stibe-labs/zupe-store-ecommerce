import { NextRequest, NextResponse } from "next/server";
import { createCashfreeOrder } from "@/lib/cashfree";
import { createPyDartPaymentOrder, getPyDartPayConfig } from "@/lib/pydartPay";
import { createOrder, OrderRecord } from "@/lib/orderStore";
import { executeD1Query } from "@/lib/d1";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";

export const dynamic = "force-dynamic";

/**
 * Resolves authoritative server-side product subtotal from D1 / catalog so clients
 * cannot tamper cart item prices below real catalog pricing.
 */
async function computeAuthoritativeMinSubtotal(
  items: Array<{ product_id?: string; id?: string; name?: string; price?: number; quantity?: number; bundle_tier?: number }>
): Promise<number | null> {
  const catalogById = new Map<string, number>();
  for (const p of DEFAULT_PRODUCTS) {
    if (p.id && typeof p.price === "number" && p.price > 0) {
      catalogById.set(p.id.toLowerCase(), p.price);
    }
    if (p.slug && typeof p.price === "number" && p.price > 0) {
      catalogById.set(p.slug.toLowerCase(), p.price);
    }
  }

  try {
    const rows = await executeD1Query<{ id: string; slug: string; price: number }>(
      "SELECT id, slug, price FROM products"
    );
    if (Array.isArray(rows)) {
      for (const r of rows) {
        if (r.id && Number(r.price) > 0) catalogById.set(String(r.id).toLowerCase(), Number(r.price));
        if (r.slug && Number(r.price) > 0) catalogById.set(String(r.slug).toLowerCase(), Number(r.price));
      }
    }
  } catch {
    // Fall back to static catalog prices if D1 lookup is unavailable
  }

  let authoritativeFloor = 0;
  for (const it of items) {
    const qty = Math.max(1, Math.min(50, Math.round(Number(it.quantity || 1))));
    const key = String(it.product_id || it.id || "").toLowerCase().trim();
    const basePrice = catalogById.get(key);
    if (!basePrice) return null;
    // Allow legitimate multi-pack bundle discounts up to 40% off base unit price
    const minUnitPrice = it.bundle_tier && it.bundle_tier > 1 ? Math.floor(basePrice * 0.55) : basePrice;
    authoritativeFloor += minUnitPrice * qty;
  }
  return authoritativeFloor;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      city,
      postal_code,
      items,
      user_id,
      promo_code,
      discount_amount,
      is_cod_advance,
      total_amount,
      balance_due,
    } = body;

    const isCod = Boolean(is_cod_advance);
    let configuredCodAdvance = 49;
    try {
      const { getSettings } = await import("@/lib/erpStore");
      const st = await getSettings();
      if (st?.storeProfile?.codFee !== undefined) {
        configuredCodAdvance = Number(st.storeProfile.codFee) || 49;
      }
    } catch {}

    if (!customer_name || !shipping_address || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required order information" },
        { status: 400 }
      );
    }

    // 1. Authoritative Stock Verification
    const { validateOrderStock } = await import("@/lib/inventoryService");
    const stockValidation = await validateOrderStock(items);
    if (!stockValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error:
            stockValidation.error ||
            "One or more items in your cart are currently out of stock.",
          outOfStockItems: stockValidation.outOfStockItems,
        },
        { status: 400 }
      );
    }

    // 2. Authoritative Price Floor Guard (defeats client-side ₹1 price tampering)
    const rawRequestedAmount = Math.round(Number(amount));
    const minCatalogFloor = await computeAuthoritativeMinSubtotal(items);
    const maxAllowedPromoDiscount = Math.max(0, Math.round(Number(discount_amount || 0)));

    let chargeAmount = isCod ? configuredCodAdvance : rawRequestedAmount;
    if (!isCod && minCatalogFloor !== null) {
      // Allow up to 50% legitimate coupon discount off catalog floor, minimum ₹2
      const safeDiscountCap = Math.min(maxAllowedPromoDiscount, Math.floor(minCatalogFloor * 0.5));
      const authoritativeMinTotal = Math.max(2, minCatalogFloor - safeDiscountCap);
      if (chargeAmount < authoritativeMinTotal) {
        chargeAmount = authoritativeMinTotal;
      }
    }

    if (!Number.isFinite(chargeAmount) || chargeAmount < 2) {
      return NextResponse.json(
        { success: false, error: "Invalid payment charge amount specified (minimum ₹2)" },
        { status: 400 }
      );
    }

    const cleanPhone = String(customer_phone || "").replace(/\D/g, "");
    const effectiveUserId =
      user_id || (cleanPhone ? `guest_${cleanPhone}` : `guest_${Date.now()}`);

    const orderId = `ord_${Date.now()}_${crypto.randomUUID().replace(/-/g, "").slice(0, 6)}`;
    const confirmToken = `tok_${crypto.randomUUID().replace(/-/g, "")}`;

    const rawOrderTotal = isCod
      ? Math.round(Number(total_amount || chargeAmount + Number(balance_due || 0)))
      : Math.round(Number(total_amount || chargeAmount));
    const orderTotalAmount =
      minCatalogFloor !== null
        ? Math.max(rawOrderTotal, Math.max(2, minCatalogFloor - Math.min(maxAllowedPromoDiscount, Math.floor(minCatalogFloor * 0.5))))
        : rawOrderTotal;
    const orderBalanceDue = isCod
      ? Math.max(0, orderTotalAmount - chargeAmount)
      : 0;
    const orderPaymentMethod = isCod ? "Cash on Delivery" : "Online Payment";

    // 3. Pre-create order in ERP and D1 with Pending payment status
    // Note: advance_paid is strictly 0 until gateway payment is confirmed!
    const newOrder: OrderRecord = {
      id: orderId,
      user_id: effectiveUserId,
      customer_name: String(customer_name).trim(),
      customer_email: customer_email ? String(customer_email).trim() : "",
      customer_phone: String(customer_phone || "").trim(),
      shipping_address: String(shipping_address).trim(),
      city: String(city || "").trim(),
      postal_code: String(postal_code || "").trim(),
      total_amount: orderTotalAmount,
      discount_amount: Number(discount_amount || 0),
      promo_code: promo_code ? String(promo_code).trim() : undefined,
      payment_method: orderPaymentMethod,
      payment_status: "pending",
      order_status: "payment_pending",
      advance_paid: 0,
      balance_due: orderBalanceDue > 0 ? orderBalanceDue : orderTotalAmount,
      is_cod_partial: isCod ? 1 : 0,
      whatsapp_confirm_status: "pending_payment",
      whatsapp_confirm_token: confirmToken,
      whatsapp_token_used: false,
      items,
      created_at: new Date().toISOString(),
    };

    await createOrder(newOrder);

    // 4. Route Primary Checkout through PyDart Pay (https://pydart.com -> Tishnu Sub-Merchant acc_U448dnHAqswn5q)
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://turkiyejam.com").replace(/\/+$/, "");
    const redirectUrl = `${siteUrl}/checkout?cf_order_id=${encodeURIComponent(orderId)}`;
    const cancelUrl = `${siteUrl}/checkout?cf_order_id=${encodeURIComponent(orderId)}&status=cancelled`;

    let pydartPayUrl = "";
    let pydartOrderId = "";
    let paymentSessionId = "";

    const pydartConfig = await getPyDartPayConfig();
    if (pydartConfig.apiKey) {
      const pydartOrder = await createPyDartPaymentOrder({
        merchantOrderId: orderId,
        amountRupees: chargeAmount,
        orderPurpose: isCod
          ? `Turkiye Jam - COD Advance Confirmation (₹${chargeAmount})`
          : "Turkiye Jam - 100% Authentic Paste Order",
        customerName: String(customer_name).trim(),
        customerMobile: cleanPhone || "9876543210",
        customerEmail: customer_email ? String(customer_email).trim() : "support@turkiyejam.com",
        redirectUrl,
        orderTags: {
          store: "turkiyejam",
          mode: isCod ? "cod_advance" : "prepaid",
        },
      });

      pydartOrderId = pydartOrder.pydartOrderId;
      pydartPayUrl = pydartOrder.paymentLink;

      // Bind PyDart Pay order_id 1:1 on D1 orders row for authoritative verification & webhooks
      await executeD1Query(
        `UPDATE orders SET razorpay_order_id = ? WHERE id = ?`,
        [pydartOrderId, orderId]
      ).catch(() => null);
    } else {
      // Fallback ONLY when PYDART_API_KEY is unconfigured (e.g. legacy local dev)
      const cfOrder = await createCashfreeOrder({
        orderId,
        amount: chargeAmount,
        customerName: String(customer_name).trim(),
        customerEmail: customer_email ? String(customer_email).trim() : "support@turkiyejam.com",
        customerPhone: cleanPhone || "9876543210",
        returnUrl: redirectUrl,
        cancelUrl,
      });
      paymentSessionId = cfOrder.payment_session_id;
    }

    return NextResponse.json({
      success: true,
      orderId,
      pydartOrderId,
      payUrl: pydartPayUrl,
      settlerPayUrl: pydartPayUrl,
      paymentSessionId,
      settlerInvoiceId: pydartOrderId,
      amount: chargeAmount,
      isCod,
      advancePaid: 0,
      expectedAdvance: chargeAmount,
      balanceDue: orderTotalAmount,
      totalAmount: orderTotalAmount,
    });
  } catch (err: any) {
    console.error("Payment gateway create-order error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Failed to initialize payment session",
      },
      { status: 500 }
    );
  }
}
