// Admin API — WhatsApp Conversations Management
// GET /api/admin/whatsapp/chats
// POST /api/admin/whatsapp/chats (Sync orders / start new chat)
// PATCH /api/admin/whatsapp/chats (Pin / Archive / Unread)

import { NextRequest, NextResponse } from "next/server";
import {
  getWhatsAppChatsList,
  syncCustomerOrdersToWhatsAppChats,
  normalizePhone,
  recordWhatsAppMessage,
} from "@/lib/whatsappChatService";
import { executeD1Query } from "@/lib/d1";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const filter = (searchParams.get("filter") || "all") as
      | "all"
      | "unread"
      | "pinned"
      | "archived";

    const chats = await getWhatsAppChatsList({ search, filter });

    // If database is brand new and has 0 chats, auto-sync recent customer orders
    if (chats.length === 0 && !search && filter === "all") {
      await syncCustomerOrdersToWhatsAppChats();
      const syncedChats = await getWhatsAppChatsList({ search, filter });
      return NextResponse.json({
        success: true,
        chats: syncedChats,
        count: syncedChats.length,
      });
    }

    return NextResponse.json({
      success: true,
      chats,
      count: chats.length,
    });
  } catch (err: any) {
    console.error("[Admin WA Chats GET] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load chats" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "create";

    if (action === "sync_orders") {
      const result = await syncCustomerOrdersToWhatsAppChats();
      const updatedChats = await getWhatsAppChatsList();
      return NextResponse.json({
        success: true,
        message: `Synced ${result.synced} customer orders into WhatsApp conversations`,
        synced: result.synced,
        chats: updatedChats,
      });
    }

    // Start a new conversation manually with a phone number
    if (body.phone) {
      const phoneDigits = normalizePhone(body.phone);
      if (!phoneDigits || phoneDigits.length < 10) {
        return NextResponse.json(
          { success: false, error: "Please enter a valid phone number" },
          { status: 400 }
        );
      }

      const initialMessage = body.initialMessage || "Chat created by administrator";
      await recordWhatsAppMessage({
        phone: phoneDigits,
        customerName: body.customerName || null,
        sender: "admin",
        content: initialMessage,
        status: "delivered",
      });

      const updatedChats = await getWhatsAppChatsList();
      return NextResponse.json({
        success: true,
        chatId: phoneDigits,
        chats: updatedChats,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action or parameters" },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("[Admin WA Chats POST] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Operation failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { chatId, isPinned, isArchived, markRead } = body;

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: "chatId is required" },
        { status: 400 }
      );
    }

    const phoneDigits = normalizePhone(chatId);

    if (typeof isPinned === "boolean") {
      await executeD1Query(
        `UPDATE whatsapp_chats SET is_pinned = ?, updated_at = ? WHERE id = ?`,
        [isPinned ? 1 : 0, new Date().toISOString(), phoneDigits]
      );
    }

    if (typeof isArchived === "boolean") {
      await executeD1Query(
        `UPDATE whatsapp_chats SET is_archived = ?, updated_at = ? WHERE id = ?`,
        [isArchived ? 1 : 0, new Date().toISOString(), phoneDigits]
      );
    }

    if (markRead === true) {
      await executeD1Query(
        `UPDATE whatsapp_chats SET unread_count = 0, updated_at = ? WHERE id = ?`,
        [new Date().toISOString(), phoneDigits]
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Admin WA Chats PATCH] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Update failed" },
      { status: 500 }
    );
  }
}
