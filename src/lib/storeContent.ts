// Store Content & Customizer Storage Layer (D1 + In-Memory Fallback)
import { executeD1Query } from "@/lib/d1";

export interface HeroBannerSlide {
  id: string;
  badge?: string;
  titleLine1?: string;
  titleLine2?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string; // Optional: destination URL when tapping banner
  image: string; // Desktop view photo (16:9 / landscape)
  mobileImage?: string; // Mobile view photo (4:5 / 1:1 portrait)
  imageScale?: number; // Desktop zoom level in % (50 to 200, default 100)
  imagePosition?: string; // CSS object-position (e.g. "center", "top", "bottom")
  imageFit?: "cover" | "contain"; // "cover" to fill frame or "contain" to show full image
  mobileImageScale?: number; // Mobile zoom level in % (50 to 200, default 100)
  mobileImagePosition?: string; // CSS object-position for mobile
  mobileImageFit?: "cover" | "contain"; // "cover" to fill frame or "contain"
  taglineRight?: string;
  active: boolean;
  order?: number;
}

export type CategoryIconShape = "round" | "square";

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string; // Preset icon name (e.g. Armchair, Headphones, LayoutGrid)
  customIcon?: string; // Custom uploaded icon URL / Data URL
  iconSize?: number; // Custom icon scale percentage (50 to 100, default 85)
  iconShape?: CategoryIconShape; // "round" (default circle) or "square" (edge curved square)
  bgColor?: string;
  iconColor?: string;
  showInNavbar?: boolean;
  showInPills?: boolean;
  showInCollections?: boolean;
  order?: number;
  active: boolean;
  subcategories?: string[]; // Subcategories under this main category
}

export const DEFAULT_HERO_BANNERS: HeroBannerSlide[] = [
  {
    id: "mega-sale-banner",
    badge: "ZUPE EXCLUSIVE",
    titleLine1: "Mega Sale - Up to 60% Off",
    titleLine2: "Free Shipping Across India",
    description: "Shop top trending modern decor, electronics, and lifestyle products with instant discounts.",
    ctaText: "Shop Sale",
    ctaLink: "/products",
    image: "/banners/banner-mega-sale.jpg",
    taglineRight: "Best Prices Everyday ♡",
    active: true,
    order: 1,
  },
  {
    id: "tech-gadgets-banner",
    badge: "NEXT-GEN TECH",
    titleLine1: "Smart Tech & Gadgets",
    titleLine2: "Special Deals from ₹299",
    description: "High-performance portable audio, emergency power, and innovative gadgets.",
    ctaText: "Explore Tech",
    ctaLink: "/products?category=Tech+%26+Gadgets",
    image: "/banners/banner-tech-gadgets.jpg",
    taglineRight: "Pure Sound & Power ♡",
    active: true,
    order: 2,
  },
  {
    id: "auto-home-banner",
    badge: "LIFESTYLE ESSENTIALS",
    titleLine1: "Auto & Home Essentials",
    titleLine2: "Up to 50% Off | Free COD",
    description: "Solar powered car fragrances, crystal ambient lamps, and modern comfort items.",
    ctaText: "Discover More",
    ctaLink: "/products?category=Home+Essentials",
    image: "/banners/banner-auto-home.jpg",
    taglineRight: "Drive In Luxury ♡",
    active: true,
    order: 3,
  },
];

