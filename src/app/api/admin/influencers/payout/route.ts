import { NextRequest, NextResponse } from "next/server";
import { recordInfluencerPayment } from "@/lib/influencerService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { influencer_id, amount, notes } = body;

    if (!influencer_id || amount === undefined || Number(amount) < 0) {
      return NextResponse.json(
        { success: false, error: "Valid influencer ID and non-negative amount are required." },
        { status: 400 }
      );
    }

    const payment = await recordInfluencerPayment(
      influencer_id,
      Number(amount),
      notes
    );

    return NextResponse.json({
      success: true,
      payment,
    });
  } catch (err: any) {
    console.error("POST /api/admin/influencers/payout error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
