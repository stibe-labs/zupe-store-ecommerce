import { NextRequest, NextResponse } from "next/server";
import {
  getSportswearCampaign,
  saveSportswearCampaign,
  SportswearCampaignConfig,
  DEFAULT_SPORTSWEAR_CAMPAIGN,
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
    const config = await getSportswearCampaign();
    return NextResponse.json(
      { success: true, config },
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
      const reset = await saveSportswearCampaign(DEFAULT_SPORTSWEAR_CAMPAIGN);
      return NextResponse.json({ success: true, config: reset });
    }

    if (body.config && typeof body.config === "object") {
      const incoming: SportswearCampaignConfig = body.config;
      const sanitizedCards = [];

      for (let i = 0; i < (incoming.cards || []).length; i++) {
        const card = incoming.cards[i];
        let cardImage = (card.image || "").trim();

        // If client sent raw data URL, upload to R2
        if (cardImage.startsWith("data:")) {
          try {
            const { uploadBase64Media } = await import("@/lib/r2");
            cardImage = await uploadBase64Media(cardImage, "images");
          } catch (e) {
            console.warn("R2 upload error for sportswear card image:", e);
          }
        }

        sanitizedCards.push({
          id: card.id || `drop-card-${i + 1}`,
          title: (card.title || "Activewear").trim(),
          priceLabel: (card.priceLabel || "Starting At").trim(),
          price: (card.price || "₹999*").trim(),
          image: cardImage || DEFAULT_SPORTSWEAR_CAMPAIGN.cards[i]?.image || "/vittal/drop-teveo-run.jpg",
          linkUrl: (card.linkUrl || "/products?category=Outfits").trim(),
          desktopScale: typeof card.desktopScale === "number" ? card.desktopScale : 100,
          desktopOffsetX: typeof card.desktopOffsetX === "number" ? card.desktopOffsetX : 0,
          desktopOffsetY: typeof card.desktopOffsetY === "number" ? card.desktopOffsetY : 0,
          mobileScale: typeof card.mobileScale === "number" ? card.mobileScale : 100,
          mobileOffsetX: typeof card.mobileOffsetX === "number" ? card.mobileOffsetX : 0,
          mobileOffsetY: typeof card.mobileOffsetY === "number" ? card.mobileOffsetY : 0,
        });
      }

      const updated = await saveSportswearCampaign({
        bannerHeadingPrefix: incoming.bannerHeadingPrefix ?? "Fresh",
        bannerHeadingHighlight: incoming.bannerHeadingHighlight ?? "Sportswear",
        bannerHeadingSuffix: incoming.bannerHeadingSuffix ?? "Drops",
        bannerHashtag: incoming.bannerHashtag ?? "#EngineeredForEveryMove",
        cards: sanitizedCards.length > 0 ? sanitizedCards : DEFAULT_SPORTSWEAR_CAMPAIGN.cards,
      });

      return NextResponse.json({ success: true, config: updated });
    }

    return NextResponse.json({ success: false, error: "Invalid payload provided." }, { status: 400 });
  } catch (err: any) {
    console.error("Failed to update sportswear drops:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