export const DEFAULT_STORE_CATEGORIES: StoreCategory[] = [
  {
    id: "all",
    name: "All Categories",
    slug: "all",
    icon: "LayoutGrid",
    bgColor: "bg-[#EEF2FF]",
    iconColor: "text-[#3B82F6]",
    showInNavbar: false,
    showInPills: true,
    showInCollections: false,
    order: 0,
    active: true,
    iconShape: "round",
    iconSize: 85,
    subcategories: [],
  },
  {
    id: "tech-gadgets",
    name: "Tech & Gadgets",
    slug: "Tech & Gadgets",
    icon: "Headphones",
    bgColor: "bg-[#E0F2FE]",
    iconColor: "text-[#0284C7]",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 1,
    active: true,
    subcategories: [
      "Mobile & Charging",
      "Smart Tech & Audio",
      "Gaming",
      "Computer & Accessories",
    ],
  },
  {
    id: "home-essentials",
    name: "Home Essentials",
    slug: "Home Essentials",
    icon: "Armchair",
    bgColor: "bg-[#FEEBEA]",
    iconColor: "text-[#E0533C]",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 2,
    active: true,
    subcategories: [
      "Kitchen & Dining",
      "Cleaning & Organization",
      "Home Comfort & Utility",
    ],
  },
  {
    id: "personal-care",
    name: "Personal Care",
    slug: "Personal Care",
    icon: "Sparkles",
    bgColor: "bg-[#F3E8FF]",
    iconColor: "text-[#9333EA]",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 3,
    active: true,
    subcategories: [
      "Grooming & Care",
      "Massage & Wellness",
      "Women's Care",
    ],
  },
  {
    id: "auto-essentials",
    name: "Auto Essentials",
    slug: "Auto Essentials",
    icon: "Car",
    bgColor: "bg-[#FEF3C7]",
    iconColor: "text-[#D97706]",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 4,
    active: true,
    subcategories: [
      "Car Care",
      "Car Accessories",
    ],
  },
  {
    id: "fitness-wellness",
    name: "Fitness & Wellness",
    slug: "Fitness & Wellness",
    icon: "Leaf",
    bgColor: "bg-[#DCFCE7]",
    iconColor: "text-[#16A34A]",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 5,
    active: true,
    subcategories: [
      "Fitness Accessories",
      "Recovery & Wellness",
    ],
  },
  {
    id: "kids-fun",
    name: "Kids & Fun",
    slug: "Kids & Fun",
    icon: "Gamepad2",
    bgColor: "bg-[#FCE7F3]",
    iconColor: "text-[#DB2777]",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 6,
    active: true,
    subcategories: [
      "Toys & Games",
      "Fun & Entertainment",
    ],
  },
  {
    id: "deals-offers",
    name: "Deals & Offers",
    slug: "Deals & Offers",
    icon: "Tag",
    bgColor: "bg-[#FFE4E6]",
    iconColor: "text-[#E11D48]",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 7,
    active: true,
    subcategories: [
      "Flash Deals",
      "Curated Offers",
    ],
  },
];

// In-Memory state caches
let inMemoryBanners: HeroBannerSlide[] = [...DEFAULT_HERO_BANNERS];
let inMemoryCategories: StoreCategory[] = [...DEFAULT_STORE_CATEGORIES];

// Short-lived TTL caches (30s) to avoid hitting D1 on every SSR request.
// Cloudflare Workers are stateless across requests but within one warm instance
// these prevent duplicate queries that burn CPU time and trigger Error 1102.
const TTL_MS = 30_000; // 30 seconds
let bannersCachedAt = 0;
let categoriesCachedAt = 0;
let promoBannersCachedAt = 0;
let showcaseCachedAt = 0;

export async function getBanners(includeInactive = false): Promise<HeroBannerSlide[]> {
  const now = Date.now();
  if (now - bannersCachedAt > TTL_MS) {
    try {
      const rows = await executeD1Query<{ provider: string; config_data: string; is_active: number }>(
        "SELECT config_data FROM integrations_config WHERE provider = ?",
        ["hero_banners"]
      );
      if (rows && rows.length > 0 && rows[0].config_data) {
        const parsed = JSON.parse(rows[0].config_data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          inMemoryBanners = parsed;
        }
      }
      bannersCachedAt = Date.now();
    } catch (err) {
      console.warn("Failed to fetch hero_banners from D1:", err);
    }
  }

  if (includeInactive) {
    return inMemoryBanners;
  }
  return inMemoryBanners.filter((b) => b.active !== false);
}

