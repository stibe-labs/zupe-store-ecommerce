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
  Clock,
  Sparkles,
  Phone,
  AlertTriangle,
  RotateCcw,
  Star,
  ChevronDown,
  ShoppingBag,
  CreditCard,
  Gift,
  Check,
  ArrowRight,
  Lock,
  Heart,
  Leaf,
  Award,
  Package,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { TURKIYE_JAM_VARIANTS, TurkiyeJamVariant, DEFAULT_PRODUCTS } from "@/data/zupeProducts";

const HERO_GALLERY = [
  {
    src: "/tj/turkiye-jam-gallery-6.jpeg",
    title: "Themra 240g Jar & 14-Sachet Box on Marble Pedestal",
    label: "Marble Pedestal Collection",
  },
  {
    src: "/products/turkiye-jam/turkiye-jam-jar-and-box.jpg",
    title: "240g Glass Jar & Sachet Strips",
    label: "240g Jar & Strips",
  },
  {
    src: "/products/turkiye-jam/turkiye-jam-box-strips.jpg",
    title: "14-Sachet Sealed Box",
    label: "14-Sachet Box",
  },
  {
    src: "/tj/turkiye-jam-gallery-7.jpeg",
    title: "Endurance & Stamina for Men",
    label: "Vitality for Men",
  },
  {
    src: "/tj/turkiye-jam-gallery-5.jpeg",
    title: "Energy & Sensitivity for Women",
    label: "Vitality for Women",
  },
  {
    src: "/tj/turkiye-jam-gallery-3.jpeg",
    title: "Botanical Herbal Macun Display",
    label: "Pure Botanical Macun",
  },
];

