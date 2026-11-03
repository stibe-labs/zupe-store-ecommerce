"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { launchFastrrCheckout } from "@/lib/fastrrClient";
import { useCart } from "@/context/CartContext";
import {
  Star,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Truck,
  Headphones,
  Laptop,
  Smartphone,
  Watch,
  Tablet,
  Gamepad2,
  Camera,
  Plug,
  Heart,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Check,
  CreditCard,
  MapPin,
  BadgeCheck,
} from "lucide-react";
import { Product } from "@/types/product";
import {
  DEFAULT_PRODUCTS,
  VITTAL_DIGITAL_DEALS,
  VittalDigitalProduct,
} from "@/data/zupeProducts";

interface StorefrontProps {
  initialProducts?: Product[];
}

// ---------------------------------------------------------------------------
// Hero slides data
// ---------------------------------------------------------------------------
const HERO_SLIDES = [
  {
    id: 1,
    label: "DUALSENSE WIRELESS CONTROLLER",
    headline: "Bring Gaming Worlds\nTo Life",
    sub: "Starting at ₹44,990",
    bg: "from-[#0a1628] via-[#001f3f] to-[#002b4d]",
    accent: "#f5c518",
    emoji: "🎮",
    link: "/products?category=Gaming+%26+Accessories",
  },
  {
    id: 2,
    label: "ULTRABOOK POWERHOUSE",
    headline: "Power Your Work\nLike Never Before",
    sub: "Up to 40% Off on Premium Laptops",
    bg: "from-[#0d1b2a] via-[#1a2d4a] to-[#0a1628]",
    accent: "#fbbf24",
    emoji: "💻",
    link: "/products?category=Laptops",
  },
  {
    id: 3,
    label: "AUDIO EXCELLENCE",
    headline: "Hear Every Note\nIn Perfection",
    sub: "AirPods Max Style Headphones — Premium Sound",
    bg: "from-[#0f0c29] via-[#302b63] to-[#24243e]",
    accent: "#f5c518",
    emoji: "🎧",
    link: "/products?category=Headphones+%26+Earbuds",
  },
];

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
const CATEGORIES = [
  { name: "Computers & Laptops", icon: Laptop, link: "/products?category=Laptops", bg: "bg-blue-50" },
  { name: "Cameras & Video", icon: Camera, link: "/products?category=Cameras", bg: "bg-amber-50" },
  { name: "Tablets", icon: Tablet, link: "/products?category=Tablets", bg: "bg-indigo-50" },
  { name: "Smartphones", icon: Smartphone, link: "/products?category=Smartphones", bg: "bg-sky-50" },
  { name: "Smartwatches", icon: Watch, link: "/products?category=Smartwatches", bg: "bg-emerald-50" },
  { name: "Gaming", icon: Gamepad2, link: "/products?category=Gaming+%26+Accessories", bg: "bg-purple-50" },
  { name: "Audio & Headphones", icon: Headphones, link: "/products?category=Headphones+%26+Earbuds", bg: "bg-cyan-50" },
  { name: "Accessories", icon: Plug, link: "/products?category=Smart+Gadgets", bg: "bg-rose-50" },
];

// ---------------------------------------------------------------------------
// Trust strip items
// ---------------------------------------------------------------------------
const TRUST_ITEMS = [
  { icon: MapPin, title: "Dubai Sourced", sub: "Original Products" },
  { icon: BadgeCheck, title: "100% Genuine", sub: "Authentic & Verified" },
  { icon: ShieldCheck, title: "Warranty Across India", sub: "Hassle-Free Support" },
  { icon: CreditCard, title: "Secure Payments", sub: "UPI, Cards, Net Banking" },
  { icon: Truck, title: "Express Delivery", sub: "2-4 Days Across India" },
];

