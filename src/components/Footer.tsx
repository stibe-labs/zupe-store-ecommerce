"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  ShieldCheck,
  BadgeCheck,
  Truck,
  RotateCcw,
  ArrowUpRight,
  Plus,
  Minus,
  Lock,
  MessageCircle,
} from "lucide-react";
import { siteConfig } from "@/config/siteConfig";
import {
  BRAND_80_THEMES,
  Logo80AnimatedMark,
} from "@/components/Logo80AnimatedMark";

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
    { label: "All Collections", href: "/products" },
    { label: "Gym Supplements", href: "/products?category=Gym+Supplements" },
    { label: "Outfits & Athleisure", href: "/products?category=Outfits" },
    { label: "Apparels & Tees", href: "/products?category=Apparels" },
    { label: "Royal Dates & Nuts", href: "/products?category=Dates+%26+Nuts" },
    { label: "Candy & Chocolates", href: "/products?category=Candy+%26+Chocolates" },
  ];

  const supportLinks = [
    { label: "Shopping Bag", href: "/cart" },
    { label: "Track Order", href: "/order-tracking" },
    { label: "My Wishlist", href: "/wishlist" },
    { label: "Shipping & Delivery", href: "/shipping-and-delivery" },
    { label: "Returns & Refunds", href: "/return" },
    { label: "Contact & Help Desk", href: "/contact" },
  ];

  const aboutLinks = [
    { label: "Our Story & Authenticity", href: "/about" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
    { label: "Contact Us", href: "/contact" },
  ];

  const trustPillars = [
    {
      icon: ShieldCheck,
      label: "100% Original",
      fullLabel: "100% Original Brands",
      desc: "Authorized sourcing only",
    },
    {
      icon: BadgeCheck,
      label: "Seal Verified",
      fullLabel: "Quality Seal Verified",
      desc: "Checked before dispatch",
    },
    {
      icon: Truck,
      label: "Free Express",
      fullLabel: "Free Express Above ₹1,499",
      desc: "Insured pan-India transit",
    },
    {
      icon: RotateCcw,
      label: "Easy Returns",
      fullLabel: "7-Day Easy Returns",
      desc: "Protected buyer guarantee",
    },
  ];

  return (
    <footer className="relative bg-[#071410] text-white/80 rounded-t-[32px] sm:rounded-t-[40px] md:rounded-t-[48px] overflow-hidden pt-8 sm:pt-12 pb-24 md:pb-14 font-mograph border-t border-[#C59B27]/30 shadow-2xl">
      {/* Subtle Champagne Gold top shimmer line */}
      <div
        aria-hidden="true"
        className="absolute inset-x-10 sm:inset-x-24 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#E5C469]/75 to-transparent"
      />

      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ================================================================= */}
        {/* INTEGRATED EMERALD-GLASS TRUST STRIP                              */}
        {/* ================================================================= */}
        <div className="rounded-2xl md:rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-sm py-4 px-3 sm:py-5 sm:px-6 mb-10 sm:mb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {trustPillars.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#0B5D44]/45 border border-[#34D399]/25 flex items-center justify-center shrink-0 text-[#E5C469]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-white leading-tight truncate">
                      <span className="sm:hidden">{item.label}</span>
                      <span className="hidden sm:inline">{item.fullLabel}</span>
                    </p>
                    <p className="text-[10.5px] sm:text-xs text-white/60 font-medium leading-tight mt-0.5 truncate">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Footer Columns (Desktop 4 Columns, Mobile Accordion) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-10 sm:pb-12 border-b border-white/10">
          {/* Brand Info Column */}
          <div className="md:col-span-4 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center group"
              aria-label={siteConfig.name}
            >
              <Logo80AnimatedMark
                theme={BRAND_80_THEMES[0]}
                surface="dark"
                mode="hover-press"
                size={44}
                withWordmark
              />
            </Link>

            <p className="text-white/65 text-xs sm:text-sm leading-relaxed max-w-sm">
              India&apos;s curated multi-brand marketplace for 100% original global nutrition, athletic apparel, royal dates, and gourmet chocolates — backed by direct authorized sourcing and insured express delivery.
            </p>

            {/* Direct Support Contact Strip */}
            <div className="pt-1 space-y-2 text-xs">
              <a
                href={`mailto:${siteConfig.supportEmail}`}
                className="flex items-center gap-2 text-white/80 hover:text-[#E5C469] transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#E5C469] shrink-0" />
                <span className="font-semibold">{siteConfig.supportEmail}</span>
              </a>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%2C%20I%20need%20help%20with%20Vittal%20Lifestyle`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#0B5D44] hover:bg-[#0F7657] text-white font-bold text-[11px] transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Concierge</span>
                </a>
                <Link
                  href="/order-tracking"
                  className="inline-flex items-center gap-1 text-[#E5C469] hover:text-white transition-colors font-semibold text-xs"
                >
                  <span>Track Order</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Desktop Column 1: Shop */}
          <div className="hidden md:block md:col-span-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-[0.18em] mb-4 text-[#E5C469]">
              Shop Departments
            </h4>
            <ul className="space-y-2.5 text-sm">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop Column 2: Customer Care */}
          <div className="hidden md:block md:col-span-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-[0.18em] mb-4 text-[#E5C469]">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-sm">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop Column 3: Company */}
          <div className="hidden md:block md:col-span-2">
            <h4 className="text-white text-xs font-bold uppercase tracking-[0.18em] mb-4 text-[#E5C469]">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile Accordion Sections */}
          <div className="md:hidden space-y-2.5">
            {[
              { key: "shop", title: "Shop Departments", links: shopLinks },
              { key: "support", title: "Customer Care", links: supportLinks },
              { key: "about", title: "Company & Policies", links: aboutLinks },
            ].map((section) => (
              <div
                key={section.key}
                className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.03]"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(section.key)}
                  className="w-full p-4 flex items-center justify-between text-left text-white font-bold text-sm cursor-pointer"
                >
                  <span>{section.title}</span>
                  {openSections[section.key] ? (
                    <Minus className="w-4 h-4 text-[#E5C469]" />
                  ) : (
                    <Plus className="w-4 h-4 text-[#E5C469]" />
                  )}
                </button>
                {openSections[section.key] && (
                  <div className="px-4 pb-4 pt-1 space-y-2 text-xs sm:text-sm border-t border-white/10">
                    {section.links.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="block py-1 text-white/70 hover:text-[#E5C469] transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Copyright & Full Indian Payment / SSL Badges */}
        <div className="pt-6 sm:pt-7 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-white/55">
          <p className="text-center lg:text-left">
            © {new Date().getFullYear()} Vittal Lifestyle. 100% Original Multi-Brand Marketplace. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {["UPI", "RuPay", "Visa", "Mastercard", "Verified COD"].map((method) => (
              <span
                key={method}
                className="px-2.5 py-1 bg-white/[0.06] rounded-lg font-bold text-white/85 border border-white/10 text-[10.5px]"
              >
                {method}
              </span>
            ))}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0B5D44]/40 rounded-lg font-bold text-[#A7F3D0] border border-[#34D399]/25 text-[10.5px]">
              <Lock className="w-3 h-3" />
              <span>256-Bit SSL</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
