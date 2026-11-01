import { NextRequest, NextResponse } from "next/server";
import { FASTRR_CONFIG, computeHmacSha256 } from "@/lib/fastrr";
import { addOrder } from "@/lib/orderStore";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {}

    const orderId = payload.order_id || payload.id;
    console.log("[Fastrr Order Webhook] Received event:", orderId, payload);

    if (orderId) {
      // Fetch full order details from Shiprocket Checkout API if needed
      try {
        const detailsBody = JSON.stringify({
          order_id: orderId,
          timestamp: new Date().toISOString(),
        });
        const hmac = computeHmacSha256(detailsBody);

        const detailsRes = await fetch(`${FASTRR_CONFIG.baseUrl}/api/v1/custom-platform-order/details`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": FASTRR_CONFIG.apiKey,
            "X-Api-HMAC-SHA256": hmac,
          },
          body: detailsBody,
        });

        if (detailsRes.ok) {
          const detailsData = await detailsRes.json();
          console.log("[Fastrr Order Details]:", detailsData);
        }
      } catch (dErr) {
        console.warn("[Fastrr Order Details] fetch error:", dErr);
      }
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (err: any) {
    console.error("[Fastrr Order Webhook] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
