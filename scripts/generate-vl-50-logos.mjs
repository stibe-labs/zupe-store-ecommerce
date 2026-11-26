#!/usr/bin/env node
/**
 * Vittal Lifestyle — v4.0 Authentic Multi-Brand Premium Marketplace Identity System
 * 80 Flagship Marketplace Logos (#01–#80) built for a trusted multi-brand destination
 * selling 100% real, original premium brands (Amazon · Purplle · Nykaa · Farfetch · Tata CLiQ caliber).
 *
 * Engineered to dominate the 5 Real Marketplace Touchpoints:
 *   1. Universal Search Storefront Header & 100% Authentic Trust Pill
 *   2. iOS / Android Smartphone Home-Screen App Icon
 *   3. Corrugated Doorstep Unboxing Box & Tamper-Evident Security Tape
 *   4. Premium Retail Shopping Tote & Delivery Carry Bag
 *   5. 100% Original Verified Authenticity Tag & 16px Browser Favicon
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "brand-kit", "vl-50-logos");
const SVG_MARKS_DIR = path.join(OUT_DIR, "svg", "marks");
const SVG_LIGHT_DIR = path.join(OUT_DIR, "svg", "light");
const SVG_DARK_DIR = path.join(OUT_DIR, "svg", "dark");
const PNG_DIR = path.join(OUT_DIR, "png");

for (const dir of [OUT_DIR, SVG_MARKS_DIR, SVG_LIGHT_DIR, SVG_DARK_DIR, PNG_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

// ---------------------------------------------------------------------------
// Mathematical Variable-Width Sculpting & Precision Geometry Engine
// ---------------------------------------------------------------------------

const f = (v) => Number(v).toFixed(2);
const rad = (deg) => (deg * Math.PI) / 180;

function evalCubic(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  const x = mt ** 3 * p0[0] + 3 * mt ** 2 * t * p1[0] + 3 * mt * t ** 2 * p2[0] + t ** 3 * p3[0];
  const y = mt ** 3 * p0[1] + 3 * mt ** 2 * t * p1[1] + 3 * mt * t ** 2 * p2[1] + t ** 3 * p3[1];
  const tx = 3 * mt ** 2 * (p1[0] - p0[0]) + 6 * mt * t * (p2[0] - p1[0]) + 3 * t ** 2 * (p3[0] - p2[0]);
  const ty = 3 * mt ** 2 * (p1[1] - p0[1]) + 6 * mt * t * (p2[1] - p1[1]) + 3 * t ** 2 * (p3[1] - p2[1]);
  const len = Math.hypot(tx, ty) || 1;
  return { x, y, nx: -ty / len, ny: tx / len };
}

function taperedCubic(p0, p1, p2, p3, widthFn, steps = 36) {
  const left = [];
  const right = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const { x, y, nx, ny } = evalCubic(p0, p1, p2, p3, t);
    const w = Math.max(0.05, widthFn(t));
    left.push([x + nx * w, y + ny * w]);
    right.push([x - nx * w, y - ny * w]);
  }
  const pts = [...left, ...right.reverse()];
  return pts.map((p, idx) => `${idx === 0 ? "M" : "L"}${f(p[0])} ${f(p[1])}`).join("") + "Z";
}

function roundPoly(pts, defaultR = 1.8) {
  const n = pts.length;
  let d = "";
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const curr = pts[i];
    const next = pts[(i + 1) % n];
    const rReq = curr[2] !== undefined ? curr[2] : defaultR;

    const v1x = prev[0] - curr[0];
    const v1y = prev[1] - curr[1];
    const len1 = Math.hypot(v1x, v1y) || 1;

    const v2x = next[0] - curr[0];
    const v2y = next[1] - curr[1];
    const len2 = Math.hypot(v2x, v2y) || 1;

    const r = Math.min(rReq, len1 * 0.44, len2 * 0.44);
    const p1x = curr[0] + (v1x / len1) * r;
    const p1y = curr[1] + (v1y / len1) * r;
    const p2x = curr[0] + (v2x / len2) * r;
    const p2y = curr[1] + (v2y / len2) * r;

    d += i === 0 ? `M${f(p1x)} ${f(p1y)}` : `L${f(p1x)} ${f(p1y)}`;
    if (r > 0.05) d += `Q${f(curr[0])} ${f(curr[1])} ${f(p2x)} ${f(p2y)}`;
  }
  return d + "Z";
}

function annularSector(cx, cy, rOut, rIn, a1Deg, a2Deg) {
  const a1 = rad(a1Deg);
  const a2 = rad(a2Deg);
  const large = Math.abs(a2Deg - a1Deg) > 180 ? 1 : 0;
  const x1 = cx + rOut * Math.cos(a1);
  const y1 = cy + rOut * Math.sin(a1);
  const x2 = cx + rOut * Math.cos(a2);
  const y2 = cy + rOut * Math.sin(a2);
  const x3 = cx + rIn * Math.cos(a2);
  const y3 = cy + rIn * Math.sin(a2);
  const x4 = cx + rIn * Math.cos(a1);
  const y4 = cy + rIn * Math.sin(a1);
  return `M${f(x1)} ${f(y1)}A${f(rOut)} ${f(rOut)} 0 ${large} 1 ${f(x2)} ${f(y2)}L${f(x3)} ${f(y3)}A${f(rIn)} ${f(rIn)} 0 ${large} 0 ${f(x4)} ${f(y4)}Z`;
}

function circlePath(cx, cy, r) {
  return `M${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${f(cy)}Z`;
}

function roundedRectPath(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  return (
    `M${f(x + rr)} ${f(y)}H${f(x + w - rr)}` +
    `A${f(rr)} ${f(rr)} 0 0 1 ${f(x + w)} ${f(y + rr)}V${f(y + h - rr)}` +
    `A${f(rr)} ${f(rr)} 0 0 1 ${f(x + w - rr)} ${f(y + h)}H${f(x + rr)}` +
    `A${f(rr)} ${f(rr)} 0 0 1 ${f(x)} ${f(y + h - rr)}V${f(y + rr)}` +
    `A${f(rr)} ${f(rr)} 0 0 1 ${f(x + rr)} ${f(y)}Z`
  );
}

function astroidPath(cx, cy, rx, ry, pinch = 0.2) {
  const px = rx * pinch;
  const py = ry * pinch;
  return (
    `M${f(cx)} ${f(cy - ry)}` +
    `C${f(cx + px)} ${f(cy - py)} ${f(cx + px)} ${f(cy - py)} ${f(cx + rx)} ${f(cy)}` +
    `C${f(cx + px)} ${f(cy + py)} ${f(cx + px)} ${f(cy + py)} ${f(cx)} ${f(cy + ry)}` +
    `C${f(cx - px)} ${f(cy + py)} ${f(cx - px)} ${f(cy + py)} ${f(cx - rx)} ${f(cy)}` +
    `C${f(cx - px)} ${f(cy - py)} ${f(cx - px)} ${f(cy - py)} ${f(cx)} ${f(cy - ry)}Z`
  );
}

function regularPolyPoints(cx, cy, r, sides, startDeg = -90, cornerR = 2) {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const a = rad(startDeg + (360 / sides) * i);
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, cornerR]);
  }
  return pts;
}

function scallopSealPath(cx, cy, rBase, rAmp, lobes = 12, steps = 144) {
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const r = rBase + rAmp * Math.cos(a * lobes);
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    d += `${i === 0 ? "M" : "L"}${f(x)} ${f(y)}`;
  }
  return d + "Z";
}

function starSealPath(cx, cy, rOut, rIn, points = 8) {
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const a = rad(-90 + (180 / points) * i);
    const r = i % 2 === 0 ? rOut : rIn;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, i % 2 === 0 ? 1.8 : 1.0]);
  }
  return roundPoly(pts, 1.4);
}

function escapeXml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------------------------------------------------------------------------
// 8 Authentic Multi-Brand Marketplace Color Worlds (High-Contrast Light + Dark)
// ---------------------------------------------------------------------------

const PALETTES = {
  royalPlum:     { lightBg: "#FAF8FF", darkBg: "#100B18", inkL: "#1A102B", inkD: "#FFFFFF", c1: "#7C3AED", c2: "#5B21B6", c3: "#C084FC" },
  amazonAmber:   { lightBg: "#FFFFFF", darkBg: "#0D1117", inkL: "#111827", inkD: "#FFFFFF", c1: "#F59E0B", c2: "#B45309", c3: "#FCD34D" },
  vittalEmerald: { lightBg: "#F6FBF8", darkBg: "#09130D", inkL: "#0D1F14", inkD: "#FFFFFF", c1: "#16A34A", c2: "#15803D", c3: "#4ADE80" },
  nykaaBerry:    { lightBg: "#FFF8FA", darkBg: "#140A0F", inkL: "#1E0F17", inkD: "#FFFFFF", c1: "#E11D68", c2: "#9F1239", c3: "#F472B6" },
  cliqNavyGold:  { lightBg: "#F9F8F4", darkBg: "#09101E", inkL: "#0B1528", inkD: "#FFFFFF", c1: "#C99A2E", c2: "#856212", c3: "#EDD07A" },
  editorialMono: { lightBg: "#FFFFFF", darkBg: "#09090B", inkL: "#0B0B0E", inkD: "#FFFFFF", c1: "#111114", c2: "#27272A", c3: "#71717A" },
  cobaltExpress: { lightBg: "#F7FAFF", darkBg: "#080E1B", inkL: "#0C172D", inkD: "#FFFFFF", c1: "#2563EB", c2: "#1D4ED8", c3: "#60A5FA" },
  velvetCoral:   { lightBg: "#FCF9F7", darkBg: "#150E0C", inkL: "#1F1411", inkD: "#FFFFFF", c1: "#E54D2E", c2: "#B33318", c3: "#FB923C" },
};

function applyTokens(tpl, pal, isDark) {
  const ink = isDark ? pal.inkD : pal.inkL;
  const isMono = pal.c1 === "#111114";
  const c1 = isDark && isMono ? "#FFFFFF" : pal.c1;
  const c2 = isDark && isMono ? "#D4D4D8" : pal.c2;
  const c3 = isDark && pal.c3 === "#71717A" ? "#A1A1AA" : pal.c3;
  const bg = isDark ? pal.darkBg : pal.lightBg;
  const onC1 = isDark && isMono ? pal.darkBg : "#FFFFFF";
  return tpl
    .replaceAll("__INK__", ink)
    .replaceAll("__C1__", c1)
    .replaceAll("__C2__", c2)
    .replaceAll("__C3__", c3)
    .replaceAll("__BG__", bg)
    .replaceAll("__ONC1__", onC1);
}

// ---------------------------------------------------------------------------
// Precomputed Sculpted Variable-Width Curves & Symmetrical Marketplace Forms
// ---------------------------------------------------------------------------

// #11 Vittal 100% Verified V-Check — muscular tapered V sweeping up into an authentic check
const p11_down = taperedCubic([8, 22], [14, 34], [20, 44], [27, 51], (t) => 4.2 * Math.sin(Math.PI * Math.pow(t, 0.7)) + 1.1);
const p11_up = taperedCubic([26, 51], [35, 38], [44, 24], [57, 11], (t) => 4.5 * Math.sin(Math.PI * Math.pow(t, 0.65)) + 0.5);

// #14 Double-Verified Ribbon Tick — nested twin verification arcs
const p14_a = taperedCubic([9, 31], [17, 41], [22, 46], [26, 48], (t) => 3.0 * Math.sin(Math.PI * t) + 1.0);
const p14_a2 = taperedCubic([25, 48], [34, 36], [42, 24], [52, 13], (t) => 3.2 * Math.sin(Math.PI * t) + 0.6);
const p14_b = taperedCubic([29, 53], [39, 41], [47, 30], [57, 20], (t) => 2.7 * Math.sin(Math.PI * t) + 0.45);

// #21 Warm Smile-V — Amazon-class warm kinetic smile arc under crisp V
const p21_smile = taperedCubic([11, 47], [24, 57], [40, 57], [53, 46], (t) => 2.8 * Math.sin(Math.PI * t) + 0.55);

// #23 Express V-Arrow Horizon — sleek velocity arc ending in an express arrow
const p23_arc = taperedCubic([7, 39], [20, 52], [38, 49], [53, 25], (t) => 4.2 * Math.sin(Math.PI * Math.pow(t, 0.7)) + 0.7);

// #29 Kinetic Checkout Swish — joyful fluid shopping ribbon
const p29_swish = taperedCubic([8, 17], [18, 52], [34, 56], [56, 20], (t) => 5.0 * Math.sin(Math.PI * Math.pow(t, 0.72)) + 0.6);

// #31 Folded Multi-Brand Ribbon V — vibrant dimensional Myntra/Purplle-class folded V
const p31_left = taperedCubic([10, 12], [17, 29], [23, 42], [32, 53], (t) => 5.4 * Math.sin(Math.PI * Math.pow(t, 0.8)) + 1.6);
const p31_right = taperedCubic([54, 12], [47, 29], [41, 42], [32, 53], (t) => 5.4 * Math.sin(Math.PI * Math.pow(t, 0.8)) + 1.6);

// #38 Calligraphic Brush v Tile — expressive editorial beauty marketplace 'v'
const p38_l = taperedCubic([9, 17], [17, 13], [22, 36], [29, 52], (t) => 5.0 * Math.sin(Math.PI * Math.pow(t, 0.75)) + 0.9);
const p38_r = taperedCubic([29, 52], [37, 40], [45, 24], [55, 13], (t) => 3.0 * Math.sin(Math.PI * t) + 0.65);

// #62 Silk Ribbon Gift-Box Bow — lush symmetrical silk bow loops
const p62_bowL = taperedCubic([32, 23], [14, 5], [7, 23], [32, 23], (t) => 3.1 * Math.sin(Math.PI * t) + 0.55);
const p62_bowR = taperedCubic([32, 23], [50, 5], [57, 23], [32, 23], (t) => 3.1 * Math.sin(Math.PI * t) + 0.55);

// #68 Velvet Ribbon Infinity Gift Bow — symmetrical gift silk loops
const p68_l = taperedCubic([32, 32], [11, 11], [6, 48], [32, 32], (t) => 3.8 * Math.sin(Math.PI * t) + 0.7);
const p68_r = taperedCubic([32, 32], [53, 11], [58, 48], [32, 32], (t) => 3.8 * Math.sin(Math.PI * t) + 0.7);

// #69 Blooming Lotus-Star Commerce — 3 clean symmetrical petals
const p69_l = taperedCubic([31, 48], [17, 44], [10, 32], [11, 18], (t) => 4.8 * Math.sin(Math.PI * Math.pow(t, 0.72)) + 0.35);
const p69_r = taperedCubic([33, 48], [47, 44], [54, 32], [53, 18], (t) => 4.8 * Math.sin(Math.PI * Math.pow(t, 0.72)) + 0.35);
const p69_c = taperedCubic([32, 48], [32, 34], [32, 21], [32, 9], (t) => 5.4 * Math.sin(Math.PI * Math.pow(t, 0.78)) + 0.3);

// #71 Verified Smile-V Master — warm wide commerce smile beneath verified V-check
const p71_smile = taperedCubic([12, 49], [25, 59], [41, 59], [54, 47], (t) => 2.8 * Math.sin(Math.PI * t) + 0.5);

// #75 Multi-Brand Curated Ribbon V — 3 cascading sculptural ribbons
const p75_a = taperedCubic([8, 13], [15, 29], [22, 43], [31, 53], (t) => 4.4 * Math.sin(Math.PI * Math.pow(t, 0.8)) + 1.2);
const p75_b = taperedCubic([31, 53], [40, 39], [47, 26], [56, 12], (t) => 4.4 * Math.sin(Math.PI * Math.pow(t, 0.8)) + 1.2);
const p75_c = taperedCubic([20, 12], [26, 25], [30, 33], [32, 39], (t) => 3.2 * Math.sin(Math.PI * t) + 0.7);

// #78 Express Doorstep Horizon Arc — sleek speed rail under parcel
const p78_arc = taperedCubic([7, 49], [23, 56], [42, 55], [57, 43], (t) => 2.8 * Math.sin(Math.PI * t) + 0.45);

// #80 Vittal Sovereign Marketplace Master — radiant check-V inside sculpted luxury carry frame
const p80_checkL = taperedCubic([20, 33], [24, 39], [27, 43], [30, 46], (t) => 2.8 * Math.sin(Math.PI * t) + 1.1);
const p80_checkR = taperedCubic([29.5, 46], [35, 38], [40, 31], [47, 23], (t) => 3.0 * Math.sin(Math.PI * t) + 0.8);

// ---------------------------------------------------------------------------
// 80 Redesigned Authentic Multi-Brand Marketplace Logos (#01–#80)
// ---------------------------------------------------------------------------

const LOGOS = [
  // =========================================================================
  // ARCHETYPE 1 (01–10): SIGNATURE SHOPPING BAGS & CARRY TOTES
  // =========================================================================
  {
    id: "01",
    world: "1 · Shopping Bags & Totes",
    name: "The Vittal Signature Tote",
    badge: "★ Purplle × Boutique Hero",
    star: true,
    palette: PALETTES.royalPlum,
    wordmark: { style: "tight", w1: "vittal", w2: "lifestyle", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Sculpted luxury shopping bag with a precision arched handle and crisp negative-space V — instantly recognizable as a curated destination for original brands.",
    markTpl: `
      <path d="M22 22V17A10 10 0 0 1 42 17V22" stroke="__C1__" stroke-width="4.4" stroke-linecap="round"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="${roundPoly([[11, 21, 5], [53, 21, 5], [56, 54, 7], [8, 54, 7]], 5)} M21 29H27.8L32 41.5L36.2 29H43L34.5 48H29.5L21 29Z" fill="__INK__"/>`,
  },
  {
    id: "02",
    world: "1 · Shopping Bags & Totes",
    name: "Smiling Handle Shopping Bag",
    badge: "★ Amazon Warmth × Tote",
    star: true,
    palette: PALETTES.amazonAmber,
    wordmark: { style: "lowercase", w1: "vittal", w2: "lifestyle", font: "'Plus Jakarta Sans', 'Avenir Next', sans-serif" },
    rationale:
      "Clean modern carry bag pairing crisp geometric trust with a warm amber internal smile-handle — radiates effortless shopping joy and guaranteed satisfaction.",
    markTpl: `
      <path d="M22 20V14A10 10 0 0 1 42 14V20" stroke="__INK__" stroke-width="4.2" stroke-linecap="round"/>
      <path d="${roundPoly([[10, 19, 5], [54, 19, 5], [57, 55, 8], [7, 55, 8]], 6)}" fill="__INK__"/>
      <path d="M19 31C23 44 41 44 45 31" stroke="__C1__" stroke-width="5.2" stroke-linecap="round"/>
      <path d="M40 31L46 29.5L46.5 36" stroke="__C1__" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: "03",
    world: "1 · Shopping Bags & Totes",
    name: "Origami Folded Luxury Bag",
    badge: "★ Selfridges × Editorial",
    star: true,
    palette: PALETTES.editorialMono,
    wordmark: { style: "wideUpper", w1: "VITTAL", w2: "LIFESTYLE", font: "'Urbanist', 'Avenir Next', sans-serif" },
    rationale:
      "Dimensional architectural shopping tote with a clean folded side gusset and tailored handle — quiet-luxury authority beside designer apparel, fragrances, and watches.",
    markTpl: `
      <path d="M21 22V16A9 9 0 0 1 39 16V22" stroke="__INK__" stroke-width="4" stroke-linecap="round"/>
      <path d="${roundPoly([[10, 21, 4], [44, 21, 4], [44, 55, 5], [10, 55, 5]], 4)}" fill="__INK__"/>
      <path d="${roundPoly([[46, 21, 2], [55, 25, 3], [55, 53, 4], [46, 55, 2]], 2.5)}" fill="__C3__"/>
      <path d="M19 30H24.5L27 40L29.5 30H35L29 47H25L19 30Z" fill="__BG__"/>`,
  },
  {
    id: "04",
    world: "1 · Shopping Bags & Totes",
    name: "V-Ribbon Handle Tote",
    badge: "★ Nykaa-Class Fashion Bag",
    star: true,
    palette: PALETTES.nykaaBerry,
    wordmark: { style: "tight", w1: "Vittal", w2: "Lifestyle", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Minimalist retail tote whose twin curved ribbon straps sweep down the front face into an unmistakable sculpted V — instant beauty & fashion marketplace charm.",
    markTpl: `
      <path d="${roundPoly([[11, 21, 5], [53, 21, 5], [56, 55, 7], [8, 55, 7]], 5)}" fill="__C1__"/>
      <path d="M22 21V15A10 10 0 0 1 42 15V21" stroke="__INK__" stroke-width="4.4" stroke-linecap="round"/>
      <path d="M18 21L32 45L46 21" stroke="__ONC1__" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: "05",
    world: "1 · Shopping Bags & Totes",
    name: "Verified Check Shopping Bag",
    badge: "★ 100% Genuine Cart",
    star: true,
    palette: PALETTES.vittalEmerald,
    wordmark: { style: "tightUpper", w1: "VITTAL", w2: "LIFESTYLE", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Unmistakable fusion of a modern shopping bag and a bold verified authenticity checkmark — promises zero fakes on every order at a single glance.",
    markTpl: `
      <path d="M22 21V16A10 10 0 0 1 42 16V21" stroke="__INK__" stroke-width="4.4" stroke-linecap="round"/>
      <path d="${roundPoly([[10, 20, 5], [54, 20, 5], [54, 54, 8], [10, 54, 8]], 6)}" fill="__C1__"/>
      <path d="M21 37L28.5 44.5L44 29" stroke="__ONC1__" stroke-width="5.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: "06",
    world: "1 · Shopping Bags & Totes",
    name: "Twin-Tone Multi-Brand Bag",
    badge: "Multi-Category Retail",
    star: false,
    palette: PALETTES.cobaltExpress,
    wordmark: { style: "tight", w1: "Vittal", w2: "Lifestyle", font: "'Plus Jakarta Sans', 'Avenir Next', sans-serif" },
    rationale:
      "Diagonal dual-tone shopping tote symbolizing multiple curated global brands delivered together in one trusted order.",
    markTpl: `
      <path d="M22 21V15A10 10 0 0 1 42 15V21" stroke="__INK__" stroke-width="4.2" stroke-linecap="round"/>
      <path d="${roundPoly([[10, 21, 5], [54, 21, 5], [10, 55, 6]], 4)}" fill="__INK__"/>
      <path d="${roundPoly([[54, 21, 4], [54, 55, 6], [10, 55, 4]], 4)}" fill="__C1__"/>
      <path d="M22 30H27.8L32 41.5L36.2 30H42L34.5 47H29.5L22 30Z" fill="__ONC1__"/>`,
  },
  {
    id: "07",
    world: "1 · Shopping Bags & Totes",
    name: "Boutique Pouch & Gold Clasp",
    badge: "Luxury Department Bag",
    star: false,
    palette: PALETTES.cliqNavyGold,
    wordmark: { style: "serif", w1: "VITTAL", w2: "LIFESTYLE", font: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" },
    rationale:
      "Structured flagship shopping pouch crowned with a refined champagne-gold arch handle and architectural clasp — built for high-end retail bags and luxury parcels.",
    markTpl: `
      <path d="M22 23V16A10 10 0 0 1 42 16V23" stroke="__C1__" stroke-width="4" stroke-linecap="round"/>
      <path d="${roundPoly([[11, 22, 6], [53, 22, 6], [55, 54, 7], [9, 54, 7]], 6)}" fill="__INK__"/>
      <rect x="20" y="29" width="24" height="3.2" rx="1.6" fill="__C1__"/>
      <path d="M26 36H30.5L32 42L33.5 36H38L33.8 47H30.2L26 36Z" fill="__C3__"/>`,
  },
  {
    id: "08",
    world: "1 · Shopping Bags & Totes",
    name: "Tilted Express Courier Bag",
    badge: "Fast Dispatch Retail",
    star: false,
    palette: PALETTES.velvetCoral,
    wordmark: { style: "tight", w1: "Vittal", w2: "Lifestyle", font: "'Space Grotesk', 'Avenir Next', sans-serif" },
    rationale:
      "Dynamic forward-leaning shopping bag with sleek aerodynamic speed trails — expresses quick doorstep delivery of authentic lifestyle essentials.",
    markTpl: `
      <path d="M26 20V15A8.5 8.5 0 0 1 43 15V20" stroke="__INK__" stroke-width="4" stroke-linecap="round"/>
      <path d="${roundPoly([[17, 20, 5], [55, 20, 5], [50, 53, 6], [12, 53, 6]], 5)}" fill="__C1__"/>
      <rect x="6" y="29" width="11" height="3.6" rx="1.8" fill="__INK__"/>
      <rect x="4" y="38" width="10" height="3.6" rx="1.8" fill="__C3__"/>
      <path d="M26 29H31.5L33.8 39.5L38 29H43.5L35.5 46H31L26 29Z" fill="__ONC1__"/>`,
  },
  {
    id: "09",
    world: "1 · Shopping Bags & Totes",
    name: "Stacked Multi-Brand Bags",
    badge: "Curated Discovery",
    star: false,
    palette: PALETTES.royalPlum,
    wordmark: { style: "wideUpper", w1: "VITTAL", w2: "LIFESTYLE", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Two crisp nested shopping bags offset cleanly in plum and obsidian — celebrates discovering multiple authentic brands in one seamless basket.",
    markTpl: `
      <path d="M28 19V14A8 8 0 0 1 44 14V19" stroke="__C1__" stroke-width="3.8" stroke-linecap="round"/>
      <rect x="20" y="18" width="34" height="32" rx="7" fill="__C1__"/>
      <path d="M18 25V20A8 8 0 0 1 34 20V25" stroke="__INK__" stroke-width="3.8" stroke-linecap="round"/>
      <rect x="10" y="24" width="34" height="31" rx="7" fill="__INK__" stroke="__BG__" stroke-width="2.6"/>
      <path d="M20 33H24.8L27 42L29.2 33H34L28.8 47H25.2L20 33Z" fill="__BG__"/>`,
  },
  {
    id: "10",
    world: "1 · Shopping Bags & Totes",
    name: "Soft-Pebble App Shopping Bag",
    badge: "★ iOS / Android Icon",
    star: true,
    palette: PALETTES.nykaaBerry,
    wordmark: { style: "lowercase", w1: "vittal", w2: "lifestyle", font: "'Plus Jakarta Sans', 'Avenir Next', sans-serif" },
    rationale:
      "Plump, tactile pebble-shaped boutique carry pouch with a clean pill grip cutout and radiant accent sparkle — built to stand out on smartphone home screens.",
    markTpl: `
      <path fill-rule="evenodd" clip-rule="evenodd" d="${roundedRectPath(9, 10, 46, 46, 15)} ${roundedRectPath(22, 17, 20, 7.5, 3.75)}" fill="__INK__"/>
      <path d="M21 31H27.8L32 43L36.2 31H43L34.5 49H29.5L21 31Z" fill="__C1__"/>
      <circle cx="46" cy="46" r="3.4" fill="__C3__"/>`,
  },

  // =========================================================================
  // ARCHETYPE 2 (11–20): VERIFIED ORIGINAL & AUTHENTICITY SEALS
  // =========================================================================
  {
    id: "11",
    world: "2 · Verified & Authentic",
    name: "Vittal 100% Verified V-Check",
    badge: "★ Authenticity Flagship",
    star: true,
    palette: PALETTES.vittalEmerald,
    wordmark: { style: "tight", w1: "Vittal", w2: "Lifestyle", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Sculpted variable-width V that sweeps dynamically upward into a bold verified checkmark — the purest visual promise of 100% original brands, zero counterfeits.",
    markTpl: `
      <path d="${p11_down}" fill="__INK__"/>
      <path d="${p11_up}" fill="__C1__"/>`,
  },
  {
    id: "12",
    world: "2 · Verified & Authentic",
    name: "Official Verified Rosette V",
    badge: "★ Official Partner Seal",
    star: true,
    palette: PALETTES.cobaltExpress,
    wordmark: { style: "tight", w1: "Vittal", w2: "Lifestyle", font: "'Plus Jakarta Sans', 'Avenir Next', sans-serif" },
    rationale:
      "Precision 12-scallop official verification badge punching a razor-sharp V-check out of its core — instant trust next to every product and checkout button.",
    markTpl: `
      <path d="${scallopSealPath(32, 32, 24.5, 2.4, 12, 144)}" fill="__C1__"/>
      <path d="M20 33L28 41.5L45 23.5" stroke="__ONC1__" stroke-width="5.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: "13",
    world: "2 · Verified & Authentic",
    name: "Authentic Original Shield-V",
    badge: "★ Buyer Protection Trust",
    star: true,
    palette: PALETTES.vittalEmerald,
    wordmark: { style: "tightUpper", w1: "VITTAL", w2: "LIFESTYLE", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Architectural split-tone buyer-protection shield carrying a centered luminous V-tick — radiates bank-grade trust and guaranteed genuine brand sourcing.",
    markTpl: `
      <path d="M12 10H32V56C20 52 12 43 12 31V10Z" fill="__INK__"/>
      <path d="M32 10H52V31C52 43 44 52 32 56V10Z" fill="__C1__"/>
      <path d="M21 32L29 40.5L44 24.5" stroke="__ONC1__" stroke-width="5.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: "14",
    world: "2 · Verified & Authentic",
    name: "Double-Verified Ribbon Tick",
    badge: "★ Brand + Vittal Checked",
    star: true,
    palette: PALETTES.royalPlum,
    wordmark: { style: "tight", w1: "vittal", w2: "lifestyle", font: "'Urbanist', 'Avenir Next', sans-serif" },
    rationale:
      "Two harmonious nested verification strokes symbolize dual-stage authentication — original from the brand, verified again by Vittal Lifestyle.",
    markTpl: `
      <path d="${p14_a}" fill="__INK__"/>
      <path d="${p14_a2}" fill="__INK__"/>
      <path d="${p14_b}" fill="__C1__"/>`,
  },
  {
    id: "15",
    world: "2 · Verified & Authentic",
    name: "Certified Original Stamp Seal",
    badge: "Luxury Authenticity Coin",
    star: false,
    palette: PALETTES.cliqNavyGold,
    wordmark: { style: "serif", w1: "VITTAL", w2: "LIFESTYLE", font: "'Playfair Display', Georgia, serif" },
    rationale:
      "Refined double-ring authenticity medallion with precision crown notches framing a poised V — built for tamper-proof seals on perfumes, watches, and designer goods.",
    markTpl: `
      <circle cx="32" cy="32" r="24" stroke="__INK__" stroke-width="3.6"/>
      <circle cx="32" cy="32" r="18.5" stroke="__C1__" stroke-width="1.6"/>
      <path d="M21 23H27.5L32 37.5L36.5 23H43L34.5 45H29.5L21 23Z" fill="__INK__"/>
      <circle cx="32" cy="8" r="3" fill="__C1__"/>
      <circle cx="32" cy="56" r="3" fill="__C1__"/>`,
  },
  {
    id: "16",
    world: "2 · Verified & Authentic",
    name: "Faceted Authenticity Gem-V",
    badge: "High-Ticket Luxury Seal",
    star: false,
    palette: PALETTES.editorialMono,
    wordmark: { style: "wideUpper", w1: "VITTAL", w2: "LIFESTYLE", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Precision emerald-cut octagonal seal enclosing a bold geometric V-tick — clean editorial assurance for authentic luxury accessories and designer wear.",
    markTpl: `
      <path d="${roundPoly(regularPolyPoints(32, 32, 26, 8, -67.5, 2.5), 2.5)}" fill="__INK__"/>
      <path d="M21 24H28L32 37L36 24H43L34.5 45H29.5L21 24Z" fill="__BG__"/>
      <circle cx="32" cy="15" r="2.6" fill="__C3__"/>`,
  },
  {
    id: "17",
    world: "2 · Verified & Authentic",
    name: "Direct-Brand Trust Bridge",
    badge: "Authorized Retail Link",
    star: false,
    palette: PALETTES.cobaltExpress,
    wordmark: { style: "tight", w1: "Vittal", w2: "Lifestyle", font: "'Space Grotesk', 'Avenir Next', sans-serif" },
    rationale:
      "Two precision interlocking stadium loops angled into an architectural V — represents the direct authorized link between global brands and shoppers.",
    markTpl: `
      <g transform="translate(24 33) rotate(-26)">
        <rect x="-8" y="-21" width="16" height="42" rx="8" stroke="__INK__" stroke-width="5.2"/>
      </g>
      <g transform="translate(40 33) rotate(26)">
        <rect x="-8" y="-21" width="16" height="42" rx="8" stroke="__C1__" stroke-width="5.2"/>
      </g>`,
  },
  {
    id: "18",
    world: "2 · Verified & Authentic",
    name: "Starburst Verified Guarantee",
    badge: "★ Gold-Standard Check",
    star: true,
    palette: PALETTES.amazonAmber,
    wordmark: { style: "tightUpper", w1: "VITTAL", w2: "LIFESTYLE", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Crisp 8-point starburst authenticity badge housing a high-contrast verified check — immediate visual confidence across mobile product cards and shipping tape.",
    markTpl: `
      <path d="${starSealPath(32, 32, 27, 20.5, 8)}" fill="__C1__"/>
      <circle cx="32" cy="32" r="16.5" fill="__INK__"/>
      <path d="M23 32.5L29.5 39L42 26" stroke="__BG__" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: "19",
    world: "2 · Verified & Authentic",
    name: "Official Authenticity Ribbon",
    badge: "Certified Award Seal",
    star: false,
    palette: PALETTES.velvetCoral,
    wordmark: { style: "wideUpper", w1: "VITTAL", w2: "LIFESTYLE", font: "'Urbanist', 'Avenir Next', sans-serif" },
    rationale:
      "Modern minimalist authenticity medal with crisp forked award ribbons and a centered V emblem — signifies curated excellence and genuine brand quality.",
    markTpl: `
      <path d="M22 37L17 57L27 52L32 57V37H22Z" fill="__C1__"/>
      <path d="M42 37L47 57L37 52L32 57V37H42Z" fill="__C3__"/>
      <circle cx="32" cy="25" r="18" fill="__INK__" stroke="__BG__" stroke-width="2"/>
      <path d="M23 19H28.2L32 30.5L35.8 19H41L34 35.5H30L23 19Z" fill="__BG__"/>`,
  },
  {
    id: "20",
    world: "2 · Verified & Authentic",
    name: "Breakout Verified Check-Box",
    badge: "Zero-Fake Seal",
    star: false,
    palette: PALETTES.vittalEmerald,
    wordmark: { style: "tight", w1: "Vittal", w2: "Lifestyle", font: "'Space Grotesk', 'Avenir Next', sans-serif" },
    rationale:
      "Clean architectural rounded frame broken boldly at top-right by an ascending verified V-checkmark — unmistakable trust symbol in digital checkout flows.",
    markTpl: `
      <path d="M49 32V46A8 8 0 0 1 41 54H17A8 8 0 0 1 9 46V22A8 8 0 0 1 17 14H36" stroke="__INK__" stroke-width="5.2" stroke-linecap="round"/>
      <path d="M21 31L30 40.5L54 15" stroke="__C1__" stroke-width="6.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  },

  // =========================================================================
  // ARCHETYPE 3 (21–30): EXPRESS DELIVERY, SMILES & PARCELS
  // =========================================================================
  {
    id: "21",
    world: "3 · Express & Parcels",
    name: "The Vittal Warm Smile-V",
    badge: "★ Amazon-Class Warmth",
    star: true,
    palette: PALETTES.amazonAmber,
    wordmark: { style: "lowercase", w1: "vittal", w2: "lifestyle", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Bold friendly geometric V cradled by a sweeping amber smile-arrow arc — delivers Amazon-grade universal approachability, warmth, and effortless trust.",
    markTpl: `
      <path d="M16 11H25.5L32 31.5L38.5 11H48L36 42H28L16 11Z" fill="__INK__"/>
      <path d="${p21_smile}" fill="__C1__"/>
      <path d="M48 43L55.5 44.5L52.5 52" stroke="__C1__" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: "22",
    world: "3 · Express & Parcels",
    name: "Unfolded Luxury Delivery Cube",
    badge: "★ Iconic Unboxing Box",
    star: true,
    palette: PALETTES.amazonAmber,
    wordmark: { style: "tight", w1: "Vittal", w2: "Lifestyle", font: "'Plus Jakarta Sans', 'Avenir Next', sans-serif" },
    rationale:
      "Precision isometric shipping box whose open top flaps bloom into a bold amber V — transforms every doorstep parcel into an unforgettable brand signature.",
    markTpl: `
      <path d="M11 26L32 37V57L11 46V26Z" fill="__INK__"/>
      <path d="M53 26L32 37V57L53 46V26Z" fill="__C1__"/>
      <path d="M11 26L5 15L26 10L32 21L11 26Z" fill="__C3__"/>
      <path d="M53 26L59 15L38 10L32 21L53 26Z" fill="__INK__"/>
      <path d="M22 23L32 32L42 23" stroke="__BG__" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: "23",
    world: "3 · Express & Parcels",
    name: "Express V-Arrow Horizon",
    badge: "★ Rapid Fulfillment",
    star: true,
    palette: PALETTES.cobaltExpress,
    wordmark: { style: "tightUpper", w1: "VITTAL", w2: "LIFESTYLE", font: "'Space Grotesk', 'Avenir Next', sans-serif" },
    rationale:
      "Single aerodynamic variable-width velocity curve swooping forward and upward into a sharp express arrow — pure marketplace momentum and on-time promise.",
    markTpl: `
      <path d="M10 15H21L30 37L22 41L10 15Z" fill="__INK__"/>
      <path d="${p23_arc}" fill="__C1__"/>
      <path d="M40 16L56 17L55 33L49 23L40 16Z" fill="__INK__"/>`,
  },
  {
    id: "24",
    world: "3 · Express & Parcels",
    name: "Ribbon-Sealed Shipping Parcel",
    badge: "★ Tamper-Proof Unboxing",
    star: true,
    palette: PALETTES.royalPlum,
    wordmark: { style: "tight", w1: "vittal", w2: "lifestyle", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Clean rounded luxury delivery parcel sealed vertically with a vibrant authenticity ribbon and crowned by a crisp V-bow — built for doorstep delight.",
    markTpl: `
      <rect x="10" y="18" width="44" height="38" rx="9" fill="__INK__"/>
      <rect x="27" y="18" width="10" height="38" fill="__C1__"/>
      <path d="M18 10L32 19L46 10" stroke="__C1__" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="10" y="32" width="44" height="5" fill="__BG__" opacity="0.22"/>`,
  },
  {
    id: "25",
    world: "3 · Express & Parcels",
    name: "Joyful Cart-Smile Arc",
    badge: "Effortless Shopping",
    star: false,
    palette: PALETTES.velvetCoral,
    wordmark: { style: "lowercase", w1: "vittal", w2: "lifestyle", font: "'Plus Jakarta Sans', 'Avenir Next', sans-serif" },
    rationale:
      "Ultra-minimalist smiling cart trajectory crafted from one clean sweeping curve and two joyful wheels — immediately intuitive e-commerce warmth.",
    markTpl: `
      <path d="M8 17H16L22 41C24 46 39 46 46 38L54 22" stroke="__INK__" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M24 23H45L35 36L24 23Z" fill="__C1__"/>
      <circle cx="24" cy="52" r="4.2" fill="__C1__"/>
      <circle cx="44" cy="52" r="4.2" fill="__INK__"/>`,
  },
  {
    id: "26",
    world: "3 · Express & Parcels",
    name: "Doorstep Express Box Wing",
    badge: "Same-Day Dispatch",
    star: false,
    palette: PALETTES.vittalEmerald,
    wordmark: { style: "tightUpper", w1: "VITTAL", w2: "LIFESTYLE", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Crisp verified delivery parcel accented by twin aerodynamic motion trails — signals rapid, authenticated shipping right to your door.",
    markTpl: `
      <rect x="20" y="14" width="36" height="36" rx="8" fill="__INK__"/>
      <path d="M29 25H34.5L38 35.5L41.5 25H47L40.2 41H35.8L29 25Z" fill="__C3__"/>
      <rect x="6" y="21" width="11" height="4.2" rx="2.1" fill="__C1__"/>
      <rect x="9" y="30" width="8" height="4.2" rx="2.1" fill="__C1__"/>
      <rect x="5" y="39" width="12" height="4.2" rx="2.1" fill="__C3__"/>`,
  },
  {
    id: "27",
    world: "3 · Express & Parcels",
    name: "Orbital Same-Day Loop",
    badge: "360° Seamless Commerce",
    star: false,
    palette: PALETTES.cobaltExpress,
    wordmark: { style: "tight", w1: "Vittal", w2: "Lifestyle", font: "'Urbanist', 'Avenir Next', sans-serif" },
    rationale:
      "Continuous orbital express arrow encircling a crisp architectural V — represents fast delivery, hassle-free returns, and total buyer peace of mind.",
    markTpl: `
      <path d="${annularSector(32, 32, 26, 20.5, -50, 255)}" fill="__C1__"/>
      <path d="M45 9L56 17L44 23L45 9Z" fill="__C1__"/>
      <path d="M21 22H28L32 36L36 22H43L34.5 44H29.5L21 22Z" fill="__INK__"/>`,
  },
  {
    id: "28",
    world: "3 · Express & Parcels",
    name: "V-Folded Envelope Parcel",
    badge: "Minimalist Shipping",
    star: false,
    palette: PALETTES.editorialMono,
    wordmark: { style: "wideUpper", w1: "VITTAL", w2: "LIFESTYLE", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Architectural courier parcel whose crisp top fold forms an unmistakable luxury V — clean, flat, and effortlessly embossable on shipping mailers and invoices.",
    markTpl: `
      <rect x="8" y="14" width="48" height="36" rx="7" stroke="__INK__" stroke-width="4.4"/>
      <path d="M10 17L32 36L54 17" stroke="__INK__" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="32" cy="36" r="4" fill="__C3__"/>`,
  },
  {
    id: "29",
    world: "3 · Express & Parcels",
    name: "Kinetic Checkout Swish",
    badge: "★ 1-Tap Delight",
    star: true,
    palette: PALETTES.nykaaBerry,
    wordmark: { style: "lowercase", w1: "vittal", w2: "lifestyle", font: "'Plus Jakarta Sans', 'Avenir Next', sans-serif" },
    rationale:
      "Joyful variable-width kinetic swish dipping smoothly into a modern v and soaring skyward — captures frictionless checkout and unboxing excitement.",
    markTpl: `
      <path d="${p29_swish}" fill="__C1__"/>
      <path d="${astroidPath(33, 18, 9.5, 9.5, 0.22)}" fill="__INK__"/>`,
  },
  {
    id: "30",
    world: "3 · Express & Parcels",
    name: "Luxury Ribbon-Cross Parcel",
    badge: "Signature Gift Box",
    star: false,
    palette: PALETTES.cliqNavyGold,
    wordmark: { style: "serif", w1: "VITTAL", w2: "LIFESTYLE", font: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" },
    rationale:
      "Refined square presentation box quartered cleanly by a champagne-gold gift ribbon with a subtle V medallion at center — makes every order feel like a luxury gift.",
    markTpl: `
      <rect x="9" y="9" width="46" height="46" rx="9" fill="__INK__"/>
      <rect x="29" y="9" width="6" height="46" fill="__C1__"/>
      <rect x="9" y="29" width="46" height="6" fill="__C1__"/>
      <path d="M32 22L42 32L32 42L22 32L32 22Z" fill="__BG__"/>
      <path d="M27.5 28.5H30.5L32 34L33.5 28.5H36.5L33.2 37H30.8L27.5 28.5Z" fill="__INK__"/>`,
  },

  // =========================================================================
  // ARCHETYPE 4 (31–40): ICONIC APP-TILE MONOGRAMS (V / VL)
  // =========================================================================
  {
    id: "31",
    world: "4 · App-Tile Monograms",
    name: "Folded Multi-Brand Ribbon V",
    badge: "★ Myntra × Purplle Energy",
    star: true,
    palette: PALETTES.royalPlum,
    wordmark: { style: "tight", w1: "vittal", w2: "lifestyle", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Two sculptural overlapping dimensional ribbons folded cleanly into an unmistakable V — vibrant, expressive, and engineered to pop on smartphone home screens.",
    markTpl: `
      <path d="${p31_left}" fill="__INK__"/>
      <path d="${p31_right}" fill="__C1__"/>
      <circle cx="32" cy="17" r="4.2" fill="__C3__"/>`,
  },
  {
    id: "32",
    world: "4 · App-Tile Monograms",
    name: "Purplle-Class Playful v & Spark",
    badge: "★ Beauty & Lifestyle App",
    star: true,
    palette: PALETTES.royalPlum,
    wordmark: { style: "lowercase", w1: "vittal", w2: "lifestyle", font: "'Plus Jakarta Sans', 'Avenir Next', sans-serif" },
    rationale:
      "Friendly sculpted lowercase v with plump contemporary terminals paired with a floating 4-point beauty-marketplace sparkle — approachable, premium, and unforgettable.",
    markTpl: `
      <path d="M12 18L28 50L44 18" stroke="__C1__" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${astroidPath(50, 17, 9, 9, 0.22)}" fill="__INK__"/>`,
  },
  {
    id: "33",
    world: "4 · App-Tile Monograms",
    name: "Editorial Notched Serif V",
    badge: "★ Nykaa × Vogue App Tile",
    star: true,
    palette: PALETTES.nykaaBerry,
    wordmark: { style: "serif", w1: "VITTAL", w2: "LIFESTYLE", font: "'Playfair Display', Georgia, serif" },
    rationale:
      "High-contrast editorial V contrasting a monumental berry stroke against a poised hairline counter — effortless luxury beauty & fashion marketplace prestige.",
    markTpl: `
      <path d="M10 12H25L35 45L45 12H54L36.5 54H28.5L13 15H10V12Z" fill="__INK__"/>
      <rect x="41" y="12" width="13" height="2.8" fill="__INK__"/>
      <path d="M32 10L37 16L32 22L27 16L32 10Z" fill="__C1__"/>`,
  },
  {
    id: "34",
    world: "4 · App-Tile Monograms",
    name: "Squircle App-Icon V Window",
    badge: "★ Super-App Dock Tile",
    star: true,
    palette: PALETTES.amazonAmber,
    wordmark: { style: "tight", w1: "Vittal", w2: "Lifestyle", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Clean iOS-proportioned rounded squircle punching a razor-crisp geometric V with a warm amber confidence accent — zero clutter from 16px to billboard scale.",
    markTpl: `
      <path fill-rule="evenodd" clip-rule="evenodd" d="${roundedRectPath(7, 7, 50, 50, 14)} M17 18H26.5L32 36.5L37.5 18H47L36 47H28L17 18Z" fill="__INK__"/>
      <circle cx="32" cy="19" r="3.8" fill="__C1__"/>`,
  },
  {
    id: "35",
    world: "4 · App-Tile Monograms",
    name: "Interlocked VL Platform Tile",
    badge: "★ Clean Commerce Monogram",
    star: true,
    palette: PALETTES.editorialMono,
    wordmark: { style: "wideUpper", w1: "VITTAL", w2: "LIFESTYLE", font: "'Space Grotesk', 'Avenir Next', sans-serif" },
    rationale:
      "Architectural rounded square housing a tightly balanced VL monogram — crisp, neutral, and designed to coexist seamlessly with every global brand logo.",
    markTpl: `
      <rect x="7" y="7" width="50" height="50" rx="13" stroke="__INK__" stroke-width="4.2"/>
      <path d="M14 20H22L26 36L30 20H37.5L29 45H23L14 20Z" fill="__INK__"/>
      <path d="M39.5 20H46V39H51V45H39.5V20Z" fill="__C3__"/>`,
  },
  {
    id: "36",
    world: "4 · App-Tile Monograms",
    name: "Layered Brand-Sheets V",
    badge: "500+ Brands Curated",
    star: false,
    palette: PALETTES.cobaltExpress,
    wordmark: { style: "tight", w1: "Vittal", w2: "Lifestyle", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Three cascading layered V-chevrons stacked vertically — visually communicates deep multi-brand catalog breadth and effortless discovery.",
    markTpl: `
      <path d="M12 12H22L32 34L42 12H52L36 44H28L12 12Z" fill="__INK__"/>
      <path d="M18 33L32 54L46 33L39 33L32 44L25 33H18Z" fill="__C1__"/>
      <path d="M27 12H37L32 22L27 12Z" fill="__C3__"/>`,
  },
  {
    id: "37",
    world: "4 · App-Tile Monograms",
    name: "Split-Duotone App Badge V",
    badge: "Vibrant Home-Screen Tile",
    star: false,
    palette: PALETTES.velvetCoral,
    wordmark: { style: "lowercase", w1: "vittal", w2: "lifestyle", font: "'Plus Jakarta Sans', 'Avenir Next', sans-serif" },
    rationale:
      "Two crisp angled geometric capsules locking smoothly at base — clean, cheerful, and unmistakable at 20px app-notification size.",
    markTpl: `
      <line x1="15" y1="15" x2="29" y2="49" stroke="__INK__" stroke-width="11" stroke-linecap="round"/>
      <line x1="49" y1="15" x2="35" y2="49" stroke="__C1__" stroke-width="11" stroke-linecap="round"/>`,
  },
  {
    id: "38",
    world: "4 · App-Tile Monograms",
    name: "Calligraphic Brush v Tile",
    badge: "Editorial Beauty & Style",
    star: false,
    palette: PALETTES.nykaaBerry,
    wordmark: { style: "serif", w1: "VITTAL", w2: "LIFESTYLE", font: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" },
    rationale:
      "Fluid calligraphic lowercase v rendered with lush thick-to-thin stroke contrast — graceful, warm, and naturally suited to beauty, fashion, and gifting.",
    markTpl: `
      <path d="${p38_l}" fill="__INK__"/>
      <path d="${p38_r}" fill="__C1__"/>
      <circle cx="52" cy="14" r="3.4" fill="__C3__"/>`,
  },
  {
    id: "39",
    world: "4 · App-Tile Monograms",
    name: "Machined Pill-Toggle VL",
    badge: "Modern Commerce UI",
    star: false,
    palette: PALETTES.vittalEmerald,
    wordmark: { style: "lowercase", w1: "vittal", w2: "lifestyle", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Bold rounded-stroke V locked cleanly beside a verified emerald L bracket — feels native to modern shopping apps, delivery trackers, and fintech-grade checkout.",
    markTpl: `
      <path d="M9 17L21 47L33 17" stroke="__INK__" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M43 17V47H54" stroke="__C1__" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: "40",
    world: "4 · App-Tile Monograms",
    name: "Diamond-Cut Monolith V",
    badge: "★ Tata CLiQ Luxury Vibe",
    star: true,
    palette: PALETTES.cliqNavyGold,
    wordmark: { style: "wideUpper", w1: "VITTAL", w2: "LIFESTYLE", font: "'Urbanist', 'Avenir Next', sans-serif" },
    rationale:
      "Champagne-gold-accented V nested inside an architectural chamfered navy octagon — prestige flagship app tile for authentic luxury retail.",
    markTpl: `
      <path d="${roundPoly(regularPolyPoints(32, 32, 26, 8, -67.5, 3), 3)}" fill="__INK__"/>
      <path d="M19 20H27.5L32 36L36.5 20H45L35 46H29L19 20Z" fill="__BG__"/>
      <path d="M27.5 20H36.5L32 30L27.5 20Z" fill="__C1__"/>`,
  },

  // =========================================================================
  // ARCHETYPE 5 (41–50): MULTI-BRAND PRISM, MOSAIC & CURATED HUB
  // =========================================================================
  {
    id: "41",
    world: "5 · Multi-Brand Hub",
    name: "4-Department Curated Blossom",
    badge: "★ All-Categories Hub",
    star: true,
    palette: PALETTES.royalPlum,
    wordmark: { style: "tight", w1: "Vittal", w2: "Lifestyle", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Four sculpted petals converging symmetrically around a glowing authenticity diamond — represents Beauty, Fashion, Fitness, and Luxury united in one curated destination.",
    markTpl: `
      <rect x="24" y="7" width="16" height="22" rx="8" fill="__C1__"/>
      <rect x="24" y="35" width="16" height="22" rx="8" fill="__INK__"/>
      <rect x="7" y="24" width="22" height="16" rx="8" fill="__INK__"/>
      <rect x="35" y="24" width="22" height="16" rx="8" fill="__C3__"/>
      <path d="M32 25L39 32L32 39L25 32L32 25Z" fill="__BG__"/>`,
  },
  {
    id: "42",
    world: "5 · Multi-Brand Hub",
    name: "Multi-Brand Bento Grid V",
    badge: "★ Catalog Marketplace",
    star: true,
    palette: PALETTES.cobaltExpress,
    wordmark: { style: "tight", w1: "Vittal", w2: "Lifestyle", font: "'Space Grotesk', 'Avenir Next', sans-serif" },
    rationale:
      "Five clean modular marketplace tiles stepping gracefully into a sculptural V — immediately expresses curated departments, genuine brands, and modern UX.",
    markTpl: `
      <rect x="8" y="10" width="14" height="14" rx="4" fill="__INK__"/>
      <rect x="42" y="10" width="14" height="14" rx="4" fill="__C1__"/>
      <rect x="15" y="27" width="14" height="14" rx="4" fill="__C1__"/>
      <rect x="35" y="27" width="14" height="14" rx="4" fill="__C3__"/>
      <rect x="25" y="44" width="14" height="14" rx="4" fill="__INK__"/>`,
  },
  {
    id: "43",
    world: "5 · Multi-Brand Hub",
    name: "Fanned Brand Lookbook Cards",
    badge: "★ Curated Brand Deck",
    star: true,
    palette: PALETTES.nykaaBerry,
    wordmark: { style: "wideUpper", w1: "VITTAL", w2: "LIFESTYLE", font: "'Urbanist', 'Avenir Next', sans-serif" },
    rationale:
      "Three crisp fanned lookbook cards blooming into an expressive upward V — captures browsing authentic multi-brand collections and gift cards.",
    markTpl: `
      <g transform="translate(22 35) rotate(-22)">
        <rect x="-9" y="-19" width="18" height="36" rx="5" fill="__C3__"/>
      </g>
      <g transform="translate(42 35) rotate(22)">
        <rect x="-9" y="-19" width="18" height="36" rx="5" fill="__C1__"/>
      </g>
      <rect x="23" y="14" width="18" height="36" rx="5" fill="__INK__" stroke="__BG__" stroke-width="2.4"/>
      <path d="M27.5 24H30.8L32 31L33.2 24H36.5L33.5 36H30.5L27.5 24Z" fill="__BG__"/>`,
  },
  {
    id: "44",
    world: "5 · Multi-Brand Hub",
    name: "Curated Faceted Brand Prism",
    badge: "Luxury Showcase Prism",
    star: false,
    palette: PALETTES.cliqNavyGold,
    wordmark: { style: "wideUpper", w1: "VITTAL", w2: "LIFESTYLE", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Precision multi-faceted V-prism split cleanly into navy, gold, and champagne planes — symbolizes diverse authentic luxury categories refracted through one platform.",
    markTpl: `
      <path d="M8 14H28L32 54L8 14Z" fill="__INK__"/>
      <path d="M56 14H36L32 54L56 14Z" fill="__C1__"/>
      <path d="M25 14H39L32 34L25 14Z" fill="__C3__"/>`,
  },
  {
    id: "45",
    world: "5 · Multi-Brand Hub",
    name: "Flagship Department Arcade",
    badge: "Selfridges × Harrods Vibe",
    star: false,
    palette: PALETTES.editorialMono,
    wordmark: { style: "serif", w1: "VITTAL", w2: "LIFESTYLE", font: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" },
    rationale:
      "Three refined architectural gallery arches side by side — echoes iconic global department-store facades housing the world's finest original brands.",
    markTpl: `
      <path d="M8 52V28A7 7 0 0 1 22 28V52H8Z" fill="__C3__"/>
      <path d="M24 52V20A8 8 0 0 1 40 20V52H24Z" fill="__INK__"/>
      <path d="M42 52V28A7 7 0 0 1 56 28V52H42Z" fill="__C3__"/>
      <rect x="6" y="54" width="52" height="3.2" rx="1.6" fill="__INK__"/>`,
  },
  {
    id: "46",
    world: "5 · Multi-Brand Hub",
    name: "Woven Marketplace Basket",
    badge: "Unified Cart Weave",
    star: false,
    palette: PALETTES.velvetCoral,
    wordmark: { style: "tight", w1: "Vittal", w2: "Lifestyle", font: "'Plus Jakarta Sans', 'Avenir Next', sans-serif" },
    rationale:
      "Crisp architectural basket weave formed from four rounded interlocked bars — embodies bringing authentic lifestyle goods cleanly together in one cart.",
    markTpl: `
      <rect x="10" y="18" width="44" height="10" rx="5" fill="__INK__"/>
      <rect x="10" y="36" width="44" height="10" rx="5" fill="__C1__"/>
      <rect x="18" y="10" width="10" height="44" rx="5" fill="__C1__" stroke="__BG__" stroke-width="2.2"/>
      <rect x="36" y="10" width="10" height="44" rx="5" fill="__INK__" stroke="__BG__" stroke-width="2.2"/>`,
  },
  {
    id: "47",
    world: "5 · Multi-Brand Hub",
    name: "6-Category Super-Hub Asterisk",
    badge: "Everything Original",
    star: false,
    palette: PALETTES.amazonAmber,
    wordmark: { style: "lowercase", w1: "vittal", w2: "lifestyle", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Bold geometric 6-spoke commerce hub radiating cleanly from a warm amber center — iconic multi-category clarity built for massive SKU breadth.",
    markTpl: `
      <line x1="32" y1="10" x2="32" y2="54" stroke="__INK__" stroke-width="8.5" stroke-linecap="round"/>
      <line x1="13" y1="21" x2="51" y2="43" stroke="__INK__" stroke-width="8.5" stroke-linecap="round"/>
      <line x1="51" y1="21" x2="13" y2="43" stroke="__INK__" stroke-width="8.5" stroke-linecap="round"/>
      <circle cx="32" cy="32" r="7.5" fill="__C1__"/>`,
  },
  {
    id: "48",
    world: "5 · Multi-Brand Hub",
    name: "Boutique Awning Storefront",
    badge: "Trusted Online Store",
    star: false,
    palette: PALETTES.vittalEmerald,
    wordmark: { style: "tight", w1: "Vittal", w2: "Lifestyle", font: "'Urbanist', 'Avenir Next', sans-serif" },
    rationale:
      "Minimalist scalloped boutique awning crowning a clean architectural storefront with an emerald V entrance — friendly, inviting, and unmistakably retail.",
    markTpl: `
      <path d="M9 22C9 15 15 11 22 11H42C49 11 55 15 55 22V25A6 6 0 0 1 43 25A6 6 0 0 1 32 25A6 6 0 0 1 21 25A6 6 0 0 1 9 25V22Z" fill="__C1__"/>
      <path d="M13 33H51V53H13V33Z" stroke="__INK__" stroke-width="4" stroke-linejoin="round"/>
      <path d="M24 38H29L32 46L35 38H40L34 50H30L24 38Z" fill="__INK__"/>`,
  },
  {
    id: "49",
    world: "5 · Multi-Brand Hub",
    name: "Curated Showcase Shelves V",
    badge: "Editorial Merchandising",
    star: false,
    palette: PALETTES.editorialMono,
    wordmark: { style: "wideUpper", w1: "VITTAL", w2: "LIFESTYLE", font: "'Space Grotesk', 'Avenir Next', sans-serif" },
    rationale:
      "Three nested stepped luxury display pedestals converging into an architectural chevron showcase — communicates thoughtful curation over chaotic discount clutter.",
    markTpl: `
      <path d="M8 14H20L32 34L44 14H56L36 46H28L8 14Z" fill="__INK__"/>
      <rect x="14" y="50" width="36" height="5" rx="2.5" fill="__C3__"/>
      <rect x="24" y="14" width="16" height="6" rx="3" fill="__C3__"/>`,
  },
  {
    id: "50",
    world: "5 · Multi-Brand Hub",
    name: "Kaleidoscope Brand Vault",
    badge: "★ Curated Luxury Vault",
    star: true,
    palette: PALETTES.royalPlum,
    wordmark: { style: "wideUpper", w1: "VITTAL", w2: "LIFESTYLE", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Four crisp inward-pointing gallery chevrons framing a radiant authenticity jewel — conveys a curated vault of the world's finest authentic brands.",
    markTpl: `
      <path d="M19 10H45L32 23L19 10Z" fill="__C1__"/>
      <path d="M19 54H45L32 41L19 54Z" fill="__INK__"/>
      <path d="M10 19V45L23 32L10 19Z" fill="__INK__"/>
      <path d="M54 19V45L41 32L54 19Z" fill="__C3__"/>
      <path d="M32 26L38 32L32 38L26 32L32 26Z" fill="__C1__"/>`,
  },

  // =========================================================================
  // ARCHETYPE 6 (51–60): LUXURY DEPARTMENT & EDITORIAL HOUSES
  // =========================================================================
  {
    id: "51",
    world: "6 · Luxury & Editorial",
    name: "Flagship Boutique Hang-Tag V",
    badge: "★ Authentic Retail Tag",
    star: true,
    palette: PALETTES.editorialMono,
    wordmark: { style: "wideUpper", w1: "VITTAL", w2: "LIFESTYLE", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Crisp angled luxury retail garment/product hang-tag with a precision punched eyelet and clean V — unmistakable sign of authentic brand-new retail merchandise.",
    markTpl: `
      <g transform="rotate(-14 32 32)">
        <path fill-rule="evenodd" clip-rule="evenodd" d="${roundPoly([[19, 14, 3], [32, 6, 3], [45, 14, 3], [45, 56, 5], [19, 56, 5]], 3.5)} ${circlePath(32, 16, 3.2)}" fill="__INK__"/>
        <path d="M24 27H29.2L32 38L34.8 27H40L34 45H30L24 27Z" fill="__BG__"/>
        <rect x="24" y="48" width="16" height="2.6" rx="1.3" fill="__C3__"/>
      </g>`,
  },
  {
    id: "52",
    world: "6 · Luxury & Editorial",
    name: "Mirrored VV Maison Portal",
    badge: "★ Farfetch × Tata CLiQ",
    star: true,
    palette: PALETTES.cliqNavyGold,
    wordmark: { style: "serif", w1: "VITTAL", w2: "LIFESTYLE", font: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" },
    rationale:
      "Architectural double-V maison crest uniting luxury restraint with modern geometric symmetry — feels effortless beside Dior, Omega, and Chanel.",
    markTpl: `
      <path d="M10 14H20L32 45L44 14H54L36 53H28L10 14Z" fill="__INK__"/>
      <path d="M21 14H28.5L32 25L35.5 14H43L34.5 34H29.5L21 14Z" fill="__C1__"/>`,
  },
  {
    id: "53",
    world: "6 · Luxury & Editorial",
    name: "Framed Storefront Showcase V",
    badge: "★ SSENSE Editorial Frame",
    star: true,
    palette: PALETTES.editorialMono,
    wordmark: { style: "wideUpper", w1: "VITTAL", w2: "LIFESTYLE", font: "'Urbanist', 'Avenir Next', sans-serif" },
    rationale:
      "Minimalist architectural storefront showcase frame broken cleanly at the top by a bold geometric V — pure museum-gallery elegance for luxury e-commerce.",
    markTpl: `
      <path d="M17 12H11V53H53V12H47" stroke="__INK__" stroke-width="4" stroke-linecap="square"/>
      <path d="M20 12H28L32 31L36 12H44L35 42H29L20 12Z" fill="__INK__"/>
      <rect x="22" y="45" width="20" height="2.8" fill="__C3__"/>`,
  },
  {
    id: "54",
    world: "6 · Luxury & Editorial",
    name: "Boutique Hanger-Curve V",
    badge: "Curated Fashion House",
    star: false,
    palette: PALETTES.velvetCoral,
    wordmark: { style: "serif", w1: "VITTAL", w2: "LIFESTYLE", font: "'Playfair Display', Georgia, serif" },
    rationale:
      "Graceful continuous boutique curve evoking a sculpted fashion hanger balanced above a subtle coral accent — warm editorial clarity for curated apparel.",
    markTpl: `
      <path d="M32 19C32 14 36 11 36 15C36 18 32 20 32 23" stroke="__C1__" stroke-width="4" stroke-linecap="round"/>
      <path d="M32 23L55 41C57 42.6 56 46 53 46H11C8 46 7 42.6 9 41L32 23Z" stroke="__INK__" stroke-width="4.4" stroke-linejoin="round"/>
      <rect x="22" y="51" width="20" height="3.2" rx="1.6" fill="__C1__"/>`,
  },
  {
    id: "55",
    world: "6 · Luxury & Editorial",
    name: "Keystone Flagship Archway",
    badge: "Luxury Retail Gateway",
    star: false,
    palette: PALETTES.cliqNavyGold,
    wordmark: { style: "serif", w1: "VITTAL", w2: "LIFESTYLE", font: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" },
    rationale:
      "Monumental luxury archway crowned with a champagne-gold keystone V — evokes stepping through the doors of an exclusive global department store.",
    markTpl: `
      <path d="M13 54V28A19 19 0 0 1 51 28V54H42V28A10 10 0 0 0 22 28V54H13Z" fill="__INK__"/>
      <path d="M25 26H30L32 34L34 26H39L33.8 41H30.2L25 26Z" fill="__C1__"/>
      <rect x="10" y="54" width="44" height="3.4" rx="1.7" fill="__C1__"/>`,
  },
  {
    id: "56",
    world: "6 · Luxury & Editorial",
    name: "Editorial Box Stamp VITTAL",
    badge: "★ Streetwear & Luxury Box",
    star: true,
    palette: PALETTES.editorialMono,
    wordmark: { style: "wideUpper", w1: "VITTAL", w2: "LIFESTYLE", font: "'Space Grotesk', 'Avenir Next', sans-serif" },
    rationale:
      "Ultra-clean architectural box nameplate housing bold tracked VITTAL with a precision corner chamfer — looks iconic on shipping tape, bags, and storefront headers.",
    markTpl: `
      <path d="${roundPoly([[5, 17, 4], [59, 17, 4], [59, 41, 4], [52, 47, 3], [5, 47, 4]], 3)}" fill="__INK__"/>
      <text x="32" y="35.6" text-anchor="middle" font-family="Avenir Next, Helvetica Neue, sans-serif" font-weight="900" font-size="10.2" letter-spacing="1.2" fill="__BG__">VITTAL</text>`,
  },
  {
    id: "57",
    world: "6 · Luxury & Editorial",
    name: "Twin-Pillar Gallery Monogram",
    badge: "Department House Crest",
    star: false,
    palette: PALETTES.cliqNavyGold,
    wordmark: { style: "wideUpper", w1: "VITTAL", w2: "LIFESTYLE", font: "'Urbanist', 'Avenir Next', sans-serif" },
    rationale:
      "Two poised architectural vertical pillars framing a floating champagne-gold V chevron — disciplined quiet luxury built for a multi-decade retail house.",
    markTpl: `
      <rect x="10" y="11" width="8" height="42" rx="4" fill="__INK__"/>
      <rect x="46" y="11" width="8" height="42" rx="4" fill="__INK__"/>
      <path d="M21 20H28L32 34L36 20H43L34.5 44H29.5L21 20Z" fill="__C1__"/>`,
  },
  {
    id: "58",
    world: "6 · Luxury & Editorial",
    name: "Boutique Price-Seal Tag",
    badge: "Original Brand Tag",
    star: false,
    palette: PALETTES.nykaaBerry,
    wordmark: { style: "tight", w1: "Vittal", w2: "Lifestyle", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Crisp vertical boutique hang-tag with beveled luxury shoulders, punched eyelet ring, and a vibrant berry accent stripe — authentic retail elegance.",
    markTpl: `
      <path fill-rule="evenodd" clip-rule="evenodd" d="${roundPoly([[22, 9, 3], [42, 9, 3], [50, 19, 4], [50, 55, 6], [14, 55, 6], [14, 19, 4]], 4)} ${circlePath(32, 18, 3.6)}" fill="__INK__"/>
      <path d="M23 28H28.5L32 39L35.5 28H41L34 45H30L23 28Z" fill="__BG__"/>
      <rect x="20" y="48" width="24" height="3.2" rx="1.6" fill="__C1__"/>`,
  },
  {
    id: "59",
    world: "6 · Luxury & Editorial",
    name: "Diagonal Showcase Window",
    badge: "Modern Digital Flagship",
    star: false,
    palette: PALETTES.cobaltExpress,
    wordmark: { style: "tightUpper", w1: "VITTAL", w2: "LIFESTYLE", font: "'Space Grotesk', 'Avenir Next', sans-serif" },
    rationale:
      "Sheared modern storefront window framing a sharp kinetic V showcase — projects forward-looking digital commerce velocity.",
    markTpl: `
      <path d="${roundPoly([[16, 11, 5], [56, 11, 5], [48, 53, 5], [8, 53, 5]], 5)}" stroke="__INK__" stroke-width="4.4"/>
      <path d="M22 21H29.5L32 36L38 21H45.5L35.5 44H29.5L22 21Z" fill="__C1__"/>`,
  },
  {
    id: "60",
    world: "6 · Luxury & Editorial",
    name: "Couture Diamond Plinth V",
    badge: "Fine Luxury Marketplace",
    star: false,
    palette: PALETTES.editorialMono,
    wordmark: { style: "serif", w1: "VITTAL", w2: "LIFESTYLE", font: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" },
    rationale:
      "Razor-clean rotated diamond showcase frame enclosing a balanced architectural V — museum-grade neutrality beside every heritage designer house.",
    markTpl: `
      <path d="M32 6L58 32L32 58L6 32L32 6Z" stroke="__INK__" stroke-width="3.4"/>
      <path d="M22 23H28.5L32 36L35.5 23H42L34.5 43H29.5L22 23Z" fill="__INK__"/>
      <circle cx="32" cy="14" r="2.4" fill="__C3__"/>`,
  },

  // =========================================================================
  // ARCHETYPE 7 (61–70): BEAUTY, FASHION & GIFTING DELIGHT
  // =========================================================================
  {
    id: "61",
    world: "7 · Beauty & Gifting",
    name: "Purplle-Class Radiance Sparkle V",
    badge: "★ Beauty Marketplace Hero",
    star: true,
    palette: PALETTES.royalPlum,
    wordmark: { style: "lowercase", w1: "vittal", w2: "lifestyle", font: "'Plus Jakarta Sans', 'Avenir Next', sans-serif" },
    rationale:
      "Sculpted modern V cradling a luminous 4-point beauty-commerce sparkle in its apex — captures Purplle/Tira/Sephora glow across skincare, cosmetics, and fashion.",
    markTpl: `
      <path d="M10 17H21L32 45L43 17H54L36.5 55H27.5L10 17Z" fill="__INK__"/>
      <path d="${astroidPath(32, 18, 12, 12, 0.22)}" fill="__C1__"/>`,
  },
  {
    id: "62",
    world: "7 · Beauty & Gifting",
    name: "Silk Ribbon Gift-Box Bow",
    badge: "★ Luxury Unboxing Gift",
    star: true,
    palette: PALETTES.nykaaBerry,
    wordmark: { style: "tight", w1: "Vittal", w2: "Lifestyle", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Refined modern gift box topped with a variable-width silk bow — celebrates the excitement of gifting and receiving authentic luxury brands.",
    markTpl: `
      <path d="${p62_bowL}" fill="__C1__"/>
      <path d="${p62_bowR}" fill="__C1__"/>
      <rect x="11" y="23" width="42" height="9" rx="3.5" fill="__INK__"/>
      <rect x="14" y="34" width="36" height="21" rx="5" fill="__INK__"/>
      <rect x="29" y="23" width="6" height="32" fill="__C1__"/>`,
  },
  {
    id: "63",
    world: "7 · Beauty & Gifting",
    name: "Heart-Fusion Shopping Bag",
    badge: "★ Brands You Love",
    star: true,
    palette: PALETTES.nykaaBerry,
    wordmark: { style: "lowercase", w1: "vittal", w2: "lifestyle", font: "'Urbanist', 'Avenir Next', sans-serif" },
    rationale:
      "Warm modern shopping bag punched with a crisp minimal heart emblem — symbolizes wishlist delight and genuine love for original lifestyle brands.",
    markTpl: `
      <path d="M22 21V15A10 10 0 0 1 42 15V21" stroke="__INK__" stroke-width="4.2" stroke-linecap="round"/>
      <path d="${roundPoly([[11, 20, 5], [53, 20, 5], [56, 54, 8], [8, 54, 8]], 6)}" fill="__C1__"/>
      <path d="M32 45C32 45 20 38 20 31.5C20 28 22.8 25.5 26 25.5C28.4 25.5 30.6 27 32 29.2C33.4 27 35.6 25.5 38 25.5C41.2 25.5 44 28 44 31.5C44 38 32 45 32 45Z" fill="__ONC1__"/>`,
  },
  {
    id: "64",
    world: "7 · Beauty & Gifting",
    name: "Royal Shopper Crown-V",
    badge: "★ VIP Member Royalty",
    star: true,
    palette: PALETTES.royalPlum,
    wordmark: { style: "wideUpper", w1: "VITTAL", w2: "LIFESTYLE", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Clean geometric 3-peak crown floating above a bold architectural V — promises VIP authenticity, curated luxury treatment, and royal shopper care.",
    markTpl: `
      <path d="M18 23L20 11L27 17L32 9L37 17L44 11L46 23H18Z" fill="__C1__"/>
      <path d="M13 27H23L32 46L41 27H51L36 55H28L13 27Z" fill="__INK__"/>`,
  },
  {
    id: "65",
    world: "7 · Beauty & Gifting",
    name: "Vanity Mirror Oval V",
    badge: "Skincare & Fragrance",
    star: false,
    palette: PALETTES.velvetCoral,
    wordmark: { style: "serif", w1: "VITTAL", w2: "LIFESTYLE", font: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" },
    rationale:
      "Graceful architectural vertical oval frame housing a crisp V and luminous beauty spark — crafted for authentic skincare, cosmetics, and personal care.",
    markTpl: `
      <rect x="13" y="8" width="38" height="48" rx="19" stroke="__INK__" stroke-width="4.2"/>
      <path d="M22 22H28L32 36L36 22H42L34.5 44H29.5L22 22Z" fill="__INK__"/>
      <path d="${astroidPath(45, 16, 6.5, 6.5, 0.22)}" fill="__C1__"/>`,
  },
  {
    id: "66",
    world: "7 · Beauty & Gifting",
    name: "Tri-Sparkle Beauty Star",
    badge: "Glow & Discovery",
    star: false,
    palette: PALETTES.royalPlum,
    wordmark: { style: "lowercase", w1: "vittal", w2: "lifestyle", font: "'Plus Jakarta Sans', 'Avenir Next', sans-serif" },
    rationale:
      "Luminous primary 4-point beauty star accompanied by two delicate orbiting sparkles — pure contemporary prestige for beauty, fragrance, and gifting.",
    markTpl: `
      <path d="${astroidPath(28, 34, 21, 21, 0.2)}" fill="__C1__"/>
      <path d="${astroidPath(49, 17, 9, 9, 0.22)}" fill="__INK__"/>
      <path d="${astroidPath(51, 45, 6, 6, 0.24)}" fill="__C3__"/>`,
  },
  {
    id: "67",
    world: "7 · Beauty & Gifting",
    name: "Faceted Perfume-Cut Jewel",
    badge: "Fragrance & Luxury",
    star: false,
    palette: PALETTES.cliqNavyGold,
    wordmark: { style: "serif", w1: "VITTAL", w2: "LIFESTYLE", font: "'Playfair Display', Georgia, serif" },
    rationale:
      "Minimalist architectural perfume-flacon / emerald-cut jewel silhouette capped in champagne gold — signals authentic luxury fragrance and gifting.",
    markTpl: `
      <rect x="25" y="9" width="14" height="9" rx="2.5" fill="__C1__"/>
      <rect x="28" y="18" width="8" height="4" fill="__C3__"/>
      <path d="${roundPoly([[17, 22, 4], [47, 22, 4], [52, 29, 4], [52, 50, 5], [46, 56, 4], [18, 56, 4], [12, 50, 5], [12, 29, 4]], 4)}" fill="__INK__"/>
      <path d="M24 31H29L32 41L35 31H40L34 47H30L24 31Z" fill="__BG__"/>`,
  },
  {
    id: "68",
    world: "7 · Beauty & Gifting",
    name: "Velvet Ribbon Infinity Bow",
    badge: "Celebration & Couture",
    star: false,
    palette: PALETTES.velvetCoral,
    wordmark: { style: "serif", w1: "VITTAL", w2: "LIFESTYLE", font: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" },
    rationale:
      "Graceful symmetrical variable-width silk ribbon knotted around a warm coral center — timeless gifting elegance for luxury boxes and boutique wrap.",
    markTpl: `
      <path d="${p68_l}" fill="__INK__"/>
      <path d="${p68_r}" fill="__C1__"/>
      <circle cx="32" cy="32" r="4.2" fill="__C3__"/>`,
  },
  {
    id: "69",
    world: "7 · Beauty & Gifting",
    name: "Blooming Lotus-Star Hub",
    badge: "Clean Beauty & Wellness",
    star: false,
    palette: PALETTES.vittalEmerald,
    wordmark: { style: "lowercase", w1: "vittal", w2: "lifestyle", font: "'Urbanist', 'Avenir Next', sans-serif" },
    rationale:
      "Three symmetrical sculpted petals rising calmly above a grounding plinth — communicates clean beauty, organic nutrition, and authentic wellness brands.",
    markTpl: `
      <path d="${p69_l}" fill="__INK__"/>
      <path d="${p69_r}" fill="__INK__"/>
      <path d="${p69_c}" fill="__C1__"/>
      <rect x="16" y="52" width="32" height="4.2" rx="2.1" fill="__INK__"/>`,
  },
  {
    id: "70",
    world: "7 · Beauty & Gifting",
    name: "Crescent Glow Boutique",
    badge: "Evening Luxury & Care",
    star: false,
    palette: PALETTES.cliqNavyGold,
    wordmark: { style: "wideUpper", w1: "VITTAL", w2: "LIFESTYLE", font: "'Urbanist', 'Avenir Next', sans-serif" },
    rationale:
      "Refined architectural crescent arc cradling a radiant champagne-gold star — effortless prestige across luxury personal care, fragrances, and gifting.",
    markTpl: `
      <path d="${annularSector(32, 32, 24, 15, 55, 295)}" fill="__INK__"/>
      <path d="${astroidPath(43, 25, 11, 11, 0.22)}" fill="__C1__"/>`,
  },

  // =========================================================================
  // ARCHETYPE 8 (71–80): FLAGSHIP SUPER-APP & PLATFORM MASTER MARKS
  // =========================================================================
  {
    id: "71",
    world: "8 · Flagship Platform Masters",
    name: "The Vittal Verified Smile-V",
    badge: "★ Amazon-Grade Flagship",
    star: true,
    palette: PALETTES.amazonAmber,
    wordmark: { style: "lowercase", w1: "vittal", w2: "lifestyle", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Flagship mass-trust identity: a razor-clean verified V-check underscored by a warm tactile commerce smile — engineered for 100% original multi-brand dominance.",
    markTpl: `
      <path d="M15 19L27 38L49 12" stroke="__INK__" stroke-width="7.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${p71_smile}" fill="__C1__"/>
      <path d="M49 44L56 46L52.5 53" stroke="__C1__" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: "72",
    world: "8 · Flagship Platform Masters",
    name: "Royal Plum Bag-Check Master",
    badge: "★ Purplle × Authentic #1",
    star: true,
    palette: PALETTES.royalPlum,
    wordmark: { style: "tight", w1: "vittal", w2: "lifestyle", font: "'Plus Jakarta Sans', 'Avenir Next', sans-serif" },
    rationale:
      "Vibrant Purplle-class rounded shopping bag with a luminous arched handle and bold true-alpha V-check — simultaneously says Beauty, Lifestyle, Shopping, and 100% Original.",
    markTpl: `
      <path d="M22 21V15A10 10 0 0 1 42 15V21" stroke="__INK__" stroke-width="4.6" stroke-linecap="round"/>
      <path d="${roundPoly([[10, 20, 6], [54, 20, 6], [56, 54, 9], [8, 54, 9]], 7)}" fill="__C1__"/>
      <path d="M20 35L28.5 44L45 27" stroke="__ONC1__" stroke-width="5.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: "73",
    world: "8 · Flagship Platform Masters",
    name: "Unfolded Luxury Parcel V",
    badge: "★ Doorstep Unboxing Hero",
    star: true,
    palette: PALETTES.amazonAmber,
    wordmark: { style: "tightUpper", w1: "VITTAL", w2: "LIFESTYLE", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Precision architectural shipping cube opening cleanly upward to reveal a luminous golden V — iconic on corrugated boxes, shipping tape, and app notifications.",
    markTpl: `
      <path d="M10 28L32 40V58L10 46V28Z" fill="__INK__"/>
      <path d="M54 28L32 40V58L54 46V28Z" fill="__C3__"/>
      <path d="M10 28L32 16L54 28L32 40L10 28Z" stroke="__C1__" stroke-width="2.2" fill="__INK__" fill-opacity="0.14"/>
      <path d="M18 9H26.5L32 25.5L37.5 9H46L35.5 34.5H28.5L18 9Z" fill="__C1__"/>`,
  },
  {
    id: "74",
    world: "8 · Flagship Platform Masters",
    name: "Vittal Prime Authenticity Seal",
    badge: "★ 100% Original Standard",
    star: true,
    palette: PALETTES.vittalEmerald,
    wordmark: { style: "tight", w1: "Vittal", w2: "Lifestyle", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Crisp 10-scallop verified marketplace badge housing a high-contrast inner seal and ascending emerald V-check — gold standard for zero-counterfeit trust.",
    markTpl: `
      <path d="${scallopSealPath(32, 32, 25, 2.3, 10, 140)}" fill="__INK__"/>
      <circle cx="32" cy="32" r="18.5" fill="__C1__"/>
      <path d="M22 33L29 40.5L43 25" stroke="__ONC1__" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: "75",
    world: "8 · Flagship Platform Masters",
    name: "Multi-Brand Curated Ribbon V",
    badge: "★ Vibrant Multi-Category",
    star: true,
    palette: PALETTES.nykaaBerry,
    wordmark: { style: "tight", w1: "Vittal", w2: "Lifestyle", font: "'Urbanist', 'Avenir Next', sans-serif" },
    rationale:
      "Three cascading variable-width luxury ribbons interwoven into an iconic V — symbolizes beauty, fashion, fitness, and lifestyle brands united in one trusted platform.",
    markTpl: `
      <path d="${p75_a}" fill="__INK__"/>
      <path d="${p75_b}" fill="__C1__"/>
      <path d="${p75_c}" fill="__C3__"/>`,
  },
  {
    id: "76",
    world: "8 · Flagship Platform Masters",
    name: "Flagship App-Tile Monolith V",
    badge: "★ iOS / Android #1 Icon",
    star: true,
    palette: PALETTES.royalPlum,
    wordmark: { style: "lowercase", w1: "vittal", w2: "lifestyle", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "Built first for smartphone docks: a plush rounded Royal Plum squircle showcasing a crisp luminous V crowned by a 4-point beauty-lifestyle sparkle.",
    markTpl: `
      <rect x="7" y="7" width="50" height="50" rx="15" fill="__C1__"/>
      <path d="M18 22H26.5L32 38.5L37.5 22H46L35.5 47H28.5L18 22Z" fill="__ONC1__"/>
      <path d="${astroidPath(32, 16.5, 6.8, 6.8, 0.22)}" fill="__C3__"/>`,
  },
  {
    id: "77",
    world: "8 · Flagship Platform Masters",
    name: "Original Retail Tag & Check",
    badge: "★ Authentic Brands Seal",
    star: true,
    palette: PALETTES.vittalEmerald,
    wordmark: { style: "tightUpper", w1: "VITTAL", w2: "LIFESTYLE", font: "'Space Grotesk', 'Avenir Next', sans-serif" },
    rationale:
      "Crisp tilted retail price-tag merged seamlessly with a vibrant emerald verification check — communicates original sealed brand-new goods at a glance.",
    markTpl: `
      <g transform="rotate(-12 32 32)">
        <path fill-rule="evenodd" clip-rule="evenodd" d="${roundPoly([[18, 15, 3], [32, 6, 3], [46, 15, 3], [46, 56, 6], [18, 56, 6]], 4)} ${circlePath(32, 16, 3.2)}" fill="__INK__"/>
        <path d="M23 36L30 43L42 29" stroke="__C3__" stroke-width="4.8" stroke-linecap="round" stroke-linejoin="round"/>
      </g>`,
  },
  {
    id: "78",
    world: "8 · Flagship Platform Masters",
    name: "Express Doorstep Horizon Parcel",
    badge: "★ Fast Super-App Delivery",
    star: true,
    palette: PALETTES.cobaltExpress,
    wordmark: { style: "tight", w1: "Vittal", w2: "Lifestyle", font: "'Plus Jakarta Sans', 'Avenir Next', sans-serif" },
    rationale:
      "Minimalist delivery parcel gliding smoothly over a kinetic express horizon curve — clean, modern, and built for nationwide rapid fulfillment.",
    markTpl: `
      <rect x="16" y="10" width="32" height="30" rx="7" fill="__INK__"/>
      <path d="M23 18H28.5L32 28.5L35.5 18H41L34.2 34H29.8L23 18Z" fill="__BG__"/>
      <path d="${p78_arc}" fill="__C1__"/>
      <circle cx="54" cy="39" r="3.4" fill="__C3__"/>`,
  },
  {
    id: "79",
    world: "8 · Flagship Platform Masters",
    name: "Maison Marketplace Portal",
    badge: "★ Luxury Multi-Brand House",
    star: true,
    palette: PALETTES.cliqNavyGold,
    wordmark: { style: "serif", w1: "VITTAL", w2: "LIFESTYLE", font: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" },
    rationale:
      "Architectural double-framed flagship portal housing a poised champagne-gold V — Farfetch and Tata CLiQ Luxury stature for curated global brands.",
    markTpl: `
      <path d="M12 54V26A20 20 0 0 1 52 26V54" stroke="__INK__" stroke-width="4" stroke-linecap="round"/>
      <path d="M18 54V26A14 14 0 0 1 46 26V54" stroke="__C1__" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M23 25H28.8L32 37.5L35.2 25H41L34.2 45H29.8L23 25Z" fill="__INK__"/>
      <circle cx="32" cy="18" r="2.6" fill="__C1__"/>`,
  },
  {
    id: "80",
    world: "8 · Flagship Platform Masters",
    name: "Vittal Sovereign Marketplace Master",
    badge: "★ Creative Director #1",
    star: true,
    palette: PALETTES.royalPlum,
    wordmark: { style: "tight", w1: "vittal", w2: "lifestyle", font: "'Manrope', 'Avenir Next', sans-serif" },
    rationale:
      "The definitive flagship mark: a sculpted luxury shopping bag silhouette fused seamlessly with a variable-width verified V-check and radiant authenticity spark — dominates app icons, delivery boxes, shopping bags, and search headers alike.",
    markTpl: `
      <path d="M22 21V15A10 10 0 0 1 42 15V21" stroke="__C1__" stroke-width="4.4" stroke-linecap="round"/>
      <path d="${roundPoly([[10, 20, 6], [54, 20, 6], [56, 55, 10], [8, 55, 10]], 7)}" fill="__INK__"/>
      <path d="${p80_checkL}" fill="__C3__"/>
      <path d="${p80_checkR}" fill="__C1__"/>
      <path d="${astroidPath(51, 13, 8.2, 8.2, 0.22)}" fill="__C1__"/>`,
  },
];

if (LOGOS.length !== 80) {
  throw new Error(`Expected exactly 80 logos, got ${LOGOS.length}`);
}

// ---------------------------------------------------------------------------
// SVG Builders (Standalone Mark + Light Lockup + Dark Lockup)
// ---------------------------------------------------------------------------

function buildMarkSvg(logo, isDark = false) {
  const inner = applyTokens(logo.markTpl, logo.palette, isDark).trim();
  const label = escapeXml(`#${logo.id} ${logo.name} — Vittal Lifestyle`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 64 64" fill="none" role="img" aria-label="${label}">${inner}</svg>`;
}

function buildWordmarkSvgEl(logo, isDark) {
  const pal = logo.palette;
  const ink = isDark ? pal.inkD : pal.inkL;
  const isMono = pal.c1 === "#111114";
  const accent = isDark && isMono ? "#D4D4D8" : pal.c1;
  const muted = isDark ? "#A1A1AA" : "#64646C";
  const wm = logo.wordmark;
  const ff = wm.font;

  switch (wm.style) {
    case "tightUpper":
      return (
        `<text x="88" y="47" font-family="${ff}" font-weight="800" font-size="34" letter-spacing="1.6" fill="${ink}">${wm.w1}</text>` +
        `<text x="89" y="65" font-family="'Manrope', 'Avenir Next', sans-serif" font-weight="600" font-size="10.5" letter-spacing="6.8" fill="${accent}">${wm.w2}</text>`
      );
    case "wideUpper":
      return (
        `<text x="88" y="45" font-family="${ff}" font-weight="700" font-size="29" letter-spacing="5.5" fill="${ink}">${wm.w1}</text>` +
        `<text x="89" y="64" font-family="'Manrope', 'Avenir Next', sans-serif" font-weight="500" font-size="11" letter-spacing="7.2" fill="${accent}">${wm.w2}</text>`
      );
    case "serif":
      return (
        `<text x="88" y="47" font-family="${ff}" font-weight="600" font-size="33" letter-spacing="4.2" fill="${ink}">${wm.w1}</text>` +
        `<text x="89" y="65" font-family="'Manrope', 'Avenir Next', sans-serif" font-weight="500" font-size="10.5" letter-spacing="7.5" fill="${muted}">${wm.w2}</text>`
      );
    case "lowercase":
      return `<text x="86" y="56" font-family="${ff}" font-weight="800" font-size="33" letter-spacing="-1.0" fill="${ink}">${wm.w1}<tspan dx="5" font-weight="400" fill="${muted}">${wm.w2}</tspan></text>`;
    case "tight":
    default:
      return `<text x="86" y="56" font-family="${ff}" font-weight="800" font-size="33" letter-spacing="-1.1" fill="${ink}">${wm.w1} <tspan font-weight="500" fill="${accent}">${wm.w2}</tspan></text>`;
  }
}

function buildLockupSvg(logo, isDark = false) {
  const inner = applyTokens(logo.markTpl, logo.palette, isDark).trim();
  const label = escapeXml(`#${logo.id} ${logo.name} — Vittal Lifestyle`);
  const textEl = buildWordmarkSvgEl(logo, isDark);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="780" height="180" viewBox="0 0 390 90" fill="none" role="img" aria-label="${label}"><g transform="translate(12,13)">${inner}</g>${textEl}</svg>`;
}

function buildShowcaseCardSvg(logo) {
  const pal = logo.palette;
  const lightMark = applyTokens(logo.markTpl, pal, false).trim();
  const darkMark = applyTokens(logo.markTpl, pal, true).trim();
  const wLight = buildWordmarkSvgEl(logo, false);
  const wDark = buildWordmarkSvgEl(logo, true);
  const worldShort = logo.world.split("·")[1].trim();

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520" fill="none">
    <rect width="800" height="520" rx="22" fill="#FFFFFF"/>
    <rect width="800" height="68" fill="#FFFFFF"/>
    <text x="28" y="42" font-family="Menlo, Monaco, monospace" font-weight="700" font-size="19" fill="${pal.c1}">#${logo.id}</text>
    <text x="82" y="42" font-family="Avenir Next, Helvetica Neue, sans-serif" font-weight="800" font-size="21" fill="#111111">${escapeXml(logo.name)}</text>
    <text x="772" y="40" text-anchor="end" font-family="Menlo, Monaco, monospace" font-size="13.5" fill="#71717A">${escapeXml(worldShort)}</text>
    <line x1="0" y1="68" x2="800" y2="68" stroke="#E5E7EB" stroke-width="1"/>
    <rect x="0" y="68" width="400" height="432" fill="${pal.lightBg}"/>
    <g transform="translate(136,142) scale(2.0)">${lightMark}</g>
    <g transform="translate(64,335) scale(0.76)"><g transform="translate(12,13)">${lightMark}</g>${wLight}</g>
    <rect x="400" y="68" width="400" height="432" fill="${pal.darkBg}"/>
    <g transform="translate(536,142) scale(2.0)">${darkMark}</g>
    <g transform="translate(464,335) scale(0.76)"><g transform="translate(12,13)">${darkMark}</g>${wDark}</g>
    <rect x="0" y="500" width="200" height="20" fill="${pal.c1}"/>
    <rect x="200" y="500" width="200" height="20" fill="${pal.inkL}"/>
    <rect x="400" y="500" width="200" height="20" fill="${pal.c3}"/>
    <rect x="600" y="500" width="200" height="20" fill="${pal.lightBg}"/>
  </svg>`;
}

function buildContactSheetSvg(slice, title, subtitle, cols = 5) {
  const rows = Math.ceil(slice.length / cols);
  const cellW = 368;
  const cellH = 228;
  const padX = 36;
  const padY = 104;
  const gap = 18;
  const W = padX * 2 + cols * cellW + (cols - 1) * gap;
  const H = padY + 36 + rows * cellH + (rows - 1) * gap;

  let body = `
    <rect width="${W}" height="${H}" fill="#090A0B"/>
    <text x="${padX}" y="46" font-family="Avenir Next, Helvetica Neue, sans-serif" font-weight="800" font-size="28" fill="#FFFFFF">${escapeXml(title)}</text>
    <text x="${padX}" y="74" font-family="Menlo, Monaco, monospace" font-size="13" fill="#A1A1AA">${escapeXml(subtitle)}</text>
  `;

  slice.forEach((logo, idx) => {
    const c = idx % cols;
    const r = Math.floor(idx / cols);
    const x = padX + c * (cellW + gap);
    const y = padY + r * (cellH + gap);
    const pal = logo.palette;
    const lightMark = applyTokens(logo.markTpl, pal, false).trim();
    const darkMark = applyTokens(logo.markTpl, pal, true).trim();
    const worldShort = logo.world.split("·")[1].trim();
    const star = logo.star ? " ★" : "";

    body += `
      <g transform="translate(${x},${y})">
        <rect width="${cellW}" height="${cellH}" rx="16" fill="#141518" stroke="#26282E" stroke-width="1.2"/>
        <text x="14" y="25" font-family="Menlo, Monaco, monospace" font-weight="700" font-size="12" fill="${pal.c3}">#${logo.id}${star}</text>
        <text x="64" y="25" font-family="Avenir Next, Helvetica Neue, sans-serif" font-weight="700" font-size="12.5" fill="#F4F4F5">${escapeXml(logo.name)}</text>
        <rect x="10" y="36" width="170" height="132" rx="10" fill="${pal.lightBg}"/>
        <g transform="translate(53,60) scale(1.32)">${lightMark}</g>
        <rect x="188" y="36" width="170" height="132" rx="10" fill="${pal.darkBg}" stroke="#27272A" stroke-width="1"/>
        <g transform="translate(231,60) scale(1.32)">${darkMark}</g>
        <text x="14" y="191" font-family="Menlo, Monaco, monospace" font-size="10" fill="#A1A1AA">${escapeXml(worldShort)}</text>
        <text x="354" y="191" text-anchor="end" font-family="Menlo, Monaco, monospace" font-size="9.5" fill="#71717A">${escapeXml(logo.badge)}</text>
        <rect x="10" y="206" width="87" height="9" rx="2" fill="${pal.c1}"/>
        <rect x="100" y="206" width="87" height="9" rx="2" fill="${pal.inkL}"/>
        <rect x="190" y="206" width="87" height="9" rx="2" fill="${pal.c3}"/>
        <rect x="280" y="206" width="78" height="9" rx="2" fill="${pal.lightBg}"/>
      </g>
    `;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none">${body}</svg>`;
}

// ---------------------------------------------------------------------------
// Standalone Offline HTML Studio Builder (mirrors vittallifestyle.com/brand)
// ---------------------------------------------------------------------------

function buildStudioHtml(logosMeta) {
  const payload = JSON.stringify(logosMeta).replaceAll("</script>", "<\\/script>");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
<title>Vittal Lifestyle — 80 Authentic Multi-Brand Marketplace Logos (v4.0)</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=IBM+Plex+Mono:wght@500;600&family=Inter:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@500;700;800&family=Space+Grotesk:wght@500;700&family=Urbanist:wght@400;500;600;700;800&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Inter',-apple-system,sans-serif; background:#090A0B; color:#F5F5F7; padding-bottom:96px; }
  .topbar { position:sticky; top:0; z-index:100; background:rgba(10,11,13,0.95); backdrop-filter:blur(18px); border-bottom:1px solid rgba(255,255,255,0.12); padding:12px 24px; display:flex; flex-wrap:wrap; gap:12px; justify-content:space-between; align-items:center; }
  .sw { display:inline-flex; align-items:center; gap:6px; min-height:38px; padding:6px 12px; border-radius:99px; font-size:12px; font-weight:600; background:rgba(255,255,255,0.06); border:1.5px solid rgba(255,255,255,0.14); color:#FFF; cursor:pointer; }
  .sw.active { border-color:#FFF; background:rgba(255,255,255,0.18); }
  .dot { width:10px; height:10px; border-radius:99px; display:inline-block; }
  .wrap { max-width:1460px; margin:0 auto; padding:24px 20px; }
  .grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-top:20px; }
  @media (max-width:1100px) { .grid { grid-template-columns:repeat(2,1fr); } }
  @media (max-width:700px) { .grid { grid-template-columns:1fr; } }
  .card { background:#121316; border:1.5px solid rgba(255,255,255,0.11); border-radius:22px; overflow:hidden; display:flex; flex-direction:column; }
  .chead { padding:12px 16px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.07); }
  .split { display:grid; grid-template-columns:1fr 1fr; }
  .pane { height:158px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding:12px; }
  .swatch-strip { display:grid; grid-template-columns:repeat(4,1fr); height:7px; }
  .cfoot { padding:14px 16px; font-size:12px; color:#9CA3AF; line-height:1.5; }
</style>
</head>
<body>
<header class="topbar">
  <div>
    <div style="font-family:'Manrope',sans-serif;font-weight:800;font-size:18px;">Vittal Lifestyle · 80 Authentic Marketplace Brand Identities (<span style="color:#C084FC;">v4.0</span>)</div>
    <div style="font-size:12px;color:#9CA3AF;">Built for 100% Original Multi-Brand Commerce · App Icon · Delivery Box · Shopping Tote · Authenticity Seal</div>
  </div>
  <div style="display:flex;gap:7px;flex-wrap:wrap;">
    <button class="sw active" onclick="setPal(null,this)">Curated Mix (80)</button>
    <button class="sw" onclick="setPal({lightBg:'#FAF8FF',darkBg:'#100B18',inkL:'#1A102B',inkD:'#FFFFFF',c1:'#7C3AED',c2:'#5B21B6',c3:'#C084FC'},this)"><span class="dot" style="background:#7C3AED"></span>Royal Plum</button>
    <button class="sw" onclick="setPal({lightBg:'#FFFFFF',darkBg:'#0D1117',inkL:'#111827',inkD:'#FFFFFF',c1:'#F59E0B',c2:'#B45309',c3:'#FCD34D'},this)"><span class="dot" style="background:#F59E0B"></span>Commerce Amber</button>
    <button class="sw" onclick="setPal({lightBg:'#F6FBF8',darkBg:'#09130D',inkL:'#0D1F14',inkD:'#FFFFFF',c1:'#16A34A',c2:'#15803D',c3:'#4ADE80'},this)"><span class="dot" style="background:#16A34A"></span>Verified Emerald</button>
    <button class="sw" onclick="setPal({lightBg:'#FFF8FA',darkBg:'#140A0F',inkL:'#1E0F17',inkD:'#FFFFFF',c1:'#E11D68',c2:'#9F1239',c3:'#F472B6'},this)"><span class="dot" style="background:#E11D68"></span>Luxury Berry</button>
    <button class="sw" onclick="setPal({lightBg:'#FFFFFF',darkBg:'#09090B',inkL:'#0B0B0E',inkD:'#FFFFFF',c1:'#111114',c2:'#27272A',c3:'#71717A'},this)"><span class="dot" style="background:#FFF"></span>Editorial Mono</button>
  </div>
</header>
<main class="wrap">
  <div id="grid" class="grid"></div>
</main>
<script>
const LOGOS = ${payload};
let overridePal = null;
function renderMark(m, size, isDark) {
  const p = overridePal || m.palette;
  const isMono = p.c1 === "#111114";
  const inner = m.markTpl
    .replaceAll("__INK__", isDark ? p.inkD : p.inkL)
    .replaceAll("__C1__", isDark && isMono ? "#FFFFFF" : p.c1)
    .replaceAll("__C2__", isDark && isMono ? "#D4D4D8" : p.c2)
    .replaceAll("__C3__", isDark && p.c3 === "#71717A" ? "#A1A1AA" : p.c3)
    .replaceAll("__BG__", isDark ? p.darkBg : p.lightBg)
    .replaceAll("__ONC1__", isDark && isMono ? p.darkBg : "#FFFFFF");
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 64 64" fill="none">' + inner + '</svg>';
}
function draw() {
  document.getElementById("grid").innerHTML = LOGOS.map((m) => {
    const p = overridePal || m.palette;
    return '<article class="card"><div class="chead"><div><span style="font-family:IBM Plex Mono,monospace;font-size:12px;font-weight:700;color:' + p.c3 + ';">#' + m.id + '</span> <strong style="font-family:Manrope,sans-serif;font-size:14px;margin-left:5px;">' + m.name + '</strong></div><span style="font-family:IBM Plex Mono,monospace;font-size:9.5px;background:rgba(255,255,255,0.08);padding:3px 8px;border-radius:99px;">' + m.badge + '</span></div>' +
      '<div class="split"><div class="pane" style="background:' + p.lightBg + ';border-right:1px solid rgba(0,0,0,0.06);">' + renderMark(m, 64, false) + '</div><div class="pane" style="background:' + p.darkBg + ';">' + renderMark(m, 64, true) + '</div></div>' +
      '<div class="swatch-strip"><span style="background:' + p.c1 + '"></span><span style="background:' + p.inkL + '"></span><span style="background:' + p.c3 + '"></span><span style="background:' + p.lightBg + '"></span></div>' +
      '<div class="cfoot"><strong style="color:#E5E7EB;">[' + m.world.split("·")[1].trim() + ']</strong> ' + m.rationale + '</div></article>';
  }).join("");
}
function setPal(p, btn) {
  overridePal = p;
  document.querySelectorAll(".sw").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  draw();
}
draw();
</script>
</body></html>`;
}

function buildBrandGuideMd(logosMeta) {
  const rows = logosMeta
    .map(
      (m) =>
        `| **#${m.id}** | ${m.name} | ${m.world.split("·")[1].trim()} | ${m.badge} | \`svg/marks/${m.fileSlug}.svg\` |`
    )
    .join("\n");

  return `# Vittal Lifestyle — 80 Authentic Multi-Brand Marketplace Identities (v4.0)

Designed for a **trusted multi-brand premium marketplace** selling **100% real, original premium brands** (Amazon · Purplle · Nykaa · Farfetch · Tata CLiQ Luxury caliber).

Tested across **The 5 Real Marketplace Touchpoints**: Universal Search Storefront Header, iOS/Android Smartphone App Icon, Doorstep Unboxing Box & \`100% ORIGINAL\` Security Tape, Premium Retail Shopping Tote, and Verified Authenticity Seal + 16px Browser Favicon.

## Complete 80-Identity Marketplace Catalogue (\`#01\`–\`#80\`)

| ID | Concept Name | Archetype | Note | Mark SVG |
| :--- | :--- | :--- | :--- | :--- |
${rows}
`;
}

// ---------------------------------------------------------------------------
// Main Execution
// ---------------------------------------------------------------------------

async function main() {
  const logosMeta = LOGOS.map((logo) => ({
    ...logo,
    fileSlug: `${logo.id}-${slugify(logo.name)}`,
  }));

  console.log("1/5 Writing 240 standalone marketplace SVGs (80 marks + 80 light + 80 dark)...");
  for (const logo of logosMeta) {
    fs.writeFileSync(path.join(SVG_MARKS_DIR, `${logo.fileSlug}.svg`), buildMarkSvg(logo, false), "utf8");
    fs.writeFileSync(path.join(SVG_LIGHT_DIR, `${logo.fileSlug}.svg`), buildLockupSvg(logo, false), "utf8");
    fs.writeFileSync(path.join(SVG_DARK_DIR, `${logo.fileSlug}.svg`), buildLockupSvg(logo, true), "utf8");
  }

  console.log("2/5 Rendering 80 Dual-Stage Editorial PNG Cards (800x520)...");
  await Promise.all(
    logosMeta.map(async (logo) => {
      const cardSvg = buildShowcaseCardSvg(logo);
      await sharp(Buffer.from(cardSvg))
        .png({ compressionLevel: 9 })
        .toFile(path.join(PNG_DIR, `${logo.fileSlug}.png`));
    })
  );

  console.log("3/5 Rendering 3 Master Visual Contact Sheets (#01–#25, #26–#50, #51–#80)...");
  const sheet1 = buildContactSheetSvg(
    logosMeta.slice(0, 25),
    "Vittal Lifestyle v4.0 — Authentic Multi-Brand Marketplace (Sheet 1/3: #01 – #25)",
    "Shopping Bags & Totes (#01–#10) · Verified & Authentic Seals (#11–#20) · Express & Parcels (#21–#25)",
    5
  );
  const sheet2 = buildContactSheetSvg(
    logosMeta.slice(25, 50),
    "Vittal Lifestyle v4.0 — Authentic Multi-Brand Marketplace (Sheet 2/3: #26 – #50)",
    "Express & Parcels (#26–#30) · App-Tile Monograms (#31–#40) · Multi-Brand Hub (#41–#50)",
    5
  );
  const sheet3 = buildContactSheetSvg(
    logosMeta.slice(50, 80),
    "Vittal Lifestyle v4.0 — Authentic Multi-Brand Marketplace (Sheet 3/3: #51 – #80)",
    "Luxury & Editorial (#51–#60) · Beauty & Gifting (#61–#70) · Flagship Platform Masters (#71–#80)",
    6
  );
  await Promise.all([
    sharp(Buffer.from(sheet1)).png({ compressionLevel: 9 }).toFile(path.join(PNG_DIR, "sheet-01-to-25.png")),
    sharp(Buffer.from(sheet2)).png({ compressionLevel: 9 }).toFile(path.join(PNG_DIR, "sheet-26-to-50.png")),
    sharp(Buffer.from(sheet3)).png({ compressionLevel: 9 }).toFile(path.join(PNG_DIR, "sheet-51-to-80.png")),
  ]);

  console.log("4/5 Writing Offline Studio HTML & Brand Guide...");
  fs.writeFileSync(path.join(OUT_DIR, "index.html"), buildStudioHtml(logosMeta), "utf8");
  fs.writeFileSync(path.join(OUT_DIR, "BRAND-STUDY-AND-LOGO-GUIDE.md"), buildBrandGuideMd(logosMeta), "utf8");

  console.log("5/5 Exporting src/data/brandLogos.ts & syncing 240 SVGs to public/brand/svg/...");
  const pubSvgRoot = path.join(ROOT, "public", "brand", "svg");
  for (const sub of ["marks", "light", "dark"]) {
    const destDir = path.join(pubSvgRoot, sub);
    fs.rmSync(destDir, { recursive: true, force: true });
    fs.mkdirSync(destDir, { recursive: true });
    const srcDir = path.join(OUT_DIR, "svg", sub);
    for (const file of fs.readdirSync(srcDir)) {
      if (file.endsWith(".svg")) {
        fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
      }
    }
  }

  const tsDataDir = path.join(ROOT, "src", "data");
  fs.mkdirSync(tsDataDir, { recursive: true });
  const tsContent = `// Auto-generated by scripts/generate-vl-50-logos.mjs (v4.0 Authentic Multi-Brand Marketplace — 80 Concepts)
export interface BrandPalette {
  lightBg: string;
  darkBg: string;
  inkL: string;
  inkD: string;
  c1: string;
  c2: string;
  c3: string;
}

export interface BrandWordmarkConfig {
  style: "tight" | "tightUpper" | "wideUpper" | "serif" | "lowercase";
  w1: string;
  w2: string;
  font: string;
}

export interface BrandLogoConcept {
  id: string;
  world: string;
  name: string;
  badge: string;
  star: boolean;
  palette: BrandPalette;
  wordmark: BrandWordmarkConfig;
  rationale: string;
  markTpl: string;
  fileSlug: string;
}

export const BRAND_LOGOS: BrandLogoConcept[] = ${JSON.stringify(logosMeta, null, 2)};

export const VALID_BRAND_LOGO_IDS = new Set(BRAND_LOGOS.map((l) => l.id));
`;
  fs.writeFileSync(path.join(tsDataDir, "brandLogos.ts"), tsContent, "utf8");

  console.log("Done! Generated v4.0 Authentic Marketplace 80 logos (240 SVGs, 80 PNG cards, 3 contact sheets, src/data/brandLogos.ts).");
}

main().catch((err) => {
  console.error("Generation failed:", err);
  process.exit(1);
});
