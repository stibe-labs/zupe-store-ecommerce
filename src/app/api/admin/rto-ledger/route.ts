import { NextRequest, NextResponse } from "next/server";
import { getRTOLedger, addRTOCredit, useRTOCredit, getSuppliers } from "@/lib/erpStore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supplier_id = searchParams.get("supplier_id") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const [ledger, suppliers] = await Promise.all([
      getRTOLedger(supplier_id, status, search),
      getSuppliers(),
    ]);

    // Compute top KPIs for RTO refund balance module (matching Image 3)
    const totalCreditsAdded = suppliers.reduce((sum, s) => sum + Number(s.total_credits_added || 0), 0);
    const totalCreditsUsed = suppliers.reduce((sum, s) => sum + Number(s.total_credits_used || 0), 0);
    const availableBalance = suppliers.reduce((sum, s) => sum + Number(s.available_rto_balance || 0), 0);
    const pendingCredits = suppliers.reduce((sum, s) => sum + Number(s.pending_credits || 0), 0);

    // Status breakdown
    const creditedCount = ledger.filter((l) => l.status === "Credited").length;
    const creditedSum = ledger.filter((l) => l.status === "Credited").reduce((s, l) => s + Math.abs(l.amount), 0);
    const pendingCount = ledger.filter((l) => l.status === "Pending").length;
    const pendingSum = ledger.filter((l) => l.status === "Pending").reduce((s, l) => s + Math.abs(l.amount), 0);
    const partiallyUsedCount = ledger.filter((l) => l.status === "Partially Used").length;
    const partiallyUsedSum = ledger.filter((l) => l.status === "Partially Used").reduce((s, l) => s + Math.abs(l.amount), 0);
    const usedCount = ledger.filter((l) => l.status === "Used").length;
    const usedSum = ledger.filter((l) => l.status === "Used").reduce((s, l) => s + Math.abs(l.amount), 0);

    return NextResponse.json({
      success: true,
      ledger,
      suppliers,
      metrics: {
        totalCreditsAdded,
        totalCreditsUsed,
        availableBalance,
        pendingCredits,
        statusBreakdown: {
          credited: { count: creditedCount, amount: creditedSum },
          pending: { count: pendingCount, amount: pendingSum },
          partiallyUsed: { count: partiallyUsedCount, amount: partiallyUsedSum },
          fullyUsed: { count: usedCount, amount: usedSum },
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "use_credit") {
      const {
        supplier_id,
        order_id,
        product_name,
        amount_to_use,
        used_against_order_id,
        date,
        notes,
      } = body;

      if (!supplier_id || !amount_to_use || !used_against_order_id) {
        return NextResponse.json(
          { success: false, error: "Missing required fields for credit usage" },
          { status: 400 }
        );
      }

      const result = await useRTOCredit({
        supplier_id,
        order_id: order_id || "PO-OFFSET",
        product_name: product_name || "Supplier PO Offset",
        amount_to_use: Number(amount_to_use),
        used_against_order_id,
        date: date || new Date().toISOString().split("T")[0],
        notes,
      });

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, entry: result.entry });
    }

    // Default: Add RTO Credit
    const {
      supplier_id,
      order_id,
      product_id,
      product_name,
      amount,
      date,
      status,
      notes,
    } = body;

    if (!supplier_id || !order_id || !product_name || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields for RTO Credit" },
        { status: 400 }
      );
    }

    const entry = await addRTOCredit({
      supplier_id,
      order_id,
      product_id,
      product_name,
      amount: Number(amount),
      date: date || new Date().toISOString().split("T")[0],
      status: status || "Credited",
      notes,
    });

    return NextResponse.json({ success: true, entry });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
