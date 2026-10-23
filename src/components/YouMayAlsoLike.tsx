"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Heart, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types/product";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

interface YouMayAlsoLikeProps {
  currentProduct: Product;
  onToast?: (message: string) => void;
}

export function YouMayAlsoLike({ currentProduct, onToast }: YouMayAlsoLikeProps) {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const { addToCart, addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [catalog, setCatalog] = useState<Product[]>(DEFAULT_PRODUCTS);

  // Fetch live products on client mount to ensure real-time ratings & updates
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/products?_t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.products) && data.products.length > 0) {
          setCatalog(data.products);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch live products for YouMayAlsoLike:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute matching products based on category, tags, and fallback
  const matchingProducts = useMemo(() => {
    if (!catalog || catalog.length === 0) return [];

    const currentId = currentProduct.id?.toLowerCase();
    const currentSlug = currentProduct.slug?.toLowerCase();
    const currentCat = (currentProduct.category || "").toLowerCase();

    // 1. Exclude the current product
    const otherProducts = catalog.filter((p) => {
      const pId = (p.id || "").toLowerCase();
      const pSlug = (p.slug || "").toLowerCase();
      return pId !== currentId && pSlug !== currentSlug;
    });

    // 2. Score and sort by relevance:
    //    - Same category: highest priority (score +10)
    //    - Matching keywords in name or tagline: secondary priority (+3)
    const scored = otherProducts.map((p) => {
      let score = 0;
      const pCat = (p.category || "").toLowerCase();
      if (currentCat && pCat === currentCat) {
        score += 10;
      }
      // Check title keywords
      const currentKeywords = (currentProduct.name || "").toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      const pName = (p.name || "").toLowerCase();
      for (const kw of currentKeywords) {
        if (pName.includes(kw)) {
          score += 3;
        }
      }
      return { product: p, score };
    });

    // Sort by relevance score descending, then rating descending
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (Number(b.product.rating) || 0) - (Number(a.product.rating) || 0);
    });

    // Return the top matching products for 1-row swiping carousel
    return scored.slice(0, 10).map((s) => s.product);
  }, [catalog, currentProduct]);

  if (!matchingProducts || matchingProducts.length === 0) {
    return null;
  }

  const handleAddToCart = (e: React.MouseEvent, prod: Product) => {
    e.preventDefault();
    e.stopPropagation();

    if (prod.in_stock === 0 || (prod.stock_count !== undefined && prod.stock_count <= 0)) {
      if (onToast) onToast("Sorry, this item is currently out of stock!");
      return;
    }

    if (!user) {
      openAuthModal("login", "Sign in required: Please log in to add items to your cart 🛒");
      return;
    }

    const addFn = addToCart || addItem;
    if (typeof addFn === "function") {
      const added = addFn(prod, 1);
      if (!added) return;
    }
    if (onToast) {
      onToast(`Added ${prod.name} to cart! 🛒`);
    }
    router.push("/cart");
  };

  const handleBuyNow = (e: React.MouseEvent, prod: Product) => {
    e.preventDefault();
    e.stopPropagation();

    if (prod.in_stock === 0 || (prod.stock_count !== undefined && prod.stock_count <= 0)) {
      if (onToast) onToast("Sorry, this item is currently out of stock!");
      return;
    }

    if (!user) {
      openAuthModal("login", "Sign in required: Please log in or create an account to proceed with purchase 🛍️");
      return;
    }

    const addFn = addToCart || addItem;
    if (typeof addFn === "function") {
      const added = addFn(prod, 1);
      if (!added) return;
    }
    router.push("/checkout");
  };

  const handleWishlist = (e: React.MouseEvent, prod: Product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openAuthModal("login", "Sign in required: Please log in to save items to your wishlist ❤️");
      return;
    }

    const wishlisted = isInWishlist(prod.id);
    const success = toggleWishlist(prod);
    if (success && onToast) {
      onToast(wishlisted ? "Removed from Wishlist" : "Saved to Wishlist! ❤️");
    }
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-10 sm:py-14 border-t border-gray-100">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5 sm:mb-7">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#111111] tracking-tight">
            You may also like
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Curated items matching this collection that other customers love
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={`/products?category=${encodeURIComponent(currentProduct.category || "all")}`}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#FF7A00] hover:text-[#E66E00] transition-colors"
          >
            <span>View all in {currentProduct.category || "Catalog"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Desktop Arrow Buttons for manual sliding */}
          <div className="hidden sm:flex items-center gap-1.5 ml-1">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-100 active:scale-95 flex items-center justify-center text-gray-700 transition-all shadow-2xs cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-100 active:scale-95 flex items-center justify-center text-gray-700 transition-all shadow-2xs cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 1-Row Manually Moving / Swiping Product Track */}
      <div
        ref={scrollRef}
        className="flex items-stretch overflow-x-auto gap-3 sm:gap-4.5 pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth snap-x snap-mandatory scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {matchingProducts.map((item) => {
          const discountPercent =
            item.mrp && item.mrp > item.price
              ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
              : 0;

          const imageSrc =
            item.poster_image ||
            (item.images && item.images.length > 0 ? item.images[0] : "/placeholder.png");

          const ratingValue = Number(item.rating) || 5.0;
          const isWishlisted = isInWishlist(item.id);

          return (
            <div
              key={item.id || item.slug}
              className="w-[185px] sm:w-[220px] md:w-[250px] shrink-0 snap-start group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl bg-white border border-gray-100 hover:border-gray-200 p-2.5 sm:p-4 shadow-2xs hover:shadow-lg transition-all duration-300"
            >
              <div>
                {/* Product Image Box */}
                <div className="relative block w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-[#F3F4F6] mb-3 select-none">
                  <Link href={`/products/${item.slug || item.id}`} className="block w-full h-full">
                    <Image
                      src={imageSrc}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Discount Badge in Top-Left (matching maxsmile / Zupe pill style) */}
                  {discountPercent > 0 && (
                    <span className="absolute top-2 left-2 z-10 bg-[#FF3B30] text-white text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
                      {discountPercent}% OFF
                    </span>
                  )}

                  {/* Wishlist Button in Top-Right */}
                  <button
                    type="button"
                    onClick={(e) => handleWishlist(e, item)}
                    className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-gray-700 hover:text-[#FF3B30] hover:scale-110 active:scale-95 transition-all shadow-xs"
                    aria-label="Wishlist"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        isWishlisted ? "fill-[#FF3B30] text-[#FF3B30]" : "text-gray-700 stroke-[2.2]"
                      }`}
                    />
                  </button>
                </div>

                {/* Product Category Label */}
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#FF7A00] block mb-1">
                  {item.category || "Featured"}
                </span>

                {/* Product Title */}
                <Link
                  href={`/products/${item.slug || item.id}`}
                  className="block text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 hover:text-[#FF7A00] transition-colors leading-snug mb-1.5"
                >
                  {item.name}
                </Link>

                {/* Live Stars & Rating Score */}
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 sm:w-3.5 h-3 sm:h-3.5 ${
                          star <= Math.round(ratingValue)
                            ? "fill-current text-amber-400"
                            : "text-gray-200 fill-transparent"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-gray-500 font-semibold">
                    ({ratingValue.toFixed(1)})
                  </span>
                </div>

                {/* Price Line: Offer Price + MRP Strikethrough */}
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm sm:text-base font-extrabold text-[#111111]">
                    ₹{item.price.toLocaleString("en-IN")}
                  </span>
                  {item.mrp && item.mrp > item.price && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{item.mrp.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>

                {/* Save Percentage Text */}
                {discountPercent > 0 && (
                  <div className="text-[10px] sm:text-[11px] font-bold text-[#E53935] mb-3">
                    Save {discountPercent}%
                  </div>
                )}
              </div>

              {/* Dual Action Buttons (Buy now & Add to cart) or Out of Stock */}
              {item.in_stock === 0 || (item.stock_count !== undefined && item.stock_count <= 0) ? (
                <div className="mt-auto pt-2 border-t border-gray-50">
                  <div className="w-full py-2 px-2 rounded-xl bg-gray-100 text-gray-400 text-[11px] sm:text-xs font-black uppercase text-center border border-gray-200 select-none">
                    Out of Stock
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-auto pt-2 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={(e) => handleBuyNow(e, item)}
                    className="w-full py-2 px-1 sm:px-2 rounded-xl border border-gray-900 bg-white hover:bg-gray-900 hover:text-white active:scale-95 text-gray-900 text-[11px] sm:text-xs font-bold transition-all shadow-2xs flex items-center justify-center text-center cursor-pointer"
                  >
                    Buy now
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(e, item)}
                    className="w-full py-2 px-1 sm:px-2 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] active:scale-95 text-white text-[11px] sm:text-xs font-bold transition-all shadow-xs flex items-center justify-center text-center cursor-pointer"
                  >
                    Add to cart
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
