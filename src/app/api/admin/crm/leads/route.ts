import { NextRequest, NextResponse } from "next/server";
import { executeD1Query } from "@/lib/d1";

export const dynamic = "force-dynamic";

export interface CRMLead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: string;
  status: "new" | "contacted" | "interested" | "converted" | "lost";
  temperature: "hot" | "warm" | "cold";
  potential_value: number;
  tags: string[];
  notes?: string;
  converted_order_id?: string;
  last_contacted_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Automatically synchronize WhatsApp conversations into CRM leads with deduplication
 */
async function syncWhatsAppConversationsToCRM() {
  try {
    const convRows = await executeD1Query<any>(
      "SELECT * FROM whatsapp_conversations ORDER BY last_message_time DESC"
    );
    if (!convRows || !Array.isArray(convRows) || convRows.length === 0) return;

    for (const c of convRows) {
      const rawPhone = c.customer_phone || "";
      const digits = rawPhone.replace(/\D/g, "");
      if (!digits || digits.length < 5) continue;
      const clean10 = digits.slice(-10);
      const leadId = `lead_${clean10}`;
      const formattedPhone = `+91 ${clean10}`;

      // Check if a lead already exists by ID or 10-digit phone
      const existing = await executeD1Query<any>(
        "SELECT id, name, email, source, status, temperature, potential_value, tags, notes, converted_order_id FROM crm_leads WHERE id = ? OR phone LIKE ? LIMIT 1",
        [leadId, `%${clean10}%`]
      );

      const isConverted = Boolean(c.order_id);
      const lastMsgText = (c.last_message_text || "").trim();

      if (existing && existing.length > 0) {
        const row = existing[0];
        let existingTags: string[] = [];
        try {
          existingTags = typeof row.tags === "string" ? JSON.parse(row.tags) : (row.tags || []);
        } catch {
          existingTags = [];
        }
        if (!existingTags.includes("whatsapp")) existingTags.push("whatsapp");
        if (c.category && !existingTags.includes(c.category)) existingTags.push(c.category);

        let newNotes = row.notes || "";
        if (lastMsgText && !newNotes.includes(lastMsgText.slice(0, 30))) {
          newNotes = newNotes ? `${newNotes}\n[WhatsApp]: ${lastMsgText}` : `[WhatsApp]: ${lastMsgText}`;
        }

        const targetStatus = row.status === "new" && isConverted ? "converted" : row.status;
        const targetOrderId = row.converted_order_id || c.order_id || null;
        const targetValue = row.potential_value > 0 ? row.potential_value : (c.order_total || 899);

        await executeD1Query(
          `UPDATE crm_leads SET 
            tags = ?, 
            notes = ?, 
            status = ?, 
            converted_order_id = ?, 
            potential_value = ?, 
            last_contacted_at = COALESCE(?, last_contacted_at),
            updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            JSON.stringify(existingTags),
            newNotes,
            targetStatus,
            targetOrderId,
            targetValue,
            c.last_message_time || null,
            row.id,
          ]
        );
      } else {
        // Create new unified lead from WhatsApp
        const leadName = c.customer_name || `Customer (${clean10.slice(-4)})`;
        const initialStatus = isConverted ? "converted" : "new";
        const initialTemp = isConverted ? "hot" : "warm";
        const initialValue = c.order_total || 899;
        const tags = JSON.stringify(["whatsapp", c.category || "inquiry"]);
        const notes = lastMsgText ? `[WhatsApp Inquiry]: ${lastMsgText}` : "WhatsApp conversation started";

        await executeD1Query(
          `INSERT INTO crm_leads (
            id, name, phone, email, source, status, temperature, potential_value, tags, notes, converted_order_id, last_contacted_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, 'whatsapp', ?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            notes = COALESCE(excluded.notes, crm_leads.notes),
            last_contacted_at = COALESCE(excluded.last_contacted_at, crm_leads.last_contacted_at),
            updated_at = CURRENT_TIMESTAMP`,
          [
            leadId,
            leadName,
            formattedPhone,
            c.customer_email || "",
            initialStatus,
            initialTemp,
            initialValue,
            tags,
            notes,
            c.order_id || null,
            c.last_message_time || null,
            c.created_at || null,
          ]
        );
      }
    }
  } catch (err) {
    console.warn("syncWhatsAppConversationsToCRM warning:", err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const status = searchParams.get("status") || "all";
    const temperature = searchParams.get("temperature") || "all";
    const source = searchParams.get("source") || "all";

    // Auto-sync WhatsApp conversations to CRM leads on fetch
    await syncWhatsAppConversationsToCRM();

    // Unified query with source filtering
    let query = "SELECT * FROM crm_leads WHERE 1=1";
    const params: any[] = [];

    if (source === "whatsapp") {
      query += " AND (source = 'whatsapp' OR tags LIKE '%whatsapp%')";
    } else if (source === "meta_ads") {
      query += " AND (source = 'meta_ads' OR source = 'ad_campaign' OR source = 'meta_instant_form' OR tags LIKE '%meta%')";
    }

    if (status !== "all") {
      query += " AND status = ?";
      params.push(status);
    }

    if (temperature !== "all") {
      query += " AND temperature = ?";
      params.push(temperature);
    }

    if (search) {
      query += " AND (LOWER(name) LIKE ? OR phone LIKE ? OR LOWER(email) LIKE ? OR LOWER(notes) LIKE ? OR tags LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += " ORDER BY updated_at DESC, created_at DESC";

    const rows = await executeD1Query<any>(query, params);

    // Strict 10-digit phone deduplication fallback to ensure zero duplicates
    const seenPhones = new Set<string>();
    const leads: CRMLead[] = [];

    for (const r of rows || []) {
      const clean10 = (r.phone || "").replace(/\D/g, "").slice(-10);
      if (clean10 && seenPhones.has(clean10)) {
        continue;
      }
      if (clean10) {
        seenPhones.add(clean10);
      }

      let tags: string[] = [];
      try {
        tags = typeof r.tags === "string" ? JSON.parse(r.tags) : (r.tags || []);
      } catch {
        tags = [];
      }

      leads.push({
        id: r.id,
        name: r.name || "Prospective Customer",
        phone: r.phone || "",
        email: r.email || "",
        source: r.source || "storefront",
        status: r.status || "new",
        temperature: r.temperature || "warm",
        potential_value: Number(r.potential_value || 0),
        tags: Array.isArray(tags) ? tags : [],
        notes: r.notes || "",
        converted_order_id: r.converted_order_id || "",
        last_contacted_at: r.last_contacted_at || "",
        created_at: r.created_at || new Date().toISOString(),
        updated_at: r.updated_at || new Date().toISOString(),
      });
    }

    // Compute Lead Pipeline KPI stats across all leads
    const allRows = await executeD1Query<any>(
      "SELECT source, status, temperature, potential_value, tags, phone FROM crm_leads"
    );
    
    // Deduplicate allRows for stats calculation as well
    const seenAllPhones = new Set<string>();
    const all: any[] = [];
    for (const r of allRows || []) {
      const clean10 = (r.phone || "").replace(/\D/g, "").slice(-10);
      if (clean10 && seenAllPhones.has(clean10)) continue;
      if (clean10) seenAllPhones.add(clean10);
      all.push(r);
    }

    const totalLeads = all.length;
    const newLeads = all.filter((l) => l.status === "new").length;
    const contactedLeads = all.filter((l) => l.status === "contacted").length;
    const interestedLeads = all.filter((l) => l.status === "interested").length;
    const hotLeads = all.filter((l) => l.temperature === "hot").length;
    const convertedLeads = all.filter((l) => l.status === "converted").length;
    const whatsappLeads = all.filter((l) => l.source === "whatsapp" || String(l.tags).includes("whatsapp")).length;
    const metaLeads = all.filter((l) => l.source === "meta_ads" || String(l.tags).includes("meta")).length;
    const pipelineValue = all.reduce((sum, l) => sum + (Number(l.potential_value) || 0), 0);
    const conversionRate = totalLeads > 0 ? Number(((convertedLeads / totalLeads) * 100).toFixed(1)) : 0;

    return NextResponse.json({
      success: true,
      leads,
      stats: {
        totalLeads,
        newLeads,
        contactedLeads,
        interestedLeads,
        hotLeads,
        convertedLeads,
        whatsappLeads,
        metaLeads,
        pipelineValue,
        conversionRate,
      },
    });
  } catch (err: any) {
    console.error("CRM Leads GET error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, source, temperature, potential_value, notes, tags } = body;

    if (!phone || !phone.trim()) {
      return NextResponse.json({ success: false, error: "Phone number is required." }, { status: 400 });
    }

    const cleanPhone = phone.trim();
    const clean10 = cleanPhone.replace(/\D/g, "").slice(-10);
    const id = `lead_${clean10 || Date.now()}`;
    const parsedTags = Array.isArray(tags) && tags.length > 0 
      ? JSON.stringify(tags) 
      : JSON.stringify([source || "manual_lead"]);

    await executeD1Query(
      `INSERT INTO crm_leads (
        id, name, phone, email, source, status, temperature, potential_value, tags, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'new', ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        email = COALESCE(excluded.email, crm_leads.email),
        source = excluded.source,
        notes = excluded.notes,
        updated_at = CURRENT_TIMESTAMP`,
      [
        id,
        name ? name.trim() : `Lead (${clean10.slice(-4)})`,
        `+91 ${clean10}`,
        email ? email.trim() : "",
        source || "whatsapp",
        temperature || "warm",
        Number(potential_value || 899),
        parsedTags,
        notes || "Inquiry recorded in CRM",
      ]
    );

    return NextResponse.json({ success: true, leadId: id, message: "Lead created successfully." });
  } catch (err: any) {
    console.error("CRM Leads POST error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, temperature, notes, tags, converted_order_id, mark_contacted } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Lead ID is required." }, { status: 400 });
    }

    const updates: string[] = ["updated_at = CURRENT_TIMESTAMP"];
    const params: any[] = [];

    if (status) {
      updates.push("status = ?");
      params.push(status);
    }
    if (temperature) {
      updates.push("temperature = ?");
      params.push(temperature);
    }
    if (notes !== undefined) {
      updates.push("notes = ?");
      params.push(notes);
    }
    if (tags !== undefined) {
      updates.push("tags = ?");
      params.push(Array.isArray(tags) ? JSON.stringify(tags) : "[]");
    }
    if (converted_order_id !== undefined) {
      updates.push("converted_order_id = ?");
      params.push(converted_order_id);
    }
    if (mark_contacted) {
      updates.push("last_contacted_at = CURRENT_TIMESTAMP");
      if (!status) {
        updates.push("status = 'contacted'");
      }
    }

    params.push(id);
    await executeD1Query(`UPDATE crm_leads SET ${updates.join(", ")} WHERE id = ?`, params);

    return NextResponse.json({ success: true, message: "Lead updated successfully." });
  } catch (err: any) {
    console.error("CRM Leads PATCH error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("clearAll") === "true";

    if (clearAll) {
      await executeD1Query("DELETE FROM crm_leads");
      return NextResponse.json({ success: true, message: "All leads cleared." });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Lead ID is required." }, { status: 400 });
    }

    await executeD1Query("DELETE FROM crm_leads WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Lead deleted successfully." });
  } catch (err: any) {
    console.error("CRM Leads DELETE error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
