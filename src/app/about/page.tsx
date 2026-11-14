"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ShieldCheck,
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  PackageCheck,
  Award,
  Truck,
  BadgeCheck,
  CreditCard,
  Package,
  MessageCircle,
  Check,
  ChevronRight as BreadcrumbChevron,
  Dumbbell,
  Shirt,
  Layers,
  Heart,
  Zap,
  RotateCcw,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/config/siteConfig";

// Count Up Number component with smooth requestAnimationFrame easing
function CountUpNumber({
  target,
  suffix = "",
  duration = 1600,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.15 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easedProgress * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [hasStarted, target, duration]);

  return (
    <div ref={ref} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#6B9E3A] tracking-tight font-mograph">
      {count.toLocaleString()}
      {suffix}
    </div>
  );
}

// Authentic Vittal Lifestyle core trust promises
const TRUST_ITEMS = [
  { icon: Dumbbell, title: "100% Lab Tested", sub: "Purity & Macro Verified" },
  { icon: Shirt, title: "Active Outfits", sub: "Breathable & Flexible" },
  { icon: Sparkles, title: "Direct Farm Fresh", sub: "Royal Dates & Nuts" },
  { icon: Truck, title: "Express Insured", sub: "Pan-India Air Logistics" },
  { icon: RotateCcw, title: "7-Day Easy Returns", sub: "Hassle-Free Guarantee" },
];

// The 5 Lifestyle Pillars of Vittal Lifestyle
const LIFESTYLE_PILLARS = [
  {
    category: "Gym Supplementaries",
    title: "Pure Science. Uncompromised Power.",
    desc: "From ultra-filtered 100% Whey Protein Isolate to ultra-fine Micronized Creatine, every batch is verified for maximum bioavailability, clean mixability, and zero banned substances.",
    tag: "Peak Performance",
    icon: Dumbbell,
    link: "/products?category=Gym+Supplementaries",
  },
  {
    category: "Outfits",
    title: "Ergonomic Activewear for Every Rep.",
    desc: "Engineered with high-tensile 4-way stretch fabrics, seamless moisture-wicking weaves, and athletic contours that move naturally with your body through heavy sets.",
    tag: "Pro Mobility",
    icon: Shirt,
    link: "/products?category=Outfits",
  },
  {
    category: "Apparels",
    title: "Heavyweight Street & Gym Silhouettes.",
    desc: "240+ GSM custom-knitted drop-shoulder oversized tees and signature casual wear designed for post-workout comfort, streetwear styling, and all-day confidence.",
    tag: "Modern Fit",
    icon: Layers,
    link: "/products?category=Apparels",
  },
  {
    category: "Dates & Nuts",
    title: "Nature's Royal Pre-Workout Fuel.",
    desc: "Handpicked Authentic Saudi Medina Ajwa dates, jumbo Egyptian Medjool, and slow-roasted almonds. Pure unrefined energy, high dietary fiber, and essential minerals.",
    tag: "Whole Nutrition",
    icon: Sparkles,
    link: "/products?category=Dates+%26+Nuts",
  },
  {
    category: "Candy & Chocolates",
    title: "Guilt-Free Artisan Indulgence.",
    desc: "Handcrafted 70% dark chocolates and high-protein cocoa bites made from pure cocoa butter with zero trans fat, providing clean antioxidant-rich energy without breaking your diet.",
    tag: "Mindful Treats",
    icon: Heart,
    link: "/products?category=Candy+%26+Chocolates",
  },
];

