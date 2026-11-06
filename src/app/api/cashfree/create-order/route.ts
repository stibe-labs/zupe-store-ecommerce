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
    } = body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order amount specified" },
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
      total_amount: Math.round(Number(amount)),
      discount_amount: Number(discount_amount || 0),
      payment_method: "Online Payment",
      payment_status: "pending",
      order_status: "processing",
      whatsapp_confirm_status: "pending_whatsapp",
      whatsapp_confirm_token: confirmToken,
      whatsapp_token_used: false,
      items,
      created_at: new Date().toISOString(),
    };

    await createOrder(newOrder);

    // 3. Create Cashfree Gateway Order
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://turkiyejam.com";
    const cfOrder = await createCashfreeOrder({
      orderId,
      amount: Math.round(Number(amount)),
      customerName: customer_name,
      customerEmail: customer_email || "support@turkiyejam.com",
      customerPhone: cleanPhone || "9876543210",
      returnUrl: `${siteUrl}/checkout?cf_order_id=${encodeURIComponent(orderId)}`,
    });

    return NextResponse.json({
      success: true,
      orderId,
      paymentSessionId: cfOrder.payment_session_id,
      amount: cfOrder.order_amount,
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

