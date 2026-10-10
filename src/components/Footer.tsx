"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Instagram, Twitter, Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";

const SHOP_LINKS = [
  { label: "All Products", href: "/products" },
  { label: "Tech & Gadgets", href: "/products?category=Tech+%26+Gadgets" },
  { label: "Home Essentials", href: "/products?category=Home+Essentials" },
  { label: "Deals & Offers", href: "/products?category=Deals+%26+Offers" },
];

const SUPPORT_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Track Order", href: "/order-tracking" },
  { label: "WhatsApp Support", href: "https://wa.me/919744122854?text=Hi%20Zupe%20Store%2C%20I%20have%20an%20inquiry" },
  { label: "Contact Us", href: "mailto:support@zupestore.in" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

function FooterLink({ link }: { link: { label: string; href: string } }) {
  const isExternal = link.href.startsWith("mailto:") || link.href.startsWith("http");
  if (isExternal) {
    return (
      <a
        href={link.href}
        className="text-sm text-gray-400 hover:text-[#FF7A00] transition-colors duration-200 inline-flex items-center gap-1 group py-0.5"
      >
        {link.label}
        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    );
  }
  return (
    <Link
      href={link.href}
      className="text-sm text-gray-400 hover:text-[#FF7A00] transition-colors duration-200 inline-flex items-center gap-1 group py-0.5"
    >
      {link.label}
      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

export function Footer() {
  return (
    <footer
      className="bg-[#0F172A] text-white relative overflow-hidden"
      style={{ backgroundColor: "#0F172A" }}
    >
      {/* Decorative */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FF7A00]/40 to-transparent" />
      <div className="absolute top-20 right-20 w-64 h-64 bg-[#FF7A00]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-white p-0.5 shadow-md flex items-center justify-center">
                <Image
                  src="/zupe-logo.png"
                  alt="Zupe Store"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <Image
                src="/zupe-label-white.png"
                alt="Zupestore"
                width={120}
                height={32}
                className="h-7 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-6">
              Curated modern essentials for people who appreciate thoughtful design in everyday life.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, href: "https://instagram.com" },
                { icon: Twitter, href: "https://twitter.com" },
                { icon: Mail, href: "mailto:support@zupestore.in" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#FF7A00]/20 border border-white/10 flex items-center justify-center transition-all duration-300 hover:border-[#FF7A00]/30"
                >
                  <social.icon className="w-4 h-4 text-gray-400" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Column */}
          <div className="col-span-1">
            <h4 className="font-display font-semibold text-sm text-white mb-3 tracking-wide">
              Shop
            </h4>
            <ul className="space-y-2">
              {SHOP_LINKS.map((link) => (
                <li key={link.label}>
                  <FooterLink link={link} />
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column (on mobile includes Legal underneath to keep a neat 2-col balance) */}
          <div className="col-span-1">
            <div>
              <h4 className="font-display font-semibold text-sm text-white mb-3 tracking-wide">
                Support
              </h4>
              <ul className="space-y-2">
                {SUPPORT_LINKS.map((link) => (
                  <li key={link.label}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </div>

            {/* Mobile-only Legal subsection in column 2 for perfect vertical balance */}
            <div className="md:hidden mt-5 pt-4 border-t border-white/5">
              <h4 className="font-display font-semibold text-sm text-white mb-2.5 tracking-wide">
                Legal
              </h4>
              <ul className="space-y-2">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.label}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Legal Column (Desktop view) */}
          <div className="hidden md:block col-span-1">
            <h4 className="font-display font-semibold text-sm text-white mb-3 tracking-wide">
              Legal
            </h4>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <FooterLink link={link} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Zupe Store. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#FF7A00]" />
              India
            </span>
            <a
              href="tel:+919744122854"
              className="flex items-center gap-1 hover:text-[#FF7A00] transition-colors"
            >
              <Phone className="w-3 h-3 text-[#FF7A00]" />
              +91 97441 22854
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
