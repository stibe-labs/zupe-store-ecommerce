import { Product } from "@/types/product";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";

let cachedProducts: Product[] | null = null;
let pendingProductsPromise: Promise<Product[]> | null = null;

let cachedShowcase: any = null;
let pendingShowcasePromise: Promise<any> | null = null;

/**
 * Deduplicated client-side catalog fetcher.
 * Guarantees that even if 5 components on the homepage mount simultaneously,
 * only a single network request is fired, and results are cached in memory for instant SPA transitions.
 */
export async function getClientProducts(): Promise<Product[]> {
  if (cachedProducts && cachedProducts.length > 0) {
    return cachedProducts;
  }

  if (pendingProductsPromise) {
    return pendingProductsPromise;
  }

  pendingProductsPromise = fetch("/api/products")
    .then((res) => res.json())
    .then((data) => {
      const items = Array.isArray(data) ? data : data?.products;
      if (Array.isArray(items) && items.length > 0) {
        cachedProducts = items;
      }
      pendingProductsPromise = null;
      return cachedProducts || DEFAULT_PRODUCTS;
    })
    .catch((err) => {
      console.warn("Client products fetch error, fallback to defaults:", err);
      pendingProductsPromise = null;
      return DEFAULT_PRODUCTS;
    });

  return pendingProductsPromise;
}

/**
 * Deduplicated client-side showcase collections fetcher.
 */
export async function getClientShowcase(): Promise<any> {
  if (cachedShowcase) {
    return cachedShowcase;
  }

  if (pendingShowcasePromise) {
    return pendingShowcasePromise;
  }

  pendingShowcasePromise = fetch("/api/content/showcase")
    .then((res) => res.json())
    .then((data) => {
      if (data?.collections) {
        cachedShowcase = data.collections;
      }
      pendingShowcasePromise = null;
      return cachedShowcase;
    })
    .catch(() => {
      pendingShowcasePromise = null;
      return null;
    });

  return pendingShowcasePromise;
}
