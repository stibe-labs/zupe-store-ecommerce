import { NextRequest, NextResponse } from "next/server";
import { processOverdueAbandonedCarts } from "@/lib/abandonedCartService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const processedCount = await processOverdueAbandonedCarts();
    return NextResponse.json({
      success: true,
      processedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