// Authentic Vittal Lifestyle customer reviews
const VOICES_OF_TRUST = [
  {
    id: 1,
    quote:
      "Unbelievable mixability and zero bloating. I've switched from expensive imported brands, and Vittal Lifestyle matches or beats them in every lab test. 27g clean protein per scoop with a silky smooth rich taste.",
    author: "Aryan K.",
    location: "Bengaluru, Karnataka",
    product: "Whey Protein Isolate",
    rating: 5,
  },
  {
    id: 2,
    quote:
      "The oversized drop-shoulder fit is perfection. Heavyweight 240 GSM cotton that drapes exceptionally well and doesn't lose its shape or color after intense gym sessions and machine washes. Ordered 2 more colors!",
    author: "Rohan M.",
    location: "Mumbai, Maharashtra",
    product: "Oversized Athletic T-Shirt",
    rating: 5,
  },
  {
    id: 3,
    quote:
      "The softest, freshest Ajwa dates I have ever ordered online. Perfectly moist, aromatic, and naturally sweet. A permanent staple in my morning pre-workout meal now. Packing was airtight and premium.",
    author: "Fatima Z.",
    location: "Hyderabad, Telangana",
    product: "Premium Royal Dates",
    rating: 5,
  },
  {
    id: 4,
    quote:
      "Completely micronized and 100% tasteless. Dissolves within seconds in plain water with zero grit. Noticeable strength and pump gains within two weeks. Shipped safely with tamper seal intact.",
    author: "Vikram S.",
    location: "New Delhi, Delhi NCR",
    product: "Micronized Creatine Powder",
    rating: 5,
  },
  {
    id: 5,
    quote:
      "Rich 70% dark cocoa flavor without any bitter aftertaste. Crisp snap, clean cocoa butter aroma, and zero artificial junk. The best guilt-free evening indulgence to kill sweet tooth cravings while staying lean.",
    author: "Ananya D.",
    location: "Pune, Maharashtra",
    product: "Artisan 70% Dark Chocolate",
    rating: 5,
  },
];

// Looped array with clones at both ends for infinite peek sliding
const EXTENDED_VOICES = [
  VOICES_OF_TRUST[VOICES_OF_TRUST.length - 1],
  ...VOICES_OF_TRUST,
  VOICES_OF_TRUST[0],
];

