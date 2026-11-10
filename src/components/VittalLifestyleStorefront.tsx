"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Zap,
  ArrowRight,
  ChevronRight,
  Star,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Dumbbell,
  Layers,
  Award,
} from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { launchFastrrCheckout } from "@/lib/fastrrClient";
import { addRecentlyViewed } from "@/lib/recentlyViewed";

interface VittalLifestyleStorefrontProps {
  initialProducts?: Product[];
}

// ---------------------------------------------------------------------------
// 5 Core Categories with Custom SVG Line Icons matching the mockup
// ---------------------------------------------------------------------------
const CATEGORY_ITEMS = [
  {
    name: "Gym Supplements",
    link: "/products?category=Gym+Supplementaries",
    icon: (
      <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6.5 6.5 11 11" />
        <path d="m21 21-1-1" />
        <path d="m3 3 1 1" />
        <path d="m18 22 4-4" />
        <path d="m2 6 4-4" />
        <path d="m3 10 7-7" />
        <path d="m14 21 7-7" />
      </svg>
    ),
  },
  {
    name: "Outfits",
    link: "/products?category=Outfits",
    icon: (
      <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 7a4 4 0 0 0-8 0c0 1.5.8 2.8 2 3.5V11L2 17a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2l-8-6v-.5c1.2-.7 2-2 2-3.5Z" />
        <path d="M12 11v3" />
      </svg>
    ),
  },
  {
    name: "Apparels",
    link: "/products?category=Apparels",
    icon: (
      <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
      </svg>
    ),
  },
  {
    name: "Dates & Nuts",
    link: "/products?category=Dates+%26+Nuts",
    icon: (
      <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="12" rx="8" ry="5" transform="rotate(-30 12 12)" />
        <path d="M8 8c2 3 5 4 8 4" />
        <path d="M6 14c2-1 4-1 6 0" />
      </svg>
    ),
  },
  {
    name: "Candy & Chocolates",
    link: "/products?category=Candy+%26+Chocolates",
    icon: (
      <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9.5 7.5-2-2a2 2 0 0 0-2.8 0l-.2.2a2 2 0 0 0 0 2.8l2 2" />
        <path d="m14.5 16.5 2 2a2 2 0 0 0 2.8 0l.2-.2a2 2 0 0 0 0-2.8l-2-2" />
        <circle cx="12" cy="12" r="5" />
        <path d="m9.5 14.5 5-5" />
      </svg>
    ),
  },
];

