"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  User,
  Heart,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { CardAddToCartControl } from "@/components/CardAddToCartControl";
import {
  BRAND_80_THEMES,
  Logo80AnimatedMark,
} from "@/components/Logo80AnimatedMark";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist, totalWishlistItems } = useWishlist();
  const { user, isLoading: authLoading } = useAuth();

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-[#0C1412] flex flex-col justify-between selection:bg-[#E6F4EF] selection:text-[#0C1412] font-mograph">
      <Navbar />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-20 flex-1 w-full">
        {/* Optional Non-Blocking Sync Banner for Guest Shoppers */}
        {!authLoading && !user && (
          <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-[#F3FAF7] border border-[#B8DFD1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#074230]">
              <div className="w-8 h-8 rounded-full bg-white border border-[#B8DFD1] flex items-center justify-center shrink-0 text-[#0B5D44]">
                <User className="w-4 h-4" />
              </div>
              <p className="font-medium">
                Your saved items are stored on this device.{" "}
                <span className="font-bold">Sign in anytime</span> to sync your wishlist across devices.
              </p>
            </div>
            <Link
              href="/signin?redirect=/wishlist"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#0B5D44] hover:bg-[#074230] text-white font-bold text-xs transition-colors shrink-0 self-start sm:self-center"
            >
              <span>Sign In to Sync</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Header Row */}
        <div className="flex items-end justify-between gap-4 mb-8 pb-4 border-b border-neutral-200/80">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0B5D44]">
              Saved Collection
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0C1412] tracking-tight mt-0.5">
              My Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 font-medium tabular-nums">
              {totalWishlistItems} saved item{totalWishlistItems !== 1 ? "s" : ""}
            </p>
          </div>

          {wishlist.length > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="text-xs font-semibold text-neutral-500 hover:text-rose-600 underline underline-offset-4 transition-colors cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="max-w-lg mx-auto my-6 sm:my-8 py-4 sm:py-8 text-center">
            <div className="mx-auto mb-5 flex items-center justify-center">
              <Logo80AnimatedMark
                theme={BRAND_80_THEMES[0]}
                surface="light"
                mode="ambient"
                size={56}
              />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3FAF7] border border-[#B8DFD1]/80 text-[11px] font-bold text-[#0B5D44] uppercase tracking-wider mb-3">
              <Heart className="w-3.5 h-3.5 text-[#0B5D44] stroke-[2.2] fill-none" />
              Curate Your Favorites
            </span>

            <h2 className="text-xl sm:text-2xl font-bold text-[#0C1412] mb-2 tracking-tight">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mb-7 leading-relaxed max-w-sm mx-auto">
              Tap the heart icon on any 100% original supplement, activewear piece, royal date box, or chocolate to keep it handy here — no login required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#0B5D44] hover:bg-[#074230] text-white font-bold text-sm shadow-md shadow-[#0B5D44]/20 transition-all"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4 stroke-[2.25]" />
              </Link>
              <Link
                href="/cart"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#F5F8F6] text-[#0C1412] border border-neutral-300 font-semibold text-sm transition-all"
              >
                <span>View Shopping Bag</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5">
            {wishlist.map((item) => {
              const discount =
                item.mrp && item.price < item.mrp
                  ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
                  : 0;
              const isOos =
                item.in_stock === 0 ||
                (item.stock_count !== undefined && item.stock_count <= 0);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-neutral-200/85 hover:border-[#0B5D44]/45 p-3 sm:p-4 flex flex-col justify-between shadow-[0_2px_12px_rgba(7,20,16,0.03)] hover:shadow-[0_12px_28px_rgba(11,93,68,0.08)] hover:-translate-y-0.5 transition-all duration-300 group relative"
                >
                  <div>
                    {/* Studio Image Container */}
                    <div className="relative block w-full aspect-square rounded-2xl overflow-hidden bg-[#F5F8F6] mb-3">
                      <Link
                        href={`/products/${item.slug || item.id}`}
                        className="block w-full h-full"
                      >
                        <Image
                          src={item.poster_image || "/vittal/product-whey-protein-jar.png"}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 20vw"
                          className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {discount > 0 && (
                        <span className="absolute top-2.5 left-2.5 bg-[#E6F4EF] text-[#074230] border border-[#B8DFD1] text-[10px] sm:text-[11px] font-bold tabular-nums px-2 py-0.5 rounded-full">
                          {discount}% OFF
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => removeFromWishlist(item.id)}
                        className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/95 backdrop-blur-xs text-neutral-400 hover:text-rose-600 hover:bg-white transition-colors z-10 border border-neutral-200/80 shadow-xs flex items-center justify-center cursor-pointer"
                        aria-label={`Remove ${item.name} from wishlist`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Category */}
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#0B5D44] truncate mb-1">
                      {item.category || "Original"}
                    </div>

                    {/* Title */}
                    <Link
                      href={`/products/${item.slug || item.id}`}
                      className="block text-xs sm:text-sm font-semibold text-[#0C1412] line-clamp-2 hover:text-[#0B5D44] transition-colors leading-snug mb-2 min-h-[34px] sm:min-h-[38px]"
                    >
                      {item.name}
                    </Link>
                  </div>

                  {/* Bottom Price + Silent Inline Add/Stepper Control */}
                  <div className="pt-2.5 border-t border-neutral-100 flex items-center justify-between gap-2">
                    <div className="tabular-nums min-w-0">
                      <span className="text-sm sm:text-base font-extrabold text-[#0C1412] block leading-tight">
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                      {item.mrp && item.mrp > item.price && (
                        <span className="text-[10.5px] text-neutral-400 line-through">
                          ₹{item.mrp.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    {isOos ? (
                      <span className="px-2.5 py-1.5 rounded-full bg-neutral-100 text-neutral-400 text-[10.5px] font-bold uppercase">
                        Sold Out
                      </span>
                    ) : (
                      <CardAddToCartControl
                        product={{
                          id: item.id,
                          name: item.name,
                          category: item.category,
                          price: item.price,
                          mrp: item.mrp,
                          poster_image: item.poster_image,
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Subtle Authenticity Footer Strip */}
        <div className="mt-12 flex items-center justify-center gap-2 text-xs text-neutral-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-[#0B5D44]" />
          <span>Every saved product is backed by our 100% Original Authenticity Guarantee</span>
        </div>
      </main>

      <Footer />
    </div>
  );
}
