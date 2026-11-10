"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Send,
  Copy,
  Check,
  ChevronRight,
  Headphones,
  Truck,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/config/siteConfig";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    orderId: "",
    subject: "Order Status & Tracking",
    message: "",
  });

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("support@vittaldigital.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleWhatsAppSend = () => {
    const text = encodeURIComponent(
      `Hi Vittal Digital Support Team,\n\nName: ${formData.name || "Customer"}\nEmail: ${formData.email || "N/A"}\nOrder ID: ${formData.orderId || "N/A"}\nSubject: ${formData.subject}\n\nMessage: ${formData.message || "I have an inquiry regarding my purchase."}`
    );
    window.open(`https://wa.me/${siteConfig.whatsappNumber}?text=${text}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between selection:bg-[#002D62] selection:text-white font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-16 w-full">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-[#002D62] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800">Contact Us</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-semibold text-[#002D62] mb-3 shadow-2xs">
            <Headphones className="w-3.5 h-3.5 text-[#002D62]" />
            <span>Dedicated Customer Care &amp; Technical Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            We&apos;re Here to Help You
          </h1>
          <p className="mt-3 text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
            Have a question about an order, hardware specifications, warranty coverage, or express delivery? Reach out to our dedicated support desk directly.
          </p>
        </div>

        {/* =================================================================== */}
        {/* 4 PRIMARY CONTACT CARDS                                             */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-12">
          {/* Card 1: Official Email Support (Primary Focus) */}
          <div className="bg-white rounded-3xl border-2 border-blue-600/30 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute top-0 right-0 bg-[#002D62] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Official Desk
            </div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/80 text-[#002D62] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Mail className="w-6 h-6 text-[#002D62]" />
              </div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
                Email Support
              </span>
              <h3 className="text-lg font-black text-slate-900 mb-1">
                support@vittaldigital.com
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Fast responses for orders, invoices, warranty claims, and general inquiries within 2–4 business hours.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
              <a
                href="mailto:support@vittaldigital.com"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#002D62] hover:bg-blue-900 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                title="Copy email to clipboard"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: WhatsApp Concierge */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <MessageCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                WhatsApp Support
              </span>
              <h3 className="text-lg font-black text-slate-900 mb-1">
                +91 91623 81659
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Chat live with our electronics concierge for dispatch photos, unboxing verification, and rapid help.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%20Vittal%20Digital%20Support%2C%20I%20have%20an%20inquiry`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Card 3: Phone Helpline & Working Hours */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Phone className="w-6 h-6 text-[#002D62]" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Direct Helpline
              </span>
              <h3 className="text-lg font-black text-slate-900 mb-1">
                {siteConfig.supportPhone}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Monday to Saturday, 9:00 AM – 7:00 PM IST. Priority phone support for active order queries.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <a
                href={`tel:${siteConfig.supportPhone}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-[#FFBE00]" />
                <span>Call Helpline</span>
              </a>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* INTERACTIVE INQUIRY FORM & FULFILLMENT CENTER DETAILS                */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Left Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Direct Ticket
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Send Us a Message
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Fill out the form below and our team will get back to you via email or WhatsApp promptly.
              </p>
            </div>

            {isSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-emerald-950">
                  Message Sent Successfully!
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
                  Thank you for reaching out. We have logged your request. Our support team will respond to your email or WhatsApp number shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      orderId: "",
                      subject: "Order Status & Tracking",
                      message: "",
                    });
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  <span>Submit Another Inquiry</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Your Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002D62] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002D62] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Phone Number (WhatsApp) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002D62] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Order ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. #VD-1001"
                      value={formData.orderId}
                      onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002D62] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Inquiry Topic / Department
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002D62] transition-all"
                  >
                    <option value="Order Status & Tracking">Order Status &amp; Tracking</option>
                    <option value="Product Specifications & Details">Product Specifications &amp; Inquiries</option>
                    <option value="1-Year Warranty & Service">1-Year Warranty &amp; Service Activation</option>
                    <option value="7-Day Replacement Request">7-Day Replacement or Transit Issue</option>
                    <option value="Payment & Invoicing Support">Payment, UPI &amp; Invoicing</option>
                    <option value="General Query">Other / General Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    How Can We Help You? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Please describe your query in detail..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002D62] transition-all resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#002D62] hover:bg-blue-900 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-60"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? "Sending..." : "Submit Inquiry"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppSend}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send via WhatsApp</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Information & Fulfillment Bay (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Fulfillment Center Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm">
              <div className="flex items-center gap-2 text-slate-900 font-bold mb-4">
                <MapPin className="w-5 h-5 text-[#002D62]" />
                <h3 className="text-base sm:text-lg font-black">Fulfillment &amp; Dispatch Bay</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                All consumer hardware is inspected, serial-registered, and dispatched from our primary hub:
              </p>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 text-xs text-slate-700 space-y-1 mb-4">
                <strong className="block text-slate-900 font-bold">Vittal Digital Logistics Center</strong>
                <span>Ernakulam Logistics Dispatch Bay</span>
                <span className="block text-slate-500">Kerala, India – 682001</span>
              </div>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#002D62]" />
                  <span>Working Hours: Mon – Sat, 9:00 AM – 7:00 PM IST</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Dispatch Window: Within 24 hours of order confirmation</span>
                </div>
              </div>
            </div>

            {/* Quick Links & Assurances Card */}
            <div className="bg-gradient-to-br from-[#001D40] via-[#002654] to-[#001833] rounded-3xl p-6 sm:p-7 text-white shadow-md border border-blue-900/40">
              <div className="flex items-center gap-2 text-[#FFBE00] mb-3">
                <Sparkles className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Self-Service Quick Links
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-5">
                Need immediate status on your order or return? Use our self-service portals:
              </p>
              <div className="space-y-2.5">
                <Link
                  href="/order-tracking"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#FFBE00]" />
                    <span>Track Your Shipment</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/return"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-emerald-400" />
                    <span>7-Day Replacement Policy</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/shipping-and-delivery"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-300" />
                    <span>Shipping Timelines &amp; Insurance</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

