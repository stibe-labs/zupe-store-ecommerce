"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
// Three Promo Banners Data (All background-removed transparent PNGs)
// ---------------------------------------------------------------------------
const PROMO_CARDS = [
  {
    id: "smartphones",
    badge: "BEST DEALS",
    titleLine1: "Save Up To",
    titleLine2: "50% Off",
    subtitle: "On Smartphones",
    link: "/products?category=Smartphones",
    image: "/vittal/products/iphone-15-transparent.png",
    imageAlt: "Smartphone Sale",
    imageClass: "w-40 sm:w-44 h-44 sm:h-48",
    bgGradient: "bg-gradient-to-br from-[#EAEBFF] via-[#E2E6FF] to-[#D5DCFF] border-indigo-100",
  },
  {
    id: "earbuds",
    badge: "NEW ARRIVAL",
    titleLine1: "B&O Beoplay E8",
    titleLine2: "3.0 Wireless",
    subtitle: "True Wireless Earbuds with Rich Sound",
    link: "/products?category=Headphones+%26+Earbuds",
    image: "/vittal/products/airpods-pro-transparent.png",
    imageAlt: "B&O Beoplay E8 3.0",
    imageClass: "w-40 sm:w-44 h-40 sm:h-44",
    bgGradient: "bg-gradient-to-br from-[#FFF4EB] via-[#FCEAE0] to-[#F5D8CA] border-orange-100",
  },
  {
    id: "smartwatches",
    badge: "TOP SELLER",
    titleLine1: "Beauty on",
    titleLine2: "Your Wrist",
    subtitle: "Shop Smartwatches for Every Lifestyle",
    link: "/products?category=Smartwatches",
    image: "/vittal/products/smart-watch-1-transparent.png",
    imageAlt: "Smartwatches",
    imageClass: "w-36 sm:w-40 h-44 sm:h-48",
    bgGradient: "bg-gradient-to-br from-[#E6F3FA] via-[#D8ECF7] to-[#C9E4F4] border-sky-100",
  },
];

// ---------------------------------------------------------------------------
// Featured deals product data (6 items with ultra-sharp studio photos)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Middle 3 Promo Banners Data (Section 6) with plain background in round frame
// ---------------------------------------------------------------------------
const MID_PROMO_CARDS = [
  {
    id: "speaker",
    badge: "AUDIO DEAL",
    titleLine1: "Super Cheap",
    titleLine2: "Price",
    subtitle: "Earn 20% Back in Rewards",
    theme: "dark",
    cardBg: "bg-[#002D62] text-white",
    ctaText: "Shop Now",
    ctaLink: "/products?category=Speakers",
    ctaType: "button",
    image: "/vittal/promo-speaker-nobg.png",
    imageAlt: "Wireless Bluetooth Speaker",
  },
  {
    id: "powerbank",
    badge: "COMPACT CHARGER",
    titleLine1: "Power Bank",
    titleLine2: "10000mAh",
    subtitle: "Compact, Fast & Reliable",
    priceText: "₹799",
    theme: "light",
    cardBg: "bg-gradient-to-r from-slate-100 via-white to-blue-50/60 border border-slate-200 text-slate-900",
    ctaLink: "/products?category=Accessories",
    ctaType: "price",
    image: "/vittal/promo-powerbank-nobg.png",
    imageAlt: "Power Bank 10000mAh",
  },
  {
    id: "console",
    badge: "GAMING GEAR",
    titleLine1: "Console",
    titleLine2: "Accessories",
    subtitle: "for PS5 & Xbox",
    badgeText: "Up to 30% Off",
    theme: "dark",
    cardBg: "bg-[#002D62] text-white",
    ctaLink: "/products?category=Gaming+%26+Accessories",
    ctaType: "badge",
    image: "/vittal/promo-console-nobg.png",
    imageAlt: "DualSense Wireless Controller",
  },
];

