import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrders, updateOrderStatus, OrderRecord } from "@/lib/orderStore";
import { getERPOrders } from "@/lib/erpStore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const storefrontOrders = getOrders(email || undefined);

    let combinedOrders = [...storefrontOrders];

    try {
      const erpOrders = await getERPOrders();
      const existingIds = new Set(storefrontOrders.map((o) => o.id));

      const matchedErp = erpOrders.filter((o) => {
        if (existingIds.has(o.id)) return false;
        if (!email) return true;
        const qLower = email.toLowerCase().trim();
        const oEmail = (o.guest_email || "").toLowerCase().trim();
        const oPhone = (o.customer_phone || "").replace(/\D/g, "");
        const searchPhone = email.replace(/\D/g, "");
        return oEmail === qLower || (searchPhone.length >= 7 && oPhone.includes(searchPhone));
      });

      const mappedErp: OrderRecord[] = matchedErp.map((o) => {
        let rawItems = o.items;
        if (typeof rawItems === "string") {
          try { rawItems = JSON.parse(rawItems); } catch { rawItems = []; }
        }
        if (!Array.isArray(rawItems)) rawItems = [];

        let items = rawItems.map((it: any) => ({
          product_id: it.product_id || it.id || "ripple-lamp",
          name: it.product_name || it.name || "Purchased Product",
          price: Number(it.unit_price || it.price || o.total_amount),
          quantity: Number(it.quantity || 1),
          image: it.image || it.poster_image || "/products/ripple-lamp.jpg",
        }));

        if (items.length === 0) {
          items = [
            {
              product_id: "ripple-lamp",
              name: "Dynamic Water Ripple Night Light",
              price: o.total_amount || 749,
              quantity: 1,
              image: "/products/ripple-lamp.jpg",
            },
          ];
        }

        const isDelivered =
          (o.delivery_status || "").toLowerCase() === "delivered" ||
          (o.status || "").toLowerCase() === "delivered";
        const isShipped =
          ["in transit", "out for delivery", "shipped"].includes((o.delivery_status || "").toLowerCase()) ||
          (o.status || "").toLowerCase() === "shipped";

        return {
          id: o.id,
          customer_name: o.customer_name,
          customer_email: o.guest_email || "",
          customer_phone: o.customer_phone,
          total_amount: o.total_amount,
          shipping_address: o.shipping_address,
          city: "",
          postal_code: "",
          payment_method: o.payment_method,
          payment_status: o.payment_status === "Completed" || o.payment_status === "Settled" ? "paid" : "pending",
          order_status: isDelivered ? "delivered" : isShipped ? "shipped" : "processing",
          items,
          created_at: o.created_at,
        };
      });

      combinedOrders = [...storefrontOrders, ...mappedErp];
    } catch (e) {
      console.warn("Failed to merge ERP orders in /api/orders GET:", e);
    }

    combinedOrders.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({ success: true, orders: combinedOrders });
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
