import { NextRequest, NextResponse } from "next/server";
import {
  getAllVideos,
  addVideo,
  updateVideo,
  deleteVideo,
  getHomePageVideoIds,
  saveHomePageVideoIds,
} from "@/lib/videoStore";

import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import { executeD1Query } from "@/lib/d1";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const [videos, homeVideoIds] = await Promise.all([
      getAllVideos(),
      getHomePageVideoIds(),
    ]);

    // Query D1 products table to merge with DEFAULT_PRODUCTS
    let allProducts: any[] = [...DEFAULT_PRODUCTS];
    try {
      const d1Products = await executeD1Query<any>("SELECT * FROM products");
      if (d1Products && d1Products.length > 0) {
        allProducts = [...d1Products, ...DEFAULT_PRODUCTS];
      }
    } catch {}

    const enrichedVideos = videos.map((v) => {
      const vPid = (v.productId || "").toLowerCase().trim();
      const matchedProd = allProducts.find((p) => {
        const pId = String(p.id || "").toLowerCase().trim();
        const pSlug = String(p.slug || "").toLowerCase().trim();
        return pId === vPid || pSlug === vPid;
      });

      let posterImg =
        v.posterUrl ||
        matchedProd?.poster_image ||
        (Array.isArray(matchedProd?.images) && matchedProd.images[0]);

      if (!posterImg && typeof matchedProd?.images === "string") {
        try {
          const parsed = JSON.parse(matchedProd.images);
          if (Array.isArray(parsed) && parsed[0]) posterImg = parsed[0];
        } catch {}
      }

      return {
        ...v,
        productName: matchedProd?.name || v.productName || (vPid === "all" ? "All Products" : "No Product Attached"),
        productPrice: matchedProd?.price !== undefined ? Number(matchedProd.price) : v.productPrice,
        productMrp: matchedProd?.mrp !== undefined ? Number(matchedProd.mrp) : v.productMrp,
        productSlug: matchedProd?.slug || matchedProd?.id || v.productSlug,
        productImage: posterImg || v.productImage || "",
        posterUrl: posterImg || v.posterUrl || "",
      };
    });

    return NextResponse.json(
      {
        success: true,
        videos: enrichedVideos,
        homeVideoIds,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load videos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "set_home_videos" && Array.isArray(body.homeVideoIds)) {
      const updated = await saveHomePageVideoIds(body.homeVideoIds);
      return NextResponse.json({
        success: true,
        homeVideoIds: updated,
      });
    }

    if (body.action === "toggle_home_video" && body.id) {
      const current = await getHomePageVideoIds();
      const next = current.includes(body.id)
        ? current.filter((id) => id !== body.id)
        : [...current, body.id];
      const updated = await saveHomePageVideoIds(next);
      return NextResponse.json({
        success: true,
        homeVideoIds: updated,
      });
    }

    if (body.action === "update" && body.id) {
      const updated = await updateVideo(body.id, body);
      return NextResponse.json({
        success: true,
        video: updated,
      });
    }

    if (!body.title || !body.videoUrl) {
      return NextResponse.json(
        { success: false, error: "Title and Video URL are required" },
        { status: 400 }
      );
    }

    const created = await addVideo({
      productId: body.productId || "all",
      title: body.title,
      videoUrl: body.videoUrl,
      posterUrl: body.posterUrl || "",
      viewsText: body.viewsText || "24.5k",
      badge: body.badge || "NEW",
      active: body.active !== false,
    });

    return NextResponse.json({
      success: true,
      video: created,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save video" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing video id" },
        { status: 400 }
      );
    }

    await deleteVideo(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete video" },
      { status: 500 }
    );
  }
}
