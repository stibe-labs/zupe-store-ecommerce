"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Check, Lock } from "lucide-react";
import {
  BRAND_80_THEMES,
  Logo80AnimatedMark,
} from "@/components/Logo80AnimatedMark";

interface CheckoutHeaderProps {
  /** 2 = Delivery & Payment (default), 3 = Confirmed, 1 = Empty Bag / Return */
  step?: 1 | 2 | 3;
  backHref?: string;
  backLabel?: string;
}

export function CheckoutHeader({
  step = 2,
  backHref = "/cart",
  backLabel = "Back to Bag",
}: CheckoutHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-[0_1px_12px_rgba(7,20,16,0.03)] font-mograph">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 relative">
        {/* LEFT: Subtle Back to Bag / Store link */}
        <div className="flex items-center shrink-0 z-10">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-[#0B5D44] transition-colors py-2 pr-2"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{backLabel}</span>
            <span className="sm:hidden">{backHref === "/cart" ? "Bag" : "Store"}</span>
          </Link>
        </div>

        {/* CENTER: Pure Flagship Logo #80 + vittal lifestyle wordmark (Zero tagline) */}
        <div className="absolute left-1/2 -translate-x-1/2 z-10 shrink-0">
          <Link
            href="/"
            className="vl80-root vl80-hover-trigger inline-flex items-center gap-1.5 sm:gap-2.5 group py-1"
            aria-label="Vittal Lifestyle — Home"
          >
            <Logo80AnimatedMark
              theme={BRAND_80_THEMES[0]}
              surface="light"
              size={34}
              className="scale-[0.85] sm:scale-100"
            />
            <span
              className="inline-flex items-center leading-none select-none"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              <span className="text-[17px] sm:text-[22px] font-bold tracking-[-0.03em] text-[#0C1412] whitespace-nowrap">
                vittal{" "}
                <span className="font-normal text-[#0B5D44]">lifestyle</span>
              </span>
            </span>
          </Link>
        </div>

        {/* RIGHT: 3-Step Visual Progress (desktop) + 256-Bit SSL Chip */}
        <div className="flex items-center gap-3 shrink-0 z-10">
          {step >= 2 && (
            <ol
              aria-label="Checkout progress"
              className="hidden lg:flex items-center gap-2 text-[11px] font-semibold"
            >
              <li className="inline-flex items-center gap-1 text-[#0B5D44]">
                <span className="w-4 h-4 rounded-full bg-[#E6F4EF] text-[#0B5D44] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <Link href="/cart" className="hover:underline">
                  Bag
                </Link>
              </li>
              <span className="w-4 h-px bg-neutral-300" aria-hidden="true" />
              <li
                className={`inline-flex items-center gap-1.5 ${
                  step === 2
                    ? "px-2.5 py-1 rounded-full bg-[#0B5D44] text-white"
                    : "text-[#0B5D44]"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step === 2
                      ? "bg-white/20 text-white"
                      : "bg-[#E6F4EF] text-[#0B5D44]"
                  }`}
                >
                  {step > 2 ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : "2"}
                </span>
                <span>Checkout</span>
              </li>
              <span className="w-4 h-px bg-neutral-300" aria-hidden="true" />
              <li
                className={`inline-flex items-center gap-1.5 ${
                  step === 3
                    ? "px-2.5 py-1 rounded-full bg-[#0B5D44] text-white"
                    : "text-neutral-400"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step === 3
                      ? "bg-white/20 text-white"
                      : "bg-neutral-200/80 text-neutral-500"
                  }`}
                >
                  3
                </span>
                <span>Confirmed</span>
              </li>
            </ol>
          )}

          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#F3FAF7] border border-[#B8DFD1]/90 text-[10.5px] sm:text-[11px] font-bold text-[#074230]">
            <Lock className="w-3 h-3 text-[#0B5D44] shrink-0" />
            <span className="hidden xs:inline">256-Bit SSL</span>
            <span className="xs:hidden">SSL</span>
          </div>
        </div>
      </div>

      {/* Compact Mobile Progress Bar (only on < lg during active checkout/confirmation) */}
      {step >= 2 && (
        <div className="lg:hidden border-t border-neutral-100 bg-[#FAFBF9] px-4 py-2">
          <ol
            aria-label="Checkout steps"
            className="max-w-md mx-auto flex items-center justify-between gap-2 text-[11px] font-semibold"
          >
            <li className="inline-flex items-center gap-1 text-[#0B5D44] shrink-0">
              <span className="w-4 h-4 rounded-full bg-[#E6F4EF] text-[#0B5D44] flex items-center justify-center">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
              <span>Bag</span>
            </li>
            <span className="flex-1 h-px bg-[#B8DFD1]" aria-hidden="true" />
            <li
              className={`inline-flex items-center gap-1 shrink-0 ${
                step === 2
                  ? "px-2.5 py-0.5 rounded-full bg-[#0B5D44] text-white"
                  : "text-[#0B5D44]"
              }`}
            >
              <span className="text-[10px] font-bold">{step > 2 ? "✓" : "2"}</span>
              <span>Delivery &amp; Pay</span>
            </li>
            <span
              className={`flex-1 h-px ${step === 3 ? "bg-[#B8DFD1]" : "bg-neutral-200"}`}
              aria-hidden="true"
            />
            <li
              className={`inline-flex items-center gap-1 shrink-0 ${
                step === 3
                  ? "px-2.5 py-0.5 rounded-full bg-[#0B5D44] text-white"
                  : "text-neutral-400"
              }`}
            >
              <span className="text-[10px] font-bold">3</span>
              <span>Done</span>
            </li>
          </ol>
        </div>
      )}
    </header>
  );
}
