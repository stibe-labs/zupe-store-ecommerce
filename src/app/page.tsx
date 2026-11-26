import React from "react";
import { Navbar } from "@/components/Navbar";
import { VittalLifestyleStorefront } from "@/components/VittalLifestyleStorefront";
import { Footer } from "@/components/Footer";
import { executeD1Query } from "@/lib/d1";
import { Product } from "@/types/product";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import {
  getBanners,
  HeroBannerSlide,
  getSportswearCampaign,
  SportswearCampaignConfig,
  DEFAULT_SPORTSWEAR_CAMPAIGN,
  getSupplementShowcase,
  SupplementShowcaseConfig,
  DEFAULT_SUPPLEMENT_SHOWCASE,
  getShowcaseCollections,
  ShowcaseCollectionsConfig,
  DEFAULT_SHOWCASE_COLLECTIONS,
} from "@/lib/storeContent";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getInitialProducts(): Promise<Product[]> {
  try {
    const d1Results = await executeD1Query<Product>(
      "SELECT id, slug, name, subtitle, category, price, mrp, stock_count, poster_image, in_stock, rating, review_count, badge FROM products;"
    );
    if (d1Results && Array.isArray(d1Results) && d1Results.length > 0) {
      return d1Results;
    }
  } catch (err) {
    console.warn("Could not load products on SSR:", err);
  }
  return DEFAULT_PRODUCTS;
}

export default async function Home() {
  const [
    initialProducts,
    initialHeroBanners,
    initialSportswearCampaign,
    initialSupplementShowcase,
    initialShowcaseCollections,
  ] = await Promise.all([
    getInitialProducts(),
    getBanners().catch(() => [] as HeroBannerSlide[]),
    getSportswearCampaign().catch(() => DEFAULT_SPORTSWEAR_CAMPAIGN),
    getSupplementShowcase().catch(() => DEFAULT_SUPPLEMENT_SHOWCASE),
    getShowcaseCollections().catch(() => DEFAULT_SHOWCASE_COLLECTIONS),
  ]);

  return (
    <main className="min-h-screen bg-white text-neutral-900 selection:bg-[#E6F4EF] selection:text-[#0C1412] pb-16 md:pb-0">
      {/* 1. Brand Navigation Bar */}
      <Navbar />

      {/* 2. Luxury Vittal Lifestyle Storefront Experience matching design concept */}
      <VittalLifestyleStorefront
        initialProducts={initialProducts}
        initialHeroBanners={initialHeroBanners}
        initialSportswearCampaign={initialSportswearCampaign}
        initialSupplementShowcase={initialSupplementShowcase}
        initialShowcaseCollections={initialShowcaseCollections}
      />

      {/* 3. Brand Footer */}
      <Footer />
    </main>
  );
}
