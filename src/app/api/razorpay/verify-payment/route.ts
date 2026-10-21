import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { createOrder, OrderRecord } from "@/lib/orderStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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

      const discountedAmount = Number(
        order_payload.discounted_amount ||
          (existingOrder ? Math.max(0, existingOrder.total_amount - 30) : 0)
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
               discount_amount = COALESCE(discount_amount, 0) + 30,
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

      // 3. Dispatch WhatsApp confirmation (prepaid template)
      try {
        const { sendOrderConfirmationWhatsApp } = await import("@/lib/whatsappOrderConfirmation");
        const custName = existingOrder?.customer_name || order_payload.customer_name || "Customer";
        const custPhone = existingOrder?.customer_phone || order_payload.customer_phone || "";
        const orderItems = existingOrder?.items || order_payload.items || [];
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
        [effectiveUserId, customer_name || "Customer", customer_email || "", "guest_verified_checkout", customer_phone || null]
      );
    } catch (guestErr) {
      // Non-fatal
    }

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
      payment_method: payment_method || "Online Payment",
      payment_status: "paid",
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

    await createOrder(newOrder);

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

    // Send WhatsApp interactive pre-confirmation for prepaid
    try {
      const { sendOrderPreConfirmationWhatsApp } = await import("@/lib/whatsappOrderConfirmation");
      const waSent = await sendOrderPreConfirmationWhatsApp({
        customerName: customer_name || "Customer",
        customerPhone: customer_phone || "",
        orderId,
        totalAmount: Number(total_amount),
        paymentMethod: "prepaid",
        token: confirmToken,
        items: (items || []).map((it: any) => ({
          name: it.name,
          quantity: Number(it.quantity || 1),
          price: Number(it.price || 0),
        })),
      });
      console.log(`[Verify Payment] WhatsApp pre-confirmation dispatched for ${orderId}: ${waSent}`);
    } catch (waErr) {
      console.warn("Failed to dispatch WA order pre-confirmation:", waErr);
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
