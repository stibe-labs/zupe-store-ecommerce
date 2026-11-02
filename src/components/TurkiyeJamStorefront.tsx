"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { launchFastrrCheckout } from "@/lib/fastrrClient";
import { motion, AnimatePresence, type Variants } from "framer-motion";

// Motion Animation Variants for Scroll Reveals
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -35 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 35 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};
import {
  Star,
  Plus,
  Minus,
  CheckCircle2,
  Phone,
  ShoppingBag,
  ShieldCheck,
  Package,
  PackageX,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types/product";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";

// 6 Exact Packages from SVG Mockup
const PACKAGES = [
  {
    id: "pack-2",
    name: "2 Sachet Pack",
    sub: "The easy first order",
    price: 899,
    mrp: 1499,
    perSachet: "₹450 per sachet",
    badge: "Try it",
    badgeColor: "bg-[#fed000] text-black",
    headerBg: "bg-[#b9e5e9]",
    image: "/tj/turkiye-jam-2-strips.png",
    savingsPill: null,
  },
  {
    id: "pack-3",
    name: "3 Sachet Pack",
    sub: "Single-serve sachets",
    price: 1099,
    mrp: 1899,
    perSachet: "₹367 per sachet",
    badge: "Save 18%",
    badgeColor: "bg-[#fed000] text-black",
    headerBg: "bg-[#f1a337]",
    image: "/tj/turkiye-jam-3-strips.png",
    savingsPill: null,
  },
  {
    id: "pack-4",
    name: "4 Sachet Pack",
    sub: "Single-serve sachets",
    price: 1399,
    mrp: 2399,
    perSachet: "₹350 per sachet",
    badge: "Save 22%",
    badgeColor: "bg-[#fed000] text-black",
    headerBg: "bg-[#f8bac5]",
    image: "/tj/turkiye-jam-4-strips.png",
    savingsPill: null,
  },
  {
    id: "pack-6",
    name: "6 Sachet Pack",
    sub: "Single-serve sachets",
    price: 1899,
    mrp: 3200,
    perSachet: "₹317 per sachet",
    badge: "Save 30%",
    badgeColor: "bg-[#731a26] text-white",
    headerBg: "bg-[#8fc3b7]",
    image: "/tj/turkiye-jam-6-strips.png",
    savingsPill: "30% off",
  },
  {
    id: "combo-box-14",
    name: "Sachet Box, 12 + 2",
    sub: "14 single-serve sachets, 2 on the house",
    price: 2899,
    mrp: 4800,
    perSachet: "₹207 per sachet",
    badge: "Best value",
    badgeColor: "bg-[#731a26] text-white",
    headerBg: "bg-[#e89938]",
    image: "/tj/turkiye-jam-box-14-strips.png",
    savingsPill: "54% off",
  },
  {
    id: "bottle-240g",
    name: "240g Jar + 2 Sachets Free",
    sub: "The full jar with a bonus pair",
    price: 2899,
    mrp: 4500,
    perSachet: "Jar plus 2 free sachets",
    badge: "2 sachets free",
    badgeColor: "bg-[#731a26] text-white",
    headerBg: "bg-[#f6b2b2]",
    image: "/tj/turkiye-jam-jar-2-strips.png",
    savingsPill: null,
  },
];

// Interactive FAQ Accordion data matching Section 5
const FAQ_ITEMS = [
  {
    id: 1,
    question: "How fast will it reach me?",
    isSpeedBox: true,
    content: null,
  },
  {
    id: 2,
    question: "How is my order packed?",
    isSpeedBox: false,
    content:
      "All orders are shipped in 100% discrete, unbranded heavy-duty cardboard boxes with thick bubble cushioning. There are no product descriptions, wellness references, or revealing labels on the outside box. Only your delivery name and address are visible for courier logistics.",
  },
  {
    id: 3,
    question: "What is inside?",
    isSpeedBox: false,
    content:
      "Turkiye Jam is authentic Themra Epimedyumlu Macun from Turkey. It contains Pure Anatolian Flower Honey, Epimedium extract, Panax Red Ginseng, Royal Jelly, Carob molasses, Ginger, Cinnamon, and Ginkgo Biloba. 100% herbal active formulation without synthetic chemicals.",
  },
  {
    id: 4,
    question: "Can I return a sachet pack?",
    isSpeedBox: false,
    content:
      "Yes! If your package arrives damaged or unsealed, we offer an immediate free replacement. For multi-sachet boxes, you can try 2 trial sachets and if you are not satisfied, return the remaining sealed box within 7 days for a hassle-free refund.",
  },
  {
    id: 5,
    question: "Should I check with a doctor first?",
    isSpeedBox: false,
    content:
      "Yes, if you have a heart condition or blood pressure concerns, are pregnant, or take regular medication, consult a doctor before use.",
  },
];

// Customer Reviews from Section 6
const REVIEWS = [
  {
    id: 1,
    initial: "A",
    name: "Anjali M.",
    location: "Bengaluru, Karnataka",
    bought: "Bought: 6 Sachet Pack",
    text: "Arrived in two days, well wrapped, nothing leaked. The sachets are easy to carry, and I ordered a bigger pack the next week.",
    avatarBg: "bg-[#b9e5e9] text-stone-900",
  },
  {
    id: 2,
    initial: "R",
    name: "Rahul K.",
    location: "Mumbai, Maharashtra",
    bought: "Bought: 240g Jar + 2 Sachets",
    text: "Neat packing and the label was clear. Cash on delivery made it easy for my family to trust, and the delivery boy called before reaching.",
    avatarBg: "bg-[#f8bac5] text-stone-900",
  },
  {
    id: 3,
    initial: "N",
    name: "Neha S.",
    location: "Kochi, Kerala",
    bought: "Bought: 2 Sachet Pack",
    text: "I started with the 2 pack just to try. The ordering was simple, delivery was quick and everything looked exactly like the photos.",
    avatarBg: "bg-[#fed000] text-black",
  },
];

export interface TurkiyeJamStorefrontProps {
  initialProducts?: Product[];
}
export type VittalDigitalStorefrontProps = TurkiyeJamStorefrontProps;

export function TurkiyeJamStorefront({ initialProducts }: TurkiyeJamStorefrontProps = {}) {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const [openFaq, setOpenFaq] = useState<number | null>(1); // Question 1 open by default matching SVG
  const [liveCatalog, setLiveCatalog] = useState<Product[]>(
    () => (initialProducts && initialProducts.length > 0 ? initialProducts : DEFAULT_PRODUCTS)
  );

  // Synchronize live stock & pricing from /api/products
  useEffect(() => {
    let isMounted = true;
    const fetchLiveProducts = () => {
      fetch(`/api/products?_t=${Date.now()}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data.success && Array.isArray(data.products)) {
            setLiveCatalog(data.products);
          }
        })
        .catch(() => {});
    };

    fetchLiveProducts();
    const interval = setInterval(fetchLiveProducts, 15000); // 15s polling to instantly reflect admin stock changes
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getPackageLiveDetails = (pkg: typeof PACKAGES[0]) => {
    const found = liveCatalog.find((p) => {
      const pid = (p.id || "").toLowerCase().trim();
      const pslug = (p.slug || "").toLowerCase().trim();
      const target = pkg.id.toLowerCase().trim();

      if (pid === target || pid === `turkiye-jam-${target}`) return true;
      if (pslug.includes(target)) return true;
      if (target === "bottle-240g" && (pid.includes("bottle") || pid.includes("240g") || pid === "turkiye-jam")) return true;
      if (target === "combo-box-14" && (pid.includes("box") || pid.includes("14"))) return true;
      if (target === "pack-6" && pid.includes("6")) return true;
      if (target === "pack-4" && pid.includes("4")) return true;
      if (target === "pack-3" && pid.includes("3")) return true;
      if (target === "pack-2" && pid.includes("2")) return true;
      return false;
    });

    const isOutOfStock = found
      ? Number(found.in_stock) === 0 ||
        (found.stock_count !== undefined && Number(found.stock_count) <= 0)
      : false;

    const price = found && found.price ? Number(found.price) : pkg.price;
    const mrp = found && found.mrp ? Number(found.mrp) : pkg.mrp;

    return {
      isOutOfStock,
      price,
      mrp,
      product: found,
    };
  };

  const handleAddToCart = (pkg: typeof PACKAGES[0]) => {
    const details = getPackageLiveDetails(pkg);
    if (details.isOutOfStock) return;

    addItem(
      {
        id: `turkiye-jam-${pkg.id}`,
        name: `Turkiye Jam (${pkg.name})`,
        category: "Vitality & Wellness",
        price: details.price,
        original_price: details.mrp,
        mrp: details.mrp,
        poster_image: pkg.image,
        color: pkg.name,
      },
      1
    );
    openCart();
  };

  const handleBuyNow = async (pkg: typeof PACKAGES[0]) => {
    const details = getPackageLiveDetails(pkg);
    if (details.isOutOfStock) return;

    const item = {
      id: `turkiye-jam-${pkg.id}`,
      name: `Turkiye Jam (${pkg.name})`,
      category: "Vitality & Wellness",
      price: details.price,
      original_price: details.mrp,
      mrp: details.mrp,
      poster_image: pkg.image,
      color: pkg.name,
    };
    addItem(item, 1);
    const launched = await launchFastrrCheckout([{ ...item, quantity: 1 }]);
    if (!launched) {
      router.push("/checkout");
    }
  };

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen selection:bg-[#731a26] selection:text-white">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: HERO & TOP NAVIGATION (Wine Maroon + Diamonds)
      ───────────────────────────────────────────────────────────── */}
      <section
        id="about"
        className="tj-diamonds-wine text-white relative overflow-hidden min-h-[100dvh] flex flex-col justify-between"
      >
        <div className="flex-1 min-h-0 flex items-end w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-8 xl:px-12 pt-20 sm:pt-24 lg:pt-20 pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 xl:gap-10 items-end w-full h-full min-h-0">
            
            {/* Left Column: Script Tagline, Brand Stamp Logo, Description, Button */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="lg:col-span-5 space-y-2.5 sm:space-y-4 lg:space-y-5 xl:space-y-6 text-center lg:text-left z-10 py-2 sm:py-4 lg:py-6 my-auto"
            >
              <motion.p
                variants={fadeInUp}
                className="font-tj-cursive text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-[#fed000] font-bold tracking-wide drop-shadow-sm"
              >
                Straight from Turkey!
              </motion.p>

              {/* White Cookie-Cutter Stamp Logo */}
              <motion.div
                variants={scaleIn}
                className="relative w-52 sm:w-72 md:w-88 lg:w-[360px] xl:w-[440px] 2xl:w-[500px] max-h-[22vh] sm:max-h-[25vh] aspect-[2.11/1] mx-auto lg:mx-0 group cursor-pointer"
              >
                <Image
                  src="/vittal-digital-logo.svg"
                  alt="Vittal Digital"
                  fill
                  className="object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              </motion.div>

              {/* Subtitle */}
              <motion.p
                variants={fadeInUp}
                className="text-stone-100 text-xs sm:text-base lg:text-lg xl:text-xl font-medium max-w-xs sm:max-w-lg lg:max-w-xl mx-auto lg:mx-0 leading-relaxed drop-shadow-sm"
              >
                A small-batch fruit and herb preserve, imported and delivered across India.
              </motion.p>

              {/* Shop the Collection Button */}
              <motion.div variants={fadeInUp} className="pt-1 sm:pt-2">
                <a
                  href="#shop"
                  className="btn-shimmer inline-flex items-center justify-center px-6 sm:px-9 lg:px-11 xl:px-12 py-2.5 sm:py-3.5 lg:py-4 rounded-full bg-[#fed000] hover:bg-[#e6bc00] text-black font-extrabold text-xs sm:text-base lg:text-lg xl:text-xl shadow-xl shadow-black/25 hover:scale-105 active:scale-95 transition-all border-2 border-black/10 cursor-pointer pointer-events-auto"
                >
                  Shop the Collection
                </a>
              </motion.div>
            </motion.div>

            {/* Right Column: Hero Person Holding Jam Jar - Flush with green ticker */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="lg:col-span-7 flex justify-center lg:justify-end relative self-end items-end h-full min-h-0 z-20 pointer-events-none"
            >
              <div className="relative w-auto h-[40vh] sm:h-[65vh] md:h-[72vh] lg:h-[82vh] xl:h-[88vh] 2xl:h-[92vh] max-h-full aspect-[1.4/1] sm:aspect-[1.5/1] flex items-end translate-y-[2px] lg:-mr-8 xl:-mr-14">
                <Image
                  src="/products/turkiye-jam/Playful%20Themra%20Jam%20Tasting%20Promotion.png"
                  alt="Turkiye Jam Anatolian Macun"
                  fill
                  className="object-contain object-bottom drop-shadow-2xl block"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Forest Green Trust Ticker Banner - Infinite Automatic Sliding Marquee */}
        <div className="shrink-0 w-full z-10 bg-[#0e4a3b] text-white py-2 sm:py-3.5 overflow-hidden border-t border-b border-white/10 font-medium text-[11px] sm:text-sm tracking-wide select-none">
          <div className="animate-tj-marquee flex items-center gap-6 sm:gap-8">
            {/* Set 1 */}
            <div className="flex items-center gap-6 sm:gap-8 shrink-0">
              <span>Direct import</span>
              <span className="opacity-60">|</span>
              <span>Secure Packaging</span>
              <span className="opacity-60">|</span>
              <span>All-India Delivery</span>
              <span className="opacity-60">|</span>
              <span>Prepaid in 1–2 days</span>
              <span className="opacity-60">|</span>
              <span>Cash on delivery</span>
              <span className="opacity-60">|</span>
              <span>Direct import from Turkey</span>
              <span className="opacity-60">|</span>
              <span>100% Herbal Themra Macun</span>
              <span className="opacity-60">|</span>
              <span>Discreet Plain Box Packaging</span>
              <span className="opacity-60">|</span>
            </div>
            {/* Set 2 for seamless loop */}
            <div className="flex items-center gap-6 sm:gap-8 shrink-0">
              <span>Direct import</span>
              <span className="opacity-60">|</span>
              <span>Secure Packaging</span>
              <span className="opacity-60">|</span>
              <span>All-India Delivery</span>
              <span className="opacity-60">|</span>
              <span>Prepaid in 1–2 days</span>
              <span className="opacity-60">|</span>
              <span>Cash on delivery</span>
              <span className="opacity-60">|</span>
              <span>Direct import from Turkey</span>
              <span className="opacity-60">|</span>
              <span>100% Herbal Themra Macun</span>
              <span className="opacity-60">|</span>
              <span>Discreet Plain Box Packaging</span>
              <span className="opacity-60">|</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: PICK YOUR PACK (Warm Cream + 6 Color-Coded Packs)
      ───────────────────────────────────────────────────────────── */}
      <div id="products" className="relative -top-20 pointer-events-none" />
      <section
        id="shop"
        className="tj-diamonds-cream text-stone-900 min-h-[100dvh] py-10 sm:py-12 lg:py-16 flex flex-col justify-center relative overflow-hidden"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-3 sm:px-8 text-center w-full my-auto"
        >
          {/* Header */}
          <motion.p variants={fadeInUp} className="font-tj-serif italic text-sm sm:text-lg text-[#8e1c2e] font-semibold">
            six ways to taste it
          </motion.p>
          <motion.h2 variants={fadeInUp} className="font-tj-serif text-2xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 mt-0.5 sm:mt-1">
            Pick your <span className="text-[#8e1c2e] italic">pack</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-stone-700 text-xs sm:text-base max-w-xl mx-auto mt-1 sm:mt-2">
            Listed from lowest to highest price. The bigger the pack, the less each sachet costs.
          </motion.p>

          {/* Savings Highlight Pill */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ scale: 1.03 }}
            className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 px-3.5 sm:px-6 py-1.5 sm:py-2 rounded-full bg-[#5b1420] text-white text-[11px] sm:text-sm font-semibold shadow-md mt-3 sm:mt-5 cursor-default"
          >
            <span>100% Cash on Delivery Available</span>
            <span className="btn-shimmer px-2.5 py-0.5 rounded-full bg-[#fed000] text-black font-black text-[10px] sm:text-xs">
              Discreet Plain Box Delivery
            </span>
          </motion.div>

          {/* 6 Product Cards Grid - 2 columns on mobile matching des.svg */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 mt-6 sm:mt-10 text-left"
          >
            {PACKAGES.map((pkg) => {
              const { isOutOfStock, price, mrp } = getPackageLiveDetails(pkg);

              return (
                <motion.div
                  key={pkg.id}
                  variants={fadeInUp}
                  whileHover={isOutOfStock ? undefined : { y: -6, transition: { duration: 0.25 } }}
                  className={`group rounded-2xl sm:rounded-3xl bg-white border-2 border-stone-800 shadow-[0_4px_0_0_#2b2b2b] sm:shadow-[0_6px_0_0_#2b2b2b] ${
                    isOutOfStock ? "opacity-85" : "hover:shadow-[0_10px_0_0_#2b2b2b]"
                  } overflow-hidden flex flex-col justify-between transition-all duration-300`}
                >
                  {/* Top Image Box with Pastel Background & Badge */}
                  <div className={`${pkg.headerBg} relative w-full aspect-[1.15/1] sm:aspect-[1.4/1] p-2 sm:p-4 flex items-center justify-center border-b-2 border-stone-800 overflow-hidden`}>
                    {/* Badge top right */}
                    <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 z-10">
                      {isOutOfStock ? (
                        <span className="px-1.5 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-xs font-black tracking-wide uppercase shadow-md bg-stone-900 text-white border border-stone-700">
                          Out of Stock
                        </span>
                      ) : pkg.badge ? (
                        <span
                          className={`px-1.5 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-xs font-black tracking-wide shadow-sm border border-black/10 transition-transform duration-300 group-hover:scale-105 ${pkg.badgeColor}`}
                        >
                          {pkg.badge}
                        </span>
                      ) : null}
                    </div>

                    {/* Product Photo */}
                    <div className={`relative w-full h-full max-w-[120px] sm:max-w-[180px] transition-transform duration-500 ease-out ${
                      isOutOfStock ? "grayscale-[35%]" : "group-hover:scale-108 group-hover:-translate-y-1"
                    }`}>
                      <Image
                        src={pkg.image}
                        alt={pkg.name}
                        fill
                        className="object-contain drop-shadow-md"
                      />
                    </div>

                    {/* Out of Stock Centered Overlay */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-stone-900/25 backdrop-blur-[0.5px] flex items-center justify-center z-[5] pointer-events-none">
                        <span className="px-2.5 py-1 rounded-full bg-stone-900/90 text-white text-[9px] sm:text-xs font-black uppercase tracking-wider shadow-lg border border-white/20">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-2.5 sm:p-5 flex flex-col flex-1 justify-between gap-2 sm:gap-3">
                    <div>
                      <h3 className="font-tj-serif text-xs sm:text-xl font-bold text-stone-900 leading-tight group-hover:text-[#8e1c2e] transition-colors line-clamp-1">
                        {pkg.name}
                      </h3>
                      <p className="text-stone-600 text-[10px] sm:text-xs mt-0.5 line-clamp-1">
                        {pkg.sub}
                      </p>

                      {/* Price */}
                      <div className="mt-1.5 sm:mt-2.5 flex items-baseline gap-1 sm:gap-2">
                        <span className="font-tj-serif text-base sm:text-3xl font-extrabold text-stone-950">
                          ₹{price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] sm:text-xs text-stone-400 line-through">
                          ₹{mrp.toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* Cost per sachet & optional savings pill */}
                      <div className="mt-0.5 sm:mt-1 flex flex-wrap items-center gap-1 sm:gap-2">
                        <span className="text-[9px] sm:text-xs text-stone-600 font-medium">
                          {pkg.perSachet}
                        </span>
                        {pkg.savingsPill && (
                          <span className="px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-md bg-[#2d6a4f] text-white text-[8px] sm:text-[10px] font-bold">
                            {pkg.savingsPill}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Add to Cart / Out of Stock Button */}
                    {isOutOfStock ? (
                      <button
                        type="button"
                        disabled
                        className="w-full py-1.5 sm:py-3 rounded-xl sm:rounded-2xl bg-stone-200 text-stone-500 font-bold text-[11px] sm:text-sm flex items-center justify-center gap-1 sm:gap-2 cursor-not-allowed opacity-90 border border-stone-300 shadow-none select-none"
                      >
                        <PackageX className="w-3 h-3 sm:w-4 sm:h-4 text-stone-400" />
                        <span>Out of Stock</span>
                      </button>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddToCart(pkg)}
                        className="w-full py-1.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#731a26] hover:bg-[#5b1420] text-white font-bold text-[11px] sm:text-sm transition-all shadow-sm sm:shadow-md hover:shadow-lg flex items-center justify-center gap-1 sm:gap-2 cursor-pointer group/btn active:scale-95"
                      >
                        <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover/btn:-rotate-12" />
                        <span>Add to cart</span>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Footnote note from SVG */}
          <motion.p variants={fadeInUp} className="text-center text-[11px] sm:text-sm text-stone-600 mt-5 sm:mt-8 max-w-3xl mx-auto px-2 sm:px-4">
            100% Cash on Delivery available across India. Discreet plain box courier dispatch. Savings are per sachet, compared with the 2 sachet pack.
          </motion.p>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: ORIGIN & SOURCING (Deep Forest Green + Flight Map)
      ───────────────────────────────────────────────────────────── */}
      <section
        id="origin"
        className="tj-diamonds-green text-white min-h-[100dvh] py-10 sm:py-12 lg:py-16 flex flex-col justify-center relative overflow-hidden"
      >
        <div className="max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 w-full my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Heading, Subtext, 3 Proof Steps */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
              className="lg:col-span-6 space-y-4 sm:space-y-5"
            >
              <motion.div variants={fadeInUp}>
                <p className="font-tj-serif uppercase tracking-widest italic text-xs sm:text-lg text-[#fed000] font-semibold">
                  from there to here
                </p>
                <h2 className="font-tj-serif text-2xl sm:text-5xl font-bold tracking-tight text-white mt-1">
                  Imported <span className="text-[#fed000] italic">directly</span> from Türkiye
                </h2>
                <p className="text-emerald-100/90 text-xs sm:text-base leading-relaxed mt-2 sm:mt-2.5">
                  Every jar and sachet is brought in straight from Türkiye and delivered to your door anywhere in India. Authenticity and direct producer relationships ensure pure herbal potency.
                </p>
              </motion.div>

              {/* 3 Step Boxes - Large 01, 02, 03 matching des.svg */}
              <motion.div variants={staggerContainer} className="space-y-2.5 sm:space-y-3 pt-1">
                <motion.div
                  variants={slideInLeft}
                  whileHover={{ x: 6, transition: { duration: 0.2 } }}
                  className="p-3 sm:p-4 rounded-2xl bg-black/25 border-2 border-dashed border-white/20 hover:border-white/40 flex items-start gap-3.5 sm:gap-4 transition-colors group cursor-default"
                >
                  <span className="font-tj-serif text-xl sm:text-2xl font-black text-[#fed000] shrink-0 w-7 sm:w-10">
                    01
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base">Direct from the source</h4>
                    <p className="text-emerald-100/80 text-xs sm:text-sm mt-0.5">
                      Direct partnership with verified Turkish producers in Istanbul & Anatolia.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  variants={slideInLeft}
                  whileHover={{ x: 6, transition: { duration: 0.2 } }}
                  className="p-3 sm:p-4 rounded-2xl bg-black/25 border-2 border-dashed border-white/20 hover:border-white/40 flex items-start gap-3.5 sm:gap-4 transition-colors group cursor-default"
                >
                  <span className="font-tj-serif text-xl sm:text-2xl font-black text-[#fed000] shrink-0 w-7 sm:w-10">
                    02
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base">Original product</h4>
                    <p className="text-emerald-100/80 text-xs sm:text-sm mt-0.5">
                      100% authentic Themra Epimedyumlu Macun with original holographic seal and batch certificate.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  variants={slideInLeft}
                  whileHover={{ x: 6, transition: { duration: 0.2 } }}
                  className="p-3 sm:p-4 rounded-2xl bg-black/25 border-2 border-dashed border-white/20 hover:border-white/40 flex items-start gap-3.5 sm:gap-4 transition-colors group cursor-default"
                >
                  <span className="font-tj-serif text-xl sm:text-2xl font-black text-[#fed000] shrink-0 w-7 sm:w-10">
                    03
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base">Tested and documented</h4>
                    <p className="text-emerald-100/80 text-xs sm:text-sm mt-0.5">
                      Batch tested herbal formula with pure natural ingredients and full documentation.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Column: Origin Graphic Card with Modular SVGs & Floating Cutouts */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={scaleIn}
              className="lg:col-span-6 flex justify-center items-center"
            >
              <div className="relative w-full max-w-[340px] sm:max-w-[460px] lg:max-w-[500px] xl:max-w-[520px] aspect-[600/625] rounded-[2rem] sm:rounded-[2.5rem] border-2 border-[#f5ede1]/85 bg-black/15 p-4 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl drop-shadow-2xl mx-auto">
                {/* 3D LAYER 1 (z-10): Back Flight Path (Passing BEHIND the Jar) */}
                <svg
                  viewBox="0 0 600 625"
                  fill="none"
                  className="absolute inset-0 w-full h-full pointer-events-none z-10"
                >
                  <defs>
                    <mask id="back-flight-mask">
                      <motion.path
                        d="M 180 85 C 260 85, 370 110, 440 165 C 475 200, 480 250, 465 310"
                        stroke="white"
                        strokeWidth="16"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{ duration: 1.1, ease: "easeInOut" }}
                      />
                    </mask>
                  </defs>
                  <path
                    d="M 180 85 C 260 85, 370 110, 440 165 C 475 200, 480 250, 465 310"
                    stroke="#fed000"
                    strokeWidth="3.2"
                    strokeDasharray="10 8"
                    strokeLinecap="round"
                    fill="none"
                    mask="url(#back-flight-mask)"
                  />
                </svg>

                {/* Top Row: Türkiye Origin Point + Botanical Leaf SVG (z-20) */}
                <div className="flex items-center justify-between w-full z-20">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative w-5 h-5 sm:w-7 sm:h-7 shrink-0 drop-shadow-md">
                      <Image
                        src="/tj/design-assets/turkiye-marker.svg"
                        alt="Türkiye"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="font-tj-serif text-xl sm:text-3xl font-bold text-white tracking-wide drop-shadow-sm">
                      Türkiye
                    </span>
                  </div>

                  <div className="relative w-5 h-8 sm:w-7 sm:h-12 shrink-0 opacity-90 drop-shadow-sm">
                    <Image
                      src="/tj/design-assets/origin-leaf.svg"
                      alt="Botanical Leaf"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* 3D LAYER 2 (z-20): Products (Jar & Sachets) */}
                <div className="relative flex-1 w-full flex items-center justify-center my-1 z-20">
                  {/* Floating Left Sachet */}
                  <motion.div
                    animate={{ y: [0, 6, 0], rotate: [-16, -12, -16] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-[2%] sm:left-[4%] top-[26%] w-[15%] sm:w-[16%] aspect-[428/1473] z-20"
                  >
                    <Image
                      src="/tj/design-assets/sachet-single-clean.png"
                      alt="Themra Macun Sachet"
                      fill
                      className="object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.6)]"
                    />
                  </motion.div>

                  {/* Central Pomegranate Macun Jar Cutout */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-[52%] sm:w-[54%] aspect-[1122/1402] z-20 cursor-pointer -mt-1"
                  >
                    <Image
                      src="/products/turkiye-jam/Premium Pomegranate Jam Jar Cutout.png"
                      alt="Themra Epimedyumlu Macun Jar"
                      fill
                      className="object-contain drop-shadow-[0_24px_35px_rgba(0,0,0,0.7)] hover:scale-105 transition-transform duration-500"
                      priority
                    />
                  </motion.div>

                  {/* Floating Right Sachet (unmirrored, readable text) */}
                  <motion.div
                    animate={{ y: [0, -6, 0], rotate: [16, 20, 16] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute right-[2%] sm:right-[4%] top-[22%] w-[15%] sm:w-[16%] aspect-[428/1473] z-20"
                  >
                    <Image
                      src="/tj/design-assets/sachet-single-clean.png"
                      alt="Themra Macun Sachet"
                      fill
                      className="object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.6)]"
                    />
                  </motion.div>
                </div>

                {/* 3D LAYER 3 (z-30): Front Flight Path (Sweeping ACROSS FRONT of the Jar to India) */}
                <svg
                  viewBox="0 0 600 625"
                  fill="none"
                  className="absolute inset-0 w-full h-full pointer-events-none z-30"
                >
                  <defs>
                    <mask id="front-flight-mask">
                      <motion.path
                        d="M 465 310 C 445 375, 350 405, 240 405 C 160 405, 145 440, 185 475 C 240 515, 340 528, 425 528"
                        stroke="white"
                        strokeWidth="16"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{ delay: 1.05, duration: 1.35, ease: "easeInOut" }}
                      />
                    </mask>
                  </defs>
                  <path
                    d="M 465 310 C 445 375, 350 405, 240 405 C 160 405, 145 440, 185 475 C 240 515, 340 528, 425 528"
                    stroke="#fed000"
                    strokeWidth="3.2"
                    strokeDasharray="10 8"
                    strokeLinecap="round"
                    fill="none"
                    mask="url(#front-flight-mask)"
                  />
                  {/* Arrowhead pointing to India, popping in at route arrival */}
                  <motion.path
                    d="M 405 519 L 425 528 L 409 542"
                    stroke="#fed000"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ opacity: 0, scale: 0.4 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ delay: 2.35, duration: 0.35, ease: "easeOut" }}
                  />
                </svg>

                {/* Bottom Row: Direct Import Pill Badge + India Destination Point (z-30) */}
                <div className="flex items-center justify-between w-full z-30 pt-1">
                  <div className="relative w-28 sm:w-36 h-8 sm:h-10 shrink-0 drop-shadow-md hover:scale-105 transition-transform cursor-default">
                    <Image
                      src="/tj/design-assets/direct-import-pill.svg"
                      alt="Direct import"
                      fill
                      className="object-contain object-left"
                    />
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="font-tj-serif text-xl sm:text-3xl font-bold text-white tracking-wide drop-shadow-sm">
                      India
                    </span>
                    <div className="relative w-5 h-5 sm:w-7 sm:h-7 shrink-0 drop-shadow-md">
                      <Image
                        src="/tj/design-assets/india-marker.svg"
                        alt="India"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: HOW TO USE (4 Step Cards + Warning Banner)
      ───────────────────────────────────────────────────────────── */}
      <section
        id="usage"
        className="tj-diamonds-cream text-stone-900 min-h-[100dvh] py-10 sm:py-12 lg:py-16 flex flex-col justify-center relative overflow-hidden"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
          className="max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-3 sm:px-8 text-center w-full my-auto"
        >
          <motion.p variants={fadeInUp} className="font-tj-serif italic text-sm sm:text-lg text-[#8e1c2e] font-semibold">
            simple as one, two, three, four
          </motion.p>
          <motion.h2 variants={fadeInUp} className="font-tj-serif text-2xl sm:text-5xl font-bold tracking-tight text-stone-900 mt-0.5 sm:mt-1">
            How to <span className="text-[#8e1c2e] italic">use</span>
          </motion.h2>

          {/* 4 Cards Grid - 2x2 on mobile matching des.svg */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6 mt-6 sm:mt-12 text-center"
          >
            {/* Step 1 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="group rounded-2xl sm:rounded-3xl bg-white border-2 border-stone-800 shadow-[0_4px_0_0_#2b2b2b] sm:shadow-[0_8px_0_0_#2b2b2b] hover:shadow-[0_12px_0_0_#2b2b2b] overflow-hidden flex flex-col justify-between transition-all duration-300"
            >
              <div className="bg-[#b9e5e9] relative w-full aspect-[1.15/1] sm:aspect-[1.3/1] p-2.5 sm:p-4 flex items-center justify-center border-b-2 border-stone-800 overflow-hidden">
                <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-108">
                  <Image
                    src="/tj/design-assets/how-step-1.png"
                    alt="Step 1: Read the label"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="p-3 sm:p-5 pt-0 flex flex-col items-center relative z-10">
                <span className="relative z-20 -mt-3.5 sm:-mt-5 mb-1.5 sm:mb-3 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#731a26] text-white font-black text-xs sm:text-base flex items-center justify-center shadow-md border-2 border-white transition-transform duration-300 group-hover:scale-110">
                  1
                </span>
                <h3 className="font-tj-serif text-xs sm:text-xl font-bold text-stone-900 group-hover:text-[#731a26] transition-colors leading-tight">
                  Read the label
                </h3>
                <p className="text-stone-600 text-[10px] sm:text-sm mt-0.5 sm:mt-1 leading-snug">
                  Check ingredients and directions before first use.
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="group rounded-2xl sm:rounded-3xl bg-white border-2 border-stone-800 shadow-[0_4px_0_0_#2b2b2b] sm:shadow-[0_8px_0_0_#2b2b2b] hover:shadow-[0_12px_0_0_#2b2b2b] overflow-hidden flex flex-col justify-between transition-all duration-300"
            >
              <div className="bg-[#f8bac5] relative w-full aspect-[1.15/1] sm:aspect-[1.3/1] p-2.5 sm:p-4 flex items-center justify-center border-b-2 border-stone-800 overflow-hidden">
                <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-108">
                  <Image
                    src="/tj/design-assets/how-step-2.png"
                    alt="Step 2: After a meal"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="p-3 sm:p-5 pt-0 flex flex-col items-center relative z-10">
                <span className="relative z-20 -mt-3.5 sm:-mt-5 mb-1.5 sm:mb-3 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#731a26] text-white font-black text-xs sm:text-base flex items-center justify-center shadow-md border-2 border-white transition-transform duration-300 group-hover:scale-110">
                  2
                </span>
                <h3 className="font-tj-serif text-xs sm:text-xl font-bold text-stone-900 group-hover:text-[#731a26] transition-colors leading-tight">
                  After a meal
                </h3>
                <p className="text-stone-600 text-[10px] sm:text-sm mt-0.5 sm:mt-1 leading-snug">
                  Do not take on an empty stomach.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="group rounded-2xl sm:rounded-3xl bg-white border-2 border-stone-800 shadow-[0_4px_0_0_#2b2b2b] sm:shadow-[0_8px_0_0_#2b2b2b] hover:shadow-[0_12px_0_0_#2b2b2b] overflow-hidden flex flex-col justify-between transition-all duration-300"
            >
              <div className="bg-[#f1a337] relative w-full aspect-[1.15/1] sm:aspect-[1.3/1] p-2.5 sm:p-4 flex items-center justify-center border-b-2 border-stone-800 overflow-hidden">
                <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-108">
                  <Image
                    src="/tj/design-assets/how-step-3.png"
                    alt="Step 3: Stir the jar"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="p-3 sm:p-5 pt-0 flex flex-col items-center relative z-10">
                <span className="relative z-20 -mt-3.5 sm:-mt-5 mb-1.5 sm:mb-3 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#731a26] text-white font-black text-xs sm:text-base flex items-center justify-center shadow-md border-2 border-white transition-transform duration-300 group-hover:scale-110">
                  3
                </span>
                <h3 className="font-tj-serif text-xs sm:text-xl font-bold text-stone-900 group-hover:text-[#731a26] transition-colors leading-tight">
                  Stir the jar
                </h3>
                <p className="text-stone-600 text-[10px] sm:text-sm mt-0.5 sm:mt-1 leading-snug">
                  Mix well if you bought the jar. Sachets are single-serve.
                </p>
              </div>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="group rounded-2xl sm:rounded-3xl bg-white border-2 border-stone-800 shadow-[0_4px_0_0_#2b2b2b] sm:shadow-[0_8px_0_0_#2b2b2b] hover:shadow-[0_12px_0_0_#2b2b2b] overflow-hidden flex flex-col justify-between transition-all duration-300"
            >
              <div className="bg-[#b9e5e9] relative w-full aspect-[1.15/1] sm:aspect-[1.3/1] p-2.5 sm:p-4 flex items-center justify-center border-b-2 border-stone-800 overflow-hidden">
                <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-108">
                  <Image
                    src="/tj/design-assets/how-step-4.png"
                    alt="Step 4: One serving"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="p-3 sm:p-5 pt-0 flex flex-col items-center relative z-10">
                <span className="relative z-20 -mt-3.5 sm:-mt-5 mb-1.5 sm:mb-3 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#731a26] text-white font-black text-xs sm:text-base flex items-center justify-center shadow-md border-2 border-white transition-transform duration-300 group-hover:scale-110">
                  4
                </span>
                <h3 className="font-tj-serif text-xs sm:text-xl font-bold text-stone-900 group-hover:text-[#731a26] transition-colors leading-tight">
                  One serving
                </h3>
                <p className="text-stone-600 text-[10px] sm:text-sm mt-0.5 sm:mt-1 leading-snug">
                  One small spoon or one sachet, as the label directs.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom Warning Pill Banner */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ scale: 1.01 }}
            className="max-w-4xl mx-auto mt-6 sm:mt-10 px-2 sm:px-4 text-left cursor-default"
          >
            <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#5b1420] text-white flex items-center gap-3 sm:gap-4 shadow-lg border border-white/10">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#fed000] text-black font-black text-base sm:text-xl flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                !
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-stone-100">
                <strong className="text-[#fed000]">Important.</strong> If you have a heart condition or blood pressure concerns, are pregnant, or take regular medication, consult a doctor before use.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: BEFORE YOU ORDER (Interactive FAQ Accordion)
      ───────────────────────────────────────────────────────────── */}
      <section
        id="faq"
        className="tj-diamonds-dark-wine text-white min-h-[100dvh] py-10 sm:py-12 lg:py-16 flex flex-col justify-center relative overflow-hidden"
      >
        <div className="max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 w-full my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
            
            {/* Left Side: Headline, Jar Visual, Guarantee */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
              className="lg:col-span-5 space-y-3 sm:space-y-4 text-center lg:text-left"
            >
              <motion.p variants={fadeInUp} className="font-tj-serif italic text-sm sm:text-lg text-[#fed000]">
                the small print, made simple
              </motion.p>
              <motion.h2 variants={fadeInUp} className="font-tj-serif text-2xl sm:text-5xl font-bold tracking-tight text-white">
                Before you <span className="text-[#fed000] italic">order</span>
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-stone-300 text-xs sm:text-base max-w-md mx-auto lg:mx-0">
                Delivery, packing and safety, explained plainly.
              </motion.p>

              {/* Jar with Dashed Ring Illustration */}
              <motion.div variants={scaleIn} className="relative w-40 sm:w-64 aspect-square mx-auto lg:mx-0 pt-2 sm:pt-3 animate-tj-float">
                <Image
                  src="/tj/design-assets/before-order-jar.png"
                  alt="Turkiye Jam Delivery"
                  fill
                  className="object-contain"
                />
              </motion.div>

              <motion.p variants={fadeInUp} className="text-[11px] sm:text-sm text-stone-300 italic">
                Imported from Türkiye. Delivered across India.
              </motion.p>
            </motion.div>

            {/* Right Side: Accordion Items */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={staggerContainer}
              className="lg:col-span-7 space-y-2.5 sm:space-y-3"
            >
              {FAQ_ITEMS.map((item) => {
                const isOpen = openFaq === item.id;
                return (
                  <motion.div
                    key={item.id}
                    variants={fadeInUp}
                    className="rounded-2xl bg-white/10 border border-white/15 overflow-hidden transition-all duration-200"
                  >
                    <button
                      onClick={() => toggleFaq(item.id)}
                      className="w-full p-3.5 sm:p-4.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-4">
                        <span className="font-tj-serif text-sm sm:text-lg font-bold text-[#fed000]">
                          {item.id}
                        </span>
                        <span className="font-tj-serif text-sm sm:text-lg font-bold text-white leading-snug">
                          {item.question}
                        </span>
                      </div>
                      <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#fed000] text-black flex items-center justify-center shrink-0 ml-2.5 sm:ml-3 transition-transform duration-200">
                        {isOpen ? <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      </span>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.28, ease: "easeInOut" }}
                          className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 text-xs sm:text-sm text-stone-200 border-t border-white/10"
                        >
                          {item.isSpeedBox ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3.5 pt-2">
                              {/* Box 1: Delivery timeframe */}
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="p-3 sm:p-4 rounded-xl bg-[#fed000] text-stone-900 border border-stone-800 shadow-sm cursor-default"
                              >
                                <h4 className="font-tj-serif font-extrabold text-base sm:text-xl">
                                  3–5 business days
                                </h4>
                                <p className="text-stone-800 font-medium text-[11px] sm:text-sm mt-0.5">
                                  Express doorstep courier dispatch
                                </p>
                              </motion.div>

                              {/* Box 2: COD */}
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="p-3 sm:p-4 rounded-xl bg-white text-stone-900 border border-stone-800 shadow-sm cursor-default"
                              >
                                <h4 className="font-tj-serif font-extrabold text-base sm:text-xl">
                                  100% Cash on Delivery
                                </h4>
                                <p className="text-stone-700 font-medium text-[11px] sm:text-sm mt-0.5">
                                  Pay cash or UPI upon delivery
                                </p>
                              </motion.div>
                            </div>
                          ) : (
                            <p className="leading-relaxed pt-2">{item.content}</p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: REVIEWS & CONVERSION CTA (Cream + Golden Yellow)
      ───────────────────────────────────────────────────────────── */}
      <section
        id="reviews"
        className="tj-diamonds-cream text-stone-900 min-h-[100dvh] py-10 sm:py-12 lg:py-16 flex flex-col justify-center relative overflow-hidden"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 text-center w-full my-auto"
        >
          {/* Reviews Header */}
          <motion.p variants={fadeInUp} className="font-tj-serif italic text-sm sm:text-lg text-[#8e1c2e] font-semibold">
            straight from happy doorsteps across India
          </motion.p>
          <motion.h2 variants={fadeInUp} className="font-tj-serif text-2xl sm:text-5xl font-bold tracking-tight text-stone-900 mt-0.5 sm:mt-1">
            What our customers <span className="text-[#8e1c2e] italic">say</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-stone-600 text-xs sm:text-sm mt-1">
            Sample reviews from verified buyers across India.
          </motion.p>

          {/* 3 Review Cards */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6 mt-6 sm:mt-10 text-left"
          >
            {REVIEWS.map((rev) => (
              <motion.div
                key={rev.id}
                variants={fadeInUp}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="group rounded-2xl sm:rounded-3xl bg-white border-2 border-stone-800 shadow-[0_4px_0_0_#2b2b2b] sm:shadow-[0_6px_0_0_#2b2b2b] hover:shadow-[0_10px_0_0_#2b2b2b] p-4 sm:p-6 flex flex-col justify-between transition-all duration-300"
              >
                <div>
                  {/* Stars + Quote Mark */}
                  <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 stroke-stone-800" />
                      ))}
                    </div>
                    <span className="font-serif text-2xl text-[#8e1c2e] leading-none transition-transform group-hover:scale-125">“</span>
                  </div>

                  {/* Review Text */}
                  <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">
                    {rev.text}
                  </p>
                </div>

                {/* Author Info */}
                <div className="mt-4 sm:mt-5 pt-3 sm:pt-3.5 border-t border-dashed border-stone-300">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 border border-stone-800 shadow-sm transition-transform group-hover:scale-110 ${rev.avatarBg}`}
                    >
                      {rev.initial}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-xs sm:text-sm group-hover:text-[#8e1c2e] transition-colors">{rev.name}</h4>
                      <p className="text-[10px] sm:text-[11px] text-stone-500">{rev.location}</p>
                    </div>
                  </div>

                  {/* Purchase Badge */}
                  <div className="mt-2 sm:mt-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full border border-stone-800 text-[10px] font-bold text-stone-700 bg-stone-50">
                      📦 {rev.bought}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Golden Yellow Conversion CTA Banner */}
          <motion.div
            variants={scaleIn}
            className="bg-[#fab005] sm:bg-[#fed000] py-6 sm:py-12 text-stone-950 relative overflow-hidden mt-8 sm:mt-10 rounded-2xl sm:rounded-3xl border-2 border-stone-800 shadow-[0_6px_0_0_#2b2b2b] sm:shadow-[0_8px_0_0_#2b2b2b]"
          >
            <div className="relative z-10 max-w-2xl mx-auto px-4">
              <p className="font-tj-serif italic text-sm sm:text-lg text-[#5b1420] font-semibold">
                your first jar is one tap away
              </p>
              <h2 className="font-tj-serif text-xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-0.5 sm:mt-1">
                Order Türkiye Jam today
              </h2>
              <p className="text-stone-800 text-xs sm:text-sm mt-1 sm:mt-1.5">
                All-India delivery. Choose prepaid or cash on delivery.
              </p>

              {/* Action Button */}
              <div className="mt-4 sm:mt-5">
                <a
                  href="#shop"
                  className="btn-shimmer px-7 sm:px-10 py-2.5 sm:py-3.5 rounded-full bg-[#5b1420] hover:bg-[#430f1b] text-white font-extrabold text-xs sm:text-base shadow-xl hover:scale-105 active:scale-95 transition-all inline-flex items-center justify-center cursor-pointer border-2 border-black/10"
                >
                  Choose your pack
                </a>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-5 text-[10px] sm:text-xs font-bold text-stone-900">
                <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-stone-800 bg-white/40 shadow-sm">
                  Prepaid: 1–2 days
                </span>
                <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-stone-800 bg-white/40 shadow-sm">
                  Cash on delivery: 3–7 days
                </span>
                <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-stone-800 bg-white/40 shadow-sm">
                  Direct import
                </span>
              </div>
            </div>

            {/* Left Floating Jar (Desktop) */}
            <div className="hidden lg:block absolute left-4 bottom-2 w-44 h-44 pointer-events-none animate-tj-float">
              <Image
                src="/tj/design-assets/cta-jar-transparent.png"
                alt="Turkiye Jam Jar"
                fill
                className="object-contain"
              />
            </div>

            {/* Right Floating Sachets (Desktop) */}
            <div className="hidden lg:block absolute right-4 bottom-2 w-44 h-44 pointer-events-none animate-tj-float-reverse">
              <Image
                src="/tj/design-assets/cta-sachets-transparent.png"
                alt="Turkiye Jam Sachets"
                fill
                className="object-contain"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}

export const VittalDigitalStorefront = TurkiyeJamStorefront;
