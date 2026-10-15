import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Cookie, Server, Share2, Target, EyeOff, Database, RefreshCw, Mail, Phone } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy | Zupe Store",
  description: "Read the Privacy Policy of Zupe Store to understand how we collect, use, protect, and manage customer information when you use our website and online shopping services in India.",
};

export default function PrivacyPolicyPage() {
  const sections = [
    {
      id: "personal-information",
      title: "Personal Information We Collect",
      icon: Cookie,
      content: (
        <div className="space-y-4">
          <p>
            When you visit Zupe Store, we automatically collect certain information about your device, such as your IP address, browser type, time zone, and some cookies installed on your device. This is referred to as <strong className="text-gray-900">&quot;Device Information.&quot;</strong>
          </p>
          <p>We collect Device Information using technologies such as:</p>
          <ul className="list-disc list-inside space-y-2 pl-2 text-gray-700">
            <li><strong className="text-gray-900">“Cookies”</strong> – data files stored on your device</li>
            <li><strong className="text-gray-900">“Log files”</strong> – track actions and gather data like IP, browser type, and timestamps</li>
            <li><strong className="text-gray-900">“Pixels” or “web beacons”</strong> – help monitor site activity and user behavior</li>
          </ul>
          <p>
            Additionally, when you place or attempt to place an order, we collect Order Information including your name, billing address, shipping address, phone number, and email.
          </p>
          <p className="bg-orange-50/60 border border-orange-100 rounded-xl p-3 text-orange-950 font-medium text-sm">
            &quot;Personal Information&quot; includes both Device and Order Information.
          </p>
        </div>
      ),
    },
    {
      id: "how-we-use",
      title: "How We Use Your Personal Information",
      icon: Server,
      content: (
        <div className="space-y-4">
          <p>
            We use your Order Information to fulfill orders, process payments, ship products, and communicate order status or updates. We may also use it to:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2 text-gray-700">
            <li>Contact you via email, phone, or WhatsApp for support</li>
            <li>Screen orders for fraud or suspicious activity</li>
            <li>Provide you with marketing offers based on your interests, if you have opted in</li>
          </ul>
          <p>
            Device Information helps us improve user experience, load times, and ad targeting.
          </p>
        </div>
      ),
    },
    {
      id: "sharing-information",
      title: "Sharing Your Personal Information",
      icon: Share2,
      content: (
        <div className="space-y-4">
          <p>
            We may share your Personal Information with third-party service providers (e.g., payment processors, shipping partners, or analytics platforms) strictly to help us operate Zupe Store efficiently.
          </p>
          <p>
            We may also disclose your information to comply with legal obligations or respond to lawful requests (e.g., government or regulatory orders).
          </p>
        </div>
      ),
    },
    {
      id: "behavioural-advertising",
      title: "Behavioural Advertising",
      icon: Target,
      content: (
        <div className="space-y-4">
          <p>
            We may use your personal data to deliver targeted ads based on your interests. You can opt out of targeted advertising through:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2 text-gray-700">
            <li>
              Google Ads:{" "}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF7A00] underline hover:text-[#e06b00]"
              >
                https://adssettings.google.com
              </a>
            </li>
            <li>
              Facebook Ads:{" "}
              <a
                href="https://www.facebook.com/settings/?tab=ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF7A00] underline hover:text-[#e06b00]"
              >
                https://www.facebook.com/settings/?tab=ads
              </a>
            </li>
            <li>
              General opt-out:{" "}
              <a
                href="http://optout.networkadvertising.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF7A00] underline hover:text-[#e06b00]"
              >
                http://optout.networkadvertising.org
              </a>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "do-not-track",
      title: "Do Not Track",
      icon: EyeOff,
      content: (
        <div className="space-y-2">
          <p>
            We currently do not respond to &quot;Do Not Track&quot; signals from browsers, but we respect your privacy choices using cookie banners and consent preferences.
          </p>
        </div>
      ),
    },
    {
      id: "data-retention",
      title: "Data Retention",
      icon: Database,
      content: (
        <div className="space-y-2">
          <p>
            We retain your Order Information for our records unless and until you request us to delete it. You may request data removal at any time by contacting{" "}
            <a href="mailto:support@zupestore.in" className="text-[#FF7A00] font-semibold underline">
              support@zupestore.in
            </a>.
          </p>
        </div>
      ),
    },
    {
      id: "changes",
      title: "Changes",
      icon: RefreshCw,
      content: (
        <div className="space-y-2">
          <p>
            We may update this policy from time to time to reflect changes in our practices, technology, or legal obligations. The latest version will always be available at{" "}
            <strong className="text-gray-900">www.zupestore.in/privacy</strong>.
          </p>
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
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Official policy for Zupe Store customers
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-sm text-sm text-gray-600 leading-relaxed">
            This Privacy Policy outlines how your personal information is collected, used, and shared when you visit or make a purchase from <strong className="text-gray-900">www.zupestore.in</strong>.
          </div>
        </div>

        {/* Policy Sections List */}
        <div className="space-y-4">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-gray-100 hover:border-orange-200/60 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF7A00] flex items-center justify-center font-semibold text-sm">
                    {idx + 1}
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {section.title}
                  </h2>
                </div>
                <div className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {section.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Help Box */}
        <div className="mt-8 bg-gradient-to-br from-orange-500/10 via-white to-orange-500/5 rounded-2xl p-6 border border-orange-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 text-base">Have questions regarding your privacy?</h3>
            <p className="text-sm text-gray-600 mt-0.5">Our support team is available Mon-Sat to assist you.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="mailto:support@zupestore.in"
              className="inline-flex items-center gap-2 bg-[#FF7A00] hover:bg-[#e06b00] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <Mail className="w-4 h-4" />
              support@zupestore.in
            </a>
            <a
              href="tel:+919744122854"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <Phone className="w-4 h-4 text-[#FF7A00]" />
              +91 97441 22854
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
