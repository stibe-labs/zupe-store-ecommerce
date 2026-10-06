"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Instagram, Twitter, Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";

const FOOTER_LINKS = {
  Shop: [
    { label: "All Products", href: "/products" },
    { label: "Decor", href: "/products?category=Decor" },
    { label: "Accessories", href: "/products?category=Accessories" },
    { label: "Essentials", href: "/products?category=Essentials" },
    { label: "Modern Living", href: "/products?category=Modern+Living" },
  ],
  Support: [
    { label: "Contact Us", href: "/contact" },
    { label: "FAQs", href: "/faq" },
    { label: "Shipping Info", href: "/shipping" },
    { label: "Returns & Exchange", href: "/returns" },
    { label: "Track Order", href: "/order-tracking" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Our Story", href: "/story" },
    { label: "Careers", href: "/careers" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#1A1A2E] text-white relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FA521C]/40 to-transparent" />
      <div className="absolute top-20 right-20 w-64 h-64 bg-[#FA521C]/5 rounded-full blur-3xl" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-14 relative z-10">
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
              <span className="font-display font-black text-2xl tracking-tight text-white">
                Zupe<span className="text-[#FA521C]">store</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-6">
              Curated modern essentials for people who appreciate thoughtful design in everyday life.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Mail, href: "mailto:hello@zupestore.com" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#FA521C]/20 border border-white/10 flex items-center justify-center transition-all duration-300 hover:border-[#FA521C]/30"
                >
                  <social.icon className="w-4 h-4 text-gray-400" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Groups */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-semibold text-sm text-white mb-4 tracking-wide">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-[#FA521C] transition-colors duration-200 flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Zupe Store. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              India
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              Support
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
