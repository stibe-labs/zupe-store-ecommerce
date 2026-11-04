// Zupe Store — WhatsApp Chat & Webhook Service
// Powers WhatsApp Web UI & Meta Business Cloud API Two-Way Messaging (+91 97781 37954)

import { executeD1Query } from "@/lib/d1";

const DEFAULT_WA_TOKEN =
  "EAAY6t7MlMOIBSgAfMGRZAJsIudRT1lMXiZARDnHSvqKZAr5ZArjs6htxGbGBlnE1ZCAOvQiOM069AgyzkuZB4UAtMveTfv6gu3Ik2A3nbQDaRIkWB7yuZACwVNS2eDELePKcOJRRnjE3Nx2m728wvYld1VZCMN05fulca3ZA5COTRZB82a9AZAfsAFyrS2XP41f6dRVygZDZD";
const DEFAULT_WA_PHONE_ID = "1434769426379176";
export const OFFICIAL_WA_NUMBER = "+91 97781 37954";

export interface WhatsAppChat {
  id: string;
  phone: string;
  customer_name: string | null;
  avatar_url: string | null;
  last_message: string | null;
  last_message_at: string;
  unread_count: number;
  is_pinned: number;
  is_archived: number;
  tags: string | null;
  meta_user_id: string | null;
  created_at: string;
  updated_at: string;
  // Enriched order info
  order_count?: number;
  latest_order_id?: string;
  latest_order_amount?: number;
  latest_order_status?: string;
}

export interface WhatsAppMessage {
  id: string;
  chat_id: string;
  phone: string;
  sender: "customer" | "admin" | "system" | "bot";
  message_type: "text" | "image" | "template" | "interactive" | "button" | "document" | "audio";
  content: string;
  template_name?: string | null;
  media_url?: string | null;
  buttons?: string | null;
  status: "sent" | "delivered" | "read" | "failed" | "received";
  meta_message_id?: string | null;
  raw_payload?: string | null;
  created_at: string;
}

/**
 * Normalizes any phone number string into clean digits (e.g. 919778137954)
 */
export function normalizePhone(rawPhone: string): string {
  if (!rawPhone) return "";
  let digits = rawPhone.replace(/\D/g, "");
  if (digits.length === 10) {
    digits = `91${digits}`;
  }
  return digits;
}

/**
 * Formats clean digits into human-readable WhatsApp format (+91 97781 37954)
 */
export function formatPhoneDisplay(digits: string): string {
  const clean = normalizePhone(digits);
  if (clean.startsWith("91") && clean.length === 12) {
    return `+91 ${clean.slice(2, 7)} ${clean.slice(7)}`;
  }
  return clean.startsWith("+") ? clean : `+${clean}`;
}

/**
 * Retrieves Meta WhatsApp Cloud API credentials from environment or fallback
 */
export function getMetaWhatsAppCredentials(): { token: string; phoneId: string } {
  let token = process.env.WHATSAPP_TOKEN;
  let phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    try {
      const { getCloudflareContext } = require("@opennextjs/cloudflare");
      const ctx = getCloudflareContext();
      if (ctx?.env) {
        token = token || ctx.env.WHATSAPP_TOKEN;
        phoneId = phoneId || ctx.env.WHATSAPP_PHONE_NUMBER_ID;
      }
    } catch {}
  }

  return {
    token: token || DEFAULT_WA_TOKEN,
    phoneId: phoneId || DEFAULT_WA_PHONE_ID,
  };
}

/**
 * Records an incoming or outgoing WhatsApp message and updates the conversation
 */
