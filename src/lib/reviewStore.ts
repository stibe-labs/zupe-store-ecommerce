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
  // Dynamic Water Ripple Night Light
  {
    id: "rev-ripple-1",
    productId: "dynamic-water-ripple-night-light",
    orderId: "ord_zupe_1001",
    userName: "Rohit Sharma",
    userEmail: "rohit.s@gmail.com",
    rating: 5,
    title: "Mesmerizing visual effect in bedroom!",
    comment:
      "The rotating water ripple projection looks absolutely cinematic on the ceiling. Acrylic crystal body feels heavy and luxurious, and the solid wood base gives it a premium organic touch. Remote control makes changing colors super easy.",
    images: ["/products/ripple/ripple-amber.jpg", "/products/ripple/ripple-amber-angle2.jpg"],
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    helpfulCount: 24,
    source: "storefront",
  },
  {
    id: "rev-ripple-2",
    productId: "water-ripple-lamp",
    orderId: "ord_zupe_1002",
    userName: "Ananya Patel",
    userEmail: "ananya.p@gmail.com",
    rating: 5,
    title: "10/10 aesthetic, exactly like the videos",
    comment:
      "Arrived in 2 days in sturdy bubble packaging. 16 different color modes let me set the mood from peaceful ocean blue to warm amber night light. Guests always compliment this piece!",
    images: ["/products/ripple/ripple-blue.jpg"],
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    helpfulCount: 18,
    source: "storefront",
  },
  {
    id: "rev-ripple-3",
    productId: "dynamic-water-ripple-night-light",
    userName: "Vikram Menon",
    rating: 4,
    title: "Great build quality and brightness",
    comment:
      "Very relaxing lighting for evening wind-down or reading. Power cable is decent length. Highly recommended for modern room decor.",
    images: ["/products/ripple/ripple-pink.jpg"],
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    helpfulCount: 9,
    source: "amazon",
  },

  // TF20 Multipurpose Powerbank with Airpods
  {
    id: "rev-powerbank-1",
    productId: "tf20-multipurpose-powerbank-with-airpods",
    userName: "Arjun Nair",
    rating: 5,
    title: "Game changer for daily commute & travel",
    comment:
      "Charges my phone while keeping the earbuds fully juiced. Audio quality has punchy bass and clear vocals. The digital percentage LED display is extremely handy.",
    images: ["/products/powerbank-earbuds.jpg"],
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    helpfulCount: 31,
    source: "flipkart",
  },
  {
    id: "rev-powerbank-2",
    productId: "powerbank-earbuds",
    userName: "Sneha Kapoor",
    rating: 5,
    title: "Sleek compact design, connects in 1 second",
    comment:
      "Super convenient 2-in-1 innovation. Battery backup easily lasts through my full weekend trip. Earbuds fit securely without falling out during workouts.",
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 9 * 86400000).toISOString(),
    helpfulCount: 14,
    source: "storefront",
  },

  // Solar Helicopter Car Fragrance
  {
    id: "rev-heli-1",
    productId: "car-fragrance-helicopter",
    userName: "Priya Deshmukh",
    rating: 5,
    title: "Solar rotor spins like real aircraft in sunlight!",
    comment:
      "Looks top-tier on my car dashboard. Rotor starts spinning automatically as soon as direct daylight hits the solar panel. Cologne ring smells refreshing and not overwhelming.",
    images: ["/products/helicopter-perfume.jpg"],
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    helpfulCount: 42,
    source: "amazon",
  },
  {
    id: "rev-heli-2",
    productId: "helicopter-perfume",
    userName: "Aman Verma",
    rating: 5,
    title: "Best dashboard accessory I have bought",
    comment:
      "Zinc alloy build is metallic and sturdy. The 3M adhesive pad holds firmly even over bumpy roads. Everyone who gets into my car asks where I got it from.",
    images: ["/products/helicopter/heli-black.jpg"],
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    helpfulCount: 20,
    source: "storefront",
  },

  // Mini Portable Steam Iron
  {
    id: "rev-iron-1",
    productId: "mini-steam-iron",
    userName: "Kavita Rao",
    rating: 5,
    title: "Ergonomic foldable handle and fast heating",
    comment:
      "Heats up in under 30 seconds. Compact enough to slip into any travel pouch. Easily straightens out wrinkles on cotton shirts, linen, and silk dresses.",
    images: ["/products/iron/iron-green.jpg"],
    verifiedPurchase: true,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    helpfulCount: 15,
    source: "amazon",
  },
];

// In-Memory store for fast local & worker fallback
let inMemoryReviews: ProductReview[] = [...SEED_REVIEWS];
let tableInitialized = false;

export async function ensureReviewTable(): Promise<void> {
  if (tableInitialized) return;
  tableInitialized = true;

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
    try {
      await executeD1Query(`CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);`);
    } catch {}
    try {
      await executeD1Query(`ALTER TABLE product_reviews ADD COLUMN source TEXT DEFAULT 'storefront';`);
    } catch {}
  } catch (err) {
    console.warn("Could not ensure product_reviews table in D1:", err);
  }
}

/**
 * Get all reviews matching a product ID or slug
 */
export async function getReviewsByProduct(productId: string): Promise<ProductReview[]> {
  const normId = productId.trim().toLowerCase();

  // 1. Try D1 table query
  try {
    await ensureReviewTable();
    const rows = await executeD1Query<any>(
      `SELECT * FROM product_reviews 
       WHERE lower(product_id) = ? OR product_id IN (
         SELECT slug FROM products WHERE lower(id) = ? UNION SELECT id FROM products WHERE lower(slug) = ?
       )
       ORDER BY created_at DESC`,
      [normId, normId, normId]
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

      // Merge with memory reviews (user-submitted reviews take priority)
      const existingIds = new Set(d1Reviews.map((r) => r.id));
      const memoryMatches = inMemoryReviews.filter(
        (r) =>
          (r.productId.toLowerCase() === normId || r.productId.toLowerCase().includes(normId)) &&
          !existingIds.has(r.id)
      );

      return [...memoryMatches, ...d1Reviews];
    }
  } catch (err) {
    console.warn("D1 getReviewsByProduct query failed, using memory store:", err);
  }

  // 2. Memory store fallback
  const matches = inMemoryReviews.filter((r) => {
    const rId = r.productId.toLowerCase();
    return rId === normId || rId.includes(normId) || normId.includes(rId);
  });

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
    await ensureReviewTable();
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
    await ensureReviewTable();
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
    await ensureReviewTable();
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
