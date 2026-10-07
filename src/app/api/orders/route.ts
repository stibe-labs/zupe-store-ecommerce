import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrders, updateOrderStatus, OrderRecord } from "@/lib/orderStore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const orders = getOrders(email || undefined);
    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
    } = body;

    if (!customer_name || !customer_email || !shipping_address || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required order information" },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "Please sign in to place an order" },
        { status: 401 }
      );
    }

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newOrder: OrderRecord = {
      id: orderId,
      user_id: user_id || undefined,
      customer_name,
      customer_email,
      customer_phone: customer_phone || "",
      shipping_address,
      city: city || "",
      postal_code: postal_code || "",
      total_amount: Number(total_amount),
      discount_amount: Number(discount_amount || 0),
      payment_method: payment_method || "Credit Card",
      payment_status: "paid",
      order_status: "processing",
      items,
      created_at: new Date().toISOString(),
    };

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
        user_id,
      });
    } catch (syncErr) {
      console.warn("Auto-sync address from order failed:", syncErr);
    }

    return NextResponse.json({ success: true, order: newOrder });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, order_status } = body;

    if (!order_id || !order_status) {
      return NextResponse.json({ success: false, error: "Missing order_id or order_status" }, { status: 400 });
    }

    const updated = updateOrderStatus(order_id, order_status);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Order updated successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
