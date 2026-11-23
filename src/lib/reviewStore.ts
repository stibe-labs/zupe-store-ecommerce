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
  source?: string; // 'storefront' | 'amazon' | 'flipkart' | 'meesho' | 'custom'
}

export const SEED_REVIEWS: ProductReview[] = [
  {
    id: "rev-wpi-1",
    productId: "whey-protein-isolate",
    orderId: "ORD-VL-98214",
    userName: "Vikramaditya S.",
    userEmail: "vikram.s@outlook.com",
    rating: 5,
    title: "Super clean isolate, no bloating at all",
    comment:
      "I have sensitive digestion and most concentrates cause gas, but this isolate digests like water. Mixes in seconds with 250ml cold water without lumps. Real 27g protein per scoop confirmed by my trainer.",
    images: [],
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    helpfulCount: 32,
    source: "storefront",
  },
  {
    id: "rev-wpi-2",
    productId: "whey-protein-isolate",
    orderId: "ORD-VL-97430",
    userName: "Priya Nambiar",
    userEmail: "priya.n@gmail.com",
    rating: 5,
    title: "Authentic seal and speedy delivery",
    comment:
      "Ordered on Monday and received in Bangalore on Wednesday. The QR authentication code verified instantly on the brand portal. Taste is smooth, not overly sweet.",
    images: [],
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    helpfulCount: 24,
    source: "storefront",
  },
  {
    id: "rev-date-1",
    productId: "golden-jar-glossy-dates",
    orderId: "ORD-VL-98319",
    userName: "Fatima Zahra",
    userEmail: "fatima.z@gmail.com",
    rating: 5,
    title: "Melt in mouth jumbo Medjool dates!",
    comment:
      "These are genuinely grade-A jumbo Medjool dates. Not dry or sugary like supermarket ones. Soft, chewy caramel texture. The gold lid glass jar looks regal.",
    images: [],
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    helpfulCount: 31,
    source: "storefront",
  },
  {
    id: "rev-tee-1",
    productId: "red-vl-athletic-tee",
    orderId: "ORD-VL-98305",
    userName: "Karthik Raja",
    userEmail: "karthik.r@gmail.com",
    rating: 5,
    title: "Heavyweight 240 GSM cotton feels unbelievable",
    comment:
      "The fabric thickness is amazing - structured yet breathable during bench and deadlifts. Shoulder taper makes your physique look great. Silicone VL monogram is premium.",
    images: [],
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    helpfulCount: 35,
    source: "storefront",
  },
  {
    id: "rev-cashew-1",
    productId: "glass-jar-cashews",
    orderId: "ORD-VL-98188",
    userName: "Anand Krishnan",
    userEmail: "anand.k@gmail.com",
    rating: 5,
    title: "Huge W180 King size cashews - Super crunchy!",
    comment:
      "Hard to find true W180 export size in India. These are massive, roasted without heavy oil, and salted just right with pink salt. The gold lid jar preserves crunchiness completely.",
    images: [],
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    helpfulCount: 29,
    source: "storefront",
  },
  {
    id: "rev-prf-1",
    productId: "frosted-gunmetal-parfum",
    orderId: "ORD-VL-98360",
    userName: "Farhan Qureshi",
    userEmail: "farhan.q@gmail.com",
    rating: 5,
    title: "Magnetic masculine scent, 9+ hours projection",
    comment:
      "Opens with crisp Italian bergamot and settles into smoky vetiver and amber. Got 3 compliments on my first day wearing it to office. Heavy glass bottle with gunmetal cap.",
    images: [],
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    helpfulCount: 36,
    source: "storefront",
  },
];

// In-Memory store for fast local & worker fallback
let inMemoryReviews: ProductReview[] = [...SEED_REVIEWS];

let tableEnsured = false;

