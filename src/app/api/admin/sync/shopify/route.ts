import { NextRequest, NextResponse } from "next/server";
import { getERPOrders } from "@/lib/erpStore";
import {
  pushOrderToShopify,
  pullShopifyOrders,
  processShopifyWebhook,
} from "@/lib/shopifyOutbound";

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

    // Default action on GET: Pull latest orders from Shopify into ERP
    const limitParam = Number(searchParams.get("limit")) || 50;
    const statusParam = searchParams.get("status") || "any";
    const pullResult = await pullShopifyOrders({ limit: limitParam, status: statusParam });

    return NextResponse.json(pullResult);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const topic = req.headers.get("x-shopify-topic");
    const shopDomain = req.headers.get("x-shopify-shop-domain") || "zupe-store.myshopify.com";

    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }

    // 1. Inbound Webhook listener from Shopify (orders/create, orders/updated, orders/cancelled)
    if (topic) {
      console.log(`Shopify Webhook received [${topic}] from ${shopDomain}:`, body?.name || body?.id);
      const webhookRes = await processShopifyWebhook(topic, body);
      return NextResponse.json(webhookRes);
    }

    // 2. Manual pull action from Admin Dashboard
    if (body.action === "pull_orders") {
      const pullResult = await pullShopifyOrders({
        limit: body.limit || 50,
        status: body.status || "any",
      });
      return NextResponse.json(pullResult);
    }

    // 3. Manual push action from Admin Dashboard
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

    return NextResponse.json({
      success: true,
      message: "Shopify sync API active and ready",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

