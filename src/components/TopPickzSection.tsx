"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";

interface TopPickzSectionProps {
  initialProducts?: Product[];
}

export function TopPickzSection({ initialProducts }: TopPickzSectionProps = {}) {
  const [products, setProducts] = useState<Product[]>(() => {
    if (initialProducts && initialProducts.length > 0) return initialProducts;
    return DEFAULT_PRODUCTS;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [stepWidth, setStepWidth] = useState(130);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLDivElement>(null);

  // Touch tracking for mobile swipe
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Fetch latest products from API if available
  useEffect(() => {
    fetch(`/api/products?_t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        const fetched = Array.isArray(data) ? data : data?.products;
        if (Array.isArray(fetched) && fetched.length > 0) {
          setProducts(fetched);
        }
      })
      .catch(() => {});
  }, []);

  // Filter or prioritize top products
  const displayProducts = products.slice(0, 10);
  const totalItems = displayProducts.length;

  // Triplicate array to guarantee continuous, infinite wrap-around
  const extendedProducts = [...displayProducts, ...displayProducts, ...displayProducts];

  // Dynamically compute exact card width + gap on mount and resize
  const measureStepWidth = useCallback(() => {
    if (firstCardRef.current && trackRef.current) {
      const cardW = firstCardRef.current.offsetWidth;
      const trackStyle = window.getComputedStyle(trackRef.current);
      const gap = parseFloat(trackStyle.gap) || (window.innerWidth < 640 ? 10 : 14);
      setStepWidth(cardW + gap);
    }
  }, []);

  useEffect(() => {
    measureStepWidth();
    window.addEventListener("resize", measureStepWidth);
    return () => window.removeEventListener("resize", measureStepWidth);
  }, [measureStepWidth]);

  // Step-by-step automatic animation:
  // 1. Stays 2 seconds (2000ms pause)
  // 2. Smoothly shifts left by 1 card over 650ms
  // 3. Repeats seamlessly
  useEffect(() => {
    if (isPaused || totalItems <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, 2650); // 2000ms stay + 650ms animation

    return () => clearInterval(interval);
  }, [isPaused, totalItems]);

  // Seamless infinite reset when first set has scrolled completely
  const handleTransitionEnd = () => {
    if (currentIndex >= totalItems) {
      setIsTransitioning(false);
      setCurrentIndex(0);
    }
  };

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
      if (diff > 35) {
        // Swiped Left -> Move 1 card forward
        setIsTransitioning(true);
        setCurrentIndex((prev) => prev + 1);
      } else if (diff < -35) {
        // Swiped Right -> Move 1 card backward
        if (currentIndex === 0) {
          setIsTransitioning(false);
          setCurrentIndex(totalItems);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setIsTransitioning(true);
              setCurrentIndex(totalItems - 1);
            });
          });
        } else {
          setIsTransitioning(true);
          setCurrentIndex((prev) => prev - 1);
        }
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (totalItems === 0) return null;

  return (
    <section className="w-full max-w-[1520px] mx-auto px-3 sm:px-6 my-2 sm:my-3 select-none">
      {/* Light Mint / Cyan Pastel Container matching Outpickz reference */}
      <div
        className="w-full bg-gradient-to-r from-[#EBF9F7] via-[#E4F7F4] to-[#DBF2EE] border border-[#CEEFEA] rounded-[22px] sm:rounded-3xl p-3 sm:p-4 md:p-5 overflow-hidden shadow-xs"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Section Heading */}
        <div className="flex items-center justify-between mb-2.5 sm:mb-3 px-0.5">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
            Top Pickz
          </h2>
          <Link
            href="/products"
            className="text-xs sm:text-sm font-semibold text-[#FF7A00] hover:text-[#E06A00] transition-colors"
          >
            View All →
          </Link>
        </div>

        {/* Viewport for horizontal track */}
        <div ref={containerRef} className="w-full overflow-hidden relative">
          <div
            ref={trackRef}
            onTransitionEnd={handleTransitionEnd}
            style={{
              transform: `translate3d(-${currentIndex * stepWidth}px, 0, 0)`,
              transition: isTransitioning
                ? "transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)"
                : "none",
            }}
            className="flex items-stretch gap-2.5 sm:gap-3.5 will-change-transform"
          >
            {extendedProducts.map((product, idx) => {
              const imageSrc =
                product.poster_image ||
                product.images?.[0] ||
                "/products/ripple/ripple-amber.jpg";

              const formattedPrice = Number(product.price || product.offer_price || 0).toFixed(2);

              return (
                <div
                  key={`${product.id}-${idx}`}
                  ref={idx === 0 ? firstCardRef : undefined}
                  className="w-[115px] min-w-[115px] sm:w-[135px] sm:min-w-[135px] md:w-[150px] md:min-w-[150px] flex-shrink-0"
                >
                  <Link
                    href={`/products/${product.slug || product.id}`}
                    className="group block w-full h-full bg-white rounded-2xl p-2 sm:p-2.5 shadow-xs hover:shadow-md transition-all duration-200 border border-slate-100/80 hover:border-slate-200 hover:-translate-y-0.5"
                  >
                    {/* Square Product Image */}
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-50 mb-1.5">
                      <Image
                        src={imageSrc}
                        alt={product.name || "Product"}
                        fill
                        sizes="(max-width: 640px) 115px, 150px"
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Single Line Truncated Title */}
                    <p
                      className="text-[11px] sm:text-xs md:text-[13px] font-medium text-slate-800 truncate block leading-snug"
                      title={product.name}
                    >
                      {product.name}
                    </p>

                    {/* Bold Black Price */}
                    <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 sm:mt-1">
                      ₹{formattedPrice}
                    </p>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
