"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ArrowRight, Star } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist, totalWishlistItems } = useWishlist();
  const { addToCart, openCart } = useCart();
  const { user, isLoading: authLoading } = useAuth();

  const handleMoveToCart = (product: any) => {
    const success = addToCart(product, 1);
    if (success) {
      removeFromWishlist(product.id);
      openCart();
    }
  };

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] text-[#111111] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto py-16 sm:py-24 px-4 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 rounded-3xl bg-pink-50 flex items-center justify-center text-[#FF6B6B]">
            <Heart className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-gray-900 mb-2">
            Sign In to View Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8 leading-relaxed">
            Sign in to your Zupe Store account to access your saved favorite products, sync across all your devices, and get price drop notifications.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center">
            <Link
              href="/signin?redirect=/wishlist&notice=Please sign in to access your saved wishlist"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl sm:rounded-2xl bg-[#FF7A00] hover:bg-[#E66E00] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#FF7A00]/25 transition-all"
            >
              <span>Sign In to Your Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl sm:rounded-2xl bg-white border border-gray-200 text-gray-700 font-semibold text-xs sm:text-sm hover:bg-gray-50 transition-all"
            >
              <span>Explore Products</span>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111111]">
      <Navbar />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-16">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-gray-900">
              My Wishlist
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {totalWishlistItems} saved item{totalWishlistItems !== 1 ? "s" : ""}
            </p>
          </div>

          {wishlist.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="max-w-md mx-auto py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-pink-50 flex items-center justify-center text-[#FF6B6B]">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold font-display text-gray-900 mb-1.5">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
              Explore our minimalist collection and tap the heart icon on any piece to save it for later.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#FF7A00]/25 transition-all"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {wishlist.map((item) => {
              const discount =
                item.mrp && item.price < item.mrp
                  ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
                  : 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-100 p-2.5 sm:p-3 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 group"
                >
                  <div>
                    {/* Image Container */}
                    <div className="relative block w-full aspect-square rounded-xl overflow-hidden bg-gray-50 mb-2 sm:mb-2.5">
                      <Link href={`/products/${item.slug || item.id}`} className="block w-full h-full">
                        <Image
                          src={item.poster_image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 20vw"
                          className="object-cover object-bottom group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>

                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-[#E53E3E] text-white text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs">
                          -{discount}%
                        </span>
                      )}

                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="absolute top-2 right-2 p-1.5 sm:p-2 rounded-full bg-white/80 backdrop-blur-xs text-gray-400 hover:text-red-500 hover:bg-white transition-colors z-10 shadow-xs"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>

                    {/* Category */}
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[#FF7A00] truncate mb-1">
                      {item.category}
                    </div>

                    {/* Title */}
                    <Link
                      href={`/products/${item.slug || item.id}`}
                      className="block text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 hover:text-[#FF7A00] transition-colors leading-snug mb-1.5 min-h-[32px] sm:min-h-[36px]"
                    >
                      {item.name}
                    </Link>

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 sm:gap-2 mb-2.5">
                      <span className="text-sm sm:text-base font-extrabold text-[#111111]">
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                      {item.mrp && item.mrp > item.price && (
                        <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                          ₹{item.mrp.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Move to Bag Button */}
                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="w-full py-2 px-2.5 rounded-lg sm:rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] active:scale-95 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Bag</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
