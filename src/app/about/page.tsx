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
  Lightbulb,
  Compass,
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
    <div ref={ref} className="text-3xl sm:text-4xl font-display font-bold text-gray-900 tracking-tight">
      {count.toLocaleString()}
      {suffix}
    </div>
  );
}

// Voices of Trust testimonials data
const VOICES_OF_TRUST = [
  {
    id: 1,
    quote:
      "The Dynamic Water Ripple Lamp completely redefined the ambient mood in our bedroom. Outstanding acrylic crystal finish, calming ocean wave glow, and the 16-color remote works like magic.",
    author: "Rohit Sharma",
    location: "Mumbai, Maharashtra",
    product: "Dynamic Water Ripple Lamp",
    rating: 5,
  },
  {
    id: 2,
    quote:
      "Bought the Portable Steam Iron for my work travels. Heats up in literally 30 seconds and straightens cotton shirts effortlessly without scorching delicate fabrics. 10/10 innovation.",
    author: "Kavita Rao",
    location: "Bangalore, Karnataka",
    product: "Mini Portable Steam Iron",
    rating: 5,
  },
  {
    id: 3,
    quote:
      "The Multipurpose Powerbank with built-in wireless earbuds is a stroke of genius. Both daily essentials stay charged in one pocket-friendly body. Sturdy build and fast dispatch.",
    author: "Arjun Nair",
    location: "Kochi, Kerala",
    product: "TF20 Powerbank with Airpods",
    rating: 5,
  },
  {
    id: 4,
    quote:
      "Customer support is exceptionally responsive. Had a small inquiry about delivery tracking and their WhatsApp team resolved it within two minutes. Zupe Store has earned my complete trust.",
    author: "Pooja Sharma",
    location: "Pune, Maharashtra",
    product: "Menstrual Heating Pad",
    rating: 5,
  },
  {
    id: 5,
    quote:
      "Zupe Store doesn't sell ordinary commodities. Every product feels like a curated discovery designed to bring genuine convenience and aesthetic warmth into modern homes.",
    author: "Sneha Kapoor",
    location: "New Delhi",
    product: "Curated Collection",
    rating: 5,
  },
];

// Looped array with clones at both ends for infinite peek sliding
// [last item, item 0, item 1, item 2, item 3, item 4, item 0]
const EXTENDED_VOICES = [
  VOICES_OF_TRUST[VOICES_OF_TRUST.length - 1],
  ...VOICES_OF_TRUST,
  VOICES_OF_TRUST[0],
];

