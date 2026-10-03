export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  category: "Decor" | "Accessories" | "Essentials" | "Modern Living" | "Lifestyle" | string;
  tagline: string;
  description: string;
  price: number;
  mrp: number;
  offer_price: number;
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
  colors?: {
    name: string;
    image: string;
    thumb?: string;
    colorHex?: string;
  }[];
  features?: string[];
  specifications?: Record<string, string>;
  whats_in_box?: string[];
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
  name: string;
  subtitle: string;
  category: string;
  tagline: string;
  description: string;
  volume: string;
  mrp: number;
  offer_price: number;
  stock_count: number;
  poster_image: string;
  images: string;
  color: string;
  material: string;
}
