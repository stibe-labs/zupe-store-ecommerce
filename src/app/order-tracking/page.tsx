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
  if (!productName) return "/vittal/wireless-earbuds.png";
  const norm = productName.toLowerCase();
  const match = DEFAULT_PRODUCTS.find((p) =>
    p.name.toLowerCase().includes(norm) || norm.includes(p.name.toLowerCase())
  );
  if (match) {
    return match.poster_image || match.images[0] || "/vittal/wireless-earbuds.png";
  }
  return "/vittal/wireless-earbuds.png";
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

  // Status: Processing / Newly Placed
  if (status === "Processing" || status.toLowerCase() === "pending" || !status) {
    return [
      {
        title: "Order Confirmed & Verified",
        location: siteConfig.fulfillmentCenter,
        timestamp: formatPlacedTime,
        completed: true,
        active: false,
        description: "Order verified with serial registration and confirmed for fulfillment queue.",
      },
      {
        title: "Quality Check & Shockproof Packaging",
        location: siteConfig.fulfillmentCenter,
        timestamp: "In Progress",
        completed: false,
        active: true,
        description: "Device undergoing multi-point inspection and packed in tamper-proof electronics foam.",
      },
      {
        title: "Courier Handover & AWB Activation",
        location: siteConfig.dispatchBay,
        timestamp: "Expected within 24 business hours",
        completed: false,
        active: false,
        description: "Express air cargo partner assigned and real-time tracking activated upon pickup.",
      },
      {
        title: "Out for Delivery & OTP Verification",
        location: `${city} Delivery Address`,
        timestamp: "Estimated 5-7 business days",
        completed: false,
        active: false,
        description: "Secure contactless handover. Cash on Delivery (COD) or UPI payable directly to courier.",
      },
    ];
  }

  if (status === "In Transit") {
    return [
      {
        title: "Order Confirmed & Verified",
        location: siteConfig.fulfillmentCenter,
        timestamp: formatPlacedTime,
        completed: true,
        active: false,
        description: "Order confirmed and verified.",
      },
      {
        title: "Dispatched from Fulfillment Hub",
        location: siteConfig.fulfillmentCenter,
        timestamp: "Dispatched",
        completed: true,
        active: false,
        description: `Handed over to ${courier}. ${hasAwb ? `AWB: ${order.shiprocket_awb}` : ""}`,
      },
      {
        title: "In Transit via Air Cargo Corridor",
        location: `En Route to ${city}`,
        timestamp: "In Transit",
        completed: true,
        active: true,
        description: `Shipment is moving via express transit lines to the ${city} destination airport hub.`,
      },
      {
        title: "Out for Delivery & Doorstep Handover",
        location: `${city} Delivery Address`,
        timestamp: "Upcoming",
        completed: false,
        active: false,
        description: "Payable via Cash on Delivery or UPI upon doorstep handover.",
      },
    ];
  }

  if (status === "Out for Delivery") {
    return [
      {
        title: "Order Confirmed & Dispatched",
        location: siteConfig.fulfillmentCenter,
        timestamp: formatPlacedTime,
        completed: true,
        active: false,
        description: `Dispatched via ${courier}.`,
      },
      {
        title: "Arrived at Destination Facility",
        location: `${city} Hub`,
        timestamp: "Arrived",
        completed: true,
        active: false,
        description: `Package processed at ${city} courier hub for final-mile route.`,
      },
      {
        title: "Out for Delivery Today",
        location: `${city} Local Route`,
        timestamp: "Today",
        completed: true,
        active: true,
        description: "Delivery executive is on the way. Please keep your phone reachable for OTP.",
      },
      {
        title: "Doorstep Handover & Inspection",
        location: `${city} Delivery Address`,
        timestamp: "Expected Today",
        completed: false,
        active: false,
        description: "Verify seal upon delivery. Cash or UPI accepted.",
      },
    ];
  }

  if (status === "Delivered") {
    return [
      {
        title: "Order Placed & Dispatched",
        location: siteConfig.fulfillmentCenter,
        timestamp: formatPlacedTime,
        completed: true,
        active: false,
        description: "Order processed and dispatched.",
      },
      {
        title: "In Transit & Out for Delivery",
        location: `${city} Hub`,
        timestamp: "Completed",
        completed: true,
        active: false,
        description: `Handled via ${courier}.`,
      },
      {
        title: "Delivered Successfully",
        location: `${city} Delivery Address`,
        timestamp: "Delivered",
        completed: true,
        active: true,
        description: `Package handed over safely. 1-Year ${siteConfig.name} brand warranty is now active!`,
      },
    ];
  }

  // RTO / Return
  return [
    {
      title: "Order Placed & Dispatched",
      location: siteConfig.fulfillmentCenter,
      timestamp: formatPlacedTime,
      completed: true,
      active: false,
      description: "Order processed and dispatched.",
    },
    {
      title: "Delivery Unsuccessful",
      location: `${city} Hub`,
      timestamp: "Unsuccessful",
      completed: true,
      active: false,
      description: order.ndr_status || "Customer unreachable after multiple delivery attempts.",
    },
    {
      title: "Return to Origin (RTO)",
      location: siteConfig.fulfillmentCenter,
      timestamp: "In Progress",
      completed: true,
      active: true,
      description: "Shipment returning to fulfillment warehouse.",
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
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
          icon: CheckCircle2,
          label: "Delivered",
        };
      case "Out for Delivery":
        return {
          bg: "bg-purple-50 text-purple-700 border-purple-200",
          dot: "bg-purple-500 animate-pulse",
          icon: Truck,
          label: "Out for Delivery Today",
        };
      case "In Transit":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
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
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          dot: "bg-amber-500 animate-pulse",
          icon: Clock,
          label: "Processing & Quality Inspection",
        };
    }
  };

  const faqs = [
    {
      q: "Where can I find my Order ID or AWB Tracking Number?",
      a: `Your Order ID (e.g. #${siteConfig.orderPrefix}-1001) is displayed immediately upon placing your order and sent to your WhatsApp and Email. Once your electronics parcel is dispatched from our hub, your courier AWB tracking number (Delhivery, Blue Dart, DTDC) is sent directly via WhatsApp with real-time tracking links.`,
    },
    {
      q: "How fast is express delivery across India?",
      a: "Orders are verified and packaged within 24 business hours. Express air logistics delivery typically takes 5 to 7 business days across metro, tier-1, and regional destinations in India.",
    },
    {
      q: "How are fragile electronics protected during shipping?",
      a: "Every unit is enclosed in custom anti-static bubble sleeves, reinforced corner cushions, and heavy-duty tamper-proof outer boxes with factory serial verification to ensure it reaches you in pristine condition.",
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
      q: "How do I claim the 1-year warranty on my electronics?",
      a: `Every device purchased from ${siteConfig.name} includes a comprehensive 1-year warranty card with GST invoice. In case of any technical queries or support, simply email us at ${siteConfig.supportEmail} or connect with our dedicated concierge via WhatsApp at +91 73567 65036.`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col justify-between selection:bg-[#002D62] selection:text-white font-sans">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* ================================================================= */}
        {/* HERO SECTION: DEEP NAVY GRADIENT MATCHING HOMEPAGE DESIGN        */}
        {/* ================================================================= */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#001D40] via-[#002855] to-[#001D40] text-white pt-10 sm:pt-14 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-500/10 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-10 right-10 w-[300px] h-[200px] bg-[#FFBE00]/10 blur-[80px] pointer-events-none" />

          <div className="relative max-w-4xl mx-auto text-center">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-blue-200/70 mb-4">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-blue-300/40" />
              <span className="text-[#FFBE00] font-semibold">Track Order</span>
            </div>

            {/* Live Tracking Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[#FFBE00] border border-[#FFBE00]/30 shadow-xs mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider">
                Live Shipment Radar & Tracking
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Track Your <span className="text-[#FFBE00]">Order</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Enter your Order ID, courier AWB tracking number, or 10-digit mobile number for real-time delivery milestone updates.
            </p>

            {/* Tracking Search Input Card (Clean, modern rounded card) */}
            <div className="mt-8 max-w-2xl mx-auto bg-white rounded-2xl sm:rounded-full shadow-2xl p-2 sm:p-2.5 border border-white/20">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 flex items-center">
                  <div className="absolute left-4 sm:left-5 text-slate-400">
                    <Search className="w-5 h-5 text-[#002D62]" />
                  </div>
                  <input
                    type="text"
                    value={inputTerm}
                    onChange={(e) => setInputTerm(e.target.value)}
                    placeholder="Enter Order ID (e.g. #VD-1001), AWB, or Phone..."
                    className="w-full pl-12 sm:pl-13 pr-10 py-3.5 sm:py-4 text-sm sm:text-base bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                  />
                  {inputTerm && (
                    <button
                      type="button"
                      onClick={() => setInputTerm("")}
                      className="absolute right-3 p-1.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer transition-colors"
                      title="Clear"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 sm:py-4 rounded-xl sm:rounded-full bg-[#FFBE00] hover:bg-[#E5AA00] active:scale-95 text-slate-950 font-black text-sm sm:text-base transition-all shadow-md hover:shadow-lg disabled:opacity-70 cursor-pointer shrink-0"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
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
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-blue-200/80 font-medium">
              <span className="text-slate-400">Accepted formats:</span>
              <button
                type="button"
                onClick={() => setInputTerm("#VD-")}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white font-mono text-[11px] transition-colors cursor-pointer"
              >
                #VD-1001
              </button>
              <button
                type="button"
                onClick={() => setInputTerm("SR-AWB-")}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white font-mono text-[11px] transition-colors cursor-pointer"
              >
                Courier AWB
              </button>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-white font-mono text-[11px]">
                10-Digit Mobile
              </span>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* TRUST BADGES STRIP: SLIM WHITE CURVED CARD (HOMEPAGE MATCH)      */}
        {/* ================================================================= */}
        <div className="max-w-5xl mx-auto px-4 -mt-6 sm:-mt-8 relative z-10">
          <div className="bg-white text-slate-900 rounded-xl sm:rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-md py-3 px-2 sm:py-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 items-center text-center">
              {[
                {
                  icon: BadgeCheck,
                  label: "100% Authentic",
                  desc: "Brand New & Sealed",
                },
                {
                  icon: ShieldCheck,
                  label: "1-Year Warranty",
                  desc: "All-India Comprehensive",
                },
                {
                  icon: Truck,
                  label: "Express Air Cargo",
                  desc: "5-7 Days Priority Transit",
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
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shadow-2xs mb-1.5 shrink-0">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#002D62]" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                      {item.label}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
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
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          {/* Success Banner if redirected from 1-Click Fastrr Checkout */}
          {orderStatus === "SUCCESS" && (
            <div className="mb-8 p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-950 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-lg sm:text-xl font-black text-emerald-950">
                  🎉 Order Placed Successfully!
                </h2>
                <p className="text-xs sm:text-sm text-emerald-800 mt-1 leading-relaxed">
                  Thank you! Your order has been placed. Your devices are undergoing serial verification and being secured in multi-layer shockproof electronics packaging.
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-200/80 text-emerald-900 font-bold text-xs">
                    1-Year Warranty Activated
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-200/80 text-emerald-900 font-bold text-xs">
                    Priority Air Dispatch
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-200/80 text-emerald-900 font-bold text-xs">
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
                <p className="font-bold">{errorMessage}</p>
                <p className="text-xs text-rose-600 mt-1 leading-relaxed">
                  Tip: Please check your Email/WhatsApp confirmation or try searching with your 10-digit registered mobile number.
                </p>
                {errorSupport && (
                  <div className="mt-3">
                    <a
                      href={errorSupport}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs"
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
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
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
                          ? "bg-blue-50/90 border-[#002D62] ring-2 ring-[#002D62]/20 shadow-sm"
                          : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-900">
                          {ord.shopify_order_id || ord.id}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {ord.delivery_status || ord.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {ord.items?.[0]?.product_name || `${siteConfig.name} Electronics`}
                      </p>
                      <p className="text-xs font-bold text-[#002D62] mt-2">
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
                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden">
                    {/* Header Strip */}
                    <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 border-b border-slate-100">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                              Order {selectedOrder.shopify_order_id || selectedOrder.id}
                            </h2>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  selectedOrder.shopify_order_id || selectedOrder.id,
                                  "id"
                                )
                              }
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Copy Order ID"
                            >
                              {copiedOrderId ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
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
                        <div className="flex flex-wrap items-center gap-2.5">
                          {liveTracking &&
                            !liveTracking.isSimulated &&
                            !liveTracking.isPending &&
                            Array.isArray(liveTracking.activities) &&
                            liveTracking.activities.length > 0 && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Live Carrier Scan
                              </span>
                            )}

                          {liveTracking?.edd && !liveTracking.isPending && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
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
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200/80 cursor-pointer"
                          >
                            <RefreshCw
                              className={`w-4 h-4 ${
                                loading ? "animate-spin text-[#002D62]" : ""
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
                      className="p-6 sm:p-8 border-t border-slate-100 scroll-mt-24"
                    >
                      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <Truck className="w-5 h-5 text-[#002D62]" />
                          <span>Live Shipment Journey</span>
                        </h3>
                        {lastUpdated && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
                                        : "bg-slate-200"
                                    }`}
                                  />
                                )}

                                <div
                                  className={`relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-transform ${
                                    cp.active
                                      ? "bg-[#002D62] border-white ring-4 ring-blue-100 text-white shadow-sm"
                                      : cp.completed
                                      ? "bg-emerald-500 border-white text-white shadow-xs"
                                      : "bg-slate-100 border-slate-300 text-slate-400"
                                  }`}
                                >
                                  {cp.active ? (
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFBE00] animate-ping" />
                                  ) : cp.completed ? (
                                    <Check className="w-4 h-4 text-white stroke-[2.5]" />
                                  ) : (
                                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                                  )}
                                </div>
                              </div>

                              {/* Content Card */}
                              <div className="flex-1 bg-slate-50/70 hover:bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                  <h4
                                    className={`text-sm sm:text-base font-bold ${
                                      cp.active ? "text-[#002D62]" : "text-slate-900"
                                    }`}
                                  >
                                    {cp.title}
                                  </h4>
                                  <span className="text-[11px] sm:text-xs font-semibold text-slate-400">
                                    {cp.timestamp}
                                  </span>
                                </div>
                                <p className="text-xs sm:text-sm font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>{cp.location}</span>
                                </p>
                                {cp.description && (
                                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-1">
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
                          <div className="mt-8 pt-6 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                                Courier Partner
                              </span>
                              <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4 text-[#002D62]" />
                                <span className="text-sm font-bold text-slate-900">
                                  {courierName}
                                </span>
                              </div>
                            </div>

                            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                                AWB / Waybill Number
                              </span>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-mono font-bold text-slate-900">
                                  {hasRealAwb ? rawAwb : "Generating upon courier pickup"}
                                </span>
                                {hasRealAwb && (
                                  <button
                                    onClick={() => copyToClipboard(rawAwb, "awb")}
                                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
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

                            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
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
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#002D62] hover:underline cursor-pointer"
                                >
                                  <span>Open {courierName} Portal</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              ) : (
                                <span className="text-xs text-slate-500 font-medium">
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Items in this Shipment */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
                  <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#002D62]" />
                    <span>Items in this Shipment</span>
                  </h3>

                  <div className="divide-y divide-slate-100">
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
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100">
                              <Image
                                src={img}
                                alt={productName}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-slate-900 truncate">
                                {productName}
                              </h4>
                              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                Qty: {quantity} × ₹{unitPrice.toLocaleString("en-IN")}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#002D62] bg-blue-50 px-2 py-0.5 rounded">
                                  <ShieldCheck className="w-3 h-3" />
                                  1-Yr Warranty
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-extrabold text-slate-900">
                                ₹{totalPrice.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-4 flex items-center gap-4">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100">
                          <Image
                            src="/vittal/wireless-earbuds.png"
                            alt={siteConfig.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {siteConfig.name} Premium Electronics
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 font-medium">
                            Qty: 1 × ₹
                            {(selectedOrder.total_amount || 2999).toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-slate-900">
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
                      <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Payment Method</span>
                          <span className="font-semibold text-slate-900">
                            {isCod
                              ? "Cash on Delivery (COD)"
                              : selectedOrder.payment_method || "Prepaid Online"}
                          </span>
                        </div>
                        {isCod && !isPaid ? (
                          <>
                            <div className="flex justify-between text-xs text-slate-500">
                              <span>Payment Status</span>
                              <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                                Payable on Delivery
                              </span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                              <span>Payable at Doorstep</span>
                              <span className="text-[#002D62]">
                                ₹{selectedOrder.total_amount?.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between text-xs text-slate-500">
                              <span>Payment Status</span>
                              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                Paid Online (Verified)
                              </span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                              <span>Total Paid</span>
                              <span className="text-emerald-600">
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
                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#002D62]" />
                      <span>Shipping Destination</span>
                    </h3>
                    <p className="text-sm font-bold text-slate-900">
                      {selectedOrder.customer_name}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {selectedOrder.shipping_address}
                    </p>
                    {selectedOrder.customer_phone && (
                      <p className="text-xs text-slate-500 mt-2 font-mono">
                        Phone: {selectedOrder.customer_phone}
                      </p>
                    )}
                  </div>

                  {/* Need Help Concierge Card (Deep Navy Theme) */}
                  <div className="bg-gradient-to-br from-[#001D40] via-[#002654] to-[#001833] rounded-3xl p-6 text-white shadow-md border border-blue-900/40">
                    <div className="flex items-center gap-2 text-[#FFBE00] mb-2">
                      <ShieldCheck className="w-5 h-5" />
                      <span className="text-xs font-black uppercase tracking-wider">
                        {siteConfig.name} Concierge
                      </span>
                    </div>
                    <h4 className="text-base font-bold mb-1">
                      Need help with this shipment?
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      Our support team can help you update addresses, coordinate courier delivery, or schedule preferred delivery timings.
                    </p>

                    <div className="space-y-2.5">
                      <a
                        href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
                          `Hi ${siteConfig.name}, I need assistance with my Order ${
                            selectedOrder.shopify_order_id || selectedOrder.id
                          }`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat on WhatsApp</span>
                      </a>
                      <a
                        href={`mailto:${siteConfig.supportEmail}?subject=${encodeURIComponent(`Support Request - Order ${selectedOrder.shopify_order_id || selectedOrder.id}`)}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors border border-white/10 cursor-pointer"
                      >
                        <Mail className="w-4 h-4 text-[#FFBE00]" />
                        <span>Email {siteConfig.supportEmail}</span>
                      </a>
                      <a
                        href={`tel:${siteConfig.supportPhone}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors border border-white/10 cursor-pointer"
                      >
                        <Phone className="w-4 h-4 text-[#FFBE00]" />
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
            <div className="space-y-12 my-10">
              {/* Section Header */}
              <div className="text-center max-w-xl mx-auto">
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-[#002D62] px-3 py-1 rounded-full border border-blue-100">
                  How Shipping Works
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2.5 tracking-tight">
                  Our Express Delivery Process
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  From our fulfillment warehouse right to your door with end-to-end security.
                </p>
              </div>

              {/* 3 Step Process Cards (Redesigned to match Homepage aesthetic) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Step 1 */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-200 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-[#002D62] px-2.5 py-1 rounded-full">
                        Step 01
                      </span>
                      <span className="text-xs font-bold text-slate-400">Within 24 Hours</span>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#002D62] group-hover:bg-[#FFBE00]/20 transition-colors flex items-center justify-center mb-4">
                      <Package className="w-6 h-6 text-[#002D62]" />
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-2">
                      1. Quality Inspection & Packaging
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Every electronic unit undergoes multi-point serial check and is packaged in certified anti-static, shockproof cushions with tamper-evident seals.
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-blue-900">
                    <ShieldCheck className="w-4 h-4 text-[#002D62]" />
                    <span>Tamper-Proof Factory Seal</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-200 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">
                        Step 02
                      </span>
                      <span className="text-xs font-bold text-slate-400">5-7 Days Air Cargo</span>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-[#FFBE00]/20 transition-colors flex items-center justify-center mb-4">
                      <Truck className="w-6 h-6 text-amber-600" />
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-2">
                      2. Express Air Logistics
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Handed over to premier logistics partners (Delhivery, Blue Dart, DTDC, Shadowfax) with live milestone barcode scans at every regional airport hub.
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-amber-700">
                    <Plane className="w-4 h-4 text-amber-600" />
                    <span>Real-Time Milestone Radar</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                        Step 03
                      </span>
                      <span className="text-xs font-bold text-slate-400">Verified Handover</span>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-2">
                      3. OTP Doorstep Delivery
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Instant WhatsApp & SMS alerts with delivery partner contact details. Safe contactless handover with OTP confirmation and flexible COD/UPI payment.
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>1-Year Active Brand Warranty</span>
                  </div>
                </div>
              </div>

              {/* Verified Courier Partners Banner */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Trusted Express Logistics Partners
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      We partner with India&apos;s leading logistics networks to guarantee timely and insured delivery.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                    {["Delhivery Air", "Blue Dart Express", "DTDC Courier", "Shadowfax", "Xpressbees", "India Post Speed"].map((courier) => (
                      <span
                        key={courier}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200/80 transition-colors"
                      >
                        {courier}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* FAQs Accordion (Matching Homepage FAQs Style) */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10">
                <div className="text-center max-w-xl mx-auto mb-8">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-[#002D62] px-3 py-1 rounded-full border border-blue-100">
                    Got Questions?
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                    Frequently Asked Questions
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Find quick answers about delivery timelines, order IDs, courier tracking, and warranty support.
                  </p>
                </div>

                <div className="divide-y divide-slate-100 max-w-3xl mx-auto">
                  {faqs.map((faq, idx) => {
                    const isOpen = faqOpen === idx;
                    return (
                      <div key={idx} className="py-4.5">
                        <button
                          onClick={() => setFaqOpen(isOpen ? null : idx)}
                          className="w-full flex items-center justify-between text-left font-bold text-sm sm:text-base text-slate-900 hover:text-[#002D62] transition-colors py-1 cursor-pointer"
                        >
                          <span className="pr-4">{faq.q}</span>
                          <div className={`p-1 rounded-full transition-colors ${isOpen ? "bg-blue-50 text-[#002D62]" : "text-slate-400"}`}>
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </button>
                        {isOpen && (
                          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-1 pr-6 animate-fadeIn">
                            {faq.a}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Help & Support Bottom Card */}
              <div className="bg-gradient-to-r from-[#001D40] via-[#002B5E] to-[#001D40] rounded-3xl p-6 sm:p-8 text-white text-center shadow-lg border border-blue-900/50">
                <div className="max-w-xl mx-auto">
                  <HelpCircle className="w-8 h-8 text-[#FFBE00] mx-auto mb-3" />
                  <h3 className="text-lg sm:text-xl font-black">
                    Need Help With Your Shipment or Delivery Address?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                    Our customer care team is available 24/7 to assist with live tracking, address corrections, or courier coordination.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <a
                      href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
                        `Hi ${siteConfig.name}, I need help tracking my order.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>WhatsApp Support</span>
                    </a>
                    <a
                      href={`mailto:${siteConfig.supportEmail}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/10 cursor-pointer"
                    >
                      <Mail className="w-4 h-4 text-[#FFBE00]" />
                      <span>Email: {siteConfig.supportEmail}</span>
                    </a>
                    <a
                      href={`tel:${siteConfig.supportPhone}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/10 cursor-pointer"
                    >
                      <Phone className="w-4 h-4 text-[#FFBE00]" />
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
        <div className="min-h-screen bg-[#FAFBFD] flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-[#002D62] animate-spin" />
        </div>
      }
    >
      <OrderTrackingContent />
    </React.Suspense>
  );
}