export async function saveBanners(banners: HeroBannerSlide[]): Promise<HeroBannerSlide[]> {
  inMemoryBanners = banners;
  bannersCachedAt = Date.now(); // mark cache fresh after save

  try {
    const jsonStr = JSON.stringify(banners);
    await executeD1Query(
      `INSERT INTO integrations_config (provider, config_data, is_active, last_synced_at, updated_at)
       VALUES (?, ?, 1, datetime('now'), datetime('now'))
       ON CONFLICT(provider) DO UPDATE SET 
         config_data = excluded.config_data,
         is_active = excluded.is_active,
         updated_at = excluded.updated_at`,
      ["hero_banners", jsonStr]
    );
  } catch (err) {
    console.warn("Failed to persist hero_banners to D1:", err);
  }

  return inMemoryBanners;
}

export async function getCategories(includeInactive = false): Promise<StoreCategory[]> {
  const now = Date.now();
  if (now - categoriesCachedAt > TTL_MS) {
    try {
      const rows = await executeD1Query<{ provider: string; config_data: string; is_active: number }>(
        "SELECT config_data FROM integrations_config WHERE provider = ?",
        ["store_categories"]
      );
      if (rows && rows.length > 0 && rows[0].config_data) {
        const parsed = JSON.parse(rows[0].config_data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure "All Categories" category exists so it is customizable in admin
          const hasAll = parsed.some(
            (c: any) => c.id === "all" || (c.name && c.name.toLowerCase() === "all categories")
          );
          if (!hasAll) {
            const allCat: StoreCategory = {
              id: "all",
              name: "All Categories",
              slug: "all",
              icon: "LayoutGrid",
              bgColor: "bg-[#EEF2FF]",
              iconColor: "text-[#3B82F6]",
              showInNavbar: false,
              showInPills: true,
              showInCollections: false,
              order: 0,
              active: true,
              iconShape: "round",
              iconSize: 85,
              subcategories: [],
            };
            parsed.unshift(allCat);
          }
          // Strip giant base64 data URLs to prevent burning Worker CPU time (Cloudflare 10ms limit)
          const sanitized = parsed.map((c: any) => ({
            ...c,
            customIcon: typeof c.customIcon === "string" && c.customIcon.startsWith("data:")
              ? undefined
              : c.customIcon,
          }));
          inMemoryCategories = sanitized;
        }
      }
      categoriesCachedAt = Date.now();
    } catch (err) {
      console.warn("Failed to fetch store_categories from D1:", err);
    }
  }

  if (includeInactive) {
    return inMemoryCategories;
  }
  return inMemoryCategories.filter((c) => c.active !== false);
}

export async function saveCategories(categories: StoreCategory[]): Promise<StoreCategory[]> {
  inMemoryCategories = categories;
  categoriesCachedAt = Date.now(); // mark cache fresh after save

  try {
    const jsonStr = JSON.stringify(categories);
    await executeD1Query(
      `INSERT INTO integrations_config (provider, config_data, is_active, last_synced_at, updated_at)
       VALUES (?, ?, 1, datetime('now'), datetime('now'))
       ON CONFLICT(provider) DO UPDATE SET 
         config_data = excluded.config_data,
         is_active = excluded.is_active,
         updated_at = excluded.updated_at`,
      ["store_categories", jsonStr]
    );
  } catch (err) {
    console.warn("Failed to persist store_categories to D1:", err);
  }

  return inMemoryCategories;
}

// ========================================================
// PROMO DUAL BANNER CARDS (Homepage 2-Card Promo Grid)
// ========================================================
export interface PromoBannerCard {
  id: "card-1" | "card-2";
  title: string;
  subtitle: string;
  bgColor: string; // Hex color or CSS linear-gradient string
  textColor: string; // Heading text color
  subtitleColor: string; // Subtitle text color
  ctaText: string; // Button text
  ctaLink: string; // Redirect path or category URL
  btnBgColor: string; // Button background color
  btnTextColor: string; // Button text color
  image1: string; // Main image URL or base64 Data URL
  image2?: string; // Optional secondary collage image (Card 1)
}

