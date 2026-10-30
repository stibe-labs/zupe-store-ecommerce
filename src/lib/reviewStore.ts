// Product Reviews Data Layer (Cloudflare D1 + In-Memory Fallback)
import { executeD1Query } from "@/lib/d1";

export interface ProductReview {
  id: string;
  productId: string;
  orderId?: string;
  userName: string;
  userEmail?: string;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  images?: string[]; // Array of image URLs / Data URLs
  verifiedPurchase: boolean;
  createdAt: string;
  helpfulCount?: number;
  source?: string; // 'storefront' | 'amazon' | 'flipkart' | 'meesho' | 'judge.me' | 'loox' | 'custom'
}

export const SEED_REVIEWS: ProductReview[] = [
  {
    id: "rev-tj-1",
    productId: "turkiye-jam",
    userName: "Anjali M.",
    userEmail: "anjali.m@gmail.com",
    rating: 5,
    title: "Genuine Turkish Paste - Fast Delivery",
    comment:
      "Arrived in two days, well wrapped, nothing leaked. The sachets are easy to carry, and I ordered a bigger pack the next week.",
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    helpfulCount: 28,
    source: "storefront",
  },
  {
    id: "rev-tj-2",
    productId: "turkiye-jam",
    userName: "Rahul K.",
    userEmail: "rahul.k@gmail.com",
    rating: 5,
    title: "Original seal and prompt COD",
    comment:
      "Neat packing and the label was clear. Cash on delivery made it easy for my family to trust, and the delivery boy called before reaching.",
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    helpfulCount: 19,
    source: "storefront",
  },
  {
    id: "rev-tj-3",
    productId: "turkiye-jam",
    userName: "Neha S.",
    userEmail: "neha.s@gmail.com",
    rating: 5,
    title: "Authentic Themra product",
    comment:
      "I started with the 2 pack just to try. The ordering was simple, delivery was quick and everything looked exactly like the photos.",
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    helpfulCount: 14,
    source: "storefront",
  },
];

// In-Memory store for fast local & worker fallback
let inMemoryReviews: ProductReview[] = [...SEED_REVIEWS];

export async function ensureReviewTable(): Promise<void> {
  try {
    await executeD1Query(`
      CREATE TABLE IF NOT EXISTS product_reviews (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        order_id TEXT,
        user_name TEXT NOT NULL,
        user_email TEXT,
        rating INTEGER NOT NULL,
        title TEXT,
        comment TEXT NOT NULL,
        images TEXT,
        verified_purchase INTEGER DEFAULT 1,
        helpful_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        source TEXT DEFAULT 'storefront'
      );
    `);
  } catch (err) {
    console.warn("Could not ensure product_reviews table in D1:", err);
  }
}

/**
 * Get all reviews matching a product ID or slug
 */
