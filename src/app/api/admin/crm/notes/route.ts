import { NextRequest, NextResponse } from "next/server";
import { executeD1Query } from "@/lib/d1";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const identifier = searchParams.get("customer")?.trim();

    if (!identifier) {
      const rows = await executeD1Query<any>(
        "SELECT * FROM crm_customer_notes ORDER BY created_at DESC LIMIT 50"
      );
      return NextResponse.json({ success: true, notes: rows || [] });
    }

    const rows = await executeD1Query<any>(
      "SELECT * FROM crm_customer_notes WHERE customer_identifier = ? OR customer_identifier LIKE ? ORDER BY created_at DESC",
      [identifier, `%${identifier.slice(-10)}`]
    );

    return NextResponse.json({ success: true, notes: rows || [] });
  } catch (err: any) {
    console.error("CRM Notes GET error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer_identifier, content, author } = body;

    if (!customer_identifier || !content || !content.trim()) {
      return NextResponse.json({ success: false, error: "Customer and note content are required." }, { status: 400 });
    }

    const id = `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await executeD1Query(
      "INSERT INTO crm_customer_notes (id, customer_identifier, author, content, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)",
      [id, customer_identifier.trim(), author || "Admin", content.trim()]
    );

    return NextResponse.json({ success: true, id, message: "Note added successfully." });
  } catch (err: any) {
    console.error("CRM Notes POST error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

