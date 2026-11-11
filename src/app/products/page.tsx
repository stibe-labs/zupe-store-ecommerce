"use client";

import React, { useState, useMemo, useEffect, Suspense, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  ShoppingCart,
  Heart,
  Star,
  Search,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Tag,
  X,
  Layers,
  Dumbbell,
  Shirt,
  Apple,
  Cookie,
  Check,
  RotateCcw,
  ShieldCheck,
  Truck,
  Package,
  Award,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DEFAULT_PRODUCTS, doesCategoryMatch } from "@/data/zupeProducts";
import { addRecentlyViewed } from "@/lib/recentlyViewed";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { getClientProducts } from "@/lib/productsClientCache";
import { useWishlist } from "@/context/WishlistContext";
import { launchFastrrCheckout } from "@/lib/fastrrClient";

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
    icon: <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />,
  },
  {
    value: "price-asc",
    label: "Price: Low to High",
    icon: <ArrowUp className="w-3.5 h-3.5 text-[#D4A373]" />,
  },
  {
    value: "price-desc",
    label: "Price: High to Low",
    icon: <ArrowDown className="w-3.5 h-3.5 text-[#D4A373]" />,
  },
  {
    value: "rating",
    label: "Highest Customer Rating",
    icon: <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />,
  },
];

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
    const params = new URLSearchParams(searchParams.toString());
    if (catQuery === "All") {
      params.delete("category");
    } else {
      params.set("category", catQuery);
    }
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products
      .filter((product) => {
        // Category filter
        if (selectedCategory && selectedCategory !== "All") {
          const match = doesCategoryMatch(product.category || "", selectedCategory);
          const subMatch = product.subcategory
            ? doesCategoryMatch(product.subcategory, selectedCategory)
            : false;
          if (!match && !subMatch) return false;
        }

        // Search filter
        if (query) {
          const name = (product.name || "").toLowerCase();
          const desc = (product.description || "").toLowerCase();
          const cat = (product.category || "").toLowerCase();
          const subcat = (product.subcategory || "").toLowerCase();
          const matches =
            name.includes(query) ||
            desc.includes(query) ||
            cat.includes(query) ||
            subcat.includes(query);
          if (!matches) return false;
        }

        // Price filter
        if (product.price > maxPrice) {
          return false;
        }

        // In-stock filter
        if (onlyInStock) {
          if (product.in_stock === 0 || (product.stock_count !== undefined && product.stock_count <= 0)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return (b.rating || 4.5) - (a.rating || 4.5);
        return 0; // featured default
      });
  }, [products, selectedCategory, searchQuery, maxPrice, onlyInStock, sortBy]);

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
    <div className="min-h-screen bg-[#070708] text-white flex flex-col justify-between selection:bg-[#D4A373] selection:text-black font-mograph">
      <Navbar />

      {/* ===================================================================== */}
      {/* HERO BANNER: Deep Obsidian with Ambient Gold Studio Lighting          */}
      {/* ===================================================================== */}
      <div className="pt-24 sm:pt-28 pb-8 sm:pb-12 bg-gradient-to-b from-[#0e0e11] via-[#09090b] to-[#070708] text-white border-b border-white/10 relative overflow-hidden">
        {/* Ambient Radial Lighting Glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-[#D4A373]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-3">
            <Link href="/" className="hover:text-[#D4A373] transition-colors font-medium">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
            <span className="text-[#D4AF37] font-bold">Shop All Products</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#272015] border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-2 font-movault">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>DIRECT CURATION • 100% PURE &amp; AUTHENTIC</span>
              </div>
              <h1 className="font-movault text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-wider text-white">
                Shop The Collection
              </h1>
              <p className="font-mograph text-xs sm:text-sm text-neutral-300 mt-1 max-w-xl font-medium leading-relaxed">
                Discover lab-tested Gym Supplements, high-mobility Outfits, heavyweight Apparels, Royal Dates &amp; Handcrafted Chocolates.
              </p>
            </div>

            {/* Fast Search Input */}
            <div className="w-full md:w-80 lg:w-96 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search protein, gym wear, dates, chocolates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#141416] hover:bg-[#18181c] focus:bg-[#18181c] text-white placeholder:text-neutral-500 border border-white/15 focus:border-[#D4AF37]/80 text-xs sm:text-sm font-medium transition-all focus:outline-none shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
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
      {/* HORIZONTAL CATEGORY CAPSULE BAR                                       */}
      {/* ===================================================================== */}
      <div className="bg-[#0B0B0C]/95 backdrop-blur-md border-b border-white/10 sticky top-16 sm:top-20 z-20 shadow-md">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            {EXPLORE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected =
                selectedCategory === cat.query ||
                (cat.query === "All" && (!selectedCategory || selectedCategory === "All"));

              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.query)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-[#D4A373] text-black shadow-md scale-[1.02] font-movault uppercase tracking-wider"
                      : "bg-[#141416] hover:bg-[#1c1c20] text-neutral-300 border border-white/10"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-black" : "text-[#D4AF37]"}`} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MAIN CATALOG WORKSPACE: Sidebar Filters + Products Grid               */}
      {/* ===================================================================== */}
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 w-full">
        {/* Controls Bar: Result Count & Sort Options */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="text-xs sm:text-sm font-semibold text-neutral-400">
            Showing <span className="text-white font-extrabold">{filteredProducts.length}</span> {filteredProducts.length === 1 ? "product" : "products"}
            {selectedCategory !== "All" && (
              <span className="ml-1 text-[#D4AF37] font-medium">in &ldquo;{selectedCategory}&rdquo;</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Mobile Filters Trigger */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 bg-[#141416] border border-white/10 rounded-xl text-xs font-bold text-white shadow-sm hover:bg-[#1a1a1d] cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Filters</span>
            </button>

            {/* Custom Sort Dropdown */}
            <div ref={sortDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-2 bg-[#141416] border border-white/10 hover:border-white/20 rounded-xl text-xs font-bold text-white shadow-sm cursor-pointer transition-colors"
              >
                {currentSortOption.icon}
                <span className="hidden sm:inline text-neutral-400 font-normal">Sort:</span>
                <span>{currentSortOption.label}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${sortDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {sortDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute right-0 top-full mt-1.5 w-56 bg-[#141416] rounded-xl shadow-2xl border border-white/15 p-1.5 z-40 text-white"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortBy(opt.value);
                          setSortDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          sortBy === opt.value
                            ? "bg-[#272015] text-[#D4AF37] border border-[#D4AF37]/30"
                            : "text-neutral-300 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {opt.icon}
                          <span>{opt.label}</span>
                        </div>
                        {sortBy === opt.value && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 xl:gap-8 items-start">
          {/* ================================================================= */}
          {/* DESKTOP SIDEBAR FILTERS                                           */}
          {/* ================================================================= */}
          <aside className="hidden lg:block lg:col-span-1 bg-[#141416] border border-white/10 rounded-2xl p-5 shadow-lg sticky top-36 space-y-6 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 font-movault">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#D4AF37]" />
                Filters
              </span>
              {(selectedCategory !== "All" || searchQuery || maxPrice < 10000 || onlyInStock) && (
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                    setMaxPrice(10000);
                    setOnlyInStock(false);
                    router.push("/products");
                  }}
                  className="text-[11px] font-bold text-[#D4A373] hover:underline flex items-center gap-0.5 cursor-pointer font-movault tracking-wide"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              )}
            </div>

            {/* Price Filter Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-neutral-300 uppercase font-movault tracking-wide">Max Budget</label>
                <span className="text-xs font-black text-[#D4AF37] font-mono">
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
                className="w-full accent-[#D4A373] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-medium mt-1">
                <span>₹500</span>
                <span>₹10,000+</span>
              </div>
            </div>

            {/* In-Stock Toggle */}
            <div className="pt-3 border-t border-white/10">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 text-[#D4AF37] accent-[#D4A373] cursor-pointer"
                />
                <span className="text-xs font-semibold text-neutral-200">
                  In-Stock Items Only
                </span>
              </label>
            </div>

            {/* Categories List in Sidebar */}
            <div className="pt-4 border-t border-white/10">
              <label className="block text-xs font-bold text-neutral-300 mb-2 uppercase tracking-wider font-movault">
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
                          ? "bg-[#272015] text-[#D4AF37] font-bold border border-[#D4AF37]/40 shadow-xs"
                          : "text-neutral-400 hover:text-white hover:bg-white/5 font-medium"
                      }`}
                    >
                      <span>{cat.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trust Certification Card */}
            <div className="p-4 rounded-xl bg-[#1a1a1d] border border-white/10 text-center space-y-1.5 shadow-xs">
              <Award className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
              <p className="text-xs font-bold text-white uppercase font-movault tracking-wider">100% Lab Tested &amp; Pure</p>
              <p className="text-[11px] text-neutral-400 leading-snug font-normal">
                Direct brand sourcing with verified purity, authentic nutrition, and express pan-India insured shipping.
              </p>
            </div>
          </aside>

          {/* ================================================================= */}
          {/* PRODUCT CARDS GRID (Mobile 2 per row, Desktop 3-4 per row)        */}
          {/* ================================================================= */}
          <main className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-[#141416] rounded-2xl border border-white/10 p-12 text-center shadow-lg text-white">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-[#D4AF37]">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1 uppercase font-movault">
                  No products found
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 mb-6 max-w-sm mx-auto">
                  Try adjusting your budget slider, clearing search keywords, or selecting a different department.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                    setMaxPrice(10000);
                    setOnlyInStock(false);
                    router.push("/products");
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#D4A373] hover:bg-[#c29263] text-black text-xs font-bold transition-all shadow-md cursor-pointer uppercase font-movault tracking-wider"
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
                    (product as any).subcategory ||
                    (product.category === "Gym Supplementaries"
                      ? (product.name.toLowerCase().includes("creatine") ? "Creatine" : product.name.toLowerCase().includes("gainer") ? "Mass Gainer" : "Isolate")
                      : product.category === "Dates & Nuts"
                      ? (product.name.toLowerCase().includes("almond") ? "Almonds" : "Dates")
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
                      className="group relative rounded-2xl bg-[#141416] hover:bg-[#18181C] border border-white/5 hover:border-white/15 p-3 sm:p-4 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      {/* Wishlist Heart Icon (Top-right clean outline) */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleWishlist(e, product)}
                        className="absolute top-3 right-3 z-10 text-neutral-400 hover:text-white transition-colors p-1"
                        aria-label="Wishlist"
                      >
                        <Heart
                          className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                            wishlisted ? "fill-rose-500 text-rose-500" : "stroke-current"
                          }`}
                        />
                      </button>

                      {/* Product Poster Image (Transparent cutout floating seamlessly on card background) */}
                      <Link
                        href={`/products/${product.id || product.slug}`}
                        className="relative w-full aspect-square flex items-center justify-center my-1"
                      >
                        <Image
                          src={product.poster_image || "/vittal/product-whey-protein-jar.png"}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Product Metadata */}
                      <div className="mt-1">
                        <Link href={`/products/${product.id || product.slug}`} className="block">
                          <h3 className="font-mograph text-xs sm:text-sm font-semibold text-white group-hover:text-[#D4AF37] transition-colors leading-snug line-clamp-2 min-h-[34px] sm:min-h-[38px] mb-0.5">
                            {product.name}
                          </h3>
                        </Link>

                        <p className="font-mograph text-[10px] sm:text-xs text-neutral-400 font-medium mb-1.5 truncate">
                          {shortCategory}
                        </p>

                        {/* Price Row */}
                        <div className="flex items-baseline gap-1.5 mb-1.5">
                          <span className="font-mograph text-sm sm:text-base font-extrabold text-white">
                            ₹{product.price.toLocaleString("en-IN")}
                          </span>
                          {product.mrp && product.mrp > product.price && (
                            <span className="font-mograph text-[11px] sm:text-xs text-neutral-500 line-through">
                              ₹{product.mrp.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>

                        {/* Discount Badge & Add to Cart Button */}
                        <div className="flex items-center justify-between gap-2 mt-1">
                          {discountPercent ? (
                            <span className="font-movault bg-[#2B2317] text-[#E5C07B] text-[10px] sm:text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded inline-block">
                              {discountPercent}% OFF
                            </span>
                          ) : (
                            <span className="font-mograph text-[10px] text-neutral-400">In Stock</span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            className="w-8 h-8 rounded-lg bg-[#222226] hover:bg-[#D4A373] text-white hover:text-black flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0"
                            aria-label="Add to cart"
                            title="Add to cart"
                          >
                            <ShoppingCart className="w-4 h-4 stroke-[2]" />
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
      {/* MOBILE FILTER MODAL                                                   */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 lg:hidden"
              onClick={() => setMobileFilterOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="fixed inset-x-0 bottom-0 bg-[#141416] border-t border-white/10 text-white rounded-t-3xl p-6 z-50 lg:hidden max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-bold text-lg text-white font-movault uppercase tracking-wider">Filter Products</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-full text-neutral-400 hover:text-white"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Price Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-neutral-300 uppercase font-movault tracking-wide">Max Budget</label>
                  <span className="text-xs font-black text-[#D4AF37] font-mono">
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
                  className="w-full accent-[#D4A373]"
                />
              </div>

              {/* In-Stock Toggle */}
              <div>
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 text-[#D4AF37] accent-[#D4A373]"
                  />
                  <span className="text-xs font-semibold text-neutral-200">
                    In-Stock Items Only
                  </span>
                </label>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-2 uppercase tracking-wider font-movault">
                  Departments
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {EXPLORE_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.query;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          handleCategorySelect(cat.query);
                          setMobileFilterOpen(false);
                        }}
                        className={`p-2.5 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#D4A373] text-black"
                            : "bg-[#222226] text-neutral-300 hover:bg-[#2a2a30]"
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3.5 bg-[#D4A373] hover:bg-[#c29263] text-black font-bold text-sm rounded-xl shadow-lg uppercase font-movault tracking-wider transition-all"
              >
                Apply Filters ({filteredProducts.length} products)
              </button>
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
        <div className="min-h-screen bg-[#070708] text-white flex items-center justify-center font-mograph">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-neutral-300 font-movault uppercase tracking-wider">Loading catalog...</p>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
