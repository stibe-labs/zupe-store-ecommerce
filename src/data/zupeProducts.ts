import { Product, HowToUseConfig } from "@/types/product";

export interface TurkiyeJamVariant {
  id: string;
  name: string;
  packageDescription: string;
  price: number;
  mrp: number;
  savings: number;
  badge?: string;
  freeBonus?: string;
  image: string;
  popular?: boolean;
}

export const TURKIYE_JAM_VARIANTS: TurkiyeJamVariant[] = [
  {
    id: "bottle-240g",
    name: "240g Glass Jar + 2 Free Strips",
    packageDescription: "Full 240g Jar + 2 Bonus Sachet Strips Included",
    price: 2899,
    mrp: 4500,
    savings: 1601,
    badge: "2 sachets free",
    freeBonus: "2 Free Sachets Included",
    image: "/tj/turkiye-jam-jar-2-strips.png",
    popular: true,
  },
  {
    id: "combo-box-14",
    name: "Sachet Box, 12 + 2",
    packageDescription: "Complete Sealed Box with 14 Sachet Strips",
    price: 2899,
    mrp: 4800,
    savings: 1901,
    badge: "Best value",
    freeBonus: "14 Total Sachets",
    image: "/tj/turkiye-jam-box-14-strips.png",
    popular: false,
  },
  {
    id: "pack-6",
    name: "6 Sachet Pack",
    packageDescription: "Multi-Session Value Pack (6 Sachets)",
    price: 1899,
    mrp: 3200,
    savings: 1301,
    badge: "Save 30%",
    freeBonus: "Multi-Session Pack",
    image: "/tj/turkiye-jam-6-strips.png",
    popular: false,
  },
  {
    id: "pack-4",
    name: "4 Sachet Pack",
    packageDescription: "Popular 4-Session Sachet Pack",
    price: 1399,
    mrp: 2399,
    savings: 1000,
    badge: "Save 22%",
    freeBonus: "4 Sachets",
    image: "/tj/turkiye-jam-4-strips.png",
    popular: false,
  },
  {
    id: "pack-3",
    name: "3 Sachet Pack",
    packageDescription: "Standard 3-Session Sachet Pack",
    price: 1099,
    mrp: 1899,
    savings: 800,
    badge: "Save 18%",
    freeBonus: "3 Sachets",
    image: "/tj/turkiye-jam-3-strips.png",
    popular: false,
  },
  {
    id: "pack-2",
    name: "2 Sachet Pack",
    packageDescription: "First-Time Discovery Trial Pack (2 Sachets)",
    price: 899,
    mrp: 1499,
    savings: 600,
    badge: "Try it",
    freeBonus: "2 Sachets",
    image: "/tj/turkiye-jam-2-strips.png",
    popular: false,
  },
];

const COMMON_FEATURES = [
  "100% Authentic Turkish Import (Themra Bitkisel Ürünler Turkey)",
  "For Men: Extended stamina, heightened endurance and peak physical control",
  "For Men: Rapid post-session recovery enabling multiple intimate rounds",
  "For Women: Stimulates natural sensual libido, arousal and climax intensity",
  "Express 1–2 Day Priority Delivery across India",
  "100% Discreet & Opaque Plain Box Packaging for Complete Privacy",
  "Money-Back Guarantee: Return unused sachet strips for a full pro-rata refund",
];

const COMMON_SPECS = {
  "Product Name": "Themra Epimedium Herbal Macun (Turkish Paste)",
  "Country of Origin": "Made in Turkey 🇹🇷 (Themra Bitkisel)",
  "Key Ingredients": "Epimedium (Horny Goat Weed), Pure Flower Honey, Royal Jelly, Red Ginseng, Ginger, Maca Root, Cinnamon",
  "Form": "Herbal Honey Paste (Jar & Single-Use Sachets)",
  "Target Audience": "Adult Men & Women (18+)",
  "Packaging": "100% Discreet, Tamper-Proof Plain Box",
  "Prepaid Shipping": "1–2 Days Superfast Express Delivery",
  "COD Shipping": "3–7 Days Doorstep Delivery",
};

