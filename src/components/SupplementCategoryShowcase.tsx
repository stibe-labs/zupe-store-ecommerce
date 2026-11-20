"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Product } from "@/types/product";

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
    iconImage: "/products/muscletech-nitrotech-fruit-punch.png",
    items: [
      {
        id: "muscletech-nitrotech-fruit-punch",
        slug: "muscletech-nitrotech-fruit-punch",
        name: "MuscleTech Nitro-Tech Fruit Punch Pre-Workout",
        subtitle: "Explosive Energy • Pre-Workout Formula",
        image: "/products/muscletech-nitrotech-fruit-punch.png",
        price: 2499,
        mrp: 3499,
        discountTag: "Min. 28% Off",
        badge: "Top Rated",
      },
      {
        id: "c4-original-pre-workout",
        slug: "muscletech-nitrotech-fruit-punch",
        name: "Cellucor C4 Original Explosive Pre-Workout",
        subtitle: "CarnoSyn Beta-Alanine • 30 Servings",
        image: "/products/muscletech-nitrotech-fruit-punch.png",
        price: 1999,
        mrp: 2699,
        discountTag: "Min. 26% Off",
        badge: "Explosive Pump",
      },
      {
        id: "on-gold-standard-pre-workout",
        slug: "muscletech-nitrotech-fruit-punch",
        name: "Optimum Nutrition Gold Standard Pre-Workout",
        subtitle: "175mg Natural Caffeine • 30 Servings",
        image: "/products/muscletech-nitrotech-fruit-punch.png",
        price: 2199,
        mrp: 2999,
        discountTag: "Up to 28% Off",
        badge: "Laser Focus",
      },
      {
        id: "psychotic-insane-labz",
        slug: "muscletech-nitrotech-fruit-punch",
        name: "Insane Labz Psychotic High-Intensity",
        subtitle: "AMPiberry Energy Matrix • 35 Servings",
        image: "/products/muscletech-nitrotech-fruit-punch.png",
        price: 2499,
        mrp: 3499,
        discountTag: "Min. 29% Off",
        badge: "High Stim",
      },
    ],
  },
];

export function SupplementCategoryShowcase({ allProducts }: SupplementCategoryShowcaseProps) {
  const [activeTabId, setActiveTabId] = useState<CategoryTab["id"]>("whey_protein");

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
        {/* TOP HEADER ROW: Heading                                          */}
        {/* ================================================================= */}
        <div className="relative mb-3 sm:mb-4">
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.22em] uppercase text-[#D5EBBF] block mb-1">
            PRO GYM NUTRITION
          </span>
          <h3 className="font-movault text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Fuel Every Workout
          </h3>
        </div>

        {/* ================================================================= */}
        {/* CATEGORY SWITCHER TABS (Horizontal Scroll with Room for Icons)    */}
        {/* ================================================================= */}
        <div className="relative flex items-center justify-between sm:justify-start gap-3 sm:gap-6 md:gap-8 pt-4 pb-2.5 mb-3 sm:mb-5 overflow-x-auto no-scrollbar scroll-smooth">
          {CATEGORY_TABS.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className="group flex flex-col items-center shrink-0 cursor-pointer transition-all duration-200 focus:outline-none"
              >
                {/* Rounded Icon Squircle Pill - ample padding & headroom so cap is never cut */}
                <div
                  className={`relative w-15 h-15 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all duration-300 p-2 sm:p-2.5 overflow-hidden ${
                    isActive
                      ? "bg-[#D8ECC0] ring-2 ring-white/95 shadow-md scale-105"
                      : "bg-white/20 hover:bg-white/30 backdrop-blur-xs opacity-85 group-hover:opacity-100"
                  }`}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
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

                {/* White Active Underline Bar */}
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
        {/* PRODUCT CARDS ROW (1 Row: 2 Products + 25% Portion Swipeable)    */}
        {/* ================================================================= */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="flex flex-row overflow-x-auto snap-x snap-mandatory gap-3 sm:gap-4 pb-4 pt-1 scroll-smooth no-scrollbar w-full items-stretch"
          >
            {activeTab.items.map((prod) => (
              <Link
                key={prod.id}
                href={`/products/${prod.slug || prod.id}`}
                className="group shrink-0 snap-start flex flex-col w-[calc((100%-20px)/2.25)] min-w-[calc((100%-20px)/2.25)] sm:w-[calc((100%-36px)/3.25)] sm:min-w-[calc((100%-36px)/3.25)] md:w-[calc((100%-48px)/4.25)] md:min-w-[calc((100%-48px)/4.25)] transition-transform duration-200 hover:-translate-y-1"
              >
                {/* Product Image Container */}
                <div className="relative aspect-[4/5] w-full rounded-2xl sm:rounded-3xl bg-white p-3 sm:p-4 flex items-center justify-center overflow-hidden shadow-xs group-hover:shadow-md transition-shadow">
                  <Image
                    src={prod.image}
                    alt={prod.name}
                    fill
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 45vw, 250px"
                  />
                </div>

                {/* Product Name (Clean & Truncated) */}
                <h4 className="font-mograph text-xs sm:text-sm font-bold text-white text-center leading-snug line-clamp-1 mt-2.5 px-1 group-hover:text-[#FEF08A] transition-colors">
                  {prod.name}
                </h4>

                {/* Offer in Bold */}
                <p className="font-movault text-sm sm:text-base font-black text-[#FEF08A] text-center tracking-tight mt-0.5">
                  {prod.discountTag}
                </p>
              </Link>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* View All Supplements Footer Button (Plain White with subtle texture, Black Font) */}
        <div className="mt-5 sm:mt-7 text-center">
          <Link
            href="/products?category=Gym+Supplementaries"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-neutral-950 bg-white hover:bg-neutral-50 active:bg-neutral-100 shadow-md hover:shadow-lg border border-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full transition-all hover:scale-105 cursor-pointer font-mograph"
            style={{
              backgroundImage: "radial-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px)",
              backgroundSize: "6px 6px",
            }}
          >
            <span>Explore All Gym Supplements</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5] text-neutral-950" />
          </Link>
        </div>
      </div>
    </section>
  );
}