const FEATURED_DEALS = [
  {
    id: "hp-victus-15",
    name: "HP Victus 15 Gaming Laptop (i5, 16GB, 512GB)",
    price: 74990,
    mrp: 99990,
    discount: 25,
    rating: 4.6,
    reviews: "1,234",
    image: "/vittal/products/hp-victus.jpg",
  },
  {
    id: "airpods-pro-2",
    name: "Apple AirPods Pro (2nd Generation)",
    price: 19990,
    mrp: 28990,
    discount: 30,
    rating: 4.6,
    reviews: "2,417",
    image: "/vittal/products/airpods-pro.jpg",
  },
  {
    id: "galaxy-watch6",
    name: "Samsung Galaxy Watch6 (44mm)",
    price: 27999,
    mrp: 34999,
    discount: 20,
    rating: 4.5,
    reviews: "997",
    image: "/vittal/smart-watch-pro-2.png",
  },
  {
    id: "dualsense-ps5",
    name: "PS5 DualSense Wireless Controller",
    price: 4799,
    mrp: 7490,
    discount: 35,
    rating: 4.7,
    reviews: "3,102",
    image: "/vittal/products/ps5-controller.jpg",
  },
  {
    id: "jbl-charge-5",
    name: "JBL Charge 5 Portable Speaker",
    price: 9999,
    mrp: 13999,
    discount: 28,
    rating: 4.6,
    reviews: "1,876",
    image: "/vittal/products/jbl-charge5.jpg",
  },
  {
    id: "iphone-15-128",
    name: "iPhone 15 (128GB) Imported",
    price: 62990,
    mrp: 92990,
    discount: 32,
    rating: 4.8,
    reviews: "4,205",
    image: "/vittal/products/iphone-15.jpg",
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
    image: "/vittal/products/galaxy-s24.jpg",
  },
  {
    id: "lenovo-ideapad-slim5",
    name: "Lenovo IdeaPad Slim 5 (i5, 16GB, 512GB)",
    price: 59990,
    mrp: 76990,
    discount: 22,
    rating: 4.5,
    reviews: "843",
    image: "/vittal/products/lenovo-ideapad.jpg",
  },
  {
    id: "galaxy-tab-s9-124",
    name: "Samsung Galaxy Tab S9 (12.4\", 256GB)",
    price: 64999,
    mrp: 81999,
    discount: 20,
    rating: 4.5,
    reviews: "679",
    image: "/vittal/products/galaxy-tabs9.jpg",
  },
  {
    id: "boat-rockerz-255pro",
    name: "boAt Rockerz 255 Pro+ Neckband",
    price: 1699,
    mrp: 1999,
    discount: 15,
    rating: 4.4,
    reviews: "3,921",
    image: "/vittal/wireless-earbuds.png",
  },
];

const SPOTLIGHT_VARIANTS = [
  {
    id: "airpods-max-pink",
    slug: "airpods-max-pink",
    name: "Apple AirPods Max",
    colorName: "Pink",
    sub: "Wireless Headphones (USB-C)",
    price: 59990,
    mrp: 69990,
    rating: 4.7,
    reviews: "1,029",
    image: "/vittal/products/airpods-max-pink-stage-trans.png",
    swatchColor: "#F472B6",
  },
  {
    id: "airpods-max-silver",
    slug: "airpods-max-pink",
    name: "Apple AirPods Max",
    colorName: "Silver",
    sub: "Wireless Headphones (USB-C)",
    price: 59990,
    mrp: 69990,
    rating: 4.7,
    reviews: "1,029",
    image: "/vittal/products/airpods-max-silver-stage-trans.png",
    swatchColor: "#E2E8F0",
  },
  {
    id: "airpods-max-black",
    slug: "airpods-max-pink",
    name: "Apple AirPods Max",
    colorName: "Space Black",
    sub: "Wireless Headphones (USB-C)",
    price: 59990,
    mrp: 69990,
    rating: 4.7,
    reviews: "1,029",
    image: "/vittal/products/airpods-max-black-stage-trans.png",
    swatchColor: "#1E2024",
  },
];

const TRENDING_SPOTLIGHT = SPOTLIGHT_VARIANTS[0];

