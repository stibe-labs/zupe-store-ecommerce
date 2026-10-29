import { MetadataRoute } from "next";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";

export default function sitemap(): MetadataRoute.Sitemap {
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

  // Dynamic Product Pages
  const productRoutes = DEFAULT_PRODUCTS.map((product) => ({
    url: `${baseUrl}/products/${product.slug || product.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...productRoutes];
}
