"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutGrid,
  Armchair,
  Headphones,
  Sparkles,
  Leaf,
  Car,
  Gamepad2,
  Tag,
  UtensilsCrossed,
  PenTool,
  Footprints,
  Smartphone,
  Watch,
  Heart,
  Gift,
} from "lucide-react";
import { StoreCategory, CategoryIconShape } from "@/lib/storeContent";

export interface CategoryItem {
  id: string;
  name: string;
  href: string;
  bgColor: string;
  iconColor: string;
  iconShape: CategoryIconShape;
  icon: React.ReactNode;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Armchair: <Armchair className="w-5 h-5 sm:w-6 sm:h-6" />,
  Headphones: <Headphones className="w-5 h-5 sm:w-6 sm:h-6" />,
  Sparkles: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />,
  Leaf: <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />,
  Car: <Car className="w-5 h-5 sm:w-6 sm:h-6" />,
  Gamepad2: <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" />,
  Tag: <Tag className="w-5 h-5 sm:w-6 sm:h-6" />,
  LayoutGrid: <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6" />,
  UtensilsCrossed: <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6" />,
  PenTool: <PenTool className="w-5 h-5 sm:w-6 sm:h-6" />,
  Footprints: <Footprints className="w-5 h-5 sm:w-6 sm:h-6" />,
  Smartphone: <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />,
  Watch: <Watch className="w-5 h-5 sm:w-6 sm:h-6" />,
  Heart: <Heart className="w-5 h-5 sm:w-6 sm:h-6" />,
  Gift: <Gift className="w-5 h-5 sm:w-6 sm:h-6" />,
};

function getIconForCategory(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("all") || lower.includes("grid")) return <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6" />;
  if (lower.includes("car") || lower.includes("auto")) return <Car className="w-5 h-5 sm:w-6 sm:h-6" />;
  if (lower.includes("gadget") || lower.includes("audio") || lower.includes("tech")) return <Headphones className="w-5 h-5 sm:w-6 sm:h-6" />;
  if (lower.includes("health") || lower.includes("plant") || lower.includes("wellness") || lower.includes("fitness")) return <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />;
  if (lower.includes("home") || lower.includes("living") || lower.includes("essential")) return <Armchair className="w-5 h-5 sm:w-6 sm:h-6" />;
  if (lower.includes("care") || lower.includes("beauty")) return <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />;
  if (lower.includes("kid") || lower.includes("fun") || lower.includes("toy") || lower.includes("game")) return <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" />;
  if (lower.includes("deal") || lower.includes("offer") || lower.includes("sale")) return <Tag className="w-5 h-5 sm:w-6 sm:h-6" />;
  return <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6" />;
}

export function formatCategoryItems(rawCategories: StoreCategory[]): CategoryItem[] {
  if (!Array.isArray(rawCategories) || rawCategories.length === 0) {
    return [];
  }

  return rawCategories
    .filter((c) => c.active !== false && c.showInPills !== false)
    .map((c) => {
      const isAll = c.id === "all" || (c.name && c.name.toLowerCase() === "all categories");
      const shape: CategoryIconShape = c.iconShape === "square" ? "square" : "round";

      return {
        id: c.id,
        name: c.name,
        href: isAll ? "/products" : `/products?category=${encodeURIComponent(c.slug || c.name)}`,
        bgColor: c.bgColor || (isAll ? "bg-[#EEF2FF]" : "bg-orange-50"),
        iconColor: c.iconColor || (isAll ? "text-[#3B82F6]" : "text-[#FF7A00]"),
        iconShape: shape,
        icon: c.customIcon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.customIcon}
            alt={c.name}
            style={{
              width: `${c.iconSize || 85}%`,
              height: `${c.iconSize || 85}%`,
            }}
            className="object-contain transition-transform duration-300"
          />
        ) : (
          (c.icon && ICON_MAP[c.icon]) || getIconForCategory(c.name)
        ),
      };
    });
}

const LOCAL_STORAGE_KEY = "zupe_store_categories_cache_v2";
let moduleCategoryCache: CategoryItem[] | null = null;

interface CategoryPillsProps {
  initialCategories?: StoreCategory[];
}

export function CategoryPills({ initialCategories }: CategoryPillsProps) {
  const [categoryItems, setCategoryItems] = React.useState<CategoryItem[]>(() => {
    // 1. SSR / Server passed initial categories (Instant, 0ms, matches HTML)
    if (initialCategories && initialCategories.length > 0) {
      const formatted = formatCategoryItems(initialCategories);
      moduleCategoryCache = formatted;
      return formatted;
    }

    // 2. Client-side in-memory SPA cache (Instant, 0ms on back/forward nav)
    if (moduleCategoryCache && moduleCategoryCache.length > 0) {
      return moduleCategoryCache;
    }

    // 3. Browser localStorage cache (Instant, 0ms on page refresh)
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const formatted = formatCategoryItems(parsed);
            moduleCategoryCache = formatted;
            return formatted;
          }
        }
      } catch (_) {}
    }

    return [];
  });

  const applyCategories = React.useCallback((cats: StoreCategory[]) => {
    const formatted = formatCategoryItems(cats);
    if (formatted.length > 0) {
      moduleCategoryCache = formatted;
      setCategoryItems(formatted);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cats));
      } catch (_) {}
    }
  }, []);

  React.useEffect(() => {
    // If initialCategories provided, save to localStorage
    if (initialCategories && initialCategories.length > 0) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialCategories));
      } catch (_) {}
    }

    // Background fetch to ensure fresh updates from admin sync seamlessly
    fetch("/api/content/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          applyCategories(data.categories);
        }
      })
      .catch((err) => console.warn("Failed to fetch dynamic category pills:", err));

    // Listen for real-time category updates within the same window
    const handleStorageUpdate = (e: any) => {
      if (e?.detail?.categories) {
        applyCategories(e.detail.categories);
      }
    };

    window.addEventListener("zupe_categories_updated", handleStorageUpdate);
    return () => {
      window.removeEventListener("zupe_categories_updated", handleStorageUpdate);
    };
  }, [initialCategories, applyCategories]);

  if (!categoryItems || categoryItems.length === 0) {
    return null;
  }

  return (
    <section className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-2 pb-0.5 sm:pt-2.5 sm:pb-1">
      <div className="flex items-center justify-between gap-3 sm:gap-4 overflow-x-auto scrollbar-none py-1.5 px-1">
        {categoryItems.map((cat) => {
          const isSquare = cat.iconShape === "square";
          const shapeClass = isSquare
            ? "rounded-2xl sm:rounded-[20px]"
            : "rounded-full";

          return (
            <Link
              key={cat.id}
              href={cat.href}
              className="flex flex-col items-center flex-shrink-0 group text-center min-w-[72px] sm:min-w-[84px]"
            >
              {/* Pastel Icon Container: Round Circle or Edge Curved Square */}
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 ${shapeClass} ${cat.bgColor} ${cat.iconColor} flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-md mb-2 overflow-hidden`}
              >
                {cat.icon}
              </div>
              {/* Category Name Label */}
              <span className="text-[11px] sm:text-xs font-semibold text-gray-700 group-hover:text-[#FF7A00] transition-colors leading-tight">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
