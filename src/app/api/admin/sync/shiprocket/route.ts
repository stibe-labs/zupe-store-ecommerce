import { NextRequest, NextResponse } from "next/server";
import { getERPOrders } from "@/lib/erpStore";
import {
  generateShiprocketAWB,
  processShiprocketWebhook,
  syncShiprocketTrackingForActiveOrders,
} from "@/lib/shiprocketService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");

    if (orderId) {
      const orders = await getERPOrders();
      const target = orders.find(
        (o) => o.id === orderId || o.shopify_order_id.toLowerCase() === orderId.toLowerCase()
      );

      if (!target) {
        return NextResponse.json(
          { success: false, error: `Order ${orderId} not found` },
          { status: 404 }
        );
      }

      const courierParam = searchParams.get("courier") || undefined;
      const result = await generateShiprocketAWB(target, { preferredCourier: courierParam });
      return NextResponse.json(result);
    }

    // Run active tracking batch synchronization
    const syncResult = await syncShiprocketTrackingForActiveOrders();
    return NextResponse.json(syncResult);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }

    // 1. Generate AWB on-demand action from Admin Dashboard
    if (body.action === "generate_awb" && body.order_id) {
      const orders = await getERPOrders();
      const target = orders.find(
        (o) => o.id === body.order_id || o.shopify_order_id.toLowerCase() === body.order_id.toLowerCase()
      );

      if (!target) {
        return NextResponse.json(
          { success: false, error: `Order ${body.order_id} not found` },
          { status: 404 }
        );
      }

      const result = await generateShiprocketAWB(target, {
        preferredCourier: body.preferredCourier,
      });

      return NextResponse.json(result);
    }

    // 2. Shiprocket Tracking / NDR / RTO Webhook Receiver
    if (body.awb || body.awb_code || body.current_status || body.order_id || body.shipment_id) {
      const webhookResult = await processShiprocketWebhook(body);
      return NextResponse.json(webhookResult, {
        status: webhookResult.success ? 200 : 400,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Shiprocket webhook endpoint active and ready for events",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

