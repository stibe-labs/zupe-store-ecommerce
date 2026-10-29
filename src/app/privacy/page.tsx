import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Cookie, Server, Share2, Target, EyeOff, Database, RefreshCw, Mail, Phone } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy | Turkiye Jam",
  description: "Read the Privacy Policy of Turkiye Jam to understand how we collect, use, protect, and manage customer information when you use our website and online shopping services in India.",
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
            When you visit Turkiye Jam, we automatically collect certain information about your device, such as your IP address, browser type, time zone, and some cookies installed on your device. This is referred to as <strong className="text-gray-900">&quot;Device Information.&quot;</strong>
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
            We may share your Personal Information with third-party service providers (e.g., payment processors, shipping partners, or analytics platforms) strictly to help us operate Turkiye Jam efficiently.
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
            <a href="mailto:zupestoreonline@gmail.com" className="text-[#FF7A00] font-semibold underline">
              zupestoreonline@gmail.com
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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#f8bac5] border-2 border-stone-800 flex items-center justify-center text-[#5b1420] shadow-[0_3px_0_0_#2b2b2b]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black font-tj-serif text-stone-900 tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-xs sm:text-sm text-stone-600">
                Official policy for Turkiye Jam customers
              </p>
            </div>
          </div>

          <div className="bg-white border-2 border-stone-800 rounded-3xl p-6 shadow-[0_4px_0_0_#2b2b2b] text-sm text-stone-700 leading-relaxed">
            This Privacy Policy outlines how your personal information is collected, used, and shared when you visit or make a purchase from <strong className="text-stone-900">Turkiye Jam</strong>.
          </div>
        </div>

        {/* Policy Sections List */}
        <div className="space-y-4">
          {sections.map((section, idx) => {
            return (
              <div
                key={section.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-stone-800 shadow-[0_4px_0_0_#2b2b2b]"
              >
                <div className="flex items-center gap-3 mb-4 border-b border-stone-200 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#fed000] border-2 border-stone-800 text-stone-900 flex items-center justify-center font-black text-sm shadow-[0_2px_0_0_#2b2b2b]">
                    {idx + 1}
                  </div>
                  <h2 className="text-lg sm:text-xl font-tj-serif font-black text-stone-900">
                    {section.title}
                  </h2>
                </div>
                <div className="text-sm sm:text-base text-stone-700 leading-relaxed">
                  {section.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Help Box */}
        <div className="mt-8 bg-white rounded-3xl p-6 sm:p-7 border-2 border-stone-800 shadow-[0_6px_0_0_#2b2b2b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-tj-serif font-black text-stone-900 text-base">Have questions regarding your privacy?</h3>
            <p className="text-sm text-stone-600 mt-0.5 font-medium">Our support team is available Mon-Sat to assist you.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="mailto:support@turkiyejam.in"
              className="btn-shimmer inline-flex items-center gap-2 bg-[#fed000] hover:bg-[#fab005] text-stone-900 text-sm font-black px-4 py-2.5 rounded-xl border-2 border-stone-800 shadow-[0_3px_0_0_#2b2b2b] transition-all"
            >
              <Mail className="w-4 h-4 text-stone-900" />
              support@turkiyejam.in
            </a>
            <a
              href="tel:+917356765036"
              className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-900 border-2 border-stone-800 text-sm font-bold px-4 py-2.5 rounded-xl shadow-[0_3px_0_0_#2b2b2b] transition-all"
            >
              <Phone className="w-4 h-4 text-[#5b1420]" />
              +91 73567 65036
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
