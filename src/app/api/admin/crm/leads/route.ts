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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const status = searchParams.get("status") || "all";
    const temperature = searchParams.get("temperature") || "all";

    let query = "SELECT * FROM crm_leads WHERE 1=1";
    const params: any[] = [];

    if (status !== "all") {
      query += " AND status = ?";
      params.push(status);
    }

    if (temperature !== "all") {
      query += " AND temperature = ?";
      params.push(temperature);
    }

    if (search) {
      query += " AND (LOWER(name) LIKE ? OR phone LIKE ? OR LOWER(email) LIKE ? OR LOWER(notes) LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += " ORDER BY created_at DESC";

    const rows = await executeD1Query<any>(query, params);
    const leads: CRMLead[] = (rows || []).map((r) => {
      let tags: string[] = [];
      try {
        tags = typeof r.tags === "string" ? JSON.parse(r.tags) : (r.tags || []);
      } catch {
        tags = [];
      }
      return {
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
      };
    });

    // Compute Lead Pipeline KPI stats
    const allRows = await executeD1Query<any>("SELECT status, temperature, potential_value FROM crm_leads");
    const all = allRows || [];
    const totalLeads = all.length;
    const newLeads = all.filter((l) => l.status === "new").length;
    const contactedLeads = all.filter((l) => l.status === "contacted").length;
    const hotLeads = all.filter((l) => l.temperature === "hot").length;
    const convertedLeads = all.filter((l) => l.status === "converted").length;
    const pipelineValue = all.reduce((sum, l) => sum + (Number(l.potential_value) || 0), 0);
    const conversionRate = totalLeads > 0 ? Number(((convertedLeads / totalLeads) * 100).toFixed(1)) : 0;

    return NextResponse.json({
      success: true,
      leads,
      stats: {
        totalLeads,
        newLeads,
        contactedLeads,
        hotLeads,
        convertedLeads,
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
    const id = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const parsedTags = Array.isArray(tags) ? JSON.stringify(tags) : JSON.stringify([]);

    await executeD1Query(
      `INSERT INTO crm_leads (
        id, name, phone, email, source, status, temperature, potential_value, tags, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'new', ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        id,
        name ? name.trim() : "Prospective Customer",
        cleanPhone,
        email ? email.trim() : "",
        source || "manual",
        temperature || "warm",
        Number(potential_value || 0),
        parsedTags,
        notes || "",
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

