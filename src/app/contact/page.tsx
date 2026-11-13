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
    <div className="min-h-screen bg-white text-neutral-700 flex flex-col justify-between selection:bg-[#E5F2D0] selection:text-[#1E300E] font-mograph">
      <Navbar />

      <main className="flex-1 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 w-full">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500 mb-6 font-medium">
          <Link href="/" className="hover:text-[#6B9E3A] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <span className="font-semibold text-neutral-900">Contact Us</span>
        </nav>

        {/* ======================================================= */}
        {/* HERO HEADER                                              */}
        {/* ======================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5F2D0] text-[#3B581C] text-xs font-semibold mb-3 shadow-2xs">
            <Headphones className="w-3.5 h-3.5 text-[#6B9E3A]" />
            <span>Dedicated Customer Care &amp; Concierge</span>
          </div>
          <h1 className="font-mograph font-bold text-3xl sm:text-5xl text-neutral-950 tracking-tight leading-tight">
            We&apos;re Here to Help You
          </h1>
          <p className="mt-3 text-xs sm:text-sm md:text-base text-neutral-600 leading-relaxed font-normal max-w-2xl mx-auto">
            Have a question about an order, supplement dosage, apparel sizing, or express delivery? Reach out to our concierge advisory desk directly.
          </p>
        </div>

        {/* ======================================================= */}
        {/* 3 PRIMARY CONTACT CARDS                                  */}
        {/* ======================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-12">
          {/* Card 1: Official Email Support */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 hover:border-[#6B9E3A]/50 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)] relative overflow-hidden flex flex-col justify-between group transition-all duration-300">
            {/* Official Desk badge */}
            <div className="absolute top-0 right-0 bg-[#E5F2D0] text-[#3B581C] border-b border-l border-[#D5E9BC] text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wide font-mograph">
              Official Desk
            </div>

            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#E5F2D0] text-[#3B581C] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Mail className="w-6 h-6 text-[#6B9E3A]" />
              </div>
              <span className="text-xs font-bold text-[#6B9E3A] uppercase tracking-wider block mb-1 font-mograph">
                Email Support
              </span>
              <h3 className="text-base sm:text-lg font-bold text-neutral-950 mb-1 truncate font-mograph">
                {siteConfig.supportEmail}
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                Fast responses for order updates, invoices, replacements, and general inquiries within 2–4 business hours.
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-200/70 flex items-center gap-2">
              <a
                href={`mailto:${siteConfig.supportEmail}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#111111] hover:bg-black text-white font-bold text-xs shadow-sm transition-colors cursor-pointer font-mograph"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs border border-neutral-200/80 transition-colors cursor-pointer"
                title="Copy email to clipboard"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#6B9E3A]" />
                    <span className="text-[#6B9E3A]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: WhatsApp Concierge */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 hover:border-[#6B9E3A]/50 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)] flex flex-col justify-between group transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#E5F2D0] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <MessageCircle className="w-6 h-6 text-[#6B9E3A]" />
              </div>
              <span className="text-xs font-bold text-[#6B9E3A] uppercase tracking-wider block mb-1 font-mograph">
                WhatsApp Support
              </span>
              <h3 className="text-base sm:text-lg font-bold text-neutral-950 mb-1 font-mograph">
                +{siteConfig.whatsappNumber}
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                Chat live with our concierge for dispatch photos, sizing recommendations, and rapid order help.
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-200/70">
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%20Vittal%20Lifestyle%20Support%2C%20I%20have%20an%20inquiry`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer font-mograph"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Card 3: Phone Helpline */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 hover:border-[#6B9E3A]/50 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)] flex flex-col justify-between group transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#E5F2D0] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Phone className="w-6 h-6 text-[#6B9E3A]" />
              </div>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1 font-mograph">
                Direct Helpline
              </span>
              <h3 className="text-base sm:text-lg font-bold text-neutral-950 mb-1 font-mograph">
                {siteConfig.supportPhone}
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                Monday to Saturday, 9:30 AM – 7:00 PM IST. Priority phone line for active order tracking.
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-200/70">
              <a
                href={`tel:${siteConfig.supportPhone}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold text-xs border border-neutral-200/80 shadow-sm transition-colors cursor-pointer font-mograph"
              >
                <Phone className="w-3.5 h-3.5 text-[#6B9E3A]" />
                <span>Call Helpline</span>
              </a>
            </div>
          </div>
        </div>

        {/* ======================================================= */}
        {/* INQUIRY FORM + FULFILLMENT CENTER DETAILS                */}
        {/* ======================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Left Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="mb-6">
              <span className="text-xs font-semibold text-[#6B9E3A] uppercase tracking-wider block mb-1 font-mograph">
                Direct Ticket
              </span>
              <h2 className="text-xl sm:text-3xl font-bold text-neutral-950 mt-1 font-mograph tracking-tight">
                Send Us a Message
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Fill out the form below and our team will get back to you via email or WhatsApp promptly.
              </p>
            </div>

            {isSubmitted ? (
              <div className="bg-[#E5F2D0] border border-[#D5E9BC] rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-[#D5EBBF] text-[#3B581C] rounded-full mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#15230D] font-mograph tracking-tight">
                  Message Sent Successfully!
                </h3>
                <p className="text-xs text-[#3B581C] leading-relaxed max-w-md mx-auto">
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
                  className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#111111] text-white text-xs font-bold cursor-pointer font-mograph"
                >
                  <span>Submit Another Inquiry</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5 font-mograph">
                      Your Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#6B9E3A] focus:ring-2 focus:ring-[#6B9E3A]/20 transition-all placeholder:text-neutral-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5 font-mograph">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#6B9E3A] focus:ring-2 focus:ring-[#6B9E3A]/20 transition-all placeholder:text-neutral-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5 font-mograph">
                      Phone Number (WhatsApp) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#6B9E3A] focus:ring-2 focus:ring-[#6B9E3A]/20 transition-all placeholder:text-neutral-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5 font-mograph">
                      Order ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. #VL-1001"
                      value={formData.orderId}
                      onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#6B9E3A] focus:ring-2 focus:ring-[#6B9E3A]/20 transition-all placeholder:text-neutral-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5 font-mograph">
                    Inquiry Topic / Department
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#6B9E3A] focus:ring-2 focus:ring-[#6B9E3A]/20 transition-all"
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
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5 font-mograph">
                    How Can We Help You? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Please describe your query in detail..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#6B9E3A] focus:ring-2 focus:ring-[#6B9E3A]/20 transition-all resize-none placeholder:text-neutral-400"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#111111] hover:bg-black text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer disabled:opacity-60 font-mograph"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? "Sending..." : "Submit Inquiry"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppSend}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer font-mograph"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send via WhatsApp</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Info Panel (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Fulfillment Center Card */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 text-neutral-950 font-bold mb-4 font-mograph tracking-tight">
                <MapPin className="w-5 h-5 text-[#6B9E3A]" />
                <h3 className="text-base sm:text-lg">Fulfillment &amp; Dispatch Bay</h3>
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed mb-4">
                All products are inspected, sealed, and dispatched directly from our primary distribution hub:
              </p>
              <div className="bg-[#F8FAF4] rounded-2xl p-4 border border-[#E5F2D0] text-xs text-neutral-700 space-y-1 mb-4">
                <strong className="block text-neutral-950 font-bold font-mograph text-sm">
                  Vittal Lifestyle Logistics Hub
                </strong>
                <span>Pan-India Distribution Dispatch Bay</span>
                <span className="block text-neutral-500">Kerala, India – 680001</span>
              </div>
              <div className="space-y-2 text-xs text-neutral-500">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#6B9E3A]" />
                  <span>Working Hours: Mon – Sat, 9:30 AM – 7:00 PM IST</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#6B9E3A]" />
                  <span>Dispatch Window: Within 24–48 hours of order confirmation</span>
                </div>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-neutral-200/80">
              <div className="flex items-center gap-2 text-[#3B581C] mb-3">
                <Sparkles className="w-4 h-4 text-[#6B9E3A]" />
                <span className="text-xs font-bold tracking-wider font-mograph text-[#6B9E3A]">
                  Self-Service Quick Links
                </span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                Need immediate status on your order or return? Use our self-service portals:
              </p>
              <div className="space-y-2.5">
                <Link
                  href="/order-tracking"
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 hover:bg-[#F2F8EB] hover:border-[#D5E9BC] text-xs font-bold transition-all border border-neutral-200/80 group"
                >
                  <span className="flex items-center gap-2 text-neutral-800 group-hover:text-[#3B581C]">
                    <Truck className="w-4 h-4 text-[#6B9E3A]" />
                    <span>Track Your Shipment</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#6B9E3A]" />
                </Link>

                <Link
                  href="/return"
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 hover:bg-[#F2F8EB] hover:border-[#D5E9BC] text-xs font-bold transition-all border border-neutral-200/80 group"
                >
                  <span className="flex items-center gap-2 text-neutral-800 group-hover:text-[#3B581C]">
                    <RotateCcw className="w-4 h-4 text-[#6B9E3A]" />
                    <span>7-Day Replacement Policy</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#6B9E3A]" />
                </Link>

                <Link
                  href="/shipping-and-delivery"
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 hover:bg-[#F2F8EB] hover:border-[#D5E9BC] text-xs font-bold transition-all border border-neutral-200/80 group"
                >
                  <span className="flex items-center gap-2 text-neutral-800 group-hover:text-[#3B581C]">
                    <ShieldCheck className="w-4 h-4 text-[#6B9E3A]" />
                    <span>Shipping Timelines &amp; Insurance</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#6B9E3A]" />
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
