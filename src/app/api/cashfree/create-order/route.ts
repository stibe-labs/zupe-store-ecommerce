import { NextRequest, NextResponse } from "next/server";
import { createCashfreeOrder } from "@/lib/cashfree";
import { createOrder, OrderRecord } from "@/lib/orderStore";

export const dynamic = "force-dynamic";

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
      gst_amount,
      is_cod_advance,
      total_amount,
      balance_due,
      payment_method,
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

    const chargeAmount = isCod
      ? (typeof amount === "number" && amount > 0 ? Math.round(amount) : configuredCodAdvance)
      : Math.round(Number(amount));

    if (!chargeAmount || typeof chargeAmount !== "number" || chargeAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid payment charge amount specified" },
        { status: 400 }
      );
    }

    if (!customer_name || !shipping_address || !items || items.length === 0) {
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

    const cleanPhone = (customer_phone || "").replace(/\D/g, "");
    const effectiveUserId =
      user_id || (cleanPhone ? `guest_${cleanPhone}` : `guest_${Date.now()}`);

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const confirmToken = `tok_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;

    const orderTotalAmount = isCod
      ? Math.round(Number(total_amount || (amount + (balance_due || 0))))
      : Math.round(Number(total_amount || amount));
    const orderBalanceDue = isCod
      ? Math.round(Number(balance_due !== undefined ? balance_due : (orderTotalAmount - chargeAmount)))
      : 0;
    const orderAdvancePaid = isCod ? chargeAmount : chargeAmount;
    const orderPaymentMethod = isCod ? "Cash on Delivery" : "Online Payment";

    // 2. Pre-create order in ERP and D1 with Pending payment status
    const newOrder: OrderRecord = {
      id: orderId,
      user_id: effectiveUserId,
      customer_name,
      customer_email: customer_email ? customer_email.trim() : "",
      customer_phone: customer_phone || "",
      shipping_address,
      city: city || "",
      postal_code: postal_code || "",
      total_amount: orderTotalAmount,
      discount_amount: Number(discount_amount || 0),
      payment_method: orderPaymentMethod,
      payment_status: "pending",
      order_status: "processing",
      advance_paid: orderAdvancePaid,
      balance_due: orderBalanceDue,
      is_cod_partial: isCod ? 1 : 0,
      whatsapp_confirm_status: "pending_whatsapp",
      whatsapp_confirm_token: confirmToken,
      whatsapp_token_used: false,
      items,
      created_at: new Date().toISOString(),
    };

    await createOrder(newOrder);

    // 3. Create Gateway Session via Settler (settler.pydart.com)
    // Settler is fully whitelisted with Cashfree production rails and handles UPI QR, Cards & NetBanking
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://turkiyejam.com";
    const redirectUrl = `${siteUrl}/checkout?cf_order_id=${encodeURIComponent(orderId)}`;

    let settlerPayUrl = "";
    let settlerInvoiceId = "";
    let paymentSessionId = "";

    try {
      const settlerRes = await fetch("https://settler.pydart.com/api/v1/invoices/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer sk_live_stibe_prod_7793",
        },
        body: JSON.stringify({
          customerName: customer_name,
          customerPhone: cleanPhone || "9876543210",
          customerEmail: customer_email || "support@turkiyejam.com",
          title: isCod
            ? "Turkiye Jam - COD Advance Confirmation (₹49)"
            : "Turkiye Jam - 100% Authentic Paste Order",
          amountRupees: chargeAmount,
          redirectUrl,
        }),
      });

      const settlerData: any = await settlerRes.json();
      if (settlerData.success && settlerData.invoice) {
        settlerInvoiceId = settlerData.invoice.id;
        settlerPayUrl = `https://settler.pydart.com${settlerData.invoice.payUrl}`;

        // Immediately initiate order on Settler server-to-server to fetch the Cashfree paymentSessionId
        // This allows the customer to bypass the Settler interstitial screen and enter Cashfree directly
        try {
          const initRes = await fetch("https://settler.pydart.com/api/v1/orders/initiate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              invoiceId: settlerInvoiceId,
              redirectUrl,
            }),
          });
          const initData: any = await initRes.json();
          if (initData.success && initData.paymentSessionId) {
            paymentSessionId = initData.paymentSessionId;
          }
        } catch (initErr) {
          console.warn("Settler orders/initiate call failed:", initErr);
        }
      }
    } catch (settlerErr) {
      console.warn("Settler invoice creation failed, falling back to direct Cashfree:", settlerErr);
    }

    // Direct Cashfree fallback if Settler calls failed to return a session
    if (!paymentSessionId && !settlerPayUrl) {
      try {
        const cfOrder = await createCashfreeOrder({
          orderId,
          amount: chargeAmount,
          customerName: customer_name,
          customerEmail: customer_email || "support@turkiyejam.com",
          customerPhone: cleanPhone || "9876543210",
          returnUrl: redirectUrl,
        });
        paymentSessionId = cfOrder.payment_session_id;
      } catch (cfErr) {
        console.warn("Direct Cashfree fallback failed:", cfErr);
      }
    }

    const effectivePayUrl = settlerPayUrl;

    return NextResponse.json({
      success: true,
      orderId,
      payUrl: effectivePayUrl,
      settlerPayUrl,
      paymentSessionId,
      settlerInvoiceId,
      amount: chargeAmount,
      isCod,
      advancePaid: orderAdvancePaid,
      balanceDue: orderBalanceDue,
      totalAmount: orderTotalAmount,
    });
  } catch (err: any) {
    console.error("Cashfree create-order error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to initialize Cashfree payment session",
      },
      { status: 500 }
    );
  }
}