export default function AboutPage() {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number>(0);
  const touchDeltaXRef = useRef<number>(0);
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Measure container width for responsive center-peek alignment
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const cardWidth = Math.max(
    280,
    containerWidth > 640
      ? Math.min(560, Math.floor(containerWidth * 0.74))
      : Math.floor(containerWidth * 0.86)
  );
  const cardGap = containerWidth > 640 ? 20 : 14;
  const centerOffset = containerWidth > 0 ? (containerWidth - cardWidth) / 2 : 0;
  const trackTranslateX = centerOffset - currentIndex * (cardWidth + cardGap);

  const nextSlide = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const prevSlide = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, []);

  useEffect(() => {
    if (isInteracting) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(timer);
  }, [isInteracting, nextSlide, currentIndex]);

  const pauseTemporarily = () => {
    setIsInteracting(true);
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    safetyTimerRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 4500);
  };

  const resumeImmediately = () => {
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    setIsInteracting(false);
  };

  const handleTransitionEnd = () => {
    if (currentIndex === EXTENDED_VOICES.length - 1) {
      setIsTransitioning(false);
      setCurrentIndex(1);
    } else if (currentIndex === 0) {
      setIsTransitioning(false);
      setCurrentIndex(EXTENDED_VOICES.length - 2);
    }
  };

  useEffect(() => {
    if (!isTransitioning) {
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
        return () => cancelAnimationFrame(raf2);
      });
      return () => cancelAnimationFrame(raf1);
    }
  }, [isTransitioning]);

  const handleTouchStart = (e: React.TouchEvent) => {
    pauseTemporarily();
    touchStartXRef.current = e.touches[0].clientX;
    touchDeltaXRef.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaXRef.current = e.touches[0].clientX - touchStartXRef.current;
  };

  const handleTouchEnd = () => {
    const delta = touchDeltaXRef.current;
    if (delta < -45) {
      nextSlide();
    } else if (delta > 45) {
      prevSlide();
    }
    resumeImmediately();
  };

  const realActiveIndex =
    ((currentIndex - 1) % VOICES_OF_TRUST.length + VOICES_OF_TRUST.length) %
    VOICES_OF_TRUST.length;

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col justify-between selection:bg-[#E2F5B4] selection:text-[#2E4D12] font-mograph">
      <Navbar />

      <main className="flex-1">
        {/* ========================================================
            1. HERO SECTION: BRAND INTRODUCTION
           ======================================================== */}
        <section className="relative pt-6 sm:pt-12 pb-14 sm:pb-20 bg-gradient-to-b from-[#F4FBE8]/60 via-white to-white border-b border-neutral-100 overflow-hidden">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden opacity-60">
            <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-[#95CF42]/15 blur-[120px]" />
            <div className="absolute top-10 right-1/4 w-80 h-80 rounded-full bg-[#E2F5B4]/40 blur-[100px]" />
          </div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
            {/* Clean Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500 mb-6">
              <Link href="/" className="hover:text-[#6B9E3A] transition-colors">
                Home
              </Link>
              <BreadcrumbChevron className="w-3.5 h-3.5 text-neutral-400" />
              <span className="font-semibold text-neutral-900">About Us</span>
            </nav>

            <div className="text-center max-w-3xl mx-auto">
              {/* Tagline Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F4FBE8] border border-[#95CF42]/40 text-xs font-semibold text-[#3D6318] mb-5 shadow-xs font-mograph">
                <Sparkles className="w-3.5 h-3.5 text-[#6B9E3A]" />
                <span className="tracking-wide text-xs sm:text-[13px] font-semibold">
                  Pure Nutrition • Performance Apparel • Mindful Living
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-neutral-950 tracking-tight leading-tight font-mograph">
                Live Better. <span className="text-[#6B9E3A]">Feel Stronger.</span>
              </h1>

              {/* Subtitle */}
              <p className="mt-4 text-sm sm:text-base md:text-lg text-neutral-600 leading-relaxed font-normal max-w-2xl mx-auto font-mograph">
                Vittal Lifestyle was built on a simple conviction: you should never have to compromise between physical strength, peak wellness, and premium everyday aesthetics. We craft lab-certified supplements, ergonomic activewear, farm-sourced dates &amp; nuts, and artisan dark chocolates directly for discerning Indian athletes and mindful families.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 font-mograph">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#95CF42] hover:bg-[#85BE33] text-black font-bold text-sm sm:text-base shadow-md hover:shadow-lg hover:shadow-[#95CF42]/25 transition-all cursor-pointer"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
                <a
                  href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%20Vittal%20Lifestyle%2C%20I%20would%20like%20to%20know%20more%20about%20your%20products`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-300 text-sm font-semibold transition-all shadow-xs cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Talk to Concierge</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            TRUST STRIP (Lab Tested, Outfits, Farm Direct, etc.)
           ======================================================== */}
        <section className="py-5 sm:py-6 border-b border-neutral-100 bg-[#FAFCF6] shadow-xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {TRUST_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#F4FBE8] border border-[#95CF42]/30 flex items-center justify-center shrink-0 shadow-xs">
                      <Icon className="w-5 h-5 text-[#3D6318]" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-neutral-900 leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-neutral-500 leading-tight mt-0.5">
                        {item.sub}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================
            2. COUNTED METRICS BANNER
           ======================================================== */}
        <section className="py-10 sm:py-14 border-b border-neutral-100 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Stat 1 */}
              <div className="bg-[#FAFCF6] rounded-2xl border border-neutral-200/90 p-5 sm:p-6 text-center transition-all hover:border-[#95CF42] hover:shadow-md font-mograph">
                <CountUpNumber target={100} suffix="%" duration={1600} />
                <span className="block mt-2 text-xs sm:text-sm font-bold text-neutral-900 tracking-tight">
                  Certified Pure Stock
                </span>
                <span className="block mt-0.5 text-[11px] sm:text-xs text-neutral-500 font-medium">
                  Lab tested macros &amp; zero fillers
                </span>
              </div>

              {/* Stat 2 */}
              <div className="bg-[#FAFCF6] rounded-2xl border border-neutral-200/90 p-5 sm:p-6 text-center transition-all hover:border-[#95CF42] hover:shadow-md font-mograph">
                <CountUpNumber target={25000} suffix="+" duration={1800} />
                <span className="block mt-2 text-xs sm:text-sm font-bold text-neutral-900 tracking-tight">
                  Active Fitness Enthusiasts
                </span>
                <span className="block mt-0.5 text-[11px] sm:text-xs text-neutral-500 font-medium">
                  Delivered across 28 Indian states
                </span>
              </div>

              {/* Stat 3 */}
              <div className="bg-[#FAFCF6] rounded-2xl border border-neutral-200/90 p-5 sm:p-6 text-center transition-all hover:border-[#95CF42] hover:shadow-md font-mograph">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#6B9E3A] tracking-tight">
                  4.9 <span className="text-xl sm:text-2xl text-neutral-400">/ 5.0</span>
                </div>
                <span className="block mt-2 text-xs sm:text-sm font-bold text-neutral-900 tracking-tight">
                  Verified Customer Rating
                </span>
                <span className="block mt-0.5 text-[11px] sm:text-xs text-neutral-500 font-medium">
                  Over 1,400+ 5-star verified reviews
                </span>
              </div>

              {/* Stat 4 */}
              <div className="bg-[#FAFCF6] rounded-2xl border border-neutral-200/90 p-5 sm:p-6 text-center transition-all hover:border-[#95CF42] hover:shadow-md font-mograph">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#6B9E3A] tracking-tight">
                  48 Hrs
                </div>
                <span className="block mt-2 text-xs sm:text-sm font-bold text-neutral-900 tracking-tight">
                  Priority Dispatch
                </span>
                <span className="block mt-0.5 text-[11px] sm:text-xs text-neutral-500 font-medium">
                  Insured express courier delivery
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. THE 5 LIFESTYLE PILLARS
           ======================================================== */}
        <section className="py-12 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <span className="text-xs font-semibold text-[#3D6318] bg-[#F4FBE8] px-3.5 py-1.5 rounded-full border border-[#95CF42]/40 inline-block mb-3 font-mograph">
              Our 5 Core Departments
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-950 tracking-tight font-mograph">
              Curated for Strength, Style &amp; Sustenance
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-neutral-500 leading-relaxed font-normal font-mograph">
              Every product in our store is formulated or designed under strict guidelines for physical endurance, comfort, and vitality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 font-mograph">
            {LIFESTYLE_PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.category}
                  className={`p-6 rounded-2xl bg-white border border-neutral-200/90 hover:border-[#95CF42] shadow-xs hover:shadow-xl transition-all group flex flex-col justify-between ${
                    idx === 4 ? "md:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#F4FBE8] text-[#3D6318] flex items-center justify-center border border-[#95CF42]/30 group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-600">
                        {pillar.tag}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-[#6B9E3A] mb-1 font-mograph">
                      {pillar.category}
                    </h3>
                    <h4 className="text-base sm:text-lg font-bold text-neutral-950 mb-2 leading-snug">
                      {pillar.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                      {pillar.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <Link
                      href={pillar.link}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D6318] hover:text-[#6B9E3A] transition-colors font-mograph"
                    >
                      <span>Explore {pillar.category}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            4. QUALITY & SOURCING WORKFLOW
           ======================================================== */}
        <section className="py-12 sm:py-16 bg-[#FAFCF6] border-y border-neutral-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-semibold text-[#3D6318] bg-[#F4FBE8] px-3.5 py-1.5 rounded-full border border-[#95CF42]/40 inline-block mb-3 font-mograph">
                The Vittal Standard
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-950 tracking-tight font-mograph">
                From Origin to Your Hands
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-neutral-500 font-normal font-mograph">
                Strict quality verification guarantees that what arrives at your doorstep meets Olympic-grade expectations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative font-mograph">
              {[
                {
                  step: "01",
                  title: "Certified Origin Sourcing",
                  desc: "Direct procurement from accredited GMP-certified nutrition laboratories and authenticated royal date farms.",
                },
                {
                  step: "02",
                  title: "Batch Laboratory Testing",
                  desc: "Third-party lab assays verifying protein percentage, micro-nutrient purity, zero heavy metals, and fabric tear strength.",
                },
                {
                  step: "03",
                  title: "Airtight Seal Packaging",
                  desc: "Hermetically sealed jars, foil moisture barriers, and tamper-evident holographic security bands.",
                },
                {
                  step: "04",
                  title: "Insured Rapid Transit",
                  desc: "Express insured air and surface logistics with automated WhatsApp milestone alerts right to your doorstep.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="relative p-6 rounded-2xl bg-white border border-neutral-200/90 hover:border-[#95CF42] shadow-xs transition-all"
                >
                  <span className="text-3xl font-extrabold text-[#95CF42]/60 font-mograph block mb-2">
                    {item.step}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-neutral-950 mb-2">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            5. VOICES OF TRUST: CAROUSEL TESTIMONIALS
           ======================================================== */}
        <section className="py-14 sm:py-20 bg-gradient-to-b from-white via-[#FAFCF6] to-white overflow-hidden border-b border-neutral-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4FBE8] border border-[#95CF42]/40 text-[#3D6318] text-xs font-semibold mb-3 font-mograph">
                <ShieldCheck className="w-3.5 h-3.5 text-[#6B9E3A]" />
                <span>Verified Athletes &amp; Customers</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-950 tracking-tight font-mograph">
                Voices of Vittal Lifestyle
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-neutral-500 max-w-md mx-auto font-normal font-mograph">
                Real feedback from lifters, runners, and mindful food lovers nationwide.
              </p>
            </div>

            {/* Carousel Container */}
            <div
              ref={containerRef}
              className="relative w-full overflow-hidden py-4"
              onMouseEnter={pauseTemporarily}
              onMouseLeave={resumeImmediately}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
            >
              <div
                className="flex will-change-transform"
                style={{
                  transform: `translateX(${trackTranslateX}px)`,
                  transition: isTransitioning
                    ? "transform 520ms cubic-bezier(0.22, 1, 0.36, 1)"
                    : "none",
                }}
                onTransitionEnd={handleTransitionEnd}
              >
                {EXTENDED_VOICES.map((item, idx) => {
                  const isCurrent = idx === currentIndex;
                  return (
                    <div
                      key={`${item.id}-${idx}`}
                      onClick={() => {
                        if (!isCurrent) {
                          setIsTransitioning(true);
                          setCurrentIndex(idx);
                        }
                      }}
                      className={`rounded-2xl sm:rounded-3xl p-6 sm:p-7 transition-all duration-520 select-none flex flex-col justify-between shrink-0 border ${
                        isCurrent
                          ? "bg-white border-[#95CF42] shadow-xl scale-100 opacity-100 ring-2 ring-[#95CF42]/30"
                          : "bg-[#FAFCF6] border-neutral-200/70 shadow-xs scale-[0.93] sm:scale-95 opacity-60 hover:opacity-90 cursor-pointer"
                      }`}
                      style={{
                        width: `${cardWidth}px`,
                        marginRight: `${cardGap}px`,
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1 text-[#95CF42]">
                            {[...Array(item.rating)].map((_, s) => (
                              <Star key={s} className="w-4 h-4 fill-current" />
                            ))}
                          </div>
                          <Quote className="w-6 h-6 text-neutral-300 rotate-180" />
                        </div>

                        <p className="text-xs sm:text-sm md:text-base text-neutral-700 leading-relaxed font-normal">
                          &ldquo;{item.quote}&rdquo;
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-900 text-xs sm:text-sm">
                              {item.author}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F4FBE8] text-[#3D6318] border border-[#95CF42]/30">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Verified Buyer
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-500 font-normal">{item.location}</span>
                        </div>

                        <span className="text-[11px] font-bold text-[#3D6318] bg-[#F4FBE8] border border-[#95CF42]/30 px-3 py-1 rounded-full self-start sm:self-auto font-mograph tracking-tight">
                          {item.product}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Carousel Controls */}
            <div className="mt-6 flex items-center justify-between max-w-md mx-auto px-2">
              <div className="flex items-center gap-2">
                {VOICES_OF_TRUST.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => {
                      setIsTransitioning(true);
                      setCurrentIndex(dotIdx + 1);
                    }}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      dotIdx === realActiveIndex
                        ? "w-8 bg-[#95CF42]"
                        : "w-2 bg-neutral-300 hover:bg-neutral-400"
                    }`}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={prevSlide}
                  className="w-9 h-9 rounded-full bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 shadow-xs flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Previous review"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-9 h-9 rounded-full bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 shadow-xs flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Next review"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            6. FINAL CALL TO ACTION (CTA)
           ======================================================== */}
        <section className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 font-mograph">
          <div className="rounded-3xl bg-gradient-to-r from-[#95CF42] via-[#85BE33] to-[#6B9E3A] text-neutral-950 p-8 sm:p-12 md:p-14 text-center relative overflow-hidden shadow-xl">
            {/* Ambient Lighting Gradients */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/20 blur-[90px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-black/10 blur-[90px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/10 text-xs font-semibold text-neutral-950 mb-4 border border-black/15 font-mograph">
                <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
                <span>Join The Vittal Lifestyle</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-950 tracking-tight leading-tight font-mograph">
                Elevate Your Health &amp; Performance Today
              </h2>

              <p className="mt-3.5 text-xs sm:text-sm md:text-base text-neutral-900 leading-relaxed font-normal max-w-xl mx-auto font-mograph">
                Explore our full line-up of gym supplements, athletic wear, organic dates, and artisan chocolates. Delivered express with 100% authenticity guarantee.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 font-mograph">
                <Link
                  href="/products"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-black hover:bg-neutral-900 text-white text-sm font-bold shadow-lg hover:shadow-black/20 transition-all cursor-pointer"
                >
                  <span>Explore Shop</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>

                <a
                  href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%20Vittal%20Lifestyle%2C%20I%20have%20an%20inquiry%20about%20a%20product`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white hover:bg-neutral-50 border border-black/10 text-neutral-950 text-sm font-semibold shadow-sm transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}