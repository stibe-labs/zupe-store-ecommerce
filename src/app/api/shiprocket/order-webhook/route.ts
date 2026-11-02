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
    console.log("[Fastrr Order Webhook] Received event:", orderId, payload);

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