const COMMON_WHATS_IN_BOX = [
  "1 × Authentic Themra Epimedium Turkish Macun (Selected Package)",
  "Comprehensive Usage & Safety Guide",
  "Discreet, Unmarked Outer Shipping Box",
];

const COMMON_SHIPPING = [
  "Fast Dispatch: Orders dispatched within 24 hours from our regional fulfillment hub.",
  "Prepaid Online: Free Express Priority Delivery.",
  "Cash on Delivery: Available across all PIN codes in India.",
  "100% Discreet Packaging: Plain, neutral box with zero product mentions on the external shipping label.",
];

const COMMON_RETURNS = [
  "Unused Strip Guarantee: If you use sachet strips and do not experience results, return the remaining unopened strips.",
  "Full Pro-Rata Refund: You will receive a direct refund for all returned strips to your UPI or bank account.",
  "Dedicated WhatsApp Support: Friendly customer care available 7 days a week.",
];

const COMMON_HOW_TO_USE: HowToUseConfig = {
  enabled: true,
  section_bg: "white",
  card_radius: "rounded-2xl",
  card_border: "subtle",
  card_shadow: "sm",
  steps: [
    {
      id: "step-1",
      media_type: "image",
      media_url: "/tj/turkiye-jam-jar-2-strips.png",
      media_fit: "contain",
      title: "1. Eat a Light Meal 1 Hour Before",
      description: "Never consume on an empty stomach. Have a normal light meal approximately one hour prior to intimate activity.",
    },
    {
      id: "step-2",
      media_type: "image",
      media_url: "/tj/turkiye-jam-3-strips.png",
      media_fit: "contain",
      title: "2. Take 1 Small Spoon or 1 Sachet Strip",
      description: "Wait 10 minutes after your meal, then take exactly one small teaspoon (if from jar) or one complete sachet strip.",
    },
    {
      id: "step-3",
      media_type: "image",
      media_url: "/tj/turkiye-jam-jar-2-strips.png",
      media_fit: "contain",
      title: "3. Stir Thoroughly (If Using the Jar)",
      description: "Botanical extracts and honey naturally settle. Stir the jar well with a clean spoon before scooping your dose.",
    },
    {
      id: "step-4",
      media_type: "image",
      media_url: "/tj/turkiye-jam-4-strips.png",
      media_fit: "contain",
      title: "4. Drink a Glass of Warm Milk After 15 Mins",
      description: "Drinking a glass of warm milk 15 minutes after taking the paste accelerates herbal absorption and doubles effectiveness.",
    },
    {
      id: "step-5",
      media_type: "image",
      media_url: "/tj/turkiye-jam-box-14-strips.png",
      media_fit: "contain",
      title: "5. Avoid Cold Carbonated Beverages",
      description: "Refrain from drinking chilled soft drinks or cold sodas immediately before or after consuming the paste.",
    },
  ],
};

const COMMON_REVIEWS = {
  average: 4.9,
  total: 1480,
  breakdown: [
    { star: 5, percentage: 92 },
    { star: 4, percentage: 6 },
    { star: 3, percentage: 1 },
    { star: 2, percentage: 1 },
    { star: 1, percentage: 0 },
  ],
  user_photos: [
    { image: "/tj/turkiye-jam-jar-2-strips.png" },
    { image: "/tj/turkiye-jam-box-14-strips.png" },
    { image: "/tj/turkiye-jam-gallery-1.jpeg" },
    { image: "/tj/turkiye-jam-gallery-2.jpeg" },
  ],
  list: [
    {
      id: "rev-1",
      author: "Faisal K. (Kozhikode)",
      avatar: "/avatars/avatar-1.jpg",
      date: "Yesterday",
      rating: 5,
      verified: true,
      comment:
        "100% genuine Themra Turkish Macun. Noticed exceptional stamina and duration after the very first sachet. The discreet packaging gave me complete peace of mind.",
      images: ["/tj/turkiye-jam-3-strips.png"],
    },
    {
      id: "rev-2",
      author: "Verified Couple (Kochi)",
      avatar: "/avatars/avatar-2.jpg",
      date: "3 days ago",
      rating: 5,
      verified: true,
      comment:
        "Both my partner and I tried it following the instructions with warm milk. The mutual intimacy, energy, and satisfaction were unforgettable. Worth every rupee.",
    },
    {
      id: "rev-3",
      author: "Jithin R. (Thrissur)",
      avatar: "/avatars/avatar-3.jpg",
      date: "5 days ago",
      rating: 5,
      verified: true,
      comment:
        "Ordered the 240g jar and received 2 free sachets. Fast delivery in just 24 hours. Authentic seal and great taste.",
      images: ["/tj/turkiye-jam-jar-2-strips.png"],
    },
    {
      id: "rev-4",
      author: "Muhammed S. (Malappuram)",
      avatar: "/avatars/avatar-4.jpg",
      date: "1 week ago",
      rating: 5,
      verified: true,
      comment:
        "The refund guarantee on unused strips was what gave me confidence to try. But after testing, I will never return it — ordering another box today!",
    },
  ],
};

