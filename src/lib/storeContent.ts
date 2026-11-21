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
    customIcon: "/vittal/cat-icon-all-categories-trans.png",
    bgColor: "bg-[#F4FBE8]",
    iconColor: "text-[#3D6318]",
    showInNavbar: true,
    showInPills: true,
    showInCollections: false,
    order: 0,
    active: true,
    iconShape: "square",
    iconSize: 85,
    subcategories: [],
    subcategoryIcons: {},
  },
  {
    id: "gym-supplements",
    name: "Gym Supplements",
    slug: "Gym Supplements",
    icon: "Dumbbell",
    customIcon: "/vittal/cat-icon-gym-supplements-trans.png",
    bgColor: "bg-[#F4FBE8]",
    iconColor: "text-[#3D6318]",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 1,
    active: true,
    iconShape: "square",
    iconSize: 85,
    subcategories: ["Whey Protein", "Creatine", "Pre-Workout", "Omega 3 & Vit", "Mass Gainers"],
    subcategoryIcons: {
      "Whey Protein": "/vittal/catalog/on-gold-standard-whey.png",
      "Creatine": "/vittal/catalog/on-creatine-container.png",
      "Pre-Workout": "/products/muscletech-nitrotech-fruit-punch.png",
      "Omega 3 & Vit": "/vittal/catalog/sports-research-omega3.png",
      "Mass Gainers": "/vittal/catalog/nitro-tech-protein-bucket.png",
    },
  },
  {
    id: "outfits",
    name: "Outfits",
    slug: "Outfits",
    icon: "Sparkles",
    customIcon: "/vittal/cat-icon-outfits-trans.png",
    bgColor: "bg-[#F4FBE8]",
    iconColor: "text-[#3D6318]",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 2,
    active: true,
    iconShape: "square",
    iconSize: 85,
    subcategories: ["Gym Sets", "Athletic Tees", "Jackets", "Gym Shorts", "Joggers", "Compression"],
    subcategoryIcons: {
      "Gym Sets": "/vittal/catalog/charcoal-seamless-activewear.png",
      "Athletic Tees": "/vittal/catalog/red-vl-athletic-tee.png",
      "Jackets": "/vittal/catalog/nike-pro-charcoal-jacket.png",
      "Gym Shorts": "/vittal/catalog/white-adidas-athletic-shorts.png",
      "Joggers": "/vittal/catalog/modern-gray-jogger-pants.png",
      "Compression": "/vittal/catalog/white-adidas-long-sleeve-top.png",
    },
  },
  {
    id: "apparels",
    name: "Apparels",
    slug: "Apparels",
    icon: "Shirt",
    customIcon: "/vittal/cat-icon-apparels-trans.png",
    bgColor: "bg-[#F4FBE8]",
    iconColor: "text-[#3D6318]",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 3,
    active: true,
    iconShape: "square",
    iconSize: 85,
    subcategories: ["Footwear", "Perfumes", "Cosmetics", "Active Tees", "Sneakers"],
    subcategoryIcons: {
      "Footwear": "/vittal/catalog/nike-air-zoom-sneaker.png",
      "Perfumes": "/vittal/catalog/elie-saab-le-parfum.png",
      "Cosmetics": "/vittal/catalog/luxury-makeup-collection.png",
      "Active Tees": "/vittal/catalog/red-vl-athletic-tee.png",
      "Sneakers": "/vittal/catalog/white-adidas-cloudfoam-sneaker.png",
    },
  },
  {
    id: "dates-nuts",
    name: "Dates & Nuts",
    slug: "Dates & Nuts",
    icon: "Apple",
    customIcon: "/vittal/cat-icon-dates-trans.png",
    bgColor: "bg-[#F4FBE8]",
    iconColor: "text-[#3D6318]",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 4,
    active: true,
    iconShape: "square",
    iconSize: 85,
    subcategories: ["Medjool Dates", "Cashews", "Almonds", "Pistachios", "Chia & Seeds"],
    subcategoryIcons: {
      "Medjool Dates": "/vittal/catalog/golden-jar-glossy-dates.png",
      "Cashews": "/vittal/catalog/glass-jar-cashews.png",
      "Almonds": "/vittal/catalog/clear-almond-snack-pouch.png",
      "Pistachios": "/vittal/catalog/glossy-pistachio-snack-bag.png",
      "Chia & Seeds": "/vittal/catalog/glass-chia-seeds-jar.png",
    },
  },
  {
    id: "candy-chocolates",
    name: "Candy & Chocolates",
    slug: "Candy & Chocolates",
    icon: "Cookie",
    customIcon: "/vittal/cat-icon-chocolates-trans.png",
    bgColor: "bg-[#F4FBE8]",
    iconColor: "text-[#3D6318]",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 5,
    active: true,
    iconShape: "square",
    iconSize: 85,
    subcategories: ["Truffles", "Dark Choco", "Silk Bars", "Coconut Bars"],
    subcategoryIcons: {
      "Truffles": "/vittal/catalog/golden-ferrero-rocher-box.png",
      "Dark Choco": "/vittal/catalog/lindt-lindor-truffles.png",
      "Silk Bars": "/vittal/catalog/cadbury-dairy-milk-pack.png",
      "Coconut Bars": "/vittal/catalog/bounty-coconut-chocolate.png",
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
          // Detect legacy Zupe store categories (e.g. tech-gadgets, home-essentials, personal-care)
          const isLegacy = parsed.some(
            (c: any) =>
              c.id === "tech-gadgets" ||
              c.id === "home-essentials" ||
              c.id === "personal-care" ||
              c.id === "auto-essentials" ||
              c.name === "Tech & Gadgets"
          );

          if (isLegacy) {
            inMemoryCategories = [...DEFAULT_STORE_CATEGORIES];
            await saveCategories(DEFAULT_STORE_CATEGORIES);
          } else {
            // Ensure "All Categories" exists
            const hasAll = parsed.some(
              (c: any) => c.id === "all" || (c.name && c.name.toLowerCase() === "all categories")
            );
            if (!hasAll) {
              const allCat = DEFAULT_STORE_CATEGORIES[0];
              parsed.unshift(allCat);
            }

            const sanitized = parsed.map((c: any) => {
              const defaultCat = DEFAULT_STORE_CATEGORIES.find(
                (dc) =>
                  dc.id === c.id ||
                  (dc.name && c.name && dc.name.toLowerCase() === c.name.toLowerCase()) ||
                  (dc.slug && c.slug && dc.slug.toLowerCase() === c.slug.toLowerCase())
              );

              // Auto-fill subcategories from default if empty
              const subcategories =
                Array.isArray(c.subcategories) && c.subcategories.length > 0
                  ? c.subcategories
                  : defaultCat?.subcategories || [];

              return {
                ...c,
                customIcon:
                  typeof c.customIcon === "string" && !c.customIcon.startsWith("data:")
                    ? c.customIcon
                    : defaultCat?.customIcon || c.customIcon,
                iconShape: c.iconShape || "square",
                iconSize: typeof c.iconSize === "number" ? c.iconSize : 85,
                subcategories,
                subcategoryIcons: {
                  ...(defaultCat?.subcategoryIcons || {}),
                  ...(c.subcategoryIcons || {}),
                },
              };
            });
            inMemoryCategories = sanitized;
          }
        }
      } else {
        // D1 has no row yet -> seed with DEFAULT_STORE_CATEGORIES
        inMemoryCategories = [...DEFAULT_STORE_CATEGORIES];
        await saveCategories(DEFAULT_STORE_CATEGORIES);
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



// ========================================================
// SPORTSWEAR DROPS CAMPAIGN CARDS & BANNER (Homepage Showcase)
// ========================================================
export interface SportswearCard {
  id: string;
  title: string;
  priceLabel?: string;
  price: string;
  image: string;
  linkUrl: string;
  desktopScale?: number;
  desktopOffsetX?: number;
  desktopOffsetY?: number;
  mobileScale?: number;
  mobileOffsetX?: number;
  mobileOffsetY?: number;
}

export interface SportswearCampaignConfig {
  bannerHeadingPrefix?: string;
  bannerHeadingHighlight?: string;
  bannerHeadingSuffix?: string;
  bannerHashtag?: string;
  cards: SportswearCard[];
}

export const DEFAULT_SPORTSWEAR_CAMPAIGN: SportswearCampaignConfig = {
  bannerHeadingPrefix: "Fresh",
  bannerHeadingHighlight: "Sportswear",
  bannerHeadingSuffix: "Drops",
  bannerHashtag: "#EngineeredForEveryMove",
  cards: [
    {
      id: "drop-card-1",
      title: "Sports Wear",
      priceLabel: "Starting At",
      price: "₹999*",
      image: "/vittal/drop-teveo-run.jpg",
      linkUrl: "/products?category=Outfits",
      desktopScale: 100,
      desktopOffsetX: 0,
      desktopOffsetY: 0,
      mobileScale: 100,
      mobileOffsetX: 0,
      mobileOffsetY: 0,
    },
    {
      id: "drop-card-2",
      title: "Jackets & Track Pants",
      priceLabel: "Starting At",
      price: "₹899*",
      image: "/vittal/drop-mountain.jpg",
      linkUrl: "/products?category=Outfits",
      desktopScale: 100,
      desktopOffsetX: 0,
      desktopOffsetY: 0,
      mobileScale: 100,
      mobileOffsetX: 0,
      mobileOffsetY: 0,
    },
    {
      id: "drop-card-3",
      title: "Shorts",
      priceLabel: "Starting At",
      price: "₹799*",
      image: "/vittal/drop-run-fitness.jpg",
      linkUrl: "/products?category=Outfits",
      desktopScale: 100,
      desktopOffsetX: 0,
      desktopOffsetY: 0,
      mobileScale: 100,
      mobileOffsetX: 0,
      mobileOffsetY: 0,
    },
  ],
};

let inMemorySportswear: SportswearCampaignConfig = { ...DEFAULT_SPORTSWEAR_CAMPAIGN };
let sportswearCachedAt = 0;

export async function getSportswearCampaign(): Promise<SportswearCampaignConfig> {
  const now = Date.now();
  if (now - sportswearCachedAt > TTL_MS) {
    try {
      const rows = await executeD1Query<{ provider: string; config_data: string; is_active: number }>(
        "SELECT config_data FROM integrations_config WHERE provider = ?",
        ["sportswear_campaign"]
      );
      if (rows && rows.length > 0 && rows[0].config_data) {
        const parsed = JSON.parse(rows[0].config_data);
        if (parsed && typeof parsed === "object" && Array.isArray(parsed.cards) && parsed.cards.length > 0) {
          inMemorySportswear = {
            bannerHeadingPrefix: parsed.bannerHeadingPrefix ?? DEFAULT_SPORTSWEAR_CAMPAIGN.bannerHeadingPrefix,
            bannerHeadingHighlight: parsed.bannerHeadingHighlight ?? DEFAULT_SPORTSWEAR_CAMPAIGN.bannerHeadingHighlight,
            bannerHeadingSuffix: parsed.bannerHeadingSuffix ?? DEFAULT_SPORTSWEAR_CAMPAIGN.bannerHeadingSuffix,
            bannerHashtag: parsed.bannerHashtag ?? DEFAULT_SPORTSWEAR_CAMPAIGN.bannerHashtag,
            cards: parsed.cards.map((c: any, idx: number) => ({
              id: c.id || `drop-card-${idx + 1}`,
              title: c.title || DEFAULT_SPORTSWEAR_CAMPAIGN.cards[idx]?.title || "Activewear",
              priceLabel: c.priceLabel || "Starting At",
              price: c.price || DEFAULT_SPORTSWEAR_CAMPAIGN.cards[idx]?.price || "₹999*",
              image: c.image || DEFAULT_SPORTSWEAR_CAMPAIGN.cards[idx]?.image || "/vittal/drop-teveo-run.jpg",
              linkUrl: c.linkUrl || DEFAULT_SPORTSWEAR_CAMPAIGN.cards[idx]?.linkUrl || "/products?category=Outfits",
              desktopScale: typeof c.desktopScale === "number" ? c.desktopScale : 100,
              desktopOffsetX: typeof c.desktopOffsetX === "number" ? c.desktopOffsetX : 0,
              desktopOffsetY: typeof c.desktopOffsetY === "number" ? c.desktopOffsetY : 0,
              mobileScale: typeof c.mobileScale === "number" ? c.mobileScale : 100,
              mobileOffsetX: typeof c.mobileOffsetX === "number" ? c.mobileOffsetX : 0,
              mobileOffsetY: typeof c.mobileOffsetY === "number" ? c.mobileOffsetY : 0,
            })),
          };
        }
      }
      sportswearCachedAt = Date.now();
    } catch (err) {
      console.warn("Failed to fetch sportswear_campaign from D1:", err);
    }
  }

  return inMemorySportswear;
}

export async function saveSportswearCampaign(
  config: SportswearCampaignConfig
): Promise<SportswearCampaignConfig> {
  sportswearCachedAt = Date.now();
  inMemorySportswear = {
    bannerHeadingPrefix: config.bannerHeadingPrefix?.trim() || "Fresh",
    bannerHeadingHighlight: config.bannerHeadingHighlight?.trim() || "Sportswear",
    bannerHeadingSuffix: config.bannerHeadingSuffix?.trim() || "Drops",
    bannerHashtag: config.bannerHashtag?.trim() || "#EngineeredForEveryMove",
    cards: Array.isArray(config.cards)
      ? config.cards.map((c, idx) => ({
          id: c.id || `drop-card-${idx + 1}`,
          title: c.title || "Activewear",
          priceLabel: c.priceLabel || "Starting At",
          price: c.price || "₹999*",
          image: c.image || "/vittal/drop-teveo-run.jpg",
          linkUrl: c.linkUrl || "/products?category=Outfits",
          desktopScale: typeof c.desktopScale === "number" ? c.desktopScale : 100,
          desktopOffsetX: typeof c.desktopOffsetX === "number" ? c.desktopOffsetX : 0,
          desktopOffsetY: typeof c.desktopOffsetY === "number" ? c.desktopOffsetY : 0,
          mobileScale: typeof c.mobileScale === "number" ? c.mobileScale : 100,
          mobileOffsetX: typeof c.mobileOffsetX === "number" ? c.mobileOffsetX : 0,
          mobileOffsetY: typeof c.mobileOffsetY === "number" ? c.mobileOffsetY : 0,
        }))
      : DEFAULT_SPORTSWEAR_CAMPAIGN.cards,
  };

  try {
    const jsonStr = JSON.stringify(inMemorySportswear);
    await executeD1Query(
      `INSERT INTO integrations_config (provider, config_data, is_active, last_synced_at, updated_at)
       VALUES (?, ?, 1, datetime('now'), datetime('now'))
       ON CONFLICT(provider) DO UPDATE SET 
         config_data = excluded.config_data,
         is_active = excluded.is_active,
         updated_at = excluded.updated_at`,
      ["sportswear_campaign", jsonStr]
    );
  } catch (err) {
    console.warn("Failed to persist sportswear_campaign to D1:", err);
  }

  return inMemorySportswear;
}

// =========================================================================
// 5. GYM SUPPLEMENTS CATEGORY SHOWCASE CONFIG
// =========================================================================

export interface ShowcaseItem {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  image: string;
  price: number;
  mrp: number;
  discountTag: string;
  badge?: string;
}

export interface SupplementCategoryTab {
  id: string;
  label: string;
  iconImage: string;
  items: ShowcaseItem[];
}

export interface SupplementColorTemplate {
  id: string;
  name: string;
  from: string;
  via: string;
  to: string;
  border: string;
  badgeBg?: string;
  badgeText?: string;
}

export const SUPPLEMENT_COLOR_TEMPLATES: SupplementColorTemplate[] = [
  {
    id: "brand_olive",
    name: "Brand Olive (Default)",
    from: "#587933",
    via: "#466324",
    to: "#344C19",
    border: "#6B9E3A",
    badgeBg: "#D5EBBF",
    badgeText: "#FEF08A",
  },
  {
    id: "forest_emerald",
    name: "Forest Emerald",
    from: "#1E4D2B",
    via: "#14381E",
    to: "#0B2312",
    border: "#34D399",
    badgeBg: "#A7F3D0",
    badgeText: "#FDE047",
  },
  {
    id: "obsidian_stealth",
    name: "Obsidian Stealth",
    from: "#262923",
    via: "#1B1E18",
    to: "#11130F",
    border: "#95CF42",
    badgeBg: "#E2F5B4",
    badgeText: "#A3E635",
  },
  {
    id: "royal_khaki",
    name: "Royal Army Khaki",
    from: "#4D5320",
    via: "#3C4217",
    to: "#282D0F",
    border: "#A3B18A",
    badgeBg: "#E9EDC9",
    badgeText: "#FEF08A",
  },
  {
    id: "slate_jade",
    name: "Deep Slate Jade",
    from: "#2D4A43",
    via: "#1E3530",
    to: "#132420",
    border: "#5EEAD4",
    badgeBg: "#CCFBF1",
    badgeText: "#FDE047",
  },
  {
    id: "charcoal_black",
    name: "Pure Charcoal Black",
    from: "#18181B",
    via: "#111113",
    to: "#09090B",
    border: "#52525B",
    badgeBg: "#E4E4E7",
    badgeText: "#FACC15",
  },
];

export interface SupplementShowcaseConfig {
  overlineText: string;
  headingText: string;
  buttonText: string;
  buttonLink: string;
  bgGradientFrom: string;
  bgGradientVia: string;
  bgGradientTo: string;
  borderColor: string;
  templateKey?: string;
  categories: SupplementCategoryTab[];
}

export const DEFAULT_SUPPLEMENT_SHOWCASE: SupplementShowcaseConfig = {
  overlineText: "PRO GYM NUTRITION",
  headingText: "Fuel Every Workout",
  buttonText: "Explore All Gym Supplements",
  buttonLink: "/products?category=Gym+Supplementaries",
  bgGradientFrom: "#587933",
  bgGradientVia: "#466324",
  bgGradientTo: "#344C19",
  borderColor: "#6B9E3A",
  templateKey: "brand_olive",
  categories: [
    {
      id: "whey_protein",
      label: "Whey Protein",
      iconImage: "/vittal/catalog/on-gold-standard-whey.png",
      items: [
        {
          id: "on-gold-standard-whey",
          slug: "on-gold-standard-whey",
          name: "Optimum Nutrition Gold Standard 100% Whey",
          subtitle: "24g Whey Isolate • 5.5g BCAAs",
          image: "/vittal/catalog/on-gold-standard-whey.png",
          price: 6999,
          mrp: 8499,
          discountTag: "Min. 18% Off",
          badge: "Best Seller",
        },
        {
          id: "whey-protein-isolate",
          slug: "whey-protein-isolate",
          name: "Vittal 100% Ultra-Pure Whey Isolate",
          subtitle: "27g Pure Protein • Zero Sugar",
          image: "/vittal/product-whey-protein-jar.png",
          price: 2499,
          mrp: 3499,
          discountTag: "Up to 30% Off",
          badge: "Pure Isolate",
        },
        {
          id: "on-whey-protein-tub",
          slug: "on-whey-protein-tub",
          name: "Optimum Nutrition Performance Whey",
          subtitle: "Fast-Acting Recovery • Rich Cocoa",
          image: "/vittal/catalog/on-whey-protein-tub.png",
          price: 3299,
          mrp: 4199,
          discountTag: "Min. 21% Off",
          badge: "Fast Recovery",
        },
        {
          id: "nitro-tech-protein-bucket",
          slug: "nitro-tech-protein-bucket",
          name: "MuscleTech Nitro-Tech 100% Whey Gold",
          subtitle: "Hydrolyzed Peptides • 4kg Bucket",
          image: "/vittal/catalog/nitro-tech-protein-bucket.png",
          price: 7899,
          mrp: 9999,
          discountTag: "Min. 22% Off",
          badge: "Giant Value",
        },
        {
          id: "isopure-low-carb",
          slug: "whey-protein-isolate",
          name: "Isopure Zero Carb 100% Whey Protein Isolate",
          subtitle: "25g 100% Whey Isolate • Zero Carb",
          image: "/vittal/product-whey-protein-jar.png",
          price: 4499,
          mrp: 5999,
          discountTag: "Min. 25% Off",
          badge: "Zero Carb",
        },
        {
          id: "dymatize-iso-100",
          slug: "on-whey-protein-tub",
          name: "Dymatize ISO 100 Hydrolyzed Whey Protein",
          subtitle: "Fast Digesting Hydrolyzed • 2.3kg",
          image: "/vittal/catalog/on-whey-protein-tub.png",
          price: 7499,
          mrp: 9499,
          discountTag: "Min. 21% Off",
          badge: "Hydrolyzed",
        },
        {
          id: "muscleblaze-biozyme",
          slug: "on-gold-standard-whey",
          name: "MuscleBlaze Biozyme Performance Whey",
          subtitle: "Enhanced Absorption Formula • 2kg",
          image: "/vittal/catalog/on-gold-standard-whey.png",
          price: 2899,
          mrp: 3699,
          discountTag: "Up to 22% Off",
          badge: "EAF Tested",
        },
        {
          id: "avvatar-whey-protein",
          slug: "whey-protein-isolate",
          name: "Avvatar 100% Pure Whey Isolate Blend",
          subtitle: "Fresh Cow Milk Sourced • 2kg",
          image: "/vittal/product-whey-protein-jar.png",
          price: 3199,
          mrp: 4199,
          discountTag: "Min. 24% Off",
          badge: "Pure Milk",
        },
      ],
    },
    {
      id: "omega_3",
      label: "Omega 3",
      iconImage: "/vittal/catalog/sports-research-omega3.png",
      items: [
        {
          id: "sports-research-omega3",
          slug: "sports-research-omega3",
          name: "Sports Research Triple Strength Omega-3",
          subtitle: "1037mg EPA + DHA • 180 Softgels",
          image: "/vittal/catalog/sports-research-omega3.png",
          price: 2499,
          mrp: 3299,
          discountTag: "Min. 25% Off",
          badge: "IFOS 5-Star",
        },
        {
          id: "muscleblaze-omega-gold",
          slug: "sports-research-omega3",
          name: "MuscleBlaze Gold Series Triple Omega-3",
          subtitle: "Molecularly Distilled • Heart & Joints",
          image: "/vittal/catalog/sports-research-omega3.png",
          price: 999,
          mrp: 1499,
          discountTag: "Up to 35% Off",
          badge: "Zero Burps",
        },
        {
          id: "now-foods-ultra-omega",
          slug: "sports-research-omega3",
          name: "NOW Foods Ultra Omega-3 Cardiovascular",
          subtitle: "500 EPA / 250 DHA • Enteric Coated",
          image: "/vittal/catalog/sports-research-omega3.png",
          price: 1799,
          mrp: 2399,
          discountTag: "Min. 25% Off",
          badge: "Pure Formula",
        },
        {
          id: "truebasics-triple-omega",
          slug: "sports-research-omega3",
          name: "TrueBasics Heart & Joint Triple Omega-3",
          subtitle: "1250mg Fish Oil • Enhanced Bioavailability",
          image: "/vittal/catalog/sports-research-omega3.png",
          price: 1299,
          mrp: 1899,
          discountTag: "Min. 30% Off",
          badge: "High Potency",
        },
        {
          id: "nordic-naturals-ultimate",
          slug: "sports-research-omega3",
          name: "Nordic Naturals Ultimate Omega 1280mg",
          subtitle: "Triglyceride Form • Lemon Taste",
          image: "/vittal/catalog/sports-research-omega3.png",
          price: 2899,
          mrp: 3699,
          discountTag: "Min. 22% Off",
          badge: "Nordic Pure",
        },
        {
          id: "swisse-ultiboost-omega",
          slug: "sports-research-omega3",
          name: "Swisse Ultiboost Odourless Wild Fish Oil",
          subtitle: "Wild Deep Sea Sourced • 200 Capsules",
          image: "/vittal/catalog/sports-research-omega3.png",
          price: 1499,
          mrp: 1999,
          discountTag: "Min. 25% Off",
          badge: "Wild Catch",
        },
        {
          id: "healthkart-hk-vitals-fish-oil",
          slug: "sports-research-omega3",
          name: "HK Vitals Fish Oil 1000mg with Omega 3",
          subtitle: "Brain, Eye & Joint Care • 60 Caps",
          image: "/vittal/catalog/sports-research-omega3.png",
          price: 699,
          mrp: 999,
          discountTag: "Up to 30% Off",
          badge: "Daily Vital",
        },
        {
          id: "carbamide-forte-triple-omega",
          slug: "sports-research-omega3",
          name: "Carbamide Forte Triple Strength Fish Oil",
          subtitle: "Super Potent EPA 550mg DHA 330mg",
          image: "/vittal/catalog/sports-research-omega3.png",
          price: 899,
          mrp: 1299,
          discountTag: "Min. 30% Off",
          badge: "High Strength",
        },
      ],
    },
    {
      id: "creatine",
      label: "Creatine",
      iconImage: "/vittal/catalog/on-creatine-container.png",
      items: [
        {
          id: "on-creatine-container",
          slug: "on-creatine-container",
          name: "Optimum Nutrition Micronized Creatine",
          subtitle: "100% Pure CreaPure • 300g Tub",
          image: "/vittal/catalog/on-creatine-container.png",
          price: 1349,
          mrp: 1799,
          discountTag: "Min. 25% Off",
          badge: "Top Rated",
        },
        {
          id: "gnc-creatine-monohydrate",
          slug: "gnc-creatine-monohydrate",
          name: "GNC Pro Performance Creatine 200-Mesh",
          subtitle: "Ultra-Fine Powder • Explosive Power",
          image: "/vittal/catalog/gnc-creatine-monohydrate.png",
          price: 1199,
          mrp: 1599,
          discountTag: "Min. 25% Off",
          badge: "Instant Mix",
        },
        {
          id: "muscleblaze-creatine-creapure",
          slug: "on-creatine-container",
          name: "MuscleBlaze CreAPure German Creatine",
          subtitle: "100% Creapure Monohydrate • 100g",
          image: "/vittal/catalog/on-creatine-container.png",
          price: 899,
          mrp: 1199,
          discountTag: "Up to 25% Off",
          badge: "German Purity",
        },
        {
          id: "nutrabay-pure-creatine",
          slug: "gnc-creatine-monohydrate",
          name: "Nutrabay Pure Series Creatine Monohydrate",
          subtitle: "Fast Dissolving Micro Powder • 250g",
          image: "/vittal/catalog/gnc-creatine-monohydrate.png",
          price: 699,
          mrp: 999,
          discountTag: "Min. 30% Off",
          badge: "Value Pick",
        },
        {
          id: "wellcore-micronized-creatine",
          slug: "on-creatine-container",
          name: "Wellcore Pure Micronized Creatine Monohydrate",
          subtitle: "Unflavored Clean ATP Fuel • 250g",
          image: "/vittal/catalog/on-creatine-container.png",
          price: 999,
          mrp: 1499,
          discountTag: "Min. 33% Off",
          badge: "Clean Fuel",
        },
        {
          id: "asitis-creatine-monohydrate",
          slug: "gnc-creatine-monohydrate",
          name: "AS-IT-IS Nutrition Pure Creatine Monohydrate",
          subtitle: "100% Pure Lab Tested • 250g",
          image: "/vittal/catalog/gnc-creatine-monohydrate.png",
          price: 649,
          mrp: 899,
          discountTag: "Min. 28% Off",
          badge: "Lab Tested",
        },
        {
          id: "dymatize-creatine-micronized",
          slug: "on-creatine-container",
          name: "Dymatize Micronized Creatine Powder 300g",
          subtitle: "100% HPLC Certified Pure • 60 Servings",
          image: "/vittal/catalog/on-creatine-container.png",
          price: 1699,
          mrp: 2199,
          discountTag: "Min. 23% Off",
          badge: "HPLC Certified",
        },
        {
          id: "muscle-asylum-creatine",
          slug: "gnc-creatine-monohydrate",
          name: "Muscle Asylum Pure Micronized Creatine",
          subtitle: "Rapid Solubility Muscle Booster • 100g",
          image: "/vittal/catalog/gnc-creatine-monohydrate.png",
          price: 599,
          mrp: 849,
          discountTag: "Min. 29% Off",
          badge: "Muscle Booster",
        },
      ],
    },
    {
      id: "pre_workout",
      label: "Pre-Workout",
      iconImage: "/products/muscletech-nitrotech-fruit-punch.png",
      items: [
        {
          id: "muscletech-nitrotech-fruit-punch",
          slug: "muscletech-nitrotech-fruit-punch",
          name: "MuscleTech Nitro-Tech Fruit Punch Pre-Workout",
          subtitle: "Explosive Energy • Pre-Workout Formula",
          image: "/products/muscletech-nitrotech-fruit-punch.png",
          price: 2499,
          mrp: 3499,
          discountTag: "Min. 28% Off",
          badge: "Top Rated",
        },
        {
          id: "c4-original-pre-workout",
          slug: "muscletech-nitrotech-fruit-punch",
          name: "Cellucor C4 Original Explosive Pre-Workout",
          subtitle: "CarnoSyn Beta-Alanine • 30 Servings",
          image: "/products/muscletech-nitrotech-fruit-punch.png",
          price: 1999,
          mrp: 2699,
          discountTag: "Min. 26% Off",
          badge: "Explosive Pump",
        },
        {
          id: "on-gold-standard-pre-workout",
          slug: "muscletech-nitrotech-fruit-punch",
          name: "Optimum Nutrition Gold Standard Pre-Workout",
          subtitle: "175mg Natural Caffeine • 30 Servings",
          image: "/products/muscletech-nitrotech-fruit-punch.png",
          price: 2199,
          mrp: 2999,
          discountTag: "Up to 28% Off",
          badge: "Laser Focus",
        },
        {
          id: "psychotic-insane-labz",
          slug: "muscletech-nitrotech-fruit-punch",
          name: "Insane Labz Psychotic High-Intensity",
          subtitle: "AMPiberry Energy Matrix • 35 Servings",
          image: "/products/muscletech-nitrotech-fruit-punch.png",
          price: 2499,
          mrp: 3499,
          discountTag: "Min. 29% Off",
          badge: "High Stim",
        },
        {
          id: "gat-nitraflex-pre-workout",
          slug: "muscletech-nitrotech-fruit-punch",
          name: "GAT Sport Nitraflex Hyperemia & Energy",
          subtitle: "Clinically Tested Nitric Oxide Booster",
          image: "/products/muscletech-nitrotech-fruit-punch.png",
          price: 2799,
          mrp: 3799,
          discountTag: "Min. 26% Off",
          badge: "NO Booster",
        },
        {
          id: "prosupps-mr-hyde",
          slug: "muscletech-nitrotech-fruit-punch",
          name: "ProSupps Mr. Hyde Signature High-Energy",
          subtitle: "Intense Caffeine Rush • 30 Servings",
          image: "/products/muscletech-nitrotech-fruit-punch.png",
          price: 2299,
          mrp: 3199,
          discountTag: "Min. 28% Off",
          badge: "High Energy",
        },
        {
          id: "animal-fury-pre-workout",
          slug: "muscletech-nitrotech-fruit-punch",
          name: "Universal Nutrition Animal Fury Pre-Workout",
          subtitle: "350mg Caffeine • Green Apple 30 Servings",
          image: "/products/muscletech-nitrotech-fruit-punch.png",
          price: 3199,
          mrp: 4299,
          discountTag: "Min. 25% Off",
          badge: "Hardcore",
        },
        {
          id: "muscleblaze-pre-workout-200",
          slug: "muscletech-nitrotech-fruit-punch",
          name: "MuscleBlaze Pre-Workout 200 Extreme",
          subtitle: "Instant Energy & Endurance Formula",
          image: "/products/muscletech-nitrotech-fruit-punch.png",
          price: 1299,
          mrp: 1799,
          discountTag: "Min. 27% Off",
          badge: "Extreme Pump",
        },
      ],
    },
  ],
};

let inMemorySupplementShowcase: SupplementShowcaseConfig = { ...DEFAULT_SUPPLEMENT_SHOWCASE };
let supplementShowcaseCachedAt = 0;

export async function getSupplementShowcase(): Promise<SupplementShowcaseConfig> {
  const now = Date.now();
  if (now - supplementShowcaseCachedAt > TTL_MS) {
    try {
      const rows = await executeD1Query<{ provider: string; config_data: string; is_active: number }>(
        "SELECT config_data FROM integrations_config WHERE provider = ?",
        ["supplement_showcase"]
      );
      if (rows && rows.length > 0 && rows[0].config_data) {
        const parsed = JSON.parse(rows[0].config_data);
        if (parsed && typeof parsed === "object" && Array.isArray(parsed.categories) && parsed.categories.length > 0) {
          inMemorySupplementShowcase = {
            overlineText: parsed.overlineText ?? DEFAULT_SUPPLEMENT_SHOWCASE.overlineText,
            headingText: parsed.headingText ?? DEFAULT_SUPPLEMENT_SHOWCASE.headingText,
            buttonText: parsed.buttonText ?? DEFAULT_SUPPLEMENT_SHOWCASE.buttonText,
            buttonLink: parsed.buttonLink ?? DEFAULT_SUPPLEMENT_SHOWCASE.buttonLink,
            bgGradientFrom: parsed.bgGradientFrom ?? DEFAULT_SUPPLEMENT_SHOWCASE.bgGradientFrom,
            bgGradientVia: parsed.bgGradientVia ?? DEFAULT_SUPPLEMENT_SHOWCASE.bgGradientVia,
            bgGradientTo: parsed.bgGradientTo ?? DEFAULT_SUPPLEMENT_SHOWCASE.bgGradientTo,
            borderColor: parsed.borderColor ?? DEFAULT_SUPPLEMENT_SHOWCASE.borderColor,
            templateKey: parsed.templateKey ?? DEFAULT_SUPPLEMENT_SHOWCASE.templateKey,
            categories: parsed.categories.map((cat: any, cIdx: number) => ({
              id: cat.id || `tab_${cIdx + 1}`,
              label: cat.label || `Category ${cIdx + 1}`,
              iconImage: cat.iconImage || "/vittal/catalog/on-gold-standard-whey.png",
              items: Array.isArray(cat.items)
                ? cat.items.map((it: any, iIdx: number) => ({
                    id: it.id || `item_${cIdx}_${iIdx}`,
                    slug: it.slug || it.id || "product",
                    name: it.name || "Product Name",
                    subtitle: it.subtitle || "",
                    image: it.image || "/vittal/product-whey-protein-jar.png",
                    price: typeof it.price === "number" ? it.price : 999,
                    mrp: typeof it.mrp === "number" ? it.mrp : 1499,
                    discountTag: it.discountTag || "Special Offer",
                    badge: it.badge || "",
                  }))
                : [],
            })),
          };
        }
      }
      supplementShowcaseCachedAt = Date.now();
    } catch (err) {
      console.warn("Failed to fetch supplement_showcase from D1:", err);
    }
  }

  return inMemorySupplementShowcase;
}

export async function saveSupplementShowcase(
  config: SupplementShowcaseConfig
): Promise<SupplementShowcaseConfig> {
  supplementShowcaseCachedAt = Date.now();
  inMemorySupplementShowcase = {
    overlineText: config.overlineText?.trim() || "PRO GYM NUTRITION",
    headingText: config.headingText?.trim() || "Fuel Every Workout",
    buttonText: config.buttonText?.trim() || "Explore All Gym Supplements",
    buttonLink: config.buttonLink?.trim() || "/products?category=Gym+Supplementaries",
    bgGradientFrom: config.bgGradientFrom || "#587933",
    bgGradientVia: config.bgGradientVia || "#466324",
    bgGradientTo: config.bgGradientTo || "#344C19",
    borderColor: config.borderColor || "#6B9E3A",
    templateKey: config.templateKey || "brand_olive",
    categories: Array.isArray(config.categories)
      ? config.categories.map((cat, cIdx) => ({
          id: cat.id || `tab_${cIdx + 1}`,
          label: cat.label?.trim() || `Category ${cIdx + 1}`,
          iconImage: cat.iconImage || "/vittal/catalog/on-gold-standard-whey.png",
          items: Array.isArray(cat.items)
            ? cat.items.map((it, iIdx) => ({
                id: it.id || `item_${cIdx}_${iIdx}`,
                slug: it.slug || it.id || "product",
                name: it.name?.trim() || "Product Name",
                subtitle: it.subtitle?.trim() || "",
                image: it.image || "/vittal/product-whey-protein-jar.png",
                price: typeof it.price === "number" ? it.price : 999,
                mrp: typeof it.mrp === "number" ? it.mrp : 1499,
                discountTag: it.discountTag?.trim() || "Special Offer",
                badge: it.badge?.trim() || "",
              }))
            : [],
        }))
      : DEFAULT_SUPPLEMENT_SHOWCASE.categories,
  };

  try {
    const jsonStr = JSON.stringify(inMemorySupplementShowcase);
    await executeD1Query(
      `INSERT INTO integrations_config (provider, config_data, is_active, last_synced_at, updated_at)
       VALUES (?, ?, 1, datetime('now'), datetime('now'))
       ON CONFLICT(provider) DO UPDATE SET 
         config_data = excluded.config_data,
         is_active = excluded.is_active,
         updated_at = excluded.updated_at`,
      ["supplement_showcase", jsonStr]
    );
  } catch (err) {
    console.warn("Failed to persist supplement_showcase to D1:", err);
  }

  return inMemorySupplementShowcase;
}
