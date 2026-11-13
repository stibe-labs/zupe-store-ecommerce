"use client";

import React, { useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Sparkles,
  ArrowRight,
  Star,
  ChevronRight,
} from "lucide-react";
import { useSearch } from "@/context/SearchContext";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";

const COLLECTIONS = [
  {
    title: "Gym Supplements",
    image: "/vittal/cat-icon-gym-supplements-trans.png",
    href: "/products?category=Gym+Supplements",
  },
  {
    title: "Outfits",
    image: "/vittal/cat-icon-outfits-trans.png",
    href: "/products?category=Outfits",
  },
  {
    title: "Apparels",
    image: "/vittal/cat-icon-apparels-trans.png",
    href: "/products?category=Apparels",
  },
  {
    title: "Dates & Nuts",
    image: "/vittal/cat-icon-dates-trans.png",
    href: "/products?category=Dates+%26+Nuts",
  },
  {
    title: "Candy & Chocolates",
    image: "/vittal/cat-icon-chocolates-trans.png",
    href: "/products?category=Candy+%26+Chocolates",
  },
];

export function SearchModal() {
  const router = useRouter();
  const { isSearchOpen, closeSearch, searchQuery, setSearchQuery } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchOpen) {
        closeSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, closeSearch]);

  // Lock background scroll when SearchModal is open
  useEffect(() => {
    if (isSearchOpen) {
      const origBody = document.body.style.overflow;
      const origHtml = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");
      return () => {
        document.body.style.overflow = origBody;
        document.documentElement.style.overflow = origHtml;
        document.body.classList.remove("modal-open");
        document.documentElement.classList.remove("modal-open");
      };
    }
  }, [isSearchOpen]);

  // Live matching products
  const liveResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return DEFAULT_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tagline?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      closeSearch();
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <div data-lenis-prevent className="fixed inset-0 z-50 flex flex-col justify-start overflow-hidden">
          {/* Dimmed Blurred Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSearch}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />

          {/* Animated Dropdown Search Container */}
          <motion.div
            data-lenis-prevent
            initial={{ opacity: 0, y: -25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative z-10 w-full max-w-3xl mx-auto px-3 sm:px-4 pt-3 sm:pt-6"
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-neutral-200/90 text-neutral-900 overflow-hidden flex flex-col min-h-0 max-h-[85vh] font-mograph">
              {/* Search Bar Header */}
              <div className="p-3.5 sm:p-4 border-b border-neutral-100 shrink-0 bg-white">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center gap-2 sm:gap-3"
                >
                  <div className="relative flex-1 flex items-center">
                    <Search className="absolute left-4 w-4 h-4 sm:w-5 sm:h-5 text-[#6B9E3A] pointer-events-none stroke-[2.2]" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Gym Supplements, Outfits, Dates, Chocolates..."
                      className="w-full pl-11 sm:pl-12 pr-10 py-3 sm:py-3.5 rounded-2xl bg-[#F7F8FA] border border-neutral-200/80 text-sm sm:text-base text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-[#6B9E3A] focus:ring-2 focus:ring-[#95CF42]/25 focus:bg-white transition-all font-medium"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3.5 p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                        aria-label="Clear search query"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Close [✕] Button */}
                  <button
                    type="button"
                    onClick={closeSearch}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-950 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer"
                    aria-label="Close search"
                  >
                    <X className="w-5 h-5 stroke-[2.2]" />
                  </button>
                </form>
              </div>

              {/* Scrollable Body: Collections or Live Search Results */}
              <div data-lenis-prevent className="overflow-y-auto flex-1 min-h-0 overscroll-contain p-3.5 sm:p-5 scrollbar-thin space-y-4" style={{ WebkitOverflowScrolling: "touch" }}>
                {/* 1. Live Search Results (when typing) */}
                {searchQuery.trim().length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        Search Results ({liveResults.length})
                      </span>
                      {liveResults.length > 0 && (
                        <button
                          onClick={handleSearchSubmit}
                          className="text-xs font-semibold text-[#6B9E3A] hover:text-[#527C2B] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>View all</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {liveResults.length === 0 ? (
                      <div className="py-10 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-[#E5F2D0] text-[#3B581C] flex items-center justify-center mx-auto mb-3 shadow-xs">
                          <Search className="w-6 h-6 stroke-[2]" />
                        </div>
                        <p className="text-sm font-bold text-neutral-900 mb-1">
                          No matching products found
                        </p>
                        <p className="text-xs text-neutral-500 mb-4">
                          Try searching for whey protein, creatine, gym sets, dates, or dark chocolate
                        </p>
                        <Link
                          href="/products"
                          onClick={closeSearch}
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-bold shadow-sm transition-all"
                        >
                          Browse All Products
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {liveResults.map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug || product.id}`}
                            onClick={closeSearch}
                            className="flex items-center gap-3 p-2.5 rounded-2xl bg-white hover:bg-[#F8FAF5] border border-neutral-200/80 hover:border-[#6B9E3A]/50 shadow-2xs hover:shadow-xs transition-all group"
                          >
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-b from-[#F2F8EB] via-[#F8FAF4] to-[#FFFFFF] flex-shrink-0 border border-neutral-200/60 p-1">
                              <Image
                                src={product.poster_image}
                                alt={product.name}
                                fill
                                sizes="56px"
                                className="object-contain group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B9E3A] block">
                                {product.category}
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-[#6B9E3A] transition-colors truncate">
                                {product.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-extrabold text-neutral-950 font-mograph">
                                  ₹{product.price.toLocaleString("en-IN")}
                                </span>
                                {product.rating && (
                                  <span className="text-[10px] font-semibold text-neutral-500 flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-[#95CF42] text-[#95CF42]" />
                                    {product.rating.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#6B9E3A] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* 2. COLLECTIONS ONLY (Popular Searches Removed) */
                  <div>
                    <div className="flex items-center justify-between mb-2.5 px-0.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5 font-mograph">
                        <Sparkles className="w-3.5 h-3.5 text-[#6B9E3A]" />
                        Collections
                      </span>
                      <Link
                        href="/products"
                        onClick={closeSearch}
                        className="text-xs font-semibold text-[#6B9E3A] hover:text-[#527C2B] flex items-center gap-0.5 transition-colors"
                      >
                        <span>Explore All</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* Reduced Card Size Collections Container */}
                    <div className="bg-[#F8FAF5] rounded-2xl p-2 sm:p-3 border border-neutral-200/70">
                      <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5 w-full">
                        {COLLECTIONS.map((col, idx) => (
                          <motion.div
                            key={col.title}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03, duration: 0.2 }}
                            className="flex flex-col items-center"
                          >
                            <Link
                              href={col.href}
                              onClick={closeSearch}
                              className="group flex flex-col items-center w-full transition-transform duration-200 active:scale-95 cursor-pointer"
                            >
                              {/* Compact Image Tile matching Home Page with Banner Green Wave Texture & Fade */}
                              <div className="w-full relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-b from-[#9CD33B] via-[#E2F5B4] to-white border border-neutral-200/80 group-hover:border-[#6B9E3A]/60 shadow-2xs group-hover:shadow-xs transition-all duration-300 flex items-end justify-center mb-1 sm:mb-1.5">
                                {/* Banner's Matching Green Wave Texture */}
                                <Image
                                  src="/vittal/banner-hero-green-texture.jpg"
                                  alt=""
                                  fill
                                  sizes="120px"
                                  className="object-cover object-top pointer-events-none select-none opacity-85"
                                />

                                {/* Top-to-lower fade */}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-15% via-white/50 via-65% to-white to-95% pointer-events-none" />

                                {/* Cutout Category Image synced with home page */}
                                <div className="relative z-10 w-full h-[88%] flex items-end justify-center px-0.5">
                                  <Image
                                    src={col.image}
                                    alt={col.title}
                                    fill
                                    sizes="(max-width: 640px) 20vw, 120px"
                                    className="object-contain object-bottom group-hover:scale-108 transition-transform duration-300 drop-shadow-xs"
                                  />
                                </div>
                              </div>

                              {/* Category Name below card */}
                              <span className="font-mograph font-bold text-[9px] xs:text-[10px] sm:text-[11px] text-neutral-800 group-hover:text-[#6B9E3A] transition-colors text-center leading-tight line-clamp-2 px-0.5">
                                {col.title}
                              </span>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
