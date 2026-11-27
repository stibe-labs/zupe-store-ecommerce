import { NextRequest, NextResponse } from "next/server";
import { addInfluencerLink } from "@/lib/influencerService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { influencer_id, name, destination, custom_code } = body;

    if (!influencer_id || !name) {
      return NextResponse.json(
        { success: false, error: "Influencer ID and Link Name are required." },
        { status: 400 }
      );
    }

    const link = await addInfluencerLink({
      influencer_id,
      name,
      destination: destination || "home",
      custom_code,
    });

    return NextResponse.json({
      success: true,
      link,
    });
  } catch (err: any) {
    console.error("POST /api/admin/influencers/links error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
