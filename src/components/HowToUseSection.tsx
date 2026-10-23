"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  HowToUseConfig,
  HowToUseStep,
  HowToUseCardRadius,
  HowToUseCardBorder,
  HowToUseCardShadow,
  HowToUseSectionBg,
} from "@/types/product";

interface HowToUseSectionProps {
  config?: HowToUseConfig;
  className?: string;
}

// Single Step Card with Autoplay IntersectionObserver for Videos & GIFs
function HowToUseCard({
  step,
  index,
  cardRadius,
  cardBorder,
  cardShadow,
}: {
  step: HowToUseStep;
  index: number;
  cardRadius: string;
  cardBorder: string;
  cardShadow: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const stepNumber = String(index + 1).padStart(2, "0");
  const stepBadge = `STEP ${stepNumber}`;

  const isVideo =
    step.media_type === "video" ||
    (step.media_url &&
      (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(step.media_url) ||
        step.media_url.includes("video")));

  const mediaFit = step.media_fit === "cover" ? "cover" : "contain";

  // IntersectionObserver for Autoplay: Play when visible, pause when off-screen
  useEffect(() => {
    if (!isVideo) return;
    const videoEl = videoRef.current;
    const cardEl = cardRef.current;
    if (!videoEl || !cardEl) return;

    // Respect user's accessibility reduced-motion setting
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      videoEl.pause();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
            videoEl.play().catch(() => {
              // Autoplay policy fallback: muted autoplay is supported, catch silent rejections
            });
          } else {
            videoEl.pause();
          }
        });
      },
      {
        threshold: [0, 0.35, 1],
      }
    );

    observer.observe(cardEl);

    return () => {
      observer.disconnect();
    };
  }, [isVideo]);

  const hasMedia = Boolean(step.media_url && step.media_url.trim());
  const hasTitle = Boolean(step.title && step.title.trim());
  const hasDesc = Boolean(step.description && step.description.trim());

  return (
    <div
      ref={cardRef}
      className={`flex flex-col h-full bg-white select-none transition-all duration-200 overflow-hidden ${cardRadius} ${cardBorder} ${cardShadow}`}
    >
      {/* 1. Square 1:1 Media Container with #FFF3E8 background */}
      {hasMedia && (
        <div className="relative w-full aspect-square bg-[#FFF3E8] overflow-hidden flex items-center justify-center shrink-0">
          {isVideo ? (
            <video
              ref={videoRef}
              src={step.media_url}
              poster={step.thumbnail_url}
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={step.title || `${stepBadge} demonstration video`}
              className={`w-full h-full pointer-events-none ${
                mediaFit === "cover"
                  ? "object-cover"
                  : "object-contain p-1.5 sm:p-2"
              }`}
            />
          ) : (
            <img
              src={step.media_url}
              alt={step.title || `${stepBadge} visual guide`}
              loading="lazy"
              className={`w-full h-full pointer-events-none ${
                mediaFit === "cover"
                  ? "object-cover"
                  : "object-contain p-1.5 sm:p-2"
              }`}
            />
          )}
        </div>
      )}

      {/* 2. Text Content: Step Badge, Optional Title, Optional Description */}
      <div className="p-2 sm:p-2.5 flex flex-col flex-1 min-w-0">
        {/* Step Badge (Always displayed automatically in sequential order) */}
        <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#FF7A00] leading-none">
          {stepBadge}
        </span>

        {/* 3. Optional Step Title (Max 1 line, clean ellipsis) */}
        {hasTitle && (
          <h3
            className="text-[11px] sm:text-xs font-bold text-gray-900 leading-snug mt-1 truncate"
            title={step.title}
          >
            {step.title}
          </h3>
        )}

        {/* 4. Optional Description (Max 2 lines, clean ellipsis) */}
        {hasDesc && (
          <p
            className="text-[10px] sm:text-[11px] text-gray-500 leading-snug line-clamp-2 mt-0.5"
            title={step.description}
          >
            {step.description}
          </p>
        )}
      </div>
    </div>
  );
}

