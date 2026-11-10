import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Cookie,
  Server,
  Share2,
  Target,
  EyeOff,
  Database,
  RefreshCw,
  Mail,
  Lock,
  ChevronRight as BreadcrumbChevron,
  MessageCircle,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy | Vittal Digital — Genuine Flagship Electronics",
  description:
    "Review Vittal Digital's Privacy Policy to understand how we protect, handle, and secure your personal information, payment credentials, and shopping data in India.",
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
            When you visit or make a purchase through <strong className="font-semibold text-slate-900">Vittal Digital</strong>, we collect relevant information necessary to process your transaction and provide a secure shopping experience:
          </p>
          <ul className="space-y-2 list-none">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong className="font-semibold text-slate-900">Order Information:</strong> Your full name, shipping address, billing address, contact mobile number, and email address collected during checkout.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong className="font-semibold text-slate-900">Technical Device Data:</strong> IP address, device model, operating system, browser type, and timestamps collected automatically to ensure system stability and cart persistence.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong className="font-semibold text-slate-900">Payment Data Security:</strong> All financial transactions are processed securely through RBI-licensed payment aggregators (<strong className="font-semibold text-slate-900">Razorpay</strong>) using 256-bit bank-grade encryption. Vittal Digital <strong className="font-semibold text-slate-900">never stores or has access to your credit/debit card numbers, CVVs, or UPI PINs</strong>.</span>
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
          <p>
            We use your personal information strictly for legitimate commercial and fulfillment purposes:
          </p>
          <ul className="space-y-2 list-none text-slate-600">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Fulfilling electronics orders, assigning hardware serial numbers, and arranging insured air courier delivery to your doorstep.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Transmitting real-time order receipts, courier AWB tracking links, and milestone delivery notifications via WhatsApp, SMS, and Email.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Managing 1-Year Comprehensive Warranty registration and after-sales service verification across India.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Screening transactions for fraudulent bot activity, unauthorized card usage, or invalid shipping addresses.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "sharing-information",
      number: "03",
      title: "Third-Party Service Providers",
      icon: Share2,
      content: (
        <div className="space-y-3">
          <p>
            We only share your data with essential third-party service providers strictly required to operate our business:
          </p>
          <ul className="space-y-2 list-none text-slate-600">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong className="font-semibold text-slate-900">Logistics &amp; Courier Partners:</strong> (Delhivery, Blue Dart, DTDC) receive your name, shipping address, and phone number exclusively for doorstep parcel delivery and OTP verification.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong className="font-semibold text-slate-900">Payment Processors:</strong> (Razorpay) for encrypted payment settlement and instant refund routing.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong className="font-semibold text-slate-900">Infrastructure &amp; Security:</strong> (Cloudflare) for high-speed edge content delivery, SSL encryption, and DDoS mitigation.</span>
            </li>
          </ul>
          <div className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed font-medium">
            🔒 <strong className="font-semibold text-slate-900">Zero Data Selling Guarantee:</strong> Vittal Digital does NOT sell, rent, monetize, or disclose your personal data to third-party marketing brokers or advertising exchanges.
          </div>
        </div>
      ),
    },
    {
      id: "whatsapp-notifications",
      number: "04",
      title: "WhatsApp & Transactional Communications",
      icon: MessageCircle,
      content: (
        <div className="space-y-3">
          <p>
            By placing an order on Vittal Digital, you consent to receive direct transactional updates on WhatsApp and SMS regarding your order status, payment receipts, courier tracking links, and doorstep delivery OTPs.
          </p>
          <p>
            We do not spam. All messages sent relate directly to your purchases, warranty coverage, or customer service tickets. You may opt out of promotional messages at any time by replying &quot;STOP&quot; on WhatsApp.
          </p>
        </div>
      ),
    },
    {
      id: "cookies-tracking",
      number: "05",
      title: "Cookies & Session Management",
      icon: EyeOff,
      content: (
        <div className="space-y-3">
          <p>
            We use essential session cookies to remember the contents of your shopping bag, persist your login state, and maintain secure checkout sessions. These cookies do not track your activity across unrelated third-party websites. You can configure your browser to reject cookies, though doing so may prevent adding items to your cart.
          </p>
        </div>
      ),
    },
    {
      id: "data-retention-security",
      number: "06",
      title: "Data Retention & DPDP Compliance",
      icon: Database,
      content: (
        <div className="space-y-3">
          <p>
            We retain order and invoice information in encrypted databases strictly for the duration necessary to satisfy warranty support obligations, tax and accounting regulations under Indian law, and dispute resolution.
          </p>
          <p>
            Our systems align with the provisions of the Digital Personal Data Protection (DPDP) Act of India. We implement industry-standard physical, electronic, and managerial safeguards to protect your personal information against unauthorized disclosure, loss, or alteration.
          </p>
        </div>
      ),
    },
    {
      id: "user-rights",
      number: "07",
      title: "Your Privacy Rights & Data Deletion Requests",
      icon: UserCheck,
      content: (
        <div className="space-y-3">
          <p>
            You have the right to request access to the personal data we hold about you, request corrections to inaccurate contact information, or request the deletion of your account and customer records.
          </p>
          <p>
            To submit a data access or deletion request, please email our privacy desk at{" "}
            <a href="mailto:support@vittaldigital.com" className="text-[#002D62] font-semibold underline underline-offset-2">
              support@vittaldigital.com
            </a>{" "}
            with the subject line &quot;Data Privacy Request&quot;. We fulfill verified requests within 15 business days.
          </p>
        </div>
      ),
    },
    {
      id: "policy-updates",
      number: "08",
      title: "Revisions to This Policy",
      icon: RefreshCw,
      content: (
        <div className="space-y-2">
          <p>
            We may update this Privacy Policy periodically to reflect enhancements in our data security protocols, logistics infrastructure, or applicable statutory regulations. The most current version will always remain accessible at{" "}
            <strong className="font-semibold text-slate-900">vittaldigital.com/privacy</strong>.
          </p>
        </div>
      ),
    },
  ];

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
          <span className="font-medium text-slate-800">Privacy Policy</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-semibold text-[#002D62] mb-3 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#002D62]" />
            <span>Data Protection • RBI &amp; DPDP Compliant</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight leading-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-normal">
            How Vittal Digital protects, manages, and respects your personal data, transaction security, and online shopping privacy.
          </p>

          <div className="mt-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs text-xs sm:text-sm text-slate-600 leading-relaxed">
            At <strong className="font-semibold text-slate-900">Vittal Digital</strong>, protecting customer privacy is central to our values. We employ bank-grade 256-bit TLS encryption, partner strictly with RBI-regulated payment aggregators, and never sell or rent your personal information to third parties.
          </div>
        </div>

        {/* Policy Sections List */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs divide-y divide-slate-100">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <section key={section.id} className="py-6 first:pt-0 last:pb-0 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-[#002D62] flex items-center justify-center font-semibold text-xs shrink-0">
                    {section.number}
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#002D62]" />
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                      {section.title}
                    </h2>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-11">
                  {section.content}
                </div>
              </section>
            );
          })}
        </div>

        {/* Contact Help Strip */}
        <div className="mt-8 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">Have privacy or data questions?</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-normal">Our grievance officer and support team are available to assist you.</p>
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
              href="https://wa.me/916238165935?text=Hi%20Vittal%20Digital%2C%20I%20have%20a%20privacy%20question"
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
