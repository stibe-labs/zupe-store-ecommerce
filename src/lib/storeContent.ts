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
  image: string; // Desktop view photo (16:9 / landscape)
  mobileImage?: string; // Mobile view photo (4:5 / 1:1 portrait)
  taglineRight?: string;
  active: boolean;
  order?: number;
}

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string; // Preset icon name (e.g. Armchair, Headphones)
  customIcon?: string; // Custom uploaded icon URL / Data URL
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
    titleLine1: "Auto Essentials",
    titleLine2: "Style & Comfort.",
    description: "Upgrade your driving experience with solar powered diffusing fragrances and smart organizers.",
    ctaText: "Explore Now",
    ctaLink: "/products?category=Auto+Essentials",
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
