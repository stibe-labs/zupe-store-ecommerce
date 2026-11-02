import { MetadataRoute } from "next";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import { executeD1Query } from "@/lib/d1";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://zupestore.in";
  const now = new Date();

  // Core Pages
  const staticRoutes = [
    "",
    "/products",
    "/best-sellers",
    "/new-arrivals",
    "/deals",
    "/about",
    "/order-tracking",
    "/return",
    "/shipping-and-delivery",
    "/privacy",
    "/terms-and-conditions",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: (route === "" ? "daily" : "weekly") as "daily" | "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Collect all unique product slugs / IDs (from DEFAULT_PRODUCTS + D1 database)
  const productSlugs = new Set<string>();

  DEFAULT_PRODUCTS.forEach((p) => {
    productSlugs.add(p.slug || p.id);
  });

  try {
    const dbProducts = await executeD1Query<any>(
      `SELECT id, slug, updated_at FROM products WHERE in_stock != 0`
    );
    if (dbProducts && Array.isArray(dbProducts)) {
      dbProducts.forEach((p: any) => {
        productSlugs.add(p.slug || p.id);
      });
    }
  } catch (err) {
    // Fallback to DEFAULT_PRODUCTS
  }

  const productRoutes = Array.from(productSlugs).map((slugOrId) => ({
    url: `${baseUrl}/products/${encodeURIComponent(slugOrId)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...productRoutes];
}
