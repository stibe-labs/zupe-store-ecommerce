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
  TrendingUp,
  Star,
  ChevronRight,
} from "lucide-react";
import { useSearch } from "@/context/SearchContext";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";

const COLLECTIONS = [
  {
    title: "LIGHTING",
    subtitle: "DISCOVER",
    image: "/products/ripple-lamp.jpg",
    href: "/products?category=Home+%26+Living",
  },
  {
    title: "GADGETS",
    subtitle: "DISCOVER",
    image: "/products/steam-iron.jpg",
    href: "/products?category=Gadgets",
  },
  {
    title: "CAR DECOR",
    subtitle: "DISCOVER",
    image: "/products/helicopter-perfume.jpg",
    href: "/products?category=Car+Accessories",
  },
  {
    title: "STATIONERY",
    subtitle: "DISCOVER",
    image: "/products/thermal-printer.jpg",
    href: "/products?category=Stationery",
  },
  {
    title: "KITCHEN",
    subtitle: "DISCOVER",
    image: "/products/popcorn-maker.jpg",
    href: "/products?category=Kitchen+Essentials",
  },
  {
    title: "WELLNESS",
    subtitle: "DISCOVER",
    image: "/products/heating-pad.jpg",
    href: "/products?category=Health+%26+Wellness",
  },
];

const POPULAR_SEARCHES = [
  "Water Ripple Lamp",
  "Mini Steam Iron",
  "Car Perfume",
  "Pocket Printer",
  "Popcorn Maker",
  "Heating Pad",
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

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-start">
          {/* Dimmed Blurred Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSearch}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Animated Dropdown Search Container */}
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative z-10 w-full max-w-3xl mx-auto px-3 sm:px-4 pt-3 sm:pt-6"
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
              {/* Search Bar Header */}
              <div className="p-3.5 sm:p-5 border-b border-gray-100/90">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center gap-2 sm:gap-3"
                >
                  <div className="relative flex-1 flex items-center">
                    <Search className="absolute left-4 w-4 h-4 sm:w-5 sm:h-5 text-[#FA521C] pointer-events-none stroke-[2.2]" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products, lamps, gadgets, essentials..."
                      className="w-full pl-11 sm:pl-12 pr-10 py-3 sm:py-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#FA521C] focus:bg-white focus:ring-2 focus:ring-[#FA521C]/20 transition-all font-medium"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3.5 p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
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
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer"
                    aria-label="Close search"
                  >
                    <X className="w-5 h-5 stroke-[2.2]" />
                  </button>
                </form>
              </div>

              {/* Scrollable Body: Collections or Live Search Results */}
              <div className="overflow-y-auto p-4 sm:p-6 scrollbar-thin space-y-6">
                {/* 1. Live Search Results (when typing) */}
                {searchQuery.trim().length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Search Results ({liveResults.length})
                      </span>
                      {liveResults.length > 0 && (
                        <button
                          onClick={handleSearchSubmit}
                          className="text-xs font-bold text-[#FA521C] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>View all</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {liveResults.length === 0 ? (
                      <div className="py-10 text-center">
                        <div className="w-12 h-12 rounded-full bg-orange-50 text-[#FA521C] flex items-center justify-center mx-auto mb-3">
                          <Search className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-gray-900 mb-1">
                          No matching products found
                        </p>
                        <p className="text-xs text-gray-500 mb-4">
                          Try searching for lamps, powerbanks, iron, or car perfume
                        </p>
                        <Link
                          href="/products"
                          onClick={closeSearch}
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FA521C] text-white text-xs font-semibold shadow-sm hover:bg-[#E04515] transition-all"
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
                            className="flex items-center gap-3 p-2.5 rounded-2xl bg-gray-50/70 hover:bg-orange-50/50 border border-gray-100 hover:border-[#FA521C]/30 transition-all group"
                          >
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-gray-100">
                              <Image
                                src={product.poster_image}
                                alt={product.name}
                                fill
                                sizes="56px"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FA521C] block">
                                {product.category}
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#FA521C] transition-colors truncate">
                                {product.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-extrabold text-[#111111]">
                                  ₹{product.price.toLocaleString("en-IN")}
                                </span>
                                {product.rating && (
                                  <span className="text-[10px] font-semibold text-gray-500 flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                    {product.rating.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#FA521C] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* 2. COLLECTIONS (Visual Cards exactly like Reference Website!) */}
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#FA521C]" />
                          COLLECTIONS
                        </span>
                        <Link
                          href="/products"
                          onClick={closeSearch}
                          className="text-xs font-bold text-[#FA521C] hover:underline flex items-center gap-0.5"
                        >
                          <span>Explore All</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {/* Collections Cards Container */}
                      <div className="bg-gray-50/80 rounded-2xl p-2.5 sm:p-3.5 border border-gray-100">
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5">
                          {COLLECTIONS.map((col, idx) => (
                            <motion.div
                              key={col.title}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.04, duration: 0.2 }}
                            >
                              <Link
                                href={col.href}
                                onClick={closeSearch}
                                className="group flex flex-col items-center p-2 rounded-xl bg-white border border-gray-100 hover:border-[#FA521C]/50 hover:shadow-md transition-all text-center h-full"
                              >
                                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                                  <Image
                                    src={col.image}
                                    alt={col.title}
                                    fill
                                    sizes="(max-width: 768px) 30vw, 15vw"
                                    className="object-cover group-hover:scale-108 transition-transform duration-500"
                                  />
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-bold text-gray-900 tracking-tight group-hover:text-[#FA521C] transition-colors truncate w-full uppercase">
                                  {col.title}
                                </span>
                                <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase mt-0.5 group-hover:text-[#FA521C] transition-colors">
                                  {col.subtitle}
                                </span>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 3. Popular Searches */}
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 flex items-center gap-1.5 mb-2.5">
                        <TrendingUp className="w-3.5 h-3.5 text-[#FA521C]" />
                        POPULAR SEARCHES
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR_SEARCHES.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagClick(tag)}
                            className="px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-orange-50 hover:text-[#FA521C] hover:border-[#FA521C]/30 border border-transparent text-xs font-semibold text-gray-700 transition-all cursor-pointer"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
