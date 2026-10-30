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
  title: "Terms and Conditions | Turkiye Jam",
  description:
    "Read the Terms and Conditions governing your use of the Turkiye Jam website, online shopping services, purchases, payments, orders, and returns in India.",
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
          By accessing or using <strong className="text-gray-900">Turkiye Jam</strong>, you agree to comply with these Terms and Conditions. You must be at least 18 years old or accessing the site under the supervision of a parent or legal guardian. You agree to use our website solely for lawful purposes and refrain from any actions that may harm, disrupt, or misuse the platform.
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
            At <strong className="text-gray-900">Turkiye Jam</strong>, every product listed on our platform is <strong className="text-gray-900">100% authentic, tamper-proof sealed, and directly imported from Turkey</strong> to ensure you receive only genuine herbal macun paste. We take complete responsibility for product handling, packaging, and discreet express shipping.
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-700">
            <li>Product descriptions, dosage guidelines, and packaging options are provided for clarity.</li>
            <li>We reserve the right to modify, update, or discontinue any package tier without prior notice.</li>
            <li>Turkiye Jam guarantees authentic Themra herbal paste formulation with original holograms.</li>
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
            All prices displayed on Turkiye Jam are in INR (₹) inclusive of all applicable taxes. We reserve the right to adjust pricing, promotional discounts, or bundle offers. Payments can be completed online via UPI, Cards, Netbanking, or via Cash on Delivery (COD) across India.
          </p>
          <p className="bg-red-50/60 border border-red-100 rounded-xl p-3 text-red-950 font-medium text-sm">
            Turkiye Jam ensures that all payment transactions are encrypted and processed safely through verified RBI-compliant gateways.
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
            Turkiye Jam directly manages the packaging and shipping of every order to ensure reliable, discreet, and safe delivery. Shipping times typically range from 24 to 48 hours for express prepaid orders and 2–4 business days nationwide across India.
          </p>
          <p>
            While we strive for prompt dispatch, Turkiye Jam is not responsible for unforeseen delays caused by logistics partners, natural events, or regional restrictions.
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
            We stand by the quality of every product we deliver with our <strong className="text-gray-900">15-day unused strip refund guarantee</strong>.
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-700">
            <li>For damaged parcels, please report with an unboxing video to <strong className="text-gray-900">support@turkiyejam.in</strong> or WhatsApp within <strong className="text-gray-900">48 hours of delivery</strong>.</li>
            <li>Once reviewed and verified, our team will process the replacement or refund accordingly.</li>
          </ul>
          <p className="pt-1">
            For more details, please visit our{" "}
            <Link href="/return" className="text-[#5b1420] font-bold underline hover:text-[#7d1c2e]">
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
          All content, including text, images, product designs, logos, and graphics on Turkiye Jam, is the intellectual property of <strong className="text-gray-900">Turkiye Jam</strong> and its licensors. Unauthorized use, reproduction, or modification of any material is strictly prohibited.
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
          When creating an account on Turkiye Jam, you agree to provide accurate and current information. You are responsible for safeguarding your login credentials and for all activities under your account. Turkiye Jam reserves the right to suspend or terminate accounts found to be in violation of our policies or involved in fraudulent activities.
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
          Turkiye Jam shall not be held liable for any indirect, incidental, or consequential damages arising from the use of our website, products, or services, including but not limited to data loss, loss of profits, or delays beyond our control.
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
          Turkiye Jam reserves the right to revise, modify, or update these Terms &amp; Conditions at any time without prior notice. Continued use of the website after changes are posted constitutes your acceptance of the updated terms.
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
              href="mailto:support@turkiyejam.in"
              className="inline-flex items-center gap-2 bg-stone-100 border-2 border-stone-800 text-stone-900 font-bold px-4 py-2 rounded-xl hover:bg-stone-200 transition-colors shadow-[0_2px_0_0_#2b2b2b]"
            >
              📧 support@turkiyejam.com
            </a>
            <a
              href="https://wa.me/916238165935?text=Hi%20Turkiye%20Jam%2C%20I%20have%20a%20question%20about%20your%20terms"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#d1fae5] border-2 border-stone-800 text-[#0e4a3b] font-bold px-4 py-2 rounded-xl hover:bg-emerald-200 transition-colors shadow-[0_2px_0_0_#2b2b2b]"
            >
              💬 WhatsApp: +91 62381 65935
            </a>
          </div>
        </div>
      ),
    },
  ];

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
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-tj-serif font-black text-stone-900 tracking-tight">
                Terms and Conditions
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 font-medium">
                Official terms of use &amp; policies for Turkiye Jam
              </p>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-stone-800 shadow-[0_6px_0_0_#2b2b2b] divide-y divide-stone-200">
          {termsList.map((item) => {
            return (
              <section key={item.id} className="py-7 first:pt-0 last:pb-0 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#fed000] border-2 border-stone-800 text-stone-900 flex items-center justify-center font-black text-sm flex-shrink-0 shadow-[0_2px_0_0_#2b2b2b]">
                    {item.number}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold font-tj-serif text-stone-900 flex items-center gap-2">
                    {item.title}
                  </h2>
                </div>
                <div className="text-sm sm:text-base text-stone-700 leading-relaxed pl-11">
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
