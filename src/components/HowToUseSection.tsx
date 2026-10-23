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
  previewMode?: "mobile" | "desktop" | "auto";
  isPreview?: boolean;
}

// Single Step Card with Autoplay IntersectionObserver for Videos & GIFs
function HowToUseCard({
  step,
  index,
  cardRadius,
  cardBorder,
  cardShadow,
  isPreview = false,
  isMobilePreview = false,
}: {
  step: HowToUseStep;
  index: number;
  cardRadius: string;
  cardBorder: string;
  cardShadow: string;
  isPreview?: boolean;
  isMobilePreview?: boolean;
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
      {hasMedia ? (
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
      ) : (
        <div className="relative w-full aspect-square bg-[#FFF3E8]/85 border-b border-[#FF7A00]/10 flex flex-col items-center justify-center p-2 text-center shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#FF7A00]/10 flex items-center justify-center mb-1 text-[#FF7A00]">
            <svg
              className="w-4 h-4 stroke-[2]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
          <span className="text-[9px] font-bold text-[#FF7A00]/80 uppercase tracking-wider">
            {isPreview ? "Upload Media" : stepBadge}
          </span>
        </div>
      )}

      {/* 2. Text Content: Step Badge, Optional Title, Optional Description */}
      <div className={`flex flex-col flex-1 min-w-0 ${isMobilePreview ? "p-2" : "p-2 sm:p-2.5"}`}>
        {/* Step Badge (Always displayed automatically in sequential order) */}
        <span className={`font-extrabold uppercase tracking-wider text-[#FF7A00] leading-none ${
          isMobilePreview ? "text-[10px]" : "text-[10px] sm:text-[11px]"
        }`}>
          {stepBadge}
        </span>

        {/* 3. Optional Step Title (Max 1 line, clean ellipsis) */}
        {hasTitle ? (
          <h3
            className={`font-bold text-gray-900 leading-snug mt-1 truncate ${
              isMobilePreview ? "text-[11px]" : "text-[11px] sm:text-xs"
            }`}
            title={step.title}
          >
            {step.title}
          </h3>
        ) : isPreview ? (
          <h3 className={`font-semibold text-gray-400 italic leading-snug mt-1 truncate ${
            isMobilePreview ? "text-[11px]" : "text-[11px] sm:text-xs"
          }`}>
            Step Title...
          </h3>
        ) : null}

        {/* 4. Optional Description (Max 2 lines, clean ellipsis) */}
        {hasDesc ? (
          <p
            className={`text-gray-500 leading-snug line-clamp-2 mt-0.5 ${
              isMobilePreview ? "text-[10px]" : "text-[10px] sm:text-[11px]"
            }`}
            title={step.description}
          >
            {step.description}
          </p>
        ) : isPreview ? (
          <p className={`text-gray-300 italic leading-snug line-clamp-2 mt-0.5 ${
            isMobilePreview ? "text-[10px]" : "text-[10px] sm:text-[11px]"
          }`}>
            Short instructions...
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function HowToUseSection({
  config,
  className = "",
  previewMode = "auto",
  isPreview = false,
}: HowToUseSectionProps) {
  const isMobilePreview = previewMode === "mobile";
  const isDesktopPreview = previewMode === "desktop";
  const isPreviewActive = isMobilePreview || isDesktopPreview || isPreview;

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
      className={`w-full transition-colors duration-200 ${sectionBgClass} ${
        isMobilePreview
          ? "py-4 px-3"
          : isDesktopPreview
          ? "py-5 px-5"
          : "py-5 sm:py-7 px-3 sm:px-6"
      } ${className}`}
    >
      <div className={isMobilePreview ? "w-full" : "max-w-6xl mx-auto"}>
        {/* 1. SECTION HEADER (Fixed Text, Center-Aligned, Compact Spacing) */}
        <div className="text-center mb-3 sm:mb-4">
          <h2
            className={`font-display font-extrabold text-[#0F172A] tracking-tight leading-tight ${
              isMobilePreview ? "text-[16px]" : "text-[17px] sm:text-[20px]"
            }`}
          >
            How to Use
          </h2>
          <p
            className={`text-gray-500 font-normal mt-0.5 leading-snug ${
              isMobilePreview ? "text-[11px]" : "text-[12px] sm:text-[13px]"
            }`}
          >
            See how it works, step by step.
          </p>
        </div>

        {/* Carousel Container with Desktop Arrow Controls */}
        <div className="relative group">
          {/* Desktop Left Navigation Arrow (Hidden in Mobile Preview) */}
          {!isMobilePreview && canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollByDirection("left")}
              aria-label="Previous step"
              className={`${
                isDesktopPreview ? "flex" : "hidden md:flex"
              } absolute -left-3.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 border border-gray-200/90 text-gray-700 shadow-md items-center justify-center hover:bg-[#FF7A00] hover:text-white hover:border-[#FF7A00] active:scale-95 transition-all duration-150`}
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}

          {/* Desktop Right Navigation Arrow (Hidden in Mobile Preview) */}
          {!isMobilePreview && canScrollRight && (
            <button
              type="button"
              onClick={() => scrollByDirection("right")}
              aria-label="Next step"
              className={`${
                isDesktopPreview ? "flex" : "hidden md:flex"
              } absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 border border-gray-200/90 text-gray-700 shadow-md items-center justify-center hover:bg-[#FF7A00] hover:text-white hover:border-[#FF7A00] active:scale-95 transition-all duration-150`}
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}

          {/* 2. CARD CAROUSEL */}
          <div
            ref={carouselRef}
            onScroll={updateScrollState}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={`flex items-stretch overflow-x-auto scrollbar-none snap-x snap-mandatory py-1 px-0.5 cursor-grab active:cursor-grabbing touch-pan-x ${
              isMobilePreview
                ? "gap-2"
                : isDesktopPreview
                ? "gap-3"
                : "gap-2 md:gap-3 lg:gap-3.5"
            } ${
              steps.length === 1 && (isMobilePreview || isDesktopPreview)
                ? "justify-center"
                : ""
            }`}
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {steps.map((step, idx) => {
              let widthClass = "";
              if (isMobilePreview) {
                if (steps.length === 1) {
                  widthClass = "w-[190px] shrink-0";
                } else if (steps.length === 2) {
                  widthClass = "w-[calc((100%-8px)/2)] shrink-0";
                } else {
                  // Exactly 3 cards visible side-by-side on mobile: (100% - 16px) / 3
                  widthClass = "w-[calc((100%-16px)/3)] shrink-0 snap-start";
                }
              } else if (isDesktopPreview) {
                if (steps.length === 1) {
                  widthClass = "w-[220px] shrink-0";
                } else if (steps.length === 2) {
                  widthClass = "w-[240px] shrink-0";
                } else if (steps.length === 3) {
                  widthClass = "w-[calc((100%-24px)/3)] shrink-0";
                } else if (steps.length === 4) {
                  widthClass = "w-[calc((100%-36px)/4)] shrink-0";
                } else {
                  widthClass = "w-[calc((100%-48px)/5)] shrink-0 snap-start";
                }
              } else {
                // Live storefront responsive layout:
                if (steps.length === 1) {
                  widthClass = "w-[200px] sm:w-[220px] md:w-[240px] shrink-0 mx-auto";
                } else if (steps.length === 2) {
                  widthClass = "w-[calc((100%-8px)/2)] sm:w-[calc((100%-12px)/2)] md:w-[240px] shrink-0";
                } else {
                  widthClass = "shrink-0 snap-start w-[calc((100%-16px)/3)] min-w-[96px] md:w-[calc((100%-36px)/4)] md:min-w-0 xl:w-[calc((100%-56px)/5)]";
                }
              }

              return (
                <div key={step.id || `step-${idx}`} className={widthClass}>
                  <HowToUseCard
                    step={step}
                    index={idx}
                    cardRadius={cardRadiusClass}
                    cardBorder={cardBorderClass}
                    cardShadow={cardShadowClass}
                    isPreview={isPreviewActive}
                    isMobilePreview={isMobilePreview}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Mobile Indicators (Pagination Dots and 'Swipe to explore →' hint) */}
        <div
          className={`mt-3 items-center justify-center gap-1.5 ${
            isMobilePreview
              ? "flex flex-col"
              : isDesktopPreview
              ? "hidden"
              : "flex flex-col sm:hidden"
          }`}
        >
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

          {/* Swipe Hint */}
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
