import { Product } from "@/types/product";

// Fresh catalog starting point for store owner handover (original catalog backed up in zupeProducts.backup.ts)
export const DEFAULT_PRODUCTS: Product[] = [];

export const PRODUCT_CATEGORIES = [
  "All",
  "Tech & Gadgets",
  "Home Essentials",
  "Personal Care",
  "Auto Essentials",
  "Fitness & Wellness",
  "Kids & Fun",
  "Deals & Offers",
] as const;

export interface SubcategoryGroup {
  mainCategory: string;
  aliases: string[];
  subcategories: string[];
}

export const CATEGORY_SUBCATEGORIES_CONFIG: SubcategoryGroup[] = [
  {
    mainCategory: "Tech & Gadgets",
    aliases: ["tech & gadgets", "gadgets", "electronics", "tech"],
    subcategories: [
      "Mobile & Charging",
      "Smart Tech & Audio",
      "Gaming",
      "Computer & Accessories",
    ],
  },
  {
    mainCategory: "Home Essentials",
    aliases: [
      "home essentials",
      "home & living",
      "home living",
      "kitchen essentials",
      "kitchen & dining",
      "decor",
      "essentials",
      "modern living",
    ],
    subcategories: [
      "Kitchen & Dining",
      "Cleaning & Organization",
      "Home Comfort & Utility",
    ],
  },
  {
    mainCategory: "Personal Care",
    aliases: ["personal care", "grooming", "beauty"],
    subcategories: [
      "Grooming & Care",
      "Massage & Wellness",
      "Women's Care",
    ],
  },
  {
    mainCategory: "Auto Essentials",
    aliases: ["auto essentials", "car accessories", "car care", "automotive"],
    subcategories: [
      "Car Care",
      "Car Accessories",
    ],
  },
  {
    mainCategory: "Fitness & Wellness",
    aliases: ["fitness & wellness", "health & wellness", "wellness", "fitness", "health"],
    subcategories: [
      "Fitness Accessories",
      "Recovery & Wellness",
    ],
  },
  {
    mainCategory: "Kids & Fun",
    aliases: ["kids & fun", "kids", "toys & games", "toys"],
    subcategories: [
      "Toys & Games",
      "Fun & Entertainment",
    ],
  },
  {
    mainCategory: "Deals & Offers",
    aliases: ["deals & offers", "offers", "deals", "sale"],
    subcategories: [
      "Curated sale products only",
    ],
  },
];

export const CATEGORY_SUBCATEGORIES_MAP: Record<string, string[]> = {
  "Tech & Gadgets": ["Mobile & Charging", "Smart Tech & Audio", "Gaming", "Computer & Accessories"],
  "Gadgets": ["Mobile & Charging", "Smart Tech & Audio", "Gaming", "Computer & Accessories"],
  "Home Essentials": ["Kitchen & Dining", "Cleaning & Organization", "Home Comfort & Utility"],
  "Home & Living": ["Kitchen & Dining", "Cleaning & Organization", "Home Comfort & Utility"],
  "Kitchen Essentials": ["Kitchen & Dining", "Cleaning & Organization", "Home Comfort & Utility"],
  "Personal Care": ["Grooming & Care", "Massage & Wellness", "Women's Care"],
  "Auto Essentials": ["Car Care", "Car Accessories"],
  "Car Accessories": ["Car Care", "Car Accessories"],
  "Fitness & Wellness": ["Fitness Accessories", "Recovery & Wellness"],
  "Health & Wellness": ["Fitness Accessories", "Recovery & Wellness"],
  "Kids & Fun": ["Toys & Games", "Fun & Entertainment"],
  "Deals & Offers": ["Curated sale products only"],
  "Offers": ["Curated sale products only"],
};

export function getSubcategoriesForCategory(categoryName: string, dynamicCategories?: any[]): string[] {
  if (!categoryName || categoryName.toLowerCase() === "all" || categoryName.toLowerCase() === "all categories") return [];
  const lower = categoryName.trim().toLowerCase();

  // 1. Check dynamicCategories if provided
  if (Array.isArray(dynamicCategories) && dynamicCategories.length > 0) {
    const dynamicMatch = dynamicCategories.find(
      (c) => (c.name && c.name.toLowerCase() === lower) || (c.slug && c.slug.toLowerCase() === lower)
    );
    if (dynamicMatch && Array.isArray(dynamicMatch.subcategories) && dynamicMatch.subcategories.length > 0) {
      return dynamicMatch.subcategories;
    }
  }

  // 2. Direct map check
  const directKey = Object.keys(CATEGORY_SUBCATEGORIES_MAP).find(
    (k) => k.toLowerCase() === lower
  );
  if (directKey) return CATEGORY_SUBCATEGORIES_MAP[directKey];

  const found = CATEGORY_SUBCATEGORIES_CONFIG.find(
    (g) =>
      g.mainCategory.toLowerCase() === lower ||
      g.aliases.some((alias) => alias.toLowerCase() === lower)
  );
  return found ? found.subcategories : [];
}

