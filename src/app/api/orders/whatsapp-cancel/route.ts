import { NextRequest, NextResponse } from "next/server";
import { cancelWhatsAppOrder } from "@/lib/orderStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || "";
    const orderId = searchParams.get("orderId") || "";

    if (!token && !orderId) {
      return NextResponse.redirect(new URL("/orders?error=missing_credentials", req.url));
    }

    // Cancel order and restock inventory
    const result = await cancelWhatsAppOrder(token || orderId);

    if (result.alreadyUsed) {
      return NextResponse.redirect(
        new URL(`/orders?notice=already_processed&orderId=${encodeURIComponent(orderId)}`, req.url)
      );
    }

    // Redirect to orders page with cancelled confirmation notice
    return NextResponse.redirect(
      new URL(`/orders?cancelled=${encodeURIComponent(orderId)}`, req.url)
    );
  } catch (err: any) {
    console.error("WhatsApp cancel route error:", err);
    return NextResponse.redirect(new URL("/orders?error=cancel_failed", req.url));
  }
}
