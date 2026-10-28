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
  Laptop,
  Compass,
  Dumbbell,
  PartyPopper,
  Zap,
  Activity,
  HeartPulse,
  Scissors,
  Sun,
  Flame,
  Shield,
  Palette,
  BatteryCharging,
  Smile,
  IndianRupee,
  ShoppingBag,
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

export const ICON_MAP: Record<string, React.ReactNode> = {
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
  Laptop: <Laptop className="w-5 h-5 sm:w-6 sm:h-6" />,
  Compass: <Compass className="w-5 h-5 sm:w-6 sm:h-6" />,
  Dumbbell: <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6" />,
  PartyPopper: <PartyPopper className="w-5 h-5 sm:w-6 sm:h-6" />,
  Zap: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />,
  Activity: <Activity className="w-5 h-5 sm:w-6 sm:h-6" />,
  HeartPulse: <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6" />,
  Scissors: <Scissors className="w-5 h-5 sm:w-6 sm:h-6" />,
  Sun: <Sun className="w-5 h-5 sm:w-6 sm:h-6" />,
  Flame: <Flame className="w-5 h-5 sm:w-6 sm:h-6" />,
  Shield: <Shield className="w-5 h-5 sm:w-6 sm:h-6" />,
  Palette: <Palette className="w-5 h-5 sm:w-6 sm:h-6" />,
  BatteryCharging: <BatteryCharging className="w-5 h-5 sm:w-6 sm:h-6" />,
  Smile: <Smile className="w-5 h-5 sm:w-6 sm:h-6" />,
  IndianRupee: <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6" />,
  ShoppingBag: <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />,
};

export const AVAILABLE_CATEGORY_ICONS: string[] = [
  "LayoutGrid",
  "Headphones",
  "Armchair",
  "Sparkles",
  "Leaf",
  "Car",
  "Gamepad2",
  "Tag",
  "Smartphone",
  "Laptop",
  "UtensilsCrossed",
  "Scissors",
  "HeartPulse",
  "Compass",
  "Dumbbell",
  "PartyPopper",
  "Zap",
  "Gift",
  "Watch",
  "Heart",
  "Sun",
  "Flame",
  "Shield",
  "Palette",
  "Activity",
  "BatteryCharging",
  "Smile",
  "IndianRupee",
  "ShoppingBag",
];

export function getSubcategoryFallbackIcon(subcatName: string): string {
  const lower = subcatName.toLowerCase();
  if (lower.includes("phone") || lower.includes("mobile") || lower.includes("charg")) return "Smartphone";
  if (lower.includes("audio") || lower.includes("sound") || lower.includes("headphone") || lower.includes("ear")) return "Headphones";
  if (lower.includes("game") || lower.includes("gaming") || lower.includes("toy")) return "Gamepad2";
  if (lower.includes("laptop") || lower.includes("computer") || lower.includes("pc")) return "Laptop";
  if (lower.includes("kitchen") || lower.includes("dining") || lower.includes("cook")) return "UtensilsCrossed";
  if (lower.includes("clean") || lower.includes("organ") || lower.includes("beauty") || lower.includes("women")) return "Sparkles";
  if (lower.includes("comfort") || lower.includes("home") || lower.includes("utility")) return "Armchair";
  if (lower.includes("groom") || lower.includes("care") || lower.includes("hair") || lower.includes("trim")) return "Scissors";
  if (lower.includes("massage") || lower.includes("therapy") || lower.includes("wellness") || lower.includes("health")) return "HeartPulse";
  if (lower.includes("car") || lower.includes("auto")) return "Car";
  if (lower.includes("fit") || lower.includes("gym") || lower.includes("exercise")) return "Dumbbell";
  if (lower.includes("fun") || lower.includes("party")) return "PartyPopper";
  if (lower.includes("flash") || lower.includes("deal") || lower.includes("offer") || lower.includes("sale")) return "Zap";
  return "Tag";
}

export function renderIconOrCustom({
  iconName,
  customIcon,
  iconSize = 85,
  fallbackName = "",
}: {
  iconName?: string;
  customIcon?: string;
  iconSize?: number;
  fallbackName?: string;
}): React.ReactNode {
  if (customIcon && typeof customIcon === "string" && customIcon.trim()) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={customIcon}
        alt=""
        style={{
          width: `${iconSize}%`,
          height: `${iconSize}%`,
        }}
        className="object-contain transition-transform duration-300"
      />
    );
  }

  const effectiveIcon = iconName || (fallbackName ? getSubcategoryFallbackIcon(fallbackName) : "Tag");
  const node = ICON_MAP[effectiveIcon];
  if (node) return node;
  return getIconForCategory(fallbackName || effectiveIcon);
}

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
        bgColor: c.bgColor || (isAll ? "bg-[#EEF2FF]" : "bg-rose-50"),
        iconColor: c.iconColor || (isAll ? "text-[#3B82F6]" : "text-[#cb0805]"),
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
              <span className="text-[11px] sm:text-xs font-semibold text-gray-700 group-hover:text-[#cb0805] transition-colors leading-tight">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
