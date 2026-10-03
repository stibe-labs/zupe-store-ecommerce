import { NextRequest, NextResponse } from "next/server";
import { getRemittances, addRemittance, getERPOrders } from "@/lib/erpStore";

export async function GET(req: NextRequest) {
  try {
    const [remittances, orders] = await Promise.all([
      getRemittances(),
      getERPOrders(),
    ]);

    const totalCollected = remittances.reduce((s, r) => s + Number(r.total_cod_collected), 0);
    const totalDeducted = remittances.reduce((s, r) => s + Number(r.courier_charges_deducted), 0);
    const totalRemitted = remittances.reduce((s, r) => s + Number(r.net_remitted_amount), 0);

    const pendingCODRemittance = orders
      .filter((o) => o.payment_method === "COD" && o.remittance_status === "Pending")
      .reduce((s, o) => s + Number(o.total_amount), 0);

    return NextResponse.json({
      success: true,
      remittances,
      metrics: {
        totalCollected,
        totalDeducted,
        totalRemitted,
        pendingCODRemittance,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      crn_id,
      courier,
      total_cod_collected,
      courier_charges_deducted,
      remittance_date,
      bank_utr,
      status,
      orders_count,
    } = body;

    if (!crn_id || !courier || !total_cod_collected || !remittance_date) {
      return NextResponse.json(
        { success: false, error: "Missing required remittance fields" },
        { status: 400 }
      );
    }

    const newRem = await addRemittance({
      crn_id,
      courier,
      total_cod_collected: Number(total_cod_collected),
      courier_charges_deducted: Number(courier_charges_deducted || 0),
      remittance_date,
      bank_utr,
      status: status || "Remitted",
      orders_count: Number(orders_count || 1),
    });

    return NextResponse.json({ success: true, remittance: newRem });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
