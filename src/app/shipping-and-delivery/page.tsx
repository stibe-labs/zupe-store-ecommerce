import React from "react";
import Link from "next/link";
import {
  Truck,
  ArrowLeft,
  Clock,
  Package,
  Layers,
  MapPin,
  AlertTriangle,
  BadgePercent,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Video,
  FileText,
  Search,
  ArrowRight,
  ExternalLink,
  PackageSearch,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Shipping & Delivery Policy | Zupe Store",
  description:
    "Learn about Zupe Store shipping and delivery across India, including order processing times, delivery timelines, shipping charges, tracking, delivery attempts, and order support.",
};

export default function ShippingAndDeliveryPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#FF7A00] transition-colors mb-4 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF7A00]">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 tracking-tight">
                Shipping and Delivery
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Nationwide express delivery and shipping policy
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm text-sm sm:text-base text-gray-600 leading-relaxed">
            At <strong className="text-gray-900">Zupe Store</strong>, we ensure every order is handled with care — from packaging to doorstep delivery. All our products are <strong className="text-gray-900">handpicked, quality-checked, and shipped directly from our fulfillment centers</strong> to ensure a smooth and reliable experience for our customers.
          </div>
        </div>

        {/* Quick Order Tracking Action Banner */}
        <div className="bg-gradient-to-r from-orange-500 via-[#FF7A00] to-amber-500 rounded-2xl p-4 sm:p-5 text-white shadow-md shadow-orange-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 text-white">
              <PackageSearch className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">Looking to track your order?</h3>
              <p className="text-xs sm:text-sm text-white/90">
                Redirect to our live tracking portal using your Order ID (#1054) or Mobile Number.
              </p>
            </div>
          </div>
          <Link
            href="/order-tracking"
            className="inline-flex items-center justify-center gap-2 bg-white text-[#FF7A00] hover:bg-orange-50 font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm flex-shrink-0 active:scale-[0.98]"
          >
            <span>Track Your Order</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Quick Highlights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF7A00] flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-gray-900 text-sm">Processing Time</h4>
            <p className="text-xs text-gray-500 mt-1">1-3 business days standard processing</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <BadgePercent className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-gray-900 text-sm">Free Delivery</h4>
            <p className="text-xs text-gray-500 mt-1">On all orders above ₹999</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-gray-900 text-sm">Delivery Window</h4>
            <p className="text-xs text-gray-500 mt-1">4-9 business days across India</p>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100 space-y-9 text-sm sm:text-base text-gray-600 leading-relaxed">
          {/* 1. Order Processing */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
              <Clock className="w-5 h-5 text-[#FF7A00]" />
              <h2>Order Processing</h2>
            </div>
            <p>
              Once you place an order, our team begins preparing it for dispatch. Standard processing time is <strong className="text-gray-900">1-3 business days</strong>. During festive or high-demand periods, order handling may take slightly longer. Once your order is shipped, you&apos;ll receive a confirmation email or SMS with full tracking details.
            </p>
          </section>

          {/* 2. Estimated Delivery Timeline */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
              <Truck className="w-5 h-5 text-[#FF7A00]" />
              <h2>Estimated Delivery Timeline</h2>
            </div>
            <ul className="space-y-2 list-disc list-inside pl-2 text-gray-700">
              <li>
                <strong className="text-gray-900">Standard Shipping (Across India):</strong> 4-9 business days
              </li>
              <li>
                <strong className="text-gray-900">Remote or Rural Areas:</strong> May take an additional 3-5 business days
              </li>
            </ul>
            <p className="text-xs sm:text-sm bg-gray-50 border border-gray-200/80 rounded-xl p-3 text-gray-600">
              <strong className="text-gray-900">Note:</strong> Delivery times are estimates and may vary due to logistics delays, weather conditions, or regional restrictions. Zupe Store always strives to ensure timely deliveries through trusted courier partners.
            </p>
          </section>

          {/* 3. Shipping Charges */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
              <BadgePercent className="w-5 h-5 text-[#FF7A00]" />
              <h2>Shipping Charges</h2>
            </div>
            <ul className="space-y-2 list-disc list-inside pl-2 text-gray-700">
              <li>
                <strong className="text-gray-900">Free Shipping:</strong> Available on all orders above ₹999
              </li>
              <li>
                Orders below ₹999 may incur a standard shipping fee ranging from ₹79-₹199, depending on location and product category.
              </li>
            </ul>
          </section>

          {/* 4. Tracking Information with Redirect Option */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
              <Package className="w-5 h-5 text-[#FF7A00]" />
              <h2>Tracking Information</h2>
            </div>
            <p>
              After dispatch, you&apos;ll receive a <strong className="text-gray-900">tracking link</strong> via email or SMS. Tracking updates generally take <strong className="text-gray-900">24-48 hours</strong> to become active after shipment. You can use this link to follow your package until it&apos;s delivered safely to your doorstep.
            </p>
            
            {/* Inline Redirect to Order Tracking */}
            <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FF7A00]/10 text-[#FF7A00] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Live Order Tracking Portal</h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Redirect to our order tracking system for real-time Delhivery &amp; courier status checkpoints.
                  </p>
                </div>
              </div>
              <Link
                href="/order-tracking"
                className="inline-flex items-center justify-center gap-2 bg-[#FF7A00] hover:bg-[#e06b00] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm flex-shrink-0 active:scale-[0.98]"
              >
                <span>Go to Order Tracking</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>

          {/* 5. Multiple Shipments */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
              <Layers className="w-5 h-5 text-[#FF7A00]" />
              <h2>Multiple Shipments</h2>
            </div>
            <p>
              To ensure faster delivery, your order might be shipped in multiple packages if it contains multiple items. Each shipment will have its own tracking ID and will be delivered individually. Rest assured — you&apos;ll receive all your products.
            </p>
          </section>

          {/* 6. Delivery Attempts */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
              <CheckCircle2 className="w-5 h-5 text-[#FF7A00]" />
              <h2>Delivery Attempts</h2>
            </div>
            <p>
              Our courier partners will attempt delivery <strong className="text-gray-900">up to 3 times</strong>. If you are unavailable, they may contact you for rescheduling. In case of non-delivery after multiple attempts, the parcel may be returned to us. Please contact our team immediately if this happens so we can assist you further.
            </p>
          </section>

          {/* 7. Service Coverage */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
              <MapPin className="w-5 h-5 text-[#FF7A00]" />
              <h2>Service Coverage</h2>
            </div>
            <ul className="space-y-2 list-disc list-inside pl-2 text-gray-700">
              <li>We currently deliver across all major cities and towns in India.</li>
              <li>Deliveries are not available to P.O. boxes, APO/FPO/DPO addresses, or restricted zones.</li>
            </ul>
          </section>

          {/* 8. Damaged, Missing, or Lost Orders */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2>Damaged, Missing, or Lost Orders</h2>
            </div>
            <p>
              All parcels are securely packed and checked before dispatch. In the rare case that your order arrives damaged, incomplete, or appears lost in transit, please contact us within <strong className="text-gray-900">24 hours of delivery</strong> at <strong className="text-gray-900">zupestoreonline@gmail.com</strong>.
            </p>
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-amber-950 flex items-start gap-3">
              <Video className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm">
                To process your claim smoothly, please provide a <strong className="text-amber-950">clear unboxing video</strong> showing the issue. After verification, we will arrange a replacement or initiate a refund as per our{" "}
                <Link href="/return" className="text-[#FF7A00] font-semibold underline hover:text-[#e06b00]">
                  Return Policy
                </Link>.
              </p>
            </div>
          </section>

          {/* 9. Customs, Duties & Taxes */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
              <FileText className="w-5 h-5 text-[#FF7A00]" />
              <h2>Customs, Duties &amp; Taxes</h2>
            </div>
            <p>
              All prices shown on Zupe Store are inclusive of applicable Indian taxes. If any regional tax or surcharge applies at the delivery location, it will be calculated at checkout. Zupe Store is not responsible for any additional local charges imposed by authorities post-shipment.
            </p>
          </section>

          {/* 10. Our Commitment */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
              <ShieldCheck className="w-5 h-5 text-[#FF7A00]" />
              <h2>Our Commitment</h2>
            </div>
            <p>
              We value your time and trust. Zupe Store is committed to providing fast, reliable, and safe delivery for every order. From packaging to tracking, our dedicated team ensures your products reach you in perfect condition.
            </p>
          </section>

          {/* 11. Need Assistance? */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
              <Mail className="w-5 h-5 text-[#FF7A00]" />
              <h2>Need Assistance?</h2>
            </div>
            <p>
              For order-related queries or delivery support, feel free to reach out to our customer care team at:
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="mailto:zupestoreonline@gmail.com"
                className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-950 font-semibold px-4 py-2 rounded-xl hover:bg-orange-100 transition-colors"
              >
                📧 zupestoreonline@gmail.com
              </a>
              <a
                href="https://wa.me/919744122853?text=Hi%20Zupe%20Store%2C%20I%20have%20an%20inquiry%20about%20shipping"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-950 font-semibold px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors"
              >
                💬 WhatsApp Support
              </a>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
