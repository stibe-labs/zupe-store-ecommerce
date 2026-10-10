"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PromoBanners() {
  return (
    <section className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Banner 1: Upgrade Your Everyday Essentials */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#F9EFE7] via-[#F4E6DC] to-[#EEDCCF] p-6 sm:p-8 flex items-center justify-between min-h-[240px] shadow-sm">
          <div className="max-w-[200px] sm:max-w-xs z-10 space-y-3">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-extrabold text-[#1A1A1A] leading-tight">
              Upgrade Your <br />
              Everyday Essentials
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              Smart products for a smarter lifestyle.
            </p>
            <div className="pt-1">
              <Link
                href="/products?category=Tech+%26+Gadgets"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1A1A1A] text-white text-xs font-bold hover:bg-black transition-colors group shadow-md"
              >
                <span>Explore Now</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Product Image Collage */}
          <div className="relative w-44 sm:w-56 h-36 sm:h-44 flex-shrink-0 flex items-center justify-end">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-md -mr-4 z-10 border-2 border-white">
              <Image
                src="/products/thermal-printer.jpg"
                alt="Thermal Printer"
                fill
                className="object-cover object-bottom"
              />
            </div>
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-md border-2 border-white">
              <Image
                src="/products/popcorn-maker.jpg"
                alt="Popcorn Maker"
                fill
                className="object-cover object-bottom"
              />
            </div>
          </div>
        </div>

        {/* Banner 2: Car Accessories */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1F2329] via-[#171B20] to-[#0F1216] text-white p-6 sm:p-8 flex items-center justify-between min-h-[240px] shadow-sm">
          <div className="max-w-[200px] sm:max-w-xs z-10 space-y-3">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-extrabold text-white leading-tight">
              Auto Essentials
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 font-medium">
              Drive in Style <br />
              and Comfort.
            </p>
            <div className="pt-1">
              <Link
                href="/products?category=Auto+Essentials"
                className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold overflow-hidden group shadow-md hover:shadow-[0_10px_24px_-4px_rgba(255, 122, 0,0.5),0_0_14px_rgba(255,122,69,0.25)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 select-none cursor-pointer"
              >
                {/* Default White Background */}
                <span className="absolute inset-0 bg-white transition-opacity duration-300 ease-out group-hover:opacity-0" />

                {/* Animated Color-Changing Gradient Overlay on Hover */}
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out anim-shopnow-gradient" />

                {/* Shimmer Light Sweep on Hover */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

                {/* Button Content */}
                <span className="relative z-10 flex items-center gap-2 text-[#111111] group-hover:text-white transition-colors duration-300">
                  <span className="font-extrabold">Shop Now</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                </span>
              </Link>
            </div>
          </div>

          {/* Right Product Image */}
          <div className="relative w-48 sm:w-60 h-36 sm:h-44 flex-shrink-0 rounded-2xl overflow-hidden shadow-xl border border-white/10">
            <Image
              src="/products/helicopter-perfume.jpg"
              alt="Car Helicopter Perfume"
              fill
              className="object-cover object-bottom"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
