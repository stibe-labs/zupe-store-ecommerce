import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "turkiyejam_wa_secret_2026";

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

          // 1. Delivery status updates
          if (value.statuses && Array.isArray(value.statuses)) {
            for (const status of value.statuses) {
              console.log(
                `📱 [WhatsApp Status] Message ${status.id} to ${status.recipient_id}: status=${status.status}`,
                status.errors ? JSON.stringify(status.errors) : ""
              );
            }
          }

          // 2. Inbound customer messages (e.g. user sends "Hi")
          if (value.messages && Array.isArray(value.messages)) {
            for (const msg of value.messages) {
              console.log(
                `📩 [WhatsApp Inbound] From ${msg.from} (${msg.type}):`,
                msg.text ? msg.text.body : msg.type
              );
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
