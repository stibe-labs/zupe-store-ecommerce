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
      "SELECT id, slug, name, price, mrp, stock_count, in_stock FROM products;"
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
    <main className="min-h-screen bg-[#FCFBF8] text-[#1A1A1A] selection:bg-[#fed000] selection:text-stone-900">
      {/* 1. Vittal Digital Navigation Bar (Floating over Full-Screen Hero) */}
      <Navbar />

      {/* 2. Dedicated High-Conversion Vittal Digital Storefront Experience */}
      <VittalDigitalStorefront initialProducts={initialProducts} />

      {/* 3. Brand Footer with Discreet Packaging & Policy Guarantees */}
      <Footer />
    </main>
  );
}
