import { NextRequest, NextResponse } from "next/server";
import { getBanners, saveBanners, HeroBannerSlide, DEFAULT_HERO_BANNERS } from "@/lib/storeContent";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";
    const banners = await getBanners(all);
    return NextResponse.json({ success: true, banners });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "reset_defaults") {
      const reset = await saveBanners([...DEFAULT_HERO_BANNERS]);
      return NextResponse.json({ success: true, banners: reset });
    }

    const { badge, titleLine1, titleLine2, description, ctaText, ctaLink, image, mobileImage, taglineRight, active } = body;

    if (!titleLine1 || !image) {
      return NextResponse.json({ success: false, error: "Title and Image are required" }, { status: 400 });
    }

    const currentBanners = await getBanners(true);
    const newBanner: HeroBannerSlide = {
      id: "banner-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 6),
      badge: badge || "SPECIAL COLLECTION",
      titleLine1: titleLine1.trim(),
      titleLine2: (titleLine2 || "").trim(),
      description: (description || "").trim(),
      ctaText: (ctaText || "Explore Now").trim(),
      ctaLink: (ctaLink || "/products").trim(),
      image: image.trim(),
      mobileImage: mobileImage ? mobileImage.trim() : undefined,
      taglineRight: taglineRight || "Exclusive Offers ♡",
      active: active !== false,
      order: currentBanners.length + 1,
    };

    const updated = await saveBanners([...currentBanners, newBanner]);
    return NextResponse.json({ success: true, banner: newBanner, banners: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, updates, reorder } = body;

    // Handle full list reorder
    if (reorder && Array.isArray(reorder)) {
      const updated = await saveBanners(reorder);
      return NextResponse.json({ success: true, banners: updated });
    }

    if (!id || !updates) {
      return NextResponse.json({ success: false, error: "Missing banner ID or updates" }, { status: 400 });
    }

    const currentBanners = await getBanners(true);
    const index = currentBanners.findIndex((b) => b.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: "Banner not found" }, { status: 404 });
    }

    currentBanners[index] = { ...currentBanners[index], ...updates };
    const updated = await saveBanners([...currentBanners]);

    return NextResponse.json({ success: true, banner: currentBanners[index], banners: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Banner ID is required" }, { status: 400 });
    }

    const currentBanners = await getBanners(true);
    const filtered = currentBanners.filter((b) => b.id !== id);

    if (filtered.length === currentBanners.length) {
      return NextResponse.json({ success: false, error: "Banner not found" }, { status: 404 });
    }

    const updated = await saveBanners(filtered);
    return NextResponse.json({ success: true, message: "Banner deleted successfully", banners: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
