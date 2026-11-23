import { NextRequest, NextResponse } from "next/server";
import { getAvailableOffers } from "@/lib/couponStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subtotal = Number(searchParams.get("subtotal")) || 0;

    const offers = await getAvailableOffers(subtotal);

    return NextResponse.json({
      success: true,
      offers,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to fetch available offers",
      },
      { status: 500 }
    );
  }
}
