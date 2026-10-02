"use client";

import React from "react";
import { TopBar } from "@/components/TopBar";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { CategoryPills } from "@/components/CategoryPills";
import { TrustBar } from "@/components/TrustBar";
import { DealsSection } from "@/components/DealsSection";
import { PromoBanners } from "@/components/PromoBanners";
import { NewArrivalsSection } from "@/components/NewArrivalsSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8F9FA] text-[#111111] selection:bg-[#FA521C] selection:text-white">
      {/* 1. Top Announcement Bar (Black) */}
      <TopBar />

      {/* 2. Main Navigation Bar (White with Logo, Search, Account, Wishlist, Cart & Sub-nav) */}
      <Navbar />

      {/* 3. Hero Banner ("Innovative Products for Modern Living", ripple lamp visual, CTA) */}
      <HeroSection />

      {/* 4. Circular Pastel Category Pills (9 categories) */}
      <CategoryPills />

      {/* 5. 4-Column White Trust Guarantee Bar */}
      <TrustBar />

      {/* 6. Today's Best Deals ⚡ (5 cards with % off badges and Add to Cart) */}
      <DealsSection />

      {/* 7. Dual Promotional Banners (Everyday Essentials & Car Accessories) */}
      <PromoBanners />

      {/* 8. New Arrivals (5 cards with floating wishlist hearts) */}
      <NewArrivalsSection />

      {/* 9. Modern E-commerce Footer */}
      <Footer />
    </main>
  );
}
