"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  Eye,
  Heart,
  Layers,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  Star,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
import {
  BRAND_LOGOS,
  VALID_BRAND_LOGO_IDS,
  type BrandLogoConcept,
  type BrandPalette,
} from "@/data/brandLogos";
import { siteConfig } from "@/config/siteConfig";
import { BrandIdentity80System } from "@/components/BrandIdentity80System";
import {
  BRAND_80_THEMES,
  Logo80AnimatedMark,
  Logo80MotionStyles,
} from "@/components/Logo80AnimatedMark";

// ---------------------------------------------------------------------------
// Authentic Multi-Brand Marketplace Palette Overrides
// ---------------------------------------------------------------------------

interface PalettePreset {
  id: string;
  label: string;
  swatch?: string;
  border?: string;
  palette: BrandPalette | null;
}

const PALETTE_PRESETS: PalettePreset[] = [
  { id: "curated", label: "Curated Mix (80)", palette: null },
  {
    id: "imperial-emerald",
    label: "Imperial Emerald ★",
    swatch: "#0B5D44",
    border: "#E5C469",
    palette: {
      lightBg: "#F5F7F6",
      darkBg: "#09110E",
      inkL: "#0C1412",
      inkD: "#FFFFFF",
      c1: "#10B981",
      c2: "#0B5D44",
      c3: "#E5C469",
    },
  },
  {
    id: "royal-plum",
    label: "Royal Plum",
    swatch: "#7C3AED",
    palette: {
      lightBg: "#FAF8FF",
      darkBg: "#100B18",
      inkL: "#1A102B",
      inkD: "#FFFFFF",
      c1: "#7C3AED",
      c2: "#5B21B6",
      c3: "#C084FC",
    },
  },
  {
    id: "commerce-amber",
    label: "Commerce Amber",
    swatch: "#F59E0B",
    palette: {
      lightBg: "#FFFFFF",
      darkBg: "#0D1117",
      inkL: "#111827",
      inkD: "#FFFFFF",
      c1: "#F59E0B",
      c2: "#B45309",
      c3: "#FCD34D",
    },
  },
  {
    id: "verified-emerald",
    label: "Verified Emerald",
    swatch: "#16A34A",
    palette: {
      lightBg: "#F6FBF8",
      darkBg: "#09130D",
      inkL: "#0D1F14",
      inkD: "#FFFFFF",
      c1: "#16A34A",
      c2: "#15803D",
      c3: "#4ADE80",
    },
  },
  {
    id: "luxury-berry",
    label: "Luxury Berry",
    swatch: "#E11D68",
    palette: {
      lightBg: "#FFF8FA",
      darkBg: "#140A0F",
      inkL: "#1E0F17",
      inkD: "#FFFFFF",
      c1: "#E11D68",
      c2: "#9F1239",
      c3: "#F472B6",
    },
  },
  {
    id: "navy-gold",
    label: "Navy & Gold",
    swatch: "#C99A2E",
    palette: {
      lightBg: "#F9F8F4",
      darkBg: "#09101E",
      inkL: "#0B1528",
      inkD: "#FFFFFF",
      c1: "#C99A2E",
      c2: "#856212",
      c3: "#EDD07A",
    },
  },
  {
    id: "editorial-mono",
    label: "Editorial Mono",
    swatch: "#FFFFFF",
    border: "#52525B",
    palette: {
      lightBg: "#FFFFFF",
      darkBg: "#09090B",
      inkL: "#0B0B0E",
      inkD: "#FFFFFF",
      c1: "#111114",
      c2: "#27272A",
      c3: "#71717A",
    },
  },
];

const ARCHETYPE_FILTERS = [
  { key: "all", label: "All 80" },
  { key: "star", label: "★ Top Picks" },
  { key: "1 ·", label: "1 · Shopping Bags & Totes" },
  { key: "2 ·", label: "2 · Verified & Authentic" },
  { key: "3 ·", label: "3 · Express & Parcels" },
  { key: "4 ·", label: "4 · App-Tile Monograms" },
  { key: "5 ·", label: "5 · Multi-Brand Hub" },
  { key: "6 ·", label: "6 · Luxury & Editorial" },
  { key: "7 ·", label: "7 · Beauty & Gifting" },
  { key: "8 ·", label: "8 · Flagship Masters" },
];

const STORAGE_KEY = "vl_brand_client_picks_v5";

// ---------------------------------------------------------------------------
// Safe Pure-Static SVG Mark & Wordmark Renderers
// ---------------------------------------------------------------------------

function resolvePalette(
  concept: BrandLogoConcept,
  override: BrandPalette | null
): BrandPalette {
  return override ?? concept.palette;
}

function buildInlineSvgHtml(
  concept: BrandLogoConcept,
  pal: BrandPalette,
  isDark: boolean
): string {
  const ink = isDark ? pal.inkD : pal.inkL;
  const isMono = pal.c1 === "#111114";
  const c1 = isDark && isMono ? "#FFFFFF" : pal.c1;
  const c2 = isDark && isMono ? "#D4D4D8" : pal.c2;
  const c3 = isDark && pal.c3 === "#71717A" ? "#A1A1AA" : pal.c3;
  const bg = isDark ? pal.darkBg : pal.lightBg;
  const onC1 = isDark && isMono ? pal.darkBg : "#FFFFFF";
  return concept.markTpl
    .replaceAll("__INK__", ink)
    .replaceAll("__C1__", c1)
    .replaceAll("__C2__", c2)
    .replaceAll("__C3__", c3)
    .replaceAll("__BG__", bg)
    .replaceAll("__ONC1__", onC1);
}

const BrandMark = React.memo(function BrandMark({
  concept,
  palette,
  size,
  isDark,
  className = "",
}: {
  concept: BrandLogoConcept;
  palette: BrandPalette;
  size: number;
  isDark: boolean;
  className?: string;
}) {
  const inner = useMemo(
    () => buildInlineSvgHtml(concept, palette, isDark),
    [concept, palette, isDark]
  );
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
});

