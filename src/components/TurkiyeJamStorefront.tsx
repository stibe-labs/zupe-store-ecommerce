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
  Flame,
  Gift,
  Check,
  Copy,
  ArrowRight,
  Lock,
  Heart,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { TURKIYE_JAM_VARIANTS, TurkiyeJamVariant, DEFAULT_PRODUCTS } from "@/data/zupeProducts";

const PRODUCT_IMAGES = [
  {
    src: "/products/turkiye-jam/turkiye-jam-jar-and-box.jpg",
    title: "240g Glass Jar & Sachet Strips",
    label: "240g Jar & Strips",
  },
  {
    src: "/products/turkiye-jam/turkiye-jam-box-strips.jpg",
    title: "14-Sachet Sealed Box",
    label: "Sealed Box",
  },
  {
    src: "/products/turkiye-jam/turkiye-jam-3-strips.jpg",
    title: "Individual Single-Dose Sachets",
    label: "Sachet Strips",
  },
  {
    src: "/products/turkiye-jam/turkiye-jam-5-strips.jpg",
    title: "Pocket-Sized Sachets",
    label: "Travel Sachets",
  },
];

const FAQS = [
  {
    q: "What is Themra Epimedium Herbal Macun (Turkiye Jam)?",
    a: "Themra Epimedium Herbal Macun is a revered Turkish botanical paste formulated with Epimedium (Horny Goat Weed), Pure Flower Honey, Royal Jelly, Red Ginseng, Maca Root, and natural aphrodisiac spices. It has been used traditionally for generations to revitalize stamina, boost energy, and enhance intimate performance.",
  },
  {
    q: "How does it work for both men and women?",
    a: "In men, the bioactive Icariin from Epimedium enhances peripheral blood circulation, supports healthy erectile firmness, and extends stamina while facilitating faster recovery between intimate sessions. In women, it naturally stimulates estrogenic blood flow, heightens sensitivity in intimate zones, and enhances libido and climax quality.",
  },
  {
    q: "How long do the effects last?",
    a: "A single teaspoon or sachet strip typically begins working within 30 to 45 minutes, with elevated vitality, stamina, and readiness remaining active in the body for 24 to 48 hours.",
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
    a: "Prepaid orders receive priority express air/road courier dispatch (1–2 business days across Kerala and major metros). Cash on Delivery (COD) orders are delivered via verified surface courier within 3–7 business days.",
  },
];

