"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DEFAULT_PROMO_BANNERS, PromoBannerCard } from "@/lib/storeContent";

interface PromoBannersProps {
  banners?: PromoBannerCard[];
}

export function PromoBanners({ banners: propsBanners }: PromoBannersProps) {
  const [cards, setCards] = useState<PromoBannerCard[]>(propsBanners || DEFAULT_PROMO_BANNERS);

  // Mobile Carousel State (0 -> 1 -> 2, where 2 is seamless loop clone of 0)
  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Touch tracking for mobile swipe
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Sync if props change (for admin live preview)
  useEffect(() => {
    if (propsBanners && Array.isArray(propsBanners) && propsBanners.length === 2) {
      setCards(propsBanners);
    }
  }, [propsBanners]);

  // Fetch dynamically on public storefront if no props passed
  useEffect(() => {
    if (!propsBanners) {
      fetch("/api/content/promo-banners")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.banners) && data.banners.length === 2) {
            setCards(data.banners);
          }
        })
        .catch((err) => console.warn("Failed to fetch promo banners:", err));
    }
  }, [propsBanners]);

  const card1 = cards[0] || DEFAULT_PROMO_BANNERS[0];
  const card2 = cards[1] || DEFAULT_PROMO_BANNERS[1];

  // Mobile cyclic slides: [Card 1, Card 2, Card 1 (loop copy)]
  const mobileSlides = [
    { card: card1, isAuto: false, key: "m-card-1" },
    { card: card2, isAuto: true, key: "m-card-2" },
    { card: card1, isAuto: false, key: "m-card-1-clone" },
  ];

  // Mobile Automatic Sliding:
  // Shows 1 card, pauses 2 seconds, then smoothly slides next card from right to left, and repeats continuously
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setActiveSlide((prev) => prev + 1);
    }, 2650); // 2000ms stay + 650ms slide transition

    return () => clearInterval(timer);
  }, [isPaused]);

  // Seamless infinite loop reset when clone slide finishes
  const handleTransitionEnd = () => {
    if (activeSlide >= 2) {
      setIsTransitioning(false);
      setActiveSlide(0);
    }
  };

  // Mobile touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (diff > 40) {
        // Swiped Left -> Advance to next card from right
        setIsTransitioning(true);
        setActiveSlide((prev) => (prev >= 2 ? 1 : prev + 1));
      } else if (diff < -40) {
        // Swiped Right -> Go to previous card
        if (activeSlide === 0) {
          setIsTransitioning(false);
          setActiveSlide(2);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setIsTransitioning(true);
              setActiveSlide(1);
            });
          });
        } else {
          setIsTransitioning(true);
          setActiveSlide((prev) => prev - 1);
        }
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const goToSlide = (targetIdx: number) => {
    setIsTransitioning(true);
    setActiveSlide(targetIdx);
  };

  const getBackgroundStyle = (card: PromoBannerCard) => {
    const bg = card.bgColor || "#F9EFE7";
    if (
      bg.startsWith("#") ||
      bg.startsWith("rgb") ||
      bg.startsWith("hsl") ||
      bg.startsWith("linear-gradient")
    ) {
      return { background: bg };
    }
    return {};
  };

  const getBackgroundClass = (card: PromoBannerCard, defaultClasses: string) => {
    const bg = card.bgColor || "";
    if (
      bg.startsWith("#") ||
      bg.startsWith("rgb") ||
      bg.startsWith("hsl") ||
      bg.startsWith("linear-gradient")
    ) {
      return "";
    }
    return bg || defaultClasses;
  };

  // Reusable single card renderer
  const renderCard = (card: PromoBannerCard, isAuto: boolean) => {
    if (!isAuto) {
      // Everyday Essentials Card
      return (
        <div
          className={`relative rounded-3xl overflow-hidden p-5 sm:p-7 md:p-8 flex items-center justify-between min-h-[200px] sm:min-h-[240px] shadow-sm transition-all duration-300 w-full ${getBackgroundClass(
            card,
            "bg-gradient-to-r from-[#F9EFE7] via-[#F4E6DC] to-[#EEDCCF]"
          )}`}
          style={getBackgroundStyle(card)}
        >
          <div className="flex-1 min-w-0 pr-2 sm:pr-3 z-10 space-y-2 sm:space-y-3">
            <h3
              className="text-lg sm:text-2xl lg:text-3xl font-display font-extrabold leading-tight whitespace-pre-line tracking-tight"
              style={{ color: card.textColor || "#1A1A1A" }}
            >
              {card.title || "Upgrade Your\nEveryday Essentials"}
            </h3>
            <p
              className="text-xs sm:text-sm font-medium whitespace-pre-line line-clamp-2"
              style={{ color: card.subtitleColor || "#4B5563" }}
            >
              {card.subtitle || "Smart products for a smarter lifestyle."}
            </p>
            <div className="pt-0.5 sm:pt-1">
              <Link
                href={card.ctaLink || "/products"}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all group select-none cursor-pointer"
                style={{
                  backgroundColor: card.btnBgColor || "#1A1A1A",
                  color: card.btnTextColor || "#FFFFFF",
                }}
              >
                <span>{card.ctaText || "Explore Now"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Product Image Collage */}
          <div className="relative w-36 sm:w-48 md:w-56 h-28 sm:h-36 md:h-44 flex-shrink-0 flex items-center justify-end">
            {card.image2 ? (
              <>
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-xl sm:rounded-2xl overflow-hidden shadow-md -mr-3 sm:-mr-4 z-10 border-2 border-white">
                  <Image
                    src={card.image1 || "/products/thermal-printer.jpg"}
                    alt={card.title || "Product 1"}
                    fill
                    unoptimized={card.image1?.startsWith("data:") || card.image1?.startsWith("http")}
                    className="object-cover object-bottom"
                  />
                </div>
                <div className="relative w-18 h-18 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl sm:rounded-2xl overflow-hidden shadow-md border-2 border-white">
                  <Image
                    src={card.image2}
                    alt={card.title || "Product 2"}
                    fill
                    unoptimized={card.image2?.startsWith("data:") || card.image2?.startsWith("http")}
                    className="object-cover object-bottom"
                  />
                </div>
              </>
            ) : (
              <div className="relative w-32 sm:w-44 md:w-52 h-26 sm:h-34 md:h-40 rounded-xl sm:rounded-2xl overflow-hidden shadow-md border-2 border-white/80">
                <Image
                  src={card.image1 || "/products/thermal-printer.jpg"}
                  alt={card.title || "Product"}
                  fill
                  unoptimized={card.image1?.startsWith("data:") || card.image1?.startsWith("http")}
                  className="object-cover object-bottom"
                />
              </div>
            )}
          </div>
        </div>
      );
    }

    // Auto Essentials Card (Optimized: Reduced image size on mobile to remove congestion)
    return (
      <div
        className={`relative rounded-3xl overflow-hidden p-5 sm:p-7 md:p-8 flex items-center justify-between min-h-[200px] sm:min-h-[240px] shadow-sm transition-all duration-300 w-full ${getBackgroundClass(
          card,
          "bg-gradient-to-r from-[#1F2329] via-[#171B20] to-[#0F1216]"
        )}`}
        style={getBackgroundStyle(card)}
      >
        <div className="flex-1 min-w-0 pr-3 sm:pr-4 z-10 space-y-2 sm:space-y-3">
          <h3
            className="text-lg sm:text-2xl lg:text-3xl font-display font-extrabold leading-tight whitespace-pre-line tracking-tight"
            style={{ color: card.textColor || "#FFFFFF" }}
          >
            {card.title || "Auto Essentials"}
          </h3>
          <p
            className="text-xs sm:text-sm font-medium whitespace-pre-line line-clamp-2"
            style={{ color: card.subtitleColor || "#9CA3AF" }}
          >
            {card.subtitle || "Drive in Style and Comfort."}
          </p>
          <div className="pt-0.5 sm:pt-1">
            <Link
              href={card.ctaLink || "/products?category=Auto+Essentials"}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all group select-none cursor-pointer"
              style={{
                backgroundColor: card.btnBgColor || "#FFFFFF",
                color: card.btnTextColor || "#111111",
              }}
            >
              <span className="font-extrabold">{card.ctaText || "Shop Now"}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Right Product Image: Reduced slightly on mobile from w-48 to w-32 for clean breathing room */}
        <div className="relative w-32 sm:w-44 md:w-52 lg:w-60 h-24 sm:h-32 md:h-40 lg:h-44 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg border border-white/10">
          <Image
            src={card.image1 || "/products/helicopter-perfume.jpg"}
            alt={card.title || "Auto Essentials"}
            fill
            unoptimized={card.image1?.startsWith("data:") || card.image1?.startsWith("http")}
            className="object-cover object-bottom"
          />
        </div>
      </div>
    );
  };

  const activeDotIndex = activeSlide % 2;

  return (
    <section className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-5 select-none">
      {/* ========================================================
          DESKTOP VIEW (>= md): Clean 2-column side-by-side grid
         ======================================================== */}
      <div className="hidden md:grid md:grid-cols-2 gap-6">
        {renderCard(card1, false)}
        {renderCard(card2, true)}
      </div>

      {/* ========================================================
          MOBILE VIEW (< md): Automatic 1-row sliding carousel
          (1 card at a time, pauses 2 seconds, then smoothly slides
          the next card from the right side and repeats infinitely)
         ======================================================== */}
      <div className="block md:hidden">
        <div
          className="relative w-full overflow-hidden rounded-3xl"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            onTransitionEnd={handleTransitionEnd}
            style={{
              transform: `translate3d(-${activeSlide * 100}%, 0, 0)`,
              transition: isTransitioning
                ? "transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)"
                : "none",
            }}
            className="flex w-full will-change-transform"
          >
            {mobileSlides.map((slide, idx) => (
              <div key={`${slide.key}-${idx}`} className="w-full flex-shrink-0">
                {renderCard(slide.card, slide.isAuto)}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Outpickz-Style Carousel Dots Indicator */}
        <div className="flex items-center justify-center gap-1.5 mt-2.5">
          <button
            onClick={() => goToSlide(0)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              activeDotIndex === 0 ? "w-6 bg-[#FF7A00]" : "w-2 bg-slate-300"
            }`}
            aria-label="Everyday Essentials banner"
          />
          <button
            onClick={() => goToSlide(1)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              activeDotIndex === 1 ? "w-6 bg-[#FF7A00]" : "w-2 bg-slate-300"
            }`}
            aria-label="Auto Essentials banner"
          />
        </div>
      </div>
    </section>
  );
}