export async function getReviewsByProduct(productId: string): Promise<ProductReview[]> {
  const rawId = decodeURIComponent(productId || "").trim().toLowerCase();
  const slugId = rawId.replace(/[\s_]+/g, "-");
  const cleanId = rawId.replace(/[-_ ]+/g, " ");

  const isMatching = (pid: string) => {
    const pRaw = (pid || "").toLowerCase().trim();
    if (!pRaw) return false;
    const pSlug = pRaw.replace(/[\s_]+/g, "-");
    const pClean = pRaw.replace(/[-_ ]+/g, " ");

    if (pRaw === rawId || pSlug === slugId || pClean === cleanId) return true;
    if (pClean && cleanId && (pClean === cleanId || pClean.includes(cleanId) || cleanId.includes(pClean))) return true;
    if (pSlug && slugId && (pSlug === slugId || pSlug.includes(slugId) || slugId.includes(pSlug))) return true;

    // Known alias mappings
    const aliases: Record<string, string[]> = {
      "mini-portable-steam-iron": ["mini-steam-iron", "steam-iron", "mini steam iron", "portable steam iron"],
      "mini-steam-iron": ["mini-portable-steam-iron", "steam-iron", "mini portable steam iron", "portable steam iron"],
      "dynamic-water-ripple-night-light": ["ripple-lamp", "water-ripple-lamp", "ripple light"],
      "portable-menstrual-heating-pad": ["menstrual-heating-pad", "heating-pad"],
      "car-fragrance-helicopter": ["helicopter-perfume", "solar-helicopter"],
      "tf20-multipurpose-powerbank-with-airpods": ["powerbank-earbuds", "tf20-powerbank"],
    };

    const keysToCheck = [slugId, rawId, cleanId];
    for (const key of keysToCheck) {
      const mapped = aliases[key] || [];
      if (
        mapped.some((m) => {
          const mSlug = m.replace(/[\s_]+/g, "-");
          const mClean = m.replace(/[-_ ]+/g, " ");
          return (
            m === pRaw ||
            mSlug === pSlug ||
            mClean === pClean ||
            pClean.includes(mClean) ||
            mClean.includes(pClean)
          );
        })
      ) {
        return true;
      }
    }

    return false;
  };

  // 1. Try D1 table query
  try {
    const rows = await executeD1Query<any>(
      `SELECT * FROM product_reviews ORDER BY created_at DESC`
    );

    if (rows && rows.length > 0) {
      const d1Reviews: ProductReview[] = rows
        .filter((r) => isMatching(String(r.product_id)))
        .map((r) => {
          let parsedImages: string[] = [];
          if (r.images) {
            try {
              parsedImages = typeof r.images === "string" ? JSON.parse(r.images) : r.images;
            } catch {
              parsedImages = [];
            }
          }
          return {
            id: String(r.id),
            productId: String(r.product_id),
            orderId: r.order_id || undefined,
            userName: r.user_name || "Verified Customer",
            userEmail: r.user_email || undefined,
            rating: Number(r.rating) || 5,
            title: r.title || undefined,
            comment: r.comment || "",
            images: Array.isArray(parsedImages) ? parsedImages : [],
            verifiedPurchase: r.verified_purchase !== 0,
            createdAt: r.created_at || new Date().toISOString(),
            helpfulCount: Number(r.helpful_count) || 0,
            source: r.source || "storefront",
          };
        });

      // Merge with memory reviews (user-submitted reviews take priority)
      const existingIds = new Set(d1Reviews.map((r) => r.id));
      const memoryMatches = inMemoryReviews.filter(
        (r) => isMatching(r.productId) && !existingIds.has(r.id)
      );

      return [...memoryMatches, ...d1Reviews];
    }
  } catch (err) {
    console.warn("D1 getReviewsByProduct query failed, using memory store:", err);
  }

  // 2. Memory store fallback
  const matches = inMemoryReviews.filter((r) => isMatching(r.productId));

  return matches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Get all reviews with optional filters (for Super Admin dashboard)
 */
export async function getAllReviews(options?: {
  productId?: string;
  source?: string;
  rating?: number;
  search?: string;
}): Promise<ProductReview[]> {
  let all: ProductReview[] = [];

  try {
    const rows = await executeD1Query<any>(
      `SELECT * FROM product_reviews ORDER BY created_at DESC`
    );

    if (rows && rows.length > 0) {
      const d1Reviews: ProductReview[] = rows.map((r) => {
        let parsedImages: string[] = [];
        if (r.images) {
          try {
            parsedImages = typeof r.images === "string" ? JSON.parse(r.images) : r.images;
          } catch {
            parsedImages = [];
          }
        }
        return {
          id: String(r.id),
          productId: String(r.product_id),
          orderId: r.order_id || undefined,
          userName: r.user_name || "Verified Customer",
          userEmail: r.user_email || undefined,
          rating: Number(r.rating) || 5,
          title: r.title || undefined,
          comment: r.comment || "",
          images: Array.isArray(parsedImages) ? parsedImages : [],
          verifiedPurchase: r.verified_purchase !== 0,
          createdAt: r.created_at || new Date().toISOString(),
          helpfulCount: Number(r.helpful_count) || 0,
          source: r.source || "storefront",
        };
      });

      const existingIds = new Set(d1Reviews.map((r) => r.id));
      const memoryUnique = inMemoryReviews.filter((r) => !existingIds.has(r.id));
      all = [...memoryUnique, ...d1Reviews];
    } else {
      all = [...inMemoryReviews];
    }
  } catch (err) {
    console.warn("D1 getAllReviews failed, falling back to memory:", err);
    all = [...inMemoryReviews];
  }

  // Apply filters
  if (options) {
    if (options.productId && options.productId !== "all") {
      const pid = options.productId.toLowerCase().trim();
      all = all.filter((r) => r.productId.toLowerCase() === pid || r.productId.toLowerCase().includes(pid));
    }
    if (options.source && options.source !== "all") {
      const src = options.source.toLowerCase().trim();
      all = all.filter((r) => (r.source || "storefront").toLowerCase() === src);
    }
    if (options.rating && options.rating > 0) {
      all = all.filter((r) => r.rating === Number(options.rating));
    }
    if (options.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      all = all.filter(
        (r) =>
          r.userName.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q) ||
          (r.title && r.title.toLowerCase().includes(q)) ||
          r.productId.toLowerCase().includes(q)
      );
    }
  }

  return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Add a new product review
 */
export async function addReview(newRev: {
  productId: string;
  orderId?: string;
  userName: string;
  userEmail?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  verifiedPurchase?: boolean;
  createdAt?: string;
  source?: string;
}): Promise<ProductReview> {
  const review: ProductReview = {
    id: "rev-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 6),
    productId: newRev.productId.trim(),
    orderId: newRev.orderId?.trim(),
    userName: newRev.userName.trim() || "Verified Customer",
    userEmail: newRev.userEmail?.trim(),
    rating: Math.max(1, Math.min(5, Number(newRev.rating) || 5)),
    title: (newRev.title || "").trim(),
    comment: newRev.comment.trim(),
    images: Array.isArray(newRev.images) ? newRev.images.filter(Boolean) : [],
    verifiedPurchase: newRev.verifiedPurchase !== false,
    createdAt: newRev.createdAt || new Date().toISOString(),
    helpfulCount: 0,
    source: (newRev.source || "storefront").toLowerCase().trim(),
  };

  // Add to memory list at the top
  inMemoryReviews = [review, ...inMemoryReviews];

  // Persist to D1
  try {
    await executeD1Query(
      `INSERT INTO product_reviews 
       (id, product_id, order_id, user_name, user_email, rating, title, comment, images, verified_purchase, helpful_count, created_at, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        review.id,
        review.productId,
        review.orderId || null,
        review.userName,
        review.userEmail || null,
        review.rating,
        review.title || null,
        review.comment,
        JSON.stringify(review.images || []),
        review.verifiedPurchase ? 1 : 0,
        review.createdAt,
        review.source,
      ]
    );
  } catch (err) {
    console.warn("Failed to insert review into D1 product_reviews:", err);
  }

  return review;
}

/**
 * Bulk add reviews (for CSV / Excel import)
 */
export async function bulkAddReviews(
  reviewsList: Array<{
    productId: string;
    userName?: string;
    userEmail?: string;
    rating: number;
    title?: string;
    comment: string;
    images?: string[];
    verifiedPurchase?: boolean;
    createdAt?: string;
    source?: string;
  }>
): Promise<{ inserted: number; errors: number }> {
  let inserted = 0;
  let errors = 0;

  for (const item of reviewsList) {
    try {
      if (!item.productId || !item.comment) {
        errors++;
        continue;
      }
      await addReview({
        productId: item.productId,
        userName: item.userName || "Verified Customer",
        userEmail: item.userEmail,
        rating: Math.max(1, Math.min(5, Number(item.rating) || 5)),
        title: item.title,
        comment: item.comment,
        images: item.images,
        verifiedPurchase: item.verifiedPurchase !== false,
        createdAt: item.createdAt,
        source: item.source || "import",
      });
      inserted++;
    } catch {
      errors++;
    }
  }

  return { inserted, errors };
}

/**
 * Delete a review by ID
 */
export async function deleteReview(reviewId: string): Promise<boolean> {
  inMemoryReviews = inMemoryReviews.filter((r) => r.id !== reviewId);
  try {
    await executeD1Query(`DELETE FROM product_reviews WHERE id = ?`, [reviewId]);
    return true;
  } catch (err) {
    console.warn("Failed to delete review from D1:", err);
    return false;
  }
}

/**
 * Increment helpful count for a review
 */
export async function markReviewHelpful(reviewId: string): Promise<number> {
  const mem = inMemoryReviews.find((r) => r.id === reviewId);
  if (mem) {
    mem.helpfulCount = (mem.helpfulCount || 0) + 1;
  }

  try {
    await executeD1Query(
      `UPDATE product_reviews SET helpful_count = helpful_count + 1 WHERE id = ?`,
      [reviewId]
    );
  } catch {}

  return mem?.helpfulCount || 1;
}

/**
 * Get aggregated review stats (count & average rating) for all products
 */
// TTL cache for review stats map — expensive D1 GROUP BY query
let reviewStatsCachedAt = 0;
const REVIEW_STATS_TTL_MS = 60_000; // 60 seconds
let cachedStatsMap: Map<string, { count: number; rating: number }> | null = null;

export async function getProductReviewStatsMap(): Promise<Map<string, { count: number; rating: number }>> {
  const now = Date.now();
  if (cachedStatsMap && now - reviewStatsCachedAt < REVIEW_STATS_TTL_MS) {
    return cachedStatsMap;
  }

  const statsMap = new Map<string, { count: number; sum: number; rating: number }>();

  // 1. Accumulate from memory fallback
  for (const r of inMemoryReviews) {
    const key = r.productId.toLowerCase().trim();
    const existing = statsMap.get(key) || { count: 0, sum: 0, rating: 5.0 };
    existing.count += 1;
    existing.sum += Number(r.rating) || 5;
    existing.rating = Number((existing.sum / existing.count).toFixed(1));
    statsMap.set(key, existing);
  }

  // 2. Query D1 for actual database stats
  try {
    const rows = await executeD1Query<any>(
      `SELECT lower(product_id) as pid, COUNT(*) as c, AVG(rating) as avg_rating 
       FROM product_reviews 
       GROUP BY lower(product_id)`
    );

    if (rows && Array.isArray(rows) && rows.length > 0) {
      for (const row of rows) {
        const key = String(row.pid || "").trim();
        const count = Number(row.c) || 0;
        const avg = Number(Number(row.avg_rating || 5).toFixed(1));
        if (key && count > 0) {
          statsMap.set(key, { count, sum: count * avg, rating: avg });
        }
      }
    }
  } catch (err) {
    console.warn("Could not query review stats map from D1:", err);
  }

  const finalMap = new Map<string, { count: number; rating: number }>();
  statsMap.forEach((val, key) => {
    finalMap.set(key, { count: val.count, rating: val.rating });
  });

  // Cache the result
  cachedStatsMap = finalMap;
  reviewStatsCachedAt = Date.now();

  return finalMap;
}

/**
 * Get aggregated review stats for a single product ID or slug
 */
export async function getProductReviewStats(productId: string): Promise<{ count: number; rating: number } | null> {
  const norm = productId.toLowerCase().trim();
  const map = await getProductReviewStatsMap();

  if (map.has(norm)) return map.get(norm)!;

  for (const [key, val] of map.entries()) {
    if (key === norm || key.includes(norm) || norm.includes(key)) {
      return val;
    }
  }

  return null;
}
