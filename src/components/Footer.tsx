"use client";

import React from "react";
import Link from "next/link";
import { MessageCircle, Mail, MapPin, Phone, ShieldCheck, ArrowUpRight } from "lucide-react";

const SUPPORT_LINKS = [
  { label: "Track Your Order", href: "/order-tracking" },
  { label: "WhatsApp Order & Care", href: "https://wa.me/919744122853?text=Hi%2C%20I%20have%20an%20inquiry%20about%20Turkiye%20Jam" },
  { label: "How to Use & Dosage", href: "/#usage" },
  { label: "Customer Reviews", href: "/#reviews" },
];

const LEGAL_LINKS = [
  { label: "Refund & Return Policy", href: "/return" },
  { label: "Shipping & Delivery Policy", href: "/shipping-and-delivery" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
];

function FooterLink({ link }: { link: { label: string; href: string } }) {
  const isExternal = link.href.startsWith("mailto:") || link.href.startsWith("http");
  if (isExternal) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-stone-300 hover:text-amber-400 transition-colors duration-200 inline-flex items-center gap-1 group py-0.5"
      >
        {link.label}
        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    );
  }
  return (
    <Link
      href={link.href}
      className="text-sm text-stone-300 hover:text-amber-400 transition-colors duration-200 inline-flex items-center gap-1 group py-0.5"
    >
      {link.label}
      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#1c0408] text-white relative overflow-hidden border-t border-amber-950/60">
      {/* Decorative Turkish gold & ruby accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 via-rose-500 to-amber-600" />
      <div className="absolute top-12 right-12 w-96 h-96 bg-rose-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand */}
          <div className="md:col-span-2 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg font-bold text-red-950 text-xl border border-amber-200/30">
                🇹🇷
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-2xl tracking-tight text-white group-hover:text-amber-400 transition-colors font-serif">
                  Turkiye Jam
                </span>
                <span className="text-xs text-amber-400 font-medium tracking-widest uppercase">
                  Authentic Turkish Botanical Macun
                </span>
              </div>
            </Link>

            <p className="text-sm text-stone-300 max-w-md leading-relaxed">
              Directly imported from Turkey, Themra Epimedium Herbal Macun is a revered natural vitality paste. Scientifically formulated with Epimedium, Ginseng, and Pure Flower Honey to enhance physical stamina, intimate desire, and performance for couples.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-amber-300/90 font-medium pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> 100% Genuine Import
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                📦 Discreet Plain Box Packaging
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                ⚡ 1–2 Day Express Delivery
              </span>
            </div>
          </div>

          {/* Customer Care / Support */}
          <div>
            <h4 className="font-semibold text-xs text-amber-400 mb-4 tracking-widest uppercase">
              Customer Support
            </h4>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <FooterLink link={link} />
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Policy */}
          <div>
            <h4 className="font-semibold text-xs text-amber-400 mb-4 tracking-widest uppercase">
              Trust &amp; Policies
            </h4>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <FooterLink link={link} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-400">
            © {new Date().getFullYear()} Turkiye Jam (turkiyejam.com). All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-6 text-xs text-stone-300">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Pan-India Express Logistics
            </span>
            <a
              href="https://wa.me/919744122853"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-amber-300 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              +91 97441 22853 (WhatsApp Orders &amp; Care)
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