const TRENDING_RIGHT = [
  {
    id: "apple-watch-se-2",
    name: "Apple Watch SE (2nd Gen)",
    price: 28990,
    mrp: 38990,
    discount: 25,
    rating: 4.6,
    reviews: "1,987",
    image: "/vittal/smart-watch-pro.png",
  },
  {
    id: "wireless-charger-3in1",
    name: "3-in-1 Wireless Charging Station",
    price: 2799,
    mrp: 3999,
    discount: 30,
    rating: 4.4,
    reviews: "612",
    image: "/vittal/compact-power-bank.png",
  },
  {
    id: "lg-ultragear-27",
    name: "LG UltraGear 27\" Monitor (144Hz, IPS)",
    price: 18990,
    mrp: 23990,
    discount: 20,
    rating: 4.6,
    reviews: "744",
    image: "/vittal/products/lg-ultragear.jpg",
  },
  {
    id: "oneplus-12r-16gb",
    name: "OnePlus 12R (16GB, 256GB)",
    price: 42999,
    mrp: 52999,
    discount: 18,
    rating: 4.5,
    reviews: "1,349",
    image: "/vittal/products/oneplus-12r.jpg",
  },
];

const TREND_TABS = ["Best Seller", "Sales", "Featured", "New Products"];

export function VittalDigitalStorefront({
  initialProducts,
}: StorefrontProps) {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const { toggleWishlist: toggleWishlistContext, isInWishlist } = useWishlist();

  const products =
    initialProducts && initialProducts.length > 0
      ? initialProducts
      : DEFAULT_PRODUCTS;

  // Mobile 3-Card Promo Carousel auto-slides every 3 seconds (came from right side)
  const [promoSlide, setPromoSlide] = useState(0);
  // Middle 3 Promo feature cards auto-slide on mobile every 3 seconds
  const [midPromoSlide, setMidPromoSlide] = useState(0);

  // Auto-slide middle 3 promo cards on mobile every 3 seconds
  useEffect(() => {
    const midTimer = setInterval(() => {
      setMidPromoSlide((prev) => (prev + 1) % MID_PROMO_CARDS.length);
    }, 3000);
    return () => clearInterval(midTimer);
  }, []);

  // Countdown timer state matching reference: [06] : [15] : [48]
  const [timeLeft, setTimeLeft] = useState({ hours: 6, minutes: 15, seconds: 48 });
  // Trending tab state
  const [activeTrendTab, setActiveTrendTab] = useState("Best Seller");
  // Local quick wishlist tracker
  const [localWishlist, setLocalWishlist] = useState<Set<string>>(new Set());

  // Center Spotlight AirPods Max color carousel (auto-switches every 3 seconds from right)
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [isSpotlightPaused, setIsSpotlightPaused] = useState(false);

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Auto-slide mobile promo cards every 3 seconds
  useEffect(() => {
    const promoTimer = setInterval(() => {
      setPromoSlide((prev) => (prev + 1) % PROMO_CARDS.length);
    }, 3000);
    return () => clearInterval(promoTimer);
  }, []);

  // Auto-slide center AirPods Max spotlight colors every 3 seconds
  useEffect(() => {
    if (isSpotlightPaused) return;
    const spotlightTimer = setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % SPOTLIGHT_VARIANTS.length);
    }, 3000);
    return () => clearInterval(spotlightTimer);
  }, [isSpotlightPaused]);

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
      left: dir === "right" ? 320 : -320,
      behavior: "smooth",
    });
  };

  const currentSpotlight = SPOTLIGHT_VARIANTS[spotlightIndex];

  return (
    <div className="bg-[#FFFFFF] text-slate-900 font-sans min-h-screen">
      {/* ===================================================================== */}
      {/* SECTION 1: CATEGORY CAPSULE BAR                                       */}
      {/* ===================================================================== */}
      <section className="relative z-20 max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 mb-2 sm:mb-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 py-2 sm:py-2.5 px-3 sm:px-6 flex items-center justify-between">
          <div
            ref={categoryScrollRef}
            className="flex items-center justify-between gap-3 sm:gap-5 overflow-x-auto scrollbar-hide py-0.5 w-full"
            style={{ scrollbarWidth: "none" }}
          >
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={cat.link}
                  className="flex flex-col items-center gap-1 group min-w-[70px] sm:min-w-[90px] shrink-0 text-center flex-1"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 border border-slate-100 group-hover:border-[#002D62] group-hover:bg-blue-50/50 flex items-center justify-center transition-all group-hover:scale-105 shadow-xs">
                    <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#002D62] group-hover:text-[#002D62] transition-colors" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 group-hover:text-[#002D62] leading-tight max-w-[85px]">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right Chevron Button */}
          <button
            onClick={() => scrollCategories("right")}
            className="hidden md:flex shrink-0 ml-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#002D62] hover:bg-blue-900 text-white items-center justify-center shadow-md transition-colors"
            aria-label="Scroll categories right"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 3: THREE-COLUMN PROMO BANNERS (Auto-sliding Carousel on Mobile) */}
      {/* ===================================================================== */}
      <section className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-8 pb-7 sm:pb-10">
        {/* Desktop View: All 3 cards side-by-side in 3-column grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {PROMO_CARDS.map((card) => (
            <div
              key={card.id}
              className={`relative rounded-2xl overflow-hidden ${card.bgGradient} border p-6 sm:p-7 flex flex-col justify-between min-h-[240px] shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="z-10 max-w-[210px]">
                <span className="text-[10px] font-black tracking-wider uppercase bg-[#002D62] text-white px-2.5 py-1 rounded shadow-xs inline-block mb-2">
                  {card.badge}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#002D62] leading-tight mt-1">
                  {card.titleLine1}
                  <br />
                  {card.titleLine2}
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  {card.subtitle}
                </p>
                <Link
                  href={card.link}
                  className="inline-flex items-center gap-1.5 mt-5 bg-[#FFBE00] hover:bg-[#E5AA00] text-slate-950 font-black text-xs px-4 py-2.5 rounded-md transition-colors shadow-sm"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className={`absolute right-3 bottom-2 ${card.imageClass} z-0`}>
                <Image
                  src={card.image}
                  alt={card.imageAlt}
                  fill
                  className="object-contain object-bottom-right drop-shadow-md"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View: Single card position with 3-second auto-slide animation from the right */}
        <div className="block md:hidden">
          <div className="relative w-full overflow-hidden rounded-2xl min-h-[220px]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={promoSlide}
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
                className="w-full"
              >
                <div
                  className={`relative rounded-2xl overflow-hidden ${PROMO_CARDS[promoSlide].bgGradient} border p-6 flex flex-col justify-between min-h-[220px] shadow-sm`}
                >
                  <div className="z-10 max-w-[200px]">
                    <span className="text-[10px] font-black tracking-wider uppercase bg-[#002D62] text-white px-2.5 py-1 rounded shadow-xs inline-block mb-2">
                      {PROMO_CARDS[promoSlide].badge}
                    </span>
                    <h3 className="text-xl font-black text-[#002D62] leading-tight mt-1">
                      {PROMO_CARDS[promoSlide].titleLine1}
                      <br />
                      {PROMO_CARDS[promoSlide].titleLine2}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mt-1">
                      {PROMO_CARDS[promoSlide].subtitle}
                    </p>
                    <Link
                      href={PROMO_CARDS[promoSlide].link}
                      className="inline-flex items-center gap-1.5 mt-4 bg-[#FFBE00] hover:bg-[#E5AA00] text-slate-950 font-black text-xs px-4 py-2 rounded-md transition-colors shadow-sm"
                    >
                      <span>Shop Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div
                    className={`absolute right-3 bottom-2 ${PROMO_CARDS[promoSlide].imageClass} z-0`}
                  >
                    <Image
                      src={PROMO_CARDS[promoSlide].image}
                      alt={PROMO_CARDS[promoSlide].imageAlt}
                      fill
                      priority
                      className="object-contain object-bottom-right drop-shadow-md"
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile Dots Indicator (3 dots for 3 cards) */}
          <div className="flex items-center justify-center gap-2 mt-3">
            {PROMO_CARDS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPromoSlide(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === promoSlide
                    ? "bg-[#002D62] w-6 h-1.5"
                    : "bg-slate-300 hover:bg-slate-400 w-1.5 h-1.5"
                }`}
                aria-label={`Go to promo card ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 4: TRUST STRIP (Dubai Sourced, Genuine, Warranty, etc.)       */}
      {/* ===================================================================== */}
      <section className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-5 border-y border-slate-200/80 my-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-6">
          {TRUST_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#002D62]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-tight mt-0.5">
                    {item.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 5: TODAY'S FEATURED DEALS (With Golden Countdown Boxes)       */}
      {/* ===================================================================== */}
      <section className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-200">
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

        {/* 6 Product Cards Grid with Expanded Width */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {FEATURED_DEALS.map((deal) => {
            const isFav = localWishlist.has(deal.id) || isInWishlist(deal.id);
            return (
              <div
                key={deal.id}
                className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden flex flex-col hover:shadow-xl hover:border-blue-200 transition-all duration-200 relative group"
              >
                {/* Discount Badge */}
                <div className="absolute top-2.5 left-2.5 z-10 bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-xs">
                  -{deal.discount}%
                </div>

                {/* Wishlist Heart */}
                <button
                  onClick={() =>
                    handleToggleWishlist(deal.id, deal.name, deal.price, deal.image)
                  }
                  className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90 border border-slate-200 shadow-xs flex items-center justify-center hover:bg-red-50 transition-colors"
                  aria-label="Add to wishlist"
                >
                  <Heart
                    className={`w-3.5 h-3.5 transition-colors ${
                      isFav ? "fill-red-500 text-red-500" : "text-slate-400"
                    }`}
                  />
                </button>

                {/* Product Image on Clean White */}
                <Link
                  href={`/products/${deal.id}`}
                  className="relative w-full aspect-square bg-slate-50/40 p-4 flex items-center justify-center overflow-hidden"
                >
                  <Image
                    src={deal.image}
                    alt={deal.name}
                    fill
                    className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 280px"
                  />
                </Link>

                {/* Details */}
                <div className="p-3.5 flex flex-col flex-1">
                  <Link href={`/products/${deal.id}`}>
                    <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug line-clamp-2 hover:text-[#002D62] transition-colors mb-1.5 min-h-[36px]">
                      {deal.name}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3.5 h-3.5 fill-[#FFBE00] text-[#FFBE00]" />
                    <span className="text-xs font-bold text-slate-800">
                      {deal.rating}
                    </span>
                    <span className="text-[11px] text-slate-400">({deal.reviews})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-3.5 mt-auto">
                    <span className="text-sm sm:text-base font-black text-slate-900">
                      ₹{deal.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] text-slate-400 line-through">
                      ₹{deal.mrp.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Add to Cart Yellow Button */}
                  <button
                    onClick={() => handleAddToCart(deal)}
                    className="w-full py-2.5 bg-[#FFBE00] hover:bg-[#E5AA00] active:bg-[#CC9600] text-slate-950 text-xs font-black rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
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
      <section className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Desktop View: All 3 cards in responsive 3-column grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {MID_PROMO_CARDS.map((card) => (
            <div
              key={card.id}
              className={`relative rounded-2xl overflow-hidden ${card.cardBg} p-6 sm:p-7 flex items-center justify-between gap-4 min-h-[175px] shadow-sm hover:shadow-md transition-all group`}
            >
              <div className="z-10 flex-1 max-w-[210px]">
                <h3 className={`text-lg sm:text-xl font-black leading-tight ${card.theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {card.titleLine1} {card.titleLine2}
                </h3>
                <p className={`text-xs mt-1 font-medium ${card.theme === 'dark' ? 'text-blue-200' : 'text-slate-500'}`}>
                  {card.subtitle}
                </p>

                {card.ctaType === "button" && (
                  <Link
                    href={card.ctaLink}
                    className="inline-flex items-center gap-1.5 mt-4 bg-[#FFBE00] hover:bg-[#E5AA00] text-slate-950 font-black text-xs px-4 py-2 rounded-md transition-colors shadow-xs w-fit"
                  >
                    <span>{card.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}

                {card.ctaType === "price" && (
                  <Link href={card.ctaLink} className="block mt-3">
                    <p className="text-2xl font-black text-slate-900 hover:text-blue-600 transition-colors">
                      {card.priceText}
                    </p>
                  </Link>
                )}

                {card.ctaType === "badge" && (
                  <Link href={card.ctaLink} className="inline-block mt-3.5">
                    <span className="bg-[#FFBE00] text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-md inline-block shadow-xs hover:bg-[#E5AA00] transition-colors">
                      {card.badgeText}
                    </span>
                  </Link>
                )}
              </div>

              {/* Round-edged white frame containing background-removed product image on plain background */}
              <Link
                href={card.ctaLink}
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white shadow-md border border-slate-100 flex items-center justify-center p-2.5 overflow-hidden shrink-0 group-hover:scale-105 transition-transform"
              >
                <Image
                  src={card.image}
                  alt={card.imageAlt}
                  fill
                  sizes="(max-width: 640px) 112px, 128px"
                  className="object-contain p-2 drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
            </div>
          ))}
        </div>

        {/* Mobile View: Animated 3-second Auto-Slide Carousel from Right */}
        <div className="md:hidden">
          <div className="relative overflow-hidden rounded-2xl">
            <div
              key={midPromoSlide}
              className="animate-in fade-in slide-in-from-right duration-500"
            >
              <div
                className={`relative rounded-2xl overflow-hidden ${MID_PROMO_CARDS[midPromoSlide].cardBg} p-5 sm:p-6 flex items-center justify-between gap-3 min-h-[160px] shadow-sm`}
              >
                <div className="z-10 flex-1 max-w-[190px]">
                  <h3 className={`text-base font-black leading-tight ${MID_PROMO_CARDS[midPromoSlide].theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {MID_PROMO_CARDS[midPromoSlide].titleLine1} {MID_PROMO_CARDS[midPromoSlide].titleLine2}
                  </h3>
                  <p className={`text-[11px] mt-1 font-medium ${MID_PROMO_CARDS[midPromoSlide].theme === 'dark' ? 'text-blue-200' : 'text-slate-500'}`}>
                    {MID_PROMO_CARDS[midPromoSlide].subtitle}
                  </p>

                  {MID_PROMO_CARDS[midPromoSlide].ctaType === "button" && (
                    <Link
                      href={MID_PROMO_CARDS[midPromoSlide].ctaLink}
                      className="inline-flex items-center gap-1.5 mt-3.5 bg-[#FFBE00] hover:bg-[#E5AA00] text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-md transition-colors shadow-xs w-fit"
                    >
                      <span>{MID_PROMO_CARDS[midPromoSlide].ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  {MID_PROMO_CARDS[midPromoSlide].ctaType === "price" && (
                    <Link href={MID_PROMO_CARDS[midPromoSlide].ctaLink} className="block mt-2.5">
                      <p className="text-xl font-black text-slate-900">
                        {MID_PROMO_CARDS[midPromoSlide].priceText}
                      </p>
                    </Link>
                  )}

                  {MID_PROMO_CARDS[midPromoSlide].ctaType === "badge" && (
                    <Link href={MID_PROMO_CARDS[midPromoSlide].ctaLink} className="inline-block mt-3">
                      <span className="bg-[#FFBE00] text-slate-950 font-black text-xs px-3 py-1 rounded-md inline-block shadow-xs">
                        {MID_PROMO_CARDS[midPromoSlide].badgeText}
                      </span>
                    </Link>
                  )}
                </div>

                {/* Round-edged white frame in mobile view */}
                <Link
                  href={MID_PROMO_CARDS[midPromoSlide].ctaLink}
                  className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white shadow-md border border-slate-100 flex items-center justify-center p-2 overflow-hidden shrink-0"
                >
                  <Image
                    src={MID_PROMO_CARDS[midPromoSlide].image}
                    alt={MID_PROMO_CARDS[midPromoSlide].imageAlt}
                    fill
                    sizes="96px"
                    className="object-contain p-1.5 drop-shadow-sm"
                  />
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mt-3">
            {MID_PROMO_CARDS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setMidPromoSlide(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === midPromoSlide
                    ? "w-6 h-2 bg-[#002D62]"
                    : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Go to promo card ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 7: TRENDING THIS WEEK (Asymmetric 3-Column Layout)             */}
      {/* ===================================================================== */}
      <section className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Section Header with Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#FFBE00] fill-[#FFBE00]" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Trending This Week
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {TREND_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTrendTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
          <div className="lg:col-span-4 grid grid-cols-2 gap-4">
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
          <div
            className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow flex flex-col justify-between"
            onMouseEnter={() => setIsSpotlightPaused(true)}
            onMouseLeave={() => setIsSpotlightPaused(false)}
          >
            {/* Top Pedestal Graphic Container - Stays fixed in background */}
            <div className="relative w-full aspect-square overflow-hidden bg-[#FFF0F2]">
              {/* STATIONARY STUDIO BACKGROUND & PEDESTAL (Does NOT slide) */}
              <Image
                src="/vittal/products/airpods-max-pedestal-bg.jpg"
                alt="Studio Pedestal Display"
                fill
                priority
                className="object-cover pointer-events-none select-none"
                sizes="(max-width: 1024px) 100vw, 500px"
              />

              {/* MOVING CUTOUT LAYER: automatically switches every 3 seconds from right */}
              <div className="absolute inset-0 overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={currentSpotlight.id}
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "-100%", opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <Link
                      href={`/product/${currentSpotlight.slug}`}
                      className="block w-full h-full relative"
                    >
                      <Image
                        src={currentSpotlight.image}
                        alt={`${currentSpotlight.name} in ${currentSpotlight.colorName}`}
                        fill
                        priority
                        className="object-cover hover:scale-105 transition-transform duration-300 drop-shadow-md"
                        sizes="(max-width: 1024px) 100vw, 500px"
                      />
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Color dots selection pill */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/70 shadow-sm">
                {SPOTLIGHT_VARIANTS.map((v, idx) => {
                  const isActive = idx === spotlightIndex;
                  return (
                    <button
                      key={v.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSpotlightIndex(idx);
                      }}
                      title={`Switch to ${v.colorName}`}
                      className={`relative flex items-center justify-center transition-all duration-200 rounded-full ${
                        isActive
                          ? "ring-2 ring-offset-1 ring-slate-900 scale-110"
                          : "opacity-70 hover:opacity-100 hover:scale-105"
                      }`}
                      style={{ width: "16px", height: "16px" }}
                    >
                      <span
                        className="w-full h-full rounded-full border border-black/15 shadow-inner block"
                        style={{ backgroundColor: v.swatchColor }}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Discount Badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-[#EF4444] text-white text-[11px] font-black px-2.5 py-1 rounded-md shadow-sm tracking-wide">
                  -14% OFF
                </span>
              </div>
            </div>

            {/* Bottom Details & Buy Action */}
            <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between bg-white">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Link href={`/product/${currentSpotlight.slug}`}>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug hover:text-blue-600 transition-colors">
                      {currentSpotlight.name}
                    </h3>
                  </Link>
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    {currentSpotlight.colorName}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mb-2">
                  {currentSpotlight.sub}
                </p>
                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-3.5 h-3.5 fill-[#FFBE00] text-[#FFBE00]" />
                  <span className="text-xs font-bold text-slate-800">
                    {currentSpotlight.rating}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ({currentSpotlight.reviews})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3.5 border-t border-slate-100">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-slate-900">
                    ₹{currentSpotlight.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    ₹{currentSpotlight.mrp.toLocaleString("en-IN")}
                  </span>
                </div>
                <button
                  onClick={() =>
                    handleAddToCart({
                      id: currentSpotlight.id,
                      name: `${currentSpotlight.name} (${currentSpotlight.colorName})`,
                      price: currentSpotlight.price,
                      mrp: currentSpotlight.mrp,
                      image: currentSpotlight.image,
                    })
                  }
                  className="bg-[#FFBE00] hover:bg-[#E5AA00] active:bg-[#CC9600] text-slate-950 font-black text-xs px-5 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <ShoppingCart className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>

          {/* COLUMN 3: RIGHT 2x2 GRID (4 cols in 12-grid) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-4">
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
      <section className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 pb-14 pt-4">
        <div className="w-full bg-gradient-to-r from-[#001428] via-[#002D62] to-[#003B80] rounded-2xl overflow-hidden p-8 sm:p-12 relative flex flex-col md:flex-row items-center justify-between shadow-xl">
          {/* Left Text Content */}
          <div className="text-white max-w-xl z-10 text-center md:text-left mb-8 md:mb-0">
            <span className="text-[11px] font-black tracking-widest uppercase text-white bg-white/10 px-3.5 py-1 rounded-full border border-white/20 inline-block mb-3">
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
              className="inline-flex items-center gap-2 bg-[#FFBE00] hover:bg-[#E5AA00] text-slate-950 font-black text-xs sm:text-sm px-7 py-3 rounded-lg transition-colors shadow-lg"
            >
              <span>Shop the Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right Product Devices Graphic */}
          <div className="relative w-full md:w-1/2 h-64 sm:h-80 lg:h-96 z-10 flex items-center justify-center">
            <Image
              src="/vittal/products/bottom-banner-devices-transparent.png"
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
        <section id="shop" className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#FFBE00]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Direct From Dubai • 1-Year Warranty
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Explore All Products
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs sm:text-sm font-black text-slate-900 hover:text-blue-600 flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors"
            >
              <span>View Full Catalog ({products.length})</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {products.slice(0, 15).map((prod) => (
              <div
                key={prod.id}
                className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group relative"
              >
                <div className="relative aspect-square bg-slate-50/80 p-3 flex items-center justify-center">
                  {prod.badge && (
                    <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md bg-[#EF4444] text-white text-[10px] font-black uppercase shadow-xs">
                      {prod.badge}
                    </span>
                  )}
                  <Link href={`/products/${prod.id}`} className="block w-full h-full relative">
                    <Image
                      src={prod.poster_image}
                      alt={prod.name}
                      fill
                      className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 220px"
                    />
                  </Link>
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center gap-1 mb-1.5">
                      <Star className="w-3.5 h-3.5 fill-[#FFBE00] text-[#FFBE00]" />
                      <span className="text-xs font-bold text-slate-800">
                        {prod.rating || 4.8}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({prod.review_count || 120})
                      </span>
                    </div>
                    <Link href={`/products/${prod.id}`}>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2 min-h-[34px]">
                        {prod.name}
                      </h3>
                    </Link>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5 mb-3 pt-1 border-t border-slate-100">
                      <span className="text-base font-black text-slate-900">
                        ₹{prod.price.toLocaleString("en-IN")}
                      </span>
                      {prod.mrp && prod.mrp > prod.price && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{prod.mrp.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addItem(prod, 1)}
                        className="flex-1 py-2 rounded-xl bg-[#FFBE00] hover:bg-[#E5AA00] active:bg-[#CC9600] text-slate-950 text-xs font-black flex items-center justify-center gap-1 transition-colors shadow-xs cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Add</span>
                      </button>
                      <button
                        onClick={() => handleBuyNow(prod)}
                        className="flex-1 py-2 rounded-xl bg-[#002D62] hover:bg-blue-900 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}


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
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all flex flex-col relative group">
      {/* Discount badge */}
      <div className="absolute top-2.5 left-2.5 z-10 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
        -{prod.discount}%
      </div>

      {/* Wishlist button */}
      <button
        onClick={() => onToggleWishlist(prod.id, prod.name, prod.price, prod.image)}
        className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90 border border-slate-200 shadow-xs flex items-center justify-center hover:bg-red-50 transition-colors"
        aria-label="Wishlist"
      >
        <Heart
          className={`w-3.5 h-3.5 transition-colors ${
            isFav ? "fill-red-500 text-red-500" : "text-slate-400"
          }`}
        />
      </button>

      {/* Clean Image */}
      <Link
        href={`/products/${prod.id}`}
        className="relative w-full aspect-square bg-slate-50/40 p-3 flex items-center justify-center overflow-hidden"
      >
        <Image
          src={prod.image}
          alt={prod.name}
          fill
          className="object-contain p-2.5 group-hover:scale-105 transition-transform duration-300"
          sizes="200px"
        />
      </Link>

      {/* Text Info */}
      <div className="p-3 flex flex-col flex-1 justify-between">
        <div>
          <Link href={`/products/${prod.id}`}>
            <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug hover:text-[#002D62] transition-colors mb-1 min-h-[32px]">
              {prod.name}
            </h4>
          </Link>
          <div className="flex items-center gap-1 mb-1.5">
            <Star className="w-3 h-3 fill-[#FFBE00] text-[#FFBE00]" />
            <span className="text-[11px] font-bold text-slate-800">{prod.rating}</span>
            <span className="text-[10px] text-slate-400">({prod.reviews})</span>
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5 mb-2.5">
            <span className="text-xs sm:text-sm font-black text-slate-900">
              ₹{prod.price.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-slate-400 line-through">
              ₹{prod.mrp.toLocaleString("en-IN")}
            </span>
          </div>
          <button
            onClick={() => onAddToCart(prod)}
            className="w-full py-2 rounded-lg bg-[#FFBE00] hover:bg-[#E5AA00] text-slate-950 text-[11px] font-black flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <ShoppingCart className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Backward-compatible alias
export const TurkiyeJamStorefront = VittalDigitalStorefront;
