"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Heart,
  CheckCircle2,
  PackageCheck,
  Flame,
  Award,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

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
    <div ref={ref} className="text-3xl sm:text-4xl font-tj-serif font-black text-stone-900 tracking-tight">
      {count.toLocaleString()}
      {suffix}
    </div>
  );
}

// Authentic Turkiye Jam customer reviews
const VOICES_OF_TRUST = [
  {
    id: 1,
    quote:
      "The natural stamina and surge of energy is remarkable. Within 45 minutes of a single spoonful in warm water, you feel a deep, warm vitality that stays with you all evening. Original Turkish Themra seal verified!",
    author: "Rajesh K.",
    location: "Bangalore, Karnataka",
    product: "240g Glass Jar + 2 Free Strips",
    rating: 5,
  },
  {
    id: 2,
    quote:
      "Discreet packaging was my top priority and Turkiye Jam delivered flawlessly. Plain brown box with no sensitive product labels. The paste has an authentic rich honey and botanical herbal taste.",
    author: "Vivek M.",
    location: "Mumbai, Maharashtra",
    product: "14 Sachet Strips Box",
    rating: 5,
  },
  {
    id: 3,
    quote:
      "My husband and I noticed a genuine revival in marital closeness and evening energy. Completely natural herbal ingredients with zero synthetic jitters or headaches. Very glad we chose the real Turkish paste.",
    author: "Anjali & Rohan",
    location: "Pune, Maharashtra",
    product: "240g Glass Jar + 2 Free Strips",
    rating: 5,
  },
  {
    id: 4,
    quote:
      "Customer support on WhatsApp is lightning-fast and courteous. They gave clear dosage advice before my order arrived. Delivery reached Hyderabad in under 3 days with Cash on Delivery.",
    author: "Harish P.",
    location: "Hyderabad, Telangana",
    product: "6 Sachet Strips Pack",
    rating: 5,
  },
  {
    id: 5,
    quote:
      "Genuine Ottoman herbal formulation. You can instantly tell this is authentic strained Anatolian flower honey combined with Epimedium and Royal Jelly. Worth every single rupee.",
    author: "Tariq A.",
    location: "Kochi, Kerala",
    product: "240g Glass Jar + 2 Free Strips",
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
      : Math.floor(containerWidth * 0.82)
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
    }, 3600);
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
    <div className="min-h-screen tj-diamonds-cream text-stone-900 flex flex-col justify-between selection:bg-[#fed000] selection:text-stone-900">
      <Navbar />

      <main className="flex-1">
        {/* ========================================================
            1. HERO SECTION: BRAND INTRODUCTION
           ======================================================== */}
        <section className="pt-28 sm:pt-32 pb-12 sm:pb-16 border-b-2 border-stone-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            {/* Back to Home Breadcrumb */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-stone-600 hover:text-[#5b1420] transition-colors mb-6 font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <div className="text-center">
              {/* Tagline Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fed000] border-2 border-stone-800 text-xs font-black text-stone-900 uppercase tracking-wider mb-4 shadow-[0_3px_0_0_#2b2b2b]">
                <Sparkles className="w-3.5 h-3.5 text-stone-900" />
                <span>Centuries of Anatolian Wisdom</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-tj-serif font-black text-stone-900 tracking-tight leading-tight max-w-3xl mx-auto">
                The Authentic Turkiye Jam Story
              </h1>

              {/* Subtitle */}
              <p className="mt-4 text-sm sm:text-base md:text-lg text-stone-700 max-w-2xl mx-auto leading-relaxed font-medium">
                We bring 100% genuine Turkish Epimedium Honey Herbal Paste (Themra Macun)
                directly from Turkey to Indian homes. Pure strained flower honey blended with
                Epimedium, Royal Jelly, and time-tested Anatolian botanicals.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            2. INTRO COUNTED METRICS
           ======================================================== */}
        <section className="py-10 sm:py-12 border-b-2 border-stone-800 bg-white/70">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center">
              {/* Stat 1: 4+ Years Direct Import */}
              <div className="bg-white rounded-3xl border-2 border-stone-800 p-4 sm:p-6 shadow-[0_4px_0_0_#2b2b2b] flex flex-col items-center justify-center">
                <CountUpNumber target={4} suffix="+" duration={1600} />
                <span className="mt-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-600">
                  Years In India
                </span>
              </div>

              {/* Stat 2: 100% Authentic */}
              <div className="bg-white rounded-3xl border-2 border-stone-800 p-4 sm:p-6 shadow-[0_4px_0_0_#2b2b2b] flex flex-col items-center justify-center">
                <CountUpNumber target={100} suffix="%" duration={1800} />
                <span className="mt-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-600">
                  Authentic Formula
                </span>
              </div>

              {/* Stat 3: 15,000+ Verified Customers */}
              <div className="bg-white rounded-3xl border-2 border-stone-800 p-4 sm:p-6 shadow-[0_4px_0_0_#2b2b2b] flex flex-col items-center justify-center">
                <CountUpNumber target={15000} suffix="+" duration={2000} />
                <span className="mt-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-600">
                  Happy Customers
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. THREE PILLARS OF AUTHENTIC PURITY
           ======================================================== */}
        <section className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-tj-serif font-black text-stone-900 tracking-tight">
              Why Discerning Buyers Choose Turkiye Jam
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
              In a market full of imitation pastes and diluted remedies, we maintain direct, uncompromised sourcing from Turkey with verifiable tamper seals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-3xl bg-white border-2 border-stone-800 shadow-[0_6px_0_0_#2b2b2b] hover:translate-y-[-2px] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#f8bac5] border-2 border-stone-800 text-[#5b1420] flex items-center justify-center mb-4 shadow-[0_2px_0_0_#2b2b2b]">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-tj-serif text-stone-900 mb-2">
                1. 100% Genuine Import
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                Imported directly from Turkish certified herbal facilities. Every glass jar features original Themra holograms and authentic batch verification codes.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-3xl bg-white border-2 border-stone-800 shadow-[0_6px_0_0_#2b2b2b] hover:translate-y-[-2px] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#fed000] border-2 border-stone-800 text-stone-900 flex items-center justify-center mb-4 shadow-[0_2px_0_0_#2b2b2b]">
                <Flame className="w-6 h-6 text-[#5b1420]" />
              </div>
              <h3 className="text-lg font-bold font-tj-serif text-stone-900 mb-2">
                2. Ancient Botanical Blend
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                Pure Anatolian strained flower honey, royal jelly, epimedium (horny goat weed), red ginseng, and ginkgo biloba. No synthetic drugs or chemicals.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-3xl bg-white border-2 border-stone-800 shadow-[0_6px_0_0_#2b2b2b] hover:translate-y-[-2px] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#d1fae5] border-2 border-stone-800 text-[#0e4a3b] flex items-center justify-center mb-4 shadow-[0_2px_0_0_#2b2b2b]">
                <PackageCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-tj-serif text-stone-900 mb-2">
                3. Discreet &amp; Safe Delivery
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                Shipped in 100% discreet brown corrugated boxes without any sensitive naming. Includes fast nationwide express dispatch and Cash on Delivery.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            4. VOICES OF TRUST: CENTER PEEK CAROUSEL
           ======================================================== */}
        <section className="py-12 sm:py-16 border-y-2 border-stone-800 bg-white/60 overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fed000] border-2 border-stone-800 text-stone-900 text-xs font-black uppercase tracking-wider mb-3 shadow-[0_2px_0_0_#2b2b2b]">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-900" />
                <span>Verified Buyer Reviews</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-tj-serif font-black text-stone-900 tracking-tight">
                Voices of Trust Across India
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-stone-600 max-w-md mx-auto font-medium">
                Real customer feedback from men and couples experiencing authentic Turkish herbal vitality.
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
                      className={`rounded-3xl p-6 sm:p-7 transition-all duration-520 select-none flex flex-col justify-between shrink-0 border-2 border-stone-800 ${
                        isCurrent
                          ? "bg-white shadow-[0_8px_0_0_#2b2b2b] scale-100 opacity-100"
                          : "bg-white/80 shadow-[0_3px_0_0_#2b2b2b] scale-[0.92] sm:scale-95 opacity-55 hover:opacity-80 cursor-pointer"
                      }`}
                      style={{
                        width: `${cardWidth}px`,
                        marginRight: `${cardGap}px`,
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3.5">
                          <div className="flex items-center gap-1 text-amber-500">
                            {[...Array(item.rating)].map((_, s) => (
                              <Star key={s} className="w-4 h-4 fill-current" />
                            ))}
                          </div>
                          <Quote className="w-6 h-6 text-[#f8bac5] rotate-180" />
                        </div>

                        <p className="text-xs sm:text-sm md:text-base text-stone-800 leading-relaxed font-normal">
                          &ldquo;{item.quote}&rdquo;
                        </p>
                      </div>

                      <div className="mt-5 pt-3.5 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-stone-900 text-xs sm:text-sm">
                              {item.author}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d1fae5] border border-emerald-300 text-[#0e4a3b]">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                            </span>
                          </div>
                          <span className="text-[11px] text-stone-500 font-medium">{item.location}</span>
                        </div>

                        <span className="text-[11px] font-bold text-[#5b1420] bg-[#f8bac5]/60 border border-stone-800 px-3 py-1 rounded-full self-start sm:self-auto">
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
                    className={`h-2 rounded-full transition-all cursor-pointer border border-stone-800 ${
                      dotIdx === realActiveIndex
                        ? "w-8 bg-[#fed000]"
                        : "w-2 bg-stone-300 hover:bg-stone-400"
                    }`}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={prevSlide}
                  className="w-9 h-9 rounded-full bg-white border-2 border-stone-800 text-stone-900 hover:bg-[#fed000] shadow-[0_2px_0_0_#2b2b2b] flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Previous review"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-9 h-9 rounded-full bg-white border-2 border-stone-800 text-stone-900 hover:bg-[#fed000] shadow-[0_2px_0_0_#2b2b2b] flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Next review"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            5. FINAL CALL TO ACTION
           ======================================================== */}
        <section className="py-12 sm:py-16 text-center max-w-xl mx-auto px-4 sm:px-6">
          <div className="w-12 h-12 rounded-2xl bg-[#f8bac5] border-2 border-stone-800 text-[#5b1420] flex items-center justify-center mx-auto mb-4 shadow-[0_3px_0_0_#2b2b2b]">
            <Heart className="w-6 h-6 fill-current text-[#5b1420]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-tj-serif font-black text-stone-900 tracking-tight">
            Ready to Experience Authentic Vitality?
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-stone-700 max-w-md mx-auto leading-relaxed font-medium">
            Order your 240g glass jar with 2 free bonus sachets today. Backed by tamper-proof seals, 100% discreet packaging, and Cash on Delivery.
          </p>
          <div className="mt-6 flex items-center justify-center">
            <Link
              href="/products"
              className="btn-shimmer inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#fed000] hover:bg-[#fab005] text-stone-900 text-sm font-black border-2 border-stone-800 shadow-[0_5px_0_0_#2b2b2b] hover:translate-y-[-1px] transition-all cursor-pointer"
            >
              <span>Order Turkiye Jam Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
