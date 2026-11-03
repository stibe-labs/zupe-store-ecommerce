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
  Laptop,
  Smartphone,
  Watch,
  Headphones,
  Gamepad2,
  Tablet,
  Plug,
  Camera,
  Layers,
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
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { getClientProducts } from "@/lib/productsClientCache";
import { useWishlist } from "@/context/WishlistContext";
import { launchFastrrCheckout } from "@/lib/fastrrClient";

const EXPLORE_CATEGORIES = [
  { id: "All", name: "All Products", icon: Layers, query: "All" },
  { id: "Smartphones", name: "Smartphones", icon: Smartphone, query: "Smartphones" },
  { id: "Laptops", name: "Laptops & PCs", icon: Laptop, query: "Laptops" },
  { id: "Headphones & Earbuds", name: "Audio & Sound", icon: Headphones, query: "Headphones & Earbuds" },
  { id: "Smartwatches", name: "Smartwatches", icon: Watch, query: "Smartwatches" },
  { id: "Gaming & Accessories", name: "Gaming Gear", icon: Gamepad2, query: "Gaming & Accessories" },
  { id: "Tablets", name: "Tablets", icon: Tablet, query: "Tablets" },
  { id: "Smart Gadgets", name: "Accessories", icon: Plug, query: "Smart Gadgets" },
];

