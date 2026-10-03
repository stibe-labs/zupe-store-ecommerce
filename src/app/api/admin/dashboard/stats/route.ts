import { NextRequest, NextResponse } from "next/server";
import { getDashboardKPIs } from "@/lib/erpStore";

export async function GET(req: NextRequest) {
  try {
    const kpis = await getDashboardKPIs();
    return NextResponse.json({ success: true, kpis });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