export function doesCategoryMatch(productCategory: string, selectedCategory: string, dynamicCategories?: any[]): boolean {
  if (!selectedCategory || selectedCategory.toLowerCase() === "all" || selectedCategory.toLowerCase() === "all categories") return true;
  if (!productCategory) return false;
  const pLower = productCategory.trim().toLowerCase();
  const sLower = selectedCategory.trim().toLowerCase();
  if (pLower === sLower) return true;

  if (Array.isArray(dynamicCategories) && dynamicCategories.length > 0) {
    const dynamicMatch = dynamicCategories.find(
      (c) => (c.name && c.name.toLowerCase() === sLower) || (c.slug && c.slug.toLowerCase() === sLower)
    );
    if (dynamicMatch) {
      if (dynamicMatch.name.toLowerCase() === pLower || (dynamicMatch.slug && dynamicMatch.slug.toLowerCase() === pLower)) return true;
      if (Array.isArray(dynamicMatch.subcategories) && dynamicMatch.subcategories.some((sub: string) => sub.toLowerCase() === pLower)) return true;
    }
  }

  const group = CATEGORY_SUBCATEGORIES_CONFIG.find(
    (g) =>
      g.mainCategory.toLowerCase() === sLower ||
      g.aliases.some((alias) => alias.toLowerCase() === sLower)
  );
  if (group) {
    if (group.mainCategory.toLowerCase() === pLower) return true;
    if (group.aliases.some((alias) => alias.toLowerCase() === pLower)) return true;
    if (group.subcategories.some((sub) => sub.toLowerCase() === pLower)) return true;
  }
  return false;
}

export function doesSubcategoryMatch(product: Product, selectedSubcategory: string): boolean {
  if (!selectedSubcategory || selectedSubcategory.toLowerCase() === "all") return true;
  const sLower = selectedSubcategory.trim().toLowerCase();

  // 1. Direct subcategory field match
  if (product.subcategory && product.subcategory.trim().toLowerCase() === sLower) {
    return true;
  }

  // 2. Category column matches subcategory name directly (e.g., category: "Kitchen & Dining")
  if (product.category && product.category.trim().toLowerCase() === sLower) {
    return true;
  }

  // 3. Direct keyword or phrase match in product text
  const searchCorpus = `${product.name} ${product.tagline || ""} ${product.description || ""}`.toLowerCase();
  if (searchCorpus.includes(sLower)) {
    return true;
  }

  // 4. Fallback heuristic keyword match
  if (sLower === "kitchen & dining" && (searchCorpus.includes("kitchen") || searchCorpus.includes("popcorn") || searchCorpus.includes("oil") || searchCorpus.includes("faucet") || searchCorpus.includes("dining"))) {
    return true;
  }
  if (sLower === "cleaning & organization" && (searchCorpus.includes("cleaning") || searchCorpus.includes("mop") || searchCorpus.includes("washer") || searchCorpus.includes("iron"))) {
    return true;
  }
  if (sLower === "home comfort & utility" && (searchCorpus.includes("lamp") || searchCorpus.includes("light") || searchCorpus.includes("humidifier") || searchCorpus.includes("crystal"))) {
    return true;
  }
  if (sLower === "mobile & charging" && (searchCorpus.includes("powerbank") || searchCorpus.includes("charging") || searchCorpus.includes("phone"))) {
    return true;
  }
  if (sLower === "smart tech & audio" && (searchCorpus.includes("airpods") || searchCorpus.includes("audio") || searchCorpus.includes("watch") || searchCorpus.includes("smart"))) {
    return true;
  }
  if (sLower === "computer & accessories" && (searchCorpus.includes("printer") || searchCorpus.includes("backpack") || searchCorpus.includes("laptop") || searchCorpus.includes("computer"))) {
    return true;
  }
  if (sLower === "women's care" && (searchCorpus.includes("menstrual") || searchCorpus.includes("heating pad") || searchCorpus.includes("women"))) {
    return true;
  }
  if (sLower === "recovery & wellness" && (searchCorpus.includes("nebulizer") || searchCorpus.includes("recovery") || searchCorpus.includes("therapy"))) {
    return true;
  }
  if (sLower === "car accessories" && (searchCorpus.includes("perfume") || searchCorpus.includes("car") || searchCorpus.includes("auto"))) {
    return true;
  }
  if (sLower === "car care" && (searchCorpus.includes("vacuum") || searchCorpus.includes("cleaner") || searchCorpus.includes("wash"))) {
    return true;
  }
  if (sLower === "curated sale products only" && (product.badge?.toLowerCase() === "sale" || (product.mrp && product.price && product.mrp > product.price))) {
    return true;
  }

  return false;
}
