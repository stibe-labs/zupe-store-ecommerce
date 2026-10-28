"use client";

import React from "react";
import Link from "next/link";
import { MessageCircle, Mail, MapPin, Phone, ShieldCheck, ArrowUpRight } from "lucide-react";

const SUPPORT_LINKS = [
  { label: "Track Your Order", href: "/order-tracking" },
  { label: "WhatsApp Order & Care", href: "https://wa.me/919744122853?text=Hi%2C%20I%20have%20an%20inquiry%20about%20Turkiye%20Jam" },
  { label: "Usage Guide (ഉപയോഗം)", href: "/#how-to-use" },
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
        className="text-sm text-gray-300 hover:text-amber-400 transition-colors duration-200 inline-flex items-center gap-1 group py-0.5"
      >
        {link.label}
        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    );
  }
  return (
    <Link
      href={link.href}
      className="text-sm text-gray-300 hover:text-amber-400 transition-colors duration-200 inline-flex items-center gap-1 group py-0.5"
    >
      {link.label}
      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#1a0508] text-white relative overflow-hidden border-t border-amber-900/40">
      {/* Decorative Turkish gold & ruby accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 via-rose-500 to-amber-600" />
      <div className="absolute top-12 right-12 w-80 h-80 bg-rose-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg font-bold text-red-950 text-xl">
                🇹🇷
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-2xl tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  Turkiye Jam
                </span>
                <span className="text-xs text-amber-400 font-medium -mt-1 tracking-wider">
                  തുർക്കി ജാം • 100% ഒറിജിനൽ
                </span>
              </div>
            </Link>

            <p className="text-sm text-gray-300 max-w-md leading-relaxed mb-6">
              തുർക്കിയിൽ നിന്ന് നേരിട്ട് എത്തിക്കുന്ന 100% ഒറിജിനൽ തെംറ എപ്പിമീഡിയം മാക്കൂൻ (Themra Epimedium Herbal Macun). സ്ത്രീകളിലും പുരുഷന്മാരിലും ശാരീരിക ശക്തി, സ്റ്റാമിന, സമയക്കൂടുതൽ എന്നിവ വർദ്ധിപ്പിക്കുന്ന ലോകപ്രശസ്തമായ അത്ഭുത ഉൽപ്പന്നം.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-amber-300 font-medium">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> 100% ഒറിജിനൽ & ഗ്യാരണ്ടി
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                📦 രഹസ്യമായ പാക്കിങ്
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                🚚 കേരളത്തിൽ 1-Day ഡെലിവറി
              </span>
            </div>
          </div>

          {/* Customer Care / Support */}
          <div>
            <h4 className="font-semibold text-sm text-amber-400 mb-3 tracking-wide uppercase">
              Customer Support
            </h4>
            <ul className="space-y-2">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <FooterLink link={link} />
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Policy */}
          <div>
            <h4 className="font-semibold text-sm text-amber-400 mb-3 tracking-wide uppercase">
              Trust & Policies
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
        <div className="mt-12 pt-6 border-t border-amber-950 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Turkiye Jam (turkiyejam.com). All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Kerala, India
            </span>
            <a
              href="https://wa.me/919744122853"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-amber-300 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              +91 97441 22853 (WhatsApp Orders)
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
