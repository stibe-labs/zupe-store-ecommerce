"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingBag,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Truck,
  RotateCcw,
  Award,
} from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSearch } from "@/context/SearchContext";
import { launchFastrrCheckout } from "@/lib/fastrrClient";
import { addRecentlyViewed } from "@/lib/recentlyViewed";

interface VittalLifestyleStorefrontProps {
  initialProducts?: Product[];
}

// ---------------------------------------------------------------------------
// 5 Core Categories: Vittal Lifestyle Brand Departments
// ---------------------------------------------------------------------------
const CATEGORY_ITEMS = [
  {
    name: "Gym Supplements",
    link: "/products?category=Gym+Supplements",
    image: "/vittal/cat-icon-gym-supplements-trans.png",
  },
  {
    name: "Outfits",
    link: "/products?category=Outfits",
    image: "/vittal/cat-icon-outfits-trans.png",
  },
  {
    name: "Apparels",
    link: "/products?category=Apparels",
    image: "/vittal/cat-icon-apparels-trans.png",
  },
  {
    name: "Dates & Nuts",
    link: "/products?category=Dates+%26+Nuts",
    image: "/vittal/cat-icon-dates-trans.png",
  },
  {
    name: "Candy & Chocolates",
    link: "/products?category=Candy+%26+Chocolates",
    image: "/vittal/cat-icon-chocolates-trans.png",
  },
];

// ---------------------------------------------------------------------------
// 3 Hero Cutouts Rotating every 3 seconds over the static textured background
// ---------------------------------------------------------------------------
const HERO_CUTOUTS = [
  {
    image: "/vittal/cutout-hero-1.png",
    alt: "First Purchase Special Offer - Shopping Girl",
  },
  {
    image: "/vittal/cutout-hero-2.png",
    alt: "Muscular Athlete with VL Supplements",
  },
  {
    image: "/vittal/cutout-hero-3.png",
    alt: "Fitness Duo in Coordinated Black Activewear",
  },
];

