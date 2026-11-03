"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { launchFastrrCheckout } from "@/lib/fastrrClient";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
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
  Award,
  Package,
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
// Hero slides data matching reference design
// ---------------------------------------------------------------------------
const HERO_SLIDES = [
  {
    id: 1,
    label: "DUALSENSE WIRELESS CONTROLLER",
    headlineLine1: "Bring Gaming",
    headlineLine2: "Worlds",
    headlineHighlight: "To Life",
    subLabel: "Starting at",
    price: "₹44,990",
    image: "/vittal/extracted/hero-dualsense.png",
    imageAlt: "PlayStation 5 DualSense Wireless Controllers in Black and White",
    link: "/products?category=Gaming+%26+Accessories",
  },
  {
    id: 2,
    label: "NEXT-GEN ULTRABOOKS",
    headlineLine1: "Power Your Work",
    headlineLine2: "Anywhere",
    headlineHighlight: "Anytime",
    subLabel: "Up to 30% Off on",
    price: "HP & Lenovo",
    image: "/vittal/extracted/deal-hp-victus.png",
    imageAlt: "HP Victus Gaming Laptop",
    link: "/products?category=Laptops",
  },
  {
    id: 3,
    label: "STUDIO AUDIO SOUND",
    headlineLine1: "Pure Acoustic",
    headlineLine2: "Clarity In",
    headlineHighlight: "Every Beat",
    subLabel: "Starting at",
    price: "₹19,990",
    image: "/vittal/extracted/airpods-max-spotlight.png",
    imageAlt: "Apple AirPods Max and Audio Gear",
    link: "/products?category=Headphones+%26+Earbuds",
  },
];

// ---------------------------------------------------------------------------
// Floating Category capsule items (8 items)
// ---------------------------------------------------------------------------
const CATEGORIES = [
  { name: "Computers & Laptops", icon: Laptop, link: "/products?category=Laptops" },
  { name: "Cameras & Video", icon: Camera, link: "/products?category=Cameras" },
  { name: "Tablets", icon: Tablet, link: "/products?category=Tablets" },
  { name: "Smartphones", icon: Smartphone, link: "/products?category=Smartphones" },
  { name: "Smartwatches", icon: Watch, link: "/products?category=Smartwatches" },
  { name: "Gaming", icon: Gamepad2, link: "/products?category=Gaming+%26+Accessories" },
  { name: "Audio & Headphones", icon: Headphones, link: "/products?category=Headphones+%26+Earbuds" },
  { name: "Accessories", icon: Plug, link: "/products?category=Smart+Gadgets" },
];

// ---------------------------------------------------------------------------
// Trust strip items
// ---------------------------------------------------------------------------
const TRUST_ITEMS = [
  { icon: Package, title: "Dubai Sourced", sub: "Original Products" },
  { icon: BadgeCheck, title: "100% Genuine", sub: "Authentic & Verified" },
  { icon: Award, title: "Warranty Across India", sub: "Hassle-free Support" },
  { icon: CreditCard, title: "Secure Payments", sub: "UPI, Cards, Net Banking" },
  { icon: Truck, title: "Express Delivery", sub: "2-4 Days Across India" },
];

// ---------------------------------------------------------------------------
// Featured deals product data (Exact 6 cards matching reference design)
// ---------------------------------------------------------------------------
const FEATURED_DEALS = [
  {
    id: "hp-victus-15",
    name: "HP Victus 15 Gaming Laptop (i5, 16GB, 512GB)",
    price: 74990,
    mrp: 99990,
    discount: 25,
    rating: 4.6,
    reviews: "1,234",
    image: "/vittal/extracted/deal-hp-victus.png",
  },
  {
    id: "airpods-pro-2",
    name: "Apple AirPods Pro (2nd Generation)",
    price: 19990,
    mrp: 28990,
    discount: 30,
    rating: 4.6,
    reviews: "2,417",
    image: "/vittal/extracted/deal-airpods-pro.png",
  },
  {
    id: "galaxy-watch6",
    name: "Samsung Galaxy Watch6 (44mm)",
    price: 27999,
    mrp: 34999,
    discount: 20,
    rating: 4.5,
    reviews: "997",
    image: "/vittal/extracted/deal-galaxy-watch6.png",
  },
  {
    id: "dualsense-ps5",
    name: "PS5 DualSense Wireless Controller",
    price: 4799,
    mrp: 7490,
    discount: 35,
    rating: 4.7,
    reviews: "3,102",
    image: "/vittal/extracted/deal-ps5-controller.png",
  },
  {
    id: "jbl-charge-5",
    name: "JBL Charge 5 Portable Speaker",
    price: 9999,
    mrp: 13999,
    discount: 28,
    rating: 4.6,
    reviews: "1,876",
    image: "/vittal/extracted/deal-jbl-charge5.png",
  },
  {
    id: "iphone-15-128",
    name: "iPhone 15 (128GB) Imported",
    price: 62990,
    mrp: 92990,
    discount: 32,
    rating: 4.8,
    reviews: "4,205",
    image: "/vittal/extracted/deal-iphone-15.png",
  },
];

