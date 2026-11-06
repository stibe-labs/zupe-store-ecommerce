import { NextRequest, NextResponse } from "next/server";
import { executeD1Query } from "@/lib/d1";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    let pixelId = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID || "982736451029384";
    let isActive = true;

    try {
      const rows = await executeD1Query<any>(
        "SELECT config_data, is_active FROM integrations_config WHERE provider = 'meta'"
      );
      if (rows && rows.length > 0 && rows[0].config_data) {
        const parsed = JSON.parse(rows[0].config_data);
        if (parsed.pixelId) pixelId = parsed.pixelId;
        isActive = rows[0].is_active === 1;
      }
    } catch {}

    return NextResponse.json({
      success: true,
      pixelId,
      isActive,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

