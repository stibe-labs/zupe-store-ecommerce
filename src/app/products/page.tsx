"use client";

import React, { useState, useMemo, useEffect, Suspense, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  Star,
  Search,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  X,
  Layers,
  Dumbbell,
  Shirt,
  Apple,
  Cookie,
  Check,
  RotateCcw,
  Award,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { VittalSkeletonGrid, VittalVerifiedBadge } from "@/components/VittalBrandLoader";
import { CardAddToCartControl } from "@/components/CardAddToCartControl";
import {
  DEFAULT_PRODUCTS,
  doesCategoryMatch,
  doesSubcategoryMatch,
  STORE_CATEGORIES_DATA,
  StoreCategory,
  StoreSubcategory,
  getSubcategoryCutoutImage,
} from "@/data/zupeProducts";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { getClientProducts } from "@/lib/productsClientCache";
import { useWishlist } from "@/context/WishlistContext";

// ---------------------------------------------------------------------------
// 5 Core Departments + All Collections
// ---------------------------------------------------------------------------
const EXPLORE_CATEGORIES = [
  { id: "All", name: "All Collections", icon: Layers, query: "All" },
  { id: "Gym Supplementaries", name: "Gym Supplements", icon: Dumbbell, query: "Gym Supplementaries" },
  { id: "Outfits", name: "Outfits", icon: Sparkles, query: "Outfits" },
  { id: "Apparels", name: "Apparels", icon: Shirt, query: "Apparels" },
  { id: "Dates & Nuts", name: "Dates & Nuts", icon: Apple, query: "Dates & Nuts" },
  { id: "Candy & Chocolates", name: "Candy & Chocolates", icon: Cookie, query: "Candy & Chocolates" },
];

const SORT_OPTIONS: {
  value: "featured" | "price-asc" | "price-desc" | "rating";
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "featured",
    label: "Featured & Curated",
    icon: <Sparkles className="w-3.5 h-3.5 text-[#0B5D44]" />,
  },
  {
    value: "price-asc",
    label: "Price: Low to High",
    icon: <ArrowUp className="w-3.5 h-3.5 text-neutral-600" />,
  },
  {
    value: "price-desc",
    label: "Price: High to Low",
    icon: <ArrowDown className="w-3.5 h-3.5 text-neutral-600" />,
  },
  {
    value: "rating",
    label: "Highest Customer Rating",
    icon: <Star className="w-3.5 h-3.5 fill-[#E5C07B] text-[#E5C07B]" />,
  },
];

// ---------------------------------------------------------------------------
// Dynamic Filter Facets Schema (Inspired by SportsJam & Modern E-Commerce)
// ---------------------------------------------------------------------------
interface FacetOption {
  value: string;
  label: string;
}

interface FacetGroup {
  id: string;
  name: string;
  options: FacetOption[];
}

const CATEGORY_FACETS: Record<string, FacetGroup[]> = {
  Outfits: [
    {
      id: "gender",
      name: "Gender / Ideal For",
      options: [
        { value: "Men", label: "Men" },
        { value: "Women", label: "Women" },
        { value: "Unisex", label: "Unisex" },
      ],
    },
    {
      id: "productType",
      name: "Product Type",
      options: [
        { value: "Oversized T-Shirts", label: "Oversized T-Shirts" },
        { value: "Performance Tees", label: "Performance Tees" },
        { value: "Gym Matching Sets", label: "Gym Matching Sets" },
        { value: "Athleisure Sets", label: "Athleisure Sets" },
        { value: "Track Jackets", label: "Track Jackets & Hoodies" },
        { value: "Gym Shorts", label: "Gym Shorts" },
        { value: "Jogger Pants", label: "Joggers & Track Pants" },
        { value: "Compression Wear", label: "Compression Tops" },
      ],
    },
    {
      id: "size",
      name: "Size",
      options: [
        { value: "S", label: "S" },
        { value: "M", label: "M" },
        { value: "L", label: "L" },
        { value: "XL", label: "XL" },
        { value: "XXL", label: "XXL" },
      ],
    },
    {
      id: "material",
      name: "Material / Fabric",
      options: [
        { value: "100% Combed Cotton", label: "100% Combed Cotton (240 GSM)" },
        { value: "Nylon-Spandex", label: "Nylon-Spandex Performance" },
        { value: "Breathable Dri-FIT", label: "Breathable Dri-FIT / AEROREADY" },
        { value: "French Terry Fleece", label: "French Terry Fleece" },
      ],
    },
    {
      id: "color",
      name: "Color",
      options: [
        { value: "Pitch Black", label: "Pitch Black" },
        { value: "Pure White", label: "Pure White" },
        { value: "Charcoal Heather", label: "Charcoal Heather / Slate" },
        { value: "Crimson Red", label: "Crimson Red" },
        { value: "Midnight Navy", label: "Midnight Navy" },
      ],
    },
  ],
  Apparels: [
    {
      id: "productType",
      name: "Category & Style",
      options: [
        { value: "Footwear & Sneakers", label: "Footwear & Sneakers" },
        { value: "Fragrance & Perfume", label: "Fragrance & Perfume" },
        { value: "Cosmetics & Beauty", label: "Cosmetics & Beauty" },
        { value: "Performance Tees", label: "Performance Athletic Tees" },
        { value: "Oversized T-Shirts", label: "Oversized Streetwear Tees" },
        { value: "Gym Shorts", label: "Gym & Athletic Shorts" },
        { value: "Jogger Pants", label: "Tapered Fleece Joggers" },
        { value: "Track Jackets", label: "Track Jackets & Compression" },
      ],
    },
    {
      id: "gender",
      name: "Gender / Ideal For",
      options: [
        { value: "Men", label: "Men" },
        { value: "Women", label: "Women" },
        { value: "Unisex", label: "Unisex" },
      ],
    },
    {
      id: "brand",
      name: "Brand Collection",
      options: [
        { value: "Vittal Lifestyle", label: "Vittal Lifestyle" },
        { value: "Nike", label: "Nike" },
        { value: "Adidas", label: "Adidas" },
        { value: "Elie Saab", label: "Elie Saab" },
        { value: "Vittal Luxury", label: "Vittal Luxury & Noir" },
      ],
    },
    {
      id: "size",
      name: "Size / Dimensions",
      options: [
        { value: "S", label: "S" },
        { value: "M", label: "M" },
        { value: "L", label: "L" },
        { value: "XL", label: "XL" },
        { value: "UK 7", label: "UK 7" },
        { value: "UK 8", label: "UK 8" },
        { value: "UK 9", label: "UK 9" },
        { value: "UK 10", label: "UK 10" },
        { value: "100ml", label: "90ml - 100ml Perfume" },
      ],
    },
  ],
  "Gym Supplementaries": [
    {
      id: "supplementType",
      name: "Supplement Type",
      options: [
        { value: "Whey Protein Isolate", label: "Whey Protein & Isolate" },
        { value: "Creatine Monohydrate", label: "Creatine Monohydrate" },
        { value: "Omega-3", label: "Omega-3 Fish Oil & Wellness" },
      ],
    },
    {
      id: "brand",
      name: "Brand",
      options: [
        { value: "Optimum Nutrition", label: "Optimum Nutrition (ON)" },
        { value: "MuscleTech", label: "MuscleTech" },
        { value: "GNC", label: "GNC Pro Performance" },
        { value: "Sports Research", label: "Sports Research" },
        { value: "Vittal Lifestyle", label: "Vittal Lifestyle" },
      ],
    },
    {
      id: "flavor",
      name: "Flavor",
      options: [
        { value: "Chocolate", label: "Double Rich / Milk Chocolate" },
        { value: "Unflavored", label: "100% Pure Unflavored" },
      ],
    },
    {
      id: "weight",
      name: "Pack Size / Weight",
      options: [
        { value: "250g", label: "250g - 300g (Creatine)" },
        { value: "1kg", label: "1kg / 2.2 lbs (Whey)" },
        { value: "2kg", label: "2.27kg / 5 lbs Mega Tub" },
        { value: "4kg", label: "4kg / 8.8 lbs Giant Bucket" },
        { value: "180 Softgels", label: "180 Softgels (Omega-3)" },
      ],
    },
    {
      id: "goal",
      name: "Dietary & Goals",
      options: [
        { value: "Zero Added Sugar", label: "Zero Added Sugar" },
        { value: "100% Pure Isolate", label: "100% Pure Isolate" },
        { value: "Lean Muscle Growth", label: "Lean Muscle & Power" },
        { value: "Vegetarian", label: "100% Vegetarian" },
      ],
    },
  ],
  "Dates & Nuts": [
    {
      id: "variety",
      name: "Variety & Origin",
      options: [
        { value: "Jumbo Medjool Dates", label: "Royal Saudi Medjool Dates" },
        { value: "Jumbo Cashews", label: "W180 King Jumbo Cashews" },
        { value: "California Almonds", label: "California Roasted Almonds" },
        { value: "California Pistachios", label: "California Roasted Pistachios" },
        { value: "Organic Chia Seeds", label: "Organic Raw Chia Seeds" },
      ],
    },
    {
      id: "packSize",
      name: "Pack Size / Format",
      options: [
        { value: "Glass Jar", label: "Luxury Gold Lid Glass Jar" },
        { value: "Fresh Pouch", label: "Gold-Trimmed Fresh Pouch" },
        { value: "400g", label: "350g - 400g" },
        { value: "500g", label: "450g - 500g" },
      ],
    },
    {
      id: "roastStyle",
      name: "Roast & Style",
      options: [
        { value: "Raw Sun-Ripened", label: "Raw Sun-Ripened Whole" },
        { value: "Lightly Salted & Roasted", label: "Lightly Salted & Air-Roasted" },
      ],
    },
    {
      id: "dietary",
      name: "Dietary Benefits",
      options: [
        { value: "100% Natural Superfood", label: "100% Natural Superfood" },
        { value: "Zero Added Sugar", label: "Zero Added Sugar" },
        { value: "Gluten Free", label: "Gluten Free & Vegan" },
      ],
    },
  ],
  "Candy & Chocolates": [
    {
      id: "chocolateType",
      name: "Confectionery Type",
      options: [
        { value: "Ferrero Rocher", label: "Ferrero Rocher Hazelnut Box" },
        { value: "Cadbury Dairy Milk", label: "Cadbury Silk Roasted Almond" },
        { value: "Bounty", label: "Bounty Tender Coconut Bars" },
        { value: "Lindt Lindor", label: "Lindt Lindor Swiss Truffles" },
        { value: "Signature Black Candy Box", label: "Signature Black Candy Box (70% Dark)" },
      ],
    },
    {
      id: "dietary",
      name: "Dietary & Features",
      options: [
        { value: "Vegetarian", label: "100% Vegetarian" },
        { value: "Zero Palm Oil", label: "Zero Palm Oil / Zero Trans Fat" },
        { value: "Single-Origin", label: "Single-Origin Dark Cocoa" },
        { value: "Whole Nuts", label: "Whole Roasted Hazelnuts / Almonds" },
      ],
    },
    {
      id: "packaging",
      name: "Packaging Format",
      options: [
        { value: "Luxury Gift Box", label: "Luxury Presentation Gift Box" },
        { value: "Multipack", label: "Convenient Multipack Bundle" },
      ],
    },
  ],
  All: [
    {
      id: "quickFeature",
      name: "Popular Filters",
      options: [
        { value: "Zero Added Sugar", label: "Zero Added Sugar" },
        { value: "High Protein", label: "High Protein" },
        { value: "100% Pure & Natural", label: "100% Pure & Natural" },
        { value: "Oversized Fit", label: "Oversized Fit" },
        { value: "Single-Origin Cocoa", label: "Single-Origin Dark Cocoa" },
      ],
    },
  ],
};

