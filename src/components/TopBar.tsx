"use client";

import React from "react";
import { Truck, Banknote, RotateCcw, Headphones, ShieldCheck, Sparkles } from "lucide-react";

const ANNOUNCEMENT_ITEMS = [
  {
    icon: Truck,
    text: "Free Shipping on All Orders",
  },
  {
    icon: Banknote,
    text: "Cash on Delivery Available",
  },
  {
    icon: RotateCcw,
    text: "Easy Returns & 7-Day Replacements",
  },
  {
    icon: Headphones,
    text: "Need Help? +91 97441 22853",
    href: "tel:+919744122853",
  },
  {
    icon: ShieldCheck,
    text: "100% Verified Quality Guaranteed",
  },
  {
    icon: Sparkles,
    text: "Fast Express Dispatch in 24 Hours",
  },
];

export function TopBar() {
  return (
    <aside
      aria-label="Store Announcements"
      className="relative bg-[#000000] text-gray-200 text-[11px] sm:text-xs py-2 overflow-hidden border-b border-white/10 select-none z-30"
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
                <div key={idx} className="flex items-center gap-2 text-gray-200">
                  <Icon className="w-3.5 h-3.5 text-[#FF7A00] shrink-0" />
                  {item.href ? (
                    <a
                      href={item.href}
                      className="font-medium text-white hover:text-[#FF7A00] transition-colors inline-flex items-center gap-1 underline-offset-2 hover:underline"
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

