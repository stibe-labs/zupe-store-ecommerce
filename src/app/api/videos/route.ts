import { NextRequest, NextResponse } from "next/server";
import { getVideosByProduct, getAllVideos } from "@/lib/videoStore";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    let videos = productId
      ? await getVideosByProduct(productId)
      : await getAllVideos();

    // Enrich video items with product metadata (name, price, mrp, image) if available
    const enriched = videos.map((v) => {
      const matchedProd = DEFAULT_PRODUCTS.find(
        (p) =>
          p.id.toLowerCase() === v.productId.toLowerCase() ||
          p.slug.toLowerCase() === v.productId.toLowerCase()
      );

      return {
        ...v,
        productName: v.productName || matchedProd?.name || "Zupe Store Featured Item",
        productPrice: v.productPrice || matchedProd?.price || 799,
        productMrp: v.productMrp || matchedProd?.mrp || 1199,
        productSlug: v.productSlug || matchedProd?.slug || v.productId,
        productImage:
          v.productImage ||
          matchedProd?.poster_image ||
          (matchedProd?.images && matchedProd.images[0]) ||
          v.posterUrl,
      };
    });

    return NextResponse.json({
      success: true,
      videos: enriched,
    });
  } catch (err: any) {
    console.error("Error fetching videos:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch videos" },
      { status: 500 }
    );
  }
}
