import { NextRequest, NextResponse } from "next/server";
import { getERPOrders, updateERPOrder, createERPOrder } from "@/lib/erpStore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const delivery_status = searchParams.get("delivery_status") || undefined;
    const payment_method = searchParams.get("payment_method") || undefined;
    const search = searchParams.get("search") || undefined;

    const orders = await getERPOrders({
      delivery_status,
      payment_method,
      search,
    });

    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, ...updates } = body;

    if (!order_id) {
      return NextResponse.json(
        { success: false, error: "Missing required field: order_id" },
        { status: 400 }
      );
    }

    const updated = await updateERPOrder(order_id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Order ${order_id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer_name,
      total_amount,
      payment_method,
      shipping_address,
      customer_phone,
      guest_email,
      items,
    } = body;

    if (!customer_name || total_amount === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing customer_name or total_amount" },
        { status: 400 }
      );
    }

    const newOrder = await createERPOrder({
      customer_name,
      total_amount: Number(total_amount),
      payment_method: payment_method || "COD",
      shipping_address: shipping_address || "",
      customer_phone: customer_phone || "",
      guest_email: guest_email || "",
      items: items || [],
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

