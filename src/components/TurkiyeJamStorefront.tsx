"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Sparkles,
  Phone,
  Star,
  ChevronDown,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Heart,
  Leaf,
  Award,
  Package,
  MessageCircle,
  HelpCircle,
  Flame,
  Check,
  X,
  Plus,
  Lock,
  RotateCcw,
  Clock,
  Layers,
  Zap,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { TURKIYE_JAM_VARIANTS, TurkiyeJamVariant } from "@/data/zupeProducts";

// Authentic Marketing Campaign Posters for Her & Him
const HERO_PRODUCTS = [
  {
    id: "tj-bottle-240g-her",
    variantId: "tj-bottle-240g",
    name: "Themra Epimedium Macun 240g",
    subtitle: "For Her • Women's Intimate Sensitivity",
    targetLabel: "For Her (വനിതകൾക്ക്)",
    tag: "Women's Edition",
    badge: "100% Botanical for Her",
    price: 2899,
    mrp: 4500,
    offerText: "2 Free Strips Included",
    servings: "Approx. 25–30 Doses",
    src: "/tj/turkiye-jam-model-female.jpeg",
    hotspots: [
      {
        id: 1,
        title: "Pure Anatolian Flower Honey",
        subtitle: "100% Herbal Carrier Base",
        desc: "Wild Turkish floral honey ensures rapid bio-absorption within 30–45 mins without synthetic fillers or stomach discomfort.",
        top: "48%",
        left: "68%",
        direction: "left",
      },
      {
        id: 2,
        title: "Epimedium Extract 0.79%",
        subtitle: "Active Icariin for Women",
        desc: "Promotes healthy pelvic blood circulation, stimulates natural lubrication, and heightens climax sensitivity.",
        top: "58%",
        left: "68%",
        direction: "left",
      },
      {
        id: 3,
        title: "Royal Jelly & Ginseng",
        subtitle: "Hormonal Balance & Drive",
        desc: "Adaptogenic Turkish botanical blend combating everyday exhaustion and awakening spontaneous intimate desire.",
        top: "68%",
        left: "68%",
        direction: "left",
      },
    ],
  },
  {
    id: "tj-bottle-240g-him",
    variantId: "tj-bottle-240g",
    name: "Themra Epimedium Macun 240g",
    subtitle: "For Him • Men's Sustained Stamina",
    targetLabel: "For Him (പുരുഷന്മാർക്ക്)",
    tag: "Men's Edition",
    badge: "Bioactive Icariin 48h Action",
    price: 2899,
    mrp: 4500,
    offerText: "2 Free Strips Included",
    servings: "Approx. 25–30 Doses",
    src: "/tj/turkiye-jam-model-male.jpeg",
    hotspots: [
      {
        id: 1,
        title: "Active Icariin 0.79%",
        subtitle: "Nitric Oxide Catalyst",
        desc: "Inhibits PDE-5 naturally to relax arterial walls, maximizing blood flow for rock-solid firmness and prolonged stamina.",
        top: "44%",
        left: "66%",
        direction: "left",
      },
      {
        id: 2,
        title: "Panax Red Ginseng",
        subtitle: "Endurance & Recovery",
        desc: "Revered adaptogen supporting sustained endurance and significantly accelerating recovery time between intimate sessions.",
        top: "54%",
        left: "66%",
        direction: "left",
      },
      {
        id: 3,
        title: "Pure Honey & Royal Jelly",
        subtitle: "48-Hour Vitality Surge",
        desc: "Natural cellular fuel sustaining energy and confidence for up to 48 hours without synthetic chemicals or jitters.",
        top: "65%",
        left: "66%",
        direction: "left",
      },
    ],
  },
];

const MARQUEE_ITEMS = [
  "FREE EXPRESS SHIPPING ACROSS KERALA",
  "50% OFF THIS WEEK",
  "100% ORIGINAL IMPORT FROM TURKEY",
  "DISCREET PLAIN BOX PACKAGING",
  "LIMITED STOCK AVAILABLE",
  "MONEY BACK GUARANTEE ON UNUSED STRIPS",
  "CASH ON DELIVERY & UPI PREPAID",
];