const FAQS = [
  {
    q: "What is Themra Epimedium Herbal Macun (Turkiye Jam)?",
    a: "Themra Epimedium Herbal Macun is a revered Turkish botanical paste formulated with Epimedium (Horny Goat Weed), Pure Flower Honey, Royal Jelly, Red Ginseng, Maca Root, and natural aphrodisiac spices. It has been used traditionally for generations to revitalize stamina, boost energy, and enhance intimate performance naturally.",
  },
  {
    q: "How does it work for both men and women?",
    a: "In men, the bioactive Icariin from Epimedium enhances peripheral blood circulation, supports healthy erectile firmness, and extends stamina while facilitating faster recovery between intimate sessions. In women, it naturally stimulates estrogenic blood flow, heightens sensitivity in intimate zones, and enhances libido and climax quality.",
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

const TESTIMONIALS = [
  {
    name: "Dr. Rahul M.",
    location: "Kochi, Kerala",
    verified: "Verified Buyer",
    rating: 5,
    text: "The authentic Turkish formulation is remarkable. As someone who values botanical remedies, Themra Macun delivers smooth, sustained vitality without the headaches or jitters of chemical stimulants.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
    package: "240g Jar + 2 Free Strips",
  },
  {
    name: "Anas & Fathima",
    location: "Kozhikode, Kerala",
    verified: "Verified Couple",
    rating: 5,
    text: "Ordered the 14-sachet box. We both tried it together and the mutual intimate experience was truly incredible. Discrete plain packaging arrived in Kozhikode in less than 24 hours.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
    package: "14-Sachet Box",
  },
  {
    name: "Vignesh K.",
    location: "Trivandrum, Kerala",
    verified: "Verified Buyer",
    rating: 5,
    text: "I was skeptical about herbal products until I tried the 4-strip pack. The endurance difference is night and day. Re-ordered the 240g jar today. 100% original Themra product.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
    package: "240g Jar",
  },
];

export function TurkiyeJamStorefront() {
  const router = useRouter();
  const { addItem, openCart } = useCart();

  const [selectedVariant, setSelectedVariant] = useState<TurkiyeJamVariant>(TURKIYE_JAM_VARIANTS[0]);
  const [activeHeroImageIndex, setActiveHeroImageIndex] = useState<number>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeTestimonial, setActiveTestimonial] = useState<number>(0);
  const [quickOrderPhone, setQuickOrderPhone] = useState<string>("");
  const [quickOrderSuccess, setQuickOrderSuccess] = useState<boolean>(false);

  const activeImage = HERO_GALLERY[activeHeroImageIndex]?.src || selectedVariant.image;

  const handleSelectVariant = (variant: TurkiyeJamVariant) => {
    setSelectedVariant(variant);
    // If the variant matches a specific image, switch gallery index
    if (variant.id === "tj-bottle-240g") setActiveHeroImageIndex(0);
    else if (variant.id === "tj-box-12s") setActiveHeroImageIndex(1);
    else if (variant.id === "tj-strips-6") setActiveHeroImageIndex(2);
    else if (variant.id === "tj-strips-4") setActiveHeroImageIndex(3);
  };

  const handleAddToCart = () => {
    addItem(
      {
        id: `turkiye-jam-${selectedVariant.id}`,
        name: `Turkiye Jam (${selectedVariant.name})`,
        category: "Vitality & Wellness",
        price: selectedVariant.price,
        original_price: selectedVariant.mrp,
        mrp: selectedVariant.mrp,
        poster_image: selectedVariant.image,
        color: selectedVariant.name,
      },
      1
    );
    openCart();
  };

  const handleBuyNow = () => {
    addItem(
      {
        id: `turkiye-jam-${selectedVariant.id}`,
        name: `Turkiye Jam (${selectedVariant.name})`,
        category: "Vitality & Wellness",
        price: selectedVariant.price,
        original_price: selectedVariant.mrp,
        mrp: selectedVariant.mrp,
        poster_image: selectedVariant.image,
        color: selectedVariant.name,
      },
      1
    );
    router.push("/checkout");
  };

  const buildWhatsAppOrderUrl = () => {
    const text = `Hello! I would like to order Turkiye Jam:
• Selected Package: ${selectedVariant.name} (₹${selectedVariant.price})
• Free Offers: ${selectedVariant.badge || "Standard Dispatch"}

Please confirm priority delivery details.`;
    return `https://wa.me/919744122853?text=${encodeURIComponent(text)}`;
  };

  const handleQuickOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickOrderPhone.trim()) return;
    const cleanPhone = quickOrderPhone.replace(/\D/g, "");
    const waUrl = `https://wa.me/919744122853?text=${encodeURIComponent(
      `Hi Turkiye Jam Care! I would like to quickly order ${selectedVariant.name} (₹${selectedVariant.price}). My contact number is: ${cleanPhone}`
    )}`;
    setQuickOrderSuccess(true);
    setTimeout(() => {
      window.open(waUrl, "_blank");
    }, 400);
  };

  return (
    <div className="relative bg-[#FAFBF9] text-[#1D2B22] overflow-hidden selection:bg-[#cb0805] selection:text-white font-sans">
      {/* Floating Left Vertical Social Rail (Matches Reference Mockup) */}
      <aside
        className="fixed left-0 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-center bg-[#243329] text-white/80 py-4 px-2.5 rounded-r-xl gap-4 text-xs tracking-wider shadow-lg select-none"
        aria-label="Social links"
      >
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition-colors rotate-180 [writing-mode:vertical-rl] py-1 text-[11px] font-medium"
        >
          fb
        </a>
        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
        <a
          href="https://pinterest.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition-colors rotate-180 [writing-mode:vertical-rl] py-1 text-[11px] font-medium"
        >
          pi
        </a>
        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition-colors rotate-180 [writing-mode:vertical-rl] py-1 text-[11px] font-medium"
        >
          in
        </a>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (High-Impact Minimalist Stage with Pedestal)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-6 sm:pt-10 pb-16 sm:pb-24 overflow-hidden bg-gradient-to-b from-[#fdf2f2]/70 via-[#FCFBF8] to-[#FCFBF8]">
        {/* Subtle Organic Background Glow */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#cb0805]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-10 w-[400px] h-[400px] bg-[#cb0805]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Brand Statement, Typography, Selector, Actions */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6 sm:space-y-7">
              {/* Brand Header & Headline */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#cb0805]/10 border border-[#cb0805]/20 text-[#8c0503] text-xs font-semibold tracking-wide uppercase mb-4">
                  <Leaf className="w-3.5 h-3.5 text-[#cb0805]" />
                  <span>100% Authentic Anatolian Botanical Macun</span>
                </div>

                {/* Oversized Signature Lowercase Brand Wordmark (Matches 'snaillia') */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#1A2E22] leading-[1.05] font-sans">
                  turkiye jam
                </h1>

                {/* Subtitle */}
                <h2 className="text-lg sm:text-xl font-medium text-[#cb0805] mt-3">
                  Natural Inner Vitality &amp; Endurance
                </h2>

                {/* Editorial Description */}
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl mt-3 font-normal">
                  Handcrafted with wild Turkish Epimedium, pure Anatolian blossom honey, royal jelly, and red ginseng. Formulated to naturally elevate physical endurance, stamina, and intimate vitality for both men and women without synthetic stimulants.
                </p>
              </div>

              {/* Sizes / Package Selection (Radio Style Matching Reference) */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Select Size &amp; Package:
                  </span>
                  {selectedVariant.badge && (
                    <span className="text-xs font-semibold text-[#cb0805] bg-[#cb0805]/10 px-2.5 py-0.5 rounded-full border border-[#cb0805]/20">
                      ★ {selectedVariant.badge}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {TURKIYE_JAM_VARIANTS.map((v) => {
                    const isSelected = selectedVariant.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSelectVariant(v)}
                        className={`flex flex-col text-left p-3 rounded-xl border transition-all text-xs relative ${
                          isSelected
                            ? "bg-white border-[#cb0805] shadow-sm ring-2 ring-[#cb0805]/20"
                            : "bg-white/60 hover:bg-white border-stone-200/90 text-stone-700"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? "border-[#cb0805] bg-[#cb0805]" : "border-stone-300"
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="font-bold text-stone-900 truncate">{v.name}</span>
                        </div>
                        <div className="flex items-baseline gap-1.5 pl-5.5">
                          <span className="font-extrabold text-sm text-[#1A2E22]">₹{v.price.toLocaleString()}</span>
                          <span className="line-through text-stone-400 text-[11px]">₹{v.mrp.toLocaleString()}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons: Add To Cart + WhatsApp Order */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 py-4 px-8 rounded-xl bg-[#cb0805] hover:bg-[#a80604] text-white font-semibold text-sm tracking-wide shadow-md shadow-[#cb0805]/15 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to your cart</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="py-4 px-6 rounded-xl bg-[#1A2E22] hover:bg-black text-white font-semibold text-sm tracking-wide transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>

                <a
                  href={buildWhatsAppOrderUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-4 px-5 rounded-xl border border-[#cb0805]/30 bg-white hover:bg-[#fdf2f2] text-[#8c0503] font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-2xs"
                  aria-label="Order via WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 text-[#cb0805]" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
              </div>

              {/* Guarantees Strip */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-stone-600 pt-1 font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#cb0805]" />
                  100% Original Themra Import
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-[#cb0805]" />
                  15-Day Unused Strip Refund
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#cb0805]" />
                  1–2 Day Express Kerala Delivery
                </span>
              </div>
            </div>

            {/* Right Column: Hero Product Pedestal Stage */}
            <div className="lg:col-span-6 relative flex flex-col items-center justify-center min-h-[440px] sm:min-h-[520px]">
              
              {/* Translucent Oversized Vertical Watermark (Matches 'faceoil' in Reference) */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 font-serif font-bold text-7xl sm:text-8xl lg:text-9xl tracking-[0.25em] text-[#cb0805]/10 uppercase select-none pointer-events-none rotate-90 origin-center whitespace-nowrap z-0">
                herbal macun
              </div>

              {/* Natural Stone Pedestal Composition */}
              <div className="relative z-10 w-full max-w-[460px] flex flex-col items-center">
                
                {/* Floating Seal Badge */}
                <div className="absolute -top-3 -left-2 sm:left-4 z-20 bg-white/95 backdrop-blur-md border border-[#cb0805]/20 rounded-2xl p-2.5 sm:p-3 shadow-md flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-red-950 font-bold text-sm shadow-xs">
                    🇹🇷
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] font-bold text-stone-900 leading-tight">Authentic Import</div>
                    <div className="text-[10px] text-[#cb0805] font-semibold">Themra Turkey Certified</div>
                  </div>
                </div>

                {/* Main Product Showcase Photo */}
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0.6, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="relative w-full aspect-[4/3] sm:aspect-square flex items-center justify-center"
                >
                  <Image
                    src={activeImage}
                    alt={selectedVariant.name}
                    width={480}
                    height={480}
                    priority
                    className="w-auto h-[82%] sm:h-[88%] object-contain drop-shadow-2xl z-10 hover:scale-105 transition-transform duration-500"
                  />
                </motion.div>

                {/* Realistic Natural Organic Stone Slab Pedestal (Replicates Reference Stone) */}
                <div className="relative -mt-6 sm:-mt-8 w-[88%] sm:w-[94%] h-12 sm:h-14 rounded-[42px] bg-gradient-to-b from-[#E6E8E2] via-[#D5D8CF] to-[#B8BCB0] shadow-xl border border-stone-300/80 overflow-hidden flex items-center justify-center">
                  {/* Natural Stone Speckles & Texture Highlights */}
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#8f9689_1px,transparent_1px)] [background-size:8px_8px]" />
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 w-full h-2 bg-stone-700/20 blur-xs" />
                </div>

                {/* Soft Contact Ambient Pedestal Floor Shadow */}
                <div className="w-[78%] h-5 bg-stone-900/15 rounded-full blur-md -mt-2 pointer-events-none" />

                {/* Thumbnail Preview Bar to inspect all authentic product views */}
                <div className="flex items-center gap-2.5 mt-6 pt-2 z-20">
                  {HERO_GALLERY.map((thumb, idx) => (
                    <button
                      key={thumb.src}
                      type="button"
                      onClick={() => setActiveHeroImageIndex(idx)}
                      className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 transition-all p-1 bg-white ${
                        activeHeroImageIndex === idx
                          ? "border-[#cb0805] shadow-md scale-105"
                          : "border-stone-200 opacity-70 hover:opacity-100"
                      }`}
                      aria-label={thumb.label}
                    >
                      <Image
                        src={thumb.src}
                        alt={thumb.label}
                        fill
                        className="object-contain p-0.5"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. STAT COUNTER BANNER (Matches Reference Counter Strip)
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-stone-200/80 py-10 sm:py-12 relative z-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-stone-100">
            
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#1A2E22] tracking-tight font-sans">
                25,356
              </div>
              <div className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
                Happy Customers Across India
              </div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#cb0805] tracking-tight font-sans">
                6,050+
              </div>
              <div className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
                5-Star Verified Reviews
              </div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#1A2E22] tracking-tight font-sans">
                100%
              </div>
              <div className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
                Authentic Turkish Import Guarantee
              </div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#cb0805] tracking-tight font-sans">
                98.7%
              </div>
              <div className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
                Customer Satisfaction &amp; Re-Order Rate
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. "WHY TURKIYE JAM?" (Feature Grid Matching Reference)
      ───────────────────────────────────────────────────────────── */}
      <section id="benefits" className="py-20 sm:py-28 bg-[#FAFBF9] relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#1A2E22] font-sans">
            WHY TURKIYE JAM?
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-3 max-w-2xl mx-auto leading-relaxed">
            Crafted strictly according to traditional Ottoman herbal compounding, certified 100% natural without synthetic stimulants or chemical additives.
          </p>
        </div>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 text-center">
            
            {/* Feature 1: Natural */}
            <div className="flex flex-col items-center p-8 rounded-2xl bg-white border border-stone-200/70 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-full bg-[#fdf2f2] flex items-center justify-center text-[#cb0805] mb-5 border border-[#cb0805]/20">
                <Leaf className="w-8 h-8 stroke-[1.75]" />
              </div>
              <h3 className="text-lg font-bold text-[#1A2E22] mb-2">
                100% Natural Botanicals
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Compounded with wild Epimedium, Red Ginseng, Ginkgo Biloba, Royal Jelly, and pure Anatolian blossom honey to promote organic, sustained energy.
              </p>
            </div>

            {/* Feature 2: No Side Effect */}
            <div className="flex flex-col items-center p-8 rounded-2xl bg-white border border-stone-200/70 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-full bg-[#fdf2f2] flex items-center justify-center text-[#cb0805] mb-5 border border-[#cb0805]/20">
                <ShieldCheck className="w-8 h-8 stroke-[1.75]" />
              </div>
              <h3 className="text-lg font-bold text-[#1A2E22] mb-2">
                Zero Side Effects
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Zero synthetic chemicals, pharmaceutical drugs, or harmful additives. Works gently and safely with your natural physiology for enduring endurance.
              </p>
            </div>

            {/* Feature 3: 100% Organic Origin */}
            <div className="flex flex-col items-center p-8 rounded-2xl bg-white border border-stone-200/70 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-full bg-[#fdf2f2] flex items-center justify-center text-[#cb0805] mb-5 border border-[#cb0805]/20">
                <Award className="w-8 h-8 stroke-[1.75]" />
              </div>
              <h3 className="text-lg font-bold text-[#1A2E22] mb-2">
                100% Turkish Import
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Directly imported from Turkey with authentic Themra holographic security seal. Certified under Turkish Food Codex regulations for utmost purity.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. "ABOUT US" (Ottoman Botanical Story + Pedestal)
      ───────────────────────────────────────────────────────────── */}
      <section id="story" className="py-20 sm:py-28 bg-[#FAF7F5] border-y border-stone-200/70 relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#cb0805]">
                Ancient Heritage &bull; Modern Vitality
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A2E22] tracking-tight leading-tight font-sans">
                ABOUT THEMRA MACUN
              </h2>

              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                For centuries across the Ottoman Empire, revered herbal alchemists formulated natural botanical pastes known as <em>Macun</em>. These nutrient-dense compounds combined Anatolian mountain honey with potent aphrodisiac botanicals to invigorate the body, balance reproductive vitality, and fuel enduring physical stamina.
              </p>

              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                Today, Themra continues this royal botanical tradition. Our Epimedium Herbal Macun is revered by couples worldwide for its balanced dual-action effect: enhancing physical firmness and rapid recovery for men, while naturally heightening sensitivity and intimate pleasure for women.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="py-3.5 px-7 rounded-xl bg-[#cb0805] hover:bg-[#a80604] text-white font-semibold text-sm shadow-sm transition-all active:scale-98"
                >
                  Buy Now &bull; ₹{selectedVariant.price}
                </button>

                <a
                  href="#usage"
                  className="py-3.5 px-6 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-sm transition-colors"
                >
                  View Usage Guide
                </a>
              </div>
            </div>

            {/* Right Column: Secondary Pedestal Shot with Dot Grid */}
            <div className="lg:col-span-6 relative flex justify-center items-center">
              {/* Subtle Decorative Geometric Dot Grid (Matches Reference Mockup) */}
              <div className="absolute top-2 right-4 sm:right-10 w-24 h-24 text-stone-400/50 [background-image:radial-gradient(currentColor_1.5px,transparent_1.5px)] [background-size:12px_12px] pointer-events-none" />

              <div className="relative w-full max-w-[420px] flex flex-col items-center">
                <div className="relative w-full aspect-square flex items-center justify-center">
                  <Image
                    src="/tj/turkiye-jam-gallery-3.jpeg"
                    alt="Themra Turkiye Jam Botanical Display"
                    width={420}
                    height={420}
                    className="w-[84%] h-auto object-contain rounded-2xl shadow-xl z-10"
                  />
                </div>

                {/* Pedestal Rock Base */}
                <div className="relative -mt-6 w-[86%] h-10 rounded-[30px] bg-gradient-to-b from-[#E6E8E2] to-[#BDC2B6] shadow-lg border border-stone-300/80" />
                <div className="w-[70%] h-4 bg-stone-900/15 rounded-full blur-sm -mt-1.5" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. "OUR PACKAGES" (Interactive Format Selector)
      ───────────────────────────────────────────────────────────── */}
      <section id="offers" className="py-20 sm:py-28 bg-[#FAFBF9]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#cb0805] block mb-2">
            Limited Period Promotional Offers
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A2E22] tracking-tight font-sans">
            OUR PACKAGES
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-2">
            Choose between our high-value 240g Glass Jar or convenient single-dose sachet strip packs.
          </p>
        </div>

        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {TURKIYE_JAM_VARIANTS.map((variant) => {
              const isSelected = selectedVariant.id === variant.id;
              const savings = variant.mrp - variant.price;
              const savingsPercent = Math.round((savings / variant.mrp) * 100);

              return (
                <div
                  key={variant.id}
                  onClick={() => handleSelectVariant(variant)}
                  className={`cursor-pointer rounded-2xl p-6 sm:p-7 border transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? "bg-white border-[#cb0805] shadow-xl ring-2 ring-[#cb0805]/20"
                      : "bg-white/80 hover:bg-white border-stone-200 shadow-xs hover:shadow-md"
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-4">
                    {variant.badge ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-[#cb0805] text-white shadow-xs">
                        <Gift className="w-3.5 h-3.5" />
                        {variant.badge}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        {variant.unitCount} {variant.format}
                      </span>
                    )}

                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Save {savingsPercent}%
                    </span>
                  </div>

                  {/* Product Visual */}
                  <div className="relative w-full aspect-[4/3] flex items-center justify-center my-2">
                    <Image
                      src={variant.image}
                      alt={variant.name}
                      width={280}
                      height={210}
                      className="max-h-full w-auto object-contain hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Title & Description */}
                  <div className="mt-3">
                    <h3 className="text-lg font-extrabold text-[#1A2E22]">
                      {variant.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                      {variant.description}
                    </p>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="pt-5 mt-4 border-t border-stone-100 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-2xl font-black text-[#1A2E22]">
                        ₹{variant.price.toLocaleString()}
                      </div>
                      <div className="text-xs text-stone-400 line-through">
                        MRP ₹{variant.mrp.toLocaleString()}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectVariant(variant);
                        handleAddToCart();
                      }}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all ${
                        isSelected
                          ? "bg-[#cb0805] hover:bg-[#a80604] text-white shadow-sm"
                          : "bg-stone-100 hover:bg-[#cb0805] text-stone-800 hover:text-white"
                      }`}
                    >
                      {isSelected ? "Add to Cart" : "Select & Add"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. "TESTIMONIALS" (Matching Reference Review Layout)
      ───────────────────────────────────────────────────────────── */}
      <section id="reviews" className="py-20 sm:py-28 bg-[#FAF7F5] border-y border-stone-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#cb0805] block mb-2">
            Real Customer Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A2E22] tracking-tight font-sans">
            TESTIMONIALS
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-2">
            Read verified feedback from couples and wellness seekers across Kerala and India.
          </p>
        </div>

        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-7 border border-stone-200/80 shadow-xs flex flex-col justify-between relative"
              >
                <div>
                  {/* Rating Stars & Quote Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-2xl font-serif text-[#cb0805]/40 font-bold">
                      &ldquo;&rdquo;
                    </span>
                  </div>

                  <p className="text-sm text-stone-700 leading-relaxed italic mb-6">
                    &ldquo;{t.text}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden relative shrink-0 border border-stone-200">
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">{t.name}</div>
                    <div className="text-[11px] text-[#cb0805] font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#cb0805]" />
                      {t.location} &bull; {t.package}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. BRAND CERTIFICATION / TRUST BAR
      ───────────────────────────────────────────────────────────── */}
      <section className="py-12 bg-white border-b border-stone-200/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-wrap items-center justify-around gap-6 sm:gap-10 text-stone-500 text-xs sm:text-sm font-semibold uppercase tracking-wider">
            <span className="inline-flex items-center gap-2">
              <Award className="w-5 h-5 text-[#cb0805]" />
              Halal Certified
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#cb0805]" />
              ISO 22000 Standard
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#cb0805]" />
              Turkish Ministry of Food Codex
            </span>
            <span className="inline-flex items-center gap-2">
              <Leaf className="w-5 h-5 text-[#cb0805]" />
              100% Herbal &bull; No Synthetic Drug
            </span>
            <span className="inline-flex items-center gap-2">
              <Package className="w-5 h-5 text-[#cb0805]" />
              Discreet Plain Box Packaging
            </span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. HOW TO USE & INGREDIENTS
      ───────────────────────────────────────────────────────────── */}
      <section id="usage" className="py-20 sm:py-28 bg-[#FAFBF9]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#cb0805] block mb-2">
            Safe &bull; Effective &bull; Easy to Use
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A2E22] tracking-tight font-sans">
            HOW TO USE TURKIYE JAM
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-2">
            Simple dosage instructions for optimal vitality and endurance.
          </p>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-2xl border border-stone-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#cb0805]/10 text-[#cb0805] font-bold text-lg flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="font-bold text-[#1A2E22] text-base mb-2">Recommended Dosage</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Take <strong>half a teaspoon</strong> from the 240g jar (stir jar thoroughly before scooping) or <strong>1 single-dose sachet strip</strong>.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-stone-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#cb0805]/10 text-[#cb0805] font-bold text-lg flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="font-bold text-[#1A2E22] text-base mb-2">Timing &amp; Consumption</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Consume <strong>30 to 45 minutes</strong> prior to intimate activity. Drink one full glass of warm water or milk after taking it.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-stone-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#cb0805]/10 text-[#cb0805] font-bold text-lg flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="font-bold text-[#1A2E22] text-base mb-2">Long-Lasting Vitality</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Noticeable physical stamina, readiness, and intimate energy remain active for up to <strong>24 to 48 hours</strong>. Do not exceed 1 dose in 24 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. QUICK ORDER & CONSULTATION BANNER (Split Card)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-[#fdf2f2]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#cb0805]/20 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Product preview on pedestal */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-64 h-56 flex items-center justify-center">
                <Image
                  src="/products/turkiye-jam/turkiye-jam-jar-and-box.jpg"
                  alt="Turkiye Jam Quick Order"
                  width={260}
                  height={220}
                  className="object-contain max-h-full z-10 drop-shadow-lg"
                />
              </div>
              <div className="w-48 h-6 rounded-full bg-gradient-to-b from-[#E6E8E2] to-[#BDC2B6] border border-stone-300 shadow-md -mt-2" />
            </div>

            {/* Right: Quick Order Form */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#cb0805]">
                Express Consultation &bull; 1-Click Ordering
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A2E22] tracking-tight font-sans">
                Ready to Experience Turkiye Jam?
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Have questions regarding dosage or privacy? Enter your WhatsApp phone number for instant consultation with our discreet customer support team.
              </p>

              {quickOrderSuccess ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#cb0805] shrink-0" />
                  <span>Connecting you to WhatsApp care now...</span>
                </div>
              ) : (
                <form onSubmit={handleQuickOrderSubmit} className="flex flex-col sm:flex-row gap-3 pt-2">
                  <input
                    type="tel"
                    placeholder="Enter your 10-digit WhatsApp number"
                    value={quickOrderPhone}
                    onChange={(e) => setQuickOrderPhone(e.target.value)}
                    required
                    className="flex-1 px-4 py-3.5 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#cb0805] focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="py-3.5 px-6 rounded-xl bg-[#cb0805] hover:bg-[#a80604] text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Connect WhatsApp</span>
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. FREQUENTLY ASKED QUESTIONS
      ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 sm:py-28 bg-[#FAFBF9]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#cb0805] block mb-2">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A2E22] tracking-tight font-sans">
              FREQUENTLY ASKED QUESTIONS
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-stone-200/80 bg-white overflow-hidden shadow-xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full text-left px-6 py-4.5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#1A2E22] hover:text-[#cb0805] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-300 ${
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
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          11. STICKY MOBILE BOTTOM PURCHASE BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 shadow-lg flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold text-stone-500 uppercase truncate max-w-[130px]">
            {selectedVariant.name}
          </div>
          <div className="text-lg font-black text-[#1A2E22]">
            ₹{selectedVariant.price.toLocaleString()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className="py-2.5 px-4 rounded-xl bg-[#cb0805] text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="py-2.5 px-4 rounded-xl bg-[#1A2E22] text-white font-bold text-xs shadow-sm"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
