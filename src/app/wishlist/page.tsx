"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ArrowRight, Star, ShoppingCart, Sparkles } from "lucide-react";
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
      <div className="min-h-screen bg-[#070708] text-white flex flex-col justify-between selection:bg-[#D4A373] selection:text-black font-mograph">
        <Navbar />
        <div className="max-w-md mx-auto pt-28 sm:pt-36 pb-24 px-4 text-center">
          <div className="bg-[#141416] rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 rounded-2xl bg-[#272015] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-sm">
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 fill-rose-500/20 stroke-rose-500 stroke-[1.75]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 font-movault uppercase tracking-wider">
              Sign In to View Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mb-6 sm:mb-8 leading-relaxed font-normal">
              Sign in to your Vittal Lifestyle account to access your saved supplements, activewear, dates and artisan treats across all your devices.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center">
              <Link
                href="/signin?redirect=/wishlist&notice=Please sign in to access your saved wishlist"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#D4A373] hover:bg-[#c29263] text-black font-bold text-xs sm:text-sm shadow-md transition-all font-movault uppercase tracking-wider"
              >
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-xs sm:text-sm hover:bg-white/10 transition-all"
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
    <div className="min-h-screen bg-[#070708] text-white flex flex-col justify-between selection:bg-[#D4A373] selection:text-black font-mograph">
      <Navbar />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-16 flex-1 w-full">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#272015] border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-2 font-movault">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Saved Items</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-movault uppercase tracking-wider">
              My Wishlist
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5 font-medium">
              {totalWishlistItems} saved item{totalWishlistItems !== 1 ? "s" : ""}
            </p>
          </div>

          {wishlist.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-xs font-bold text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer font-movault uppercase tracking-wider"
            >
              Clear All
            </button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="max-w-md mx-auto py-16 text-center">
            <div className="bg-[#141416] rounded-3xl p-8 border border-white/10 shadow-2xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#272015] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-sm">
                <Heart className="w-8 h-8 fill-rose-500/20 stroke-rose-500 stroke-[1.75]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2 font-movault uppercase tracking-wider">
                Your Wishlist is Empty
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mb-6 leading-relaxed font-normal">
                Explore our lab-certified gym supplements, activewear, dates &amp; nuts, and chocolates, and tap the heart icon on any product to save it for later.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#D4A373] hover:bg-[#c29263] text-black font-bold text-xs sm:text-sm shadow-md transition-all font-movault uppercase tracking-wider"
              >
                <span>Explore Catalog</span>
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
                  className="bg-[#141416] hover:bg-[#18181C] rounded-2xl border border-white/10 hover:border-white/20 p-3 sm:p-4 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 group relative"
                >
                  <div>
                    {/* Image Container */}
                    <div className="relative block w-full aspect-square rounded-xl overflow-hidden bg-transparent mb-3">
                      <Link href={`/products/${item.slug || item.id}`} className="block w-full h-full">
                        <Image
                          src={item.poster_image || "/vittal/product-whey-protein-jar.png"}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 20vw"
                          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {discount > 0 && (
                        <span className="absolute top-2 left-2 font-movault bg-[#2B2317] text-[#E5C07B] text-[10px] sm:text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded shadow-sm">
                          -{discount}%
                        </span>
                      )}

                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="absolute top-2 right-2 p-1.5 sm:p-2 rounded-full bg-[#1e1e22]/90 backdrop-blur-xs text-neutral-400 hover:text-rose-400 transition-colors z-10 border border-white/10 shadow-xs cursor-pointer"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>

                    {/* Category */}
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 truncate mb-1">
                      {item.category || "Lifestyle"}
                    </div>

                    {/* Title */}
                    <Link
                      href={`/products/${item.slug || item.id}`}
                      className="block text-xs sm:text-sm font-semibold text-white line-clamp-2 hover:text-[#D4AF37] transition-colors leading-snug mb-2 min-h-[32px] sm:min-h-[36px]"
                    >
                      {item.name}
                    </Link>

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 sm:gap-2 mb-3">
                      <span className="text-sm sm:text-base font-extrabold text-white">
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                      {item.mrp && item.mrp > item.price && (
                        <span className="text-[10px] sm:text-xs text-neutral-500 line-through">
                          ₹{item.mrp.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Move to Bag Button or Out of Stock */}
                  {item.in_stock === 0 || (item.stock_count !== undefined && item.stock_count <= 0) ? (
                    <div className="w-full py-2 px-2.5 rounded-xl bg-white/5 text-neutral-500 text-xs font-bold text-center border border-white/10 uppercase select-none font-movault">
                      Out of Stock
                    </div>
                  ) : (
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="w-full py-2 px-3 rounded-xl bg-[#D4A373] hover:bg-[#c29263] text-black text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer font-movault uppercase tracking-wider"
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
