import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft, CheckCircle2, ShieldCheck, HelpCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Terms of Service | Zupe Store",
  description: "Terms and conditions for shopping on Zupe Store.",
};

export default function TermsOfServicePage() {
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
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Terms of Service</h1>
          </div>
          <p className="text-sm text-gray-500">Last updated: October 2026</p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-100 space-y-8 text-sm sm:text-base text-gray-600 leading-relaxed">
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-gray-900 font-semibold text-lg">
              <CheckCircle2 className="w-5 h-5 text-[#FF7A00]" />
              <h2>1. Agreement to Terms</h2>
            </div>
            <p>
              By accessing or shopping at Zupe Store, you agree to comply with and be bound by these Terms of Service. If you disagree with any part of these terms, please do not use our website.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-gray-900 font-semibold text-lg">
              <ShieldCheck className="w-5 h-5 text-[#FF7A00]" />
              <h2>2. Orders & Pricing</h2>
            </div>
            <p>
              All prices listed on Zupe Store are in Indian Rupees (INR) and inclusive of applicable taxes unless stated otherwise. We reserve the right to cancel or refuse any order in the event of pricing errors or stock unavailability.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-gray-900 font-semibold text-lg">
              <HelpCircle className="w-5 h-5 text-[#FF7A00]" />
              <h2>3. Shipping & Delivery</h2>
            </div>
            <p>
              We partner with trusted courier services across India to deliver your items safely. Delivery timelines typically range from 2 to 5 business days depending on your delivery pincode. You can track your real-time shipment status on our Order Tracking page.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-gray-900 font-semibold text-lg">
              <FileText className="w-5 h-5 text-[#FF7A00]" />
              <h2>4. Contact Us</h2>
            </div>
            <p>
              For inquiries regarding orders, products, or service terms, please contact us at{" "}
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
