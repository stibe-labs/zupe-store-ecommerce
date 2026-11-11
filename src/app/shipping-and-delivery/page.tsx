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
import { siteConfig } from "@/config/siteConfig";

export const metadata = {
  title: "Shipping & Delivery Policy | Vittal Lifestyle — Live Better. Feel Stronger.",
  description:
    "Learn about Vittal Lifestyle's express insured air logistics, 5-7 business days delivery timeline across India, freshness barrier packaging, and real-time WhatsApp tracking.",
};

export default function ShippingAndDeliveryPage() {
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
          <span className="font-semibold text-white">Shipping &amp; Delivery</span>
        </nav>

        {/* Header Intro */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#272015] border border-[#D4AF37]/30 text-xs font-bold text-[#D4AF37] mb-3 font-movault uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Priority Logistics • Pan-India Doorstep Delivery</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight uppercase font-movault">
            Shipping and Delivery Policy
          </h1>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-neutral-300 leading-relaxed font-normal">
            Fast, insured express delivery delivering lab-certified supplements, performance wear, and wholesome gourmet foods directly to your doorstep.
          </p>

          <div className="mt-5 bg-[#141416] border border-white/10 rounded-2xl p-5 shadow-lg text-xs sm:text-sm text-neutral-300 leading-relaxed">
            At <strong className="font-semibold text-white">Vittal Lifestyle</strong>, every parcel is personally inspected, barcode-verified, and packed inside moisture-sealed protective packaging before courier handover. Every parcel is <strong className="font-semibold text-white">100% insured against loss, transit damage, or handling defects</strong> until it is safely delivered into your hands.
          </div>
        </div>

        {/* Live Order Tracking Action Banner */}
        <div className="bg-[#141416] border border-[#D4AF37]/30 rounded-2xl p-5 sm:p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#272015] border border-[#D4AF37]/30 flex items-center justify-center shrink-0 text-[#D4AF37]">
              <PackageSearch className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white font-movault uppercase tracking-wide">Looking to track your parcel?</h3>
              <p className="text-xs sm:text-sm text-neutral-300 mt-0.5">
                Check live GPS milestone scans using your Order ID or registered mobile number.
              </p>
            </div>
          </div>
          <Link
            href="/order-tracking"
            className="inline-flex items-center justify-center gap-2 bg-[#D4A373] hover:bg-[#c29263] text-black font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shrink-0 uppercase font-movault tracking-wider"
          >
            <span>Track Your Order</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Key Highlights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#141416] p-5 rounded-2xl border border-white/10 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#272015] border border-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center mb-3">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-xs sm:text-sm uppercase font-movault tracking-wide">24–48 Hr Dispatch</h4>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Batch inspection, moisture-proof seal packing, and swift courier handover.
            </p>
          </div>

          <div className="bg-[#141416] p-5 rounded-2xl border border-white/10 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#272015] border border-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center mb-3">
              <Plane className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-xs sm:text-sm uppercase font-movault tracking-wide">5–7 Days Delivery</h4>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Priority insured air and express road transit across all serviceable Indian pin codes.
            </p>
          </div>

          <div className="bg-[#141416] p-5 rounded-2xl border border-white/10 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#272015] border border-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-xs sm:text-sm uppercase font-movault tracking-wide">100% Transit Insured</h4>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Full monetary and replacement protection against loss, theft, or courier transit damage.
            </p>
          </div>
        </div>

        {/* Policy Details Container */}
        <div className="bg-[#141416] rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-white/10 shadow-xl space-y-8 text-xs sm:text-sm text-neutral-300 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-white font-bold text-base sm:text-lg border-b border-white/10 pb-2.5 font-movault uppercase tracking-wide">
              <Box className="w-5 h-5 text-[#D4AF37]" />
              <h2>1. Order Processing &amp; Quality Packing</h2>
            </div>
            <p>
              Every order placed on Vittal Lifestyle undergoes strict quality verification prior to shipping:
            </p>
            <ul className="space-y-2 list-none pl-1">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Batch &amp; Expiry Check:</strong> All supplements and gourmet dates/chocolates are inspected for airtight seal integrity and freshness expiry.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Moisture-Proof Barrier:</strong> Heavy-duty shockproof bubble lining and tamper-evident outer security tape prevent exterior weather exposure or tampering.</span>
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-white font-bold text-base sm:text-lg border-b border-white/10 pb-2.5 font-movault uppercase tracking-wide">
              <Clock className="w-5 h-5 text-[#D4AF37]" />
              <h2>2. Transit Timelines &amp; Delivery Expectations</h2>
            </div>
            <p>
              We partner with India&apos;s leading logistics providers (BlueDart, Delhivery, DTDC, Xpressbees):
            </p>
            <ul className="space-y-2 list-none pl-1">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Metro &amp; Tier-1 Cities:</strong> 3 to 5 business days after dispatch.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Tier-2, Tier-3 &amp; Rest of India:</strong> 5 to 7 business days after dispatch.</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-white font-bold text-base sm:text-lg border-b border-white/10 pb-2.5 font-movault uppercase tracking-wide">
              <MessageCircle className="w-5 h-5 text-[#D4AF37]" />
              <h2>3. WhatsApp &amp; SMS Milestone Tracking</h2>
            </div>
            <p>
              Once your parcel leaves our fulfillment warehouse, you will automatically receive an SMS and WhatsApp alert with your Airway Bill (AWB) number and live tracking link. You can also view step-by-step progress directly on our <Link href="/order-tracking" className="text-[#D4AF37] underline">Order Tracking Page</Link>.
            </p>
          </section>
        </div>

        {/* Contact Strip */}
        <div className="mt-8 bg-[#141416] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white font-movault uppercase tracking-wider">Need Delivery Assistance?</h3>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5 font-normal">Our dispatch desk is available to assist you with address changes or expediting.</p>
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
              href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%20Vittal%20Lifestyle%2C%20I%20have%20an%20inquiry%20about%20my%20delivery`}
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
