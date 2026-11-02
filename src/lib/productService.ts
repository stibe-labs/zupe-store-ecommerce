import { Product } from "@/types/product";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import { executeD1Query } from "@/lib/d1";

/**
 * Retrieves a single product by ID or Slug (checks DEFAULT_PRODUCTS first, then D1 database)
 */
export async function getProductByIdOrSlug(idOrSlug: string): Promise<Product | null> {
  if (!idOrSlug) return null;
  const normalized = idOrSlug.trim();

  // 1. Fast in-memory lookup in DEFAULT_PRODUCTS
  const defaultFound = DEFAULT_PRODUCTS.find(
    (p) =>
      p.id?.toLowerCase() === normalized.toLowerCase() ||
      p.slug?.toLowerCase() === normalized.toLowerCase()
  );

  // 2. Query D1 for custom or synced products
  try {
    const rows = await executeD1Query<any>(
      `SELECT * FROM products WHERE id = ? OR slug = ? LIMIT 1`,
      [normalized, normalized]
    );

    if (rows && rows.length > 0) {
      const row = rows[0];
      let images = row.images;
      if (typeof images === "string") {
        try {
          images = JSON.parse(images);
        } catch {
          images = [];
        }
      }

      return {
        ...(defaultFound || {}),
        ...row,
        id: row.id,
        slug: row.slug || defaultFound?.slug || row.id,
        name: row.name || defaultFound?.name || "Product",
        price: Number(row.price || defaultFound?.price || 0),
        mrp: Number(row.mrp || defaultFound?.mrp || row.price || 0),
        category: row.category || defaultFound?.category || "General",
        description: row.description || defaultFound?.description || "",
        poster_image: row.poster_image || defaultFound?.poster_image || "/favicon.png",
        images: Array.isArray(images) && images.length > 0 ? images : defaultFound?.images || [row.poster_image || "/favicon.png"],
        in_stock: row.in_stock !== undefined ? Number(row.in_stock) : defaultFound?.in_stock ?? 1,
        rating: Number(row.rating || defaultFound?.rating || 4.8),
        review_count: Number(row.review_count || defaultFound?.review_count || 15),
      } as Product;
    }
  } catch (err) {
    // Fallback if D1 is unavailable
  }

  return defaultFound || null;
}

