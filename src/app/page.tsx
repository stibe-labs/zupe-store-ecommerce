"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { CategoryShowcase } from "@/components/CategoryShowcase";
import { TrustSection } from "@/components/TrustSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <main className="min-h-screen bg-[#F8F9FA] text-[#2D3436] relative selection:bg-[#6C5CE7] selection:text-white">
        {/* Navigation */}
        <Navbar />

        {/* Hero */}
        <HeroSection />

        {/* Featured Products */}
        <FeaturedProducts />

        {/* Shop by Category */}
        <CategoryShowcase />

        {/* Newsletter / CTA Banner */}
        <section className="py-20 lg:py-28 bg-gradient-to-br from-[#1A1A2E] via-[#2D2D44] to-[#1A1A2E] relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-64 h-64 bg-[#6C5CE7]/15 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#FF6B6B]/10 rounded-full blur-3xl" />
          </div>
          <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-4">
              Get 15% Off Your First Order
            </h2>
            <p className="text-base text-gray-400 mb-8 max-w-lg mx-auto">
              Join the Zupe community and get exclusive access to new drops, special offers, and design inspiration.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-5 py-3.5 bg-white/10 text-white border border-white/20 rounded-xl placeholder:text-gray-500 focus:outline-none focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7]/30 transition-all"
              />
              <button className="w-full sm:w-auto px-8 py-3.5 bg-[#6C5CE7] text-white font-semibold rounded-xl hover:bg-[#4834D4] transition-colors btn-press whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <TrustSection />

        {/* Footer */}
        <Footer />
      </main>
    </>
  );
}