function getCategoryFacets(category: string): FacetGroup[] {
  if (!category || category === "All") return CATEGORY_FACETS["All"] || [];
  if (doesCategoryMatch("Gym Supplementaries", category)) return CATEGORY_FACETS["Gym Supplementaries"] || [];
  if (doesCategoryMatch("Outfits", category)) return CATEGORY_FACETS["Outfits"] || [];
  if (doesCategoryMatch("Apparels", category)) return CATEGORY_FACETS["Apparels"] || [];
  if (doesCategoryMatch("Dates & Nuts", category)) return CATEGORY_FACETS["Dates & Nuts"] || [];
  if (doesCategoryMatch("Candy & Chocolates", category)) return CATEGORY_FACETS["Candy & Chocolates"] || [];
  return CATEGORY_FACETS["All"] || [];
}

function productMatchesFacetValue(product: Product, facetId: string, value: string): boolean {
  const pName = (product.name || "").toLowerCase();
  const pSubcat = (product.subcategory || "").toLowerCase();
  const pCat = (product.category || "").toLowerCase();
  const pDesc = (product.description || "").toLowerCase();
  const pTagline = (product.tagline || "").toLowerCase();
  const pFeatures = Array.isArray(product.features) ? product.features.join(" ").toLowerCase() : "";
  const pVolume = (product.volume || "").toLowerCase();
  const pColor = (product.color || "").toLowerCase();
  const pMaterial = (product.material || "").toLowerCase();
  const specs = product.specifications || {};
  const specsStr = Object.values(specs).join(" ").toLowerCase();
  const allText = `${pName} ${pSubcat} ${pCat} ${pDesc} ${pTagline} ${pFeatures} ${pVolume} ${pColor} ${pMaterial} ${specsStr}`;

  switch (facetId) {
    case "gender":
      if (value === "Men") {
        return allText.includes("men") || pCat.includes("apparel") || pCat.includes("outfit") || pName.includes("t-shirt");
      }
      if (value === "Women") {
        return allText.includes("women") || allText.includes("seamless") || allText.includes("athleisure");
      }
      if (value === "Unisex") {
        return allText.includes("unisex") || pCat.includes("apparel") || pCat.includes("outfit");
      }
      return true;

    case "productType":
      if (value === "Footwear & Sneakers") {
        return allText.includes("sneaker") || allText.includes("running") || allText.includes("footwear") || pSubcat.includes("footwear");
      }
      if (value === "Fragrance & Perfume") {
        return allText.includes("parfum") || allText.includes("fragrance") || allText.includes("eau de") || pSubcat.includes("fragrance");
      }
      if (value === "Cosmetics & Beauty") {
        return allText.includes("makeup") || allText.includes("lipstick") || allText.includes("cosmetics") || pSubcat.includes("cosmetics");
      }
      if (value === "Oversized T-Shirts") {
        return pName.includes("oversized") || pSubcat.includes("t-shirt") || specsStr.includes("oversized");
      }
      if (value === "Compression Wear") {
        return allText.includes("compression") || pSubcat.includes("compression");
      }
      if (value === "Gym Matching Sets" || value === "Athleisure Sets") {
        return allText.includes("set") || allText.includes("seamless") || pSubcat.includes("sets");
      }
      if (value === "Track Jackets") {
        return allText.includes("jacket") || allText.includes("track") || pSubcat.includes("jackets");
      }
      if (value === "Gym Shorts") {
        return allText.includes("shorts") || pSubcat.includes("shorts");
      }
      if (value === "Jogger Pants") {
        return allText.includes("jogger") || allText.includes("pants") || pSubcat.includes("joggers");
      }
      if (value === "Performance Tees") {
        return pName.includes("t-shirt") || pName.includes("tee") || pSubcat.includes("t-shirt");
      }
      return allText.includes(value.toLowerCase());

    case "brand":
      if (value === "Optimum Nutrition") return allText.includes("optimum nutrition") || allText.includes("on ");
      if (value === "MuscleTech") return allText.includes("muscletech") || allText.includes("nitro-tech");
      if (value === "GNC") return allText.includes("gnc");
      if (value === "Sports Research") return allText.includes("sports research");
      if (value === "Nike") return allText.includes("nike");
      if (value === "Adidas") return allText.includes("adidas");
      if (value === "Elie Saab") return allText.includes("elie saab");
      if (value === "Vittal Luxury") return allText.includes("vittal luxury") || allText.includes("vittal noir");
      if (value === "Vittal Lifestyle") return allText.includes("vittal lifestyle");
      return allText.includes(value.toLowerCase());

    case "size":
      return pVolume.includes(value.toLowerCase()) || pCat.includes("apparel") || pCat.includes("outfit");

    case "material":
      if (value === "100% Combed Cotton") return allText.includes("cotton");
      if (value === "Nylon-Spandex") return allText.includes("spandex") || allText.includes("nylon");
      if (value === "Breathable Dri-FIT") {
        return allText.includes("breathable") || allText.includes("dry") || allText.includes("wicking");
      }
      return allText.includes(value.toLowerCase());

    case "color":
      if (value === "Pitch Black" || value === "Onyx Black") {
        return pColor.includes("black") || allText.includes("black");
      }
      if (value === "Pure White") {
        return pColor.includes("white") || allText.includes("white");
      }
      return pColor.includes(value.toLowerCase());

    case "supplementType":
      if (value === "Whey Protein Isolate") return allText.includes("isolate") || allText.includes("whey");
      if (value === "Creatine Monohydrate") return allText.includes("creatine");
      if (value === "Omega-3") return allText.includes("omega-3") || allText.includes("fish oil");
      if (value === "Mass Gainer") return allText.includes("mass gainer") || allText.includes("gainer");
      return allText.includes(value.toLowerCase());

    case "flavor":
      if (value === "Chocolate") return allText.includes("chocolate") || allText.includes("fudge");
      if (value === "Swiss Chocolate") return allText.includes("swiss chocolate");
      if (value === "Unflavored") return allText.includes("unflavored");
      return allText.includes(value.toLowerCase());

    case "weight":
    case "packSize":
      if (value === "Glass Jar") return allText.includes("glass jar") || allText.includes("jar");
      if (value === "Fresh Pouch") return allText.includes("pouch") || allText.includes("bag");
      if (value === "250g") return allText.includes("250g") || allText.includes("300g") || allText.includes("250 g");
      if (value === "400g") return allText.includes("350g") || allText.includes("400g");
      if (value === "500g") return allText.includes("450g") || allText.includes("500g") || allText.includes("500 g");
      if (value === "1kg") return allText.includes("1kg") || allText.includes("1 kg") || allText.includes("2.2 lbs");
      if (value === "2kg") return allText.includes("2.27kg") || allText.includes("5 lbs");
      if (value === "4kg") return allText.includes("4kg") || allText.includes("8.8 lbs");
      if (value === "180 Softgels") return allText.includes("softgels") || allText.includes("180");
      return allText.includes(value.toLowerCase());

    case "goal":
    case "dietary":
      if (value === "Zero Added Sugar") {
        return allText.includes("zero added sugar") || allText.includes("zero sugar") || allText.includes("no added sugar");
      }
      if (value === "100% Pure Isolate") return allText.includes("isolate");
      if (value === "Lean Muscle Growth") return allText.includes("muscle") || allText.includes("recovery");
      if (value === "Vegetarian") return allText.includes("vegetarian") || allText.includes("vegan");
      if (value === "100% Natural Superfood") return allText.includes("superfood") || allText.includes("natural");
      if (value === "Gluten Free") return true;
      if (value === "Zero Palm Oil") return allText.includes("palm oil") || allText.includes("single-origin");
      if (value === "Zero Trans Fat") return allText.includes("trans fat");
      if (value === "Single-Origin") return allText.includes("single-origin");
      if (value === "Whole Nuts") return allText.includes("almond") || allText.includes("hazelnut") || allText.includes("nut");
      return allText.includes(value.toLowerCase());

    case "variety":
      if (value === "Jumbo Medjool Dates") return allText.includes("medjool") || allText.includes("dates");
      if (value === "Jumbo Cashews") return allText.includes("cashew");
      if (value === "California Almonds") return allText.includes("almond");
      if (value === "California Pistachios") return allText.includes("pistachio");
      if (value === "Organic Chia Seeds") return allText.includes("chia");
      return allText.includes(value.toLowerCase());

    case "roastStyle":
      if (value === "Raw Sun-Ripened") return allText.includes("sun-ripened") || allText.includes("natural") || allText.includes("raw");
      if (value === "Lightly Salted & Roasted") return allText.includes("roasted") || allText.includes("salt");
      return allText.includes(value.toLowerCase());

    case "chocolateType":
      if (value === "Ferrero Rocher") return allText.includes("ferrero");
      if (value === "Cadbury Dairy Milk") return allText.includes("cadbury");
      if (value === "Bounty") return allText.includes("bounty");
      if (value === "Lindt Lindor") return allText.includes("lindt");
      if (value === "Signature Black Candy Box") return allText.includes("candy box") || allText.includes("black candy");
      return allText.includes(value.toLowerCase());

    case "cocoaContent":
      if (value === "70% Single-Origin") return allText.includes("70%");
      if (value === "Gourmet Cocoa") return allText.includes("cocoa");
      return allText.includes(value.toLowerCase());

    case "packaging":
      if (value === "16-Piece Luxury Box") return allText.includes("16-piece") || allText.includes("16");
      if (value === "300g Gourmet Jar") return allText.includes("300g");
      return allText.includes(value.toLowerCase());

    case "quickFeature":
      if (value === "Zero Added Sugar") return allText.includes("zero sugar") || allText.includes("zero added sugar");
      if (value === "High Protein") return allText.includes("protein");
      if (value === "100% Pure & Natural") return allText.includes("pure") || allText.includes("natural");
      if (value === "Oversized Fit") return allText.includes("oversized");
      if (value === "Single-Origin Cocoa") return allText.includes("single-origin") || allText.includes("70%");
      return allText.includes(value.toLowerCase());

    default:
      return allText.includes(value.toLowerCase());
  }
}