export const DEFAULT_PROMO_BANNERS: PromoBannerCard[] = [
  {
    id: "card-1",
    title: "Upgrade Your\nEveryday Essentials",
    subtitle: "Smart products for a smarter lifestyle.",
    bgColor: "#F9EFE7",
    textColor: "#1A1A1A",
    subtitleColor: "#4B5563",
    ctaText: "Explore Now",
    ctaLink: "/products?category=Tech+%26+Gadgets",
    btnBgColor: "#1A1A1A",
    btnTextColor: "#FFFFFF",
    image1: "/products/thermal-printer.jpg",
    image2: "/products/popcorn-maker.jpg",
  },
  {
    id: "card-2",
    title: "Auto Essentials",
    subtitle: "Drive in Style\nand Comfort.",
    bgColor: "#1F2329",
    textColor: "#FFFFFF",
    subtitleColor: "#9CA3AF",
    ctaText: "Shop Now",
    ctaLink: "/products?category=Auto+Essentials",
    btnBgColor: "#FFFFFF",
    btnTextColor: "#111111",
    image1: "/products/helicopter-perfume.jpg",
  },
];

let inMemoryPromoBanners: PromoBannerCard[] = [...DEFAULT_PROMO_BANNERS];

export async function getPromoBanners(): Promise<PromoBannerCard[]> {
  const now = Date.now();
  if (now - promoBannersCachedAt > TTL_MS) {
    try {
      const rows = await executeD1Query<{ provider: string; config_data: string; is_active: number }>(
        "SELECT config_data FROM integrations_config WHERE provider = ?",
        ["promo_banners"]
      );
      if (rows && rows.length > 0 && rows[0].config_data) {
        const parsed = JSON.parse(rows[0].config_data);
        if (Array.isArray(parsed) && parsed.length === 2) {
          // Strip base64 images to prevent giant payloads burning Worker CPU
          inMemoryPromoBanners = parsed.map((card: PromoBannerCard) => ({
            ...card,
            image1: card.image1?.startsWith("data:") ? DEFAULT_PROMO_BANNERS.find(d => d.id === card.id)?.image1 ?? card.image1 : card.image1,
            image2: card.image2?.startsWith("data:") ? DEFAULT_PROMO_BANNERS.find(d => d.id === card.id)?.image2 ?? card.image2 : card.image2,
          }));
        }
      }
      promoBannersCachedAt = Date.now();
    } catch (err) {
      console.warn("Failed to fetch promo_banners from D1:", err);
    }
  }

  return inMemoryPromoBanners;
}

export async function savePromoBanners(banners: PromoBannerCard[]): Promise<PromoBannerCard[]> {
  inMemoryPromoBanners = banners;
  promoBannersCachedAt = Date.now(); // mark cache fresh after save

  try {
    const jsonStr = JSON.stringify(banners);
    await executeD1Query(
      `INSERT INTO integrations_config (provider, config_data, is_active, last_synced_at, updated_at)
       VALUES (?, ?, 1, datetime('now'), datetime('now'))
       ON CONFLICT(provider) DO UPDATE SET 
         config_data = excluded.config_data,
         is_active = excluded.is_active,
         updated_at = excluded.updated_at`,
      ["promo_banners", jsonStr]
    );
  } catch (err) {
    console.warn("Failed to persist promo_banners to D1:", err);
  }

  return inMemoryPromoBanners;
}

// ========================================================
// SHOWCASE COLLECTIONS (Top Pickz, New Arrivals, Best Sellers, Today's Deals)
// ========================================================
export interface ShowcaseCollectionsConfig {
  topPickzProductIds: string[];
  newArrivalsProductIds: string[];
  bestSellersProductIds: string[];
  todayDealsProductIds: string[];
}

