import { NextRequest, NextResponse } from "next/server";
import { cancelWhatsAppOrder } from "@/lib/orderStore";
import { siteConfig } from "@/config/siteConfig";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const host = req.headers.get("host") || "";
    if (host.includes("workers.dev")) {
      const canonicalUrl = new URL(req.nextUrl.pathname + req.nextUrl.search, siteConfig.url);
      return NextResponse.redirect(canonicalUrl, 301);
    }

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || "";
    const orderId = searchParams.get("orderId") || "";

    if (!token && !orderId) {
      return NextResponse.redirect(new URL("/orders?error=missing_credentials", siteConfig.url));
    }

    // Redirect to orders page with cancellation dialog open for this order
    return NextResponse.redirect(
      new URL(`/orders?cancelPrompt=${encodeURIComponent(orderId)}`, siteConfig.url)
    );
  } catch (err: any) {
    console.error("WhatsApp cancel route error:", err);
    return NextResponse.redirect(new URL("/orders?error=cancel_failed", siteConfig.url));
  }
}
