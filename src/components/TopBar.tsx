"use client";

import React from "react";
import { Truck, Banknote, Headphones, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";

const ANNOUNCEMENT_ITEMS = [
  {
    icon: Sparkles,
    text: "🇹🇷 100% Authentic Turkish Import • Themra Herbal Paste",
  },
  {
    icon: Truck,
    text: "⚡ 1–2 Day Superfast Express Delivery (All-India Delivery)",
  },
  {
    icon: ShieldCheck,
    text: "📦 100% Discreet & Tamper-Proof Plain Box Packaging",
  },
  {
    icon: CheckCircle2,
    text: "🛡️ 100% Money-Back Guarantee on Unused Sachet Strips",
  },
  {
    icon: Banknote,
    text: "💵 Cash on Delivery & Express Prepaid Online Available",
  },
  {
    icon: Headphones,
    text: "WhatsApp Order & Inquiries: +91 73567 65036",
    href: "https://wa.me/917356765036?text=Hi%2C%20I%20want%20to%20order%20Turkiye%20Jam",
  },
];

export function TopBar() {
  return (
    <aside
      aria-label="Store Announcements"
      className="relative bg-black/80 backdrop-blur-2xl text-stone-200 text-[11px] sm:text-xs py-2 overflow-hidden border-b border-white/10 select-none z-30"
    >
      {/* Edge gradient masks for smooth fade in/out */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-black to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-black to-transparent z-10" />

      {/* Marquee Track: Seamless Infinite Loop */}
      <div className="flex animate-topbar-ticker whitespace-nowrap">
        {[0, 1].map((setIndex) => (
          <div
            key={setIndex}
            className="flex items-center gap-8 sm:gap-12 pr-8 sm:pr-12 shrink-0"
            aria-hidden={setIndex === 1}
          >
            {ANNOUNCEMENT_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center gap-2 text-stone-300">
                  <Icon className="w-3.5 h-3.5 text-[#ff807e] shrink-0" />
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-white hover:text-[#ff807e] transition-colors inline-flex items-center gap-1 underline-offset-2 hover:underline"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="font-medium tracking-wide">
                      {item.text}
                    </span>
                  )}
                  {/* Subtle Separator Dot */}
                  <span className="text-white/20 text-xs ml-4 sm:ml-6 select-none">•</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}
