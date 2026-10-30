import { NextRequest, NextResponse } from "next/server";
import { getVideosByProduct, getAllVideos, getHomePageVideoIds } from "@/lib/videoStore";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import { executeD1Query } from "@/lib/d1";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const videoIdsParam = searchParams.get("videoIds");
    const scope = searchParams.get("scope");

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

    // Direct explicit videoIds passed as query parameter
    let explicitVideoIds: string[] | undefined = undefined;
    if (videoIdsParam) {
      try {
        const parsed = videoIdsParam.startsWith("[")
          ? JSON.parse(videoIdsParam)
          : videoIdsParam.split(",");
        if (Array.isArray(parsed) && parsed.length > 0) {
          explicitVideoIds = parsed.map((id) => String(id).trim()).filter(Boolean);
        }
      } catch {}
    }

    // Find the current product if productId was passed
    let targetProd: any = null;

    if (productId) {
      const normPid = productId.trim().toLowerCase();
      const cleanNorm = normPid.replace(/[-_ ]+/g, " ");
      const hyphenNorm = normPid.replace(/[\s_]+/g, "-");

      targetProd = allProducts.find((p) => {
        const pId = String(p.id || "").toLowerCase().trim();
        const pSlug = String(p.slug || "").toLowerCase().trim();
        const pName = String(p.name || "").toLowerCase().trim();
        const cleanSlug = pSlug.replace(/[-_ ]+/g, " ");
        const cleanId = pId.replace(/[-_ ]+/g, " ");

        return (
          pId === normPid ||
          pSlug === normPid ||
          pId === hyphenNorm ||
          pSlug === hyphenNorm ||
          cleanSlug === cleanNorm ||
          cleanId === cleanNorm ||
          (cleanNorm.length > 3 && (cleanSlug.includes(cleanNorm) || cleanNorm.includes(cleanSlug))) ||
          pName === cleanNorm ||
          (cleanNorm.length > 3 && pName.includes(cleanNorm))
        );
      });

      if (targetProd && !explicitVideoIds) {
        if (Array.isArray(targetProd.video_ids)) {
          explicitVideoIds = targetProd.video_ids;
        } else if (typeof targetProd.video_ids === "string" && targetProd.video_ids.trim()) {
          try {
            const parsed = JSON.parse(targetProd.video_ids);
            if (Array.isArray(parsed) && parsed.length > 0) explicitVideoIds = parsed;
          } catch {}
        }
      }
    }

    const searchProductKeys: string[] = [];
    if (targetProd?.id) searchProductKeys.push(targetProd.id);
    if (targetProd?.slug) searchProductKeys.push(targetProd.slug);
    if (productId) searchProductKeys.push(productId);

    let videos: any[] = [];

    if (productId || (explicitVideoIds && explicitVideoIds.length > 0)) {
      videos = await getVideosByProduct(
        searchProductKeys.length > 0 ? searchProductKeys : productId || "",
        explicitVideoIds
      );
    } else if (scope === "home" || (!productId && !videoIdsParam)) {
      // Home page: strictly return only selected videos in the chosen order
      const homeVideoIds = await getHomePageVideoIds();
      const allActive = (await getAllVideos()).filter((v) => v.active !== false);

      if (homeVideoIds && homeVideoIds.length > 0) {
        const map = new Map(allActive.map((v) => [v.id, v]));
        const selectedList = homeVideoIds
          .map((id) => map.get(id))
          .filter(Boolean);
        videos = selectedList.length > 0 ? selectedList : allActive;
      } else {
        videos = allActive;
      }
    } else {
      videos = (await getAllVideos()).filter((v) => v.active !== false);
    }

    // Enrich video items with product metadata (name, price, mrp, image, slug)
    const enriched = videos.map((v) => {
      const vPid = (v.productId || "").toLowerCase().trim();
      const isNone = !vPid || vPid === "none" || vPid === "all";

      const matchedProd =
        allProducts.find((p) => {
          const pId = String(p.id || "").toLowerCase().trim();
          const pSlug = String(p.slug || "").toLowerCase().trim();
          const pName = String(p.name || "").toLowerCase().trim();

          return (
            pId === vPid ||
            pSlug === vPid ||
            pName === vPid ||
            (pSlug.length > 0 && (pSlug.includes(vPid) || vPid.includes(pSlug)))
          );
        }) || targetProd;

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
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
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
