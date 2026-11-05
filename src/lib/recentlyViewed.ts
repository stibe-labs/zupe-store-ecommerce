"use client";

import { useEffect, useState, useCallback } from "react";
import { Product } from "@/types/product";

export interface RecentlyViewedItem {
  id: string;
  slug?: string;
  name: string;
  price: number;
  mrp?: number;
  offer_price?: number;
  poster_image: string;
  category?: string;
  badge?: string;
  viewedAt: number;
}

const STORAGE_KEY = "vittal_recently_viewed_v1";
const EVENT_NAME = "vittal_recently_viewed_change";
const MAX_ITEMS = 10;

/**
 * Retrieve recently viewed products safely from localStorage
 */
export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item) => item && typeof item === "object" && (item.id || item.slug) && item.name
      );
    }
    return [];
  } catch (err) {
    console.warn("Could not read recently viewed items:", err);
    return [];
  }
}

/**
 * Add or bump a product in recently viewed storage
 */
export function addRecentlyViewed(
  product: Partial<Product> | { id: string; name: string; price?: number; poster_image?: string; image?: string; category?: string; mrp?: number; slug?: string; badge?: string } | null | undefined
): void {
  if (typeof window === "undefined" || !product) return;

  const id = product.id || ("slug" in product && product.slug) || "";
  const name = product.name || "";
  if (!id || !name) return;

  try {
    const existing = getRecentlyViewed();
    const slug = ("slug" in product && product.slug) ? product.slug : id;
    
    // Resolve price
    let price = 0;
    if ("price" in product && typeof product.price === "number") {
      price = product.price;
    } else if ("offer_price" in product && typeof product.offer_price === "number") {
      price = product.offer_price;
    }

    // Resolve mrp
    let mrp = price;
    if ("mrp" in product && typeof product.mrp === "number") {
      mrp = product.mrp;
    }

    // Resolve poster image
    let poster_image = "/vittal-digital-logo.png";
    if ("poster_image" in product && product.poster_image) {
      poster_image = product.poster_image;
    } else if ("image" in product && product.image) {
      poster_image = product.image;
    } else if ("images" in product && Array.isArray(product.images) && product.images.length > 0) {
      poster_image = product.images[0];
    }

    const category = product.category || "Electronics";
    const badge = product.badge || "";

    const newItem: RecentlyViewedItem = {
      id,
      slug,
      name,
      price,
      mrp,
      poster_image,
      category,
      badge,
      viewedAt: Date.now(),
    };

    // Remove duplicates (by id or slug)
    const filtered = existing.filter((item) => item.id !== id && item.slug !== slug);
    const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch (err) {
    console.warn("Could not record recently viewed item:", err);
  }
}

/**
 * Clear all recently viewed items
 */
export function clearRecentlyViewed(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch (err) {
    console.warn("Could not clear recently viewed items:", err);
  }
}

/**
 * React hook for components needing reactive access to recently viewed items
 */
export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    setItems(getRecentlyViewed());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    refresh();

    const handleUpdate = () => {
      refresh();
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [refresh]);

  return {
    items,
    isLoaded,
    add: addRecentlyViewed,
    clear: clearRecentlyViewed,
    refresh,
  };
}
