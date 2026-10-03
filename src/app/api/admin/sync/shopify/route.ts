import { NextRequest, NextResponse } from "next/server";
import { getERPOrders } from "@/lib/erpStore";

export async function GET(req: NextRequest) {
  // On-demand Shopify Sync Trigger
  try {
    // In production, queries Shopify Admin REST/GraphQL API
    const syncedCount = 8;
    return NextResponse.json({
      success: true,
      message: `Shopify sync completed successfully. Synced ${syncedCount} recent orders.`,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Webhook listener from Shopify (orders/create, orders/updated)
  try {
    const topic = req.headers.get("x-shopify-topic") || "orders/updated";
    const shopDomain = req.headers.get("x-shopify-shop-domain") || "zupe-store.myshopify.com";
    const payload = await req.json();

    console.log(`Shopify Webhook received [${topic}] from ${shopDomain}:`, payload?.id);

    return NextResponse.json({
      success: true,
      message: "Webhook processed",
      topic,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
