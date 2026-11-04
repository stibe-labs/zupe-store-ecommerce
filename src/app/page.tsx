import React from "react";
import { Navbar } from "@/components/Navbar";
import { VittalDigitalStorefront } from "@/components/TurkiyeJamStorefront";
import { Footer } from "@/components/Footer";
import { executeD1Query } from "@/lib/d1";
import { Product } from "@/types/product";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import { getBanners, HeroBannerSlide, DEFAULT_HERO_BANNERS } from "@/lib/storeContent";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getInitialBanners(): Promise<HeroBannerSlide[]> {
  try {
    const banners = await getBanners(false);
    if (banners && Array.isArray(banners) && banners.length > 0) {
      return banners;
    }
  } catch (err) {
    console.warn("Could not load banners on SSR:", err);
  }
  return DEFAULT_HERO_BANNERS;
}

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
  const [initialProducts, initialBanners] = await Promise.all([
    getInitialProducts(),
    getInitialBanners(),
  ]);

  return (
    <main className="min-h-screen bg-[#FAFBFD] text-slate-900 selection:bg-[#003055] selection:text-white">
      {/* 1. Vittal Digital Navigation Bar */}
      <Navbar />

      {/* 2. Dedicated High-Conversion Vittal Digital Storefront Experience */}
      <VittalDigitalStorefront
        initialProducts={initialProducts}
        initialBanners={initialBanners}
      />

      {/* 3. Brand Footer */}
      <Footer />
    </main>
  );
}
