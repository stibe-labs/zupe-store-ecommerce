import { NextRequest, NextResponse } from "next/server";
import { executeD1Query } from "@/lib/d1";
import { normalizePhoneNumber } from "@/lib/whatsappOtp";
import { sendAbandonedCartWhatsApp } from "@/lib/whatsappOrderConfirmation";

export const dynamic = "force-dynamic";

export interface AbandonedCheckoutRecord {
  id: string;
  customer_name?: string;
  customer_phone: string;
  customer_email?: string;
  items: any[];
  total_amount: number;
  shipping_address?: string;
  city?: string;
  postal_code?: string;
  recovery_token: string;
  status: "abandoned" | "recovered" | "expired";
  recovered_order_id?: string;
  whatsapp_sent_count: number;
  last_whatsapp_sent_at?: string;
  created_at: string;
  updated_at: string;
}

// In-memory fallback for local development or D1 failover
let inMemoryAbandoned: AbandonedCheckoutRecord[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer_name,
      customer_phone,
      customer_email,
      items,
      total_amount,
      shipping_address,
      city,
      postal_code,
      is_backout,
      action,
    } = body;

    const { digits, isValid } = normalizePhoneNumber(customer_phone || "");

    // If customer emptied their cart or removed all products, delete the abandoned session
    if (isValid && (action === "clear_empty" || (Array.isArray(items) && items.length === 0))) {
      await executeD1Query(
        "DELETE FROM abandoned_checkouts WHERE customer_phone = ? AND status = 'abandoned'",
        [digits]
      );
      inMemoryAbandoned = inMemoryAbandoned.filter(
        (a) => !(a.customer_phone === digits && a.status === "abandoned")
      );
      return NextResponse.json({
        success: true,
        message: "Cart emptied: abandoned session removed",
      });
    }

    if (!isValid || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Valid phone and at least one item required" },
        { status: 400 }
      );
    }

    const itemsJson = JSON.stringify(items);
    const amount = Number(total_amount) || 0;
    const now = new Date().toISOString();

    const sourceVal = body.source || (is_backout ? "checkout" : "cart");

    // Check if there is an existing abandoned checkout for this phone in 'abandoned' status
    let existingId: string | null = null;
    let existingSentCount = 0;
    let existingLastSentAt: string | null = null;
    let recoveryToken: string = `rec_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

    try {
      const existing = await executeD1Query<any>(
        "SELECT id, recovery_token, whatsapp_sent_count, last_whatsapp_sent_at FROM abandoned_checkouts WHERE customer_phone = ? AND status = 'abandoned' ORDER BY created_at DESC LIMIT 1",
        [digits]
      );
      if (existing && existing.length > 0 && existing[0]?.id) {
        existingId = existing[0].id;
        recoveryToken = existing[0].recovery_token || recoveryToken;
        existingSentCount = Number(existing[0].whatsapp_sent_count) || 0;
        existingLastSentAt = existing[0].last_whatsapp_sent_at || null;
      }
    } catch (e) {
      const mem = inMemoryAbandoned.find(
        (a) => a.customer_phone === digits && a.status === "abandoned"
      );
      if (mem) {
        existingId = mem.id;
        recoveryToken = mem.recovery_token;
        existingSentCount = mem.whatsapp_sent_count || 0;
        existingLastSentAt = mem.last_whatsapp_sent_at || null;
      }
    }

    const recoveryUrl = `https://turkiyejam.stibelabs.workers.dev/checkout?recover=${encodeURIComponent(recoveryToken)}`;

    if (existingId) {
      // Update existing record
      try {
        await executeD1Query(
          `UPDATE abandoned_checkouts
           SET customer_name = COALESCE(?, customer_name),
               customer_email = COALESCE(?, customer_email),
               items = ?,
               total_amount = ?,
               shipping_address = COALESCE(?, shipping_address),
               city = COALESCE(?, city),
               postal_code = COALESCE(?, postal_code),
               source = COALESCE(?, source),
               updated_at = ?
           WHERE id = ?`,
          [
            customer_name || null,
            customer_email || null,
            itemsJson,
            amount,
            shipping_address || null,
            city || null,
            postal_code || null,
            sourceVal,
            now,
            existingId,
          ]
        );
      } catch (e) {
        const idx = inMemoryAbandoned.findIndex((a) => a.id === existingId);
        if (idx !== -1) {
          inMemoryAbandoned[idx] = {
            ...inMemoryAbandoned[idx],
            customer_name: customer_name || inMemoryAbandoned[idx].customer_name,
            items,
            total_amount: amount,
            updated_at: now,
          };
        }
      }

      // If customer backed out and hasn't received a WhatsApp recovery message recently
      if (is_backout) {
        const isEligible =
          existingSentCount === 0 ||
          (existingLastSentAt && Date.now() - new Date(existingLastSentAt).getTime() > 30 * 60 * 1000);

        if (isEligible) {
          try {
            const sent = await sendAbandonedCartWhatsApp({
              customerName: customer_name,
              customerPhone: digits,
              items: items.map((it: any) => ({
                name: it.name || it.product_name || "Cart Product",
                quantity: Number(it.quantity || 1),
                price: Number(it.price || it.unit_price || 0),
              })),
              totalAmount: amount,
              recoveryUrl,
              source: "checkout",
            });
            if (sent) {
              await executeD1Query(
                "UPDATE abandoned_checkouts SET whatsapp_sent_count = whatsapp_sent_count + 1, last_whatsapp_sent_at = CURRENT_TIMESTAMP WHERE id = ?",
                [existingId]
              );
            }
          } catch (e) {
            console.warn("Auto backout WA error:", e);
          }
        }
      }

      return NextResponse.json({
        success: true,
        action: "updated",
        id: existingId,
        recovery_token: recoveryToken,
        recovery_url: recoveryUrl,
        whatsapp_auto_sent: Boolean(is_backout && existingSentCount === 0),
      });
    }

    // Insert new abandoned checkout
    const newId = `abn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    try {
      await executeD1Query(
        `INSERT INTO abandoned_checkouts (
           id, customer_name, customer_phone, customer_email,
           items, total_amount, shipping_address, city, postal_code,
           recovery_token, status, source, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'abandoned', ?, ?, ?)`,
        [
          newId,
          customer_name || null,
          digits,
          customer_email || null,
          itemsJson,
          amount,
          shipping_address || null,
          city || null,
          postal_code || null,
          recoveryToken,
          sourceVal,
          now,
          now,
        ]
      );
    } catch (e) {
      inMemoryAbandoned.unshift({
        id: newId,
        customer_name,
        customer_phone: digits,
        customer_email,
        items,
        total_amount: amount,
        shipping_address,
        city,
        postal_code,
        recovery_token: recoveryToken,
        status: "abandoned",
        whatsapp_sent_count: 0,
        created_at: now,
        updated_at: now,
      });
    }

    // Automatically send recovery WhatsApp if created via exit / backout
    if (is_backout) {
      try {
        const sent = await sendAbandonedCartWhatsApp({
          customerName: customer_name,
          customerPhone: digits,
          items: items.map((it: any) => ({
            name: it.name || it.product_name || "Cart Product",
            quantity: Number(it.quantity || 1),
            price: Number(it.price || it.unit_price || 0),
          })),
          totalAmount: amount,
          recoveryUrl,
          source: "checkout",
        });
        if (sent) {
          await executeD1Query(
            "UPDATE abandoned_checkouts SET whatsapp_sent_count = whatsapp_sent_count + 1, last_whatsapp_sent_at = CURRENT_TIMESTAMP WHERE id = ?",
            [newId]
          );
        }
      } catch (e) {
        console.warn("Auto backout WA insert error:", e);
      }
    }

    return NextResponse.json({
      success: true,
      action: "created",
      id: newId,
      recovery_token: recoveryToken,
      recovery_url: recoveryUrl,
      whatsapp_auto_sent: Boolean(is_backout),
    });
  } catch (err: any) {
    console.error("Error in abandoned checkout track:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || "";

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Missing recovery token" },
        { status: 400 }
      );
    }

    try {
      const rows = await executeD1Query<any>(
        "SELECT * FROM abandoned_checkouts WHERE recovery_token = ? LIMIT 1",
        [token]
      );
      if (rows && rows.length > 0) {
        const row = rows[0];
        let items = row.items;
        if (typeof items === "string") {
          try { items = JSON.parse(items); } catch { items = []; }
        }
        return NextResponse.json({
          success: true,
          checkout: { ...row, items: Array.isArray(items) ? items : [] },
        });
      }
    } catch (e) {}

    const mem = inMemoryAbandoned.find((a) => a.recovery_token === token);
    if (mem) {
      return NextResponse.json({ success: true, checkout: mem });
    }

    return NextResponse.json({ success: false, error: "Abandoned checkout not found" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
