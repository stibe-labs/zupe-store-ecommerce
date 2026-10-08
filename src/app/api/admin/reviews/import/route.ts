import { NextRequest, NextResponse } from "next/server";
import { bulkAddReviews } from "@/lib/reviewStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reviews, defaultProductId, defaultSource } = body;

    if (!Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please provide an array of reviews to import." },
        { status: 400 }
      );
    }

    const normalizedReviews = reviews.map((r: any) => {
      const pid = (r.productId || r.product_id || r.product_slug || r.product_handle || defaultProductId || "").toString().trim();
      const name = (r.userName || r.user_name || r.reviewer_name || r.name || r.nickname || "Verified Customer").toString().trim();
      const ratingRaw = Number(r.rating || r.score || r.stars) || 5;
      const rating = Math.max(1, Math.min(5, Math.round(ratingRaw)));
      const title = (r.title || r.review_title || r.headline || "").toString().trim();
      const comment = (r.comment || r.body || r.review_body || r.review_text || r.description || "").toString().trim();
      
      // Parse images if array, JSON, or comma-separated string
      let imagesList: string[] = [];
      if (Array.isArray(r.images)) {
        imagesList = r.images.filter(Boolean);
      } else if (typeof r.images === "string" && r.images.trim()) {
        try {
          const parsed = JSON.parse(r.images);
          if (Array.isArray(parsed)) imagesList = parsed;
          else imagesList = [r.images.trim()];
        } catch {
          imagesList = r.images.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
      } else if (r.picture_urls) {
        imagesList = Array.isArray(r.picture_urls)
          ? r.picture_urls
          : String(r.picture_urls).split(",").map((s) => s.trim()).filter(Boolean);
      }

      // Format date if provided
      let createdAt = new Date().toISOString();
      const rawDate = r.createdAt || r.created_at || r.review_date || r.date;
      if (rawDate) {
        const parsedD = new Date(rawDate);
        if (!isNaN(parsedD.getTime())) {
          createdAt = parsedD.toISOString();
        }
      }

      const source = (r.source || r.platform || defaultSource || "import").toString().toLowerCase().trim();

      return {
        productId: pid,
        userName: name,
        userEmail: r.userEmail || r.user_email || r.email || undefined,
        rating,
        title: title || undefined,
        comment,
        images: imagesList,
        verifiedPurchase: r.verifiedPurchase !== false && r.verified_purchase !== false,
        createdAt,
        source,
      };
    });

    const validReviews = normalizedReviews.filter((r: any) => Boolean(r.productId && r.comment));

    if (validReviews.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid reviews found. Please ensure each row has a valid Product ID/Slug and Comment.",
        },
        { status: 400 }
      );
    }

    const result = await bulkAddReviews(validReviews);

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.inserted} reviews.`,
      inserted: result.inserted,
      errors: result.errors + (normalizedReviews.length - validReviews.length),
      totalReceived: normalizedReviews.length,
    });
  } catch (err: any) {
    console.error("Reviews import error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
