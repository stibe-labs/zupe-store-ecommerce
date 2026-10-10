import { NextRequest, NextResponse } from "next/server";
import { getERPOrders } from "@/lib/erpStore";
import { pushOrderToShopify } from "@/lib/shopifyOutbound";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");

    // If order_id is specified, manually push this single order to Shopify
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

      const result = await pushOrderToShopify(target, { force: true });
      return NextResponse.json(result);
    }

    // Otherwise, perform batch synchronization check
    const orders = await getERPOrders();
    const unpushed = orders.filter(
      (o) => !o.shopify_order_id || o.shopify_order_id.startsWith("#10")
    );

    return NextResponse.json({
      success: true,
      message: `Shopify sync check completed. ${orders.length} total orders, ${unpushed.length} orders mapped to Shopify.`,
      totalOrders: orders.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const topic = req.headers.get("x-shopify-topic");
    const shopDomain = req.headers.get("x-shopify-shop-domain") || "zupe-store.myshopify.com";

    // 1. If this is a manual push action from Admin Dashboard
    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }

    if (body.action === "push_order" && body.order_id) {
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

      const result = await pushOrderToShopify(target, { force: true });
      return NextResponse.json(result);
    }

    // 2. Inbound Webhook listener from Shopify (orders/create, orders/updated)
    if (topic) {
      console.log(`Shopify Webhook received [${topic}] from ${shopDomain}:`, body?.id);
      return NextResponse.json({
        success: true,
        message: "Webhook processed",
        topic,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Shopify sync API ready",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
