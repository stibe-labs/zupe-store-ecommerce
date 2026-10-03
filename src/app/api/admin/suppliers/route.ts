import { NextRequest, NextResponse } from "next/server";
import { getSuppliers } from "@/lib/erpStore";

export async function GET(req: NextRequest) {
  try {
    const suppliers = await getSuppliers();
    return NextResponse.json({ success: true, suppliers });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
