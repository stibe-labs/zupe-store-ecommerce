"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Mail, MapPin, Phone, ShieldCheck, ArrowUpRight, Sparkles } from "lucide-react";

const SUPPORT_LINKS = [
  { label: "Track Your Order", href: "/order-tracking" },
  { label: "WhatsApp Order & Care", href: "https://wa.me/919744122853?text=Hi%2C%20I%20have%20an%20inquiry%20about%20Turkiye%20Jam" },
  { label: "How to Use & Dosage", href: "/#usage" },
  { label: "Customer Reviews", href: "/#reviews" },
  { label: "Authenticity & Heritage", href: "/#about" },
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
        className="text-sm text-stone-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 group py-1"
      >
        <span>{link.label}</span>
        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-[#ff6b68]" />
      </a>
    );
  }
  return (
    <Link
      href={link.href}
      className="text-sm text-stone-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 group py-1"
    >
      <span>{link.label}</span>
      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-[#ff6b68]" />
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#09090b] text-white relative overflow-hidden border-t border-white/10">
      {/* Specular Apple Glass Top Border Light */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#cb0805]/60 to-transparent blur-sm" />

      {/* Ambient background glows */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#cb0805]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-12 right-0 w-80 h-80 bg-[#cb0805]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 md:pb-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand */}
          <div className="md:col-span-2 space-y-6">
            <Link href="/" className="inline-flex items-center group" aria-label="Turkiye Jam">
              <div className="relative h-12 sm:h-14 w-28 sm:w-32 flex items-center justify-start shrink-0">
                <Image
                  src="/turkiye-jam-logo.png"
                  alt="Turkiye Jam"
                  width={180}
                  height={90}
                  className="h-full w-auto object-contain drop-shadow-[0_2px_12px_rgba(203,8,5,0.3)] group-hover:scale-105 transition-transform"
                />
              </div>
            </Link>

            <p className="text-sm text-stone-400 max-w-md leading-relaxed">
              Directly imported authentic Themra Epimedium Herbal Macun from Turkey. A revered 100% natural formulation blending Epimedium, Red Ginseng, Royal Jelly, and Pure Anatolian Honey for enhanced stamina, intimate vitality, and mutual passion.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] backdrop-blur-md border border-white/10 text-xs text-stone-300 font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#ff6b68]" /> 100% Original Turkish Import
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] backdrop-blur-md border border-white/10 text-xs text-stone-300 font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
                📦 Discreet Box Delivery
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] backdrop-blur-md border border-white/10 text-xs text-stone-300 font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
                ⚡ 1–2 Day Express Kerala
              </span>
            </div>
          </div>

          {/* Customer Care / Support */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#cb0805]" />
              Customer Support
            </h4>
            <ul className="space-y-1.5">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <FooterLink link={link} />
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Policy */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Trust &amp; Legal
            </h4>
            <ul className="space-y-1.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <FooterLink link={link} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-500">
            © {new Date().getFullYear()} Turkiye Jam (turkiyejam.com). All rights reserved. 100% Genuine Certified.
          </p>
          <div className="flex flex-wrap items-center gap-5 text-xs text-stone-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              Pan-India Express Logistics
            </span>
            <a
              href="https://wa.me/919744122853"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-stone-300 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#ff6b68]" />
              +91 97441 22853 (WhatsApp Support)
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
