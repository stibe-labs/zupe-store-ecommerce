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
  CheckCircle2,
  PackageCheck,
  Award,
  Truck,
  Headphones,
  BadgeCheck,
  CreditCard,
  Package,
  Plane,
  Lock,
  MessageCircle,
  Check,
  ChevronRight as BreadcrumbChevron,
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
    <div ref={ref} className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#001D40] tracking-tight">
      {count.toLocaleString()}
      {suffix}
    </div>
  );
}

// Authentic Vittal Digital core trust promises
const TRUST_ITEMS = [
  { icon: Package, title: "Dubai Sourced", sub: "Original Products" },
  { icon: BadgeCheck, title: "100% Genuine", sub: "Authentic & Verified" },
  { icon: Award, title: "Warranty Across India", sub: "Hassle-free Support" },
  { icon: CreditCard, title: "Secure Payments", sub: "UPI, Cards, Net Banking" },
  { icon: Truck, title: "Express Delivery", sub: "5-7 Days Across India" },
];

// Authentic Vittal Digital customer reviews
const VOICES_OF_TRUST = [
  {
    id: 1,
    quote:
      "A seamless shopping experience from order to unboxing. Sourced directly from Dubai, delivery took only 3 days to Mumbai, and the device arrived 100% brand new with intact manufacturer seal.",
    author: "Rahul M.",
    location: "Mumbai, Maharashtra",
    product: "UltraSlim Laptop 14 OLED",
    rating: 5,
  },
  {
    id: 2,
    quote:
      "I was skeptical about buying imported electronics online, but Vittal Digital's WhatsApp team shared dispatch photos and verified serial numbers before shipping. The 1-year warranty coverage gave me complete peace of mind.",
    author: "Vikram S.",
    location: "Bengaluru, Karnataka",
    product: "Smart Watch Pro",
    rating: 5,
  },
  {
    id: 3,
    quote:
      "Received the ANC Wireless Earbuds in factory-sealed Dubai retail packaging. Sound quality and battery life are extraordinary. Incredible value compared to Indian retail prices.",
    author: "Ananya P.",
    location: "New Delhi, Delhi NCR",
    product: "Wireless Earbuds ANC",
    rating: 5,
  },
  {
    id: 4,
    quote:
      "Customer support on WhatsApp is lightning-fast and courteous. They confirmed Dubai retail stock and warranty registration steps. The tablet arrived with insured air courier in pristine condition.",
    author: "Karthik R.",
    location: "Hyderabad, Telangana",
    product: "Everyday Tablet 11",
    rating: 5,
  },
  {
    id: 5,
    quote:
      "Genuine Dubai import with full Indian 5G band support and original power adapter. The display and quad Dolby speakers are incredible for productivity and streaming.",
    author: "Siddharth N.",
    location: "Kochi, Kerala",
    product: "UltraBook Pro 15",
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
      : Math.floor(containerWidth * 0.84)
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
    }, 4000);
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between selection:bg-[#002D62] selection:text-white font-sans">
      <Navbar />

      <main className="flex-1">
        {/* ========================================================
            1. HERO SECTION: BRAND INTRODUCTION
           ======================================================== */}
        <section className="relative pt-6 sm:pt-10 pb-12 sm:pb-16 bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC] border-b border-slate-200/80 overflow-hidden">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden opacity-60">
            <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-blue-100/50 blur-3xl" />
            <div className="absolute top-10 right-1/4 w-80 h-80 rounded-full bg-amber-50/60 blur-3xl" />
          </div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
            {/* Clean Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
              <Link href="/" className="hover:text-[#002D62] transition-colors">
                Home
              </Link>
              <BreadcrumbChevron className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-800">About Us</span>
            </nav>

            <div className="text-center max-w-3xl mx-auto">
              {/* Tagline Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-semibold text-[#002D62] mb-4 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#002D62]" />
                <span>Dubai Retail Direct Sourcing • 100% Factory Sealed</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight leading-tight">
                The Vittal Digital Story
              </h1>

              {/* Subtitle */}
              <p className="mt-4 text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
                We bring world-class flagship consumer electronics directly from authorized Dubai retail and duty-free hubs to doorstep locations across India. Enjoy authentic, factory-sealed hardware with 1-year comprehensive warranty support and rapid insured air logistics.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            TRUST STRIP (Dubai Sourced, Genuine, Warranty, etc.)
           ======================================================== */}
        <section className="py-5 sm:py-6 border-b border-slate-200/80 bg-white shadow-2xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {TRUST_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[#002D62]" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-tight mt-0.5">
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
        <section className="py-8 sm:py-12 border-b border-slate-200/80 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Stat 1 */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 sm:p-6 text-center transition-all hover:bg-white hover:shadow-md">
                <CountUpNumber target={100} suffix="%" duration={1600} />
                <span className="block mt-2 text-xs sm:text-sm font-semibold text-slate-900">
                  Dubai Retail Stock
                </span>
                <span className="block mt-0.5 text-[11px] sm:text-xs text-slate-500 font-medium">
                  100% Factory Sealed & Genuine
                </span>
              </div>

              {/* Stat 2 */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 sm:p-6 text-center transition-all hover:bg-white hover:shadow-md">
                <CountUpNumber target={1} suffix=" Yr" duration={1400} />
                <span className="block mt-2 text-xs sm:text-sm font-semibold text-slate-900">
                  Pan-India Warranty
                </span>
                <span className="block mt-0.5 text-[11px] sm:text-xs text-slate-500 font-medium">
                  Dedicated service & replacement
                </span>
              </div>

              {/* Stat 3 */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 sm:p-6 text-center transition-all hover:bg-white hover:shadow-md">
                <CountUpNumber target={15000} suffix="+" duration={1800} />
                <span className="block mt-2 text-xs sm:text-sm font-semibold text-slate-900">
                  Happy Tech Buyers
                </span>
                <span className="block mt-0.5 text-[11px] sm:text-xs text-slate-500 font-medium">
                  Delivered across 28 states
                </span>
              </div>

              {/* Stat 4 */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 sm:p-6 text-center transition-all hover:bg-white hover:shadow-md">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#001D40] tracking-tight">5–7 Days</div>
                <span className="block mt-2 text-xs sm:text-sm font-semibold text-slate-900">
                  Avg. Insured Air Delivery
                </span>
                <span className="block mt-0.5 text-[11px] sm:text-xs text-slate-500 font-medium">
                  Priority insured air courier
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. CORE VALUE PILLARS
           ======================================================== */}
        <section className="py-12 sm:py-16 lg:py-20 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#002D62] bg-blue-50 px-3 py-1 rounded-full border border-blue-200/70 inline-block mb-3">
              The Vittal Digital Guarantee
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight">
              Why Discerning Buyers Choose Us
            </h2>
            <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              We eliminate middlemen and grey-market uncertainty by providing a certified bridge between official Dubai retail distributors and Indian technology enthusiasts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#002D62] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform border border-blue-100">
                  <BadgeCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
                  100% Genuine Dubai Stock
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Direct procurement from authorized Dubai duty-free and retail hubs. Each item arrives brand new in sealed manufacturer retail packaging with serial number authenticity.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-medium text-[#002D62]">
                <Check className="w-3.5 h-3.5" />
                <span>Verified Seals</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform border border-amber-200/60">
                  <ShieldCheck className="w-6 h-6 text-[#002D62]" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
                  1-Year Pan-India Warranty
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Enjoy complete peace of mind with 1-Year Comprehensive Warranty coverage, backed by our technical repair centers and dedicated doorstep assistance across India.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-medium text-[#002D62]">
                <Check className="w-3.5 h-3.5" />
                <span>All-India Service</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform border border-emerald-100">
                  <Plane className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
                  Express Insured Air Cargo
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Priority air logistics with 100% transit insurance. Track your parcel in real-time with automated SMS and WhatsApp milestone notifications right to your doorstep.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                <Check className="w-3.5 h-3.5" />
                <span>5-7 Business Days</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform border border-purple-100">
                  <Headphones className="w-6 h-6 text-[#002D62]" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
                  Live WhatsApp Care
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Real human technical care available via WhatsApp (+91 916238165935). Need live unboxing advice, tracking updates, or setup help? We are just a message away.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-medium text-[#002D62]">
                <Check className="w-3.5 h-3.5" />
                <span>Instant Responses</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            4. HOW THE DUBAI-TO-INDIA BRIDGE WORKS
           ======================================================== */}
        <section className="py-12 sm:py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#002D62] bg-blue-50 px-3 py-1 rounded-full border border-blue-200/70 inline-block mb-3">
                Seamless Logistics Process
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
                From Dubai Hubs Directly to Your Hands
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 font-normal">
                Every order follows our strict 4-step quality, clearance, and courier workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {[
                {
                  step: "01",
                  title: "Authorized Procurement",
                  desc: "We procure authentic units directly from certified Dubai electronics retail distributors and authorized channels.",
                },
                {
                  step: "02",
                  title: "Dual Seal Verification",
                  desc: "Our quality team verifies manufacturer tamper-evident seals, serial registration, and original accessory sets.",
                },
                {
                  step: "03",
                  title: "Insured Air Cargo",
                  desc: "Parcels are dispatched through air logistics with 100% loss-and-damage transit insurance coverage.",
                },
                {
                  step: "04",
                  title: "Doorstep Handover",
                  desc: "Delivered to your door with live tracking and WhatsApp customer support for easy warranty activation.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-blue-50/40 transition-colors"
                >
                  <span className="text-3xl font-semibold text-[#002D62]/25 font-mono block mb-2">
                    {item.step}
                  </span>
                  <h4 className="text-sm sm:text-base font-semibold text-slate-900 mb-2">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
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
        <section className="py-14 sm:py-20 bg-gradient-to-b from-[#F8FAFC] to-white overflow-hidden border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#002D62] text-xs font-semibold uppercase tracking-wider mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-[#002D62]" />
                <span>Verified Buyer Reviews</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
                Voices of Trust Across India
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-md mx-auto font-normal">
                Real customer feedback from tech enthusiasts and professionals who upgraded with Vittal Digital.
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
                          ? "bg-white border-blue-200 shadow-xl scale-100 opacity-100 ring-1 ring-blue-100"
                          : "bg-white/80 border-slate-200/80 shadow-xs scale-[0.93] sm:scale-95 opacity-55 hover:opacity-85 cursor-pointer"
                      }`}
                      style={{
                        width: `${cardWidth}px`,
                        marginRight: `${cardGap}px`,
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1 text-amber-400">
                            {[...Array(item.rating)].map((_, s) => (
                              <Star key={s} className="w-4 h-4 fill-current" />
                            ))}
                          </div>
                          <Quote className="w-6 h-6 text-slate-200 rotate-180" />
                        </div>

                        <p className="text-xs sm:text-sm md:text-base text-slate-700 leading-relaxed font-normal">
                          &ldquo;{item.quote}&rdquo;
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                              {item.author}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Verified Buyer
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-normal">{item.location}</span>
                        </div>

                        <span className="text-[11px] font-medium text-[#002D62] bg-blue-50 border border-blue-100 px-3 py-1 rounded-full self-start sm:self-auto">
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
                        ? "w-8 bg-[#001D40]"
                        : "w-2 bg-slate-300 hover:bg-slate-400"
                    }`}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={prevSlide}
                  className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs flex items-center justify-center transition-all cursor-pointer hover:border-slate-300"
                  aria-label="Previous review"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs flex items-center justify-center transition-all cursor-pointer hover:border-slate-300"
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
        <section className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl bg-[#001D40] text-white p-8 sm:p-12 md:p-14 text-center relative overflow-hidden shadow-2xl">
            {/* Ambient Lighting Gradients */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-white/90 mb-4 border border-white/15">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Ready to Upgrade Your Electronics?</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white tracking-tight leading-tight">
                Experience Genuine Dubai Tech Delivered Across India
              </h2>

              <p className="mt-3.5 text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed font-normal max-w-xl mx-auto">
                Explore our curated catalog of brand-new laptops, tablets, smartwatches, and premium audio with comprehensive 1-year warranty and priority insured air shipping.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/products"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-slate-100 text-[#001D40] text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <span>Explore All Products</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%20Vittal%20Digital%2C%20I%20have%20an%20inquiry%20about%20a%20product`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
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
