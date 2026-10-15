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
import { ShoppableVideosSection } from "@/components/ShoppableVideosSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F3F4F6] text-[#111111] selection:bg-[#FF7A00] selection:text-white">
      {/* 1. Top Announcement Bar (Black) */}
      <TopBar />

      {/* 2. Main Navigation Bar (White with Logo, Search, Account, Wishlist, Cart & Sub-nav) */}
      <Navbar />

      {/* 3. Circular Pastel Category Pills (9 categories - Now positioned above banner) */}
      <CategoryPills />

      {/* 4. Hero Banner Carousel (Slim direct poster) */}
      <HeroSection />

      {/* 5. 4-Column White Trust Guarantee Bar */}
      <TrustBar />

      {/* 6. Today's Best Deals ⚡ (5 cards with % off badges and Add to Cart) */}
      <DealsSection />

      {/* 7. Dual Promotional Banners (Everyday Essentials & Car Accessories) */}
      <PromoBanners />

      {/* 8. New Arrivals (5 cards with floating wishlist hearts) */}
      <NewArrivalsSection />

      {/* 9. Shoppable Video Reels (Before Footer, videos & attached products only) */}
      <ShoppableVideosSection showHeader={false} />

      {/* 10. Modern E-commerce Footer */}
      <Footer />
    </main>
  );
}
