import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/siteConfig";
import { recordInboundCustomerMessage, updateMessageStatusByRecipient } from "@/lib/whatsappStore";

export const dynamic = "force-dynamic";

const VERIFY_TOKEN =
  process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || siteConfig.whatsappWebhookVerifyToken;

/**
 * Meta WhatsApp Cloud API Webhook Verification (GET)
 * Meta calls this when you click "Verify and save" in Developer Dashboard
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ [WhatsApp Webhook] Verification successful for Meta challenge.");
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  console.warn("⚠️ [WhatsApp Webhook] Verification failed. Token mismatch or bad mode:", { mode, token });
  return new Response("Verification failed", { status: 403 });
}

/**
 * Meta WhatsApp Cloud API Event Ingestion (POST)
 * Receives delivery receipts (sent, delivered, read, failed) and customer replies
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if this is a WhatsApp API webhook event
    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;
          if (!value) continue;

          // 1. Delivery status updates (sent, delivered, read, failed)
          if (value.statuses && Array.isArray(value.statuses)) {
            for (const status of value.statuses) {
              console.log(
                `📱 [WhatsApp Status] Message ${status.id} to ${status.recipient_id}: status=${status.status}`,
                status.errors ? JSON.stringify(status.errors) : ""
              );
              try {
                if (status.recipient_id && status.status) {
                  const mappedStatus =
                    status.status === "read"
                      ? "read"
                      : status.status === "delivered"
                      ? "delivered"
                      : status.status === "sent"
                      ? "sent"
                      : null;
                  if (mappedStatus) {
                    await updateMessageStatusByRecipient(status.recipient_id, mappedStatus);
                  }
                }
              } catch (stErr) {
                console.warn("Failed to update message delivery status from webhook:", stErr);
              }
            }
          }

          // 2. Inbound customer messages (e.g. text, button replies, interactive choices, media)
          if (value.messages && Array.isArray(value.messages)) {
            for (const msg of value.messages) {
              let bodyText = "";
              let msgType: "text" | "image" | "voice" | "document" = "text";
              let mediaUrl: string | undefined = undefined;

              if (msg.type === "text" && msg.text?.body) {
                bodyText = msg.text.body;
              } else if (msg.type === "interactive") {
                bodyText =
                  msg.interactive?.button_reply?.title ||
                  msg.interactive?.list_reply?.title ||
                  msg.interactive?.button_reply?.id ||
                  "Interactive response";
              } else if (msg.type === "button") {
                bodyText = msg.button?.text || msg.button?.payload || "Button clicked";
              } else if (msg.type === "image") {
                msgType = "image";
                bodyText = msg.image?.caption || "📷 Image";
                mediaUrl = msg.image?.id ? `/api/admin/whatsapp/media?mediaId=${msg.image.id}` : undefined;
              } else if (msg.type === "audio" || msg.type === "voice") {
                msgType = "voice";
                bodyText = "🎤 Voice note";
                const audioObj = msg.audio || msg.voice;
                mediaUrl = audioObj?.id ? `/api/admin/whatsapp/media?mediaId=${audioObj.id}` : undefined;
              } else if (msg.type === "document") {
                msgType = "document";
                bodyText = msg.document?.filename || "📄 Document";
                mediaUrl = msg.document?.id ? `/api/admin/whatsapp/media?mediaId=${msg.document.id}` : undefined;
              } else if (msg.type === "sticker") {
                msgType = "image";
                bodyText = "🎨 Sticker";
                mediaUrl = msg.sticker?.id ? `/api/admin/whatsapp/media?mediaId=${msg.sticker.id}` : undefined;
              } else if (msg.type === "video") {
                msgType = "video" as any;
                bodyText = msg.video?.caption || "🎥 Video";
                mediaUrl = msg.video?.id ? `/api/admin/whatsapp/media?mediaId=${msg.video.id}` : undefined;
              } else if (msg.type === "location" && msg.location) {
                const loc = msg.location;
                const title = loc.name || loc.address || "Pinned Location";
                bodyText = `📍 Location: ${title}\nhttps://maps.google.com/?q=${loc.latitude},${loc.longitude}`;
              } else if (msg.type === "contacts" && Array.isArray(msg.contacts) && msg.contacts.length > 0) {
                const c = msg.contacts[0];
                const name = c.name?.formatted_name || c.name?.first_name || "Contact";
                const phone = c.phones?.[0]?.phone || "";
                bodyText = `👤 Contact: ${name}${phone ? ` (${phone})` : ""}`;
              } else if (msg.type === "unsupported") {
                bodyText = "📎 Attachment type not supported on WhatsApp Cloud API (e.g. sticker, contact, or disappearing media)";
              } else {
                bodyText = msg.text?.body || (msg.type ? `[${msg.type}]` : "Inbound message");
              }

              console.log(
                `📩 [WhatsApp Inbound] From ${msg.from} (${msg.type}):`,
                bodyText
              );

              try {
                await recordInboundCustomerMessage(msg.from, bodyText, msgType, mediaUrl);
              } catch (e) {
                console.warn("Failed to record inbound WhatsApp message:", e);
              }

              // Automatically handle WhatsApp Order Confirmation / Cancellation replies
              try {
                const normText = (bodyText || "").trim().toLowerCase();
                const isConfirmAction =
                  normText === "confirm order" ||
                  normText === "confirm" ||
                  normText === "1" ||
                  normText === "yes" ||
                  normText === "proceed" ||
                  normText.startsWith("confirm");

                const isCancelAction =
                  normText === "cancel order" ||
                  normText === "cancel" ||
                  normText === "2" ||
                  normText === "no";

                if (isConfirmAction || isCancelAction) {
                  const { executeD1Query } = await import("@/lib/d1");
                  const cleanPhone = (msg.from || "").replace(/\D/g, "");
                  const last10 = cleanPhone.slice(-10);

                  const pendingRows = await executeD1Query<any>(
                    `SELECT id, whatsapp_confirm_token, shopify_order_id, customer_name, customer_phone, total_amount, payment_method, items
                     FROM orders
                     WHERE (customer_phone LIKE ? OR customer_phone LIKE ?)
                       AND whatsapp_confirm_status = 'pending_whatsapp'
                     ORDER BY created_at DESC LIMIT 1`,
                    [`%${last10}`, `%${cleanPhone}`]
                  );

                  if (pendingRows && pendingRows.length > 0) {
                    const targetOrder = pendingRows[0];
                    if (isConfirmAction) {
                      const { confirmWhatsAppOrder } = await import("@/lib/orderStore");
                      await confirmWhatsAppOrder(targetOrder.whatsapp_confirm_token, targetOrder.id);
                      console.log(`✅ [WA Webhook] Automatically confirmed order ${targetOrder.id} via customer reply "${bodyText}"`);

                      const { sendOrderConfirmationWhatsApp } = await import("@/lib/whatsappOrderConfirmation");
                      let parsedItems = [];
                      try {
                        parsedItems = typeof targetOrder.items === "string" ? JSON.parse(targetOrder.items) : (targetOrder.items || []);
                      } catch {
                        parsedItems = [];
                      }

                      await sendOrderConfirmationWhatsApp({
                        customerName: targetOrder.customer_name || "Valued Customer",
                        customerPhone: targetOrder.customer_phone || msg.from,
                        orderId: targetOrder.shopify_order_id || targetOrder.id,
                        totalAmount: Number(targetOrder.total_amount) || 0,
                        paymentMethod: (targetOrder.payment_method || "").toLowerCase().includes("cod") ? "cod" : "prepaid",
                        items: parsedItems.map((it: any) => ({
                          name: it.product_name || it.name || siteConfig.name,
                          quantity: Number(it.quantity || 1),
                          price: Number(it.unit_price || it.price || 0),
                        })),
                      });
                    } else if (isCancelAction) {
                      const { cancelWhatsAppOrder } = await import("@/lib/orderStore");
                      await cancelWhatsAppOrder(targetOrder.whatsapp_confirm_token || targetOrder.id, {
                        isDirectCustomerCancel: true,
                        reason: "Customer requested cancellation via WhatsApp reply",
                      });
                      console.log(`🛑 [WA Webhook] Cancelled order ${targetOrder.id} via customer reply "${bodyText}"`);
                    }
                  }
                }
              } catch (autoErr) {
                console.warn("[WA Webhook] Auto confirm/cancel error:", autoErr);
              }
            }
          }
        }
      }

      return NextResponse.json({ success: true, message: "EVENT_RECEIVED" });
    }

    return NextResponse.json({ success: false, message: "Not a WhatsApp event" }, { status: 404 });
  } catch (error: any) {
    console.error("Error processing WhatsApp webhook:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