export default function AboutPage() {
  // Carousel State
  // Index 1 corresponds to real VOICES_OF_TRUST[0]
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

  // Card dimensions: Active card occupies ~76% on desktop, ~82% on mobile
  // Leaving small peek portions visible on both left and right sides
  const cardWidth = Math.max(
    280,
    containerWidth > 640
      ? Math.min(560, Math.floor(containerWidth * 0.74))
      : Math.floor(containerWidth * 0.82)
  );
  const cardGap = containerWidth > 640 ? 20 : 14;
  const centerOffset = containerWidth > 0 ? (containerWidth - cardWidth) / 2 : 0;
  const trackTranslateX = centerOffset - currentIndex * (cardWidth + cardGap);

  // Auto-switch navigation functions
  const nextSlide = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const prevSlide = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, []);

  // Rock-solid 3-second auto switch timer
  useEffect(() => {
    if (isInteracting) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 3200);

    return () => clearInterval(timer);
  }, [isInteracting, nextSlide, currentIndex]);

  // Safety timer: guarantees auto-switch resumes if touch or hover gets stuck
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

  // Seamless infinite loop snap handler
  const handleTransitionEnd = () => {
    if (currentIndex === EXTENDED_VOICES.length - 1) {
      // Reached clone of first item at the end -> silently snap to real index 1
      setIsTransitioning(false);
      setCurrentIndex(1);
    } else if (currentIndex === 0) {
      // Reached clone of last item at beginning -> silently snap to real index 5
      setIsTransitioning(false);
      setCurrentIndex(EXTENDED_VOICES.length - 2);
    }
  };

  // Re-enable CSS transitions right after silent snap
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

  // Touch Swipe handlers
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

  // Map extended index to active 0..4 dot index
  const realActiveIndex =
    ((currentIndex - 1) % VOICES_OF_TRUST.length + VOICES_OF_TRUST.length) %
    VOICES_OF_TRUST.length;

  return (
    <div className="min-h-screen bg-white text-[#1E1E1E] flex flex-col selection:bg-[#FF7A00]/20 selection:text-[#FF7A00]">
      <Navbar />

      <main className="flex-1">
        {/* ========================================================
            1. HERO SECTION: BRAND INTRODUCTION (MATCHED SCALE)
           ======================================================== */}
        <section className="pt-6 pb-10 sm:pt-10 sm:pb-14 bg-gradient-to-b from-orange-50/30 via-white to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            {/* Back to Home Breadcrumb */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-[#FF7A00] transition-colors mb-5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <div className="text-center">
              {/* Tagline Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-xs font-semibold text-[#FF7A00] uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
                <span>The Zupe Story</span>
              </div>

              {/* Title matched to store proportions */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-gray-900 tracking-tight leading-snug max-w-2xl mx-auto">
                Elevating Everyday Living Through Thoughtful Design
              </h1>

              {/* Subtitle */}
              <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
                We curate modern home decor, ambient lighting, and smart lifestyle innovations
                engineered to transform ordinary daily routines into moments of comfort, calm, and joy.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            2. INTRO COUNTED METRICS: ONLY 4+ YEARS & 100% SATISFACTION
           ======================================================== */}
        <section className="py-8 sm:py-10 border-y border-gray-100 bg-[#FAFAFA]">
          <div className="max-w-xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 gap-4 sm:gap-8 text-center">
              {/* Stat 1: 4+ Years Experience */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-xs flex flex-col items-center justify-center">
                <CountUpNumber target={4} suffix="+" duration={1600} />
                <span className="mt-1.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Years Experience
                </span>
              </div>

              {/* Stat 2: 100% Client Satisfaction */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-xs flex flex-col items-center justify-center">
                <CountUpNumber target={100} suffix="%" duration={1800} />
                <span className="mt-1.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Client Satisfaction
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. THE ZUPE STUDY: PURPOSEFUL RESEARCH & PHILOSOPHY
           ======================================================== */}
        <section className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-gray-900 tracking-tight">
              The Zupe Study: Why We Exist
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed">
              We studied everyday modern living and recognized a pervasive frustration: consumers are
              forced to pick between flimsy generic gadgets or overpriced luxury decor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF7A00] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2 font-display">
                1. Thoughtful Aesthetics
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Form and function must exist in harmony. Every item in our collection features clean,
                minimalist contours and premium finishes that elevate contemporary interiors.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2 font-display">
                2. Problem-Solving Utility
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                We only develop products that solve genuine everyday needs—from quick 30-second garment
                steaming to multi-port wireless chargers and portable wellness heating pads.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <PackageCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2 font-display">
                3. Zero-Compromise Standards
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Every shipment undergoes strict quality vetting before dispatch. With Cash on Delivery,
                prompt door fulfillment across India, and direct WhatsApp support, trust is our core currency.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            4. VOICES OF TRUST: NORMAL STORE BG + CENTER PEEK CAROUSEL
           ======================================================== */}
        <section className="py-12 sm:py-16 bg-[#FAFAFA] border-y border-gray-100 overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* Header with normal store background & balanced typography */}
            <div className="text-center mb-8 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-2.5 border border-emerald-100">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Authentic Customer Experiences</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-gray-900 tracking-tight">
                Voices of Trust
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                Real feedback from verified buyers across India experiencing Zupe Store innovations.
              </p>
            </div>

            {/* Carousel Container with Peek Effect on Left & Right */}
            <div
              ref={containerRef}
              className="relative w-full overflow-hidden py-3"
              onMouseEnter={pauseTemporarily}
              onMouseLeave={resumeImmediately}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
            >
              {/* Sliding Track containing all cards */}
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
                      className={`rounded-2xl sm:rounded-3xl p-6 sm:p-7 transition-all duration-520 select-none flex flex-col justify-between shrink-0 ${
                        isCurrent
                          ? "bg-white border-2 border-orange-200/90 shadow-md ring-1 ring-orange-100/60 scale-100 opacity-100"
                          : "bg-white/85 border border-gray-200/70 shadow-xs scale-[0.92] sm:scale-95 opacity-55 hover:opacity-80 cursor-pointer"
                      }`}
                      style={{
                        width: `${cardWidth}px`,
                        marginRight: `${cardGap}px`,
                      }}
                    >
                      {/* Top Bar: Stars & Quote Icon */}
                      <div>
                        <div className="flex items-center justify-between mb-3.5">
                          {/* 5-Star Rating */}
                          <div className="flex items-center gap-1 text-amber-400">
                            {[...Array(item.rating)].map((_, s) => (
                              <Star key={s} className="w-3.5 h-3.5 fill-current" />
                            ))}
                          </div>
                          {/* Quote Icon */}
                          <Quote className="w-5 h-5 text-orange-200 rotate-180" />
                        </div>

                        {/* Quote Text */}
                        <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed font-normal">
                          &ldquo;{item.quote}&rdquo;
                        </p>
                      </div>

                      {/* Footer: Author Info & Tagged Product */}
                      <div className="mt-5 pt-3.5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-xs sm:text-sm">
                              {item.author}
                            </span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/50">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-400">{item.location}</span>
                        </div>

                        <span className="text-[11px] font-semibold text-[#FF7A00] bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full self-start sm:self-auto">
                          {item.product}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Carousel Controls: Dot Pagination & Prev/Next Chevrons */}
            <div className="mt-5 flex items-center justify-between max-w-md mx-auto px-2">
              {/* Pagination Dots */}
              <div className="flex items-center gap-1.5">
                {VOICES_OF_TRUST.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => {
                      setIsTransitioning(true);
                      setCurrentIndex(dotIdx + 1);
                    }}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      dotIdx === realActiveIndex
                        ? "w-6 bg-[#FF7A00]"
                        : "w-1.5 bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                  />
                ))}
              </div>

              {/* Prev / Next Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={prevSlide}
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-[#FF7A00] hover:border-orange-200 shadow-xs flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Previous review"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-[#FF7A00] hover:border-orange-200 shadow-xs flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Next review"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            5. FINAL CALL TO ACTION (MATCHED SCALE)
           ======================================================== */}
        <section className="py-12 sm:py-16 text-center max-w-xl mx-auto px-4 sm:px-6">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF7A00] flex items-center justify-center mx-auto mb-3.5">
            <Heart className="w-5 h-5 fill-current text-[#FF7A00]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900 tracking-tight">
            Discover What Thoughtful Design Feels Like
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Explore our curated catalog of smart decor and everyday problem solvers. Backed by fast
            shipping, Cash on Delivery, and hassle-free returns.
          </p>
          <div className="mt-5 flex items-center justify-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#111111] text-white text-xs font-bold hover:bg-[#FF7A00] transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
