// Turkiye Jam Internal WhatsApp Store & Messaging Logic
import { getERPOrders, ERPOrder } from "@/lib/erpStore";
import { executeD1Query } from "@/lib/d1";
import { formatToIST, formatChatListTimeIST, parseDbTimestamp } from "@/lib/istTime";
import { getRuntimeSecret } from "@/lib/pydartPay";
import type {
  ParsedInboundWhatsAppMessage,
  WhatsAppMessageMetadata,
  WhatsAppRichMessageType,
} from "@/lib/whatsappInboundParser";

export { formatToIST, formatChatListTimeIST, parseDbTimestamp };
export type { WhatsAppMessageMetadata, WhatsAppRichMessageType };

export interface WhatsAppReaction {
  emoji: string;
  by: "agent" | "customer";
}

export interface WhatsAppMessage {
  id: string;
  waMessageId?: string;
  conversationId: string;
  sender: "agent" | "customer" | "system";
  type: WhatsAppRichMessageType;
  content: string;
  mediaUrl?: string;
  mediaCaption?: string;
  mediaDuration?: number; // seconds
  metadata?: WhatsAppMessageMetadata;
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
  createdAt?: string;
}

function safeParseJson<T>(raw: unknown, fallback: T): T {
  if (!raw || typeof raw !== "string") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function buildSidebarPreviewText(msg: Partial<WhatsAppMessage>): string {
  const caption = msg.mediaCaption?.trim();
  const content = msg.content?.trim();

  switch (msg.type) {
    case "image":
      return caption ? `📷 ${caption}` : content || "📷 Photo";
    case "video":
      return caption ? `🎥 ${caption}` : content || "🎥 Video";
    case "voice":
      return content || "🎤 Voice note";
    case "sticker":
      return content || "🎨 Sticker";
    case "document":
      return `📄 ${msg.metadata?.filename || content || "Document"}`;
    case "location":
      return content || "📍 Shared Location";
    case "contacts":
      return content || "👤 Shared Contact";
    case "order":
      return content || "🛒 WhatsApp Catalog Cart";
    case "reaction":
      return content || "👍 Reaction";
    case "unsupported":
      return "📎 Restricted format (Cloud API)";
    default:
      return content || "Media";
  }
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
  category: "Orders" | "Logistics" | "Marketing" | "Support" | "Sales";
  body: string;
  variables: string[];
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: "custom_payment_link",
    title: "💳 Custom Payment Link & Invoice (മലയാളം)",
    category: "Orders",
    body: "പ്രിയപ്പെട്ട {{name}},\n\nനിങ്ങൾ തിരഞ്ഞെടുത്ത തുർക്കിയെ ജാം ഓർഡർ വിവരങ്ങൾ താഴെ നൽകുന്നു:\n\n📦 പ്രോഡക്റ്റ്: Turkiye Jam - ₹{{amount}}\n🚚 ഡെലിവറി ചാർജ്ജ്: സൗജന്യം / ₹49\n📍 ഡെലിവറി വിലാസം: {{address}}\n💰 ആകെ അടയ്ക്കേണ്ട തുക: ₹{{amount}}\n\nഓർഡർ കൺഫേം ചെയ്യാനും സുരക്ഷിതമായി UPI / GPay / PhonePe / Card വഴി പണമടയ്ക്കാനും താഴെയുള്ള ലിങ്കിൽ ക്ലിക്ക് ചെയ്യുക:\n👉 https://settler.pydart.com\n\nപെയ്മെന്റ് പൂർത്തിയായാലുടൻ ഓർഡർ പാക്ക് ചെയ്ത് അയക്കുന്നതായിരിക്കും. നന്ദി! 🍯✨",
    variables: ["name", "amount", "address"],
  },
  {
    id: "malayalam_pricing_inquiry",
    title: "Malayalam Pricing & Order Guide (മലയാളം)",
    category: "Sales",
    body: "നമസ്കാരം 😊\n*Turkiye Jam* അന്വേഷിച്ചതിന് നന്ദി!\n\nലഭ്യമായ പാക്കുകളും വിലയും 👇\n\n🔸 *2 സാഷെ — ₹899*\n🔸 *3 സാഷെ — ₹1,099*\n🔸 *4 സാഷെ — ₹1,399*\n🔸 *6 സാഷെ — ₹1,899*\n🎁 *12 + 2 സാഷെ ബോക്സ് — ₹2,899*\n(ആകെ 14 സാഷെ ലഭിക്കും!)\n\n🫙 *240g ജാർ + 2 സാഷെ ഫ്രീ — ₹2,899*\n_(നിലവിൽ സ്റ്റോക്കില്ല)_\n\n📦 ഇന്ത്യയിലുടനീളം സൗജന്യ ഡെലിവറി (Free Delivery)\n💵 Cash on Delivery (COD) ലഭ്യമാണ്\n🛵 കൊച്ചിയിൽ Porter വഴി 1 മണിക്കൂർ എക്സ്പ്രസ് ഡെലിവറി — ലഭ്യത അനുസരിച്ച്.\n\n🌐 *വെബ്‌സൈറ്റ് വഴി നേരിട്ട് ഓർഡർ ചെയ്യാൻ:*\nhttps://turkiyejam.com\n\n💬 *WhatsApp വഴി നേരിട്ട് വാങ്ങാൻ:*\nഏത് പാക്കാണ് വേണ്ടതെന്ന് അറിയിച്ച് നിങ്ങളുടെ *പേര്, പൂർണ്ണ വിലാസം, പിൻകോഡ്* ഇവിടെ അയച്ചാൽ മതിയാകും. ഞങ്ങൾ ഓർഡർ ബുക്ക് ചെയ്ത് അയച്ചു തരാം! 😊\n\n*ഏത് പാക്കാണ് താങ്കൾക്ക് വേണ്ടത്?*",
    variables: [],
  },
  {
    id: "order_confirmation_cod",
    title: "Order Confirmation Request (COD)",
    category: "Orders",
    body: "Salam {{name}}! 🌿 Thank you for ordering Turkiye Jam (Order {{order_id}}). Your Cash on Delivery order of ₹{{amount}} is ready for packing.\n\nPlease reply with *1* or click *Confirm Order* to approve dispatch to {{address}}.",
    variables: ["name", "order_id", "amount", "address"],
  },
  {
    id: "order_dispatched_awb",
    title: "Order Dispatched & Tracking Link",
    category: "Logistics",
    body: "Great news {{name}}! 🚀 Your Turkiye Jam order {{order_id}} has been dispatched via {{courier}}.\n\nAWB Tracking Number: *{{awb}}*\nTrack your package live: https://turkiyejam.com/track-order?awb={{awb}}\n\nEstimated doorstep arrival: 2-3 business days in discreet packaging.",
    variables: ["name", "order_id", "courier", "awb"],
  },
  {
    id: "ndr_reattempt_address",
    title: "NDR Delivery Reattempt Assistance",
    category: "Logistics",
    body: "Hi {{name}}, our courier partner {{courier}} attempted delivery of your Turkiye Jam order {{order_id}} today but could not reach you.\n\nWould you like us to schedule a reattempt for tomorrow morning, or would you like to update your landmark/phone number?",
    variables: ["name", "courier", "order_id"],
  },
  {
    id: "abandoned_cart_discount",
    title: "Abandoned Cart 10% Extra Discount",
    category: "Marketing",
    body: "Hi {{name}}! 🍯 We noticed you left Turkiye Jam Herbal Honey Paste in your cart.\n\nHere is an exclusive instant ₹100 discount coupon code: *TURKIYE100*.\nComplete your order here with free COD: https://turkiyejam.com/cart?discount=TURKIYE100",
    variables: ["name"],
  },
  {
    id: "dosage_instructions_guide",
    title: "Product Usage & Dosage Guide",
    category: "Support",
    body: "🌿 *Turkiye Jam Official Usage Guide*\n\n1. Take 1 sachet (or 1 level teaspoon) 30–45 minutes before bedtime.\n2. Mix with warm milk or lukewarm water, or consume directly.\n3. Drink 1–2 glasses of water afterwards.\n4. Avoid consuming on a very heavy oily stomach.\n\nFeel free to ask our Ayurvedic care specialist if you have any questions!",
    variables: [],
  },
];

