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
import { DEFAULT_PRODUCTS, doesCategoryMatch } from "@/data/zupeProducts";
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

// ---------------------------------------------------------------------------
// Shop Page Category Cards (Homepage visual style with green wave & icons)
// "All Categories" placed first on the left corner
// ---------------------------------------------------------------------------
const SHOP_CATEGORY_CARDS = [
  {
    id: "All",
    name: "All Categories",
    query: "All",
    image: "/vittal/cat-icon-all-categories-trans.png",
  },
  {
    id: "Gym Supplementaries",
    name: "Gym Supplements",
    query: "Gym Supplementaries",
    image: "/vittal/cat-icon-gym-supplements-trans.png",
  },
  {
    id: "Outfits",
    name: "Outfits",
    query: "Outfits",
    image: "/vittal/cat-icon-outfits-trans.png",
  },
  {
    id: "Apparels",
    name: "Apparels",
    query: "Apparels",
    image: "/vittal/cat-icon-apparels-trans.png",
  },
  {
    id: "Dates & Nuts",
    name: "Dates & Nuts",
    query: "Dates & Nuts",
    image: "/vittal/cat-icon-dates-trans.png",
  },
  {
    id: "Candy & Chocolates",
    name: "Candy & Chocolates",
    query: "Candy & Chocolates",
    image: "/vittal/cat-icon-chocolates-trans.png",
  },
];

