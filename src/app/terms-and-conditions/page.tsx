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
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Terms and Conditions | Vittal Digital — Genuine Flagship Electronics",
  description:
    "Review the terms and conditions governing purchases, payments, 1-year warranty coverage, express shipping, and authentic brand consumer electronics from Vittal Digital.",
};

export default function TermsAndConditionsPage() {
  const termsList = [
    {
      id: "platform-use",
      number: "01",
      title: "Use of Our Platform",
      icon: Sparkles,
      content: (
        <div className="space-y-3">
          <p>
            By accessing or using <strong className="font-semibold text-slate-900">Vittal Digital</strong> (accessible at{" "}
            <a href="https://vittaldigital.com" className="text-[#002D62] font-semibold underline underline-offset-2">
              vittaldigital.com
            </a>
            ), you agree to comply with and be bound by these Terms and Conditions. You represent that you are at least 18 years of age or accessing our platform under the direct supervision of a parent or legal guardian.
          </p>
          <p>
            You agree to use our website strictly for lawful consumer shopping purposes and refrain from transmitting malicious code, attempting unauthorized server access, scraping product catalog data, or misrepresenting your identity.
          </p>
        </div>
      ),
    },
    {
      id: "authenticity-sourcing",
      number: "02",
      title: "Direct Retail Sourcing & Hardware Authenticity",
      icon: ShieldCheck,
      content: (
        <div className="space-y-3">
          <p>
            Every product showcased and sold on <strong className="font-semibold text-slate-900">Vittal Digital</strong> is <strong className="font-semibold text-slate-900">100% brand-new, factory-sealed, and sourced directly from authorized brand distributors</strong>.
          </p>
          <ul className="space-y-2 list-none text-slate-600">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>All consumer hardware is 100% genuine with intact manufacturer tamper seals and verifiable international serial numbers.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Smartphones, tablets, and cellular smartwatches are fully factory-unlocked and compatible with Indian 5G, 4G LTE, VoLTE, and Wi-Fi networks (Airtel, Jio, Vi).</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Chargers, power adapters, and voltage profiles meet Indian 230V 50Hz electrical standards.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "pricing-payment",
      number: "03",
      title: "Pricing, Invoicing & Secure Payments",
      icon: CreditCard,
      content: (
        <div className="space-y-3">
          <p>
            All prices listed on Vittal Digital are expressed in Indian Rupees (INR ₹) and are fully inclusive of all applicable import duties and goods &amp; services taxes. There are no hidden fees or extra surcharges added at final checkout.
          </p>
          <p>
            We support certified online payments via <strong className="font-semibold text-slate-900">Razorpay</strong>, utilizing 256-bit bank-grade TLS encryption. Accepted methods include:
          </p>
          <ul className="space-y-1.5 list-none pl-1 text-slate-600">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#002D62]" />
              <span>UPI (Google Pay, PhonePe, Paytm, BHIM, CRED)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#002D62]" />
              <span>Major Credit &amp; Debit Cards (Visa, Mastercard, RuPay, American Express)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#002D62]" />
              <span>Net Banking across 50+ major Indian commercial banks</span>
            </li>
          </ul>
          <div className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed">
            <strong className="font-semibold text-slate-900">Payment Security:</strong> Vittal Digital never stores or processes raw credit/debit card numbers or UPI PINs. All financial transactions are managed securely by RBI-licensed payment aggregators.
          </div>
        </div>
      ),
    },
    {
      id: "shipping-logistics",
      number: "04",
      title: "Insured Express Air Logistics & Shipping",
      icon: Truck,
      content: (
        <div className="space-y-3">
          <p>
            We manage the packaging and dispatch of every order through priority air cargo logistics to ensure prompt, secure, and fully trackable delivery across India.
          </p>
          <ul className="space-y-2 list-none text-slate-600">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong className="font-semibold text-slate-900">Dispatch Timeline:</strong> Orders are verified, serialized, and handed over to logistics partners within 24 business hours.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong className="font-semibold text-slate-900">Transit Timeline:</strong> Standard express air delivery typically takes <strong className="font-semibold text-slate-900">5 to 7 business days</strong> nationwide across India.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong className="font-semibold text-slate-900">100% Transit Insurance:</strong> All shipments carry full transit coverage against loss, courier mishandling, or physical in-transit damage.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "warranty-support",
      number: "05",
      title: "1-Year Pan-India Warranty Coverage",
      icon: Award,
      content: (
        <div className="space-y-3">
          <p>
            All electronics and gadgets purchased from Vittal Digital are backed by our <strong className="font-semibold text-slate-900">1-Year Comprehensive Warranty Support</strong> across India.
          </p>
          <p>
            This warranty safeguards your investment against inherent hardware defects, motherboard malfunctions, internal display component failures, and manufacturing faults under normal intended usage. We provide dedicated doorstep courier repair pickup and certified technician service across 28 states.
          </p>
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-600 leading-relaxed">
            <strong className="font-semibold text-slate-900">Warranty Exclusions:</strong> Warranty does not cover accidental physical liquid spills, severe drops/cracked screens caused after receipt, unofficial software flashing/rooting, or repairs carried out by unauthorized third-party workshops.
          </div>
        </div>
      ),
    },
    {
      id: "replacements-returns",
      number: "06",
      title: "7-Day Replacement Guarantee & Return Terms",
      icon: RotateCcw,
      content: (
        <div className="space-y-3">
          <p>
            We maintain a customer-friendly <strong className="font-semibold text-slate-900">7-Day Replacement Guarantee</strong> for items received in physically damaged condition, with out-of-the-box hardware defects, or differing from the confirmed model.
          </p>
          <ul className="space-y-2 list-none text-slate-600">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong className="font-semibold text-slate-900">Mandatory Unboxing Video:</strong> A continuous, uncut video recorded from before breaking the outer courier seal to verifying the hardware condition is mandatory to validate any physical transit damage or missing component claim.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong className="font-semibold text-slate-900">Notification Window:</strong> Issues must be reported to our WhatsApp support (+91 916238165935) or email within 48 hours of doorstep delivery.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Detailed step-by-step instructions can be viewed in our full{" "}
                <Link href="/return" className="text-[#002D62] font-semibold underline underline-offset-2">
                  Return &amp; Refund Policy
                </Link>.
              </span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "cancellations-refunds",
      number: "07",
      title: "Order Cancellation & Rapid Refund Timelines",
      icon: CreditCard,
      content: (
        <div className="space-y-3">
          <p>
            You can cancel any order free of charge at any time prior to courier dispatch directly from your <strong className="font-semibold text-slate-900">My Orders</strong> portal or by reaching out to our live WhatsApp care.
          </p>
          <p>
            Upon cancellation or approved return, a 100% full refund is initiated back to your original payment method:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-3 text-xs text-slate-800">
              <strong className="font-semibold text-emerald-900 block mb-0.5">UPI Payments (GPay, PhonePe, Paytm)</strong>
              Credited back within <strong className="font-semibold text-slate-900">2 to 4 hours</strong>.
            </div>
            <div className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-3 text-xs text-slate-800">
              <strong className="font-semibold text-[#002D62] block mb-0.5">Credit/Debit Cards &amp; Netbanking</strong>
              Credited within <strong className="font-semibold text-slate-900">2 to 4 business days</strong>.
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "intellectual-property",
      number: "08",
      title: "Intellectual Property & Manufacturer Trademarks",
      icon: Scale,
      content: (
        <p>
          All product brand names, logos, registered trademarks, and specifications (including Apple, Samsung, Sony, Bang &amp; Olufsen, and others) displayed on Vittal Digital are the exclusive property of their respective manufacturer brand owners. Vittal Digital operates as an independent procurement and retail direct importer and does not claim ownership over manufacturer trademarks.
        </p>
      ),
    },
    {
      id: "liability-governing-law",
      number: "09",
      title: "Governing Law & Legal Jurisdiction",
      icon: Building2,
      content: (
        <p>
          These Terms and Conditions and any transaction executed through Vittal Digital shall be governed by and construed in accordance with the laws of the Republic of India. Any dispute, claim, or controversy arising out of or relating to your purchase or use of the website shall be subject to the exclusive jurisdiction of the competent civil courts situated in <strong className="font-semibold text-slate-900">Bengaluru, Karnataka, India</strong>.
        </p>
      ),
    },
    {
      id: "customer-care",
      number: "10",
      title: "Customer Inquiries & Formal Notices",
      icon: Mail,
      content: (
        <div className="space-y-3">
          <p>
            If you have any questions, clarifications, or feedback regarding these Terms and Conditions, please contact our support desk:
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="mailto:support@vittaldigital.com"
              className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-[#002D62] text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl border border-blue-200 transition-colors"
            >
              <Mail className="w-4 h-4 text-[#002D62]" />
              support@vittaldigital.com
            </a>
            <a
              href="https://wa.me/916238165935?text=Hi%20Vittal%20Digital%2C%20I%20have%20a%20question%20regarding%20terms"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl border border-[#25D366]/30 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              WhatsApp: +91 916238165935
            </a>
          </div>
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
          <span className="font-medium text-slate-800">Terms &amp; Conditions</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-semibold text-[#002D62] mb-3 shadow-2xs">
            <FileText className="w-3.5 h-3.5 text-[#002D62]" />
            <span>Official Policy Agreement • Updated November 2026</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight leading-tight">
            Terms and Conditions
          </h1>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-normal">
            Please read these terms and conditions carefully before placing orders or using our consumer electronics shopping platform.
          </p>

          <div className="mt-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs text-xs sm:text-sm text-slate-600 leading-relaxed">
            At <strong className="font-semibold text-slate-900">Vittal Digital</strong>, we deliver authentic flagship consumer electronics directly to discerning technology buyers across India. Every order includes guaranteed brand-new, factory-sealed hardware, 1-year pan-India warranty support, and fully insured express logistics.
          </div>
        </div>

        {/* Terms Accordion / Stacked Card Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs divide-y divide-slate-100">
          {termsList.map((item) => {
            const Icon = item.icon;
            return (
              <section key={item.id} className="py-6 first:pt-0 last:pb-0 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-[#002D62] flex items-center justify-center font-semibold text-xs shrink-0">
                    {item.number}
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#002D62]" />
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                      {item.title}
                    </h2>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-11">
                  {item.content}
                </div>
              </section>
            );
          })}
        </div>

        {/* Contact Help Strip */}
        <div className="mt-8 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">Have questions about our terms?</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-normal">Our customer advisory team is available to assist you Monday through Saturday.</p>
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
              href="https://wa.me/916238165935?text=Hi%20Vittal%20Digital%2C%20I%20have%20a%20question"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-[#25D366]/30 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              WhatsApp Help
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
