import { NextRequest, NextResponse } from "next/server";
import { createCashfreeOrder } from "@/lib/cashfree";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, customerName, customerEmail, customerPhone, items, orderId } = body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order amount specified" },
        { status: 400 }
      );
    }

    // Live stock verification before creating payment session
    if (items && Array.isArray(items) && items.length > 0) {
      const { validateOrderStock } = await import("@/lib/inventoryService");
      const stockValidation = await validateOrderStock(items);
      if (!stockValidation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: stockValidation.error || "One or more items in your cart are currently out of stock.",
            outOfStockItems: stockValidation.outOfStockItems,
          },
          { status: 400 }
        );
      }
    }

    const uniqueOrderId =
      orderId || `vl_cf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const cfOrder = await createCashfreeOrder({
      orderId: uniqueOrderId,
      amount,
      customerName: customerName || "Customer",
      customerEmail: customerEmail || "billing@vittallifestyle.com",
      customerPhone: customerPhone || "9876543210",
      returnUrl: `https://vittallifestyle.com/checkout?order_id=${uniqueOrderId}`,
    });

    return NextResponse.json({
      success: true,
      orderId: cfOrder.order_id,
      cfOrderId: cfOrder.cf_order_id,
      paymentSessionId: cfOrder.payment_session_id,
      amount: cfOrder.order_amount,
    });
  } catch (err: any) {
    console.error("Error creating Cashfree order:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to initialize payment with Cashfree",
      },
      { status: 500 }
    );
  }
}
