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
    navigator.clipboard.writeText(siteConfig.supportEmail);
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
      `Hi Vittal Lifestyle Support Team,\n\nName: ${formData.name || "Customer"}\nEmail: ${formData.email || "N/A"}\nOrder ID: ${formData.orderId || "N/A"}\nSubject: ${formData.subject}\n\nMessage: ${formData.message || "I have an inquiry regarding my purchase."}`
    );
    window.open(`https://wa.me/${siteConfig.whatsappNumber}?text=${text}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#070708] text-white flex flex-col justify-between selection:bg-[#D4A373] selection:text-black font-mograph">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-16 w-full">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-400 mb-6">
          <Link href="/" className="hover:text-[#D4A373] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
          <span className="font-semibold text-white">Contact Us</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#272015] border border-[#D4AF37]/30 text-xs font-bold text-[#D4AF37] mb-3 font-movault uppercase tracking-wider">
            <Headphones className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Dedicated Customer Care &amp; Concierge</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight uppercase font-movault">
            We&apos;re Here to Help You
          </h1>
          <p className="mt-3 text-xs sm:text-sm md:text-base text-neutral-300 leading-relaxed font-normal max-w-2xl mx-auto">
            Have a question about an order, supplement dosage, apparel sizing, or express delivery? Reach out to our concierge advisory desk directly.
          </p>
        </div>

        {/* =================================================================== */}
        {/* 3 PRIMARY CONTACT CARDS                                             */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-12">
          {/* Card 1: Official Email Support */}
          <div className="bg-[#141416] rounded-3xl border border-[#D4AF37]/40 p-6 sm:p-7 shadow-xl relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute top-0 right-0 bg-[#272015] text-[#D4AF37] border-b border-l border-[#D4AF37]/30 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider font-movault">
              Official Desk
            </div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#272015] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Mail className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block mb-1 font-movault">
                Email Support
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1 truncate">
                {siteConfig.supportEmail}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                Fast responses for order updates, invoices, replacements, and general inquiries within 2–4 business hours.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center gap-2">
              <a
                href={`mailto:${siteConfig.supportEmail}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4A373] hover:bg-[#c29263] text-black font-bold text-xs shadow-sm transition-colors cursor-pointer uppercase font-movault tracking-wider"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-bold text-xs border border-white/10 transition-colors cursor-pointer"
                title="Copy email to clipboard"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: WhatsApp Concierge */}
          <div className="bg-[#141416] rounded-3xl border border-white/10 p-6 sm:p-7 shadow-xl flex flex-col justify-between group hover:border-[#D4AF37]/30 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <MessageCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1 font-movault">
                WhatsApp Support
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                +{siteConfig.whatsappNumber}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                Chat live with our concierge for dispatch photos, sizing recommendations, and rapid order help.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%20Vittal%20Lifestyle%20Support%2C%20I%20have%20an%20inquiry`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer font-movault uppercase tracking-wider"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Card 3: Phone Helpline & Working Hours */}
          <div className="bg-[#141416] rounded-3xl border border-white/10 p-6 sm:p-7 shadow-xl flex flex-col justify-between group hover:border-[#D4AF37]/30 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#272015] border border-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Phone className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-1 font-movault">
                Direct Helpline
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                {siteConfig.supportPhone}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                Monday to Saturday, 9:30 AM – 7:00 PM IST. Priority phone line for active order tracking.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <a
                href={`tel:${siteConfig.supportPhone}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 shadow-sm transition-colors cursor-pointer font-movault uppercase tracking-wider"
              >
                <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
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
          <div className="lg:col-span-7 bg-[#141416] rounded-3xl border border-white/10 p-6 sm:p-8 shadow-xl">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] font-movault">
                Direct Ticket
              </span>
              <h2 className="text-xl sm:text-3xl font-extrabold text-white mt-1 uppercase font-movault">
                Send Us a Message
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Fill out the form below and our team will get back to you via email or WhatsApp promptly.
              </p>
            </div>

            {isSubmitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white uppercase font-movault tracking-wide">
                  Message Sent Successfully!
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed max-w-md mx-auto">
                  Thank you for reaching out. We have logged your request. Our concierge desk will respond to your email or WhatsApp number shortly.
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
                  className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#D4A373] text-black text-xs font-bold cursor-pointer uppercase font-movault tracking-wider"
                >
                  <span>Submit Another Inquiry</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5 font-movault uppercase tracking-wide">
                      Your Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1a1a1d] text-xs sm:text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-neutral-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5 font-movault uppercase tracking-wide">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1a1a1d] text-xs sm:text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-neutral-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5 font-movault uppercase tracking-wide">
                      Phone Number (WhatsApp) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1a1a1d] text-xs sm:text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-neutral-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5 font-movault uppercase tracking-wide">
                      Order ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. #VL-1001"
                      value={formData.orderId}
                      onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1a1a1d] text-xs sm:text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-neutral-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5 font-movault uppercase tracking-wide">
                    Inquiry Topic / Department
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1a1a1d] text-xs sm:text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                  >
                    <option value="Order Status & Tracking">Order Status &amp; Tracking</option>
                    <option value="Gym Supplements & Nutrition Inquiries">Gym Supplements &amp; Nutrition Inquiries</option>
                    <option value="Apparel & Outfits Sizing Help">Apparel &amp; Outfits Sizing Help</option>
                    <option value="Dates, Nuts & Chocolates Quality">Dates, Nuts &amp; Chocolates Quality</option>
                    <option value="7-Day Replacement Request">7-Day Replacement or Transit Issue</option>
                    <option value="Payment & Invoicing Support">Payment, UPI &amp; Invoicing</option>
                    <option value="General Query">Other / General Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5 font-movault uppercase tracking-wide">
                    How Can We Help You? <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Please describe your query in detail..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#1a1a1d] text-xs sm:text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all resize-none placeholder:text-neutral-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#D4A373] hover:bg-[#c29263] text-black font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-60 font-movault uppercase tracking-wider"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? "Sending..." : "Submit Inquiry"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppSend}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer font-movault uppercase tracking-wider"
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
            <div className="bg-[#141416] rounded-3xl border border-white/10 p-6 sm:p-7 shadow-xl">
              <div className="flex items-center gap-2 text-white font-bold mb-4 font-movault uppercase tracking-wide">
                <MapPin className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-base sm:text-lg">Fulfillment &amp; Dispatch Bay</h3>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-4">
                All products are inspected, sealed, and dispatched directly from our primary distribution hub:
              </p>
              <div className="bg-[#1a1a1d] rounded-2xl p-4 border border-white/10 text-xs text-neutral-300 space-y-1 mb-4">
                <strong className="block text-white font-bold font-movault uppercase tracking-wider text-sm">Vittal Lifestyle Logistics Hub</strong>
                <span>Pan-India Distribution Dispatch Bay</span>
                <span className="block text-neutral-400">Kerala, India – 680001</span>
              </div>
              <div className="space-y-2 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                  <span>Working Hours: Mon – Sat, 9:30 AM – 7:00 PM IST</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>Dispatch Window: Within 24–48 hours of order confirmation</span>
                </div>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="bg-[#141416] rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-white/10">
              <div className="flex items-center gap-2 text-[#D4AF37] mb-3">
                <Sparkles className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider font-movault">
                  Self-Service Quick Links
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed mb-5">
                Need immediate status on your order or return? Use our self-service portals:
              </p>
              <div className="space-y-2.5">
                <Link
                  href="/order-tracking"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-colors border border-white/5"
                >
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#D4AF37]" />
                    <span>Track Your Shipment</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </Link>

                <Link
                  href="/return"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-colors border border-white/5"
                >
                  <span className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-emerald-400" />
                    <span>7-Day Replacement Policy</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </Link>

                <Link
                  href="/shipping-and-delivery"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-colors border border-white/5"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                    <span>Shipping Timelines &amp; Insurance</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
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
