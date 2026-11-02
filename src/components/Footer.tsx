"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Headphones,
  Shield,
  ChevronRight,
  Package,
  Truck,
  FileText,
  FileCheck2,
  Mail,
} from "lucide-react";

const SHOP_LINKS = [
  { label: "All Products", href: "/products" },
  { label: "Tech & Gadgets", href: "/products?category=Tech+%26+Gadgets" },
  { label: "Home Essentials", href: "/products?category=Home+Essentials" },
  { label: "Deals & Offers", href: "/products?category=Deals+%26+Offers" },
];

const SUPPORT_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Track Order", href: "/order-tracking" },
  { label: "WhatsApp Support", href: "https://wa.me/919744122853?text=Hi%20Zupe%20Store%2C%20I%20have%20an%20inquiry" },
  { label: "Contact Us", href: "mailto:zupestoreonline@gmail.com" },
];

export function Footer() {
  return (
    <footer
      className="relative bg-[#0B1220] text-white overflow-hidden pt-10 sm:pt-14 pb-24 sm:pb-14 select-none"
      style={{ backgroundColor: "#0B1220" }}
    >
      {/* Subtle Ambient Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-[#FF7A00]/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[720px] mx-auto px-5 sm:px-8 relative z-10">
        {/* 1. BRAND HEADER */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center justify-center gap-3 mb-3 group">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
              <Image
                src="/zupe-logo.webp"
                alt="Zupe Store"
                width={48}
                height={48}
                className="w-11 h-11 sm:w-12 sm:h-12 object-contain drop-shadow-md"
                priority
              />
            </div>
            <Image
              src="/zupe-label-white.png"
              alt="ZupeStore"
              width={150}
              height={38}
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm sm:max-w-md mx-auto leading-relaxed font-normal">
            Curated modern essentials for people who appreciate thoughtful design in everyday life.
          </p>
        </div>

        {/* 2. SOCIAL ICONS ROW */}
        <div className="flex items-center justify-center gap-3.5 mb-7">
          {/* Instagram */}
          <a
            href="https://instagram.com/zupestore.in"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#141E33]/90 hover:bg-[#1E2B48] border border-white/10 flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-105 active:scale-95 group"
          >
            <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="footerIgGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f09433" />
                  <stop offset="25%" stopColor="#e6683c" />
                  <stop offset="50%" stopColor="#dc2743" />
                  <stop offset="75%" stopColor="#cc2366" />
                  <stop offset="100%" stopColor="#bc1888" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#footerIgGradient)" strokeWidth="2" />
              <circle cx="12" cy="12" r="4" stroke="url(#footerIgGradient)" strokeWidth="2" />
              <circle cx="17.5" cy="6.5" r="1.2" fill="url(#footerIgGradient)" />
            </svg>
          </a>

          {/* Facebook */}
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#141E33]/90 hover:bg-[#1E2B48] border border-white/10 flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-105 active:scale-95 group"
          >
            <svg className="w-5 h-5 fill-[#1877F2] transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/919744122853?text=Hi%20Zupe%20Store%2C%20I%20have%20an%20inquiry"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#141E33]/90 hover:bg-[#1E2B48] border border-white/10 flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-105 active:scale-95 group"
          >
            <svg className="w-5 h-5 fill-[#25D366] transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
          </a>

          {/* Email */}
          <a
            href="mailto:zupestoreonline@gmail.com"
            aria-label="Email"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#141E33]/90 hover:bg-[#1E2B48] border border-white/10 flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-105 active:scale-95 group"
          >
            <Mail className="w-5 h-5 text-slate-200 transition-transform group-hover:scale-110" />
          </a>
        </div>

        {/* 3. DIVIDER WITH ORANGE ACCENT PILL */}
        <div className="relative my-6 sm:my-7">
          <div className="w-full border-t border-slate-700/60" />
          <div className="absolute left-1/2 -translate-x-1/2 -top-[3px] w-12 h-1.5 rounded-full bg-gradient-to-r from-[#FF7A00] to-[#FFA742] shadow-sm shadow-orange-500/50" />
        </div>

        {/* 4. SHOP & SUPPORT 2-COLUMN GRID */}
        <div className="grid grid-cols-2 gap-6 sm:gap-12 mb-7">
          {/* SHOP */}
          <div>
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#FF9E40] flex items-center justify-center text-white shadow-sm shadow-orange-500/25 shrink-0">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Shop
              </h4>
            </div>
            <ul className="space-y-1">
              {SHOP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="flex items-center justify-between py-1.5 text-xs sm:text-sm text-slate-300 hover:text-white group transition-colors"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">{link.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#FF9E40] flex items-center justify-center text-white shadow-sm shadow-orange-500/25 shrink-0">
                <Headphones className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Support
              </h4>
            </div>
            <ul className="space-y-1">
              {SUPPORT_LINKS.map((link) => {
                const isExternal = link.href.startsWith("http") || link.href.startsWith("mailto:");
                if (isExternal) {
                  return (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="flex items-center justify-between py-1.5 text-xs sm:text-sm text-slate-300 hover:text-white group transition-colors"
                      >
                        <span className="group-hover:translate-x-0.5 transition-transform">{link.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                      </a>
                    </li>
                  );
                }
                return (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="flex items-center justify-between py-1.5 text-xs sm:text-sm text-slate-300 hover:text-white group transition-colors"
                    >
                      <span className="group-hover:translate-x-0.5 transition-transform">{link.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* 5. LEGAL SECTION */}
        <div className="mb-7">
          <div className="flex items-center gap-2.5 mb-3.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#FF9E40] flex items-center justify-center text-white shadow-sm shadow-orange-500/25 shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white tracking-wide">
              Legal
            </h4>
          </div>

          {/* Sleek Horizontal Glass Container */}
          <div className="rounded-2xl border border-white/10 bg-[#141E33]/70 backdrop-blur-sm p-3 sm:p-4 shadow-lg shadow-black/20">
            <div className="grid grid-cols-4 divide-x divide-white/10 text-center">
              <Link
                href="/return"
                className="px-1 sm:px-3 py-1 flex flex-col items-center justify-center hover:opacity-80 transition-opacity group"
              >
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFA742] mb-1.5 group-hover:scale-110 transition-transform stroke-[2]" />
                <span className="text-[10px] sm:text-xs font-semibold text-slate-200 block leading-tight">
                  Return &<br />Refund Policy
                </span>
              </Link>

              <Link
                href="/shipping-and-delivery"
                className="px-1 sm:px-3 py-1 flex flex-col items-center justify-center hover:opacity-80 transition-opacity group"
              >
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFA742] mb-1.5 group-hover:scale-110 transition-transform stroke-[2]" />
                <span className="text-[10px] sm:text-xs font-semibold text-slate-200 block leading-tight">
                  Shipping &<br />Delivery
                </span>
              </Link>

              <Link
                href="/privacy"
                className="px-1 sm:px-3 py-1 flex flex-col items-center justify-center hover:opacity-80 transition-opacity group"
              >
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFA742] mb-1.5 group-hover:scale-110 transition-transform stroke-[2]" />
                <span className="text-[10px] sm:text-xs font-semibold text-slate-200 block leading-tight">
                  Privacy<br />Policy
                </span>
              </Link>

              <Link
                href="/terms-and-conditions"
                className="px-1 sm:px-3 py-1 flex flex-col items-center justify-center hover:opacity-80 transition-opacity group"
              >
                <FileCheck2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFA742] mb-1.5 group-hover:scale-110 transition-transform stroke-[2]" />
                <span className="text-[10px] sm:text-xs font-semibold text-slate-200 block leading-tight">
                  Terms &<br />Conditions
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* 6. COPYRIGHT */}
        <div className="text-center pb-2">
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            © 2026 ZupeStore. All rights reserved.
          </p>
        </div>
      </div>

      {/* 7. BOTTOM ACCENT ORANGE WAVES */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden leading-none z-0">
        <svg
          className="w-full h-12 sm:h-16 md:h-20 block"
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="footerWaveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E66E00" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#FF7A00" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#FFA742" stopOpacity="0.65" />
            </linearGradient>
            <linearGradient id="footerWaveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF7A00" />
              <stop offset="50%" stopColor="#FFA742" />
              <stop offset="100%" stopColor="#E66E00" />
            </linearGradient>
          </defs>
          {/* Upper subtle wave */}
          <path
            d="M0,50 C320,15 540,95 860,45 C1140,-5 1320,70 1440,35 L1440,120 L0,120 Z"
            fill="url(#footerWaveGrad1)"
            opacity="0.45"
          />
          {/* Front vibrant wave */}
          <path
            d="M0,75 C340,30 620,105 980,55 C1220,25 1350,70 1440,65 L1440,120 L0,120 Z"
            fill="url(#footerWaveGrad2)"
          />
        </svg>
      </div>
    </footer>
  );
}
