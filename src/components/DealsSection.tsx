"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";

export function DealsSection() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, addItem } = useCart();

  // The first 5 products correspond to Today's Best Deals
  const dealProducts = DEFAULT_PRODUCTS.slice(0, 5);

  const discounts = ["-40%", "-35%", "-30%", "-45%", "-33%"];

  const handleAddToCart = (e: React.MouseEvent, product: typeof dealProducts[0]) => {
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
        `/signin?redirect=/&notice=${encodeURIComponent(
          "Please sign in to add items to your cart"
        )}`
      );
      return;
    }
    const addFn = addToCart || addItem;
    if (typeof addFn === "function") {
      addFn(product, 1);
    }
    router.push("/cart");
  };

  const handleBuyNow = (e: React.MouseEvent, product: typeof dealProducts[0]) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      try {
        localStorage.setItem(
          "zp_pending_cart_action",
          JSON.stringify({ action: "buy_now", product, quantity: 1, autoOpenCart: false })
        );
      } catch (e) {}
      router.push(
        `/signin?redirect=${encodeURIComponent("/checkout")}&notice=${encodeURIComponent(
          "Please sign in to place an order"
        )}`
      );
      return;
    }
    const addFn = addToCart || addItem;
    if (typeof addFn === "function") {
      addFn(product, 1);
    }
    router.push("/checkout");
  };

  return (
    <section className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[#111111] flex items-center gap-1.5">
            <span>Today&apos;s Best Deals</span>
            <span className="text-amber-500">⚡</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Grab the best offers before they&apos;re gone!
          </p>
        </div>
        <Link
          href="/products?filter=deals"
          className="text-xs sm:text-sm font-bold text-[#FF5722] hover:text-[#E64A19] flex items-center gap-1 transition-colors group"
        >
          <span>View All Deals</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 5 Product Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {dealProducts.map((product, idx) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div>
              {/* Product Image Container */}
              <Link
                href={`/products/${product.slug}`}
                className="relative block w-full aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3"
              >
                <Image
                  src={product.poster_image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="object-cover object-bottom group-hover:scale-105 transition-transform duration-500"
                />

                {/* Red Discount Pill Badge */}
                <span className="absolute top-2 left-2 bg-[#E53E3E] text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                  {discounts[idx]}
                </span>
              </Link>

              {/* Title */}
              <Link
                href={`/products/${product.slug}`}
                className="block text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 hover:text-[#FF5722] transition-colors leading-snug mb-1.5"
              >
                {product.name}
              </Link>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-2">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-[11px] text-gray-500 font-medium">
                  ({product.rating.toFixed(1)})
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm sm:text-base font-extrabold text-[#111111]">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.mrp && product.mrp > product.price && (
                  <span className="text-xs text-gray-400 line-through">
                    ₹{product.mrp.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {/* Save Discount Percentage */}
              {product.mrp && product.mrp > product.price && (
                <div className="text-[11px] sm:text-xs font-bold text-[#E53935] mb-2.5">
                  Save {Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
                </div>
              )}
            </div>

            {/* Dual Action Buttons: Buy now & Add to cart */}
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-auto pt-1">
              <button
                type="button"
                onClick={(e) => handleBuyNow(e, product)}
                className="w-full py-2 px-1.5 sm:px-2 rounded-xl border border-gray-900 bg-white hover:bg-gray-900 hover:text-white active:scale-95 text-gray-900 text-xs sm:text-[13px] font-bold transition-all shadow-2xs flex items-center justify-center text-center cursor-pointer"
              >
                Buy now
              </button>
              <button
                type="button"
                onClick={(e) => handleAddToCart(e, product)}
                className="w-full py-2 px-1.5 sm:px-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 active:scale-95 text-gray-900 text-xs sm:text-[13px] font-bold transition-all shadow-2xs flex items-center justify-center text-center cursor-pointer"
              >
                Add to cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
