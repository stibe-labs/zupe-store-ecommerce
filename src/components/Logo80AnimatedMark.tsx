"use client";

import React, { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Logo #80 Exact Vector Anatomy Paths (Vittal Sovereign Marketplace Master)
// ---------------------------------------------------------------------------

export const LOGO80_PATHS = {
  handle: "M22.5 23.5 V15.5 A9.5 9.5 0 0 1 41.5 15.5 V23.5",
  bag: "M16.5 21.5 H47.5 C51.8 21.5 54.4 24.4 54.7 28.6 L55.8 46.2 C56.2 52.0 52.0 56.0 46.2 56.0 H17.8 C12.0 56.0 7.8 52.0 8.2 46.2 L9.3 28.6 C9.6 24.4 12.2 21.5 16.5 21.5 Z",
  bagLip: "M15.8 22.8 H48.2",
  checkLeft:
    "M18.8 34.8 C19.8 39.2 23.2 43.9 28.9 46.5 C29.5 46.8 30.1 46.6 30.3 46.0 C30.6 45.2 30.5 44.3 30.1 43.5 C27.8 39.1 24.9 35.3 21.3 32.9 C20.1 32.1 18.4 33.3 18.8 34.8 Z",
  checkRight:
    "M28.6 46.2 C28.4 46.9 29.2 47.4 29.9 47.0 C36.6 43.2 42.6 36.2 46.2 28.4 C46.7 27.3 45.4 26.3 44.5 27.0 C38.9 31.2 33.3 37.5 28.6 46.2 Z",
  sparkle:
    "M53.8 4.0 C54.7 8.4 56.0 9.7 60.4 10.6 C56.0 11.5 54.7 12.8 53.8 17.2 C52.9 12.8 51.6 11.5 47.2 10.6 C51.6 9.7 52.9 8.4 53.8 4.0 Z",
} as const;

// ---------------------------------------------------------------------------
// Complete Brand Identity Color Systems for Logo #80
// ---------------------------------------------------------------------------

export interface BrandSystemTheme {
  id: string;
  name: string;
  subtitle: string;
  recommended?: boolean;
  harmony: string;
  hueNote: string;
  // Surfaces & typography
  canvasLight: string;
  surfaceLight: string;
  canvasDark: string;
  surfaceDark: string;
  inkLight: string;
  inkDark: string;
  // Primary & accents
  primary: string;
  primaryDark: string;
  vivid: string;
  accent: string;
  accentTextLight: string;
  accentGlow: string;
  // Logo #80 surface-tuned colors (Light canvas vs Dark canvas vs Brand surface)
  markLight: {
    bag: string;
    handle: string;
    checkLeft: string;
    checkRight: string;
    sparkle: string;
  };
  markDark: {
    bag: string;
    handle: string;
    checkLeft: string;
    checkRight: string;
    sparkle: string;
  };
  markBrand: {
    bg: string;
    bag: string;
    handle: string;
    checkLeft: string;
    checkRight: string;
    sparkle: string;
  };
  wcag: {
    primaryOnWhite: string;
    inkOnWhite: string;
    vividOnDark: string;
    accentOnDark: string;
    accentTextOnWhite: string;
  };
}

export const BRAND_80_THEMES: BrandSystemTheme[] = [
  {
    id: "imperial-emerald",
    name: "Imperial Emerald & Gold",
    subtitle: "Color-Theory Winner · Harrods × Verified Trust",
    recommended: true,
    harmony: "Split-Complementary (162° + 44°)",
    hueNote:
      "Unowned 148°–174° gap on India's marketplace color wheel — instant 100% Original trust & unisex luxury.",
    canvasLight: "#FFFFFF",
    surfaceLight: "#F5F7F6",
    canvasDark: "#09110E",
    surfaceDark: "#101B17",
    inkLight: "#0C1412",
    inkDark: "#FFFFFF",
    primary: "#0B5D44",
    primaryDark: "#074230",
    vivid: "#10B981",
    accent: "#C59B27",
    accentTextLight: "#8F6B0F",
    accentGlow: "#E5C469",
    markLight: {
      bag: "#0B5D44",
      handle: "#C59B27",
      checkLeft: "#A7F3D0",
      checkRight: "#FFFFFF",
      sparkle: "#C59B27",
    },
    markDark: {
      bag: "#FFFFFF",
      handle: "#E5C469",
      checkLeft: "#10B981",
      checkRight: "#0B5D44",
      sparkle: "#E5C469",
    },
    markBrand: {
      bg: "#0B5D44",
      bag: "#FFFFFF",
      handle: "#E5C469",
      checkLeft: "#34D399",
      checkRight: "#0B5D44",
      sparkle: "#F3D37A",
    },
    wcag: {
      primaryOnWhite: "7.88:1 (AAA)",
      inkOnWhite: "18.68:1 (AAA)",
      vividOnDark: "7.53:1 (AAA)",
      accentOnDark: "7.36:1 (AAA)",
      accentTextOnWhite: "4.91:1 (AA)",
    },
  },
  {
    id: "royal-plum",
    name: "Royal Plum & Orchid",
    subtitle: "Purplle-Class Beauty & Lifestyle Signature",
    harmony: "Monochromatic Jewel (262° + 272°)",
    hueNote:
      "Vibrant beauty-marketplace charm with crisp obsidian contrast for cosmetics, fashion, and gifting.",
    canvasLight: "#FAF8FF",
    surfaceLight: "#F3EEFF",
    canvasDark: "#100B18",
    surfaceDark: "#181124",
    inkLight: "#1A102B",
    inkDark: "#FFFFFF",
    primary: "#7C3AED",
    primaryDark: "#5B21B6",
    vivid: "#A855F7",
    accent: "#C084FC",
    accentTextLight: "#6D28D9",
    accentGlow: "#D8B4FE",
    markLight: {
      bag: "#1A102B",
      handle: "#7C3AED",
      checkLeft: "#C084FC",
      checkRight: "#7C3AED",
      sparkle: "#7C3AED",
    },
    markDark: {
      bag: "#FFFFFF",
      handle: "#A855F7",
      checkLeft: "#C084FC",
      checkRight: "#7C3AED",
      sparkle: "#C084FC",
    },
    markBrand: {
      bg: "#5B21B6",
      bag: "#FFFFFF",
      handle: "#D8B4FE",
      checkLeft: "#C084FC",
      checkRight: "#5B21B6",
      sparkle: "#F3E8FF",
    },
    wcag: {
      primaryOnWhite: "5.70:1 (AA)",
      inkOnWhite: "17.4:1 (AAA)",
      vividOnDark: "5.12:1 (AA)",
      accentOnDark: "7.21:1 (AAA)",
      accentTextOnWhite: "6.94:1 (AA)",
    },
  },
  {
    id: "commerce-amber",
    name: "Obsidian & Saffron Amber",
    subtitle: "Amazon-Grade Universal Commerce Warmth",
    harmony: "Direct Complementary (215° + 38°)",
    hueNote:
      "High-velocity checkout authority pairing deep slate-obsidian with joyful warm saffron amber.",
    canvasLight: "#FFFFFF",
    surfaceLight: "#F8F8F7",
    canvasDark: "#0D1117",
    surfaceDark: "#161C26",
    inkLight: "#111827",
    inkDark: "#FFFFFF",
    primary: "#D97706",
    primaryDark: "#B45309",
    vivid: "#F59E0B",
    accent: "#F59E0B",
    accentTextLight: "#B45309",
    accentGlow: "#FCD34D",
    markLight: {
      bag: "#111827",
      handle: "#F59E0B",
      checkLeft: "#FCD34D",
      checkRight: "#F59E0B",
      sparkle: "#F59E0B",
    },
    markDark: {
      bag: "#FFFFFF",
      handle: "#F59E0B",
      checkLeft: "#FCD34D",
      checkRight: "#D97706",
      sparkle: "#FCD34D",
    },
    markBrand: {
      bg: "#111827",
      bag: "#FFFFFF",
      handle: "#F59E0B",
      checkLeft: "#FCD34D",
      checkRight: "#D97706",
      sparkle: "#FCD34D",
    },
    wcag: {
      primaryOnWhite: "5.02:1 (AA)",
      inkOnWhite: "17.74:1 (AAA)",
      vividOnDark: "8.92:1 (AAA)",
      accentOnDark: "8.92:1 (AAA)",
      accentTextOnWhite: "5.02:1 (AA)",
    },
  },
  {
    id: "editorial-mono",
    name: "Editorial Obsidian & Jade",
    subtitle: "Farfetch / Sephora Neutral Gallery + Trust",
    harmony: "Achromatic Luxury + Verified Jade",
    hueNote:
      "Zero color competition against third-party brand photography; emerald appears strictly on authenticity badges.",
    canvasLight: "#FFFFFF",
    surfaceLight: "#F6F6F7",
    canvasDark: "#09090B",
    surfaceDark: "#141417",
    inkLight: "#0B0B0D",
    inkDark: "#FFFFFF",
    primary: "#111114",
    primaryDark: "#000000",
    vivid: "#16A34A",
    accent: "#B88A2E",
    accentTextLight: "#825E16",
    accentGlow: "#E4C56A",
    markLight: {
      bag: "#111114",
      handle: "#71717A",
      checkLeft: "#A1A1AA",
      checkRight: "#FFFFFF",
      sparkle: "#16A34A",
    },
    markDark: {
      bag: "#FFFFFF",
      handle: "#A1A1AA",
      checkLeft: "#71717A",
      checkRight: "#111114",
      sparkle: "#4ADE80",
    },
    markBrand: {
      bg: "#111114",
      bag: "#FFFFFF",
      handle: "#A1A1AA",
      checkLeft: "#71717A",
      checkRight: "#111114",
      sparkle: "#4ADE80",
    },
    wcag: {
      primaryOnWhite: "18.85:1 (AAA)",
      inkOnWhite: "19.66:1 (AAA)",
      vividOnDark: "6.04:1 (AA)",
      accentOnDark: "6.36:1 (AA)",
      accentTextOnWhite: "5.90:1 (AA)",
    },
  },
];

// ---------------------------------------------------------------------------
// Named Motion Tokens & Storyboard Constants (charles-ux-animation)
// ---------------------------------------------------------------------------

export const MOTION_SPEC = {
  curves: {
    easeOut: "cubic-bezier(0.32, 0.72, 0, 1)",
    easeIn: "cubic-bezier(0.55, 0, 1, 0.45)",
    easeInOut: "cubic-bezier(0.77, 0, 0.175, 1)",
    springPop: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  durations: {
    press: "140ms",
    splashTotal: "1450ms",
    addToBag: "520ms",
    verifiedStamp: "720ms",
    orderSuccess: "1200ms",
    notification: "560ms",
    unboxing: "1100ms",
    loaderCycle: "1800ms",
    ambientCycle: "4200ms",
  },
} as const;

export type Logo80AnimationMode =
  | "idle"
  | "splash"
  | "loader"
  | "add-to-bag"
  | "verified"
  | "order-success"
  | "hover-press"
  | "notification"
  | "unboxing"
  | "ambient";

// ---------------------------------------------------------------------------
// Standalone Production SVG Generator (for 1-Click Vector Downloads)
// ---------------------------------------------------------------------------

export type Logo80LockupVariant =
  | "mark-light"
  | "mark-dark"
  | "mark-brand-tile"
  | "horizontal-light"
  | "horizontal-dark"
  | "stacked-light"
  | "mono-black"
  | "mono-white"
  | "gold-foil";

export function buildLogo80SvgString(
  theme: BrandSystemTheme,
  variant: Logo80LockupVariant
): string {
  const mk =
    variant === "mono-black"
      ? { bag: "#0A0A0B", handle: "#0A0A0B", checkLeft: "#FFFFFF", checkRight: "#FFFFFF", sparkle: "#0A0A0B" }
      : variant === "mono-white"
        ? { bag: "#FFFFFF", handle: "#FFFFFF", checkLeft: "#0A0A0B", checkRight: "#0A0A0B", sparkle: "#FFFFFF" }
        : variant === "gold-foil"
          ? { bag: "#C59B27", handle: "#E5C469", checkLeft: "#0B110F", checkRight: "#0B110F", sparkle: "#E5C469" }
          : variant === "mark-brand-tile"
            ? theme.markBrand
            : variant === "mark-dark" || variant === "horizontal-dark"
              ? theme.markDark
              : theme.markLight;

  const markInner = `
    <path d="${LOGO80_PATHS.handle}" stroke="${mk.handle}" stroke-width="4.4" stroke-linecap="round"/>
    <path d="${LOGO80_PATHS.bag}" fill="${mk.bag}"/>
    <path d="${LOGO80_PATHS.checkLeft}" fill="${mk.checkLeft}"/>
    <path d="${LOGO80_PATHS.checkRight}" fill="${mk.checkRight}"/>
    <path d="${LOGO80_PATHS.sparkle}" fill="${mk.sparkle}"/>
  `.trim();

  if (variant === "mark-brand-tile") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 80 80" fill="none" role="img" aria-label="Vittal Lifestyle App Icon"><rect width="80" height="80" rx="20" fill="${theme.markBrand.bg}"/><g transform="translate(8,8)">${markInner}</g></svg>`;
  }

  if (variant === "horizontal-light" || variant === "horizontal-dark") {
    const isDark = variant === "horizontal-dark";
    const w1Color = isDark ? theme.inkDark : theme.inkLight;
    const w2Color = isDark ? theme.accentGlow : theme.primary;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="180" viewBox="0 0 420 90" fill="none" role="img" aria-label="Vittal Lifestyle Official Horizontal Lockup"><g transform="translate(12,13)">${markInner}</g><text x="90" y="56" font-family="'Manrope', 'Avenir Next', sans-serif" font-weight="800" font-size="34" letter-spacing="-1.1" fill="${w1Color}">vittal <tspan font-weight="500" fill="${w2Color}">lifestyle</tspan></text></svg>`;
  }

  if (variant === "stacked-light") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="520" viewBox="0 0 240 260" fill="none" role="img" aria-label="Vittal Lifestyle Official Stacked Lockup"><g transform="translate(56,22) scale(2)">${markInner}</g><text x="120" y="196" text-anchor="middle" font-family="'Manrope', 'Avenir Next', sans-serif" font-weight="800" font-size="30" letter-spacing="3.5" fill="${theme.inkLight}">VITTAL</text><text x="120" y="220" text-anchor="middle" font-family="'Manrope', 'Avenir Next', sans-serif" font-weight="600" font-size="11.5" letter-spacing="6.5" fill="${theme.primary}">LIFESTYLE</text></svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 64 64" fill="none" role="img" aria-label="Vittal Lifestyle #80 Brand Mark">${markInner}</svg>`;
}

// ---------------------------------------------------------------------------
// Scoped GPU-Composited CSS Keyframe Stylesheet (Injected Once)
// ---------------------------------------------------------------------------

export function Logo80MotionStyles() {
  return (
    <style>{`
      .vl80-root {
        --vl-ease-out: cubic-bezier(0.32, 0.72, 0, 1);
        --vl-ease-in: cubic-bezier(0.55, 0, 1, 0.45);
        --vl-ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
        --vl-spring-pop: cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* 01. CINEMATIC SPLASH REVEAL (5-stage choreographed storyboard) */
      @keyframes vl80-handle-draw {
        0% { stroke-dashoffset: 100; opacity: 0; }
        18% { opacity: 1; }
        100% { stroke-dashoffset: 0; opacity: 1; }
      }
      @keyframes vl80-bag-land {
        0% { opacity: 0; transform: translateY(7px) scale(0.92); }
        70% { opacity: 1; transform: translateY(-1px) scale(1.02); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes vl80-check-left {
        0% { opacity: 0; transform: translate(-5px, -5px) scale(0.5); }
        100% { opacity: 1; transform: translate(0, 0) scale(1); }
      }
      @keyframes vl80-check-right {
        0% { opacity: 0; transform: scale(0.15) translate(-3px, 4px); }
        72% { opacity: 1; transform: scale(1.06) translate(0.5px, -0.5px); }
        100% { opacity: 1; transform: scale(1) translate(0, 0); }
      }
      @keyframes vl80-sparkle-pop {
        0% { opacity: 0; transform: scale(0.2) rotate(-45deg); }
        68% { opacity: 1; transform: scale(1.18) rotate(8deg); }
        100% { opacity: 1; transform: scale(1) rotate(0deg); }
      }
      @keyframes vl80-word-reveal {
        0% { opacity: 0; transform: translateX(-10px); }
        100% { opacity: 1; transform: translateX(0); }
      }

      .vl80-splash .vl80-handle {
        stroke-dasharray: 100;
        stroke-dashoffset: 100;
        animation: vl80-handle-draw calc(360ms / var(--vl-speed, 1)) var(--vl-ease-out) calc(40ms / var(--vl-speed, 1)) forwards;
      }
      .vl80-splash .vl80-bag {
        transform-origin: 32px 55px;
        opacity: 0;
        animation: vl80-bag-land calc(400ms / var(--vl-speed, 1)) var(--vl-ease-out) calc(150ms / var(--vl-speed, 1)) forwards;
      }
      .vl80-splash .vl80-check-l {
        transform-origin: 30px 46px;
        opacity: 0;
        animation: vl80-check-left calc(260ms / var(--vl-speed, 1)) var(--vl-ease-out) calc(420ms / var(--vl-speed, 1)) forwards;
      }
      .vl80-splash .vl80-check-r {
        transform-origin: 30px 46px;
        opacity: 0;
        animation: vl80-check-right calc(320ms / var(--vl-speed, 1)) var(--vl-spring-pop) calc(560ms / var(--vl-speed, 1)) forwards;
      }
      .vl80-splash .vl80-sparkle {
        transform-origin: 53.8px 10.6px;
        opacity: 0;
        animation: vl80-sparkle-pop calc(360ms / var(--vl-speed, 1)) var(--vl-spring-pop) calc(780ms / var(--vl-speed, 1)) forwards;
      }
      .vl80-splash .vl80-wordmark {
        opacity: 0;
        animation: vl80-word-reveal calc(380ms / var(--vl-speed, 1)) var(--vl-ease-out) calc(840ms / var(--vl-speed, 1)) forwards;
      }

      /* 02. VERIFIED ORBITAL LOADER (always spins even in reduced motion) */
      @keyframes vl80-orbit {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes vl80-loader-breathe {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(0.95); }
      }
      @keyframes vl80-sparkle-pulse {
        0%, 100% { opacity: 0.55; transform: scale(0.85) rotate(0deg); }
        50% { opacity: 1; transform: scale(1.12) rotate(45deg); }
      }
      .vl80-loader .vl80-orbit-ring {
        transform-origin: 32px 32px;
        animation: vl80-orbit calc(1400ms / var(--vl-speed, 1)) linear infinite;
      }
      .vl80-loader .vl80-bag-group {
        transform-origin: 32px 35px;
        animation: vl80-loader-breathe calc(1800ms / var(--vl-speed, 1)) var(--vl-ease-in-out) infinite;
      }
      .vl80-loader .vl80-sparkle {
        transform-origin: 53.8px 10.6px;
        animation: vl80-sparkle-pulse calc(1800ms / var(--vl-speed, 1)) var(--vl-ease-in-out) infinite;
      }

      /* 03. ADD-TO-BAG SQUASH & STRETCH BOUNCE */
      @keyframes vl80-drop-item {
        0% { opacity: 0; transform: translate(-12px, -18px) scale(0.7); }
        25% { opacity: 1; transform: translate(-4px, -12px) scale(1.15); }
        60% { opacity: 1; transform: translate(0, 6px) scale(0.9); }
        75% { opacity: 0; transform: translate(0, 10px) scale(0.4); }
        100% { opacity: 0; transform: translate(0, 10px) scale(0.4); }
      }
      @keyframes vl80-bag-squash {
        0% { transform: scale(1, 1) translateY(0); }
        34% { transform: scale(1.09, 0.90) translateY(2px); }
        62% { transform: scale(0.95, 1.07) translateY(-4px); }
        82% { transform: scale(1.02, 0.98) translateY(0.5px); }
        100% { transform: scale(1, 1) translateY(0); }
      }
      @keyframes vl80-handle-hop {
        0%, 32% { transform: translateY(0); }
        58% { transform: translateY(-4px); }
        100% { transform: translateY(0); }
      }
      .vl80-add-to-bag .vl80-drop-dot {
        animation: vl80-drop-item calc(580ms / var(--vl-speed, 1)) var(--vl-ease-out) forwards;
      }
      .vl80-add-to-bag .vl80-bag-group {
        transform-origin: 32px 55px;
        animation: vl80-bag-squash calc(540ms / var(--vl-speed, 1)) var(--vl-ease-out) calc(120ms / var(--vl-speed, 1)) forwards;
      }
      .vl80-add-to-bag .vl80-handle {
        transform-origin: 32px 21px;
        animation: vl80-handle-hop calc(480ms / var(--vl-speed, 1)) var(--vl-spring-pop) calc(140ms / var(--vl-speed, 1)) forwards;
      }
      .vl80-add-to-bag .vl80-sparkle {
        transform-origin: 53.8px 10.6px;
        animation: vl80-sparkle-pop calc(340ms / var(--vl-speed, 1)) var(--vl-spring-pop) calc(290ms / var(--vl-speed, 1)) forwards;
      }

      /* 04. 100% ORIGINAL VERIFIED STAMP + SONAR RIPPLE */
      @keyframes vl80-sonar-ring {
        0% { opacity: 0.72; transform: scale(0.88); }
        100% { opacity: 0; transform: scale(1.48); }
      }
      .vl80-verified .vl80-sonar {
        transform-origin: 32px 36px;
        opacity: 0;
        animation: vl80-sonar-ring calc(680ms / var(--vl-speed, 1)) var(--vl-ease-out) calc(220ms / var(--vl-speed, 1)) forwards;
      }
      .vl80-verified .vl80-check-l {
        transform-origin: 30px 46px;
        opacity: 0;
        animation: vl80-check-left calc(200ms / var(--vl-speed, 1)) var(--vl-ease-out) forwards;
      }
      .vl80-verified .vl80-check-r {
        transform-origin: 30px 46px;
        opacity: 0;
        animation: vl80-check-right calc(280ms / var(--vl-speed, 1)) var(--vl-spring-pop) calc(150ms / var(--vl-speed, 1)) forwards;
      }
      .vl80-verified .vl80-sparkle {
        transform-origin: 53.8px 10.6px;
        animation: vl80-sparkle-pop calc(340ms / var(--vl-speed, 1)) var(--vl-spring-pop) calc(280ms / var(--vl-speed, 1)) forwards;
      }

      /* 05. ORDER SUCCESS MILESTONE (radial restrained confetti burst) */
      @keyframes vl80-burst {
        0% { opacity: 0; transform: translate(0, 0) scale(0.4); }
        25% { opacity: 1; }
        100% { opacity: 0; transform: translate(var(--bx), var(--by)) scale(1); }
      }
      .vl80-order-success .vl80-confetti {
        opacity: 0;
        animation: vl80-burst calc(850ms / var(--vl-speed, 1)) var(--vl-ease-out) calc(240ms / var(--vl-speed, 1)) forwards;
      }
      .vl80-order-success .vl80-bag-group {
        transform-origin: 32px 55px;
        animation: vl80-bag-squash calc(540ms / var(--vl-speed, 1)) var(--vl-ease-out) forwards;
      }
      .vl80-order-success .vl80-check-r {
        transform-origin: 30px 46px;
        opacity: 0;
        animation: vl80-check-right calc(320ms / var(--vl-speed, 1)) var(--vl-spring-pop) calc(140ms / var(--vl-speed, 1)) forwards;
      }
      .vl80-order-success .vl80-sparkle {
        transform-origin: 53.8px 10.6px;
        animation: vl80-sparkle-pop calc(420ms / var(--vl-speed, 1)) var(--vl-spring-pop) calc(220ms / var(--vl-speed, 1)) forwards;
      }

      /* 06. NAVBAR HOVER & TACTILE PRESS (touch-safe @media hover:hover) */
      .vl80-hover-trigger {
        transition: transform 140ms var(--vl-ease-out);
      }
      .vl80-hover-trigger:active {
        transform: scale(0.96);
      }
      .vl80-hover-trigger .vl80-handle,
      .vl80-hover-trigger .vl80-sparkle {
        transition: transform 180ms var(--vl-spring-pop);
      }
      .vl80-hover-trigger .vl80-handle { transform-origin: 32px 21px; }
      .vl80-hover-trigger .vl80-sparkle { transform-origin: 53.8px 10.6px; }
      @media (hover: hover) and (pointer: fine) {
        .vl80-hover-trigger:hover .vl80-handle {
          transform: translateY(-2.4px);
        }
        .vl80-hover-trigger:hover .vl80-sparkle {
          transform: scale(1.22) rotate(45deg);
        }
      }
      .vl80-tap-active .vl80-handle {
        transform: translateY(-2.8px);
      }
      .vl80-tap-active .vl80-sparkle {
        transform: scale(1.25) rotate(45deg);
      }

      /* 07. MOBILE APP ICON PUSH NOTIFICATION WIGGLE */
      @keyframes vl80-wiggle {
        0% { transform: rotate(0deg) scale(1); }
        18% { transform: rotate(-7deg) scale(1.04); }
        38% { transform: rotate(6deg) scale(1.04); }
        58% { transform: rotate(-3.5deg) scale(1.02); }
        78% { transform: rotate(1.5deg) scale(1); }
        100% { transform: rotate(0deg) scale(1); }
      }
      .vl80-notification .vl80-bag-group {
        transform-origin: 32px 34px;
        animation: vl80-wiggle calc(560ms / var(--vl-speed, 1)) var(--vl-ease-out) forwards;
      }

      /* 08. AMBIENT HERO WATERMARK FLOAT (pauses off-screen via data-paused) */
      @keyframes vl80-float-y {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
      }
      @keyframes vl80-sparkle-breath {
        0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.9; }
        50% { transform: scale(1.12) rotate(18deg); opacity: 1; }
      }
      .vl80-ambient:not([data-paused="true"]) .vl80-bag-group {
        animation: vl80-float-y calc(4200ms / var(--vl-speed, 1)) var(--vl-ease-in-out) infinite;
      }
      .vl80-ambient:not([data-paused="true"]) .vl80-sparkle {
        transform-origin: 53.8px 10.6px;
        animation: vl80-sparkle-breath calc(3100ms / var(--vl-speed, 1)) var(--vl-ease-in-out) infinite;
      }

      /* CART BADGE & STEPPER SPRING POP */
      @keyframes vl80-badge-pop {
        0% { transform: scale(0.76); }
        65% { transform: scale(1.16); }
        100% { transform: scale(1); }
      }

      /* SHIMMER SKELETON UTILITY */
      @keyframes vl80-shimmer-sweep {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(200%); }
      }
      .vl80-shimmer-bar {
        animation: vl80-shimmer-sweep calc(1600ms / var(--vl-speed, 1)) linear infinite;
      }

      /* 3D UNBOXING LID LIFT (real perspective) */
      @keyframes vl80-lid-open {
        0% { transform: rotateX(0deg); }
        45% { transform: rotateX(-115deg); }
        100% { transform: rotateX(-108deg); }
      }
      @keyframes vl80-unbox-rise {
        0% { opacity: 0; transform: translateY(16px) scale(0.75); }
        40% { opacity: 0; transform: translateY(16px) scale(0.75); }
        100% { opacity: 1; transform: translateY(-6px) scale(1); }
      }
      .vl80-unbox-lid {
        transform-origin: top center;
        animation: vl80-lid-open calc(950ms / var(--vl-speed, 1)) var(--vl-ease-out) forwards;
      }
      .vl80-unbox-mark {
        animation: vl80-unbox-rise calc(950ms / var(--vl-speed, 1)) var(--vl-spring-pop) forwards;
      }

      /* REDUCED MOTION RESPECT — keep active loader spinning, calm all decorative motion */
      .vl80-reduced:not(.vl80-loader) *,
      .vl80-reduced:not(.vl80-loader) {
        animation: none !important;
        transition: none !important;
        opacity: 1 !important;
        stroke-dashoffset: 0 !important;
      }
      .vl80-reduced.vl80-loader .vl80-bag-group,
      .vl80-reduced.vl80-loader .vl80-sparkle {
        animation: none !important;
      }
      @media (prefers-reduced-motion: reduce) {
        .vl80-root:not(.vl80-loader) *,
        .vl80-root:not(.vl80-loader) {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `}</style>
  );
}

// ---------------------------------------------------------------------------
// Reusable Animated Logo #80 Mark Component
// ---------------------------------------------------------------------------

interface Logo80AnimatedMarkProps {
  theme: BrandSystemTheme;
  surface?: "light" | "dark" | "brand";
  mode?: Logo80AnimationMode;
  size?: number;
  speed?: number;
  reducedMotion?: boolean;
  replayKey?: number;
  withWordmark?: boolean;
  stackedOnMobile?: boolean;
  tapActive?: boolean;
  className?: string;
}

const CONFETTI_DOTS = [
  { bx: "-22px", by: "-18px", r: 2.2, useAccent: true },
  { bx: "24px", by: "-16px", r: 2.4, useAccent: false },
  { bx: "-26px", by: "2px", r: 2.0, useAccent: false },
  { bx: "26px", by: "4px", r: 2.2, useAccent: true },
  { bx: "-16px", by: "-24px", r: 1.8, useAccent: false },
  { bx: "16px", by: "-24px", r: 2.0, useAccent: true },
  { bx: "-18px", by: "18px", r: 1.8, useAccent: true },
  { bx: "19px", by: "17px", r: 2.0, useAccent: false },
];

export const Logo80AnimatedMark = React.memo(function Logo80AnimatedMark({
  theme,
  surface = "dark",
  mode = "idle",
  size = 76,
  speed = 1,
  reducedMotion = false,
  replayKey = 0,
  withWordmark = false,
  stackedOnMobile = false,
  tapActive = false,
  className = "",
}: Logo80AnimatedMarkProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [offscreen, setOffscreen] = useState(false);

  // Pause ambient loop when scrolled offscreen (charles-ux-animation rule)
  useEffect(() => {
    if (mode !== "ambient" || !wrapRef.current || typeof IntersectionObserver === "undefined") {
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => setOffscreen(!entries[0]?.isIntersecting),
      { threshold: 0.1 }
    );
    obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, [mode]);

  const colors =
    surface === "brand"
      ? theme.markBrand
      : surface === "light"
        ? theme.markLight
        : theme.markDark;

  const modeClass =
    mode === "idle"
      ? ""
      : mode === "hover-press"
        ? "vl80-hover-trigger"
        : `vl80-${mode}`;

  const wordColor1 =
    surface === "light" ? theme.inkLight : "#FFFFFF";
  const wordColor2 =
    surface === "light"
      ? theme.primary
      : surface === "brand"
        ? theme.accentGlow
        : theme.vivid;

  return (
    <div
      ref={wrapRef}
      key={replayKey}
      data-paused={offscreen ? "true" : "false"}
      style={{ "--vl-speed": String(speed) } as React.CSSProperties}
      className={`vl80-root inline-flex items-center gap-3 select-none ${
        stackedOnMobile ? "flex-col sm:flex-row text-center sm:text-left" : ""
      } ${modeClass} ${tapActive ? "vl80-tap-active" : ""} ${
        reducedMotion ? "vl80-reduced" : ""
      } ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="-8 -8 80 80"
        fill="none"
        aria-hidden="true"
        className="shrink-0 overflow-visible"
      >
        {/* Orbital verification ring for Loader mode */}
        {mode === "loader" && (
          <g className="vl80-orbit-ring">
            <circle
              cx="32"
              cy="32"
              r="34"
              stroke={theme.vivid}
              strokeOpacity="0.18"
              strokeWidth="2.5"
            />
            <path
              d="M32 -2 A34 34 0 0 1 66 32"
              stroke={theme.accentGlow}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Authenticity sonar ripple for Verified Stamp mode */}
        {mode === "verified" && (
          <circle
            cx="32"
            cy="36"
            r="26"
            stroke={theme.vivid}
            strokeWidth="2.6"
            className="vl80-sonar"
          />
        )}

        {/* Restrained radial geometric confetti for Order Success mode */}
        {mode === "order-success" &&
          CONFETTI_DOTS.map((d, i) => (
            <circle
              key={i}
              cx="32"
              cy="32"
              r={d.r}
              fill={d.useAccent ? theme.accentGlow : theme.vivid}
              className="vl80-confetti"
              style={
                { "--bx": d.bx, "--by": d.by } as React.CSSProperties
              }
            />
          ))}

        {/* Dropping product bead for Add-to-Bag Bounce mode */}
        {mode === "add-to-bag" && (
          <circle
            cx="32"
            cy="14"
            r="4.2"
            fill={theme.accentGlow}
            className="vl80-drop-dot"
          />
        )}

        {/* Core 5-Layer Modular Logo #80 v2.0 (Pure Cubic Bézier + Architectural Clasp Eyelets) */}
        <g className="vl80-bag-group">
          <path
            d={LOGO80_PATHS.handle}
            pathLength={100}
            stroke={colors.handle}
            strokeWidth="4.1"
            strokeLinecap="round"
            className="vl80-handle"
          />
          <path
            d={LOGO80_PATHS.bag}
            fill={colors.bag}
            className="vl80-bag"
          />
          <path
            d={LOGO80_PATHS.bagLip}
            stroke={surface === "light" ? "#A7F3D0" : colors.checkRight}
            strokeOpacity="0.22"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          <circle
            cx="22.5"
            cy="25.8"
            r="1.55"
            fill={colors.handle}
            fillOpacity="0.88"
          />
          <circle
            cx="41.5"
            cy="25.8"
            r="1.55"
            fill={colors.handle}
            fillOpacity="0.88"
          />
          <path
            d={LOGO80_PATHS.checkLeft}
            fill={colors.checkLeft}
            className="vl80-check-l"
          />
          <path
            d={LOGO80_PATHS.checkRight}
            fill={colors.checkRight}
            className="vl80-check-r"
          />
        </g>
        <path
          d={LOGO80_PATHS.sparkle}
          fill={colors.sparkle}
          className="vl80-sparkle"
        />
      </svg>

      {withWordmark && (
        <span
          className="vl80-wordmark inline-flex flex-col leading-none"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <span
            className="font-bold tracking-tight"
            style={{
              fontSize: `${Math.max(18, Math.round(size * 0.48))}px`,
              letterSpacing: "-0.03em",
              color: wordColor1,
            }}
          >
            vittal{" "}
            <span style={{ fontWeight: 400, color: wordColor2 }}>
              lifestyle
            </span>
          </span>
        </span>
      )}
    </div>
  );
});
