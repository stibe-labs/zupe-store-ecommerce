import React from "react";
import Image from "next/image";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen tj-diamonds-cream text-stone-900 antialiased selection:bg-[#fed000] selection:text-stone-900">
      {/* 1. TOP CLEAN MINIMAL HEADER SKELETON */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 h-16 sm:h-18 flex items-center justify-between gap-4">
          <div className="w-24 h-4 bg-gray-100 rounded animate-pulse" />

          <div className="inline-block">
            <Image
              src="/turkiye-jam-logo.svg"
              alt="Turkiye Jam"
              width={140}
              height={40}
              className="h-8 sm:h-9 w-auto object-contain"
              priority
            />
          </div>

          <div className="flex items-center gap-2 text-right">
            <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[11px] font-bold text-gray-900 leading-tight">100% Secure Checkout</p>
              <p className="text-[10px] text-gray-400 leading-tight">256-Bit SSL Encrypted</p>
            </div>
          </div>
        </div>
      </header>

      {/* 2. SKELETON MAIN CONTENT */}
      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form skeleton */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top status bar */}
            <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-[#780016] animate-spin" />
              <div>
                <p className="font-bold text-xs text-gray-900">Loading Checkout...</p>
                <p className="text-[11px] text-gray-400">Securing your session with 256-bit encryption</p>
              </div>
            </div>

            {/* Contact details skeleton */}
            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-xs space-y-4">
              <div className="h-5 w-36 bg-gray-100 rounded animate-pulse" />
              <div className="h-12 w-full bg-gray-50 rounded-xl border border-gray-100 animate-pulse" />
            </div>

            {/* Delivery address skeleton */}
            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-xs space-y-4">
              <div className="h-5 w-40 bg-gray-100 rounded animate-pulse" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-12 bg-gray-50 rounded-xl border border-gray-100 animate-pulse" />
                <div className="h-12 bg-gray-50 rounded-xl border border-gray-100 animate-pulse" />
              </div>
              <div className="h-12 w-full bg-gray-50 rounded-xl border border-gray-100 animate-pulse" />
            </div>

            {/* Payment skeleton */}
            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-xs space-y-4">
              <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
              <div className="h-16 w-full bg-gray-50 rounded-xl border border-gray-100 animate-pulse" />
              <div className="h-16 w-full bg-gray-50 rounded-xl border border-gray-100 animate-pulse" />
            </div>
          </div>

          {/* Right Column: Order summary skeleton */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="sticky top-6 p-6 rounded-2xl bg-white border border-gray-100 shadow-xs space-y-4">
              <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
              <div className="h-16 bg-gray-50 rounded-xl border border-gray-100 animate-pulse" />
              <div className="space-y-2 pt-2">
                <div className="h-4 w-full bg-gray-50 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-50 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-50 rounded animate-pulse" />
              </div>
              <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