// Live in-memory state: 100% sourced from real Cloudflare D1 database (zero dummy contacts)
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
                  ? formatChatListTimeIST(row.last_message_time)
                  : "Today",
                status: "delivered",
              },
              lastMessageTimestamp: row.last_message_time ? parseDbTimestamp(row.last_message_time) : Date.now(),
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
              if (row.last_message_time) {
                existing.lastMessageTimestamp = parseDbTimestamp(row.last_message_time);
                existing.lastMessage.timestamp = formatChatListTimeIST(row.last_message_time);
              }
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

          let itemsSummary = "Turkiye Jam Herbal Products";
          if (ord.items) {
            try {
              const parsed = typeof ord.items === "string" ? JSON.parse(ord.items) : ord.items;
              if (Array.isArray(parsed) && parsed.length > 0) {
                itemsSummary = parsed
                  .map((it: any) => `${it.name || "Turkiye Jam"} (x${it.quantity || 1})`)
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
              timestamp: ord.created_at ? formatChatListTimeIST(ord.created_at) : "Today",
              status: isCancelled ? "read" : "delivered",
            },
            lastMessageTimestamp: ord.created_at ? parseDbTimestamp(ord.created_at) : Date.now(),
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
      const dbMsgs: WhatsAppMessage[] = rows.map((r) => {
        const parsedMeta = safeParseJson<WhatsAppMessageMetadata | undefined>(r.metadata, undefined);
        const parsedReactions = safeParseJson<WhatsAppReaction[]>(r.reactions, []);

        return {
          id: r.id,
          waMessageId: r.wa_message_id || undefined,
          conversationId: r.conversation_id,
          sender: r.sender,
          type: (r.type || "text") as WhatsAppRichMessageType,
          content: r.content,
          mediaUrl: r.media_url || undefined,
          mediaCaption: r.media_caption || undefined,
          mediaDuration: r.media_duration || undefined,
          metadata: parsedMeta,
          orderData: parsedMeta?.orderData,
          productData: parsedMeta?.productData,
          replyTo: parsedMeta?.replyTo,
          reactions: Array.isArray(parsedReactions) ? parsedReactions : [],
          status: r.status || "delivered",
          timestamp: formatToIST(r.created_at || Date.now()),
          createdAt: r.created_at,
        };
      });
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
  const timeFormatted = formatToIST(now);
  const chatListFormatted = formatChatListTimeIST(now);

  const mergedMetadata: WhatsAppMessageMetadata = {
    ...(payload.metadata || {}),
    ...(payload.orderData ? { orderData: payload.orderData } : {}),
    ...(payload.productData ? { productData: payload.productData } : {}),
    ...(payload.replyTo ? { replyTo: payload.replyTo } : {}),
  };
  const hasMetadata = Object.keys(mergedMetadata).length > 0;

  const newMessage: WhatsAppMessage = {
    id: msgId,
    waMessageId: payload.waMessageId,
    conversationId,
    sender: payload.sender || "agent",
    type: payload.type || "text",
    content: payload.content || "",
    mediaUrl: payload.mediaUrl,
    mediaCaption: payload.mediaCaption,
    mediaDuration: payload.mediaDuration,
    metadata: hasMetadata ? mergedMetadata : undefined,
    orderData: payload.orderData,
    productData: payload.productData,
    replyTo: payload.replyTo,
    reactions: [],
    status: payload.sender === "customer" ? "read" : "sending",
    timestamp: timeFormatted,
    createdAt: now.toISOString(),
  };

  if (!inMemoryMessages[conversationId]) {
    inMemoryMessages[conversationId] = [];
  }
  inMemoryMessages[conversationId].push(newMessage);

  // Update conversation last message
  const convIndex = inMemoryConversations.findIndex((c) => c.id === conversationId);
  if (convIndex !== -1) {
    inMemoryConversations[convIndex].lastMessage = {
      text: buildSidebarPreviewText(newMessage),
      sender: newMessage.sender,
      timestamp: chatListFormatted,
      status: newMessage.status,
    };
    inMemoryConversations[convIndex].lastMessageTimestamp = now.getTime();
    if (newMessage.sender === "customer") {
      inMemoryConversations[convIndex].unreadCount += 1;
    }
  }

  const metadataJson = hasMetadata ? JSON.stringify(mergedMetadata) : null;

  // Persist directly to real Cloudflare D1 (with legacy-column fallback)
  try {
    const inserted = await executeD1Query(
      `INSERT INTO whatsapp_messages (id, conversation_id, sender, type, content, media_url, media_caption, media_duration, status, metadata, wa_message_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
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
        metadataJson,
        newMessage.waMessageId || null,
      ]
    );
    if (inserted === null) {
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
    }
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

export async function attachOutboundWaMessageId(
  messageId: string,
  waMessageId: string
): Promise<void> {
  if (!messageId || !waMessageId) return;
  for (const convId in inMemoryMessages) {
    const msg = inMemoryMessages[convId]?.find((m) => m.id === messageId);
    if (msg) {
      msg.waMessageId = waMessageId;
      break;
    }
  }
  try {
    await executeD1Query(
      "UPDATE whatsapp_messages SET wa_message_id = ? WHERE id = ?",
      [waMessageId, messageId]
    );
  } catch (e) {
    console.warn("D1 attachOutboundWaMessageId warning:", e);
  }
}

export async function updateMessageStatusByWaId(
  waMessageId: string,
  status: "sent" | "delivered" | "read"
): Promise<boolean> {
  if (!waMessageId) return false;
  let matched = false;
  for (const convId in inMemoryMessages) {
    const msg = inMemoryMessages[convId]?.find((m) => m.waMessageId === waMessageId);
    if (msg) {
      msg.status = status;
      matched = true;
      break;
    }
  }
  try {
    const existing = await executeD1Query<{ id: string }>(
      "SELECT id FROM whatsapp_messages WHERE wa_message_id = ? LIMIT 1",
      [waMessageId]
    );
    if (existing && existing.length > 0) {
      await executeD1Query(
        "UPDATE whatsapp_messages SET status = ? WHERE wa_message_id = ?",
        [status, waMessageId]
      );
      matched = true;
    }
  } catch (e) {
    console.warn("D1 updateMessageStatusByWaId warning:", e);
  }
  return matched;
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
  let updatedReactions: WhatsAppReaction[] | null = null;

  const list = inMemoryMessages[conversationId];
  const memMsg = list?.find((m) => m.id === messageId || m.waMessageId === messageId);
  if (memMsg) {
    if (!memMsg.reactions) memMsg.reactions = [];
    const existing = memMsg.reactions.findIndex((r) => r.by === by);
    if (!emoji) {
      if (existing !== -1) memMsg.reactions.splice(existing, 1);
    } else if (existing !== -1) {
      if (memMsg.reactions[existing].emoji === emoji && by === "agent") {
        memMsg.reactions.splice(existing, 1);
      } else {
        memMsg.reactions[existing].emoji = emoji;
      }
    } else {
      memMsg.reactions.push({ emoji, by });
    }
    updatedReactions = [...memMsg.reactions];
  }

  try {
    if (!updatedReactions) {
      const rows = await executeD1Query<{ reactions: string | null }>(
        "SELECT reactions FROM whatsapp_messages WHERE id = ? OR wa_message_id = ? LIMIT 1",
        [messageId, messageId]
      );
      if (rows && rows.length > 0) {
        const current = safeParseJson<WhatsAppReaction[]>(rows[0].reactions, []);
        const existing = current.findIndex((r) => r.by === by);
        if (!emoji) {
          if (existing !== -1) current.splice(existing, 1);
        } else if (existing !== -1) {
          if (current[existing].emoji === emoji && by === "agent") {
            current.splice(existing, 1);
          } else {
            current[existing].emoji = emoji;
          }
        } else {
          current.push({ emoji, by });
        }
        updatedReactions = current;
      }
    }

    if (updatedReactions) {
      await executeD1Query(
        "UPDATE whatsapp_messages SET reactions = ? WHERE id = ? OR wa_message_id = ?",
        [JSON.stringify(updatedReactions), messageId, messageId]
      );
    }
  } catch (e) {
    console.warn("D1 addMessageReaction warning:", e);
  }
}

export async function applyInboundWhatsAppReaction(
  conversationId: string,
  targetWaMessageId: string,
  emoji: string
): Promise<boolean> {
  if (!targetWaMessageId) return false;
  try {
    const rows = await executeD1Query<{ id: string; reactions: string | null }>(
      "SELECT id, reactions FROM whatsapp_messages WHERE wa_message_id = ? LIMIT 1",
      [targetWaMessageId]
    );
    if (!rows || rows.length === 0) return false;

    const targetId = rows[0].id;
    const current = safeParseJson<WhatsAppReaction[]>(rows[0].reactions, []);
    const existingIdx = current.findIndex((r) => r.by === "customer");
    if (!emoji) {
      if (existingIdx !== -1) current.splice(existingIdx, 1);
    } else if (existingIdx !== -1) {
      current[existingIdx].emoji = emoji;
    } else {
      current.push({ emoji, by: "customer" });
    }

    await executeD1Query(
      "UPDATE whatsapp_messages SET reactions = ? WHERE id = ?",
      [JSON.stringify(current), targetId]
    );

    const list = inMemoryMessages[conversationId];
    const memTarget = list?.find((m) => m.id === targetId || m.waMessageId === targetWaMessageId);
    if (memTarget) {
      memTarget.reactions = current;
    }

    return true;
  } catch (e) {
    console.warn("applyInboundWhatsAppReaction warning:", e);
    return false;
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

  // Sync into CRM leads table with deduplication
  if (norm10 && norm10.length === 10) {
    try {
      const leadId = `lead_${norm10}`;
      await executeD1Query(
        `INSERT INTO crm_leads (
          id, name, phone, email, source, status, temperature, potential_value, tags, notes, converted_order_id, last_contacted_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'whatsapp', 'new', 'warm', 899, ?, 'WhatsApp conversation initiated', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          name = COALESCE(excluded.name, crm_leads.name),
          last_contacted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP`,
        [
          leadId,
          newConv.customerName,
          `+91 ${norm10}`,
          newConv.customerEmail || "",
          JSON.stringify(["whatsapp", newConv.category || "inquiry"]),
          newConv.orderId || null,
        ]
      );
    } catch (e) {
      // Non-fatal
    }
  }

  return newConv;
}

// Meta WhatsApp Cloud API Direct Dispatch
export async function sendMetaCloudApiMessage(
  recipientPhone: string,
  messageText: string
): Promise<{ success: boolean; data?: any; waMessageId?: string; error?: string }> {
  const token =
    (await getRuntimeSecret("WHATSAPP_TOKEN")) ||
    "EAATwm2s3GMYBS7KhJQ2MDiAyAGFS6OwFHiXZAFvfPlyMUg4Jf3wV5e8TPj0PKC8rkE6x9vkzuZANllpjCUHvJaXYAZB6Ursyzc26l0SDJrBEEPJYB4ZB8rjEQ2qTSBI6tEYgZBOTJ47DAmVNAhuyaQAoryvhYiO6vRpAFdE0H61gFXCkwttX5sZCCSyR20kCwOOQZDZD";
  const phoneId = (await getRuntimeSecret("WHATSAPP_PHONE_NUMBER_ID")) || "1477900698733187";

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
      signal: AbortSignal.timeout(8000),
    });

    const data = await res.json();
    if (res.ok) {
      const waMessageId =
        Array.isArray(data?.messages) && data.messages[0]?.id ? String(data.messages[0].id) : undefined;
      return { success: true, data, waMessageId };
    }
    return { success: false, error: data.error?.message || "Failed to send Meta Cloud API message" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Smart Simulated Customer Responses for interactive testing
export function generateSmartCustomerReply(
  customerName: string,
  lastAgentMessage: string,
  orderId?: string
): string {
  const lower = lastAgentMessage.toLowerCase();

  if (lower.includes("confirm") || lower.includes("cod") || lower.includes("ready for packing")) {
    return `Yes please! I confirm my order ${orderId ? "#" + orderId.substring(0, 8) : ""}. Please make sure the packing is completely discreet. When can I expect it to arrive?`;
  }
  if (lower.includes("track") || lower.includes("awb") || lower.includes("dispatched") || lower.includes("shiprocket")) {
    return `Got the tracking number! Will the delivery agent call me before arriving? I'm usually home after 2 PM.`;
  }
  if (lower.includes("ndr") || lower.includes("reattempt") || lower.includes("could not reach")) {
    return `Apologies, I was in a meeting earlier! Yes, please schedule a delivery reattempt for tomorrow morning. You can reach my alternate number as well.`;
  }
  if (lower.includes("coupon") || lower.includes("discount") || lower.includes("turkiye100") || lower.includes("save10")) {
    return `Thank you so much for the discount code! Ordering right now with Cash on Delivery 🙌`;
  }
  if (lower.includes("dosage") || lower.includes("milk") || lower.includes("how to use") || lower.includes("instructions")) {
    return `Understood! So 1 teaspoon with warm milk before sleep. Thank you for the clear instructions!`;
  }
  if (lower.includes("cancel")) {
    return `Okay, understood. Thank you for checking with me first!`;
  }

  const genericReplies = [
    `Thanks for the quick response! Really excited to try Turkiye Jam.`,
    `Noted! Please let me know once it is handed over to the courier.`,
    `Great service! Looking forward to receiving the package.`,
    `Thank you team Turkiye Jam! Have a wonderful day.`,
  ];
  return genericReplies[Math.floor(Math.random() * genericReplies.length)];
}

export async function recordInboundCustomerMessage(
  phoneOrParsed: string | ParsedInboundWhatsAppMessage,
  legacyText?: string,
  legacyType: WhatsAppMessage["type"] = "text",
  legacyMediaUrl?: string,
  legacyMediaDuration?: number
): Promise<WhatsAppMessage | null> {
  try {
    const parsed: ParsedInboundWhatsAppMessage =
      typeof phoneOrParsed === "string"
        ? {
            from: phoneOrParsed,
            sender: "customer",
            type: legacyType,
            content: legacyText || "",
            mediaUrl: legacyMediaUrl,
          }
        : phoneOrParsed;

    const phone = parsed.from;
    if (!phone) return null;

    // Idempotent deduplication against Meta webhook retries
    if (parsed.waMessageId) {
      try {
        const dupRows = await executeD1Query<{ id: string }>(
          "SELECT id FROM whatsapp_messages WHERE wa_message_id = ? LIMIT 1",
          [parsed.waMessageId]
        );
        if (dupRows && dupRows.length > 0) {
          return null;
        }
      } catch {
        // Non-fatal if column isn't present in local SQLite
      }
    }

    await syncConversationsFromERP();

    const digits = phone.replace(/\D/g, "");
    if (!digits) return null;
    const norm10 = digits.slice(-10);
    const displayPhone =
      norm10.length === 10
        ? `+91 ${norm10.slice(0, 5)} ${norm10.slice(5)}`
        : phone.startsWith("+")
        ? phone
        : `+${digits}`;

    let conv = inMemoryConversations.find((c) => {
      const cDigits = c.customerPhone.replace(/\D/g, "");
      return cDigits.endsWith(norm10);
    });

    if (!conv) {
      let customerName = parsed.profileName || displayPhone;
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
    } else if (parsed.profileName) {
      const isPlaceholderName =
        conv.customerName.includes("(") || /^\+?\d[\d\s-]+$/.test(conv.customerName.trim());
      if (isPlaceholderName) {
        conv.customerName = parsed.profileName;
      }
    }

    // Handle inbound reaction directly on target message when found in history
    if (parsed.type === "reaction" && parsed.metadata?.reaction?.targetWaMessageId) {
      const applied = await applyInboundWhatsAppReaction(
        conv.id,
        parsed.metadata.reaction.targetWaMessageId,
        parsed.metadata.reaction.emoji
      );
      if (applied) {
        await persistConversationToD1(conv);
        return null;
      }
    }

    // Resolve quoted reply context if Meta supplied context.id
    let replyTo: WhatsAppMessage["replyTo"] = undefined;
    if (parsed.metadata?.quotedWaMessageId) {
      try {
        const quotedRows = await executeD1Query<{ id: string; sender: string; content: string }>(
          "SELECT id, sender, content FROM whatsapp_messages WHERE wa_message_id = ? LIMIT 1",
          [parsed.metadata.quotedWaMessageId]
        );
        if (quotedRows && quotedRows.length > 0) {
          replyTo = {
            id: quotedRows[0].id,
            sender: quotedRows[0].sender === "agent" ? "You" : conv.customerName,
            snippet: (quotedRows[0].content || "Quoted message").slice(0, 140),
          };
        }
      } catch {
        // Non-fatal
      }
    }

    const msg = await addWhatsAppMessage(conv.id, {
      waMessageId: parsed.waMessageId,
      sender: parsed.sender || "customer",
      type: parsed.type,
      content: parsed.content,
      mediaUrl: parsed.mediaUrl,
      mediaCaption: parsed.mediaCaption,
      mediaDuration: legacyMediaDuration,
      metadata: parsed.metadata,
      replyTo,
      status: "read",
    });

    await persistConversationToD1(conv);

    // Sync into CRM leads with deduplication
    try {
      const leadId = `lead_${norm10}`;
      const leadNotes = `[WhatsApp Inquiry]: ${(parsed.content || "").slice(0, 120)}`;
      await executeD1Query(
        `INSERT INTO crm_leads (
          id, name, phone, email, source, status, temperature, potential_value, tags, notes, converted_order_id, last_contacted_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'whatsapp', 'new', 'hot', 899, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          name = CASE WHEN crm_leads.name LIKE '+%' OR crm_leads.name LIKE 'Customer (%' THEN excluded.name ELSE crm_leads.name END,
          notes = excluded.notes,
          last_contacted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP`,
        [
          leadId,
          conv.customerName,
          `+91 ${norm10}`,
          conv.customerEmail || "",
          JSON.stringify(["whatsapp", "inbound_inquiry"]),
          leadNotes,
          conv.orderId || null,
        ]
      );
    } catch (leadErr) {
      // Non-fatal
    }

    // Real-time WhatsApp Notification to Admin (+91 7356765036)
    try {
      const { notifyAdminIncomingWhatsAppMessage } = await import("@/lib/adminNotification");
      await notifyAdminIncomingWhatsAppMessage({
        customerName: conv.customerName,
        customerPhone: conv.customerPhone,
        content: parsed.content,
        messageType: parsed.type,
      });
    } catch (notifErr) {
      console.warn("Failed to dispatch admin WhatsApp alert:", notifErr);
    }

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

    // Sync into CRM leads with deduplication
    try {
      const leadId = `lead_${norm10}`;
      const leadNotes = `[WhatsApp Outbound]: ${(content || "").slice(0, 100)}`;
      await executeD1Query(
        `INSERT INTO crm_leads (
          id, name, phone, email, source, status, temperature, potential_value, tags, notes, converted_order_id, last_contacted_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'whatsapp', 'contacted', 'warm', 899, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          last_contacted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP`,
        [
          leadId,
          conv.customerName,
          `+91 ${norm10}`,
          conv.customerEmail || "",
          JSON.stringify(["whatsapp", "outbound_contact"]),
          leadNotes,
          conv.orderId || null,
        ]
      );
    } catch (leadErr) {
      // Non-fatal
    }
    return msg;
  } catch (err) {
    console.warn("recordOutboundSystemMessage error:", err);
    return null;
  }
}
