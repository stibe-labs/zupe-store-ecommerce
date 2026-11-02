"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { launchFastrrCheckout } from "@/lib/fastrrClient";
import { useCart } from "@/context/CartContext";
import { motion, type Variants } from "framer-motion";
import {
  Star,
  ShoppingBag,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Headphones,
  Laptop,
  Smartphone,
  Watch,
  Tablet,
  Gamepad2,
  Volume2,
  Sparkles,
  ArrowRight,
  Flame,
  Clock,
  ChevronRight,
  Mail,
  Check,
  CreditCard,
  Lock,
} from "lucide-react";
import { Product } from "@/types/product";
import { DEFAULT_PRODUCTS, VITTAL_DIGITAL_DEALS, VittalDigitalProduct } from "@/data/zupeProducts";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

interface StorefrontProps {
  initialProducts?: Product[];
}

export function VittalDigitalStorefront({ initialProducts }: StorefrontProps) {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const products = initialProducts && initialProducts.length > 0 ? initialProducts : DEFAULT_PRODUCTS;

  // Flash Sale Live Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 24, seconds: 16 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        }
        if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 8, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
    }
  };

  const handleBuyNow = (product: Product | VittalDigitalProduct) => {
    // If fastrr is configured or fallback to checkout
    const variantId = product.id;
    const price = product.price;
    const name = product.name;
    const image = "poster_image" in product ? product.poster_image : product.image;

    // Add to cart and launch checkout
    addItem(
      {
        id: variantId,
        slug: "slug" in product ? product.slug : variantId,
        name: name,
        price: price,
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

    // Try Fastrr checkout first
    try {
      launchFastrrCheckout([
        {
          id: variantId,
          name: name,
          price: price,
          quantity: 1,
          image: image,
        },
      ]);
    } catch {
      router.push(`/checkout?productId=${variantId}&qty=1`);
    }
  };

  const categories = [
    { name: "Laptops", desc: "Ultraportables & Workstations", icon: Laptop, link: "/products?category=Laptops", color: "from-blue-500/10 to-indigo-500/10" },
    { name: "Tablets", desc: "Crisp 2K IPS & Pro Tablets", icon: Tablet, link: "/products?category=Tablets", color: "from-indigo-500/10 to-purple-500/10" },
    { name: "Headphones & Earbuds", desc: "Active Noise Cancellation", icon: Headphones, link: "/products?category=Headphones+%26+Earbuds", color: "from-cyan-500/10 to-blue-500/10" },
    { name: "Smartphones", desc: "Dubai Exclusive Editions", icon: Smartphone, link: "/products?category=Smartphones", color: "from-sky-500/10 to-cyan-500/10" },
    { name: "Smartwatches", desc: "Titanium & AMOLED Calling", icon: Watch, link: "/products?category=Smartwatches", color: "from-amber-500/10 to-orange-500/10" },
    { name: "Gaming & Accessories", desc: "High-Refresh Gear", icon: Gamepad2, link: "/products?category=Gaming+%26+Accessories", color: "from-purple-500/10 to-pink-500/10" },
    { name: "Speakers", desc: "360° Wireless Heavy Bass", icon: Volume2, link: "/products?category=Speakers", color: "from-emerald-500/10 to-teal-500/10" },
    { name: "Smart Gadgets", desc: "Fast PD Power & Tech", icon: Sparkles, link: "/products?category=Smart+Gadgets", color: "from-teal-500/10 to-blue-500/10" },
  ];

  return (
    <div className="bg-[#FAFBFD] text-slate-900 font-sans selection:bg-[#003055] selection:text-white">
      {/* ========================================================================= */}
      {/* SECTION 1: HERO SEASON SALE BANNER                                        */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#00223D] via-[#003055] to-[#001D33] text-white py-12 sm:py-20 lg:py-24">
        {/* Subtle background tech glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(2,132,199,0.25),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,180,216,0.15),transparent_40%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="lg:col-span-6 space-y-4 sm:space-y-6 text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs sm:text-sm font-semibold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>VITTAL DIGITAL SEASON SALE</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08]">
                Big Tech. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-sky-300 to-amber-300">
                  Bigger Possibilities.
                </span>
              </motion.h1>

              {/* Subheading */}
              <motion.p variants={fadeInUp} className="text-slate-300 text-base sm:text-xl max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Explore seasonal offers on your favourite electronics imported directly from Dubai, delivered with full warranty across India.
              </motion.p>

              {/* Discount Pill & Call to Actions */}
              <motion.div variants={fadeInUp} className="space-y-4 pt-2">
                <div className="inline-block px-4 py-1.5 bg-amber-400 text-slate-950 font-black text-sm sm:text-base rounded-lg tracking-wider uppercase shadow-md">
                  UP TO 40% OFF
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                  <a
                    href="#deals"
                    className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-100 text-[#003055] font-black text-sm sm:text-base rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2"
                  >
                    <Flame className="w-4 h-4 text-red-500 fill-red-500" />
                    <span>Shop the Sale</span>
                  </a>

                  <a
                    href="#categories"
                    className="w-full sm:w-auto px-7 py-3.5 bg-blue-900/60 hover:bg-blue-800/80 text-white font-semibold text-sm sm:text-base rounded-xl border border-blue-400/30 transition-all hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2"
                  >
                    <span>Explore Collection</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Graphic Column: Responsive Mockup Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 relative flex justify-center"
            >
              {/* Desktop Showcase Image */}
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-slate-900/40 backdrop-blur-sm group">
                <Image
                  src="/vittal/hero-season-sale.png"
                  alt="Vittal Digital Season Sale Electronics Showcase"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-200">
                  <span className="bg-slate-900/80 px-2.5 py-1 rounded backdrop-blur-md">Dubai Sourced • 100% Genuine</span>
                  <span className="bg-emerald-500/80 text-white px-2.5 py-1 rounded font-bold backdrop-blur-md">Express Air Cargo</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: SHOP BY CATEGORY                                               */}
      {/* ========================================================================= */}
      <section id="categories" className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12">
          <div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-1">
              Find your next everyday upgrade.
            </p>
          </div>
          <Link
            href="/products"
            className="mt-3 sm:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-[#003055] hover:text-blue-700 transition-colors group"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid (8 Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={cat.link}
                className="group relative bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:border-[#003055]/30 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-[#003055] mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.8]" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#003055] transition-colors leading-snug">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {cat.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-[#003055]">
                  <span>Explore</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: FEATURED PRODUCTS                                              */}
      {/* ========================================================================= */}
      <section id="featured" className="py-14 sm:py-20 bg-slate-100/70 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-[#003055] text-xs font-bold uppercase tracking-wider mb-2">
                Curated Electronics
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Featured Products
              </h2>
              <p className="text-slate-500 text-sm sm:text-base mt-1">
                Discover standout tech for work, play, and everyday life.
              </p>
            </div>
            <Link
              href="/products"
              className="mt-3 sm:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-[#003055] hover:text-blue-700 transition-colors group"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            {products.slice(0, 5).map((prod) => (
              <div
                key={prod.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col group"
              >
                {/* Product Poster & Badge */}
                <div className="relative aspect-square w-full bg-slate-50 p-4 flex items-center justify-center overflow-hidden">
                  {prod.badge && (
                    <span className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-md bg-[#003055] text-white text-[11px] font-bold tracking-wide uppercase shadow-sm">
                      {prod.badge}
                    </span>
                  )}
                  <div className="relative w-full h-full">
                    <Image
                      src={prod.poster_image}
                      alt={prod.name}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* Info Container */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="flex items-center text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      </div>
                      <span className="text-xs font-bold text-slate-700">{prod.rating || 4.8}</span>
                      <span className="text-[11px] text-slate-400">({prod.review_count || 120})</span>
                    </div>

                    <Link href={`/products/${prod.id}`}>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-[#003055] transition-colors line-clamp-1">
                        {prod.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {prod.subtitle || prod.category}
                    </p>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-lg font-black text-slate-900">
                        ₹{prod.price.toLocaleString("en-IN")}
                      </span>
                      {prod.mrp && prod.mrp > prod.price && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{prod.mrp.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => addItem(prod, 1)}
                        className="w-full py-2 px-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        title="Add to cart"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>

                      <button
                        onClick={() => handleBuyNow(prod)}
                        className="w-full py-2 px-2 rounded-lg bg-[#003055] hover:bg-[#00223f] text-white text-xs font-bold transition-all shadow-sm active:scale-95 text-center"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: TODAY'S TECH DEALS (COUNTDOWN TIMER + FLASH OFFERS)            */}
      {/* ========================================================================= */}
      <section id="deals" className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
          {/* Header Row with Title and Live Countdown Timer */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-black tracking-wide uppercase mb-2">
                <Flame className="w-3.5 h-3.5 fill-red-600" />
                Limited Time Flash Deals
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Today&apos;s Tech Deals
              </h2>
              <p className="text-slate-500 text-sm sm:text-base mt-1">
                Your next upgrade, at a better price.
              </p>
            </div>

            {/* Countdown Box */}
            <div className="flex items-center gap-2.5 sm:gap-4 bg-slate-900 text-white p-3 sm:p-4 rounded-2xl shadow-inner">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider pr-2 border-r border-slate-700">
                <Clock className="w-4 h-4" />
                <span>Ends In</span>
              </div>
              <div className="flex items-center gap-2 text-center">
                <div className="min-w-[44px]">
                  <span className="block font-mono text-xl sm:text-2xl font-black">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase">Hours</span>
                </div>
                <span className="font-bold text-slate-600 text-lg">:</span>
                <div className="min-w-[44px]">
                  <span className="block font-mono text-xl sm:text-2xl font-black">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase">Min</span>
                </div>
                <span className="font-bold text-slate-600 text-lg">:</span>
                <div className="min-w-[44px]">
                  <span className="block font-mono text-xl sm:text-2xl font-black text-amber-400">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase">Sec</span>
                </div>
              </div>
            </div>
          </div>

          {/* Deals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
            {VITTAL_DIGITAL_DEALS.map((deal) => (
              <div
                key={deal.id}
                className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-red-200 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[11px] font-black uppercase tracking-wider">
                      Deal
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Save ₹{deal.savings.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Image */}
                  <div className="relative aspect-square w-full rounded-xl bg-white p-3 mb-4 overflow-hidden border border-slate-100 flex items-center justify-center">
                    <Image
                      src={deal.image}
                      alt={deal.name}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                    {deal.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {deal.packageDescription}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-xl font-black text-slate-900">
                      ₹{deal.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      ₹{deal.mrp.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <button
                    onClick={() => handleBuyNow(deal)}
                    className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span>Claim Deal</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Deals Footer Banner */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <p className="font-black text-slate-900 text-sm sm:text-base">
                MORE TECH. MORE SAVINGS.
              </p>
              <p className="text-xs sm:text-sm text-slate-500">
                Fresh inventory arrives weekly directly from Dubai duty-free retail hubs.
              </p>
            </div>
            <Link
              href="/products"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-all shadow-sm"
            >
              View All Offers →
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: 3 CATEGORY PROMO BANNERS                                       */}
      {/* ========================================================================= */}
      <section className="py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Laptops */}
          <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 aspect-[4/3] group">
            <Image
              src="/vittal/banner-laptops.png"
              alt="Laptops - Power Your Work"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent p-6 sm:p-8 flex flex-col justify-end text-white">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-1">
                Laptops
              </span>
              <h3 className="text-2xl font-black leading-tight">
                Power Your Work
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 mb-4">
                Built for your next big idea.
              </p>
              <div>
                <Link
                  href="/products?category=Laptops"
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Audio */}
          <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 aspect-[4/3] group">
            <Image
              src="/vittal/banner-audio.png"
              alt="Audio - Feel Every Beat"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent p-6 sm:p-8 flex flex-col justify-end text-white">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-widest mb-1">
                Audio
              </span>
              <h3 className="text-2xl font-black leading-tight">
                Feel Every Beat
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 mb-4">
                Your world. Better sound.
              </p>
              <div>
                <Link
                  href="/products?category=Headphones+%26+Earbuds"
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3: Smartwatches */}
          <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 aspect-[4/3] group">
            <Image
              src="/vittal/banner-watches.png"
              alt="Smartwatches - Smarter Every Day"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent p-6 sm:p-8 flex flex-col justify-end text-white">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-widest mb-1">
                Smartwatches
              </span>
              <h3 className="text-2xl font-black leading-tight">
                Smarter Every Day
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 mb-4">
                Stay connected. Keep moving.
              </p>
              <div>
                <Link
                  href="/products?category=Smartwatches"
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: TRUST BAR (4 PILLARS)                                          */}
      {/* ========================================================================= */}
      <section className="py-8 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            {/* Pillar 1 */}
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#003055] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Quality Checks</h4>
                <p className="text-xs text-slate-500">Directly sourced & verified</p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Secure Payments</h4>
                <p className="text-xs text-slate-500">100% Encrypted UPI & Cards</p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Order Tracking</h4>
                <p className="text-xs text-slate-500">Live parcel updates</p>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <Headphones className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Helpful Support</h4>
                <p className="text-xs text-slate-500">7-Day WhatsApp Concierge</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: THE CUSTOMER EXPERIENCE (TESTIMONIALS)                         */}
      {/* ========================================================================= */}
      <section id="reviews" className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            The Customer Experience
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Everyday tech. Everyday stories.
          </p>
        </div>

        {/* Reviews Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Review A */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 text-sm sm:text-base font-medium leading-relaxed italic">
                &ldquo;A simple shopping experience from start to finish.&rdquo;
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-[#003055] font-black text-sm flex items-center justify-center">
                CA
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Customer A</h4>
                <p className="text-[11px] text-slate-400">Verified Buyer • Mumbai</p>
              </div>
            </div>
          </div>

          {/* Review B */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 text-sm sm:text-base font-medium leading-relaxed italic">
                &ldquo;Easy to browse and choose the right gadget.&rdquo;
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-800 font-black text-sm flex items-center justify-center">
                CB
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Customer B</h4>
                <p className="text-[11px] text-slate-400">Verified Buyer • Bengaluru</p>
              </div>
            </div>
          </div>

          {/* Review C */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 text-sm sm:text-base font-medium leading-relaxed italic">
                &ldquo;Helpful product information and clear updates.&rdquo;
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
                CC
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Customer C</h4>
                <p className="text-[11px] text-slate-400">Verified Buyer • Delhi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Note from Mockup */}
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>Illustrative reviews for design preview.</p>
          <p className="mt-0.5">See individual product pages for warranty and India compatibility details.</p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 8: NEWSLETTER SIGNUP BANNER                                       */}
      {/* ========================================================================= */}
      <section className="bg-slate-900 text-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-4">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Your Next Upgrade Starts Here
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
            Get updates on new arrivals and seasonal offers imported from Dubai.
          </p>

          <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 pt-2">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-sm text-white transition-all shadow-md active:scale-95 shrink-0"
            >
              Subscribe
            </button>
          </form>

          {newsletterSubscribed && (
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-lg">
              <Check className="w-3.5 h-3.5" />
              <span>Thank you for subscribing! You will receive priority deal alerts.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Backward-compatible alias for page.tsx or legacy references
export const TurkiyeJamStorefront = VittalDigitalStorefront;
