import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy | Zupe Store",
  description: "Read about how Zupe Store protects and manages your personal information and privacy.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#FF7A00] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#FF7A00]/10 flex items-center justify-center text-[#FF7A00]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-sm text-gray-500">Last updated: October 2026</p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-100 space-y-8 text-sm sm:text-base text-gray-600 leading-relaxed">
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-gray-900 font-semibold text-lg">
              <Eye className="w-5 h-5 text-[#FF7A00]" />
              <h2>1. Information We Collect</h2>
            </div>
            <p>
              When you place an order, create an account, or contact us at Zupe Store, we collect information necessary to fulfill your orders and provide support. This includes your name, shipping address, contact phone number, email address, and order transaction details.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-gray-900 font-semibold text-lg">
              <Lock className="w-5 h-5 text-[#FF7A00]" />
              <h2>2. How We Use Your Information</h2>
            </div>
            <p>
              We use your personal information solely to process and deliver your orders, send order status updates via SMS or WhatsApp, handle customer inquiries, and improve our store experience. We do not sell or rent your personal data to any third parties.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-gray-900 font-semibold text-lg">
              <CheckCircle2 className="w-5 h-5 text-[#FF7A00]" />
              <h2>3. Payment & Data Security</h2>
            </div>
            <p>
              All online payments are securely processed through encrypted, industry-standard payment gateways. Zupe Store does not store your credit card, debit card, or UPI credentials on our servers.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-gray-900 font-semibold text-lg">
              <FileText className="w-5 h-5 text-[#FF7A00]" />
              <h2>4. Contact Us</h2>
            </div>
            <p>
              If you have any questions about this Privacy Policy or your personal information, please reach out to our team at{" "}
              <a href="mailto:support@zupestore.in" className="text-[#FF7A00] font-medium hover:underline">
                support@zupestore.in
              </a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
