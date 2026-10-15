import React from "react";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Mail,
  AlertCircle,
  CreditCard,
  Truck,
  RotateCcw,
  Lock,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Terms and Conditions | Zupe Store",
  description:
    "Read the Terms and Conditions governing your use of the Zupe Store website, online shopping services, purchases, payments, orders, and returns in India.",
};

export default function TermsAndConditionsPage() {
  const termsList = [
    {
      id: "website-use",
      number: "1",
      title: "Use of Our Website",
      icon: Sparkles,
      content: (
        <p>
          By accessing or using <strong className="text-gray-900">www.zupestore.in</strong>, you agree to comply with these Terms and Conditions. You must be at least 18 years old or accessing the site under the supervision of a parent or legal guardian. You agree to use our website solely for lawful purposes and refrain from any actions that may harm, disrupt, or misuse the platform.
        </p>
      ),
    },
    {
      id: "products-quality",
      number: "2",
      title: "Products and Quality Assurance",
      icon: ShieldCheck,
      content: (
        <div className="space-y-3">
          <p>
            At <strong className="text-gray-900">Zupe Store</strong>, every product listed on our platform is <strong className="text-gray-900">handpicked, verified, and quality-tested</strong> to ensure you receive only the best. We take complete responsibility for product handling, packaging, and shipping to provide a premium customer experience.
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-700">
            <li>Product descriptions, specifications, and images are provided for clarity. Actual appearance may slightly vary based on lighting or device screen settings.</li>
            <li>We reserve the right to modify, update, or discontinue any product without prior notice.</li>
            <li>Zupe Store shall not be held liable for minor variations that do not affect the product&apos;s overall usability or quality.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "pricing-payments",
      number: "3",
      title: "Pricing and Payments",
      icon: CreditCard,
      content: (
        <div className="space-y-3">
          <p>
            All prices displayed on Zupe Store are in INR (₹) unless stated otherwise. We reserve the right to adjust pricing, apply offers, or make corrections in case of typographical errors. Payments must be made in full at the time of purchase using secure and verified payment gateways available on the website.
          </p>
          <p className="bg-orange-50/60 border border-orange-100 rounded-xl p-3 text-orange-950 font-medium text-sm">
            Zupe Store ensures that all payment transactions are encrypted and processed safely to protect customer data.
          </p>
        </div>
      ),
    },
    {
      id: "shipping-delivery",
      number: "4",
      title: "Shipping and Delivery",
      icon: Truck,
      content: (
        <div className="space-y-3">
          <p>
            Zupe Store directly manages the packaging and shipping of every order to ensure reliable and safe delivery. Shipping times may vary depending on your location, order size, and logistics factors. Estimated delivery timelines are provided during checkout for your convenience.
          </p>
          <p>
            While we strive for on-time delivery, Zupe Store is not responsible for unforeseen delays caused by logistics partners, natural events, or regional restrictions.
          </p>
        </div>
      ),
    },
    {
      id: "returns-refunds",
      number: "5",
      title: "Returns and Refunds",
      icon: RotateCcw,
      content: (
        <div className="space-y-3">
          <p>
            We stand by the quality of every product we deliver. However, in the unlikely event you receive a <strong className="text-gray-900">damaged, defective, or incorrect item</strong>, you may request a replacement or refund.
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-700">
            <li>Refunds or replacements are only accepted if a clear <strong className="text-gray-900">unboxing video</strong> is provided as proof, recorded at the time of opening the package.</li>
            <li>The issue must be reported to <strong className="text-gray-900">zupestoreonline@gmail.com</strong> within <strong className="text-gray-900">24 hours of delivery</strong>.</li>
            <li>Once reviewed and verified, our team will process the replacement or refund accordingly.</li>
            <li>Products cannot be returned for reasons such as change of mind, size preferences, or personal choice.</li>
          </ul>
          <p className="pt-1">
            For more details, please visit our{" "}
            <Link href="/return" className="text-[#FF7A00] font-semibold underline hover:text-[#e06b00]">
              Return Policy
            </Link>{" "}
            page.
          </p>
        </div>
      ),
    },
    {
      id: "intellectual-property",
      number: "6",
      title: "Intellectual Property",
      icon: Lock,
      content: (
        <p>
          All content, including text, images, product designs, logos, and graphics on Zupe Store, is the intellectual property of <strong className="text-gray-900">Zupe Store</strong> and its licensors. Unauthorized use, reproduction, or modification of any material is strictly prohibited.
        </p>
      ),
    },
    {
      id: "user-accounts",
      number: "7",
      title: "User Accounts",
      icon: UserCheck,
      content: (
        <p>
          When creating an account on Zupe Store, you agree to provide accurate and current information. You are responsible for safeguarding your login credentials and for all activities under your account. Zupe Store reserves the right to suspend or terminate accounts found to be in violation of our policies or involved in fraudulent activities.
        </p>
      ),
    },
    {
      id: "limitation-liability",
      number: "8",
      title: "Limitation of Liability",
      icon: AlertCircle,
      content: (
        <p>
          Zupe Store shall not be held liable for any indirect, incidental, or consequential damages arising from the use of our website, products, or services, including but not limited to data loss, loss of profits, or delays beyond our control.
        </p>
      ),
    },
    {
      id: "policy-updates",
      number: "9",
      title: "Policy Updates",
      icon: ShieldCheck,
      content: (
        <p>
          Zupe Store reserves the right to revise, modify, or update these Terms &amp; Conditions at any time without prior notice. Continued use of the website after changes are posted constitutes your acceptance of the updated terms.
        </p>
      ),
    },
    {
      id: "contact-us",
      number: "10",
      title: "Contact Us",
      icon: Mail,
      content: (
        <div className="space-y-3">
          <p>
            For any questions or concerns related to these Terms and Conditions, please contact our support team at:
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="mailto:zupestoreonline@gmail.com"
              className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-950 font-semibold px-4 py-2 rounded-xl hover:bg-orange-100 transition-colors"
            >
              📧 zupestoreonline@gmail.com
            </a>
            <a
              href="https://wa.me/919744122853?text=Hi%20Zupe%20Store%2C%20I%20have%20a%20question%20about%20your%20terms"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-950 font-semibold px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              💬 WhatsApp Support
            </a>
          </div>
        </div>
      ),
    },
  ];

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
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 tracking-tight">
                Terms and Conditions
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Official terms of use &amp; policies for Zupe Store
              </p>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100 divide-y divide-gray-100">
          {termsList.map((item) => {
            const Icon = item.icon;
            return (
              <section key={item.id} className="py-7 first:pt-0 last:pb-0 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF7A00] flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {item.number}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                    {item.title}
                  </h2>
                </div>
                <div className="text-sm sm:text-base text-gray-600 leading-relaxed pl-11">
                  {item.content}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
