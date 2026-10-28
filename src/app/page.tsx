import React from "react";
import { TopBar } from "@/components/TopBar";
import { Navbar } from "@/components/Navbar";
import { TurkiyeJamStorefront } from "@/components/TurkiyeJamStorefront";
import { Footer } from "@/components/Footer";

export const revalidate = 30;

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#1A1A1A] selection:bg-[#780016] selection:text-white">
      {/* 1. Turkish Imperial Crimson Announcement Bar */}
      <TopBar />

      {/* 2. Turkiye Jam Navigation Bar */}
      <Navbar />

      {/* 3. Dedicated High-Conversion Turkiye Jam Storefront Experience */}
      <TurkiyeJamStorefront />

      {/* 4. Brand Footer with Discreet Packaging & Policy Guarantees */}
      <Footer />
    </main>
  );
}
