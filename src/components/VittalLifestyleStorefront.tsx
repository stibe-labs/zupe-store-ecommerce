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
  Award,
  Truck,
  BadgeCheck,
  Star,
  PackageCheck,
  RotateCcw,
} from "lucide-react";
import { Product } from "@/types/product";
import {
  HeroBannerSlide,
  DEFAULT_HERO_BANNERS,
  SportswearCampaignConfig,
  DEFAULT_SPORTSWEAR_CAMPAIGN,
  SupplementShowcaseConfig,
  DEFAULT_SUPPLEMENT_SHOWCASE,
  ShowcaseCollectionsConfig,
  DEFAULT_SHOWCASE_COLLECTIONS,
} from "@/lib/storeContent";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSearch } from "@/context/SearchContext";
import { launchFastrrCheckout } from "@/lib/fastrrClient";
import { addRecentlyViewed } from "@/lib/recentlyViewed";
import { SupplementCategoryShowcase } from "@/components/SupplementCategoryShowcase";
import { CardAddToCartControl } from "@/components/CardAddToCartControl";

interface VittalLifestyleStorefrontProps {
  initialProducts?: Product[];
  initialHeroBanners?: HeroBannerSlide[];
  initialSportswearCampaign?: SportswearCampaignConfig;
  initialSupplementShowcase?: SupplementShowcaseConfig;
  initialShowcaseCollections?: ShowcaseCollectionsConfig;
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
  {
    name: "All Categories",
    link: "/products",
    image: "/vittal/cat-icon-all-categories-trans.png",
    desktopOnly: true,
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

// ---------------------------------------------------------------------------
// Curated 10 New Arrivals for Homepage Grid:
// 1. T-Shirt: Crimson Red VL Core Performance Athletic T-Shirt
// 2. Dates: Royal Saudi Medjool Glossy Dates (Gold Lid Jar)
// 3. Cashew Nuts: Premium Jumbo Roasted Cashews (Gold Lid Jar)
// 4. Ferrero Rocher Candy: Ferrero Rocher Golden Luxury Truffle Hazelnut Gift Box
// 5. Nike Shoe: Nike Air Zoom Pegasus Athletic Running Sneakers (Black/White)
// 6. Ladies Seamless Compression: Charcoal Seamless Ribbed Compression Activewear Set
// 7. Makeup Set: Luxury Gold & Obsidian Deluxe Makeup Palette & Brush Collection
// 8. Frosted Perfume: Frosted Gunmetal Eau de Parfum 100ml
// 9. Track Jacket: Nike Pro Charcoal Full-Zip Dri-FIT Performance Track Jacket
// 10. Creatine: Optimum Nutrition Micronized Creatine
// ---------------------------------------------------------------------------
const HOMEPAGE_NEW_ARRIVALS_ORDER = [
  "red-vl-athletic-tee",
  "golden-jar-glossy-dates",
  "glass-jar-cashews",
  "golden-ferrero-rocher-box",
  "nike-air-zoom-sneaker",
  "charcoal-seamless-activewear",
  "luxury-makeup-collection",
  "frosted-gunmetal-parfum",
  "nike-pro-charcoal-jacket",
  "on-creatine-container",
];

export function VittalLifestyleStorefront({
  initialProducts,
  initialHeroBanners,
  initialSportswearCampaign,
  initialSupplementShowcase,
  initialShowcaseCollections,
}: VittalLifestyleStorefrontProps) {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { openSearch } = useSearch();

  // Dynamic Showcase Collections (New Arrivals & Best Sellers)
  const [showcaseCollections, setShowcaseCollections] = useState<ShowcaseCollectionsConfig>(
    initialShowcaseCollections || DEFAULT_SHOWCASE_COLLECTIONS
  );

  useEffect(() => {
    if (initialShowcaseCollections) {
      setShowcaseCollections(initialShowcaseCollections);
      return;
    }
    let isMounted = true;
    async function loadCollections() {
      try {
        const res = await fetch("/api/content/showcase");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.collections && isMounted) {
            setShowcaseCollections(data.collections);
          }
        }
      } catch {
        // Fallback
      }
    }
    loadCollections();
    return () => {
      isMounted = false;
    };
  }, [initialShowcaseCollections]);

