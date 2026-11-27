"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import {
  BRAND_80_THEMES,
  Logo80AnimatedMark,
  LOGO80_PATHS,
} from "@/components/Logo80AnimatedMark";

const EMERALD_THEME = BRAND_80_THEMES[0];

// ---------------------------------------------------------------------------
// 1. Branded Logo #80 Verified Orbital Loader (Light & Dark Surfaces)
//    - Reduced-motion safe: orbital ring stays spinning while decorative motion calms
// ---------------------------------------------------------------------------
interface VittalBrandLoaderProps {
  label?: string;
  sublabel?: string;
  surface?: "light" | "dark";
  fullScreen?: boolean;
  size?: number;
  className?: string;
}

export function VittalBrandLoader({
  label = "Loading Vittal Lifestyle…",
  sublabel = "",
  surface = "light",
  fullScreen = false,
  size = 64,
  className = "",
}: VittalBrandLoaderProps) {
  const isDark = surface === "dark";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center text-center font-mograph ${
        fullScreen
          ? isDark
            ? "min-h-[100dvh] w-full bg-[#09110E] text-white px-4"
            : "min-h-[100dvh] w-full bg-[#F3FAF7] text-[#0C1412] px-4"
          : "py-10 px-4"
      } ${className}`}
    >
      <div
        className={`inline-flex flex-col items-center gap-3.5 ${
          fullScreen
            ? isDark
              ? "px-8 py-7 rounded-3xl bg-[#101B17]/90 border border-white/10 shadow-2xl"
              : "px-8 py-7 rounded-3xl bg-white/95 border border-[#B8DFD1]/70 shadow-lg"
            : ""
        }`}
      >
        <Logo80AnimatedMark
          theme={EMERALD_THEME}
          surface={isDark ? "dark" : "light"}
          mode="loader"
          size={size}
        />
        <div className="space-y-1">
          <p
            className={`text-sm font-bold tracking-tight ${
              isDark ? "text-white" : "text-[#0C1412]"
            }`}
          >
            {label}
          </p>
          {sublabel && (
            <p
              className={`text-[10px] font-mono uppercase tracking-[0.22em] ${
                isDark ? "text-[#E5C469]/90" : "text-[#0B5D44]"
              }`}
            >
              {sublabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Branded Logo #80 Shimmer Product Skeleton Grid (GPU transform sweep)
// ---------------------------------------------------------------------------
interface VittalSkeletonGridProps {
  count?: number;
  label?: string;
}

export function VittalSkeletonGrid({
  count = 8,
  label = "Curating 100% original products…",
}: VittalSkeletonGridProps) {
  const items = Array.from({ length: count });

  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[100dvh] bg-white text-[#0C1412] font-mograph"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Compact orbital status header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 mb-8 border-b border-neutral-100">
          <div className="flex items-center gap-3.5">
            <Logo80AnimatedMark
              theme={EMERALD_THEME}
              surface="light"
              mode="loader"
              size={44}
            />
            <div className="text-left">
              <p className="text-sm font-bold text-[#0C1412] tracking-tight">
                {label}
              </p>
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#0B5D44]">
                Verified Authentic Catalog
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((pill) => (
              <div
                key={pill}
                className="relative h-8 w-20 rounded-full bg-[#F3FAF7] border border-[#E6F4EF] overflow-hidden"
              >
                <div className="vl80-shimmer-bar absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/80 to-transparent" />
              </div>
            ))}
          </div>
        </div>

        {/* Responsive 2 -> 3 -> 4 column product card skeletons */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {items.map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-neutral-200/80 bg-white overflow-hidden shadow-2xs flex flex-col"
            >
              {/* Image placeholder with subtle #80 crest + sweeping emerald shimmer */}
              <div className="relative aspect-[4/5] bg-[#F3FAF7] flex items-center justify-center overflow-hidden">
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 64 64"
                  fill="none"
                  aria-hidden="true"
                  className="opacity-20"
                >
                  <path
                    d={LOGO80_PATHS.handle}
                    stroke="#C59B27"
                    strokeWidth="4.4"
                    strokeLinecap="round"
                  />
                  <path d={LOGO80_PATHS.bag} fill="#0B5D44" />
                  <path d={LOGO80_PATHS.checkLeft} fill="#A7F3D0" />
                  <path d={LOGO80_PATHS.checkRight} fill="#FFFFFF" />
                  <path d={LOGO80_PATHS.sparkle} fill="#C59B27" />
                </svg>
                <div className="vl80-shimmer-bar absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/75 to-transparent" />
              </div>

              {/* Meta lines */}
              <div className="p-3.5 space-y-2.5">
                <div className="relative h-2.5 w-1/3 rounded-full bg-[#E6F4EF] overflow-hidden">
                  <div className="vl80-shimmer-bar absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                </div>
                <div className="relative h-3.5 w-5/6 rounded-full bg-neutral-100 overflow-hidden">
                  <div className="vl80-shimmer-bar absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="relative h-4 w-16 rounded-full bg-[#E6F4EF] overflow-hidden">
                    <div className="vl80-shimmer-bar absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                  </div>
                  <div className="relative h-7 w-7 rounded-full bg-neutral-100 overflow-hidden">
                    <div className="vl80-shimmer-bar absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Interactive Logo #80 "100% Original Verified Stamp" (Sonar Ripple)
// ---------------------------------------------------------------------------
interface VittalVerifiedBadgeProps {
  compact?: boolean;
  className?: string;
}

export function VittalVerifiedBadge({
  compact = false,
  className = "",
}: VittalVerifiedBadgeProps) {
  const [replayKey, setReplayKey] = useState(0);
  const [flipKey, setFlipKey] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleTriggerFlip = () => {
    setIsFlipping(true);
    setFlipKey((prev) => prev + 1);
    setReplayKey((k) => k + 1);
  };

  if (compact) {
    return (
      <button
        type="button"
        onMouseEnter={handleTriggerFlip}
        onClick={handleTriggerFlip}
        aria-label="100% Original Marketplace Guarantee — click to replay verification seal"
        className={`w-full text-center p-4 rounded-2xl bg-gradient-to-b from-[#F3FAF7] to-[#FAFCF7] border border-[#B8DFD1]/80 shadow-2xs hover:border-[#0B5D44]/40 active:scale-[0.99] transition-all cursor-pointer flex flex-col items-center gap-1.5 min-h-[44px] group ${className}`}
      >
        <motion.div
          key={flipKey}
          animate={
            flipKey > 0
              ? {
                  rotateY: [0, 180, 360],
                  scale: [1, 1.12, 1],
                }
              : { rotateY: 0, scale: 1 }
          }
          transition={{
            duration: 0.75,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          onAnimationComplete={() => setIsFlipping(false)}
          style={{
            transformStyle: "preserve-3d",
            perspective: 600,
            backfaceVisibility: "visible",
          }}
          className="shrink-0 overflow-visible"
        >
          <Logo80AnimatedMark
            theme={EMERALD_THEME}
            surface="light"
            mode="verified"
            size={40}
            replayKey={replayKey}
          />
        </motion.div>
        <p className="text-xs font-extrabold text-[#0C1412] uppercase tracking-wide font-mograph">
          100% Original Verified
        </p>
        <p className="text-[11px] text-[#074230] leading-snug font-normal">
          Authorized brand sourcing, sealed batch checks &amp; insured pan-India express shipping.
        </p>
      </button>
    );
  }

  return (
    <button
      type="button"
      onMouseEnter={handleTriggerFlip}
      onClick={handleTriggerFlip}
      aria-label="100% Original Marketplace Guarantee — click to replay authenticity check"
      className={`w-full text-left rounded-2xl bg-gradient-to-r from-[#F3FAF7] via-white to-[#FBF8EE] border border-[#B8DFD1] hover:border-[#0B5D44]/50 active:scale-[0.99] px-3.5 py-3 flex items-center gap-3.5 shadow-2xs transition-all cursor-pointer min-h-[56px] group ${className}`}
    >
      <motion.div
        key={flipKey}
        animate={
          flipKey > 0
            ? {
                rotateY: [0, 180, 360],
                scale: [1, 1.12, 1],
              }
            : { rotateY: 0, scale: 1 }
        }
        transition={{
          duration: 0.75,
          ease: [0.4, 0.0, 0.2, 1],
        }}
        onAnimationComplete={() => setIsFlipping(false)}
        style={{
          transformStyle: "preserve-3d",
          perspective: 600,
          backfaceVisibility: "visible",
        }}
        className="shrink-0 overflow-visible"
      >
        <Logo80AnimatedMark
          theme={EMERALD_THEME}
          surface="light"
          mode="verified"
          size={44}
          replayKey={replayKey}
        />
      </motion.div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs sm:text-sm font-extrabold text-[#0C1412] tracking-tight">
            100% Original Marketplace Seal
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0B5D44] text-white uppercase tracking-wider">
            Verified
          </span>
        </div>
        <p className="text-[11px] text-[#074230] leading-snug mt-0.5">
          Direct authorized partner stock • Tamper-proof quality check before dispatch
        </p>
      </div>
      <motion.span
        animate={isFlipping ? { rotate: -360 } : { rotate: 0 }}
        transition={{ duration: 0.75, ease: "easeInOut" }}
        className="shrink-0 w-8 h-8 rounded-full bg-white border border-[#B8DFD1] flex items-center justify-center text-[#0B5D44] group-hover:bg-[#E6F4EF] transition-colors"
        aria-hidden="true"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </motion.span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// 4. 3D Doorstep Parcel Unboxing Celebration (Order-Tracking Delivered State)
// ---------------------------------------------------------------------------
interface VittalUnboxingCelebrationProps {
  orderNumber?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function VittalUnboxingCelebration({
  orderNumber,
  title = "Delivered & Verified at Your Doorstep!",
  subtitle = "Every sealed Vittal Lifestyle parcel passes our 100% Original authenticity inspection.",
  className = "",
}: VittalUnboxingCelebrationProps) {
  const [replayKey, setReplayKey] = useState(0);

  return (
    <div
      className={`rounded-3xl bg-gradient-to-br from-[#09110E] via-[#0D1E18] to-[#0B5D44]/95 border border-[#C59B27]/40 p-5 sm:p-6 text-white shadow-xl flex flex-col sm:flex-row items-center gap-5 ${className}`}
    >
      {/* 3D Carton Stage */}
      <button
        type="button"
        key={replayKey}
        onClick={() => setReplayKey((k) => k + 1)}
        aria-label="Replay 3D parcel unboxing animation"
        className="relative w-28 h-28 shrink-0 flex items-end justify-center pb-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E5C469] rounded-2xl"
        style={{ perspective: "800px" }}
      >
        {/* Rising Logo #80 Mark */}
        <div className="vl80-unbox-mark absolute top-1 z-20">
          <Logo80AnimatedMark
            theme={EMERALD_THEME}
            surface="dark"
            mode="order-success"
            size={54}
            replayKey={replayKey}
          />
        </div>

        {/* Parcel Lid (3D rotateX open) */}
        <div
          className="vl80-unbox-lid absolute bottom-10 w-20 h-4 rounded-t-md bg-gradient-to-r from-[#C59B27] via-[#E5C469] to-[#C59B27] border border-[#F3D37A]/70 z-30 shadow-md"
          style={{ transformStyle: "preserve-3d" }}
        />

        {/* Parcel Base */}
        <div className="relative w-20 h-10 rounded-b-lg bg-[#0B5D44] border border-[#10B981]/60 shadow-inner flex items-center justify-center z-10">
          <div className="w-3 h-full bg-[#C59B27]/85" />
        </div>
      </button>

      {/* Copy */}
      <div className="text-center sm:text-left flex-1 min-w-0">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C59B27]/20 border border-[#E5C469]/50 text-[#E5C469] text-[10px] font-mono uppercase tracking-[0.18em] mb-1.5">
          <span>100% Original Delivered</span>
          {orderNumber && <span>• {orderNumber}</span>}
        </div>
        <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
          {title}
        </h3>
        <p className="text-xs text-emerald-100/85 mt-1 leading-relaxed">
          {subtitle}
        </p>
        <button
          type="button"
          onClick={() => setReplayKey((k) => k + 1)}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-[11px] font-bold text-[#E5C469] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Replay Unbox</span>
        </button>
      </div>
    </div>
  );
}
