import { NextRequest, NextResponse } from "next/server";
import {
  getSupplementShowcase,
  saveSupplementShowcase,
  SupplementShowcaseConfig,
  DEFAULT_SUPPLEMENT_SHOWCASE,
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
    const config = await getSupplementShowcase();
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
      const reset = await saveSupplementShowcase(DEFAULT_SUPPLEMENT_SHOWCASE);
      return NextResponse.json({ success: true, config: reset });
    }

    if (body.config && typeof body.config === "object") {
      const incoming: SupplementShowcaseConfig = body.config;
      const sanitizedCategories = [];

      for (let cIdx = 0; cIdx < (incoming.categories || []).length; cIdx++) {
        const cat = incoming.categories[cIdx];
        let catIcon = (cat.iconImage || "").trim();

        // If client sent raw data URL for icon, upload to R2
        if (catIcon.startsWith("data:")) {
          try {
            const { uploadBase64Media } = await import("@/lib/r2");
            catIcon = await uploadBase64Media(catIcon, "images");
          } catch (e) {
            console.warn("R2 upload error for category icon:", e);
          }
        }

        const sanitizedItems = [];
        for (let iIdx = 0; iIdx < (cat.items || []).length; iIdx++) {
          const it = cat.items[iIdx];
          let itImage = (it.image || "").trim();

          // If client sent raw data URL for item image, upload to R2
          if (itImage.startsWith("data:")) {
            try {
              const { uploadBase64Media } = await import("@/lib/r2");
              itImage = await uploadBase64Media(itImage, "images");
            } catch (e) {
              console.warn("R2 upload error for item image:", e);
            }
          }

          sanitizedItems.push({
            id: it.id || `item_${cIdx}_${iIdx}`,
            slug: (it.slug || it.id || "product").trim(),
            name: (it.name || "Product").trim(),
            subtitle: (it.subtitle || "").trim(),
            image: itImage || "/vittal/product-whey-protein-jar.png",
            price: typeof it.price === "number" ? it.price : 999,
            mrp: typeof it.mrp === "number" ? it.mrp : 1499,
            discountTag: (it.discountTag || "Special Deal").trim(),
            badge: (it.badge || "").trim(),
          });
        }

        sanitizedCategories.push({
          id: cat.id || `cat_${cIdx + 1}`,
          label: (cat.label || `Category ${cIdx + 1}`).trim(),
          iconImage: catIcon || "/vittal/catalog/on-gold-standard-whey.png",
          items: sanitizedItems,
        });
      }

      const updated = await saveSupplementShowcase({
        overlineText: (incoming.overlineText || DEFAULT_SUPPLEMENT_SHOWCASE.overlineText).trim(),
        headingText: (incoming.headingText || DEFAULT_SUPPLEMENT_SHOWCASE.headingText).trim(),
        buttonText: (incoming.buttonText || DEFAULT_SUPPLEMENT_SHOWCASE.buttonText).trim(),
        buttonLink: (incoming.buttonLink || DEFAULT_SUPPLEMENT_SHOWCASE.buttonLink).trim(),
        bgGradientFrom: incoming.bgGradientFrom || DEFAULT_SUPPLEMENT_SHOWCASE.bgGradientFrom,
        bgGradientVia: incoming.bgGradientVia || DEFAULT_SUPPLEMENT_SHOWCASE.bgGradientVia,
        bgGradientTo: incoming.bgGradientTo || DEFAULT_SUPPLEMENT_SHOWCASE.bgGradientTo,
        borderColor: incoming.borderColor || DEFAULT_SUPPLEMENT_SHOWCASE.borderColor,
        templateKey: incoming.templateKey || "brand_olive",
        categories: sanitizedCategories.length > 0 ? sanitizedCategories : DEFAULT_SUPPLEMENT_SHOWCASE.categories,
      });

      return NextResponse.json({ success: true, config: updated });
    }

    return NextResponse.json({ success: false, error: "Invalid payload provided." }, { status: 400 });
  } catch (err: any) {
    console.error("Failed to update supplement showcase:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
