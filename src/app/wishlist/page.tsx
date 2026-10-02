"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ArrowRight, Star } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist, totalWishlistItems } = useWishlist();
  const { addToCart, openCart } = useCart();

  const handleMoveToCart = (product: any) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
    openCart();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#2D3436]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900">
              My Wishlist
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {totalWishlistItems} saved item{totalWishlistItems !== 1 ? "s" : ""}
            </p>
          </div>

          {wishlist.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="max-w-md mx-auto py-20 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-pink-50 flex items-center justify-center text-[#FF6B6B]">
              <Heart className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Explore our minimalist collection and tap the heart icon on any piece to save it for later.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#6C5CE7] hover:bg-[#5848d2] text-white font-semibold text-sm shadow-lg shadow-[#6C5CE7]/30 transition-all"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <Image
                    src={item.poster_image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-3 right-3 p-2.5 rounded-full bg-white/80 backdrop-blur-md text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <span className="text-[10px] font-bold text-[#6C5CE7] uppercase mb-1">
                    {item.category}
                  </span>
                  <Link href={`/products/${item.slug || item.id}`}>
                    <h3 className="font-display font-bold text-base text-gray-900 hover:text-[#6C5CE7] line-clamp-1 mb-1">
                      {item.name}
                    </h3>
                  </Link>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="font-bold text-base text-gray-900">
                      ₹{item.price.toLocaleString()}
                    </span>
                    {item.mrp && item.mrp > item.price && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{item.mrp.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="w-full mt-auto py-2.5 px-4 rounded-xl bg-[#6C5CE7] hover:bg-[#5848d2] text-white text-xs font-semibold shadow-md shadow-[#6C5CE7]/25 flex items-center justify-center gap-2 transition-all"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