// Skateshop-Style Detailed Package Information
const PACKAGE_DETAILS: Record<string, { doses: string; includes: string; badgeType: string }> = {
  "tj-bottle-240g": {
    doses: "25–30 Doses",
    includes: "1x 240g Glass Jar + 2x Free Single Sachets",
    badgeType: "Bestseller",
  },
  "tj-box-12s": {
    doses: "14 Doses",
    includes: "1x Box of 12 Sachets + 2x Bonus Sachets (14 Total)",
    badgeType: "Best Value",
  },
  "tj-strips-6": {
    doses: "6 Doses",
    includes: "6x Individually Sealed 12g Sachet Strips",
    badgeType: "Popular",
  },
  "tj-strips-4": {
    doses: "4 Doses",
    includes: "4x Individually Sealed 12g Sachet Strips",
    badgeType: "Standard",
  },
  "tj-strips-3": {
    doses: "3 Doses",
    includes: "3x Individually Sealed 12g Sachet Strips",
    badgeType: "Starter",
  },
  "tj-strips-2": {
    doses: "2 Doses",
    includes: "2x Individually Sealed 12g Sachet Strips",
    badgeType: "Trial Pack",
  },
};

// Anatolian Ingredient Science Bento
const INGREDIENTS_BENTO = [
  {
    icon: Flame,
    title: "Epimedium (0.79% Icariin)",
    tag: "Bioactive Nitric Oxide Catalyst",
    desc: "Revered in Anatolian herbal medicine. Bioactive Icariin inhibits PDE-5 naturally to stimulate nitric oxide release, relaxing arterial walls for sustained pelvic blood flow, rock-solid endurance, and heightened sensitivity.",
    color: "text-[#cb0805]",
    bg: "bg-[#cb0805]/5 border-[#cb0805]/20",
  },
  {
    icon: Leaf,
    title: "Pure Anatolian Flower Honey",
    tag: "Natural Bio-Carrier Base",
    desc: "Wild harvested Turkish floral honey acts as an active synergistic carrier, accelerating compound absorption into the bloodstream within 30 to 45 minutes without upsetting digestive balance.",
    color: "text-amber-500",
    bg: "bg-amber-500/5 border-amber-500/20",
  },
  {
    icon: Zap,
    title: "Panax Red Ginseng & Maca",
    tag: "Endurance & Recovery Adaptogen",
    desc: "Premium grade Ginsenosides combat physical fatigue, reduce performance anxiety, and significantly accelerate recovery time between intimate sessions for both partners.",
    color: "text-emerald-600",
    bg: "bg-emerald-500/5 border-emerald-500/20",
  },
  {
    icon: Sparkles,
    title: "Royal Jelly & Bee Pollen",
    tag: "Cellular Vitality & Hormonal Balance",
    desc: "Rich in amino acids, vitamin B-complex, and trace minerals to naturally elevate libido, boost stamina, and sustain vibrant physical energy for up to 48 hours.",
    color: "text-rose-500",
    bg: "bg-rose-500/5 border-rose-500/20",
  },
];

const FAQS = [
  {
    q: "What is Themra Epimedium Herbal Macun (Turkiye Jam)?",
    a: "Themra Epimedium Herbal Macun is an authentic Turkish botanical vitality paste crafted with Epimedium (Horny Goat Weed), Pure Flower Honey, Royal Jelly, Red Ginseng, Maca Root, and traditional aphrodisiac spices. It has been used for generations to revitalize stamina, boost energy, and enhance intimate performance naturally.",
  },
  {
    q: "How does it work for both men and women?",
    a: "In men, bioactive Icariin from Epimedium enhances peripheral blood circulation, supports healthy erectile firmness, and extends stamina while facilitating faster recovery. In women, it naturally stimulates pelvic blood flow, heightens sensitivity in intimate zones, and enhances libido and climax quality.",
  },
  {
    q: "How long do the effects last and how do I consume it?",
    a: "Take half a teaspoon (or 1 single-dose sachet strip) approximately 30 to 45 minutes prior to intimate activity. Stir the jar well before consuming. The natural vitality, endurance, and stamina remain active in your body for 24 to 48 hours.",
  },
  {
    q: "How does the Unused Strip Refund Guarantee work?",
    a: "We want you to order with complete confidence. If you purchase any of our sachet strip packs and are not satisfied with your experience, simply mail back the remaining unopened sachets within 15 days. We will promptly issue a 100% pro-rata refund for the returned strips to your UPI or bank account.",
  },
  {
    q: "Is the packaging 100% discreet?",
    a: "Yes, absolutely. Your order is dispatched in an opaque, unbranded corrugated box with no product descriptions, logos, or sensitive terms anywhere on the exterior. Only your delivery address and tracking barcode appear on the shipping label.",
  },
  {
    q: "What are the shipping timelines across Kerala and India?",
    a: "Prepaid orders receive priority express courier dispatch (1–2 business days across Kerala and major metros). Cash on Delivery (COD) orders are delivered via verified surface courier within 3–7 business days.",
  },
];

