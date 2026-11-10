// Vittal Digital Internal WhatsApp Store & Messaging Logic
import { getERPOrders, ERPOrder } from "@/lib/erpStore";
import { executeD1Query } from "@/lib/d1";
import { siteConfig } from "@/config/siteConfig";

export interface WhatsAppReaction {
  emoji: string;
  by: "agent" | "customer";
}

export interface WhatsAppMessage {
  id: string;
  conversationId: string;
  sender: "agent" | "customer" | "system";
  type:
    | "text"
    | "image"
    | "voice"
    | "order_card"
    | "tracking_card"
    | "product_card"
    | "template"
    | "document";
  content: string;
  mediaUrl?: string;
  mediaCaption?: string;
  mediaDuration?: number; // seconds
  orderData?: {
    orderId: string;
    totalAmount: number;
    itemsSummary: string;
    status: string;
    paymentMethod: string;
    shippingAddress?: string;
    awb?: string;
    courier?: string;
  };
  productData?: {
    name: string;
    price: number;
    mrp?: number;
    image: string;
    badge?: string;
    description: string;
  };
  reactions?: WhatsAppReaction[];
  replyTo?: {
    id: string;
    sender: string;
    snippet: string;
  };
  status: "sending" | "sent" | "delivered" | "read";
  timestamp: string;
}

export interface WhatsAppConversation {
  id: string;
  customerPhone: string;
  customerName: string;
  customerEmail?: string;
  orderId?: string;
  orderStatus?: string;
  orderTotal?: number;
  paymentMethod?: "cod" | "prepaid";
  shippingAddress?: string;
  avatarUrl?: string;
  unreadCount: number;
  isPinned: boolean;
  category: "all" | "orders" | "ndr" | "abandoned" | "internal";
  lastMessage: {
    text: string;
    sender: "agent" | "customer" | "system";
    timestamp: string;
    status: "sending" | "sent" | "delivered" | "read";
  };
  lastMessageTimestamp?: number;
  typing?: boolean;
  lastSeen?: string;
}

export interface WhatsAppTemplate {
  id: string;
  title: string;
  category: "Orders" | "Logistics" | "Marketing" | "Support";
  body: string;
  variables: string[];
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: "order_confirmation_cod",
    title: "Order Confirmation Request (COD)",
    category: "Orders",
    body: "Namaste {{name}}! ⚡ Thank you for ordering from Vittal Digital (Order {{order_id}}). Your Cash on Delivery order of ₹{{amount}} is verified and ready for packing & dispatch to {{address}}.\n\nPlease reply with *1* or click *Confirm Order* to approve dispatch.",
    variables: ["name", "order_id", "amount", "address"],
  },
  {
    id: "order_dispatched_awb",
    title: "Order Dispatched & Tracking Link",
    category: "Logistics",
    body: "Great news {{name}}! 🚀 Your Vittal Digital shipment {{order_id}} has been dispatched via {{courier}}.\n\nAWB Tracking Number: *{{awb}}*\nTrack live: https://vittaldigital.com/order-tracking?query={{awb}}\n\nYour order includes 1-Year Comprehensive Warranty and transit protection.",
    variables: ["name", "order_id", "courier", "awb"],
  },
  {
    id: "ndr_reattempt_address",
    title: "NDR Delivery Reattempt Assistance",
    category: "Logistics",
    body: "Hi {{name}}, our courier partner {{courier}} attempted delivery of your Vittal Digital order {{order_id}} today but could not reach you.\n\nWould you like us to schedule a delivery reattempt for tomorrow morning, or would you like to update your delivery address/landmark?",
    variables: ["name", "courier", "order_id"],
  },
  {
    id: "abandoned_cart_discount",
    title: "Abandoned Cart VIP Extra Discount",
    category: "Marketing",
    body: "Hi {{name}}! ⚡ We noticed you left premium electronics in your cart at Vittal Digital.\n\nHere is an exclusive instant ₹200 discount coupon code: *VITTAL200*.\nComplete your order here with express courier: https://vittaldigital.com/checkout?discount=VITTAL200",
    variables: ["name"],
  },
  {
    id: "warranty_registration_guide",
    title: "1-Year Warranty & Service Support Guide",
    category: "Support",
    body: "🛡️ *Vittal Digital 1-Year Warranty & Support Desk*\n\n1. All devices carry 1-Year comprehensive warranty with valid GST invoice.\n2. In case of any technical queries or 7-day replacement assistance, write to support@vittaldigital.com or message us right here.\n3. Service and doorstep courier pickup available across India.\n\nFeel free to ask our team if you need any assistance!",
    variables: [],
  },
];

