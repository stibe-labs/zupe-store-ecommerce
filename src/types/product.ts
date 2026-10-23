export interface BuyMoreSaveMoreTier {
  qty: number;
  badge: string;
  discountPercent: number;
  customPrice?: number;
  tagText?: string;
  enabled?: boolean;
}

export interface BuyMoreSaveMoreConfig {
  enabled: boolean;
  headerTitle?: string;
  tiers: BuyMoreSaveMoreTier[];
}

export interface ProductColorVariant {
  name: string;
  image: string;
  thumb?: string;
  colorHex?: string;
  images?: string[];
}

export interface ProductOverviewBlock {
  id: string;
  heading?: string;
  details?: string;
  media_url?: string;
  media_caption?: string;
}

export type HowToUseMediaType = "image" | "gif" | "video";
export type HowToUseMediaFit = "contain" | "cover";
export type HowToUseSectionBg = "white" | "soft_gray" | "light_orange";
export type HowToUseCardRadius = "rounded-xl" | "rounded-2xl" | "rounded-3xl";
export type HowToUseCardBorder = "subtle" | "orange" | "none";
export type HowToUseCardShadow = "none" | "sm" | "md" | "lg";

export interface HowToUseStep {
  id: string;
  media_type?: HowToUseMediaType;
  media_url?: string;
  thumbnail_url?: string;
  media_fit?: HowToUseMediaFit;
  title?: string;
  description?: string;
}

export interface HowToUseConfig {
  enabled: boolean;
  section_bg?: HowToUseSectionBg;
  card_radius?: HowToUseCardRadius;
  card_border?: HowToUseCardBorder;
  card_shadow?: HowToUseCardShadow;
  steps: HowToUseStep[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  category: "Decor" | "Accessories" | "Essentials" | "Modern Living" | "Lifestyle" | string;
  subcategory?: string;
  tagline: string;
  description: string;
  price: number;
  mrp: number;
  offer_price: number;
  cost_price?: number;
  stock_count: number;
  volume?: string;
  poster_image: string;
  images?: string[];
  color?: string;
  material?: string;
  in_stock: number;
  rating?: number;
  review_count?: number;
  badge?: "New" | "Sale" | "Trending" | "Limited" | "";
  created_at?: string;
  sold_count?: string;
  has_colors?: boolean;
  colors?: ProductColorVariant[];
  overview_blocks?: ProductOverviewBlock[];
  features?: string[];
  specifications?: Record<string, string>;
  whats_in_box?: string[];
  bundle_tiers?: BuyMoreSaveMoreConfig;
  how_to_use?: HowToUseConfig;
  shipping_info?: string[];
  return_info?: string[];
  reviews_data?: {
    average: number;
    total: number;
    breakdown: { star: number; percentage: number }[];
    user_photos: { image: string; isVideo?: boolean }[];
    list: {
      id: string;
      author: string;
      avatar: string;
      date: string;
      rating: number;
      verified: boolean;
      comment: string;
      images?: string[];
    }[];
  };
}

export interface AdminProductFormData {
  id?: string;
  slug?: string;
  name: string;
  subtitle?: string;
  category: string;
  subcategory?: string;
  tagline?: string;
  description?: string;
  volume?: string;
  price: number;
  mrp: number;
  offer_price?: number;
  cost_price?: number;
  stock_count: number;
  in_stock: number;
  poster_image: string;
  images?: string[];
  color?: string;
  has_colors?: boolean;
  colors?: ProductColorVariant[];
  material?: string;
  badge?: string;
  rating?: number;
  review_count?: number;
  sold_count?: string;
  features?: string[];
  specifications?: Record<string, string>;
  whats_in_box?: string[];
  bundle_tiers?: BuyMoreSaveMoreConfig;
  how_to_use?: HowToUseConfig;
}