function CatalogProductImage({ product }: { product: Product }) {
  const images = useMemo(() => {
    if (product.images && product.images.length > 1) {
      return product.images;
    }
    return [product.poster_image || "/vittal/product-whey-protein-jar.png"];
  }, [product.images, product.poster_image]);

  const [activeIdx, setActiveIdx] = useState(0);
  const hasMultiple = images.length > 1;

  return (
    <div
      className="relative aspect-square w-full rounded-2xl bg-gradient-to-b from-[#F3FAF7] via-[#F3FAF7] to-[#FFFFFF] p-3 flex items-center justify-center overflow-hidden mb-2.5 group/cardimg"
      onMouseEnter={() => {
        if (hasMultiple) setActiveIdx(1);
      }}
      onMouseLeave={() => {
        if (hasMultiple) setActiveIdx(0);
      }}
    >
      <Link
        href={`/products/${product.id || product.slug}`}
        className="block w-full h-full relative"
      >
        <Image
          src={images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-contain p-2 transition-all duration-300 ${
            hasMultiple && activeIdx === 1 ? "opacity-0 scale-95" : "opacity-100 group-hover:scale-105"
          }`}
        />
        {hasMultiple && (
          <Image
            src={images[1]}
            alt={`${product.name} alternate view`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-contain p-2 transition-all duration-300 absolute inset-0 ${
              activeIdx === 1 ? "opacity-100 scale-105" : "opacity-0 scale-95 pointer-events-none"
            }`}
          />
        )}
      </Link>

      {/* Alternate view / swipe indicator pills when product has multiple images */}
      {hasMultiple && (
        <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-auto">
          {images.slice(0, 3).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveIdx(idx);
              }}
              aria-label={`View photo ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeIdx === idx
                  ? "w-4 bg-[#0B5D44] shadow-xs"
                  : "w-1.5 bg-neutral-300/80 hover:bg-neutral-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCat = searchParams.get("category") || "All";
  const initialSubcat = searchParams.get("subcategory") || "All";
  const initialSearch = searchParams.get("search") || searchParams.get("q") || "";

  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(initialSubcat);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [selectedFacets, setSelectedFacets] = useState<Record<string, string[]>>({});
  const [openFacetAccordions, setOpenFacetAccordions] = useState<Record<string, boolean>>({});
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const categorySwiperRef = useRef<HTMLDivElement>(null);
  const { addItem, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Dynamic store categories synced with Admin & D1
  const [storeCategories, setStoreCategories] = useState<StoreCategory[]>(STORE_CATEGORIES_DATA);

  // Helper to map dynamic categories from API to products page format
  const mapApiCategories = (apiCats: any[]): StoreCategory[] => {
    if (!Array.isArray(apiCats) || apiCats.length === 0) return STORE_CATEGORIES_DATA;
    const valid = apiCats.filter(
      (c) => c.active !== false && c.id !== "all" && (c.name || "").toLowerCase() !== "all categories"
    );
    if (valid.length === 0) return STORE_CATEGORIES_DATA;

    return valid.map((c) => {
      const fallback = STORE_CATEGORIES_DATA.find(
        (sc) =>
          sc.id.toLowerCase() === c.id.toLowerCase() ||
          sc.name.toLowerCase() === c.name.toLowerCase() ||
          sc.query.toLowerCase() === (c.slug || c.name).toLowerCase() ||
          ((sc.name.toLowerCase() === "gym supplements" || sc.query.toLowerCase() === "gym supplementaries") &&
            ((c.name || "").toLowerCase() === "gym supplements" || (c.slug || "").toLowerCase() === "gym supplementaries"))
      );

      const subNames: string[] =
        Array.isArray(c.subcategories) && c.subcategories.length > 0
          ? c.subcategories
          : fallback?.subcategories.map((s) => s.name) || [];

      const mappedSubs: StoreSubcategory[] = subNames.map((subName) => {
        const existing = fallback?.subcategories.find(
          (es) =>
            es.name.toLowerCase() === subName.toLowerCase() ||
            es.query.toLowerCase() === subName.toLowerCase()
        );
        const cutoutImg =
          c.subcategoryIcons?.[subName] ||
          existing?.image ||
          getSubcategoryCutoutImage(subName) ||
          "/vittal/cat-icon-gym-supplements-trans.png";

        return {
          id: subName.toLowerCase().replace(/\s+/g, "-"),
          name: subName,
          query: existing?.query || subName,
          image: cutoutImg,
          matchSubcategories: existing?.matchSubcategories || [subName],
        };
      });

      return {
        id: c.slug || c.name,
        name: c.name,
        shortName: fallback?.shortName || c.name,
        query: c.slug || c.name,
        image: c.customIcon || fallback?.image || "/vittal/cat-icon-gym-supplements-trans.png",
        subcategories: mappedSubs,
      };
    });
  };

  // Active main category object when drilled down (null when root / All Categories)
  const activeMainCat = useMemo(() => {
    if (!selectedCategory || selectedCategory === "All" || selectedCategory === "All Categories") {
      return null;
    }
    return (
      storeCategories.find((c) => {
        const s = selectedCategory.toLowerCase().trim();
        const cq = c.query.toLowerCase().trim();
        const cn = c.name.toLowerCase().trim();
        return (
          s === cq ||
          s === cn ||
          ((s === "gym supplements" || s === "gym supplementaries") &&
            (cq === "gym supplements" || cq === "gym supplementaries")) ||
          ((s === "candy & chocolates" || s === "candy and chocolates") &&
            (cq === "candy & chocolates" || cq === "candy and chocolates")) ||
          ((s === "dates & nuts" || s === "dates and nuts") &&
            (cq === "dates & nuts" || cq === "dates and nuts"))
        );
      }) || null
    );
  }, [selectedCategory, storeCategories]);

  // Dynamic explore departments for sidebar & mobile filter
  const exploreCategoriesList = useMemo(() => {
    return [
      { id: "All", name: "All Collections", icon: Layers, query: "All" },
      ...storeCategories.map((sc) => ({
        id: sc.id,
        name: sc.name,
        icon: Layers,
        query: sc.query,
      })),
    ];
  }, [storeCategories]);

  // Fetch updated catalog and store categories on mount
  useEffect(() => {
    async function loadCatalog() {
      try {
        const productsList = await getClientProducts();
        if (Array.isArray(productsList) && productsList.length > 0) {
          setProducts(productsList);
        }
      } catch (err) {
        console.warn("Could not fetch fresh catalog:", err);
      }
    }
    loadCatalog();

    async function loadDynamicCategories() {
      try {
        const res = await fetch("/api/content/categories");
        const data = await res.json();
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          const mapped = mapApiCategories(data.categories);
          if (mapped.length > 0) {
            setStoreCategories(mapped);
          }
        }
      } catch (err) {
        console.warn("Could not fetch dynamic categories for products page:", err);
      }
    }
    loadDynamicCategories();

    const handleUpdate = (e: any) => {
      if (e?.detail?.categories) {
        setStoreCategories(mapApiCategories(e.detail.categories));
      }
    };
    window.addEventListener("vittal_categories_updated", handleUpdate);
    window.addEventListener("zupe_categories_updated", handleUpdate);
    return () => {
      window.removeEventListener("vittal_categories_updated", handleUpdate);
      window.removeEventListener("zupe_categories_updated", handleUpdate);
    };
  }, []);

  // Sync state if URL query params change
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedCategory(cat);
    } else {
      setSelectedCategory("All");
    }
    const subcat = searchParams.get("subcategory");
    if (subcat) {
      setSelectedSubcategory(subcat);
    } else {
      setSelectedSubcategory("All");
    }
    const q = searchParams.get("search") || searchParams.get("q");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll on mobile filter open
  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "auto";
      };
    }
  }, [mobileFilterOpen]);

  const handleCategorySelect = (catQuery: string) => {
    setSelectedCategory(catQuery);
    setSelectedSubcategory("All");
    setSelectedFacets({}); // Reset facets on category change for clean context
    const params = new URLSearchParams(searchParams.toString());
    params.delete("subcategory");
    if (catQuery === "All") {
      params.delete("category");
    } else {
      params.set("category", catQuery);
    }
    router.push(`/products?${params.toString()}`, { scroll: false });
    if (categorySwiperRef.current) {
      categorySwiperRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  const handleSubcategorySelect = (subcatQuery: string) => {
    const nextSub =
      selectedSubcategory.toLowerCase() === subcatQuery.toLowerCase() ? "All" : subcatQuery;
    setSelectedSubcategory(nextSub);
    const params = new URLSearchParams(searchParams.toString());
    if (nextSub === "All") {
      params.delete("subcategory");
    } else {
      params.set("subcategory", nextSub);
    }
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const handleFacetToggle = (facetId: string, value: string) => {
    setSelectedFacets((prev) => {
      const currentList = prev[facetId] || [];
      const isSelected = currentList.includes(value);
      const nextList = isSelected ? currentList.filter((v) => v !== value) : [...currentList, value];
      if (nextList.length === 0) {
        const copy = { ...prev };
        delete copy[facetId];
        return copy;
      }
      return { ...prev, [facetId]: nextList };
    });
  };

  const toggleFacetAccordion = (facetId: string) => {
    setOpenFacetAccordions((prev) => ({
      ...prev,
      [facetId]: prev[facetId] === undefined ? false : !prev[facetId],
    }));
  };

  const handleResetAllFilters = () => {
    setSelectedCategory("All");
    setSelectedSubcategory("All");
    setSearchQuery("");
    setMaxPrice(10000);
    setOnlyInStock(false);
    setSelectedFacets({});
    router.push("/products", { scroll: false });
    if (categorySwiperRef.current) {
      categorySwiperRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  // Base products matching category, search, price & stock
  const baseCategoryProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory && selectedCategory !== "All") {
        const match = doesCategoryMatch(product.category || "", selectedCategory);
        const subMatch = product.subcategory ? doesCategoryMatch(product.subcategory, selectedCategory) : false;
        if (!match && !subMatch) return false;
      }
      if (selectedSubcategory && selectedSubcategory !== "All") {
        const subMatch = doesSubcategoryMatch(product, selectedSubcategory);
        if (!subMatch) return false;
      }
      return true;
    });
  }, [products, selectedCategory, selectedSubcategory]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return baseCategoryProducts
      .filter((product) => {
        // Search filter
        if (query) {
          const name = (product.name || "").toLowerCase();
          const desc = (product.description || "").toLowerCase();
          const cat = (product.category || "").toLowerCase();
          const subcat = (product.subcategory || "").toLowerCase();
          const matches =
            name.includes(query) || desc.includes(query) || cat.includes(query) || subcat.includes(query);
          if (!matches) return false;
        }

        // Price filter
        if (product.price > maxPrice) return false;

        // In-stock filter
        if (onlyInStock) {
          if (product.in_stock === 0 || (product.stock_count !== undefined && product.stock_count <= 0)) {
            return false;
          }
        }

        // Dynamic Facets filter (AND across groups, OR within groups)
        for (const [facetId, selectedValues] of Object.entries(selectedFacets)) {
          if (!selectedValues || selectedValues.length === 0) continue;
          const matchesAnyInGroup = selectedValues.some((val) => productMatchesFacetValue(product, facetId, val));
          if (!matchesAnyInGroup) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return (b.rating || 4.5) - (a.rating || 4.5);
        return 0; // featured default
      });
  }, [baseCategoryProducts, searchQuery, maxPrice, onlyInStock, selectedFacets, sortBy]);

  // Current active dynamic facets for the selected category
  const activeFacetGroups = useMemo(() => {
    return getCategoryFacets(selectedCategory);
  }, [selectedCategory]);

  // Total count of applied filters
  const totalAppliedFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "All") count++;
    if (selectedSubcategory !== "All") count++;
    if (searchQuery.trim().length > 0) count++;
    if (maxPrice < 10000) count++;
    if (onlyInStock) count++;
    Object.values(selectedFacets).forEach((arr) => {
      count += arr.length;
    });
    return count;
  }, [selectedCategory, selectedSubcategory, searchQuery, maxPrice, onlyInStock, selectedFacets]);

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.poster_image,
    });
  };

  const currentSortOption = SORT_OPTIONS.find((o) => o.value === sortBy) || SORT_OPTIONS[0];

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col justify-between selection:bg-[#E6F4EF] selection:text-[#0C1412] font-mograph">
      <Navbar />

      {/* ===================================================================== */}
      {/* 1. EDITORIAL COLLECTION HEADER (Clean Breadcrumb + Dynamic Title)     */}
      {/* ===================================================================== */}
      <div className="pt-4 sm:pt-5 pb-4 sm:pb-5 bg-[#FAFBF9] border-b border-neutral-200/80 relative overflow-hidden">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Structured Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500 mb-2 font-medium">
            <Link href="/" className="hover:text-[#0B5D44] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[#0C1412] font-semibold">
              {activeMainCat ? activeMainCat.name : "Shop All"}
            </span>
            {selectedSubcategory !== "All" && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-[#0B5D44] font-bold">{selectedSubcategory}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <h1 className="font-movault font-extrabold text-2xl sm:text-3xl md:text-[34px] text-[#0C1412] tracking-[-0.025em] leading-tight">
                {activeMainCat ? activeMainCat.name : "Shop The Collection"}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-medium tabular-nums">
                {filteredProducts.length} original {filteredProducts.length === 1 ? "item" : "items"} · Free insured express delivery above ₹1,499
              </p>
            </div>

            {/* Compact In-Catalog Filter Search (shown on mobile & when active query exists, clean pill on desktop) */}
            <div className="w-full md:w-72 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B5D44]" />
              <input
                type="text"
                placeholder="Filter this collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2 rounded-full bg-white text-[#0C1412] placeholder:text-neutral-400 border border-neutral-200/90 focus:border-[#0B5D44] focus:ring-2 focus:ring-[#0B5D44]/15 text-sm sm:text-xs font-medium transition-all outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                  aria-label="Clear filter"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. HORIZONTAL CATEGORY SWIPER ROW (Sticky on Mobile, Static on Desktop) */}
      {/* ===================================================================== */}
      <div className="bg-white/95 backdrop-blur-md border-b border-neutral-200/70 sticky md:static top-16 md:top-auto z-20 md:z-auto shadow-2xs md:shadow-none">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          {/* Breadcrumb row when drilled down into a category */}
          {activeMainCat && (
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-neutral-500 mb-2 overflow-x-auto no-scrollbar whitespace-nowrap">
              <button
                type="button"
                onClick={() => handleCategorySelect("All")}
                className="hover:text-neutral-950 font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3 h-3 text-[#0B5D44]" />
                <span>All Categories</span>
              </button>
              <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
              <button
                type="button"
                onClick={() => handleSubcategorySelect("All")}
                className={`transition-colors cursor-pointer ${
                  selectedSubcategory === "All"
                    ? "text-[#0B5D44] font-bold"
                    : "font-medium hover:text-neutral-950"
                }`}
              >
                {activeMainCat.name}
              </button>
              {selectedSubcategory !== "All" && (
                <>
                  <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
                  <span className="text-[#0B5D44] font-bold">{selectedSubcategory}</span>
                </>
              )}
            </div>
          )}

          <div
            ref={categorySwiperRef}
            className="flex items-start gap-2.5 sm:gap-3 md:gap-4 lg:gap-5 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x py-1"
          >
            {/* If no main category selected: Root view showing [All Categories] + 5 Main Categories */}
            {!activeMainCat ? (
              <>
                {/* 1. All Categories Tile (Selected) */}
                <button
                  type="button"
                  onClick={() => handleCategorySelect("All")}
                  className="group flex flex-col items-center shrink-0 cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none w-[76px] xs:w-[84px] sm:w-[92px] md:w-[102px] lg:w-[112px]"
                >
                  <div className="w-full relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-[#E6F4EF] via-[#F4FAF7] to-white transition-all duration-300 flex items-end justify-center border-2 border-[#0B5D44] ring-2 ring-[#0B5D44]/25 shadow-md scale-[1.02]">
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#0B5D44]/[0.12] via-[#C59B27]/[0.05] to-transparent pointer-events-none" />
                    <div className="relative z-10 w-full h-[88%] sm:h-[90%] flex items-end justify-center px-1.5 xs:px-2">
                      <Image
                        src="/vittal/cat-icon-all-categories-trans.png"
                        alt="All Categories"
                        width={110}
                        height={110}
                        className="w-full h-full object-contain object-bottom pointer-events-none select-none transition-transform duration-300 scale-100 drop-shadow-[0_4px_8px_rgba(11,93,68,0.18)]"
                      />
                    </div>
                  </div>
                  <span className="mt-1.5 text-[10.5px] xs:text-[11px] sm:text-xs text-center line-clamp-1 text-[#0B5D44] font-bold">
                    All Categories
                  </span>
                </button>

                {/* 2..N Main Categories */}
                {storeCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.query)}
                    className="group flex flex-col items-center shrink-0 cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none w-[76px] xs:w-[84px] sm:w-[92px] md:w-[102px] lg:w-[112px]"
                  >
                    <div className="w-full relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-[#E6F4EF] via-[#F4FAF7] to-white transition-all duration-300 flex items-end justify-center border border-[#D4E9E0] group-hover:border-[#0B5D44]/55 shadow-2xs group-hover:shadow-md">
                      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#0B5D44]/[0.09] via-[#C59B27]/[0.03] to-transparent pointer-events-none" />
                      <div className="relative z-10 w-full h-[88%] sm:h-[90%] flex items-end justify-center px-1.5 xs:px-2">
                        <Image
                          src={cat.image}
                          alt={cat.name}
                          width={110}
                          height={110}
                          className="w-full h-full object-contain object-bottom pointer-events-none select-none transition-transform duration-300 drop-shadow-[0_4px_8px_rgba(12,20,18,0.12)] group-hover:scale-[1.03]"
                        />
                      </div>
                    </div>
                    <span className="mt-1.5 text-[10.5px] xs:text-[11px] sm:text-xs text-center line-clamp-1 font-semibold text-[#0C1412] group-hover:text-[#0B5D44] transition-colors">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </>
            ) : (
              <>
                {/* ============================================================= */}
                {/* DRILL-DOWN MODE: Active Category in Slot 1 + Subcategories    */}
                {/* ============================================================= */}

                {/* 1. Active Main Category Tile in Slot 1 */}
                <button
                  type="button"
                  onClick={() => {
                    if (selectedSubcategory !== "All") {
                      handleSubcategorySelect("All");
                    } else {
                      handleCategorySelect("All");
                    }
                  }}
                  className="group relative flex flex-col items-center shrink-0 cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none w-[76px] xs:w-[84px] sm:w-[92px] md:w-[102px] lg:w-[112px]"
                  title={selectedSubcategory !== "All" ? `Show all ${activeMainCat.name}` : "Back to All Categories"}
                >
                  <div
                    className={`w-full relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-[#E6F4EF] via-[#F4FAF7] to-white transition-all duration-300 flex items-end justify-center ${
                      selectedSubcategory === "All"
                        ? "border-2 border-[#0B5D44] ring-2 ring-[#0B5D44]/25 shadow-md scale-[1.02]"
                        : "border border-[#D4E9E0] group-hover:border-[#0B5D44]/55 shadow-2xs group-hover:shadow-md"
                    }`}
                  >
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#0B5D44]/[0.11] via-[#C59B27]/[0.04] to-transparent pointer-events-none" />

                    {/* Subtle Back Badge on top-left of Card 1 */}
                    <div className="absolute top-1 left-1 z-20 px-1.5 py-0.5 rounded-full bg-[#0C1412]/85 hover:bg-[#0C1412] text-[8.5px] xs:text-[9px] text-white font-bold backdrop-blur-xs flex items-center gap-0.5 shadow-xs transition-colors">
                      <ArrowLeft className="w-2.5 h-2.5 text-[#E5C469]" />
                      <span>All</span>
                    </div>

                    <div className="relative z-10 w-full h-[88%] sm:h-[90%] flex items-end justify-center px-1.5 xs:px-2">
                      <Image
                        src={activeMainCat.image}
                        alt={activeMainCat.name}
                        width={110}
                        height={110}
                        className={`w-full h-full object-contain object-bottom pointer-events-none select-none transition-transform duration-300 ${
                          selectedSubcategory === "All"
                            ? "scale-100 drop-shadow-[0_4px_8px_rgba(11,93,68,0.18)]"
                            : "drop-shadow-[0_4px_8px_rgba(12,20,18,0.12)] group-hover:scale-[1.03]"
                        }`}
                      />
                    </div>
                  </div>
                  <span
                    className={`mt-1.5 text-[10.5px] xs:text-[11px] sm:text-xs text-center line-clamp-1 transition-colors ${
                      selectedSubcategory === "All"
                        ? "text-[#0B5D44] font-bold"
                        : "font-semibold text-[#0C1412] group-hover:text-[#0B5D44]"
                    }`}
                  >
                    All {activeMainCat.shortName || activeMainCat.name}
                  </span>
                </button>

                {/* 2..N Subcategories of the active Main Category */}
                {activeMainCat.subcategories.map((subcat) => {
                  const isSubSelected =
                    selectedSubcategory.toLowerCase() === subcat.query.toLowerCase() ||
                    selectedSubcategory.toLowerCase() === subcat.name.toLowerCase();

                  return (
                    <button
                      key={subcat.id}
                      type="button"
                      onClick={() => handleSubcategorySelect(subcat.query)}
                      className="group flex flex-col items-center shrink-0 cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none w-[76px] xs:w-[84px] sm:w-[92px] md:w-[102px] lg:w-[112px]"
                    >
                      <div
                        className={`w-full relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-[#E6F4EF] via-[#F4FAF7] to-white transition-all duration-300 flex items-end justify-center ${
                          isSubSelected
                            ? "border-2 border-[#0B5D44] ring-2 ring-[#0B5D44]/25 shadow-md scale-[1.02]"
                            : "border border-[#D4E9E0] group-hover:border-[#0B5D44]/55 shadow-2xs group-hover:shadow-md"
                        }`}
                      >
                        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#0B5D44]/[0.09] via-[#C59B27]/[0.03] to-transparent pointer-events-none" />
                        <div className="relative z-10 w-full h-[88%] sm:h-[90%] flex items-end justify-center px-1.5 xs:px-2">
                          <Image
                            src={subcat.image}
                            alt={subcat.name}
                            width={110}
                            height={110}
                            className={`w-full h-full object-contain object-bottom pointer-events-none select-none transition-transform duration-300 ${
                              isSubSelected
                                ? "scale-100 drop-shadow-[0_4px_8px_rgba(11,93,68,0.18)]"
                                : "drop-shadow-[0_4px_8px_rgba(12,20,18,0.12)] group-hover:scale-[1.03]"
                            }`}
                          />
                        </div>
                      </div>
                      <span
                        className={`mt-1.5 text-[10px] xs:text-[11px] sm:text-xs text-center line-clamp-1 transition-colors ${
                          isSubSelected
                            ? "text-[#0B5D44] font-bold"
                            : "font-semibold text-neutral-800 group-hover:text-[#0B5D44]"
                        }`}
                      >
                        {subcat.name}
                      </span>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. MAIN CATALOG WORKSPACE: Dynamic Facet Sidebar + Products Grid       */}
      {/* ===================================================================== */}
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 w-full">
        {/* Controls Bar: Result Count & Sort Options */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="text-xs sm:text-sm font-semibold text-neutral-600 font-mograph">
            Showing <span className="text-neutral-950 font-bold">{filteredProducts.length}</span>{" "}
            {filteredProducts.length === 1 ? "product" : "products"}
            {selectedCategory !== "All" && (
              <span className="ml-1 text-[#0B5D44] font-bold">
                in &ldquo;
                {selectedSubcategory !== "All"
                  ? `${activeMainCat ? activeMainCat.name : selectedCategory} › ${selectedSubcategory}`
                  : activeMainCat
                  ? activeMainCat.name
                  : selectedCategory}
                &rdquo;
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Mobile Filters Trigger */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 bg-white border border-neutral-200/90 rounded-xl text-xs font-bold text-neutral-900 shadow-xs hover:bg-neutral-50 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#0B5D44]" />
              <span>Filters</span>
              {totalAppliedFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#111111] text-white text-[10px] flex items-center justify-center font-bold">
                  {totalAppliedFiltersCount}
                </span>
              )}
            </button>

            {/* Custom Sort Dropdown */}
            <div ref={sortDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-2 bg-white border border-neutral-200/90 hover:border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 shadow-xs cursor-pointer transition-colors"
              >
                {currentSortOption.icon}
                <span className="hidden sm:inline text-neutral-500 font-normal">Sort:</span>
                <span>{currentSortOption.label}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                    sortDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {sortDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-neutral-200/90 p-1.5 z-40 text-neutral-900"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortBy(opt.value);
                          setSortDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          sortBy === opt.value
                            ? "bg-[#E6F4EF] text-[#074230]"
                            : "text-neutral-700 hover:bg-neutral-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {opt.icon}
                          <span>{opt.label}</span>
                        </div>
                        {sortBy === opt.value && <Check className="w-3.5 h-3.5 text-[#074230]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Active Filters Chips Bar */}
        {totalAppliedFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-4 p-2 sm:p-2.5 rounded-2xl bg-[#F3FAF7] border border-[#E6F4EF]">
            <span className="text-[11px] sm:text-xs font-bold text-neutral-600 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-[#0B5D44]" />
              Active:
            </span>

            {/* Category Chip */}
            {selectedCategory !== "All" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-neutral-200 text-neutral-800 text-xs font-medium shadow-2xs">
                <span>{activeMainCat ? activeMainCat.name : selectedCategory}</span>
                <button
                  onClick={() => handleCategorySelect("All")}
                  className="hover:text-rose-500 transition-colors ml-0.5 cursor-pointer"
                  aria-label="Remove category filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Subcategory Chip */}
            {selectedSubcategory && selectedSubcategory !== "All" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E6F4EF] border border-[#0B5D44]/40 text-[#2C4815] text-xs font-bold shadow-2xs">
                <span>{selectedSubcategory}</span>
                <button
                  onClick={() => handleSubcategorySelect("All")}
                  className="hover:text-rose-500 transition-colors ml-0.5 cursor-pointer"
                  aria-label="Remove subcategory filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Price Chip */}
            {maxPrice < 10000 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-neutral-200 text-neutral-800 text-xs font-medium shadow-2xs">
                <span>Under ₹{maxPrice.toLocaleString("en-IN")}</span>
                <button
                  onClick={() => setMaxPrice(10000)}
                  className="hover:text-rose-500 transition-colors ml-0.5"
                  aria-label="Remove price filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Stock Chip */}
            {onlyInStock && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-neutral-200 text-neutral-800 text-xs font-medium shadow-2xs">
                <span>In-Stock Only</span>
                <button
                  onClick={() => setOnlyInStock(false)}
                  className="hover:text-rose-500 transition-colors ml-0.5"
                  aria-label="Remove stock filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Search Query Chip */}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-neutral-200 text-neutral-800 text-xs font-medium shadow-2xs">
                <span>&ldquo;{searchQuery}&rdquo;</span>
                <button
                  onClick={() => setSearchQuery("")}
                  className="hover:text-rose-500 transition-colors ml-0.5"
                  aria-label="Remove search keyword"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Dynamic Facets Chips */}
            {Object.entries(selectedFacets).flatMap(([facetId, values]) =>
              values.map((val) => (
                <span
                  key={`${facetId}-${val}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E6F4EF] text-[#074230] border border-[#B8DFD1] text-xs font-semibold shadow-2xs"
                >
                  <span>{val}</span>
                  <button
                    onClick={() => handleFacetToggle(facetId, val)}
                    className="hover:text-rose-700 transition-colors ml-0.5"
                    aria-label={`Remove filter ${val}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}

            {/* Reset All Button */}
            <button
              onClick={handleResetAllFilters}
              className="text-xs font-bold text-[#0B5D44] hover:text-[#4F7529] hover:underline flex items-center gap-1 ml-auto cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 xl:gap-8 items-start">
          {/* ================================================================= */}
          {/* DESKTOP SIDEBAR: Dynamic Multi-Facet Filters (SportsJam Pattern)    */}
          {/* ================================================================= */}
          <aside className="hidden lg:block lg:col-span-1 bg-white border border-neutral-200/80 rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] sticky top-36 space-y-5 text-neutral-900">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200/70">
              <span className="text-sm font-bold text-neutral-950 flex items-center gap-2 font-mograph">
                <SlidersHorizontal className="w-4 h-4 text-[#0B5D44]" />
                Filters
              </span>
              {totalAppliedFiltersCount > 0 && (
                <button
                  onClick={handleResetAllFilters}
                  className="text-xs font-bold text-[#0B5D44] hover:underline flex items-center gap-1 cursor-pointer font-mograph"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              )}
            </div>

            {/* 1. Max Budget Range Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wide font-mograph">
                  Max Budget
                </label>
                <span className="text-xs font-bold text-[#074230] font-mono px-2 py-0.5 rounded-full bg-[#E6F4EF]">
                  ₹{maxPrice.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min={500}
                max={10000}
                step={250}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#0B5D44] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-medium mt-1">
                <span>₹500</span>
                <span>₹10,000+</span>
              </div>
            </div>

            {/* 2. In-Stock Items Only Toggle */}
            <div className="pt-3 border-t border-neutral-200/70">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-[#0B5D44] accent-[#0B5D44] cursor-pointer"
                />
                <span className="text-xs font-semibold text-neutral-800">
                  In-Stock Items Only
                </span>
              </label>
            </div>

            {/* 3. Departments / Collections */}
            <div className="pt-3 border-t border-neutral-200/70">
              <label className="block text-xs font-bold text-neutral-800 mb-2 uppercase tracking-wide font-mograph">
                Departments
              </label>
              <div className="space-y-1">
                {exploreCategoriesList.map((cat) => {
                  const isCatSelected =
                    (cat.query === "All" && (!selectedCategory || selectedCategory === "All")) ||
                    selectedCategory.toLowerCase() === cat.query.toLowerCase() ||
                    ((selectedCategory.toLowerCase() === "gym supplements" || selectedCategory.toLowerCase() === "gym supplementaries") &&
                     (cat.query.toLowerCase() === "gym supplements" || cat.query.toLowerCase() === "gym supplementaries"));

                  const matchingStoreCat = storeCategories.find(
                    (sc) =>
                      sc.query.toLowerCase() === cat.query.toLowerCase() ||
                      sc.name.toLowerCase() === cat.name.toLowerCase() ||
                      ((sc.name.toLowerCase() === "gym supplements" || sc.query.toLowerCase() === "gym supplementaries") &&
                       (cat.name.toLowerCase() === "gym supplements" || cat.query.toLowerCase() === "gym supplementaries"))
                  );

                  return (
                    <div key={cat.id} className="space-y-1">
                      <button
                        onClick={() => handleCategorySelect(cat.query)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                          isCatSelected && selectedSubcategory === "All"
                            ? "bg-[#E6F4EF] text-[#074230] font-bold shadow-2xs"
                            : isCatSelected
                            ? "bg-neutral-100 text-neutral-900 font-semibold"
                            : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50 font-medium"
                        }`}
                      >
                        <span>{cat.name}</span>
                        {isCatSelected && selectedSubcategory === "All" && (
                          <Check className="w-3.5 h-3.5 text-[#074230]" />
                        )}
                      </button>

                      {/* Indented Subcategories when Department is Active */}
                      {isCatSelected && matchingStoreCat && matchingStoreCat.subcategories.length > 0 && (
                        <div className="pl-3 space-y-1 border-l-2 border-[#0B5D44]/30 ml-2.5 pt-1 pb-1">
                          {matchingStoreCat.subcategories.map((sub) => {
                            const isSubSelected =
                              selectedSubcategory.toLowerCase() === sub.query.toLowerCase() ||
                              selectedSubcategory.toLowerCase() === sub.name.toLowerCase();

                            return (
                              <button
                                key={sub.id}
                                onClick={() => handleSubcategorySelect(sub.query)}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                                  isSubSelected
                                    ? "bg-[#0B5D44] text-white font-bold shadow-2xs"
                                    : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 font-medium"
                                }`}
                              >
                                <span>{sub.name}</span>
                                {isSubSelected && <Check className="w-3 h-3 text-white" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. DYNAMIC CATEGORY FACETS (Dynamic per Department) */}
            {activeFacetGroups.map((group) => {
              const isOpen = openFacetAccordions[group.id] !== false; // open by default
              const selectedValuesInGroup = selectedFacets[group.id] || [];

              return (
                <div key={group.id} className="pt-3 border-t border-neutral-200/70">
                  <button
                    type="button"
                    onClick={() => toggleFacetAccordion(group.id)}
                    className="w-full flex items-center justify-between py-1 text-xs font-bold text-neutral-800 hover:text-neutral-950 transition-colors font-mograph text-left cursor-pointer"
                  >
                    <span className="uppercase tracking-wide">{group.name}</span>
                    <div className="flex items-center gap-1.5">
                      {selectedValuesInGroup.length > 0 && (
                        <span className="w-4 h-4 rounded-full bg-[#E6F4EF] text-[#074230] text-[10px] font-bold flex items-center justify-center">
                          {selectedValuesInGroup.length}
                        </span>
                      )}
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2 space-y-1.5">
                          {group.options.map((opt) => {
                            const isChecked = selectedValuesInGroup.includes(opt.value);
                            // Real matching count preview
                            const matchCount = baseCategoryProducts.filter((p) =>
                              productMatchesFacetValue(p, group.id, opt.value)
                            ).length;

                            return (
                              <label
                                key={opt.value}
                                className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors text-xs select-none ${
                                  isChecked
                                    ? "bg-[#F4F9EE] text-[#074230] font-semibold"
                                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleFacetToggle(group.id, opt.value)}
                                    className="w-3.5 h-3.5 rounded border-neutral-300 text-[#0B5D44] accent-[#0B5D44] cursor-pointer"
                                  />
                                  <span>{opt.label}</span>
                                </div>
                                <span className="text-[10px] text-neutral-400 font-medium">
                                  ({matchCount})
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Trust Certification Card (Interactive Logo #80 Verified Stamp) */}
            <VittalVerifiedBadge compact />
          </aside>

          {/* ================================================================= */}
          {/* PRODUCT CARDS GRID (Home Page Theme & Font Style)                  */}
          {/* ================================================================= */}
          <main className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-200/80 p-12 text-center shadow-xs text-neutral-900">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#F3FAF7] flex items-center justify-center mb-4 text-[#0B5D44]">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-neutral-950 mb-1 font-mograph">
                  No products found
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 mb-6 max-w-sm mx-auto leading-relaxed">
                  Try adjusting your budget slider, clearing selected filter facets, or choosing a different department.
                </p>
                <button
                  onClick={handleResetAllFilters}
                  className="px-6 py-2.5 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-4 xl:gap-5">
                {filteredProducts.map((product) => {
                  const wishlisted = isInWishlist(product.id);
                  const discountPercent =
                    product.mrp && product.mrp > product.price
                      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                      : null;

                  // Clean short category label for secondary metadata line
                  const shortCategory =
                    product.subcategory ||
                    (product.category === "Gym Supplementaries"
                      ? product.name.toLowerCase().includes("creatine")
                        ? "Creatine"
                        : product.name.toLowerCase().includes("gainer")
                        ? "Mass Gainer"
                        : "Whey Isolate"
                      : product.category === "Dates & Nuts"
                      ? product.name.toLowerCase().includes("almond")
                        ? "Almonds"
                        : "Dates"
                      : product.category === "Candy & Chocolates"
                      ? "Chocolates"
                      : product.category === "Outfits"
                      ? "Outfits"
                      : product.category === "Apparels"
                      ? "Apparel"
                      : product.category);

                  return (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group relative rounded-3xl bg-white border border-neutral-200/80 hover:border-[#0B5D44]/50 p-3 sm:p-4 flex flex-col justify-between transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1"
                    >
                      {/* Wishlist Heart Icon (44px accessible hit zone) */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleWishlist(e, product)}
                        className="absolute top-2.5 right-2.5 z-10 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
                        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <span className="w-8 h-8 rounded-full bg-white/95 border border-neutral-200/70 hover:bg-white flex items-center justify-center text-neutral-500 hover:text-rose-500 transition-colors shadow-2xs">
                          <Heart
                            className={`w-4 h-4 transition-colors ${
                              wishlisted ? "fill-rose-500 text-rose-500" : "stroke-current"
                            }`}
                          />
                        </span>
                      </button>

                      {/* Product Image with Hover / Multi-Image Preview */}
                      <CatalogProductImage product={product} />

                      {/* Product Metadata */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-mograph text-[10px] font-bold uppercase tracking-wider text-[#0B5D44] truncate">
                            {shortCategory}
                          </span>
                          <span className="inline-flex items-center gap-0.5 text-[10.5px] font-bold text-neutral-700 tabular-nums shrink-0">
                            <Star className="w-3 h-3 fill-[#C59B27] text-[#C59B27]" />
                            {(product.rating ?? 4.8).toFixed(1)}
                          </span>
                        </div>

                        <Link href={`/products/${product.id || product.slug}`} className="block">
                          <h3 className="font-mograph font-semibold text-xs sm:text-sm text-[#0C1412] group-hover:text-[#0B5D44] transition-colors leading-snug line-clamp-2 min-h-[34px] sm:min-h-[38px] mb-1.5">
                            {product.name}
                          </h3>
                        </Link>

                        {/* Price Row */}
                        <div className="flex items-baseline gap-1.5 mb-2.5 tabular-nums">
                          <span className="font-mograph text-sm sm:text-base font-extrabold text-[#0C1412]">
                            ₹{product.price.toLocaleString("en-IN")}
                          </span>
                          {product.mrp && product.mrp > product.price && (
                            <span className="font-mograph text-xs text-neutral-400 line-through">
                              ₹{product.mrp.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>

                        {/* Discount Badge & Add to Cart Button */}
                        <div className="flex items-center justify-between gap-2">
                          {discountPercent ? (
                            <span className="bg-[#E6F4EF] text-[#074230] text-[10px] sm:text-[11px] font-bold tabular-nums px-2.5 py-0.5 rounded-full inline-flex items-center">
                              {discountPercent}% OFF
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#0B5D44] font-semibold">100% Original</span>
                          )}

                          <CardAddToCartControl product={product} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. MOBILE FILTER MODAL DRAWER (SportsJam Multi-Facet Drawer)           */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden"
              onClick={() => setMobileFilterOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="fixed inset-x-0 bottom-0 bg-white border-t border-neutral-200 text-neutral-900 rounded-t-3xl p-5 z-50 lg:hidden max-h-[85vh] overflow-y-auto space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#0B5D44]" />
                  <h3 className="font-bold text-base text-neutral-950 font-mograph">Filter Products</h3>
                </div>
                <div className="flex items-center gap-2">
                  {totalAppliedFiltersCount > 0 && (
                    <button
                      onClick={handleResetAllFilters}
                      className="text-xs font-bold text-[#0B5D44] hover:underline cursor-pointer"
                    >
                      Reset All
                    </button>
                  )}
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    aria-label="Close filters"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Price Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-neutral-800 uppercase tracking-wide font-mograph">
                    Max Budget
                  </label>
                  <span className="text-xs font-bold text-[#074230] font-mono px-2 py-0.5 rounded-full bg-[#E6F4EF]">
                    ₹{maxPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={10000}
                  step={250}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#0B5D44]"
                />
              </div>

              {/* In-Stock Toggle */}
              <div>
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-300 text-[#0B5D44] accent-[#0B5D44]"
                  />
                  <span className="text-xs font-semibold text-neutral-800">
                    In-Stock Items Only
                  </span>
                </label>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-2 uppercase tracking-wide font-mograph">
                  Departments
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {exploreCategoriesList.map((cat) => {
                    const isSelected =
                      (cat.query === "All" && (!selectedCategory || selectedCategory === "All")) ||
                      selectedCategory.toLowerCase() === cat.query.toLowerCase() ||
                      ((selectedCategory.toLowerCase() === "gym supplements" || selectedCategory.toLowerCase() === "gym supplementaries") &&
                       (cat.query.toLowerCase() === "gym supplements" || cat.query.toLowerCase() === "gym supplementaries"));
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat.query)}
                        className={`p-2.5 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#111111] text-white shadow-xs"
                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200/70"
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>

                {/* Subcategories in Mobile Drawer when Category is Active */}
                {activeMainCat && activeMainCat.subcategories.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-neutral-100">
                    <div className="text-[11px] font-bold text-neutral-500 mb-1.5 uppercase">
                      {activeMainCat.name} Subcategories
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSubcategorySelect("All")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          selectedSubcategory === "All"
                            ? "bg-[#0B5D44] text-white font-bold"
                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200/70"
                        }`}
                      >
                        All {activeMainCat.shortName || activeMainCat.name}
                      </button>
                      {activeMainCat.subcategories.map((sub) => {
                        const isSubSelected =
                          selectedSubcategory.toLowerCase() === sub.query.toLowerCase() ||
                          selectedSubcategory.toLowerCase() === sub.name.toLowerCase();
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => handleSubcategorySelect(sub.query)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              isSubSelected
                                ? "bg-[#0B5D44] text-white font-bold"
                                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200/70"
                            }`}
                          >
                            {sub.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Facets in Mobile Drawer */}
              {activeFacetGroups.map((group) => {
                const selectedValuesInGroup = selectedFacets[group.id] || [];
                return (
                  <div key={group.id} className="pt-3 border-t border-neutral-200">
                    <label className="block text-xs font-bold text-neutral-800 mb-2 uppercase tracking-wide font-mograph">
                      {group.name}
                    </label>
                    <div className="space-y-1.5">
                      {group.options.map((opt) => {
                        const isChecked = selectedValuesInGroup.includes(opt.value);
                        const matchCount = baseCategoryProducts.filter((p) =>
                          productMatchesFacetValue(p, group.id, opt.value)
                        ).length;

                        return (
                          <label
                            key={opt.value}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs transition-colors ${
                              isChecked
                                ? "bg-[#E6F4EF] text-[#074230] font-bold"
                                : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleFacetToggle(group.id, opt.value)}
                                className="w-4 h-4 rounded border-neutral-300 text-[#0B5D44] accent-[#0B5D44]"
                              />
                              <span>{opt.label}</span>
                            </div>
                            <span className="text-[10px] text-neutral-400">({matchCount})</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Bottom Sticky Action */}
              <div className="pt-2 sticky bottom-0 bg-white">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-3.5 bg-[#111111] hover:bg-black text-white font-bold text-sm rounded-2xl shadow-lg transition-all cursor-pointer font-mograph"
                >
                  Apply Filters ({filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<VittalSkeletonGrid count={8} label="Loading verified catalog…" />}>
      <ProductsContent />
    </Suspense>
  );
}
