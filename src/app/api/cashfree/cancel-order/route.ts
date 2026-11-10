import { NextRequest, NextResponse } from "next/server";
import { executeD1Query } from "@/lib/d1";
import { updateERPOrder, getOrderById } from "@/lib/erpStore";
import { updateStorefrontOrder, getStorefrontOrderById } from "@/lib/orderStore";
import { restockInventory } from "@/lib/inventoryService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, reason } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing required orderId" },
        { status: 400 }
      );
    }

    // 1. Fetch order details from memory or D1
    let order: any = getStorefrontOrderById(orderId) || (await getOrderById(orderId));
    if (!order) {
      try {
        const rows = await executeD1Query<any>(
          "SELECT * FROM orders WHERE id = ? OR shopify_order_id = ? LIMIT 1",
          [orderId, orderId]
        );
        if (rows && rows.length > 0) order = rows[0];
      } catch {}
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Guard: If payment was already completed or order was confirmed, do not auto-cancel
    const paymentStatus = (order.payment_status || "").toLowerCase();
    const waStatus = (order.whatsapp_confirm_status || "").toLowerCase();
    if (paymentStatus === "completed" || paymentStatus === "paid" || waStatus === "confirmed") {
      return NextResponse.json({
        success: false,
        message: "Order has already been confirmed/paid and cannot be auto-cancelled.",
      });
    }

    const effectiveId = order.id || orderId;

    // 2. Restock inventory if items exist
    let itemsToRestock: any[] = [];
    if (Array.isArray(order.items)) {
      itemsToRestock = order.items;
    } else if (typeof order.items === "string") {
      try {
        itemsToRestock = JSON.parse(order.items);
      } catch {}
    }

    if (itemsToRestock.length > 0) {
      try {
        await restockInventory(
          itemsToRestock.map((it: any) => ({
            product_id: it.product_id || it.product_name,
            name: it.product_name || it.name,
            quantity: Number(it.quantity || 1),
          }))
        );
      } catch (restockErr) {
        console.warn("Restock on payment cancel warning:", restockErr);
      }
    }

    // 3. Update In-memory stores and Cloudflare D1
    updateStorefrontOrder(effectiveId, {
      order_status: "cancelled",
      whatsapp_confirm_status: "cancelled",
      whatsapp_token_used: true,
      advance_paid: 0,
    });

    try {
      await updateERPOrder(effectiveId, {
        status: "Cancelled",
        delivery_status: "Cancelled" as any,
        whatsapp_confirm_status: "cancelled",
        whatsapp_token_used: true,
        advance_paid: 0,
        net_profit: 0,
      });
    } catch (e) {
      console.warn("ERP update on cancel warning:", e);
    }

    try {
      await executeD1Query(
        `UPDATE orders
         SET status = 'Cancelled',
             delivery_status = 'Cancelled',
             whatsapp_confirm_status = 'cancelled',
             whatsapp_token_used = 1,
             advance_paid = 0
         WHERE id = ? OR shopify_order_id = ?`,
        [effectiveId, effectiveId]
      );
    } catch (d1Err) {
      console.warn("D1 cancel-order warning:", d1Err);
    }

    console.log(`✅ [Cashfree Cancel] Order ${effectiveId} marked as Cancelled/Unpaid. Inventory restored.`);

    return NextResponse.json({
      success: true,
      message: "Unpaid / cancelled order marked as Cancelled and inventory restored.",
      orderId: effectiveId,
    });
  } catch (err: any) {
    console.error("Cancel order error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to cancel order" },
      { status: 500 }
    );
  }
}