export function HowToUseSection({ config, className = "" }: HowToUseSectionProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);

  // Mouse Drag state for Desktop
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const isDraggingRef = useRef(false);

  // 1. Guard conditions: If disabled or 0 steps, do not render anything
  if (!config || config.enabled === false || !Array.isArray(config.steps) || config.steps.length === 0) {
    return null;
  }

  const steps = config.steps;

  // 2. Styling Tokens Mapping
  const sectionBgClass =
    config.section_bg === "soft_gray"
      ? "bg-[#F3F4F6]"
      : config.section_bg === "light_orange"
      ? "bg-[#FFF3E8]"
      : "bg-white";

  const cardRadiusClass =
    config.card_radius === "rounded-xl"
      ? "rounded-xl"
      : config.card_radius === "rounded-3xl"
      ? "rounded-3xl"
      : "rounded-2xl";

  const cardBorderClass =
    config.card_border === "orange"
      ? "border border-[#FF7A00]/40 shadow-[0_0_0_1px_rgba(255,122,0,0.12)]"
      : config.card_border === "none"
      ? "border-0"
      : "border border-gray-100";

  const cardShadowClass =
    config.card_shadow === "none"
      ? "shadow-none"
      : config.card_shadow === "sm"
      ? "shadow-xs"
      : config.card_shadow === "lg"
      ? "shadow-md"
      : "shadow-2xs";

  // Check scroll positions for desktop arrow buttons and mobile active pagination dot
  const updateScrollState = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 6);

    // Compute active step index for mobile pagination dots
    const totalScrollable = el.scrollWidth - el.clientWidth;
    if (totalScrollable > 0) {
      const scrollRatio = el.scrollLeft / totalScrollable;
      const maxIndex = steps.length - 1;
      const newActive = Math.round(scrollRatio * maxIndex);
      setActiveMobileIndex(Math.min(maxIndex, Math.max(0, newActive)));
    } else {
      setActiveMobileIndex(0);
    }
  }, [steps.length]);

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [updateScrollState]);

  // Desktop Navigation Arrow Click Handlers
  const scrollByDirection = (direction: "left" | "right") => {
    const el = carouselRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("div")?.clientWidth || 240;
    const scrollAmount = (cardWidth + 12) * (direction === "left" ? -1 : 1);
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Mouse Drag Scrolling for Desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = carouselRef.current;
    if (!el) return;
    isMouseDownRef.current = true;
    isDraggingRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    e.preventDefault();
    const el = carouselRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 5) {
      isDraggingRef.current = true;
    }
    el.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
  };

  return (
    <section
      aria-label="How to Use"
      className={`w-full py-5 sm:py-7 px-3 sm:px-6 transition-colors duration-200 ${sectionBgClass} ${className}`}
    >
      <div className="max-w-6xl mx-auto">
        {/* 1. SECTION HEADER (Fixed Text, Center-Aligned, Compact Spacing) */}
        <div className="text-center mb-4 sm:mb-5">
          <h2 className="text-[17px] sm:text-[20px] font-display font-extrabold text-[#0F172A] tracking-tight leading-tight">
            How to Use
          </h2>
          <p className="text-[12px] sm:text-[13px] text-gray-500 font-normal mt-0.5 leading-snug">
            See how it works, step by step.
          </p>
        </div>

        {/* Carousel Container with Desktop Arrow Controls */}
        <div className="relative group">
          {/* Desktop Left Navigation Arrow (Hidden on Mobile) */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollByDirection("left")}
              aria-label="Previous step"
              className="hidden md:flex absolute -left-3.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 border border-gray-200/90 text-gray-700 shadow-md items-center justify-center hover:bg-[#FF7A00] hover:text-white hover:border-[#FF7A00] active:scale-95 transition-all duration-150"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}

          {/* Desktop Right Navigation Arrow (Hidden on Mobile) */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollByDirection("right")}
              aria-label="Next step"
              className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 border border-gray-200/90 text-gray-700 shadow-md items-center justify-center hover:bg-[#FF7A00] hover:text-white hover:border-[#FF7A00] active:scale-95 transition-all duration-150"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}

          {/* 2. CARD CAROUSEL (Mobile: Exactly 3 visible cards with 8px gap; Desktop: 4 or 5 cards) */}
          <div
            ref={carouselRef}
            onScroll={updateScrollState}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className="flex items-stretch overflow-x-auto scrollbar-none snap-x snap-mandatory py-1 px-0.5 gap-2 md:gap-3 lg:gap-3.5 cursor-grab active:cursor-grabbing touch-pan-x"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {steps.map((step, idx) => (
              <div
                key={step.id || `step-${idx}`}
                className="shrink-0 snap-start
                  /* Mobile: Exactly 3 cards visible at a time with 8px (gap-2) gap = (100% - 16px) / 3 */
                  w-[calc((100%-16px)/3)] min-w-[96px]
                  /* Tablet / Narrow Desktop: 4 cards visible */
                  md:w-[calc((100%-36px)/4)] md:min-w-0
                  /* Wide Desktop: 5 cards visible */
                  xl:w-[calc((100%-56px)/5)]"
              >
                <HowToUseCard
                  step={step}
                  index={idx}
                  cardRadius={cardRadiusClass}
                  cardBorder={cardBorderClass}
                  cardShadow={cardShadowClass}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 3. Mobile Indicators (Pagination Dots and 'Swipe to explore →' hint) */}
        <div className="mt-3 flex flex-col items-center justify-center gap-1.5 sm:hidden">
          {/* Pagination Dots */}
          {steps.length > 1 && (
            <div
              className="flex items-center justify-center gap-1.5"
              aria-label="Steps pagination"
            >
              {steps.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => {
                    const el = carouselRef.current;
                    if (!el) return;
                    const card = el.children[dotIdx] as HTMLElement | undefined;
                    if (card) {
                      card.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                        inline: "start",
                      });
                    }
                  }}
                  aria-label={`Go to step ${dotIdx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    dotIdx === activeMobileIndex
                      ? "w-4 bg-[#FF7A00]"
                      : "w-1.5 bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Swipe Hint (Compact, clean) */}
          {steps.length > 3 && (
            <span className="text-[10px] font-medium text-gray-400 tracking-tight">
              Swipe to explore &rarr;
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
