"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { TURKIYE_JAM_VARIANTS, TurkiyeJamVariant } from "@/data/zupeProducts";

// Furnexa Hero Products Carousel (Jar vs. Sachet Box)
const HERO_PRODUCTS = [
  {
    id: "tj-bottle-240g",
    name: "Themra Epimedium Macun 240g",
    subtitle: "Minimal Chic / Ottoman Herbal Macun",
    price: 2899,
    mrp: 4500,
    offerText: "2 Free Strips Included",
    src: "/tj/turkiye-jam-gallery-6.jpeg",
    tag: "Royal Glass Jar",
    hotspots: [
      {
        id: 1,
        title: "Pure Anatolian Flower Honey",
        subtitle: "100% Herbal Carrier Base",
        desc: "Synergistic botanical base ensuring rapid bio-absorption within 30–45 mins without synthetic additives.",
        top: "28%",
        left: "34%",
        direction: "left", // connecting line direction
      },
      {
        id: 2,
        title: "Epimedium Extract 0.79%",
        subtitle: "Active Icariin Formulation",
        desc: "Increases nitric oxide release and smooth pelvic blood circulation for sustained stamina and rock firmness.",
        top: "48%",
        left: "64%",
        direction: "right",
      },
      {
        id: 3,
        title: "Red Ginseng & Royal Jelly",
        subtitle: "Endurance & Vitality Blend",
        desc: "Royal energy adaptogen combating fatigue, supporting healthy hormonal balance, and accelerating recovery.",
        top: "68%",
        left: "40%",
        direction: "left",
      },
    ],
  },
  {
    id: "tj-box-12s",
    name: "Themra 12+2 Travel Strip Box",
    subtitle: "Pocket Discreet / 14 Single Servings",
    price: 2899,
    mrp: 4500,
    offerText: "12 Strips + 2 Bonus Strips",
    src: "/tj/turkiye-jam-gallery-7.jpeg",
    tag: "Discreet Travel Strips",
    hotspots: [
      {
        id: 1,
        title: "Single-Dose Sealed Sachets",
        subtitle: "Guaranteed Freshness & Purity",
        desc: "Individual 12g foil packs ready to consume anywhere with water—no spoon or refrigeration needed.",
        top: "30%",
        left: "36%",
        direction: "left",
      },
      {
        id: 2,
        title: "Active Anatolian Epimedium",
        subtitle: "Fast-Acting Male & Female Vitality",
        desc: "Delivers rapid intimate surge and enhanced sensitivity within 30 to 45 minutes of consumption.",
        top: "50%",
        left: "66%",
        direction: "right",
      },
      {
        id: 3,
        title: "Unused Strip Refund Guarantee",
        subtitle: "100% Money-Back Protection",
        desc: "Try risk-free. Return any unopened strips within 15 days for a 100% pro-rata refund to your account.",
        top: "70%",
        left: "44%",
        direction: "left",
      },
    ],
  },
];