export function TurkiyeJamStorefront() {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const defaultProduct = DEFAULT_PRODUCTS[0];

  const [selectedVariant, setSelectedVariant] = useState<TurkiyeJamVariant>(TURKIYE_JAM_VARIANTS[0]);
  const [activeImage, setActiveImage] = useState<string>(PRODUCT_IMAGES[0].src);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<"cod" | "prepaid">("prepaid");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [copiedAddressTemplate, setCopiedAddressTemplate] = useState<boolean>(false);
  const [showStickyBar, setShowStickyBar] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 680);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSelectVariant = (variant: TurkiyeJamVariant) => {
    setSelectedVariant(variant);
    setActiveImage(variant.image);
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

  const buildWhatsAppOrderUrl = () => {
    const text = `Hello! I would like to order Turkiye Jam:
• Package: ${selectedVariant.name} (₹${selectedVariant.price})
• Payment Preference: ${selectedPaymentMode === "cod" ? "Cash on Delivery (+₹190)" : "Prepaid Online (+₹60)"}

My Delivery Details:
Name: 
Address: 
District / City: 
Pincode: 
Landmark: 
Mobile Number: `;
    return `https://wa.me/919744122853?text=${encodeURIComponent(text)}`;
  };

  const copyAddressTemplate = () => {
    const template = `Name: 
Address: 
District / City: 
Pincode: 
Landmark: 
Mobile Number: 
Selected Package: ${selectedVariant.name} (₹${selectedVariant.price})`;
    navigator.clipboard.writeText(template);
    setCopiedAddressTemplate(true);
    setTimeout(() => setCopiedAddressTemplate(false), 2500);
  };

  return (
    <div className="w-full bg-[#FCFBF8] text-[#1A1A1A]">
      {/* 1. HERO SECTION & ORDER STUDIO */}
      <section className="relative pt-8 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        {/* Subtle Luxury Announcement Pill */}
        <div className="mb-8 flex items-center justify-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs sm:text-sm font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#780016] animate-pulse" />
            <span>100% Authentic Import from Turkey • Express Priority Dispatch in 24 Hours</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* LEFT: Product Photo Gallery */}
          <div className="lg:col-span-6 space-y-5 lg:sticky lg:top-28">
            {/* Main Image Viewport */}
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-stone-200/80 shadow-md group">
              <Image
                src={activeImage}
                alt="Themra Epimedium Turkish Herbal Macun"
                fill
                priority
                className="object-contain p-4 sm:p-8 transition-transform duration-500 group-hover:scale-104"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Floating Quality Pills */}
              <div className="absolute top-5 left-5 flex flex-col gap-2 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#780016] text-white text-xs font-bold shadow-md tracking-wide">
                  🇹🇷 Original Turkish Formula
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400 text-stone-950 text-xs font-extrabold shadow-sm">
                  ★ 4.9 Rating (1,480+ Reviews)
                </span>
              </div>

              <div className="absolute bottom-5 right-5 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-900/85 backdrop-blur-md text-white text-xs font-medium shadow-md">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>100% Discreet Packaging</span>
                </span>
              </div>
            </div>

            {/* Thumbnail Navigation */}
            <div className="grid grid-cols-4 gap-3">
              {PRODUCT_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img.src)}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all p-1 bg-white cursor-pointer ${
                    activeImage === img.src
                      ? "border-[#780016] ring-2 ring-[#780016]/20 shadow-md scale-102"
                      : "border-stone-200 hover:border-stone-400 opacity-75 hover:opacity-100"
                  }`}
                  aria-label={`View ${img.title}`}
                >
                  <Image
                    src={img.src}
                    alt={img.title}
                    fill
                    className="object-cover rounded-xl"
                    sizes="120px"
                  />
                </button>
              ))}
            </div>

            {/* Trust Pillars */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-center">
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
                <div className="w-8 h-8 mx-auto rounded-full bg-rose-50 text-[#780016] flex items-center justify-center font-bold text-sm mb-1.5">
                  🇹🇷
                </div>
                <h5 className="text-xs font-bold text-stone-900">100% Original</h5>
                <p className="text-[11px] text-stone-500 mt-0.5">Themra Turkey</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
                <div className="w-8 h-8 mx-auto rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1.5">
                  <Truck className="w-4 h-4" />
                </div>
                <h5 className="text-xs font-bold text-stone-900">1–2 Day Express</h5>
                <p className="text-[11px] text-stone-500 mt-0.5">Priority Dispatch</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
                <div className="w-8 h-8 mx-auto rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mb-1.5">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <h5 className="text-xs font-bold text-stone-900">Refund Guarantee</h5>
                <p className="text-[11px] text-stone-500 mt-0.5">On Unused Sachets</p>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Details & Package Selection Studio */}
          <div className="lg:col-span-6 space-y-7">
            {/* Product Meta & Title */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-rose-50 text-[#780016] text-xs font-extrabold tracking-wider uppercase border border-rose-100">
                  Themra Bitkisel Turkey
                </span>
                <span className="text-xs text-stone-400">•</span>
                <span className="text-xs font-bold text-emerald-700">In Stock for Immediate Dispatch</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-stone-950 tracking-tight leading-tight font-serif">
                Themra Epimedium Herbal Macun
              </h1>

              <p className="text-sm sm:text-base font-semibold text-stone-600 leading-relaxed">
                Premium Natural Vitality, Peak Stamina &amp; Intimacy Performance Paste for Couples
              </p>

              {/* Review Stars & Social Proof */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                  ))}
                </div>
                <span className="text-sm font-extrabold text-stone-900">4.9 / 5.0</span>
                <span className="text-xs text-stone-500">(1,480+ Verified Buyer Reviews)</span>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  4,200+ Delivered
                </span>
              </div>
            </div>

            {/* 6 OFFER PACKAGES SELECTOR */}
            <div id="offers" className="space-y-3.5 pt-2">
              <div className="flex items-center justify-between pb-1 border-b border-stone-200">
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest flex items-center gap-2">
                  <Gift className="w-4 h-4 text-[#780016]" />
                  <span>Choose Your Offer Package</span>
                </h3>
                <span className="text-xs font-bold text-stone-500">6 Options Available</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {TURKIYE_JAM_VARIANTS.map((variant) => {
                  const isSelected = selectedVariant.id === variant.id;
                  return (
                    <div
                      key={variant.id}
                      onClick={() => handleSelectVariant(variant)}
                      className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-[#780016] bg-gradient-to-br from-rose-50/70 to-amber-50/40 shadow-sm ring-1 ring-[#780016]/20"
                          : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs"
                      }`}
                    >
                      {/* Badge */}
                      {variant.badge && (
                        <div className="absolute -top-2.5 right-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-white shadow-2xs ${
                              variant.popular ? "bg-[#780016]" : "bg-amber-600"
                            }`}
                          >
                            {variant.badge}
                          </span>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                              isSelected ? "border-[#780016]" : "border-stone-300"
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-[#780016]" />}
                          </div>

                          <div>
                            <h4 className="text-sm font-extrabold text-stone-950 leading-snug">
                              {variant.name}
                            </h4>
                            <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                              {variant.packageDescription}
                            </p>
                          </div>
                        </div>

                        {variant.freeBonus && (
                          <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                            🎁 {variant.freeBonus}
                          </div>
                        )}
                      </div>

                      {/* Pricing Row */}
                      <div className="mt-3.5 pt-2.5 border-t border-stone-200/70 flex items-baseline justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black text-[#780016]">
                            ₹{variant.price.toLocaleString()}
                          </span>
                          <span className="text-xs text-stone-400 line-through">
                            ₹{variant.mrp.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                          Save ₹{variant.savings}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DELIVERY SELECTION CARDS */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-stone-900 tracking-wide uppercase">
                  Select Delivery Speed &amp; Payment Mode
                </h4>
                <span className="text-[11px] text-stone-500">Pan-India Courier</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Prepaid Option */}
                <div
                  onClick={() => setSelectedPaymentMode("prepaid")}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedPaymentMode === "prepaid"
                      ? "border-emerald-600 bg-emerald-50/60 shadow-xs"
                      : "border-stone-200 bg-stone-50/50 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950">Prepaid Online</span>
                    <span className="text-xs font-black text-emerald-700">₹60 Extra</span>
                  </div>
                  <p className="text-xs text-emerald-800 font-semibold mt-1">
                    ⚡ 1–2 Days Superfast Delivery
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">UPI, GPay, PhonePe, Cards</p>
                </div>

                {/* COD Option */}
                <div
                  onClick={() => setSelectedPaymentMode("cod")}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedPaymentMode === "cod"
                      ? "border-[#780016] bg-rose-50/60 shadow-xs"
                      : "border-stone-200 bg-stone-50/50 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">Cash on Delivery</span>
                    <span className="text-xs font-black text-[#780016]">₹190 Extra</span>
                  </div>
                  <p className="text-xs text-[#780016] font-semibold mt-1">
                    📦 3–7 Days Delivery Time
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">Pay remaining at doorstep</p>
                </div>
              </div>
            </div>

            {/* CALL TO ACTION BUTTONS */}
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleBuyNow}
                  className="w-full py-4 px-6 rounded-2xl bg-[#780016] hover:bg-[#580010] text-white font-extrabold text-base shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>ORDER NOW (BUY NOW)</span>
                </button>

                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-base shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>ADD TO CART</span>
                </button>
              </div>

              <a
                href={buildWhatsAppOrderUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Phone className="w-4 h-4" />
                <span>Instant Order via WhatsApp (+91 97441 22853)</span>
              </a>
            </div>

            {/* Live Selection Summary */}
            <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-900">Selected: </span>
                <span>{selectedVariant.name}</span>
              </div>
              <span className="font-extrabold text-[#780016] text-sm">
                ₹{selectedVariant.price.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KEY BENEFITS SECTION (FOR MEN & WOMEN) */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-stone-200">
        <div className="max-w-[1300px] mx-auto space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-rose-50 text-[#780016] text-xs font-black uppercase tracking-widest border border-rose-100">
              Dual-Action Herbal Formula
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-950 tracking-tight font-serif">
              Scientifically Proven Botanical Benefits
            </h2>
            <p className="text-sm sm:text-base text-stone-600">
              Natural potency and intimate vitality tailored for both partners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {/* MEN */}
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#1c0408] to-[#38020d] text-white shadow-xl space-y-7 relative overflow-hidden border border-rose-900/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center text-xl font-bold shadow-md">
                    👨
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white font-serif">
                      For Men
                    </h3>
                    <p className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                      Stamina, Timing &amp; Recovery
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-amber-300 border border-white/15">
                  Peak Endurance
                </span>
              </div>

              <div className="space-y-4 pt-1">
                <div className="p-4 sm:p-5 rounded-2xl bg-white/6 border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm sm:text-base">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>Peak Stamina &amp; Extended Duration</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-300 pl-7 leading-relaxed">
                    Sustains physical endurance and voluntary control during intimate encounters, significantly prolonging performance.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white/6 border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm sm:text-base">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>Multiple Sessions &amp; Rapid Recovery</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-300 pl-7 leading-relaxed">
                    Shortens refractory down-time between rounds, restoring vigorous energy quickly for repeated sessions.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white/6 border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm sm:text-base">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>Enhanced Blood Flow &amp; Firmness</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-300 pl-7 leading-relaxed">
                    Active Icariin promotes nitric oxide release, ensuring robust circulation and firm confidence throughout.
                  </p>
                </div>
              </div>
            </div>

            {/* WOMEN */}
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#FFF9F9] to-[#FCEEF1] text-stone-900 shadow-xl space-y-7 relative overflow-hidden border border-rose-200/90">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#780016] text-white flex items-center justify-center text-xl font-bold shadow-md">
                    👩
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-[#780016] font-serif">
                      For Women
                    </h3>
                    <p className="text-xs text-rose-800 font-bold uppercase tracking-wider">
                      Desire, Sensitivity &amp; Orgasm
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-200/60 text-[#780016] border border-rose-300/40">
                  Sensual Awakening
                </span>
              </div>

              <div className="space-y-4 pt-1">
                <div className="p-4 sm:p-5 rounded-2xl bg-white/85 border border-rose-200/80 space-y-1.5">
                  <div className="flex items-center gap-2.5 text-[#780016] font-bold text-sm sm:text-base">
                    <CheckCircle2 className="w-5 h-5 text-[#780016] shrink-0" />
                    <span>Awakens Natural Desire &amp; Libido</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 pl-7 leading-relaxed">
                    Gently revitalizes low intimate interest by balancing stress levels and nurturing natural sensual responsiveness.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white/85 border border-rose-200/80 space-y-1.5">
                  <div className="flex items-center gap-2.5 text-[#780016] font-bold text-sm sm:text-base">
                    <CheckCircle2 className="w-5 h-5 text-[#780016] shrink-0" />
                    <span>Heightened Sensitivity &amp; Pleasure</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 pl-7 leading-relaxed">
                    Increases intimate blood circulation, enhancing natural lubrication and intensifying sensitivity for more profound climaxes.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white/85 border border-rose-200/80 space-y-1.5">
                  <div className="flex items-center gap-2.5 text-[#780016] font-bold text-sm sm:text-base">
                    <CheckCircle2 className="w-5 h-5 text-[#780016] shrink-0" />
                    <span>Relieves Fatigue &amp; Boosts Mood</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 pl-7 leading-relaxed">
                    Royal Jelly and Red Ginseng alleviate daily physical exhaustion, fostering deep emotional relaxation and intimacy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW TO USE SECTION (5-STEP PROCESS) */}
      <section id="usage" className="py-20 px-4 sm:px-6 lg:px-8 max-w-[1300px] mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-widest">
            Dosage &amp; Instructions
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-950 tracking-tight font-serif">
            How to Use Turkiye Jam
          </h2>
          <p className="text-sm sm:text-base text-stone-600">
            Follow these 5 simple steps for optimum potency and unforgettable results
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-5">
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#780016] text-white flex items-center justify-center font-bold text-sm mb-3.5">
                01
              </div>
              <h4 className="text-sm font-extrabold text-stone-950 leading-snug">
                Eat a Light Meal 1 Hr Before
              </h4>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Never take on an empty stomach. Consume a normal meal about one hour before intended activity.
              </p>
            </div>
            <div className="text-[11px] font-bold text-rose-800 bg-rose-50 p-2 rounded-xl text-center">
              Meal is Essential
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#780016] text-white flex items-center justify-center font-bold text-sm mb-3.5">
                02
              </div>
              <h4 className="text-sm font-extrabold text-stone-950 leading-snug">
                Take 1 Teaspoon or Sachet
              </h4>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Wait 10 minutes after food, then consume exactly one small teaspoon or one single sachet strip.
              </p>
            </div>
            <div className="text-[11px] font-bold text-amber-800 bg-amber-50 p-2 rounded-xl text-center">
              1 Dose (No Excess)
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#780016] text-white flex items-center justify-center font-bold text-sm mb-3.5">
                03
              </div>
              <h4 className="text-sm font-extrabold text-stone-950 leading-snug">
                Stir Well (If Using Jar)
              </h4>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Natural botanical extracts settle at the bottom. Stir thoroughly with a spoon before scooping.
              </p>
            </div>
            <div className="text-[11px] font-bold text-purple-800 bg-purple-50 p-2 rounded-xl text-center">
              Mix Evenly
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#780016] text-white flex items-center justify-center font-bold text-sm mb-3.5">
                04
              </div>
              <h4 className="text-sm font-extrabold text-stone-950 leading-snug">
                Drink a Glass of Warm Milk
              </h4>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Having warm milk 15 minutes after consuming accelerates botanical absorption significantly.
              </p>
            </div>
            <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 p-2 rounded-xl text-center">
              Accelerates Absorption
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-stone-800 text-white flex items-center justify-center font-bold text-sm mb-3.5">
                05
              </div>
              <h4 className="text-sm font-extrabold text-stone-950 leading-snug">
                Avoid Cold Carbonated Soda
              </h4>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Refrain from chilled cold drinks or carbonated soda immediately before or after consumption.
              </p>
            </div>
            <div className="text-[11px] font-bold text-stone-700 bg-stone-100 p-2 rounded-xl text-center">
              No Cold Beverages
            </div>
          </div>
        </div>

        {/* MEDICAL PRECAUTIONS ADVISORY CARD */}
        <div className="p-6 sm:p-8 rounded-3xl bg-red-50/70 border border-red-200 space-y-4">
          <div className="flex items-center gap-3 text-red-900">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
            <h4 className="text-base sm:text-lg font-black tracking-tight">
              Important Health &amp; Safety Precautions
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-red-950 font-medium">
            <div className="p-4 rounded-2xl bg-white/90 border border-red-200/70 flex items-start gap-3">
              <span className="text-base font-bold text-red-600 leading-none">⚠️</span>
              <span>
                <strong>Do not consume on an empty stomach.</strong> Always take after consuming a light meal to prevent digestive discomfort.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 border border-red-200/70 flex items-start gap-3">
              <span className="text-base font-bold text-red-600 leading-none">⚠️</span>
              <span>
                <strong>Not for individuals with heart conditions or hypertension (high blood pressure).</strong> If you have pre-existing cardiovascular conditions, do not use this or similar stimulants.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 100% UNUSED STRIP REFUND GUARANTEE & DISCREET PACKAGING */}
      <section id="guarantee" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#1c0408] via-[#38020d] to-[#1c0408] text-white">
        <div className="max-w-[1300px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Card 1: Refund Guarantee */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white/8 backdrop-blur-md border border-white/15 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-2xl shadow-lg">
              🛡️
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white font-serif">
              100% Unused Strip Refund Guarantee
            </h3>
            <p className="text-sm text-stone-200 leading-relaxed">
              We stand behind the authenticity and quality of our Turkish formulation. If you purchase any sachet strip pack and do not experience satisfactory results, simply return the remaining unopened strips.
            </p>
            <div className="p-4 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-200 text-xs sm:text-sm font-bold">
              ✓ Full Pro-Rata Refund issued directly to your bank account or UPI for all returned strips.
            </div>
          </div>

          {/* Card 2: Discreet Packaging */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white/8 backdrop-blur-md border border-white/15 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg">
              📦
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white font-serif">
              100% Discreet &amp; Secure Packaging
            </h3>
            <p className="text-sm text-stone-200 leading-relaxed">
              Your privacy is our utmost priority. Every order is packed in a neutral, opaque, tamper-evident cardboard box with absolutely no product descriptions or brand identifiers on the exterior label.
            </p>
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs sm:text-sm font-bold">
              🔒 Zero Product Disclosures • Tamper-Proof Neutral Outer Box
            </div>
          </div>
        </div>
      </section>

      {/* 5. 1-CLICK WHATSAPP ORDER / ADDRESS FORMAT */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-[1040px] mx-auto">
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-stone-200 shadow-xl space-y-7">
          <div className="text-center space-y-2.5">
            <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black uppercase tracking-widest border border-emerald-200">
              Direct WhatsApp Ordering
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-stone-950 font-serif">
              Prefer to Order Directly on WhatsApp?
            </h3>
            <p className="text-xs sm:text-sm text-stone-600">
              Skip the web form. Copy the format below and send your delivery address directly to our WhatsApp support team.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-stone-50 border border-stone-200 font-mono text-xs sm:text-sm text-stone-800 space-y-1.5 relative">
            <button
              onClick={copyAddressTemplate}
              className="absolute top-4 right-4 px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-sans font-bold hover:bg-stone-100 flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              {copiedAddressTemplate ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Template</span>
                </>
              )}
            </button>

            <p className="text-stone-400 font-sans text-xs mb-2"># Delivery Address Template:</p>
            <p>Name: ______________________</p>
            <p>Address: ___________________</p>
            <p>District / City: ____________</p>
            <p>Pincode: ___________________</p>
            <p>Landmark: __________________</p>
            <p>Mobile Number: _____________</p>
            <p className="text-[#780016] font-bold mt-2">
              Selected Package: {selectedVariant.name} (₹{selectedVariant.price})
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5">
            <a
              href={buildWhatsAppOrderUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all"
            >
              <Phone className="w-5 h-5" />
              <span>Send Address via WhatsApp (+91 97441 22853)</span>
            </a>

            <button
              onClick={handleBuyNow}
              className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-[#780016] hover:bg-[#580010] text-white font-extrabold text-sm sm:text-base shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              Order on Website →
            </button>
          </div>
        </div>
      </section>

      {/* 6. VERIFIED CUSTOMER REVIEWS */}
      <section id="reviews" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-stone-200">
        <div className="max-w-[1300px] mx-auto space-y-12">
          <div className="text-center space-y-2.5">
            <span className="px-3.5 py-1 rounded-full bg-rose-50 text-[#780016] text-xs font-black uppercase tracking-widest border border-rose-100">
              Verified Feedback
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-950 font-serif">
              Real Experiences from Verified Customers
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              Read authentic feedback from couples and users who experienced the Themra difference
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {defaultProduct.reviews_data?.list.map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-3xl bg-[#FAF8F5] border border-stone-200/80 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] text-stone-400">{rev.date}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-800 leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-3.5 border-t border-stone-200 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-stone-950">{rev.author}</h5>
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-[960px] mx-auto space-y-9">
        <div className="text-center space-y-2.5">
          <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-serif">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Everything you need to know about Themra Turkish Epimedium Macun
          </p>
        </div>

        <div className="space-y-3.5">
          {FAQS.map((faq, i) => {
            const isOpen = openFaqIndex === i;
            return (
              <div
                key={i}
                className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-2xs"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-stone-900 hover:text-[#780016] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 transition-transform ${
                      isOpen ? "rotate-180 text-[#780016]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. FLOATING STICKY BUY BAR */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-3.5 sm:p-4 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-2xl"
          >
            <div className="max-w-[1300px] mx-auto flex items-center justify-between gap-4">
              {/* Product Info Left */}
              <div className="flex items-center gap-3.5">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-stone-200 hidden sm:block shrink-0 bg-white">
                  <Image
                    src={selectedVariant.image}
                    alt={selectedVariant.name}
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-stone-950 line-clamp-1">
                    {selectedVariant.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-black text-[#780016]">
                      ₹{selectedVariant.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-stone-400 line-through">
                      ₹{selectedVariant.mrp.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      Save ₹{selectedVariant.savings}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Right */}
              <div className="flex items-center gap-2.5">
                <a
                  href={buildWhatsAppOrderUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <button
                  onClick={handleBuyNow}
                  className="py-3 px-6 sm:px-8 rounded-xl bg-[#780016] hover:bg-[#580010] text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  ORDER NOW →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
