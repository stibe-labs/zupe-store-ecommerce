"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DEFAULT_HERO_BANNERS, HeroBannerSlide } from "@/lib/storeContent";

interface HeroSectionProps {
  initialBanners?: HeroBannerSlide[];
}

export function HeroSection({ initialBanners }: HeroSectionProps = {}) {
  const [slides, setSlides] = useState<HeroBannerSlide[]>(() => {
    if (initialBanners && initialBanners.length > 0) {
      return initialBanners;
    }
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("zp_hero_banners_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return DEFAULT_HERO_BANNERS;
  });
  const [[currentSlide, direction], setSlide] = useState<[number, number]>([0, 1]);
  const [isPaused, setIsPaused] = useState(false);

  // Touch swipe tracking
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Keep state synchronized with server-passed initialBanners and persist to cache
  useEffect(() => {
    if (initialBanners && initialBanners.length > 0) {
      setSlides(initialBanners);
      try {
        localStorage.setItem("zp_hero_banners_cache", JSON.stringify(initialBanners));
      } catch (e) {}
    }
  }, [initialBanners]);

  useEffect(() => {
    fetch("/api/content/banners")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.banners) && data.banners.length > 0) {
          setSlides(data.banners);
          try {
            localStorage.setItem("zp_hero_banners_cache", JSON.stringify(data.banners));
          } catch (e) {}
        }
      })
      .catch((err) => console.warn("Failed to fetch dynamic hero banners:", err));
  }, []);

  const totalSlides = slides.length;

  const paginate = useCallback(
    (newDirection: number) => {
      if (totalSlides <= 1) return;
      setSlide(([prevSlide]) => {
        const nextIndex = (prevSlide + newDirection + totalSlides) % totalSlides;
        return [nextIndex, newDirection];
      });
    },
    [totalSlides]
  );

  // Auto-advance slides every 3 seconds (3000ms) with pause on hover
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    const timer = setInterval(() => {
      paginate(1);
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused, totalSlides, paginate]);

  const activeIndex = totalSlides > 0 ? currentSlide % totalSlides : 0;
  const slide = slides[activeIndex] || DEFAULT_HERO_BANNERS[0];

  // Touch handlers for mobile swipe
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
      const minSwipeDistance = 40;
      if (diff > minSwipeDistance) {
        // Swiped Left -> show next card from right
        paginate(1);
      } else if (diff < -minSwipeDistance) {
        // Swiped Right -> show previous card from left
        paginate(-1);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const goToSlide = (targetIndex: number) => {
    if (targetIndex === activeIndex) return;
    const dir = targetIndex > activeIndex ? 1 : -1;
    setSlide([targetIndex, dir]);
  };

  // Horizontal slide animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir >= 0 ? "100%" : "-100%",
    }),
    center: {
      x: "0%",
    },
    exit: (dir: number) => ({
      x: dir >= 0 ? "-100%" : "100%",
    }),
  };

  return (
    <section className="w-full max-w-[1520px] mx-auto px-3 sm:px-6 pt-1 pb-2 sm:pt-1.5 sm:pb-3 select-none">
      {/* Slim Poster Banner Card */}
      <div
        className="relative w-full aspect-[2.35/1] sm:aspect-[2.9/1] md:aspect-[3.4/1] lg:aspect-[3.8/1] max-h-[300px] min-h-[140px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow bg-slate-100 group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Animated Horizontal Sliding Track */}
        <div className="relative w-full h-full overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={slide.id || activeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.65 },
              }}
              className="absolute inset-0 w-full h-full"
            >
              {slide.ctaLink && slide.ctaLink.trim() !== "" && slide.ctaLink.trim() !== "#" ? (
                <Link
                  href={slide.ctaLink}
                  className="relative block w-full h-full cursor-pointer overflow-hidden"
                  aria-label={slide.titleLine1 || "Promo Banner"}
                >
                  {/* Desktop View Poster */}
                  <Image
                    src={slide.image}
                    alt={slide.titleLine1 || "Banner Poster"}
                    fill
                    priority={activeIndex === 0}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1520px"
                    style={{
                      transform: `scale(${(slide.imageScale || 100) / 100})`,
                      transformOrigin:
                        slide.imagePosition === "top"
                          ? "top center"
                          : slide.imagePosition === "bottom"
                          ? "bottom center"
                          : "center center",
                      objectFit: slide.imageFit || "cover",
                      objectPosition: slide.imagePosition || "center",
                    }}
                    className={`w-full h-full transition-transform duration-500 ease-out ${
                      slide.mobileImage ? "hidden sm:block" : "block"
                    }`}
                  />

                  {/* Mobile View Poster (if custom mobile ratio provided) */}
                  {slide.mobileImage && (
                    <Image
                      src={slide.mobileImage}
                      alt={slide.titleLine1 || "Mobile Banner Poster"}
                      fill
                      priority={activeIndex === 0}
                      sizes="100vw"
                      style={{
                        transform: `scale(${((slide.mobileImageScale || slide.imageScale) || 100) / 100})`,
                        transformOrigin:
                          (slide.mobileImagePosition || slide.imagePosition) === "top"
                            ? "top center"
                            : (slide.mobileImagePosition || slide.imagePosition) === "bottom"
                            ? "bottom center"
                            : "center center",
                        objectFit: slide.mobileImageFit || slide.imageFit || "cover",
                        objectPosition: slide.mobileImagePosition || slide.imagePosition || "center",
                      }}
                      className="w-full h-full block sm:hidden transition-transform duration-500 ease-out"
                    />
                  )}
                </Link>
              ) : (
                <div
                  className="relative block w-full h-full select-none overflow-hidden"
                  aria-label={slide.titleLine1 || "Promo Banner"}
                >
                  {/* Desktop View Poster */}
                  <Image
                    src={slide.image}
                    alt={slide.titleLine1 || "Banner Poster"}
                    fill
                    priority={activeIndex === 0}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1520px"
                    style={{
                      transform: `scale(${(slide.imageScale || 100) / 100})`,
                      transformOrigin:
                        slide.imagePosition === "top"
                          ? "top center"
                          : slide.imagePosition === "bottom"
                          ? "bottom center"
                          : "center center",
                      objectFit: slide.imageFit || "cover",
                      objectPosition: slide.imagePosition || "center",
                    }}
                    className={`w-full h-full transition-transform duration-500 ease-out ${
                      slide.mobileImage ? "hidden sm:block" : "block"
                    }`}
                  />

                  {/* Mobile View Poster (if custom mobile ratio provided) */}
                  {slide.mobileImage && (
                    <Image
                      src={slide.mobileImage}
                      alt={slide.titleLine1 || "Mobile Banner Poster"}
                      fill
                      priority={activeIndex === 0}
                      sizes="100vw"
                      style={{
                        transform: `scale(${((slide.mobileImageScale || slide.imageScale) || 100) / 100})`,
                        transformOrigin:
                          (slide.mobileImagePosition || slide.imagePosition) === "top"
                            ? "top center"
                            : (slide.mobileImagePosition || slide.imagePosition) === "bottom"
                            ? "bottom center"
                            : "center center",
                        objectFit: slide.mobileImageFit || slide.imageFit || "cover",
                        objectPosition: slide.mobileImagePosition || slide.imagePosition || "center",
                      }}
                      className="w-full h-full block sm:hidden transition-transform duration-500 ease-out"
                    />
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Prev/Next Chevron Buttons (Desktop Hover) */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                paginate(-1);
              }}
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white/85 hover:bg-white text-slate-800 items-center justify-center z-20 backdrop-blur-md shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 text-slate-800" />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                paginate(1);
              }}
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white/85 hover:bg-white text-slate-800 items-center justify-center z-20 backdrop-blur-md shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 text-slate-800" />
            </button>
          </>
        )}
      </div>

      {/* Outpickz-Style Carousel Pagination Indicator (Dots / Pills) */}
      {totalSlides > 1 && (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-2 sm:mt-2.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === idx
                  ? "w-6 sm:w-7 bg-slate-900 shadow-xs"
                  : "w-2 sm:w-2.5 bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