const BrandWordmark = React.memo(function BrandWordmark({
  concept,
  palette,
  size,
  isDark,
}: {
  concept: BrandLogoConcept;
  palette: BrandPalette;
  size: number;
  isDark: boolean;
}) {
  const ink = isDark ? palette.inkD : palette.inkL;
  const isMono = palette.c1 === "#111114";
  const accent = isDark && isMono ? "#D4D4D8" : palette.c1;
  const muted = isDark ? "#A1A1AA" : "#64646C";
  const wm = concept.wordmark;

  if (wm.style === "tightUpper" || wm.style === "wideUpper" || wm.style === "serif") {
    const wt = wm.style === "serif" ? 600 : wm.style === "tightUpper" ? 800 : 700;
    const tracking =
      wm.style === "wideUpper"
        ? "0.22em"
        : wm.style === "serif"
          ? "0.14em"
          : "0.08em";
    return (
      <span className="inline-flex flex-col leading-none gap-[2px] select-none">
        <span
          style={{
            fontFamily: wm.font,
            fontWeight: wt,
            fontSize: `${size}px`,
            letterSpacing: tracking,
            color: ink,
          }}
        >
          {wm.w1}
        </span>
        <span
          style={{
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 600,
            fontSize: `${Math.max(7, Math.round(size * 0.34))}px`,
            letterSpacing: "0.34em",
            color: wm.style === "serif" ? muted : accent,
          }}
        >
          {wm.w2}
        </span>
      </span>
    );
  }

  if (wm.style === "lowercase") {
    return (
      <span
        className="leading-none select-none whitespace-nowrap"
        style={{
          fontFamily: wm.font,
          fontWeight: 800,
          fontSize: `${size}px`,
          letterSpacing: "-0.04em",
          color: ink,
        }}
      >
        {wm.w1}{" "}
        <span style={{ fontWeight: 400, color: muted }}>{wm.w2}</span>
      </span>
    );
  }

  return (
    <span
      className="leading-none select-none whitespace-nowrap"
      style={{
        fontFamily: wm.font,
        fontWeight: 800,
        fontSize: `${size}px`,
        letterSpacing: "-0.035em",
        color: ink,
      }}
    >
      {wm.w1} <span style={{ fontWeight: 500, color: accent }}>{wm.w2}</span>
    </span>
  );
});

// ---------------------------------------------------------------------------
// Live 5-Surface Authentic Multi-Brand Marketplace Mockup Stage
// ---------------------------------------------------------------------------

