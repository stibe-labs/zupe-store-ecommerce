// Meta WhatsApp Business Cloud API — Official Webhook Endpoint
// Handles Webhook Verification Handshake (GET) and Inbound Events (POST)
// Webhook Callback URL: https://zupestore.in/api/webhooks/whatsapp
// Configured Number: +91 97781 37954

import { NextRequest, NextResponse } from "next/server";
import {
  recordWhatsAppMessage,
  updateWhatsAppMessageStatus,
} from "@/lib/whatsappChatService";

export const dynamic = "force-dynamic";

const VERIFY_TOKEN =
  process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ||
  process.env.WHATSAPP_VERIFY_TOKEN ||
  "zupe_whatsapp_webhook_secret_2026";

/**
 * 1. Meta Webhook Handshake Verification (GET)
 * Meta pings this endpoint to verify domain ownership when adding Webhook Callback URL.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    // Check if mode and token were sent
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ [Meta WhatsApp Webhook] Verification successful!");
      return new NextResponse(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // Diagnostic fallback for browser check
    if (!mode && !token) {
      return NextResponse.json({
        service: "Zupe Store WhatsApp Meta Webhook",
        status: "Active & Listening",
        phone_number: "+91 97781 37954",
        configured_verify_token: VERIFY_TOKEN,
        webhook_url: "https://zupestore.in/api/webhooks/whatsapp",
        timestamp: new Date().toISOString(),
      });
    }

    console.warn("❌ [Meta WhatsApp Webhook] Verification token mismatch:", token);
    return new NextResponse("Forbidden", { status: 403 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * 2. Inbound Message & Status Updates Ingest (POST)
 * Receives customer replies, text, images, button clicks, and delivery receipts from Meta.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || body.object !== "whatsapp_business_account") {
      return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    const entries = body.entry || [];

    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field !== "messages") continue;

        const value = change.value || {};
        const contacts = value.contacts || [];
        const messages = value.messages || [];
        const statuses = value.statuses || [];

        // Map contacts by wa_id for quick name lookup
        const contactNames: Record<string, string> = {};
        for (const c of contacts) {
          if (c.wa_id && c.profile?.name) {
            contactNames[c.wa_id] = c.profile.name;
          }
        }

        // A. Handle Inbound Customer Messages
        for (const msg of messages) {
          const senderPhone = msg.from;
          const msgId = msg.id;
          const msgType = msg.type;
          const customerName = contactNames[senderPhone] || null;

          let content = "";
          let mediaUrl: string | null = null;
          let buttons: any = null;

          if (msgType === "text") {
            content = msg.text?.body || "";
          } else if (msgType === "image") {
            content = msg.image?.caption || "📷 Photo";
            mediaUrl = msg.image?.id ? `meta://media/${msg.image.id}` : null;
          } else if (msgType === "interactive") {
            const reply =
              msg.interactive?.button_reply || msg.interactive?.list_reply;
            content = reply?.title || reply?.id || "Selected option";
            buttons = [reply];
          } else if (msgType === "button") {
            content = msg.button?.text || msg.button?.payload || "Button clicked";
          } else if (msgType === "audio") {
            content = "🎵 Voice note";
          } else if (msgType === "document") {
            content = msg.document?.filename || "📄 Document";
          } else if (msgType === "location") {
            content = `📍 Location: ${msg.location?.latitude}, ${msg.location?.longitude}`;
          } else {
            content = `[${msgType} message]`;
          }

          console.log(`📩 [WA Webhook] New message from ${senderPhone}: ${content}`);

          await recordWhatsAppMessage({
            phone: senderPhone,
            customerName: customerName,
            sender: "customer",
            messageType: msgType,
            content: content,
            mediaUrl: mediaUrl,
            buttons: buttons,
            status: "received",
            metaMessageId: msgId,
            rawPayload: msg,
          });
        }

        // B. Handle Delivery Status Receipts (sent -> delivered -> read)
        for (const st of statuses) {
          const statusVal = st.status; // 'sent' | 'delivered' | 'read' | 'failed'
          const metaMsgId = st.id;
          if (statusVal && metaMsgId) {
            await updateWhatsAppMessageStatus(metaMsgId, statusVal);
          }
        }
      }
    }

    // Always respond with 200 OK to Meta
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("❌ [Meta WhatsApp Webhook] Ingest error:", err);
    // Return 200 to prevent Meta from spamming retries on application errors
    return NextResponse.json({ success: false, error: err.message }, { status: 200 });
  }
}