const MARQUEE_ITEMS = [
  "FREE EXPRESS SHIPPING ACROSS KERALA",
  "50% OFF THIS WEEK",
  "100% ORIGINAL FROM TURKEY",
  "DISCREET PLAIN BOX PACKAGING",
  "LIMITED STOCK AVAILABLE",
  "MONEY BACK GUARANTEE ON UNUSED STRIPS",
  "CASH ON DELIVERY & UPI PREPAID",
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
    role: "Verified Buyer",
    location: "Kochi, Kerala",
    package: "240g Glass Jar + 2 Free Strips",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    productImg: "/tj/turkiye-jam-gallery-6.jpeg",
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

  // Carousel & Hotspot State
  const [heroProductIndex, setHeroProductIndex] = useState<number>(0);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  // Category Filter State
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedVariant, setSelectedVariant] = useState<TurkiyeJamVariant>(TURKIYE_JAM_VARIANTS[0]);

  // Review Slider State
  const [currentReviewIndex, setCurrentReviewIndex] = useState<number>(0);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Quick Order State
  const [quickPhone, setQuickPhone] = useState<string>("");
  const [quickSuccess, setQuickSuccess] = useState<boolean>(false);

  const currentHero = HERO_PRODUCTS[heroProductIndex];

  const handleNextHero = () => {
    setActiveHotspot(null);
    setHeroProductIndex((prev) => (prev + 1) % HERO_PRODUCTS.length);
  };

  const handlePrevHero = () => {
    setActiveHotspot(null);
    setHeroProductIndex((prev) => (prev - 1 + HERO_PRODUCTS.length) % HERO_PRODUCTS.length);
  };

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

  const handleQuickOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPhone.trim()) return;
    const clean = quickPhone.replace(/\D/g, "");
    const waUrl = `https://wa.me/919744122853?text=${encodeURIComponent(
      `Hi Turkiye Jam Care! I would like to order ${selectedVariant.name} (₹${selectedVariant.price}). My WhatsApp number is: ${clean}`
    )}`;
    setQuickSuccess(true);
    setTimeout(() => {
      window.open(waUrl, "_blank");
      setQuickSuccess(false);
      setQuickPhone("");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 font-sans selection:bg-[#cb0805] selection:text-white">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (FURNEXA EXACT ARCHITECTURE)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[88vh] md:min-h-[94vh] flex flex-col justify-between overflow-hidden bg-[#ebe8e3] text-stone-900">
        
        {/* Furnexa Giant Background Typography */}
        <div className="absolute inset-x-0 top-6 sm:top-10 md:top-14 flex items-center justify-center pointer-events-none select-none z-0">
          <span className="furnexa-hero-title text-[15vw] tracking-tighter text-stone-800/20 sm:text-stone-800/15">
            TURKIYE JAM
          </span>
        </div>

        {/* Ambient Top Light Beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-gradient-to-b from-white/60 to-transparent pointer-events-none blur-3xl z-0" />

        {/* Center Stage: Product Display with Pedestal & Hotspots */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-8 py-8 md:py-12">
          <div className="relative w-full max-w-4xl h-[480px] sm:h-[540px] md:h-[620px] flex items-center justify-center">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentHero.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full h-full flex items-center justify-center"
              >
                {/* Product Image */}
                <div className="relative w-[85%] sm:w-[70%] md:w-[60%] h-[80%] drop-shadow-[0_35px_45px_rgba(0,0,0,0.22)]">
                  <Image
                    src={currentHero.src}
                    alt={currentHero.name}
                    fill
                    priority
                    className="object-contain rounded-3xl"
                  />
                </div>

                {/* ─── Interactive Hotspot Pins (Furnexa Signature) ─── */}
                {currentHero.hotspots.map((hs) => {
                  const isActive = activeHotspot === hs.id;
                  const isRight = hs.direction === "right";

                  return (
                    <div
                      key={hs.id}
                      style={{ top: hs.top, left: hs.left }}
                      className="absolute z-30"
                    >
                      {/* Pulse Ring + Center Hotspot Target Button */}
                      <button
                        type="button"
                        onClick={() => setActiveHotspot(isActive ? null : hs.id)}
                        className="group relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-stone-300 hover:border-[#cb0805] hover:scale-110 transition-all cursor-pointer"
                        aria-label={`Inspect ${hs.title}`}
                      >
                        <span className="absolute inset-0 rounded-full bg-[#cb0805]/30 animate-hotspot-ping" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#cb0805] transition-transform group-hover:scale-125" />
                      </button>

                      {/* Connecting Line + Label (Furnexa Style) */}
                      <div
                        className={`hidden sm:flex items-center absolute top-1/2 -translate-y-1/2 pointer-events-none ${
                          isRight
                            ? "left-full pl-3 flex-row"
                            : "right-full pr-3 flex-row-reverse"
                        }`}
                      >
                        {/* Connecting Line */}
                        <div className="w-12 md:w-20 h-[1.5px] bg-stone-700/60" />
                        {/* Dot Anchor */}
                        <div className="w-1.5 h-1.5 rounded-full bg-stone-800" />
                        {/* Label Pill */}
                        <span className="mx-2 px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-white text-[11px] font-medium tracking-wide whitespace-nowrap shadow-md">
                          {hs.title}
                        </span>
                      </div>

                      {/* Expanding Tooltip Card on Click/Hover */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            transition={{ duration: 0.25 }}
                            className={`absolute z-40 w-64 sm:w-72 p-4 rounded-2xl bg-stone-950/95 text-white backdrop-blur-2xl border border-white/20 shadow-2xl ${
                              isRight
                                ? "left-0 mt-3 sm:left-10 sm:-top-6"
                                : "right-0 mt-3 sm:right-10 sm:-top-6"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff807e]">
                                {hs.subtitle}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveHotspot(null);
                                }}
                                className="text-stone-400 hover:text-white"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <h4 className="font-bold text-sm text-white mb-1">
                              {hs.title}
                            </h4>
                            <p className="text-xs text-stone-300 leading-relaxed">
                              {hs.desc}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ─── Bottom Bar in Hero: Product Card & Carousel Arrows ─── */}
        <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-8 pb-8 pt-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          
          {/* Furnexa Bottom-Left Floating Product Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-900/90 text-white backdrop-blur-xl border border-white/10 shadow-2xl max-w-sm w-full">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/15 text-stone-200 text-[10px] font-semibold tracking-wide uppercase mb-2">
              {currentHero.subtitle}
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-1">
              {currentHero.name}
            </h3>
            
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-black text-white">
                ₹{currentHero.price.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-stone-400 line-through">
                ₹{currentHero.mrp.toLocaleString("en-IN")}
              </span>
              <span className="text-xs font-bold text-[#ff807e] ml-1">
                ({currentHero.offerText})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = TURKIYE_JAM_VARIANTS.find((v) => v.id === currentHero.id) || selectedVariant;
                  handleBuyNow(target);
                }}
                className="flex-1 py-2.5 px-4 rounded-full bg-white text-stone-900 font-bold text-xs uppercase tracking-wider hover:bg-stone-200 transition-all active:scale-95 cursor-pointer text-center"
              >
                Shop Now
              </button>
              
              <button
                type="button"
                onClick={() => {
                  const target = TURKIYE_JAM_VARIANTS.find((v) => v.id === currentHero.id) || selectedVariant;
                  handleAddToCart(target);
                }}
                className="py-2.5 px-4 rounded-full bg-[#cb0805] hover:bg-[#a80604] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-[#cb0805]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                aria-label="Add to cart"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>
          </div>

          {/* Furnexa Bottom-Right Pill Slider Controls (←) (→) */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-xs font-medium text-stone-600 hidden sm:inline">
              {heroProductIndex + 1} / {HERO_PRODUCTS.length}
            </span>
            <div className="flex items-center gap-2 bg-stone-900/80 backdrop-blur-md p-1.5 rounded-full border border-white/10 shadow-lg">
              <button
                type="button"
                onClick={handlePrevHero}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="Previous Showcase Product"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextHero}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="Next Showcase Product"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. MARQUEE TICKER (EXACT FURNEXA POSITION)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full bg-[#151515] text-white py-4 overflow-hidden border-y border-white/10 select-none">
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
          3. SHOP BY CATEGORIES / PACKAGES (FURNEXA PEDESTAL GRID)
      ───────────────────────────────────────────────────────────── */}
      <section id="offers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-stone-900 mb-4 font-display">
            Shop by categories
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Sealed Turkish imports with guaranteed purity. Choose your ideal package below.
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

        {/* Furnexa Minimalist Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredVariants.map((variant) => {
            const isSelected = selectedVariant.id === variant.id;

            return (
              <div
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`furnexa-card group relative rounded-3xl bg-white border p-6 flex flex-col justify-between cursor-pointer transition-all ${
                  isSelected
                    ? "border-[#cb0805] shadow-xl ring-2 ring-[#cb0805]/20"
                    : "border-stone-200/80 hover:border-stone-400"
                }`}
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between mb-4">
                  {variant.badge ? (
                    <span className="px-3 py-1 rounded-full bg-[#cb0805]/10 text-[#cb0805] text-[11px] font-bold uppercase tracking-wider">
                      {variant.badge}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-[11px] font-semibold">
                      Turkish Import
                    </span>
                  )}
                  {variant.savings && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {variant.savings}
                    </span>
                  )}
                </div>

                {/* Clean Product Render on Pedestal */}
                <div className="relative w-full h-56 sm:h-64 my-2 flex items-center justify-center">
                  <div className="relative w-4/5 h-full transition-transform duration-500 group-hover:scale-105 drop-shadow-lg">
                    <Image
                      src={variant.image}
                      alt={variant.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Product Info & Actions */}
                <div className="pt-4 border-t border-stone-100">
                  <h3 className="font-extrabold text-base sm:text-lg text-stone-900 mb-1 group-hover:text-[#cb0805] transition-colors">
                    {variant.name}
                  </h3>
                  
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-black text-stone-900">
                      ₹{variant.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-stone-400 line-through">
                      ₹{variant.mrp.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(variant);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5"
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
                      className="py-2.5 px-4 rounded-full bg-[#cb0805] hover:bg-[#a80604] text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
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
          5. EDITORIAL BRAND STORY (FURNEXA ASYMMETRIC LAYOUT)
      ───────────────────────────────────────────────────────────── */}
      <section id="story" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
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
                <span>OUR PACKAGES</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-[#cb0805]" />
              </a>
            </div>
          </div>

          {/* Dual Visual Feature Cards (For Men & For Women) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* For Men Card */}
            <div className="rounded-3xl bg-white border border-stone-200/80 p-6 flex flex-col justify-between furnexa-card">
              <div>
                <div className="relative w-full h-52 mb-5 rounded-2xl overflow-hidden bg-stone-100">
                  <Image
                    src="/tj/turkiye-jam-gallery-7.jpeg"
                    alt="Turkiye Jam For Men"
                    fill
                    className="object-cover"
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
                className="w-full py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Select Package
              </button>
            </div>

            {/* For Women Card */}
            <div className="rounded-3xl bg-white border border-stone-200/80 p-6 flex flex-col justify-between furnexa-card">
              <div>
                <div className="relative w-full h-52 mb-5 rounded-2xl overflow-hidden bg-stone-100">
                  <Image
                    src="/tj/turkiye-jam-gallery-5.jpeg"
                    alt="Turkiye Jam For Women"
                    fill
                    className="object-cover"
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
                className="w-full py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Select Package
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. "TRUSTED BY COUPLES" (FURNEXA DARK SPOTLIGHT TESTIMONIAL)
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

          {/* Furnexa Spotlight Card with Giant Quote & Product Thumbnail */}
          <div className="relative rounded-3xl bg-stone-900/60 backdrop-blur-2xl border border-white/10 p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
            
            <div className="flex-1 space-y-6">
              {/* Quote Mark */}
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
              {currentReviewIndex + 1} / {SPOTLIGHT_REVIEWS.length}
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
          7. HOW TO USE (FURNEXA 3-STEP CLEAN TIMELINE)
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
          8. FOLLOW @TURKIYEJAM (FURNEXA 5-PHOTO COMMUNITY SHOWCASE)
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
          9. FAQ ACCORDION
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
          10. STICKY MOBILE BOTTOM BAR
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
