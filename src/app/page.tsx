import React from "react";
import type { Metadata } from "next";
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
import { getCategories, getBanners, getShowcaseCollections, getPromoBanners } from "@/lib/storeContent";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getOrganizationSchema,
  getWebSiteSchema,
  getBreadcrumbSchema,
  getProductItemListSchema,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Zupe Store | Modern Decor, Accessories & Everyday Essentials",
  description:
    "Discover beautifully curated modern home decor, ambient lighting, lifestyle gadgets, and car accessories at Zupe Store. Enjoy Free Express Shipping across India and Cash on Delivery.",
  keywords: [
    "home decor",
    "ambient lighting",
    "water ripple lamp",
    "car accessories",
    "lifestyle gadgets",
    "portable steam iron",
    "mini thermal printer",
    "Zupe Store India",
    "online shopping India",
    "cash on delivery decor",
  ],
  alternates: {
    canonical: "https://zupestore.in",
  },
  openGraph: {
    title: "Zupe Store | Modern Decor, Accessories & Everyday Essentials",
    description:
      "Shop trending home decor, smart accessories & everyday essentials at Zupe Store. Free Express Shipping & Cash on Delivery across India.",
    url: "https://zupestore.in",
    siteName: "Zupe Store",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://zupestore.in/favicon.png",
        width: 512,
        height: 512,
        alt: "Zupe Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zupe Store | Modern Decor, Accessories & Everyday Essentials",
    description:
      "Shop trending home decor, smart accessories & everyday essentials at Zupe Store. Free Express Shipping across India.",
    images: ["https://zupestore.in/favicon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// Cache homepage SSR for 30 seconds at the edge to avoid burning Worker CPU
// on every request — the primary cause of Error 1102 under traffic bursts.
// Content (banners, categories, showcases) have their own 30s in-process cache,
// so data will be at most 30s stale, which is acceptable for a homepage.
export const revalidate = 30;

export default async function Home() {
  const [initialCategories, initialBanners, initialShowcase, initialPromoBanners] = await Promise.all([
    getCategories(),
    getBanners(),
    getShowcaseCollections(),
    getPromoBanners(),
  ]);

  const breadcrumbSchema = getBreadcrumbSchema([{ name: "Home", url: "https://zupestore.in" }]);
  const featuredProductsSchema = getProductItemListSchema(DEFAULT_PRODUCTS.slice(0, 10), "Zupe Store Top Picks & Deals");

  return (
    <main className="min-h-screen bg-[#F3F4F6] text-[#111111] selection:bg-[#FF7A00] selection:text-white">
      {/* Search Engine Structured Data (JSON-LD) */}
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={featuredProductsSchema} />

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
      <PromoBanners banners={initialPromoBanners} />

      {/* 10. New Arrivals (cards with floating wishlist hearts) */}
      <NewArrivalsSection initialProductIds={initialShowcase.newArrivalsProductIds} />

      {/* 11. Modern E-commerce Footer */}
      <Footer />
    </main>
  );
}