const SORT_OPTIONS: {
  value: "featured" | "price-asc" | "price-desc" | "rating";
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "featured",
    label: "Featured & Curated",
    icon: <Sparkles className="w-3.5 h-3.5 text-[#6B9E3A]" />,
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
      className="relative aspect-square w-full rounded-2xl bg-gradient-to-b from-[#F2F8EB] via-[#F8FAF4] to-[#FFFFFF] p-3 flex items-center justify-center overflow-hidden mb-2.5 group/cardimg"
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
                  ? "w-4 bg-[#6B9E3A] shadow-xs"
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
  const initialSearch = searchParams.get("search") || searchParams.get("q") || "";

  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [selectedFacets, setSelectedFacets] = useState<Record<string, string[]>>({});
  const [openFacetAccordions, setOpenFacetAccordions] = useState<Record<string, boolean>>({});
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const { addItem, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Fetch updated catalog on mount
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
  }, []);

  // Sync state if URL query params change
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
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
    setSelectedFacets({}); // Reset facets on category change for clean context
    const params = new URLSearchParams(searchParams.toString());
    if (catQuery === "All") {
      params.delete("category");
    } else {
      params.set("category", catQuery);
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
    setSearchQuery("");
    setMaxPrice(10000);
    setOnlyInStock(false);
    setSelectedFacets({});
    router.push("/products", { scroll: false });
  };

  // Base products matching category, search, price & stock
  const baseCategoryProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory && selectedCategory !== "All") {
        const match = doesCategoryMatch(product.category || "", selectedCategory);
        const subMatch = product.subcategory ? doesCategoryMatch(product.subcategory, selectedCategory) : false;
        if (!match && !subMatch) return false;
      }
      return true;
    });
  }, [products, selectedCategory]);

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
    if (searchQuery.trim().length > 0) count++;
    if (maxPrice < 10000) count++;
    if (onlyInStock) count++;
    Object.values(selectedFacets).forEach((arr) => {
      count += arr.length;
    });
    return count;
  }, [selectedCategory, searchQuery, maxPrice, onlyInStock, selectedFacets]);

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    openCart();
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
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col justify-between selection:bg-[#E5F2D0] selection:text-[#1E300E] font-mograph">
      <Navbar />

      {/* ===================================================================== */}
      {/* 1. HERO BANNER: Clean White & Pastel Lime Aesthetic                    */}
      {/* ===================================================================== */}
      <div className="pt-3 sm:pt-4 md:pt-5 pb-3 sm:pb-4 bg-gradient-to-b from-[#F2F8EB]/70 via-[#F8FAF4] to-white border-b border-neutral-200/70 relative overflow-hidden">
        {/* Ambient Subtle Lime Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#95CF42]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-[#E5F2D0]/40 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb - Reduced upper gap */}
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1.5 sm:mb-2 font-medium">
            <Link href="/" className="hover:text-[#6B9E3A] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-900 font-bold">Shop All Products</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="font-mograph font-bold text-2xl sm:text-3xl md:text-4xl text-neutral-950 tracking-tight">
                Shop The Collection
              </h1>
            </div>

            {/* Fast Search Input */}
            <div className="w-full md:w-80 lg:w-96 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search supplements, outfits, dates, chocolates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white hover:bg-neutral-50/80 focus:bg-white text-neutral-900 placeholder:text-neutral-400 border border-neutral-200/90 focus:border-[#6B9E3A] focus:ring-2 focus:ring-[#6B9E3A]/20 text-xs sm:text-sm font-medium transition-all outline-none shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. HORIZONTAL CATEGORY SWIPER ROW (Homepage Category Cards Design)     */}
      {/* ===================================================================== */}
      <div className="bg-white/95 backdrop-blur-md border-b border-neutral-200/70 sticky top-16 sm:top-20 z-20 shadow-2xs">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex items-start gap-2.5 sm:gap-3 md:gap-4 lg:gap-5 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x py-1">
            {SHOP_CATEGORY_CARDS.map((cat) => {
              const isSelected =
                (cat.query === "All" && (!selectedCategory || selectedCategory === "All" || selectedCategory === "All Categories")) ||
                selectedCategory.toLowerCase() === cat.query.toLowerCase() ||
                ((selectedCategory.toLowerCase() === "gym supplements" || selectedCategory.toLowerCase() === "gym supplementaries") &&
                 (cat.query.toLowerCase() === "gym supplements" || cat.query.toLowerCase() === "gym supplementaries"));

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.query)}
                  className="group flex flex-col items-center shrink-0 cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none w-[74px] xs:w-[82px] sm:w-[90px] md:w-[100px] lg:w-[110px]"
                >
                  {/* Card Tile matching Home Page */}
                  <div
                    className={`w-full relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-[#9CD33B] via-[#E2F5B4] to-white transition-all duration-300 flex items-end justify-center ${
                      isSelected
                        ? "border-2 border-[#6B9E3A] ring-2 ring-[#6B9E3A]/30 shadow-md scale-[1.03]"
                        : "border border-neutral-200/80 group-hover:border-[#6B9E3A]/60 shadow-2xs group-hover:shadow-md"
                    }`}
                  >
                    {/* Banner's Matching Green Wave Texture */}
                    <Image
                      src="/vittal/banner-hero-green-texture.jpg"
                      alt=""
                      fill
                      sizes="(max-width: 768px) 85px, 110px"
                      className="object-cover object-top pointer-events-none select-none opacity-90"
                    />

                    {/* Top-to-lower fade */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent from-15% via-white/50 via-65% to-white to-95% pointer-events-none" />

                    {/* Inside Category Product Image */}
                    <div className="relative z-10 w-full h-[90%] xs:h-[92%] sm:h-[94%] flex items-end justify-center px-1">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        width={110}
                        height={110}
                        className={`w-full h-full object-contain object-bottom pointer-events-none select-none transition-transform duration-300 ${
                          isSelected
                            ? "scale-105 drop-shadow-[0_4px_8px_rgba(107,158,58,0.3)]"
                            : "drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)] group-hover:scale-105"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Category Name Label */}
                  <span
                    className={`mt-1.5 text-[10px] xs:text-[11px] sm:text-xs text-center line-clamp-1 transition-colors ${
                      isSelected
                        ? "text-[#6B9E3A] font-bold"
                        : "font-semibold text-neutral-800 group-hover:text-[#6B9E3A]"
                    }`}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
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
              <span className="ml-1 text-[#6B9E3A] font-bold">in &ldquo;{selectedCategory}&rdquo;</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Mobile Filters Trigger */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 bg-white border border-neutral-200/90 rounded-xl text-xs font-bold text-neutral-900 shadow-xs hover:bg-neutral-50 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#6B9E3A]" />
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
                            ? "bg-[#E5F2D0] text-[#3B581C]"
                            : "text-neutral-700 hover:bg-neutral-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {opt.icon}
                          <span>{opt.label}</span>
                        </div>
                        {sortBy === opt.value && <Check className="w-3.5 h-3.5 text-[#3B581C]" />}
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
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-4 p-2 sm:p-2.5 rounded-2xl bg-[#F8FAF4] border border-[#E5F2D0]">
            <span className="text-[11px] sm:text-xs font-bold text-neutral-600 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-[#6B9E3A]" />
              Active:
            </span>

            {/* Category Chip */}
            {selectedCategory !== "All" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-neutral-200 text-neutral-800 text-xs font-medium shadow-2xs">
                <span>{selectedCategory}</span>
                <button
                  onClick={() => handleCategorySelect("All")}
                  className="hover:text-rose-500 transition-colors ml-0.5"
                  aria-label="Remove category filter"
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
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E5F2D0] text-[#3B581C] border border-[#D5E9BC] text-xs font-semibold shadow-2xs"
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
              className="text-xs font-bold text-[#6B9E3A] hover:text-[#4F7529] hover:underline flex items-center gap-1 ml-auto cursor-pointer"
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
                <SlidersHorizontal className="w-4 h-4 text-[#6B9E3A]" />
                Filters
              </span>
              {totalAppliedFiltersCount > 0 && (
                <button
                  onClick={handleResetAllFilters}
                  className="text-xs font-bold text-[#6B9E3A] hover:underline flex items-center gap-1 cursor-pointer font-mograph"
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
                <span className="text-xs font-bold text-[#3B581C] font-mono px-2 py-0.5 rounded-full bg-[#E5F2D0]">
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
                className="w-full accent-[#6B9E3A] cursor-pointer"
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
                  className="w-4 h-4 rounded border-neutral-300 text-[#6B9E3A] accent-[#6B9E3A] cursor-pointer"
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
                {EXPLORE_CATEGORIES.map((cat) => {
                  const isSelected =
                    selectedCategory === cat.query ||
                    (cat.query === "All" && (!selectedCategory || selectedCategory === "All"));
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.query)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                        isSelected
                          ? "bg-[#E5F2D0] text-[#3B581C] font-bold shadow-2xs"
                          : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50 font-medium"
                      }`}
                    >
                      <span>{cat.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#3B581C]" />}
                    </button>
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
                        <span className="w-4 h-4 rounded-full bg-[#E5F2D0] text-[#3B581C] text-[10px] font-bold flex items-center justify-center">
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
                                    ? "bg-[#F4F9EE] text-[#284214] font-semibold"
                                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleFacetToggle(group.id, opt.value)}
                                    className="w-3.5 h-3.5 rounded border-neutral-300 text-[#6B9E3A] accent-[#6B9E3A] cursor-pointer"
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

            {/* Trust Certification Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#F2F8EB] to-[#FAFCF7] border border-[#D5E9BC]/70 text-center space-y-1 shadow-2xs">
              <Award className="w-5 h-5 text-[#6B9E3A] mx-auto mb-1" />
              <p className="text-xs font-bold text-[#15230D] uppercase tracking-wide font-mograph">
                100% Lab Tested &amp; Pure
              </p>
              <p className="text-[11px] text-[#415C29] leading-snug font-normal">
                Direct brand sourcing with verified purity, authentic nutrition, and express pan-India insured shipping.
              </p>
            </div>
          </aside>

          {/* ================================================================= */}
          {/* PRODUCT CARDS GRID (Home Page Theme & Font Style)                  */}
          {/* ================================================================= */}
          <main className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-200/80 p-12 text-center shadow-xs text-neutral-900">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#F2F8EB] flex items-center justify-center mb-4 text-[#6B9E3A]">
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
                      className="group relative rounded-3xl bg-white border border-neutral-200/80 hover:border-[#6B9E3A]/50 p-3 sm:p-4 flex flex-col justify-between transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1"
                    >
                      {/* Wishlist Heart Icon */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleWishlist(e, product)}
                        className="absolute top-3.5 right-3.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-neutral-400 hover:text-rose-500 transition-colors shadow-2xs cursor-pointer"
                        aria-label="Wishlist"
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            wishlisted ? "fill-rose-500 text-rose-500" : "stroke-current"
                          }`}
                        />
                      </button>

                      {/* Product Image with Hover / Multi-Image Preview */}
                      <CatalogProductImage product={product} />

                      {/* Product Metadata */}
                      <div>
                        <Link href={`/products/${product.id || product.slug}`} className="block">
                          <h3 className="font-mograph font-semibold text-xs sm:text-sm text-neutral-900 group-hover:text-[#6B9E3A] transition-colors leading-snug line-clamp-2 min-h-[34px] sm:min-h-[38px] mb-0.5">
                            {product.name}
                          </h3>
                        </Link>

                        <p className="font-mograph text-[10px] sm:text-xs text-neutral-500 font-medium mb-1.5 truncate">
                          {shortCategory}
                        </p>

                        {/* Price Row */}
                        <div className="flex items-baseline gap-1.5 mb-2">
                          <span className="font-mograph text-sm sm:text-base font-extrabold text-neutral-950">
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
                            <span className="bg-[#E5F2D0] text-[#3B581C] text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center">
                              {discountPercent}% OFF
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-500 font-medium">In Stock</span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[#E5F2D0] hover:bg-[#D5EBBF] text-[#3B581C] hover:text-[#284214] flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
                            aria-label="Add to cart"
                            title="Add to cart"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                          </button>
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
                  <SlidersHorizontal className="w-4 h-4 text-[#6B9E3A]" />
                  <h3 className="font-bold text-base text-neutral-950 font-mograph">Filter Products</h3>
                </div>
                <div className="flex items-center gap-2">
                  {totalAppliedFiltersCount > 0 && (
                    <button
                      onClick={handleResetAllFilters}
                      className="text-xs font-bold text-[#6B9E3A] hover:underline cursor-pointer"
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
                  <span className="text-xs font-bold text-[#3B581C] font-mono px-2 py-0.5 rounded-full bg-[#E5F2D0]">
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
                  className="w-full accent-[#6B9E3A]"
                />
              </div>

              {/* In-Stock Toggle */}
              <div>
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-300 text-[#6B9E3A] accent-[#6B9E3A]"
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
                  {EXPLORE_CATEGORIES.map((cat) => {
                    const isSelected =
                      selectedCategory === cat.query ||
                      (cat.query === "All" && (!selectedCategory || selectedCategory === "All"));
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
                                ? "bg-[#E5F2D0] text-[#3B581C] font-bold"
                                : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleFacetToggle(group.id, opt.value)}
                                className="w-4 h-4 rounded border-neutral-300 text-[#6B9E3A] accent-[#6B9E3A]"
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-white text-neutral-900 flex items-center justify-center font-mograph">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#6B9E3A] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-neutral-600 font-mograph">Loading catalog...</p>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
