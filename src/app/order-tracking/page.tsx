"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/siteConfig";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  X,
  RotateCcw,
  Sparkles,
  Plane,
  BadgeCheck,
  Award,
  ChevronRight,
  Layers,
  HelpCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ERPOrder } from "@/lib/erpStore";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";

interface TrackingCheckpoint {
  title: string;
  location: string;
  timestamp: string;
  completed: boolean;
  active?: boolean;
  description?: string;
}

function getProductImageFallback(productName?: string): string {
  if (!productName) return "/vittal/product-whey-protein-jar.png";
  const norm = productName.toLowerCase();
  const match = DEFAULT_PRODUCTS.find((p) =>
    p.name.toLowerCase().includes(norm) || norm.includes(p.name.toLowerCase())
  );
  if (match) {
    return match.poster_image || match.images[0] || "/vittal/product-whey-protein-jar.png";
  }
  return "/vittal/product-whey-protein-jar.png";
}

function buildTrackingCheckpoints(order: ERPOrder, liveTracking?: any): TrackingCheckpoint[] {
  // If REAL live carrier scan activities returned from Shiprocket API, render real-time events
  if (
    liveTracking?.activities &&
    Array.isArray(liveTracking.activities) &&
    liveTracking.activities.length > 0 &&
    !liveTracking.isSimulated &&
    !liveTracking.isPending
  ) {
    return liveTracking.activities.map((act: any, idx: number) => ({
      title: act.activity || act.status || "Package Scanned",
      location: act.location || "Logistics Hub",
      timestamp: act.date || "",
      completed: true,
      active: idx === 0,
      description: `Carrier update from ${order.courier_partner || liveTracking.courier_name || "Logistics Partner"}: ${act.activity || act.status}.`,
    }));
  }

  const rawDate = order.created_at ? new Date(order.created_at.replace(" ", "T")) : new Date();
  const formatPlacedTime = !isNaN(rawDate.getTime())
    ? rawDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Just now";

  const status = (order.delivery_status || order.status || "Processing").trim();
  const city = order.shipping_address?.split(",")?.slice(-2)?.[0]?.trim() || "Destination City";
  const courier = order.courier_partner || "Express Air Logistics";
  const hasAwb = Boolean(
    order.shiprocket_awb &&
      !order.shiprocket_awb.startsWith("SR-AWB-") &&
      !order.shiprocket_awb.startsWith("SR-") &&
      !order.shiprocket_awb.toUpperCase().includes("PENDING")
  );

  // Status-driven milestone progression for Vittal Lifestyle orders
  if (status.toLowerCase().includes("delivered")) {
    return [
      {
        title: "Order Placed & Verified",
        location: "Vittal Central Fulfillment Hub",
        timestamp: formatPlacedTime,
        completed: true,
        description: "Order confirmed with purity inspection and tamper-evident seal verified.",
      },
      {
        title: "Quality Check & Secured Packaging",
        location: "Cleanroom Packaging Unit",
        timestamp: "Day 1",
        completed: true,
        description: "Packed in hermetic, food-grade temperature-controlled protective casing.",
      },
      {
        title: "Dispatched via Express Air Cargo",
        location: "National Airport Logistics Center",
        timestamp: "Day 2",
        completed: true,
        description: `Dispatched with ${courier}. Waybill barcode scanned at transit hub.`,
      },
      {
        title: `Arrived at ${city} Hub`,
        location: `${city} Regional Facility`,
        timestamp: "Day 4",
        completed: true,
        description: "Consignment sorted for local last-mile courier delivery associate.",
      },
      {
        title: "Delivered to Customer",
        location: order.shipping_address || city,
        timestamp: "Completed",
        completed: true,
        active: true,
        description: "Package handed over with OTP verification. 100% Authentic Guarantee active.",
      },
    ];
  }

  if (status.toLowerCase().includes("out for delivery")) {
    return [
      {
        title: "Order Placed & Verified",
        location: "Vittal Central Fulfillment Hub",
        timestamp: formatPlacedTime,
        completed: true,
        description: "Order confirmed with purity inspection and tamper-evident seal verified.",
      },
      {
        title: "Quality Check & Secured Packaging",
        location: "Cleanroom Packaging Unit",
        timestamp: "Completed",
        completed: true,
        description: "Packed in hermetic, food-grade temperature-controlled protective casing.",
      },
      {
        title: "Dispatched via Express Air Cargo",
        location: "National Airport Logistics Center",
        timestamp: "Completed",
        completed: true,
        description: `Handed over to ${courier}. Air consignment in priority transit.`,
      },
      {
        title: `Out for Delivery in ${city}`,
        location: `${city} Last-Mile Station`,
        timestamp: "Today",
        completed: true,
        active: true,
        description: "Courier executive is out with your package. Keep your OTP and cash/UPI ready.",
      },
      {
        title: "Delivered at Doorstep",
        location: order.shipping_address || city,
        timestamp: "Pending Delivery",
        completed: false,
        description: "Final doorstep verification and handover.",
      },
    ];
  }

  if (status.toLowerCase().includes("transit") || status.toLowerCase().includes("shipped")) {
    return [
      {
        title: "Order Placed & Verified",
        location: "Vittal Central Fulfillment Hub",
        timestamp: formatPlacedTime,
        completed: true,
        description: "Order confirmed with purity inspection and tamper-evident seal verified.",
      },
      {
        title: "Quality Check & Secured Packaging",
        location: "Cleanroom Packaging Unit",
        timestamp: "Completed",
        completed: true,
        description: "Packed in hermetic, food-grade temperature-controlled protective casing.",
      },
      {
        title: "In Transit via Express Logistics",
        location: hasAwb ? `${courier} Sorting Hub` : "National Air Logistics Center",
        timestamp: "In Progress",
        completed: true,
        active: true,
        description: `Consignment en route to ${city}. Real-time tracking active on ${courier}.`,
      },
      {
        title: `Arrival at ${city} Hub`,
        location: `${city} Regional Facility`,
        timestamp: "Next Milestone",
        completed: false,
        description: "Sorting for final delivery dispatch.",
      },
      {
        title: "Doorstep Handover",
        location: order.shipping_address || city,
        timestamp: "Pending",
        completed: false,
        description: "Delivery executive will contact via WhatsApp/SMS prior to arrival.",
      },
    ];
  }

  if (status.toLowerCase().includes("rto") || status.toLowerCase().includes("returned")) {
    return [
      {
        title: "Order Placed & Verified",
        location: "Vittal Central Fulfillment Hub",
        timestamp: formatPlacedTime,
        completed: true,
        description: "Order received and processed.",
      },
      {
        title: "Dispatched to Destination",
        location: "Logistics Hub",
        timestamp: "Completed",
        completed: true,
        description: `Consignment dispatched with ${courier}.`,
      },
      {
        title: "Delivery Attempt Incomplete",
        location: `${city} Hub`,
        timestamp: "Recent Update",
        completed: true,
        active: true,
        description: "Consignment returning to origin hub. Contact support to arrange redelivery.",
      },
    ];
  }

  // Default: Processing / Quality Packaging
  return [
    {
      title: "Order Placed & Confirmed",
      location: "Vittal Central Fulfillment Hub",
      timestamp: formatPlacedTime,
      completed: true,
      description: "Order received in our ERP system. Batch purity & macro certification assigned.",
    },
    {
      title: "Quality Check & Sealed Packaging",
      location: "Cleanroom Packaging Unit",
      timestamp: "In Progress",
      completed: true,
      active: true,
      description: "Undergoing batch inspection and packed in certified airtight protective casing.",
    },
    {
      title: "Courier Handover & AWB Generation",
      location: "National Logistics Dispatch",
      timestamp: "Estimated 24-48 Hours",
      completed: false,
      description: "Courier partner allocation and shipment waybill activation.",
    },
    {
      title: "Express Air Transit",
      location: "Priority Air Network",
      timestamp: "Upcoming",
      completed: false,
      description: `Direct air cargo transit to ${city}.`,
    },
    {
      title: "Doorstep Handover",
      location: order.shipping_address || city,
      timestamp: "Upcoming",
      completed: false,
      description: "Secure delivery with SMS/WhatsApp OTP confirmation.",
    },
  ];
}

function OrderTrackingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery =
    searchParams?.get("query") ||
    searchParams?.get("oid") ||
    searchParams?.get("orderId") ||
    searchParams?.get("order_id") ||
    searchParams?.get("id") ||
    searchParams?.get("awb") ||
    "";
  const orderStatus = (searchParams?.get("ost") || "").toUpperCase();

  const [inputTerm, setInputTerm] = useState(urlQuery);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorSupport, setErrorSupport] = useState<string | null>(null);
  const [matchedOrders, setMatchedOrders] = useState<ERPOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ERPOrder | null>(null);
  const [liveTracking, setLiveTracking] = useState<any>(null);
  const [copiedAWB, setCopiedAWB] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const journeySectionRef = useRef<HTMLDivElement | null>(null);

  const scrollToJourney = () => {
    setTimeout(() => {
      if (journeySectionRef.current) {
        const targetY =
          journeySectionRef.current.getBoundingClientRect().top +
          window.scrollY -
          100;
        window.scrollTo({
          top: Math.max(0, targetY),
          behavior: "smooth",
        });
      }
    }, 150);
  };

  const fetchTracking = async (termToSearch: string, autoScroll = false) => {
    const trimmed = termToSearch.trim();
    if (!trimmed) {
      setErrorMessage("Please enter an Order ID, AWB number, or 10-digit Phone");
      setErrorSupport(null);
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setErrorSupport(null);

    try {
      const res = await fetch(
        `/api/orders/track?query=${encodeURIComponent(trimmed)}&t=${Date.now()}`
      );
      const data = await res.json();

      if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
        setMatchedOrders(data.orders);
        setSelectedOrder(data.orders[0]);
        if (data.live_tracking) {
          setLiveTracking(data.live_tracking);
        } else {
          setLiveTracking(null);
        }
        setLastUpdated(
          new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        );
        if (autoScroll) {
          scrollToJourney();
        }
      } else {
        setMatchedOrders([]);
        setSelectedOrder(null);
        setLiveTracking(null);
        setErrorMessage(
          data.error ||
            `No order found matching "${trimmed}". Please double check your details or search with your 10-digit mobile number.`
        );
        if (data.support_whatsapp) {
          setErrorSupport(data.support_whatsapp);
        }
      }
    } catch {
      setErrorMessage("Unable to fetch order status at this moment. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if URL query is present
  useEffect(() => {
    if (urlQuery) {
      setInputTerm(urlQuery);
      fetchTracking(urlQuery, true);
    }
  }, [urlQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputTerm.trim()) {
      router.push(`/order-tracking?query=${encodeURIComponent(inputTerm.trim())}`);
      fetchTracking(inputTerm.trim(), true);
    }
  };

  const copyToClipboard = (text: string, type: "awb" | "id") => {
    navigator.clipboard.writeText(text);
    if (type === "awb") {
      setCopiedAWB(true);
      setTimeout(() => setCopiedAWB(false), 2000);
    } else {
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 2000);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return {
          bg: "bg-emerald-50 text-emerald-800 border-emerald-300",
          dot: "bg-emerald-500",
          icon: CheckCircle2,
          label: "Delivered",
        };
      case "Out for Delivery":
        return {
          bg: "bg-[#F4FBE8] text-[#3D6318] border-[#95CF42]/40",
          dot: "bg-[#6B9E3A] animate-pulse",
          icon: Truck,
          label: "Out for Delivery Today",
        };
      case "In Transit":
        return {
          bg: "bg-blue-50 text-blue-800 border-blue-200",
          dot: "bg-blue-500 animate-pulse",
          icon: Plane,
          label: "In Transit (Air Cargo)",
        };
      case "RTO Delivered":
      case "RTO Initiated":
      case "Returned":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          dot: "bg-rose-500",
          icon: RotateCcw,
          label: status,
        };
      default:
        return {
          bg: "bg-[#F4FBE8] text-[#3D6318] border-[#95CF42]/40",
          dot: "bg-[#6B9E3A] animate-pulse",
          icon: Clock,
          label: "Processing & Quality Inspection",
        };
    }
  };

  const faqs = [
    {
      q: "Where can I find my Order ID or AWB Tracking Number?",
      a: `Your Order ID (e.g. #${siteConfig.orderPrefix}-1001) is displayed immediately upon order confirmation and sent to your WhatsApp and Email. Once your products are dispatched from our hub, your courier AWB tracking number (Delhivery, Blue Dart, DTDC) is sent directly via WhatsApp with real-time tracking links.`,
    },
    {
      q: "How fast is express delivery across India?",
      a: "Orders are verified and packaged within 24 business hours. Express air logistics delivery typically takes 3 to 5 business days across metro, tier-1, and regional destinations in India.",
    },
    {
      q: "How are supplements, dates & nuts, and activewear protected during shipping?",
      a: "Every supplement container is factory sealed with tamper-evident induction wads. Royal dates and nuts are vacuum sealed in food-grade, multi-layer aroma-barrier pouches. Activewear is packed in individual hygienic zip envelopes inside heavy-duty cartons.",
    },
    {
      q: "Can I track Cash on Delivery (COD) orders?",
      a: "Yes! COD orders have full live tracking with real-time milestone scans. You will also receive an SMS/WhatsApp notification on the morning of delivery with OTP verification. You can pay via Cash or UPI QR directly to the courier executive.",
    },
    {
      q: "What should I do if I am unavailable during delivery?",
      a: "Our courier partners attempt delivery up to 3 times. You will receive the delivery associate's contact details via WhatsApp. You can request a delivery re-attempt or reschedule the date without extra cost.",
    },
    {
      q: "How do I contact customer support or ask about product authenticity?",
      a: `Every product from ${siteConfig.name} is 100% authentic and lab tested. For any queries or order assistance, connect with our dedicated concierge via WhatsApp at +91 ${siteConfig.whatsappNumber} or email us at ${siteConfig.supportEmail}.`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFCF6] text-neutral-900 flex flex-col justify-between selection:bg-[#E2F5B4] selection:text-[#2E4D12] font-mograph">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* ================================================================= */}
        {/* HERO SECTION: CLEAN LUXURY WHITE WITH SOFT GREEN AMBIENT GLOW   */}
        {/* ================================================================= */}
        <section className="relative overflow-hidden bg-white pt-10 sm:pt-14 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 border-b border-neutral-200/80">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#95CF42]/10 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-10 right-10 w-[300px] h-[200px] bg-[#95CF42]/8 blur-[80px] pointer-events-none" />

          <div className="relative max-w-4xl mx-auto text-center">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-neutral-500 mb-4">
              <Link href="/" className="hover:text-[#6B9E3A] transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-neutral-900 font-semibold">Track Order</span>
            </div>

            {/* Live Tracking Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4FBE8] border border-[#95CF42]/40 text-[#3D6318] shadow-xs mb-4 font-mograph">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6B9E3A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6B9E3A]"></span>
              </span>
              <span className="text-[11px] font-bold">
                Live Shipment Radar &amp; Tracking
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold text-neutral-950 tracking-tight leading-tight font-mograph">
              Track Your <span className="text-[#6B9E3A]">Order</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed font-normal font-mograph">
              Enter your Order ID, courier AWB tracking number, or 10-digit mobile number for real-time delivery milestone updates.
            </p>

            {/* Tracking Search Input Card (Clean, modern rounded card) */}
            <div className="mt-8 max-w-2xl mx-auto bg-white rounded-2xl sm:rounded-full shadow-lg p-2 sm:p-2.5 border border-neutral-200/90 ring-1 ring-black/5 font-mograph">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 flex items-center">
                  <div className="absolute left-4 sm:left-5 text-[#6B9E3A]">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={inputTerm}
                    onChange={(e) => setInputTerm(e.target.value)}
                    placeholder="Enter Order ID (e.g. #VL-1001), AWB, or Phone..."
                    className="w-full pl-12 sm:pl-13 pr-10 py-3.5 sm:py-4 text-sm sm:text-base bg-transparent text-neutral-900 placeholder:text-neutral-400 focus:outline-none font-medium"
                  />
                  {inputTerm && (
                    <button
                      type="button"
                      onClick={() => setInputTerm("")}
                      className="absolute right-3 p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full cursor-pointer transition-colors"
                      title="Clear"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-full bg-[#95CF42] hover:bg-[#85BE33] active:scale-95 text-black font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg disabled:opacity-70 cursor-pointer shrink-0 font-mograph"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>Locating Parcel...</span>
                    </>
                  ) : (
                    <>
                      <span>Track Status</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick helper format chips */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-500 font-medium">
              <span>Accepted formats:</span>
              <button
                type="button"
                onClick={() => setInputTerm("#VL-")}
                className="px-2.5 py-1 rounded-lg bg-[#F4FBE8] hover:bg-[#EAF8D7] border border-[#95CF42]/30 text-[#3D6318] font-mono text-[11px] font-semibold transition-colors cursor-pointer"
              >
                #VL-1001
              </button>
              <button
                type="button"
                onClick={() => setInputTerm("SR-AWB-")}
                className="px-2.5 py-1 rounded-lg bg-[#F4FBE8] hover:bg-[#EAF8D7] border border-[#95CF42]/30 text-[#3D6318] font-mono text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Courier AWB
              </button>
              <span className="px-2.5 py-1 rounded-lg bg-[#F4FBE8] border border-[#95CF42]/30 text-[#3D6318] font-mono text-[11px] font-semibold">
                10-Digit Mobile
              </span>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* TRUST BADGES STRIP: SLIM CLEAN CARD                               */}
        {/* ================================================================= */}
        <div className="max-w-5xl mx-auto px-4 -mt-6 sm:-mt-8 relative z-10">
          <div className="bg-white text-neutral-900 rounded-xl sm:rounded-2xl md:rounded-3xl border border-neutral-200/80 shadow-md py-4 px-3 sm:py-5 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-neutral-100 items-center text-center">
              {[
                {
                  icon: BadgeCheck,
                  label: "100% Authentic",
                  desc: "Pure & Lab Certified",
                },
                {
                  icon: ShieldCheck,
                  label: "Quality Guarantee",
                  desc: "Verified Batch Purity",
                },
                {
                  icon: Truck,
                  label: "Express Shipping",
                  desc: "3-5 Days Priority Transit",
                },
                {
                  icon: MessageSquare,
                  label: "Live Milestone Alerts",
                  desc: "Real-Time WhatsApp Updates",
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`flex flex-col items-center justify-center p-2 sm:px-3 text-center ${
                      idx >= 2 ? "pt-3 sm:pt-2" : ""
                    }`}
                  >
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#F4FBE8] border border-[#95CF42]/30 flex items-center justify-center shadow-xs mb-2 shrink-0">
                      <Icon className="w-5 h-5 text-[#3D6318]" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-neutral-900 leading-tight font-mograph tracking-tight">
                      {item.label}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-neutral-500 font-medium leading-tight mt-0.5">
                      {item.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* MAIN BODY: RESULTS OR DEFAULT GUIDE CONTENT                      */}
        {/* ================================================================= */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-10 font-mograph">
          {/* Success Banner if redirected from 1-Click Fastrr Checkout */}
          {orderStatus === "SUCCESS" && (
            <div className="mb-8 p-6 rounded-3xl bg-[#F4FBE8] border border-[#95CF42]/40 text-neutral-900 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#95CF42] text-black flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-neutral-950 font-mograph tracking-tight">
                  🎉 Order Placed Successfully!
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed font-normal">
                  Thank you! Your order has been placed. Your products are undergoing quality verification and being secured in airtight protective packaging.
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-3 py-1 rounded-full bg-white border border-[#95CF42]/40 text-[#3D6318] font-bold text-xs font-mograph">
                    Quality Guarantee Active
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white border border-[#95CF42]/40 text-[#3D6318] font-bold text-xs font-mograph">
                    Priority Dispatch
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white border border-[#95CF42]/40 text-[#3D6318] font-bold text-xs font-mograph">
                    WhatsApp Updates Enabled
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-8 p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
              <div className="text-sm flex-1">
                <p className="font-bold text-rose-900">{errorMessage}</p>
                <p className="text-xs text-rose-600 mt-1 leading-relaxed">
                  Tip: Please check your Email/WhatsApp confirmation or try searching with your 10-digit registered mobile number.
                </p>
                {errorSupport && (
                  <div className="mt-3">
                    <a
                      href={errorSupport}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat with {siteConfig.name} Concierge on WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* If Multiple Orders Match (e.g. searched by phone number) */}
          {matchedOrders.length > 1 && (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-neutral-600 tracking-wider mb-3 font-mograph">
                Found {matchedOrders.length} orders matching your search:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {matchedOrders.map((ord) => {
                  const isSelected = selectedOrder?.id === ord.id;
                  return (
                    <button
                      key={ord.id}
                      onClick={() => {
                        setSelectedOrder(ord);
                        scrollToJourney();
                      }}
                      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#F4FBE8] border-[#95CF42] ring-2 ring-[#95CF42]/40 shadow-md text-neutral-900"
                          : "bg-white border-neutral-200/80 hover:border-neutral-300 text-neutral-700 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-neutral-900 font-mograph tracking-tight">
                          {ord.shopify_order_id || ord.id}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F4FBE8] text-[#3D6318] border border-[#95CF42]/30">
                          {ord.delivery_status || ord.status}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 truncate">
                        {ord.items?.[0]?.product_name || `${siteConfig.name} Products`}
                      </p>
                      <p className="text-xs font-bold text-[#3D6318] mt-2 font-mono">
                        ₹{ord.total_amount?.toLocaleString("en-IN")}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* ACTIVE ORDER TRACKING DISPLAY (WHEN SEARCHED)                   */}
          {/* =============================================================== */}
          {selectedOrder && (
            <div className="space-y-6">
              {/* Card 1: Top Summary & Stepper Card */}
              {(() => {
                const badge = getStatusBadge(selectedOrder.delivery_status || selectedOrder.status);
                const BadgeIcon = badge.icon;
                const checkpoints = buildTrackingCheckpoints(selectedOrder, liveTracking);

                return (
                  <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-md overflow-hidden text-neutral-900">
                    {/* Header Strip */}
                    <div className="p-6 sm:p-8 bg-[#FAFCF6] border-b border-neutral-200/80">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 tracking-tight font-mograph">
                              Order {selectedOrder.shopify_order_id || selectedOrder.id}
                            </h2>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  selectedOrder.shopify_order_id || selectedOrder.id,
                                  "id"
                                )
                              }
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                              title="Copy Order ID"
                            >
                              {copiedOrderId ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-neutral-500 mt-1 font-medium font-mograph">
                            Placed on{" "}
                            {new Date(selectedOrder.created_at || Date.now()).toLocaleDateString(
                              "en-IN",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>

                        {/* Status Badge & Live Sync indicator */}
                        <div className="flex flex-wrap items-center gap-2.5 font-mograph">
                          {liveTracking &&
                            !liveTracking.isSimulated &&
                            !liveTracking.isPending &&
                            Array.isArray(liveTracking.activities) &&
                            liveTracking.activities.length > 0 && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold bg-[#F4FBE8] text-[#3D6318] border border-[#95CF42]/40">
                                <span className="w-2 h-2 rounded-full bg-[#6B9E3A] animate-pulse" />
                                Live Carrier Scan
                              </span>
                            )}

                          {liveTracking?.edd && !liveTracking.isPending && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                              <Clock className="w-3.5 h-3.5" />
                              Est. Delivery: {liveTracking.edd}
                            </span>
                          )}

                          <span
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold border ${badge.bg}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                            <BadgeIcon className="w-4 h-4" />
                            <span>{badge.label}</span>
                          </span>

                          <button
                            onClick={() =>
                              fetchTracking(
                                selectedOrder.shopify_order_id ||
                                  selectedOrder.id ||
                                  inputTerm,
                                true
                              )
                            }
                            disabled={loading}
                            title="Refresh live status from courier"
                            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors border border-neutral-200/80 cursor-pointer"
                          >
                            <RefreshCw
                              className={`w-4 h-4 ${
                                loading ? "animate-spin text-[#3D6318]" : ""
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Step Visual Progress Bar */}
                    <div
                      id="live-shipment-journey"
                      ref={journeySectionRef}
                      className="p-6 sm:p-8 border-t border-neutral-100 scroll-mt-24 font-mograph"
                    >
                      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                        <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2 font-mograph tracking-tight">
                          <Truck className="w-5 h-5 text-[#6B9E3A]" />
                          <span>Live Shipment Journey</span>
                        </h3>
                        {lastUpdated && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#3D6318] bg-[#F4FBE8] px-2.5 py-1 rounded-full border border-[#95CF42]/30 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6B9E3A] animate-pulse" />
                            Live Status Updated • {lastUpdated}
                          </span>
                        )}
                      </div>

                      {/* Stepper Timeline */}
                      <div className="space-y-6 my-4">
                        {checkpoints.map((cp, idx) => {
                          const isLast = idx === checkpoints.length - 1;

                          return (
                            <div key={idx} className="relative flex items-start gap-3.5 sm:gap-5">
                              {/* Left Column: Indicator & Connecting Line */}
                              <div className="relative flex flex-col items-center shrink-0 w-8 self-stretch">
                                {!isLast && (
                                  <div
                                    className={`absolute top-4 -bottom-6 w-0.5 left-1/2 -translate-x-1/2 ${
                                      cp.completed &&
                                      (checkpoints[idx + 1]?.completed ||
                                        checkpoints[idx + 1]?.active)
                                        ? "bg-emerald-400"
                                        : "bg-neutral-200"
                                    }`}
                                  />
                                )}

                                <div
                                  className={`relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-transform ${
                                    cp.active
                                      ? "bg-[#95CF42] border-white ring-4 ring-[#95CF42]/30 text-black shadow-sm"
                                      : cp.completed
                                      ? "bg-emerald-500 border-white text-white shadow-xs"
                                      : "bg-neutral-100 border-neutral-300 text-neutral-400"
                                  }`}
                                >
                                  {cp.active ? (
                                    <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping" />
                                  ) : cp.completed ? (
                                    <Check className="w-4 h-4 text-white stroke-[2.5]" />
                                  ) : (
                                    <span className="w-2 h-2 rounded-full bg-neutral-400" />
                                  )}
                                </div>
                              </div>

                              {/* Content Card */}
                              <div className="flex-1 bg-[#FAFCF6] hover:bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 transition-colors shadow-2xs">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1 font-mograph">
                                  <h4
                                    className={`text-sm sm:text-base font-bold font-mograph tracking-tight ${
                                      cp.active ? "text-[#3D6318]" : "text-neutral-900"
                                    }`}
                                  >
                                    {cp.title}
                                  </h4>
                                  <span className="text-[11px] sm:text-xs font-semibold text-neutral-400">
                                    {cp.timestamp}
                                  </span>
                                </div>
                                <p className="text-xs sm:text-sm font-semibold text-neutral-600 mb-1 flex items-center gap-1.5 font-mograph">
                                  <MapPin className="w-3.5 h-3.5 text-[#6B9E3A] shrink-0" />
                                  <span>{cp.location}</span>
                                </p>
                                {cp.description && (
                                  <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed mt-1 font-mograph">
                                    {cp.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Courier & AWB Details Bar */}
                      {(() => {
                        const isProcessing =
                          (
                            selectedOrder.delivery_status ||
                            selectedOrder.status ||
                            "Processing"
                          ).toLowerCase() === "processing";
                        const rawAwb =
                          selectedOrder.shiprocket_awb ||
                          (selectedOrder as any).tracking_number ||
                          "";
                        const hasRealAwb = Boolean(
                          rawAwb &&
                            !rawAwb.startsWith("SR-AWB-") &&
                            !rawAwb.startsWith("SR-") &&
                            !rawAwb.toUpperCase().includes("PENDING")
                        );
                        const courierName =
                          selectedOrder.courier_partner &&
                          !selectedOrder.courier_partner.toLowerCase().includes("pending")
                            ? selectedOrder.courier_partner
                            : isProcessing
                            ? "Assigned upon dispatch (e.g. Blue Dart / Delhivery)"
                            : "Express Air Logistics";

                        return (
                          <div className="mt-8 pt-6 border-t border-neutral-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mograph">
                            <div className="bg-[#FAFCF6] rounded-2xl p-4 border border-neutral-200/80">
                              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block mb-1 font-mograph">
                                Courier Partner
                              </span>
                              <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4 text-[#6B9E3A]" />
                                <span className="text-sm font-bold text-neutral-900">
                                  {courierName}
                                </span>
                              </div>
                            </div>

                            <div className="bg-[#FAFCF6] rounded-2xl p-4 border border-neutral-200/80">
                              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block mb-1 font-mograph">
                                AWB / Waybill Number
                              </span>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-mono font-bold text-neutral-900">
                                  {hasRealAwb ? rawAwb : "Generating upon courier pickup"}
                                </span>
                                {hasRealAwb && (
                                  <button
                                    onClick={() => copyToClipboard(rawAwb, "awb")}
                                    className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                                    title="Copy AWB"
                                  >
                                    {copiedAWB ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="bg-[#FAFCF6] rounded-2xl p-4 border border-neutral-200/80">
                              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block mb-1 font-mograph">
                                External Tracking Portal
                              </span>
                              {hasRealAwb ? (
                                <a
                                  href={
                                    courierName.toLowerCase().includes("dtdc")
                                      ? `https://www.trackcourier.io/track-dtdc-courier?tracking_number=${rawAwb}`
                                      : courierName.toLowerCase().includes("bluedart")
                                      ? `https://www.bluedart.com/tracking`
                                      : courierName.toLowerCase().includes("post")
                                      ? `https://www.indiapost.gov.in/_layouts/15/dpt.cept.tracking/trackconsignment.aspx`
                                      : courierName.toLowerCase().includes("xpressbees")
                                      ? `https://www.xpressbees.com/track?isawb=Yes&trackid=${rawAwb}`
                                      : `https://www.delhivery.com/track/package/${rawAwb}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D6318] hover:text-[#6B9E3A] hover:underline cursor-pointer"
                                >
                                  <span>Open {courierName} Portal</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              ) : (
                                <span className="text-xs text-neutral-500 font-medium">
                                  Activated once handed to courier
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })()}

              {/* Card 2: Items & Delivery Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mograph">
                {/* Items in this Shipment */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-200/90 shadow-sm p-6 sm:p-8">
                  <h3 className="text-base font-bold text-neutral-900 mb-4 flex items-center gap-2 font-mograph tracking-tight">
                    <Package className="w-5 h-5 text-[#6B9E3A]" />
                    <span>Items in this Shipment</span>
                  </h3>

                  <div className="divide-y divide-neutral-100">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((it: any, idx: number) => {
                        const productName =
                          it.product_name ||
                          it.name ||
                          it.title ||
                          `${siteConfig.name} Package`;
                        const quantity = Number(it.quantity || it.units || 1);
                        const unitPrice =
                          Number(
                            it.unit_price ??
                              it.price ??
                              it.selling_price ??
                              (selectedOrder.total_amount
                                ? Math.round(selectedOrder.total_amount / quantity)
                                : 2999)
                          ) || 2999;
                        const totalPrice =
                          Number(it.total_price ?? unitPrice * quantity) ||
                          unitPrice * quantity;
                        const img =
                          it.image ||
                          it.poster_image ||
                          getProductImageFallback(productName);

                        return (
                          <div
                            key={idx}
                            className="py-4 first:pt-0 last:pb-0 flex items-center gap-4"
                          >
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#FAFCF6] overflow-hidden flex-shrink-0 border border-neutral-200/80">
                              <Image
                                src={img}
                                alt={productName}
                                fill
                                className="object-contain p-1"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-neutral-900 truncate">
                                {productName}
                              </h4>
                              <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                                Qty: {quantity} × ₹{unitPrice.toLocaleString("en-IN")}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#3D6318] bg-[#F4FBE8] px-2 py-0.5 rounded-md border border-[#95CF42]/30">
                                  <ShieldCheck className="w-3 h-3 text-[#6B9E3A]" />
                                  100% Authentic
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-extrabold text-neutral-900">
                                ₹{totalPrice.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-4 flex items-center gap-4">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#FAFCF6] overflow-hidden flex-shrink-0 border border-neutral-200/80">
                          <Image
                            src="/vittal/product-whey-protein-jar.png"
                            alt={siteConfig.name}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-neutral-900 truncate">
                            {siteConfig.name} Curated Products
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                            Qty: 1 × ₹
                            {(selectedOrder.total_amount || 2999).toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-neutral-900">
                            ₹{(selectedOrder.total_amount || 2999).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pricing Summary */}
                  {(() => {
                    const isCod =
                      (selectedOrder.payment_method || "").toLowerCase().includes("cod") ||
                      (selectedOrder.payment_method || "")
                        .toLowerCase()
                        .includes("cash on delivery");
                    const isPaid =
                      (selectedOrder.payment_status || "").toLowerCase() === "paid" ||
                      (selectedOrder.payment_status || "").toLowerCase() === "completed";

                    return (
                      <div className="mt-6 pt-4 border-t border-neutral-100 space-y-2">
                        <div className="flex justify-between text-xs text-neutral-500">
                          <span>Payment Method</span>
                          <span className="font-semibold text-neutral-900">
                            {isCod
                              ? "Cash on Delivery (COD)"
                              : selectedOrder.payment_method || "Prepaid Online"}
                          </span>
                        </div>
                        {isCod && !isPaid ? (
                          <>
                            <div className="flex justify-between text-xs text-neutral-500">
                              <span>Payment Status</span>
                              <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                Payable on Delivery
                              </span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-neutral-900 pt-2 border-t border-neutral-100">
                              <span>Payable at Doorstep</span>
                              <span className="text-[#3D6318] font-bold font-mograph text-lg">
                                ₹{selectedOrder.total_amount?.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between text-xs text-neutral-500">
                              <span>Payment Status</span>
                              <span className="font-semibold text-[#3D6318] bg-[#F4FBE8] px-2 py-0.5 rounded-md border border-[#95CF42]/30">
                                Paid Online (Verified)
                              </span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-neutral-900 pt-2 border-t border-neutral-100">
                              <span>Total Paid</span>
                              <span className="text-[#3D6318] font-bold font-mograph text-lg">
                                ₹{selectedOrder.total_amount?.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Delivery Address & Customer Support */}
                <div className="space-y-6">
                  {/* Delivery Address */}
                  <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2 font-mograph tracking-tight">
                      <MapPin className="w-4 h-4 text-[#6B9E3A]" />
                      <span>Shipping Destination</span>
                    </h3>
                    <p className="text-sm font-bold text-neutral-900">
                      {selectedOrder.customer_name}
                    </p>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      {selectedOrder.shipping_address}
                    </p>
                    {selectedOrder.customer_phone && (
                      <p className="text-xs text-neutral-500 mt-2 font-mono">
                        Phone: {selectedOrder.customer_phone}
                      </p>
                    )}
                  </div>

                  {/* Need Help Concierge Card (Deep Forest Luxury Theme) */}
                  <div className="bg-gradient-to-br from-[#111A0B] via-[#1A2812] to-[#0D1509] rounded-3xl p-6 text-white shadow-md border border-[#95CF42]/20 font-mograph">
                    <div className="flex items-center gap-2 text-[#95CF42] mb-2">
                      <ShieldCheck className="w-5 h-5 text-[#95CF42]" />
                      <span className="text-xs font-bold tracking-tight font-mograph">
                        {siteConfig.name} Concierge
                      </span>
                    </div>
                    <h4 className="text-base font-bold mb-1 font-mograph tracking-tight">
                      Need help with this shipment?
                    </h4>
                    <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                      Our support team can help you update addresses, coordinate courier delivery, or schedule preferred delivery timings.
                    </p>

                    <div className="space-y-2.5 font-mograph">
                      <a
                        href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
                          `Hi ${siteConfig.name}, I need assistance with my Order ${
                            selectedOrder.shopify_order_id || selectedOrder.id
                          }`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#95CF42] hover:bg-[#85BE33] text-black text-xs font-bold transition-all shadow-xs cursor-pointer font-mograph"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat on WhatsApp</span>
                      </a>
                      <a
                        href={`mailto:${siteConfig.supportEmail}?subject=${encodeURIComponent(`Support Request - Order ${selectedOrder.shopify_order_id || selectedOrder.id}`)}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors border border-white/10 cursor-pointer"
                      >
                        <Mail className="w-4 h-4 text-[#95CF42]" />
                        <span>Email {siteConfig.supportEmail}</span>
                      </a>
                      <a
                        href={`tel:${siteConfig.supportPhone}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors border border-white/10 cursor-pointer"
                      >
                        <Phone className="w-4 h-4 text-[#95CF42]" />
                        <span>Call {siteConfig.supportPhone}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* DEFAULT VIEW WHEN NO ORDER IS SEARCHED YET                      */}
          {/* =============================================================== */}
          {!selectedOrder && !loading && (
            <div className="space-y-12 my-10 font-mograph">
              {/* Section Header */}
              <div className="text-center max-w-xl mx-auto">
                <span className="text-[10px] font-bold bg-[#F4FBE8] text-[#3D6318] px-3.5 py-1.5 rounded-full border border-[#95CF42]/30 font-mograph">
                  How Shipping Works
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 mt-3 tracking-tight font-mograph">
                  Our Express Delivery Process
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  From our fulfillment warehouse right to your door with end-to-end security and freshness protection.
                </p>
              </div>

              {/* 3 Step Process Cards (Redesigned to match Homepage aesthetic) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mograph">
                {/* Step 1 */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-xs hover:shadow-md hover:border-[#95CF42]/50 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold bg-[#F4FBE8] text-[#3D6318] px-2.5 py-1 rounded-full font-mograph">
                        Step 01
                      </span>
                      <span className="text-xs font-bold text-neutral-400">Within 24 Hours</span>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-[#F4FBE8] text-[#3D6318] group-hover:bg-[#95CF42]/20 transition-colors flex items-center justify-center mb-4">
                      <Package className="w-6 h-6 text-[#3D6318]" />
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-neutral-900 mb-2 font-mograph tracking-tight">
                      1. Quality Inspection &amp; Packaging
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                      Every batch undergoes strict purity verification. Products are sealed in airtight, food-safe and UV-protected containers with tamper-evident holograms.
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center gap-1.5 text-[11px] font-bold text-[#3D6318]">
                    <ShieldCheck className="w-4 h-4 text-[#6B9E3A]" />
                    <span>Tamper-Proof Hermetic Seal</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-xs hover:shadow-md hover:border-[#95CF42]/50 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold bg-[#F4FBE8] text-[#3D6318] px-2.5 py-1 rounded-full font-mograph">
                        Step 02
                      </span>
                      <span className="text-xs font-bold text-neutral-400">3-5 Days Priority Air</span>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-[#F4FBE8] text-[#3D6318] group-hover:bg-[#95CF42]/20 transition-colors flex items-center justify-center mb-4">
                      <Truck className="w-6 h-6 text-[#3D6318]" />
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-neutral-900 mb-2 font-mograph tracking-tight">
                      2. Express Air Logistics
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                      Handed over to premier logistics partners (Delhivery, Blue Dart, DTDC) with live milestone barcode scans at regional airport hubs.
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center gap-1.5 text-[11px] font-bold text-[#3D6318]">
                    <Plane className="w-4 h-4 text-[#6B9E3A]" />
                    <span>Real-Time Milestone Radar</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-xs hover:shadow-md hover:border-[#95CF42]/50 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold bg-[#F4FBE8] text-[#3D6318] px-2.5 py-1 rounded-full font-mograph">
                        Step 03
                      </span>
                      <span className="text-xs font-bold text-neutral-400">Verified Handover</span>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-[#F4FBE8] text-[#3D6318] group-hover:bg-[#95CF42]/20 transition-colors flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-6 h-6 text-[#3D6318]" />
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-neutral-900 mb-2 font-mograph tracking-tight">
                      3. OTP Doorstep Delivery
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                      Instant WhatsApp &amp; SMS alerts with delivery associate contact details. Safe contactless handover with OTP confirmation and flexible COD / UPI payment.
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center gap-1.5 text-[11px] font-bold text-[#3D6318]">
                    <Award className="w-4 h-4 text-[#6B9E3A]" />
                    <span>100% Authentic Quality Guarantee</span>
                  </div>
                </div>
              </div>

              {/* Verified Courier Partners Banner */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-xs font-mograph">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 font-mograph tracking-tight">
                      Trusted Express Logistics Partners
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      We partner with India&apos;s leading logistics networks to guarantee timely and insured delivery.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                    {["Delhivery Air", "Blue Dart Express", "DTDC Courier", "Shadowfax", "Xpressbees", "India Post Speed"].map((courier) => (
                      <span
                        key={courier}
                        className="px-3 py-1.5 rounded-xl bg-[#FAFCF6] hover:bg-[#F4FBE8] text-neutral-700 font-bold text-xs border border-neutral-200/80 transition-colors"
                      >
                        {courier}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* FAQs Accordion */}
              <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm p-6 sm:p-10 font-mograph">
                <div className="text-center max-w-xl mx-auto mb-8">
                  <span className="text-[10px] font-bold bg-[#F4FBE8] text-[#3D6318] px-3.5 py-1.5 rounded-full border border-[#95CF42]/30 font-mograph">
                    Got Questions?
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-neutral-950 mt-3 font-mograph tracking-tight">
                    Frequently Asked Questions
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Find quick answers about delivery timelines, order IDs, courier tracking, and authenticity.
                  </p>
                </div>

                <div className="divide-y divide-neutral-100 max-w-3xl mx-auto">
                  {faqs.map((faq, idx) => {
                    const isOpen = faqOpen === idx;
                    return (
                      <div key={idx} className="py-4.5">
                        <button
                          onClick={() => setFaqOpen(isOpen ? null : idx)}
                          className="w-full flex items-center justify-between text-left font-bold text-sm sm:text-base text-neutral-900 hover:text-[#6B9E3A] transition-colors py-1 cursor-pointer"
                        >
                          <span className="pr-4">{faq.q}</span>
                          <div className={`p-1.5 rounded-full transition-colors ${isOpen ? "bg-[#F4FBE8] text-[#3D6318]" : "text-neutral-400"}`}>
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </button>
                        {isOpen && (
                          <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed pl-1 pr-6 animate-fadeIn">
                            {faq.a}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Help & Support Bottom Card (Deep Forest Luxury Theme) */}
              <div className="bg-gradient-to-r from-[#111A0B] via-[#1A2812] to-[#111A0B] rounded-3xl p-6 sm:p-8 text-white text-center shadow-lg border border-[#95CF42]/25 font-mograph">
                <div className="max-w-xl mx-auto">
                  <HelpCircle className="w-8 h-8 text-[#95CF42] mx-auto mb-3" />
                  <h3 className="text-lg sm:text-xl font-bold font-mograph tracking-tight">
                    Need Help With Your Shipment or Delivery Address?
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 mt-1.5 leading-relaxed">
                    Our customer care team is available 24/7 to assist with live tracking, address corrections, or courier coordination.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <a
                      href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
                        `Hi ${siteConfig.name}, I need help tracking my order.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#95CF42] hover:bg-[#85BE33] text-black font-bold text-xs transition-colors shadow-sm cursor-pointer font-mograph"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>WhatsApp Support</span>
                    </a>
                    <a
                      href={`mailto:${siteConfig.supportEmail}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/10 cursor-pointer"
                    >
                      <Mail className="w-4 h-4 text-[#95CF42]" />
                      <span>Email: {siteConfig.supportEmail}</span>
                    </a>
                    <a
                      href={`tel:${siteConfig.supportPhone}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/10 cursor-pointer"
                    >
                      <Phone className="w-4 h-4 text-[#95CF42]" />
                      <span>Call Concierge: {siteConfig.supportPhone}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFCF6] flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-[#6B9E3A] animate-spin" />
        </div>
      }
    >
      <OrderTrackingContent />
    </React.Suspense>
  );
}