// ---------------------------------------------------------------------------
// Featured deals product data (static for homepage display)
// ---------------------------------------------------------------------------
const FEATURED_DEALS = [
  { id: "hp-victus-15", name: "HP Victus 15 Gaming Laptop", price: 62990, mrp: 99999, discount: 25, rating: 4.6, reviews: 312, image: "/vittal/ultraslim-laptop-14.png" },
  { id: "airpods-pro-2", name: "Apple AirPods Pro 2nd Gen", price: 19990, mrp: 28999, discount: 30, rating: 4.9, reviews: 1240, image: "/vittal/wireless-earbuds.png" },
  { id: "galaxy-watch6", name: "Samsung Galaxy Watch6 44mm", price: 27999, mrp: 34999, discount: 20, rating: 4.7, reviews: 489, image: "/vittal/smart-watch-pro.png" },
  { id: "dualsense-ctrl", name: "PS5 DualSense Wireless Controller", price: 4799, mrp: 7490, discount: 35, rating: 4.8, reviews: 876, image: "/vittal/vittal-digital-logo.png" },
  { id: "jbl-charge5", name: "JBL Charge 5 Portable Speaker", price: 9999, mrp: 13999, discount: 28, rating: 4.7, reviews: 654, image: "/vittal/portable-bluetooth-speaker.png" },
  { id: "iphone15-128", name: "iPhone 15 128GB Imported", price: 62990, mrp: 92990, discount: 32, rating: 4.9, reviews: 2103, image: "/vittal/ultraslim-laptop-14.png" },
];

// ---------------------------------------------------------------------------
// Trending products
// ---------------------------------------------------------------------------
const TRENDING_PRODUCTS = [
  { id: "galaxy-s24", name: "Samsung Galaxy S24", price: 74999, mrp: 89999, discount: 16, rating: 4.8, reviews: 1802, image: "/vittal/ultraslim-laptop-14.png" },
  { id: "ideapad-slim5", name: "Lenovo IdeaPad Slim 5", price: 52990, mrp: 67990, discount: 22, rating: 4.6, reviews: 523, image: "/vittal/ultraslim-laptop-14.png" },
  { id: "airpods-max", name: "Apple AirPods Max", price: 59900, mrp: 69900, discount: 14, rating: 4.9, reviews: 3210, image: "/vittal/wireless-earbuds.png", featured: true },
  { id: "apple-watch-se", name: "Apple Watch SE", price: 29900, mrp: 35900, discount: 16, rating: 4.7, reviews: 1034, image: "/vittal/smart-watch-pro.png" },
  { id: "3in1-charger", name: "3-in-1 Wireless Charging Station", price: 3499, mrp: 4999, discount: 30, rating: 4.5, reviews: 290, image: "/vittal/compact-power-bank.png" },
  { id: "galaxy-tab-s9", name: "Samsung Galaxy Tab S9", price: 64999, mrp: 78999, discount: 17, rating: 4.7, reviews: 876, image: "/vittal/everyday-tablet-11.png" },
  { id: "boat-rockerz255", name: "boAt Rockerz 255 Pro+", price: 1499, mrp: 2499, discount: 40, rating: 4.4, reviews: 4500, image: "/vittal/wireless-earbuds.png" },
  { id: "lg-ultragear27", name: "LG UltraGear 27\" Monitor", price: 28999, mrp: 36999, discount: 21, rating: 4.8, reviews: 1102, image: "/vittal/ultraslim-laptop-14.png" },
  { id: "oneplus-12r", name: "OnePlus 12R", price: 39999, mrp: 49999, discount: 20, rating: 4.6, reviews: 2310, image: "/vittal/ultraslim-laptop-14.png" },
];

