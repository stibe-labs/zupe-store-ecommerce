"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Truck, Banknote, RotateCcw, Heart } from "lucide-react";

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = [
    {
      id: "ripple-lamp",
      badge: "SMART SOLUTIONS FOR A BETTER LIFE",
      titleLine1: "Innovative Products",
      titleLine2: "Modern Living.",
      description: "Discover unique and useful products that make your life easier, smarter and more fun.",
      ctaText: "Shop Now",
      ctaLink: "/products/dynamic-water-ripple-night-light",
      image: "/products/hero-banner.jpg",
      taglineRight: "Small Products Big Happiness ♡",
    },
    {
      id: "car-accessories",
      badge: "PREMIUM LIFESTYLE ESSENTIALS",
      titleLine1: "Car Accessories",
      titleLine2: "Style & Comfort.",
      description: "Upgrade your driving experience with solar powered diffusing fragrances and smart organizers.",
      ctaText: "Explore Now",
      ctaLink: "/products/helicopter-car-perfume",
      image: "/products/helicopter-perfume.jpg",
      taglineRight: "Drive In Luxury ♡",
    },
    {
      id: "smart-gadgets",
      badge: "CUTTING-EDGE EVERYDAY TECH",
      titleLine1: "Smart Tech Gadgets",
      titleLine2: "Everyday Ease.",
      description: "High-performance portable audio and emergency power to keep your routine charged and effortless.",
      ctaText: "Discover Tech",
      ctaLink: "/products/tf20-multipurpose-powerbank-with-airpods",
      image: "/products/powerbank-earbuds.jpg",
      taglineRight: "Pure Sound & Power ♡",
    },
  ];

  // Auto-advance slides every 5 seconds (5000ms) with pause on hover
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const slide = slides[currentSlide];

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-3 pb-2 sm:pt-4 sm:pb-3">
      <div
        className="relative rounded-3xl overflow-hidden bg-[#18130E] text-white shadow-xl min-h-[440px] sm:min-h-[480px] lg:min-h-[500px] flex items-center select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background Visual with Ambient Glow and Cross-fade */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 z-0"
          >
            <Image
              src={slide.image}
              alt={slide.titleLine1}
              fill
              priority
              className="object-cover object-right sm:object-center opacity-85"
            />
            {/* Subtle gradient vignette to keep text readable on the left */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#140F0A] via-[#140F0A]/85 sm:via-[#140F0A]/70 to-transparent w-full sm:w-2/3 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10" />
          </motion.div>
        </AnimatePresence>

        {/* Hero Content */}
        <div className="relative z-20 w-full px-6 sm:px-12 lg:px-16 py-10 flex flex-col justify-between h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="max-w-xl"
            >
              {/* Eyebrow */}
              <p className="text-[11px] sm:text-xs font-bold tracking-[0.2em] text-[#C4B5A5] uppercase mb-3">
                {slide.badge}
              </p>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-display font-extrabold text-white leading-[1.12] tracking-tight mb-4">
                {slide.titleLine1} <br />
                <span className="text-white">for </span>
                <span className="text-[#FA521C]">{slide.titleLine2}</span>
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base text-gray-300 font-normal leading-relaxed max-w-md mb-7">
                {slide.description}
              </p>

              {/* Action Button */}
              <div className="mb-8">
                <Link
                  href={slide.ctaLink}
                  className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-white text-[#111111] font-bold text-sm hover:bg-gray-100 transition-all shadow-lg shadow-black/25 group"
                >
                  <span>{slide.ctaText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Trust Badges Row */}
              <div className="flex flex-wrap items-center gap-5 sm:gap-7 text-xs font-medium text-gray-200">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-white" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-white" />
                  <span>COD Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-white" />
                  <span>Easy Returns</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Right Cursive floating badge */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id + "-badge"}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="hidden lg:block absolute right-14 top-14 text-right z-20 pointer-events-none"
            >
              <p className="font-serif italic text-amber-100/90 text-xl tracking-wide drop-shadow-md leading-tight">
                {slide.taglineRight}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Prev/Next Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all z-20 backdrop-blur-sm shadow-md hover:scale-105 active:scale-95"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all z-20 backdrop-blur-sm shadow-md hover:scale-105 active:scale-95"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Carousel Pagination Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx ? "w-7 bg-white shadow-sm" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
