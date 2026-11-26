#!/usr/bin/env node
/**
 * Generates Official Production Brand Assets for Vittal Lifestyle — Logo #80 v2.0 Master
 * (Vittal Sovereign Marketplace Master — Pure Cubic Bézier Geometry, Zero-Collision Sovereign Star,
 * Sculpted Luxury Tote with Architectural Clasp Eyelets & 3x Retina Editorial Wordmark)
 *
 * Outputs to public/:
 *   - vl-logo-light.svg & vl-logo-black.png (1200x260 3x Retina PNG for light surfaces & emails)
 *   - vl-logo-dark.svg  & vl-logo-nobg.png  (1200x260 3x Retina PNG for dark surfaces & admin)
 *   - vittal-lifestyle-logo.svg & vittal-digital-logo.svg (pure vector lockups)
 *   - icon.png (512x512 app icon), apple-touch-icon.png (180x180)
 *   - favicon-32x32.png, favicon-16x16.png, favicon.ico (multi-size PNG-in-ICO)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");

// ---------------------------------------------------------------------------
// Logo #80 v2.0 — Pure Cubic Bézier Master Paths (viewBox 0 0 64 64)
// ---------------------------------------------------------------------------
export const PATHS_V2 = {
  handle: "M22.5 23.5 V15.5 A9.5 9.5 0 0 1 41.5 15.5 V23.5",
  bag: "M16.5 21.5 H47.5 C51.8 21.5 54.4 24.4 54.7 28.6 L55.8 46.2 C56.2 52.0 52.0 56.0 46.2 56.0 H17.8 C12.0 56.0 7.8 52.0 8.2 46.2 L9.3 28.6 C9.6 24.4 12.2 21.5 16.5 21.5 Z",
  bagLip: "M15.8 22.8 H48.2",
  checkLeft:
    "M18.8 34.8 C19.8 39.2 23.2 43.9 28.9 46.5 C29.5 46.8 30.1 46.6 30.3 46.0 C30.6 45.2 30.5 44.3 30.1 43.5 C27.8 39.1 24.9 35.3 21.3 32.9 C20.1 32.1 18.4 33.3 18.8 34.8 Z",
  checkRight:
    "M28.6 46.2 C28.4 46.9 29.2 47.4 29.9 47.0 C36.6 43.2 42.6 36.2 46.2 28.4 C46.7 27.3 45.4 26.3 44.5 27.0 C38.9 31.2 33.3 37.5 28.6 46.2 Z",
  sparkle:
    "M53.8 4.0 C54.7 8.4 56.0 9.7 60.4 10.6 C56.0 11.5 54.7 12.8 53.8 17.2 C52.9 12.8 51.6 11.5 47.2 10.6 C51.6 9.7 52.9 8.4 53.8 4.0 Z",
};

function buildMark({ idPrefix, handleGrad, bagFill, lipStroke, eyeletFill, checkLeft, checkRight, sparkleGrad }) {
  return {
    defs: `
      <linearGradient id="${idPrefix}_gold" x1="18" y1="5" x2="58" y2="25" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="${handleGrad[0]}"/>
        <stop offset="55%" stop-color="${handleGrad[1]}"/>
        <stop offset="100%" stop-color="${handleGrad[2]}"/>
      </linearGradient>
      <linearGradient id="${idPrefix}_bag" x1="12" y1="21" x2="52" y2="56" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="${bagFill[0]}"/>
        <stop offset="100%" stop-color="${bagFill[1]}"/>
      </linearGradient>
      <linearGradient id="${idPrefix}_star" x1="47" y1="4" x2="60" y2="17" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="${sparkleGrad[0]}"/>
        <stop offset="100%" stop-color="${sparkleGrad[1]}"/>
      </linearGradient>
    `.trim(),
    body: `
      <path d="${PATHS_V2.handle}" stroke="url(#${idPrefix}_gold)" stroke-width="4.1" stroke-linecap="round" fill="none"/>
      <path d="${PATHS_V2.bag}" fill="url(#${idPrefix}_bag)"/>
      <path d="${PATHS_V2.bagLip}" stroke="${lipStroke}" stroke-opacity="0.22" stroke-width="1.1" stroke-linecap="round"/>
      <circle cx="22.5" cy="25.8" r="1.6" fill="${eyeletFill}" fill-opacity="0.88"/>
      <circle cx="41.5" cy="25.8" r="1.6" fill="${eyeletFill}" fill-opacity="0.88"/>
      <path d="${PATHS_V2.checkLeft}" fill="${checkLeft}"/>
      <path d="${PATHS_V2.checkRight}" fill="${checkRight}"/>
      <path d="${PATHS_V2.sparkle}" fill="url(#${idPrefix}_star)"/>
    `.trim(),
  };
}

const lightM = buildMark({
  idPrefix: "vl_l",
  handleGrad: ["#E5C469", "#C59B27", "#A37E18"],
  bagFill: ["#0E7153", "#074230"],
  lipStroke: "#A7F3D0",
  eyeletFill: "#E5C469",
  checkLeft: "#86EFAC",
  checkRight: "#FFFFFF",
  sparkleGrad: ["#F3D37A", "#C59B27"],
});

const darkM = buildMark({
  idPrefix: "vl_d",
  handleGrad: ["#F6DE92", "#E5C469", "#C59B27"],
  bagFill: ["#FFFFFF", "#EBF3EF"],
  lipStroke: "#0B5D44",
  eyeletFill: "#C59B27",
  checkLeft: "#10B981",
  checkRight: "#074230",
  sparkleGrad: ["#FFF2BE", "#E5C469"],
});

const appM = buildMark({
  idPrefix: "vl_a",
  handleGrad: ["#F6DE92", "#E5C469", "#C59B27"],
  bagFill: ["#FFFFFF", "#EDF5F1"],
  lipStroke: "#0B5D44",
  eyeletFill: "#C59B27",
  checkLeft: "#34D399",
  checkRight: "#074230",
  sparkleGrad: ["#FFF2BE", "#E5C469"],
});

// Clean pure flagship wordmark lockups (1200x260, viewBox 420x96) — no tagline clutter beneath the logo
const lightLockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="260" viewBox="0 0 420 96" fill="none" role="img" aria-label="Vittal Lifestyle Official Logo">
  <defs>${lightM.defs}</defs>
  <g transform="translate(14,13) scale(1.08)">${lightM.body}</g>
  <text x="98" y="61" font-family="Manrope, Avenir Next, Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif" font-weight="700" font-size="42" letter-spacing="-1.2" fill="#0C1412">vittal<tspan dx="7" font-weight="400" fill="#0B5D44">lifestyle</tspan></text>
</svg>`;

const darkLockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="260" viewBox="0 0 420 96" fill="none" role="img" aria-label="Vittal Lifestyle Official Logo (Dark)">
  <defs>${darkM.defs}</defs>
  <g transform="translate(14,13) scale(1.08)">${darkM.body}</g>
  <text x="98" y="61" font-family="Manrope, Avenir Next, Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif" font-weight="700" font-size="42" letter-spacing="-1.2" fill="#FFFFFF">vittal<tspan dx="7" font-weight="400" fill="#E5C469">lifestyle</tspan></text>
</svg>`;

// Luxury Emerald lacquer squircle app icon with subtle radial sheen & bevel ring
const appIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 80 80" fill="none" role="img" aria-label="Vittal Lifestyle App Icon">
  <defs>
    <linearGradient id="vl_bg" x1="6" y1="4" x2="74" y2="78" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0E7253"/>
      <stop offset="52%" stop-color="#0B5D44"/>
      <stop offset="100%" stop-color="#063426"/>
    </linearGradient>
    <radialGradient id="vl_glow" cx="26" cy="18" r="46" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#34D399" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#0B5D44" stop-opacity="0"/>
    </radialGradient>
    ${appM.defs}
  </defs>
  <rect width="80" height="80" rx="19" fill="url(#vl_bg)"/>
  <rect width="80" height="80" rx="19" fill="url(#vl_glow)"/>
  <rect x="1.25" y="1.25" width="77.5" height="77.5" rx="17.75" stroke="#E5C469" stroke-opacity="0.28" stroke-width="1.2"/>
  <g transform="translate(8,8.5)">${appM.body}</g>
</svg>`;

function buildIcoFromPngs(pngEntries) {
  const count = pngEntries.length;
  const headerSize = 6 + count * 16;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  let offset = headerSize;
  const chunks = [header];
  pngEntries.forEach(({ size, buf }, i) => {
    const pos = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, pos);
    header.writeUInt8(size >= 256 ? 0 : size, pos + 1);
    header.writeUInt8(0, pos + 2);
    header.writeUInt8(0, pos + 3);
    header.writeUInt16LE(1, pos + 4);
    header.writeUInt16LE(32, pos + 6);
    header.writeUInt32LE(buf.length, pos + 8);
    header.writeUInt32LE(offset, pos + 12);
    offset += buf.length;
    chunks.push(buf);
  });
  return Buffer.concat(chunks);
}

async function main() {
  fs.writeFileSync(path.join(PUBLIC_DIR, "vl-logo-light.svg"), lightLockupSvg, "utf8");
  fs.writeFileSync(path.join(PUBLIC_DIR, "vl-logo-dark.svg"), darkLockupSvg, "utf8");
  fs.writeFileSync(path.join(PUBLIC_DIR, "vittal-lifestyle-logo.svg"), lightLockupSvg, "utf8");
  fs.writeFileSync(path.join(PUBLIC_DIR, "vittal-digital-logo.svg"), lightLockupSvg, "utf8");

  await sharp(Buffer.from(lightLockupSvg), { density: 288 })
    .resize(1200, 260)
    .png({ compressionLevel: 9 })
    .toFile(path.join(PUBLIC_DIR, "vl-logo-black.png"));

  await sharp(Buffer.from(darkLockupSvg), { density: 288 })
    .resize(1200, 260)
    .png({ compressionLevel: 9 })
    .toFile(path.join(PUBLIC_DIR, "vl-logo-nobg.png"));

  const iconBuf = Buffer.from(appIconSvg);
  await sharp(iconBuf, { density: 384 }).resize(512, 512).png({ compressionLevel: 9 }).toFile(path.join(PUBLIC_DIR, "icon.png"));
  await sharp(iconBuf, { density: 288 }).resize(180, 180).png({ compressionLevel: 9 }).toFile(path.join(PUBLIC_DIR, "apple-touch-icon.png"));

  const png32 = await sharp(iconBuf, { density: 192 }).resize(32, 32).png({ compressionLevel: 9 }).toBuffer();
  const png16 = await sharp(iconBuf, { density: 192 }).resize(16, 16).png({ compressionLevel: 9 }).toBuffer();
  fs.writeFileSync(path.join(PUBLIC_DIR, "favicon-32x32.png"), png32);
  fs.writeFileSync(path.join(PUBLIC_DIR, "favicon-16x16.png"), png16);
  fs.writeFileSync(
    path.join(PUBLIC_DIR, "favicon.ico"),
    buildIcoFromPngs([
      { size: 16, buf: png16 },
      { size: 32, buf: png32 },
    ])
  );

  console.log("✓ Generated Logo #80 v2.0 Master Assets (pure cubic Bézier, zero-collision star, 3x Retina PNGs, icons & favicons)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
