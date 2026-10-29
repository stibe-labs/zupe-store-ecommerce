import React from "react";
import { Navbar } from "@/components/Navbar";
import { TurkiyeJamStorefront } from "@/components/TurkiyeJamStorefront";
import { Footer } from "@/components/Footer";

export const revalidate = 30;

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FCFBF8] text-[#1A1A1A] selection:bg-[#fed000] selection:text-stone-900">
      {/* 1. Turkiye Jam Navigation Bar (Floating over Full-Screen Hero) */}
      <Navbar />

      {/* 2. Dedicated High-Conversion Turkiye Jam Storefront Experience */}
      <TurkiyeJamStorefront />

      {/* 3. Brand Footer with Discreet Packaging & Policy Guarantees */}
      <Footer />
    </main>
  );
}
