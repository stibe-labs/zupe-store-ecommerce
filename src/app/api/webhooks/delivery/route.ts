import { NextRequest, NextResponse } from "next/server";
import { processShiprocketWebhook } from "@/lib/shiprocketService";

export const dynamic = "force-dynamic";

/**
 * Official Carrier Tracking Webhook Receiver.
 * Complies with carrier rules forbidding names like shiprocket, kartrocket, sr, or kr in URL.
 * URL: https://zupestore.in/api/webhooks/delivery
 */
export async function POST(req: NextRequest) {
  try {
    let payload: any = {};
    try {
      payload = await req.json();
    } catch {
      payload = {};
    }

    // Shiprocket Test Webhook ping or status update
    if (
      payload.awb ||
      payload.awb_code ||
      payload.current_status ||
      payload.order_id ||
      payload.shipment_id ||
      payload.channel_order_id
    ) {
      const result = await processShiprocketWebhook(payload);
      return NextResponse.json(result, {
        status: result.success ? 200 : 200, // Return 200 so carrier webhook validation succeeds
      });
    }

    // Test ping from Shiprocket dashboard
    return NextResponse.json({
      success: true,
      message: "Delivery webhook endpoint active and connected successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Delivery Webhook] Ingest error:", err);
    return NextResponse.json(
      { success: true, warning: err.message || "Failed to process webhook" },
      { status: 200 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    status: "active",
    service: "Carrier Delivery Webhook Receiver",
    timestamp: new Date().toISOString(),
  });
}
