import React from "react";
import { TopBar } from "@/components/TopBar";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { CategoryPills } from "@/components/CategoryPills";
import { TrustBar } from "@/components/TrustBar";
import { DealsSection } from "@/components/DealsSection";
import { PromoBanners } from "@/components/PromoBanners";
import { NewArrivalsSection } from "@/components/NewArrivalsSection";
import { TopPickzSection } from "@/components/TopPickzSection";
import { CreatorsReelsSection } from "@/components/CreatorsReelsSection";
import { Footer } from "@/components/Footer";
import { getCategories, getBanners, getShowcaseCollections } from "@/lib/storeContent";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [initialCategories, initialBanners, initialShowcase] = await Promise.all([
    getCategories(),
    getBanners(),
    getShowcaseCollections(),
  ]);

  return (
    <main className="min-h-screen bg-[#F3F4F6] text-[#111111] selection:bg-[#FF7A00] selection:text-white">
      {/* 1. Top Announcement Bar (Black) */}
      <TopBar />

      {/* 2. Main Navigation Bar (White with Logo, Search, Account, Wishlist, Cart & Sub-nav) */}
      <Navbar />

      {/* 3. Circular / Curved Square Pastel Category Pills (Positioned above banner, with SSR hydration to eliminate icon flash) */}
      <CategoryPills initialCategories={initialCategories} />

      {/* 4. Hero Banner Carousel (Slim direct poster with SSR hydration to eliminate banner flash) */}
      <HeroSection initialBanners={initialBanners} />

      {/* 5. Top Pickz (Pastel container with automatic 1-by-1 card moving carousel, 2s pause) */}
      <TopPickzSection initialProductIds={initialShowcase.topPickzProductIds} />

      {/* 6. From our creators (Automatic moving creator video reels with always-muted autoplay & reel modal) */}
      <CreatorsReelsSection />

      {/* 7. 4-Column White Trust Guarantee Bar */}
      <TrustBar />

      {/* 8. Today's Best Deals ⚡ (cards with % off badges and Add to Cart) */}
      <DealsSection initialProductIds={initialShowcase.todayDealsProductIds} />

      {/* 9. Dual Promotional Banners (Everyday Essentials & Car Accessories) */}
      <PromoBanners />

      {/* 10. New Arrivals (cards with floating wishlist hearts) */}
      <NewArrivalsSection initialProductIds={initialShowcase.newArrivalsProductIds} />

      {/* 11. Modern E-commerce Footer */}
      <Footer />
    </main>
  );
}

