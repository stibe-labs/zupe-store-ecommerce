"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Mail, MapPin, Phone, ShieldCheck, ArrowUpRight, Sparkles } from "lucide-react";

const SUPPORT_LINKS = [
  { label: "Track Your Order", href: "/order-tracking" },
  { label: "WhatsApp Order & Care", href: "https://wa.me/917356765036?text=Hi%2C%20I%20have%20an%20inquiry%20about%20Turkiye%20Jam" },
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
    <footer className="bg-[#5b1420] text-white relative overflow-hidden border-t border-white/10 pt-16 pb-24 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand Logo & Mission */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center group" aria-label="Turkiye Jam">
              <div className="relative h-13 w-36 shrink-0">
                <Image
                  src="/turkiye-jam-logo.svg"
                  alt="Turkiye Jam"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-sm text-stone-200/90 leading-relaxed max-w-xs">
              Imported preserves, delivered across India. Authentic Themra Epimedium herbal formula.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-tj-serif text-lg font-bold text-white mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-stone-200">
              <li>
                <a href="#shop" className="hover:text-[#fed000] transition-colors">
                  All packs
                </a>
              </li>
              <li>
                <a href="#shop" className="hover:text-[#fed000] transition-colors">
                  240g Glass Jar
                </a>
              </li>
              <li>
                <a href="#shop" className="hover:text-[#fed000] transition-colors">
                  Single-Serve Sachets
                </a>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-tj-serif text-lg font-bold text-white mb-4">Help</h4>
            <ul className="space-y-2 text-sm text-stone-200">
              <li>
                <a href="#faq" className="hover:text-[#fed000] transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <Link href="/shipping-and-delivery" className="hover:text-[#fed000] transition-colors">
                  Shipping &amp; Delivery
                </Link>
              </li>
              <li>
                <Link href="/return" className="hover:text-[#fed000] transition-colors">
                  Returns &amp; Guarantee
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#fed000] transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-tj-serif text-lg font-bold text-white mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm text-stone-200">
              <li>
                <a
                  href="https://wa.me/917356765036"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-[#fed000] transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#fed000]" />
                  <span>+91 73567 65036</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:stibelabs@gmail.com"
                  className="inline-flex items-center gap-2 hover:text-[#fed000] transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#fed000]" />
                  <span>stibelabs@gmail.com</span>
                </a>
              </li>
              <li className="flex items-center gap-2 text-stone-300">
                <MapPin className="w-4 h-4 text-[#fed000]" />
                <span>All-India Express Delivery</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-300">
          <p>
            © 2026 Turkiye Jam. This product is not intended to diagnose, treat, cure or prevent any disease.
          </p>
          <p className="text-stone-300/80">
            Prepaid delivery across India in 1–2 days. Cash on delivery available.
          </p>
        </div>
      </div>
    </footer>
  );
}