// Live in-memory state: synchronized with Cloudflare D1 database
let inMemoryConversations: WhatsAppConversation[] = [];
let inMemoryMessages: Record<string, WhatsAppMessage[]> = {};

// Synchronize conversations directly from live Cloudflare D1 orders & whatsapp_conversations table
export async function syncConversationsFromERP(): Promise<void> {
  try {
    const orders = await getERPOrders();
    const validOrderIds = new Set((orders || []).map((o) => o.id));

    // 1. Prune conversations whose orders no longer exist in D1 (keep non-order manual chats)
    inMemoryConversations = inMemoryConversations.filter(
      (c) => !c.orderId || validOrderIds.has(c.orderId)
    );

    // 2. Prune corresponding cached messages for removed orders
    for (const convId of Object.keys(inMemoryMessages)) {
      if (convId.startsWith("conv-ord-")) {
        const ordId = convId.replace("conv-ord-", "");
        if (!validOrderIds.has(ordId)) {
          delete inMemoryMessages[convId];
        }
      }
    }

    // 3. Load persistent conversations from D1 whatsapp_conversations table
    try {
      const dbConvs = await executeD1Query<any>(
        "SELECT * FROM whatsapp_conversations ORDER BY last_message_time DESC"
      );
      if (dbConvs && Array.isArray(dbConvs)) {
        for (const row of dbConvs) {
          const normDigits = (row.customer_phone || "").replace(/\D/g, "");
          const exists = inMemoryConversations.some(
            (c) => c.id === row.id || (normDigits && c.customerPhone.replace(/\D/g, "").endsWith(normDigits.slice(-10)))
          );

          if (!exists) {
            inMemoryConversations.push({
              id: row.id,
              customerPhone: row.customer_phone,
              customerName: row.customer_name,
              customerEmail: row.customer_email || undefined,
              orderId: row.order_id || undefined,
              orderStatus: row.order_status || "Active",
              orderTotal: row.order_total || undefined,
              paymentMethod: (row.payment_method?.toLowerCase() === "cod" ? "cod" : "prepaid") as any,
              shippingAddress: row.shipping_address || undefined,
              avatarUrl: row.avatar_url || undefined,
              unreadCount: row.unread_count || 0,
              isPinned: Boolean(row.is_pinned),
              category: (row.category as any) || "orders",
              lastMessage: {
                text: row.last_message_text || "No messages yet",
                sender: (row.last_message_sender as any) || "agent",
                timestamp: row.last_message_time
                  ? new Date(row.last_message_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "Today",
                status: "delivered",
              },
              lastMessageTimestamp: row.last_message_time ? new Date(row.last_message_time).getTime() : Date.now(),
              lastSeen: "online",
            });
          } else {
            const existing = inMemoryConversations.find(
              (c) => c.id === row.id || (normDigits && c.customerPhone.replace(/\D/g, "").endsWith(normDigits.slice(-10)))
            );
            if (existing && row.last_message_text) {
              existing.lastMessage.text = row.last_message_text;
              existing.lastMessage.sender = row.last_message_sender || existing.lastMessage.sender;
              if (row.unread_count !== undefined) existing.unreadCount = row.unread_count;
              if (row.is_pinned !== undefined) existing.isPinned = Boolean(row.is_pinned);
              if (row.last_message_time) existing.lastMessageTimestamp = new Date(row.last_message_time).getTime();
            }
          }
        }
      }
    } catch (e) {
      // Non-fatal if table is empty or error
    }

    // 4. Ingest active orders from ERP into conversations
    if (orders && orders.length > 0) {
      for (const ord of orders) {
        const phone = ord.customer_phone || "";
        if (!phone) continue;

        const normDigits = phone.replace(/\D/g, "");
        const exists = inMemoryConversations.some(
          (c) => c.orderId === ord.id || c.customerPhone.replace(/\D/g, "").endsWith(normDigits.slice(-10))
        );

        if (!exists) {
          const id = `conv-ord-${ord.id}`;

          let itemsSummary = "Vittal Digital Electronics";
          if (ord.items) {
            try {
              const parsed = typeof ord.items === "string" ? JSON.parse(ord.items) : ord.items;
              if (Array.isArray(parsed) && parsed.length > 0) {
                itemsSummary = parsed
                  .map((it: any) => `${it.name || "Electronics"} (x${it.quantity || 1})`)
                  .join(", ");
              }
            } catch (e) {
              itemsSummary = String(ord.items);
            }
          }

          const isNDR =
            ord.delivery_status?.toLowerCase().includes("ndr") ||
            ord.status?.toLowerCase().includes("ndr");

          const isCancelled =
            ord.delivery_status?.toLowerCase().includes("cancel") ||
            ord.status?.toLowerCase().includes("cancel");

          const newConv: WhatsAppConversation = {
            id,
            customerPhone: phone.startsWith("+") ? phone : `+91 ${phone}`,
            customerName: ord.customer_name || `Customer (${normDigits.slice(-4)})`,
            customerEmail: ord.guest_email,
            orderId: ord.id,
            orderStatus: ord.delivery_status || ord.status || "Processing",
            orderTotal: ord.total_amount,
            paymentMethod: (ord.payment_method?.toLowerCase() === "cod" ? "cod" : "prepaid") as any,
            shippingAddress: ord.shipping_address,
            unreadCount: 0,
            isPinned: false,
            category: isNDR ? "ndr" : "orders",
            lastMessage: {
              text: `Order #${ord.id.substring(0, 8)} • ₹${ord.total_amount} (${ord.delivery_status || "Processing"})`,
              sender: "system",
              timestamp: "Today",
              status: isCancelled ? "read" : "delivered",
            },
            lastMessageTimestamp: ord.created_at ? new Date(ord.created_at).getTime() : Date.now(),
            lastSeen: "online",
          };

          inMemoryConversations.push(newConv);

          if (!inMemoryMessages[id]) {
            inMemoryMessages[id] = [
              {
                id: `msg-enc-${id}`,
                conversationId: id,
                sender: "system",
                type: "text",
                content:
                  "🔒 Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them. Tap to learn more.",
                status: "read",
                timestamp: "Today",
              },
              {
                id: `msg-init-${ord.id}`,
                conversationId: id,
                sender: "system",
                type: "order_card",
                content: `Customer placed order #${ord.id} for ₹${ord.total_amount}.`,
                orderData: {
                  orderId: ord.id,
                  totalAmount: ord.total_amount,
                  itemsSummary,
                  status: ord.delivery_status || "Processing",
                  paymentMethod: ord.payment_method?.toUpperCase() || "COD",
                  shippingAddress: ord.shipping_address,
                  awb: ord.shiprocket_awb,
                  courier: ord.courier_partner,
                },
                status: "delivered",
                timestamp: "Today",
              },
            ];
          }
        }
      }
    }
  } catch (err) {
    console.warn("syncConversationsFromERP error:", err);
  }
}

// -------------------------------------------------------------
// Public Data Access APIs
// -------------------------------------------------------------

export async function getWhatsAppConversations(filter?: string, search?: string): Promise<WhatsAppConversation[]> {
  await syncConversationsFromERP();

  let list = [...inMemoryConversations];

  if (filter && filter !== "all") {
    if (filter === "unread") {
      list = list.filter((c) => c.unreadCount > 0);
    } else {
      list = list.filter((c) => c.category === filter);
    }
  }

  if (search && search.trim() !== "") {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (c) =>
        c.customerName.toLowerCase().includes(q) ||
        c.customerPhone.includes(q) ||
        (c.orderId && c.orderId.toLowerCase().includes(q)) ||
        c.lastMessage.text.toLowerCase().includes(q)
    );
  }

  // Sort pinned first, then by most recent timestamp, then deterministic by ID
  return list.sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }
    const timeA = a.lastMessageTimestamp || 0;
    const timeB = b.lastMessageTimestamp || 0;
    if (timeB !== timeA) {
      return timeB - timeA;
    }
    return a.id.localeCompare(b.id);
  });
}