export function VittalLifestyleStorefront({ initialProducts }: VittalLifestyleStorefrontProps) {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { openSearch } = useSearch();

  // 3-second auto-rotating hero cutout slides (total 3 slides)
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % HERO_CUTOUTS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const products = initialProducts && initialProducts.length > 0 ? initialProducts : [];

  // Filter products for homepage (10 items)
  const trendingProducts = useMemo(() => {
    return products.slice(0, 10);
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
        category: product.category || "Gym Supplementaries",
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

  return (
    <div className="bg-white text-neutral-900 font-mograph min-h-screen selection:bg-[#E5F2D0] selection:text-[#1E300E] pb-24 md:pb-12">
      {/* ===================================================================== */}
      {/* 1. LARGE ROUNDED SEARCH BAR WITH FILTER ICON                          */}
      {/* ===================================================================== */}
      <section className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 pt-1 sm:pt-2 pb-2 sm:pb-3">
        <div
          onClick={() => openSearch()}
          className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto bg-[#F7F8FA] hover:bg-[#EFF1F4] border border-neutral-200/70 rounded-full py-2.5 sm:py-3 px-4 sm:px-5 flex items-center justify-between transition-all duration-200 shadow-2xs cursor-pointer group"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Search className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 transition-colors shrink-0 stroke-[2]" />
            <span className="text-xs sm:text-sm text-neutral-400 font-normal truncate">
              Search for supplements...
            </span>
          </div>

          {/* Vertical divider line right before filter icon matching reference */}
          <div className="w-[1px] h-5 bg-neutral-200/90 mx-3 shrink-0" />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openSearch();
            }}
            className="p-1 text-neutral-800 hover:text-black transition-colors shrink-0 cursor-pointer"
            aria-label="Filter products"
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[2]" />
          </button>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. HERO BANNER CARD (ROTATING CUTOUTS WITH STATIC TEXT & BG)          */}
      {/* ===================================================================== */}
      <section className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
        <div className="relative rounded-3xl sm:rounded-[32px] overflow-hidden bg-[#95CF42] border border-[#85BE33]/50 shadow-sm min-h-[250px] sm:min-h-[300px] md:min-h-[360px] lg:min-h-[440px] flex items-center">
          
          {/* Static Lime Green Textured Background (Never changes) */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/vittal/banner-hero-green-texture.jpg"
              alt="Hero Textured Background"
              fill
              priority
              className="object-cover object-center"
            />
          </div>

          {/* Subtle Organic Fluid Wave Pattern Behind Cutouts */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25 z-0">
            <svg className="w-full h-full object-cover" viewBox="0 0 800 450" fill="none" preserveAspectRatio="none">
              <path d="M -100,50 Q 200,200 400,100 T 900,150" stroke="#7EBA2B" strokeWidth="40" fill="none" />
              <path d="M -50,150 Q 250,300 500,200 T 950,250" stroke="#7EBA2B" strokeWidth="50" fill="none" />
              <path d="M -100,280 Q 200,420 500,320 T 900,400" stroke="#7EBA2B" strokeWidth="60" fill="none" />
            </svg>
          </div>

          {/* 3 Cutout Images Rotating Every 3 Seconds (Smooth crossfade on the right) */}
          <div className="absolute inset-0 z-[5] pointer-events-none">
            {HERO_CUTOUTS.map((cutout, idx) => (
              <div
                key={cutout.image}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  activeHeroIndex === idx ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src={cutout.image}
                  alt={cutout.alt}
                  fill
                  priority={idx === 0}
                  className="object-cover object-right"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 1680px"
                />
              </div>
            ))}
          </div>

          {/* Static Left Content Overlay (Never changes) */}
          <div className="relative z-10 px-4 sm:px-8 lg:px-12 py-5 sm:py-8 md:py-10 max-w-[50%] xs:max-w-[48%] sm:max-w-md md:max-w-lg lg:max-w-xl">
            {/* Black Pill Eyebrow Badge */}
            <div className="inline-block bg-[#111111] text-white text-[9px] sm:text-xs font-semibold px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full mb-2 sm:mb-3.5 shadow-xs">
              Limited Offer
            </div>

            {/* Headline matching reference - mobile size reduced for clean separation from cutouts */}
            <h1 className="font-mograph font-bold text-[15px] xs:text-base sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-[#111111] leading-tight sm:leading-[1.12] tracking-tight mb-2.5 sm:mb-6">
              First Purchase Enjoy
              <br />
              a Special Offer
            </h1>

            {/* Black Pill CTA Button with White Circle Up-Right Arrow -> Redirects to /products */}
            <Link
              href="/products"
              className="inline-flex items-center gap-2 sm:gap-3 bg-[#111111] hover:bg-black text-white font-bold text-[11px] sm:text-sm pl-3.5 pr-1 py-1 sm:pl-5 sm:pr-2 sm:py-2 rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 group"
            >
              <span>Shop Now</span>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white text-[#111111] flex items-center justify-center shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shadow-xs">
                <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 stroke-[2.5]" />
              </div>
            </Link>
          </div>

          {/* Signature Bottom Scoop Notch with 3 Pagination Indicators Synced to Active Hero Index */}
          <div className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
            <div className="relative">
              {/* Arched scoop cutting into the card from page background */}
              <svg
                viewBox="0 0 160 30"
                className="w-32 sm:w-40 md:w-48 h-6 sm:h-7 md:h-8 fill-white block"
                preserveAspectRatio="none"
              >
                <path d="M 0,30 C 22,30 26,0 48,0 L 112,0 C 134,0 138,30 160,30 Z" />
              </svg>

              {/* 3 Indicators inside scoop */}
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 sm:gap-2 pb-0.5 pointer-events-auto">
                {HERO_CUTOUTS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveHeroIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`transition-all duration-300 cursor-pointer ${
                      activeHeroIndex === idx
                        ? "w-6 sm:w-7 h-1.5 sm:h-2 rounded-full bg-[#B8ED3E] shadow-2xs"
                        : "w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-neutral-300 hover:bg-neutral-400"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. CATEGORIES SECTION (Light-Grey Rounded Cards)                      */}
      {/* ===================================================================== */}
      <section className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#111111] tracking-tight">
            Categories
          </h2>
          <Link
            href="/products"
            className="text-xs sm:text-sm font-semibold text-[#6B9E3A] hover:text-[#527C2B] flex items-center gap-0.5 transition-colors"
          >
            <span>See all</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 5-Column Responsive Cards Grid matching Cult Reference */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-3 md:gap-4 lg:gap-5 w-full">
          {CATEGORY_ITEMS.map((cat) => (
            <Link
              key={cat.name}
              href={cat.link}
              className="group relative rounded-xl sm:rounded-2xl md:rounded-3xl bg-[#111111] border border-neutral-200/90 hover:border-black/70 flex flex-col items-center justify-between transition-all duration-300 hover:-translate-y-1 shadow-2xs hover:shadow-md cursor-pointer overflow-hidden"
            >
              {/* Top Image Section: Banner Lime Green Background with Inward-Curved Bottom Corners */}
              <div className="w-full bg-[#B8ED3E] rounded-b-[12px] sm:rounded-b-[18px] md:rounded-b-[24px] flex items-center justify-center p-1.5 sm:p-2.5 md:p-3 aspect-[1/1.05] relative">
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 20vw, (max-width: 1024px) 20vw, 260px"
                    className="object-contain p-0.5 sm:p-1 group-hover:scale-108 transition-transform duration-300 drop-shadow-xs"
                  />
                </div>
              </div>

              {/* Bottom Label Section: Solid Black with Bold White Text */}
              <div className="w-full bg-[#111111] py-1.5 sm:py-2.5 md:py-3 px-1 sm:px-2 flex items-center justify-center text-center mt-auto min-h-[30px] xs:min-h-[34px] sm:min-h-[40px] md:min-h-[46px]">
                <span className="font-mograph font-bold text-[9px] xs:text-[10px] sm:text-xs md:text-sm lg:text-[15px] text-white group-hover:text-[#B8ED3E] tracking-tight leading-tight transition-colors line-clamp-2 block w-full px-0.5">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. NEW ARRIVALS (Product Cards matching mockup)                       */}
      {/* ===================================================================== */}
      <section className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#111111] tracking-tight">
            New Arrivals
          </h2>
          <Link
            href="/products"
            className="text-xs sm:text-sm font-semibold text-[#6B9E3A] hover:text-[#527C2B] flex items-center gap-0.5 transition-colors"
          >
            <span>See all</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product Cards Grid: Mobile 2 per row, Desktop 5 per row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 w-full">
          {trendingProducts.map((product) => {
            const isWish = isInWishlist(product.id);
            const discountPercent =
              product.mrp && product.mrp > product.price
                ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                : null;

            return (
              <div
                key={product.id}
                className="group relative rounded-3xl bg-white border border-neutral-200/80 hover:border-[#6B9E3A]/50 p-3 sm:p-4 flex flex-col justify-between transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1"
              >
                {/* Wishlist Heart Icon */}
                <button
                  type="button"
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
                  className="absolute top-3.5 right-3.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-neutral-400 hover:text-rose-500 transition-colors shadow-2xs"
                  aria-label="Wishlist"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isWish ? "fill-rose-500 text-rose-500" : "stroke-current"
                    }`}
                  />
                </button>

                {/* Product Poster Image Container with Pastel Lime Gradient Backing */}
                <Link
                  href={`/products/${product.id || product.slug}`}
                  className="relative aspect-square w-full rounded-2xl bg-gradient-to-b from-[#F2F8EB] via-[#F8FAF4] to-[#FFFFFF] p-3 flex items-center justify-center overflow-hidden mb-2.5"
                >
                  <Image
                    src={product.poster_image || "/vittal/product-whey-protein-jar.png"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                {/* Product Metadata */}
                <div>
                  <Link
                    href={`/products/${product.id || product.slug}`}
                    className="block"
                  >
                    <h3 className="font-semibold text-xs sm:text-sm text-neutral-900 group-hover:text-[#6B9E3A] transition-colors leading-snug line-clamp-2 min-h-[34px] sm:min-h-[38px] mb-1">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Price Row */}
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-sm sm:text-base font-extrabold text-neutral-950">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    {product.mrp && product.mrp > product.price && (
                      <span className="text-xs text-neutral-400 line-through">
                        ₹{product.mrp.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  {/* Discount Badge & Add to Cart Button */}
                  <div className="flex items-center justify-between gap-2">
                    {discountPercent ? (
                      <span className="bg-[#E5F2D0] text-[#3B581C] text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center">
                        {discountPercent}% OFF
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-500 font-medium">In Stock</span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, product)}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[#E5F2D0] hover:bg-[#D5EBBF] text-[#3B581C] hover:text-[#284214] flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
                      title="Add to Cart"
                      aria-label="Add to Cart"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. FRESH WINTERWEAR DROPS (Campaign Showcase)                         */}
      {/* ===================================================================== */}
      <section className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Top Header Banner */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-[#EBF5DF] via-[#E2F0CE] to-[#D5E9BB] border border-[#D5E9BC]/70 p-5 sm:p-7 md:p-8 text-center mb-3 sm:mb-5 shadow-xs">
          <h3 className="relative font-movault text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#15230D] tracking-wide mb-1 sm:mb-2">
            Fresh <span className="font-mograph italic font-bold text-[#6B9E3A]">Winterwear</span> Drops
          </h3>
          <p className="relative font-movault text-xs sm:text-sm md:text-base font-bold text-[#415C29] tracking-[0.2em] uppercase">
            #UninterruptedByWinter
          </p>
        </div>

        {/* 3 Campaign Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-2.5 sm:gap-3.5 md:gap-4 lg:gap-5 w-full items-stretch">
          
          {/* Card 1: Jackets & Sweatshirts */}
          <Link
            href="/products?category=Apparels"
            className="group col-span-1 row-span-2 md:col-span-6 lg:col-span-5 md:row-span-1 rounded-2xl sm:rounded-3xl bg-white hover:bg-neutral-50 border border-neutral-200/90 hover:border-[#6B9E3A]/60 p-3 sm:p-4 md:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-md cursor-pointer"
          >
            {/* Image */}
            <div className="order-1 md:order-2 relative aspect-[4/4.8] md:aspect-[4/4.5] w-full md:w-[48%] rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200/60">
              <Image
                src="/vittal/drop-jackets.png"
                alt="Jackets & Sweatshirts"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 360px"
              />
            </div>

            {/* Text info */}
            <div className="order-2 md:order-1 flex flex-col justify-end md:justify-center flex-1 min-w-0 pr-0 md:pr-2">
              <h4 className="font-movault text-base sm:text-lg md:text-xl lg:text-2xl font-black uppercase italic tracking-wide text-neutral-950 leading-tight mb-1.5 group-hover:text-[#6B9E3A] transition-colors">
                Jackets &amp; Sweatshirts
              </h4>
              <div className="mt-auto md:mt-2">
                <span className="font-mograph text-[9px] sm:text-[10px] md:text-xs text-neutral-500 font-bold uppercase tracking-wider block mb-0.5">
                  Starting At
                </span>
                <span className="font-movault text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-[#6B9E3A] tracking-tight">
                  ₹999<span className="text-xs sm:text-sm font-normal text-neutral-400">*</span>
                </span>
              </div>
            </div>
          </Link>

          {/* Card 2: Joggers & Track Pants */}
          <Link
            href="/products?category=Outfits"
            className="group col-span-1 md:col-span-3 lg:col-span-3.5 rounded-2xl sm:rounded-3xl bg-white hover:bg-neutral-50 border border-neutral-200/90 hover:border-[#6B9E3A]/60 p-3 sm:p-4 md:p-5 flex flex-col justify-between gap-2.5 sm:gap-3 transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-md cursor-pointer"
          >
            {/* Image on top */}
            <div className="relative aspect-[4/3] sm:aspect-[4/3.2] md:aspect-[4/3] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200/60 shrink-0">
              <Image
                src="/vittal/drop-joggers.png"
                alt="Joggers & Track Pants"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 300px"
              />
            </div>

            {/* Text at bottom */}
            <div className="flex items-end justify-between gap-1 mt-auto pt-1">
              <div className="min-w-0 flex-1">
                <h4 className="font-movault text-xs sm:text-sm md:text-base font-black uppercase tracking-wide text-neutral-950 leading-tight mb-1 truncate group-hover:text-[#6B9E3A] transition-colors">
                  Joggers &amp; Track Pants
                </h4>
                <span className="font-mograph text-[9px] sm:text-[10px] text-neutral-500 font-bold uppercase tracking-wider block mb-0.5">
                  Starting At
                </span>
                <span className="font-movault text-base sm:text-lg md:text-xl lg:text-2xl font-black text-[#6B9E3A] tracking-tight">
                  ₹899<span className="text-xs font-normal text-neutral-400">*</span>
                </span>
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#E5F2D0] group-hover:bg-[#6B9E3A] text-[#3B581C] group-hover:text-white flex items-center justify-center transition-all shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              </div>
            </div>
          </Link>

          {/* Card 3: Full Sleeve T-Shirts */}
          <Link
            href="/products?category=Apparels"
            className="group col-span-1 md:col-span-3 lg:col-span-3.5 rounded-2xl sm:rounded-3xl bg-white hover:bg-neutral-50 border border-neutral-200/90 hover:border-[#6B9E3A]/60 p-3 sm:p-4 md:p-5 flex flex-col justify-between gap-2.5 sm:gap-3 transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-md cursor-pointer"
          >
            {/* Image on top */}
            <div className="relative aspect-[4/3] sm:aspect-[4/3.2] md:aspect-[4/3] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200/60 shrink-0">
              <Image
                src="/vittal/drop-tees.png"
                alt="Full Sleeve T-Shirts"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 300px"
              />
            </div>

            {/* Text at bottom */}
            <div className="flex items-end justify-between gap-1 mt-auto pt-1">
              <div className="min-w-0 flex-1">
                <h4 className="font-movault text-xs sm:text-sm md:text-base font-black uppercase tracking-wide text-neutral-950 leading-tight mb-1 truncate group-hover:text-[#6B9E3A] transition-colors">
                  Full Sleeve T-Shirts
                </h4>
                <span className="font-mograph text-[9px] sm:text-[10px] text-neutral-500 font-bold uppercase tracking-wider block mb-0.5">
                  Starting At
                </span>
                <span className="font-movault text-base sm:text-lg md:text-xl lg:text-2xl font-black text-[#6B9E3A] tracking-tight">
                  ₹799<span className="text-xs font-normal text-neutral-400">*</span>
                </span>
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#E5F2D0] group-hover:bg-[#6B9E3A] text-[#3B581C] group-hover:text-white flex items-center justify-center transition-all shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              </div>
            </div>
          </Link>

        </div>
      </section>

      {/* ===================================================================== */}
      {/* 6. BRAND VALUE PROPOSITIONS STRIP                                     */}
      {/* ===================================================================== */}
      <section className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="rounded-3xl bg-[#F4F5F7] border border-neutral-200/80 p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center shadow-xs">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#E5F2D0] text-[#3B581C] border border-[#D5E9BC] flex items-center justify-center mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-neutral-950 mb-0.5">100% Certified</h4>
            <p className="text-[10px] sm:text-xs text-neutral-500 font-medium">Lab-tested pure ingredients</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#E5F2D0] text-[#3B581C] border border-[#D5E9BC] flex items-center justify-center mb-2">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-neutral-950 mb-0.5">Pan-India Express</h4>
            <p className="text-[10px] sm:text-xs text-neutral-500 font-medium">Insured express doorstep delivery</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#E5F2D0] text-[#3B581C] border border-[#D5E9BC] flex items-center justify-center mb-2">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-neutral-950 mb-0.5">Hassle-Free Returns</h4>
            <p className="text-[10px] sm:text-xs text-neutral-500 font-medium">7-day easy exchange guarantee</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#E5F2D0] text-[#3B581C] border border-[#D5E9BC] flex items-center justify-center mb-2">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-neutral-950 mb-0.5">Direct Farm &amp; Factory</h4>
            <p className="text-[10px] sm:text-xs text-neutral-500 font-medium">Sourced at source for purity</p>
          </div>
        </div>
      </section>
    </div>
  );
}
