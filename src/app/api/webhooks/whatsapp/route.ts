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
                mediaUrl = msg.image?.id ? `https://graph.facebook.com/v21.0/${msg.image.id}` : undefined;
              } else if (msg.type === "audio" || msg.type === "voice") {
                msgType = "voice";
                bodyText = "🎤 Voice note";
              } else if (msg.type === "document") {
                msgType = "document";
                bodyText = msg.document?.filename || "📄 Document";
              } else {
                bodyText = msg.text?.body || `[${msg.type || "Inbound message"}]`;
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