const SPOTLIGHT_REVIEWS = [
  {
    id: 1,
    quote:
      "Our intimate wellness finally feels energized and inspiring. Themra Macun delivers smooth, sustained vitality without any headaches or jittery chemical side effects. Highly recommended.",
    name: "Dr. Rahul M.",
    role: "Verified Doctor & Buyer",
    location: "Kochi, Kerala",
    package: "240g Glass Jar + 2 Free Strips",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    productImg: "/tj/turkiye-jam-gallery-6.jpeg",
    stars: 5,
  },
  {
    id: 2,
    quote:
      "Ordered the 14-sachet box. We both tried it together and the mutual intimate experience was truly incredible. Discrete plain packaging arrived in Kozhikode in less than 24 hours.",
    name: "Anas & Fathima",
    role: "Verified Couple",
    location: "Kozhikode, Kerala",
    package: "14-Sachet Travel Box",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    productImg: "/tj/turkiye-jam-gallery-7.jpeg",
    stars: 5,
  },
  {
    id: 3,
    quote:
      "I was skeptical about herbal products until I tried the 4-strip pack. The endurance difference is night and day. Re-ordered the 240g jar today. 100% original Themra product.",
    name: "Vignesh K.",
    role: "Verified Buyer",
    location: "Trivandrum, Kerala",
    package: "240g Royal Glass Jar",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    productImg: "/tj/turkiye-jam-gallery-6.jpeg",
    stars: 5,
  },
];

const INSTAGRAM_SHOWCASE = [
  { src: "/tj/turkiye-jam-gallery-1.jpeg", alt: "Turkiye Jam Unboxing & Authenticity Seal" },
  { src: "/tj/turkiye-jam-gallery-2.jpeg", alt: "100% Natural Turkish Botanicals" },
  { src: "/tj/turkiye-jam-gallery-3.jpeg", alt: "Themra Macun 240g Jar & Sachet Strips" },
  { src: "/tj/turkiye-jam-gallery-4.jpeg", alt: "Discreet Plain Box Packaging" },
  { src: "/tj/turkiye-jam-gallery-5.jpeg", alt: "Couples Intimacy & Vitality" },
];

