import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { createOrder, OrderRecord } from "@/lib/orderStore";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Razorpay Payment Verification & Webhook Endpoint",
    url: "https://zupestore.in/api/razorpay/verify-payment",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Support Razorpay server-side webhooks & ping tests
    if (body.event || body.entity === "event") {
      console.log(`[Razorpay Webhook] Ingested event: ${body.event}`);
      return NextResponse.json({
        success: true,
        status: "ok",
        message: "Razorpay webhook acknowledged successfully",
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_payload,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Missing required Razorpay payment credentials" },
        { status: 400 }
      );
    }

    // Verify cryptographic signature
    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Payment verification failed: invalid signature" },
        { status: 400 }
      );
    }

    if (!order_payload) {
      return NextResponse.json(
        { success: true, message: "Payment verified successfully" }
      );
    }

    // Handle switching an existing Cash on Delivery order to Prepaid
    if (order_payload.is_cod_switch && order_payload.existing_order_id) {
      const existingOrderId = order_payload.existing_order_id;
      const { updateERPOrder, getOrderById } = await import("@/lib/erpStore");
      const existingOrder = await getOrderById(existingOrderId);

      const advancePaid = Number(order_payload.advance_paid || (existingOrder as any)?.advance_paid) || 10;
      const doorstepDue = Math.max(0, Number(existingOrder?.total_amount || 0) - advancePaid);
      const discountedAmount = Number(
        order_payload.discounted_amount ||
          (existingOrder ? Math.max(1, doorstepDue - 49) : 0)
      );

      const prodCost = Number(existingOrder?.product_cost || 0);
      const rtoCharge = Number(existingOrder?.rto_shipping_charge || 0);
      const adSpend = Number(existingOrder?.ad_spend_attributed || 0);
      const newNetProfit = discountedAmount - prodCost - 0 - rtoCharge - adSpend;

      // 1. Update in ERP Store (handles memory + D1 update)
      await updateERPOrder(existingOrderId, {
        payment_method: "Prepaid",
        payment_status: "Completed",
        total_amount: discountedAmount,
        shipping_cost: 0,
        remittance_status: "Settled",
      });

      // 2. Direct authoritative D1 update
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

      // 2b. Synchronize local memory store
      try {
        const { updateStorefrontOrder } = await import("@/lib/orderStore");
        updateStorefrontOrder(existingOrderId, {
          payment_method: "Prepaid",
          payment_status: "paid",
          total_amount: discountedAmount,
        });
      } catch {}

      const custName = existingOrder?.customer_name || order_payload.customer_name || "Customer";
      const custPhone = existingOrder?.customer_phone || order_payload.customer_phone || "";
      const orderItems = existingOrder?.items || order_payload.items || [];

      // 3. Dispatch WhatsApp confirmation (prepaid template)
      try {
        const { sendOrderConfirmationWhatsApp } = await import("@/lib/whatsappOrderConfirmation");
        await sendOrderConfirmationWhatsApp({
          customerName: custName,
          customerPhone: custPhone,
          orderId: existingOrder?.shopify_order_id || existingOrderId,
          totalAmount: discountedAmount,
          paymentMethod: "prepaid",
          items: orderItems.map((it: any) => ({
            name: it.product_name || it.name,
            quantity: Number(it.quantity || 1),
            price: Number(it.unit_price || it.price || 0),
          })),
        });
      } catch (waErr) {
        console.warn("WA switch confirm dispatch error:", waErr);
      }

      // 4. Dispatch Email Confirmation update if customer email is on record
      const switchEmail = (existingOrder?.guest_email || (existingOrder as any)?.customer_email || order_payload?.customer_email || "").trim();
      if (switchEmail && switchEmail.includes("@") && !switchEmail.endsWith("@customer.zupestore.com")) {
        try {
          const { sendOrderConfirmationEmail } = await import("@/lib/orderEmailService");
          const { markOrderEmailSent } = await import("@/lib/orderStore");
          const emailRes = await sendOrderConfirmationEmail({
            orderId: existingOrderId,
            customerName: custName,
            customerEmail: switchEmail,
            customerPhone: custPhone,
            shippingAddress: existingOrder?.shipping_address || order_payload?.shipping_address || "",
            city: (existingOrder as any)?.city || order_payload?.city || "",
            postalCode: (existingOrder as any)?.postal_code || order_payload?.postal_code || "",
            totalAmount: discountedAmount,
            discountAmount: (existingOrder?.discount_amount || 0) + 30,
            paymentMethod: "Prepaid (Switched to Online - Saved ₹30)",
            paymentStatus: "paid",
            items: orderItems.map((it: any) => ({
              name: it.product_name || it.name,
              quantity: Number(it.quantity || 1),
              price: Number(it.unit_price || it.price || 0),
              image: it.image || it.poster_image,
            })),
            createdAt: existingOrder?.created_at || new Date().toISOString(),
          });
          if (emailRes.success && !emailRes.skipped) {
            await markOrderEmailSent(existingOrderId);
          }
        } catch (e) {
          console.warn("Error initializing switched prepaid email:", e);
        }
      }

      return NextResponse.json({
        success: true,
        message: "Order successfully converted to Prepaid!",
        orderId: existingOrderId,
        totalAmount: discountedAmount,
        paymentId: razorpay_payment_id,
      });
    }

    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      city,
      postal_code,
      total_amount,
      discount_amount,
      payment_method,
      items,
      user_id,
      promo_code,
    } = order_payload;

    if (items && Array.isArray(items) && items.length > 0) {
      const { validateOrderStock } = await import("@/lib/inventoryService");
      const stockValidation = await validateOrderStock(items);
      if (!stockValidation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: stockValidation.error || "Payment received, but one or more items are currently out of stock.",
            outOfStockItems: stockValidation.outOfStockItems,
          },
          { status: 400 }
        );
      }
    }

    const cleanPhone = (customer_phone || "").replace(/\D/g, "");
    const effectiveUserId = user_id || (cleanPhone ? `guest_${cleanPhone}` : `guest_${Date.now()}`);

    // Auto-provision guest user in D1 if not existing
    try {
      const { executeD1Query } = await import("@/lib/d1");
      await executeD1Query(
        `INSERT OR IGNORE INTO users (id, name, email, password_hash, phone, created_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP);`,
        [effectiveUserId, customer_name || "Customer", customer_email ? customer_email.trim() : null, "guest_verified_checkout", customer_phone || null]
      );
    } catch (guestErr) {
      // Non-fatal
    }

    const isCodPartial = Boolean(order_payload?.is_cod_partial);
    const orderPaymentMethod = isCodPartial
      ? "Cash on Delivery (Partial Payment)"
      : (payment_method || "Online Payment");
    const orderPaymentStatus = isCodPartial ? "pending" : "paid";

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
      payment_method: orderPaymentMethod,
      payment_status: orderPaymentStatus,
      order_status: "processing",
      whatsapp_confirm_status: "pending_whatsapp",
      whatsapp_confirm_token: confirmToken,
      whatsapp_token_used: false,
      items: items || [],
      created_at: new Date().toISOString(),
    };

    // Attach razorpay payment reference
    (newOrder as any).razorpay_order_id = razorpay_order_id;
    (newOrder as any).razorpay_payment_id = razorpay_payment_id;
    if (isCodPartial) {
      const advance = Number(order_payload?.advance_amount) || 10;
      (newOrder as any).advance_paid = advance;
      (newOrder as any).shipping_fee = 49;
      (newOrder as any).balance_due = Math.max(0, Number(total_amount) - advance);
    }

    await createOrder(newOrder);

    // Track coupon usage increment if applicable
    if (promo_code) {
      try {
        const { incrementCouponUsage } = await import("@/lib/couponStore");
        await incrementCouponUsage(promo_code);
      } catch (cErr) {
        console.warn("Could not record coupon redemption count:", cErr);
      }
    }

    // Push prepaid order to Shiprocket as 'NEW' so it appears on Shiprocket dashboard with "Ship Now" button
    let liveAwb: string | undefined;
    let liveCourier: string | undefined;
    if (!isCodPartial) {
      try {
        const { dispatchShiprocketOrder } = await import("@/lib/shiprocketService");
        const dispatchResult = await dispatchShiprocketOrder(newOrder);
        if (dispatchResult.success && dispatchResult.awb && !dispatchResult.isSimulated) {
          liveAwb = dispatchResult.awb;
          liveCourier = dispatchResult.courier;
          (newOrder as any).shiprocket_awb = liveAwb;
          (newOrder as any).tracking_number = liveAwb;
          (newOrder as any).courier_partner = liveCourier;
        }

        (newOrder as any).delivery_status = "Processing";
        newOrder.order_status = "processing";

        const { updateERPOrder } = await import("@/lib/erpStore");
        await updateERPOrder(orderId, {
          whatsapp_confirm_status: "pending_whatsapp",
          whatsapp_token_used: false,
          status: "Processing",
          delivery_status: "Processing",
          shiprocket_awb: liveAwb || "",
          tracking_number: liveAwb || "",
          courier_partner: liveCourier || "",
        });
      } catch (dispatchErr) {
        console.warn("[Verify Payment] Shiprocket push error:", dispatchErr);
      }
    }

    // Automatically sync delivery address and phone to customer profile
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
      console.warn("Auto-sync address from online order failed:", syncErr);
    }

    // Mark any existing abandoned checkouts for this customer phone as recovered
    try {
      const { executeD1Query } = await import("@/lib/d1");
      const normDigits = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      await executeD1Query(
        `UPDATE abandoned_checkouts
         SET status = 'recovered', recovered_order_id = ?, updated_at = CURRENT_TIMESTAMP
         WHERE (customer_phone = ? OR customer_phone = ?) AND status = 'abandoned'`,
        [orderId, normDigits, cleanPhone]
      );
    } catch (recErr) {
      console.warn("Error marking abandoned checkout as recovered:", recErr);
    }

    // Resolve display order ID (e.g. #1567)
    const displayOrderId = (newOrder as any).shopify_order_id || orderId;

    // 1. For prepaid orders: Immediately dispatch official Payment Successful receipt (zupe_payment_successful)
    if (!isCodPartial) {
      try {
        const { sendPaymentSuccessfulWhatsApp } = await import("@/lib/whatsappOrderConfirmation");
        await sendPaymentSuccessfulWhatsApp({
          customerName: customer_name || "Customer",
          customerPhone: customer_phone || "",
          orderId: displayOrderId,
          paidAmount: Number(total_amount),
        });
        console.log(`[Verify Payment] WhatsApp payment receipt (zupe_payment_successful) dispatched for order ${orderId} (${displayOrderId})`);
      } catch (payWaErr) {
        console.warn("Failed to dispatch WA payment successful receipt:", payWaErr);
      }
    }

    // 2. Send WhatsApp interactive pre-confirmation with [Confirm Order] and [Cancel Order] buttons for all orders
    try {
      const { sendOrderPreConfirmationWhatsApp } = await import("@/lib/whatsappOrderConfirmation");
      await sendOrderPreConfirmationWhatsApp({
        customerName: customer_name || "Customer",
        customerPhone: customer_phone || "",
        orderId: displayOrderId,
        totalAmount: Number(total_amount),
        paymentMethod: isCodPartial ? "cod" : "prepaid",
        token: confirmToken,
        items: (items || []).map((it: any) => ({
          name: it.name,
          quantity: Number(it.quantity || 1),
          price: Number(it.price || 0),
        })),
      });
      console.log(`[Verify Payment] WhatsApp interactive verification dispatched for order ${orderId} (${displayOrderId}) [${isCodPartial ? "cod" : "prepaid"}]`);
    } catch (waErr) {
      console.warn("Failed to dispatch WA pre-confirmation:", waErr);
    }

    // Automated Order Confirmation Email (Dispatched ONLY if customer provided optional email at checkout)
    const normEmail = (customer_email || "").trim();
    if (normEmail && normEmail.includes("@") && !normEmail.endsWith("@customer.zupestore.com")) {
      try {
        const { sendOrderConfirmationEmail } = await import("@/lib/orderEmailService");
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
          paymentMethod: isCodPartial
            ? `Cash on Delivery (₹${(newOrder as any).advance_paid || 10} Advance Paid)`
            : (payment_method || "Prepaid (Online Payment)"),
          paymentStatus: orderPaymentStatus,
          items: items || [],
          createdAt: newOrder.created_at,
        });
        if (emailRes.success && !emailRes.skipped) {
          await markOrderEmailSent(orderId);
        }
      } catch (emailErr) {
        console.warn("[Verify Payment] Failed to send order confirmation email:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      order: newOrder,
      paymentId: razorpay_payment_id,
    });

  } catch (err: any) {
    console.error("Error in verify-payment:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
