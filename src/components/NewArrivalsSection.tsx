"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Heart, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import { getClientProducts, getClientShowcase } from "@/lib/productsClientCache";

interface NewArrivalsSectionProps {
  initialProductIds?: string[];
}

export function NewArrivalsSection({ initialProductIds }: NewArrivalsSectionProps = {}) {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const { addToCart, addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [curatedIds, setCuratedIds] = useState<string[]>(initialProductIds || []);

  useEffect(() => {
    Promise.all([
      getClientProducts(),
      !initialProductIds ? getClientShowcase() : Promise.resolve(null),
    ])
      .then(([productsList, showcaseCollections]) => {
        if (Array.isArray(productsList) && productsList.length > 0) {
          setProducts(productsList);
        }
        if (showcaseCollections?.newArrivalsProductIds) {
          setCuratedIds(showcaseCollections.newArrivalsProductIds);
        }
      })
      .catch(() => {});
  }, [initialProductIds]);

  // Order products according to curatedIds (max 10 for clean 2-row 5-column homepage grid), or fallback to default
  const newArrivals = React.useMemo(() => {
    if (curatedIds && curatedIds.length > 0) {
      const mapped = curatedIds
        .map((id) => products.find((p) => p.id === id || p.slug === id))
        .filter(Boolean) as typeof products;
      if (mapped.length > 0) return mapped.slice(0, 10);
    }
    return products.slice(5, 10);
  }, [curatedIds, products]);

  return (
    <section className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[#111111]">
            New Arrivals
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Be the first to explore our latest products.
          </p>
        </div>
        <Link
          href="/products?filter=new"
          className="text-xs sm:text-sm font-bold text-[#FF5722] hover:text-[#E64A19] flex items-center gap-1 transition-colors group"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 5 Product Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {newArrivals.map((product) => {
          const isFavorited = isInWishlist(product.id);
          const isOutOfStock = product.in_stock === 0 || (product.stock_count !== undefined && product.stock_count <= 0);

          return (
            <div
              key={product.id}
              className={`bg-white rounded-2xl border p-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 group ${
                isOutOfStock ? "border-red-100" : "border-gray-100"
              }`}
            >
              <div>
                {/* Product Image Container */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3">
                  <Link href={`/products/${product.slug}`} className="block w-full h-full">
                    <Image
                      src={product.poster_image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className={`object-cover object-bottom group-hover:scale-105 transition-transform duration-500 ${
                        isOutOfStock ? "grayscale opacity-80" : ""
                      }`}
                    />
                  </Link>

                  {isOutOfStock && (
                    <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                      Sold Out
                    </div>
                  )}

                  {/* Circular Wishlist Heart Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (!user) {
                        try {
                          localStorage.setItem(
                            "zp_pending_wishlist_action",
                            JSON.stringify({ action: "wishlist", product })
                          );
                        } catch (e) {}
                        openAuthModal("login", "Sign in required: Please log in to save items to your wishlist ❤️");
                        return;
                      }
                      toggleWishlist(product);
                    }}
                    className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all shadow-sm hover:scale-110 ${
                      isFavorited ? "text-rose-500" : "text-gray-600 hover:text-rose-500"
                    }`}
                    aria-label="Add to wishlist"
                  >
                    <Heart
                      className={`w-4 h-4 ${isFavorited ? "fill-rose-500" : ""}`}
                    />
                  </button>
                </div>

                {/* Title */}
                <Link
                  href={`/products/${product.slug}`}
                  className="block text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 hover:text-[#FF5722] transition-colors leading-snug mb-1.5"
                >
                  {product.name}
                </Link>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-sm sm:text-base font-extrabold text-[#111111]">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">
                    ({product.rating.toFixed(1)})
                  </span>
                </div>
              </div>

              {/* Action Buttons: Dual buttons or Out of Stock label */}
              {isOutOfStock ? (
                <div className="mt-auto pt-1">
                  <div className="w-full py-2 px-2 rounded-xl bg-gray-100 text-gray-400 text-xs font-extrabold text-center border border-gray-200 select-none uppercase tracking-wide">
                    Out of Stock
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-auto pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const addFn = addToCart || addItem;
                      if (typeof addFn === "function") {
                        const added = addFn(product, 1);
                        if (!added) return;
                      }
                      if (!user) {
                        openAuthModal("login", "Sign in required: Please log in to complete your purchase ⚡");
                        return;
                      }
                      router.push("/checkout");
                    }}
                    className="w-full py-2 px-1.5 sm:px-2 rounded-xl border border-gray-900 bg-white hover:bg-gray-900 hover:text-white active:scale-95 text-gray-900 text-xs sm:text-[13px] font-bold transition-all shadow-2xs flex items-center justify-center text-center cursor-pointer"
                  >
                    Buy now
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const addFn = addToCart || addItem;
                      if (typeof addFn === "function") {
                        const added = addFn(product, 1);
                        if (!added) return;
                      }
                      if (!user) {
                        openAuthModal("login", "Sign in required: Please log in to add items to your cart & checkout 🛍️");
                        return;
                      }
                      router.push("/cart");
                    }}
                    className="w-full py-2 px-1.5 sm:px-2 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] active:scale-95 text-white text-xs sm:text-[13px] font-bold transition-all shadow-xs flex items-center justify-center text-center cursor-pointer"
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
