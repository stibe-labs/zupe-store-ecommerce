"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Mail, MapPin, Phone, ShieldCheck, ArrowUpRight, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/siteConfig";

const SUPPORT_LINKS = [
  { label: "Track Your Order", href: "/order-tracking" },
  { label: "WhatsApp Order & Care", href: `https://wa.me/${siteConfig.whatsappNumber}?text=Hi%2C%20I%20have%20an%20inquiry%20about%20${encodeURIComponent(siteConfig.name)}` },
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
    <footer className="bg-[#5b1420] text-white relative overflow-hidden border-t border-white/10 pt-10 sm:pt-16 pb-24 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-16">
          {/* Brand Logo & Mission */}
          <div className="space-y-3 sm:space-y-4">
            <Link href="/" className="inline-flex items-center group" aria-label={siteConfig.name}>
              <div className="relative h-11 sm:h-13 w-32 sm:w-36 shrink-0">
                <Image
                  src={siteConfig.logoUrl}
                  alt={siteConfig.name}
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-stone-200/90 leading-relaxed max-w-xs">
              Imported preserves, delivered across India. Authentic Themra Epimedium herbal formula.
            </p>
          </div>

          {/* 3 Link Columns: Shop, Help, Contact - 3 columns on mobile matching des.svg */}
          <div className="md:col-span-3 grid grid-cols-3 gap-3 sm:gap-8">
            {/* Shop */}
            <div>
              <h4 className="font-tj-serif text-sm sm:text-lg font-bold text-white mb-2.5 sm:mb-4">Shop</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-stone-200">
                <li>
                  <a href="#shop" className="hover:text-[#fed000] transition-colors">
                    All packs
                  </a>
                </li>
                <li>
                  <a href="#shop" className="hover:text-[#fed000] transition-colors">
                    240g Jar
                  </a>
                </li>
                <li>
                  <a href="#shop" className="hover:text-[#fed000] transition-colors">
                    Sachets
                  </a>
                </li>
              </ul>
            </div>

            {/* Help */}
            <div>
              <h4 className="font-tj-serif text-sm sm:text-lg font-bold text-white mb-2.5 sm:mb-4">Help</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-stone-200">
                <li>
                  <a href="#faq" className="hover:text-[#fed000] transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <Link href="/shipping-and-delivery" className="hover:text-[#fed000] transition-colors">
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link href="/return" className="hover:text-[#fed000] transition-colors">
                    Returns
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-[#fed000] transition-colors">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-tj-serif text-sm sm:text-lg font-bold text-white mb-2.5 sm:mb-4">Contact</h4>
              <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-stone-200">
                <li>
                  <a
                    href={`https://wa.me/${siteConfig.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-[#fed000] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#fed000] shrink-0" />
                    <span className="text-[11px] sm:text-sm whitespace-nowrap">{siteConfig.supportPhone}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${siteConfig.supportEmail}`}
                    className="inline-flex items-center gap-1.5 hover:text-[#fed000] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#fed000] shrink-0" />
                    <span className="text-[11px] sm:text-sm truncate max-w-[90px] sm:max-w-none">{siteConfig.supportEmail}</span>
                  </a>
                </li>
                <li className="flex items-center gap-1.5 text-stone-300">
                  <MapPin className="w-3.5 h-3.5 text-[#fed000] shrink-0" />
                  <span className="text-[11px] sm:text-sm">All-India Delivery</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-stone-300 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. This product is not intended to diagnose, treat, cure or prevent any disease.
          </p>
          <p className="text-stone-300/80">
            Prepaid delivery across India in 1–2 days. Cash on delivery available.
          </p>
        </div>
      </div>
    </footer>
  );
}
