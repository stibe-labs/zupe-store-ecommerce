import { NextRequest, NextResponse } from "next/server";
import { processShiprocketWebhook } from "@/lib/shiprocketService";

export const dynamic = "force-dynamic";

/**
 * Official Public Webhook Receiver for Shiprocket Events.
 * Configure in Shiprocket Dashboard -> Settings -> Webhooks:
 * Endpoint: https://zupestore.in/api/webhooks/shiprocket
 * Events: AWB Assigned, Tracking (In Transit, OFD, Delivered, NDR, RTO)
 */
export async function POST(req: NextRequest) {
  try {
    let payload: any = {};
    try {
      payload = await req.json();
    } catch {
      payload = {};
    }

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
        status: result.success ? 200 : 400,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Shiprocket webhook endpoint active and awaiting carrier events",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Shiprocket Webhook] Ingest error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process webhook" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    status: "active",
    service: "Shiprocket Webhook Receiver",
    timestamp: new Date().toISOString(),
  });
}
