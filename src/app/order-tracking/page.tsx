"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
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
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  X,
  RotateCcw,
  Sparkles,
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

function getProductImageFallback(productName: string): string {
  const norm = productName.toLowerCase();
  const match = DEFAULT_PRODUCTS.find((p) =>
    p.name.toLowerCase().includes(norm) || norm.includes(p.name.toLowerCase())
  );
  if (match) {
    return match.poster_image || match.images[0] || "/products/ripple/ripple-amber.jpg";
  }
  return "/products/ripple/ripple-amber.jpg";
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
  const courier = order.courier_partner || "Express Logistics";
  const hasAwb = Boolean(
    order.shiprocket_awb &&
      !order.shiprocket_awb.startsWith("SR-AWB-") &&
      !order.shiprocket_awb.startsWith("SR-") &&
      !order.shiprocket_awb.toUpperCase().includes("PENDING")
  );

  // Status: Processing / Newly Placed (Package is currently being prepared and not yet dispatched)
  if (status === "Processing" || status.toLowerCase() === "pending" || !status) {
    return [
      {
        title: "Order Confirmed & Placed",
        location: "Turkiye Jam Store",
        timestamp: formatPlacedTime,
        completed: true,
        active: false,
        description: "Order verified and confirmed via WhatsApp. Received at fulfillment queue.",
      },
      {
        title: "Packaging & Quality Inspection",
        location: siteConfig.fulfillmentCenter,
        timestamp: "In Progress",
        completed: false,
        active: true,
        description: "Items are being picked and packed in tamper-proof discreet plain box.",
      },
      {
        title: "Courier Handover & AWB Assignment",
        location: siteConfig.dispatchBay,
        timestamp: "Expected within 24 business hours",
        completed: false,
        active: false,
        description: "Express courier partner will be assigned and tracking activated upon warehouse pickup.",
      },
      {
        title: "Out for Delivery & Doorstep Handover",
        location: `${city} Delivery Address`,
        timestamp: "Estimated 3-5 business days",
        completed: false,
        active: false,
        description: "Payable via Cash on Delivery (COD) or UPI directly to delivery executive.",
      },
    ];
  }

  if (status === "In Transit") {
    return [
      {
        title: "Order Confirmed & Placed",
        location: "Turkiye Jam Store",
        timestamp: formatPlacedTime,
        completed: true,
        active: false,
        description: "Order received and verified.",
      },
      {
        title: "Dispatched from Fulfillment Center",
        location: siteConfig.fulfillmentCenter,
        timestamp: "Dispatched",
        completed: true,
        active: false,
        description: `Package handed over to ${courier}. ${hasAwb ? `AWB: ${order.shiprocket_awb}` : ""}`,
      },
      {
        title: "In Transit to Destination Hub",
        location: `En Route to ${city}`,
        timestamp: "In Transit",
        completed: true,
        active: true,
        description: `Shipment is moving through the express logistics corridor to ${city}.`,
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
        description: `Shipped via ${courier}.`,
      },
      {
        title: "Arrived at Local Destination Facility",
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
        description: `Delivery executive is on route. Please keep your phone reachable.`,
      },
      {
        title: "Doorstep Handover",
        location: `${city} Delivery Address`,
        timestamp: "Expected Today",
        completed: false,
        active: false,
        description: "Cash on delivery payable to delivery partner.",
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
        description: "Package was handed over directly to recipient. Thank you for shopping with Turkiye Jam!",
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
      description: "Shipment returning to sender warehouse.",
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
      const el = document.getElementById("live-shipment-journey") || journeySectionRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = rect.top + scrollTop - 85;
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
      setErrorMessage("Please enter an Order ID, AWB number, or Phone/Email");
      setErrorSupport(null);
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setErrorSupport(null);

    try {
      const res = await fetch(`/api/orders/track?query=${encodeURIComponent(trimmed)}&t=${Date.now()}`);
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
          data.error || `No order found matching "${trimmed}". Please double check your order details.`
        );
        if (data.support_whatsapp) {
          setErrorSupport(data.support_whatsapp);
        }
      }
    } catch (err: any) {
      setErrorMessage("Unable to fetch order status at this moment. Please try again.");
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
          icon: Truck,
          label: "In Transit",
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
          bg: "bg-orange-50 text-[#FF7A00] border-orange-200",
          dot: "bg-[#FF7A00] animate-pulse",
          icon: Clock,
          label: "Processing at Warehouse",
        };
    }
  };

  const faqs = [
    {
      q: "Where can I find my Order ID or AWB Tracking Number?",
      a: "Your Order ID (e.g., #TJ-1001) was sent in the confirmation email and WhatsApp message right after your purchase. Your courier AWB tracking number (e.g., SR-AWB-9871105) is sent via WhatsApp and Email once the package is dispatched.",
    },
    {
      q: "How long does standard delivery take?",
      a: "Orders are dispatched within 24 business hours. Estimated delivery is 5-7 business days across India.",
    },
    {
      q: "Can I track my order if I paid via Cash on Delivery (COD)?",
      a: "Yes! All orders are assigned full real-time tracking numbers with live WhatsApp and SMS status updates.",
    },
    {
      q: "What should I do if my delivery executive hasn't arrived?",
      a: "On the day of delivery, you will receive the delivery driver's contact details via WhatsApp or notification. If you miss the attempt, the courier will re-attempt delivery on the next working day automatically.",
    },
  ];

  return (
    <div className="min-h-screen tj-diamonds-cream text-stone-900 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Hero Section */}
        <div className="relative pt-28 sm:pt-32 pb-14 px-4 sm:px-6 lg:px-8 border-b border-stone-300">
          <div className="max-w-4xl mx-auto text-center">
            {/* Live Tracking Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fed000] text-stone-900 shadow-[0_2px_0_0_#2b2b2b] border-2 border-stone-800 mb-5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-stone-900">
                Live Shipment Tracking
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-tj-serif text-stone-900 tracking-tight leading-tight">
              Track Your <span className="text-[#5b1420]">Order</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-stone-600 max-w-xl mx-auto">
              Enter your Order Number, Shiprocket AWB, or registered Mobile Number to see instant, live courier updates.
            </p>

            {/* Tracking Search Input Card */}
            <div className="mt-8 max-w-2xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-[0_8px_0_0_#2b2b2b] border-2 border-stone-800 p-2 sm:p-2.5">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 flex items-center">
                  <div className="absolute left-4 text-stone-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={inputTerm}
                    onChange={(e) => setInputTerm(e.target.value)}
                    placeholder="Enter Order ID (e.g. #TJ-1001), AWB, or Phone..."
                    className="w-full pl-12 pr-10 py-3.5 sm:py-4 text-sm sm:text-base bg-transparent text-stone-900 placeholder:text-stone-400 focus:outline-none font-medium"
                  />
                  {inputTerm && (
                    <button
                      type="button"
                      onClick={() => setInputTerm("")}
                      className="absolute right-3 p-1 text-stone-400 hover:text-stone-600 rounded-full cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl btn-shimmer bg-[#fed000] hover:bg-[#fab005] active:translate-y-0.5 active:shadow-none text-stone-900 font-black text-sm sm:text-base transition-all border-2 border-stone-800 shadow-[0_4px_0_0_#2b2b2b] disabled:opacity-70 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-stone-900" />
                      <span>Checking Status...</span>
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
          </div>
        </div>

        {/* Results / Error Area */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 mt-8">
          {/* Success Banner if redirected from 1-Click Checkout */}
          {orderStatus === "SUCCESS" && (
            <div className="mb-8 p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-600/30 text-emerald-950 shadow-[0_4px_0_0_#059669] flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-lg sm:text-xl font-black font-tj-serif text-emerald-950">
                  🎉 Order Placed Successfully!
                </h2>
                <p className="text-xs sm:text-sm text-emerald-800 mt-1">
                  Thank you! Your order has been placed via Shiprocket Fastrr. Your items are being carefully packed in discreet plain-box packaging.
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-200/80 text-emerald-900 font-bold text-xs">
                    Discreet Plain Box Packaging
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-200/80 text-emerald-900 font-bold text-xs">
                    Cash on Delivery
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-8 p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
              <div className="text-sm flex-1">
                <p className="font-bold">{errorMessage}</p>
                <p className="text-xs text-rose-600 mt-1">
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
                      <span>Chat with Turkiye Jam Support on WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* If Multiple Orders Match (e.g. searched by phone/email) */}
          {matchedOrders.length > 1 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
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
                      className={`text-left p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? "bg-orange-50/70 border-[#FF7A00] ring-2 ring-[#FF7A00]/20 shadow-sm"
                          : "bg-white border-gray-200 hover:border-gray-300 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-gray-900">
                          {ord.shopify_order_id || ord.id}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {ord.delivery_status || ord.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {ord.items?.[0]?.product_name || "Turkiye Jam Item"}
                      </p>
                      <p className="text-xs font-semibold text-[#FF7A00] mt-2">
                        ₹{ord.total_amount?.toLocaleString()}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Order Tracking Display */}
          {selectedOrder && (
            <div className="space-y-6">
              {/* Card 1: Top Summary Card */}
              {(() => {
                const badge = getStatusBadge(selectedOrder.delivery_status || selectedOrder.status);
                const BadgeIcon = badge.icon;
                const checkpoints = buildTrackingCheckpoints(selectedOrder, liveTracking);

                return (
                  <div className="bg-white rounded-3xl border-2 border-stone-800 shadow-[0_8px_0_0_#2b2b2b] overflow-hidden">
                    {/* Header Strip */}
                    <div className="p-6 sm:p-8 bg-gradient-to-r from-stone-50 via-white to-amber-50/20 border-b border-stone-200">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <h2 className="text-2xl sm:text-3xl font-black font-tj-serif text-stone-900 tracking-tight">
                              Order {selectedOrder.shopify_order_id || selectedOrder.id}
                            </h2>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  selectedOrder.shopify_order_id || selectedOrder.id,
                                  "id"
                                )
                              }
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                              title="Copy Order ID"
                            >
                              {copiedOrderId ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
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
                          {liveTracking && !liveTracking.isSimulated && !liveTracking.isPending && Array.isArray(liveTracking.activities) && liveTracking.activities.length > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Live Courier Scan
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
                                selectedOrder.shopify_order_id || selectedOrder.id || inputTerm,
                                true
                              )
                            }
                            disabled={loading}
                            title="Refresh live status from Shiprocket"
                            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200/80 cursor-pointer"
                          >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#FF7A00]" : ""}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Step Visual Progress Bar */}
                    <div
                      id="live-shipment-journey"
                      ref={journeySectionRef}
                      className="p-6 sm:p-8 border-t border-gray-100 scroll-mt-24"
                    >
                      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                          <Truck className="w-5 h-5 text-[#FF7A00]" />
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
                              {/* Left Column: Perfectly Centered Indicator & Connecting Line */}
                              <div className="relative flex flex-col items-center shrink-0 w-8 self-stretch">
                                {/* Connecting line to NEXT checkpoint */}
                                {!isLast && (
                                  <div
                                    className={`absolute top-4 -bottom-6 w-0.5 left-1/2 -translate-x-1/2 ${
                                      cp.completed && (checkpoints[idx + 1]?.completed || checkpoints[idx + 1]?.active)
                                        ? "bg-emerald-400"
                                        : "bg-orange-200/80"
                                    }`}
                                  />
                                )}

                                {/* Dot / Icon indicator */}
                                <div
                                  className={`relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-transform ${
                                    cp.active
                                      ? "bg-[#FF7A00] border-white ring-4 ring-orange-200 text-white shadow-sm"
                                      : cp.completed
                                      ? "bg-emerald-500 border-white text-white shadow-xs"
                                      : "bg-stone-100 border-stone-300 text-stone-400"
                                  }`}
                                >
                                  {cp.active ? (
                                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                                  ) : cp.completed ? (
                                    <Check className="w-4 h-4 text-white stroke-[2.5]" />
                                  ) : (
                                    <span className="w-2 h-2 rounded-full bg-stone-400" />
                                  )}
                                </div>
                              </div>

                              {/* Content Card */}
                              <div className="flex-1 bg-stone-50/70 hover:bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200/80 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                  <h4
                                    className={`text-sm sm:text-base font-bold ${
                                      cp.active ? "text-[#FF7A00]" : "text-stone-900"
                                    }`}
                                  >
                                    {cp.title}
                                  </h4>
                                  <span className="text-[11px] sm:text-xs font-semibold text-stone-400">
                                    {cp.timestamp}
                                  </span>
                                </div>
                                <p className="text-xs sm:text-sm font-semibold text-stone-600 mb-1 flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                  <span>{cp.location}</span>
                                </p>
                                {cp.description && (
                                  <p className="text-xs sm:text-sm text-stone-500 leading-relaxed mt-1">
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
                        const isProcessing = (selectedOrder.delivery_status || selectedOrder.status || "Processing").toLowerCase() === "processing";
                        const rawAwb = selectedOrder.shiprocket_awb || (selectedOrder as any).tracking_number || "";
                        const hasRealAwb = Boolean(
                          rawAwb &&
                          !rawAwb.startsWith("SR-AWB-") &&
                          !rawAwb.startsWith("SR-") &&
                          !rawAwb.toUpperCase().includes("PENDING")
                        );
                        const courierName = !isProcessing && selectedOrder.courier_partner && !selectedOrder.courier_partner.toLowerCase().includes("pending")
                          ? selectedOrder.courier_partner
                          : "Express Logistics (Assigned at Dispatch)";

                        return (
                          <div className="mt-8 pt-6 border-t border-gray-200/60 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">
                                Courier Partner
                              </span>
                              <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4 text-[#FF7A00]" />
                                <span className="text-sm font-bold text-gray-900">
                                  {courierName}
                                </span>
                              </div>
                            </div>

                            <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">
                                AWB / Waybill Number
                              </span>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-mono font-bold text-gray-900">
                                  {hasRealAwb ? rawAwb : "Generating upon courier pickup"}
                                </span>
                                {hasRealAwb && (
                                  <button
                                    onClick={() => copyToClipboard(rawAwb, "awb")}
                                    className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
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

                            <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">
                                External Tracking
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
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF7A00] hover:underline cursor-pointer"
                                >
                                  <span>Open {courierName} Portal</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              ) : (
                                <span className="text-xs text-stone-500 font-medium">
                                  Active once dispatched with courier
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
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#FF7A00]" />
                    <span>Items in this Package</span>
                  </h3>

                  <div className="divide-y divide-gray-100">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((it, idx) => {
                        const img =
                          (it as any).image || getProductImageFallback(it.product_name);
                        return (
                          <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                              <Image
                                src={img}
                                alt={it.product_name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-gray-900 truncate">
                                {it.product_name}
                              </h4>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Qty: {it.quantity} × ₹{it.unit_price?.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-extrabold text-gray-900">
                                ₹{(it.unit_price * it.quantity).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-4 flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-[#FF7A00]">
                          <Package className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Curated Turkiye Jam Order</p>
                          <p className="text-xs text-gray-500">1 Package</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pricing Summary */}
                  <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Payment Method</span>
                      <span className="font-semibold text-gray-900">
                        {selectedOrder.payment_method} ({selectedOrder.payment_status})
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                      <span>Total Paid</span>
                      <span className="text-[#FF7A00]">
                        ₹{selectedOrder.total_amount?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address & Customer Support */}
                <div className="space-y-6">
                  {/* Delivery Address */}
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#FF7A00]" />
                      <span>Shipping Destination</span>
                    </h3>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedOrder.customer_name}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {selectedOrder.shipping_address}
                    </p>
                    {selectedOrder.customer_phone && (
                      <p className="text-xs text-gray-500 mt-2 font-mono">
                        Phone: {selectedOrder.customer_phone}
                      </p>
                    )}
                  </div>

                  {/* Need Help Card */}
                  <div className="bg-gradient-to-br from-[#111111] to-[#1F2937] rounded-3xl p-6 text-white shadow-md">
                    <div className="flex items-center gap-2 text-[#FF7A00] mb-2">
                      <ShieldCheck className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Turkiye Jam Care Guarantee
                      </span>
                    </div>
                    <h4 className="text-base font-bold mb-1">Need help with this shipment?</h4>
                    <p className="text-xs text-gray-300 leading-relaxed mb-4">
                      Our concierge team is available 24/7 to resolve address issues or expedite courier deliveries.
                    </p>

                    <div className="space-y-2">
                      <a
                        href={`https://wa.me/916238165935?text=${encodeURIComponent(
                          `Hi Turkiye Jam, I need updates on my Order ${
                            selectedOrder.shopify_order_id || selectedOrder.id
                          }`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat on WhatsApp</span>
                      </a>
                      <a
                        href="tel:+916238165935"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Call +91 62381 65935</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* When no order is looked up yet (Default Guide View) */}
          {!selectedOrder && !loading && (
            <div className="space-y-12 my-8">
              {/* 3 Step Process */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF7A00] flex items-center justify-center mx-auto mb-4">
                    <Package className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-gray-900 mb-1.5">1. Order Dispatched</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Orders are packaged within 24 hours in tamper-proof bubble parcels with strict quality control.
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF7A00] flex items-center justify-center mx-auto mb-4">
                    <Truck className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-gray-900 mb-1.5">2. Express Logistics</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Shipped through premier partners (Delhivery, Bluedart, Shadowfax) with live milestone scans.
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF7A00] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-gray-900 mb-1.5">3. Doorstep Delivery</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Real-time WhatsApp & Email alerts with OTP verification ensure your item reaches you safely.
                  </p>
                </div>
              </div>

              {/* FAQs Accordion */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10">
                <div className="text-center max-w-xl mx-auto mb-8">
                  <h3 className="text-xl sm:text-2xl font-display font-extrabold text-gray-900">
                    Frequently Asked Questions
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Have questions about your delivery or tracking? Find quick answers below.
                  </p>
                </div>

                <div className="divide-y divide-gray-100 max-w-3xl mx-auto">
                  {faqs.map((faq, idx) => {
                    const isOpen = faqOpen === idx;
                    return (
                      <div key={idx} className="py-4">
                        <button
                          onClick={() => setFaqOpen(isOpen ? null : idx)}
                          className="w-full flex items-center justify-between text-left font-bold text-sm text-gray-900 hover:text-[#FF7A00] transition-colors py-1"
                        >
                          <span>{faq.q}</span>
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        {isOpen && (
                          <p className="mt-2 text-xs text-gray-600 leading-relaxed pl-1 pr-6 animate-fadeIn">
                            {faq.a}
                          </p>
                        )}
                      </div>
                    );
                  })}
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
        <div className="min-h-screen bg-[#FBFBFC] flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-[#FF7A00] animate-spin" />
        </div>
      }
    >
      <OrderTrackingContent />
    </React.Suspense>
  );
}
