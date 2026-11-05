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

export const metadata = {
  title: "Return & Refund Policy | Vittal Digital — Dubai Sourced Flagship Electronics",
  description:
    "Learn about Vittal Digital's 7-day replacement guarantee, order cancellation, rapid refund timelines, 1-year warranty coverage, and mandatory unboxing video guidelines.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between selection:bg-[#002D62] selection:text-white font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-16 w-full">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-[#002D62] transition-colors">
            Home
          </Link>
          <BreadcrumbChevron className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium text-slate-800">Return &amp; Refund Policy</span>
        </nav>

        {/* Header Intro */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-semibold text-[#002D62] mb-3 shadow-2xs">
            <RotateCcw className="w-3.5 h-3.5 text-[#002D62]" />
            <span>Customer Protection • 7-Day Replacement Guarantee</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight leading-tight">
            Order Cancellation &amp; Return Policy
          </h1>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-normal">
            Transparent and fair replacements, hassle-free order cancellations, and rapid refund timelines for Vittal Digital customers across India.
          </p>

          <div className="mt-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs text-xs sm:text-sm text-slate-600 leading-relaxed">
            At <strong className="font-semibold text-slate-900">Vittal Digital</strong>, every device is sourced directly from authorized Dubai retail distributors and arrives brand-new in factory-sealed manufacturer packaging. To protect your purchase against transit damage or rare factory anomalies, we provide a structured <strong className="font-semibold text-slate-900">7-Day Replacement Guarantee</strong> paired with a <strong className="font-semibold text-slate-900">1-Year Comprehensive Warranty</strong>.
          </div>
        </div>

        {/* 4 Feature Highlight Cards */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 mb-3">
              <Video className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-xs sm:text-sm text-slate-900 leading-tight">Unboxing Video</h4>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
              Mandatory continuous video recording from sealed parcel to device inspection.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-[#002D62] mb-3">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-xs sm:text-sm text-slate-900 leading-tight">48-Hour Notice</h4>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
              Report transit damage or physical flaws within 48 hours of doorstep delivery.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-xs sm:text-sm text-slate-900 leading-tight">1-Year Warranty</h4>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
              Ongoing technical repair assistance and doorstep service across 28 states.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-700 mb-3">
              <CreditCard className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-xs sm:text-sm text-slate-900 leading-tight">100% Refunds</h4>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
              Fast refunds to original source: UPI (2–4 hours) and Cards (2–4 business days).
            </p>
          </div>
        </div>

        {/* Policy Content Sections */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {/* 1. Quality Promise */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-semibold text-base sm:text-lg border-b border-slate-100 pb-2.5">
              <ShieldCheck className="w-5 h-5 text-[#002D62]" />
              <h2>1. Our Quality &amp; Authenticity Promise</h2>
            </div>
            <p>
              Each electronics unit dispatched from Vittal Digital is 100% genuine Dubai retail inventory in factory-sealed condition with original manufacturer barcodes and serial numbers. Product issues are exceptionally rare, but in the uncommon event of courier transit damage or an out-of-the-box defect, our customer care team is dedicated to rectifying it swiftly.
            </p>
          </section>

          {/* 2. Replacement Policy */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-semibold text-base sm:text-lg border-b border-slate-100 pb-2.5">
              <PackageCheck className="w-5 h-5 text-[#002D62]" />
              <h2>2. 7-Day Replacement Policy</h2>
            </div>
            <p>
              We provide brand-new replacements under the following verified conditions:
            </p>
            <ul className="space-y-2 list-none">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="font-semibold text-slate-900">Transit Damage:</strong> The device or accessories sustained physical breakage or impact damage during air transit.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="font-semibold text-slate-900">Out-of-the-Box Hardware Defect:</strong> The unit fails to power on, suffers an internal display fault, camera defect, or battery charging failure upon initial setup.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="font-semibold text-slate-900">Incorrect Item / Specification:</strong> The delivered model, color, or storage capacity differs from your confirmed invoice.</span>
              </li>
            </ul>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-950 mt-3 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Continuous Unboxing Video Requirement</span>
              </div>
              <p>
                To prevent courier fraud and ensure rapid approval, claims for physical damage or missing components <strong className="font-semibold">must be accompanied by a single continuous unboxing video</strong> recorded from before the outer courier box is opened. Claims without an unboxing video cannot be validated by logistics insurance.
              </p>
            </div>
          </section>

          {/* 3. Non-Returnable Conditions */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-semibold text-base sm:text-lg border-b border-slate-100 pb-2.5">
              <XCircle className="w-5 h-5 text-rose-600" />
              <h2>3. Non-Returnable Scenarios</h2>
            </div>
            <ul className="space-y-2 list-none text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                <span>Change of mind, buyer&apos;s remorse, or personal color preference once the original manufacturer security seal has been broken.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                <span>Devices damaged due to accidental drops, liquid spills, electrical surges, or unauthorized repair attempts after delivery.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                <span>Returned items missing the original retail box, IMEI/serial labels, bundled charging accessories, manuals, or warranty inserts.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                <span>Unauthorized software modifications, including bootloader unlocking, custom ROM installation, or root access attempts.</span>
              </li>
            </ul>
          </section>

          {/* 4. Cancellation & Refund Policy */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-semibold text-base sm:text-lg border-b border-slate-100 pb-2.5">
              <Clock className="w-5 h-5 text-[#002D62]" />
              <h2>4. Order Cancellation &amp; Refund Timelines</h2>
            </div>
            <p>
              Orders can be canceled free of charge at any point prior to courier pickup directly from your <strong className="font-semibold text-slate-900">My Orders</strong> dashboard or by messaging our WhatsApp care line. Once a package is serialized and handed over to express air cargo, cancellation cannot be processed online; you may instead request a replacement or return upon delivery.
            </p>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 text-xs text-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>100% Refund Mode &amp; Timelines</span>
              </div>
              <p>
                All refunds are credited directly back to the original payment source:
              </p>
              <ul className="space-y-1.5 list-none pl-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span><strong className="font-semibold text-slate-900">UPI (Google Pay, PhonePe, Paytm, CRED):</strong> Credited within <strong className="font-semibold text-slate-900">2 to 4 hours</strong>.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span><strong className="font-semibold text-slate-900">Debit / Credit Cards &amp; Net Banking:</strong> Credited within <strong className="font-semibold text-slate-900">2 to 4 business days</strong> depending on your issuing bank.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 5. Step-by-Step Return Process */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-semibold text-base sm:text-lg border-b border-slate-100 pb-2.5">
              <Truck className="w-5 h-5 text-[#002D62]" />
              <h2>5. Step-by-Step Return &amp; Replacement Workflow</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                <span className="text-[10px] font-semibold text-[#002D62] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">Step 1</span>
                <h4 className="font-semibold text-xs sm:text-sm text-slate-900 mt-2">Submit Claim</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                  Send your Order ID and continuous unboxing video via WhatsApp (+91 916238165935) or to support@vittaldigital.com.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                <span className="text-[10px] font-semibold text-[#002D62] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">Step 2</span>
                <h4 className="font-semibold text-xs sm:text-sm text-slate-900 mt-2">Rapid Verification</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                  Our technical claims team reviews the video and verifies serial numbers within 24 business hours.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                <span className="text-[10px] font-semibold text-[#002D62] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">Step 3</span>
                <h4 className="font-semibold text-xs sm:text-sm text-slate-900 mt-2">Doorstep Pickup</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                  We schedule a complimentary reverse pickup from your address via insured courier.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                <span className="text-[10px] font-semibold text-[#002D62] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">Step 4</span>
                <h4 className="font-semibold text-xs sm:text-sm text-slate-900 mt-2">Resolution</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                  A brand-new replacement unit is dispatched via priority air cargo or a 100% refund is initiated.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Contact Help Strip */}
        <div className="mt-8 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">Need help with a return or refund?</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-normal">Our dedicated after-sales team is ready to assist you on WhatsApp and email.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="mailto:support@vittaldigital.com"
              className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-[#002D62] text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-blue-200 transition-colors"
            >
              <Mail className="w-4 h-4 text-[#002D62]" />
              support@vittaldigital.com
            </a>
            <a
              href="https://wa.me/916238165935?text=Hi%20Vittal%20Digital%2C%20I%20need%20assistance%20with%20a%20return"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-[#25D366]/30 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              WhatsApp: +91 916238165935
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
