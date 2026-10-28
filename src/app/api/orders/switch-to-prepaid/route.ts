import { NextRequest, NextResponse } from "next/server";
import { getERPOrders, getOrderById } from "@/lib/erpStore";
import { getOrders } from "@/lib/orderStore";
import { createRazorpayOrder, RAZORPAY_KEY_ID } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (
      searchParams.get("query") ||
      searchParams.get("orderId") ||
      searchParams.get("order_id") ||
      searchParams.get("phone") ||
      ""
    ).trim();

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Please enter your Order ID or registered mobile number." },
        { status: 400 }
      );
    }

    const qLower = query.toLowerCase();
    const cleanNoHash = qLower.replace(/^#/, "");
    const cleanNoOrd = cleanNoHash.replace(/^ord_/, "");
    const digitsOnly = query.replace(/\D/g, "");

    // 1. Look up in ERP orders
    const erpOrders = await getERPOrders();
    const matched = erpOrders.find((o) => {
      const oId = (o.id || "").toLowerCase();
      const sId = (o.shopify_order_id || "").toLowerCase();
      const sClean = sId.replace(/^#/, "");
      const oClean = oId.replace(/^ord_/, "");
      const phoneDigits = (o.customer_phone || "").replace(/\D/g, "");

      if (oId === qLower || oClean === cleanNoOrd || oClean === cleanNoHash) return true;
      if (sId === qLower || sClean === cleanNoHash || sClean === cleanNoOrd) return true;
      if (digitsOnly.length >= 10 && phoneDigits.includes(digitsOnly.slice(-10))) return true;
      return false;
    });

    if (!matched) {
      // 2. Check storefront in-memory orders
      const sfOrders = getOrders();
      const sfMatched = sfOrders.find((o) => {
        const oId = (o.id || "").toLowerCase();
        const oClean = oId.replace(/^ord_/, "");
        const phoneDigits = (o.customer_phone || "").replace(/\D/g, "");
        if (oId === qLower || oClean === cleanNoOrd || oClean === cleanNoHash) return true;
        if (digitsOnly.length >= 10 && phoneDigits.includes(digitsOnly.slice(-10))) return true;
        return false;
      });

      if (!sfMatched) {
        return NextResponse.json(
          { success: false, error: `No pending Cash on Delivery order found for "${query}".` },
          { status: 404 }
        );
      }

      const isAlreadyPaid =
        sfMatched.payment_status === "paid" ||
        !sfMatched.payment_method?.toLowerCase().includes("cash on delivery");

      if (isAlreadyPaid) {
        return NextResponse.json(
          {
            success: false,
            alreadyPaid: true,
            error: "This order is already marked as Prepaid / Paid!",
          },
          { status: 400 }
        );
      }

      const rawItems = Array.isArray(sfMatched.items)
        ? sfMatched.items
        : typeof sfMatched.items === "string"
        ? JSON.parse(sfMatched.items || "[]")
        : [];
      const productSubtotal = rawItems.reduce(
        (sum: number, it: any) => sum + (Number(it.price || it.unit_price) || 0) * (Number(it.quantity) || 1),
        0
      );

      let originalTotal = Number(sfMatched.total_amount) || 0;
      if (productSubtotal > 0 && originalTotal <= productSubtotal) {
        originalTotal = productSubtotal + 49;
      }
      const advancePaid = Number((sfMatched as any).advance_paid) || 10;
      const doorstepBalance = Math.max(0, originalTotal - advancePaid);
      const discountedAmount = Math.max(1, doorstepBalance - 49);

      return NextResponse.json({
        success: true,
        order: {
          id: sfMatched.id,
          display_id: sfMatched.id,
          customer_name: sfMatched.customer_name,
          customer_phone: sfMatched.customer_phone,
          customer_email: sfMatched.customer_email,
          shipping_address: sfMatched.shipping_address,
          city: sfMatched.city,
          payment_method: sfMatched.payment_method,
          payment_status: sfMatched.payment_status,
          total_amount: originalTotal,
          doorstep_balance: doorstepBalance,
          advance_paid: advancePaid,
          discounted_amount: discountedAmount,
          items: sfMatched.items,
        },
        discount: 49,
        doorstep_balance: doorstepBalance,
        discounted_amount: discountedAmount,
      });
    }

    const isAlreadyPaid =
      matched.payment_status === "Completed" ||
      matched.payment_status === "paid" ||
      matched.payment_method === "Prepaid" ||
      matched.payment_method?.includes("UPI");

    if (isAlreadyPaid) {
      return NextResponse.json(
        {
          success: false,
          alreadyPaid: true,
          error: "This order is already marked as Prepaid / Paid!",
        },
        { status: 400 }
      );
    }

    const rawItems = Array.isArray(matched.items)
      ? matched.items
      : typeof matched.items === "string"
      ? JSON.parse(matched.items || "[]")
      : [];
    const productSubtotal = rawItems.reduce(
      (sum: number, it: any) => sum + (Number(it.unit_price || it.price) || 0) * (Number(it.quantity) || 1),
      0
    );

    let originalTotal = Number(matched.total_amount) || 0;
    if (productSubtotal > 0 && originalTotal <= productSubtotal) {
      originalTotal = productSubtotal + 49;
    }
    const advancePaid = Number((matched as any).advance_paid) || 10;
    const doorstepBalance = Math.max(0, originalTotal - advancePaid);
    const discountedAmount = Math.max(1, doorstepBalance - 49);

    return NextResponse.json({
      success: true,
      order: {
        id: matched.id,
        display_id: matched.shopify_order_id || matched.id,
        customer_name: matched.customer_name,
        customer_phone: matched.customer_phone,
        customer_email: matched.guest_email,
        shipping_address: matched.shipping_address,
        payment_method: matched.payment_method,
        payment_status: matched.payment_status,
        total_amount: originalTotal,
        doorstep_balance: doorstepBalance,
        advance_paid: advancePaid,
        discounted_amount: discountedAmount,
        items: matched.items || [],
      },
      discount: 49,
      doorstep_balance: doorstepBalance,
      discounted_amount: discountedAmount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to lookup order" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing required orderId" },
        { status: 400 }
      );
    }

    const order = await getOrderById(orderId);
    let originalTotal = order ? Number(order.total_amount) : 0;
    let orderItems: any[] = (order?.items as any[]) || [];

    if (!order) {
      const sfOrders = getOrders();
      const sfMatched = sfOrders.find((o) => o.id === orderId);
      if (sfMatched) {
        originalTotal = Number(sfMatched.total_amount);
        orderItems = (sfMatched.items as any[]) || [];
      }
    }

    if (originalTotal <= 0 && (!orderItems || orderItems.length === 0)) {
      return NextResponse.json(
        { success: false, error: "Order not found or invalid amount" },
        { status: 404 }
      );
    }

    const rawItems = Array.isArray(orderItems)
      ? orderItems
      : typeof orderItems === "string"
      ? JSON.parse(orderItems || "[]")
      : [];
    const productSubtotal = rawItems.reduce(
      (sum: number, it: any) => sum + (Number(it.unit_price || it.price) || 0) * (Number(it.quantity) || 1),
      0
    );

    if (productSubtotal > 0 && originalTotal <= productSubtotal) {
      originalTotal = productSubtotal + 49;
    }

    // Doorstep balance was originalTotal - advancePaid
    const advancePaid = Number((order as any)?.advance_paid) || 10;
    const doorstepBalance = Math.max(0, originalTotal - advancePaid);
    // Apply the Rs 49 discount from doorstep balance for switching to prepaid (removes shipping fee)
    const payableAmount = Math.max(1, doorstepBalance - 49);

    // Initialize Razorpay order
    const rzpOrder = await createRazorpayOrder({
      amount: payableAmount,
      currency: "INR",
      receipt: `sw_${orderId.slice(-8)}`,
      notes: {
        switch_from_cod: "true",
        original_order_id: orderId,
        discount_applied: "49",
        doorstep_balance: doorstepBalance.toString(),
      },
    });

    return NextResponse.json({
      success: true,
      razorpay_order_id: rzpOrder.id,
      amount: payableAmount,
      currency: "INR",
      key_id: RAZORPAY_KEY_ID,
      orderId,
    });
  } catch (err: any) {
    console.error("Error creating switch to prepaid payment:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to initialize online payment" },
      { status: 500 }
    );
  }
}
