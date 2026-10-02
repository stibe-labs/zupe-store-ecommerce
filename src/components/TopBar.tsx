"use client";

import React from "react";
import { Truck, Banknote, RotateCcw, Headphones } from "lucide-react";

export function TopBar() {
  return (
    <div className="bg-[#000000] text-gray-300 text-[11px] sm:text-xs py-2 px-4 border-b border-white/5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Features */}
        <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none py-0.5">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Truck className="w-3.5 h-3.5 text-white" />
            <span>Free Shipping on All Orders</span>
          </div>

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Banknote className="w-3.5 h-3.5 text-white" />
            <span>Cash on Delivery Available</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 whitespace-nowrap">
            <RotateCcw className="w-3.5 h-3.5 text-white" />
            <span>Easy Returns & Refunds</span>
          </div>
        </div>

        {/* Right Support Contact */}
        <div className="flex items-center gap-1.5 whitespace-nowrap ml-4">
          <Headphones className="w-3.5 h-3.5 text-white" />
          <span>
            Need Help? <strong className="text-white font-medium">+91 98765 43210</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
