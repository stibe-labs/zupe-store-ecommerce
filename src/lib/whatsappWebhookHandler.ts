import { parseMetaInboundMessage } from "@/lib/whatsappInboundParser";
import {
  recordInboundCustomerMessage,
  updateMessageStatusByRecipient,
  updateMessageStatusByWaId,
} from "@/lib/whatsappStore";

export interface WebhookProcessSummary {
  handled: boolean;
  messagesProcessed: number;
  statusesProcessed: number;
}

/**
 * Shared processor for Meta WhatsApp Cloud API webhook POST payloads.
 * Used by both /api/webhooks/whatsapp and /api/whatsapp-webhook so neither route drifts.
 */
export async function processWhatsAppWebhookPayload(body: any): Promise<WebhookProcessSummary> {
  if (!body || body.object !== "whatsapp_business_account") {
    return { handled: false, messagesProcessed: 0, statusesProcessed: 0 };
  }

  let messagesProcessed = 0;
  let statusesProcessed = 0;

  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      const value = change?.value;
      if (!value) continue;

      // 1. Delivery status updates (sent, delivered, read, failed)
      if (Array.isArray(value.statuses)) {
        for (const status of value.statuses) {
          statusesProcessed += 1;
          console.log(
            `📱 [WhatsApp Status] Message ${status.id} to ${status.recipient_id}: status=${status.status}`,
            status.errors ? JSON.stringify(status.errors) : ""
          );

          try {
            const mappedStatus =
              status.status === "read"
                ? "read"
                : status.status === "delivered"
                ? "delivered"
                : status.status === "sent"
                ? "sent"
                : null;

            if (mappedStatus) {
              const updatedByWaId = status.id
                ? await updateMessageStatusByWaId(String(status.id), mappedStatus)
                : false;
              if (!updatedByWaId && status.recipient_id) {
                await updateMessageStatusByRecipient(String(status.recipient_id), mappedStatus);
              }
            }
          } catch (stErr) {
            console.warn("Failed to update message delivery status from webhook:", stErr);
          }
        }
      }

      // 2. Inbound customer messages (text, media, location, contacts, reactions, orders, referrals, unsupported)
      if (Array.isArray(value.messages)) {
        for (const rawMsg of value.messages) {
          const parsed = parseMetaInboundMessage(rawMsg, value.contacts);
          if (!parsed) continue;

          messagesProcessed += 1;
          console.log(
            `📩 [WhatsApp Inbound] From ${parsed.from} (${rawMsg.type || parsed.type} -> ${parsed.type}):`,
            parsed.content.slice(0, 120)
          );

          try {
            await recordInboundCustomerMessage(parsed);
          } catch (err) {
            console.warn("Failed to record inbound WhatsApp message:", err);
          }
        }
      }
    }
  }

  return { handled: true, messagesProcessed, statusesProcessed };
}
