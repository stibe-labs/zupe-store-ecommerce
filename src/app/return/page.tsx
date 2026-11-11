import React from "react";
import Link from "next/link";
import {
  RotateCcw,
  Video,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Mail,
  ShieldCheck,
  PackageCheck,
  CreditCard,
  Truck,
  ChevronRight as BreadcrumbChevron,
  MessageCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/config/siteConfig";

export const metadata = {
  title: "Return & Refund Policy | Vittal Lifestyle — Live Better. Feel Stronger.",
  description:
    "Learn about Vittal Lifestyle's 7-day replacement guarantee, order cancellation, rapid refund timelines, and unboxing video guidelines.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-[#070708] text-white flex flex-col justify-between selection:bg-[#D4A373] selection:text-black font-mograph">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-16 w-full">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-400 mb-6">
          <Link href="/" className="hover:text-[#D4A373] transition-colors">
            Home
          </Link>
          <BreadcrumbChevron className="w-3.5 h-3.5 text-neutral-600" />
          <span className="font-semibold text-white">Return &amp; Refund Policy</span>
        </nav>

        {/* Header Intro */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#272015] border border-[#D4AF37]/30 text-xs font-bold text-[#D4AF37] mb-3 font-movault uppercase tracking-wider">
            <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Customer Protection • 7-Day Replacement Guarantee</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight uppercase font-movault">
            Order Cancellation &amp; Return Policy
          </h1>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-neutral-300 leading-relaxed font-normal">
            Transparent and fair replacements, hassle-free order cancellations, and rapid refund timelines for Vittal Lifestyle customers across India.
          </p>

          <div className="mt-5 bg-[#141416] border border-white/10 rounded-2xl p-5 shadow-lg text-xs sm:text-sm text-neutral-300 leading-relaxed">
            At <strong className="font-semibold text-white">Vittal Lifestyle</strong>, every item is quality-inspected and dispatched in factory-sealed tamper-evident packaging. To protect your purchase against transit damage or rare packaging anomalies, we provide a structured <strong className="font-semibold text-white">7-Day Replacement Guarantee</strong>.
          </div>
        </div>

        {/* 4 Feature Highlight Cards */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#141416] border border-white/10 rounded-2xl p-4 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#272015] border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] mb-3">
              <Video className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-white leading-tight uppercase font-movault tracking-wide">Unboxing Video</h4>
            <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 leading-relaxed font-normal">
              Continuous uncut video recording from outer sealed parcel to product inspection.
            </p>
          </div>

          <div className="bg-[#141416] border border-white/10 rounded-2xl p-4 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#272015] border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] mb-3">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-white leading-tight uppercase font-movault tracking-wide">48-Hour Notice</h4>
            <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 leading-relaxed font-normal">
              Report transit damage or physical flaws within 48 hours of doorstep delivery.
            </p>
          </div>

          <div className="bg-[#141416] border border-white/10 rounded-2xl p-4 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#272015] border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-white leading-tight uppercase font-movault tracking-wide">7-Day Replacement</h4>
            <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 leading-relaxed font-normal">
              Direct doorstep courier exchange for damaged or incorrect goods.
            </p>
          </div>

          <div className="bg-[#141416] border border-white/10 rounded-2xl p-4 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#272015] border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] mb-3">
              <CreditCard className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-white leading-tight uppercase font-movault tracking-wide">100% Refunds</h4>
            <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 leading-relaxed font-normal">
              Fast refunds to original source: UPI (2–4 hours) and Cards (2–4 business days).
            </p>
          </div>
        </div>

        {/* Policy Details Container */}
        <div className="bg-[#141416] rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-white/10 shadow-xl space-y-8 text-xs sm:text-sm text-neutral-300 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-white font-bold text-base sm:text-lg border-b border-white/10 pb-2.5 font-movault uppercase tracking-wide">
              <PackageCheck className="w-5 h-5 text-[#D4AF37]" />
              <h2>1. Return &amp; Exchange Eligibility</h2>
            </div>
            <p>
              To maintain the highest hygiene, health, and quality standards:
            </p>
            <ul className="space-y-2 list-none pl-1">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Nutrition &amp; Food (Supplements, Dates, Nuts, Chocolates):</strong> Due to health &amp; safety protocols, consumables are eligible for replacement if received damaged, leaked, or incorrect. If returning for variant exchange, the factory container seal must be completely unopened and untampered.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Activewear &amp; Apparels:</strong> Must be unwashed, unworn, and have all original brand tags attached in original poly packaging.</span>
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-white font-bold text-base sm:text-lg border-b border-white/10 pb-2.5 font-movault uppercase tracking-wide">
              <RotateCcw className="w-5 h-5 text-[#D4AF37]" />
              <h2>2. Order Cancellation Prior to Dispatch</h2>
            </div>
            <p>
              You may cancel your order free of cost at any time before dispatch by contacting our WhatsApp concierge desk or emailing us. Once a parcel has been handed over to the air/road courier and an AWB has been generated, orders cannot be cancelled mid-transit and must follow the standard return process.
            </p>
          </section>
        </div>

        {/* Contact Help Strip */}
        <div className="mt-8 bg-[#141416] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white font-movault uppercase tracking-wider">Need to Initiate a Return or Exchange?</h3>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5 font-normal">Our customer concierge will process your request within 4 business hours.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-white/10 transition-colors"
            >
              <Mail className="w-4 h-4 text-[#D4AF37]" />
              {siteConfig.supportEmail}
            </a>
            <a
              href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%20Vittal%20Lifestyle%2C%20I%20would%20like%20to%20request%20a%20replacement`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#D4A373] hover:bg-[#c29263] text-black text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-md font-movault uppercase tracking-wider"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Help
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