export async function recordWhatsAppMessage(params: {
  phone: string;
  customerName?: string | null;
  sender: "customer" | "admin" | "system" | "bot";
  messageType?: "text" | "image" | "template" | "interactive" | "button" | "document" | "audio";
  content: string;
  templateName?: string | null;
  mediaUrl?: string | null;
  buttons?: any;
  status?: "sent" | "delivered" | "read" | "failed" | "received";
  metaMessageId?: string | null;
  rawPayload?: any;
}): Promise<{ success: boolean; messageId: string }> {
  try {
    const phoneDigits = normalizePhone(params.phone);
    if (!phoneDigits) {
      throw new Error("Invalid phone number");
    }

    const chatId = phoneDigits;
    const messageId =
      params.metaMessageId ||
      `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const nowIso = new Date().toISOString();
    const isCustomer = params.sender === "customer";
    const buttonsJson = params.buttons
      ? typeof params.buttons === "string"
        ? params.buttons
        : JSON.stringify(params.buttons)
      : null;
    const rawPayloadJson = params.rawPayload
      ? typeof params.rawPayload === "string"
        ? params.rawPayload
        : JSON.stringify(params.rawPayload)
      : null;

    // 1. Try to look up customer name if not provided
    let customerName = params.customerName || null;
    if (!customerName) {
      try {
        const orderMatch = await executeD1Query<any>(
          `SELECT customer_name FROM orders 
           WHERE customer_phone LIKE ? OR customer_phone LIKE ? 
           ORDER BY created_at DESC LIMIT 1`,
          [`%${phoneDigits.slice(-10)}%`, `%${phoneDigits}%`]
        );
        const orderMatchRows = Array.isArray(orderMatch) ? orderMatch : (orderMatch as any)?.results || [];
        if (orderMatchRows.length && orderMatchRows[0].customer_name) {
          customerName = orderMatchRows[0].customer_name;
        }
      } catch {}
    }

    // 2. Upsert WhatsApp Chat Conversation
    await executeD1Query(
      `INSERT INTO whatsapp_chats (
        id, phone, customer_name, last_message, last_message_at, 
        unread_count, is_pinned, is_archived, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        last_message = excluded.last_message,
        last_message_at = excluded.last_message_at,
        unread_count = CASE WHEN ? = 1 THEN whatsapp_chats.unread_count + 1 ELSE whatsapp_chats.unread_count END,
        customer_name = COALESCE(excluded.customer_name, whatsapp_chats.customer_name),
        updated_at = excluded.updated_at`,
      [
        chatId,
        phoneDigits,
        customerName,
        params.content.slice(0, 500),
        nowIso,
        isCustomer ? 1 : 0,
        nowIso,
        nowIso,
        isCustomer ? 1 : 0,
      ]
    );

    // 3. Insert WhatsApp Message Entry
    await executeD1Query(
      `INSERT INTO whatsapp_messages (
        id, chat_id, phone, sender, message_type, content, 
        template_name, media_url, buttons, status, meta_message_id, 
        raw_payload, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        status = excluded.status,
        content = excluded.content`,
      [
        messageId,
        chatId,
        phoneDigits,
        params.sender,
        params.messageType || "text",
        params.content,
        params.templateName || null,
        params.mediaUrl || null,
        buttonsJson,
        params.status || (isCustomer ? "received" : "sent"),
        params.metaMessageId || null,
        rawPayloadJson,
        nowIso,
      ]
    );

    return { success: true, messageId };
  } catch (err: any) {
    console.error("[WhatsAppChatService] recordWhatsAppMessage failed:", err);
    return { success: false, messageId: "" };
  }
}

/**
 * Updates status of a message when delivery receipts arrive (sent, delivered, read)
 */
export async function updateWhatsAppMessageStatus(
  metaMessageId: string,
  status: "sent" | "delivered" | "read" | "failed"
): Promise<boolean> {
  try {
    if (!metaMessageId) return false;
    await executeD1Query(
      `UPDATE whatsapp_messages 
       SET status = ? 
       WHERE meta_message_id = ? OR id = ?`,
      [status, metaMessageId, metaMessageId]
    );
    return true;
  } catch (err) {
    console.error("[WhatsAppChatService] updateWhatsAppMessageStatus error:", err);
    return false;
  }
}

/**
 * Retrieves all conversations with search, filtering, and order details
 */
export async function getWhatsAppChatsList(options?: {
  search?: string;
  filter?: "all" | "unread" | "pinned" | "archived";
}): Promise<WhatsAppChat[]> {
  try {
    let sql = `SELECT * FROM whatsapp_chats WHERE 1=1`;
    const params: any[] = [];

    const filter = options?.filter || "all";
    if (filter === "unread") {
      sql += ` AND unread_count > 0 AND is_archived = 0`;
    } else if (filter === "pinned") {
      sql += ` AND is_pinned = 1 AND is_archived = 0`;
    } else if (filter === "archived") {
      sql += ` AND is_archived = 1`;
    } else {
      sql += ` AND is_archived = 0`;
    }

    if (options?.search && options.search.trim()) {
      const q = `%${options.search.trim()}%`;
      sql += ` AND (customer_name LIKE ? OR phone LIKE ? OR last_message LIKE ?)`;
      params.push(q, q, q);
    }

    sql += ` ORDER BY is_pinned DESC, last_message_at DESC LIMIT 100`;

    const res = await executeD1Query<WhatsAppChat>(sql, params);
    const chats = (Array.isArray(res) ? res : (res as any)?.results) || [];

    // Enrich chats with recent order info if available
    for (const chat of chats) {
      try {
        const last10Digits = chat.phone.slice(-10);
        const orderRes = await executeD1Query<any>(
          `SELECT id, total_amount, status 
           FROM orders 
           WHERE customer_phone LIKE ? 
           ORDER BY created_at DESC LIMIT 1`,
          [`%${last10Digits}%`]
        );
        const orderResRows = Array.isArray(orderRes) ? orderRes : (orderRes as any)?.results || [];
        if (orderResRows.length) {
          const o = orderResRows[0];
          chat.latest_order_id = o.id;
          chat.latest_order_amount = o.total_amount;
          chat.latest_order_status = o.status;
        }
      } catch {}
    }

    return chats;
  } catch (err) {
    console.error("[WhatsAppChatService] getWhatsAppChatsList error:", err);
    return [];
  }
}

/**
 * Retrieves messages for a specific conversation
 */
export async function getWhatsAppChatMessages(
  chatId: string
): Promise<WhatsAppMessage[]> {
  try {
    const phoneDigits = normalizePhone(chatId);
    const res = await executeD1Query<WhatsAppMessage>(
      `SELECT * FROM whatsapp_messages 
       WHERE chat_id = ? OR phone = ? 
       ORDER BY created_at ASC LIMIT 300`,
      [phoneDigits, phoneDigits]
    );

    // Reset unread count for this chat
    await executeD1Query(
      `UPDATE whatsapp_chats SET unread_count = 0 WHERE id = ?`,
      [phoneDigits]
    );

    return (Array.isArray(res) ? res : (res as any)?.results) || [];
  } catch (err) {
    console.error("[WhatsAppChatService] getWhatsAppChatMessages error:", err);
    return [];
  }
}

/**
 * Sends a live text message from the admin to the customer via Meta WhatsApp Cloud API
 */
export async function sendAdminWhatsAppReply(
  recipientPhone: string,
  messageText: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const to = normalizePhone(recipientPhone);
    if (!to || !messageText.trim()) {
      return { success: false, error: "Recipient phone and message text are required" };
    }

    const { token, phoneId } = getMetaWhatsAppCredentials();
    const apiUrl = `https://graph.facebook.com/v21.0/${phoneId}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to,
      type: "text",
      text: {
        preview_url: false,
        body: messageText.trim(),
      },
    };

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as any;

    if (!res.ok || data.error) {
      const errMsg =
        data.error?.message ||
        data.error?.error_user_msg ||
        `Meta API error: ${res.status} ${res.statusText}`;

      // If the 24-hour customer window is closed, record the attempt with error info
      const isWindowError =
        data.error?.code === 131047 ||
        errMsg.toLowerCase().includes("24 hour") ||
        errMsg.toLowerCase().includes("window");

      const failureNote = isWindowError
        ? "⚠️ 24-hour Meta customer service window closed. Customer must message this number first, or an approved template must be used."
        : `⚠️ Send failed: ${errMsg}`;

      // Still record the message locally so the admin sees what was attempted
      await recordWhatsAppMessage({
        phone: to,
        sender: "admin",
        content: messageText.trim(),
        status: "failed",
        rawPayload: { error: data.error, note: failureNote },
      });

      return {
        success: false,
        error: failureNote,
      };
    }

    const metaMsgId = data.messages?.[0]?.id || `out_${Date.now()}`;

    // Record the successfully sent message
    await recordWhatsAppMessage({
      phone: to,
      sender: "admin",
      content: messageText.trim(),
      status: "sent",
      metaMessageId: metaMsgId,
      rawPayload: data,
    });

    return {
      success: true,
      messageId: metaMsgId,
    };
  } catch (err: any) {
    console.error("[WhatsAppChatService] sendAdminWhatsAppReply error:", err);
    return {
      success: false,
      error: err.message || "Failed to dispatch WhatsApp message",
    };
  }
}

/**
 * Automatically syncs recent customer orders into whatsapp_chats
 * so the admin immediately has conversations visible for all current store customers.
 */
export async function syncCustomerOrdersToWhatsAppChats(): Promise<{
  synced: number;
  total: number;
}> {
  try {
    const ordersRes = await executeD1Query<any>(
      `SELECT id, customer_name, customer_phone, total_amount, payment_method, 
              status, created_at, items 
       FROM orders 
       WHERE customer_phone IS NOT NULL AND customer_phone != ''
       ORDER BY created_at DESC LIMIT 60`
    );

    const orders = (Array.isArray(ordersRes) ? ordersRes : (ordersRes as any)?.results) || [];
    let synced = 0;

    for (const order of orders) {
      const phoneDigits = normalizePhone(order.customer_phone);
      if (!phoneDigits || phoneDigits.length < 10) continue;

      const customerName = order.customer_name || "Customer";
      const totalAmount = order.total_amount ? `₹${order.total_amount}` : "";
      const method = order.payment_method?.toUpperCase() || "COD";

      // Parse item names if available
      let itemSummary = "Order Item";
      try {
        const parsedItems = JSON.parse(order.items || "[]");
        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          itemSummary = parsedItems.map((i: any) => `${i.name || "Item"} (x${i.quantity || 1})`).join(", ");
        }
      } catch {}

      const initialMessage = `📦 Order #${order.id} Placed • ${totalAmount} (${method}) • ${itemSummary.slice(0, 100)}`;
      const orderDate = order.created_at || new Date().toISOString();

      // Upsert chat
      await executeD1Query(
        `INSERT INTO whatsapp_chats (
          id, phone, customer_name, last_message, last_message_at, 
          unread_count, is_pinned, is_archived, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 0, 0, 0, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          customer_name = COALESCE(whatsapp_chats.customer_name, excluded.customer_name),
          last_message = COALESCE(whatsapp_chats.last_message, excluded.last_message),
          last_message_at = COALESCE(whatsapp_chats.last_message_at, excluded.last_message_at)`,
        [
          phoneDigits,
          phoneDigits,
          customerName,
          initialMessage,
          orderDate,
          orderDate,
          orderDate,
        ]
      );

      // Check if any message exists for this chat
      const msgCheck = await executeD1Query<any>(
        `SELECT COUNT(*) as count FROM whatsapp_messages WHERE chat_id = ?`,
        [phoneDigits]
      );

      const msgCheckRows = Array.isArray(msgCheck) ? msgCheck : (msgCheck as any)?.results || [];
      if (!msgCheckRows[0]?.count) {
        // Create initial order confirmation notification bubble
        const msgId = `init_${order.id}_${Date.now()}`;
        await executeD1Query(
          `INSERT INTO whatsapp_messages (
            id, chat_id, phone, sender, message_type, content, 
            template_name, buttons, status, created_at
          ) VALUES (?, ?, ?, 'system', 'template', ?, 'zupe_order_verify', ?, 'delivered', ?)`,
          [
            msgId,
            phoneDigits,
            phoneDigits,
            `Hi ${customerName}! 👋 Thank you for ordering from Zupe Store 🛒\n\nOrder ID: #${order.id}\nProduct: ${itemSummary.slice(0, 80)}\nAmount Payable: ${totalAmount}\nPayment Method: ${method}\n\nYour order has been logged into the system.`,
            JSON.stringify([
              { title: "✅ Confirm Order", payload: "confirm" },
              { title: "❌ Cancel Order", payload: "cancel" },
            ]),
            orderDate,
          ]
        );
      }

      synced++;
    }

    return { synced, total: orders.length };
  } catch (err) {
    console.error("[WhatsAppChatService] syncCustomerOrdersToWhatsAppChats error:", err);
    return { synced: 0, total: 0 };
  }
}

