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
  subcategoryIcons?: Record<string, string>; // Subcategory name -> icon name or custom image URL
}

export const DEFAULT_HERO_BANNERS: HeroBannerSlide[] = [
  {
    id: "vittal-season-sale",
    badge: "VITTAL DIGITAL SEASON SALE",
    titleLine1: "Big Tech.",
    titleLine2: "Bigger Possibilities.",
    description: "Explore seasonal offers on your favourite electronics imported from Dubai, delivered across India.",
    ctaText: "Shop the Sale",
    ctaLink: "/#deals",
    image: "/vittal/hero-season-sale.png",
    mobileImage: "/vittal/hero-season-sale-mobile.png",
    taglineRight: "UP TO 40% OFF",
    active: true,
    order: 1,
  },
  {
    id: "vittal-laptops",
    badge: "WORK & CREATIVITY",
    titleLine1: "Power Your Work",
    titleLine2: "Built for Your Next Big Idea",
    description: "High-performance ultraportables with 2.8K OLED screens and all-day battery life.",
    ctaText: "Explore Laptops",
    ctaLink: "/products?category=Laptops",
    image: "/vittal/banner-laptops.png",
    mobileImage: "/vittal/banner-laptops.png",
    taglineRight: "Dubai Direct Retail",
    active: true,
    order: 2,
  },
  {
    id: "vittal-audio",
    badge: "IMMERSIVE SOUND",
    titleLine1: "Feel Every Beat",
    titleLine2: "Your World. Better Sound.",
    description: "Active Noise Cancellation earbuds and heavy bass speakers with up to 36-hour playback.",
    ctaText: "Explore Audio",
    ctaLink: "/products?category=Headphones+%26+Earbuds",
    image: "/vittal/banner-audio.png",
    mobileImage: "/vittal/banner-audio.png",
    taglineRight: "1-Year Warranty",
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
    bgColor: "bg-slate-100",
    iconColor: "text-slate-800",
    showInNavbar: true,
    showInPills: true,
    showInCollections: false,
    order: 0,
    active: true,
    iconShape: "round",
    iconSize: 85,
    subcategories: [],
    subcategoryIcons: {},
  },
  {
    id: "laptops",
    name: "Laptops",
    slug: "Laptops",
    icon: "Monitor",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-700",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 1,
    active: true,
    subcategories: ["Ultraportables", "Gaming Laptops", "MacBooks", "2-in-1 Convertibles"],
    subcategoryIcons: {
      "Ultraportables": "Monitor",
      "Gaming Laptops": "Gamepad2",
      "MacBooks": "Monitor",
      "2-in-1 Convertibles": "Smartphone",
    },
  },
  {
    id: "tablets",
    name: "Tablets",
    slug: "Tablets",
    icon: "Smartphone",
    bgColor: "bg-indigo-50",
    iconColor: "text-indigo-700",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 2,
    active: true,
    subcategories: ["Pro Tablets", "iPads", "Android Tablets", "Stylus Accessories"],
    subcategoryIcons: {
      "Pro Tablets": "Smartphone",
      "iPads": "Smartphone",
      "Android Tablets": "Smartphone",
      "Stylus Accessories": "PenTool",
    },
  },
  {
    id: "headphones",
    name: "Headphones & Earbuds",
    slug: "Headphones & Earbuds",
    icon: "Headphones",
    bgColor: "bg-cyan-50",
    iconColor: "text-cyan-700",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 3,
    active: true,
    subcategories: ["True Wireless", "Over-Ear ANC", "Sports Earphones", "Gaming Headsets"],
    subcategoryIcons: {
      "True Wireless": "Headphones",
      "Over-Ear ANC": "Headphones",
      "Sports Earphones": "Headphones",
      "Gaming Headsets": "Gamepad2",
    },
  },
  {
    id: "smartphones",
    name: "Smartphones",
    slug: "Smartphones",
    icon: "Smartphone",
    bgColor: "bg-sky-50",
    iconColor: "text-sky-700",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 4,
    active: true,
    subcategories: ["Flagships", "Dubai Exclusive Editions", "Foldables", "Budget Kings"],
    subcategoryIcons: {
      "Flagships": "Smartphone",
      "Dubai Exclusive Editions": "Sparkles",
      "Foldables": "Smartphone",
      "Budget Kings": "Tag",
    },
  },
  {
    id: "smartwatches",
    name: "Smartwatches",
    slug: "Smartwatches",
    icon: "Watch",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-700",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 5,
    active: true,
    subcategories: ["Fitness & Lifestyle", "Luxury Smartwatches", "GPS Running Watches", "Kids Watches"],
    subcategoryIcons: {
      "Fitness & Lifestyle": "Watch",
      "Luxury Smartwatches": "Sparkles",
      "GPS Running Watches": "Footprints",
      "Kids Watches": "Watch",
    },
  },
  {
    id: "gaming",
    name: "Gaming & Accessories",
    slug: "Gaming & Accessories",
    icon: "Gamepad2",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-700",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 6,
    active: true,
    subcategories: ["Consoles", "Controllers", "Mechanical Keyboards", "Gaming Mice"],
    subcategoryIcons: {
      "Consoles": "Gamepad2",
      "Controllers": "Gamepad2",
      "Mechanical Keyboards": "Gamepad2",
      "Gaming Mice": "Gamepad2",
    },
  },
  {
    id: "speakers",
    name: "Speakers",
    slug: "Speakers",
    icon: "Headphones",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-700",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 7,
    active: true,
    subcategories: ["Bluetooth Audio", "Soundbars", "Smart Home Speakers", "Party Speakers"],
    subcategoryIcons: {
      "Bluetooth Audio": "Headphones",
      "Soundbars": "Monitor",
      "Smart Home Speakers": "Sparkles",
      "Party Speakers": "Headphones",
    },
  },
  {
    id: "gadgets",
    name: "Smart Gadgets",
    slug: "Smart Gadgets",
    icon: "Sparkles",
    bgColor: "bg-teal-50",
    iconColor: "text-teal-700",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 8,
    active: true,
    subcategories: ["Power & Charging", "Smart Drones", "Smart Plugs", "Car Tech"],
    subcategoryIcons: {
      "Power & Charging": "Zap",
      "Smart Drones": "Sparkles",
      "Smart Plugs": "Sparkles",
      "Car Tech": "Car",
    },
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
              subcategoryIcons: {},
            };
            parsed.unshift(allCat);
          }
          // Strip giant base64 data URLs to prevent burning Worker CPU time (Cloudflare 10ms limit)
          const sanitized = parsed.map((c: any) => {
            const defaultCat = DEFAULT_STORE_CATEGORIES.find(
              (dc) => dc.id === c.id || (dc.name && c.name && dc.name.toLowerCase() === c.name.toLowerCase())
            );
            return {
              ...c,
              subcategoryIcons: {
                ...(defaultCat?.subcategoryIcons || {}),
                ...(c.subcategoryIcons || {}),
              },
              customIcon: typeof c.customIcon === "string" && c.customIcon.startsWith("data:")
                ? undefined
                : c.customIcon,
            };
          });
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
    title: "Power Your Work",
    subtitle: "Built for your next big idea.",
    bgColor: "#F0F4F8",
    textColor: "#003055",
    subtitleColor: "#475569",
    ctaText: "Shop Laptops",
    ctaLink: "/products?category=Laptops",
    btnBgColor: "#003055",
    btnTextColor: "#FFFFFF",
    image1: "/vittal/banner-laptops.png",
  },
  {
    id: "card-2",
    title: "Feel Every Beat",
    subtitle: "Your world. Better sound.",
    bgColor: "#002B4D",
    textColor: "#FFFFFF",
    subtitleColor: "#94A3B8",
    ctaText: "Explore Audio",
    ctaLink: "/products?category=Headphones+%26+Earbuds",
    btnBgColor: "#FFFFFF",
    btnTextColor: "#003055",
    image1: "/vittal/banner-audio.png",
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