  // Real-time sync listener for showcase collections updates
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.collections) {
        setShowcaseCollections(e.detail.collections);
      }
    };
    window.addEventListener("vittal_showcase_updated" as any, handleUpdate);
    return () => window.removeEventListener("vittal_showcase_updated" as any, handleUpdate);
  }, []);

  // Dynamic Hero Banner Slides from Admin / D1
  const [heroBanners, setHeroBanners] = useState<HeroBannerSlide[]>(
    initialHeroBanners && initialHeroBanners.length > 0
      ? initialHeroBanners
      : DEFAULT_HERO_BANNERS
  );

  // Dynamic Sportswear Campaign from Admin / D1
  const [sportswearCampaign, setSportswearCampaign] = useState<SportswearCampaignConfig>(
    initialSportswearCampaign || DEFAULT_SPORTSWEAR_CAMPAIGN
  );

  // Real-time sync listener for sportswear drops updates
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.config) {
        setSportswearCampaign(e.detail.config);
      }
    };
    window.addEventListener("vittal_sportswear_updated" as any, handleUpdate);
    return () => window.removeEventListener("vittal_sportswear_updated" as any, handleUpdate);
  }, []);

  // Dynamic categories from Admin / D1
  const [categoryItems, setCategoryItems] = useState(CATEGORY_ITEMS);

  useEffect(() => {
    async function loadDynamicCategories() {
      try {
        const res = await fetch("/api/content/categories");
        const data = await res.json();
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          const active = data.categories.filter((c: any) => c.active !== false);
          const mapped = active.map((c: any) => {
            const isAll = c.id === "all" || (c.name || "").toLowerCase() === "all categories";
            return {
              name: c.name,
              link: isAll ? "/products" : `/products?category=${encodeURIComponent(c.slug || c.name)}`,
              image: c.customIcon || (isAll ? "/vittal/cat-icon-all-categories-trans.png" : "/vittal/cat-icon-gym-supplements-trans.png"),
              desktopOnly: isAll,
            };
          });
          if (mapped.length > 0) {
            setCategoryItems(mapped);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch dynamic categories on storefront:", err);
      }
    }
    loadDynamicCategories();

    const handleCatUpdate = (e: any) => {
      if (e?.detail?.categories && Array.isArray(e.detail.categories)) {
        const active = e.detail.categories.filter((c: any) => c.active !== false);
        const mapped = active.map((c: any) => {
          const isAll = c.id === "all" || (c.name || "").toLowerCase() === "all categories";
          return {
            name: c.name,
            link: isAll ? "/products" : `/products?category=${encodeURIComponent(c.slug || c.name)}`,
            image: c.customIcon || (isAll ? "/vittal/cat-icon-all-categories-trans.png" : "/vittal/cat-icon-gym-supplements-trans.png"),
            desktopOnly: isAll,
          };
        });
        if (mapped.length > 0) {
          setCategoryItems(mapped);
        }
      }
    };
    window.addEventListener("vittal_categories_updated" as any, handleCatUpdate);
    window.addEventListener("zupe_categories_updated" as any, handleCatUpdate);
    return () => {
      window.removeEventListener("vittal_categories_updated" as any, handleCatUpdate);
      window.removeEventListener("zupe_categories_updated" as any, handleCatUpdate);
    };
  }, []);

  // Active slides only
  const activeSlides = useMemo(() => {
    const filtered = heroBanners.filter((b) => b.active !== false);
    return filtered.length > 0 ? filtered : DEFAULT_HERO_BANNERS;
  }, [heroBanners]);

  // Auto-rotating hero cutout slides synced to active slides count
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  useEffect(() => {
    if (activeHeroIndex >= activeSlides.length) {
      setActiveHeroIndex(0);
    }
  }, [activeSlides.length, activeHeroIndex]);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % activeSlides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  // Real-time sync listener for admin updates
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.banners && Array.isArray(e.detail.banners)) {
        setHeroBanners(e.detail.banners);
      }
    };
    window.addEventListener("vittal_banners_updated" as any, handleUpdate);
    return () => window.removeEventListener("vittal_banners_updated" as any, handleUpdate);
  }, []);

  const products = initialProducts && initialProducts.length > 0 ? initialProducts : [];

  // Filter products for homepage New Arrivals (synced with Showcase Collections Manager)
  const trendingProducts = useMemo(() => {
    const list: Product[] = [];
    const used = new Set<string>();
    const orderList =
      showcaseCollections.newArrivalsProductIds && showcaseCollections.newArrivalsProductIds.length > 0
        ? showcaseCollections.newArrivalsProductIds
        : HOMEPAGE_NEW_ARRIVALS_ORDER;

    for (const id of orderList) {
      const found = products.find((p) => p.id === id || p.slug === id);
      if (found && !used.has(found.id)) {
        list.push(found);
        used.add(found.id);
      }
    }

    // Fallback if any target is not in the dataset yet, fill up to 10
    if (list.length < 10) {
      for (const p of products) {
        if (!used.has(p.id)) {
          list.push(p);
          used.add(p.id);
          if (list.length >= 10) break;
        }
      }
    }

    return list.slice(0, 10);
  }, [products, showcaseCollections.newArrivalsProductIds]);

  // Filter products for homepage Best Sellers (synced with Showcase Collections Manager)
  const isBestSellersEnabled = showcaseCollections.bestSellersEnabled !== false;
  const bestSellersProducts = useMemo(() => {
    const list: Product[] = [];
    const used = new Set<string>();
    const orderList =
      showcaseCollections.bestSellersProductIds && showcaseCollections.bestSellersProductIds.length > 0
        ? showcaseCollections.bestSellersProductIds
        : [
            "on-gold-standard-whey",
            "whey-protein-isolate",
            "sports-research-omega3",
            "on-creatine-container",
            "nitro-tech-protein-bucket",
            "on-whey-protein-tub",
            "gnc-creatine-monohydrate",
            "muscletech-nitrotech-fruit-punch",
            "red-vl-athletic-tee",
            "golden-jar-glossy-dates",
          ];

    for (const id of orderList) {
      const found = products.find((p) => p.id === id || p.slug === id);
      if (found && !used.has(found.id)) {
        list.push(found);
        used.add(found.id);
      }
    }

    // Fallback if any target is not in the dataset yet, fill up to 10
    if (list.length < 10) {
      for (const p of products) {
        if (!used.has(p.id)) {
          list.push(p);
          used.add(p.id);
          if (list.length >= 10) break;
        }
      }
    }

    return list.slice(0, 10);
  }, [products, showcaseCollections.bestSellersProductIds]);

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
  };

  return (
    <div className="bg-white text-neutral-900 font-mograph min-h-screen selection:bg-[#E6F4EF] selection:text-[#0C1412] pb-24 md:pb-12">
      {/* ===================================================================== */}
      {/* 1. LARGE ROUNDED SEARCH BAR WITH FILTER ICON (Mobile only, hidden on desktop) */}
      {/* ===================================================================== */}
      <section className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 pt-1 sm:pt-2 pb-2 sm:pb-3 md:hidden">
        <div
          onClick={() => openSearch()}
          className="w-full max-w-xl sm:max-w-2xl mx-auto bg-[#F7F8FA] hover:bg-[#EFF1F4] border border-neutral-200/70 rounded-full py-2.5 sm:py-3 px-4 sm:px-5 flex items-center justify-between transition-all duration-200 shadow-2xs cursor-pointer group"
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
      {/* 2. GALLERY CATEGORY DEPARTMENTS (Refined Alabaster Emerald Mist)      */}
      {/* ===================================================================== */}
      <section className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-2 sm:pb-3">
        <div className="w-full grid grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3.5 md:gap-4 lg:gap-5 xl:gap-6 justify-center">
          {categoryItems.map((cat) => (
            <Link
              key={cat.name}
              href={cat.link}
              className={`group flex flex-col items-center cursor-pointer transition-transform duration-300 hover:-translate-y-1 w-full md:max-w-[104px] lg:max-w-[114px] xl:max-w-[122px] mx-auto ${
                cat.desktopOnly ? "hidden md:flex" : "flex"
              }`}
            >
              {/* Refined Gallery Alabaster Tile with subtle Imperial Emerald mist & gold rim */}
              <div className="w-full relative aspect-square rounded-2xl md:rounded-[20px] overflow-hidden bg-gradient-to-b from-[#E6F4EF] via-[#F4FAF7] to-white border border-[#D4E9E0] group-hover:border-[#0B5D44]/55 shadow-[0_2px_10px_rgba(11,93,68,0.05)] group-hover:shadow-[0_10px_24px_rgba(11,93,68,0.12)] transition-all duration-300 flex items-end justify-center">
                {/* Soft Top Emerald-Gold Studio Glow */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#0B5D44]/[0.11] via-[#C59B27]/[0.04] to-transparent pointer-events-none" />
                <div className="absolute inset-x-3 top-0 h-[2px] rounded-b-full bg-gradient-to-r from-transparent via-[#C59B27]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Product Cutout Icon */}
                <div className="relative z-10 w-full h-[88%] sm:h-[90%] md:h-[85%] flex items-end justify-center px-1.5 sm:px-2">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 20vw, (max-width: 1024px) 18vw, 130px"
                    className="object-contain object-bottom group-hover:scale-106 transition-transform duration-300 drop-shadow-[0_4px_8px_rgba(12,20,18,0.14)]"
                  />
                </div>
              </div>

              {/* Clean Legible Category Label */}
              <div className="w-full mt-1.5 sm:mt-2 text-center">
                <span className="font-mograph font-semibold text-[10px] sm:text-[11px] md:text-[12px] text-[#0C1412] group-hover:text-[#0B5D44] transition-colors leading-tight line-clamp-1 block w-full px-0.5">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. IMPERIAL EMERALD & SILK-GOLD HERO BANNER                           */}
      {/* ===================================================================== */}
      {(() => {
        const currentSlide = activeSlides[activeHeroIndex] || activeSlides[0];
        const bgUrl = currentSlide?.bgImage || "/vittal/banner-hero-green-texture.jpg";
        const badgeText = currentSlide?.badge || "100% Original · Limited Offer";
        const headingText = currentSlide?.heading || "First Purchase Enjoy\na Special Offer";
        const ctaBtnText = currentSlide?.buttonText || currentSlide?.ctaText || "Shop Now";
        const ctaBtnLink = currentSlide?.buttonLink || currentSlide?.ctaLink || "/products";

        return (
          <section className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 pt-1.5 sm:pt-2 pb-3 sm:pb-4">
            <div className="relative rounded-3xl sm:rounded-[32px] overflow-hidden bg-[#073B2B] border border-[#0B5D44]/40 shadow-[0_14px_40px_rgba(6,40,29,0.16)] min-h-[248px] sm:min-h-[308px] md:min-h-[310px] lg:min-h-[355px] xl:min-h-[380px] flex items-center">
              
              {/* Imperial Emerald & Champagne Gold Silk Background */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={bgUrl}
                  alt="Vittal Lifestyle Hero Canvas"
                  fill
                  priority
                  className="object-cover object-center"
                />
              </div>

              {/* Editorial Obsidian-Emerald Left Readability Scrim (guarantees >12:1 AAA headline contrast) */}
              <div
                aria-hidden="true"
                className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-r from-[#041D15]/88 via-[#073B2B]/55 to-transparent"
              />

              {/* Cutout Images Rotating with Clean Non-Ghosting Crossfade */}
              <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
                {activeSlides.map((slide, idx) => {
                  const isCurrent = activeHeroIndex === idx;
                  const deskScale = (slide.desktopScale ?? 100) / 100;
                  const deskX = slide.desktopOffsetX ?? 0;
                  const deskY = slide.desktopOffsetY ?? 0;
                  const mobScale = (slide.mobileScale ?? 100) / 100;
                  const mobX = slide.mobileOffsetX ?? 0;
                  const mobY = slide.mobileOffsetY ?? 0;
                  const cutoutSrc = slide.cutoutImage || slide.image || `/vittal/cutout-hero-${(idx % 3) + 1}.png`;

                  const deskFit = slide.imageFit === "cover" ? "object-cover object-right" : "object-contain object-right-bottom";
                  const mobFit = (slide.mobileImageFit === "cover" || slide.imageFit === "cover") ? "object-cover object-right" : "object-contain object-right-bottom";

                  return (
                    <div
                      key={slide.id || idx}
                      aria-hidden={!isCurrent}
                      className={`absolute inset-0 transition-opacity duration-500 ease-out ${
                        isCurrent ? "opacity-100 visible" : "opacity-0 invisible"
                      }`}
                    >
                      {/* Desktop View Cutout */}
                      <div
                        className="hidden md:block absolute inset-0 transition-transform duration-300"
                        style={{
                          transform: `translate(${deskX}px, ${deskY}px) scale(${deskScale})`,
                          transformOrigin: "right bottom",
                        }}
                      >
                        <Image
                          src={cutoutSrc}
                          alt={slide.heading || `Hero Cutout ${idx + 1}`}
                          fill
                          priority={idx === 0}
                          className={deskFit}
                          sizes="(max-width: 1024px) 70vw, 1680px"
                        />
                      </div>

                      {/* Mobile View Cutout */}
                      <div
                        className="block md:hidden absolute inset-0 transition-transform duration-300"
                        style={{
                          transform: `translate(${mobX}px, ${mobY}px) scale(${mobScale})`,
                          transformOrigin: "right bottom",
                        }}
                      >
                        <Image
                          src={cutoutSrc}
                          alt={slide.heading || `Hero Cutout ${idx + 1}`}
                          fill
                          priority={idx === 0}
                          className={mobFit}
                          sizes="100vw"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Left Editorial Content Overlay */}
              <div className="relative z-10 px-5 sm:px-8 lg:px-12 py-6 sm:py-8 md:py-9 max-w-[56%] xs:max-w-[54%] sm:max-w-md md:max-w-lg lg:max-w-xl">
                {/* Brushed Champagne Gold Status Pill */}
                {badgeText && (
                  <div className="inline-flex items-center gap-1.5 bg-[#09110E]/75 backdrop-blur-sm border border-[#E5C469]/50 text-[#F3D37A] text-[10px] sm:text-xs font-semibold tracking-wide px-3 sm:px-3.5 py-1 rounded-full mb-2.5 sm:mb-3.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E5C469]" aria-hidden="true" />
                    <span>{badgeText}</span>
                  </div>
                )}

                {/* Pure White Editorial Display Headline (>12:1 AAA Contrast) */}
                <h1 className="font-movault font-extrabold text-[17px] xs:text-[19px] sm:text-3xl md:text-[34px] lg:text-[40px] xl:text-[44px] text-white leading-[1.12] tracking-[-0.025em] mb-3 sm:mb-5 whitespace-pre-line drop-shadow-[0_2px_12px_rgba(4,29,21,0.35)]">
                  {headingText}
                </h1>

                {/* Crisp Ivory Pill CTA with Imperial Emerald Disc Arrow */}
                <Link
                  href={ctaBtnLink}
                  className="inline-flex items-center gap-2.5 sm:gap-3 bg-white hover:bg-[#F5FAF8] active:scale-[0.98] text-[#0C1412] font-bold text-xs sm:text-sm pl-4 pr-1.5 py-1.5 sm:pl-5 sm:pr-2 sm:py-2 rounded-full transition-all duration-200 shadow-[0_8px_24px_rgba(4,29,21,0.28)] hover:shadow-[0_12px_28px_rgba(4,29,21,0.38)] group min-h-[40px] sm:min-h-[44px]"
                >
                  <span>{ctaBtnText}</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0B5D44] text-white flex items-center justify-center shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                    <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  </div>
                </Link>
              </div>

              {/* Signature Bottom Scoop Notch with Accessible Pagination Indicators */}
              <div className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
                <div className="relative">
                  <svg
                    viewBox="0 0 160 30"
                    className="w-36 sm:w-44 md:w-48 h-6 sm:h-7 md:h-8 fill-white block"
                    preserveAspectRatio="none"
                  >
                    <path d="M 0,30 C 22,30 26,0 48,0 L 112,0 C 134,0 138,30 160,30 Z" />
                  </svg>

                  <div className="absolute inset-0 flex items-center justify-center gap-1 sm:gap-1.5 pb-0.5 pointer-events-auto">
                    {activeSlides.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveHeroIndex(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        className="p-1.5 flex items-center justify-center cursor-pointer"
                      >
                        <span
                          className={`block transition-all duration-300 rounded-full ${
                            activeHeroIndex === idx
                              ? "w-6 sm:w-7 h-1.5 sm:h-2 bg-[#0B5D44]"
                              : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-neutral-300 hover:bg-neutral-400"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ===================================================================== */}
      {/* 3B. CONCISE 4-PILLAR AUTHENTICITY & TRUST RIBBON                      */}
      {/* ===================================================================== */}
      <section aria-label="Marketplace Authenticity Guarantees" className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 pt-1 pb-4 sm:pb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 rounded-2xl bg-[#F5F8F6] border border-[#E2EDE8] px-3.5 py-2.5 sm:px-5 sm:py-3">
          {[
            { icon: ShieldCheck, title: "100% Original Brands", sub: "Direct authorized stock" },
            { icon: BadgeCheck, title: "Quality Seal Verified", sub: "Inspected before dispatch" },
            { icon: Truck, title: "Pan-India Express", sub: "Fast insured delivery" },
            { icon: Award, title: "Trusted Multi-Brand", sub: "Global curated catalog" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white border border-[#D4E9E0] flex items-center justify-center text-[#0B5D44] shrink-0 shadow-2xs">
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-bold text-[#0C1412] leading-tight truncate">
                    {item.title}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-600 leading-tight truncate">
                    {item.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3C. AUTHORIZED & CURATED GLOBAL BRANDS SHOWCASE                       */}
      {/* ===================================================================== */}
      <section
        aria-label="Authorized Global Brands"
        className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 pb-5 sm:pb-7"
      >
        <div className="rounded-2xl bg-white border border-neutral-200/80 px-4 py-3.5 sm:px-6 sm:py-4 shadow-[0_2px_12px_rgba(7,20,16,0.025)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C59B27]" aria-hidden="true" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#074230]">
                Authorized &amp; Curated Global Brands
              </span>
            </div>
            <Link
              href="/about"
              className="text-[11px] font-semibold text-neutral-500 hover:text-[#0B5D44] transition-colors inline-flex items-center gap-1"
            >
              <span>How we verify authenticity</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { name: "Optimum Nutrition", query: "Optimum" },
              { name: "Nike", query: "Nike" },
              { name: "MuscleTech", query: "MuscleTech" },
              { name: "Adidas", query: "Adidas" },
              { name: "Ferrero Rocher", query: "Ferrero" },
              { name: "Lindt", query: "Lindt" },
              { name: "Royal Medjool", query: "Medjool" },
              { name: "Sports Research", query: "Whey" },
              { name: "GNC", query: "Protein" },
            ].map((brand) => (
              <Link
                key={brand.name}
                href={`/products?search=${encodeURIComponent(brand.query)}`}
                className="shrink-0 px-3.5 py-2 rounded-full bg-[#F5F8F6] hover:bg-[#0B5D44] text-[#0C1412] hover:text-white border border-[#E2EDE8] hover:border-[#0B5D44] text-xs font-bold tracking-tight transition-all"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. NEW ARRIVALS (Unified Luxury Marketplace Product Cards)            */}
      {/* ===================================================================== */}
      <section className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 pt-1 sm:pt-2 pb-6 sm:pb-8">
        <div className="flex items-center justify-between mb-3.5 sm:mb-5">
          <h2 className="font-movault text-lg sm:text-xl md:text-2xl font-extrabold text-[#0C1412] tracking-[-0.02em]">
            New Arrivals
          </h2>
          <Link
            href="/products"
            className="text-xs sm:text-sm font-bold text-[#0B5D44] hover:text-[#074230] flex items-center gap-0.5 transition-colors"
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
                className="group relative rounded-3xl bg-white border border-neutral-200/85 hover:border-[#0B5D44]/45 p-2.5 sm:p-3.5 flex flex-col justify-between transition-all duration-300 shadow-[0_2px_10px_rgba(12,20,18,0.03)] hover:shadow-[0_12px_28px_rgba(11,93,68,0.08)] hover:-translate-y-0.5"
              >
                {/* Wishlist Heart Icon (44px accessible hit zone) */}
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
                  className="absolute top-2.5 right-2.5 z-10 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
                  aria-label={isWish ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <span className="w-8 h-8 rounded-full bg-white/95 border border-neutral-200/70 shadow-2xs flex items-center justify-center text-neutral-500 hover:text-rose-500 transition-colors">
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        isWish ? "fill-rose-500 text-rose-500" : "stroke-current"
                      }`}
                    />
                  </span>
                </button>

                {/* Studio Product Image Stage */}
                <Link
                  href={`/products/${product.id || product.slug}`}
                  className="relative aspect-square w-full rounded-2xl bg-[#F5F8F6] p-3 flex items-center justify-center overflow-hidden mb-3"
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
                <div className="px-0.5">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B5D44] truncate">
                      {product.category || "Original"}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[10.5px] font-bold text-neutral-700 tabular-nums shrink-0">
                      <Star className="w-3 h-3 fill-[#C59B27] text-[#C59B27]" />
                      {(product.rating ?? 4.8).toFixed(1)}
                    </span>
                  </div>
                  <Link
                    href={`/products/${product.id || product.slug}`}
                    className="block"
                  >
                    <h3 className="font-semibold text-xs sm:text-[13.5px] text-[#0C1412] group-hover:text-[#0B5D44] transition-colors leading-snug line-clamp-2 min-h-[34px] sm:min-h-[38px] mb-1.5">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Tabular Price Row */}
                  <div className="flex items-baseline gap-1.5 mb-2.5 tabular-nums">
                    <span className="text-sm sm:text-base font-extrabold text-[#0C1412]">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    {product.mrp && product.mrp > product.price && (
                      <span className="text-[11px] sm:text-xs text-neutral-400 line-through">
                        ₹{product.mrp.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  {/* Unified Discount Pill & Obsidian-to-Emerald Add Button */}
                  <div className="flex items-center justify-between gap-2">
                    {discountPercent ? (
                      <span className="bg-[#E6F4EF] text-[#074230] text-[10px] sm:text-[11px] font-bold tabular-nums px-2.5 py-0.5 rounded-full inline-flex items-center">
                        {discountPercent}% OFF
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#0B5D44] font-semibold">100% Original</span>
                    )}

                    <CardAddToCartControl
                      product={product}
                      onAfterAdd={() =>
                        addRecentlyViewed({
                          id: product.id,
                          slug: product.slug || product.id,
                          name: product.name,
                          price: product.price,
                          mrp: product.mrp,
                          poster_image: product.poster_image,
                          category: product.category,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. FRESH SPORTSWEAR DROPS (Campaign Showcase)                         */}
      {/* ===================================================================== */}
      {(() => {
        const c1 = sportswearCampaign.cards[0] || DEFAULT_SPORTSWEAR_CAMPAIGN.cards[0];
        const c2 = sportswearCampaign.cards[1] || DEFAULT_SPORTSWEAR_CAMPAIGN.cards[1];
        const c3 = sportswearCampaign.cards[2] || DEFAULT_SPORTSWEAR_CAMPAIGN.cards[2];

        const c1DeskScale = (c1.desktopScale ?? 100) / 100;
        const c1DeskX = c1.desktopOffsetX ?? 0;
        const c1DeskY = c1.desktopOffsetY ?? 0;
        const c1MobScale = (c1.mobileScale ?? 100) / 100;
        const c1MobX = c1.mobileOffsetX ?? 0;
        const c1MobY = c1.mobileOffsetY ?? 0;

        const c2DeskScale = (c2.desktopScale ?? 100) / 100;
        const c2DeskX = c2.desktopOffsetX ?? 0;
        const c2DeskY = c2.desktopOffsetY ?? 0;
        const c2MobScale = (c2.mobileScale ?? 100) / 100;
        const c2MobX = c2.mobileOffsetX ?? 0;
        const c2MobY = c2.mobileOffsetY ?? 0;

        const c3DeskScale = (c3.desktopScale ?? 100) / 100;
        const c3DeskX = c3.desktopOffsetX ?? 0;
        const c3DeskY = c3.desktopOffsetY ?? 0;
        const c3MobScale = (c3.mobileScale ?? 100) / 100;
        const c3MobX = c3.mobileOffsetX ?? 0;
        const c3MobY = c3.mobileOffsetY ?? 0;

        return (
          <section className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            {/* Editorial Obsidian Pine & Champagne Gold Sportswear Banner */}
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-[#061812] via-[#09241B] to-[#0B5D44] border border-[#C59B27]/30 p-5 sm:p-7 md:p-8 text-center mb-3.5 sm:mb-5 shadow-[0_12px_32px_rgba(6,24,18,0.16)]">
              <div aria-hidden="true" className="absolute inset-x-12 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#E5C469]/60 to-transparent" />
              <h3 className="relative font-movault text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-extrabold text-white tracking-[-0.02em] mb-1.5">
                {sportswearCampaign.bannerHeadingPrefix ?? "Fresh"}{" "}
                <span className="font-mograph italic font-bold text-[#E5C469]">
                  {sportswearCampaign.bannerHeadingHighlight ?? "Sportswear"}
                </span>{" "}
                {sportswearCampaign.bannerHeadingSuffix ?? "Drops"}
              </h3>
              <p className="relative font-mono text-[10px] sm:text-xs font-semibold text-[#A7F3D0] tracking-[0.24em] uppercase">
                {sportswearCampaign.bannerHashtag ?? "#EngineeredForEveryMove"}
              </p>
            </div>

        {/* ================================================================= */}
        {/* DESKTOP LAYOUT (>= md): 3 Cards in a Row Matching Reference       */}
        {/* ================================================================= */}
        <div className="hidden md:flex md:flex-row gap-3.5 lg:gap-5 w-full items-stretch">
          
          {/* Card 1: Sports Wear (Wide Horizontal Card) */}
          <Link
            href={c1.linkUrl || "/products?category=Outfits"}
            className="group md:w-[43%] rounded-2xl sm:rounded-3xl bg-white hover:bg-neutral-50/80 border border-neutral-200/90 hover:border-[#0B5D44]/60 p-4 lg:p-5 flex flex-row items-stretch justify-between gap-4 transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-md cursor-pointer"
          >
            {/* Left: Text Info */}
            <div className="flex flex-col justify-between py-2 pr-2 flex-1 min-w-0">
              <h4 className="font-movault text-xl lg:text-2xl xl:text-3xl font-black uppercase italic tracking-wide text-neutral-950 leading-[1.15] mb-2 group-hover:text-[#0B5D44] transition-colors">
                {c1.title}
              </h4>
              <div className="mt-auto">
                <span className="font-mograph text-[10px] lg:text-xs text-neutral-500 font-bold uppercase tracking-wider block mb-0.5">
                  {c1.priceLabel || "Starting At"}
                </span>
                <span className="font-movault text-2xl lg:text-3xl xl:text-4xl font-black text-[#0B5D44] tracking-tight">
                  {c1.price}
                </span>
              </div>
            </div>

            {/* Right: Inner Image Frame */}
            <div className="relative w-[48%] self-stretch min-h-[220px] rounded-xl lg:rounded-2xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200/60">
              <div
                className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
                style={{
                  transform: `translate(${c1DeskX}px, ${c1DeskY}px) scale(${c1DeskScale})`,
                  transformOrigin: "center center",
                }}
              >
                <Image
                  src={c1.image || "/vittal/drop-teveo-run.jpg"}
                  alt={c1.title}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1200px) 25vw, 360px"
                />
              </div>
            </div>
          </Link>

          {/* Card 2: Jackets & Track Pants */}
          <Link
            href={c2.linkUrl || "/products?category=Outfits"}
            className="group md:w-[28.5%] rounded-2xl sm:rounded-3xl bg-white hover:bg-neutral-50/80 border border-neutral-200/90 hover:border-[#0B5D44]/60 p-4 lg:p-5 flex flex-col justify-between gap-3 transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-md cursor-pointer"
          >
            {/* Top: Inner Image Frame */}
            <div className="relative aspect-[4/3] w-full rounded-xl lg:rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200/60 shrink-0">
              <div
                className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
                style={{
                  transform: `translate(${c2DeskX}px, ${c2DeskY}px) scale(${c2DeskScale})`,
                  transformOrigin: "center center",
                }}
              >
                <Image
                  src={c2.image || "/vittal/drop-mountain.jpg"}
                  alt={c2.title}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1200px) 20vw, 300px"
                />
              </div>
            </div>

            {/* Bottom: Text Info & Bare Arrow */}
            <div className="flex items-end justify-between gap-2 mt-auto pt-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-movault text-sm lg:text-base xl:text-lg font-black uppercase tracking-wide text-neutral-950 leading-tight mb-1 truncate group-hover:text-[#0B5D44] transition-colors">
                  {c2.title}
                </h4>
                <span className="font-mograph text-[10px] text-neutral-500 font-bold uppercase tracking-wider block mb-0.5">
                  {c2.priceLabel || "Starting At"}
                </span>
                <span className="font-movault text-lg lg:text-xl xl:text-2xl font-black text-[#0B5D44] tracking-tight">
                  {c2.price}
                </span>
              </div>
              <ArrowUpRight className="w-5 h-5 lg:w-6 lg:h-6 text-neutral-900 group-hover:text-[#0B5D44] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all stroke-[2.5] shrink-0 mb-1" />
            </div>
          </Link>

          {/* Card 3: Shorts */}
          <Link
            href={c3.linkUrl || "/products?category=Outfits"}
            className="group md:w-[28.5%] rounded-2xl sm:rounded-3xl bg-white hover:bg-neutral-50/80 border border-neutral-200/90 hover:border-[#0B5D44]/60 p-4 lg:p-5 flex flex-col justify-between gap-3 transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-md cursor-pointer"
          >
            {/* Top: Inner Image Frame */}
            <div className="relative aspect-[4/3] w-full rounded-xl lg:rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200/60 shrink-0">
              <div
                className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
                style={{
                  transform: `translate(${c3DeskX}px, ${c3DeskY}px) scale(${c3DeskScale})`,
                  transformOrigin: "center center",
                }}
              >
                <Image
                  src={c3.image || "/vittal/drop-run-fitness.jpg"}
                  alt={c3.title}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1200px) 20vw, 300px"
                />
              </div>
            </div>

            {/* Bottom: Text Info & Bare Arrow */}
            <div className="flex items-end justify-between gap-2 mt-auto pt-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-movault text-sm lg:text-base xl:text-lg font-black uppercase tracking-wide text-neutral-950 leading-tight mb-1 truncate group-hover:text-[#0B5D44] transition-colors">
                  {c3.title}
                </h4>
                <span className="font-mograph text-[10px] text-neutral-500 font-bold uppercase tracking-wider block mb-0.5">
                  {c3.priceLabel || "Starting At"}
                </span>
                <span className="font-movault text-lg lg:text-xl xl:text-2xl font-black text-[#0B5D44] tracking-tight">
                  {c3.price}
                </span>
              </div>
              <ArrowUpRight className="w-5 h-5 lg:w-6 lg:h-6 text-neutral-900 group-hover:text-[#0B5D44] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all stroke-[2.5] shrink-0 mb-1" />
            </div>
          </Link>
        </div>

        {/* ================================================================= */}
        {/* MOBILE LAYOUT (< md): 2 Columns Grid Matching Reference           */}
        {/* ================================================================= */}
        <div className="grid grid-cols-2 md:hidden gap-2.5 sm:gap-3 w-full items-stretch">
          
          {/* Column 1: Card 1 (Tall Card, Tall Image on Top) */}
          <Link
            href={c1.linkUrl || "/products?category=Outfits"}
            className="group rounded-2xl bg-white border border-neutral-200/90 hover:border-[#0B5D44]/60 p-2.5 sm:p-3 flex flex-col justify-between h-full transition-all duration-300 shadow-2xs hover:shadow-md cursor-pointer"
          >
            {/* Top: Tall Image Filling Upper Section */}
            <div className="relative aspect-[4/5.6] w-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200/60 shrink-0">
              <div
                className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
                style={{
                  transform: `translate(${c1MobX}px, ${c1MobY}px) scale(${c1MobScale})`,
                  transformOrigin: "center center",
                }}
              >
                <Image
                  src={c1.image || "/vittal/drop-teveo-run.jpg"}
                  alt={c1.title}
                  fill
                  className="object-cover object-center"
                  sizes="50vw"
                />
              </div>
            </div>

            {/* Bottom: Text Info */}
            <div className="flex flex-col justify-end flex-1 min-w-0 pt-2 pb-0.5">
              <h4 className="font-movault text-xs xs:text-sm font-black uppercase italic tracking-wide text-neutral-950 leading-tight mb-1 group-hover:text-[#0B5D44] transition-colors">
                {c1.title}
              </h4>
              <div className="mt-auto">
                <span className="font-mograph text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">
                  {c1.priceLabel || "Starting At"}
                </span>
                <span className="font-movault text-base xs:text-lg font-black text-[#0B5D44] tracking-tight">
                  {c1.price}
                </span>
              </div>
            </div>
          </Link>

          {/* Column 2: Stacked Cards (Card 2 & Card 3) */}
          <div className="flex flex-col gap-2.5 sm:gap-3 h-full">
            
            {/* Card 2: Jackets & Track Pants */}
            <Link
              href={c2.linkUrl || "/products?category=Outfits"}
              className="group rounded-2xl bg-white border border-neutral-200/90 hover:border-[#0B5D44]/60 p-2.5 sm:p-3 flex flex-col justify-between flex-1 transition-all duration-300 shadow-2xs hover:shadow-md cursor-pointer"
            >
              {/* Top: Inner Image */}
              <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200/60 shrink-0">
                <div
                  className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
                  style={{
                    transform: `translate(${c2MobX}px, ${c2MobY}px) scale(${c2MobScale})`,
                    transformOrigin: "center center",
                  }}
                >
                  <Image
                    src={c2.image || "/vittal/drop-mountain.jpg"}
                    alt={c2.title}
                    fill
                    className="object-cover object-center"
                    sizes="50vw"
                  />
                </div>
              </div>

              {/* Bottom: Text Info & Bare Arrow */}
              <div className="flex items-end justify-between gap-1 mt-auto pt-1.5">
                <div className="min-w-0 flex-1">
                  <h4 className="font-movault text-[11px] xs:text-xs font-black uppercase tracking-wide text-neutral-950 leading-tight mb-0.5 truncate group-hover:text-[#0B5D44] transition-colors">
                    {c2.title}
                  </h4>
                  <span className="font-mograph text-[8.5px] text-neutral-500 font-bold uppercase tracking-wider block">
                    {c2.priceLabel || "Starting At"}
                  </span>
                  <span className="font-movault text-sm xs:text-base font-black text-[#0B5D44] tracking-tight">
                    {c2.price}
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 xs:w-4.5 xs:h-4.5 text-neutral-900 group-hover:text-[#0B5D44] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all stroke-[2.5] shrink-0 mb-0.5" />
              </div>
            </Link>

            {/* Card 3: Shorts */}
            <Link
              href={c3.linkUrl || "/products?category=Outfits"}
              className="group rounded-2xl bg-white border border-neutral-200/90 hover:border-[#0B5D44]/60 p-2.5 sm:p-3 flex flex-col justify-between flex-1 transition-all duration-300 shadow-2xs hover:shadow-md cursor-pointer"
            >
              {/* Top: Inner Image */}
              <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200/60 shrink-0">
                <div
                  className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
                  style={{
                    transform: `translate(${c3MobX}px, ${c3MobY}px) scale(${c3MobScale})`,
                    transformOrigin: "center center",
                  }}
                >
                  <Image
                    src={c3.image || "/vittal/drop-run-fitness.jpg"}
                    alt={c3.title}
                    fill
                    className="object-cover object-center"
                    sizes="50vw"
                  />
                </div>
              </div>

              {/* Bottom: Text Info & Bare Arrow */}
              <div className="flex items-end justify-between gap-1 mt-auto pt-1.5">
                <div className="min-w-0 flex-1">
                  <h4 className="font-movault text-[11px] xs:text-xs font-black uppercase tracking-wide text-neutral-950 leading-tight mb-0.5 truncate group-hover:text-[#0B5D44] transition-colors">
                    {c3.title}
                  </h4>
                  <span className="font-mograph text-[8.5px] text-neutral-500 font-bold uppercase tracking-wider block">
                    {c3.priceLabel || "Starting At"}
                  </span>
                  <span className="font-movault text-sm xs:text-base font-black text-[#0B5D44] tracking-tight">
                    {c3.price}
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 xs:w-4.5 xs:h-4.5 text-neutral-900 group-hover:text-[#0B5D44] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all stroke-[2.5] shrink-0 mb-0.5" />
              </div>
            </Link>

          </div>
        </div>
      </section>
    );
  })()}

      {/* ===================================================================== */}
      {/* 6. FUEL EVERY WORKOUT — GYM SUPPLEMENTS CATEGORY SHOWCASE             */}
      {/* ===================================================================== */}
      <SupplementCategoryShowcase allProducts={products} config={initialSupplementShowcase} />

      {/* ===================================================================== */}
      {/* 7. BEST SELLERS SECTION (Can be enabled/disabled via Admin)           */}
      {/* ===================================================================== */}
      {isBestSellersEnabled && bestSellersProducts.length > 0 && (
        <section className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-6 sm:pb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#111111] tracking-tight">
                Best Sellers
              </h2>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E6F4EF] text-[#074230] border border-[#0B5D44]/30">
                Top Trending
              </span>
            </div>
            <Link
              href="/products?sort=best_selling"
              className="text-xs sm:text-sm font-semibold text-[#0B5D44] hover:text-[#0B5D44] flex items-center gap-0.5 transition-colors"
            >
              <span>See all</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Product Cards Grid: Mobile 2 per row, Desktop 5 per row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 w-full">
            {bestSellersProducts.map((product) => {
              const isWish = isInWishlist(product.id);
              const discountPercent =
                product.mrp && product.mrp > product.price
                  ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                  : null;

              return (
                <div
                  key={product.id}
                  className="group relative rounded-3xl bg-white border border-neutral-200/85 hover:border-[#0B5D44]/45 p-2.5 sm:p-3.5 flex flex-col justify-between transition-all duration-300 shadow-[0_2px_10px_rgba(12,20,18,0.03)] hover:shadow-[0_12px_28px_rgba(11,93,68,0.08)] hover:-translate-y-0.5"
                >
                  {/* Wishlist Heart Icon (44px accessible hit zone) */}
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
                    className="absolute top-2.5 right-2.5 z-10 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
                    aria-label={isWish ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <span className="w-8 h-8 rounded-full bg-white/95 border border-neutral-200/70 shadow-2xs flex items-center justify-center text-neutral-500 hover:text-rose-500 transition-colors">
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isWish ? "fill-rose-500 text-rose-500" : "stroke-current"
                        }`}
                      />
                    </span>
                  </button>

                  {/* Studio Product Image Stage */}
                  <Link
                    href={`/products/${product.id || product.slug}`}
                    className="relative aspect-square w-full rounded-2xl bg-[#F5F8F6] p-3 flex items-center justify-center overflow-hidden mb-3"
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
                  <div className="px-0.5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B5D44] truncate">
                        {product.category || "Original"}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[10.5px] font-bold text-neutral-700 tabular-nums shrink-0">
                        <Star className="w-3 h-3 fill-[#C59B27] text-[#C59B27]" />
                        {(product.rating ?? 4.8).toFixed(1)}
                      </span>
                    </div>
                    <Link
                      href={`/products/${product.id || product.slug}`}
                      className="block"
                    >
                      <h3 className="font-semibold text-xs sm:text-[13.5px] text-[#0C1412] group-hover:text-[#0B5D44] transition-colors leading-snug line-clamp-2 min-h-[34px] sm:min-h-[38px] mb-1.5">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Tabular Price Row */}
                    <div className="flex items-baseline gap-1.5 mb-2.5 tabular-nums">
                      <span className="text-sm sm:text-base font-extrabold text-[#0C1412]">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      {product.mrp && product.mrp > product.price && (
                        <span className="text-[11px] sm:text-xs text-neutral-400 line-through">
                          ₹{product.mrp.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    {/* Unified Discount Pill & Obsidian-to-Emerald Add Button */}
                    <div className="flex items-center justify-between gap-2">
                      {discountPercent ? (
                        <span className="text-[10px] sm:text-[11px] font-bold tabular-nums text-[#074230] bg-[#E6F4EF] px-2.5 py-0.5 rounded-full">
                          {discountPercent}% OFF
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#0B5D44] font-semibold">100% Original</span>
                      )}

                      <CardAddToCartControl
                        product={product}
                        onAfterAdd={() =>
                          addRecentlyViewed({
                            id: product.id,
                            slug: product.slug || product.id,
                            name: product.name,
                            price: product.price,
                            mrp: product.mrp,
                            poster_image: product.poster_image,
                            category: product.category,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* 8. THE VITTAL 100% ORIGINAL GUARANTEE (Editorial Marketplace Proof)   */}
      {/* ===================================================================== */}
      <section
        aria-labelledby="vittal-authenticity-guarantee"
        className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-10 sm:pb-14"
      >
        <div className="relative rounded-[28px] sm:rounded-[34px] overflow-hidden bg-gradient-to-br from-[#071410] via-[#0B221A] to-[#071410] border border-[#C59B27]/30 px-6 py-8 sm:px-10 sm:py-11 text-white shadow-[0_18px_48px_rgba(7,20,16,0.14)]">
          {/* Champagne Gold top hairline */}
          <div
            aria-hidden="true"
            className="absolute inset-x-12 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#E5C469]/70 to-transparent"
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-7 mb-7 border-b border-white/10">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/8 border border-[#E5C469]/40 text-[#F3D37A] text-[10.5px] font-bold uppercase tracking-[0.18em] mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                The Vittal Authenticity Standard
              </span>
              <h2
                id="vittal-authenticity-guarantee"
                className="font-movault text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight"
              >
                Every Order Backed by Our{" "}
                <span className="text-[#E5C469]">100% Original Guarantee</span>
              </h2>
              <p className="mt-2.5 text-xs sm:text-sm text-white/75 leading-relaxed">
                Zero grey-market resellers, zero compromised seals. Every supplement, athletic piece, and gourmet import is inspected and shipped with full invoice &amp; transit protection.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href="/order-tracking"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-[#F3FAF7] text-[#071410] text-xs sm:text-sm font-bold transition-colors shadow-sm"
              >
                <span>Live Order Tracking</span>
                <ArrowUpRight className="w-4 h-4 text-[#0B5D44]" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/8 hover:bg-white/15 text-white border border-white/15 text-xs sm:text-sm font-semibold transition-colors"
              >
                <span>Our Story &amp; Sourcing</span>
              </Link>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {[
              {
                icon: BadgeCheck,
                title: "Direct Authorized Sourcing",
                desc: "Procured strictly through verified brand distributors and official importers with traceable batch codes.",
              },
              {
                icon: PackageCheck,
                title: "Pre-Dispatch Seal Inspection",
                desc: "Every nutrition jar, garment, and gourmet box passes a tamper-evident quality & expiry check before packing.",
              },
              {
                icon: RotateCcw,
                title: "Insured Express & 7-Day Returns",
                desc: "Free insured pan-India express shipping above ₹1,499, live milestone tracking, and straightforward 7-day returns.",
              },
            ].map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#0B5D44]/60 border border-[#34D399]/30 text-[#E5C469] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-white/70 leading-relaxed mt-1">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
