import { NextRequest, NextResponse } from "next/server";
import {
  getPromoBanners,
  savePromoBanners,
  PromoBannerCard,
  DEFAULT_PROMO_BANNERS,
} from "@/lib/storeContent";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";

async function checkAdminAuth(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;
  const session = await verifyAdminSessionToken(token);
  return session.valid;
}

export async function GET() {
  try {
    const banners = await getPromoBanners();
    return NextResponse.json(
      { success: true, banners },
      { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" } }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin privileges required." },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (body.action === "reset_defaults") {
      const reset = await savePromoBanners([...DEFAULT_PROMO_BANNERS]);
      return NextResponse.json({ success: true, banners: reset });
    }

    const { banners } = body;
    if (!banners || !Array.isArray(banners) || banners.length !== 2) {
      return NextResponse.json(
        { success: false, error: "Exactly 2 promo banner cards are required." },
        { status: 400 }
      );
    }

    const updated = await savePromoBanners(banners as PromoBannerCard[]);
    return NextResponse.json({ success: true, banners: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
