import { NextRequest, NextResponse } from "next/server";
import {
  getWhatsAppConversations,
  getWhatsAppConversationById,
  getWhatsAppMessages,
  addWhatsAppMessage,
  markWhatsAppConversationRead,
  togglePinConversation,
  addMessageReaction,
  deleteWhatsAppMessage,
  createNewConversation,
  sendMetaCloudApiMessage,
  generateSmartCustomerReply,
  updateMessageStatus,
  clearAllWhatsAppChats,
  WHATSAPP_TEMPLATES,
} from "@/lib/whatsappStore";
import { updateERPOrder } from "@/lib/erpStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "conversations";
    const filter = searchParams.get("filter") || "all";
    const search = searchParams.get("search") || "";
    const conversationId = searchParams.get("conversationId") || "";

    if (action === "conversations") {
      const conversations = await getWhatsAppConversations(filter, search);
      return NextResponse.json({ success: true, conversations });
    }

    if (action === "messages" && conversationId) {
      const messages = await getWhatsAppMessages(conversationId);
      const conversation = await getWhatsAppConversationById(conversationId);
      return NextResponse.json({ success: true, messages, conversation });
    }

    if (action === "templates") {
      return NextResponse.json({ success: true, templates: WHATSAPP_TEMPLATES });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("WhatsApp API GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "send_message") {
      const { conversationId, content, type, orderData, productData, mediaUrl, mediaCaption, mediaDuration, replyTo } =
        body;

      if (!conversationId) {
        return NextResponse.json({ success: false, error: "Missing conversationId" }, { status: 400 });
      }

      // Add message as 'agent'
      const message = await addWhatsAppMessage(conversationId, {
        sender: "agent",
        type: type || "text",
        content,
        orderData,
        productData,
        mediaUrl,
        mediaCaption,
        mediaDuration,
        replyTo,
        status: "sending",
      });

      return NextResponse.json({ success: true, message });
    }

    if (action === "update_status") {
      const { messageId, status } = body;
      if (messageId && status) {
        await updateMessageStatus(messageId, status);
        return NextResponse.json({ success: true });
      }
    }

    if (action === "toggle_pin") {
      const { conversationId } = body;
      if (conversationId) {
        const isPinned = await togglePinConversation(conversationId);
        return NextResponse.json({ success: true, isPinned });
      }
      return NextResponse.json({ success: false, error: "Missing conversationId" }, { status: 400 });
    }

    if (action === "simulate_reply") {
      const { conversationId, customPrompt } = body;
      const conv = await getWhatsAppConversationById(conversationId);
      if (!conv) {
        return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
      }

      const replyContent =
        customPrompt ||
        generateSmartCustomerReply(conv.customerName, conv.lastMessage?.text || "", conv.orderId);

      const customerMsg = await addWhatsAppMessage(conversationId, {
        sender: "customer",
        type: "text",
        content: replyContent,
        status: "read",
      });

      return NextResponse.json({ success: true, message: customerMsg });
    }

    if (action === "create_conversation") {
      const { customerPhone, customerName, customerEmail, orderId, category } = body;
      if (!customerPhone || !customerName) {
        return NextResponse.json(
          { success: false, error: "Phone and Name are required" },
          { status: 400 }
        );
      }

      const conv = await createNewConversation({
        customerPhone,
        customerName,
        customerEmail,
        orderId,
        category,
      });

      return NextResponse.json({ success: true, conversation: conv });
    }

    if (action === "react") {
      const { conversationId, messageId, emoji, by } = body;
      await addMessageReaction(conversationId, messageId, emoji, by || "agent");
      return NextResponse.json({ success: true });
    }

    if (action === "toggle_pin") {
      const { conversationId } = body;
      const isPinned = await togglePinConversation(conversationId);
      return NextResponse.json({ success: true, isPinned });
    }

    if (action === "delete_message") {
      const { conversationId, messageId } = body;
      await deleteWhatsAppMessage(conversationId, messageId);
      return NextResponse.json({ success: true });
    }

    if (action === "send_live_meta") {
      const { recipientPhone, messageText, messageId } = body;
      const result = await sendMetaCloudApiMessage(recipientPhone, messageText);
      if (result.success && messageId) {
        await updateMessageStatus(messageId, "delivered");
      }
      return NextResponse.json(result);
    }

    if (action === "clear_all_chats") {
      await clearAllWhatsAppChats();
      return NextResponse.json({ success: true, message: "All WhatsApp chats and history cleared successfully" });
    }

    return NextResponse.json({ success: false, error: "Unsupported action" }, { status: 400 });
  } catch (error: any) {
    console.error("WhatsApp API POST error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "mark_read") {
      const { conversationId } = body;
      if (conversationId) {
        await markWhatsAppConversationRead(conversationId);
      }
      return NextResponse.json({ success: true });
    }

    if (action === "toggle_pin") {
      const { conversationId } = body;
      if (conversationId) {
        const isPinned = await togglePinConversation(conversationId);
        return NextResponse.json({ success: true, isPinned });
      }
      return NextResponse.json({ success: false, error: "Missing conversationId" }, { status: 400 });
    }

    if (action === "update_order") {
      const { orderId, deliveryStatus, paymentStatus } = body;
      if (orderId) {
        await updateERPOrder(orderId, {
          delivery_status: deliveryStatus,
          payment_status: paymentStatus,
        });
        return NextResponse.json({ success: true, orderId, deliveryStatus });
      }
    }

    return NextResponse.json({ success: false, error: "Unsupported action" }, { status: 400 });
  } catch (error: any) {
    console.error("WhatsApp API PUT error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

