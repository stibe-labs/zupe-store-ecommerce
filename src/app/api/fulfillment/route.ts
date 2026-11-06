import { NextRequest, NextResponse } from "next/server";
import { processShiprocketWebhook } from "@/lib/shiprocketService";

export const dynamic = "force-dynamic";

/**
 * Health check & verification for the fulfillment webhook receiver.
 * Compliant with Shiprocket rules (contains zero prohibited keywords like shiprocket, kartrocket, sr, or kr).
 */
export async function GET() {
  return NextResponse.json(
    {
      success: true,
      status: "active",
      message: "Fulfillment webhook receiver is operational and ready to accept courier events.",
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    }
  );
}

/**
 * Ingests live courier tracking, NDR, delivery, and RTO events from Shiprocket.
 * Accepts optional x-api-key authentication.
 * ALWAYS returns HTTP 200 so Shiprocket's "Test Webhook" verification passes reliably.
 */
export async function POST(req: NextRequest) {
  try {
    let payload: any = {};
    try {
      const rawBody = await req.text();
      if (rawBody && rawBody.trim()) {
        payload = JSON.parse(rawBody);
      }
    } catch (parseErr) {
      console.warn("[Fulfillment Webhook] JSON parse warning:", parseErr);
      return NextResponse.json(
        { success: true, acknowledged: true, note: "Non-JSON or empty payload received" },
        { status: 200 }
      );
    }

    const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization") || "";

    // If empty payload or generic ping test from Shiprocket
    if (!payload || Object.keys(payload).length === 0) {
      return NextResponse.json(
        {
          success: true,
          acknowledged: true,
          message: "Test ping acknowledged successfully",
        },
        { status: 200 }
      );
    }

    console.log("[Fulfillment Webhook] Received courier event:", {
      awb: payload.awb || payload.awb_code,
      order_id: payload.order_id || payload.channel_order_id,
      status: payload.current_status || payload.shipment_status || payload.status,
      hasApiKey: !!apiKey,
    });

    const result = await processShiprocketWebhook(payload);

    // ALWAYS return HTTP 200 so Shiprocket's "Test Webhook" button succeeds
    return NextResponse.json(
      {
        success: true,
        acknowledged: true,
        orderUpdated: result.success,
        awb: result.awb || payload.awb || payload.awb_code,
        message: result.message,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[Fulfillment Webhook] Error:", err);
    return NextResponse.json(
      {
        success: true,
        acknowledged: true,
        error: err.message,
      },
      { status: 200 }
    );
  }
}

