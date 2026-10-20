import { NextRequest, NextResponse } from "next/server";
import { cancelWhatsAppOrder, getStorefrontOrderById } from "@/lib/orderStore";
import { getOrderById } from "@/lib/erpStore";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, reason } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing order ID" },
        { status: 400 }
      );
    }

    const ord = getStorefrontOrderById(orderId) || (await getOrderById(orderId));
    if (ord) {
      const currentStatus = ((ord as any).order_status || (ord as any).delivery_status || "").toLowerCase();
      if (currentStatus === "delivered" || currentStatus === "shipped") {
        return NextResponse.json(
          { success: false, error: "This order has already been dispatched and cannot be cancelled online." },
          { status: 400 }
        );
      }
      if (currentStatus === "cancelled") {
        return NextResponse.json(
          { success: false, error: "This order is already cancelled." },
          { status: 400 }
        );
      }
      if ((ord as any).whatsapp_confirm_status === "confirmed") {
        return NextResponse.json(
          { success: false, error: "This order has already been confirmed and is being processed for dispatch." },
          { status: 400 }
        );
      }
    }

    const result = await cancelWhatsAppOrder(orderId, {
      isDirectCustomerCancel: true,
      reason: reason || "Customer requested cancellation from My Orders page",
    });

    return NextResponse.json({
      success: true,
      message: "Order has been successfully cancelled.",
      orderId,
    });
  } catch (err: any) {
    console.error("Direct order cancel error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to cancel order" },
      { status: 500 }
    );
  }
}
