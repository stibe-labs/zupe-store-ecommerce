import { NextRequest, NextResponse } from "next/server";
import { bulkAddReviews } from "@/lib/reviewStore";
import { resolveProductMatch } from "@/lib/productMatcher";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import { executeD1Query } from "@/lib/d1";
import { uploadBase64Media } from "@/lib/r2";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    // 1. Fetch available products catalog for intelligent name/slug matching
    let catalog: any[] = [...DEFAULT_PRODUCTS];
    try {
      const rows = await executeD1Query<any>(
        `SELECT id, slug, name, category, price, poster_image, images FROM products`
      );
      if (rows && rows.length > 0) {
        catalog = rows.map((r) => ({
          id: String(r.id),
          slug: String(r.slug || r.id),
          name: String(r.name || r.id),
          category: r.category,
          price: Number(r.price) || 0,
          poster_image: r.poster_image,
        }));
      }
    } catch {
      // Use DEFAULT_PRODUCTS fallback
    }

    // 2. Process and normalize each review row
    const normalizedReviews = await Promise.all(
      reviews.map(async (r: any) => {
        // Resolve target product
        const rawProduct = (
          (defaultProductId && defaultProductId !== "auto" ? defaultProductId : null) ||
          r.productId ||
          r.product_id ||
          r.product_slug ||
          r.productslug ||
          r.product_name ||
          r.productname ||
          r.product_title ||
          r.producttitle ||
          r.product ||
          r.product_handle ||
          r.handle ||
          ""
        ).toString().trim();

        let resolvedPid = rawProduct;
        if (defaultProductId && defaultProductId !== "auto") {
          resolvedPid = defaultProductId;
        } else if (rawProduct) {
          const matchResult = resolveProductMatch(rawProduct, catalog);
          if (matchResult.resolvedSlug) {
            resolvedPid = matchResult.resolvedSlug;
          }
        }

        const name = (
          r.userName ||
          r.user_name ||
          r.reviewer_name ||
          r.reviewername ||
          r.name ||
          r.nickname ||
          r.author ||
          "Verified Customer"
        ).toString().trim();

        const ratingRaw = Number(r.rating || r.score || r.stars || r.star_rating) || 5;
        const rating = Math.max(1, Math.min(5, Math.round(ratingRaw)));

        const title = (
          r.title ||
          r.review_title ||
          r.reviewtitle ||
          r.headline ||
          r.subject ||
          ""
        ).toString().trim();

        const comment = (
          r.comment ||
          r.body ||
          r.review_body ||
          r.reviewbody ||
          r.review_text ||
          r.reviewtext ||
          r.description ||
          r.content ||
          ""
        ).toString().trim();

        // Parse customer product photos (supports customer_product_photo, data URLs, etc.)
        const rawImages =
          r.customer_product_photo ||
          r.customerproductphoto ||
          r.customer_product_photo_data_uri ||
          r.customerproductphotodatauri ||
          r.customer_photos ||
          r.customer_photo ||
          r.customer_photo_data_uri ||
          r.product_photo ||
          r.product_photos ||
          r.product_photo_data_uri ||
          r.photo_data_uri ||
          r.image_data_uri ||
          r.review_photo ||
          r.review_photos ||
          r.images ||
          r.photos ||
          r.picture_urls ||
          r.pictureurls ||
          r.imgurl ||
          r.img_url;

        let imagesList: string[] = [];
        if (Array.isArray(rawImages)) {
          imagesList = rawImages.filter(Boolean).map(String);
        } else if (typeof rawImages === "string" && rawImages.trim()) {
          const trimmed = rawImages.trim();
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              imagesList = parsed.filter(Boolean).map(String);
            } else {
              imagesList = [trimmed];
            }
          } catch {
            if (trimmed.startsWith("data:image/")) {
              imagesList = [trimmed];
            } else {
              imagesList = trimmed
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean);
            }
          }
        }

        // Convert base64 data URLs to R2 CDN URLs if storage is available
        const processedImages: string[] = [];
        for (const img of imagesList) {
          if (img.startsWith("data:image/")) {
            try {
              const r2Url = await uploadBase64Media(img, "images");
              processedImages.push(r2Url || img);
            } catch {
              processedImages.push(img); // Keep base64 safely if R2 unavailable
            }
          } else {
            processedImages.push(img);
          }
        }

        // Parse reviewer avatar photo if provided
        const rawReviewerPhoto =
          r.reviewer_photo ||
          r.reviewerphoto ||
          r.reviewer_photo_data_uri ||
          r.reviewerphotodatauri ||
          r.reviewer_avatar ||
          r.revieweravatar ||
          r.user_photo ||
          r.userphoto ||
          r.user_photo_data_uri ||
          r.user_avatar ||
          r.avatar ||
          r.avatar_data_uri ||
          "";

        let reviewerPhoto = typeof rawReviewerPhoto === "string" ? rawReviewerPhoto.trim() : "";
        if (reviewerPhoto.startsWith("data:image/")) {
          try {
            const r2AvatarUrl = await uploadBase64Media(reviewerPhoto, "images");
            if (r2AvatarUrl) reviewerPhoto = r2AvatarUrl;
          } catch {
            // Keep base64 safely
          }
        }

        // Format date if provided
        let createdAt = new Date().toISOString();
        const rawDate = r.createdAt || r.created_at || r.review_date || r.reviewdate || r.date;
        if (rawDate) {
          const parsedD = new Date(rawDate);
          if (!isNaN(parsedD.getTime())) {
            createdAt = parsedD.toISOString();
          }
        }

        const source = (
          r.source ||
          r.platform ||
          r.channel ||
          defaultSource ||
          "import"
        ).toString().toLowerCase().trim();

        return {
          productId: resolvedPid,
          userName: name,
          userEmail: r.userEmail || r.user_email || r.email || undefined,
          rating,
          title: title || undefined,
          comment,
          images: processedImages,
          reviewerPhoto: reviewerPhoto || undefined,
          verifiedPurchase: r.verifiedPurchase !== false && r.verified_purchase !== false,
          createdAt,
          source,
        };
      })
    );

    const validReviews = normalizedReviews.filter((r) => Boolean(r.productId && r.comment));

    if (validReviews.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid reviews found. Please ensure each row has a valid Product Name/Slug and Comment.",
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
