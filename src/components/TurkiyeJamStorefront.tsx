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

const CAMPAIGN_HERO_SLIDES = [
  {
    id: "women",
    tag: "For Her",
    headline: "Heightened Libido & Deep Sensation",
    subhead: "Natural Turkish Herbal Aphrodisiac for Women",
    badge: "100% Botanical for Her",
    src: "/tj/turkiye-jam-gallery-5.jpeg",
    alt: "Turkiye Jam Herbal Vitality Campaign For Women",
    benefits: [
      "Naturally stimulates intimate arousal & sensitivity",
      "Heightens climax response & natural lubrication",
      "100% plant-based with zero synthetic additives",
    ],
  },
  {
    id: "men",
    tag: "For Him",
    headline: "Explosive Stamina & Sustained Power",
    subhead: "Wild Epimedium Macun for Men's Performance",
    badge: "Bioactive Icariin 48h Action",
    src: "/tj/turkiye-jam-gallery-7.jpeg",
    alt: "Turkiye Jam Herbal Vitality Campaign For Men",
    benefits: [
      "Extended physical stamina & rock-solid firmness",
      "Faster recovery between intimate sessions",
      "Natural surge of vitality lasting 24–48 hours",
    ],
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
  const [activeHeroSlide, setActiveHeroSlide] = useState<number>(0);
  const [isSliderHovered, setIsSliderHovered] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeTestimonial, setActiveTestimonial] = useState<number>(0);
  const [quickOrderPhone, setQuickOrderPhone] = useState<string>("");
  const [quickOrderSuccess, setQuickOrderSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isSliderHovered) return;
    const interval = setInterval(() => {
      setActiveHeroSlide((prev) => (prev + 1) % CAMPAIGN_HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isSliderHovered]);

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
    <div className="relative bg-[#070709] text-stone-100 overflow-hidden selection:bg-[#cb0805] selection:text-white font-sans min-h-screen">
      {/* Ambient Liquid Glowing Orbs */}
      <div className="fixed top-1/4 -left-48 w-[650px] h-[650px] rounded-full bg-[#cb0805]/10 blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 -right-48 w-[650px] h-[650px] rounded-full bg-[#cb0805]/10 blur-[150px] pointer-events-none -z-10" />
      <div className="fixed top-2/3 left-1/3 w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[160px] pointer-events-none -z-10" />

      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Split Screen: Dark Left Content + Full Right Image Slider)
      ───────────────────────────────────────────────────────────── */}
      <section
        className="relative bg-stone-950 text-white overflow-hidden border-b border-white/10"
        onMouseEnter={() => setIsSliderHovered(true)}
        onMouseLeave={() => setIsSliderHovered(false)}
      >
        {/* Preload other slide for zero-latency cross-fade */}
        <div className="hidden" aria-hidden="true">
          <Image
            src="/tj/turkiye-jam-gallery-7.jpeg"
            alt="Preload campaign"
            width={10}
            height={10}
            priority
          />
        </div>

        <div className="flex flex-col lg:flex-row min-h-[680px] lg:min-h-[760px] lg:h-[calc(100vh-80px)] lg:max-h-[880px] w-full">
          
          {/* ── LEFT HALF: Ultra-Minimal Dark Left Side with Just Add to Cart ── */}
          <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-end px-6 sm:px-10 lg:px-16 xl:px-20 py-16 lg:py-24 bg-stone-950/90 backdrop-blur-2xl relative z-10 order-2 lg:order-1">
            <div className="w-full max-w-md space-y-6 text-center lg:text-left">
              
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#ff807e] px-3 py-1 rounded-full bg-[#cb0805]/15 border border-[#cb0805]/30 inline-block">
                  For Him &amp; Her • 48h Natural Action
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mt-3 leading-tight font-sans">
                  Natural Stamina &amp;{" "}
                  <span className="text-[#ff807e] block sm:inline">Intimate Vitality</span>
                </h1>
                
                <div className="flex items-baseline gap-3 mt-4 justify-center lg:justify-start">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">
                    ₹{selectedVariant.price.toLocaleString()}
                  </span>
                  <span className="text-base text-stone-500 line-through">
                    ₹{selectedVariant.mrp.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-[#ff807e] bg-[#cb0805]/20 px-2.5 py-0.5 rounded-full border border-[#cb0805]/30">
                    Special Offer
                  </span>
                </div>
              </div>

              {/* Just the Add to Cart Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full sm:w-auto min-w-[240px] py-4 px-8 rounded-full bg-[#cb0805] hover:bg-[#a80604] text-white font-bold text-base tracking-wide shadow-xl shadow-[#cb0805]/30 hover:shadow-[#cb0805]/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
              </div>

            </div>
          </div>

          {/* ── RIGHT HALF: Full Screen Campaign Image Slider ── */}
          <div className="w-full lg:w-1/2 relative min-h-[460px] sm:min-h-[560px] lg:min-h-full overflow-hidden bg-black select-none order-1 lg:order-2">
            
            {/* Cross-Fade Animated Poster Slide */}
            <AnimatePresence mode="wait">
              <motion.div
                key={CAMPAIGN_HERO_SLIDES[activeHeroSlide].id}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.65, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={CAMPAIGN_HERO_SLIDES[activeHeroSlide].src}
                  alt={CAMPAIGN_HERO_SLIDES[activeHeroSlide].alt}
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>
            </AnimatePresence>

            {/* Subtle Gradient Overlays for Elegance */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-stone-950 via-stone-950/50 to-transparent pointer-events-none hidden lg:block" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

            {/* Top Interactive Persona Switcher Pills (For Her / For Him) */}
            <div className="absolute top-5 right-5 sm:right-8 z-20 flex items-center gap-2.5">
              <div className="inline-flex p-1 rounded-full bg-black/60 backdrop-blur-md border border-white/25 shadow-xl">
                {CAMPAIGN_HERO_SLIDES.map((slide, idx) => {
                  const isActive = activeHeroSlide === idx;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setActiveHeroSlide(idx)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#cb0805] text-white shadow-md"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {slide.tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Caption & Slide Dots */}
            <div className="absolute bottom-5 inset-x-5 sm:inset-x-8 z-20 flex items-end justify-between text-white">
              <div className="max-w-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff807e] bg-[#cb0805]/30 px-2.5 py-0.5 rounded-full border border-[#cb0805]/50 backdrop-blur-sm">
                  {CAMPAIGN_HERO_SLIDES[activeHeroSlide].badge}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-1.5 leading-tight">
                  {CAMPAIGN_HERO_SLIDES[activeHeroSlide].headline}
                </h3>
              </div>

              {/* Slide Progress Dots */}
              <div className="flex items-center gap-2 shrink-0 ml-4 mb-1">
                {CAMPAIGN_HERO_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveHeroSlide(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      activeHeroSlide === idx
                        ? "w-7 bg-[#cb0805]"
                        : "w-2 bg-white/40 hover:bg-white/80"
                    }`}
                    aria-label={`Switch to ${slide.tag} slide`}
                  />
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. STAT COUNTER BANNER (Floating Liquid Glass Strip)
      ───────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 my-10 sm:my-14 relative z-10">
        <div className="liquid-glass-elevated rounded-3xl p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
          
          <div className="pt-4 md:pt-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              25,356+
            </div>
            <div className="text-xs sm:text-sm text-stone-400 font-medium mt-1">
              Happy Couples Across India
            </div>
          </div>

          <div className="pt-4 md:pt-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#ff807e] tracking-tight font-sans">
              6,050+
            </div>
            <div className="text-xs sm:text-sm text-stone-400 font-medium mt-1">
              5-Star Verified Reviews
            </div>
          </div>

          <div className="pt-4 md:pt-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              100%
            </div>
            <div className="text-xs sm:text-sm text-stone-400 font-medium mt-1">
              Authentic Turkish Import
            </div>
          </div>

          <div className="pt-4 md:pt-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#ff807e] tracking-tight font-sans">
              98.7%
            </div>
            <div className="text-xs sm:text-sm text-stone-400 font-medium mt-1">
              Satisfaction &amp; Re-Order Rate
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. "WHY TURKIYE JAM?" (Apple-Style Liquid Bento Grid)
      ───────────────────────────────────────────────────────────── */}
      <section id="benefits" className="py-16 sm:py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#ff807e] bg-[#cb0805]/15 border border-[#cb0805]/30 px-3 py-1 rounded-full inline-block mb-3">
            Pure Botanical Alchemy
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white font-sans">
            Why Choose Turkiye Jam?
          </h2>
          <p className="text-sm sm:text-base text-stone-300 mt-3 max-w-2xl mx-auto leading-relaxed">
            Crafted strictly according to traditional Ottoman herbal compounding, certified 100% natural without synthetic stimulants or chemical additives.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Bento Card 1: 100% Natural Botanicals */}
            <div className="liquid-glass-elevated rounded-3xl p-8 hover:border-[#cb0805]/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#cb0805]/20 border border-[#cb0805]/40 flex items-center justify-center text-[#ff807e] mb-6 shadow-[0_0_25px_rgba(203,8,5,0.3)] group-hover:scale-105 transition-transform">
                  <Leaf className="w-7 h-7 stroke-[2]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2.5">
                  100% Natural Botanicals
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Compounded with wild Epimedium, Red Ginseng, Ginkgo Biloba, Royal Jelly, and pure Anatolian blossom honey to promote organic, sustained energy.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-[#ff807e] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#cb0805]" />
                <span>Zero Synthetic Stimulants</span>
              </div>
            </div>

            {/* Bento Card 2: Zero Side Effects */}
            <div className="liquid-glass-elevated rounded-3xl p-8 hover:border-[#cb0805]/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#cb0805]/20 border border-[#cb0805]/40 flex items-center justify-center text-[#ff807e] mb-6 shadow-[0_0_25px_rgba(203,8,5,0.3)] group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-7 h-7 stroke-[2]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2.5">
                  Zero Side Effects
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Zero synthetic chemicals, pharmaceutical drugs, or harmful additives. Works gently and safely with your natural physiology for enduring stamina.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-[#ff807e] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#cb0805]" />
                <span>Natural Endocrine Balance</span>
              </div>
            </div>

            {/* Bento Card 3: 100% Turkish Import */}
            <div className="liquid-glass-elevated rounded-3xl p-8 hover:border-[#cb0805]/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#cb0805]/20 border border-[#cb0805]/40 flex items-center justify-center text-[#ff807e] mb-6 shadow-[0_0_25px_rgba(203,8,5,0.3)] group-hover:scale-105 transition-transform">
                  <Award className="w-7 h-7 stroke-[2]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2.5">
                  100% Turkish Import
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Directly imported from Turkey with authentic Themra holographic security seal. Certified under Turkish Food Codex regulations for utmost purity.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-[#ff807e] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#cb0805]" />
                <span>Themra Original Guarantee</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. "OUR PACKAGES" (Liquid Glass Package Cards)
      ───────────────────────────────────────────────────────────── */}
      <section id="offers" className="py-16 sm:py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#ff807e] bg-[#cb0805]/15 border border-[#cb0805]/30 px-3 py-1 rounded-full inline-block mb-3">
            Limited Promotional Offers
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-sans">
            Select Your Package
          </h2>
          <p className="text-sm sm:text-base text-stone-300 mt-2">
            Choose between our high-value 240g Glass Jar or convenient single-dose sachet strip packs.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {TURKIYE_JAM_VARIANTS.map((variant) => {
              const isSelected = selectedVariant.id === variant.id;
              const savings = variant.mrp - variant.price;
              const savingsPercent = Math.round((savings / variant.mrp) * 100);

              return (
                <div
                  key={variant.id}
                  onClick={() => handleSelectVariant(variant)}
                  className={`cursor-pointer rounded-3xl p-6 sm:p-7 border transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? "liquid-glass-red border-[#cb0805] shadow-[0_20px_60px_-10px_rgba(203,8,5,0.45)] ring-2 ring-[#cb0805]/40"
                      : "liquid-glass-elevated hover:border-white/25"
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-4">
                    {variant.badge ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-[#cb0805] text-white shadow-md shadow-[#cb0805]/30">
                        <Gift className="w-3.5 h-3.5" />
                        {variant.badge}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                        {variant.unitCount} {variant.format}
                      </span>
                    )}

                    <span className="text-xs font-bold text-[#ff807e] bg-[#cb0805]/20 px-2.5 py-0.5 rounded-full border border-[#cb0805]/40">
                      Save {savingsPercent}%
                    </span>
                  </div>

                  {/* Product Visual */}
                  <div className="relative w-full aspect-[4/3] flex items-center justify-center my-3">
                    <Image
                      src={variant.image}
                      alt={variant.name}
                      width={280}
                      height={210}
                      className="max-h-full w-auto object-contain hover:scale-105 transition-transform drop-shadow-2xl"
                    />
                  </div>

                  {/* Title & Description */}
                  <div className="mt-3">
                    <h3 className="text-lg font-extrabold text-white">
                      {variant.name}
                    </h3>
                    <p className="text-xs text-stone-300 mt-1 line-clamp-2 leading-relaxed">
                      {variant.description}
                    </p>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="pt-5 mt-4 border-t border-white/10 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-2xl font-black text-white">
                        ₹{variant.price.toLocaleString()}
                      </div>
                      <div className="text-xs text-stone-500 line-through">
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
                      className={`px-5 py-2.5 rounded-full font-bold text-xs tracking-wide transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#cb0805] hover:bg-[#a80604] text-white shadow-lg shadow-[#cb0805]/40 hover:scale-105"
                          : "bg-white/10 hover:bg-[#cb0805] text-white"
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
          5. HERITAGE & SCIENCE (Liquid Showcase Bento)
      ───────────────────────────────────────────────────────────── */}
      <section id="story" className="py-16 sm:py-24 relative overflow-hidden border-y border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#ff807e] bg-[#cb0805]/15 border border-[#cb0805]/30 px-3 py-1 rounded-full inline-block">
                Ancient Heritage &bull; Modern Vitality
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight font-sans">
                About Themra Macun
              </h2>

              <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
                For centuries across the Ottoman Empire, revered herbal alchemists formulated natural botanical pastes known as <em>Macun</em>. These nutrient-dense compounds combined Anatolian mountain honey with potent aphrodisiac botanicals to invigorate the body, balance reproductive vitality, and fuel enduring physical stamina.
              </p>

              <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
                Today, Themra continues this royal botanical tradition. Our Epimedium Herbal Macun is revered by couples worldwide for its balanced dual-action effect: enhancing physical firmness and rapid recovery for men, while naturally heightening sensitivity and intimate pleasure for women.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="py-3.5 px-7 rounded-full bg-[#cb0805] hover:bg-[#a80604] text-white font-bold text-sm shadow-xl shadow-[#cb0805]/30 transition-all active:scale-95 cursor-pointer"
                >
                  Buy Now &bull; ₹{selectedVariant.price}
                </button>

                <a
                  href="#usage"
                  className="py-3.5 px-6 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-colors"
                >
                  View Usage Guide
                </a>
              </div>
            </div>

            {/* Right Column: Liquid Pedestal Showcase */}
            <div className="lg:col-span-6 relative flex justify-center items-center">
              <div className="liquid-glass-elevated rounded-3xl p-6 sm:p-8 w-full max-w-[420px] flex flex-col items-center relative group">
                <div className="relative w-full aspect-square flex items-center justify-center">
                  <Image
                    src="/tj/turkiye-jam-gallery-3.jpeg"
                    alt="Themra Turkiye Jam Botanical Display"
                    width={400}
                    height={400}
                    className="w-[90%] h-auto object-contain rounded-2xl drop-shadow-2xl z-10 group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="mt-4 text-center">
                  <div className="text-sm font-bold text-white">Authentic Botanical Composition</div>
                  <div className="text-xs text-[#ff807e] font-semibold mt-0.5">Themra Turkey Certified Import</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. "TESTIMONIALS" (Liquid Glass Review Cards)
      ───────────────────────────────────────────────────────────── */}
      <section id="reviews" className="py-16 sm:py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#ff807e] bg-[#cb0805]/15 border border-[#cb0805]/30 px-3 py-1 rounded-full inline-block mb-3">
            Real Customer Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-sans">
            What Customers Say
          </h2>
          <p className="text-sm sm:text-base text-stone-300 mt-2">
            Verified feedback from couples and wellness seekers across Kerala and India.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="liquid-glass-elevated rounded-3xl p-7 border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all"
              >
                <div>
                  {/* Rating Stars & Quote Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-2xl font-serif text-[#cb0805]/40 font-bold">
                      &ldquo;&rdquo;
                    </span>
                  </div>

                  <p className="text-sm text-stone-300 leading-relaxed italic mb-6">
                    &ldquo;{t.text}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden relative shrink-0 border border-white/20">
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{t.name}</div>
                    <div className="text-[11px] text-[#ff807e] font-medium flex items-center gap-1">
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
          7. BRAND TRUST & CERTIFICATION RIBBON (Liquid Capsule)
      ───────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 my-10 relative z-10">
        <div className="liquid-glass rounded-full px-6 py-4 flex flex-wrap items-center justify-around gap-6 text-stone-300 text-xs sm:text-sm font-semibold uppercase tracking-wider">
          <span className="inline-flex items-center gap-2">
            <Award className="w-4 h-4 text-[#ff807e]" />
            Halal Certified
          </span>
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#ff807e]" />
            ISO 22000 Standard
          </span>
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#ff807e]" />
            Turkish Food Codex
          </span>
          <span className="inline-flex items-center gap-2">
            <Leaf className="w-4 h-4 text-[#ff807e]" />
            100% Herbal Formula
          </span>
          <span className="inline-flex items-center gap-2">
            <Package className="w-4 h-4 text-[#ff807e]" />
            100% Discreet Packaging
          </span>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. HOW TO USE TURKIYE JAM (3-Step Liquid Bento)
      ───────────────────────────────────────────────────────────── */}
      <section id="usage" className="py-16 sm:py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#ff807e] bg-[#cb0805]/15 border border-[#cb0805]/30 px-3 py-1 rounded-full inline-block mb-3">
            Safe &bull; Effective &bull; Easy to Use
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-sans">
            How to Use Turkiye Jam
          </h2>
          <p className="text-sm sm:text-base text-stone-300 mt-2">
            Simple dosage instructions for optimal vitality and endurance.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="liquid-glass-elevated p-8 rounded-3xl">
              <div className="w-12 h-12 rounded-2xl bg-[#cb0805]/20 border border-[#cb0805]/40 text-[#ff807e] font-extrabold text-lg flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(203,8,5,0.3)]">
                1
              </div>
              <h3 className="font-bold text-white text-base mb-2">Recommended Dosage</h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Take <strong>half a teaspoon</strong> from the 240g jar (stir jar thoroughly before scooping) or <strong>1 single-dose sachet strip</strong>.
              </p>
            </div>

            <div className="liquid-glass-elevated p-8 rounded-3xl">
              <div className="w-12 h-12 rounded-2xl bg-[#cb0805]/20 border border-[#cb0805]/40 text-[#ff807e] font-extrabold text-lg flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(203,8,5,0.3)]">
                2
              </div>
              <h3 className="font-bold text-white text-base mb-2">Timing &amp; Consumption</h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Consume <strong>30 to 45 minutes</strong> prior to intimate activity. Drink one full glass of warm water or milk after taking it.
              </p>
            </div>

            <div className="liquid-glass-elevated p-8 rounded-3xl">
              <div className="w-12 h-12 rounded-2xl bg-[#cb0805]/20 border border-[#cb0805]/40 text-[#ff807e] font-extrabold text-lg flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(203,8,5,0.3)]">
                3
              </div>
              <h3 className="font-bold text-white text-base mb-2">Long-Lasting Vitality</h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Noticeable physical stamina, readiness, and intimate energy remain active for up to <strong>24 to 48 hours</strong>. Do not exceed 1 dose in 24 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. QUICK ORDER & CONSULTATION (Liquid Card)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="liquid-glass-elevated rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-white/15">
            
            {/* Left: Product preview */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-64 h-56 flex items-center justify-center">
                <Image
                  src="/products/turkiye-jam/turkiye-jam-jar-and-box.jpg"
                  alt="Turkiye Jam Quick Order"
                  width={260}
                  height={220}
                  className="object-contain max-h-full z-10 drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Right: Quick Order Form */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#ff807e]">
                Express Consultation &bull; 1-Click Ordering
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
                Ready to Experience Turkiye Jam?
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Have questions regarding dosage or privacy? Enter your WhatsApp phone number for instant consultation with our discreet customer support team.
              </p>

              {quickOrderSuccess ? (
                <div className="p-4 rounded-2xl bg-[#cb0805]/20 border border-[#cb0805]/40 text-white text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#ff807e] shrink-0" />
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
                    className="flex-1 px-5 py-3.5 rounded-full bg-white/5 border border-white/15 text-white placeholder-stone-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#cb0805] focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="py-3.5 px-7 rounded-full bg-[#cb0805] hover:bg-[#a80604] text-white font-bold text-sm transition-all shadow-lg shadow-[#cb0805]/30 flex items-center justify-center gap-2 cursor-pointer"
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
          10. FREQUENTLY ASKED QUESTIONS (Liquid Glass Accordion)
      ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-16 sm:py-24 relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#ff807e] bg-[#cb0805]/15 border border-[#cb0805]/30 px-3 py-1 rounded-full inline-block mb-2">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3.5">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={faq.q}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen
                      ? "liquid-glass-red border-[#cb0805]/50 shadow-[0_10px_30px_rgba(203,8,5,0.2)]"
                      : "liquid-glass-elevated border-white/10 hover:border-white/20"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full text-left px-6 py-4.5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-[#ff807e] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-[#ff807e]" : ""
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
                        <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-stone-300 leading-relaxed border-t border-white/10">
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
          11. STICKY MOBILE BOTTOM PURCHASE BAR (Floating Frosted Capsule)
      ───────────────────────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-40 liquid-glass-elevated rounded-full p-2.5 shadow-2xl flex items-center justify-between gap-3 border border-white/20">
        <div className="pl-3">
          <div className="text-[10px] font-bold text-stone-400 uppercase truncate max-w-[120px]">
            {selectedVariant.name}
          </div>
          <div className="text-base font-black text-white">
            ₹{selectedVariant.price.toLocaleString()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className="py-2.5 px-4 rounded-full bg-[#cb0805] text-white font-bold text-xs shadow-md shadow-[#cb0805]/40 flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="py-2.5 px-4 rounded-full bg-white text-stone-900 font-bold text-xs shadow-md cursor-pointer"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
