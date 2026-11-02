import { NextRequest, NextResponse } from "next/server";
import { cancelWhatsAppOrder } from "@/lib/orderStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const host = req.headers.get("host") || "";
    if (host.includes("workers.dev")) {
      const canonicalUrl = new URL(req.nextUrl.pathname + req.nextUrl.search, "https://turkiyejam.com");
      return NextResponse.redirect(canonicalUrl, 301);
    }

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || "";
    const orderId = searchParams.get("orderId") || "";

    if (!token && !orderId) {
      return NextResponse.redirect(new URL("/orders?error=missing_credentials", "https://turkiyejam.com"));
    }

    // Redirect to orders page with cancellation dialog open for this order
    return NextResponse.redirect(
      new URL(`/orders?cancelPrompt=${encodeURIComponent(orderId)}`, "https://turkiyejam.com")
    );
  } catch (err: any) {
    console.error("WhatsApp cancel route error:", err);
    return NextResponse.redirect(new URL("/orders?error=cancel_failed", "https://turkiyejam.com"));
  }
}
