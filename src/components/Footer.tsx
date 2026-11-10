"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MessageCircle,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  BadgeCheck,
  Truck,
  Check,
  ArrowUpRight,
  Sparkles,
  ChevronDown,
  Plus,
  Minus,
  CheckCircle2,
} from "lucide-react";
import { siteConfig } from "@/config/siteConfig";

export function Footer() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    shop: false,
    support: false,
    about: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const shopLinks = [
    { label: "Laptops", href: "/products?category=Laptops" },
    { label: "Tablets", href: "/products?category=Tablets" },
    { label: "Smartwatches", href: "/products?category=Smartwatches" },
    { label: "Speakers", href: "/products?category=Speakers" },
    { label: "Headphones & Earbuds", href: "/products?category=Headphones+%26+Earbuds" },
    { label: "Smartphones", href: "/products?category=Smartphones" },
    { label: "Gaming & Accessories", href: "/products?category=Gaming+%26+Accessories" },
    { label: "Smart Gadgets", href: "/products?category=Smart+Gadgets" },
  ];

  const supportLinks = [
    { label: "Track Order", href: "/order-tracking" },
    { label: "Shipping & Delivery", href: "/shipping-and-delivery" },
    { label: "Returns & Refunds", href: "/return" },
    { label: "Warranty & Compatibility", href: "/#reviews" },
    { label: "Contact Us (WhatsApp)", href: `https://wa.me/${siteConfig.whatsappNumber}` },
  ];

  const aboutLinks = [
    { label: "Our Story", href: "/about" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
    { label: "Email Support", href: `mailto:${siteConfig.supportEmail}` },
  ];

  return (
    <footer className="bg-[#00223D] text-slate-300 border-t border-blue-950/60 pt-5 sm:pt-8 pb-24 md:pb-16 font-sans">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-8">
        {/* ================================================================= */}
        {/* UPPER INSIDE FOOTER: SLIM WHITE CURVED CARD (4 BADGES IN 1 ROW)   */}
        {/* ================================================================= */}
        <div className="bg-white text-slate-900 rounded-xl sm:rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-md py-2.5 px-1.5 sm:py-3.5 sm:px-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-4 divide-x divide-slate-100 items-center text-center">
            {[
              {
                icon: BadgeCheck,
                label: "100% Authentic",
                desc: "Factory sealed",
              },
              {
                icon: ShieldCheck,
                label: "1-Yr Warranty",
                fullLabel: "1-Year Warranty",
                desc: "All-India service",
              },
              {
                icon: Truck,
                label: "Fast Delivery",
                fullLabel: "Express Delivery",
                desc: "5-7 days air",
              },
              {
                icon: Check,
                label: "Secure Checkout",
                desc: "UPI & Cards",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex flex-col items-center justify-center px-1 sm:px-2 md:px-3 text-center"
                >
                  <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shadow-2xs mb-0.5 sm:mb-1 shrink-0">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#002D62]" />
                  </div>
                  <p className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-900 leading-tight">
                    <span className="sm:hidden">{item.label}</span>
                    <span className="hidden sm:inline">{item.fullLabel || item.label}</span>
                  </p>
                  <p className="text-[8px] sm:text-[10px] md:text-xs text-slate-500 font-medium leading-tight mt-0.5 truncate max-w-full">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Footer Columns (Desktop 4 Columns, Mobile Stacked/Accordion) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-blue-900/50">
          {/* Brand Info Column */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center group" aria-label={siteConfig.name}>
              <div className="relative h-12 w-44 shrink-0">
                <Image
                  src="/vittal-digital-logo-white.png"
                  alt={siteConfig.name}
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Explore authentic flagship electronics delivered across India with full 1-year warranty and express logistics.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-blue-200/80">
              <span className="flex items-center gap-1.5 bg-blue-950/80 border border-blue-800/60 px-3 py-1 rounded-full">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                Pan-India Express
              </span>
              <span className="flex items-center gap-1.5 bg-blue-950/80 border border-blue-800/60 px-3 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                1-Year Warranty
              </span>
            </div>
          </div>

          {/* Desktop Column 1: Shop */}
          <div className="hidden md:block md:col-span-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              Shop
            </h4>
            <ul className="space-y-2.5 text-sm">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors duration-200 text-slate-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop Column 2: Customer Support */}
          <div className="hidden md:block md:col-span-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors duration-200 text-slate-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop Column 3: About */}
          <div className="hidden md:block md:col-span-2">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              About
            </h4>
            <ul className="space-y-2.5 text-sm">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors duration-200 text-slate-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile Accordion Sections */}
          <div className="md:hidden space-y-3">
            {/* Mobile Shop Accordion */}
            <div className="border border-blue-900/60 rounded-xl overflow-hidden bg-blue-950/40">
              <button
                onClick={() => toggleSection("shop")}
                className="w-full p-4 flex items-center justify-between text-left text-white font-bold text-sm"
              >
                <span>Shop</span>
                {openSections.shop ? <Minus className="w-4 h-4 text-blue-300" /> : <Plus className="w-4 h-4 text-blue-300" />}
              </button>
              {openSections.shop && (
                <div className="px-4 pb-4 pt-1 space-y-2 text-sm border-t border-blue-900/40">
                  {shopLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="block py-1 text-slate-400 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Support Accordion */}
            <div className="border border-blue-900/60 rounded-xl overflow-hidden bg-blue-950/40">
              <button
                onClick={() => toggleSection("support")}
                className="w-full p-4 flex items-center justify-between text-left text-white font-bold text-sm"
              >
                <span>Customer Support</span>
                {openSections.support ? <Minus className="w-4 h-4 text-blue-300" /> : <Plus className="w-4 h-4 text-blue-300" />}
              </button>
              {openSections.support && (
                <div className="px-4 pb-4 pt-1 space-y-2 text-sm border-t border-blue-900/40">
                  {supportLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="block py-1 text-slate-400 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile About Accordion */}
            <div className="border border-blue-900/60 rounded-xl overflow-hidden bg-blue-950/40">
              <button
                onClick={() => toggleSection("about")}
                className="w-full p-4 flex items-center justify-between text-left text-white font-bold text-sm"
              >
                <span>About</span>
                {openSections.about ? <Minus className="w-4 h-4 text-blue-300" /> : <Plus className="w-4 h-4 text-blue-300" />}
              </button>
              {openSections.about && (
                <div className="px-4 pb-4 pt-1 space-y-2 text-sm border-t border-blue-900/40">
                  {aboutLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="block py-1 text-slate-400 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} VITTAL DIGITAL. All rights reserved.</p>

          {/* Payment Badges (UPI, Visa, Mastercard) */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-white/10 rounded font-bold text-slate-200 border border-white/15 text-[11px]">
              UPI
            </span>
            <span className="px-2.5 py-1 bg-white/10 rounded font-bold text-slate-200 border border-white/15 text-[11px]">
              Visa
            </span>
            <span className="px-2.5 py-1 bg-white/10 rounded font-bold text-slate-200 border border-white/15 text-[11px]">
              Mastercard
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