// ---------------------------------------------------------------------------
// Trending Section data (Left 4 + Center Spotlight + Right 4)
// ---------------------------------------------------------------------------
const TRENDING_LEFT = [
  {
    id: "galaxy-s24-256",
    name: "Samsung Galaxy S24 (256GB)",
    price: 74999,
    mrp: 91999,
    discount: 18,
    rating: 4.6,
    reviews: "2,135",
    image: "/vittal/extracted/trending-galaxy-s24.png",
  },
  {
    id: "lenovo-ideapad-slim5",
    name: "Lenovo IdeaPad Slim 5 (i5, 16GB, 512GB)",
    price: 59990,
    mrp: 76990,
    discount: 22,
    rating: 4.5,
    reviews: "843",
    image: "/vittal/extracted/trending-lenovo-ideapad.png",
  },
  {
    id: "galaxy-tab-s9-124",
    name: "Samsung Galaxy Tab S9 (12.4\", 256GB)",
    price: 64999,
    mrp: 81999,
    discount: 20,
    rating: 4.5,
    reviews: "679",
    image: "/vittal/extracted/trending-galaxy-tabs9.png",
  },
  {
    id: "boat-rockerz-255pro",
    name: "boAt Rockerz 255 Pro+ Neckband",
    price: 1699,
    mrp: 1999,
    discount: 15,
    rating: 4.4,
    reviews: "3,921",
    image: "/vittal/extracted/trending-boat-rockerz.png",
  },
];

const TRENDING_SPOTLIGHT = {
  id: "airpods-max-pink",
  name: "Apple AirPods Max",
  sub: "Wireless Headphones (USB-C)",
  price: 59990,
  mrp: 69990,
  rating: 4.7,
  reviews: "1,029",
  image: "/vittal/extracted/airpods-max-spotlight.png",
};

const TRENDING_RIGHT = [
  {
    id: "apple-watch-se-2",
    name: "Apple Watch SE (2nd Gen)",
    price: 28990,
    mrp: 38990,
    discount: 25,
    rating: 4.6,
    reviews: "1,987",
    image: "/vittal/extracted/trending-apple-watch-se.png",
  },
  {
    id: "wireless-charger-3in1",
    name: "3-in-1 Wireless Charging Station",
    price: 2799,
    mrp: 3999,
    discount: 30,
    rating: 4.4,
    reviews: "612",
    image: "/vittal/extracted/trending-wireless-charger-3in1.png",
  },
  {
    id: "lg-ultragear-27",
    name: "LG UltraGear 27\" Monitor (144Hz, IPS)",
    price: 18990,
    mrp: 23990,
    discount: 20,
    rating: 4.6,
    reviews: "744",
    image: "/vittal/extracted/trending-lg-ultragear-monitor.png",
  },
  {
    id: "oneplus-12r-16gb",
    name: "OnePlus 12R (16GB, 256GB)",
    price: 42999,
    mrp: 52999,
    discount: 18,
    rating: 4.5,
    reviews: "1,349",
    image: "/vittal/extracted/trending-oneplus-12r.png",
  },
];

const TREND_TABS = ["Best Seller", "Sales", "Featured", "New Products"];

