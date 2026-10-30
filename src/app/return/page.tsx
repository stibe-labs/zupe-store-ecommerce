import React from "react";
import Link from "next/link";
import {
  RotateCcw,
  ArrowLeft,
  Video,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Mail,
  ShieldCheck,
  PackageCheck,
  Phone,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Return & Exchange Policy | Zupe Store India",
  description:
    "Learn about Zupe Store return and cancellation policy, including eligible products, return requests, refunds, damaged orders, and unboxing video requirements.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#FF7A00] transition-colors mb-4 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF7A00]">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 tracking-tight">
                Order Cancellation and Return Policy
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Transparent and fair returns for Zupe Store customers
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm text-sm sm:text-base text-gray-600 leading-relaxed">
            At <strong className="text-gray-900">Zupe Store</strong>, we take pride in personally handling every part of your shopping journey — from product selection to secure packaging and delivery. Every product is <strong className="text-gray-900">handpicked, quality-checked, and packed with care</strong> to ensure you receive the best experience.
          </div>
        </div>

        {/* Highlights / Warning Notice */}
        <div className="mb-8 grid sm:grid-cols-2 gap-4">
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 text-amber-950 flex items-start gap-3 shadow-sm">
            <Video className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Mandatory Unboxing Video</h4>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                A clear, uninterrupted video recorded from the moment the sealed parcel is opened is required for any return/replacement claim.
              </p>
            </div>
          </div>
          <div className="bg-orange-50/80 border border-orange-200 rounded-2xl p-5 text-orange-950 flex items-start gap-3 shadow-sm">
            <Clock className="w-6 h-6 text-[#FF7A00] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">24-Hour Claim Window</h4>
              <p className="text-xs text-orange-800 mt-1 leading-relaxed">
                Requests for damaged, defective, or incorrect products must be submitted within 24 hours of package delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Content Sections */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100 space-y-9 text-sm sm:text-base text-gray-600 leading-relaxed">
          {/* 1. Our Quality Promise */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
              <ShieldCheck className="w-5 h-5 text-[#FF7A00]" />
              <h2>Our Quality Promise</h2>
            </div>
            <p>
              Each item sold on Zupe Store undergoes strict quality inspection before dispatch. <strong className="text-gray-900">Product issues are extremely rare</strong>, but if something goes wrong, we are here to assist you.
            </p>
          </section>

          {/* 2. Refund & Replacement Policy */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
              <PackageCheck className="w-5 h-5 text-[#FF7A00]" />
              <h2>Refund &amp; Replacement Policy</h2>
            </div>
            <ul className="space-y-2.5 list-none">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-1" />
                <span>Refunds or replacements are only applicable <strong className="text-gray-900">if the product is damaged, defective, or incorrect</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-1" />
                <span>A <strong className="text-gray-900">clear unboxing video is mandatory</strong>, recorded from the moment the package is opened showing the issue.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-1" />
                <span>Requests must be raised within <strong className="text-gray-900">24 hours of delivery</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5 bg-red-50/70 border border-red-100 rounded-xl p-3 text-red-900 font-medium">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span><strong>Claims without an unboxing video will not be accepted under any circumstances.</strong></span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-1" />
                <span>Once verified, our team will process a replacement or refund accordingly.</span>
              </li>
            </ul>
          </section>

          {/* 3. Non-Returnable Conditions */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <h2>Non-Returnable Conditions</h2>
            </div>
            <ul className="space-y-2 list-none text-gray-700">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                <span>Change of mind or personal preference.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                <span>Incorrect expectations or misunderstanding of product functionality.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                <span>Products that have been used or handled after delivery (unless defective).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                <span>Minor variations in color, size, or design.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                <span>If the product matches the description provided on the website.</span>
              </li>
            </ul>
          </section>

          {/* 4. Product Usage Disclaimer */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
              <HelpCircle className="w-5 h-5 text-[#FF7A00]" />
              <h2>Product Usage Disclaimer</h2>
            </div>
            <p>
              Customers are advised to carefully read product descriptions before placing an order. Zupe Store is <strong className="text-gray-900">not responsible for returns based on incorrect assumptions about product usage, features, or power requirements</strong>.
            </p>
          </section>

          {/* 5. Cancellations & Refunds */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
              <Clock className="w-5 h-5 text-[#FF7A00]" />
              <h2>Order Cancellation &amp; Refund Policy</h2>
            </div>
            <p>
              Orders can be canceled anytime before they are packed or dispatched for shipping directly from your <strong className="text-gray-900">My Orders</strong> page or via the link in your WhatsApp verification message. Once an order is handed over to our courier partner and marked as dispatched, it cannot be canceled online.
            </p>

            {/* Prepaid Refunds Box */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 space-y-2.5 text-emerald-950">
              <h4 className="font-bold text-sm sm:text-base flex items-center gap-2 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Prepaid Online Orders (100% Refund)
              </h4>
              <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                When you cancel a prepaid order before dispatch, a <strong className="text-emerald-950">100% full refund</strong> is processed directly to your original payment source (UPI, Debit/Credit Card, or Netbanking). For priority verification, our billing desk coordinates directly via WhatsApp (<strong className="text-emerald-950">+91 97441 22853</strong>) with your order and payment details to ensure immediate credit.
              </p>
              <div className="bg-white/80 rounded-xl p-3 border border-emerald-200 text-xs sm:text-sm space-y-1 text-emerald-900">
                <div className="font-semibold text-emerald-950">Expected Credit Timeline:</div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700">•</span>
                  <span><strong>UPI (GPay, PhonePe, Paytm):</strong> Usually credited within <strong>12-24 hours</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700">•</span>
                  <span><strong>Debit / Credit Cards / Netbanking:</strong> Credited within <strong>2 to 4 business days</strong>.</span>
                </div>
              </div>
            </div>

            {/* Cash on Delivery Policy Box */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 space-y-2.5 text-amber-950">
              <h4 className="font-bold text-sm sm:text-base flex items-center gap-2 text-amber-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Cash on Delivery (COD) Orders &amp; ₹10 Advance Fee (100% Refundable)
              </h4>
              <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                When you cancel a Cash on Delivery order before dispatch, the remaining balance due at doorstep is completely canceled, and our logistics partner will not deliver the parcel.
              </p>
              <div className="bg-white/80 rounded-xl p-3 border border-amber-200 text-xs sm:text-sm text-amber-900 leading-relaxed">
                <strong>Refund Guarantee:</strong> The <strong>₹10 advance confirmation fee</strong> paid during checkout is <strong>100% refundable</strong> upon order cancellation before courier dispatch. Our billing desk verifies your cancellation and coordinates the ₹10 refund directly back to your original UPI account or payment method via WhatsApp (<strong className="text-amber-950">+91 97441 22853</strong>).
              </div>
            </div>
          </section>

          {/* 6. Our Commitment */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
              <ShieldCheck className="w-5 h-5 text-[#FF7A00]" />
              <h2>Our Commitment</h2>
            </div>
            <p>
              We ensure secure packaging, smooth delivery, and responsive customer support. If something genuinely goes wrong, we will resolve it fairly and transparently.
            </p>
          </section>

          {/* 7. Contact Us */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
              <Mail className="w-5 h-5 text-[#FF7A00]" />
              <h2>Contact Us</h2>
            </div>
            <p>
              For any concerns or support regarding your order, please contact us at:
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="mailto:zupestoreonline@gmail.com"
                className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-950 font-semibold px-4 py-2 rounded-xl hover:bg-orange-100 transition-colors"
              >
                📧 zupestoreonline@gmail.com
              </a>
              <a
                href="https://wa.me/919744122853?text=Hi%20Zupe%20Store%2C%20I%20need%20assistance%20with%20my%20order"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-950 font-semibold px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors"
              >
                💬 WhatsApp Support
              </a>
            </div>
          </section>

          {/* 8. Thank You Note */}
          <div className="bg-gradient-to-r from-orange-50 via-white to-orange-50 rounded-2xl p-6 border border-orange-100 text-center">
            <h3 className="font-display font-bold text-gray-900 text-lg mb-1">
              Thank You for Choosing Zupe Store
            </h3>
            <p className="text-sm text-gray-600 max-w-lg mx-auto">
              We are more than just an e-com platform — we are a brand built on trust, quality, and care.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
