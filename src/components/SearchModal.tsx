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
    title: "GYM SUPPLEMENTARIES",
    subtitle: "WHEY, CREATINE & PRE-WORKOUT",
    image: "/vl-logo-nobg.png",
    href: "/products?category=Gym+Supplementaries",
  },
  {
    title: "OUTFITS & ATHLEISURE",
    subtitle: "PERFORMANCE FIT",
    image: "/vl-logo-nobg.png",
    href: "/products?category=Outfits",
  },
  {
    title: "APPARELS",
    subtitle: "STREETWEAR & ACTIVEWEAR",
    image: "/vl-logo-nobg.png",
    href: "/products?category=Apparels",
  },
  {
    title: "DATES & NUTS",
    subtitle: "EXOTIC & SUPERFOODS",
    image: "/vl-logo-nobg.png",
    href: "/products?category=Dates+%26+Nuts",
  },
  {
    title: "CANDY & CHOCOLATES",
    subtitle: "HANDCRAFTED & GOURMET",
    image: "/vl-logo-nobg.png",
    href: "/products?category=Candy+%26+Chocolates",
  },
];

const POPULAR_SEARCHES = [
  "Whey Protein Isolate",
  "Creatine Monohydrate",
  "Athletic Gym Outfits",
  "Compression T-Shirt",
  "Ajwa Dates",
  "Roasted Almonds & Cashews",
  "Dark Chocolate Bars",
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

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Animated Dropdown Search Container */}
          <motion.div
            data-lenis-prevent
            initial={{ opacity: 0, y: -25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative z-10 w-full max-w-4xl mx-auto px-3 sm:px-4 pt-3 sm:pt-6"
          >
            <div className="bg-[#141416] rounded-3xl shadow-2xl border border-white/10 text-white overflow-hidden flex flex-col min-h-0 max-h-[85vh] font-mograph">
              {/* Search Bar Header */}
              <div className="p-3.5 sm:p-5 border-b border-white/10 shrink-0 bg-[#18181B]">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center gap-2 sm:gap-3"
                >
                  <div className="relative flex-1 flex items-center">
                    <Search className="absolute left-4 w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37] pointer-events-none stroke-[2.2]" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Gym Supplements, Outfits, Dates, Chocolates..."
                      className="w-full pl-11 sm:pl-12 pr-10 py-3 sm:py-3.5 rounded-2xl bg-[#202024] border border-white/10 text-sm sm:text-base text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all font-medium"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3.5 p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
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
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer"
                    aria-label="Close search"
                  >
                    <X className="w-5 h-5 stroke-[2.2]" />
                  </button>
                </form>
              </div>

              {/* Scrollable Body: Collections or Live Search Results */}
              <div data-lenis-prevent className="overflow-y-auto flex-1 min-h-0 overscroll-contain p-4 sm:p-6 scrollbar-thin space-y-6" style={{ WebkitOverflowScrolling: "touch" }}>
                {/* 1. Live Search Results (when typing) */}
                {searchQuery.trim().length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        Search Results ({liveResults.length})
                      </span>
                      {liveResults.length > 0 && (
                        <button
                          onClick={handleSearchSubmit}
                          className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>View all</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {liveResults.length === 0 ? (
                      <div className="py-10 text-center">
                        <div className="w-12 h-12 rounded-full bg-white/5 text-[#D4AF37] flex items-center justify-center mx-auto mb-3">
                          <Search className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-white mb-1">
                          No matching products found
                        </p>
                        <p className="text-xs text-neutral-400 mb-4">
                          Try searching for whey protein, creatine, gym sets, dates, or dark chocolate
                        </p>
                        <Link
                          href="/products"
                          onClick={closeSearch}
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] text-black text-xs font-bold shadow-sm hover:bg-[#C8A261] transition-all"
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
                            className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#1C1C20] hover:bg-[#25252A] border border-white/5 hover:border-[#D4AF37]/40 transition-all group"
                          >
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-900 flex-shrink-0 border border-white/10">
                              <Image
                                src={product.poster_image}
                                alt={product.name}
                                fill
                                sizes="56px"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] block">
                                {product.category}
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors truncate">
                                {product.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-extrabold text-white">
                                  ₹{product.price.toLocaleString("en-IN")}
                                </span>
                                {product.rating && (
                                  <span className="text-[10px] font-semibold text-neutral-400 flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-[#D4AF37] text-[#D4AF37]" />
                                    {product.rating.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* 2. COLLECTIONS */}
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                          COLLECTIONS
                        </span>
                        <Link
                          href="/products"
                          onClick={closeSearch}
                          className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-0.5"
                        >
                          <span>Explore All</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {/* Collections Cards Container */}
                      <div className="bg-[#18181B] rounded-2xl p-2 sm:p-3.5 border border-white/5 overflow-hidden">
                        <div className="flex sm:grid sm:grid-cols-5 gap-2 sm:gap-2.5 overflow-x-auto sm:overflow-x-visible pb-1 sm:pb-0 scrollbar-none snap-x snap-mandatory -mx-1 px-1">
                          {COLLECTIONS.map((col, idx) => (
                            <motion.div
                              key={col.title}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.04, duration: 0.2 }}
                              className="w-[120px] min-w-[120px] sm:w-auto sm:min-w-0 flex-shrink-0 snap-start"
                            >
                              <Link
                                href={col.href}
                                onClick={closeSearch}
                                className="group flex flex-col items-center p-2.5 rounded-xl bg-[#202024] border border-white/5 hover:border-[#D4AF37] hover:shadow-md transition-all text-center h-full active:scale-95"
                              >
                                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-neutral-900 mb-1.5 p-1 flex items-center justify-center">
                                  <Image
                                    src={col.image}
                                    alt={col.title}
                                    fill
                                    sizes="(max-width: 768px) 120px, 15vw"
                                    className="object-contain p-1 group-hover:scale-110 transition-transform duration-500"
                                  />
                                </div>
                                <span className="text-[10px] sm:text-[10.5px] font-bold text-white tracking-tight group-hover:text-[#D4AF37] transition-colors text-center uppercase leading-tight line-clamp-2 min-h-[26px] flex items-center justify-center">
                                  {col.title}
                                </span>
                                <span className="text-[8.5px] sm:text-[9px] font-bold text-neutral-400 tracking-wider uppercase mt-0.5 group-hover:text-[#D4AF37] transition-colors">
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
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5 mb-2.5">
                        <TrendingUp className="w-3.5 h-3.5 text-[#D4AF37]" />
                        POPULAR SEARCHES
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR_SEARCHES.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagClick(tag)}
                            className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] border border-white/10 hover:border-[#D4AF37]/40 text-xs font-semibold text-neutral-300 transition-all cursor-pointer"
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
