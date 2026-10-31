import { NextRequest, NextResponse } from "next/server";
import { getStorefrontOrderById, getOrderByToken } from "@/lib/orderStore";
import { getOrderById } from "@/lib/erpStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawToken = searchParams.get("token") || "";
    const token = rawToken.startsWith("token=") ? rawToken.replace(/^token=/, "") : rawToken;
    const rawOrderId = searchParams.get("orderId") || "";
    const orderId = rawOrderId.startsWith("orderId=") ? rawOrderId.replace(/^orderId=/, "") : rawOrderId;

    if (!token && !orderId) {
      return NextResponse.redirect(new URL("/orders?error=missing_credentials", req.url));
    }

    // Resolve order to inspect its current status
    let ord: any = orderId ? getStorefrontOrderById(orderId) : null;
    if (!ord && orderId) {
      ord = await getOrderById(orderId);
    }
    if (!ord && token) {
      ord = await getOrderByToken(token);
    }

    const resolvedOrderId = orderId || ord?.shopify_order_id || ord?.id || "";

    if (ord) {
      const isAlreadyCancelled =
        (ord.status || "").toLowerCase() === "cancelled" ||
        (ord.delivery_status || "").toLowerCase() === "cancelled" ||
        (ord.whatsapp_confirm_status || "").toLowerCase() === "cancelled";

      if (isAlreadyCancelled) {
        return NextResponse.redirect(
          new URL(`/orders?cancelled=${encodeURIComponent(resolvedOrderId)}`, req.url)
        );
      }

      // If the customer has ALREADY confirmed this order or paid online (Prepaid),
      // DO NOT automatically open a cancellation prompt from an old WhatsApp button click.
      const isConfirmed = (ord.whatsapp_confirm_status || "").toLowerCase() === "confirmed";
      const isPaid =
        (ord.payment_status || "").toLowerCase() === "completed" ||
        (ord.payment_status || "").toLowerCase() === "paid" ||
        (ord.payment_method || "").toLowerCase().includes("prepaid") ||
        (ord.payment_method || "").toLowerCase().includes("online");

      if (isConfirmed || isPaid) {
        return NextResponse.redirect(
          new URL(`/orders?notice=already_confirmed&orderId=${encodeURIComponent(resolvedOrderId)}`, req.url)
        );
      }
    }

    // Redirect to orders page with cancellation dialog open for this order
    return NextResponse.redirect(
      new URL(`/orders?cancelPrompt=${encodeURIComponent(resolvedOrderId || orderId)}`, req.url)
    );
  } catch (err: any) {
    console.error("WhatsApp cancel route error:", err);
    return NextResponse.redirect(new URL("/orders?error=cancel_failed", req.url));
  }
}
