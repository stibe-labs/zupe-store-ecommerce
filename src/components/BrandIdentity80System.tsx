"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  ExternalLink,
  MessageCircle,
  Pause,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import {
  BRAND_80_THEMES,
  LOGO80_PATHS,
  Logo80AnimatedMark,
  Logo80MotionStyles,
  MOTION_SPEC,
  buildLogo80SvgString,
  type BrandSystemTheme,
  type Logo80LockupVariant,
} from "@/components/Logo80AnimatedMark";
import { siteConfig } from "@/config/siteConfig";

interface BrandIdentity80SystemProps {
  /** When rendered as an overlay inside /brand, provide onClose */
  onClose?: () => void;
  /** Optional initial theme id matching BRAND_80_THEMES */
  initialThemeId?: string;
  /** Optional callback to open the D1 approval modal with #80 pre-selected */
  onApproveSelect80?: () => void;
}

function downloadSvgFile(filename: string, svgText: string) {
  const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function BrandIdentity80System({
  onClose,
  initialThemeId = "imperial-emerald",
  onApproveSelect80,
}: BrandIdentity80SystemProps) {
  const [themeId, setThemeId] = useState<string>(() =>
    BRAND_80_THEMES.some((t) => t.id === initialThemeId)
      ? initialThemeId
      : "imperial-emerald"
  );
  const [heroSurface, setHeroSurface] = useState<"dark" | "light" | "brand">("dark");
  const [labSurface, setLabSurface] = useState<"dark" | "light" | "brand">("dark");
  const [speed, setSpeed] = useState<number>(1);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Independent replay keys so each animation can be triggered cleanly on demand
  const [heroReplay, setHeroReplay] = useState<number>(1);
  const [splashKey, setSplashKey] = useState<number>(1);
  const [cartKey, setCartKey] = useState<number>(1);
  const [cartCount, setCartCount] = useState<number>(2);
  const [verifyKey, setVerifyKey] = useState<number>(1);
  const [orderKey, setOrderKey] = useState<number>(1);
  const [notifKey, setNotifKey] = useState<number>(1);
  const [notifCount, setNotifCount] = useState<number>(1);
  const [unboxKey, setUnboxKey] = useState<number>(1);
  const [ambientPaused, setAmbientPaused] = useState<boolean>(false);
  const [hoverTapActive, setHoverTapActive] = useState<boolean>(false);
  const hoverTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [copiedToken, setCopiedToken] = useState<string>("");
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    return () => {
      if (hoverTapTimerRef.current) clearTimeout(hoverTapTimerRef.current);
    };
  }, []);

  const triggerHoverTap = useCallback(() => {
    setHoverTapActive(true);
    if (hoverTapTimerRef.current) clearTimeout(hoverTapTimerRef.current);
    hoverTapTimerRef.current = setTimeout(() => setHoverTapActive(false), 420);
  }, []);

  const theme: BrandSystemTheme =
    BRAND_80_THEMES.find((t) => t.id === themeId) || BRAND_80_THEMES[0];

  // Escape key & scroll lock when opened as an overlay modal
  useEffect(() => {
    if (!onClose) return;
    document.body.classList.add("modal-open");
    closeBtnRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const copyText = useCallback(async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToken(label);
      setTimeout(() => setCopiedToken(""), 2200);
    } catch {
      setCopiedToken(label);
    }
  }, []);

  const replayAllAnimations = useCallback(() => {
    setHeroReplay((k) => k + 1);
    setSplashKey((k) => k + 1);
    setCartKey((k) => k + 1);
    setVerifyKey((k) => k + 1);
    setOrderKey((k) => k + 1);
    setNotifKey((k) => k + 1);
    setUnboxKey((k) => k + 1);
  }, []);

  const cssTokensSnippet = `:root {
  /* Vittal Lifestyle — Official #80 Brand Identity (${theme.name}) */
  --vl-canvas: ${theme.canvasLight};
  --vl-surface: ${theme.surfaceLight};
  --vl-canvas-dark: ${theme.canvasDark};
  --vl-ink: ${theme.inkLight};
  --vl-primary: ${theme.primary};
  --vl-primary-dark: ${theme.primaryDark};
  --vl-verified: ${theme.vivid};
  --vl-accent-gold: ${theme.accent};
  --vl-accent-text: ${theme.accentTextLight};

  /* Named Motion Curves (GPU-Composited) */
  --vl-ease-out: ${MOTION_SPEC.curves.easeOut};
  --vl-ease-in: ${MOTION_SPEC.curves.easeIn};
  --vl-ease-in-out: ${MOTION_SPEC.curves.easeInOut};
  --vl-spring-pop: ${MOTION_SPEC.curves.springPop};
}`;

  const stageBg = (s: "dark" | "light" | "brand") =>
    s === "brand"
      ? theme.markBrand.bg
      : s === "light"
        ? theme.canvasLight
        : theme.canvasDark;

  const lockupDownloads: {
    variant: Logo80LockupVariant;
    title: string;
    usage: string;
    bg: string;
    darkText?: boolean;
  }[] = [
    {
      variant: "horizontal-light",
      title: "Primary Horizontal (Light)",
      usage: "Website Header, Invoices, Press Kit",
      bg: theme.canvasLight,
      darkText: true,
    },
    {
      variant: "horizontal-dark",
      title: "Primary Horizontal (Dark)",
      usage: "Dark Mode UI, Splash Screen, Video Outro",
      bg: theme.canvasDark,
    },
    {
      variant: "mark-brand-tile",
      title: "App Icon Squircle Tile",
      usage: "iOS App Store, Android Play Store, Social Avatar",
      bg: theme.surfaceDark,
    },
    {
      variant: "stacked-light",
      title: "Stacked Retail Lockup",
      usage: "Shopping Totes, Delivery Boxes, Hang-Tags",
      bg: theme.surfaceLight,
      darkText: true,
    },
    {
      variant: "mono-black",
      title: "Monochrome Ink Stamp",
      usage: "Thermal Shipping Labels, Blind Deboss, Receipts",
      bg: "#FFFFFF",
      darkText: true,
    },
    {
      variant: "gold-foil",
      title: "Champagne Gold Foil Crest",
      usage: "Luxury Gift Boxes, Royal Dates Jars, VIP Cards",
      bg: "#09110E",
    },
  ];

  const whatsAppApproveHref = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    `Hi Vittal Lifestyle Team, we approve Logo #80 (Vittal Sovereign Marketplace Master) in the "${theme.name}" palette with its complete brand identity & motion system!\nView Brand Book: ${siteConfig.url}/brand/80`
  )}`;

  const innerContent = (
    <div
      className="min-h-dvh bg-[#090B0A] text-[#F5F7F6] overflow-x-clip"
      style={{ paddingBottom: "max(72px, env(safe-area-inset-bottom))" }}
    >
      <Logo80MotionStyles />

      {/* Sticky Brand Book Navigation Bar (Mobile-First 2-Row Compact + Swipeable Theme Rail) */}
      <header
        className="sticky top-0 z-40 bg-[#0A0E0C]/95 backdrop-blur-xl border-b border-white/10"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-[1380px] mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          <div className="flex items-center justify-between gap-2.5 min-w-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              {onClose ? (
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-[40px] px-3.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white cursor-pointer shrink-0 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden xs:inline sm:inline">All 80</span>
                  <span className="hidden md:inline">Logos</span>
                </button>
              ) : (
                <Link
                  href="/brand"
                  className="inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-[40px] px-3.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white shrink-0 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  <span>All 80</span>
                </Link>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-widest truncate"
                    style={{ color: theme.accentGlow }}
                  >
                    Selected · Logo #80
                  </span>
                </div>
                <h1
                  className="text-sm sm:text-base font-extrabold text-white truncate"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  Complete Brand Identity &amp; Motion Lab
                </h1>
              </div>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close brand identity manual"
                className="lg:hidden w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Live Brand Theme Switcher (Horizontal Swipe Rail on Mobile) */}
          <div
            className="flex items-center gap-1.5 flex-nowrap overflow-x-auto no-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0 sm:flex-wrap"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {BRAND_80_THEMES.map((t) => {
              const active = t.id === theme.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setThemeId(t.id);
                    setHeroReplay((k) => k + 1);
                  }}
                  className={`inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-[38px] px-3 rounded-full text-xs font-semibold border transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                    active
                      ? "bg-white/15 border-white text-white"
                      : "bg-white/[0.04] border-white/15 text-neutral-300 hover:border-white/35"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: t.primary }}
                  />
                  <span>{t.name.split(" &")[0]}</span>
                  {t.recommended && (
                    <span className="text-[10px] text-[#E5C469]">★</span>
                  )}
                </button>
              );
            })}

            {onClose && (
              <>
                <Link
                  href="/brand/80"
                  className="hidden lg:inline-flex items-center gap-1 min-h-[38px] px-3 rounded-full bg-white/[0.06] hover:bg-white/15 border border-white/15 text-xs font-semibold text-neutral-200 shrink-0"
                  title="Open standalone direct URL"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>/brand/80</span>
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close brand identity manual"
                  className="hidden lg:flex w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center text-white cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1380px] mx-auto px-3.5 sm:px-6 pt-5 sm:pt-6 space-y-8 sm:space-y-10">
        {/* ===================================================================
            SECTION 1: CINEMATIC HERO BRAND SIGNATURE
        =================================================================== */}
        <section
          aria-label="Hero Brand Signature"
          className="rounded-3xl overflow-hidden border border-white/12 shadow-2xl"
        >
          <div
            className="relative px-4 sm:px-12 py-7 sm:py-16 flex flex-col items-center text-center transition-colors duration-300"
            style={{ backgroundColor: stageBg(heroSurface) }}
          >
            {/* Surface Switcher & Replay Controls */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-6 sm:mb-8">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10.5px] sm:text-[11px] font-semibold"
                style={{
                  backgroundColor:
                    heroSurface === "light" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.1)",
                  color: heroSurface === "light" ? theme.inkLight : "#FFFFFF",
                }}
              >
                <Sparkles className="w-3 h-3" />
                <span>#80 · {theme.name}</span>
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                {(["dark", "light", "brand"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={heroSurface === s}
                    onClick={() => {
                      setHeroSurface(s);
                      setHeroReplay((k) => k + 1);
                    }}
                    className={`min-h-[40px] sm:min-h-[36px] px-3 rounded-full text-xs font-bold capitalize border cursor-pointer transition-colors ${
                      heroSurface === s
                        ? heroSurface === "light"
                          ? "bg-[#0C1412] text-white border-[#0C1412]"
                          : "bg-white text-[#0A0A0B] border-white"
                        : heroSurface === "light"
                          ? "bg-black/5 text-neutral-700 border-black/15"
                          : "bg-white/10 text-neutral-200 border-white/20"
                    }`}
                  >
                    {s}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setHeroReplay((k) => k + 1)}
                  className="inline-flex items-center gap-1.5 min-h-[40px] sm:min-h-[36px] px-3.5 rounded-full text-xs font-bold cursor-pointer"
                  style={{
                    backgroundColor: theme.accent,
                    color: "#09110E",
                  }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay</span>
                </button>
              </div>
            </div>

            {/* Live Choreographed Splash Reveal (Stacks cleanly on compact mobile) */}
            <div className="py-3 sm:py-4 w-full flex justify-center">
              <Logo80AnimatedMark
                theme={theme}
                surface={heroSurface}
                mode="splash"
                size={92}
                speed={speed}
                reducedMotion={reducedMotion}
                replayKey={heroReplay}
                withWordmark
                stackedOnMobile
              />
            </div>

            <p
              className="max-w-2xl text-xs sm:text-base mt-5 sm:mt-6 leading-relaxed"
              style={{
                color:
                  heroSurface === "light"
                    ? "rgba(12, 20, 18, 0.78)"
                    : "rgba(255, 255, 255, 0.78)",
              }}
            >
              A unified authentic marketplace symbol fusing a{" "}
              <strong>luxury shopping carry bag</strong>, a{" "}
              <strong>verified V-checkmark guarantee</strong>, and an{" "}
              <strong>authenticity radiance spark</strong> — engineered to host
              500+ original global brands from Nike and Optimum Nutrition to
              luxury beauty, fragrances, and royal gifting.
            </p>

            {/* Primary Actions (Full-width thumb CTAs on mobile) */}
            <div className="mt-6 sm:mt-7 w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3">
              {onApproveSelect80 ? (
                <button
                  type="button"
                  onClick={onApproveSelect80}
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-2xl sm:rounded-full font-extrabold text-sm cursor-pointer shadow-lg transition-transform active:scale-95"
                  style={{
                    backgroundColor:
                      heroSurface === "brand" ? "#FFFFFF" : theme.accent,
                    color: "#09110E",
                  }}
                >
                  <Check className="w-4 h-4 stroke-[2.8]" />
                  <span>Approve &amp; Lock Logo #80</span>
                </button>
              ) : (
                <a
                  href={whatsAppApproveHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-2xl sm:rounded-full font-extrabold text-sm shadow-lg"
                  style={{
                    backgroundColor:
                      heroSurface === "brand" ? "#FFFFFF" : theme.accent,
                    color: "#09110E",
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Approve #80 on WhatsApp</span>
                </a>
              )}
              <button
                type="button"
                onClick={() =>
                  downloadSvgFile(
                    `vittal-lifestyle-80-horizontal-${theme.id}.svg`,
                    buildLogo80SvgString(theme, "horizontal-light")
                  )
                }
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-2xl sm:rounded-full font-bold text-sm border cursor-pointer"
                style={{
                  backgroundColor:
                    heroSurface === "light" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.1)",
                  borderColor:
                    heroSurface === "light" ? "rgba(0,0,0,0.16)" : "rgba(255,255,255,0.22)",
                  color: heroSurface === "light" ? theme.inkLight : "#FFFFFF",
                }}
              >
                <Download className="w-4 h-4" />
                <span>Download Master SVG</span>
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 2: COMPLETE 10-ANIMATION MARKETPLACE MOTION LAB
        =================================================================== */}
        <section aria-label="Complete 10-Animation Marketplace Motion System" className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p
                className="font-mono text-xs font-bold uppercase tracking-widest"
                style={{ color: theme.accentGlow }}
              >
                01 · Complete Motion System
              </p>
              <h2
                className="text-2xl sm:text-3xl font-extrabold text-white mt-1"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                All 10 Marketplace Animations for Logo #80
              </h2>
              <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
                Every motion uses strictly GPU-composited properties (
                <code className="text-neutral-200">transform</code>,{" "}
                <code className="text-neutral-200">opacity</code>,{" "}
                <code className="text-neutral-200">stroke-dashoffset</code>), named
                cubic-bezier curves, and full{" "}
                <code className="text-neutral-200">prefers-reduced-motion</code>{" "}
                support.
              </p>
            </div>

            {/* Global Motion Lab Controls (Horizontal Swipe Rail on Mobile) */}
            <div
              className="w-full lg:w-auto flex flex-nowrap overflow-x-auto no-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0 sm:flex-wrap items-center gap-2"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <button
                type="button"
                onClick={replayAllAnimations}
                className="inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-[40px] px-4 rounded-full font-bold text-xs cursor-pointer shrink-0 whitespace-nowrap"
                style={{ backgroundColor: theme.primary, color: "#FFFFFF" }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay All</span>
              </button>

              {/* Speed Scrub (1x / 0.5x / 0.25x) */}
              <div
                className="inline-flex rounded-full bg-white/[0.06] border border-white/12 p-0.5 shrink-0"
                role="group"
                aria-label="Animation playback speed"
              >
                {[
                  { label: "1x", value: 1 },
                  { label: "0.5x", value: 0.5 },
                  { label: "0.25x Slow", value: 0.25 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    aria-pressed={speed === opt.value}
                    onClick={() => {
                      setSpeed(opt.value);
                      replayAllAnimations();
                    }}
                    className={`min-h-[38px] sm:min-h-[34px] px-3 rounded-full text-xs font-mono font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                      speed === opt.value
                        ? "bg-white text-[#0A0A0B]"
                        : "text-neutral-300 hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Lab Surface Toggle */}
              <div className="inline-flex rounded-full bg-white/[0.06] border border-white/12 p-0.5 shrink-0">
                {(["dark", "light", "brand"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={labSurface === s}
                    onClick={() => setLabSurface(s)}
                    className={`min-h-[38px] sm:min-h-[34px] px-2.5 rounded-full text-xs font-semibold capitalize cursor-pointer ${
                      labSurface === s
                        ? "bg-white text-[#0A0A0B]"
                        : "text-neutral-300 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Reduced Motion Simulator */}
              <button
                type="button"
                aria-pressed={reducedMotion}
                onClick={() => setReducedMotion((r) => !r)}
                className={`min-h-[44px] sm:min-h-[40px] px-3.5 rounded-full text-xs font-semibold border cursor-pointer transition-colors shrink-0 whitespace-nowrap ${
                  reducedMotion
                    ? "bg-amber-400/20 border-amber-400 text-amber-200"
                    : "bg-white/[0.05] border-white/15 text-neutral-300 hover:text-white"
                }`}
              >
                {reducedMotion ? "Reduced Motion: ON" : "Test Reduced Motion"}
              </button>
            </div>
          </div>

          {/* 10 Interactive Animation Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* 01. Cinematic Splash Reveal */}
            <article className="rounded-2xl bg-[#111513] border border-white/10 overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                    01 · App Launch &amp; Film Intro
                  </span>
                  <h3 className="text-sm font-bold text-white">Cinematic Splash Storyboard</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSplashKey((k) => k + 1)}
                  className="inline-flex items-center gap-1 min-h-[34px] px-3 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white cursor-pointer"
                >
                  <Play className="w-3 h-3" />
                  <span>Play</span>
                </button>
              </div>
              <div
                className="h-[172px] flex items-center justify-center p-4"
                style={{ backgroundColor: stageBg(labSurface) }}
              >
                <Logo80AnimatedMark
                  theme={theme}
                  surface={labSurface}
                  mode="splash"
                  size={66}
                  speed={speed}
                  reducedMotion={reducedMotion}
                  replayKey={splashKey}
                  withWordmark
                />
              </div>
              <div className="px-4 py-3 text-xs text-neutral-400 flex items-center justify-between gap-2 border-t border-white/[0.06]">
                <span>Handle → Bag → V → Verified → Sparkle</span>
                <span className="font-mono text-[10.5px] text-neutral-300 tabular-nums">1.45s</span>
              </div>
            </article>

            {/* 02. Verified Orbital Page Loader */}
            <article className="rounded-2xl bg-[#111513] border border-white/10 overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                    02 · Async &gt; 300ms Wait State
                  </span>
                  <h3 className="text-sm font-bold text-white">Verified Orbital Loader</h3>
                </div>
                <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Live Loop
                </span>
              </div>
              <div
                className="h-[172px] flex flex-col items-center justify-center gap-3 p-4"
                style={{ backgroundColor: stageBg(labSurface) }}
              >
                <Logo80AnimatedMark
                  theme={theme}
                  surface={labSurface}
                  mode="loader"
                  size={74}
                  speed={speed}
                  reducedMotion={reducedMotion}
                />
                <span
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: labSurface === "light" ? "#475569" : "#94A3B8" }}
                >
                  Verifying Genuine Inventory…
                </span>
              </div>
              <div className="px-4 py-3 text-xs text-neutral-400 flex items-center justify-between gap-2 border-t border-white/[0.06]">
                <span>Stays active under Reduced Motion</span>
                <span className="font-mono text-[10.5px] text-neutral-300 tabular-nums">linear 1.4s</span>
              </div>
            </article>

            {/* 03. Add-to-Bag Physical Bounce */}
            <article className="rounded-2xl bg-[#111513] border border-white/10 overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                    03 · Shopping Cart Feedback
                  </span>
                  <h3 className="text-sm font-bold text-white">Add-to-Bag Squash &amp; Bounce</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCartKey((k) => k + 1);
                    setCartCount((c) => (c >= 9 ? 1 : c + 1));
                  }}
                  className="inline-flex items-center gap-1 min-h-[34px] px-3 rounded-full text-xs font-bold cursor-pointer"
                  style={{ backgroundColor: theme.primary, color: "#FFFFFF" }}
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>+ Add Item</span>
                </button>
              </div>
              <div
                className="h-[172px] flex items-center justify-center p-4"
                style={{ backgroundColor: stageBg(labSurface) }}
              >
                <div className="relative">
                  <Logo80AnimatedMark
                    theme={theme}
                    surface={labSurface}
                    mode="add-to-bag"
                    size={84}
                    speed={speed}
                    reducedMotion={reducedMotion}
                    replayKey={cartKey}
                  />
                  <span
                    className="absolute -top-1 -right-2 min-w-[24px] h-6 px-1.5 rounded-full font-mono text-xs font-extrabold tabular-nums flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: theme.accent, color: "#09110E" }}
                  >
                    {cartCount}
                  </span>
                </div>
              </div>
              <div className="px-4 py-3 text-xs text-neutral-400 flex items-center justify-between gap-2 border-t border-white/[0.06]">
                <span>Volume-preserving squash + handle hop</span>
                <span className="font-mono text-[10.5px] text-neutral-300 tabular-nums">540ms</span>
              </div>
            </article>

            {/* 04. 100% Original Authenticity Verified Stamp */}
            <article className="rounded-2xl bg-[#111513] border border-white/10 overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                    04 · Zero-Counterfeit Proof
                  </span>
                  <h3 className="text-sm font-bold text-white">100% Original Verified Stamp</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setVerifyKey((k) => k + 1)}
                  className="inline-flex items-center gap-1 min-h-[34px] px-3 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify</span>
                </button>
              </div>
              <div
                className="h-[172px] flex flex-col items-center justify-center gap-2 p-4"
                style={{ backgroundColor: stageBg(labSurface) }}
              >
                <Logo80AnimatedMark
                  theme={theme}
                  surface={labSurface}
                  mode="verified"
                  size={78}
                  speed={speed}
                  reducedMotion={reducedMotion}
                  replayKey={verifyKey}
                />
                <span
                  className="px-3 py-1 rounded-full font-mono text-[10px] font-bold tracking-wider uppercase"
                  style={{
                    backgroundColor: `${theme.vivid}22`,
                    color: labSurface === "light" ? theme.primary : theme.vivid,
                  }}
                >
                  ✓ Authentic Partner Sealed
                </span>
              </div>
              <div className="px-4 py-3 text-xs text-neutral-400 flex items-center justify-between gap-2 border-t border-white/[0.06]">
                <span>Check lock + concentric sonar ring</span>
                <span className="font-mono text-[10.5px] text-neutral-300 tabular-nums">720ms</span>
              </div>
            </article>

            {/* 05. Checkout Order Placed Celebration */}
            <article className="rounded-2xl bg-[#111513] border border-white/10 overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                    05 · Peak-End Milestone
                  </span>
                  <h3 className="text-sm font-bold text-white">Order Placed Celebration</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOrderKey((k) => k + 1)}
                  className="inline-flex items-center gap-1 min-h-[34px] px-3 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white cursor-pointer"
                >
                  <Play className="w-3 h-3" />
                  <span>Trigger</span>
                </button>
              </div>
              <div
                className="h-[172px] flex flex-col items-center justify-center gap-1.5 p-4"
                style={{ backgroundColor: stageBg(labSurface) }}
              >
                <Logo80AnimatedMark
                  theme={theme}
                  surface={labSurface}
                  mode="order-success"
                  size={84}
                  speed={speed}
                  reducedMotion={reducedMotion}
                  replayKey={orderKey}
                />
                <span
                  className="text-xs font-extrabold"
                  style={{ color: labSurface === "light" ? theme.inkLight : "#FFFFFF" }}
                >
                  Order #VL-8042 Confirmed
                </span>
              </div>
              <div className="px-4 py-3 text-xs text-neutral-400 flex items-center justify-between gap-2 border-t border-white/[0.06]">
                <span>8-particle restrained brand burst</span>
                <span className="font-mono text-[10.5px] text-neutral-300 tabular-nums">1.15s</span>
              </div>
            </article>

            {/* 06. Interactive Navbar Hover & Tactile Press */}
            <article className="rounded-2xl bg-[#111513] border border-white/10 overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                    06 · Interactive Micro-Motion
                  </span>
                  <h3 className="text-sm font-bold text-white">Navbar Hover &amp; Tactile Press</h3>
                </div>
                <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-white/10 text-neutral-200">
                  Hover / Tap
                </span>
              </div>
              <div
                className="h-[172px] flex flex-col items-center justify-center gap-3 p-4"
                style={{ backgroundColor: stageBg(labSurface) }}
              >
                <button
                  type="button"
                  onClick={triggerHoverTap}
                  className="px-5 py-3 min-h-[56px] rounded-2xl border cursor-pointer transition-colors"
                  style={{
                    backgroundColor:
                      labSurface === "light" ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.06)",
                    borderColor:
                      labSurface === "light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.14)",
                  }}
                >
                  <Logo80AnimatedMark
                    theme={theme}
                    surface={labSurface}
                    mode="hover-press"
                    size={50}
                    speed={speed}
                    reducedMotion={reducedMotion}
                    tapActive={hoverTapActive}
                    withWordmark
                  />
                </button>
                <span
                  className="text-[11px] text-center"
                  style={{ color: labSurface === "light" ? "#64748B" : "#94A3B8" }}
                >
                  Tap or Hover for handle lift + 45° sparkle glint
                </span>
              </div>
              <div className="px-4 py-3 text-xs text-neutral-400 flex items-center justify-between gap-2 border-t border-white/[0.06]">
                <span>Touch-safe @media (hover: hover)</span>
                <span className="font-mono text-[10.5px] text-neutral-300 tabular-nums">140ms</span>
              </div>
            </article>

            {/* 07. Mobile App Icon Push Notification Wiggle */}
            <article className="rounded-2xl bg-[#111513] border border-white/10 overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                    07 · iOS / Android Retention
                  </span>
                  <h3 className="text-sm font-bold text-white">App Icon Push Alert</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNotifKey((k) => k + 1);
                    setNotifCount((n) => (n >= 5 ? 1 : n + 1));
                  }}
                  className="inline-flex items-center gap-1 min-h-[34px] px-3 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white cursor-pointer"
                >
                  <Play className="w-3 h-3" />
                  <span>Ping</span>
                </button>
              </div>
              <div
                className="h-[172px] flex flex-col items-center justify-center gap-2 p-4"
                style={{ backgroundColor: stageBg(labSurface) }}
              >
                <div className="relative">
                  <div
                    className="w-[74px] h-[74px] rounded-[20px] flex items-center justify-center shadow-xl border border-white/20"
                    style={{ backgroundColor: theme.markBrand.bg }}
                  >
                    <Logo80AnimatedMark
                      theme={theme}
                      surface="brand"
                      mode="notification"
                      size={52}
                      speed={speed}
                      reducedMotion={reducedMotion}
                      replayKey={notifKey}
                    />
                  </div>
                  <span
                    className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full bg-[#E11D48] text-white font-mono text-[11px] font-bold tabular-nums flex items-center justify-center shadow"
                  >
                    {notifCount}
                  </span>
                </div>
                <span
                  className="text-xs font-bold"
                  style={{ color: labSurface === "light" ? theme.inkLight : "#FFFFFF" }}
                >
                  Vittal
                </span>
              </div>
              <div className="px-4 py-3 text-xs text-neutral-400 flex items-center justify-between gap-2 border-t border-white/[0.06]">
                <span>Damped rotational tilt + badge pop</span>
                <span className="font-mono text-[10.5px] text-neutral-300 tabular-nums">560ms</span>
              </div>
            </article>

            {/* 08. Brand Shimmer Skeleton Card */}
            <article className="rounded-2xl bg-[#111513] border border-white/10 overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                    08 · Slow-3G Catalog Loading
                  </span>
                  <h3 className="text-sm font-bold text-white">Branded Shimmer Skeleton</h3>
                </div>
                <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-white/10 text-neutral-200">
                  GPU Sweep
                </span>
              </div>
              <div
                className="h-[172px] flex items-center justify-center p-4"
                style={{
                  backgroundColor: stageBg(labSurface),
                  "--vl-speed": String(speed),
                } as React.CSSProperties}
              >
                <div
                  className="w-[196px] rounded-xl p-3 border space-y-2.5 overflow-hidden relative"
                  style={{
                    backgroundColor:
                      labSurface === "light" ? "#FFFFFF" : "rgba(255,255,255,0.05)",
                    borderColor:
                      labSurface === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)",
                  }}
                >
                  <div
                    className="h-[74px] rounded-lg relative overflow-hidden flex items-center justify-center"
                    style={{
                      backgroundColor:
                        labSurface === "light" ? "#EEF2F0" : "rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="opacity-25">
                      <Logo80AnimatedMark theme={theme} surface={labSurface} size={34} />
                    </div>
                    {!reducedMotion && (
                      <div
                        className="vl80-shimmer-bar absolute inset-y-0 w-1/2 pointer-events-none"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${theme.vivid}33, transparent)`,
                        }}
                      />
                    )}
                  </div>
                  <div
                    className="h-2.5 w-3/4 rounded-full"
                    style={{
                      backgroundColor:
                        labSurface === "light" ? "#E2E8F0" : "rgba(255,255,255,0.12)",
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <div
                      className="h-2.5 w-1/3 rounded-full"
                      style={{
                        backgroundColor:
                          labSurface === "light" ? "#CBD5E1" : "rgba(255,255,255,0.09)",
                      }}
                    />
                    <div
                      className="h-5 w-14 rounded-md"
                      style={{ backgroundColor: `${theme.primary}55` }}
                    />
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 text-xs text-neutral-400 flex items-center justify-between gap-2 border-t border-white/[0.06]">
                <span>Zero-CLS product card placeholder</span>
                <span className="font-mono text-[10.5px] text-neutral-300 tabular-nums">1.6s linear</span>
              </div>
            </article>

            {/* 09. 3D Doorstep Unboxing & Seal */}
            <article className="rounded-2xl bg-[#111513] border border-white/10 overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                    09 · Solid 3D Depth (800px)
                  </span>
                  <h3 className="text-sm font-bold text-white">3D Doorstep Parcel Unbox</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setUnboxKey((k) => k + 1)}
                  className="inline-flex items-center gap-1 min-h-[34px] px-3 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white cursor-pointer"
                >
                  <Play className="w-3 h-3" />
                  <span>Unbox</span>
                </button>
              </div>
              <div
                className="h-[172px] flex items-center justify-center p-4"
                style={{
                  backgroundColor: stageBg(labSurface),
                  "--vl-speed": String(speed),
                } as React.CSSProperties}
              >
                <div
                  key={unboxKey}
                  className="relative w-32 h-24 flex items-end justify-center"
                  style={{ perspective: "800px" }}
                >
                  {/* Rising Logo Mark */}
                  <div className={reducedMotion ? "-translate-y-2" : "vl80-unbox-mark absolute bottom-8 z-10"}>
                    <Logo80AnimatedMark theme={theme} surface={labSurface} size={46} />
                  </div>
                  {/* Parcel Box Base */}
                  <div
                    className="relative w-28 h-16 rounded-b-xl border border-black/15 flex items-center justify-center shadow-lg z-20"
                    style={{ backgroundColor: "#C9A87C" }}
                  >
                    <div
                      className="px-2 py-0.5 rounded font-mono text-[8px] font-bold tracking-wider text-white"
                      style={{ backgroundColor: theme.primary }}
                    >
                      100% ORIGINAL
                    </div>
                    {/* Real 3D Perspective Lid */}
                    <div
                      className={
                        reducedMotion
                          ? "hidden"
                          : "vl80-unbox-lid absolute -top-2 inset-x-0 h-5 rounded-t-lg border border-black/15"
                      }
                      style={{
                        backgroundColor: "#DFC39D",
                        transformStyle: "preserve-3d",
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 text-xs text-neutral-400 flex items-center justify-between gap-2 border-t border-white/[0.06]">
                <span>Order delivered tracking celebration</span>
                <span className="font-mono text-[10.5px] text-neutral-300 tabular-nums">950ms</span>
              </div>
            </article>

            {/* 10. Ambient Hero Watermark Float (Spans full row on md/xl? Keep tidy 3-col + Token Spec beside!) */}
            <article className="rounded-2xl bg-[#111513] border border-white/10 overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                    10 · VIP Hero &amp; Idle State
                  </span>
                  <h3 className="text-sm font-bold text-white">Ambient Out-of-Phase Float</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAmbientPaused((p) => !p)}
                  className="inline-flex items-center gap-1 min-h-[34px] px-3 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white cursor-pointer"
                >
                  {ambientPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                  <span>{ambientPaused ? "Resume" : "Pause"}</span>
                </button>
              </div>
              <div
                className="h-[172px] flex items-center justify-center p-4"
                style={{ backgroundColor: stageBg(labSurface) }}
              >
                <Logo80AnimatedMark
                  theme={theme}
                  surface={labSurface}
                  mode={ambientPaused ? "idle" : "ambient"}
                  size={84}
                  speed={speed}
                  reducedMotion={reducedMotion}
                />
              </div>
              <div className="px-4 py-3 text-xs text-neutral-400 flex items-center justify-between gap-2 border-t border-white/[0.06]">
                <span>Auto-pauses off-screen via IntersectionObserver</span>
                <span className="font-mono text-[10.5px] text-neutral-300 tabular-nums">4.2s loop</span>
              </div>
            </article>

            {/* Motion Token Spec Card (spans 2 cols on xl so grid ends flush!) */}
            <article className="xl:col-span-2 rounded-2xl bg-[#111513] border border-white/10 p-5 flex flex-col justify-between gap-4">
              <div>
                <span
                  className="font-mono text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: theme.accentGlow }}
                >
                  Motion Engineering Specification
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Named Easing Curves &amp; Hardware Rules
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  All Vittal Lifestyle web, iOS, and Android motion shares one named timing vocabulary so micro-interactions never drift apart.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-3">
                  <div className="font-mono text-[11px] font-bold text-white">--vl-ease-out</div>
                  <div className="font-mono text-[10.5px] text-neutral-400 mt-0.5">{MOTION_SPEC.curves.easeOut}</div>
                  <div className="text-[11px] text-neutral-400 mt-1">Entrances, drawers, splash reveal, press recovery</div>
                </div>
                <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-3">
                  <div className="font-mono text-[11px] font-bold text-white">--vl-spring-pop</div>
                  <div className="font-mono text-[10.5px] text-neutral-400 mt-0.5">{MOTION_SPEC.curves.springPop}</div>
                  <div className="text-[11px] text-neutral-400 mt-1">Verified wing check, sparkle pop, cart handle hop</div>
                </div>
                <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-3">
                  <div className="font-mono text-[11px] font-bold text-white">--vl-ease-in (20–30% shorter)</div>
                  <div className="font-mono text-[10.5px] text-neutral-400 mt-0.5">{MOTION_SPEC.curves.easeIn}</div>
                  <div className="text-[11px] text-neutral-400 mt-1">Quiet exits, closing modals, fading notifications</div>
                </div>
                <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-3">
                  <div className="font-mono text-[11px] font-bold text-white">Reduced Motion Policy</div>
                  <div className="font-mono text-[10.5px] text-emerald-300 mt-0.5">prefers-reduced-motion: reduce</div>
                  <div className="text-[11px] text-neutral-400 mt-1">Disables decorative &amp; bounce moves; keeps Orbital Loader active</div>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* ===================================================================
            SECTION 3: LOGO ANATOMY, CONSTRUCTION GRID & CLEARSPACE
        =================================================================== */}
        <section aria-label="Logo Anatomy and Clearspace Rules" className="space-y-5">
          <div className="border-b border-white/10 pb-3">
            <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: theme.accentGlow }}>
              02 · Geometry &amp; Brand Rules
            </p>
            <h2 className="text-2xl font-extrabold text-white mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Anatomy, Construction Grid &amp; Clearspace
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Blueprint SVG Grid */}
            <div className="lg:col-span-5 rounded-2xl bg-[#111513] border border-white/10 p-5 flex flex-col items-center justify-center">
              <svg viewBox="0 0 240 210" className="w-full max-w-[320px] h-auto" role="img" aria-label="Logo #80 geometric construction grid and 1X clearspace diagram">
                {/* 8x8 Blueprint Grid */}
                {Array.from({ length: 13 }).map((_, i) => (
                  <g key={i}>
                    <line x1={24 + i * 16} y1="16" x2={24 + i * 16} y2="192" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                    {i <= 11 && (
                      <line x1="24" y1={16 + i * 16} x2="216" y2={16 + i * 16} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                    )}
                  </g>
                ))}
                {/* 1X Clearspace Bounding Box */}
                <rect x="44" y="28" width="152" height="152" rx="12" stroke={theme.accentGlow} strokeWidth="1.2" strokeDasharray="4 4" fill="none" />
                <text x="50" y="42" fontFamily="IBM Plex Mono, monospace" fontSize="8.5" fill={theme.accentGlow}>1X CLEARSPACE</text>

                {/* Scaled Exact #80 Mark centered */}
                <g transform="translate(64, 48) scale(1.75)">
                  <path d={LOGO80_PATHS.handle} stroke={theme.markDark.handle} strokeWidth="4.4" strokeLinecap="round" fill="none" />
                  <path d={LOGO80_PATHS.bag} fill={theme.markDark.bag} />
                  <path d={LOGO80_PATHS.checkLeft} fill={theme.markDark.checkLeft} />
                  <path d={LOGO80_PATHS.checkRight} fill={theme.markDark.checkRight} />
                  <path d={LOGO80_PATHS.sparkle} fill={theme.markDark.sparkle} />
                </g>

                {/* Anatomical Callouts */}
                <text x="120" y="198" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8.5" fill="#94A3B8">
                  64×64 MASTER VIEWBOX · 5 MODULAR VECTOR LAYERS
                </text>
              </svg>
            </div>

            {/* 5-Layer Meaning + Minimum Scale Proofs + Do's/Don'ts */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { n: "01", title: "Arched Carry Handle", desc: "Effortless shopping warmth & physical retail tote recognition." },
                  { n: "02", title: "Sculpted Luxury Tote", desc: "Rounded squircle trapezoid engineered for iOS/Android app icons." },
                  { n: "03", title: "Verified V-Checkmark", desc: "Variable-width Bezier V sweeping into a 100% Original check." },
                  { n: "04", title: "Authenticity 4-Point Spark", desc: "Curated multi-brand luxury glow across beauty, fashion & gifting." },
                ].map((item) => (
                  <div key={item.n} className="rounded-xl bg-[#111513] border border-white/10 p-3.5">
                    <span className="font-mono text-[10px] font-bold" style={{ color: theme.accentGlow }}>
                      LAYER {item.n}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{item.title}</h3>
                    <p className="text-xs text-neutral-400 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Minimum Scale Optical Legibility Proof */}
              <div className="rounded-2xl bg-[#111513] border border-white/10 p-4">
                <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 mb-3">
                  Optical Scale Stress Test (16px Favicon → 64px Hero)
                </div>
                <div className="flex flex-wrap items-end justify-around gap-4 py-2">
                  {[
                    { px: 16, label: "16px Tab" },
                    { px: 24, label: "24px Nav" },
                    { px: 40, label: "40px Mobile" },
                    { px: 64, label: "64px App Tile" },
                  ].map((s) => (
                    <div key={s.px} className="flex flex-col items-center gap-2">
                      <div
                        className="p-2 rounded-xl border border-white/10 flex items-center justify-center"
                        style={{ backgroundColor: theme.canvasDark }}
                      >
                        <Logo80AnimatedMark theme={theme} surface="dark" size={s.px} />
                      </div>
                      <span className="font-mono text-[10px] text-neutral-400">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Do's & Don'ts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-3.5 space-y-1">
                  <div className="font-bold text-emerald-300">✓ Always Do</div>
                  <p className="text-neutral-300">Keep 1X clearspace, use Pure White or Obsidian canvases, and preserve exact proportions.</p>
                </div>
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 p-3.5 space-y-1">
                  <div className="font-bold text-rose-300">✕ Never Do</div>
                  <p className="text-neutral-300">Never stretch, apply heavy drop shadows, rotate the mark, or place on clashing neon backgrounds.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 4: LOCKUP MATRIX & 1-CLICK SVG DOWNLOADS
        =================================================================== */}
        <section aria-label="Official Lockups and Vector Downloads" className="space-y-5">
          <div className="border-b border-white/10 pb-3">
            <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: theme.accentGlow }}>
              03 · Production Lockups
            </p>
            <h2 className="text-2xl font-extrabold text-white mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Official Logo Lockups &amp; Instant SVG Downloads
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {lockupDownloads.map((item) => {
              const svgMarkup = buildLogo80SvgString(theme, item.variant);
              return (
                <div
                  key={item.variant}
                  className="rounded-2xl bg-[#111513] border border-white/10 overflow-hidden flex flex-col"
                >
                  <div
                    className="h-[154px] flex items-center justify-center p-5"
                    style={{ backgroundColor: item.bg }}
                  >
                    <div
                      className="max-w-full max-h-[108px] flex items-center justify-center [&>svg]:max-h-[100px] [&>svg]:w-auto"
                      dangerouslySetInnerHTML={{ __html: svgMarkup }}
                    />
                  </div>
                  <div className="p-4 flex items-center justify-between gap-3 border-t border-white/[0.08]">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
                      <p className="text-[11px] text-neutral-400 truncate">{item.usage}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        downloadSvgFile(
                          `vittal-lifestyle-80-${item.variant}-${theme.id}.svg`,
                          svgMarkup
                        )
                      }
                      className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white shrink-0 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>SVG</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===================================================================
            SECTION 5: 60-30-10 COLOR THEORY SYSTEM & COPYABLE CSS TOKENS
        =================================================================== */}
        <section aria-label="60-30-10 Color System" className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: theme.accentGlow }}>
                04 · Color Science ({theme.harmony})
              </p>
              <h2 className="text-2xl font-extrabold text-white mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
                60–30–10 Marketplace Color Architecture
              </h2>
              <p className="text-xs text-neutral-400 mt-1">{theme.hueNote}</p>
            </div>
            <button
              type="button"
              onClick={() => copyText("tokens.css", cssTokensSnippet)}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedToken === "tokens.css" ? "Copied tokens.css!" : "Copy tokens.css"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {[
              { role: "60% Gallery Canvas", name: "Pure Canvas", hex: theme.canvasLight, wcag: "Neutral Stage", dark: false },
              { role: "30% Structural Ink", name: "Obsidian Ink", hex: theme.inkLight, wcag: theme.wcag.inkOnWhite, dark: true },
              { role: "8% Signature Primary", name: theme.name.split(" &")[0], hex: theme.primary, wcag: theme.wcag.primaryOnWhite, dark: true },
              { role: "2% Prestige Accent", name: "Gold / Foil Accent", hex: theme.accent, wcag: theme.wcag.accentOnDark, dark: true },
              { role: "Trust Signal", name: "Verified Glow", hex: theme.vivid, wcag: theme.wcag.vividOnDark, dark: true },
            ].map((swatch) => (
              <button
                key={swatch.role}
                type="button"
                onClick={() => copyText(swatch.hex, swatch.hex)}
                className="text-left rounded-2xl bg-[#111513] border border-white/10 hover:border-white/30 overflow-hidden transition-colors cursor-pointer"
              >
                <div
                  className="h-24 p-3 flex items-end justify-between"
                  style={{ backgroundColor: swatch.hex }}
                >
                  <span
                    className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: swatch.dark ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.08)",
                      color: swatch.dark ? "#FFFFFF" : "#111111",
                    }}
                  >
                    {copiedToken === swatch.hex ? "Copied!" : swatch.wcag}
                  </span>
                </div>
                <div className="p-3.5">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                    {swatch.role}
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">{swatch.name}</div>
                  <div className="font-mono text-xs text-neutral-300 mt-1">{swatch.hex}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ===================================================================
            SECTION 6: TYPOGRAPHY HIERARCHY & EDITORIAL SYSTEM
        =================================================================== */}
        <section aria-label="Typography Hierarchy" className="space-y-5">
          <div className="border-b border-white/10 pb-3">
            <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: theme.accentGlow }}>
              05 · Typography System
            </p>
            <h2 className="text-2xl font-extrabold text-white mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Typefaces &amp; Hierarchy
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-[#111513] border border-white/10 p-5 space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: theme.accentGlow }}>
                Display &amp; Wordmark
              </span>
              <div className="text-3xl font-extrabold tracking-tight text-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
                Manrope
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Geometric precision with warm humanist legibility. Used for the{" "}
                <strong className="text-white">vittal lifestyle</strong> wordmark, category headers, and hero banners.
              </p>
            </div>
            <div className="rounded-2xl bg-[#111513] border border-white/10 p-5 space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: theme.accentGlow }}>
                Luxury Editorial Accent
              </span>
              <div className="text-3xl font-semibold tracking-wide text-white" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                Cormorant
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                High-fashion serif reserved exclusively for royal gifting boxes, beauty lookbooks, and limited-edition campaigns.
              </p>
            </div>
            <div className="rounded-2xl bg-[#111513] border border-white/10 p-5 space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: theme.accentGlow }}>
                Prices, SKUs &amp; Trust Codes
              </span>
              <div className="text-2xl font-bold text-white font-mono tabular-nums">
                ₹4,299 · #VL-80
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                <strong className="text-white">IBM Plex Mono</strong> with{" "}
                <code>tabular-nums</code> ensures prices, order IDs, and authenticity batch numbers never jitter horizontally.
              </p>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 7: REAL-WORLD MARKETPLACE APPLICATIONS GALLERY
        =================================================================== */}
        <section aria-label="Real-World Brand Applications" className="space-y-5">
          <div className="border-b border-white/10 pb-3">
            <p className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: theme.accentGlow }}>
              06 · Real-World Applications
            </p>
            <h2 className="text-2xl font-extrabold text-white mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Marketplace Storefront, Packaging, Stationery &amp; Social Kit
            </h2>
          </div>

          {/* Live Marketplace Search Navbar */}
          <div
            className="rounded-2xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 border border-black/10 shadow-md"
            style={{ backgroundColor: theme.canvasLight }}
          >
            <Logo80AnimatedMark theme={theme} surface="light" mode="hover-press" size={38} withWordmark />
            <div className="hidden md:flex items-center gap-2 flex-1 max-w-md h-10 px-4 rounded-full bg-black/[0.05] text-xs text-neutral-500">
              <Search className="w-3.5 h-3.5" />
              <span>Search Nike, Optimum Nutrition, Dior, Medjool Dates...</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-[11px] font-bold"
                style={{ backgroundColor: `${theme.vivid}1E`, color: theme.primary }}
              >
                ✓ 100% Original
              </span>
              <span
                className="px-3.5 py-2 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: theme.primary }}
              >
                Bag (3)
              </span>
            </div>
          </div>

          {/* 3-Column Brand Collateral Mockups */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Executive Business Card (Front & Back) */}
            <div className="rounded-2xl bg-[#111513] border border-white/10 p-5 space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                Founder Stationery &amp; Partner Card
              </span>
              <div className="space-y-2.5">
                <div
                  className="rounded-xl p-4 border border-white/15 flex items-center justify-between shadow-lg"
                  style={{ backgroundColor: theme.canvasDark }}
                >
                  <Logo80AnimatedMark theme={theme} surface="dark" size={38} withWordmark />
                </div>
                <div
                  className="rounded-xl p-4 border border-black/10 flex items-center justify-between text-xs"
                  style={{ backgroundColor: theme.canvasLight, color: theme.inkLight }}
                >
                  <div>
                    <div className="font-extrabold">Vittal Lifestyle India</div>
                    <div className="text-[11px] opacity-70">Authentic Brand Partnerships</div>
                    <div className="font-mono text-[10px] mt-1.5" style={{ color: theme.primary }}>
                      vittallifestyle.com · +91 9747 19 5000
                    </div>
                  </div>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: theme.markBrand.bg }}
                  >
                    <Logo80AnimatedMark theme={theme} surface="brand" size={26} />
                  </div>
                </div>
              </div>
            </div>

            {/* Verified Original Product Card */}
            <div className="rounded-2xl bg-[#111513] border border-white/10 p-5 space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                Verified Original Product Card
              </span>
              <div
                className="rounded-xl p-4 border border-black/10 space-y-3"
                style={{ backgroundColor: theme.canvasLight, color: theme.inkLight }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: `${theme.vivid}20`, color: theme.primary }}
                  >
                    <Logo80AnimatedMark theme={theme} surface="light" size={14} />
                    <span>Vittal Verified Authentic</span>
                  </span>
                  <span className="font-mono text-[10px] text-neutral-500">BATCH #ON-26</span>
                </div>
                <div>
                  <div className="text-xs font-semibold opacity-60">Optimum Nutrition</div>
                  <div className="text-sm font-extrabold">Gold Standard 100% Whey · 2 KG</div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-base font-extrabold tabular-nums">₹6,899</span>
                  <span
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white"
                    style={{ backgroundColor: theme.primary }}
                  >
                    Add to Bag
                  </span>
                </div>
              </div>
            </div>

            {/* Social Media & Unboxing Kit */}
            <div className="rounded-2xl bg-[#111513] border border-white/10 p-5 space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                Instagram / App Store Banner
              </span>
              <div
                className="rounded-xl p-5 flex flex-col justify-between min-h-[156px] border border-white/15 relative overflow-hidden"
                style={{ backgroundColor: theme.markBrand.bg }}
              >
                <div className="flex items-center justify-between">
                  <Logo80AnimatedMark theme={theme} surface="brand" size={36} />
                  <span
                    className="font-mono text-[9.5px] font-bold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: "rgba(255,255,255,0.16)", color: "#FFFFFF" }}
                  >
                    @vittallifestyle
                  </span>
                </div>
                <div className="mt-4">
                  <div
                    className="text-lg font-extrabold text-white leading-tight"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                  >
                    Real Original Brands.
                    <span className="block" style={{ color: theme.accentGlow }}>
                      Zero Compromises.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 8: FINAL BRAND APPROVAL BAR
        =================================================================== */}
        <section
          aria-label="Approve Logo #80 Brand Identity"
          className="rounded-3xl p-6 sm:p-8 border border-white/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
          style={{
            background: `linear-gradient(135deg, ${theme.canvasDark}, ${theme.primaryDark})`,
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center border border-white/20 shrink-0 shadow-lg"
              style={{ backgroundColor: theme.markBrand.bg }}
            >
              <Logo80AnimatedMark theme={theme} surface="brand" mode="ambient" size={46} />
            </div>
            <div>
              <span className="font-mono text-[11px] uppercase tracking-widest" style={{ color: theme.accentGlow }}>
                Ready for Production Rollout
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                Lock Logo #80 + {theme.name}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 mt-1">
                Confirm this brand identity to apply it across the live storefront, splash loader, checkout celebrations, and packaging.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onApproveSelect80 && (
              <button
                type="button"
                onClick={onApproveSelect80}
                className="inline-flex items-center gap-2 min-h-[46px] px-6 rounded-full font-extrabold text-sm cursor-pointer shadow-lg"
                style={{ backgroundColor: theme.accentGlow, color: "#09110E" }}
              >
                <Check className="w-4 h-4 stroke-[2.8]" />
                <span>Submit #80 Approval</span>
              </button>
            )}
            <a
              href={whatsAppApproveHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 min-h-[46px] px-5 rounded-full bg-[#25D366] hover:bg-[#22c55e] text-[#052e16] font-extrabold text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </a>
          </div>
        </section>
      </main>
    </div>
  );

  // Render as accessible full-screen dialog when triggered inside /brand
  if (onClose) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Logo #80 Complete Brand Identity and Motion System"
        className="fixed inset-0 z-[110] bg-[#090B0A] overflow-y-auto overscroll-contain"
      >
        {innerContent}
      </div>
    );
  }

  return innerContent;
}
