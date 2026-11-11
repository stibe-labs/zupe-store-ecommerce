import React from "react";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  CreditCard,
  Truck,
  RotateCcw,
  Sparkles,
  Award,
  Lock,
  Scale,
  Building2,
  Mail,
  ChevronRight as BreadcrumbChevron,
  MessageCircle,
  HelpCircle,
  CheckCircle2,
  Dumbbell,
  Shirt,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/config/siteConfig";

export const metadata = {
  title: "Terms and Conditions | Vittal Lifestyle — Live Better. Feel Stronger.",
  description:
    "Review the terms and conditions governing purchases, payments, 100% lab-tested purity guarantees, pan-India express shipping, and authentic lifestyle goods from Vittal Lifestyle.",
};

export default function TermsAndConditionsPage() {
  const termsList = [
    {
      id: "platform-use",
      number: "01",
      title: "Use of Our Platform & Eligibility",
      icon: Sparkles,
      content: (
        <div className="space-y-3">
          <p>
            By accessing or shopping on <strong className="font-semibold text-white">Vittal Lifestyle</strong> (accessible at{" "}
            <a href="https://vittallifestyle.com" className="text-[#D4AF37] font-semibold underline underline-offset-2">
              vittallifestyle.com
            </a>
            ), you agree to comply with and be bound by these Terms and Conditions. You represent that you are at least 18 years of age or accessing our platform under the supervision of a parent or legal guardian.
          </p>
          <p>
            You agree to use our website solely for legitimate personal shopping purposes and refrain from transmitting harmful code, attempting unauthorized server access, scraping catalog data, or falsifying transaction details.
          </p>
        </div>
      ),
    },
    {
      id: "authenticity-sourcing",
      number: "02",
      title: "Direct Sourcing, Purity & Product Authenticity",
      icon: ShieldCheck,
      content: (
        <div className="space-y-3">
          <p>
            Every product showcased and sold on <strong className="font-semibold text-white">Vittal Lifestyle</strong> is <strong className="font-semibold text-white">100% genuine, fresh, and sourced directly from certified manufacturers and accredited growers</strong>.
          </p>
          <ul className="space-y-2 list-none text-neutral-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong className="text-white">Gym Supplements:</strong> 100% pure Whey Protein Isolate, Micronized Creatine, and active nutrition formulated in GMP-certified facilities with verifiable lab assays and zero unlisted fillers.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong className="text-white">Athletic Outfits &amp; Apparels:</strong> Premium 4-way stretch activewear and 240+ GSM heavyweight cotton tees tailored for intense workouts and everyday comfort.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong className="text-white">Dates, Nuts &amp; Artisan Chocolates:</strong> Authenticated Saudi Medina Ajwa dates, premium nuts, and handcrafted 70% dark chocolates sealed in airtight freshness packaging.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "pricing-payment",
      number: "03",
      title: "Pricing, Invoicing & Secure Checkout",
      icon: CreditCard,
      content: (
        <div className="space-y-3">
          <p>
            All prices listed on Vittal Lifestyle are in Indian Rupees (INR ₹) and are fully inclusive of all applicable Goods &amp; Services Tax (GST). There are no hidden fees or extra surcharges added at final checkout.
          </p>
          <p>
            We support certified online payments via <strong className="font-semibold text-white">Razorpay &amp; Fastrr</strong>, utilizing 256-bit bank-grade TLS encryption. Accepted methods include:
          </p>
          <ul className="space-y-1.5 list-none pl-1 text-neutral-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              <span>UPI (Google Pay, PhonePe, Paytm, BHIM, CRED)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              <span>Major Credit &amp; Debit Cards (Visa, Mastercard, RuPay, American Express)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              <span>Net Banking across 50+ leading Indian banks</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "shipping-delivery",
      number: "04",
      title: "Express Logistics, Tracking & Transit Insurance",
      icon: Truck,
      content: (
        <div className="space-y-3">
          <p>
            Orders are processed and dispatched from our fulfillment center within 24–48 business hours. Delivery timelines typically range from <strong className="font-semibold text-white">5 to 7 business days</strong> depending on your Indian pin code.
          </p>
          <p>
            Every order is dispatched via priority courier partners with <strong className="font-semibold text-white">100% loss-and-damage transit insurance</strong>. Real-time GPS tracking milestone updates are sent via WhatsApp and SMS upon shipment handover.
          </p>
        </div>
      ),
    },
    {
      id: "returns-replacements",
      number: "05",
      title: "7-Day Replacement Guarantee & Quality Verification",
      icon: RotateCcw,
      content: (
        <div className="space-y-3">
          <p>
            We take extreme pride in our quality control. If your parcel arrives with physical transit damage, outer seal tampering, or manufacturing anomalies, you are entitled to a <strong className="font-semibold text-white">free replacement under our 7-Day Replacement Guarantee</strong>.
          </p>
          <p className="text-amber-300/90 text-xs bg-[#272015] p-3 rounded-xl border border-[#D4AF37]/30">
            <strong>Notice:</strong> To safeguard all customers and verify transit claims, an uninterrupted parcel unboxing video showing the outer shipping label and opening seal is mandatory when raising a claim. Consumable items (supplements, food) must have their inner seal intact if returned for sizing/variant exchange.
          </p>
        </div>
      ),
    },
    {
      id: "customer-concierge",
      number: "06",
      title: "Customer Advisory & Concierge Support",
      icon: Award,
      content: (
        <div className="space-y-3">
          <p>
            Our dedicated team is available to assist you with order tracking, dosage recommendations, apparel sizing guidance, and post-delivery assistance:
          </p>
          <ul className="space-y-1.5 list-none pl-1 text-neutral-300">
            <li>• WhatsApp Concierge: Available Monday – Saturday (9:30 AM – 7:30 PM IST)</li>
            <li>• Official Support Email: <a href={`mailto:${siteConfig.supportEmail}`} className="text-[#D4AF37] underline">{siteConfig.supportEmail}</a></li>
          </ul>
        </div>
      ),
    },
    {
      id: "governing-law",
      number: "07",
      title: "Governing Law & Legal Jurisdiction",
      icon: Scale,
      content: (
        <p>
          These Terms and Conditions and any separate agreements whereby we provide you goods shall be governed by and construed in accordance with the laws of India, with exclusive jurisdiction resting in the competent courts of India.
        </p>
      ),
    },
  ];

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
          <span className="font-semibold text-white">Terms and Conditions</span>
        </nav>

        {/* Header Intro */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#272015] border border-[#D4AF37]/30 text-xs font-bold text-[#D4AF37] mb-3 font-movault uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Legal Framework &amp; Customer Agreement</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight uppercase font-movault">
            Terms and Conditions
          </h1>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-neutral-300 leading-relaxed font-normal">
            Last Updated: November 2026. Please read these terms carefully before placing an order on Vittal Lifestyle.
          </p>
        </div>

        {/* Terms Container */}
        <div className="bg-[#141416] rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-white/10 shadow-xl divide-y divide-white/5">
          {termsList.map((item) => {
            const Icon = item.icon;
            return (
              <section key={item.id} className="py-6 first:pt-0 last:pb-0 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#272015] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center font-bold text-xs shrink-0 font-movault">
                    {item.number}
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#D4AF37]" />
                    <h2 className="text-base sm:text-lg font-bold text-white font-movault uppercase tracking-wide">
                      {item.title}
                    </h2>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed pl-11">
                  {item.content}
                </div>
              </section>
            );
          })}
        </div>

        {/* Contact Help Strip */}
        <div className="mt-8 bg-[#141416] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white font-movault uppercase tracking-wider">Have questions about our terms?</h3>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5 font-normal">Our concierge advisory team is available to assist you Monday through Saturday.</p>
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
              href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%20Vittal%20Lifestyle%2C%20I%20have%20a%20question%20regarding%20terms`}
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
