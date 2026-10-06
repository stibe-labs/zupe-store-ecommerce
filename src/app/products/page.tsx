"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Flame,
  Tag,
  X,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DEFAULT_PRODUCTS, PRODUCT_CATEGORIES } from "@/data/zupeProducts";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || searchParams.get("q") || "";
  const initialFilter = searchParams.get("filter") || "";

  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeFilter, setActiveFilter] = useState<string>(initialFilter);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = React.useRef<HTMLDivElement>(null);
  const [maxPrice, setMaxPrice] = useState<number>(6000);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const { addToCart, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Close custom sort dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Fetch updated catalog if available from API
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      } catch (err) {
        console.warn("Could not fetch fresh products:", err);
      }
    }
    fetchProducts();
  }, []);

  // Synchronize state whenever URL query params change
  useEffect(() => {
    const cat = searchParams.get("category");
    setSelectedCategory(cat || "All");

    const q = searchParams.get("search") || searchParams.get("q");
    setSearchQuery(q || "");

    const f = searchParams.get("filter");
    setActiveFilter(f || "");
  }, [searchParams]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const queryTokens = query ? query.split(/\s+/).filter(Boolean) : [];
    const filterLower = activeFilter.toLowerCase();

    return products
      .filter((product) => {
        // Active Filter (New Arrivals, Best Sellers, Offers / Deals)
        if (filterLower === "new") {
          const isMarkedNew =
            product.badge?.toLowerCase() === "new" ||
            (product as any).is_new === true;
          const isNewArrivalItem =
            [
              "mini-thermal-printer",
              "tf20-multipurpose-powerbank",
              "helicopter-car-perfume",
              "instant-water-heater-faucet",
              "mini-hot-air-popcorn-maker",
            ].includes(product.id) ||
            [
              "mini-thermal-printer",
              "tf20-multipurpose-powerbank",
              "helicopter-car-perfume",
              "instant-water-heater-faucet",
              "mini-hot-air-popcorn-maker",
            ].includes(product.slug || "");
          if (!isMarkedNew && !isNewArrivalItem) return false;
        } else if (filterLower === "best") {
          const isTrendingOrBest =
            product.badge?.toLowerCase() === "trending" ||
            product.badge?.toLowerCase() === "bestseller" ||
            (product.rating && product.rating >= 4.7) ||
            (product.review_count && product.review_count >= 200);
          if (!isTrendingOrBest) return false;
        } else if (filterLower === "offers" || filterLower === "deals") {
          const isSale =
            product.badge?.toLowerCase() === "sale" ||
            (product.mrp && product.price && product.mrp > product.price) ||
            (product.mrp && product.offer_price && product.mrp > product.offer_price);
          if (!isSale) return false;
        }

        // Category filter
        if (selectedCategory !== "All" && product.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }

        // Multi-keyword token search matching across name, tagline, description, category, and badge
        if (queryTokens.length > 0) {
          const searchable = `${product.name} ${product.tagline} ${product.description} ${product.category} ${product.badge || ""}`.toLowerCase();
          const matchesAllTokens = queryTokens.every((token) => searchable.includes(token));
          if (!matchesAllTokens) return false;
        }

        // Price filter
        if (product.price > maxPrice) return false;

        // In stock filter
        if (onlyInStock && product.stock_count <= 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        return 0; // featured / default
      });
  }, [products, activeFilter, selectedCategory, searchQuery, sortBy, maxPrice, onlyInStock]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    const params = new URLSearchParams();
    if (cat !== "All") params.set("category", cat);
    if (activeFilter) params.set("filter", activeFilter);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    const queryStr = params.toString();
    router.push(`/products${queryStr ? `?${queryStr}` : ""}`, { scroll: false });
  };

  const handleClearActiveFilter = () => {
    setActiveFilter("");
    const params = new URLSearchParams();
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    const queryStr = params.toString();
    router.push(`/products${queryStr ? `?${queryStr}` : ""}`, { scroll: false });
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      try {
        localStorage.setItem(
          "zp_pending_cart_action",
          JSON.stringify({ action: "add_to_cart", product, quantity: 1, autoOpenCart: true })
        );
      } catch (e) {}
      router.push(
        `/signin?redirect=/products&notice=${encodeURIComponent(
          "Please sign in to add items to your cart"
        )}`
      );
      return;
    }
    const success = addToCart(product, 1);
    if (success) openCart();
  };

  const handleToggleWishlist = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      try {
        localStorage.setItem(
          "zp_pending_wishlist_action",
          JSON.stringify({ action: "wishlist", product })
        );
      } catch (e) {}
      router.push(
        `/signin?redirect=/products&notice=${encodeURIComponent(
          "Please sign in to save items to your wishlist"
        )}`
      );
      return;
    }
    toggleWishlist(product);
  };

  const getBannerDetails = () => {
    const f = activeFilter.toLowerCase();
    if (f === "new") {
      return {
        badge: "Fresh Drops",
        icon: <Sparkles className="w-3.5 h-3.5 text-[#FA521C]" />,
        title: selectedCategory !== "All" ? `New Arrivals: ${selectedCategory}` : "New Arrivals",
        subtitle: "Be the first to explore our latest innovatively designed essentials",
        breadcrumb: "New Arrivals",
      };
    }
    if (f === "best") {
      return {
        badge: "Top Picks",
        icon: <Flame className="w-3.5 h-3.5 text-[#FA521C]" />,
        title: selectedCategory !== "All" ? `Best Sellers: ${selectedCategory}` : "Best Sellers",
        subtitle: "Our most popular, top-rated products loved by thousands of customers",
        breadcrumb: "Best Sellers",
      };
    }
    if (f === "offers" || f === "deals") {
      return {
        badge: "Limited Time Deals",
        icon: <Tag className="w-3.5 h-3.5 text-[#FA521C]" />,
        title: selectedCategory !== "All" ? `Special Deals: ${selectedCategory}` : "Special Offers & Deals",
        subtitle: "Save big on premium curated lifestyle products and daily essentials",
        breadcrumb: "Offers & Deals",
      };
    }
    if (selectedCategory !== "All") {
      return {
        badge: selectedCategory,
        icon: <Sparkles className="w-3.5 h-3.5 text-[#FA521C]" />,
        title: selectedCategory,
        subtitle: `Explore our handcrafted collection of ${selectedCategory}`,
        breadcrumb: selectedCategory,
      };
    }
    return {
      badge: "Curated Catalog",
      icon: <Sparkles className="w-3.5 h-3.5 text-[#FA521C]" />,
      title: "Explore All Products",
      subtitle: `Showing ${filteredProducts.length} handcrafted, minimalist designs`,
      breadcrumb: null,
    };
  };

  const banner = getBannerDetails();

  const SORT_OPTIONS: {
    value: "featured" | "price-asc" | "price-desc" | "rating";
    label: string;
    desc: string;
    icon: React.ReactNode;
    iconBg: string;
    activeIconBg: string;
  }[] = [
    {
      value: "featured",
      label: "Featured",
      desc: "Curated collection & top picks",
      icon: <Sparkles className="w-3.5 h-3.5 text-[#FA521C]" />,
      iconBg: "bg-orange-50 text-[#FA521C]",
      activeIconBg: "bg-[#FA521C] text-white",
    },
    {
      value: "price-asc",
      label: "Price: Low to High",
      desc: "Budget-friendly first",
      icon: <ArrowUp className="w-3.5 h-3.5 text-emerald-600" />,
      iconBg: "bg-emerald-50 text-emerald-600",
      activeIconBg: "bg-emerald-600 text-white",
    },
    {
      value: "price-desc",
      label: "Price: High to Low",
      desc: "Premium & luxury first",
      icon: <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />,
      iconBg: "bg-indigo-50 text-indigo-600",
      activeIconBg: "bg-indigo-600 text-white",
    },
    {
      value: "rating",
      label: "Highest Rated",
      desc: "Top customer reviews (4.5★+)",
      icon: <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />,
      iconBg: "bg-amber-50 text-amber-500",
      activeIconBg: "bg-amber-500 text-white",
    },
  ];

  const currentSortOption = SORT_OPTIONS.find((o) => o.value === sortBy) || SORT_OPTIONS[0];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#2D3436]">
      <Navbar />

      {/* Header Banner */}
      <div className="pt-28 pb-12 bg-gradient-to-b from-[#FA521C]/10 via-[#F8F9FA]/60 to-[#F8F9FA] border-b border-gray-100">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-[#636E72] mb-3">
            <Link href="/" className="hover:text-[#FA521C] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              href="/products"
              onClick={() => {
                setActiveFilter("");
                setSelectedCategory("All");
              }}
              className="hover:text-[#FA521C] transition-colors font-medium"
            >
              Shop
            </Link>
            {banner.breadcrumb && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-[#FA521C] font-semibold">{banner.breadcrumb}</span>
              </>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FA521C]/10 text-[#FA521C] mb-2">
                {banner.icon}
                <span>{banner.badge}</span>
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#2D3436]">
                {banner.title}
              </h1>
              <p className="text-sm text-[#636E72] mt-1">
                {banner.subtitle}
              </p>
            </div>

            {/* Search Input in Header */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FA521C]/30 focus:border-[#FA521C] shadow-sm transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
        {/* Active Filter Pill (if any) */}
        {activeFilter && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs font-semibold text-gray-500">Filter applied:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FA521C]/10 text-[#FA521C] border border-[#FA521C]/25 shadow-sm">
              {activeFilter.toLowerCase() === "new" && "✨ New Arrivals"}
              {activeFilter.toLowerCase() === "best" && "🔥 Best Sellers"}
              {(activeFilter.toLowerCase() === "offers" || activeFilter.toLowerCase() === "deals") && "⚡ Special Offers"}
              {!["new", "best", "offers", "deals"].includes(activeFilter.toLowerCase()) && activeFilter}
              <button
                onClick={handleClearActiveFilter}
                className="p-0.5 hover:bg-[#FA521C]/20 rounded-full transition-colors ml-1 cursor-pointer"
                title="Clear filter"
                aria-label="Clear filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
            <button
              onClick={handleClearActiveFilter}
              className="text-xs text-gray-500 hover:text-[#FA521C] font-semibold underline cursor-pointer ml-1"
            >
              Show all products
            </button>
          </div>
        )}

        {/* Category Pills & Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? "bg-[#FA521C] text-white shadow-md shadow-[#FA521C]/25"
                    : "bg-white text-[#636E72] hover:bg-gray-100 border border-gray-200/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort & Mobile Filter Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-[#2D3436] shadow-sm hover:bg-gray-50 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#FA521C]" />
              <span>Filters</span>
            </button>

            {/* Custom Premium Sort Dropdown */}
            <div ref={sortDropdownRef} className="relative ml-auto">
              <button
                type="button"
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                aria-expanded={sortDropdownOpen}
                aria-haspopup="listbox"
                className={`flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-white border rounded-2xl text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer ${
                  sortDropdownOpen
                    ? "border-[#FA521C] ring-2 ring-[#FA521C]/15 shadow-md text-[#111111]"
                    : "border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50/50"
                }`}
              >
                <div className="flex items-center justify-center w-5 h-5 rounded-md bg-orange-50 text-[#FA521C]">
                  {currentSortOption.icon}
                </div>
                <span className="text-gray-400 font-normal hidden sm:inline">Sort:</span>
                <span className="font-bold text-gray-900">{currentSortOption.label}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ml-0.5 ${
                    sortDropdownOpen ? "rotate-180 text-[#FA521C]" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {sortDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 p-1.5 z-50 origin-top-right backdrop-blur-sm"
                    role="listbox"
                  >
                    <div className="px-3 py-2 border-b border-gray-100/80 mb-1 flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">
                        Sort Products By
                      </span>
                      <span className="text-[10px] font-medium text-gray-400">
                        {filteredProducts.length} items
                      </span>
                    </div>

                    <div className="space-y-1">
                      {SORT_OPTIONS.map((opt) => {
                        const isSelected = sortBy === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setSortBy(opt.value);
                              setSortDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#FA521C]/10 text-gray-900 font-semibold"
                                : "hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                                isSelected ? opt.activeIconBg : opt.iconBg
                              }`}
                            >
                              {opt.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs sm:text-sm font-semibold truncate ${isSelected ? "text-[#FA521C]" : "text-gray-900"}`}>
                                {opt.label}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate">
                                {opt.desc}
                              </p>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-[#FA521C] text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-[#FA521C]/40">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6 sticky top-24">
              <div>
                <h3 className="font-display font-bold text-base text-[#2D3436] mb-3">
                  Price Range
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-[#636E72]">
                    <span>₹0</span>
                    <span className="text-[#FA521C]">Up to ₹{maxPrice.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="6000"
                    step="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    aria-label="Filter by maximum price"
                    className="w-full accent-[#FA521C] cursor-pointer"
                  />
                </div>
              </div>

              <hr className="border-gray-100" />

              <div>
                <h3 className="font-display font-bold text-base text-[#2D3436] mb-3">
                  Availability
                </h3>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FA521C] focus:ring-[#FA521C] accent-[#FA521C]"
                  />
                  <span className="text-xs font-medium text-[#2D3436]">
                    In-Stock Items Only
                  </span>
                </label>
              </div>

              <hr className="border-gray-100" />

              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FA521C]/10 to-[#FF7A45]/10 text-center">
                <p className="text-xs font-bold text-[#FA521C] mb-1">Free Delivery</p>
                <p className="text-[11px] text-[#636E72]">
                  On all orders over ₹1,499 across all categories
                </p>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="lg:col-span-3">
            {searchQuery.trim() && (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-orange-50/70 border border-[#FA521C]/25 text-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <Search className="w-4 h-4 text-[#FA521C]" />
                  <span className="text-[#636E72]">Search results for:</span>
                  <span className="font-bold text-[#FA521C]">&quot;{searchQuery}&quot;</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FA521C]/10 text-[#FA521C] text-xs font-semibold">
                    {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"} found
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {selectedCategory !== "All" && (
                    <button
                      onClick={() => handleCategorySelect("All")}
                      className="text-xs font-semibold text-gray-600 hover:text-gray-900 underline cursor-pointer"
                    >
                      Search in all categories
                    </button>
                  )}
                  <button
                    onClick={() => setSearchQuery("")}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#FA521C] hover:text-[#d43f10] bg-white px-3 py-1.5 rounded-xl border border-[#FA521C]/30 shadow-sm transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear search</span>
                  </button>
                </div>
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold font-display text-gray-900 mb-1">
                  No products found
                </h3>
                <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                  Try adjusting your search query, price filter, or choose a different category.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setActiveFilter("");
                    setSearchQuery("");
                    setMaxPrice(6000);
                    setOnlyInStock(false);
                    router.push("/products");
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#FA521C] text-white text-xs font-semibold hover:bg-[#E0400B] transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      className="group bg-white rounded-3xl border border-gray-100/80 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#FA521C]/10 transition-all duration-300 flex flex-col"
                    >
                      {/* Image Frame */}
                      <Link href={`/products/${product.slug || product.id}`} className="relative block aspect-square bg-[#F1F2F6] overflow-hidden">
                        <Image
                          src={product.poster_image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                          {product.badge && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#FA521C] text-white shadow-sm">
                              {product.badge}
                            </span>
                          )}
                          {discount > 0 && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-[#FF6B6B] text-white shadow-sm">
                              -{discount}%
                            </span>
                          )}
                        </div>

                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => handleToggleWishlist(e, product)}
                          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
                            wishlisted
                              ? "bg-[#FF6B6B] text-white shadow-md"
                              : "bg-white/80 text-gray-600 hover:bg-white hover:text-[#FF6B6B]"
                          }`}
                          aria-label="Wishlist"
                        >
                          <Heart className={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`} />
                        </button>
                      </Link>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center justify-between text-xs text-[#636E72] mb-1.5">
                          <span className="font-semibold uppercase tracking-wider text-[10px] text-[#FA521C]">
                            {product.category}
                          </span>
                          {product.rating && (
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span className="font-bold text-xs">{product.rating}</span>
                              <span className="text-gray-400 text-[10px]">
                                ({product.review_count || 10})
                              </span>
                            </div>
                          )}
                        </div>

                        <Link href={`/products/${product.slug || product.id}`}>
                          <h3 className="font-display font-bold text-base text-[#2D3436] group-hover:text-[#FA521C] transition-colors line-clamp-1 mb-1">
                            {product.name}
                          </h3>
                        </Link>

                        <p className="text-xs text-[#636E72] line-clamp-2 mb-4 flex-1">
                          {product.tagline || product.description}
                        </p>

                        {/* Pricing & Add to Cart */}
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-display font-bold text-lg text-[#2D3436]">
                                ₹{product.price.toLocaleString()}
                              </span>
                              {product.mrp && product.mrp > product.price && (
                                <span className="text-xs text-gray-400 line-through">
                                  ₹{product.mrp.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-emerald-600 font-medium">
                              In Stock ({product.stock_count})
                            </span>
                          </div>

                          <button
                            onClick={(e) => handleQuickAdd(e, product)}
                            className="p-2.5 rounded-xl bg-[#FA521C] hover:bg-[#E0400B] text-white shadow-md shadow-[#FA521C]/25 transition-all transform active:scale-95 flex items-center justify-center cursor-pointer"
                            aria-label="Add to cart"
                          >
                            <ShoppingBag className="w-4 h-4" />
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

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setMobileFilterOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative ml-auto w-4/5 max-w-sm bg-white h-full z-10 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#FA521C]" />
                    <h3 className="font-display font-bold text-lg text-[#2D3436]">Filters</h3>
                  </div>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
                    aria-label="Close filters"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Price Filter */}
                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-sm text-[#2D3436]">Price Range</h4>
                  <div className="flex justify-between text-xs font-semibold text-[#636E72]">
                    <span>₹0</span>
                    <span className="text-[#FA521C]">Up to ₹{maxPrice.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="6000"
                    step="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[#FA521C] cursor-pointer"
                  />
                </div>

                {/* Availability */}
                <div className="space-y-3 mb-6 pt-4 border-t border-gray-100">
                  <h4 className="font-semibold text-sm text-[#2D3436]">Availability</h4>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyInStock}
                      onChange={(e) => setOnlyInStock(e.target.checked)}
                      className="w-4 h-4 rounded text-[#FA521C] accent-[#FA521C]"
                    />
                    <span className="text-xs font-medium text-[#2D3436]">In-Stock Items Only</span>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-2">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-3 rounded-xl bg-[#FA521C] text-white text-sm font-bold shadow-md shadow-[#FA521C]/25 cursor-pointer"
                >
                  Apply Filters ({filteredProducts.length} items)
                </button>
                <button
                  onClick={() => {
                    setMaxPrice(6000);
                    setOnlyInStock(false);
                    setSelectedCategory("All");
                    setActiveFilter("");
                    setMobileFilterOpen(false);
                    router.push("/products");
                  }}
                  className="w-full py-2.5 text-xs text-gray-500 font-semibold hover:text-gray-800 cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[#FA521C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-500">Loading catalog...</p>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </React.Suspense>
  );
}
