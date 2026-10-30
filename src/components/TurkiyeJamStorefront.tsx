"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Clock,
  Sparkles,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

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

export function TurkiyeJamStorefront() {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const [openFaq, setOpenFaq] = useState<number | null>(1); // Question 1 open by default matching SVG
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 350);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddToCart = (pkg: typeof PACKAGES[0]) => {
    addItem(
      {
        id: `turkiye-jam-${pkg.id}`,
        name: `Turkiye Jam (${pkg.name})`,
        category: "Vitality & Wellness",
        price: pkg.price,
        original_price: pkg.mrp,
        mrp: pkg.mrp,
        poster_image: pkg.image,
        color: pkg.name,
      },
      1
    );
    openCart();
  };

  const handleBuyNow = (pkg: typeof PACKAGES[0]) => {
    addItem(
      {
        id: `turkiye-jam-${pkg.id}`,
        name: `Turkiye Jam (${pkg.name})`,
        category: "Vitality & Wellness",
        price: pkg.price,
        original_price: pkg.mrp,
        mrp: pkg.mrp,
        poster_image: pkg.image,
        color: pkg.name,
      },
      1
    );
    router.push("/checkout");
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
        className="tj-diamonds-wine text-white relative overflow-hidden h-[100dvh] flex flex-col justify-between"
      >
        <div className="flex-1 min-h-0 flex items-end w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-8 xl:px-12 pt-16 sm:pt-18 lg:pt-20 pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-end w-full h-full min-h-0">
            
            {/* Left Column: Script Tagline, Brand Stamp Logo, Description, Button */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="lg:col-span-5 space-y-3 sm:space-y-4 lg:space-y-5 xl:space-y-6 text-center lg:text-left z-10 py-3 sm:py-4 lg:py-6 my-auto"
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
                className="relative w-56 sm:w-72 md:w-88 lg:w-[360px] xl:w-[440px] 2xl:w-[500px] max-h-[25vh] aspect-[2.11/1] mx-auto lg:mx-0 group cursor-pointer"
              >
                <Image
                  src="/turkiye-jam-logo.svg"
                  alt="Turkiye Jam"
                  fill
                  className="object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              </motion.div>

              {/* Subtitle */}
              <motion.p
                variants={fadeInUp}
                className="text-stone-100 text-sm sm:text-base lg:text-lg xl:text-xl font-medium max-w-md sm:max-w-lg lg:max-w-xl mx-auto lg:mx-0 leading-relaxed drop-shadow-sm"
              >
                A small-batch fruit and herb preserve, imported and delivered across India.
              </motion.p>

              {/* Shop the Collection Button */}
              <motion.div variants={fadeInUp} className="pt-1.5 lg:pt-2">
                <a
                  href="#shop"
                  className="btn-shimmer inline-flex items-center justify-center px-7 sm:px-9 lg:px-11 xl:px-12 py-3 sm:py-3.5 lg:py-4 rounded-full bg-[#fed000] hover:bg-[#e6bc00] text-black font-extrabold text-sm sm:text-base lg:text-lg xl:text-xl shadow-xl shadow-black/25 hover:scale-105 active:scale-95 transition-all border-2 border-black/10 cursor-pointer pointer-events-auto"
                >
                  Shop the Collection
                </a>
              </motion.div>
            </motion.div>

            {/* Right Column: Hero Person Holding Jam Jar - Flush with green ticker, prominently enlarged */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="lg:col-span-7 flex justify-center lg:justify-end relative self-end items-end h-full min-h-0 z-20 pointer-events-none"
            >
              <div className="relative w-auto h-[55vh] sm:h-[65vh] md:h-[72vh] lg:h-[82vh] xl:h-[88vh] 2xl:h-[92vh] max-h-full aspect-[1.5/1] flex items-end translate-y-[2px] lg:-mr-8 xl:-mr-14">
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
        <div className="shrink-0 w-full z-10 bg-[#0e4a3b] text-white py-2.5 sm:py-3.5 overflow-hidden border-t border-b border-white/10 font-medium text-xs sm:text-sm tracking-wide select-none">
          <div className="animate-tj-marquee flex items-center gap-8">
            {/* Set 1 */}
            <div className="flex items-center gap-8 shrink-0">
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
            <div className="flex items-center gap-8 shrink-0">
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
      <section
        id="shop"
        className="tj-diamonds-cream text-stone-900 min-h-[100dvh] py-12 lg:py-16 flex flex-col justify-center relative overflow-hidden"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 text-center w-full my-auto"
        >
          {/* Header */}
          <motion.p variants={fadeInUp} className="font-tj-serif italic text-base sm:text-lg text-[#8e1c2e] font-semibold">
            six ways to taste it
          </motion.p>
          <motion.h2 variants={fadeInUp} className="font-tj-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 mt-1">
            Pick your <span className="text-[#8e1c2e] italic">pack</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-stone-700 text-sm sm:text-base max-w-xl mx-auto mt-2">
            Listed from lowest to highest price. The bigger the pack, the less each sachet costs.
          </motion.p>

          {/* Savings Highlight Pill */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ scale: 1.03 }}
            className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-5 sm:px-6 py-2 rounded-full bg-[#5b1420] text-white text-xs sm:text-sm font-semibold shadow-md mt-4 sm:mt-5 cursor-default"
          >
            <span>Prepaid delivery is ₹60</span>
            <span className="btn-shimmer px-3 py-0.5 rounded-full bg-[#fed000] text-black font-black text-xs">
              Save ₹130 vs cash on delivery
            </span>
          </motion.div>

          {/* 6 Product Cards Grid */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mt-8 sm:mt-10 text-left"
          >
            {PACKAGES.map((pkg) => (
              <motion.div
                key={pkg.id}
                variants={fadeInUp}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="group rounded-3xl bg-white border-2 border-stone-800 shadow-[0_6px_0_0_#2b2b2b] hover:shadow-[0_12px_0_0_#2b2b2b] overflow-hidden flex flex-col justify-between transition-all duration-300"
              >
                {/* Top Image Box with Pastel Background & Badge */}
                <div className={`${pkg.headerBg} relative w-full aspect-[1.4/1] p-3 sm:p-4 flex items-center justify-center border-b-2 border-stone-800 overflow-hidden`}>
                  {/* Badge top right */}
                  <div className="absolute top-3 right-3 z-10">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-black tracking-wide shadow-sm border border-black/10 transition-transform duration-300 group-hover:scale-105 ${pkg.badgeColor}`}
                    >
                      {pkg.badge}
                    </span>
                  </div>

                  {/* Product Photo */}
                  <div className="relative w-36 sm:w-44 h-full transition-transform duration-500 ease-out group-hover:scale-108 group-hover:-translate-y-1">
                    <Image
                      src={pkg.image}
                      alt={pkg.name}
                      fill
                      className="object-contain drop-shadow-md"
                    />
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <h3 className="font-tj-serif text-lg sm:text-xl font-bold text-stone-900 leading-snug group-hover:text-[#8e1c2e] transition-colors">
                      {pkg.name}
                    </h3>
                    <p className="text-stone-600 text-xs mt-0.5">
                      {pkg.sub}
                    </p>

                    {/* Price */}
                    <div className="mt-2.5 flex items-baseline gap-2">
                      <span className="font-tj-serif text-2xl sm:text-3xl font-extrabold text-stone-950">
                        ₹{pkg.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-stone-400 line-through">
                        ₹{pkg.mrp.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Cost per sachet & optional savings pill */}
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-stone-600 font-medium">
                        {pkg.perSachet}
                      </span>
                      {pkg.savingsPill && (
                        <span className="px-2 py-0.5 rounded-md bg-[#2d6a4f] text-white text-[10px] font-bold">
                          {pkg.savingsPill}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAddToCart(pkg)}
                    className="w-full py-2.5 sm:py-3 rounded-2xl bg-[#731a26] hover:bg-[#5b1420] text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer group/btn"
                  >
                    <ShoppingBag className="w-4 h-4 transition-transform group-hover/btn:-rotate-12" />
                    <span>Add to cart</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Footnote note from SVG */}
          <motion.p variants={fadeInUp} className="text-center text-xs sm:text-sm text-stone-600 mt-6 sm:mt-8 max-w-3xl mx-auto px-4">
            Cash on delivery: ₹190 extra, 3–7 days. Prepaid: ₹60 extra, 1–2 days. Savings are per sachet, compared with the 2 sachet pack.
          </motion.p>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: ORIGIN & SOURCING (Deep Forest Green + Flight Map)
      ───────────────────────────────────────────────────────────── */}
      <section
        id="origin"
        className="tj-diamonds-green text-white min-h-[100dvh] py-12 lg:py-16 flex flex-col justify-center relative overflow-hidden"
      >
        <div className="max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 w-full my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Heading, Subtext, 3 Proof Steps */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
              className="lg:col-span-6 space-y-5"
            >
              <motion.div variants={fadeInUp}>
                <p className="font-tj-serif italic text-base sm:text-lg text-[#fed000]">
                  from there to here
                </p>
                <h2 className="font-tj-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mt-1">
                  Imported <span className="text-[#fed000] italic">directly</span> from Türkiye
                </h2>
                <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed mt-2.5">
                  Every jar and sachet is brought in straight from Türkiye and delivered to your door anywhere in India. Authenticity and direct producer relationships ensure pure herbal potency.
                </p>
              </motion.div>

              {/* 3 Step Boxes */}
              <motion.div variants={staggerContainer} className="space-y-3 pt-1">
                <motion.div
                  variants={slideInLeft}
                  whileHover={{ x: 6, transition: { duration: 0.2 } }}
                  className="p-3.5 sm:p-4 rounded-2xl bg-black/25 border-2 border-dashed border-white/25 hover:border-white/50 flex items-start gap-4 transition-colors group cursor-default"
                >
                  <span className="w-8 h-8 rounded-full bg-[#fed000] text-black font-black text-sm flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110">
                    1
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-base">Direct from the source</h4>
                    <p className="text-emerald-100/80 text-xs sm:text-sm mt-0.5">
                      Direct partnership with verified Turkish producers in Istanbul & Anatolia.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  variants={slideInLeft}
                  whileHover={{ x: 6, transition: { duration: 0.2 } }}
                  className="p-3.5 sm:p-4 rounded-2xl bg-black/25 border-2 border-dashed border-white/25 hover:border-white/50 flex items-start gap-4 transition-colors group cursor-default"
                >
                  <span className="w-8 h-8 rounded-full bg-[#fed000] text-black font-black text-sm flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110">
                    2
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-base">Original product</h4>
                    <p className="text-emerald-100/80 text-xs sm:text-sm mt-0.5">
                      100% authentic Themra Epimedyumlu Macun with original holographic seal and batch certificate.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  variants={slideInLeft}
                  whileHover={{ x: 6, transition: { duration: 0.2 } }}
                  className="p-3.5 sm:p-4 rounded-2xl bg-black/25 border-2 border-dashed border-white/25 hover:border-white/50 flex items-start gap-4 transition-colors group cursor-default"
                >
                  <span className="w-8 h-8 rounded-full bg-[#fed000] text-black font-black text-sm flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110">
                    3
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-base">Tested and documented</h4>
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
              <div className="relative w-full max-w-[420px] sm:max-w-[460px] lg:max-w-[500px] xl:max-w-[520px] aspect-[600/625] rounded-[2.5rem] border-2 border-[#f5ede1]/85 bg-transparent p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl drop-shadow-2xl">
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
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="relative w-6 h-6 sm:w-7 sm:h-7 shrink-0 drop-shadow-md">
                      <Image
                        src="/tj/design-assets/turkiye-marker.svg"
                        alt="Türkiye"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="font-tj-serif text-2xl sm:text-3xl font-bold text-white tracking-wide drop-shadow-sm">
                      Türkiye
                    </span>
                  </div>

                  <div className="relative w-6 h-10 sm:w-7 sm:h-12 shrink-0 opacity-90 drop-shadow-sm">
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
                  <div className="relative w-32 sm:w-36 h-9 sm:h-10 shrink-0 drop-shadow-md hover:scale-105 transition-transform cursor-default">
                    <Image
                      src="/tj/design-assets/direct-import-pill.svg"
                      alt="Direct import"
                      fill
                      className="object-contain object-left"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <span className="font-tj-serif text-2xl sm:text-3xl font-bold text-white tracking-wide drop-shadow-sm">
                      India
                    </span>
                    <div className="relative w-6 h-6 sm:w-7 sm:h-7 shrink-0 drop-shadow-md">
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
        className="tj-diamonds-cream text-stone-900 min-h-[100dvh] py-12 lg:py-16 flex flex-col justify-center relative overflow-hidden"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
          className="max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 text-center w-full my-auto"
        >
          <motion.p variants={fadeInUp} className="font-tj-serif italic text-base sm:text-lg text-[#8e1c2e]">
            simple as one, two, three, four
          </motion.p>
          <motion.h2 variants={fadeInUp} className="font-tj-serif text-3xl sm:text-5xl font-bold tracking-tight text-stone-900 mt-1">
            How to <span className="text-[#8e1c2e] italic">use</span>
          </motion.h2>

          {/* 4 Cards Grid */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mt-8 sm:mt-12 text-center"
          >
            {/* Step 1 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="group rounded-3xl bg-white border-2 border-stone-800 shadow-[0_8px_0_0_#2b2b2b] hover:shadow-[0_16px_0_0_#2b2b2b] overflow-hidden flex flex-col justify-between transition-all duration-300"
            >
              <div className="bg-[#b9e5e9] relative w-full aspect-[1.3/1] p-4 flex items-center justify-center border-b-2 border-stone-800 overflow-hidden">
                <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-108">
                  <Image
                    src="/tj/design-assets/how-step-1.png"
                    alt="Step 1: Read the label"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="p-5 pt-0 flex flex-col items-center relative z-10">
                <span className="relative z-20 -mt-5 mb-3 w-10 h-10 rounded-full bg-[#731a26] text-white font-black text-base flex items-center justify-center shadow-md border-2 border-white transition-transform duration-300 group-hover:scale-110">
                  1
                </span>
                <h3 className="font-tj-serif text-xl font-bold text-stone-900 group-hover:text-[#731a26] transition-colors">
                  Read the label
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm mt-1">
                  Check ingredients and directions before first use.
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="group rounded-3xl bg-white border-2 border-stone-800 shadow-[0_8px_0_0_#2b2b2b] hover:shadow-[0_16px_0_0_#2b2b2b] overflow-hidden flex flex-col justify-between transition-all duration-300"
            >
              <div className="bg-[#f8bac5] relative w-full aspect-[1.3/1] p-4 flex items-center justify-center border-b-2 border-stone-800 overflow-hidden">
                <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-108">
                  <Image
                    src="/tj/design-assets/how-step-2.png"
                    alt="Step 2: After a meal"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="p-5 pt-0 flex flex-col items-center relative z-10">
                <span className="relative z-20 -mt-5 mb-3 w-10 h-10 rounded-full bg-[#731a26] text-white font-black text-base flex items-center justify-center shadow-md border-2 border-white transition-transform duration-300 group-hover:scale-110">
                  2
                </span>
                <h3 className="font-tj-serif text-xl font-bold text-stone-900 group-hover:text-[#731a26] transition-colors">
                  After a meal
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm mt-1">
                  Do not take on an empty stomach.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="group rounded-3xl bg-white border-2 border-stone-800 shadow-[0_8px_0_0_#2b2b2b] hover:shadow-[0_16px_0_0_#2b2b2b] overflow-hidden flex flex-col justify-between transition-all duration-300"
            >
              <div className="bg-[#f1a337] relative w-full aspect-[1.3/1] p-4 flex items-center justify-center border-b-2 border-stone-800 overflow-hidden">
                <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-108">
                  <Image
                    src="/tj/design-assets/how-step-3.png"
                    alt="Step 3: Stir the jar"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="p-5 pt-0 flex flex-col items-center relative z-10">
                <span className="relative z-20 -mt-5 mb-3 w-10 h-10 rounded-full bg-[#731a26] text-white font-black text-base flex items-center justify-center shadow-md border-2 border-white transition-transform duration-300 group-hover:scale-110">
                  3
                </span>
                <h3 className="font-tj-serif text-xl font-bold text-stone-900 group-hover:text-[#731a26] transition-colors">
                  Stir the jar
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm mt-1">
                  Mix well if you bought the jar. Sachets are single-serve.
                </p>
              </div>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="group rounded-3xl bg-white border-2 border-stone-800 shadow-[0_8px_0_0_#2b2b2b] hover:shadow-[0_16px_0_0_#2b2b2b] overflow-hidden flex flex-col justify-between transition-all duration-300"
            >
              <div className="bg-[#b9e5e9] relative w-full aspect-[1.3/1] p-4 flex items-center justify-center border-b-2 border-stone-800 overflow-hidden">
                <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-108">
                  <Image
                    src="/tj/design-assets/how-step-4.png"
                    alt="Step 4: One serving"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="p-5 pt-0 flex flex-col items-center relative z-10">
                <span className="relative z-20 -mt-5 mb-3 w-10 h-10 rounded-full bg-[#731a26] text-white font-black text-base flex items-center justify-center shadow-md border-2 border-white transition-transform duration-300 group-hover:scale-110">
                  4
                </span>
                <h3 className="font-tj-serif text-xl font-bold text-stone-900 group-hover:text-[#731a26] transition-colors">
                  One serving
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm mt-1">
                  One small spoon or one sachet, as the label directs.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom Warning Pill Banner */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ scale: 1.01 }}
            className="max-w-4xl mx-auto mt-8 sm:mt-10 px-2 sm:px-4 text-left cursor-default"
          >
            <div className="p-4 sm:p-5 rounded-3xl bg-[#5b1420] text-white flex items-center gap-4 shadow-lg border border-white/10">
              <div className="w-10 h-10 rounded-full bg-[#fed000] text-black font-black text-xl flex items-center justify-center shrink-0 shadow-sm animate-pulse">
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
        className="tj-diamonds-dark-wine text-white min-h-[100dvh] py-12 lg:py-16 flex flex-col justify-center relative overflow-hidden"
      >
        <div className="max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 w-full my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Side: Headline, Jar Visual, Guarantee */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
              className="lg:col-span-5 space-y-4 text-center lg:text-left"
            >
              <motion.p variants={fadeInUp} className="font-tj-serif italic text-base sm:text-lg text-[#fed000]">
                the small print, made simple
              </motion.p>
              <motion.h2 variants={fadeInUp} className="font-tj-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
                Before you <span className="text-[#fed000] italic">order</span>
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-stone-300 text-sm sm:text-base max-w-md mx-auto lg:mx-0">
                Delivery, packing and safety, explained plainly.
              </motion.p>

              {/* Jar with Dashed Ring Illustration */}
              <motion.div variants={scaleIn} className="relative w-56 sm:w-64 aspect-square mx-auto lg:mx-0 pt-3 animate-tj-float">
                <Image
                  src="/tj/design-assets/before-order-jar.png"
                  alt="Turkiye Jam Delivery"
                  fill
                  className="object-contain"
                />
              </motion.div>

              <motion.p variants={fadeInUp} className="text-xs sm:text-sm text-stone-300 italic">
                Imported from Türkiye. Delivered across India.
              </motion.p>
            </motion.div>

            {/* Right Side: Accordion Items */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={staggerContainer}
              className="lg:col-span-7 space-y-3"
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
                      className="w-full p-4 sm:p-4.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <span className="font-tj-serif text-base sm:text-lg font-bold text-[#fed000]">
                          {item.id}
                        </span>
                        <span className="font-tj-serif text-base sm:text-lg font-bold text-white">
                          {item.question}
                        </span>
                      </div>
                      <span className="w-7 h-7 rounded-full bg-[#fed000] text-black flex items-center justify-center shrink-0 ml-3 transition-transform duration-200">
                        {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </span>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.28, ease: "easeInOut" }}
                          className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-200 border-t border-white/10"
                        >
                          {item.isSpeedBox ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                              {/* Mint box for Prepaid */}
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="p-4 rounded-xl bg-[#b9e5e9] text-stone-900 border border-stone-800 shadow-sm cursor-default"
                              >
                                <h4 className="font-tj-serif font-extrabold text-lg sm:text-xl">
                                  1–2 days
                                </h4>
                                <p className="text-stone-700 font-medium text-xs sm:text-sm mt-0.5">
                                  Prepaid, ₹60 extra
                                </p>
                              </motion.div>

                              {/* Pink box for COD */}
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="p-4 rounded-xl bg-[#f8bac5] text-stone-900 border border-stone-800 shadow-sm cursor-default"
                              >
                                <h4 className="font-tj-serif font-extrabold text-lg sm:text-xl">
                                  3–7 days
                                </h4>
                                <p className="text-stone-700 font-medium text-xs sm:text-sm mt-0.5">
                                  Cash on delivery, ₹190 extra
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
        className="tj-diamonds-cream text-stone-900 min-h-[100dvh] py-12 lg:py-16 flex flex-col justify-center relative overflow-hidden"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 text-center w-full my-auto"
        >
          {/* Reviews Header */}
          <motion.p variants={fadeInUp} className="font-tj-serif italic text-base sm:text-lg text-[#8e1c2e]">
            straight from happy doorsteps across India
          </motion.p>
          <motion.h2 variants={fadeInUp} className="font-tj-serif text-3xl sm:text-5xl font-bold tracking-tight text-stone-900 mt-1">
            What our customers <span className="text-[#8e1c2e] italic">say</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-stone-600 text-xs sm:text-sm mt-1">
            Sample reviews from verified buyers across India.
          </motion.p>

          {/* 3 Review Cards */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mt-8 sm:mt-10 text-left"
          >
            {REVIEWS.map((rev) => (
              <motion.div
                key={rev.id}
                variants={fadeInUp}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="group rounded-3xl bg-white border-2 border-stone-800 shadow-[0_6px_0_0_#2b2b2b] hover:shadow-[0_12px_0_0_#2b2b2b] p-5 sm:p-6 flex flex-col justify-between transition-all duration-300"
              >
                <div>
                  {/* Stars + Quote Mark */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 stroke-stone-800" />
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
                <div className="mt-5 pt-3.5 border-t border-dashed border-stone-300">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 border border-stone-800 shadow-sm transition-transform group-hover:scale-110 ${rev.avatarBg}`}
                    >
                      {rev.initial}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-xs sm:text-sm group-hover:text-[#8e1c2e] transition-colors">{rev.name}</h4>
                      <p className="text-[11px] text-stone-500">{rev.location}</p>
                    </div>
                  </div>

                  {/* Purchase Badge */}
                  <div className="mt-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-stone-800 text-[10px] font-bold text-stone-700 bg-stone-50">
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
            className="bg-[#fab005] py-8 sm:py-12 text-stone-950 relative overflow-hidden mt-10 rounded-3xl border-2 border-stone-800 shadow-[0_8px_0_0_#2b2b2b]"
          >
            <div className="relative z-10 max-w-2xl mx-auto px-4">
              <p className="font-tj-serif italic text-base sm:text-lg text-[#5b1420] font-semibold">
                your first jar is one tap away
              </p>
              <h2 className="font-tj-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-1">
                Order Türkiye Jam today
              </h2>
              <p className="text-stone-800 text-xs sm:text-sm mt-1.5">
                All-India delivery. Choose prepaid or cash on delivery.
              </p>

              {/* Action Button */}
              <div className="mt-5">
                <a
                  href="#shop"
                  className="btn-shimmer px-8 sm:px-10 py-3 sm:py-3.5 rounded-full bg-[#5b1420] hover:bg-[#430f1b] text-white font-extrabold text-sm sm:text-base shadow-xl hover:scale-105 active:scale-95 transition-all inline-flex items-center justify-center cursor-pointer border-2 border-black/10"
                >
                  Choose your pack
                </a>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-5 text-[11px] sm:text-xs font-bold text-stone-900">
                <span className="px-3 py-1 rounded-full border border-stone-800 bg-white/40 shadow-sm">
                  Prepaid: 1–2 days
                </span>
                <span className="px-3 py-1 rounded-full border border-stone-800 bg-white/40 shadow-sm">
                  Cash on delivery: 3–7 days
                </span>
                <span className="px-3 py-1 rounded-full border border-stone-800 bg-white/40 shadow-sm">
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

      {/* ─────────────────────────────────────────────────────────────
          MOBILE BOTTOM FLOATING STICKY ACTION BAR (sm:hidden)
      ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="sm:hidden fixed bottom-3 inset-x-3 z-40"
          >
            <div className="p-2.5 rounded-2xl bg-[#5b1420]/95 backdrop-blur-md border border-white/20 shadow-2xl flex items-center justify-between gap-2 text-white">
              <div className="pl-2">
                <p className="text-[10px] text-stone-200">Turkiye Jam India</p>
                <p className="text-xs font-extrabold text-[#fed000]">From ₹899</p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="#shop"
                  className="btn-shimmer px-4 py-2 rounded-xl bg-[#fed000] text-black font-extrabold text-xs shadow-md"
                >
                  Pick Pack
                </a>
                <a
                  href="https://wa.me/916238165935?text=Hi%2C%20I%20want%20to%20order%20Turkiye%20Jam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform"
                  aria-label="Order on WhatsApp"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