export async function ensureReviewTable(): Promise<void> {
  if (tableEnsured) return;
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
      CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
      CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON product_reviews(created_at);
    `);
    tableEnsured = true;
  } catch (err) {
    console.warn("Could not ensure product_reviews table in D1:", err);
  }
}

/**
 * Normalization helper for product ID / slug matching
 */
function isProductMatch(targetIdOrSlug: string, candidate: string): boolean {
  const rawTarget = decodeURIComponent(targetIdOrSlug || "").trim().toLowerCase();
  const rawCand = (candidate || "").trim().toLowerCase();
  if (!rawTarget || !rawCand) return false;

  const targetSlug = rawTarget.replace(/[\s_]+/g, "-");
  const targetClean = rawTarget.replace(/[-_ ]+/g, "");
  const candSlug = rawCand.replace(/[\s_]+/g, "-");
  const candClean = rawCand.replace(/[-_ ]+/g, "");

  if (rawTarget === rawCand || targetSlug === candSlug || targetClean === candClean) return true;
  if (targetClean.length >= 4 && candClean.length >= 4 && (targetClean.includes(candClean) || candClean.includes(targetClean))) {
    return true;
  }

  // Known Vittallifestyle alias groups
  const aliases: Record<string, string[]> = {
    "whey-protein-isolate": ["whey-protein", "isolate-protein", "vittal-whey", "whey"],
    "on-gold-standard-whey": ["gold-standard-whey", "on-whey", "optimum-nutrition-whey"],
    "gnc-creatine-monohydrate": ["creatine-monohydrate", "gnc-creatine", "creatine"],
    "sports-research-omega3": ["omega-3", "fish-oil", "omega3-fish-oil", "omega3"],
    "golden-jar-glossy-dates": ["medjool-dates", "glossy-dates", "gold-lid-dates", "royal-saudi-dates"],
    "premium-royal-dates": ["royal-dates", "saudi-dates", "dates"],
    "glass-jar-cashews": ["roasted-cashews", "jumbo-cashews", "cashews"],
    "golden-ferrero-rocher-box": ["ferrero-rocher", "ferrero-box", "chocolate-truffles"],
    "premium-black-candy-box": ["black-candy-box", "candy-box"],
    "red-vl-athletic-tee": ["crimson-tee", "vl-athletic-tee", "red-tshirt"],
    "oversized-athletic-tshirt": ["oversized-tee", "athletic-tshirt"],
    "luxury-red-lipstick": ["scarlet-lipstick", "velvet-matte-lipstick", "red-lipstick"],
    "frosted-gunmetal-parfum": ["gunmetal-parfum", "eau-de-parfum", "mens-perfume"],
    "nike-air-zoom-sneaker": ["air-zoom-sneakers", "nike-sneakers", "running-shoes"],
  };

  const keysToCheck = [rawTarget, targetSlug];
  for (const key of keysToCheck) {
    const mapped = aliases[key] || [];
    if (
      mapped.some((m) => {
        const mSlug = m.replace(/[\s_]+/g, "-");
        return m === rawCand || mSlug === candSlug || candClean.includes(m.replace(/[-_ ]+/g, ""));
      })
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Get all reviews matching a product ID or slug
 */
export async function getReviewsByProduct(productId: string): Promise<ProductReview[]> {
  const normId = decodeURIComponent(productId || "").trim().toLowerCase();
  await ensureReviewTable();

  // 1. Try D1 table query
  try {
    const rows = await executeD1Query<any>(
      `SELECT * FROM product_reviews ORDER BY created_at DESC`
    );

    if (rows && Array.isArray(rows) && rows.length > 0) {
      const d1Reviews: ProductReview[] = rows
        .filter((r) => isProductMatch(normId, String(r.product_id)))
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
        (r) => isProductMatch(normId, r.productId) && !existingIds.has(r.id)
      );

      return [...memoryMatches, ...d1Reviews].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch (err) {
    console.warn("D1 getReviewsByProduct query failed, using memory store:", err);
  }

  // 2. Memory store fallback
  const matches = inMemoryReviews.filter((r) => isProductMatch(normId, r.productId));
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
  await ensureReviewTable();
  let all: ProductReview[] = [];

  try {
    const rows = await executeD1Query<any>(
      `SELECT * FROM product_reviews ORDER BY created_at DESC`
    );

    if (rows && Array.isArray(rows) && rows.length > 0) {
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
      all = all.filter((r) => isProductMatch(pid, r.productId));
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
 * Invalidate in-memory review statistics cache
 */
let reviewStatsCachedAt = 0;
const REVIEW_STATS_TTL_MS = 30_000; // 30 seconds
let cachedStatsMap: Map<string, { count: number; rating: number }> | null = null;

export function invalidateReviewCache(): void {
  cachedStatsMap = null;
  reviewStatsCachedAt = 0;
}

/**
 * Synchronize a product's rating and review_count in the products table in D1
 */
export async function syncProductReviewStats(productId: string): Promise<{ count: number; rating: number } | null> {
  invalidateReviewCache();
  const rawId = (productId || "").trim().toLowerCase();
  const slugId = rawId.replace(/[\s_]+/g, "-");

  try {
    const rows = await executeD1Query<any>(
      `SELECT COUNT(*) as c, AVG(rating) as avg_rating FROM product_reviews 
       WHERE lower(product_id) = lower(?) OR lower(product_id) = lower(?)`,
      [rawId, slugId]
    );

    const count = Number(rows?.[0]?.c) || 0;
    const avg = count > 0 ? Number(Number(rows[0].avg_rating || 5).toFixed(1)) : 5.0;

    await executeD1Query(
      `UPDATE products SET rating = ?, review_count = ? 
       WHERE lower(id) = lower(?) OR lower(slug) = lower(?) OR lower(id) = lower(?) OR lower(slug) = lower(?)`,
      [avg, count, rawId, slugId, rawId, slugId]
    );

    return { count, rating: avg };
  } catch (err) {
    console.warn("Could not syncProductReviewStats in D1:", err);
    return null;
  }
}

/**
 * Synchronize all products with their actual review counts & average ratings
 */
export async function syncAllProductReviewStats(): Promise<void> {
  invalidateReviewCache();
  try {
    await executeD1Query(`
      UPDATE products SET 
        rating = (
          SELECT round(avg(rating), 1) 
          FROM product_reviews 
          WHERE lower(product_id) = lower(products.id) OR lower(product_id) = lower(products.slug)
        ), 
        review_count = (
          SELECT count(*) 
          FROM product_reviews 
          WHERE lower(product_id) = lower(products.id) OR lower(product_id) = lower(products.slug)
        ) 
      WHERE id IN (SELECT DISTINCT product_id FROM product_reviews) 
         OR slug IN (SELECT DISTINCT product_id FROM product_reviews);

      UPDATE products SET 
        review_count = 0, 
        rating = 5.0 
      WHERE id NOT IN (SELECT DISTINCT product_id FROM product_reviews) 
        AND slug NOT IN (SELECT DISTINCT product_id FROM product_reviews);
    `);
  } catch (err) {
    console.warn("Could not syncAllProductReviewStats in D1:", err);
  }
}

/**
 * Add a new product review and automatically update product table
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
  await ensureReviewTable();

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

  // Add to memory list
  inMemoryReviews = [review, ...inMemoryReviews];
  invalidateReviewCache();

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

    // Auto-sync product row in D1
    await syncProductReviewStats(review.productId);
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
  await ensureReviewTable();
  let inserted = 0;
  let errors = 0;
  const affectedProducts = new Set<string>();

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
      affectedProducts.add(item.productId);
      inserted++;
    } catch {
      errors++;
    }
  }

  // Trigger sync for all affected products
  for (const pid of affectedProducts) {
    await syncProductReviewStats(pid);
  }

  invalidateReviewCache();
  return { inserted, errors };
}

/**
 * Delete a review by ID and re-sync product row
 */
export async function deleteReview(reviewId: string): Promise<boolean> {
  const target = inMemoryReviews.find((r) => r.id === reviewId);
  inMemoryReviews = inMemoryReviews.filter((r) => r.id !== reviewId);
  invalidateReviewCache();

  try {
    let pid = target?.productId;
    if (!pid) {
      const rows = await executeD1Query<any>(
        `SELECT product_id FROM product_reviews WHERE id = ?`,
        [reviewId]
      );
      if (rows && rows[0]?.product_id) {
        pid = rows[0].product_id;
      }
    }

    await executeD1Query(`DELETE FROM product_reviews WHERE id = ?`, [reviewId]);

    if (pid) {
      await syncProductReviewStats(pid);
    }
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
export async function getProductReviewStatsMap(
  forceRefresh: boolean = false
): Promise<Map<string, { count: number; rating: number }>> {
  const now = Date.now();
  if (!forceRefresh && cachedStatsMap && now - reviewStatsCachedAt < REVIEW_STATS_TTL_MS) {
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
        const key = String(row.pid || "").trim().toLowerCase();
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

  cachedStatsMap = finalMap;
  reviewStatsCachedAt = Date.now();

  return finalMap;
}

/**
 * Get aggregated review stats for a single product ID or slug
 */
export async function getProductReviewStats(productId: string): Promise<{ count: number; rating: number } | null> {
  const norm = (productId || "").toLowerCase().trim();
  const slug = norm.replace(/[\s_]+/g, "-");
  const map = await getProductReviewStatsMap();

  if (map.has(norm)) return map.get(norm)!;
  if (map.has(slug)) return map.get(slug)!;

  for (const [key, val] of map.entries()) {
    if (isProductMatch(norm, key)) {
      return val;
    }
  }

  return null;
}
