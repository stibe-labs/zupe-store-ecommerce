import { NextRequest, NextResponse } from "next/server";
import { createRazorpayOrder, RAZORPAY_KEY_ID } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, receipt, notes, items } = body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order amount specified" },
        { status: 400 }
      );
    }

    // Verify stock availability if items provided
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

    const order = await createRazorpayOrder({
      amount,
      receipt,
      notes: notes || {},
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    console.error("Error creating Razorpay order:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to initialize payment with Razorpay",
      },
      { status: 500 }
    );
  }
}
