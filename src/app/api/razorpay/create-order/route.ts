import { NextRequest, NextResponse } from "next/server";
import { createRazorpayOrder, RAZORPAY_KEY_ID } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, receipt, notes } = body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order amount specified" },
        { status: 400 }
      );
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