// ---------------------------------------------------------------------------
// FILTER TABS
// ---------------------------------------------------------------------------
const TREND_TABS = ["Best Seller", "Sales", "Featured", "New Products"];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function VittalDigitalStorefront({ initialProducts }: StorefrontProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const products =
    initialProducts && initialProducts.length > 0
      ? initialProducts
      : DEFAULT_PRODUCTS;

  // Hero carousel state
  const [activeSlide, setActiveSlide] = useState(0);
  // Countdown timer state (06:15:48 style)
  const [timeLeft, setTimeLeft] = useState({ hours: 6, minutes: 15, seconds: 48 });
  // Trending tab
  const [activeTrendTab, setActiveTrendTab] = useState("Best Seller");
  // Wishlist state
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Auto-slide hero every 4s
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 6, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBuyNow = (product: Product | VittalDigitalProduct) => {
    const variantId = product.id;
    const price = product.price;
    const name = product.name;
    const image =
      "poster_image" in product ? product.poster_image : product.image;

    addItem(
      {
        id: variantId,
        slug: "slug" in product ? product.slug : variantId,
        name,
        price,
        mrp: product.mrp,
        offer_price: price,
        stock_count: 50,
        poster_image: image,
        in_stock: 1,
        category: "category" in product ? product.category : "Electronics",
        tagline: "Imported from Dubai",
        description: "",
      },
      1
    );

    try {
      launchFastrrCheckout([
        { id: variantId, name, price, quantity: 1, image },
      ]);
    } catch {
      router.push(`/checkout?productId=${variantId}&qty=1`);
    }
  };

  const handleAddToCart = (deal: typeof FEATURED_DEALS[0]) => {
    addItem(
      {
        id: deal.id,
        slug: deal.id,
        name: deal.name,
        price: deal.price,
        mrp: deal.mrp,
        offer_price: deal.price,
        stock_count: 50,
        poster_image: deal.image,
        in_stock: 1,
        category: "Electronics",
        tagline: "Imported from Dubai",
        description: "",
      },
      1
    );
  };

  const scrollCategories = (dir: "left" | "right") => {
    if (!categoryScrollRef.current) return;
    categoryScrollRef.current.scrollBy({
      left: dir === "right" ? 240 : -240,
      behavior: "smooth",
    });
  };

  const slide = HERO_SLIDES[activeSlide];

  // Trending products to show (filter by tab — simplified: same set, reordered for demo)
  const trendingToShow = TRENDING_PRODUCTS.slice(0, 9);

  return (
    <div className="bg-white text-slate-900 font-sans">
      {/* ===================================================================== */}
      {/* SECTION 1: HERO CAROUSEL                                              */}
      {/* ===================================================================== */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: 420 }}>
        {/* Slides */}
        {HERO_SLIDES.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 bg-gradient-to-r ${s.bg} transition-opacity duration-700 ${
              idx === activeSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <div className="max-w-7xl mx-auto px-6 sm:px-10 h-full flex items-center" style={{ minHeight: 420 }}>
              <div className="flex-1 text-white py-16 sm:py-20">
                {/* Label */}
                <p className="text-xs sm:text-sm font-bold tracking-widest uppercase mb-3" style={{ color: s.accent }}>
                  {s.label}
                </p>
                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4 whitespace-pre-line">
                  {s.headline}
                </h1>
                {/* Sub */}
                <p className="text-slate-300 text-base sm:text-lg mb-8">{s.sub}</p>
                {/* CTA */}
                <Link
                  href={s.link}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-black text-sm text-slate-900 hover:opacity-90 transition-opacity shadow-lg"
                  style={{ backgroundColor: s.accent }}
                >
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {/* Right emoji graphic */}
              <div className="hidden md:flex items-center justify-center w-72 text-[140px] select-none">
                {s.emoji}
              </div>
            </div>
          </div>
        ))}

        {/* Arrow nav */}
        <button
          onClick={() => setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === activeSlide ? "bg-amber-400 w-6" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 2: CATEGORY ICON ROW                                          */}
      {/* ===================================================================== */}
      <section className="bg-white border-b border-slate-200 py-5">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div
            ref={categoryScrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: "none" }}
          >
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={cat.link}
                  className="flex flex-col items-center gap-2 min-w-[80px] group cursor-pointer flex-shrink-0"
                >
                  <div
                    className={`w-14 h-14 rounded-full ${cat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-slate-700" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 text-center leading-tight max-w-[72px]">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
          {/* Scroll arrow */}
          <button
            onClick={() => scrollCategories("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center hover:bg-slate-50 transition-colors z-10"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 3: THREE-COLUMN PROMO BANNERS                                 */}
      {/* ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Col 1: Smartphones deal */}
          <div className="relative rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)", minHeight: 200 }}>
            <div className="p-6 text-white flex flex-col justify-between h-full min-h-[200px]">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase bg-amber-400 text-slate-900 px-2 py-0.5 rounded mb-3 inline-block">
                  BEST DEALS
                </span>
                <h3 className="text-2xl font-black leading-tight mt-2">Save Up To<br />50% Off</h3>
                <p className="text-violet-200 text-sm mt-1">On Smartphones</p>
              </div>
              <Link
                href="/products?category=Smartphones"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs text-slate-900 bg-amber-400 hover:bg-amber-300 transition-colors w-fit"
              >
                Shop Now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="absolute right-3 bottom-3 text-6xl opacity-30 select-none">📱</div>
          </div>

          {/* Col 2: Earbuds new arrival */}
          <div className="relative rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #001f3f 0%, #003055 100%)", minHeight: 200 }}>
            <div className="p-6 text-white flex flex-col justify-between h-full min-h-[200px]">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase bg-amber-400 text-slate-900 px-2 py-0.5 rounded mb-3 inline-block">
                  NEW ARRIVAL
                </span>
                <h3 className="text-xl font-black leading-tight mt-2">B&O Beoplay E8 3.0</h3>
                <p className="text-blue-200 text-sm mt-1">True Wireless Earbuds with Rich Sound</p>
              </div>
              <Link
                href="/products?category=Headphones+%26+Earbuds"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs text-slate-900 bg-amber-400 hover:bg-amber-300 transition-colors w-fit"
              >
                Shop Now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="absolute right-3 bottom-3 text-6xl opacity-30 select-none">🎧</div>
          </div>

          {/* Col 3: Smartwatches top seller */}
          <div className="relative rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0369a1 0%, #0284c7 100%)", minHeight: 200 }}>
            <div className="p-6 text-white flex flex-col justify-between h-full min-h-[200px]">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase bg-amber-400 text-slate-900 px-2 py-0.5 rounded mb-3 inline-block">
                  TOP SELLER
                </span>
                <h3 className="text-xl font-black leading-tight mt-2">Beauty on Your Wrist</h3>
                <p className="text-sky-200 text-sm mt-1">Shop Smartwatches for Every Lifestyle</p>
              </div>
              <Link
                href="/products?category=Smartwatches"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs text-slate-900 bg-amber-400 hover:bg-amber-300 transition-colors w-fit"
              >
                Shop Now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="absolute right-3 bottom-3 text-6xl opacity-30 select-none">⌚</div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 4: TRUST STRIP                                                */}
      {/* ===================================================================== */}
      <section className="bg-white border-y border-slate-200 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {TRUST_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5 text-[#003055]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-900">{item.title}</p>
                    <p className="text-[10px] text-slate-500">{item.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 5: TODAY'S FEATURED DEALS                                     */}
      {/* ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Today&apos;s Featured Deals</h2>
            {/* Countdown */}
            <div className="flex items-center gap-1 text-sm font-semibold text-slate-600 ml-2">
              <span className="text-slate-500 text-xs">Deal Ends In:</span>
              {[
                String(timeLeft.hours).padStart(2, "0"),
                String(timeLeft.minutes).padStart(2, "0"),
                String(timeLeft.seconds).padStart(2, "0"),
              ].map((unit, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-slate-400 font-bold">:</span>}
                  <span className="bg-[#003055] text-white text-xs font-black px-2 py-1 rounded min-w-[28px] text-center">
                    {unit}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
          <Link
            href="/products"
            className="text-sm font-bold text-[#003055] hover:text-blue-700 flex items-center gap-1 group"
          >
            View All Deals <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Horizontally scrollable product cards */}
        <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {FEATURED_DEALS.map((deal) => (
            <div
              key={deal.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition-shadow min-w-[190px] max-w-[190px] flex-shrink-0 relative"
            >
              {/* Discount badge */}
              <div className="absolute top-2 left-2 z-10 w-10 h-10 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center leading-tight text-center">
                -{deal.discount}%
              </div>
              {/* Wishlist */}
              <button
                onClick={() => toggleWishlist(deal.id)}
                className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-red-50 transition-colors shadow-sm"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    wishlist.has(deal.id) ? "fill-red-500 text-red-500" : "text-slate-400"
                  }`}
                />
              </button>
              {/* Product image */}
              <div className="relative w-full aspect-square bg-slate-50 flex items-center justify-center p-3">
                <Image
                  src={deal.image}
                  alt={deal.name}
                  fill
                  className="object-contain p-3"
                  sizes="190px"
                />
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 mb-1">{deal.name}</h3>
                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-[10px] font-bold text-slate-700">{deal.rating}</span>
                  <span className="text-[10px] text-slate-400">({deal.reviews})</span>
                </div>
                {/* Pricing */}
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-sm font-black text-slate-900">₹{deal.price.toLocaleString("en-IN")}</span>
                  <span className="text-[10px] text-slate-400 line-through">₹{deal.mrp.toLocaleString("en-IN")}</span>
                </div>
                <button
                  onClick={() => handleAddToCart(deal)}
                  className="mt-auto w-full py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-900 text-[11px] font-black transition-colors flex items-center justify-center gap-1"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 6: THREE PROMO FEATURE CARDS                                  */}
      {/* ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Super Cheap Price */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-800 to-slate-900 p-6 flex flex-col justify-between min-h-[140px]">
            <div>
              <p className="text-amber-400 font-black text-sm">Super Cheap Price</p>
              <p className="text-white text-xs mt-1">Earn 20% Back in Rewards</p>
            </div>
            <Link href="/products" className="mt-4 text-amber-400 text-xs font-bold flex items-center gap-1 group">
              Shop Now <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="absolute right-4 bottom-2 text-5xl opacity-25 select-none">🔊</div>
          </div>

          {/* Card 2: Power Bank */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-700 to-slate-800 p-6 flex flex-col justify-between min-h-[140px]">
            <div>
              <p className="text-white font-black text-sm">Power Bank 10000mAh</p>
              <p className="text-slate-300 text-xs mt-1">Compact, Fast &amp; Reliable</p>
              <p className="text-amber-400 font-black text-lg mt-1">₹799</p>
            </div>
            <Link href="/products?category=Smart+Gadgets" className="mt-4 text-amber-400 text-xs font-bold flex items-center gap-1 group">
              Shop Now <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="absolute right-4 bottom-2 text-5xl opacity-25 select-none">🔋</div>
          </div>

          {/* Card 3: Console Accessories */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 p-6 flex flex-col justify-between min-h-[140px]">
            <div>
              <p className="text-white font-black text-sm">Console Accessories</p>
              <p className="text-slate-300 text-xs mt-1">for PS5 &amp; Xbox</p>
              <p className="text-amber-400 text-xs font-bold mt-1">Up to 30% Off</p>
            </div>
            <Link href="/products?category=Gaming+%26+Accessories" className="mt-4 text-amber-400 text-xs font-bold flex items-center gap-1 group">
              Shop Now <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="absolute right-4 bottom-2 text-5xl opacity-25 select-none">🎮</div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 7: TRENDING THIS WEEK                                         */}
      {/* ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header with tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Trending This Week</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {TREND_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTrendTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTrendTab === tab
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
            <Link href="/products" className="text-xs font-bold text-[#003055] hover:text-blue-700 flex items-center gap-0.5">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Asymmetric Grid: 2 small | 1 large featured | 2 small */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Left 2 small cards */}
          {trendingToShow.slice(0, 2).map((prod) => (
            <TrendingSmallCard
              key={prod.id}
              prod={prod}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              handleAddToCart={handleAddToCart}
            />
          ))}

          {/* Center featured */}
          {(() => {
            const featured = trendingToShow.find((p) => p.featured) || trendingToShow[2];
            return (
              <div className="col-span-2 md:col-span-1 bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition-shadow flex flex-col relative row-span-2">
                <div className="absolute top-2 left-2 z-10 w-10 h-10 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center">
                  -{featured.discount}%
                </div>
                <button
                  onClick={() => toggleWishlist(featured.id)}
                  className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center hover:bg-red-50"
                >
                  <Heart className={`w-4 h-4 ${wishlist.has(featured.id) ? "fill-red-500 text-red-500" : "text-slate-400"}`} />
                </button>
                <div className="relative w-full bg-gradient-to-b from-rose-50 to-pink-100 flex items-center justify-center" style={{ minHeight: 220 }}>
                  <Image
                    src={featured.image}
                    alt={featured.name}
                    width={200}
                    height={200}
                    className="object-contain"
                  />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-black text-slate-900 leading-snug mb-1">{featured.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-slate-700">{featured.rating}</span>
                    <span className="text-[10px] text-slate-400">({featured.reviews})</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-3">
                    <span className="text-base font-black text-slate-900">₹{featured.price.toLocaleString("en-IN")}</span>
                    <span className="text-xs text-slate-400 line-through">₹{featured.mrp.toLocaleString("en-IN")}</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart({ ...featured, image: featured.image, reviews: featured.reviews })}
                    className="mt-auto w-full py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-black flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Right 2 small cards */}
          {trendingToShow.slice(3, 5).map((prod) => (
            <TrendingSmallCard
              key={prod.id}
              prod={prod}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              handleAddToCart={handleAddToCart}
            />
          ))}

          {/* Bottom row: 2 left + 2 right (skipping center) */}
          {trendingToShow.slice(5, 7).map((prod) => (
            <TrendingSmallCard
              key={prod.id}
              prod={prod}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              handleAddToCart={handleAddToCart}
            />
          ))}
          {/* center spacer for md */}
          <div className="hidden md:block" />
          {trendingToShow.slice(7, 9).map((prod) => (
            <TrendingSmallCard
              key={prod.id}
              prod={prod}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              handleAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 8: NEW COLLECTION FULL-WIDTH BANNER                           */}
      {/* ===================================================================== */}
      <section className="w-full bg-gradient-to-r from-[#0a1628] via-[#001f3f] to-[#002b4d] py-16 px-4 sm:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Left text */}
          <div className="text-white max-w-lg">
            <span className="text-xs font-black tracking-widest uppercase text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full mb-4 inline-block border border-amber-400/30">
              NEW COLLECTION
            </span>
            <h2 className="text-3xl sm:text-5xl font-black leading-tight mt-3 mb-3">
              Up to 30% Off<br />Instant Discount
            </h2>
            <p className="text-blue-200 text-base mb-8">
              Laptops, Tablets, Smartphones, Accessories &amp; More
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-sm transition-colors shadow-lg"
            >
              Shop the Collection <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right: floating product emojis */}
          <div className="flex gap-6 text-7xl select-none opacity-80">
            <div className="flex flex-col gap-4">
              <span>💻</span>
              <span>📱</span>
            </div>
            <div className="flex flex-col gap-4 mt-8">
              <span>📱</span>
              <span>🎧</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 9: STORE PRODUCTS (from initialProducts prop)                 */}
      {/* ===================================================================== */}
      {products && products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">All Products</h2>
            <Link href="/products" className="text-sm font-bold text-[#003055] hover:text-blue-700 flex items-center gap-1 group">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.slice(0, 10).map((prod) => (
              <div
                key={prod.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
              >
                <div className="relative aspect-square bg-slate-50 p-3 flex items-center justify-center">
                  {prod.badge && (
                    <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-[#003055] text-white text-[10px] font-bold uppercase">
                      {prod.badge}
                    </span>
                  )}
                  <Image
                    src={prod.poster_image}
                    alt={prod.name}
                    fill
                    className="object-contain p-3"
                    sizes="200px"
                  />
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[10px] font-bold text-slate-700">{prod.rating || 4.8}</span>
                    <span className="text-[10px] text-slate-400">({prod.review_count || 120})</span>
                  </div>
                  <Link href={`/products/${prod.id}`}>
                    <h3 className="text-xs font-bold text-slate-900 hover:text-[#003055] transition-colors line-clamp-2 leading-snug mb-1">
                      {prod.name}
                    </h3>
                  </Link>
                  <div className="flex items-baseline gap-1 mb-3 mt-auto pt-2">
                    <span className="text-sm font-black text-slate-900">₹{prod.price.toLocaleString("en-IN")}</span>
                    {prod.mrp && prod.mrp > prod.price && (
                      <span className="text-[10px] text-slate-400 line-through">₹{prod.mrp.toLocaleString("en-IN")}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addItem(prod, 1)}
                      className="flex-1 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <ShoppingCart className="w-3 h-3" /> Add
                    </button>
                    <button
                      onClick={() => handleBuyNow(prod)}
                      className="flex-1 py-1.5 rounded-lg bg-[#003055] hover:bg-[#00223f] text-white text-[10px] font-bold transition-colors"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* SECTION 10: DEALS FROM VITTAL_DIGITAL_DEALS                           */}
      {/* ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 fill-amber-400 text-amber-400" /> Flash Deals
          </h2>
          <Link href="/products" className="text-sm font-bold text-[#003055] hover:text-blue-700 flex items-center gap-1 group">
            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {VITTAL_DIGITAL_DEALS.map((deal) => (
            <div
              key={deal.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
            >
              <div className="relative aspect-square bg-slate-50 p-3 flex items-center justify-center">
                <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-black">
                  Deal
                </span>
                <span className="absolute top-2 right-2 z-10 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  Save ₹{deal.savings.toLocaleString("en-IN")}
                </span>
                <Image
                  src={deal.image}
                  alt={deal.name}
                  fill
                  className="object-contain p-3"
                  sizes="200px"
                />
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug mb-1">{deal.name}</h3>
                <p className="text-[10px] text-slate-500 mb-2 line-clamp-1">{deal.packageDescription}</p>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-sm font-black text-slate-900">₹{deal.price.toLocaleString("en-IN")}</span>
                  <span className="text-[10px] text-slate-400 line-through">₹{deal.mrp.toLocaleString("en-IN")}</span>
                </div>
                <button
                  onClick={() => handleBuyNow(deal)}
                  className="mt-auto w-full py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-black flex items-center justify-center gap-1 transition-colors"
                >
                  <Zap className="w-3 h-3 fill-white" /> Claim Deal
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 11: TRUST FOOTER STRIP                                        */}
      {/* ===================================================================== */}
      <section className="bg-slate-50 border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: BadgeCheck, label: "100% Authentic", desc: "Dubai sourced products" },
              { icon: ShieldCheck, label: "1-Year Warranty", desc: "Doorstep service in India" },
              { icon: Truck, label: "Express Delivery", desc: "2-4 business days" },
              { icon: Check, label: "Secure Checkout", desc: "UPI, Cards, Net Banking" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#003055]" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: Small trending card
// ---------------------------------------------------------------------------
function TrendingSmallCard({
  prod,
  wishlist,
  toggleWishlist,
  handleAddToCart,
}: {
  prod: typeof TRENDING_PRODUCTS[0];
  wishlist: Set<string>;
  toggleWishlist: (id: string) => void;
  handleAddToCart: (deal: typeof FEATURED_DEALS[0]) => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col relative">
      <div className="absolute top-2 left-2 z-10 w-9 h-9 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center leading-tight text-center">
        -{prod.discount}%
      </div>
      <button
        onClick={() => toggleWishlist(prod.id)}
        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center hover:bg-red-50"
      >
        <Heart className={`w-3.5 h-3.5 ${wishlist.has(prod.id) ? "fill-red-500 text-red-500" : "text-slate-400"}`} />
      </button>
      <div className="relative aspect-square bg-slate-50 flex items-center justify-center">
        <Image
          src={prod.image}
          alt={prod.name}
          fill
          className="object-contain p-3"
          sizes="180px"
        />
      </div>
      <div className="p-2.5 flex flex-col flex-1">
        <h3 className="text-[11px] font-bold text-slate-900 line-clamp-2 leading-snug mb-1">{prod.name}</h3>
        <div className="flex items-center gap-0.5 mb-1">
          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
          <span className="text-[9px] font-bold text-slate-700">{prod.rating}</span>
          <span className="text-[9px] text-slate-400">({prod.reviews})</span>
        </div>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-xs font-black text-slate-900">₹{prod.price.toLocaleString("en-IN")}</span>
          <span className="text-[9px] text-slate-400 line-through">₹{prod.mrp.toLocaleString("en-IN")}</span>
        </div>
        <button
          onClick={() => handleAddToCart({ ...prod, reviews: prod.reviews })}
          className="mt-auto w-full py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-900 text-[10px] font-black flex items-center justify-center gap-1 transition-colors"
        >
          <ShoppingCart className="w-3 h-3" /> Add to Cart
        </button>
      </div>
    </div>
  );
}

// Backward-compatible alias
export const TurkiyeJamStorefront = VittalDigitalStorefront;
