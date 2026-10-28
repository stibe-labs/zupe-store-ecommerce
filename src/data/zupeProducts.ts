import { Product } from "@/types/product";

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
    mrp: 4999,
    savings: 2100,
    badge: "BEST VALUE",
    freeBonus: "2 Free Sachets Included",
    image: "/products/turkiye-jam/turkiye-jam-jar-and-box.jpg",
    popular: true,
  },
  {
    id: "box-14-strips",
    name: "14 Sachet Strips Box (12 + 2 Pack)",
    packageDescription: "Complete Sealed Box with 14 Sachet Strips",
    price: 2899,
    mrp: 4999,
    savings: 2100,
    badge: "FULL BOX",
    freeBonus: "14 Total Sachets",
    image: "/products/turkiye-jam/turkiye-jam-box-strips.jpg",
    popular: false,
  },
  {
    id: "pack-6-strips",
    name: "6 Sachet Strips Pack",
    packageDescription: "Multi-Session Value Pack (6 Sachets)",
    price: 1899,
    mrp: 2999,
    savings: 1100,
    badge: "SAVER PACK",
    freeBonus: "Multi-Session Pack",
    image: "/products/turkiye-jam/turkiye-jam-5-strips.jpg",
    popular: false,
  },
  {
    id: "pack-4-strips",
    name: "4 Sachet Strips Pack",
    packageDescription: "Popular 4-Session Sachet Pack",
    price: 1399,
    mrp: 2199,
    savings: 800,
    badge: "POPULAR",
    freeBonus: "4 Sachets",
    image: "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
    popular: false,
  },
  {
    id: "pack-3-strips",
    name: "3 Sachet Strips Pack",
    packageDescription: "Standard 3-Session Sachet Pack",
    price: 1099,
    mrp: 1699,
    savings: 600,
    badge: "STANDARD",
    freeBonus: "3 Sachets",
    image: "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
    popular: false,
  },
  {
    id: "pack-2-strips",
    name: "2 Sachet Strips Trial Pack",
    packageDescription: "First-Time Discovery Trial Pack (2 Sachets)",
    price: 899,
    mrp: 1299,
    savings: 400,
    badge: "TRIAL PACK",
    freeBonus: "2 Sachets",
    image: "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
    popular: false,
  },
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "turkiye-jam",
    slug: "turkiye-jam-epimedium-macun",
    name: "Themra Epimedium Herbal Macun (Original Turkish Paste)",
    subtitle: "100% Authentic Botanical Vitality Formula for Men & Women",
    category: "Vitality & Wellness",
    subcategory: "Herbal Vitality",
    tagline: "Natural Vitality, Peak Stamina & Intimate Performance for Couples",
    description:
      "Directly imported from Turkey, Themra Epimedium Herbal Macun is a globally acclaimed herbal honey paste crafted from centuries-old traditional recipes. Formulated with Epimedium (Horny Goat Weed), Pure Flower Honey, Royal Jelly, Red Ginseng, and botanical extracts, it delivers sustained physical stamina, heightened endurance, and sensual vitality for both men and women.",
    price: 2899,
    mrp: 4999,
    offer_price: 2899,
    stock_count: 150,
    volume: "240g Jar & Sachet Strips Available",
    poster_image: "/products/turkiye-jam/turkiye-jam-jar-and-box.jpg",
    images: [
      "/products/turkiye-jam/turkiye-jam-jar-and-box.jpg",
      "/products/turkiye-jam/turkiye-jam-box-strips.jpg",
      "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
      "/products/turkiye-jam/turkiye-jam-5-strips.jpg",
    ],
    color: "240g Glass Jar + 2 Free Strips",
    material: "100% Natural Herbal Honey Paste (Epimedium, Royal Jelly, Ginseng)",
    in_stock: 1,
    rating: 4.9,
    review_count: 1480,
    sold_count: "4,200+ delivered across India",
    badge: "Sale",
    has_colors: true,
    colors: [
      {
        name: "240g Glass Jar + 2 Free Strips",
        image: "/products/turkiye-jam/turkiye-jam-jar-and-box.jpg",
        colorHex: "#780016",
        images: [
          "/products/turkiye-jam/turkiye-jam-jar-and-box.jpg",
          "/products/turkiye-jam/turkiye-jam-box-strips.jpg",
          "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
          "/products/turkiye-jam/turkiye-jam-5-strips.jpg",
        ],
      },
      {
        name: "14 Sachet Strips Box (12 + 2 Pack)",
        image: "/products/turkiye-jam/turkiye-jam-box-strips.jpg",
        colorHex: "#8B0000",
        images: [
          "/products/turkiye-jam/turkiye-jam-box-strips.jpg",
          "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
          "/products/turkiye-jam/turkiye-jam-5-strips.jpg",
          "/products/turkiye-jam/turkiye-jam-jar-and-box.jpg",
        ],
      },
      {
        name: "6 Sachet Strips Pack",
        image: "/products/turkiye-jam/turkiye-jam-5-strips.jpg",
        colorHex: "#9E1B32",
        images: [
          "/products/turkiye-jam/turkiye-jam-5-strips.jpg",
          "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
          "/products/turkiye-jam/turkiye-jam-box-strips.jpg",
        ],
      },
      {
        name: "4 Sachet Strips Pack",
        image: "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
        colorHex: "#B31B1B",
        images: [
          "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
          "/products/turkiye-jam/turkiye-jam-5-strips.jpg",
          "/products/turkiye-jam/turkiye-jam-box-strips.jpg",
        ],
      },
      {
        name: "3 Sachet Strips Pack",
        image: "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
        colorHex: "#C41E3A",
        images: [
          "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
          "/products/turkiye-jam/turkiye-jam-5-strips.jpg",
        ],
      },
      {
        name: "2 Sachet Strips Trial Pack",
        image: "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
        colorHex: "#800020",
        images: [
          "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
          "/products/turkiye-jam/turkiye-jam-jar-and-box.jpg",
        ],
      },
    ],
    features: [
      "100% Authentic Turkish Import (Themra Bitkisel Ürünler Turkey)",
      "For Men: Extended stamina, heightened endurance and peak physical control",
      "For Men: Rapid post-session recovery enabling multiple intimate rounds",
      "For Women: Stimulates natural sensual libido, arousal and climax intensity",
      "Express 1–2 Day Priority Delivery across Kerala & India",
      "100% Discreet & Opaque Plain Box Packaging for Complete Privacy",
      "Money-Back Guarantee: Return unused sachet strips for a full pro-rata refund",
    ],
    specifications: {
      "Product Name": "Themra Epimedium Herbal Macun (Turkish Paste)",
      "Country of Origin": "Made in Turkey 🇹🇷 (Themra Bitkisel)",
      "Key Ingredients": "Epimedium (Horny Goat Weed), Pure Flower Honey, Royal Jelly, Red Ginseng, Ginger, Maca Root, Cinnamon",
      "Form": "Herbal Honey Paste (Jar & Single-Use Sachets)",
      "Target Audience": "Adult Men & Women (18+)",
      "Packaging": "100% Discreet, Tamper-Proof Plain Box",
      "Prepaid Shipping": "1–2 Days Superfast Express Delivery",
      "COD Shipping": "3–7 Days Doorstep Delivery",
    },
    whats_in_box: [
      "1 × Authentic Themra Epimedium Turkish Macun (Selected Package)",
      "Complimentary Bonus Sachets (Included with 240g Jar & 14-Strip Box)",
      "Comprehensive Usage & Safety Guide",
      "Discreet, Unmarked Outer Shipping Box",
    ],
    shipping_info: [
      "Fast Dispatch: Orders dispatched within 24 hours from our regional fulfillment hub.",
      "Prepaid Online: ₹60 Extra with 1–2 Days Superfast Priority Delivery.",
      "Cash on Delivery: ₹190 Extra with 3–7 Days Verified Doorstep Delivery.",
      "100% Discreet Packaging: Plain, neutral box with zero product mentions on the external shipping label.",
    ],
    return_info: [
      "Unused Strip Guarantee: If you use sachet strips and do not experience results, return the remaining unopened strips.",
      "Full Pro-Rata Refund: You will receive a direct refund for all returned strips to your UPI or bank account.",
      "Dedicated WhatsApp Support: Friendly customer care available 7 days a week.",
    ],
    how_to_use: {
      enabled: true,
      section_bg: "white",
      card_radius: "rounded-2xl",
      card_border: "subtle",
      card_shadow: "sm",
      steps: [
        {
          id: "step-1",
          media_type: "image",
          media_url: "/products/turkiye-jam/turkiye-jam-jar-and-box.jpg",
          media_fit: "contain",
          title: "1. Eat a Light Meal 1 Hour Before",
          description: "Never consume on an empty stomach. Have a normal light meal approximately one hour prior to intimate activity.",
        },
        {
          id: "step-2",
          media_type: "image",
          media_url: "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
          media_fit: "contain",
          title: "2. Take 1 Small Spoon or 1 Sachet Strip",
          description: "Wait 10 minutes after your meal, then take exactly one small teaspoon (if from jar) or one complete sachet strip.",
        },
        {
          id: "step-3",
          media_type: "image",
          media_url: "/products/turkiye-jam/turkiye-jam-jar-and-box.jpg",
          media_fit: "contain",
          title: "3. Stir Thoroughly (If Using the Jar)",
          description: "Botanical extracts and honey naturally settle. Stir the jar well with a clean spoon before scooping your dose.",
        },
        {
          id: "step-4",
          media_type: "image",
          media_url: "/products/turkiye-jam/turkiye-jam-5-strips.jpg",
          media_fit: "contain",
          title: "4. Drink a Glass of Warm Milk After 15 Mins",
          description: "Drinking a glass of warm milk 15 minutes after taking the paste accelerates herbal absorption and doubles effectiveness.",
        },
        {
          id: "step-5",
          media_type: "image",
          media_url: "/products/turkiye-jam/turkiye-jam-box-strips.jpg",
          media_fit: "contain",
          title: "5. Avoid Cold Carbonated Beverages",
          description: "Refrain from drinking chilled soft drinks or cold sodas immediately before or after consuming the paste.",
        },
      ],
    },
    reviews_data: {
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
        { image: "/products/turkiye-jam/turkiye-jam-jar-and-box.jpg" },
        { image: "/products/turkiye-jam/turkiye-jam-box-strips.jpg" },
        { image: "/products/turkiye-jam/turkiye-jam-3-strips.jpg" },
        { image: "/products/turkiye-jam/turkiye-jam-5-strips.jpg" },
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
          images: ["/products/turkiye-jam/turkiye-jam-3-strips.jpg"],
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
          images: ["/products/turkiye-jam/turkiye-jam-jar-and-box.jpg"],
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
    },
  },
];

export const PRODUCT_CATEGORIES = [
  "All Products",
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
    mainCategory: "Herbal Vitality",
    subcategories: ["Turkish Macun", "Epimedium Herbal Paste", "Sachet Strips", "240g Glass Jar"],
  },
];

export const CATEGORY_SUBCATEGORIES_MAP: Record<string, string[]> = {
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
