import { NextRequest, NextResponse } from "next/server";
import { getBanners, saveBanners, HeroBannerSlide, DEFAULT_HERO_BANNERS } from "@/lib/storeContent";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";

async function checkAdminAuth(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;
  const session = await verifyAdminSessionToken(token);
  return session.valid;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";
    const banners = await getBanners(all);
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
      const reset = await saveBanners([...DEFAULT_HERO_BANNERS]);
      return NextResponse.json({ success: true, banners: reset });
    }

    // Save entire array of slides from Hero Banner Customizer
    if (Array.isArray(body.banners)) {
      const sanitized: HeroBannerSlide[] = [];
      for (let idx = 0; idx < body.banners.length; idx++) {
        const b = body.banners[idx];
        let finalCutout = (b.cutoutImage || b.image || "").trim();
        let finalBg = (b.bgImage || "/vittal/banner-hero-green-texture.jpg").trim();

        if (finalCutout.startsWith("data:")) {
          try {
            const { uploadBase64Media } = await import("@/lib/r2");
            finalCutout = await uploadBase64Media(finalCutout, "images");
          } catch (e) {
            console.warn("R2 upload error for cutout:", e);
          }
        }

        if (finalBg.startsWith("data:")) {
          try {
            const { uploadBase64Media } = await import("@/lib/r2");
            finalBg = await uploadBase64Media(finalBg, "images");
          } catch (e) {
            console.warn("R2 upload error for background:", e);
          }
        }

        sanitized.push({
          id: b.id || `hero-slide-${Date.now()}-${idx + 1}`,
          badge: (b.badge ?? "Limited Offer").trim(),
          heading: (b.heading ?? "First Purchase Enjoy\na Special Offer").trim(),
          buttonText: (b.buttonText ?? b.ctaText ?? "Shop Now").trim(),
          buttonLink: (b.buttonLink ?? b.ctaLink ?? "/products").trim(),
          bgImage: finalBg,
          cutoutImage: finalCutout,
          desktopScale: typeof b.desktopScale === "number" ? b.desktopScale : 100,
          desktopOffsetX: typeof b.desktopOffsetX === "number" ? b.desktopOffsetX : 0,
          desktopOffsetY: typeof b.desktopOffsetY === "number" ? b.desktopOffsetY : 0,
          mobileScale: typeof b.mobileScale === "number" ? b.mobileScale : 100,
          mobileOffsetX: typeof b.mobileOffsetX === "number" ? b.mobileOffsetX : 0,
          mobileOffsetY: typeof b.mobileOffsetY === "number" ? b.mobileOffsetY : 0,
          active: b.active !== false,
          order: typeof b.order === "number" ? b.order : idx + 1,
          imageFit: b.imageFit || "contain",
          mobileImageFit: b.mobileImageFit || "contain",
          image: finalCutout,
          ctaText: (b.buttonText ?? b.ctaText ?? "Shop Now").trim(),
          ctaLink: (b.buttonLink ?? b.ctaLink ?? "/products").trim(),
        });
      }

      const updated = await saveBanners(sanitized);
      return NextResponse.json({ success: true, banners: updated });
    }

    const {
      badge,
      titleLine1,
      titleLine2,
      headlineHighlight,
      subLabel,
      price,
      description,
      ctaText,
      ctaLink,
      showTextOverlay,
      image,
      mobileImage,
      imageScale,
      imagePosition,
      imageFit,
      mobileImageScale,
      mobileImagePosition,
      mobileImageFit,
      taglineRight,
      active,
    } = body;

    if (!image) {
      return NextResponse.json({ success: false, error: "Banner image is required" }, { status: 400 });
    }

    let finalImage = image.trim();
    let finalMobileImage = mobileImage ? mobileImage.trim() : undefined;

    if (finalImage.startsWith("data:")) {
      try {
        const { uploadBase64Media } = await import("@/lib/r2");
        finalImage = await uploadBase64Media(finalImage, "images");
      } catch (e) {
        console.warn("R2 upload error for banner image:", e);
      }
    }

    if (finalMobileImage && finalMobileImage.startsWith("data:")) {
      try {
        const { uploadBase64Media } = await import("@/lib/r2");
        finalMobileImage = await uploadBase64Media(finalMobileImage, "images");
      } catch (e) {
        console.warn("R2 upload error for mobile banner image:", e);
      }
    }

    const currentBanners = await getBanners(true);
    const newBanner: HeroBannerSlide = {
      id: "banner-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 6),
      badge: (badge || "").trim(),
      titleLine1: (titleLine1 || "Promo Banner").trim(),
      titleLine2: (titleLine2 || "").trim(),
      headlineHighlight: (headlineHighlight || "").trim(),
      subLabel: (subLabel || "").trim(),
      price: (price || "").trim(),
      description: (description || "").trim(),
      ctaText: (ctaText || "Shop Now").trim(),
      ctaLink: ctaLink !== undefined && ctaLink !== null ? ctaLink.trim() : "/products",
      showTextOverlay: showTextOverlay !== false,
      image: finalImage,
      mobileImage: finalMobileImage,
      imageScale: typeof imageScale === "number" ? imageScale : 100,
      imagePosition: imagePosition || "center",
      imageFit: imageFit || "cover",
      mobileImageScale: typeof mobileImageScale === "number" ? mobileImageScale : 100,
      mobileImagePosition: mobileImagePosition || "center",
      mobileImageFit: mobileImageFit || "cover",
      taglineRight: taglineRight || "",
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
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin privileges required." },
        { status: 401 }
      );
    }

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

    if (updates.image && updates.image.startsWith("data:")) {
      try {
        const { uploadBase64Media } = await import("@/lib/r2");
        updates.image = await uploadBase64Media(updates.image, "images");
      } catch (e) {
        console.warn("R2 upload error for updated banner image:", e);
      }
    }
    if (updates.mobileImage && updates.mobileImage.startsWith("data:")) {
      try {
        const { uploadBase64Media } = await import("@/lib/r2");
        updates.mobileImage = await uploadBase64Media(updates.mobileImage, "images");
      } catch (e) {
        console.warn("R2 upload error for updated mobile banner image:", e);
      }
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
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin privileges required." },
        { status: 401 }
      );
    }

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