export async function getWhatsAppConversationById(id: string): Promise<WhatsAppConversation | null> {
  const conv = inMemoryConversations.find((c) => c.id === id);
  return conv || null;
}

export async function getWhatsAppMessages(conversationId: string): Promise<WhatsAppMessage[]> {
  // Check D1 for any persisted messages
  try {
    const rows = await executeD1Query<any>(
      "SELECT * FROM whatsapp_messages WHERE conversation_id = ? ORDER BY created_at ASC",
      [conversationId]
    );
    if (rows && rows.length > 0) {
      const dbMsgs: WhatsAppMessage[] = rows.map((r) => ({
        id: r.id,
        conversationId: r.conversation_id,
        sender: r.sender,
        type: r.type || "text",
        content: r.content,
        mediaUrl: r.media_url,
        mediaCaption: r.media_caption,
        mediaDuration: r.media_duration,
        reactions: r.reactions ? JSON.parse(r.reactions) : [],
        status: r.status || "delivered",
        timestamp: new Date(r.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }));
      // Deduplicate by message ID
      const seenIds = new Set<string>();
      const combined: WhatsAppMessage[] = [];
      const base = inMemoryMessages[conversationId] || [];
      const initSystem = base.filter((m) => m.sender === "system");

      for (const msg of [...initSystem, ...dbMsgs]) {
        if (!seenIds.has(msg.id)) {
          seenIds.add(msg.id);
          combined.push(msg);
        }
      }
      inMemoryMessages[conversationId] = combined;
      return combined;
    }
  } catch (e) {
    // Non-fatal D1 read
  }

  return inMemoryMessages[conversationId] || [];
}

export async function addWhatsAppMessage(
  conversationId: string,
  payload: Partial<WhatsAppMessage>
): Promise<WhatsAppMessage> {
  const msgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const newMessage: WhatsAppMessage = {
    id: msgId,
    conversationId,
    sender: payload.sender || "agent",
    type: payload.type || "text",
    content: payload.content || "",
    mediaUrl: payload.mediaUrl,
    mediaCaption: payload.mediaCaption,
    mediaDuration: payload.mediaDuration,
    orderData: payload.orderData,
    productData: payload.productData,
    replyTo: payload.replyTo,
    reactions: [],
    status: payload.sender === "customer" ? "read" : "sending",
    timestamp: timeFormatted,
  };

  if (!inMemoryMessages[conversationId]) {
    inMemoryMessages[conversationId] = [];
  }
  inMemoryMessages[conversationId].push(newMessage);

  // Update conversation last message
  const convIndex = inMemoryConversations.findIndex((c) => c.id === conversationId);
  if (convIndex !== -1) {
    inMemoryConversations[convIndex].lastMessage = {
      text: newMessage.content || (newMessage.type === "voice" ? "🎤 Voice message" : "Media"),
      sender: newMessage.sender,
      timestamp: timeFormatted,
      status: newMessage.status,
    };
    inMemoryConversations[convIndex].lastMessageTimestamp = Date.now();
    if (newMessage.sender === "customer") {
      inMemoryConversations[convIndex].unreadCount += 1;
    }
  }

  // Persist directly to Cloudflare D1
  try {
    await executeD1Query(
      `INSERT INTO whatsapp_messages (id, conversation_id, sender, type, content, media_url, media_caption, media_duration, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        newMessage.id,
        newMessage.conversationId,
        newMessage.sender,
        newMessage.type,
        newMessage.content,
        newMessage.mediaUrl || null,
        newMessage.mediaCaption || null,
        newMessage.mediaDuration || null,
        newMessage.status,
      ]
    );
  } catch (e) {
    // Non-fatal
  }

  return newMessage;
}

export async function updateMessageStatus(
  messageId: string,
  status: "sent" | "delivered" | "read"
): Promise<void> {
  for (const convId in inMemoryMessages) {
    const list = inMemoryMessages[convId];
    const msg = list.find((m) => m.id === messageId);
    if (msg) {
      msg.status = status;
      const conv = inMemoryConversations.find((c) => c.id === convId);
      if (conv && conv.lastMessage) {
        conv.lastMessage.status = status;
      }
      break;
    }
  }

  try {
    await executeD1Query(
      "UPDATE whatsapp_messages SET status = ? WHERE id = ?",
      [status, messageId]
    );
  } catch (e) {
    console.warn("D1 updateMessageStatus warning:", e);
  }
}

export async function updateMessageStatusByRecipient(
  recipientPhone: string,
  status: "sent" | "delivered" | "read"
): Promise<void> {
  const normDigits = recipientPhone.replace(/\D/g, "");
  const norm10 = normDigits.slice(-10);

  // Update in-memory
  for (const conv of inMemoryConversations) {
    const convDigits = conv.customerPhone.replace(/\D/g, "");
    if (convDigits.endsWith(norm10)) {
      if (conv.lastMessage && conv.lastMessage.sender === "agent") {
        conv.lastMessage.status = status;
      }
      const msgs = inMemoryMessages[conv.id];
      if (msgs && msgs.length > 0) {
        for (let i = msgs.length - 1; i >= 0; i--) {
          if (msgs[i].sender === "agent") {
            msgs[i].status = status;
            break;
          }
        }
      }
    }
  }

  // Update in D1
  try {
    await executeD1Query(
      `UPDATE whatsapp_messages 
       SET status = ? 
       WHERE sender = 'agent' 
         AND conversation_id IN (
           SELECT id FROM whatsapp_conversations 
           WHERE customer_phone LIKE ?
         )`,
      [status, `%${norm10}%`]
    );
  } catch (e) {
    console.warn("D1 updateMessageStatusByRecipient warning:", e);
  }
}

export async function markWhatsAppConversationRead(conversationId: string): Promise<void> {
  const conv = inMemoryConversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.unreadCount = 0;
  }
  try {
    await executeD1Query(
      "UPDATE whatsapp_conversations SET unread_count = 0 WHERE id = ?",
      [conversationId]
    );
  } catch (e) {
    console.warn("D1 markWhatsAppConversationRead warning:", e);
  }
}

export async function togglePinConversation(conversationId: string): Promise<boolean> {
  const conv = inMemoryConversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.isPinned = !conv.isPinned;
    try {
      await executeD1Query(
        "UPDATE whatsapp_conversations SET is_pinned = ? WHERE id = ?",
        [conv.isPinned ? 1 : 0, conversationId]
      );
    } catch (e) {
      console.warn("D1 togglePinConversation warning:", e);
    }
    return conv.isPinned;
  }
  return false;
}

export async function clearAllWhatsAppChats(): Promise<void> {
  inMemoryConversations = [];
  inMemoryMessages = {};
  try {
    await executeD1Query("DELETE FROM whatsapp_messages");
    await executeD1Query("DELETE FROM whatsapp_conversations");
  } catch (e) {
    console.warn("D1 clearAllWhatsAppChats warning:", e);
  }
}

export async function addMessageReaction(
  conversationId: string,
  messageId: string,
  emoji: string,
  by: "agent" | "customer" = "agent"
): Promise<void> {
  const list = inMemoryMessages[conversationId];
  if (!list) return;

  const msg = list.find((m) => m.id === messageId);
  if (msg) {
    if (!msg.reactions) msg.reactions = [];
    const existing = msg.reactions.findIndex((r) => r.by === by);
    if (existing !== -1) {
      if (msg.reactions[existing].emoji === emoji) {
        msg.reactions.splice(existing, 1);
      } else {
        msg.reactions[existing].emoji = emoji;
      }
    } else {
      msg.reactions.push({ emoji, by });
    }
  }
}

export async function deleteWhatsAppMessage(conversationId: string, messageId: string): Promise<void> {
  if (inMemoryMessages[conversationId]) {
    inMemoryMessages[conversationId] = inMemoryMessages[conversationId].filter((m) => m.id !== messageId);
  }
  try {
    await executeD1Query("DELETE FROM whatsapp_messages WHERE id = ?", [messageId]);
  } catch (e) {}
}

export async function persistConversationToD1(conv: WhatsAppConversation): Promise<void> {
  try {
    await executeD1Query(
      `INSERT INTO whatsapp_conversations (
        id, customer_phone, customer_name, customer_email, order_id, order_status, 
        order_total, payment_method, shipping_address, avatar_url, unread_count, 
        is_pinned, category, last_message_text, last_message_sender, last_message_time, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        customer_name = excluded.customer_name,
        customer_phone = excluded.customer_phone,
        customer_email = excluded.customer_email,
        order_id = excluded.order_id,
        order_status = excluded.order_status,
        order_total = excluded.order_total,
        payment_method = excluded.payment_method,
        shipping_address = excluded.shipping_address,
        unread_count = excluded.unread_count,
        is_pinned = excluded.is_pinned,
        category = excluded.category,
        last_message_text = excluded.last_message_text,
        last_message_sender = excluded.last_message_sender,
        last_message_time = CURRENT_TIMESTAMP`,
      [
        conv.id,
        conv.customerPhone,
        conv.customerName,
        conv.customerEmail || null,
        conv.orderId || null,
        conv.orderStatus || null,
        conv.orderTotal || null,
        conv.paymentMethod || "cod",
        conv.shippingAddress || null,
        conv.avatarUrl || null,
        conv.unreadCount || 0,
        conv.isPinned ? 1 : 0,
        conv.category || "orders",
        conv.lastMessage?.text || "Conversation started",
        conv.lastMessage?.sender || "agent",
      ]
    );
  } catch (err) {
    console.warn("Could not persist conversation to D1:", err);
  }
}

export async function createNewConversation(payload: {
  customerPhone: string;
  customerName: string;
  customerEmail?: string;
  orderId?: string;
  category?: "orders" | "ndr" | "abandoned" | "internal";
}): Promise<WhatsAppConversation> {
  const normDigits = payload.customerPhone.replace(/\D/g, "");
  const norm10 = normDigits.slice(-10);
  const formattedPhone = norm10.length === 10
    ? `+91 ${norm10.slice(0, 5)} ${norm10.slice(5)}`
    : payload.customerPhone.startsWith("+")
    ? payload.customerPhone
    : `+91 ${payload.customerPhone}`;

  const id = `conv-phone-${norm10 || Date.now()}`;
  const newConv: WhatsAppConversation = {
    id,
    customerPhone: formattedPhone,
    customerName: payload.customerName || `Customer (${norm10.slice(-4)})`,
    customerEmail: payload.customerEmail,
    orderId: payload.orderId,
    orderStatus: "Active",
    unreadCount: 0,
    isPinned: false,
    category: payload.category || "orders",
    lastMessage: {
      text: "Conversation started",
      sender: "system",
      timestamp: "Just now",
      status: "read",
    },
    lastSeen: "online",
  };

  inMemoryConversations.unshift(newConv);
  inMemoryMessages[id] = [
    {
      id: `msg-start-${id}`,
      conversationId: id,
      sender: "system",
      type: "text",
      content:
        "🔒 Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.",
      status: "read",
      timestamp: "Just now",
    },
  ];

  await persistConversationToD1(newConv);

  return newConv;
}

// Meta WhatsApp Cloud API Direct Dispatch
export async function sendMetaCloudApiMessage(
  recipientPhone: string,
  messageText: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const token =
    process.env.WHATSAPP_TOKEN ||
    "EAATwm2s3GMYBS7KhJQ2MDiAyAGFS6OwFHiXZAFvfPlyMUg4Jf3wV5e8TPj0PKC8rkE6x9vkzuZANllpjCUHvJaXYAZB6Ursyzc26l0SDJrBEEPJYB4ZB8rjEQ2qTSBI6tEYgZBOTJ47DAmVNAhuyaQAoryvhYiO6vRpAFdE0H61gFXCkwttX5sZCCSyR20kCwOOQZDZD";
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || "1477900698733187";

  const digits = recipientPhone.replace(/\D/g, "");
  const normalizedPhone = digits.length === 10 ? `91${digits}` : digits;

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: normalizedPhone,
        type: "text",
        text: { preview_url: false, body: messageText },
      }),
    });

    const data = await res.json();
    if (res.ok) {
      return { success: true, data };
    }
    return { success: false, error: data.error?.message || "Failed to send Meta Cloud API message" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Smart Customer Responses for interactive testing & simulation
export function generateSmartCustomerReply(
  customerName: string,
  lastAgentMessage: string,
  orderId?: string
): string {
  const lower = lastAgentMessage.toLowerCase();

  if (lower.includes("confirm") || lower.includes("cod") || lower.includes("ready for packing")) {
    return `Yes please! I confirm my order ${orderId ? "#" + orderId.substring(0, 8) : ""}. Please ensure safe electronic packaging and fragile handling. When can I expect delivery?`;
  }
  if (lower.includes("track") || lower.includes("awb") || lower.includes("dispatched") || lower.includes("shiprocket")) {
    return `Got the tracking number! Will the delivery executive call me before arriving? I'm available at my address after 1 PM.`;
  }
  if (lower.includes("ndr") || lower.includes("reattempt") || lower.includes("could not reach")) {
    return `Apologies, I was in a call earlier! Yes, please schedule a delivery reattempt for tomorrow morning. You can reach my alternate number as well.`;
  }
  if (lower.includes("coupon") || lower.includes("discount") || lower.includes("vittal200") || lower.includes("save10")) {
    return `Thank you so much for the discount code! Ordering right now with Cash on Delivery 🙌`;
  }
  if (lower.includes("warranty") || lower.includes("invoice") || lower.includes("replacement") || lower.includes("service")) {
    return `Understood! I'll keep the warranty card and GST invoice handy. Thank you for the quick support!`;
  }
  if (lower.includes("cancel")) {
    return `Okay, understood. Thank you for checking with me first!`;
  }

  const genericReplies = [
    `Thanks for the quick response! Really excited to receive my Vittal Digital order.`,
    `Noted! Please let me know once it is handed over to the courier partner.`,
    `Great service! Looking forward to receiving the package.`,
    `Thank you team Vittal Digital! Have a wonderful day.`,
  ];
  return genericReplies[Math.floor(Math.random() * genericReplies.length)];
}

export async function recordInboundCustomerMessage(
  phone: string,
  text: string,
  type: WhatsAppMessage["type"] = "text",
  mediaUrl?: string,
  mediaDuration?: number
): Promise<WhatsAppMessage | null> {
  try {
    if (!phone) return null;
    await syncConversationsFromERP();

    const digits = phone.replace(/\D/g, "");
    if (!digits) return null;
    const norm10 = digits.slice(-10);
    const displayPhone = `+91 ${norm10.slice(0, 5)} ${norm10.slice(5)}`;

    let conv = inMemoryConversations.find((c) => {
      const cDigits = c.customerPhone.replace(/\D/g, "");
      return cDigits.endsWith(norm10);
    });

    if (!conv) {
      let customerName = displayPhone;
      let orderId: string | undefined = undefined;

      try {
        const userRows = await executeD1Query<{ name: string }>(
          "SELECT name FROM users WHERE phone LIKE ? LIMIT 1",
          [`%${norm10}%`]
        );
        if (userRows && userRows[0]?.name) {
          customerName = userRows[0].name;
        } else {
          const ordRows = await executeD1Query<{ customer_name: string; id: string }>(
            "SELECT customer_name, id FROM orders WHERE customer_phone LIKE ? ORDER BY created_at DESC LIMIT 1",
            [`%${norm10}%`]
          );
          if (ordRows && ordRows[0]?.customer_name) {
            customerName = ordRows[0].customer_name;
            orderId = ordRows[0].id;
          }
        }
      } catch (e) {}

      conv = await createNewConversation({
        customerPhone: displayPhone,
        customerName,
        orderId,
        category: "orders",
      });
    }

    const msg = await addWhatsAppMessage(conv.id, {
      sender: "customer",
      type,
      content: text,
      mediaUrl,
      mediaDuration,
      status: "read",
    });

    await persistConversationToD1(conv);
    return msg;
  } catch (err) {
    console.warn("recordInboundCustomerMessage error:", err);
    return null;
  }
}

export async function recordOutboundSystemMessage(
  recipientPhone: string,
  content: string,
  type: WhatsAppMessage["type"] = "text",
  metadata?: {
    orderData?: WhatsAppMessage["orderData"];
    productData?: WhatsAppMessage["productData"];
    mediaUrl?: string;
    mediaCaption?: string;
  }
): Promise<WhatsAppMessage | null> {
  try {
    if (!recipientPhone) return null;
    await syncConversationsFromERP();

    const digits = recipientPhone.replace(/\D/g, "");
    if (!digits) return null;

    const norm10 = digits.slice(-10);
    const displayPhone = `+91 ${norm10.slice(0, 5)} ${norm10.slice(5)}`;

    // Find existing conversation by phone digits or orderId
    let conv = inMemoryConversations.find((c) => {
      const cDigits = c.customerPhone.replace(/\D/g, "");
      return (
        cDigits.endsWith(norm10) ||
        (metadata?.orderData?.orderId && c.orderId === metadata.orderData.orderId)
      );
    });

    if (!conv) {
      let customerName = displayPhone;
      let orderId = metadata?.orderData?.orderId;
      let orderStatus = metadata?.orderData?.status;
      let orderTotal = metadata?.orderData?.totalAmount;
      let paymentMethod = (metadata?.orderData?.paymentMethod?.toLowerCase() === "cod"
        ? "cod"
        : "prepaid") as any;

      try {
        const userRows = await executeD1Query<{ name: string; email: string }>(
          "SELECT name, email FROM users WHERE phone LIKE ? LIMIT 1",
          [`%${norm10}%`]
        );
        if (userRows && userRows[0]?.name) {
          customerName = userRows[0].name;
        } else {
          const ordRows = await executeD1Query<{
            customer_name: string;
            id: string;
            delivery_status: string;
            total_amount: number;
          }>(
            "SELECT customer_name, id, delivery_status, total_amount FROM orders WHERE customer_phone LIKE ? ORDER BY created_at DESC LIMIT 1",
            [`%${norm10}%`]
          );
          if (ordRows && ordRows[0]?.customer_name) {
            customerName = ordRows[0].customer_name;
            if (!orderId) {
              orderId = ordRows[0].id;
              orderStatus = ordRows[0].delivery_status;
              orderTotal = ordRows[0].total_amount;
            }
          }
        }
      } catch (e) {}

      conv = await createNewConversation({
        customerPhone: displayPhone,
        customerName,
        orderId,
        category: "orders",
      });
      if (orderStatus) conv.orderStatus = orderStatus;
      if (orderTotal) conv.orderTotal = orderTotal;
      if (paymentMethod) conv.paymentMethod = paymentMethod;
    }

    const msg = await addWhatsAppMessage(conv.id, {
      sender: "agent",
      type,
      content,
      orderData: metadata?.orderData,
      productData: metadata?.productData,
      mediaUrl: metadata?.mediaUrl,
      mediaCaption: metadata?.mediaCaption,
      status: "delivered",
    });

    await persistConversationToD1(conv);
    return msg;
  } catch (err) {
    console.warn("recordOutboundSystemMessage error:", err);
    return null;
  }
}

