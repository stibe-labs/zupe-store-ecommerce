import { NextRequest, NextResponse } from "next/server";
import {
  getInfluencersWithStats,
  createInfluencer,
  updateInfluencer,
} from "@/lib/influencerService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeframe = (searchParams.get("timeframe") || "7d") as any;
    const customStart = searchParams.get("startDate") || undefined;
    const customEnd = searchParams.get("endDate") || undefined;

    const influencers = await getInfluencersWithStats(timeframe, customStart, customEnd);

    // Compute summary totals across all influencers for the selected date window
    const summary = {
      total_influencers: influencers.length,
      active_influencers: influencers.filter((i) => i.active).length,
      total_clicks: influencers.reduce((acc, i) => acc + i.clicks, 0),
      total_orders: influencers.reduce((acc, i) => acc + i.orders, 0),
      total_revenue: Math.round(influencers.reduce((acc, i) => acc + i.revenue, 0) * 100) / 100,
      total_commission_period: Math.round(influencers.reduce((acc, i) => acc + i.commission_earned, 0) * 100) / 100,
      total_pending_all_time: Math.round(influencers.reduce((acc, i) => acc + i.pending_amount, 0) * 100) / 100,
      total_spend_period: Math.round(influencers.reduce((acc, i) => acc + i.spend, 0) * 100) / 100,
    };

    return NextResponse.json({
      success: true,
      timeframe,
      summary,
      influencers,
    });
  } catch (err: any) {
    console.error("GET /api/admin/influencers error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      insta_id,
      notes,
      product_cost,
      commission_type,
      commission_value,
      link_name,
      destination,
      custom_code,
    } = body;

    if (!name || !insta_id) {
      return NextResponse.json(
        { success: false, error: "Influencer name and Instagram ID are required." },
        { status: 400 }
      );
    }

    const created = await createInfluencer({
      name,
      insta_id,
      notes,
      product_cost: Number(product_cost || 0),
      commission_type: commission_type || "none",
      commission_value: Number(commission_value || 0),
      link_name: link_name || "First link",
      destination: destination || "home",
      custom_code,
    });

    return NextResponse.json({
      success: true,
      influencer: created.influencer,
      link: created.link,
    });
  } catch (err: any) {
    console.error("POST /api/admin/influencers error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Influencer ID is required." },
        { status: 400 }
      );
    }

    const updated = await updateInfluencer(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Influencer not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      influencer: updated,
    });
  } catch (err: any) {
    console.error("PUT /api/admin/influencers error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
