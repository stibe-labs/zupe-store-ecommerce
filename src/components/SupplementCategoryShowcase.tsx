"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ChevronRight, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";

export interface SupplementCategoryShowcaseProps {
  allProducts?: Product[];
}

interface ShowcaseItem {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  image: string;
  price: number;
  mrp: number;
  discountTag: string;
  badge?: string;
  featuresSummary?: string;
}

interface CategoryTab {
  id: "whey_protein" | "omega_3" | "creatine" | "pre_workout";
  label: string;
  iconImage: string;
  items: ShowcaseItem[];
}

const CATEGORY_TABS: CategoryTab[] = [
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
    ],
  },
  {
    id: "pre_workout",
    label: "Pre-Workout",
    iconImage: "/vittal/cat-gym-supplements.png",
    items: [
      {
        id: "c4-original-pre-workout",
        slug: "on-gold-standard-whey",
        name: "Cellucor C4 Original Explosive Pre-Workout",
        subtitle: "CarnoSyn Beta-Alanine • 30 Servings",
        image: "/vittal/cat-gym-supplements.png",
        price: 1999,
        mrp: 2699,
        discountTag: "Min. 26% Off",
        badge: "Explosive Pump",
      },
      {
        id: "on-gold-standard-pre-workout",
        slug: "on-gold-standard-whey",
        name: "Optimum Nutrition Gold Standard Pre-Workout",
        subtitle: "175mg Natural Caffeine • 30 Servings",
        image: "/vittal/product-whey-protein-jar.png",
        price: 2199,
        mrp: 2999,
        discountTag: "Up to 28% Off",
        badge: "Laser Focus",
      },
      {
        id: "psychotic-insane-labz",
        slug: "on-gold-standard-whey",
        name: "Insane Labz Psychotic High-Intensity",
        subtitle: "AMPiberry Energy Matrix • 35 Servings",
        image: "/vittal/cat-gym-supplements.png",
        price: 2499,
        mrp: 3499,
        discountTag: "Min. 29% Off",
        badge: "High Stim",
      },
      {
        id: "gat-nitraflex-pre-workout",
        slug: "on-gold-standard-whey",
        name: "GAT Sport Nitraflex Hyperemia Pre-Workout",
        subtitle: "Clinically Tested Boron & Citrulline",
        image: "/vittal/product-whey-protein-jar.png",
        price: 2799,
        mrp: 3899,
        discountTag: "Min. 28% Off",
        badge: "Max Vascularity",
      },
    ],
  },
];

