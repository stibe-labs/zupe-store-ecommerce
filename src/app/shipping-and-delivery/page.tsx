import React from "react";
import Link from "next/link";
import {
  Truck,
  Clock,
  Box,
  CheckCircle2,
  Mail,
  ShieldCheck,
  PackageSearch,
  ArrowRight,
  MessageCircle,
  Plane,
  ChevronRight as BreadcrumbChevron,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/config/siteConfig";

export const metadata = {
  title: "Shipping & Delivery Policy | Vittal Lifestyle — Live Better. Feel Stronger.",
  description:
    "Learn about Vittal Lifestyle's express insured air logistics, 5-7 business days delivery timeline across India, freshness barrier packaging, and real-time WhatsApp tracking.",
};

export default function ShippingAndDeliveryPage() {
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
          <span className="font-semibold text-neutral-900">Shipping &amp; Delivery</span>
        </nav>

        {/* Header Intro */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5F2D0] text-[#3B581C] text-xs font-semibold mb-3 shadow-2xs">
            <Truck className="w-3.5 h-3.5 text-[#6B9E3A]" />
            <span>Priority Logistics • Pan-India Doorstep Delivery</span>
          </div>

          <h1 className="font-mograph font-bold text-2xl sm:text-4xl lg:text-5xl text-neutral-950 tracking-tight leading-tight">
            Shipping and Delivery Policy
          </h1>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-neutral-600 leading-relaxed font-normal">
            Fast, insured express delivery delivering lab-certified supplements, performance wear, and wholesome gourmet foods directly to your doorstep.
          </p>

          {/* Intro summary card */}
          <div className="mt-5 bg-[#F8FAF4] border border-[#E5F2D0] rounded-2xl p-5 shadow-2xs text-xs sm:text-sm text-neutral-700 leading-relaxed">
            At <strong className="font-semibold text-neutral-950">Vittal Lifestyle</strong>, every parcel is personally inspected, barcode-verified, and packed inside moisture-sealed protective packaging before courier handover. Every parcel is{" "}
            <strong className="font-semibold text-neutral-950">100% insured against loss, transit damage, or handling defects</strong> until it is safely delivered into your hands.
          </div>
        </div>

        {/* Live Order Tracking Action Banner */}
        <div className="bg-gradient-to-r from-[#F2F8EB] to-[#EBF5DF] border border-[#D5E9BC]/70 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white border border-[#D5E9BC] flex items-center justify-center shrink-0 text-[#6B9E3A] shadow-2xs">
              <PackageSearch className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-neutral-950 font-mograph tracking-tight">
                Looking to track your parcel?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
                Check live GPS milestone scans using your Order ID or registered mobile number.
              </p>
            </div>
          </div>
          <Link
            href="/order-tracking"
            className="inline-flex items-center justify-center gap-2 bg-[#111111] hover:bg-black text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm shrink-0 font-mograph"
          >
            <span>Track Your Order</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Key Highlights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="w-9 h-9 rounded-xl bg-[#E5F2D0] text-[#3B581C] flex items-center justify-center mb-3">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-neutral-950 text-xs sm:text-sm font-mograph tracking-tight">24–48 Hr Dispatch</h4>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              Batch inspection, moisture-proof seal packing, and swift courier handover.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="w-9 h-9 rounded-xl bg-[#E5F2D0] text-[#3B581C] flex items-center justify-center mb-3">
              <Plane className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-neutral-950 text-xs sm:text-sm font-mograph tracking-tight">5–7 Days Delivery</h4>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              Priority insured air and express road transit across all serviceable Indian pin codes.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="w-9 h-9 rounded-xl bg-[#E5F2D0] text-[#3B581C] flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-neutral-950 text-xs sm:text-sm font-mograph tracking-tight">100% Transit Insured</h4>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              Full monetary and replacement protection against loss, theft, or courier transit damage.
            </p>
          </div>
        </div>

        {/* Policy Details Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-8 text-xs sm:text-sm text-neutral-600 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-neutral-950 font-bold text-base sm:text-lg border-b border-neutral-200/70 pb-2.5 font-mograph tracking-tight">
              <Box className="w-5 h-5 text-[#6B9E3A]" />
              <h2>1. Order Processing &amp; Quality Packing</h2>
            </div>
            <p>Every order placed on Vittal Lifestyle undergoes strict quality verification prior to shipping:</p>
            <ul className="space-y-2 list-none pl-1">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#6B9E3A] shrink-0 mt-0.5" />
                <span><strong className="text-neutral-950">Batch &amp; Expiry Check:</strong> All supplements and gourmet dates/chocolates are inspected for airtight seal integrity and freshness expiry.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#6B9E3A] shrink-0 mt-0.5" />
                <span><strong className="text-neutral-950">Moisture-Proof Barrier:</strong> Heavy-duty shockproof bubble lining and tamper-evident outer security tape prevent exterior weather exposure or tampering.</span>
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-neutral-950 font-bold text-base sm:text-lg border-b border-neutral-200/70 pb-2.5 font-mograph tracking-tight">
              <Clock className="w-5 h-5 text-[#6B9E3A]" />
              <h2>2. Transit Timelines &amp; Delivery Expectations</h2>
            </div>
            <p>We partner with India&apos;s leading logistics providers (BlueDart, Delhivery, DTDC, Xpressbees):</p>
            <ul className="space-y-2 list-none pl-1">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#6B9E3A] shrink-0 mt-0.5" />
                <span><strong className="text-neutral-950">Metro &amp; Tier-1 Cities:</strong> 3 to 5 business days after dispatch.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#6B9E3A] shrink-0 mt-0.5" />
                <span><strong className="text-neutral-950">Tier-2, Tier-3 &amp; Rest of India:</strong> 5 to 7 business days after dispatch.</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-neutral-950 font-bold text-base sm:text-lg border-b border-neutral-200/70 pb-2.5 font-mograph tracking-tight">
              <MessageCircle className="w-5 h-5 text-[#6B9E3A]" />
              <h2>3. WhatsApp &amp; SMS Milestone Tracking</h2>
            </div>
            <p>
              Once your parcel leaves our fulfillment warehouse, you will automatically receive an SMS and WhatsApp alert with your Airway Bill (AWB) number and live tracking link. You can also view step-by-step progress directly on our{" "}
              <Link href="/order-tracking" className="text-[#6B9E3A] underline font-semibold">
                Order Tracking Page
              </Link>.
            </p>
          </section>
        </div>

        {/* Contact Strip */}
        <div className="mt-6 bg-gradient-to-r from-[#F2F8EB] to-[#EBF5DF] rounded-3xl p-6 sm:p-8 border border-[#D5E9BC]/70 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-950 font-mograph tracking-tight">
              Need Delivery Assistance?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 mt-0.5 font-normal">
              Our dispatch desk is available to assist you with address changes or expediting.
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
              href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%20Vittal%20Lifestyle%2C%20I%20have%20an%20inquiry%20about%20my%20delivery`}
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