export function TurkiyeJamStorefront() {
  const router = useRouter();
  const { addItem, openCart } = useCart();

  // Category Filter State
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedVariant, setSelectedVariant] = useState<TurkiyeJamVariant>(TURKIYE_JAM_VARIANTS[0]);

  // Review Slider State
  const [currentReviewIndex, setCurrentReviewIndex] = useState<number>(0);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleAddToCart = (variant: TurkiyeJamVariant = selectedVariant) => {
    addItem(
      {
        id: `turkiye-jam-${variant.id}`,
        name: `Turkiye Jam (${variant.name})`,
        category: "Vitality & Wellness",
        price: variant.price,
        original_price: variant.mrp,
        mrp: variant.mrp,
        poster_image: variant.image,
        color: variant.name,
      },
      1
    );
    openCart();
  };

  const handleBuyNow = (variant: TurkiyeJamVariant = selectedVariant) => {
    addItem(
      {
        id: `turkiye-jam-${variant.id}`,
        name: `Turkiye Jam (${variant.name})`,
        category: "Vitality & Wellness",
        price: variant.price,
        original_price: variant.mrp,
        mrp: variant.mrp,
        poster_image: variant.image,
        color: variant.name,
      },
      1
    );
    router.push("/checkout");
  };

  const filteredVariants = TURKIYE_JAM_VARIANTS.filter((v) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "bottles") return v.id.includes("bottle");
    if (activeCategory === "strips") return v.id.includes("strip") || v.id.includes("box");
    if (activeCategory === "combos") return v.id.includes("240g") || v.id.includes("12s");
    return true;
  });

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 font-sans selection:bg-[#cb0805] selection:text-white">
      
      {/* ─────────────────────────────────────────────────────────────
          1. FULL-SCREEN HERO SECTION (PURE IMAGE + ADD TO CART ONLY)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full h-screen min-h-[620px] flex flex-col justify-end overflow-hidden bg-[#fabf00] text-stone-900 select-none pb-20 sm:pb-12">
        
        {/* Full-Screen Edge-to-Edge Campaign Image (Static Male Model Poster) */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <Image
            src="/tj/turkiye-jam-model-male.jpeg"
            alt="Turkiye Jam Themra Epimedium Macun 240g"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* Bottom Floating Bar: ONLY "Add to Cart" Button */}
        <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-8 pb-20 sm:pb-12 flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => {
              const target = TURKIYE_JAM_VARIANTS.find((v) => v.id === "tj-bottle-240g") || selectedVariant;
              handleAddToCart(target);
            }}
            className="group px-8 sm:px-10 py-4 sm:py-4.5 rounded-full bg-[#cb0805] hover:bg-[#a80604] text-white font-black text-sm sm:text-base uppercase tracking-wider shadow-[0_20px_50px_rgba(203,8,5,0.45)] hover:shadow-[0_25px_60px_rgba(203,8,5,0.6)] flex items-center gap-3 transition-all cursor-pointer border border-white/20"
            aria-label="Add to Cart"
          >
            <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span>Add to Cart</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            <span className="text-white/90 font-extrabold">₹2,899</span>
            <span className="text-xs font-bold text-amber-200 hidden sm:inline">(+2 Free Strips)</span>
          </motion.button>
        </div>

      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. MARQUEE TICKER (DARK HIGH-CONTRAST)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full bg-[#121214] text-white py-4 overflow-hidden border-y border-white/10 select-none">
        <div className="flex animate-marquee whitespace-nowrap">
          {[0, 1].map((setIndex) => (
            <div
              key={setIndex}
              className="flex items-center gap-10 sm:gap-16 pr-10 sm:pr-16 shrink-0 text-xs sm:text-sm font-semibold tracking-wider uppercase"
              aria-hidden={setIndex === 1}
            >
              {MARQUEE_ITEMS.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span>{item}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#cb0805]" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. SHOP BY PACKAGES (SKATESHOP ARCHITECTURAL PRECISION)
      ───────────────────────────────────────────────────────────── */}
      <section id="offers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#cb0805]">
            Direct Import Packages
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-stone-900 mt-2 mb-4 font-display">
            Select Your Package
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Sealed Turkish imports with tamper-proof packaging and 15-day unused strip refund guarantee.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {[
              { id: "all", label: "All Packages" },
              { id: "bottles", label: "Royal Jars" },
              { id: "strips", label: "Travel Strips" },
              { id: "combos", label: "Value Boxes" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === tab.id
                    ? "bg-stone-900 text-white shadow-md"
                    : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Skateshop-Style High-Precision Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredVariants.map((variant) => {
            const isSelected = selectedVariant.id === variant.id;
            const details = PACKAGE_DETAILS[variant.id] || {
              doses: "Multi-dose",
              includes: variant.badge || "Standard Sealed Pack",
              badgeType: "Original Import",
            };

            return (
              <div
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`furnexa-card group relative rounded-3xl bg-white border p-6 sm:p-7 flex flex-col justify-between cursor-pointer transition-all ${
                  isSelected
                    ? "border-[#cb0805] shadow-xl ring-2 ring-[#cb0805]/20"
                    : "border-stone-200/90 hover:border-stone-900"
                }`}
              >
                {/* Card Top: Badges & Savings */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-stone-900 text-white text-[11px] font-bold uppercase tracking-wider">
                      {variant.badge || details.badgeType}
                    </span>
                    {variant.savings && (
                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                        {variant.savings}
                      </span>
                    )}
                  </div>

                  {/* Clean Product Render on Pedestal */}
                  <div className="relative w-full h-56 sm:h-64 my-3 flex items-center justify-center">
                    <div className="relative w-4/5 h-full transition-transform duration-500 group-hover:scale-105 drop-shadow-md">
                      <Image
                        src={variant.image}
                        alt={variant.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* Title & Package Contents Breakdown */}
                  <h3 className="font-extrabold text-lg text-stone-900 mb-1 group-hover:text-[#cb0805] transition-colors">
                    {variant.name}
                  </h3>

                  <div className="space-y-1 mb-4 text-xs text-stone-500">
                    <p className="flex items-center gap-1.5 font-medium text-stone-700">
                      <Clock className="w-3.5 h-3.5 text-[#cb0805]" />
                      <span>{details.doses}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-stone-400" />
                      <span>{details.includes}</span>
                    </p>
                  </div>
                </div>

                {/* Pricing & Skateshop Dual Action Buttons */}
                <div className="pt-4 border-t border-stone-100">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl sm:text-3xl font-black text-stone-900">
                      ₹{variant.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-stone-400 line-through">
                      ₹{variant.mrp.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 ml-auto">
                      Free Kerala Express
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(variant);
                      }}
                      className="flex-1 py-3 px-4 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuyNow(variant);
                      }}
                      className="flex-1 py-3 px-4 rounded-full bg-[#cb0805] hover:bg-[#a80604] text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95 text-center shadow-md shadow-[#cb0805]/20"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. FURNEXA ICONIC STATEMENT TYPOGRAPHY WITH INSET ICONS
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-stone-200 py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          
          <span className="inline-block px-3.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-600 text-xs font-bold uppercase tracking-widest">
            Why Themra Epimedium
          </span>

          <p className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900 leading-snug sm:leading-tight">
            Experience timeless vitality,{" "}
            <span className="inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-full border border-stone-200 bg-stone-50 text-stone-900 align-middle mx-1 shadow-sm">
              <Leaf className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-600" />
            </span>{" "}
            exceptional stamina, and{" "}
            <span className="inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-full border border-stone-200 bg-stone-50 text-stone-900 align-middle mx-1 shadow-sm">
              <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-amber-500" />
            </span>{" "}
            pure botanical potency crafted to elevate intimate passion. Each{" "}
            <span className="inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-full border border-stone-200 bg-stone-50 text-stone-900 align-middle mx-1 shadow-sm">
              <ShieldCheck className="w-5 h-5 sm:w-7 sm:h-7 text-[#cb0805]" />
            </span>{" "}
            spoonful is thoughtfully blended to ignite lasting energy{" "}
            <span className="inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-full border border-stone-200 bg-stone-50 text-stone-900 align-middle mx-1 shadow-sm">
              <Heart className="w-5 h-5 sm:w-7 sm:h-7 text-rose-500" />
            </span>
            .
          </p>

          {/* 3 Bold Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-10 border-t border-stone-100">
            <div>
              <span className="block font-display text-4xl sm:text-5xl font-black text-stone-900 mb-1">
                100%
              </span>
              <p className="text-xs sm:text-sm text-stone-600 font-medium">
                Certified Turkish Import with Pure Botanical Code
              </p>
            </div>
            <div>
              <span className="block font-display text-4xl sm:text-5xl font-black text-stone-900 mb-1">
                24h
              </span>
              <p className="text-xs sm:text-sm text-stone-600 font-medium">
                Express Delivery Across Kerala & Metros
              </p>
            </div>
            <div>
              <span className="block font-display text-4xl sm:text-5xl font-black text-stone-900 mb-1">
                50K+
              </span>
              <p className="text-xs sm:text-sm text-stone-600 font-medium">
                Couples Trusting Our Unused Strip Refund Guarantee
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. ANATOLIAN BOTANICAL SCIENCE BENTO GRID
      ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#cb0805]">
            Clinical Formulation
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-stone-900 mt-2">
            The Science of Anatolian Potency
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-3">
            Synergistic natural compounds blended to deliver sustained blood circulation, physical stamina, and mutual desire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {INGREDIENTS_BENTO.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="furnexa-card rounded-3xl bg-white border border-stone-200/90 p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${item.bg}`}>
                      <Icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                        {item.tag}
                      </span>
                      <h3 className="font-extrabold text-xl text-stone-900">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. EDITORIAL BRAND STORY (FOR HIM & FOR HER)
      ───────────────────────────────────────────────────────────── */}
      <section id="story" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 border-t border-stone-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#cb0805]">
              Authentic Ottoman Heritage
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-stone-900 leading-tight">
              Formulated to transform intimate wellness, one moment, one feeling at a time.
            </h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              Crafted in Turkey following centuries-old Anatolian herbal traditions, Themra Epimedium Macun combines Epimedium, Ginseng, Royal Jelly, and Pure Anatolian Flower Honey to ignite vital energy naturally for both partners.
            </p>

            <div className="pt-2">
              <a
                href="#offers"
                className="inline-flex items-center gap-2 text-sm font-bold text-stone-900 hover:text-[#cb0805] transition-colors group"
              >
                <span>EXPLORE PACKAGES</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-[#cb0805]" />
              </a>
            </div>
          </div>

          {/* Dual Visual Feature Cards (For Men & For Women) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* For Men Card */}
            <div className="rounded-3xl bg-white border border-stone-200/80 p-6 flex flex-col justify-between furnexa-card">
              <div>
                <div className="relative w-full h-56 mb-5 rounded-2xl overflow-hidden bg-stone-100 shadow-sm">
                  <Image
                    src="/tj/turkiye-jam-model-male.jpeg"
                    alt="Turkiye Jam For Men - Sustained Stamina"
                    fill
                    className="object-cover object-top hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-stone-950/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                    For Him
                  </span>
                </div>
                <h3 className="font-extrabold text-lg text-stone-900 mb-2">
                  Rock-Solid Stamina & Power
                </h3>
                <ul className="space-y-2 text-xs text-stone-600 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Increases nitric oxide & firm blood flow</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Reduces mental fatigue and intimate anxiety</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Active stamina sustained for 24–48 hours</span>
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => handleBuyNow()}
                className="w-full py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Select Package
              </button>
            </div>

            {/* For Women Card */}
            <div className="rounded-3xl bg-white border border-stone-200/80 p-6 flex flex-col justify-between furnexa-card">
              <div>
                <div className="relative w-full h-56 mb-5 rounded-2xl overflow-hidden bg-stone-100 shadow-sm">
                  <Image
                    src="/tj/turkiye-jam-model-female.jpeg"
                    alt="Turkiye Jam For Women - Sensation & Libido"
                    fill
                    className="object-cover object-top hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-stone-950/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                    For Her
                  </span>
                </div>
                <h3 className="font-extrabold text-lg text-stone-900 mb-2">
                  Heightened Sensation & Libido
                </h3>
                <ul className="space-y-2 text-xs text-stone-600 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Stimulates estrogenic blood circulation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Enhances natural lubrication & intimate desire</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Deepens mutual climactic intensity</span>
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => handleBuyNow()}
                className="w-full py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Select Package
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. "TRUSTED BY COUPLES" (DARK SPOTLIGHT TESTIMONIAL)
      ───────────────────────────────────────────────────────────── */}
      <section id="reviews" className="relative w-full bg-[#0a0a0c] text-white py-24 sm:py-32 overflow-hidden">
        
        {/* Ambient Dark Spotlight Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#cb0805]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#ff807e]">
              Customer Experiences
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white mt-2">
              Trusted by Couples
            </h2>
          </div>

          {/* Spotlight Card with Giant Quote & Product Thumbnail */}
          <div className="relative rounded-3xl bg-stone-900/60 backdrop-blur-2xl border border-white/10 p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
            
            <div className="flex-1 space-y-6">
              <span className="text-6xl sm:text-7xl font-serif text-[#cb0805] leading-none block -mb-4">
                “
              </span>

              <p className="font-display text-xl sm:text-2xl md:text-3xl font-medium text-stone-100 leading-relaxed">
                {SPOTLIGHT_REVIEWS[currentReviewIndex].quote}
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/20">
                  <Image
                    src={SPOTLIGHT_REVIEWS[currentReviewIndex].avatar}
                    alt={SPOTLIGHT_REVIEWS[currentReviewIndex].name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {SPOTLIGHT_REVIEWS[currentReviewIndex].name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <span>{SPOTLIGHT_REVIEWS[currentReviewIndex].location}</span>
                    <span>•</span>
                    <span className="text-[#ff807e] font-semibold">
                      {SPOTLIGHT_REVIEWS[currentReviewIndex].package}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Thumbnail on Right */}
            <div className="relative w-44 sm:w-56 h-44 sm:h-56 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-4 shrink-0">
              <div className="relative w-full h-full drop-shadow-xl">
                <Image
                  src={SPOTLIGHT_REVIEWS[currentReviewIndex].productImg}
                  alt="Review Product"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

          </div>

          {/* Testimonial Arrow Controls */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              type="button"
              onClick={() =>
                setCurrentReviewIndex((prev) =>
                  prev === 0 ? SPOTLIGHT_REVIEWS.length - 1 : prev - 1
                )
              }
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
              aria-label="Previous Review"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-stone-400 px-2">
              0{currentReviewIndex + 1} / 0{SPOTLIGHT_REVIEWS.length}
            </span>
            <button
              type="button"
              onClick={() =>
                setCurrentReviewIndex((prev) => (prev + 1) % SPOTLIGHT_REVIEWS.length)
              }
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
              aria-label="Next Review"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. HOW TO CONSUME (FURNEXA 3-STEP CLEAN TIMELINE)
      ───────────────────────────────────────────────────────────── */}
      <section id="usage" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#cb0805]">
            Simple Dosage
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-stone-900 mt-2">
            How to Consume
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Stir or Squeeze",
              desc: "For the 240g Jar: Stir well from bottom to top with a dry wooden or plastic spoon. For Sachet Strips: Squeeze the full 12g pack directly into mouth.",
            },
            {
              step: "02",
              title: "Timing & Hydration",
              desc: "Consume half a teaspoon (approx 8-12g) 30 to 45 minutes before intimate activity. Drink 1–2 glasses of lukewarm water right after.",
            },
            {
              step: "03",
              title: "24–48 Hour Action",
              desc: "Enjoy sustained vitality, enhanced circulation, and rapid recovery. Effects naturally remain active in your system for up to 48 hours.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-white border border-stone-200 p-8 furnexa-card relative"
            >
              <span className="font-display text-4xl sm:text-5xl font-black text-stone-200 block mb-4">
                {item.step}
              </span>
              <h3 className="text-lg font-extrabold text-stone-900 mb-2">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. FOLLOW @TURKIYEJAM (5-PHOTO COMMUNITY SHOWCASE)
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-stone-100 border-t border-stone-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Follow @turkiyejam
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {INSTAGRAM_SHOWCASE.map((item, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-2xl overflow-hidden bg-stone-200 group"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                  <span>View Details</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. FAQ ACCORDION
      ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#cb0805]">
            Got Questions?
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mt-2">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;

            return (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-stone-200/90 overflow-hidden shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-stone-900 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-500 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#cb0805]" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 sm:px-6 pb-5 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          11. STICKY MOBILE BOTTOM BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-3 inset-x-3 z-40">
        <div className="bg-stone-900/95 text-white backdrop-blur-2xl border border-white/15 rounded-full px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-stone-400 truncate">
              {selectedVariant.name}
            </span>
            <span className="text-sm font-black text-white">
              ₹{selectedVariant.price.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleAddToCart(selectedVariant)}
              className="py-2 px-3 rounded-full bg-white/15 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>

            <button
              type="button"
              onClick={() => handleBuyNow(selectedVariant)}
              className="py-2 px-4 rounded-full bg-[#cb0805] hover:bg-[#a80604] text-white font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