export function SupplementCategoryShowcase({ allProducts }: SupplementCategoryShowcaseProps) {
  const [activeTabId, setActiveTabId] = useState<CategoryTab["id"]>("whey_protein");
  const { addItem, openCart } = useCart();

  const activeTab = CATEGORY_TABS.find((t) => t.id === activeTabId) || CATEGORY_TABS[0];

  return (
    <section className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Outer Card with Vittal Brand Olive Green Aesthetic Matching Reference */}
      <div className="relative rounded-3xl sm:rounded-[36px] overflow-hidden bg-gradient-to-b from-[#587933] via-[#466324] to-[#344C19] border border-[#6B9E3A]/40 p-4 sm:p-7 md:p-9 shadow-lg">
        {/* Subtle Decorative Pattern Watermark in Background */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(#FFFFFF 1.5px, transparent 1.5px), radial-gradient(#FFFFFF 1.5px, #344C19 1.5px)`,
            backgroundSize: "28px 28px",
            backgroundPosition: "0 0, 14px 14px",
          }}
        />

        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#95CF42]/20 blur-3xl pointer-events-none" />

        {/* ================================================================= */}
        {/* TOP HEADER ROW: Heading + Decorative "Specials" Badge             */}
        {/* ================================================================= */}
        <div className="relative flex items-center justify-between mb-5 sm:mb-7 gap-3">
          <div>
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.22em] uppercase text-[#D5EBBF] block mb-1">
              PRO GYM NUTRITION
            </span>
            <h3 className="font-movault text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Fuel Every Workout
            </h3>
          </div>

          {/* Scalloped Decorative Badge Matching Reference "Wedding Specials" */}
          <div className="relative shrink-0 flex items-center justify-center">
            {/* Scalloped Badge Border */}
            <div className="relative bg-gradient-to-br from-[#E24A7F] to-[#BE185D] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl border-2 border-[#FDE047] shadow-md flex flex-col items-center justify-center -rotate-2 hover:rotate-0 transition-transform">
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-[#FEF08A] leading-none mb-0.5">
                POWER
              </span>
              <span className="font-movault text-xs sm:text-sm font-black tracking-tight text-white leading-none">
                Specials
              </span>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FDE047] animate-ping opacity-75" />
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* CATEGORY SWITCHER TABS (Horizontal Scroll on Mobile)               */}
        {/* ================================================================= */}
        <div className="relative flex items-center justify-between sm:justify-start gap-2.5 sm:gap-6 md:gap-8 pb-3 mb-4 sm:mb-6 overflow-x-auto no-scrollbar scroll-smooth">
          {CATEGORY_TABS.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className="group flex flex-col items-center shrink-0 cursor-pointer transition-all duration-200 focus:outline-none"
              >
                {/* Rounded Icon Squircle Pill Matching Reference */}
                <div
                  className={`relative w-14 h-12 sm:w-18 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 p-2 ${
                    isActive
                      ? "bg-[#D8ECC0] ring-2 ring-white/90 shadow-md scale-105"
                      : "bg-white/20 hover:bg-white/30 backdrop-blur-xs opacity-80 group-hover:opacity-100"
                  }`}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={tab.iconImage}
                      alt={tab.label}
                      fill
                      className="object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                      sizes="72px"
                    />
                  </div>
                </div>

                {/* Tab Label */}
                <span
                  className={`font-mograph text-xs sm:text-sm mt-2 transition-colors text-center whitespace-nowrap ${
                    isActive
                      ? "text-white font-bold tracking-tight"
                      : "text-[#E3F2CE]/80 font-medium group-hover:text-white"
                  }`}
                >
                  {tab.label}
                </span>

                {/* White Active Underline Bar Matching Reference */}
                <div
                  className={`h-1 rounded-full mt-1.5 transition-all duration-300 ${
                    isActive ? "w-10 sm:w-14 bg-white" : "w-0 bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* ================================================================= */}
        {/* PRODUCT CARDS ROW (Matching Reference Grid with Peek & Horizontal) */}
        {/* ================================================================= */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 w-full items-stretch"
          >
            {activeTab.items.map((prod) => {
              const discountPercent =
                prod.mrp && prod.mrp > prod.price
                  ? Math.round(((prod.mrp - prod.price) / prod.mrp) * 100)
                  : null;

              return (
                <div
                  key={prod.id}
                  className="group relative rounded-2xl sm:rounded-3xl bg-[#FAFBF7] border border-white/70 hover:border-[#6B9E3A] p-2.5 sm:p-4 flex flex-col justify-between transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-xl hover:-translate-y-1"
                >
                  {/* Top Badge (if any) */}
                  {prod.badge && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-[#E5F2D0] text-[#3B581C] border border-[#D5EBBF] text-[9.5px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                        {prod.badge}
                      </span>
                    </div>
                  )}

                  {/* Product Visual Container */}
                  <Link
                    href={`/products/${prod.slug || prod.id}`}
                    className="relative aspect-square w-full rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#F2F8EB]/70 to-[#FFFFFF] p-3 flex items-center justify-center overflow-hidden mb-2 sm:mb-3"
                  >
                    <Image
                      src={prod.image}
                      alt={prod.name}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
                    />
                  </Link>

                  {/* Product Info & Offer Row */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/products/${prod.slug || prod.id}`} className="block">
                        <h4 className="font-mograph text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-[#4F7327] transition-colors leading-snug line-clamp-2 min-h-[32px] sm:min-h-[38px] mb-1">
                          {prod.name}
                        </h4>
                      </Link>
                      <p className="font-mograph text-[10px] sm:text-xs text-neutral-400 font-medium truncate mb-2">
                        {prod.subtitle}
                      </p>
                    </div>

                    {/* Offer Tagline in Bold (e.g. Min. 25% Off / Up to 30% Off) */}
                    <div className="pt-2 border-t border-neutral-200/80 mt-auto">
                      <div className="flex items-baseline justify-between gap-1 mb-1.5 flex-wrap">
                        <span className="font-movault text-sm sm:text-base font-black text-neutral-950 tracking-tight">
                          {prod.discountTag}
                        </span>
                        <div className="flex items-baseline gap-1 text-[11px] sm:text-xs font-semibold text-neutral-500">
                          <span className="text-neutral-900 font-bold">₹{prod.price.toLocaleString("en-IN")}</span>
                          {prod.mrp && prod.mrp > prod.price && (
                            <span className="line-through text-neutral-400 text-[10px]">
                              ₹{prod.mrp.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Action Button */}
                      <div className="flex items-center gap-1.5 w-full">
                        <Link
                          href={`/products/${prod.slug || prod.id}`}
                          className="flex-1 text-center py-1.5 px-2 rounded-xl bg-neutral-900 hover:bg-[#3B581C] text-white text-[10.5px] sm:text-xs font-bold transition-colors cursor-pointer"
                        >
                          View Deal
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            addItem(
                              {
                                id: prod.id,
                                slug: prod.slug,
                                name: prod.name,
                                price: prod.price,
                                mrp: prod.mrp,
                                offer_price: prod.price,
                                stock_count: 50,
                                poster_image: prod.image,
                                in_stock: 1,
                                category: "Gym Supplementaries",
                                tagline: prod.subtitle,
                                description: prod.subtitle,
                              },
                              1
                            );
                            openCart();
                          }}
                          className="w-8 h-8 rounded-xl bg-[#E5F2D0] hover:bg-[#D5EBBF] text-[#3B581C] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          title="Add to cart"
                          aria-label="Add to cart"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* View All Supplements Footer Pill Link */}
        <div className="mt-5 sm:mt-7 text-center">
          <Link
            href="/products?category=Gym+Supplementaries"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white/90 hover:text-white bg-white/15 hover:bg-white/25 border border-white/25 px-4 sm:px-6 py-2 rounded-full transition-all hover:scale-105 backdrop-blur-xs"
          >
            <span>Explore All Gym Supplements</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
