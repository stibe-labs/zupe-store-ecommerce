// Store Content & Customizer Storage Layer (D1 + In-Memory Fallback)
import { executeD1Query } from "@/lib/d1";

export interface HeroBannerSlide {
  id: string;
  badge: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  taglineRight?: string;
  active: boolean;
  order?: number;
}

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  bgColor?: string;
  iconColor?: string;
  showInNavbar?: boolean;
  showInPills?: boolean;
  showInCollections?: boolean;
  order?: number;
  active: boolean;
}

export const DEFAULT_HERO_BANNERS: HeroBannerSlide[] = [
  {
    id: "ripple-lamp",
    badge: "SMART SOLUTIONS FOR A BETTER LIFE",
    titleLine1: "Innovative Products",
    titleLine2: "Modern Living.",
    description: "Discover unique and useful products that make your life easier, smarter and more fun.",
    ctaText: "Shop Now",
    ctaLink: "/products/dynamic-water-ripple-night-light",
    image: "/products/hero-banner.jpg",
    taglineRight: "Small Products Big Happiness ♡",
    active: true,
    order: 1,
  },
  {
    id: "car-accessories",
    badge: "PREMIUM LIFESTYLE ESSENTIALS",
    titleLine1: "Car Accessories",
    titleLine2: "Style & Comfort.",
    description: "Upgrade your driving experience with solar powered diffusing fragrances and smart organizers.",
    ctaText: "Explore Now",
    ctaLink: "/products?category=Car+Accessories",
    image: "/products/helicopter-perfume.jpg",
    taglineRight: "Drive In Luxury ♡",
    active: true,
    order: 2,
  },
  {
    id: "smart-gadgets",
    badge: "CUTTING-EDGE EVERYDAY TECH",
    titleLine1: "Smart Tech Gadgets",
    titleLine2: "Everyday Ease.",
    description: "High-performance portable audio and emergency power to keep your routine charged and effortless.",
    ctaText: "Discover Tech",
    ctaLink: "/products/tf20-multipurpose-powerbank-with-airpods",
    image: "/products/powerbank-earbuds.jpg",
    taglineRight: "Pure Sound & Power ♡",
    active: true,
    order: 3,
  },
];

export const DEFAULT_STORE_CATEGORIES: StoreCategory[] = [
  {
    id: "home-living",
    name: "Home & Living",
    slug: "Home & Living",
    icon: "Armchair",
    bgColor: "bg-[#FEEBEA]",
    iconColor: "text-[#E0533C]",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 1,
    active: true,
  },
  {
    id: "gadgets",
    name: "Gadgets",
    slug: "Gadgets",
    icon: "Headphones",
    bgColor: "bg-[#E0F2FE]",
    iconColor: "text-[#0284C7]",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 2,
    active: true,
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
  },
  {
    id: "health-wellness",
    name: "Health & Wellness",
    slug: "Health & Wellness",
    icon: "Leaf",
    bgColor: "bg-[#DCFCE7]",
    iconColor: "text-[#16A34A]",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 4,
    active: true,
  },
  {
    id: "car-accessories",
    name: "Car Accessories",
    slug: "Car Accessories",
    icon: "Car",
    bgColor: "bg-[#FEF3C7]",
    iconColor: "text-[#D97706]",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    order: 5,
    active: true,
  },
  {
    id: "kitchen-essentials",
    name: "Kitchen Essentials",
    slug: "Kitchen Essentials",
    icon: "UtensilsCrossed",
    bgColor: "bg-[#FFEDD5]",
    iconColor: "text-[#EA580C]",
    showInNavbar: false,
    showInPills: true,
    showInCollections: true,
    order: 6,
    active: true,
  },
  {
    id: "stationery",
    name: "Stationery",
    slug: "Stationery",
    icon: "PenTool",
    bgColor: "bg-[#FCE7F3]",
    iconColor: "text-[#DB2777]",
    showInNavbar: false,
    showInPills: true,
    showInCollections: true,
    order: 7,
    active: true,
  },
  {
    id: "pet-essentials",
    name: "Pet Essentials",
    slug: "Pet Essentials",
    icon: "Footprints",
    bgColor: "bg-[#E0E7FF]",
    iconColor: "text-[#4F46E5]",
    showInNavbar: false,
    showInPills: true,
    showInCollections: true,
    order: 8,
    active: true,
  },
];

// In-Memory state caches
let inMemoryBanners: HeroBannerSlide[] = [...DEFAULT_HERO_BANNERS];
let inMemoryCategories: StoreCategory[] = [...DEFAULT_STORE_CATEGORIES];

export async function getBanners(includeInactive = false): Promise<HeroBannerSlide[]> {
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
  } catch (err) {
    console.warn("Failed to fetch hero_banners from D1:", err);
  }

  if (includeInactive) {
    return inMemoryBanners;
  }
  return inMemoryBanners.filter((b) => b.active !== false);
}

export async function saveBanners(banners: HeroBannerSlide[]): Promise<HeroBannerSlide[]> {
  inMemoryBanners = banners;

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
  try {
    const rows = await executeD1Query<{ provider: string; config_data: string; is_active: number }>(
      "SELECT config_data FROM integrations_config WHERE provider = ?",
      ["store_categories"]
    );
    if (rows && rows.length > 0 && rows[0].config_data) {
      const parsed = JSON.parse(rows[0].config_data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryCategories = parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch store_categories from D1:", err);
  }

  if (includeInactive) {
    return inMemoryCategories;
  }
  return inMemoryCategories.filter((c) => c.active !== false);
}

export async function saveCategories(categories: StoreCategory[]): Promise<StoreCategory[]> {
  inMemoryCategories = categories;

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
