import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/siteConfig";
import { verifySettlerOrder } from "@/lib/settler";
import { createOrder, OrderRecord } from "@/lib/orderStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cashfreeOrderId, invoiceId, order_payload } = body;

    if (!cashfreeOrderId) {
      return NextResponse.json(
        { success: false, error: "Missing required cashfreeOrderId" },
        { status: 400 }
      );
    }

    // 1. Verify Payment Status with Settler
    const verifyData = await verifySettlerOrder(cashfreeOrderId);

    if (!verifyData.paid) {
      return NextResponse.json(
        {
          success: false,
          paid: false,
          status: verifyData.status || "ACTIVE",
          error: "Payment has not been completed yet.",
        },
        { status: 400 }
      );
    }

    const paymentId =
      verifyData.receiptNumber ||
      verifyData.bankReference ||
      `settler_${Date.now()}`;

    // If no order_payload, simply acknowledge verification
    if (!order_payload) {
      return NextResponse.json({
        success: true,
        paid: true,
        orderId: cashfreeOrderId,
        paymentId,
        receiptNumber: verifyData.receiptNumber,
        bankReference: verifyData.bankReference,
        message: "Settler payment verified successfully",
      });
    }

    // 2. Handle switching an existing COD order to Prepaid
    if (order_payload.is_cod_switch && order_payload.existing_order_id) {
      const existingOrderId = order_payload.existing_order_id;
      const { updateERPOrder, getOrderById } = await import("@/lib/erpStore");
      const existingOrder = await getOrderById(existingOrderId);

      const advancePaid =
        Number(order_payload.advance_paid || (existingOrder as any)?.advance_paid) || 0;
      const doorstepDue = Math.max(
        0,
        Number(existingOrder?.total_amount || 0) - advancePaid
      );
      const discountedAmount = Number(
        order_payload.discounted_amount ||
          (existingOrder ? Math.max(1, doorstepDue - 49) : 0)
      );

      const prodCost = Number(existingOrder?.product_cost || 0);
      const rtoCharge = Number(existingOrder?.rto_shipping_charge || 0);
      const adSpend = Number(existingOrder?.ad_spend_attributed || 0);
      const newNetProfit = discountedAmount - prodCost - 0 - rtoCharge - adSpend;

      await updateERPOrder(existingOrderId, {
        payment_method: "Prepaid",
        payment_status: "Completed",
        total_amount: discountedAmount,
        shipping_cost: 0,
        remittance_status: "Settled",
      });

      try {
        const { executeD1Query } = await import("@/lib/d1");
        await executeD1Query(
          `UPDATE orders
           SET payment_method = 'Prepaid',
               payment_status = 'Completed',
               total_amount = ?,
               discount_amount = COALESCE(discount_amount, 0) + 49,
               shipping_cost = 0,
               remittance_status = 'Settled',
               net_profit = ?
           WHERE id = ? OR shopify_order_id = ?`,
          [discountedAmount, newNetProfit, existingOrderId, existingOrderId]
        );
      } catch (d1Err) {
        console.warn("D1 update order switch error:", d1Err);
      }

      try {
        const { updateStorefrontOrder } = await import("@/lib/orderStore");
        updateStorefrontOrder(existingOrderId, {
          payment_method: "Prepaid",
          payment_status: "paid",
          total_amount: discountedAmount,
        });
      } catch {}

      return NextResponse.json({
        success: true,
        message: "Order successfully converted to Prepaid via Settler!",
        orderId: existingOrderId,
        totalAmount: discountedAmount,
        paymentId,
      });
    }

    // 3. New Checkout Order Creation
    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      city,
      postal_code,
      total_amount,
      discount_amount,
      items,
      user_id,
      promo_code,
    } = order_payload;

    // Verify stock
    if (items && Array.isArray(items) && items.length > 0) {
      const { validateOrderStock } = await import("@/lib/inventoryService");
      const stockValidation = await validateOrderStock(items);
      if (!stockValidation.valid) {
        return NextResponse.json(
          {
            success: false,
            error:
              stockValidation.error ||
              "Payment received, but one or more items are currently out of stock.",
            outOfStockItems: stockValidation.outOfStockItems,
          },
          { status: 400 }
        );
      }
    }

    const cleanPhone = (customer_phone || "").replace(/\D/g, "");
    const effectiveUserId =
      user_id ||
      (cleanPhone ? `guest_${cleanPhone}` : `guest_${Date.now()}`);

    // Auto-provision user record in D1 if needed
    try {
      const { executeD1Query } = await import("@/lib/d1");
      await executeD1Query(
        `INSERT OR IGNORE INTO users (id, name, email, password_hash, phone, created_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP);`,
        [
          effectiveUserId,
          customer_name || "Customer",
          customer_email ? customer_email.trim() : null,
          "guest_verified_checkout",
          customer_phone || null,
        ]
      );
    } catch {}

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const confirmToken = `tok_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;

    const newOrder: OrderRecord = {
      id: orderId,
      user_id: effectiveUserId,
      customer_name: customer_name || "Customer",
      customer_email: customer_email || "",
      customer_phone: customer_phone || "",
      shipping_address: shipping_address || "",
      city: city || "",
      postal_code: postal_code || "",
      total_amount: Number(total_amount),
      discount_amount: Number(discount_amount || 0),
      promo_code: promo_code || undefined,
      payment_method: "Prepaid (UPI / Settler)",
      payment_status: "paid",
      order_status: "processing",
      whatsapp_confirm_status: "pending_whatsapp",
      whatsapp_confirm_token: confirmToken,
      whatsapp_token_used: false,
      items: items || [],
      created_at: new Date().toISOString(),
    };

    (newOrder as any).settler_invoice_id = invoiceId;
    (newOrder as any).cashfree_order_id = cashfreeOrderId;
    (newOrder as any).cashfree_payment_id = paymentId;
    (newOrder as any).advance_paid = Number(total_amount);

    await createOrder(newOrder);

    // Track coupon usage
    if (promo_code) {
      try {
        const { incrementCouponUsage } = await import("@/lib/couponStore");
        await incrementCouponUsage(promo_code);
      } catch (cErr) {
        console.warn("Could not record coupon redemption count:", cErr);
      }
    }

    // Auto-sync address
    try {
      const { syncAddressFromOrder } = await import("@/lib/addressStore");
      await syncAddressFromOrder({
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        city,
        postal_code,
        user_id: effectiveUserId,
      });
    } catch (syncErr) {
      console.warn("Auto-sync address failed:", syncErr);
    }

    // Mark abandoned checkouts as recovered
    try {
      const { executeD1Query } = await import("@/lib/d1");
      const normDigits =
        cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      await executeD1Query(
        `UPDATE abandoned_checkouts
         SET status = 'recovered', recovered_order_id = ?, updated_at = CURRENT_TIMESTAMP
         WHERE (customer_phone = ? OR customer_phone = ?) AND status = 'abandoned'`,
        [orderId, normDigits, cleanPhone]
      );
    } catch {}

    const displayOrderId = (newOrder as any).shopify_order_id || orderId;

    // Send WhatsApp notification
    try {
      const { sendOrderPreConfirmationWhatsApp } = await import(
        "@/lib/whatsappOrderConfirmation"
      );
      await sendOrderPreConfirmationWhatsApp({
        customerName: customer_name || "Customer",
        customerPhone: customer_phone || "",
        orderId: displayOrderId,
        totalAmount: Number(total_amount),
        paymentMethod: "prepaid",
        token: confirmToken,
        advancePaid: Number(total_amount),
        items: (items || []).map((it: any) => ({
          name: it.name,
          quantity: Number(it.quantity || 1),
          price: Number(it.price || 0),
        })),
      });
      console.log(
        `[Settler Verify] WhatsApp verify template dispatched for order ${orderId} (${displayOrderId})`
      );
    } catch (waErr) {
      console.warn("Failed to dispatch WA pre-confirmation:", waErr);
    }

    // Automated Order Confirmation Email
    const normEmail = (customer_email || "").trim();
    if (normEmail && !siteConfig.isSyntheticEmail(normEmail)) {
      try {
        const { sendOrderConfirmationEmail } = await import(
          "@/lib/orderEmailService"
        );
        const { markOrderEmailSent } = await import("@/lib/orderStore");
        const emailRes = await sendOrderConfirmationEmail({
          orderId: displayOrderId,
          customerName: customer_name || "Customer",
          customerEmail: normEmail,
          customerPhone: customer_phone || "",
          shippingAddress: shipping_address || "",
          city: city || "",
          postalCode: postal_code || "",
          totalAmount: Number(total_amount),
          discountAmount: Number(discount_amount || 0),
          paymentMethod: "Prepaid (UPI / Settler)",
          paymentStatus: "paid",
          items: items || [],
          createdAt: newOrder.created_at,
        });
        if (emailRes.success && !emailRes.skipped) {
          await markOrderEmailSent(orderId);
        }
      } catch (emailErr) {
        console.warn("[Settler Verify] Failed to send email:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      order: newOrder,
      paymentId,
      orderId: displayOrderId,
      receiptNumber: verifyData.receiptNumber,
    });
  } catch (err: any) {
    console.error("Error in Settler verify-payment:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to verify Settler payment" },
      { status: 500 }
    );
  }
}