const BASE_DESC = "Directly imported from Turkey, Themra Epimedium Herbal Macun is a globally acclaimed herbal honey paste crafted from centuries-old traditional recipes. Formulated with Epimedium (Horny Goat Weed), Pure Flower Honey, Royal Jelly, Red Ginseng, and botanical extracts, it delivers sustained physical stamina, heightened endurance, and sensual vitality for both men and women.";

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "turkiye-jam-pack-2",
    slug: "turkiye-jam-2-sachet-pack",
    name: "Themra Epimedium - 2 Sachet Pack",
    subtitle: "The easy first order • Single-serve sachets",
    category: "Vitality & Wellness",
    subcategory: "Herbal Vitality",
    tagline: "First-Time Discovery Trial Pack (2 Sachets)",
    description: BASE_DESC,
    price: 899,
    mrp: 1499,
    offer_price: 899,
    cost_price: 350,
    stock_count: 25,
    volume: "2 Sachet Strips",
    poster_image: "/tj/turkiye-jam-2-strips.png",
    images: ["/tj/turkiye-jam-2-strips.png", "/tj/turkiye-jam-gallery-1.jpeg", "/tj/turkiye-jam-gallery-2.jpeg"],
    color: "2 Sachet Pack",
    material: "100% Natural Herbal Honey Paste (Epimedium, Royal Jelly, Ginseng)",
    in_stock: 1,
    rating: 4.9,
    review_count: 1480,
    sold_count: "4,200+ delivered across India",
    badge: "Try it",
    has_colors: false,
    colors: [],
    features: COMMON_FEATURES,
    specifications: COMMON_SPECS,
    whats_in_box: COMMON_WHATS_IN_BOX,
    shipping_info: COMMON_SHIPPING,
    return_info: COMMON_RETURNS,
    how_to_use: COMMON_HOW_TO_USE,
    reviews_data: COMMON_REVIEWS,
  },
  {
    id: "turkiye-jam-pack-3",
    slug: "turkiye-jam-3-sachet-pack",
    name: "Themra Epimedium - 3 Sachet Pack",
    subtitle: "Standard 3-Session Pack • Single-serve sachets",
    category: "Vitality & Wellness",
    subcategory: "Herbal Vitality",
    tagline: "Best-Selling Discovery Pack (3 Sachets)",
    description: BASE_DESC,
    price: 1099,
    mrp: 1899,
    offer_price: 1099,
    cost_price: 450,
    stock_count: 25,
    volume: "3 Sachet Strips",
    poster_image: "/tj/turkiye-jam-3-strips.png",
    images: ["/tj/turkiye-jam-3-strips.png", "/tj/turkiye-jam-gallery-1.jpeg", "/tj/turkiye-jam-gallery-2.jpeg"],
    color: "3 Sachet Pack",
    material: "100% Natural Herbal Honey Paste (Epimedium, Royal Jelly, Ginseng)",
    in_stock: 1,
    rating: 4.9,
    review_count: 1480,
    sold_count: "4,200+ delivered across India",
    badge: "Save 18%",
    has_colors: false,
    colors: [],
    features: COMMON_FEATURES,
    specifications: COMMON_SPECS,
    whats_in_box: COMMON_WHATS_IN_BOX,
    shipping_info: COMMON_SHIPPING,
    return_info: COMMON_RETURNS,
    how_to_use: COMMON_HOW_TO_USE,
    reviews_data: COMMON_REVIEWS,
  },
  {
    id: "turkiye-jam-pack-4",
    slug: "turkiye-jam-4-sachet-pack",
    name: "Themra Epimedium - 4 Sachet Pack",
    subtitle: "Popular 4-Session Sachet Pack",
    category: "Vitality & Wellness",
    subcategory: "Herbal Vitality",
    tagline: "Extended Vitality & Performance (4 Sachets)",
    description: BASE_DESC,
    price: 1399,
    mrp: 2399,
    offer_price: 1399,
    cost_price: 550,
    stock_count: 25,
    volume: "4 Sachet Strips",
    poster_image: "/tj/turkiye-jam-4-strips.png",
    images: ["/tj/turkiye-jam-4-strips.png", "/tj/turkiye-jam-gallery-1.jpeg", "/tj/turkiye-jam-gallery-2.jpeg"],
    color: "4 Sachet Pack",
    material: "100% Natural Herbal Honey Paste (Epimedium, Royal Jelly, Ginseng)",
    in_stock: 1,
    rating: 4.9,
    review_count: 1480,
    sold_count: "4,200+ delivered across India",
    badge: "Save 22%",
    has_colors: false,
    colors: [],
    features: COMMON_FEATURES,
    specifications: COMMON_SPECS,
    whats_in_box: COMMON_WHATS_IN_BOX,
    shipping_info: COMMON_SHIPPING,
    return_info: COMMON_RETURNS,
    how_to_use: COMMON_HOW_TO_USE,
    reviews_data: COMMON_REVIEWS,
  },
  {
    id: "turkiye-jam-pack-6",
    slug: "turkiye-jam-6-sachet-pack",
    name: "Themra Epimedium - 6 Sachet Pack",
    subtitle: "Multi-Session Value Pack • 30% Off",
    category: "Vitality & Wellness",
    subcategory: "Herbal Vitality",
    tagline: "Saver Pack for Active Couples (6 Sachets)",
    description: BASE_DESC,
    price: 1899,
    mrp: 3200,
    offer_price: 1899,
    cost_price: 750,
    stock_count: 25,
    volume: "6 Sachet Strips",
    poster_image: "/tj/turkiye-jam-6-strips.png",
    images: ["/tj/turkiye-jam-6-strips.png", "/tj/turkiye-jam-gallery-1.jpeg", "/tj/turkiye-jam-gallery-2.jpeg"],
    color: "6 Sachet Pack",
    material: "100% Natural Herbal Honey Paste (Epimedium, Royal Jelly, Ginseng)",
    in_stock: 1,
    rating: 4.9,
    review_count: 1480,
    sold_count: "4,200+ delivered across India",
    badge: "Save 30%",
    has_colors: false,
    colors: [],
    features: COMMON_FEATURES,
    specifications: COMMON_SPECS,
    whats_in_box: COMMON_WHATS_IN_BOX,
    shipping_info: COMMON_SHIPPING,
    return_info: COMMON_RETURNS,
    how_to_use: COMMON_HOW_TO_USE,
    reviews_data: COMMON_REVIEWS,
  },
  {
    id: "turkiye-jam-combo-box-14",
    slug: "turkiye-jam-sachet-box-14",
    name: "Themra Epimedium - Sachet Box (12 + 2 Sachets)",
    subtitle: "14 single-serve sachets, 2 on the house",
    category: "Vitality & Wellness",
    subcategory: "Herbal Vitality",
    tagline: "Best Value Complete Box • 14 Total Sachets",
    description: BASE_DESC,
    price: 2899,
    mrp: 4800,
    offer_price: 2899,
    cost_price: 1150,
    stock_count: 25,
    volume: "14 Sachet Strips (12+2 Box)",
    poster_image: "/tj/turkiye-jam-box-14-strips.png",
    images: ["/tj/turkiye-jam-box-14-strips.png", "/tj/turkiye-jam-gallery-1.jpeg", "/tj/turkiye-jam-gallery-2.jpeg"],
    color: "Sachet Box, 12 + 2",
    material: "100% Natural Herbal Honey Paste (Epimedium, Royal Jelly, Ginseng)",
    in_stock: 1,
    rating: 4.9,
    review_count: 1480,
    sold_count: "4,200+ delivered across India",
    badge: "Best value",
    has_colors: false,
    colors: [],
    features: COMMON_FEATURES,
    specifications: COMMON_SPECS,
    whats_in_box: COMMON_WHATS_IN_BOX,
    shipping_info: COMMON_SHIPPING,
    return_info: COMMON_RETURNS,
    how_to_use: COMMON_HOW_TO_USE,
    reviews_data: COMMON_REVIEWS,
  },
  {
    id: "turkiye-jam-bottle-240g",
    slug: "turkiye-jam-epimedium-macun",
    name: "Themra Epimedium - 240g Jar + 2 Sachets Free",
    subtitle: "The full 240g glass jar with a bonus pair",
    category: "Vitality & Wellness",
    subcategory: "Herbal Vitality",
    tagline: "Full Glass Jar + 2 Bonus Sachet Strips",
    description: BASE_DESC,
    price: 2899,
    mrp: 4500,
    offer_price: 2899,
    cost_price: 1150,
    stock_count: 25,
    volume: "240g Glass Jar + 2 Bonus Sachets",
    poster_image: "/tj/turkiye-jam-jar-2-strips.png",
    images: ["/tj/turkiye-jam-jar-2-strips.png", "/tj/turkiye-jam-gallery-1.jpeg", "/tj/turkiye-jam-gallery-2.jpeg"],
    color: "240g Jar + 2 Sachets Free",
    material: "100% Natural Herbal Honey Paste (Epimedium, Royal Jelly, Ginseng)",
    in_stock: 1,
    rating: 4.9,
    review_count: 1480,
    sold_count: "4,200+ delivered across India",
    badge: "2 sachets free",
    has_colors: false,
    colors: [],
    features: COMMON_FEATURES,
    specifications: COMMON_SPECS,
    whats_in_box: COMMON_WHATS_IN_BOX,
    shipping_info: COMMON_SHIPPING,
    return_info: COMMON_RETURNS,
    how_to_use: COMMON_HOW_TO_USE,
    reviews_data: COMMON_REVIEWS,
  },
];