const SORT_OPTIONS: {
  value: "featured" | "price-asc" | "price-desc" | "rating";
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "featured",
    label: "Featured & Curated",
    icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
  },
  {
    value: "price-asc",
    label: "Price: Low to High",
    icon: <ArrowUp className="w-3.5 h-3.5 text-emerald-600" />,
  },
  {
    value: "price-desc",
    label: "Price: High to Low",
    icon: <ArrowDown className="w-3.5 h-3.5 text-blue-600" />,
  },
  {
    value: "rating",
    label: "Highest Customer Rating",
    icon: <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />,
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
  const [maxPrice, setMaxPrice] = useState<number>(100000);
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

  const handleBuyNow = (product: Product) => {
    addItem(product, 1);
    try {
      launchFastrrCheckout([
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.poster_image,
        },
      ]);
    } catch {
      router.push(`/checkout?productId=${product.id}&qty=1`);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const currentSortOption = SORT_OPTIONS.find((o) => o.value === sortBy) || SORT_OPTIONS[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans">
      <Navbar />

      {/* ===================================================================== */}
      {/* HERO BANNER: Royal Navy with Radiant Studio Glow                       */}
      {/* ===================================================================== */}
      <div className="pt-28 sm:pt-32 pb-8 sm:pb-12 bg-gradient-to-r from-[#0A2540] via-[#0F172A] to-[#0A2540] text-white border-b border-slate-800 relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-[#FFBE00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
            <Link href="/" className="hover:text-white transition-colors font-medium">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[#FFBE00] font-bold">Explore All Products</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#FFBE00]" />
                <span>Dubai Sourced • 1-Year Pan-India Warranty</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Explore All Products
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-medium leading-relaxed">
                Discover genuine Apple, Samsung, Lenovo, HP, boAt, Sony & JBL electronics directly imported from Dubai with express delivery across India.
              </p>
            </div>

            {/* Fast Search Input */}
            <div className="w-full md:w-80 lg:w-96 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search gadgets, phones, laptops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder:text-slate-400 border border-white/20 focus:border-white text-xs sm:text-sm font-medium transition-all focus:outline-none shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
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
      <div className="bg-white border-b border-slate-200/90 sticky top-16 sm:top-20 z-20 shadow-xs">
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
                      ? "bg-[#0A2540] text-white shadow-sm scale-[1.02]"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[#FFBE00]" : "text-slate-500"}`} />
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
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Controls Bar: Result Count & Sort Options */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="text-xs sm:text-sm font-bold text-slate-600">
            Showing <span className="text-slate-900 font-black">{filteredProducts.length}</span> {filteredProducts.length === 1 ? "device" : "devices"}
            {selectedCategory !== "All" && (
              <span className="ml-1 text-slate-500 font-medium">in &ldquo;{selectedCategory}&rdquo;</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Mobile Filters Trigger */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-xs hover:bg-slate-50 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>Filters</span>
            </button>

            {/* Custom Sort Dropdown */}
            <div ref={sortDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-900 shadow-xs cursor-pointer transition-colors"
              >
                {currentSortOption.icon}
                <span className="hidden sm:inline text-slate-400 font-normal">Sort:</span>
                <span>{currentSortOption.label}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${sortDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {sortDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200/90 p-1.5 z-40"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortBy(opt.value);
                          setSortDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                          sortBy === opt.value
                            ? "bg-slate-100 text-blue-600"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {opt.icon}
                          <span>{opt.label}</span>
                        </div>
                        {sortBy === opt.value && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* ================================================================= */}
          {/* DESKTOP SIDEBAR FILTERS                                           */}
          {/* ================================================================= */}
          <aside className="hidden lg:block lg:col-span-1 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs sticky top-36 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                Filters
              </span>
              {(selectedCategory !== "All" || searchQuery || maxPrice < 100000 || onlyInStock) && (
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                    setMaxPrice(100000);
                    setOnlyInStock(false);
                    router.push("/products");
                  }}
                  className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              )}
            </div>

            {/* Price Filter Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800">Max Budget</label>
                <span className="text-xs font-black text-slate-900 font-mono">
                  ₹{maxPrice.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min={1000}
                max={100000}
                step={2000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#0A2540] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                <span>₹1,000</span>
                <span>₹1,00,000+</span>
              </div>
            </div>

            {/* In-Stock Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-[#0A2540] cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  In-Stock Items Only
                </span>
              </label>
            </div>

            {/* Categories List in Sidebar */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider">
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
                          ? "bg-blue-50 text-blue-900 font-black border border-blue-200/60"
                          : "text-slate-600 hover:bg-slate-50 font-medium"
                      }`}
                    >
                      <span>{cat.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trust Warranty Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-center space-y-1">
              <ShieldCheck className="w-5 h-5 text-blue-700 mx-auto mb-1" />
              <p className="text-xs font-black text-slate-900">100% Genuine Electronics</p>
              <p className="text-[11px] text-slate-500 leading-snug">
                Every unit is sealed with manufacturer serial verification & 1-year brand warranty.
              </p>
            </div>
          </aside>

          {/* ================================================================= */}
          {/* PRODUCT CARDS GRID                                                */}
          {/* ================================================================= */}
          <main className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1">
                  No devices found
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                  Try adjusting your budget slider, clear search keywords, or select a different department.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                    setMaxPrice(100000);
                    setOnlyInStock(false);
                    router.push("/products");
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#FFBE00] hover:bg-[#E5AA00] text-slate-950 text-xs font-black transition-all shadow-sm cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5">
                {filteredProducts.map((product) => {
                  const wishlisted = isInWishlist(product.id);
                  const discount =
                    product.mrp && product.price < product.mrp
                      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                      : 0;

                  return (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative"
                    >
                      {/* Product Image Frame */}
                      <div className="relative aspect-square bg-slate-50/80 p-3 flex items-center justify-center">
                        {discount > 0 && (
                          <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md bg-[#EF4444] text-white text-[10px] font-black uppercase shadow-xs">
                            -{discount}% OFF
                          </span>
                        )}

                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => handleToggleWishlist(e, product)}
                          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full z-10 transition-colors shadow-xs ${
                            wishlisted
                              ? "bg-rose-50 text-rose-500 border border-rose-200"
                              : "bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white border border-slate-200"
                          }`}
                          aria-label="Wishlist"
                        >
                          <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-rose-500" : ""}`} />
                        </button>

                        <Link
                          href={`/products/${product.slug || product.id}`}
                          className="block w-full h-full relative"
                        >
                          <Image
                            src={product.poster_image}
                            alt={product.name}
                            fill
                            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 240px"
                          />
                        </Link>
                      </div>

                      {/* Details & Actions */}
                      <div className="p-4 flex flex-col flex-1 justify-between">
                        <div>
                          <div className="flex items-center gap-1 mb-1.5">
                            <Star className="w-3.5 h-3.5 fill-[#FFBE00] text-[#FFBE00]" />
                            <span className="text-xs font-bold text-slate-800">
                              {product.rating || 4.8}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              ({product.review_count || 120})
                            </span>
                          </div>

                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            {product.category || "Electronics"}
                          </span>

                          <Link href={`/products/${product.slug || product.id}`}>
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2 min-h-[34px]">
                              {product.name}
                            </h3>
                          </Link>
                        </div>

                        <div>
                          <div className="flex items-baseline gap-1.5 mb-3 pt-2 border-t border-slate-100">
                            <span className="text-base font-black text-slate-900">
                              ₹{product.price.toLocaleString("en-IN")}
                            </span>
                            {product.mrp && product.mrp > product.price && (
                              <span className="text-xs text-slate-400 line-through">
                                ₹{product.mrp.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="flex-1 py-2 rounded-xl bg-[#FFBE00] hover:bg-[#E5AA00] active:bg-[#CC9600] text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                            >
                              <ShoppingCart className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Add</span>
                            </button>
                            <button
                              onClick={() => handleBuyNow(product)}
                              className="flex-1 py-2 rounded-xl bg-[#002D62] hover:bg-blue-900 active:bg-blue-950 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                            >
                              Buy Now
                            </button>
                          </div>
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
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 lg:hidden"
              onClick={() => setMobileFilterOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl p-6 z-50 lg:hidden max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-black text-lg text-slate-900">Filter Products</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Price Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">Max Budget</label>
                  <span className="text-xs font-black text-slate-900 font-mono">
                    ₹{maxPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={100000}
                  step={2000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#0A2540]"
                />
              </div>

              {/* In-Stock Toggle */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-[#0A2540]"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    In-Stock Items Only
                  </span>
                </label>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider">
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
                        className={`p-2.5 rounded-xl text-xs font-bold text-left transition-colors ${
                          isSelected
                            ? "bg-[#0A2540] text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
                className="w-full py-3.5 bg-[#FFBE00] hover:bg-[#E5AA00] text-slate-950 font-black text-sm rounded-xl shadow-md"
              >
                Apply Filters ({filteredProducts.length} devices)
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#0A2540] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-slate-700">Loading catalog...</p>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
