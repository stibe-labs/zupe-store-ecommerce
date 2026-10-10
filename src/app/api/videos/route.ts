import { NextRequest, NextResponse } from "next/server";
import { getVideosByProduct, getAllVideos } from "@/lib/videoStore";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import { executeD1Query } from "@/lib/d1";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    let videos = productId
      ? await getVideosByProduct(productId)
      : await getAllVideos();

    // Query D1 products table to merge with DEFAULT_PRODUCTS
    let allProducts: any[] = [...DEFAULT_PRODUCTS];
    try {
      const d1Products = await executeD1Query<any>("SELECT * FROM products");
      if (d1Products && d1Products.length > 0) {
        allProducts = [...d1Products, ...DEFAULT_PRODUCTS];
      }
    } catch {
      // fallback
    }

    // Enrich video items with product metadata (name, price, mrp, image, slug)
    const enriched = videos.map((v) => {
      const vPid = (v.productId || "").toLowerCase().trim();
      const isNone = !vPid || vPid === "none" || vPid === "all";

      const matchedProd = isNone
        ? null
        : allProducts.find((p) => {
            const pId = String(p.id || "").toLowerCase().trim();
            const pSlug = String(p.slug || "").toLowerCase().trim();
            const pName = String(p.name || "").toLowerCase().trim();

            return (
              pId === vPid ||
              pSlug === vPid ||
              pName === vPid ||
              (pSlug.length > 0 && (pSlug.includes(vPid) || vPid.includes(pSlug)))
            );
          });

      const targetSlug = matchedProd?.slug || matchedProd?.id || undefined;

      let posterImg =
        matchedProd?.poster_image ||
        (matchedProd?.images && Array.isArray(matchedProd.images) && matchedProd.images[0]);

      if (!posterImg && typeof matchedProd?.images === "string") {
        try {
          const parsed = JSON.parse(matchedProd.images);
          if (Array.isArray(parsed) && parsed[0]) posterImg = parsed[0];
        } catch {}
      }

      if (isNone) {
        return {
          ...v,
          productId: "none",
          productName: undefined,
          productPrice: undefined,
          productMrp: undefined,
          productSlug: undefined,
          productImage: undefined,
        };
      }

      return {
        ...v,
        productName: matchedProd?.name || v.productName || "Zupe Store Featured Item",
        productPrice:
          matchedProd?.price !== undefined
            ? Number(matchedProd.price)
            : v.productPrice || 799,
        productMrp:
          matchedProd?.mrp !== undefined
            ? Number(matchedProd.mrp)
            : v.productMrp || 1199,
        productSlug: targetSlug || v.productSlug || v.productId,
        productImage: posterImg || v.productImage || v.posterUrl,
      };
    });

    return NextResponse.json(
      {
        success: true,
        videos: enriched,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    console.error("Error fetching videos:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch videos" },
      { status: 500 }
    );
  }
}