export const PRODUCT_CATEGORIES = [
  "All Products",
  "Vitality & Wellness",
  "Herbal Vitality",
  "Men's Performance",
  "Women's Wellness",
];

export interface SubcategoryGroup {
  mainCategory: string;
  subcategories: string[];
}

export const CATEGORY_SUBCATEGORIES_CONFIG: SubcategoryGroup[] = [
  {
    mainCategory: "Vitality & Wellness",
    subcategories: ["Turkish Macun", "Epimedium Herbal Paste", "Sachet Strips", "240g Glass Jar"],
  },
  {
    mainCategory: "Herbal Vitality",
    subcategories: ["Turkish Macun", "Epimedium Herbal Paste", "Sachet Strips", "240g Glass Jar"],
  },
];

export const CATEGORY_SUBCATEGORIES_MAP: Record<string, string[]> = {
  "Vitality & Wellness": ["Turkish Macun", "Epimedium Herbal Paste", "Sachet Strips", "240g Glass Jar"],
  "Herbal Vitality": ["Turkish Macun", "Epimedium Herbal Paste", "Sachet Strips", "240g Glass Jar"],
};

export function getSubcategoriesForCategory(categoryName: string, dynamicCategories?: any[]): string[] {
  return ["Turkish Macun", "Epimedium Herbal Paste", "Sachet Strips", "240g Glass Jar"];
}

export function doesCategoryMatch(productCategory: string, selectedCategory: string, dynamicCategories?: any[]): boolean {
  if (!selectedCategory || selectedCategory === "All Products" || selectedCategory === "all") return true;
  return true;
}

export function doesSubcategoryMatch(product: Product, selectedSubcategory: string): boolean {
  if (!selectedSubcategory || selectedSubcategory === "All") return true;
  return true;
}
