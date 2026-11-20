import { NextRequest, NextResponse } from "next/server";
import { getFastrrOrderDetails, fastrrOrderToERPOrder } from "@/lib/fastrr";
import { createERPOrder, registerERPOrderInMemory } from "@/lib/erpStore";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {}

    const orderId = payload.order_id || payload.id;
    console.log("[Shiprocket / Fastrr Order Webhook] Received event:", orderId, payload);

    // 1. If this is a Shiprocket tracking / transit status webhook (contains AWB or shipment status)
    if (payload.awb || payload.awb_code || payload.current_status || payload.shipment_status) {
      const { processShiprocketWebhook } = await import("@/lib/shiprocketService");
      const webhookResult = await processShiprocketWebhook(payload);
      return NextResponse.json({ success: true, acknowledged: true, ...webhookResult });
    }

    if (orderId) {
      try {
        const detailsData = await getFastrrOrderDetails(orderId);
        if (detailsData && (detailsData.order_id || detailsData.fastrr_order_id)) {
          const erpOrder = fastrrOrderToERPOrder(detailsData);
          registerERPOrderInMemory(erpOrder);
          await createERPOrder(erpOrder);

          // Trigger WhatsApp confirmation if phone is available
          if (erpOrder.customer_phone) {
            try {
              const { sendWhatsAppOrderConfirmation } = await import("@/lib/whatsappOrderConfirmation");
              await sendWhatsAppOrderConfirmation(erpOrder as any);
            } catch (waErr) {
              console.warn("[Fastrr Order Webhook] WhatsApp alert error:", waErr);
            }
          }
        }
      } catch (dErr) {
        console.warn("[Fastrr Order Details] fetch/save error:", dErr);
      }
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (err: any) {
    console.error("[Fastrr Order Webhook] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}


