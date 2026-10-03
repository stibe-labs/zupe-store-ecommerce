import { NextRequest, NextResponse } from "next/server";
import { getERPOrders } from "@/lib/erpStore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const delivery_status = searchParams.get("delivery_status") || undefined;
    const payment_method = searchParams.get("payment_method") || undefined;
    const search = searchParams.get("search") || undefined;

    const orders = await getERPOrders({
      delivery_status,
      payment_method,
      search,
    });

    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
