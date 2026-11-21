"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Product } from "@/types/product";
import {
  SupplementShowcaseConfig,
  DEFAULT_SUPPLEMENT_SHOWCASE,
  SupplementCategoryTab,
} from "@/lib/storeContent";

export interface SupplementCategoryShowcaseProps {
  allProducts?: Product[];
  config?: SupplementShowcaseConfig;
}

export function SupplementCategoryShowcase({
  allProducts,
  config: initialConfig,
}: SupplementCategoryShowcaseProps) {
  const [showcaseConfig, setShowcaseConfig] = useState<SupplementShowcaseConfig>(
    initialConfig || DEFAULT_SUPPLEMENT_SHOWCASE
  );

  // If no initial config passed, or for client hydration sync, fetch from API
  useEffect(() => {
    if (initialConfig) {
      setShowcaseConfig(initialConfig);
      return;
    }

    let isMounted = true;
    async function fetchConfig() {
      try {
        const res = await fetch("/api/content/supplement-showcase");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.config && isMounted) {
            setShowcaseConfig(data.config);
          }
        }
      } catch (err) {
        // Fallback to default
      }
    }
    fetchConfig();
    return () => {
      isMounted = false;
    };
  }, [initialConfig]);

  const categories = showcaseConfig.categories || DEFAULT_SUPPLEMENT_SHOWCASE.categories;
  const [activeTabId, setActiveTabId] = useState<string>(
    categories[0]?.id || "whey_protein"
  );

  // Ensure activeTabId points to a valid tab if categories changed
  useEffect(() => {
    if (categories.length > 0 && !categories.some((c) => c.id === activeTabId)) {
      setActiveTabId(categories[0].id);
    }
  }, [categories, activeTabId]);

  const activeTab: SupplementCategoryTab =
    categories.find((t) => t.id === activeTabId) || categories[0] || DEFAULT_SUPPLEMENT_SHOWCASE.categories[0];

  const fromColor = showcaseConfig.bgGradientFrom || "#587933";
  const viaColor = showcaseConfig.bgGradientVia || "#466324";
  const toColor = showcaseConfig.bgGradientTo || "#344C19";
  const borderColor = showcaseConfig.borderColor || "#6B9E3A";

  return (
    <section className="w-full max-w-[1680px] md:max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-6">
      {/* Outer Card with Dynamic Background Color Gradient & Preserved Pattern Texture */}
      <div
        className="relative rounded-3xl sm:rounded-[36px] md:rounded-[28px] overflow-hidden p-4 sm:p-7 md:p-6 lg:p-6 shadow-lg transition-colors duration-300"
        style={{
          background: `linear-gradient(to bottom, ${fromColor}, ${viaColor}, ${toColor})`,
          border: `1px solid ${borderColor}66`,
        }}
      >
        {/* Subtle Decorative Pattern Watermark in Background - ALWAYS PRESERVED */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(#FFFFFF 1.5px, transparent 1.5px), radial-gradient(#FFFFFF 1.5px, ${toColor} 1.5px)`,
            backgroundSize: "28px 28px",
            backgroundPosition: "0 0, 14px 14px",
          }}
        />

        {/* Ambient Top Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 blur-3xl pointer-events-none opacity-40"
          style={{ backgroundColor: borderColor }}
        />

        {/* ================================================================= */}
        {/* TOP HEADER ROW: Overline & Heading                               */}
        {/* ================================================================= */}
        <div className="relative mb-3 sm:mb-4 md:mb-3">
          <span className="text-[10px] sm:text-xs md:text-[11px] font-bold tracking-[0.22em] uppercase text-[#D5EBBF] block mb-1">
            {showcaseConfig.overlineText || "PRO GYM NUTRITION"}
          </span>
          <h3 className="font-movault text-xl sm:text-2xl md:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
            {showcaseConfig.headingText || "Fuel Every Workout"}
          </h3>
        </div>

        {/* ================================================================= */}
        {/* CATEGORY SWITCHER TABS (Horizontal Scroll with Room for Icons)    */}
        {/* ================================================================= */}
        <div className="relative flex items-center justify-between sm:justify-start gap-3 sm:gap-6 md:gap-6 pt-3 md:pt-2 pb-2 md:pb-1.5 mb-2.5 sm:mb-4 md:mb-3 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((tab) => {
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
                  className={`relative w-15 h-15 sm:w-18 sm:h-18 md:w-13 md:h-13 lg:w-14 lg:h-14 rounded-2xl sm:rounded-3xl md:rounded-2xl flex items-center justify-center transition-all duration-300 p-2 sm:p-2.5 md:p-2 overflow-hidden ${
                    isActive
                      ? "bg-[#D8ECC0] ring-2 ring-white/95 shadow-md scale-105"
                      : "bg-white/20 hover:bg-white/30 backdrop-blur-xs opacity-85 group-hover:opacity-100"
                  }`}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={tab.iconImage || "/vittal/catalog/on-gold-standard-whey.png"}
                      alt={tab.label}
                      fill
                      className="object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                      sizes="(max-width: 768px) 72px, 56px"
                    />
                  </div>
                </div>

                {/* Tab Label */}
                <span
                  className={`font-mograph text-xs sm:text-sm md:text-xs mt-1.5 md:mt-1 transition-colors text-center whitespace-nowrap ${
                    isActive
                      ? "text-white font-bold tracking-tight"
                      : "text-[#E3F2CE]/80 font-medium group-hover:text-white"
                  }`}
                >
                  {tab.label}
                </span>

                {/* White Active Underline Bar */}
                <div
                  className={`h-1 md:h-0.5 rounded-full mt-1.5 md:mt-1 transition-all duration-300 ${
                    isActive ? "w-10 sm:w-14 md:w-10 bg-white" : "w-0 bg-transparent"
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
            className="flex flex-row overflow-x-auto snap-x snap-mandatory gap-3 sm:gap-4 md:gap-3.5 pb-2.5 sm:pb-3 md:pb-2 pt-1 scroll-smooth no-scrollbar w-full items-stretch"
          >
            {(activeTab.items || []).map((prod) => (
              <Link
                key={prod.id}
                href={`/products/${prod.slug || prod.id}`}
                className="group shrink-0 snap-start flex flex-col w-[calc((100%-20px)/2.25)] min-w-[calc((100%-20px)/2.25)] sm:w-[calc((100%-36px)/3.25)] sm:min-w-[calc((100%-36px)/3.25)] md:w-[calc((100%-48px)/4.35)] md:min-w-[calc((100%-48px)/4.35)] md:max-w-[215px] lg:max-w-[230px] transition-transform duration-200 hover:-translate-y-1"
              >
                {/* Product Image Container — Compact aspect-square on desktop view */}
                <div className="relative aspect-[4/5] md:aspect-square md:max-h-[195px] lg:max-h-[210px] w-full rounded-2xl sm:rounded-3xl md:rounded-2xl bg-white p-3 sm:p-4 md:p-2.5 lg:p-3 flex items-center justify-center overflow-hidden shadow-xs group-hover:shadow-md transition-shadow">
                  <Image
                    src={prod.image || "/vittal/product-whey-protein-jar.png"}
                    alt={prod.name}
                    fill
                    className="object-contain p-2 md:p-1.5 group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 220px"
                  />
                </div>

                {/* Product Name (Clean & Truncated) */}
                <h4 className="font-mograph text-xs sm:text-sm md:text-xs font-bold text-white text-center leading-snug line-clamp-1 mt-2.5 md:mt-1.5 px-1 group-hover:text-[#FEF08A] transition-colors">
                  {prod.name}
                </h4>

                {/* Offer in Bold */}
                <p className="font-movault text-sm sm:text-base md:text-xs lg:text-sm font-black text-[#FEF08A] text-center tracking-tight mt-0.5">
                  {prod.discountTag}
                </p>
              </Link>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* View All Supplements Footer Button (Plain White with subtle texture, Black Font) */}
        <div className="mt-4 sm:mt-6 md:mt-4 text-center">
          <Link
            href={showcaseConfig.buttonLink || "/products?category=Gym+Supplementaries"}
            className="inline-flex items-center gap-1.5 md:gap-2 text-xs sm:text-sm md:text-xs font-extrabold text-neutral-950 bg-white hover:bg-neutral-50 active:bg-neutral-100 shadow-md hover:shadow-lg border border-white px-5 sm:px-8 md:px-6 py-2 sm:py-3 md:py-2 rounded-full transition-all hover:scale-105 cursor-pointer font-mograph"
            style={{
              backgroundImage: "radial-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px)",
              backgroundSize: "6px 6px",
            }}
          >
            <span>{showcaseConfig.buttonText || "Explore All Gym Supplements"}</span>
            <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 stroke-[2.5] text-neutral-950" />
          </Link>
        </div>
      </div>
    </section>
  );
}