export function VittalLifestyleStorefront({ initialProducts }: VittalLifestyleStorefrontProps) {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  // Auto-rotate hero indicator
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroSlide((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const products = initialProducts && initialProducts.length > 0 ? initialProducts : [];

  // Filter trending products for the homepage
  const trendingProducts = useMemo(() => {
    return products.slice(0, 8);
  }, [products]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    addItem(
      {
        id: product.id,
        slug: product.slug || product.id,
        name: product.name,
        price: product.price,
        mrp: product.mrp,
        offer_price: product.price,
        stock_count: product.stock_count || 50,
        poster_image: product.poster_image || "/vittal/product-whey-protein-jar.png",
        in_stock: product.in_stock ?? 1,
        category: product.category || "Fitness",
        tagline: product.tagline || "",
        description: product.description || "",
      },
      1
    );
    addRecentlyViewed({
      id: product.id,
      slug: product.slug || product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      poster_image: product.poster_image,
      category: product.category,
    });
    openCart();
  };

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    const id = product.id;
    const name = product.name;
    const price = product.price;
    const image = product.poster_image || "/vittal/product-whey-protein-jar.png";

    addItem(
      {
        id,
        slug: product.slug || id,
        name,
        price,
        mrp: product.mrp,
        offer_price: price,
        stock_count: product.stock_count || 50,
        poster_image: image,
        in_stock: product.in_stock ?? 1,
        category: product.category || "Fitness",
        tagline: product.tagline || "",
        description: product.description || "",
      },
      1
    );

    try {
      launchFastrrCheckout([{ id, name, price, quantity: 1, image }]);
    } catch {
      router.push(`/checkout?productId=${id}&qty=1`);
    }
  };

  return (
    <div className="bg-[#0B0B0C] text-white font-mograph min-h-screen selection:bg-[#D4AF37] selection:text-black">
      {/* ===================================================================== */}
      {/* 1. HERO SECTION (Edge-to-Edge Sleek Banner - No Outer Card Box)      */}
      {/* ===================================================================== */}
      <section className="relative w-full overflow-hidden bg-black border-b border-white/5">
        <div className="relative w-full h-[250px] sm:h-[320px] md:h-[380px] lg:h-[420px] flex items-center">
          {/* Athlete Hero Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/vittal/hero-fitness-gold.png"
              alt="Live Better. Feel Stronger - Vittal Lifestyle"
              fill
              priority
              className="object-cover object-[75%_center] sm:object-right md:object-center"
            />
            {/* Cinematic Gradient Overlays: Darker on the left for crisp text contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 sm:via-black/60 to-transparent z-1" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-1" />
          </div>

          {/* Hero Content Overlay */}
          <div className="relative z-10 max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-start justify-center">
            <div className="max-w-xs sm:max-w-md lg:max-w-lg">
              {/* Small Subtitle */}
              <span className="font-movault text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-[#D4AF37] block mb-1">
                VITTAL LIFESTYLE
              </span>

              {/* Main Headline */}
              <h1 className="font-movault text-2xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wider text-white leading-[0.95] mb-1.5 sm:mb-2.5">
                Live Better.
                <br />
                <span className="text-[#D4AF37]">Feel Stronger.</span>
              </h1>

              {/* Tagline */}
              <p className="font-mograph text-[11px] sm:text-sm text-neutral-300 font-medium leading-relaxed mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                Your One-Stop Lifestyle Store for Fitness, Fashion &amp; More.
              </p>

              {/* CTA Button */}
              <Link
                href="/products"
                className="font-movault tracking-wider uppercase inline-flex items-center gap-2 bg-[#D4A373] hover:bg-[#C89565] text-neutral-950 font-bold text-xs sm:text-sm px-5 py-2 sm:px-6 sm:py-2.5 rounded-full transition-all transform hover:scale-105 shadow-md shadow-[#D4A373]/20"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </Link>

              {/* Carousel Navigation Indicator Dots */}
              <div className="flex items-center gap-1.5 mt-3 sm:mt-4">
                <span
                  className={`transition-all duration-300 rounded-full h-1 ${
                    activeHeroSlide === 0 ? "w-6 bg-[#D4AF37]" : "w-1.5 bg-neutral-600"
                  }`}
                />
                <span
                  className={`transition-all duration-300 rounded-full h-1 ${
                    activeHeroSlide === 1 ? "w-6 bg-[#D4AF37]" : "w-1.5 bg-neutral-600"
                  }`}
                />
                <span
                  className={`transition-all duration-300 rounded-full h-1 ${
                    activeHeroSlide === 2 ? "w-6 bg-[#D4AF37]" : "w-1.5 bg-neutral-600"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. CATEGORY NAVIGATION (5 Dark Rounded Cards matching mockup)         */}
      {/* ===================================================================== */}
      <section className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
        <div className="grid grid-cols-5 gap-2 sm:gap-4 md:gap-6">
          {CATEGORY_ITEMS.map((cat) => (
            <Link
              key={cat.name}
              href={cat.link}
              className="group bg-[#141416] hover:bg-[#1C1C20] border border-white/10 hover:border-[#D4AF37]/50 rounded-2xl p-2.5 sm:p-5 flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md"
            >
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white group-hover:text-[#D4AF37] transition-colors mb-1.5 sm:mb-2">
                {cat.icon}
              </div>
              <span className="font-mograph text-[10px] sm:text-xs font-semibold text-neutral-300 group-hover:text-white leading-tight line-clamp-2">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. PROMO BANNER (Compact Height, Full-Card Background Image Fill)     */}
      {/* ===================================================================== */}
      <section className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-xl h-[155px] sm:h-[185px] md:h-[210px] lg:h-[230px] flex items-center bg-black">
          {/* Background Image: Fills entire card with products on right */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/vittal/banner-showcase-protein.png"
              alt="Premium Quality Deals - Up to 50% OFF"
              fill
              className="object-cover object-[80%_center] sm:object-right"
              priority
            />
            {/* Cinematic Gradient: Dark overlay on left for sharp text legibility, transparent on right */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 sm:via-black/55 to-transparent z-1" />
          </div>

          {/* Left Text Overlay */}
          <div className="relative z-10 px-4 sm:px-8 lg:px-10 max-w-[62%] sm:max-w-md">
            <div className="flex items-center gap-2 mb-1 sm:mb-1.5">
              <span className="font-movault text-[9px] sm:text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
                PREMIUM QUALITY
              </span>
              <span className="w-5 sm:w-10 h-[1px] bg-neutral-600/80" />
            </div>

            <h2 className="font-movault text-xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wide text-white leading-none mb-1 sm:mb-1.5">
              Up to <span className="text-[#D4AF37]">50% OFF</span>
            </h2>

            <p className="font-mograph text-[10px] sm:text-xs md:text-sm text-neutral-300 mb-2.5 sm:mb-3.5 font-medium line-clamp-1">
              On Your Favorite Picks
            </p>

            <Link
              href="/products?category=Gym+Supplementaries"
              className="font-movault tracking-wider uppercase inline-flex items-center gap-1.5 sm:gap-2 border border-[#D4AF37]/80 hover:bg-[#D4AF37] hover:text-black text-white text-[10px] sm:text-xs font-bold px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full transition-all hover:scale-105"
            >
              <span>Shop Deals</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. TRENDING NOW SECTION (Product Cards matching mockup)               */}
      {/* ===================================================================== */}
      <section className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="font-movault text-2xl sm:text-4xl font-bold uppercase tracking-wider text-white">
            Trending Now
          </h2>
          <Link
            href="/products"
            className="font-mograph text-xs sm:text-sm font-semibold text-neutral-400 hover:text-[#D4AF37] flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
          {trendingProducts.map((product) => {
            const isWish = isInWishlist(product.id);
            const discountPercent =
              product.mrp && product.mrp > product.price
                ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                : null;

            return (
              <div
                key={product.id}
                className="group relative rounded-2xl bg-[#141416] hover:bg-[#1A1A1E] border border-white/5 hover:border-white/20 p-3 sm:p-4 flex flex-col justify-between transition-all duration-200 shadow-md hover:shadow-xl"
              >
                {/* Wishlist Heart Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWishlist({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.poster_image,
                    });
                  }}
                  className="absolute top-3.5 right-3.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md flex items-center justify-center text-neutral-400 hover:text-rose-500 transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                      isWish ? "fill-rose-500 text-rose-500" : "stroke-current"
                    }`}
                  />
                </button>

                {/* Product Image Link */}
                <Link
                  href={`/products/${product.id || product.slug}`}
                  className="relative w-full aspect-square rounded-xl overflow-hidden bg-neutral-900/60 mb-3 flex items-center justify-center p-2"
                >
                  <Image
                    src={product.poster_image || "/vittal/product-whey-protein-jar.png"}
                    alt={product.name}
                    fill
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                {/* Product Metadata */}
                <div>
                  <Link
                    href={`/products/${product.id || product.slug}`}
                    className="block"
                  >
                    <h3 className="font-mograph text-xs sm:text-sm font-semibold text-white group-hover:text-[#D4AF37] transition-colors truncate mb-1">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Price Row */}
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-mograph text-sm sm:text-base font-extrabold text-white">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    {product.mrp && product.mrp > product.price && (
                      <span className="font-mograph text-[11px] sm:text-xs text-neutral-500 line-through">
                        ₹{product.mrp.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  {/* Discount Badge & Quick Actions */}
                  <div className="flex items-center justify-between gap-2 mt-2">
                    {discountPercent ? (
                      <span className="font-movault bg-[#2B2317] text-[#E5C07B] text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded">
                        {discountPercent}% OFF
                      </span>
                    ) : (
                      <span className="font-mograph text-[10px] text-neutral-500 font-medium">In Stock</span>
                    )}

                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="bg-white/10 hover:bg-[#D4AF37] hover:text-black text-white p-1.5 rounded-lg transition-colors"
                      title="Add to Bag"
                      aria-label="Add to Bag"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. BRAND VALUE PROPOSITIONS STRIP                                     */}
      {/* ===================================================================== */}
      <section className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="rounded-3xl bg-[#141416] border border-white/5 p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#272015] text-[#D4AF37] flex items-center justify-center mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-movault text-sm sm:text-base font-bold uppercase tracking-wide text-white mb-0.5">100% Certified</h4>
            <p className="font-mograph text-[10px] sm:text-xs text-neutral-400">Lab-tested pure ingredients</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#272015] text-[#D4AF37] flex items-center justify-center mb-2">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="font-movault text-sm sm:text-base font-bold uppercase tracking-wide text-white mb-0.5">Pan-India Express</h4>
            <p className="font-mograph text-[10px] sm:text-xs text-neutral-400">Insured express doorstep delivery</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#272015] text-[#D4AF37] flex items-center justify-center mb-2">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h4 className="font-movault text-sm sm:text-base font-bold uppercase tracking-wide text-white mb-0.5">Hassle-Free Returns</h4>
            <p className="font-mograph text-[10px] sm:text-xs text-neutral-400">7-day easy exchange guarantee</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#272015] text-[#D4AF37] flex items-center justify-center mb-2">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-movault text-sm sm:text-base font-bold uppercase tracking-wide text-white mb-0.5">Direct Farm & Factory</h4>
            <p className="font-mograph text-[10px] sm:text-xs text-neutral-400">Sourced at source for purity</p>
          </div>
        </div>
      </section>
    </div>
  );
}

