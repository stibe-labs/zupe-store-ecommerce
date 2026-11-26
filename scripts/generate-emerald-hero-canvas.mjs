#!/usr/bin/env node
/**
 * Generates the bespoke Imperial Emerald & Brushed Champagne Gold Silk-Wave Hero Canvas
 * replacing the legacy neon chartreuse lime texture at public/vittal/banner-hero-green-texture.jpg
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.resolve(__dirname, "..", "public", "vittal", "banner-hero-green-texture.jpg");

const heroSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080" fill="none">
  <defs>
    <!-- Deep Imperial Emerald Lacquer Base -->
    <linearGradient id="base" x1="0" y1="0" x2="1920" y2="1080" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#05271D"/>
      <stop offset="42%" stop-color="#0B5D44"/>
      <stop offset="78%" stop-color="#0D6E51"/>
      <stop offset="100%" stop-color="#063728"/>
    </linearGradient>

    <!-- Luminous Right-Side Studio Rim Light (illuminates athlete/product cutouts) -->
    <radialGradient id="studioSpot" cx="1440" cy="480" r="760" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#34D399" stop-opacity="0.34"/>
      <stop offset="45%" stop-color="#10B981" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#063728" stop-opacity="0"/>
    </radialGradient>

    <!-- Warm Champagne Gold Ambient Glow -->
    <radialGradient id="goldAura" cx="560" cy="210" r="640" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E5C469" stop-opacity="0.16"/>
      <stop offset="55%" stop-color="#C59B27" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#0B5D44" stop-opacity="0"/>
    </radialGradient>

    <!-- Silk Wave Gradients -->
    <linearGradient id="silk1" x1="0" y1="680" x2="1920" y2="300" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.06"/>
      <stop offset="45%" stop-color="#34D399" stop-opacity="0.22"/>
      <stop offset="85%" stop-color="#A7F3D0" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#0B5D44" stop-opacity="0.04"/>
    </linearGradient>

    <linearGradient id="silk2" x1="0" y1="900" x2="1920" y2="520" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#041D15" stop-opacity="0.32"/>
      <stop offset="50%" stop-color="#074230" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#041D15" stop-opacity="0.18"/>
    </linearGradient>

    <linearGradient id="goldLine" x1="120" y1="780" x2="1880" y2="260" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E5C469" stop-opacity="0"/>
      <stop offset="30%" stop-color="#E5C469" stop-opacity="0.42"/>
      <stop offset="68%" stop-color="#F6DE92" stop-opacity="0.58"/>
      <stop offset="100%" stop-color="#C59B27" stop-opacity="0.12"/>
    </linearGradient>

    <linearGradient id="mintLine" x1="0" y1="540" x2="1920" y2="420" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#A7F3D0" stop-opacity="0.04"/>
      <stop offset="50%" stop-color="#6EE7B7" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#A7F3D0" stop-opacity="0.05"/>
    </linearGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#base)"/>
  <rect width="1920" height="1080" fill="url(#studioSpot)"/>
  <rect width="1920" height="1080" fill="url(#goldAura)"/>

  <!-- Sweeping Silk Ribbon 1 -->
  <path d="M-80 760 C340 520 680 860 1120 560 C1460 330 1720 430 2020 180 L2020 470 C1700 680 1440 560 1100 770 C680 1030 330 760 -80 960 Z" fill="url(#silk1)"/>

  <!-- Deep Architectural Shadow Ribbon -->
  <path d="M-80 880 C380 680 740 980 1200 720 C1520 540 1760 630 2020 420 L2020 1120 L-80 1120 Z" fill="url(#silk2)"/>

  <!-- Subtle Fine Silk Contour Lines -->
  <g stroke="url(#mintLine)" fill="none" stroke-width="1.6">
    <path d="M-60 620 C340 420 710 740 1150 450 C1490 225 1740 315 2000 100"/>
    <path d="M-60 658 C345 458 715 776 1155 488 C1495 262 1745 352 2000 138"/>
    <path d="M-60 696 C350 496 720 812 1160 526 C1500 299 1750 389 2000 176"/>
    <path d="M-60 734 C355 534 725 848 1165 564 C1505 336 1755 426 2000 214"/>
    <path d="M-60 820 C380 625 750 925 1190 655 C1530 445 1770 520 2000 320"/>
    <path d="M-60 860 C385 665 755 965 1195 695 C1535 485 1775 560 2000 360"/>
  </g>

  <!-- Signature Brushed Champagne Gold Silk Threads -->
  <path d="M-60 772 C360 568 730 884 1170 604 C1510 388 1760 468 2000 256" stroke="url(#goldLine)" stroke-width="2.6" fill="none"/>
  <path d="M-60 792 C365 588 735 904 1175 624 C1515 408 1765 488 2000 276" stroke="url(#goldLine)" stroke-width="1.1" stroke-opacity="0.65" fill="none"/>

  <!-- Subtle Micro Architectural Grid Texture (ultra-restrained 3% opacity) -->
  <g stroke="#FFFFFF" stroke-opacity="0.035" stroke-width="1">
    <line x1="0" y1="270" x2="1920" y2="270"/>
    <line x1="0" y1="540" x2="1920" y2="540"/>
    <line x1="0" y1="810" x2="1920" y2="810"/>
  </g>
</svg>`;

async function main() {
  await sharp(Buffer.from(heroSvg))
    .resize(1920, 1080)
    .jpeg({ quality: 86, mozjpeg: true, progressive: true })
    .toFile(OUT_FILE);

  console.log(`✓ Generated Imperial Emerald & Silk-Gold Hero Canvas -> ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
