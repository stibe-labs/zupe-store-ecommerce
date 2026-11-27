"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogos";

const BRANDS = [
  { name: "Optimum Nutrition", query: "Optimum" },
  { name: "Nike", query: "Nike" },
  { name: "MuscleTech", query: "MuscleTech" },
  { name: "Adidas", query: "Adidas" },
  { name: "Ferrero Rocher", query: "Ferrero" },
  { name: "Lindt", query: "Lindt" },
  { name: "Royal Medjool", query: "Medjool" },
  { name: "Sports Research", query: "Whey" },
  { name: "GNC", query: "Protein" },
];

// Repeat 3 times for seamless wrapping on mobile
const MOBILE_BRANDS = [...BRANDS, ...BRANDS, ...BRANDS];

export function GlobalBrandsMarquee() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationId: number;
    let isInteracting = false;
    let resumeTimer: NodeJS.Timeout;

    // Single set width (1/3 of total duplicate track)
    let singleSetWidth = container.scrollWidth / 3;
    let currentScroll = singleSetWidth > 0 ? singleSetWidth : 0;
    container.scrollLeft = currentScroll;

    // Slow, smooth drift speed towards the right (~30px/sec at 60fps)
    const speed = 0.5;

    const tick = () => {
      if (!isInteracting && container) {
        currentScroll -= speed; // Decreasing scrollLeft moves content to the right (→)

        if (singleSetWidth > 0) {
          if (currentScroll <= 0) {
            currentScroll += singleSetWidth;
          } else if (currentScroll >= singleSetWidth * 2) {
            currentScroll -= singleSetWidth;
          }
        }

        container.scrollLeft = currentScroll;
      }
      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);

    const handleTouchStart = () => {
      isInteracting = true;
      clearTimeout(resumeTimer);
    };

    const handleTouchEnd = () => {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        if (container) {
          currentScroll = container.scrollLeft;
        }
        isInteracting = false;
      }, 1200);
    };

    const handleScroll = () => {
      if (isInteracting && container) {
        currentScroll = container.scrollLeft;
        if (singleSetWidth > 0) {
          if (currentScroll <= 0) {
            currentScroll += singleSetWidth;
            container.scrollLeft = currentScroll;
          } else if (currentScroll >= singleSetWidth * 2) {
            currentScroll -= singleSetWidth;
            container.scrollLeft = currentScroll;
          }
        }
      }
    };

    const handleResize = () => {
      if (container) {
        singleSetWidth = container.scrollWidth / 3;
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    container.addEventListener("mousedown", handleTouchStart);
    container.addEventListener("mouseup", handleTouchEnd);
    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(resumeTimer);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
      container.removeEventListener("mousedown", handleTouchStart);
      container.removeEventListener("mouseup", handleTouchEnd);
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden py-0.5">
      {/* Subtle fade edges on mobile */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-white to-transparent z-10 md:hidden" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-white to-transparent z-10 md:hidden" />

      {/* Mobile View: Continuous Slow Drift to Right + Touch Swipable */}
      <div
        ref={scrollRef}
        className="flex md:hidden items-center gap-2.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden select-none"
      >
        {MOBILE_BRANDS.map((brand, idx) => (
          <Link
            key={`mob-${brand.name}-${idx}`}
            href={`/products?search=${encodeURIComponent(brand.query)}`}
            title={brand.name}
            aria-label={brand.name}
            className="shrink-0 py-1 px-1 flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity"
          >
            <BrandLogo
              brand={brand.name}
              className="h-4 w-auto max-w-[85px] object-contain"
            />
          </Link>
        ))}
      </div>

      {/* Desktop View: Clean Row with Reduced Gaps and No Outline */}
      <div className="hidden md:flex items-center justify-between gap-3 lg:gap-5 w-full">
        {BRANDS.map((brand) => (
          <Link
            key={brand.name}
            href={`/products?search=${encodeURIComponent(brand.query)}`}
            title={brand.name}
            aria-label={brand.name}
            className="shrink-0 py-1 px-1.5 flex items-center justify-center opacity-85 hover:opacity-100 transition-all duration-200 group"
          >
            <BrandLogo
              brand={brand.name}
              className="h-4.5 lg:h-5 w-auto max-w-[95px] lg:max-w-[110px] object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
