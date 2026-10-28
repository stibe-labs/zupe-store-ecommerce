import { NextRequest, NextResponse } from "next/server";
import { executeD1Query } from "@/lib/d1";
import { sendAbandonedCartWhatsApp } from "@/lib/whatsappOrderConfirmation";
import { processOverdueAbandonedCarts } from "@/lib/abandonedCartService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Automatically trigger overdue 30-minute abandoned cart checks
    try {
      await processOverdueAbandonedCarts();
    } catch (e) {
      console.warn("Overdue cart auto-processor warning:", e);
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";

    let query = "SELECT * FROM abandoned_checkouts ORDER BY created_at DESC LIMIT 100";
    let params: any[] = [];

    if (status !== "all") {
      query = "SELECT * FROM abandoned_checkouts WHERE status = ? ORDER BY created_at DESC LIMIT 100";
      params = [status];
    }

    const rows = (await executeD1Query<any>(query, params)) || [];

    const parsed = rows.map((r: any) => {
      let items = r.items;
      if (typeof items === "string") {
        try { items = JSON.parse(items); } catch { items = []; }
      }
      return {
        ...r,
        items: Array.isArray(items) ? items : [],
        total_amount: Number(r.total_amount) || 0,
        recovery_url: `https://zupe-store.stibelabs.workers.dev/checkout?recover=${encodeURIComponent(r.recovery_token)}`,
      };
    });

    // Summary stats
    const totalCount = parsed.length;
    const abandonedCount = parsed.filter((p: any) => p.status === "abandoned").length;
    const recoveredCount = parsed.filter((p: any) => p.status === "recovered").length;
    const potentialRevenue = parsed
      .filter((p: any) => p.status === "abandoned")
      .reduce((sum: number, p: any) => sum + (Number(p.total_amount) || 0), 0);
    const recoveredRevenue = parsed
      .filter((p: any) => p.status === "recovered")
      .reduce((sum: number, p: any) => sum + (Number(p.total_amount) || 0), 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalCount,
        abandonedCount,
        recoveredCount,
        potentialRevenue,
        recoveredRevenue,
        recoveryRate: totalCount > 0 ? Math.round((recoveredCount / totalCount) * 100) : 0,
      },
      checkouts: parsed,
    });
  } catch (err: any) {
    console.error("Error in admin abandoned checkouts GET:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action } = body;

    // Bulk broadcast reminder to all pending abandoned carts
    if (action === "remind_all") {
      const rows = (await executeD1Query<any>(
        "SELECT * FROM abandoned_checkouts WHERE status = 'abandoned' AND whatsapp_sent_count < 3 ORDER BY created_at DESC LIMIT 50"
      )) || [];

      let sentCount = 0;
      const now = new Date().toISOString();

      for (const row of rows) {
        // Skip if message was sent in the last 1 hour
        if (row.last_whatsapp_sent_at) {
          const diffMs = Date.now() - new Date(row.last_whatsapp_sent_at).getTime();
          if (diffMs < 60 * 60 * 1000) continue;
        }

        let items = row.items;
        if (typeof items === "string") {
          try { items = JSON.parse(items); } catch { items = []; }
        }

        const recoveryUrl = `https://zupe-store.stibelabs.workers.dev/checkout?recover=${encodeURIComponent(row.recovery_token)}`;
        const sent = await sendAbandonedCartWhatsApp({
          customerName: row.customer_name || "",
          customerPhone: row.customer_phone,
          items: (items || []).map((it: any) => ({
            name: it.name || it.product_name || "Cart Product",
            quantity: Number(it.quantity || 1),
            price: Number(it.price || it.unit_price || 0),
          })),
          totalAmount: Number(row.total_amount) || 0,
          recoveryUrl,
          source: (row.source === "cart" ? "cart" : "checkout") as "checkout" | "cart",
        });

        if (sent) {
          sentCount++;
          await executeD1Query(
            `UPDATE abandoned_checkouts
             SET whatsapp_sent_count = whatsapp_sent_count + 1,
                 last_whatsapp_sent_at = ?
             WHERE id = ?`,
            [now, row.id]
          );
        }
      }

      return NextResponse.json({
        success: true,
        sentCount,
        message: sentCount > 0 ? `Sent recovery reminders to ${sentCount} customer${sentCount === 1 ? "" : "s"}!` : "All abandoned customers already received recent reminders.",
      });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing abandoned checkout ID" }, { status: 400 });
    }

    const rows = await executeD1Query<any>(
      "SELECT * FROM abandoned_checkouts WHERE id = ? LIMIT 1",
      [id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, error: "Abandoned checkout not found" }, { status: 404 });
    }

    const row = rows[0];
    let items = row.items;
    if (typeof items === "string") {
      try { items = JSON.parse(items); } catch { items = []; }
    }

    const recoveryUrl = `https://zupe-store.stibelabs.workers.dev/checkout?recover=${encodeURIComponent(row.recovery_token)}`;

    const sent = await sendAbandonedCartWhatsApp({
      customerName: row.customer_name || "",
      customerPhone: row.customer_phone,
      items: (items || []).map((it: any) => ({
        name: it.name || it.product_name || "Cart Product",
        quantity: Number(it.quantity || 1),
        price: Number(it.price || it.unit_price || 0),
      })),
      totalAmount: Number(row.total_amount) || 0,
      recoveryUrl,
      source: (row.source === "cart" ? "cart" : "checkout") as "checkout" | "cart",
    });

    const now = new Date().toISOString();
    await executeD1Query(
      `UPDATE abandoned_checkouts
       SET whatsapp_sent_count = whatsapp_sent_count + 1,
           last_whatsapp_sent_at = ?
       WHERE id = ?`,
      [now, id]
    );

    return NextResponse.json({
      success: true,
      message: sent ? "Recovery WhatsApp message sent via Cloud API!" : "WhatsApp recovery reminder logged & opened",
      sent: true,
      api_sent: Boolean(sent),
    });
  } catch (err: any) {
    console.error("Error in admin abandoned checkout POST:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const action = searchParams.get("action");

    if (action === "clear_recovered") {
      await executeD1Query(
        "DELETE FROM abandoned_checkouts WHERE status = 'recovered'"
      );
      return NextResponse.json({
        success: true,
        message: "All recovered cart sessions cleared from database",
      });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing checkout ID" },
        { status: 400 }
      );
    }

    await executeD1Query(
      "DELETE FROM abandoned_checkouts WHERE id = ?",
      [id]
    );

    return NextResponse.json({
      success: true,
      message: "Cart session removed successfully",
    });
  } catch (err: any) {
    console.error("Error in admin abandoned checkout DELETE:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
