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
  title: "Return & Exchange Policy | Turkiye Jam India",
  description:
    "Learn about Turkiye Jam return and cancellation policy, including eligible products, return requests, refunds, damaged orders, and unboxing video requirements.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen tj-diamonds-cream text-stone-900 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-16 w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-[#5b1420] transition-colors mb-4 font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-[#f8bac5] border-2 border-stone-800 flex items-center justify-center text-[#5b1420] shadow-[0_3px_0_0_#2b2b2b]">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-tj-serif font-black text-stone-900 tracking-tight">
                Order Cancellation and Return Policy
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 font-medium">
                Transparent and fair returns for Turkiye Jam customers
              </p>
            </div>
          </div>

          <div className="bg-white border-2 border-stone-800 rounded-2xl p-5 shadow-[0_4px_0_0_#2b2b2b] text-sm sm:text-base text-stone-700 leading-relaxed">
            At <strong className="text-stone-900">Turkiye Jam</strong>, we take pride in personally handling every part of your shopping journey — from product selection to secure packaging and delivery. Every product is <strong className="text-stone-900">handpicked, quality-checked, and packed with care</strong> to ensure you receive the best experience.
          </div>
        </div>

        {/* Highlights / Warning Notice */}
        <div className="mb-8 grid sm:grid-cols-2 gap-4">
          <div className="bg-[#fff8db] border-2 border-stone-800 rounded-2xl p-5 text-stone-900 flex items-start gap-3 shadow-[0_4px_0_0_#2b2b2b]">
            <Video className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-stone-900">Mandatory Unboxing Video</h4>
              <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                A clear, uninterrupted video recorded from the moment the sealed parcel is opened is required for any return/replacement claim.
              </p>
            </div>
          </div>
          <div className="bg-[#fed000]/25 border-2 border-stone-800 rounded-2xl p-5 text-stone-900 flex items-start gap-3 shadow-[0_4px_0_0_#2b2b2b]">
            <Clock className="w-6 h-6 text-[#5b1420] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-stone-900">24-Hour Claim Window</h4>
              <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                Requests for damaged, defective, or incorrect products must be submitted within 24 hours of package delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Content Sections */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-stone-800 shadow-[0_6px_0_0_#2b2b2b] space-y-9 text-sm sm:text-base text-stone-700 leading-relaxed">
          {/* 1. Our Quality Promise */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-stone-900 font-bold font-tj-serif text-lg border-b border-stone-200 pb-2">
              <ShieldCheck className="w-5 h-5 text-[#5b1420]" />
              <h2>Our Quality Promise</h2>
            </div>
            <p>
              Each item sold on Turkiye Jam undergoes strict quality inspection before dispatch. <strong className="text-stone-900">Product issues are extremely rare</strong>, but if something goes wrong, we are here to assist you.
            </p>
          </section>

          {/* 2. Refund & Replacement Policy */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-stone-900 font-bold font-tj-serif text-lg border-b border-stone-200 pb-2">
              <PackageCheck className="w-5 h-5 text-[#5b1420]" />
              <h2>Refund &amp; Replacement Policy</h2>
            </div>
            <ul className="space-y-2.5 list-none">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-1" />
                <span>Refunds or replacements are only applicable <strong className="text-stone-900">if the product is damaged, defective, or incorrect</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-1" />
                <span>A <strong className="text-stone-900">clear unboxing video is mandatory</strong>, recorded from the moment the package is opened showing the issue.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-1" />
                <span>Requests must be raised within <strong className="text-stone-900">24 hours of delivery</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5 bg-red-50 border-2 border-red-200 rounded-xl p-3 text-red-950 font-bold">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>Claims without an unboxing video will not be accepted under any circumstances.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-1" />
                <span>Once verified, our team will process a replacement or refund accordingly.</span>
              </li>
            </ul>
          </section>

          {/* 3. Non-Returnable Conditions */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-stone-900 font-bold font-tj-serif text-lg border-b border-stone-200 pb-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <h2>Non-Returnable Conditions</h2>
            </div>
            <ul className="space-y-2 list-none text-stone-700">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                <span>Change of mind or personal preference.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                <span>Incorrect expectations or misunderstanding of product functionality.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                <span>Products that have been used or handled after delivery (unless defective).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                <span>Minor variations in color, size, or design.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                <span>If the product matches the description provided on the website.</span>
              </li>
            </ul>
          </section>

          {/* 4. Product Usage Disclaimer */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-stone-900 font-bold font-tj-serif text-lg border-b border-stone-200 pb-2">
              <HelpCircle className="w-5 h-5 text-[#5b1420]" />
              <h2>Product Usage Disclaimer</h2>
            </div>
            <p>
              Customers are advised to carefully read product descriptions before placing an order. Turkiye Jam is <strong className="text-stone-900">not responsible for returns based on incorrect assumptions about product usage, dosage, or ingredients</strong>.
            </p>
          </section>

          {/* 5. Cancellations & Refunds */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 text-stone-900 font-bold font-tj-serif text-lg border-b border-stone-200 pb-2">
              <Clock className="w-5 h-5 text-[#5b1420]" />
              <h2>Order Cancellation &amp; Refund Policy</h2>
            </div>
            <p>
              Orders can be canceled anytime before they are packed or dispatched for shipping directly from your <strong className="text-stone-900">My Orders</strong> page or via the link in your WhatsApp verification message. Once an order is handed over to our courier partner and marked as dispatched, it cannot be canceled online.
            </p>

            {/* Prepaid Refunds Box */}
            <div className="bg-[#d1fae5] border-2 border-stone-800 rounded-2xl p-4 sm:p-5 space-y-2.5 text-stone-900 shadow-[0_4px_0_0_#2b2b2b]">
              <h4 className="font-bold text-sm sm:text-base flex items-center gap-2 text-[#0e4a3b]">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                Prepaid Online Orders (100% Refund)
              </h4>
              <p className="text-xs sm:text-sm text-stone-800 leading-relaxed">
                When you cancel a prepaid order before dispatch, a <strong className="text-stone-950">100% full refund</strong> is automatically initiated to your original payment method (UPI, Debit/Credit Card, or Netbanking) via our verified payment gateway partner (Razorpay).
              </p>
              <div className="bg-white rounded-xl p-3 border border-emerald-300 text-xs sm:text-sm space-y-1 text-stone-900">
                <div className="font-bold text-stone-950">Expected Credit Timeline:</div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700">•</span>
                  <span><strong>UPI (GPay, PhonePe, Paytm):</strong> Usually credited within <strong>2 to 4 hours</strong> (or up to 24 hours depending on the issuing bank).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700">•</span>
                  <span><strong>Debit / Credit Cards / Netbanking:</strong> Credited within <strong>2 to 4 business days</strong>.</span>
                </div>
              </div>
            </div>

            {/* Cash on Delivery Policy Box */}
            <div className="bg-[#fff8db] border-2 border-stone-800 rounded-2xl p-4 sm:p-5 space-y-2.5 text-stone-900 shadow-[0_4px_0_0_#2b2b2b]">
              <h4 className="font-bold text-sm sm:text-base flex items-center gap-2 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                Cash on Delivery (COD) Orders &amp; ₹10 Advance Fee
              </h4>
              <p className="text-xs sm:text-sm text-stone-800 leading-relaxed">
                When you cancel a Cash on Delivery order, the remaining balance due at doorstep is completely canceled, and our logistics partner will not deliver the parcel.
              </p>
              <div className="bg-white rounded-xl p-3 border border-amber-300 text-xs sm:text-sm text-stone-900 leading-relaxed">
                <strong>Important Note:</strong> The <strong>₹10 advance verification fee</strong> paid during checkout covers courier dispatch reservation, automated fraud prevention, and parcel allocation, and is <strong className="text-red-700">strictly non-refundable</strong> upon order cancellation.
              </div>
            </div>
          </section>

          {/* 6. Our Commitment */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-stone-900 font-bold font-tj-serif text-lg border-b border-stone-200 pb-2">
              <ShieldCheck className="w-5 h-5 text-[#5b1420]" />
              <h2>Our Commitment</h2>
            </div>
            <p>
              We ensure secure packaging, smooth delivery, and responsive customer support. If something genuinely goes wrong, we will resolve it fairly and transparently.
            </p>
          </section>

          {/* 7. Contact Us */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-stone-900 font-bold font-tj-serif text-lg border-b border-stone-200 pb-2">
              <Mail className="w-5 h-5 text-[#5b1420]" />
              <h2>Contact Us</h2>
            </div>
            <p>
              For any concerns or support regarding your order, please contact us at:
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="mailto:support@turkiyejam.com"
                className="inline-flex items-center gap-2 bg-stone-100 border-2 border-stone-800 text-stone-900 font-bold px-4 py-2 rounded-xl hover:bg-stone-200 transition-colors shadow-[0_2px_0_0_#2b2b2b]"
              >
                📧 support@turkiyejam.com
              </a>
              <a
                href="https://wa.me/916238165935?text=Hi%20Turkiye%20Jam%2C%20I%20need%20assistance%20with%20my%20order"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#d1fae5] border-2 border-stone-800 text-[#0e4a3b] font-bold px-4 py-2 rounded-xl hover:bg-emerald-200 transition-colors shadow-[0_2px_0_0_#2b2b2b]"
              >
                💬 WhatsApp Support: +91 62381 65935
              </a>
            </div>
          </section>

          {/* 8. Thank You Note */}
          <div className="bg-[#fed000]/25 rounded-2xl p-6 border-2 border-stone-800 text-center shadow-[0_4px_0_0_#2b2b2b]">
            <h3 className="font-tj-serif font-black text-stone-900 text-lg mb-1">
              Thank You for Choosing Turkiye Jam
            </h3>
            <p className="text-sm text-stone-700 max-w-lg mx-auto">
              We are more than just an online store — we are an authentic artisanal brand built on trust, quality, and natural vitality.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
