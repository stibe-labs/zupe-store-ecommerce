// Admin API — WhatsApp Messages Thread & Outbound Sending
// GET /api/admin/whatsapp/messages?chatId=...
// POST /api/admin/whatsapp/messages (Send admin reply via Meta Cloud API)

import { NextRequest, NextResponse } from "next/server";
import {
  getWhatsAppChatMessages,
  sendAdminWhatsAppReply,
  normalizePhone,
} from "@/lib/whatsappChatService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId") || searchParams.get("phone") || "";

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: "chatId or phone query param is required" },
        { status: 400 }
      );
    }

    const messages = await getWhatsAppChatMessages(chatId);

    return NextResponse.json({
      success: true,
      chatId: normalizePhone(chatId),
      messages,
      count: messages.length,
    });
  } catch (err: any) {
    console.error("[Admin WA Messages GET] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load messages" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phone, message } = body;

    if (!phone || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: "Recipient phone and message text are required" },
        { status: 400 }
      );
    }

    const result = await sendAdminWhatsAppReply(phone, message);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send message via Meta WhatsApp API",
          note: "Message logged to thread. Note that Meta requires customers to initiate conversation or an approved utility template to be used outside the 24h window.",
        },
        { status: 400 }
      );
    }

    // Return the updated message thread
    const updatedMessages = await getWhatsAppChatMessages(phone);

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      messages: updatedMessages,
    });
  } catch (err: any) {
    console.error("[Admin WA Messages POST] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to dispatch message" },
      { status: 500 }
    );
  }
}

