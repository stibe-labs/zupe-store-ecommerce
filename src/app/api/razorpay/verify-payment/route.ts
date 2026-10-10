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
