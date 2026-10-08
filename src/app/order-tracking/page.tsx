"use client";

import React, { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
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

function buildTrackingCheckpoints(order: ERPOrder): TrackingCheckpoint[] {
  const dateObj = new Date(order.created_at || Date.now());
  const formatDate = (offsetHours: number) => {
    const d = new Date(dateObj.getTime() + offsetHours * 3600000);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const status = order.delivery_status || "Processing";
  const city = order.shipping_address?.split(",")?.slice(-2)?.[0]?.trim() || "Destination City";
  const courier = order.courier_partner || "Delhivery";

  if (status === "Delivered") {
    return [
      {
        title: "Delivered Successfully",
        location: `${city} Delivery Address`,
        timestamp: formatDate(72),
        completed: true,
        active: true,
        description: "Package was handed over directly to recipient. Thank you for shopping with Zupe Store!",
      },
      {
        title: "Out for Delivery",
        location: `${city} Logistics Hub`,
        timestamp: formatDate(64),
        completed: true,
        description: `Executive out for delivery. OTP verification confirmed.`,
      },
      {
        title: "In Transit - Arrived at Regional Hub",
        location: `${city} Distribution Center`,
        timestamp: formatDate(48),
        completed: true,
        description: `Package arrived at ${city} sorting facility via ${courier}.`,
      },
      {
        title: "Dispatched & Handed to Courier",
        location: "Zupe Fulfillment Center, Gurugram",
        timestamp: formatDate(18),
        completed: true,
        description: `Package handed over to ${courier}. AWB: ${order.shiprocket_awb || "Generated"}.`,
      },
      {
        title: "Order Confirmed & Packed",
        location: "Zupe Warehouse",
        timestamp: formatDate(6),
        completed: true,
        description: "Quality verification completed. Item packed in eco-friendly tamper-proof bag.",
      },
      {
        title: "Order Placed & Payment Verified",
        location: "Online Storefront",
        timestamp: formatDate(0),
        completed: true,
        description: "Order has been received and verified by our system.",
      },
    ];
  }

  if (status === "Out for Delivery") {
    return [
      {
        title: "Out for Delivery",
        location: `${city} Local Hub`,
        timestamp: formatDate(48),
        completed: true,
        active: true,
        description: `Your shipment is out for delivery today via ${courier}. Please keep your phone reachable.`,
      },
      {
        title: "Arrived at Destination Hub",
        location: `${city} Hub`,
        timestamp: formatDate(36),
        completed: true,
        description: `Shipment arrived at destination facility and processed for final route.`,
      },
      {
        title: "In Transit Across States",
        location: "Central Freight Hub",
        timestamp: formatDate(24),
        completed: true,
        description: `Moving between courier terminals via surface express.`,
      },
      {
        title: "Handed over to Courier",
        location: "Gurugram Warehouse",
        timestamp: formatDate(12),
        completed: true,
        description: `Dispatched with ${courier} (AWB: ${order.shiprocket_awb || "Generated"}).`,
      },
      {
        title: "Order Confirmed & Packed",
        location: "Zupe Fulfillment",
        timestamp: formatDate(4),
        completed: true,
        description: "Items picked and packaged securely.",
      },
      {
        title: "Order Placed",
        location: "Online Storefront",
        timestamp: formatDate(0),
        completed: true,
        description: "Order received successfully.",
      },
    ];
  }

  if (status === "In Transit") {
    return [
      {
        title: "In Transit",
        location: "Main Express Corridor",
        timestamp: formatDate(24),
        completed: true,
        active: true,
        description: `Package is on route to ${city} sorting center via ${courier}.`,
      },
      {
        title: "Dispatched by Logistics Hub",
        location: "Zupe Hub, Gurugram",
        timestamp: formatDate(14),
        completed: true,
        description: `Package dispatched with ${courier}. Air/Surface manifest generated.`,
      },
      {
        title: "Packed & Tamper Sealed",
        location: "Zupe Fulfillment Center",
        timestamp: formatDate(5),
        completed: true,
        description: "Package sealed with tamper-evident security tape.",
      },
      {
        title: "Order Confirmed",
        location: "Online Storefront",
        timestamp: formatDate(0),
        completed: true,
        description: "Order placed and acknowledged.",
      },
    ];
  }

  if (status.includes("RTO") || order.status === "Returned") {
    return [
      {
        title: status === "RTO Delivered" ? "Returned to Warehouse" : "Return to Origin Initiated",
        location: "Warehouse Inspection Hub",
        timestamp: formatDate(48),
        completed: true,
        active: true,
        description: `Return reason: ${order.ndr_status || "Customer unreachable after 3 delivery attempts"}.`,
      },
      {
        title: "Delivery Unsuccessful",
        location: `${city} Delivery Center`,
        timestamp: formatDate(36),
        completed: true,
        description: "Courier could not deliver package to recipient address.",
      },
      {
        title: "Dispatched to Destination",
        location: "Origin Transit Hub",
        timestamp: formatDate(18),
        completed: true,
        description: `Shipped via ${courier} under AWB ${order.shiprocket_awb || "N/A"}.`,
      },
      {
        title: "Order Placed",
        location: "Online Storefront",
        timestamp: formatDate(0),
        completed: true,
        description: "Initial order placement.",
      },
    ];
  }

  // Default: Processing
  return [
    {
      title: "Processing & Quality Check",
      location: "Zupe Central Warehouse",
      timestamp: formatDate(4),
      completed: true,
      active: true,
      description: "Our fulfillment specialists are carefully assembling and inspecting your items.",
    },
    {
      title: "Order Placed & Verified",
      location: "Online Storefront",
      timestamp: formatDate(0),
      completed: true,
      description: "Order successfully confirmed. Warehouse notification dispatched.",
    },
  ];
}

function OrderTrackingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams?.get("query") || searchParams?.get("id") || searchParams?.get("awb") || "";

  const [inputTerm, setInputTerm] = useState(urlQuery);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [matchedOrders, setMatchedOrders] = useState<ERPOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ERPOrder | null>(null);
  const [copiedAWB, setCopiedAWB] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const fetchTracking = async (termToSearch: string) => {
    const trimmed = termToSearch.trim();
    if (!trimmed) {
      setErrorMessage("Please enter an Order ID, AWB number, or Phone/Email");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setMatchedOrders([]);
    setSelectedOrder(null);

    try {
      const res = await fetch(`/api/orders/track?query=${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
        setMatchedOrders(data.orders);
        setSelectedOrder(data.orders[0]);
      } else {
        setErrorMessage(
          data.error || `No order found matching "${trimmed}". Please double check your order details.`
        );
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
      fetchTracking(urlQuery);
    }
  }, [urlQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputTerm.trim()) {
      router.push(`/order-tracking?query=${encodeURIComponent(inputTerm.trim())}`);
      fetchTracking(inputTerm.trim());
    }
  };

  const handleSelectSample = (sampleId: string) => {
    setInputTerm(sampleId);
    router.push(`/order-tracking?query=${encodeURIComponent(sampleId)}`);
    fetchTracking(sampleId);
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
          bg: "bg-orange-50 text-[#FA521C] border-orange-200",
          dot: "bg-[#FA521C] animate-pulse",
          icon: Clock,
          label: "Processing at Warehouse",
        };
    }
  };

  const sampleTags = [
    { label: "#1054", note: "Out for Delivery", id: "1054" },
    { label: "#1055", note: "In Transit", id: "1055" },
    { label: "#1057", note: "Delivered", id: "1057" },
    { label: "#1058", note: "RTO Return", id: "1058" },
  ];

  const faqs = [
    {
      q: "Where can I find my Order ID or AWB Tracking Number?",
      a: "Your Order ID (e.g., #1054) was sent in the confirmation SMS and email right after your purchase. Your courier AWB tracking number (e.g., SR-AWB-9871105) is sent via WhatsApp and SMS once the package is dispatched.",
    },
    {
      q: "How long does standard delivery take?",
      a: "Orders are dispatched within 24 business hours. Metro cities typically receive deliveries within 2-3 business days, while other regional locations take 3-5 business days.",
    },
    {
      q: "Can I track my order if I paid via Cash on Delivery (COD)?",
      a: "Yes! All prepaid and COD orders are assigned full real-time tracking numbers with live SMS and WhatsApp status updates.",
    },
    {
      q: "What should I do if my delivery executive hasn't arrived?",
      a: "On the day of delivery, you will receive the delivery driver's contact details via SMS. If you miss the attempt, the courier will re-attempt delivery on the next working day automatically.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-[#111111] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-[#FFF5F1] via-[#FFF9F6] to-[#FBFBFC] pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-orange-100/50">
          <div className="max-w-4xl mx-auto text-center">
            {/* Live Tracking Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-sm border border-orange-200/60 mb-5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FA521C] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FA521C]"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FA521C]">
                Live Shipment Tracking
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-gray-900 tracking-tight leading-tight">
              Track Your <span className="text-[#FA521C]">Order</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
              Enter your Order Number, Shiprocket AWB, or registered Mobile Number to see instant, live courier updates.
            </p>

            {/* Tracking Search Input Card */}
            <div className="mt-8 max-w-2xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-orange-950/5 border border-gray-100 p-2 sm:p-2.5">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 flex items-center">
                  <div className="absolute left-4 text-gray-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={inputTerm}
                    onChange={(e) => setInputTerm(e.target.value)}
                    placeholder="Enter Order ID (#1054), AWB, or Phone..."
                    className="w-full pl-12 pr-10 py-3.5 sm:py-4 text-sm sm:text-base bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  />
                  {inputTerm && (
                    <button
                      type="button"
                      onClick={() => setInputTerm("")}
                      className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-[#FA521C] hover:bg-[#E04515] active:scale-[0.98] text-white font-bold text-sm sm:text-base transition-all shadow-md shadow-[#FA521C]/25 disabled:opacity-70 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Tracking...</span>
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

            {/* Quick Demo Suggestions */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500">
              <span className="font-medium text-gray-400">Quick Test:</span>
              {sampleTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleSelectSample(tag.id)}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-orange-50 border border-gray-200 hover:border-[#FA521C]/40 text-gray-700 hover:text-[#FA521C] transition-all cursor-pointer font-medium"
                >
                  {tag.label} <span className="text-[10px] text-gray-400">({tag.note})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results / Error Area */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 mt-8">
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-8 p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
              <div className="text-sm">
                <p className="font-bold">{errorMessage}</p>
                <p className="text-xs text-rose-600 mt-1">
                  Tip: Please check your SMS/WhatsApp confirmation or try searching with your 10-digit registered mobile number.
                </p>
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
                      onClick={() => setSelectedOrder(ord)}
                      className={`text-left p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? "bg-orange-50/70 border-[#FA521C] ring-2 ring-[#FA521C]/20 shadow-sm"
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
                        {ord.items?.[0]?.product_name || "Zupe Store Item"}
                      </p>
                      <p className="text-xs font-semibold text-[#FA521C] mt-2">
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
                const checkpoints = buildTrackingCheckpoints(selectedOrder);

                return (
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Header Strip */}
                    <div className="p-6 sm:p-8 bg-gradient-to-r from-gray-50 via-white to-orange-50/30 border-b border-gray-100">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-gray-900 tracking-tight">
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

                        {/* Status Badge */}
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold border ${badge.bg}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                            <BadgeIcon className="w-4 h-4" />
                            <span>{badge.label}</span>
                          </span>
                        </div>
                      </div>

                      {/* Courier & AWB Details Bar */}
                      <div className="mt-6 pt-6 border-t border-gray-200/60 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">
                            Courier Partner
                          </span>
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-[#FA521C]" />
                            <span className="text-sm font-bold text-gray-900">
                              {selectedOrder.courier_partner || "Delhivery Logistics"}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">
                            AWB / Waybill Number
                          </span>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-mono font-bold text-gray-900">
                              {selectedOrder.shiprocket_awb || "SR-AWB-PENDING"}
                            </span>
                            {selectedOrder.shiprocket_awb && (
                              <button
                                onClick={() =>
                                  copyToClipboard(selectedOrder.shiprocket_awb!, "awb")
                                }
                                className="p-1 text-gray-400 hover:text-gray-700"
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
                          <a
                            href={
                              selectedOrder.courier_partner?.toLowerCase().includes("bluedart")
                                ? `https://www.bluedart.com/tracking`
                                : `https://www.delhivery.com/track/package/${selectedOrder.shiprocket_awb || ""}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FA521C] hover:underline"
                          >
                            <span>Open Courier Portal</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Step Visual Progress Bar */}
                    <div className="p-6 sm:p-8">
                      <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-[#FA521C]" />
                        <span>Live Shipment Journey</span>
                      </h3>

                      {/* Stepper Timeline */}
                      <div className="relative pl-6 sm:pl-8 border-l-2 border-orange-200/70 space-y-8 my-4 ml-3">
                        {checkpoints.map((cp, idx) => (
                          <div key={idx} className="relative">
                            {/* Dot / Icon indicator */}
                            <div
                              className={`absolute -left-[31px] sm:-left-[39px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                                cp.active
                                  ? "bg-[#FA521C] border-white ring-4 ring-orange-200 text-white"
                                  : cp.completed
                                  ? "bg-emerald-500 border-white text-white"
                                  : "bg-gray-200 border-white text-gray-400"
                              }`}
                            >
                              {cp.active ? (
                                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                              ) : cp.completed ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="bg-gray-50/60 rounded-2xl p-4 border border-gray-100">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                <h4
                                  className={`text-sm font-bold ${
                                    cp.active ? "text-[#FA521C]" : "text-gray-900"
                                  }`}
                                >
                                  {cp.title}
                                </h4>
                                <span className="text-[11px] font-medium text-gray-400">
                                  {cp.timestamp}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                {cp.location}
                              </p>
                              {cp.description && (
                                <p className="text-xs text-gray-500 leading-relaxed mt-1">
                                  {cp.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Card 2: Items & Delivery Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Items in this Shipment */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#FA521C]" />
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
                        <div className="relative w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-[#FA521C]">
                          <Package className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Curated Zupe Order</p>
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
                      <span className="text-[#FA521C]">
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
                      <MapPin className="w-4 h-4 text-[#FA521C]" />
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
                    <div className="flex items-center gap-2 text-[#FA521C] mb-2">
                      <ShieldCheck className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Zupe Care Guarantee
                      </span>
                    </div>
                    <h4 className="text-base font-bold mb-1">Need help with this shipment?</h4>
                    <p className="text-xs text-gray-300 leading-relaxed mb-4">
                      Our concierge team is available 24/7 to resolve address issues or expedite courier deliveries.
                    </p>

                    <div className="space-y-2">
                      <a
                        href={`https://wa.me/919876543210?text=${encodeURIComponent(
                          `Hi Zupe Store, I need updates on my Order ${
                            selectedOrder.shopify_order_id || selectedOrder.id
                          }`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat on WhatsApp</span>
                      </a>
                      <a
                        href="tel:+919876543210"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Call +91 98765 43210</span>
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
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FA521C] flex items-center justify-center mx-auto mb-4">
                    <Package className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-gray-900 mb-1.5">1. Order Dispatched</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Orders are packaged within 24 hours in tamper-proof bubble parcels with strict quality control.
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FA521C] flex items-center justify-center mx-auto mb-4">
                    <Truck className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-gray-900 mb-1.5">2. Express Logistics</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Shipped through premier partners (Delhivery, Bluedart, Shadowfax) with live milestone scans.
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FA521C] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-gray-900 mb-1.5">3. Doorstep Delivery</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Real-time SMS & WhatsApp alerts with OTP verification ensure your item reaches you safely.
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
                          className="w-full flex items-center justify-between text-left font-bold text-sm text-gray-900 hover:text-[#FA521C] transition-colors py-1"
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
          <RefreshCw className="w-6 h-6 text-[#FA521C] animate-spin" />
        </div>
      }
    >
      <OrderTrackingContent />
    </React.Suspense>
  );
}
