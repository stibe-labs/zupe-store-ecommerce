// Store Content & Customizer Storage Layer (D1 + In-Memory Fallback)
import { executeD1Query } from "@/lib/d1";

export interface HeroBannerSlide {
  id: string;
  badge?: string;
  heading?: string;
  buttonText?: string;
  buttonLink?: string;
  bgImage?: string;
  cutoutImage?: string;
  desktopScale?: number; // Zoom level in % (50 to 200, default 100)
  desktopOffsetX?: number; // Horizontal offset in px (-250 to +250, default 0)
  desktopOffsetY?: number; // Vertical offset in px (-200 to +200, default 0)
  mobileScale?: number; // Mobile zoom level in % (50 to 200, default 100)
  mobileOffsetX?: number; // Mobile horizontal offset in px (-250 to +250, default 0)
  mobileOffsetY?: number; // Mobile vertical offset in px (-200 to +200, default 0)
  active: boolean;
  order?: number;

  // Legacy / fallback fields
  titleLine1?: string;
  titleLine2?: string;
  headlineHighlight?: string;
  subLabel?: string;
  price?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  showTextOverlay?: boolean;
  image?: string;
  mobileImage?: string;
  imageScale?: number;
  imagePosition?: string;
  imageFit?: "cover" | "contain";
  mobileImageScale?: number;
  mobileImagePosition?: string;
  mobileImageFit?: "cover" | "contain";
  taglineRight?: string;
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
    id: "hero-slide-1",
    badge: "Limited Offer",
    heading: "First Purchase Enjoy\na Special Offer",
    buttonText: "Shop Now",
    buttonLink: "/products",
    bgImage: "/vittal/banner-hero-green-texture.jpg",
    cutoutImage: "/vittal/cutout-hero-1.png",
    desktopScale: 100,
    desktopOffsetX: 0,
    desktopOffsetY: 0,
    mobileScale: 100,
    mobileOffsetX: 0,
    mobileOffsetY: 0,
    active: true,
    order: 1,
    image: "/vittal/cutout-hero-1.png",
    ctaText: "Shop Now",
    ctaLink: "/products",
  },
  {
    id: "hero-slide-2",
    badge: "Limited Offer",
    heading: "First Purchase Enjoy\na Special Offer",
    buttonText: "Shop Now",
    buttonLink: "/products",
    bgImage: "/vittal/banner-hero-green-texture.jpg",
    cutoutImage: "/vittal/cutout-hero-2.png",
    desktopScale: 100,
    desktopOffsetX: 0,
    desktopOffsetY: 0,
    mobileScale: 100,
    mobileOffsetX: 0,
    mobileOffsetY: 0,
    active: true,
    order: 2,
    image: "/vittal/cutout-hero-2.png",
    ctaText: "Shop Now",
    ctaLink: "/products",
  },
  {
    id: "hero-slide-3",
    badge: "Limited Offer",
    heading: "First Purchase Enjoy\na Special Offer",
    buttonText: "Shop Now",
    buttonLink: "/products",
    bgImage: "/vittal/banner-hero-green-texture.jpg",
    cutoutImage: "/vittal/cutout-hero-3.png",
    desktopScale: 100,
    desktopOffsetX: 0,
    desktopOffsetY: 0,
    mobileScale: 100,
    mobileOffsetX: 0,
    mobileOffsetY: 0,
    active: true,
    order: 3,
    image: "/vittal/cutout-hero-3.png",
    ctaText: "Shop Now",
    ctaLink: "/products",
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
    id: "gym-supplements",
    name: "Gym Supplementaries",
    slug: "Gym Supplementaries",
    icon: "Dumbbell",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-700",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 1,
    active: true,
    subcategories: ["Whey Protein", "Creatine Monohydrate", "Pre-Workout", "BCAA & EAAs", "Mass Gainers", "Multivitamins"],
    subcategoryIcons: {
      "Whey Protein": "Sparkles",
      "Creatine Monohydrate": "Zap",
      "Pre-Workout": "Zap",
      "BCAA & EAAs": "Sparkles",
      "Mass Gainers": "Dumbbell",
      "Multivitamins": "Heart",
    },
  },
  {
    id: "outfits",
    name: "Outfits",
    slug: "Outfits",
    icon: "Sparkles",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-700",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 2,
    active: true,
    subcategories: ["Gym Matching Sets", "Athleisure Sets", "Activewear Tracksuits", "Casual Outfits"],
    subcategoryIcons: {
      "Gym Matching Sets": "Sparkles",
      "Athleisure Sets": "Sparkles",
      "Activewear Tracksuits": "Shirt",
      "Casual Outfits": "ShoppingBag",
    },
  },
  {
    id: "apparels",
    name: "Apparels",
    slug: "Apparels",
    icon: "Shirt",
    bgColor: "bg-indigo-50",
    iconColor: "text-indigo-700",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 3,
    active: true,
    subcategories: ["Performance T-Shirts", "Compression Tops", "Gym Shorts", "Joggers & Track Pants", "Hoodies & Jackets"],
    subcategoryIcons: {
      "Performance T-Shirts": "Shirt",
      "Compression Tops": "Shirt",
      "Gym Shorts": "Layers",
      "Joggers & Track Pants": "Layers",
      "Hoodies & Jackets": "Shirt",
    },
  },
  {
    id: "dates-nuts",
    name: "Dates & Nuts",
    slug: "Dates & Nuts",
    icon: "Apple",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-700",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 4,
    active: true,
    subcategories: ["Ajwa Dates", "Medjool Dates", "California Almonds", "Cashews & Pistachios", "Walnuts & Berries", "Trail Mixes"],
    subcategoryIcons: {
      "Ajwa Dates": "Apple",
      "Medjool Dates": "Apple",
      "California Almonds": "Apple",
      "Cashews & Pistachios": "Apple",
      "Walnuts & Berries": "Apple",
      "Trail Mixes": "Package",
    },
  },
  {
    id: "candy-chocolates",
    name: "Candy and Chocolates",
    slug: "Candy & Chocolates",
    icon: "Cookie",
    bgColor: "bg-rose-50",
    iconColor: "text-rose-700",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 5,
    active: true,
    subcategories: ["Dark Chocolates", "Protein Chocolate Bars", "Artisanal Truffles", "Gourmet Candies", "Gift Hampers"],
    subcategoryIcons: {
      "Dark Chocolates": "Cookie",
      "Protein Chocolate Bars": "Cookie",
      "Artisanal Truffles": "Heart",
      "Gourmet Candies": "Cookie",
      "Gift Hampers": "Gift",
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
          // If legacy placeholders found, use default hero banners
          const isLegacy = parsed.some((b: any) => b.id === "vittal-supplements" || b.image === "/vl-logo-nobg.png");
          if (isLegacy) {
            inMemoryBanners = [...DEFAULT_HERO_BANNERS];
          } else {
            inMemoryBanners = parsed.map((b: any, idx: number) => ({
              id: b.id || `hero-slide-${idx + 1}`,
              badge: b.badge || "Limited Offer",
              heading: b.heading || (b.titleLine1 ? `${b.titleLine1}\n${b.titleLine2 || ""}`.trim() : "First Purchase Enjoy\na Special Offer"),
              buttonText: b.buttonText || b.ctaText || "Shop Now",
              buttonLink: b.buttonLink || b.ctaLink || "/products",
              bgImage: b.bgImage || "/vittal/banner-hero-green-texture.jpg",
              cutoutImage: b.cutoutImage || b.image || `/vittal/cutout-hero-${(idx % 3) + 1}.png`,
              desktopScale: typeof b.desktopScale === "number" ? b.desktopScale : 100,
              desktopOffsetX: typeof b.desktopOffsetX === "number" ? b.desktopOffsetX : 0,
              desktopOffsetY: typeof b.desktopOffsetY === "number" ? b.desktopOffsetY : 0,
              mobileScale: typeof b.mobileScale === "number" ? b.mobileScale : 100,
              mobileOffsetX: typeof b.mobileOffsetX === "number" ? b.mobileOffsetX : 0,
              mobileOffsetY: typeof b.mobileOffsetY === "number" ? b.mobileOffsetY : 0,
              active: b.active !== false,
              order: typeof b.order === "number" ? b.order : idx + 1,
              imageFit: b.imageFit || "contain",
              mobileImageFit: b.mobileImageFit || "contain",
              image: b.cutoutImage || b.image || `/vittal/cutout-hero-${(idx % 3) + 1}.png`,
              ctaText: b.buttonText || b.ctaText || "Shop Now",
              ctaLink: b.buttonLink || b.ctaLink || "/products",
            }));
          }
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
    "red-vl-athletic-tee",
    "golden-jar-glossy-dates",
    "glass-jar-cashews",
    "golden-ferrero-rocher-box",
    "nike-air-zoom-sneaker",
    "charcoal-seamless-activewear",
    "luxury-makeup-collection",
    "frosted-gunmetal-parfum",
    "nike-pro-charcoal-jacket",
    "on-creatine-container",
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

