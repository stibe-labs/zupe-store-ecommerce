import { NextRequest, NextResponse } from "next/server";
import { getAllReviews, deleteReview, addReview, ProductReview } from "@/lib/reviewStore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId") || undefined;
    const source = searchParams.get("source") || undefined;
    const ratingStr = searchParams.get("rating");
    const rating = ratingStr ? Number(ratingStr) : undefined;
    const search = searchParams.get("search") || undefined;

    const reviews = await getAllReviews({ productId, source, rating, search });

    // Calculate analytics metrics across all current reviews
    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / totalReviews).toFixed(1)
        : "5.0";

    const bySource = {
      storefront: reviews.filter((r) => !r.source || r.source === "storefront").length,
      amazon: reviews.filter((r) => r.source === "amazon").length,
      flipkart: reviews.filter((r) => r.source === "flipkart").length,
      meesho: reviews.filter((r) => r.source === "meesho").length,
      imported: reviews.filter((r) => r.source && !["storefront", "amazon", "flipkart", "meesho"].includes(r.source)).length,
    };

    const ratingDistribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    return NextResponse.json({
      success: true,
      reviews,
      metrics: {
        totalReviews,
        avgRating,
        bySource,
        ratingDistribution,
      },
    });
  } catch (err: any) {
    console.error("Admin reviews GET error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Review ID is required" }, { status: 400 });
    }

    const deleted = await deleteReview(id);
    return NextResponse.json({ success: true, deleted, id });
  } catch (err: any) {
    console.error("Admin reviews DELETE error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, userName, userEmail, rating, title, comment, images, verifiedPurchase, createdAt, source } = body;

    if (!productId || !comment) {
      return NextResponse.json(
        { success: false, error: "Product ID and Review Comment are required" },
        { status: 400 }
      );
    }

    const review = await addReview({
      productId,
      userName: userName || "Verified Customer",
      userEmail,
      rating: Number(rating) || 5,
      title,
      comment,
      images,
      verifiedPurchase: verifiedPurchase !== false,
      createdAt: createdAt || new Date().toISOString(),
      source: source || "storefront",
    });

    return NextResponse.json({ success: true, review });
  } catch (err: any) {
    console.error("Admin reviews POST error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
