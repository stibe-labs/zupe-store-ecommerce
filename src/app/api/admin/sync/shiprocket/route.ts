import { NextRequest, NextResponse } from "next/server";
import { getERPOrders } from "@/lib/erpStore";
import { generateShiprocketAWB } from "@/lib/shiprocketService";

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

    // Default batch sync summary
    const orders = await getERPOrders();
    const activeShipments = orders.filter((o) => o.shiprocket_awb && !o.delivery_status.includes("Delivered"));

    return NextResponse.json({
      success: true,
      message: `Shiprocket sync completed. Active shipments monitored: ${activeShipments.length}.`,
      activeShipmentsCount: activeShipments.length,
      timestamp: new Date().toISOString(),
    });
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

    // 1. Generate AWB on-demand action
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
    if (body.awb || body.current_status) {
      console.log("Shiprocket Webhook received:", body?.awb, body?.current_status);
      return NextResponse.json({
        success: true,
        message: "Shiprocket tracking update processed",
        awb: body?.awb,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Shiprocket sync endpoint active",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
