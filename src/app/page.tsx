import React from "react";
import { Navbar } from "@/components/Navbar";
import { VittalDigitalStorefront } from "@/components/TurkiyeJamStorefront";
import { Footer } from "@/components/Footer";
import { executeD1Query } from "@/lib/d1";
import { Product } from "@/types/product";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";

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
  const initialProducts = await getInitialProducts();

  return (
    <main className="min-h-screen bg-[#FAFBFD] text-slate-900 selection:bg-[#003055] selection:text-white">
      {/* 1. Vittal Digital Navigation Bar */}
      <Navbar />

      {/* 2. Dedicated High-Conversion Vittal Digital Storefront Experience */}
      <VittalDigitalStorefront initialProducts={initialProducts} />

      {/* 3. Brand Footer */}
      <Footer />
    </main>
  );
}
