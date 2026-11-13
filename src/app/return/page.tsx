import React from "react";
import Link from "next/link";
import {
  RotateCcw,
  Video,
  Clock,
  CheckCircle2,
  Mail,
  ShieldCheck,
  PackageCheck,
  CreditCard,
  MessageCircle,
  ChevronRight as BreadcrumbChevron,
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
    <div className="min-h-screen bg-white text-neutral-700 flex flex-col justify-between selection:bg-[#E5F2D0] selection:text-[#1E300E] font-mograph">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16 w-full">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500 mb-6 font-medium">
          <Link href="/" className="hover:text-[#6B9E3A] transition-colors">
            Home
          </Link>
          <BreadcrumbChevron className="w-3.5 h-3.5 text-neutral-400" />
          <span className="font-semibold text-neutral-900">Return &amp; Refund Policy</span>
        </nav>

        {/* Header Intro */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5F2D0] text-[#3B581C] text-xs font-semibold mb-3 shadow-2xs">
            <RotateCcw className="w-3.5 h-3.5 text-[#6B9E3A]" />
            <span>Customer Protection • 7-Day Replacement Guarantee</span>
          </div>

          <h1 className="font-mograph font-bold text-2xl sm:text-4xl lg:text-5xl text-neutral-950 tracking-tight leading-tight">
            Order Cancellation &amp; Return Policy
          </h1>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-neutral-600 leading-relaxed font-normal">
            Transparent and fair replacements, hassle-free order cancellations, and rapid refund timelines for Vittal Lifestyle customers across India.
          </p>

          {/* Intro card */}
          <div className="mt-5 bg-[#F8FAF4] border border-[#E5F2D0] rounded-2xl p-5 shadow-2xs text-xs sm:text-sm text-neutral-700 leading-relaxed">
            At <strong className="font-semibold text-neutral-950">Vittal Lifestyle</strong>, every item is quality-inspected and dispatched in factory-sealed tamper-evident packaging. To protect your purchase against transit damage or rare packaging anomalies, we provide a structured{" "}
            <strong className="font-semibold text-neutral-950">7-Day Replacement Guarantee</strong>.
          </div>
        </div>

        {/* 4 Feature Highlight Cards */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="w-9 h-9 rounded-xl bg-[#E5F2D0] text-[#3B581C] flex items-center justify-center mb-3">
              <Video className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-neutral-950 leading-tight font-mograph tracking-tight">Unboxing Video</h4>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-1 leading-relaxed font-normal">
              Continuous uncut video recording from outer sealed parcel to product inspection.
            </p>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="w-9 h-9 rounded-xl bg-[#E5F2D0] text-[#3B581C] flex items-center justify-center mb-3">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-neutral-950 leading-tight font-mograph tracking-tight">48-Hour Notice</h4>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-1 leading-relaxed font-normal">
              Report transit damage or physical flaws within 48 hours of doorstep delivery.
            </p>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="w-9 h-9 rounded-xl bg-[#E5F2D0] text-[#3B581C] flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-neutral-950 leading-tight font-mograph tracking-tight">7-Day Replacement</h4>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-1 leading-relaxed font-normal">
              Direct doorstep courier exchange for damaged or incorrect goods.
            </p>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="w-9 h-9 rounded-xl bg-[#E5F2D0] text-[#3B581C] flex items-center justify-center mb-3">
              <CreditCard className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-neutral-950 leading-tight font-mograph tracking-tight">100% Refunds</h4>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-1 leading-relaxed font-normal">
              Fast refunds to original source: UPI (2–4 hours) and Cards (2–4 business days).
            </p>
          </div>
        </div>

        {/* Policy Details Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-8 text-xs sm:text-sm text-neutral-600 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-neutral-950 font-bold text-base sm:text-lg border-b border-neutral-200/70 pb-2.5 font-mograph tracking-tight">
              <PackageCheck className="w-5 h-5 text-[#6B9E3A]" />
              <h2>1. Return &amp; Exchange Eligibility</h2>
            </div>
            <p>To maintain the highest hygiene, health, and quality standards:</p>
            <ul className="space-y-2 list-none pl-1">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#6B9E3A] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-neutral-950">Nutrition &amp; Food (Supplements, Dates, Nuts, Chocolates):</strong> Due to health &amp; safety protocols, consumables are eligible for replacement if received damaged, leaked, or incorrect. If returning for variant exchange, the factory container seal must be completely unopened and untampered.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#6B9E3A] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-neutral-950">Activewear &amp; Apparels:</strong> Must be unwashed, unworn, and have all original brand tags attached in original poly packaging.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-neutral-950 font-bold text-base sm:text-lg border-b border-neutral-200/70 pb-2.5 font-mograph tracking-tight">
              <RotateCcw className="w-5 h-5 text-[#6B9E3A]" />
              <h2>2. Order Cancellation Prior to Dispatch</h2>
            </div>
            <p>
              You may cancel your order free of cost at any time before dispatch by contacting our WhatsApp concierge desk or emailing us. Once a parcel has been handed over to the air/road courier and an AWB has been generated, orders cannot be cancelled mid-transit and must follow the standard return process.
            </p>
          </section>
        </div>

        {/* Contact Help Strip */}
        <div className="mt-6 bg-gradient-to-r from-[#F2F8EB] to-[#EBF5DF] rounded-3xl p-6 sm:p-8 border border-[#D5E9BC]/70 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-950 font-mograph tracking-tight">
              Need to Initiate a Return or Exchange?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 mt-0.5 font-normal">
              Our customer concierge will process your request within 4 business hours.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="inline-flex items-center gap-2 bg-white hover:bg-neutral-50 text-neutral-800 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-neutral-200/80 transition-colors shadow-2xs"
            >
              <Mail className="w-4 h-4 text-[#6B9E3A]" />
              {siteConfig.supportEmail}
            </a>
            <a
              href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%20Vittal%20Lifestyle%2C%20I%20would%20like%20to%20request%20a%20replacement`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#111111] hover:bg-black text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm font-mograph"
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
