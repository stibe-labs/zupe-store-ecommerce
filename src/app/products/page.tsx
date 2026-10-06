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
  Check,
  ChevronRight,
  Sparkles,
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

  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");
  const [maxPrice, setMaxPrice] = useState<number>(6000);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const { addToCart, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

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

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedCategory(cat);
    }
    const q = searchParams.get("search") || searchParams.get("q");
    if (q !== null && q !== undefined) {
      setSearchQuery(q);
      // If user came via search param with no explicit category, search across all categories
      if (!cat) {
        setSelectedCategory("All");
      }
    }
  }, [searchParams]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const queryTokens = query ? query.split(/\s+/).filter(Boolean) : [];

    return products
      .filter((product) => {
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
  }, [products, selectedCategory, searchQuery, sortBy, maxPrice, onlyInStock]);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
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
      router.push(
        `/signin?redirect=/products&notice=${encodeURIComponent(
          "Please sign in to save items to your wishlist"
        )}`
      );
      return;
    }
    toggleWishlist(product);
  };

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
            <span className="text-[#2D3436] font-medium">Shop</span>
            {selectedCategory !== "All" && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-[#FA521C] font-semibold">{selectedCategory}</span>
              </>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FA521C]/10 text-[#FA521C] mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Curated Catalog
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#2D3436]">
                {selectedCategory === "All" ? "Explore All Products" : selectedCategory}
              </h1>
              <p className="text-sm text-[#636E72] mt-1">
                Showing {filteredProducts.length} handcrafted, minimalist designs
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
        {/* Category Pills & Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
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
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-[#2D3436] shadow-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#FA521C]" />
              <span>Filters</span>
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort products"
                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-[#2D3436] focus:outline-none focus:ring-2 focus:ring-[#FA521C]/30"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
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
                      onClick={() => setSelectedCategory("All")}
                      className="text-xs font-semibold text-gray-600 hover:text-gray-900 underline"
                    >
                      Search in all categories
                    </button>
                  )}
                  <button
                    onClick={() => setSearchQuery("")}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#FA521C] hover:text-[#d43f10] bg-white px-3 py-1.5 rounded-xl border border-[#FA521C]/30 shadow-sm transition-colors"
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
                    setSearchQuery("");
                    setMaxPrice(6000);
                    setOnlyInStock(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#FA521C] text-white text-xs font-semibold hover:bg-[#E0400B] transition-colors"
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
                            className="p-2.5 rounded-xl bg-[#FA521C] hover:bg-[#E0400B] text-white shadow-md shadow-[#FA521C]/25 transition-all transform active:scale-95 flex items-center justify-center"
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
