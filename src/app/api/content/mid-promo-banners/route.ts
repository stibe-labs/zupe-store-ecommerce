import { NextRequest, NextResponse } from "next/server";
import {
  getMidPromoCards,
  saveMidPromoCards,
  MidPromoCard,
  DEFAULT_MID_PROMO_CARDS,
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
    const cards = await getMidPromoCards();
    return NextResponse.json(
      { success: true, cards },
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
      const reset = await saveMidPromoCards([...DEFAULT_MID_PROMO_CARDS]);
      return NextResponse.json({ success: true, cards: reset });
    }

    const { cards } = body;
    if (!cards || !Array.isArray(cards) || cards.length !== 3) {
      return NextResponse.json(
        { success: false, error: "Exactly 3 middle feature promo cards are required." },
        { status: 400 }
      );
    }

    const updated = await saveMidPromoCards(cards as MidPromoCard[]);
    return NextResponse.json({ success: true, cards: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
