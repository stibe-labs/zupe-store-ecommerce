"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DEFAULT_PROMO_BANNERS, PromoBannerCard } from "@/lib/storeContent";

interface PromoBannersProps {
  banners?: PromoBannerCard[];
}

export function PromoBanners({ banners: propsBanners }: PromoBannersProps) {
  const [cards, setCards] = useState<PromoBannerCard[]>(propsBanners || DEFAULT_PROMO_BANNERS);

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

  const getBackgroundStyle = (card: PromoBannerCard) => {
    const bg = card.bgColor || "#F9EFE7";
    if (bg.startsWith("#") || bg.startsWith("rgb") || bg.startsWith("hsl") || bg.startsWith("linear-gradient")) {
      return { background: bg };
    }
    return {};
  };

  const getBackgroundClass = (card: PromoBannerCard, defaultClasses: string) => {
    const bg = card.bgColor || "";
    if (bg.startsWith("#") || bg.startsWith("rgb") || bg.startsWith("hsl") || bg.startsWith("linear-gradient")) {
      return "";
    }
    return bg || defaultClasses;
  };

  return (
    <section className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ========================================================
            Banner 1: Everyday Essentials
           ======================================================== */}
        <div
          className={`relative rounded-3xl overflow-hidden p-6 sm:p-8 flex items-center justify-between min-h-[240px] shadow-sm transition-all duration-300 ${getBackgroundClass(
            card1,
            "bg-gradient-to-r from-[#F9EFE7] via-[#F4E6DC] to-[#EEDCCF]"
          )}`}
          style={getBackgroundStyle(card1)}
        >
          <div className="max-w-[200px] sm:max-w-xs z-10 space-y-3">
            <h3
              className="text-xl sm:text-2xl lg:text-3xl font-display font-extrabold leading-tight whitespace-pre-line tracking-tight"
              style={{ color: card1.textColor || "#1A1A1A" }}
            >
              {card1.title || "Upgrade Your\nEveryday Essentials"}
            </h3>
            <p
              className="text-xs sm:text-sm font-medium whitespace-pre-line"
              style={{ color: card1.subtitleColor || "#4B5563" }}
            >
              {card1.subtitle || "Smart products for a smarter lifestyle."}
            </p>
            <div className="pt-1">
              <Link
                href={card1.ctaLink || "/products"}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all group select-none cursor-pointer"
                style={{
                  backgroundColor: card1.btnBgColor || "#1A1A1A",
                  color: card1.btnTextColor || "#FFFFFF",
                }}
              >
                <span>{card1.ctaText || "Explore Now"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Product Image Collage */}
          <div className="relative w-44 sm:w-56 h-36 sm:h-44 flex-shrink-0 flex items-center justify-end">
            {card1.image2 ? (
              <>
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-md -mr-4 z-10 border-2 border-white">
                  <Image
                    src={card1.image1 || "/products/thermal-printer.jpg"}
                    alt={card1.title || "Product 1"}
                    fill
                    unoptimized={card1.image1?.startsWith("data:") || card1.image1?.startsWith("http")}
                    className="object-cover object-bottom"
                  />
                </div>
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-md border-2 border-white">
                  <Image
                    src={card1.image2}
                    alt={card1.title || "Product 2"}
                    fill
                    unoptimized={card1.image2?.startsWith("data:") || card1.image2?.startsWith("http")}
                    className="object-cover object-bottom"
                  />
                </div>
              </>
            ) : (
              <div className="relative w-40 sm:w-52 h-32 sm:h-40 rounded-2xl overflow-hidden shadow-md border-2 border-white/80">
                <Image
                  src={card1.image1 || "/products/thermal-printer.jpg"}
                  alt={card1.title || "Product"}
                  fill
                  unoptimized={card1.image1?.startsWith("data:") || card1.image1?.startsWith("http")}
                  className="object-cover object-bottom"
                />
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            Banner 2: Auto Essentials (Static Customizable Button Colors)
           ======================================================== */}
        <div
          className={`relative rounded-3xl overflow-hidden p-6 sm:p-8 flex items-center justify-between min-h-[240px] shadow-sm transition-all duration-300 ${getBackgroundClass(
            card2,
            "bg-gradient-to-r from-[#1F2329] via-[#171B20] to-[#0F1216]"
          )}`}
          style={getBackgroundStyle(card2)}
        >
          <div className="max-w-[200px] sm:max-w-xs z-10 space-y-3">
            <h3
              className="text-xl sm:text-2xl lg:text-3xl font-display font-extrabold leading-tight whitespace-pre-line tracking-tight"
              style={{ color: card2.textColor || "#FFFFFF" }}
            >
              {card2.title || "Auto Essentials"}
            </h3>
            <p
              className="text-xs sm:text-sm font-medium whitespace-pre-line"
              style={{ color: card2.subtitleColor || "#9CA3AF" }}
            >
              {card2.subtitle || "Drive in Style and Comfort."}
            </p>
            <div className="pt-1">
              <Link
                href={card2.ctaLink || "/products?category=Auto+Essentials"}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all group select-none cursor-pointer"
                style={{
                  backgroundColor: card2.btnBgColor || "#FFFFFF",
                  color: card2.btnTextColor || "#111111",
                }}
              >
                <span className="font-extrabold">{card2.ctaText || "Shop Now"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Product Image */}
          <div className="relative w-48 sm:w-60 h-36 sm:h-44 flex-shrink-0 rounded-2xl overflow-hidden shadow-xl border border-white/10">
            <Image
              src={card2.image1 || "/products/helicopter-perfume.jpg"}
              alt={card2.title || "Auto Essentials"}
              fill
              unoptimized={card2.image1?.startsWith("data:") || card2.image1?.startsWith("http")}
              className="object-cover object-bottom"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