export function VittalDigitalStorefront({ initialProducts }: StorefrontProps) {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const { toggleWishlist: toggleWishlistContext, isInWishlist } = useWishlist();

  const products =
    initialProducts && initialProducts.length > 0
      ? initialProducts
      : DEFAULT_PRODUCTS;

  // Hero carousel state
  const [activeSlide, setActiveSlide] = useState(0);
  // Countdown timer state matching reference: [06] : [15] : [48]
  const [timeLeft, setTimeLeft] = useState({ hours: 6, minutes: 15, seconds: 48 });
  // Trending tab state
  const [activeTrendTab, setActiveTrendTab] = useState("Best Seller");
  // Local quick wishlist tracker
  const [localWishlist, setLocalWishlist] = useState<Set<string>>(new Set());

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Auto-slide hero every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 6, minutes: 15, seconds: 48 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleWishlist = (id: string, name: string, price: number, image: string) => {
    setLocalWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    try {
      toggleWishlistContext({
        id,
        name,
        price,
        mrp: price * 1.3,
        poster_image: image,
        category: "Electronics",
        in_stock: 1,
      } as any);
    } catch {}
  };

  const handleAddToCart = (product: {
    id: string;
    name: string;
    price: number;
    mrp: number;
    image: string;
  }) => {
    addItem(
      {
        id: product.id,
        slug: product.id,
        name: product.name,
        price: product.price,
        mrp: product.mrp,
        offer_price: product.price,
        stock_count: 50,
        poster_image: product.image,
        in_stock: 1,
        category: "Electronics",
        tagline: "Dubai Sourced Genuine Product",
        description: "",
      },
      1
    );
    openCart();
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
        tagline: "Dubai Sourced Genuine Product",
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

  const scrollCategories = (dir: "left" | "right") => {
    if (!categoryScrollRef.current) return;
    categoryScrollRef.current.scrollBy({
      left: dir === "right" ? 280 : -280,
      behavior: "smooth",
    });
  };

  const currentHero = HERO_SLIDES[activeSlide];

  return (
    <div className="bg-[#FFFFFF] text-slate-900 font-sans min-h-screen">
      {/* ===================================================================== */}
      {/* SECTION 1: HERO CAROUSEL (Royal Blue Curved Radiant Glow + Controllers)*/}
      {/* ===================================================================== */}
      <section className="relative w-full overflow-hidden bg-[#001D40]">
        <div
          className="relative w-full transition-all duration-700 ease-out"
          style={{
            minHeight: "440px",
            background:
              "radial-gradient(circle at 68% 45%, #0050A4 0%, #002D62 50%, #001633 100%)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 flex flex-col lg:flex-row items-center justify-between min-h-[440px]">
            {/* Left Headline & Call-to-action */}
            <div className="w-full lg:max-w-xl text-white z-10 text-center lg:text-left mb-8 lg:mb-0">
              <p className="text-xs sm:text-sm font-bold tracking-widest uppercase mb-2 text-[#FFBE00]">
                {currentHero.label}
              </p>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white mb-4">
                <span>{currentHero.headlineLine1}</span>
                <br />
                <span>{currentHero.headlineLine2} </span>
                <span className="text-[#FFBE00]">{currentHero.headlineHighlight}</span>
              </h1>
              <div className="mb-6">
                <span className="text-xs sm:text-sm font-medium text-blue-200 block mb-0.5">
                  {currentHero.subLabel}
                </span>
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#FFBE00] tracking-tight">
                  {currentHero.price}
                </span>
              </div>
              <div>
                <Link
                  href={currentHero.link}
                  className="inline-flex items-center gap-2 bg-[#FFBE00] hover:bg-[#E5AA00] active:bg-[#CC9600] text-slate-950 font-black text-sm sm:text-base px-7 py-3 rounded-md transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </Link>
              </div>
            </div>

            {/* Right Hero Product Graphic */}
            <div className="relative w-full lg:w-1/2 flex items-center justify-center h-64 sm:h-80 lg:h-96">
              <div className="relative w-full h-full max-w-lg">
                <Image
                  src={currentHero.image}
                  alt={currentHero.imageAlt}
                  fill
                  priority
                  className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-500"
                />
              </div>
            </div>
          </div>

          {/* Slider Prev / Next Arrows */}
          <button
            onClick={() =>
              setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
            }
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all backdrop-blur-md"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={() =>
              setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)
            }
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all backdrop-blur-md"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === activeSlide
                    ? "bg-[#FFBE00] w-6 h-2.5"
                    : "bg-blue-300/40 hover:bg-white/60 w-2.5 h-2.5"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 2: FLOATING CATEGORY CAPSULE BAR                              */}
      {/* ===================================================================== */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-8 -mt-6 sm:-mt-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-3 sm:p-5 flex items-center justify-between">
          <div
            ref={categoryScrollRef}
            className="flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-hide py-1 w-full"
            style={{ scrollbarWidth: "none" }}
          >
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={cat.link}
                  className="flex flex-col items-center gap-2 group min-w-[78px] sm:min-w-[90px] shrink-0 text-center"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-50 border border-slate-100 group-hover:border-[#002D62] group-hover:bg-blue-50/50 flex items-center justify-center transition-all group-hover:scale-105 shadow-xs">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#002D62] group-hover:text-[#002D62] transition-colors" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-700 group-hover:text-[#002D62] leading-tight max-w-[80px]">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right Chevron Button */}
          <button
            onClick={() => scrollCategories("right")}
            className="hidden md:flex shrink-0 ml-3 w-8 h-8 rounded-full bg-[#002D62] hover:bg-blue-900 text-white items-center justify-center shadow-md transition-colors"
            aria-label="Scroll categories right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 3: THREE-COLUMN PROMO BANNERS                                 */}
      {/* ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Promo 1: Smartphones */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#EAEBFF] via-[#E2E6FF] to-[#D5DCFF] border border-indigo-100 p-6 flex flex-col justify-between min-h-[220px] shadow-sm hover:shadow-md transition-shadow">
            <div className="z-10 max-w-[170px]">
              <span className="text-[10px] font-black tracking-wider uppercase bg-[#002D62] text-white px-2 py-0.5 rounded shadow-xs inline-block mb-2">
                BEST DEALS
              </span>
              <h3 className="text-2xl font-black text-[#002D62] leading-tight mt-1">
                Save Up To<br />50% Off
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-1">On Smartphones</p>
              <Link
                href="/products?category=Smartphones"
                className="inline-flex items-center gap-1.5 mt-4 bg-[#FFBE00] hover:bg-[#E5AA00] text-slate-950 font-black text-xs px-4 py-2 rounded-md transition-colors shadow-sm"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="absolute right-1 bottom-1 w-40 h-44 z-0">
              <Image
                src="/vittal/extracted/promo-smartphones.png"
                alt="Smartphone Sale"
                fill
                className="object-contain object-bottom-right"
              />
            </div>
          </div>

          {/* Promo 2: Earbuds */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#FFF4EB] via-[#FCEAE0] to-[#F5D8CA] border border-orange-100 p-6 flex flex-col justify-between min-h-[220px] shadow-sm hover:shadow-md transition-shadow">
            <div className="z-10 max-w-[175px]">
              <span className="text-[10px] font-black tracking-wider uppercase bg-[#002D62] text-white px-2 py-0.5 rounded shadow-xs inline-block mb-2">
                NEW ARRIVAL
              </span>
              <h3 className="text-xl font-black text-[#002D62] leading-tight mt-1">
                B&O Beoplay E8 3.0
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-1">
                True Wireless Earbuds with Rich Sound
              </p>
              <Link
                href="/products?category=Headphones+%26+Earbuds"
                className="inline-flex items-center gap-1.5 mt-4 bg-[#FFBE00] hover:bg-[#E5AA00] text-slate-950 font-black text-xs px-4 py-2 rounded-md transition-colors shadow-sm"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="absolute right-2 bottom-2 w-36 h-36 z-0">
              <Image
                src="/vittal/extracted/promo-earbuds.png"
                alt="B&O Beoplay E8 3.0"
                fill
                className="object-contain object-bottom-right"
              />
            </div>
          </div>

          {/* Promo 3: Smartwatches */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#E6F3FA] via-[#D8ECF7] to-[#C9E4F4] border border-sky-100 p-6 flex flex-col justify-between min-h-[220px] shadow-sm hover:shadow-md transition-shadow">
            <div className="z-10 max-w-[170px]">
              <span className="text-[10px] font-black tracking-wider uppercase bg-[#002D62] text-white px-2 py-0.5 rounded shadow-xs inline-block mb-2">
                TOP SELLER
              </span>
              <h3 className="text-xl font-black text-[#002D62] leading-tight mt-1">
                Beauty on Your Wrist
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Shop Smartwatches for Every Lifestyle
              </p>
              <Link
                href="/products?category=Smartwatches"
                className="inline-flex items-center gap-1.5 mt-4 bg-[#FFBE00] hover:bg-[#E5AA00] text-slate-950 font-black text-xs px-4 py-2 rounded-md transition-colors shadow-sm"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="absolute right-2 bottom-1 w-36 h-44 z-0">
              <Image
                src="/vittal/extracted/promo-smartwatches.png"
                alt="Smartwatches"
                fill
                className="object-contain object-bottom-right"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 4: TRUST STRIP (Dubai Sourced, Genuine, Warranty, etc.)       */}
      {/* ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-5 border-y border-slate-200/80 my-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-4">
          {TRUST_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#002D62]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-tight">{item.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 5: TODAY'S FEATURED DEALS (With Golden Countdown Boxes)       */}
      {/* ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-[#FFBE00] fill-[#FFBE00]" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Today&apos;s Featured Deals
              </h2>
            </div>

            {/* Countdown Box in Golden Yellow */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-semibold mr-1">Deal Ends In :</span>
              <span className="bg-[#FFBE00] text-slate-950 px-2 py-0.5 rounded font-black text-xs min-w-[24px] text-center">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="font-black text-slate-400">:</span>
              <span className="bg-[#FFBE00] text-slate-950 px-2 py-0.5 rounded font-black text-xs min-w-[24px] text-center">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="font-black text-slate-400">:</span>
              <span className="bg-[#FFBE00] text-slate-950 px-2 py-0.5 rounded font-black text-xs min-w-[24px] text-center">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </div>
          </div>

          <Link
            href="/products"
            className="text-xs sm:text-sm font-bold text-[#002D62] hover:underline flex items-center gap-1"
          >
            <span>View All Deals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 6 Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {FEATURED_DEALS.map((deal) => {
            const isFav = localWishlist.has(deal.id) || isInWishlist(deal.id);
            return (
              <div
                key={deal.id}
                className="bg-white border border-slate-200/90 rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition-all duration-200 relative group"
              >
                {/* Discount Badge */}
                <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded">
                  -{deal.discount}%
                </div>

                {/* Wishlist Heart */}
                <button
                  onClick={() =>
                    handleToggleWishlist(deal.id, deal.name, deal.price, deal.image)
                  }
                  className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 border border-slate-200 shadow-xs flex items-center justify-center hover:bg-red-50 transition-colors"
                  aria-label="Add to wishlist"
                >
                  <Heart
                    className={`w-3.5 h-3.5 transition-colors ${
                      isFav ? "fill-red-500 text-red-500" : "text-slate-400"
                    }`}
                  />
                </button>

                {/* Product Image */}
                <Link
                  href={`/products/${deal.id}`}
                  className="relative w-full aspect-square bg-slate-50/50 p-4 flex items-center justify-center overflow-hidden"
                >
                  <Image
                    src={deal.image}
                    alt={deal.name}
                    fill
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 200px"
                  />
                </Link>

                {/* Details */}
                <div className="p-3 flex flex-col flex-1">
                  <Link href={`/products/${deal.id}`}>
                    <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 hover:text-[#002D62] transition-colors mb-1 min-h-[32px]">
                      {deal.name}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3 h-3 fill-[#FFBE00] text-[#FFBE00]" />
                    <span className="text-[11px] font-bold text-slate-800">
                      {deal.rating}
                    </span>
                    <span className="text-[10px] text-slate-400">({deal.reviews})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-3 mt-auto">
                    <span className="text-sm font-black text-slate-900">
                      ₹{deal.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-slate-400 line-through">
                      ₹{deal.mrp.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Add to Cart Yellow Button */}
                  <button
                    onClick={() => handleAddToCart(deal)}
                    className="w-full py-2 bg-[#FFBE00] hover:bg-[#E5AA00] active:bg-[#CC9600] text-slate-950 text-xs font-black rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 6: MIDDLE 3 PROMO FEATURE CARDS (Marshall, PowerBank, Console)*/}
      {/* ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Marshall Speaker */}
          <div className="relative rounded-2xl overflow-hidden bg-[#002D62] text-white p-6 flex flex-col justify-between min-h-[160px] shadow-sm">
            <div className="z-10 max-w-[170px]">
              <h3 className="text-lg font-black text-white leading-tight">
                Super Cheap Price
              </h3>
              <p className="text-xs text-blue-200 mt-1">Earn 20% Back in Rewards</p>
              <Link
                href="/products?category=Speakers"
                className="inline-flex items-center gap-1.5 mt-4 bg-[#FFBE00] hover:bg-[#E5AA00] text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-md transition-colors w-fit"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="absolute right-3 bottom-3 w-40 h-28 z-0">
              <Image
                src="/vittal/extracted/mid-marshall.png"
                alt="Marshall Speaker"
                fill
                className="object-contain object-bottom-right"
              />
            </div>
          </div>

          {/* Card 2: Power Bank */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-100 to-blue-50/60 border border-slate-200 p-6 flex flex-col justify-between min-h-[160px] shadow-sm">
            <div className="z-10 max-w-[170px]">
              <h3 className="text-base font-black text-slate-900 leading-tight">
                Power Bank 10000mAh
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Compact, Fast &amp; Reliable</p>
              <p className="text-2xl font-black text-slate-900 mt-2">₹799</p>
            </div>
            <div className="absolute right-4 bottom-2 w-32 h-28 z-0">
              <Image
                src="/vittal/extracted/mid-powerbank.png"
                alt="Power Bank"
                fill
                className="object-contain object-bottom-right"
              />
            </div>
          </div>

          {/* Card 3: Console Accessories */}
          <div className="relative rounded-2xl overflow-hidden bg-[#002D62] text-white p-6 flex flex-col justify-between min-h-[160px] shadow-sm">
            <div className="z-10 max-w-[175px]">
              <h3 className="text-base font-black text-white leading-tight">
                Console Accessories
              </h3>
              <p className="text-xs text-blue-200 mt-0.5">for PS5 &amp; Xbox</p>
              <div className="mt-3">
                <span className="bg-[#FFBE00] text-slate-950 font-black text-xs px-3 py-1 rounded-md inline-block">
                  Up to 30% Off
                </span>
              </div>
            </div>
            <div className="absolute right-2 bottom-2 w-36 h-28 z-0">
              <Image
                src="/vittal/extracted/mid-console.png"
                alt="Console Accessories"
                fill
                className="object-contain object-bottom-right"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 7: TRENDING THIS WEEK (Asymmetric 3-Column Layout)             */}
      {/* ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        {/* Section Header with Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#FFBE00] fill-[#FFBE00]" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Trending This Week
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {TREND_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTrendTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTrendTab === tab
                    ? "bg-[#002D62] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
            <Link
              href="/products"
              className="text-xs font-bold text-[#002D62] hover:underline flex items-center gap-0.5 ml-2"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 3 Columns Layout: Left (2x2) | Center (Spotlight) | Right (2x2) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* COLUMN 1: LEFT 2x2 GRID (4 cols in 12-grid) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-3.5">
            {TRENDING_LEFT.map((prod) => (
              <TrendingSmallCard
                key={prod.id}
                prod={prod}
                isFav={localWishlist.has(prod.id) || isInWishlist(prod.id)}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {/* COLUMN 2: CENTER AIRPODS MAX SPOTLIGHT (4 cols in 12-grid) */}
          <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow flex flex-col justify-between">
            {/* Top Pedestal Graphic */}
            <div className="relative w-full aspect-square bg-gradient-to-b from-[#FFF0F2] to-[#FFE2E7] flex items-center justify-center p-4">
              <Image
                src={TRENDING_SPOTLIGHT.image}
                alt={TRENDING_SPOTLIGHT.name}
                fill
                className="object-contain p-4 hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 1024px) 100vw, 400px"
              />
            </div>

            {/* Bottom Details & Buy Action */}
            <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-white">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {TRENDING_SPOTLIGHT.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium mb-2">
                  {TRENDING_SPOTLIGHT.sub}
                </p>
                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-3.5 h-3.5 fill-[#FFBE00] text-[#FFBE00]" />
                  <span className="text-xs font-bold text-slate-800">
                    {TRENDING_SPOTLIGHT.rating}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ({TRENDING_SPOTLIGHT.reviews})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-slate-900">
                    ₹{TRENDING_SPOTLIGHT.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    ₹{TRENDING_SPOTLIGHT.mrp.toLocaleString("en-IN")}
                  </span>
                </div>
                <button
                  onClick={() => handleAddToCart(TRENDING_SPOTLIGHT)}
                  className="bg-[#FFBE00] hover:bg-[#E5AA00] active:bg-[#CC9600] text-slate-950 font-black text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <ShoppingCart className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>

          {/* COLUMN 3: RIGHT 2x2 GRID (4 cols in 12-grid) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-3.5">
            {TRENDING_RIGHT.map((prod) => (
              <TrendingSmallCard
                key={prod.id}
                prod={prod}
                isFav={localWishlist.has(prod.id) || isInWishlist(prod.id)}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 8: NEW COLLECTION FULL-WIDTH BANNER                           */}
      {/* ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-14 pt-4">
        <div className="w-full bg-gradient-to-r from-[#001428] via-[#002D62] to-[#003B80] rounded-2xl overflow-hidden p-8 sm:p-12 relative flex flex-col md:flex-row items-center justify-between shadow-xl">
          {/* Left Text Content */}
          <div className="text-white max-w-lg z-10 text-center md:text-left mb-8 md:mb-0">
            <span className="text-[11px] font-black tracking-widest uppercase text-white bg-white/10 px-3 py-1 rounded-full border border-white/20 inline-block mb-3">
              NEW COLLECTION
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight text-white mb-2">
              Up to 30% Off<br />Instant Discount
            </h2>
            <p className="text-blue-200 text-xs sm:text-sm mb-6">
              Laptops, Tablets, Smartphones, Accessories &amp; More
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#FFBE00] hover:bg-[#E5AA00] text-slate-950 font-black text-xs sm:text-sm px-6 py-3 rounded-lg transition-colors shadow-lg"
            >
              <span>Shop the Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right Product Devices Graphic */}
          <div className="relative w-full md:w-1/2 h-56 sm:h-72 lg:h-80 z-10 flex items-center justify-center">
            <Image
              src="/vittal/extracted/bottom-banner-devices.png"
              alt="Electronics Collection"
              fill
              className="object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
            />
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 9: ALL STORE PRODUCTS (Live Database / Catalog)               */}
      {/* ===================================================================== */}
      {products && products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10 border-t border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">All Products</h2>
            <Link
              href="/products"
              className="text-xs sm:text-sm font-bold text-[#002D62] hover:underline flex items-center gap-1"
            >
              <span>View Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.slice(0, 10).map((prod) => (
              <div
                key={prod.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col group"
              >
                <div className="relative aspect-square bg-slate-50 p-3 flex items-center justify-center">
                  {prod.badge && (
                    <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-[#002D62] text-white text-[10px] font-bold uppercase">
                      {prod.badge}
                    </span>
                  )}
                  <Image
                    src={prod.poster_image}
                    alt={prod.name}
                    fill
                    className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                    sizes="200px"
                  />
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-3 h-3 fill-[#FFBE00] text-[#FFBE00]" />
                    <span className="text-[10px] font-bold text-slate-700">
                      {prod.rating || 4.8}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({prod.review_count || 120})
                    </span>
                  </div>
                  <Link href={`/products/${prod.id}`}>
                    <h3 className="text-xs font-bold text-slate-900 hover:text-[#002D62] transition-colors line-clamp-2 leading-snug mb-1 min-h-[32px]">
                      {prod.name}
                    </h3>
                  </Link>
                  <div className="flex items-baseline gap-1 mb-3 mt-auto pt-2">
                    <span className="text-sm font-black text-slate-900">
                      ₹{prod.price.toLocaleString("en-IN")}
                    </span>
                    {prod.mrp && prod.mrp > prod.price && (
                      <span className="text-[10px] text-slate-400 line-through">
                        ₹{prod.mrp.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addItem(prod, 1)}
                      className="flex-1 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <ShoppingCart className="w-3 h-3" /> Add
                    </button>
                    <button
                      onClick={() => handleBuyNow(prod)}
                      className="flex-1 py-1.5 rounded-lg bg-[#002D62] hover:bg-blue-900 text-white text-[10px] font-bold transition-colors"
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
      {/* SECTION 10: TRUST & WARRANTY FOOTER STRIP                             */}
      {/* ===================================================================== */}
      <section className="bg-slate-50 border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: BadgeCheck, label: "100% Authentic", desc: "Dubai sourced electronics" },
              { icon: ShieldCheck, label: "1-Year Warranty", desc: "All-India coverage & service" },
              { icon: Truck, label: "Express Delivery", desc: "2-4 business days air cargo" },
              { icon: Check, label: "Secure Checkout", desc: "UPI, Cards, Net Banking" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#002D62]" />
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
// Sub-component: Small Trending Card (For 2x2 grids)
// ---------------------------------------------------------------------------
function TrendingSmallCard({
  prod,
  isFav,
  onToggleWishlist,
  onAddToCart,
}: {
  prod: {
    id: string;
    name: string;
    price: number;
    mrp: number;
    discount: number;
    rating: number;
    reviews: string;
    image: string;
  };
  isFav: boolean;
  onToggleWishlist: (id: string, name: string, price: number, image: string) => void;
  onAddToCart: (p: { id: string; name: string; price: number; mrp: number; image: string }) => void;
}) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col relative group">
      {/* Discount badge */}
      <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
        -{prod.discount}%
      </div>

      {/* Wishlist button */}
      <button
        onClick={() => onToggleWishlist(prod.id, prod.name, prod.price, prod.image)}
        className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-white/90 border border-slate-200 shadow-xs flex items-center justify-center hover:bg-red-50 transition-colors"
        aria-label="Wishlist"
      >
        <Heart
          className={`w-3 h-3 transition-colors ${
            isFav ? "fill-red-500 text-red-500" : "text-slate-400"
          }`}
        />
      </button>

      {/* Image */}
      <Link
        href={`/products/${prod.id}`}
        className="relative w-full aspect-square bg-slate-50/50 p-2 flex items-center justify-center overflow-hidden"
      >
        <Image
          src={prod.image}
          alt={prod.name}
          fill
          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          sizes="160px"
        />
      </Link>

      {/* Text Info */}
      <div className="p-2.5 flex flex-col flex-1 justify-between">
        <div>
          <Link href={`/products/${prod.id}`}>
            <h4 className="text-[11px] font-bold text-slate-900 line-clamp-2 leading-snug hover:text-[#002D62] transition-colors mb-1 min-h-[30px]">
              {prod.name}
            </h4>
          </Link>
          <div className="flex items-center gap-1 mb-1.5">
            <Star className="w-2.5 h-2.5 fill-[#FFBE00] text-[#FFBE00]" />
            <span className="text-[10px] font-bold text-slate-800">{prod.rating}</span>
            <span className="text-[9px] text-slate-400">({prod.reviews})</span>
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-xs font-black text-slate-900">
              ₹{prod.price.toLocaleString("en-IN")}
            </span>
            <span className="text-[9px] text-slate-400 line-through">
              ₹{prod.mrp.toLocaleString("en-IN")}
            </span>
          </div>
          <button
            onClick={() => onAddToCart(prod)}
            className="w-full py-1.5 rounded-md bg-[#FFBE00] hover:bg-[#E5AA00] text-slate-950 text-[10px] font-black flex items-center justify-center gap-1 transition-colors"
          >
            <ShoppingCart className="w-3 h-3 stroke-[2.5]" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Backward-compatible alias
export const TurkiyeJamStorefront = VittalDigitalStorefront;
