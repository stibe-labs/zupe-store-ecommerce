"use client";

import React from "react";
import Image from "next/image";
import { Check, X } from "lucide-react";
import { Product } from "@/types/product";

interface ProductComparisonTableProps {
  product: Product;
  className?: string;
}

export function ProductComparisonTable({
  product,
  className = "",
}: ProductComparisonTableProps) {
  // Derive features from product features or sensible e-commerce advantages
  const featureList: { label: string; zupe: boolean; other: boolean }[] = [];

  if (Array.isArray(product.features) && product.features.length >= 3) {
    product.features.slice(0, 5).forEach((feat) => {
      featureList.push({
        label: feat,
        zupe: true,
        other: false,
      });
    });
  } else {
    // Dynamic defaults based on product name / category
    const pName = (product.name || "").toLowerCase();
    if (pName.includes("ripple") || pName.includes("lamp") || pName.includes("light")) {
      featureList.push(
        { label: "Dynamic 360° rotating ripple projection", zupe: true, other: false },
        { label: "16 RGB vibrant color modes + wireless remote", zupe: true, other: false },
        { label: "Whisper-quiet internal rotation motor for calm sleep", zupe: true, other: false },
        { label: "Faceted high-transmittance crystal acrylic build", zupe: true, other: false },
        { label: "Natural solid wood base with USB plug & play", zupe: true, other: false }
      );
    } else if (pName.includes("iron") || pName.includes("steamer")) {
      featureList.push(
        { label: "30-second rapid titanium heat-up", zupe: true, other: false },
        { label: "Dual dry & continuous steam ironing modes", zupe: true, other: false },
        { label: "180° foldable ergonomic travel body", zupe: true, other: false },
        { label: "Non-stick anti-burn ceramic soleplate", zupe: true, other: false },
        { label: "Zero water leakage in all ironing angles", zupe: true, other: false }
      );
    } else if (pName.includes("wash") || pName.includes("cleaner")) {
      featureList.push(
        { label: "Scrubs stubborn dirt effortlessly", zupe: true, other: false },
        { label: "Reaches narrow corners & grout lines easily", zupe: true, other: false },
        { label: "3 cleaning functions integrated in one tool", zupe: true, other: false },
        { label: "Durable food-grade PP & silicone material", zupe: true, other: false },
        { label: "Compact, easy to store, and travel friendly", zupe: true, other: false }
      );
    } else {
      featureList.push(
        { label: "Premium verified build quality & finish", zupe: true, other: false },
        { label: "Fast & intuitive one-touch operation", zupe: true, other: false },
        { label: "Ergonomic & durable modern design", zupe: true, other: false },
        { label: "Backed by 7-day hassle-free replacement", zupe: true, other: false },
        { label: "100% genuine authentic Zupe verified product", zupe: true, other: false }
      );
    }
  }

  // Ensure exactly 4-5 rows
  while (featureList.length < 4) {
    featureList.push({
      label: "Tested & verified authentic Zupe performance",
      zupe: true,
      other: false,
    });
  }

  const shortName = product.name.split(" ").slice(0, 3).join(" ");
  const fallbackPoster = product.poster_image || product.images?.[0] || "/products/ripple-lamp.jpg";

  return (
    <div className={`w-full my-7 select-none ${className}`}>
      {/* Section Title */}
      <div className="text-center mb-4 sm:mb-5">
        <h2 className="text-[17px] sm:text-[20px] font-display font-extrabold text-[#0F172A] tracking-tight leading-tight">
          Why Choose This Product?
        </h2>
        <p className="text-[12px] sm:text-[13px] text-gray-500 font-normal mt-0.5 leading-snug">
          See how it compares with common alternatives.
        </p>
      </div>

      {/* Comparison Table Box */}
      <div className="rounded-2xl border border-gray-200/90 overflow-hidden shadow-xs bg-white">
        <table className="w-full border-collapse text-left">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-gray-200">
              {/* Features Column */}
              <th className="w-[42%] p-2.5 sm:p-3.5 bg-gray-50/90 text-gray-900 font-bold text-xs sm:text-sm tracking-tight align-middle">
                Features
              </th>

              {/* Zupe Store Product Column (Orange Header) */}
              <th className="w-[29%] p-2 sm:p-3 bg-gradient-to-b from-[#FF6A00] to-[#FF7A00] text-white text-center align-middle border-x border-orange-500/30">
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider block leading-tight text-white line-clamp-1">
                    Zupestore
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-orange-100 block leading-tight line-clamp-1">
                    {shortName}
                  </span>
                  <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-lg overflow-hidden bg-white/20 border border-white/40 shadow-2xs mt-0.5">
                    <img
                      src={fallbackPoster}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </th>

              {/* Regular Alternative Column (Charcoal Header) */}
              <th className="w-[29%] p-2 sm:p-3 bg-[#0F172A] text-white text-center align-middle">
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider block leading-tight text-gray-200 line-clamp-1">
                    Regular
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 block leading-tight line-clamp-1">
                    Alternative
                  </span>
                  <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-lg overflow-hidden bg-white/10 border border-white/20 shadow-2xs mt-0.5 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-gray-700/80 flex items-center justify-center text-gray-400 text-[10px] font-black">
                      vs
                    </div>
                  </div>
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
            {featureList.map((item, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"}
              >
                {/* Feature Label */}
                <td className="p-2.5 sm:p-3.5 text-gray-800 font-medium text-[11px] sm:text-xs leading-snug align-middle">
                  {item.label}
                </td>

                {/* Zupe Column (Green Check) */}
                <td className="p-2 sm:p-3 text-center align-middle bg-orange-50/30 border-x border-orange-100/60">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-2xs">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                  </div>
                </td>

                {/* Regular Alternative Column (Red Cross) */}
                <td className="p-2 sm:p-3 text-center align-middle bg-gray-50/20">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-rose-100 text-rose-500 mx-auto flex items-center justify-center shadow-2xs">
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
