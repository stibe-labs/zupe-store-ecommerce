"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ArrowRight, Star, ShoppingCart } from "lucide-react";
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
    if (product.in_stock === 0 || (product.stock_count !== undefined && product.stock_count <= 0)) {
      return;
    }
    const success = addToCart(product, 1);
    if (success) {
      removeFromWishlist(product.id);
      openCart();
    }
  };

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans">
        <Navbar />
        <div className="max-w-md mx-auto pt-28 sm:pt-32 pb-24 px-4 text-center">
          <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-xl">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-sm">
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 fill-rose-100 stroke-rose-500 stroke-[1.75]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
              Sign In to View Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8 leading-relaxed">
              Sign in to your Vittal Digital account to access your saved favorite gadgets, sync across all your devices, and get price drop notifications.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center">
              <Link
                href="/signin?redirect=/wishlist&notice=Please sign in to access your saved wishlist"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#FFBE00] hover:bg-[#E5AA00] active:bg-[#CC9600] text-slate-950 font-black text-xs sm:text-sm shadow-sm hover:shadow-md transition-all"
              >
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs sm:text-sm hover:bg-slate-50 transition-all shadow-xs"
              >
                <span>Explore Products</span>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans">
      <Navbar />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-16 flex-1 w-full">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              My Wishlist
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {totalWishlistItems} saved device{totalWishlistItems !== 1 ? "s" : ""}
            </p>
          </div>

          {wishlist.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="max-w-md mx-auto py-16 text-center">
            <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-sm">
                <Heart className="w-8 h-8 fill-rose-100 stroke-rose-500 stroke-[1.75]" />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">
                Your Wishlist is Empty
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                Explore our authentic Dubai-sourced electronics, audio, and gadgets, and tap the heart icon on any device to save it for later.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#FFBE00] hover:bg-[#E5AA00] active:bg-[#CC9600] text-slate-950 font-black text-xs sm:text-sm shadow-sm hover:shadow-md transition-all"
              >
                <span>Explore Gadgets</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
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
                  className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 group relative"
                >
                  <div>
                    {/* Image Container */}
                    <div className="relative block w-full aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-100 mb-3">
                      <Link href={`/products/${item.slug || item.id}`} className="block w-full h-full">
                        <Image
                          src={item.poster_image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 20vw"
                          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-[#EF4444] text-white text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-md shadow-sm">
                          -{discount}%
                        </span>
                      )}

                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="absolute top-2 right-2 p-1.5 sm:p-2 rounded-full bg-white/90 backdrop-blur-xs text-slate-400 hover:text-red-600 hover:bg-white transition-colors z-10 border border-slate-200 shadow-xs cursor-pointer"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>

                    {/* Category */}
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate mb-1">
                      {item.category || "Electronics"}
                    </div>

                    {/* Title */}
                    <Link
                      href={`/products/${item.slug || item.id}`}
                      className="block text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 hover:text-blue-600 transition-colors leading-snug mb-2 min-h-[32px] sm:min-h-[36px]"
                    >
                      {item.name}
                    </Link>

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 sm:gap-2 mb-3">
                      <span className="text-sm sm:text-base font-black text-slate-900">
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                      {item.mrp && item.mrp > item.price && (
                        <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                          ₹{item.mrp.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Move to Bag Button or Out of Stock */}
                  {item.in_stock === 0 || (item.stock_count !== undefined && item.stock_count <= 0) ? (
                    <div className="w-full py-2 px-2.5 rounded-lg bg-slate-100 text-slate-400 text-xs font-bold text-center border border-slate-200 uppercase select-none">
                      Out of Stock
                    </div>
                  ) : (
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="w-full py-2 px-3 rounded-lg bg-[#FFBE00] hover:bg-[#E5AA00] active:bg-[#CC9600] text-slate-950 text-xs font-black shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Add to Cart</span>
                    </button>
                  )}
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
