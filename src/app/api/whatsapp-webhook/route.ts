import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/siteConfig";
import { recordInboundCustomerMessage } from "@/lib/whatsappStore";

export const dynamic = "force-dynamic";

const VERIFY_TOKEN =
  process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || siteConfig.whatsappWebhookVerifyToken;

/**
 * Meta WhatsApp Cloud API Webhook Verification (GET)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ [WhatsApp Webhook Alternate] Verification successful.");
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return new Response("Verification failed", { status: 403 });
}

/**
 * Meta WhatsApp Cloud API Event Ingestion (POST)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;
          if (!value) continue;

          // Inbound customer messages
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
                bodyText = "📎 Attachment type not supported on WhatsApp Cloud API";
              } else {
                bodyText = msg.text?.body || (msg.type ? `[${msg.type}]` : "Inbound message");
              }

              console.log(`📩 [WhatsApp Inbound Alt] From ${msg.from} (${msg.type}):`, bodyText);

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
