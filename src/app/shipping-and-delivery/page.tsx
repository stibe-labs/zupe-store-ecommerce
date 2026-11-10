import React from "react";
import Link from "next/link";
import {
  Truck,
  Clock,
  Package,
  Layers,
  MapPin,
  AlertTriangle,
  BadgePercent,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Video,
  FileText,
  Search,
  ArrowRight,
  ExternalLink,
  PackageSearch,
  ChevronRight as BreadcrumbChevron,
  MessageCircle,
  Plane,
  Box,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Shipping & Delivery Policy | Vittal Digital — Genuine Flagship Electronics",
  description:
    "Learn about Vittal Digital's express insured air logistics, 5-7 business days delivery timeline across India, shockproof packaging, and real-time WhatsApp tracking.",
};

export default function ShippingAndDeliveryPage() {
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
          <span className="font-medium text-slate-800">Shipping &amp; Delivery</span>
        </nav>

        {/* Header Intro */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-semibold text-[#002D62] mb-3 shadow-2xs">
            <Truck className="w-3.5 h-3.5 text-[#002D62]" />
            <span>Priority Air Logistics • Pan-India Doorstep Delivery</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight leading-tight">
            Shipping and Delivery Policy
          </h1>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-normal">
            Fast, insured express delivery delivering factory-sealed flagship electronics directly to your doorstep.
          </p>

          <div className="mt-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs text-xs sm:text-sm text-slate-600 leading-relaxed">
            At <strong className="font-semibold text-slate-900">Vittal Digital</strong>, we personally oversee every step of your shipment — from serialized barcode scanning and multi-layer shockproof boxing to priority express air transit. Every parcel is <strong className="font-semibold text-slate-900">100% insured against loss, transit damage, or handling defects</strong> until it is safely handed over to you.
          </div>
        </div>

        {/* Live Order Tracking Action Banner */}
        <div className="bg-gradient-to-r from-[#001D40] via-[#002D62] to-[#0A3D78] rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-white">
              <PackageSearch className="w-6 h-6 text-[#FFBE00]" />
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg text-white">Looking to track your parcel?</h3>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-0.5">
                Check live GPS milestone scans using your Order ID or registered mobile number.
              </p>
            </div>
          </div>
          <Link
            href="/order-tracking"
            className="inline-flex items-center justify-center gap-2 bg-[#FFBE00] hover:bg-[#e6ab00] text-[#001D40] font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-xs shrink-0 active:scale-[0.98]"
          >
            <span>Track Your Order</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Key Highlights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-[#002D62] flex items-center justify-center mb-3">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">24-Hour Dispatch</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Same-day serial number allocation, quality inspection, and courier handover.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Plane className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">5–7 Days Delivery</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Priority insured air cargo transit nationwide across all Indian pin codes.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">100% Transit Insurance</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Full monetary coverage against loss, theft, or courier damage during transit.
            </p>
          </div>
        </div>

        {/* Policy Details Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-semibold text-base sm:text-lg border-b border-slate-100 pb-2.5">
              <Box className="w-5 h-5 text-[#002D62]" />
              <h2>1. Order Processing &amp; Serialization</h2>
            </div>
            <p>
              Once your order is confirmed, our fulfillment hub allocates a genuine, factory-sealed retail unit. We verify the manufacturer serial number, scan the warranty barcode, and pack the device in specialized transit enclosures within <strong className="font-semibold text-slate-900">24 business hours</strong>.
            </p>
            <p>
              You receive an immediate order confirmation via Email and WhatsApp containing your dedicated Order ID (e.g., #VD-1001) and order summary.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-semibold text-base sm:text-lg border-b border-slate-100 pb-2.5">
              <Truck className="w-5 h-5 text-[#002D62]" />
              <h2>2. Delivery Timelines Across India</h2>
            </div>
            <p>
              We partner with premier national express air carriers (Delhivery Express, Blue Dart Apex, DTDC Air) to maintain rapid, predictable delivery:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                <span className="text-[10px] font-semibold text-[#002D62] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">Tier-1 &amp; Metros</span>
                <h4 className="font-semibold text-xs sm:text-sm text-slate-900 mt-2">5 to 6 Business Days</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                  Delhi NCR, Mumbai, Bengaluru, Chennai, Hyderabad, Kolkata, Pune, Ahmedabad.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                <span className="text-[10px] font-semibold text-[#002D62] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">Tier-2 &amp; Regional</span>
                <h4 className="font-semibold text-xs sm:text-sm text-slate-900 mt-2">6 to 7 Business Days</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                  Major state capitals, commercial centers, and district headquarters nationwide.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                <span className="text-[10px] font-semibold text-[#002D62] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">Remote &amp; Islands</span>
                <h4 className="font-semibold text-xs sm:text-sm text-slate-900 mt-2">7 to 8 Business Days</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                  North-East states, Jammu &amp; Kashmir, Andaman &amp; Nicobar, Lakshadweep.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-semibold text-base sm:text-lg border-b border-slate-100 pb-2.5">
              <Layers className="w-5 h-5 text-[#002D62]" />
              <h2>3. Heavy-Duty Shockproof Packaging Standards</h2>
            </div>
            <p>
              To ensure fragile screens, lenses, and sensitive internal chips arrive in pristine condition, we deploy a 3-layer protective packaging system:
            </p>
            <ul className="space-y-2 list-none">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="font-semibold text-slate-900">Anti-Static Inner Sleeve:</strong> Neutralizes electrostatic discharge risks during flight cargo movement.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="font-semibold text-slate-900">High-Density Shock Cushions:</strong> Thick corner reinforcement preventing drop or compression impact.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="font-semibold text-slate-900">Holographic Tamper Seal:</strong> Void-detecting security tape that visibly indicates any unauthorized opening attempt.</span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-semibold text-base sm:text-lg border-b border-slate-100 pb-2.5">
              <MessageCircle className="w-5 h-5 text-[#002D62]" />
              <h2>4. Real-Time WhatsApp &amp; SMS Milestone Tracking</h2>
            </div>
            <p>
              As soon as your shipment is dispatched, you receive a direct tracking link with your courier Air Waybill (AWB) number. Automated notifications are sent at each key event:
            </p>
            <ul className="space-y-1.5 list-none pl-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#002D62]" />
                <span><strong className="font-semibold text-slate-900">Order Dispatched:</strong> Handed over to air cargo with active AWB link.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#002D62]" />
                <span><strong className="font-semibold text-slate-900">Hub Arrival:</strong> Landed at your destination city airport logistics terminal.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#002D62]" />
                <span><strong className="font-semibold text-slate-900">Out for Delivery:</strong> Executive name and contact details with delivery OTP.</span>
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-semibold text-base sm:text-lg border-b border-slate-100 pb-2.5">
              <Video className="w-5 h-5 text-[#002D62]" />
              <h2>5. Doorstep Handover &amp; Unboxing Recommendation</h2>
            </div>
            <p>
              Deliveries are conducted via secure contactless handover requiring an SMS OTP shared only when the physical parcel is in your presence.
            </p>
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-950 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Always Record a Continuous Unboxing Video</span>
              </div>
              <p>
                When receiving your electronics package, inspect the outer tamper-evident holographic tape. We strongly advise recording a continuous unboxing video from before opening the box through powering on the device. This guarantees immediate zero-hassle coverage under our{" "}
                <Link href="/return" className="text-[#002D62] font-semibold underline underline-offset-2">
                  7-Day Replacement Guarantee
                </Link>.
              </p>
            </div>
          </section>
        </div>

        {/* Contact Help Strip */}
        <div className="mt-8 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">Have questions regarding your shipment?</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-normal">Our logistics coordinators are available on WhatsApp and email to assist you.</p>
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
              href="https://wa.me/916238165935?text=Hi%20Vittal%20Digital%2C%20I%20have%20a%20query%20about%20shipping"
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