export const DEFAULT_SHOWCASE_COLLECTIONS: ShowcaseCollectionsConfig = {
  topPickzProductIds: [
    "water-ripple-lamp",
    "mini-portable-steam-iron",
    "menstrual-heating-pad",
    "portable-mesh-nebulizer",
    "foldable-mini-washer",
    "mini-thermal-printer",
    "helicopter-car-perfume",
    "instant-water-heater-faucet",
    "tf20-multipurpose-powerbank",
    "mini-hot-air-popcorn-maker",
  ],
  newArrivalsProductIds: [
    "mini-thermal-printer",
    "helicopter-car-perfume",
    "instant-water-heater-faucet",
    "tf20-multipurpose-powerbank",
    "mini-hot-air-popcorn-maker",
  ],
  bestSellersProductIds: [
    "water-ripple-lamp",
    "mini-portable-steam-iron",
    "menstrual-heating-pad",
    "tf20-multipurpose-powerbank",
    "helicopter-car-perfume",
  ],
  todayDealsProductIds: [
    "water-ripple-lamp",
    "mini-portable-steam-iron",
    "menstrual-heating-pad",
    "portable-mesh-nebulizer",
    "foldable-mini-washer",
  ],
};

let inMemoryShowcase: ShowcaseCollectionsConfig = { ...DEFAULT_SHOWCASE_COLLECTIONS };

export async function getShowcaseCollections(): Promise<ShowcaseCollectionsConfig> {
  const now = Date.now();
  if (now - showcaseCachedAt > TTL_MS) {
    try {
      const rows = await executeD1Query<{ provider: string; config_data: string; is_active: number }>(
        "SELECT config_data FROM integrations_config WHERE provider = ?",
        ["showcase_collections"]
      );
      if (rows && rows.length > 0 && rows[0].config_data) {
        const parsed = JSON.parse(rows[0].config_data);
        if (parsed && typeof parsed === "object") {
          inMemoryShowcase = {
            topPickzProductIds: Array.isArray(parsed.topPickzProductIds)
              ? parsed.topPickzProductIds
              : DEFAULT_SHOWCASE_COLLECTIONS.topPickzProductIds,
            newArrivalsProductIds: Array.isArray(parsed.newArrivalsProductIds)
              ? parsed.newArrivalsProductIds
              : DEFAULT_SHOWCASE_COLLECTIONS.newArrivalsProductIds,
            bestSellersProductIds: Array.isArray(parsed.bestSellersProductIds)
              ? parsed.bestSellersProductIds
              : DEFAULT_SHOWCASE_COLLECTIONS.bestSellersProductIds,
            todayDealsProductIds: Array.isArray(parsed.todayDealsProductIds)
              ? parsed.todayDealsProductIds
              : DEFAULT_SHOWCASE_COLLECTIONS.todayDealsProductIds,
          };
        }
      }
      showcaseCachedAt = Date.now();
    } catch (err) {
      console.warn("Failed to fetch showcase_collections from D1:", err);
    }
  }

  return inMemoryShowcase;
}

export async function saveShowcaseCollections(
  config: ShowcaseCollectionsConfig
): Promise<ShowcaseCollectionsConfig> {
  showcaseCachedAt = Date.now(); // mark cache fresh after save
  inMemoryShowcase = {
    topPickzProductIds: Array.isArray(config.topPickzProductIds) ? config.topPickzProductIds : [],
    newArrivalsProductIds: Array.isArray(config.newArrivalsProductIds) ? config.newArrivalsProductIds : [],
    bestSellersProductIds: Array.isArray(config.bestSellersProductIds) ? config.bestSellersProductIds : [],
    todayDealsProductIds: Array.isArray(config.todayDealsProductIds) ? config.todayDealsProductIds : [],
  };

  try {
    const jsonStr = JSON.stringify(inMemoryShowcase);
    await executeD1Query(
      `INSERT INTO integrations_config (provider, config_data, is_active, last_synced_at, updated_at)
       VALUES (?, ?, 1, datetime('now'), datetime('now'))
       ON CONFLICT(provider) DO UPDATE SET 
         config_data = excluded.config_data,
         is_active = excluded.is_active,
         updated_at = excluded.updated_at`,
      ["showcase_collections", jsonStr]
    );
  } catch (err) {
    console.warn("Failed to persist showcase_collections to D1:", err);
  }

  return inMemoryShowcase;
}