const MarketplaceMockupStage = React.memo(function MarketplaceMockupStage({
  concept,
  palette,
}: {
  concept: BrandLogoConcept;
  palette: BrandPalette;
}) {
  const darkMarkInner = useMemo(
    () => buildInlineSvgHtml(concept, palette, true),
    [concept, palette]
  );
  const lightMarkInner = useMemo(
    () => buildInlineSvgHtml(concept, palette, false),
    [concept, palette]
  );

  return (
    <div className="space-y-4">
      {/* 1. Marketplace Search-First Header Preview (Amazon / Purplle / Nykaa layout) */}
      <div
        className="rounded-2xl min-h-[66px] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-5 shadow-sm border border-black/[0.06]"
        style={{ backgroundColor: palette.lightBg }}
      >
        <div className="flex items-center gap-2.5 shrink-0">
          <BrandMark concept={concept} palette={palette} size={34} isDark={false} />
          <BrandWordmark concept={concept} palette={palette} size={18} isDark={false} />
        </div>

        {/* Universal Multi-Brand Search Bar */}
        <div
          className="hidden md:flex items-center gap-2.5 flex-1 max-w-md h-10 px-3.5 rounded-full bg-black/[0.045] border border-black/[0.09] text-neutral-500 text-xs"
          aria-hidden="true"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            Search 500+ original brands, beauty, fashion, fitness...
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0" aria-hidden="true">
          <span
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase"
            style={{
              backgroundColor: `${palette.c1}1A`,
              color: palette.c1 === "#111114" ? "#111114" : palette.c2,
            }}
          >
            <Check className="w-3 h-3 stroke-[2.8]" />
            <span>100% Original</span>
          </span>
          <span className="relative w-9 h-9 rounded-full bg-black/[0.05] border border-black/[0.09] flex items-center justify-center text-xs font-bold text-neutral-800">
            🛍
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
              style={{ backgroundColor: palette.c1 }}
            >
              3
            </span>
          </span>
        </div>
      </div>

      {/* 2–5. Live 4-Surface Marketplace Touchpoints (Snap Carousel on Mobile, Grid on Tablet/Desktop) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between sm:hidden px-0.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
            4 Marketplace Touchpoints
          </span>
          <span className="font-mono text-[10px] text-[#E5C469]">
            Swipe →
          </span>
        </div>
        <div
          className="flex overflow-x-auto snap-x snap-mandatory gap-3 -mx-4 px-4 pb-1 no-scrollbar sm:grid sm:grid-cols-2 xl:grid-cols-4 sm:gap-3.5 sm:mx-0 sm:px-0 sm:pb-0 sm:overflow-visible"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
        {/* Surface 01: Smartphone Home-Screen App Icon */}
        <div className="w-[80vw] max-w-[285px] shrink-0 snap-center sm:w-auto sm:max-w-none rounded-2xl bg-[#16181D] border border-white/10 p-4 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-wider text-neutral-400 uppercase">
              01 · Mobile App Icon
            </span>
            <span className="font-mono text-[9.5px] text-neutral-500">
              iOS &amp; Android
            </span>
          </div>
          <div className="h-[118px] flex items-center justify-center">
            <div className="w-[186px] h-[106px] rounded-2xl bg-gradient-to-br from-[#232631] to-[#12141A] border border-white/12 p-3 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400 px-1">
                <span>9:41</span>
                <span>5G · 100%</span>
              </div>
              <div className="flex items-center justify-between px-1">
                <div className="flex flex-col items-center gap-1 opacity-45">
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10" />
                  <span className="text-[8px] text-neutral-500">Maps</span>
                </div>
                <div className="flex flex-col items-center gap-1 relative">
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8.5px] font-extrabold text-white flex items-center justify-center z-10 shadow"
                    style={{ backgroundColor: palette.c1 === "#111114" ? "#E11D68" : palette.c1 }}
                  >
                    2
                  </span>
                  <div
                    className="w-12 h-12 rounded-[14px] flex items-center justify-center shadow-lg border border-white/20"
                    style={{ backgroundColor: palette.darkBg }}
                  >
                    <BrandMark concept={concept} palette={palette} size={34} isDark={true} />
                  </div>
                  <span className="text-[9.5px] font-bold text-white">Vittal</span>
                </div>
                <div className="flex flex-col items-center gap-1 opacity-45">
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10" />
                  <span className="text-[8px] text-neutral-500">Wallet</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-neutral-400">
            Instant home-screen &amp; push-alert recognition
          </p>
        </div>

        {/* Surface 02: Doorstep Unboxing Box & Security Tape */}
        <div className="w-[80vw] max-w-[285px] shrink-0 snap-center sm:w-auto sm:max-w-none rounded-2xl bg-[#16181D] border border-white/10 p-4 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-wider text-neutral-400 uppercase">
              02 · Delivery Box
            </span>
            <span className="font-mono text-[9.5px] text-neutral-500">
              Unboxing &amp; Tape
            </span>
          </div>
          <div className="h-[118px] flex items-center justify-center">
            <svg viewBox="0 0 180 124" className="w-full h-full max-w-[178px]" fill="none" aria-hidden="true">
              {/* Ground shadow */}
              <ellipse cx="90" cy="113" rx="64" ry="6" fill="rgba(0,0,0,0.45)" />
              {/* Top cardboard face */}
              <path d="M90 14L152 38L90 62L28 38L90 14Z" fill="#DFC39D" />
              {/* Tamper-evident branded security tape across top */}
              <path d="M62 24.8L124 48.8L114 52.8L52 28.8L62 24.8Z" fill={palette.c1} />
              {/* Left sunlit kraft face */}
              <path d="M28 38L90 62V108L28 84V38Z" fill="#C9A87C" />
              {/* Right shadowed kraft face */}
              <path d="M152 38L90 62V108L152 84V38Z" fill="#B28E61" />
              {/* White authentic shipping label on left panel */}
              <path d="M36 52L79 68.5V96L36 79.5V52Z" fill="#FFFFFF" opacity="0.94" />
              <g transform="translate(46, 59) scale(0.35)" dangerouslySetInnerHTML={{ __html: lightMarkInner }} />
              {/* Bold dark logo printed on right panel */}
              <g transform="translate(107, 63) scale(0.42)" dangerouslySetInnerHTML={{ __html: lightMarkInner }} />
              <text x="121" y="96" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontWeight="700" fontSize="6" letterSpacing="0.8" fill="#1F160E">
                100% ORIGINAL
              </text>
            </svg>
          </div>
          <p className="text-[11px] text-neutral-400">
            Doorstep shipping carton &amp; tamper-proof tape
          </p>
        </div>

        {/* Surface 03: Premium Retail Shopping Tote / Delivery Bag */}
        <div className="w-[80vw] max-w-[285px] shrink-0 snap-center sm:w-auto sm:max-w-none rounded-2xl bg-[#16181D] border border-white/10 p-4 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-wider text-neutral-400 uppercase">
              03 · Shopping Tote
            </span>
            <span className="font-mono text-[9.5px] text-neutral-500">
              Luxury Carry Bag
            </span>
          </div>
          <div className="h-[118px] flex items-center justify-center">
            <svg viewBox="0 0 150 130" className="w-full h-full max-w-[155px]" fill="none" aria-hidden="true">
              {/* Woven rope carry handle */}
              <path d="M55 32V22C55 12 95 12 95 22V32" stroke={palette.c3} strokeWidth="3.5" strokeLinecap="round" />
              {/* Bag side gusset */}
              <path d="M112 31L124 38V114L112 120V31Z" fill={palette.c1} />
              {/* Main matte luxury bag front */}
              <rect x="28" y="31" width="84" height="89" rx="5" fill={palette.darkBg} stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
              {/* Handle grommets */}
              <circle cx="55" cy="40" r="2.2" fill={palette.c3} />
              <circle cx="95" cy="40" r="2.2" fill={palette.c3} />
              {/* Centered selected logo on tote */}
              <g transform="translate(50, 46) scale(0.62)" dangerouslySetInnerHTML={{ __html: darkMarkInner }} />
              <text x="70" y="99" textAnchor="middle" fontFamily="Manrope, sans-serif" fontWeight="800" fontSize="8.5" letterSpacing="2.2" fill="#FFFFFF">
                VITTAL
              </text>
              <text x="70" y="109" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontWeight="600" fontSize="5.2" letterSpacing="1.6" fill={palette.c3}>
                ORIGINAL BRANDS
              </text>
            </svg>
          </div>
          <p className="text-[11px] text-neutral-400">
            Gift delivery tote &amp; boutique courier bag
          </p>
        </div>

        {/* Surface 04: 100% Original Verified Seal + 16px Browser Tab */}
        <div className="w-[80vw] max-w-[285px] shrink-0 snap-center sm:w-auto sm:max-w-none rounded-2xl bg-[#16181D] border border-white/10 p-4 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-wider text-neutral-400 uppercase">
              04 · Authenticity Seal
            </span>
            <span className="font-mono text-[9.5px] text-neutral-500">
              Verified + 16px Tab
            </span>
          </div>
          <div className="h-[118px] flex items-center justify-center gap-3.5">
            {/* Verified Original Brand Tag */}
            <svg viewBox="0 0 92 122" className="h-full w-auto" fill="none" aria-hidden="true">
              <path d="M46 2V17" stroke={palette.c3} strokeWidth="1.8" />
              <rect x="8" y="15" width="76" height="100" rx="10" fill={palette.lightBg} stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
              <circle cx="46" cy="25" r="3.4" fill="#16181D" stroke={palette.c1} strokeWidth="1.5" />
              <g transform="translate(27, 34) scale(0.58)" dangerouslySetInnerHTML={{ __html: lightMarkInner }} />
              <rect x="16" y="79" width="60" height="14" rx="7" fill={palette.c1} />
              <text x="46" y="88.5" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontWeight="700" fontSize="5.6" letterSpacing="0.5" fill={palette.c1 === "#111114" ? "#FFFFFF" : "#FFFFFF"}>
                100% ORIGINAL
              </text>
              <text x="46" y="105" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="5.2" letterSpacing="1" fill={palette.inkL}>
                VERIFIED SEAL
              </text>
            </svg>
            {/* Brand Trust Pill + 16px Browser Tab */}
            <div className="flex flex-col gap-2.5 items-start">
              <div className="rounded-xl bg-[#22252D] px-2.5 py-2 border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5">
                  <BrandMark concept={concept} palette={palette} size={16} isDark={true} />
                  <span className="text-[9.5px] font-bold text-white">Verified</span>
                </div>
                <span className="block font-mono text-[8px] text-neutral-400">
                  Authorized Brands
                </span>
              </div>
              <div className="rounded-lg bg-[#252830] px-2.5 py-1.5 flex items-center gap-1.5 border border-white/10">
                <BrandMark concept={concept} palette={palette} size={14} isDark={true} />
                <span className="text-[10px] text-neutral-200 font-medium">
                  vittallifestyle
                </span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-neutral-400">
            Zero-fake guarantee tag &amp; 16px browser favicon
          </p>
        </div>
        </div>
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Memoized Individual Logo Concept Card
// ---------------------------------------------------------------------------

interface LogoCardProps {
  concept: BrandLogoConcept;
  paletteOverride: BrandPalette | null;
  isPreviewActive: boolean;
  selectionRank: number;
  onPreview: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onOpenIdentity80?: () => void;
}

const LogoCard = React.memo(function LogoCard({
  concept,
  paletteOverride,
  isPreviewActive,
  selectionRank,
  onPreview,
  onToggleSelect,
  onOpenIdentity80,
}: LogoCardProps) {
  const pal = resolvePalette(concept, paletteOverride);
  const isSelected = selectionRank > 0;
  const isLogo80 = concept.id === "80";
  const archetypeShort = concept.world.split("·")[1]?.trim() || concept.world;

  return (
    <article
      className={`rounded-[22px] bg-[#121316] overflow-hidden flex flex-col transition-all duration-200 ${
        isLogo80 && isSelected
          ? "border-2 border-[#E5C469] shadow-[0_0_0_4px_rgba(16,185,129,0.22)]"
          : isSelected
            ? "border-2 border-[#E4C56A] shadow-[0_0_0_4px_rgba(228,197,106,0.16)]"
            : isPreviewActive
              ? "border-2 border-white/80 shadow-[0_0_0_3px_rgba(255,255,255,0.12)]"
              : "border border-white/10 hover:border-white/30"
      }`}
    >
      {isLogo80 && (
        <div className="px-4 py-1.5 bg-gradient-to-r from-[#0B5D44] to-[#0F7657] flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#F3D37A]">
            ★ Selected Identity #1 · Pinned on Top
          </span>
          <span className="font-mono text-[10px] text-white/90">
            Tap for Brand Book
          </span>
        </div>
      )}

      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between gap-2 border-b border-white/[0.07]">
        <div className="min-w-0 flex items-center gap-2">
          <span
            className="font-mono text-xs font-bold shrink-0"
            style={{ color: pal.c3 }}
          >
            #{concept.id}
          </span>
          <h3 className="text-sm font-bold text-white truncate">
            {concept.name}
          </h3>
        </div>
        <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-white/[0.08] text-neutral-200 shrink-0">
          {isSelected ? `Pick #${selectionRank}` : concept.badge}
        </span>
      </div>

      {/* Light & Dark Split Stage */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => (isLogo80 && onOpenIdentity80 ? onOpenIdentity80() : onPreview(concept.id))}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (isLogo80 && onOpenIdentity80) onOpenIdentity80();
            else onPreview(concept.id);
          }
        }}
        aria-label={
          isLogo80
            ? "Open complete Brand Identity & 10 Animations for Logo #80"
            : `Preview #${concept.id} ${concept.name} on App Icon, Delivery Box, Shopping Tote & Verified Seal`
        }
        className="grid grid-cols-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E4C56A]"
      >
        <div
          className="h-[156px] flex flex-col items-center justify-center gap-3.5 p-3 border-r border-black/[0.06]"
          style={{ backgroundColor: pal.lightBg }}
        >
          <BrandMark concept={concept} palette={pal} size={56} isDark={false} />
          <div className="inline-flex items-center gap-1.5 max-w-full overflow-hidden">
            <BrandMark concept={concept} palette={pal} size={17} isDark={false} />
            <BrandWordmark
              concept={concept}
              palette={pal}
              size={12}
              isDark={false}
            />
          </div>
        </div>
        <div
          className="h-[156px] flex flex-col items-center justify-center gap-3.5 p-3"
          style={{ backgroundColor: pal.darkBg }}
        >
          <BrandMark concept={concept} palette={pal} size={56} isDark={true} />
          <div className="inline-flex items-center gap-1.5 max-w-full overflow-hidden">
            <BrandMark concept={concept} palette={pal} size={17} isDark={true} />
            <BrandWordmark
              concept={concept}
              palette={pal}
              size={12}
              isDark={true}
            />
          </div>
        </div>
      </div>

      {/* 4-Color Palette Strip */}
      <div className="grid grid-cols-4 h-[7px]">
        <span style={{ backgroundColor: pal.c1 }} />
        <span style={{ backgroundColor: pal.inkL }} />
        <span style={{ backgroundColor: pal.c3 }} />
        <span style={{ backgroundColor: pal.lightBg }} />
      </div>

      {/* Card Footer & Selection Controls */}
      <div className="p-4 flex flex-col justify-between gap-3.5 flex-1">
        <p className="text-xs leading-relaxed text-neutral-400">
          <span className="font-mono text-[10px] text-neutral-300 mr-1.5">
            [{archetypeShort}]
          </span>
          {concept.rationale}
        </p>

        <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isLogo80 && onOpenIdentity80 ? (
              <button
                type="button"
                onClick={onOpenIdentity80}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-xl text-xs font-bold bg-[#0B5D44] hover:bg-[#0e7455] text-white border border-[#10B981]/50 transition-colors cursor-pointer"
                title="Open complete Brand Identity Book & 10 Marketplace Animations"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Brand Identity &amp; Motion</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onPreview(concept.id)}
                className="inline-flex items-center gap-1 min-h-[44px] px-3 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.14] text-neutral-200 border border-white/10 transition-colors cursor-pointer"
                title="Test on App Icon, Delivery Box, Shopping Tote & Authenticity Seal"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>
            )}
            <a
              href={`/brand/svg/marks/${concept.fileSlug}.svg`}
              download
              className="inline-flex items-center gap-1 min-h-[44px] px-3 rounded-xl font-mono text-[11px] font-semibold bg-white/[0.06] hover:bg-white/[0.14] text-neutral-200 border border-white/10 transition-colors"
              title="Download standalone vector SVG"
            >
              <Download className="w-3.5 h-3.5" />
              <span>SVG</span>
            </a>
          </div>

          <button
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggleSelect(concept.id)}
            className={`inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isSelected
                ? "bg-[#E4C56A] text-[#0A0A0B] hover:bg-[#edd280] shadow-sm"
                : "bg-white text-[#0A0A0B] hover:bg-neutral-200"
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.6]" />
                <span>Selected</span>
              </>
            ) : (
              <>
                <Heart className="w-3.5 h-3.5" />
                <span>Select</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
});

// ---------------------------------------------------------------------------
// Main Client Brand Selection Studio (v4.0 Authentic Marketplace Edition)
// ---------------------------------------------------------------------------

export function BrandSelectionStudio() {
  const searchParams = useSearchParams();

  const [previewId, setPreviewId] = useState<string>("80");
  const [palettePresetId, setPalettePresetId] = useState<string>("imperial-emerald");
  const [customHex, setCustomHex] = useState<string>("#0B5D44");
  const [customPalette, setCustomPalette] = useState<BrandPalette | null>(null);
  const [simulatorOpen, setSimulatorOpen] = useState<boolean>(true);
  const [identity80Open, setIdentity80Open] = useState<boolean>(false);

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchInput, setSearchInput] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");

  const [selectedIds, setSelectedIds] = useState<string[]>(["80"]);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [copiedNotice, setCopiedNotice] = useState<string>("");

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [clientName, setClientName] = useState<string>("");
  const [clientContact, setClientContact] = useState<string>("");
  const [favoriteId, setFavoriteId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [submittedRef, setSubmittedRef] = useState<{
    referenceId: string;
    favoriteId: string;
    selectedIds: string[];
  } | null>(null);

  const modalCloseBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      const urlPicks = searchParams?.get("picks");
      const urlPreview = searchParams?.get("preview");
      const urlPalette = searchParams?.get("palette");
      const urlIdentity = searchParams?.get("identity");

      if (urlIdentity === "80") {
        setIdentity80Open(true);
      }
      if (urlPreview && VALID_BRAND_LOGO_IDS.has(urlPreview)) {
        setPreviewId(urlPreview);
      }
      if (urlPalette) {
        const match = PALETTE_PRESETS.find((p) => p.id === urlPalette);
        if (match) setPalettePresetId(match.id);
      }

      if (urlPicks) {
        const parsed = Array.from(
          new Set(
            urlPicks
              .split(",")
              .map((s) => s.trim())
              .filter((id) => VALID_BRAND_LOGO_IDS.has(id))
          )
        );
        if (parsed.length > 0) {
          setSelectedIds(parsed);
          setPreviewId(parsed[0]);
          setHydrated(true);
          return;
        }
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) {
          const valid = arr.filter(
            (id): id is string =>
              typeof id === "string" && VALID_BRAND_LOGO_IDS.has(id)
          );
          if (valid.length > 0) setSelectedIds(valid);
        }
      }
    } catch {
      // Ignore private browsing storage errors
    }
    setHydrated(true);
  }, [searchParams]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds));
    } catch {
      // Ignore
    }
  }, [selectedIds, hydrated]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchInput.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (selectedIds.length > 0 && !selectedIds.includes(favoriteId)) {
      setFavoriteId(selectedIds[0]);
    } else if (selectedIds.length === 0) {
      setFavoriteId("");
    }
  }, [selectedIds, favoriteId]);

  useEffect(() => {
    if (!modalOpen) return;
    document.body.classList.add("modal-open");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    modalCloseBtnRef.current?.focus();
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [modalOpen]);

  const activePaletteOverride: BrandPalette | null = useMemo(() => {
    if (palettePresetId === "custom") return customPalette;
    return PALETTE_PRESETS.find((p) => p.id === palettePresetId)?.palette ?? null;
  }, [palettePresetId, customPalette]);

  const activeConcept = useMemo(
    () => BRAND_LOGOS.find((l) => l.id === previewId) || BRAND_LOGOS[0],
    [previewId]
  );

  const activePal = useMemo(
    () => resolvePalette(activeConcept, activePaletteOverride),
    [activeConcept, activePaletteOverride]
  );

  const filteredLogos = useMemo(() => {
    const matched = BRAND_LOGOS.filter((m) => {
      if (activeFilter === "star" && !m.star) return false;
      if (activeFilter === "selected" && !selectedIds.includes(m.id)) return false;
      if (activeFilter.includes("·") && !m.world.startsWith(activeFilter)) return false;
      if (debouncedQuery) {
        const hay = `${m.id} ${m.name} ${m.world} ${m.badge} ${m.rationale}`.toLowerCase();
        if (!hay.includes(debouncedQuery)) return false;
      }
      return true;
    });
    // Always pin Logo #80 first on top, followed by any other selected picks, then remaining concepts
    return matched.sort((a, b) => {
      if (a.id === "80") return -1;
      if (b.id === "80") return 1;
      const aSel = selectedIds.indexOf(a.id);
      const bSel = selectedIds.indexOf(b.id);
      if (aSel !== -1 && bSel !== -1) return aSel - bSel;
      if (aSel !== -1) return -1;
      if (bSel !== -1) return 1;
      return 0;
    });
  }, [activeFilter, selectedIds, debouncedQuery]);

  const handlePreview = useCallback((id: string) => {
    setPreviewId(id);
    setSimulatorOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleCustomHexChange = useCallback((hex: string) => {
    setCustomHex(hex);
    setPalettePresetId("custom");
    setCustomPalette({
      lightBg: "#FAF8F6",
      darkBg: "#0C0D0F",
      inkL: "#111114",
      inkD: "#FFFFFF",
      c1: hex,
      c2: "#1F2937",
      c3: hex,
    });
  }, []);

  const buildShareUrl = useCallback(
    (ids: string[]) => {
      const base =
        typeof window !== "undefined"
          ? `${window.location.origin}/brand`
          : `${siteConfig.url}/brand`;
      const params = new URLSearchParams();
      if (ids.length > 0) params.set("picks", ids.join(","));
      if (palettePresetId !== "curated" && palettePresetId !== "custom") {
        params.set("palette", palettePresetId);
      }
      const qs = params.toString();
      return qs ? `${base}?${qs}` : base;
    },
    [palettePresetId]
  );

  const buildWhatsAppShareHref = useCallback(
    (ids: string[], topFav?: string, refId?: string) => {
      const targetIds = ids.length > 0 ? ids : [previewId];
      const names = targetIds
        .map((id) => {
          const item = BRAND_LOGOS.find((b) => b.id === id);
          return item ? `#${item.id} ${item.name}` : `#${id}`;
        })
        .join("\n• ");
      const shareUrl = buildShareUrl(targetIds);
      const palLabel =
        palettePresetId === "custom"
          ? `Custom (${customHex})`
          : PALETTE_PRESETS.find((p) => p.id === palettePresetId)?.label || "Curated Mix";
      const lines = [
        "Hi Vittal Lifestyle Team, here is our Brand Logo Selection:",
        refId ? `Ref: ${refId}` : "",
        clientName ? `Reviewer: ${clientName}` : "",
        topFav ? `Top Favorite: #${topFav}` : "",
        `Color Direction: ${palLabel}`,
        "",
        `Shortlisted Concepts (${targetIds.length}):`,
        `• ${names}`,
        notes ? `\nNotes: ${notes}` : "",
        `\nView Picks: ${shareUrl}`,
      ].filter(Boolean);
      return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
    },
    [previewId, buildShareUrl, palettePresetId, customHex, clientName, notes]
  );

  const handleCopyLink = useCallback(async () => {
    const ids = selectedIds.length > 0 ? selectedIds : [previewId];
    const url = buildShareUrl(ids);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedNotice("Selection link copied");
      setTimeout(() => setCopiedNotice(""), 2400);
    } catch {
      setCopiedNotice(url);
    }
  }, [selectedIds, previewId, buildShareUrl]);

  const handleSubmitSelection = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (clientName.trim().length < 2) {
      setSubmitError("Please enter your name so our design team knows who submitted these picks.");
      return;
    }
    if (selectedIds.length === 0) {
      setSubmitError("Please select at least one logo concept.");
      return;
    }

    setSubmitting(true);
    try {
      const paletteMode =
        palettePresetId === "custom" ? `custom:${customHex}` : palettePresetId;

      const res = await fetch("/api/brand/selections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          clientName: clientName.trim(),
          clientContact: clientContact.trim(),
          selectedIds,
          favoriteId: favoriteId || selectedIds[0],
          paletteMode,
          notes: notes.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSubmitError(data.error || "Unable to save selection right now.");
        return;
      }
      setSubmittedRef({
        referenceId: data.referenceId,
        favoriteId: data.favoriteId,
        selectedIds: data.selectedIds,
      });
    } catch {
      setSubmitError(
        "Connection timed out. You can still share your picks directly via WhatsApp or Copy Link below."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#090A0B] text-[#F5F5F7] pb-36 selection:bg-[#E4C56A] selection:text-[#0A0A0B]">
      <a
        href="#brand-grid"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] bg-white text-[#0A0A0B] font-bold px-4 py-2.5 rounded-xl"
      >
        Skip to 80 Marketplace Logo Concepts
      </a>

      {/* Sticky Editorial Top Studio Bar (Mobile-Compact with Swipeable Palette Rail) */}
      <header
        className="sticky top-0 z-50 bg-[#0A0B0D]/95 backdrop-blur-xl border-b border-white/10"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-[1480px] mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10.5px] sm:text-[11px] font-semibold tracking-widest uppercase text-[#E4C56A] truncate">
                Vittal Lifestyle · Brand Studio
              </span>
              <span className="hidden sm:inline-block text-white/25">·</span>
              <span className="hidden sm:inline font-mono text-[11px] text-neutral-400">
                80 Marketplace Identities · #80 Selected on Top
              </span>
            </div>
            <h1
              className="text-sm sm:text-lg font-extrabold tracking-tight text-white mt-0.5 truncate sm:whitespace-normal"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Tap Logo #80 for Complete Brand Identity &amp; 10 Animations
            </h1>
          </div>

          <div
            className="flex items-center gap-1.5 flex-nowrap overflow-x-auto no-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0 sm:flex-wrap"
            style={{ WebkitOverflowScrolling: "touch" }}
            role="group"
            aria-label="Color palette override"
          >
            {PALETTE_PRESETS.map((preset) => {
              const active = palettePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setPalettePresetId(preset.id)}
                  className={`inline-flex items-center gap-1.5 min-h-[42px] sm:min-h-[38px] px-3 rounded-full text-xs font-semibold border transition-colors cursor-pointer shrink-0 ${
                    active
                      ? "bg-white/15 border-white text-white"
                      : "bg-white/[0.05] border-white/15 text-neutral-300 hover:border-white/35"
                  }`}
                >
                  {preset.swatch && (
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: preset.swatch,
                        border: preset.border ? `1px solid ${preset.border}` : undefined,
                      }}
                    />
                  )}
                  <span className="whitespace-nowrap">{preset.label}</span>
                </button>
              );
            })}
            <label
              className="inline-flex items-center justify-center w-[42px] h-[42px] sm:w-[38px] sm:h-[38px] rounded-full border border-white/25 cursor-pointer overflow-hidden shrink-0"
              title="Test all 80 logos in a custom HEX accent"
            >
              <span className="sr-only">Custom accent color</span>
              <input
                type="color"
                value={customHex}
                onChange={(e) => handleCustomHexChange(e.target.value)}
                className="w-10 h-10 border-0 bg-transparent cursor-pointer"
              />
            </label>
          </div>
        </div>
      </header>

      <main className="max-w-[1480px] mx-auto px-3.5 sm:px-6 pt-4 sm:pt-5 space-y-5 sm:space-y-6">
        <Logo80MotionStyles />

        {/* OFFICIAL SELECTED IDENTITY SPOTLIGHT (#80 — PINNED AT VERY TOP FOR MOBILE & DESKTOP) */}
        <section
          aria-label="Official selected brand identity Logo 80 spotlight"
          onClick={() => setIdentity80Open(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIdentity80Open(true);
            }
          }}
          className="group rounded-3xl p-4 sm:p-5 border-2 border-[#10B981]/50 bg-gradient-to-r from-[#091511] via-[#0D211A] to-[#111513] hover:border-[#E5C469]/80 transition-colors cursor-pointer shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0B5D44] border border-[#E5C469]/50 flex items-center justify-center shrink-0 shadow-lg">
              <Logo80AnimatedMark
                theme={BRAND_80_THEMES[0]}
                surface="brand"
                mode="hover-press"
                size={44}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E5C469]/20 border border-[#E5C469]/50 font-mono text-[10px] font-bold uppercase tracking-wider text-[#E5C469]">
                  ★ Selected #1 · Logo #80
                </span>
                <span className="font-mono text-[10px] sm:text-[10.5px] text-emerald-300">
                  Imperial Emerald &amp; Gold
                </span>
              </div>
              <h2
                className="text-base sm:text-lg font-extrabold text-white mt-1 leading-snug"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Vittal Sovereign Marketplace Master
              </h2>
              <p className="text-xs text-neutral-300 mt-0.5 line-clamp-2 sm:line-clamp-none">
                Tap to explore complete brand identity: 10 live animations, lockup SVG downloads, 60–30–10 color tokens &amp; mockups.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-2xl md:rounded-full bg-[#E5C469] group-hover:bg-[#f0d380] text-[#09110E] text-sm font-extrabold shrink-0 transition-colors w-full md:w-auto">
            <span>Open Complete Identity &amp; Animations</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </span>
        </section>

        {/* LIVE 5-SURFACE AUTHENTIC MARKETPLACE MOCKUP STAGE */}
        <section
          aria-label="Live 5-surface authentic marketplace mockup stage"
          className="rounded-3xl bg-[#121316] border border-white/12 p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#E4C56A] shrink-0" />
              <span className="font-mono text-xs font-semibold text-[#E4C56A] truncate">
                LIVE MARKETPLACE TOUCHPOINTS — #{activeConcept.id} · {activeConcept.name} ({activeConcept.world})
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {activeConcept.id === "80" && (
                <button
                  type="button"
                  onClick={() => setIdentity80Open(true)}
                  className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 rounded-full text-xs font-extrabold bg-[#0B5D44] hover:bg-[#0e7455] text-white border border-[#10B981]/50 cursor-pointer transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Full Brand Identity &amp; Animations</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleToggleSelect(activeConcept.id)}
                className={`inline-flex items-center gap-1.5 min-h-[36px] px-3.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  selectedIds.includes(activeConcept.id)
                    ? "bg-[#E4C56A] text-[#0A0A0B]"
                    : "bg-white text-[#0A0A0B] hover:bg-neutral-200"
                }`}
              >
                {selectedIds.includes(activeConcept.id) ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.6]" />
                    <span>Selected</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-3.5 h-3.5" />
                    <span>Select #{activeConcept.id}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setSimulatorOpen((o) => !o)}
                className="inline-flex items-center gap-1 min-h-[36px] px-3 rounded-full text-xs font-semibold bg-white/[0.06] border border-white/12 text-neutral-300 hover:text-white cursor-pointer"
                aria-expanded={simulatorOpen}
              >
                <span>{simulatorOpen ? "Hide Mockups" : "Show Mockups"}</span>
                {simulatorOpen ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {simulatorOpen && (
            <MarketplaceMockupStage concept={activeConcept} palette={activePal} />
          )}
        </section>

        {/* ARCHETYPE FILTERS & SEARCH (Single-Row Horizontal Swipe Rail on Mobile) */}
        <section
          aria-label="Filter and search 80 marketplace logo concepts"
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-3"
        >
          <div
            className="flex flex-nowrap overflow-x-auto no-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0 sm:flex-wrap gap-1.5"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {ARCHETYPE_FILTERS.map((f) => {
              const active = activeFilter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveFilter(f.key)}
                  className={`min-h-[44px] sm:min-h-[40px] px-3.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                    active
                      ? "bg-white border-white text-[#0A0A0B]"
                      : "bg-[#121316] border-white/10 text-neutral-300 hover:border-white/35 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
            <button
              type="button"
              aria-pressed={activeFilter === "selected"}
              onClick={() => setActiveFilter("selected")}
              className={`min-h-[44px] sm:min-h-[40px] px-3.5 rounded-full text-xs font-bold border transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                activeFilter === "selected"
                  ? "bg-[#E4C56A] border-[#E4C56A] text-[#0A0A0B]"
                  : "bg-[#E4C56A]/15 border-[#E4C56A]/45 text-[#E4C56A] hover:bg-[#E4C56A]/25"
              }`}
            >
              My Shortlist ({selectedIds.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search bag, verified, smile, box, app, plum..."
                aria-label="Search 80 marketplace logo concepts"
                className="min-h-[44px] w-full sm:w-64 pl-10 pr-4 rounded-full bg-[#121316] border border-white/12 text-white placeholder:text-neutral-500 text-base sm:text-sm focus:outline-none focus:border-white/40"
              />
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white shrink-0 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedNotice ? "Copied!" : "Share Link"}</span>
            </button>
          </div>
        </section>

        {/* 80-IDENTITY MARKETPLACE GRID */}
        <section
          id="brand-grid"
          aria-label="80 Vittal Lifestyle Authentic Marketplace Identities"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
        >
          {filteredLogos.length === 0 ? (
            <div className="col-span-full rounded-3xl bg-[#121316] border border-white/10 p-12 text-center space-y-3">
              <p className="text-neutral-300 text-sm">
                No logo concepts match your current filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveFilter("all");
                  setSearchInput("");
                }}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-5 rounded-full bg-white text-[#0A0A0B] text-xs font-bold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Show All 80 Concepts</span>
              </button>
            </div>
          ) : (
            filteredLogos.map((concept) => {
              const idx = selectedIds.indexOf(concept.id);
              return (
                <LogoCard
                  key={concept.id}
                  concept={concept}
                  paletteOverride={activePaletteOverride}
                  isPreviewActive={concept.id === previewId}
                  selectionRank={idx >= 0 ? idx + 1 : 0}
                  onPreview={handlePreview}
                  onToggleSelect={handleToggleSelect}
                  onOpenIdentity80={
                    concept.id === "80" ? () => setIdentity80Open(true) : undefined
                  }
                />
              );
            })
          )}
        </section>
      </main>

      {/* FLOATING CLIENT SELECTION BAR */}
      <div
        className="fixed bottom-0 inset-x-0 z-40 px-3 sm:px-6 pt-2 pointer-events-none"
        style={{ paddingBottom: "max(14px, env(safe-area-inset-bottom))" }}
      >
        <div className="max-w-[960px] mx-auto pointer-events-auto rounded-2xl bg-[#15171C]/95 backdrop-blur-xl border border-white/18 shadow-[0_18px_50px_rgba(0,0,0,0.72)] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-[#E4C56A]/15 border border-[#E4C56A]/40 flex items-center justify-center text-[#E4C56A] shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            {selectedIds.length === 0 ? (
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-white truncate">
                  Tap &ldquo;Select&rdquo; on your favorite logos
                </p>
                <p className="text-[11px] text-neutral-400 truncate">
                  Click any card to test it live on Search Header, App Icon, Delivery Box, Tote &amp; Original Seal
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {selectedIds.map((id) => {
                  const item = BRAND_LOGOS.find((b) => b.id === id);
                  if (!item) return null;
                  const pal = resolvePalette(item, activePaletteOverride);
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full bg-white/10 border border-white/15 shrink-0"
                    >
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: pal.lightBg }}
                      >
                        <BrandMark concept={item} palette={pal} size={14} isDark={false} />
                      </span>
                      <span className="font-mono text-[11px] font-bold text-white">
                        #{id}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(id)}
                        aria-label={`Remove #${id} from selection`}
                        className="text-neutral-400 hover:text-white p-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            {selectedIds.length > 0 && (
              <a
                href={buildWhatsAppShareHref(selectedIds, favoriteId)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#86EFAC] text-xs font-bold transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => {
                setSubmittedRef(null);
                setSubmitError("");
                if (selectedIds.length === 0) setSelectedIds([previewId]);
                setModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-xl bg-[#E4C56A] hover:bg-[#edd280] text-[#0A0A0B] text-xs sm:text-sm font-extrabold transition-colors cursor-pointer flex-1 sm:flex-none"
            >
              <Send className="w-4 h-4" />
              <span>
                {selectedIds.length > 0
                  ? `Submit ${selectedIds.length} Pick${selectedIds.length > 1 ? "s" : ""}`
                  : `Submit #${previewId}`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* COMPLETE LOGO #80 BRAND IDENTITY & 10-ANIMATION MOTION LAB OVERLAY */}
      {identity80Open && (
        <BrandIdentity80System
          initialThemeId={
            palettePresetId === "royal-plum" ||
            palettePresetId === "commerce-amber" ||
            palettePresetId === "editorial-mono"
              ? palettePresetId
              : "imperial-emerald"
          }
          onClose={() => setIdentity80Open(false)}
          onApproveSelect80={() => {
            setIdentity80Open(false);
            setSelectedIds((prev) => (prev.includes("80") ? prev : ["80", ...prev]));
            setFavoriteId("80");
            setSubmittedRef(null);
            setSubmitError("");
            setModalOpen(true);
          }}
        />
      )}

      {/* CLIENT SELECTION SUBMISSION MODAL */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-selection-title"
            className="w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#14161B] border border-white/15 p-5 sm:p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-[#E4C56A]">
                  Vittal Lifestyle · Client Approval
                </p>
                <h2
                  id="submit-selection-title"
                  className="text-xl font-extrabold text-white mt-0.5"
                >
                  {submittedRef ? "Selection Received" : "Submit Your Logo Picks"}
                </h2>
              </div>
              <button
                ref={modalCloseBtnRef}
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close submission modal"
                className="w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.16] flex items-center justify-center text-white cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submittedRef ? (
              <div className="space-y-4">
                <div className="rounded-2xl bg-[#15803D]/15 border border-[#4ADE80]/35 p-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-[#4ADE80] font-bold text-sm">
                    <Check className="w-4 h-4 stroke-[2.6]" />
                    <span>Saved for the Vittal Lifestyle design team</span>
                  </div>
                  <p className="font-mono text-xs text-neutral-200">
                    Reference ID: <strong>{submittedRef.referenceId}</strong>
                  </p>
                  <p className="text-xs text-neutral-300">
                    Top Favorite: <strong>#{submittedRef.favoriteId}</strong> ·
                    Shortlist:{" "}
                    {submittedRef.selectedIds.map((id) => `#${id}`).join(", ")}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <a
                    href={buildWhatsAppShareHref(
                      submittedRef.selectedIds,
                      submittedRef.favoriteId,
                      submittedRef.referenceId
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 min-h-[46px] px-4 rounded-xl bg-[#25D366] hover:bg-[#22c55e] text-[#052e16] font-extrabold text-sm transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send Picks on WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center justify-center gap-2 min-h-[46px] px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copiedNotice ? "Link Copied!" : "Copy Share Link"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitSelection} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Choose Your #1 Top Favorite ({selectedIds.length} Shortlisted)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedIds.map((id) => {
                      const item = BRAND_LOGOS.find((b) => b.id === id);
                      if (!item) return null;
                      const pal = resolvePalette(item, activePaletteOverride);
                      const isFav = favoriteId === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setFavoriteId(id)}
                          aria-pressed={isFav}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                            isFav
                              ? "bg-[#E4C56A]/18 border-[#E4C56A] text-white"
                              : "bg-white/[0.04] border-white/12 text-neutral-300 hover:border-white/30"
                          }`}
                        >
                          <span
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: pal.lightBg }}
                          >
                            <BrandMark concept={item} palette={pal} size={22} isDark={false} />
                          </span>
                          <span className="min-w-0">
                            <span className="flex items-center gap-1 font-mono text-[11px] font-bold">
                              #{id}
                              {isFav && <Star className="w-3 h-3 fill-[#E4C56A] text-[#E4C56A]" />}
                            </span>
                            <span className="block text-[10.5px] truncate text-neutral-400">
                              {item.name}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="client-name-input" className="block text-xs font-bold text-neutral-200">
                    Your Name <span className="text-[#E4C56A]">*</span>
                  </label>
                  <input
                    id="client-name-input"
                    type="text"
                    required
                    minLength={2}
                    maxLength={80}
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Founder / Brand Lead"
                    className="w-full min-h-[46px] px-3.5 rounded-xl bg-[#0D0E12] border border-white/15 text-white placeholder:text-neutral-500 text-base focus:outline-none focus:border-[#E4C56A]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="client-contact-input" className="block text-xs font-bold text-neutral-200">
                    WhatsApp Number or Email{" "}
                    <span className="text-neutral-500 font-normal">(optional)</span>
                  </label>
                  <input
                    id="client-contact-input"
                    type="text"
                    maxLength={120}
                    value={clientContact}
                    onChange={(e) => setClientContact(e.target.value)}
                    placeholder="e.g. +91 98xxx xxxxx or email@domain.com"
                    className="w-full min-h-[46px] px-3.5 rounded-xl bg-[#0D0E12] border border-white/15 text-white placeholder:text-neutral-500 text-base focus:outline-none focus:border-[#E4C56A]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="client-notes-input" className="block text-xs font-bold text-neutral-200">
                    Feedback, Color Tweaks or Product Notes{" "}
                    <span className="text-neutral-500 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="client-notes-input"
                    rows={3}
                    maxLength={1000}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Love #01 on running shoes and #50 on protein tubs & tees..."
                    className="w-full p-3.5 rounded-xl bg-[#0D0E12] border border-white/15 text-white placeholder:text-neutral-500 text-base focus:outline-none focus:border-[#E4C56A] resize-y"
                  />
                </div>

                {submitError && (
                  <p role="alert" className="text-xs font-semibold text-rose-300 bg-rose-950/50 border border-rose-500/35 rounded-xl px-3.5 py-2.5">
                    {submitError}
                  </p>
                )}

                <p className="text-[11px] text-neutral-400">
                  Your selection is shared privately with the Vittal Lifestyle design team to finalize your brand kit.
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-xl bg-[#E4C56A] hover:bg-[#edd280] disabled:opacity-60 text-[#0A0A0B] font-extrabold text-sm transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? "Saving Selection..." : "Confirm & Submit Selection"}</span>
                  </button>
                  <a
                    href={buildWhatsAppShareHref(selectedIds, favoriteId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 min-h-[48px] px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white font-bold text-sm transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-[#4ADE80]" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
