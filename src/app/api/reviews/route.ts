import { NextRequest, NextResponse } from "next/server";
import { getReviewsByProduct, addReview, markReviewHelpful, ProductReview } from "@/lib/reviewStore";

function computeReviewStats(reviews: ProductReview[]) {
  const total = reviews.length;
  if (total === 0) {
    return {
      averageRating: 5.0,
      totalReviews: 0,
      ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      ratingPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      customerPhotos: [] as string[],
    };
  }

  const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;
  const photos: string[] = [];

  for (const r of reviews) {
    const star = Math.max(1, Math.min(5, Math.round(r.rating)));
    counts[star] = (counts[star] || 0) + 1;
    sum += r.rating;
    if (r.images && Array.isArray(r.images)) {
      for (const img of r.images) {
        if (img && !photos.includes(img)) {
          photos.push(img);
        }
      }
    }
  }

  const avg = Number((sum / total).toFixed(1));
  const percentages: Record<number, number> = {
    5: Math.round(((counts[5] || 0) / total) * 100),
    4: Math.round(((counts[4] || 0) / total) * 100),
    3: Math.round(((counts[3] || 0) / total) * 100),
    2: Math.round(((counts[2] || 0) / total) * 100),
    1: Math.round(((counts[1] || 0) / total) * 100),
  };

  return {
    averageRating: avg,
    totalReviews: total,
    ratingCounts: counts,
    ratingPercentages: percentages,
    customerPhotos: photos,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID or slug is required" }, { status: 400 });
    }

    const reviews = await getReviewsByProduct(productId);
    const stats = computeReviewStats(reviews);

    return NextResponse.json({
      success: true,
      productId,
      reviews,
      stats,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support bulk review import (e.g. from Admin CSV / Amazon / Flipkart import)
    if (Array.isArray(body.reviews)) {
      const addedList: ProductReview[] = [];
      const pid = body.productId;

      for (const item of body.reviews) {
        if (!item.comment && !item.title) continue;
        const review = await addReview({
          productId: item.productId || pid,
          orderId: item.orderId || "IMPORTED",
          userName: item.userName || "Verified Customer",
          userEmail: item.userEmail,
          rating: Number(item.rating) || 5,
          title: item.title,
          comment: item.comment || item.title || "",
          images: Array.isArray(item.images) ? item.images : [],
          verifiedPurchase: item.verifiedPurchase !== false,
          createdAt: item.createdAt || new Date().toISOString(),
        });
        addedList.push(review);
      }

      const targetPid = pid || (addedList[0]?.productId);
      const allReviews = targetPid ? await getReviewsByProduct(targetPid) : [];
      const stats = computeReviewStats(allReviews);

      return NextResponse.json({
        success: true,
        importedCount: addedList.length,
        stats,
        message: `Successfully imported ${addedList.length} reviews!`,
      });
    }

    const { productId, orderId, userName, userEmail, rating, title, comment, images, verifiedPurchase, isAdminImport } = body;

    if (!productId || !comment) {
      return NextResponse.json({ success: false, error: "Product ID and comment are required" }, { status: 400 });
    }

    // Unless it's an admin import or contains a verified order, check buyer verification
    const isVerified = Boolean(orderId || isAdminImport || verifiedPurchase);

    const newReview = await addReview({
      productId,
      orderId: orderId || (isAdminImport ? "ADMIN_IMPORT" : undefined),
      userName: userName || "Verified Buyer",
      userEmail,
      rating: Number(rating) || 5,
      title,
      comment,
      images,
      verifiedPurchase: isVerified,
    });

    const allReviews = await getReviewsByProduct(productId);
    const stats = computeReviewStats(allReviews);

    return NextResponse.json({
      success: true,
      review: newReview,
      stats,
      message: "Review submitted successfully and is now live!",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { reviewId, action } = body;

    if (action === "helpful" && reviewId) {
      const newCount = await markReviewHelpful(reviewId);
      return NextResponse.json({ success: true, helpfulCount: newCount });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
