import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Cookie,
  Server,
  Share2,
  Lock,
  RefreshCw,
  Mail,
  CheckCircle2,
  UserCheck,
  MessageCircle,
  ChevronRight as BreadcrumbChevron,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/config/siteConfig";

export const metadata = {
  title: "Privacy Policy | Vittal Lifestyle — Live Better. Feel Stronger.",
  description:
    "Review Vittal Lifestyle's Privacy Policy to understand how we protect, handle, and secure your personal information, delivery details, and order transactions in India.",
};

export default function PrivacyPolicyPage() {
  const sections = [
    {
      id: "personal-information",
      number: "01",
      title: "Personal Information We Collect",
      icon: Cookie,
      content: (
        <div className="space-y-3">
          <p>
            When you visit or purchase from <strong className="font-semibold text-neutral-950">Vittal Lifestyle</strong>, we collect relevant details essential to process your order, provide delivery updates, and safeguard against fraud:
          </p>
          <ul className="space-y-2 list-none">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#6B9E3A] shrink-0 mt-0.5" />
              <span><strong className="font-semibold text-neutral-950">Order &amp; Delivery Data:</strong> Your full name, shipping destination, billing address, phone number, and email address provided during checkout.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#6B9E3A] shrink-0 mt-0.5" />
              <span><strong className="font-semibold text-neutral-950">Device &amp; Session Analytics:</strong> IP address, device type, browser platform, and anonymized session cookies used to preserve your shopping cart and maintain fast performance.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#6B9E3A] shrink-0 mt-0.5" />
              <span><strong className="font-semibold text-neutral-950">Zero Financial Storage:</strong> Payments are processed directly through RBI-authorized payment aggregators (<strong className="text-neutral-950">Razorpay &amp; Fastrr</strong>) using 256-bit bank-grade TLS encryption. Vittal Lifestyle <strong className="text-neutral-950">never collects, views, or stores your credit card numbers, CVVs, or UPI PINs</strong>.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "how-we-use",
      number: "02",
      title: "How We Use Your Information",
      icon: Server,
      content: (
        <div className="space-y-3">
          <p>We utilize your information strictly for legitimate business and fulfillment purposes:</p>
          <ul className="space-y-2 list-none text-neutral-700">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#6B9E3A] shrink-0 mt-0.5" />
              <span>Processing nutrition, apparel, and gourmet food orders, and dispatching insured parcels to your address.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#6B9E3A] shrink-0 mt-0.5" />
              <span>Sending real-time order confirmations, courier AWB tracking links, and milestone delivery notifications via WhatsApp, SMS, and Email.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#6B9E3A] shrink-0 mt-0.5" />
              <span>Managing 7-Day Replacement claims and personalized customer concierge consultations.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#6B9E3A] shrink-0 mt-0.5" />
              <span>Protecting customers against fraudulent bot checkouts or unauthorized card attempts.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "sharing-information",
      number: "03",
      title: "Third-Party Logistics & Service Partners",
      icon: Share2,
      content: (
        <div className="space-y-3">
          <p>We strictly do not sell, rent, or trade your personal data. We only share details with vetted fulfillment infrastructure partners:</p>
          <ul className="space-y-2 list-none text-neutral-700">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#6B9E3A] shrink-0 mt-0.5" />
              <span><strong className="text-neutral-950">Express Logistics Partners:</strong> Delivery couriers (such as BlueDart, Delhivery, DTDC, Xpressbees) to ensure speedy doorstep parcel transit.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#6B9E3A] shrink-0 mt-0.5" />
              <span><strong className="text-neutral-950">Payment Aggregators:</strong> Razorpay &amp; Fastrr for instantaneous transaction verification.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#6B9E3A] shrink-0 mt-0.5" />
              <span><strong className="text-neutral-950">Customer Messaging Services:</strong> WhatsApp Business API and SMS gateways for automated shipment alerts.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "data-security",
      number: "04",
      title: "Data Security & Encryption Protocols",
      icon: Lock,
      content: (
        <div className="space-y-3">
          <p>We maintain stringent digital safeguards to prevent unauthorized data access, leakage, or loss:</p>
          <ul className="space-y-2 list-none text-neutral-700">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#6B9E3A] shrink-0 mt-0.5" />
              <span>End-to-end HTTPS/TLS 1.3 protocol encryption across every page and checkout endpoint.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#6B9E3A] shrink-0 mt-0.5" />
              <span>Server-level token authorization and access controls preventing unauthorized database reads.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "user-rights",
      number: "05",
      title: "Your Rights & Data Preferences",
      icon: UserCheck,
      content: (
        <div className="space-y-3">
          <p>
            Under applicable Indian IT and data privacy regulations, you have full authority over your personal information. You may at any time request access to your stored profile data, request corrections to your delivery addresses, or request the deletion of your account.
          </p>
          <p>
            To submit a privacy or data request, simply contact our Data Protection Officer at{" "}
            <a href={`mailto:${siteConfig.supportEmail}`} className="text-[#6B9E3A] underline font-semibold">
              {siteConfig.supportEmail}
            </a>.
          </p>
        </div>
      ),
    },
  ];

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
          <span className="font-semibold text-neutral-900">Privacy Policy</span>
        </nav>

        {/* Header Intro */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5F2D0] text-[#3B581C] text-xs font-semibold mb-3 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#6B9E3A]" />
            <span>256-Bit Encrypted • Zero Data Selling Guarantee</span>
          </div>

          <h1 className="font-mograph font-bold text-2xl sm:text-4xl lg:text-5xl text-neutral-950 tracking-tight leading-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-neutral-600 leading-relaxed font-normal">
            Last Updated: November 2026. How Vittal Lifestyle collects, encrypts, and handles your data with integrity.
          </p>
        </div>

        {/* Policy Sections Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] divide-y divide-neutral-200/70">
          {sections.map((item) => {
            const Icon = item.icon;
            return (
              <section key={item.id} className="py-6 first:pt-0 last:pb-0 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#E5F2D0] text-[#3B581C] flex items-center justify-center font-bold text-xs shrink-0 font-mograph">
                    {item.number}
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#6B9E3A]" />
                    <h2 className="text-base sm:text-lg font-bold text-neutral-950 font-mograph tracking-tight">
                      {item.title}
                    </h2>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-neutral-600 leading-relaxed pl-11">
                  {item.content}
                </div>
              </section>
            );
          })}
        </div>

        {/* Contact Help Strip */}
        <div className="mt-6 bg-gradient-to-r from-[#F2F8EB] to-[#EBF5DF] rounded-3xl p-6 sm:p-8 border border-[#D5E9BC]/70 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-950 font-mograph tracking-tight">
              Questions regarding your privacy?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 mt-0.5 font-normal">
              Our data privacy officer is available to answer all customer inquiries.
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
              href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%20Vittal%20Lifestyle%2C%20I%20have%20a%20privacy%20question`}
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
