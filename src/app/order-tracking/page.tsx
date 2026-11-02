"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Package,
  PackageCheck,
  Truck,
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  MapPin,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  X,
  CreditCard,
  User,
  Home,
  Shield,
  ShieldCheck,
  Zap,
  Headphones,
  RotateCcw,
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

type TrackingTab = "order" | "awb" | "phone";

function BarcodeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 5v14" />
      <path d="M6 5v14" />
      <path d="M8 5v14" />
      <path d="M12 5v14" />
      <path d="M15 5v14" />
      <path d="M17 5v14" />
      <path d="M21 5v14" />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function DeliveryBoxIllustration({ className = "w-20 h-20 sm:w-24 sm:h-24" }: { className?: string }) {
  return (
    <div className={`relative flex-shrink-0 flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 90" className="w-full h-full drop-shadow-sm" fill="none">
        <ellipse cx="50" cy="78" rx="34" ry="7" fill="#FED7AA" opacity="0.6" />
        {/* Top Face */}
        <path d="M50 16 L84 32 L50 48 L16 32 Z" fill="#FDBA74" />
        <path d="M50 16 L65 23 L50 30 L35 23 Z" fill="#FB923C" opacity="0.4" />
        {/* Left Face */}
        <path d="M16 32 L50 48 L50 74 L16 58 Z" fill="#EA580C" />
        {/* Right Face */}
        <path d="M50 48 L84 32 L84 58 L50 74 Z" fill="#C2410C" />
        {/* Tape Strips */}
        <path d="M44 19 L56 25 L56 48 L44 42 Z" fill="#FED7AA" opacity="0.8" />
        <path d="M44 42 L56 48 L56 74 L44 68 Z" fill="#FDBA74" opacity="0.9" />
        {/* Zupe Logo Emblem */}
        <g transform="translate(24, 44)">
          <rect x="0" y="0" width="16" height="15" rx="3" fill="#0F172A" opacity="0.9" />
          <path d="M4 11 L12 11 M4 11 L10 5 L5 5" stroke="#FF7A00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {/* Sparkle Rays */}
        <path d="M84 18 L88 13 M90 20 L95 20 M87 25 L92 28" stroke="#FF7A00" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function DeliveryTruckIllustration({ className = "w-20 h-16 sm:w-24 sm:h-20" }: { className?: string }) {
  return (
    <div className={`relative flex-shrink-0 flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 120 80" className="w-full h-full drop-shadow-sm" fill="none">
        <ellipse cx="60" cy="70" rx="46" ry="5" fill="#FED7AA" opacity="0.6" />
        {/* Motion lines */}
        <path d="M4 30 L16 30" stroke="#FF7A00" strokeWidth="2" strokeLinecap="round" />
        <path d="M1 38 L14 38" stroke="#FF7A00" strokeWidth="2" strokeLinecap="round" />
        <path d="M6 46 L18 46" stroke="#FF7A00" strokeWidth="2" strokeLinecap="round" />
        {/* Cargo Body */}
        <rect x="18" y="16" width="56" height="42" rx="5" fill="#FF7A00" />
        {/* Truck Cabin */}
        <path d="M74 28 L90 28 C94 28 97 31 99 35 L104 45 C105 47 106 50 106 53 L106 58 L74 58 Z" fill="#F1F5F9" />
        {/* Window */}
        <path d="M78 32 L88 32 C91 32 93 34 94 37 L97 44 L78 44 Z" fill="#38BDF8" opacity="0.85" />
        {/* Headlight & Bumper */}
        <rect x="104" y="47" width="2.5" height="4" rx="1" fill="#FBBF24" />
        <rect x="103" y="53" width="5" height="4" rx="1" fill="#94A3B8" />
        {/* Zupe Logo on Truck Cargo */}
        <g transform="translate(36, 24)">
          <rect x="0" y="0" width="20" height="18" rx="4" fill="white" opacity="0.25" />
          <path d="M5 13 L15 13 M5 13 L13 5 L6 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <text x="46" y="50" fill="white" fontSize="6.5" fontWeight="bold" textAnchor="middle" letterSpacing="0.4">
          ZUPE STORE
        </text>
        {/* Rear Wheel */}
        <circle cx="36" cy="60" r="9" fill="#0F172A" />
        <circle cx="36" cy="60" r="4.5" fill="#94A3B8" />
        <circle cx="36" cy="60" r="1.5" fill="white" />
        {/* Front Wheel */}
        <circle cx="92" cy="60" r="9" fill="#0F172A" />
        <circle cx="92" cy="60" r="4.5" fill="#94A3B8" />
        <circle cx="92" cy="60" r="1.5" fill="white" />
      </svg>
    </div>
  );
}

function DoorstepDeliveryIllustration({ className = "w-18 h-16 sm:w-22 sm:h-20" }: { className?: string }) {
  return (
    <div className={`relative flex-shrink-0 flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 110 90" className="w-full h-full drop-shadow-sm" fill="none">
        <ellipse cx="55" cy="82" rx="42" ry="6" fill="#FED7AA" opacity="0.6" />
        {/* Door Frame & Door */}
        <rect x="36" y="8" width="42" height="72" rx="3" fill="#D97706" opacity="0.8" />
        <rect x="40" y="12" width="34" height="68" fill="#B45309" />
        {/* Panels */}
        <rect x="44" y="17" width="12" height="24" rx="2" fill="#92400E" />
        <rect x="58" y="17" width="12" height="24" rx="2" fill="#92400E" />
        <rect x="44" y="46" width="12" height="28" rx="2" fill="#92400E" />
        <rect x="58" y="46" width="12" height="28" rx="2" fill="#92400E" />
        <circle cx="68" cy="45" r="2.2" fill="#FDE68A" />
        {/* Potted Plant */}
        <path d="M22 66 L30 66 L28 78 L24 78 Z" fill="#EA580C" />
        <circle cx="26" cy="61" r="5" fill="#10B981" />
        <circle cx="23" cy="57" r="4" fill="#34D399" />
        {/* Parcel on Doorstep */}
        <rect x="43" y="54" width="28" height="24" rx="3" fill="#F59E0B" />
        <rect x="52" y="54" width="9" height="24" fill="#FCD34D" opacity="0.8" />
        <path d="M50 68 L56 68 M50 68 L55 62 L51 62" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        {/* Green Checkmark Circle Badge */}
        <circle cx="78" cy="34" r="9" fill="#10B981" />
        <circle cx="78" cy="34" r="7.5" fill="#10B981" stroke="white" strokeWidth="1.5" />
        <path d="M75 34 L77.5 36.5 L81.5 31.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
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

function getCourierTrackingUrl(courier?: string, awb?: string): string {
  if (!awb || awb.startsWith("SR-AWB-")) return "#";
  const c = (courier || "").toLowerCase();
  if (c.includes("dtdc")) {
    return `https://www.dtdc.in/`;
  }
  if (c.includes("blue")) {
    return `https://www.bluedart.com/tracking`;
  }
  if (c.includes("delhivery")) {
    return `https://www.delhivery.com/track/package/${encodeURIComponent(awb)}`;
  }
  if (c.includes("xpress")) {
    return `https://www.xpressbees.com/shipment/tracking?awb=${encodeURIComponent(awb)}`;
  }
  if (c.includes("shadow")) {
    return `https://tracker.shadowfax.in/#/track?awb=${encodeURIComponent(awb)}`;
  }
  return `https://shiprocket.co/tracking/${encodeURIComponent(awb)}`;
}

function getMilestoneStep(status?: string): number {
  const norm = (status || "").toLowerCase();
  if (norm.includes("deliver") && !norm.includes("rto")) {
    return 4;
  }
  if (norm.includes("out for delivery")) {
    return 3;
  }
  if (
    norm.includes("transit") ||
    norm.includes("shipped") ||
    norm.includes("dispatched") ||
    norm.includes("pickup") ||
    norm.includes("ndr") ||
    norm.includes("rto") ||
    norm.includes("return")
  ) {
    return 2;
  }
  return 1;
}

function buildTrackingCheckpoints(order: ERPOrder, liveTracking?: any): TrackingCheckpoint[] {
  // 1. If live carrier scan activities returned from Shiprocket API, render real-time events
  if (
    liveTracking?.activities &&
    Array.isArray(liveTracking.activities) &&
    liveTracking.activities.length > 0 &&
    !liveTracking.isSimulated
  ) {
    return liveTracking.activities.map((act: any, idx: number) => ({
      title: act.activity || act.status || "Package Scanned",
      location: act.location || "Logistics Hub",
      timestamp: act.date || "",
      completed: true,
      active: idx === 0,
      description: `Carrier update from ${
        order.courier_partner || liveTracking.courier_name || "Courier Partner"
      }: ${act.activity || act.status}.`,
    }));
  }

  // 2. Truthful lifecycle checkpoints anchored strictly to order.created_at
  const dateObj = new Date(order.created_at || Date.now());
  const formatPlacedDate = dateObj.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const city = order.shipping_address?.split(",")?.slice(-2)?.[0]?.trim() || "Destination City";
  const hasAwb = Boolean(order.shiprocket_awb && !order.shiprocket_awb.startsWith("SR-AWB-"));
  const courier = order.courier_partner || (hasAwb ? "Courier Partner" : "");
  const status = (order.delivery_status || "Processing").toLowerCase();

  // If RTO / Return
  if (status.includes("rto") || status.includes("return")) {
    return [
      {
        title: status.includes("delivered") ? "Returned to Origin Warehouse" : "RTO Return in Transit",
        location: "Zupe Fulfillment Center",
        timestamp: formatPlacedDate,
        completed: true,
        active: true,
        description: `Package returned to fulfillment center. Reason: ${order.ndr_status || "Customer unreachable / returned"}.`,
      },
      {
        title: "Return Delivery Initiated",
        location: `${city} Logistics Hub`,
        timestamp: formatPlacedDate,
        completed: true,
        active: false,
        description: `Shipment returned from destination facility via ${courier || "courier partner"}.`,
      },
      {
        title: "Dispatched from Warehouse",
        location: "Zupe Fulfillment Warehouse",
        timestamp: formatPlacedDate,
        completed: true,
        active: false,
        description: `Handed over to ${courier || "courier partner"}. AWB: ${
          order.shiprocket_awb || "Dispatched"
        }.`,
      },
      {
        title: "Order Placed & Verified",
        location: "Online Storefront",
        timestamp: formatPlacedDate,
        completed: true,
        active: false,
        description: "Order placed and acknowledged.",
      },
    ];
  }

  // If order is Delivered
  if (status.includes("deliver")) {
    return [
      {
        title: "Delivered Successfully",
        location: `${city} Delivery Address`,
        timestamp: "Delivered",
        completed: true,
        active: true,
        description: "Package was handed over directly to recipient. Thank you for shopping with Zupe Store!",
      },
      {
        title: "Out for Delivery",
        location: `${city} Logistics Hub`,
        timestamp: "Destination Route",
        completed: true,
        description: `Shipment departed destination facility via ${courier || "courier delivery partner"}.`,
      },
      {
        title: "In Transit Across Hubs",
        location: "Central Freight Network",
        timestamp: "Surface Express",
        completed: true,
        description: `Package processed through transit facilities to ${city}.`,
      },
      {
        title: "Dispatched from Warehouse",
        location: "Zupe Fulfillment Warehouse",
        timestamp: formatPlacedDate,
        completed: true,
        description: `Handed over to ${courier || "courier partner"}. AWB: ${
          order.shiprocket_awb || "Dispatched"
        }.`,
      },
      {
        title: "Order Placed & Verified",
        location: "Online Storefront",
        timestamp: formatPlacedDate,
        completed: true,
        description: "Order placed and acknowledged.",
      },
    ];
  }

  // If Out for Delivery
  if (status.includes("out for delivery")) {
    return [
      {
        title: "Out for Delivery",
        location: `${city} Local Delivery Hub`,
        timestamp: "Today",
        completed: true,
        active: true,
        description: `Your shipment is out for delivery today via ${
          courier || "courier partner"
        }. Please keep your phone reachable.`,
      },
      {
        title: "Arrived at Destination Hub",
        location: `${city} Distribution Center`,
        timestamp: "In Transit",
        completed: true,
        description: `Shipment arrived at destination facility and assigned to local delivery courier.`,
      },
      {
        title: "Handed over to Courier",
        location: "Zupe Fulfillment Warehouse",
        timestamp: formatPlacedDate,
        completed: true,
        description: `Dispatched with ${courier || "assigned courier"} (AWB: ${
          order.shiprocket_awb || "Active"
        }).`,
      },
      {
        title: "Order Placed & Verified",
        location: "Online Storefront",
        timestamp: formatPlacedDate,
        completed: true,
        description: "Order placed and confirmed.",
      },
    ];
  }

  // If In Transit or NDR / Pickup
  if (status.includes("transit") || status.includes("shipped") || status.includes("ndr") || status.includes("pickup")) {
    return [
      {
        title: "Pickup Requested",
        location: `${order.courier_partner || "Courier"} Hub`,
        timestamp: formatPlacedDate,
        completed: true,
        active: true,
        description: `Carrier update from ${order.courier_partner || "Courier"}: Pickup Requested.`,
      },
      {
        title: "Pickup Awaited",
        location: "Zupe Fulfillment Center",
        timestamp: formatPlacedDate,
        completed: true,
        active: false,
        description: `Carrier update from ${order.courier_partner || "Courier"}: Pickup Awaited.`,
      },
      {
        title: "Order Verified & Packed",
        location: "Fulfillment Center",
        timestamp: formatPlacedDate,
        completed: true,
        active: false,
        description: "Package sealed in tamper-evident packaging and prepared for dispatch.",
      },
    ];
  }

  // If AWB has been assigned, but awaiting courier pickup scan
  if (hasAwb) {
    return [
      {
        title: "AWB Assigned & Ready for Courier Pickup",
        location: "Zupe Fulfillment Center",
        timestamp: "Preparing Handover",
        completed: true,
        active: true,
        description: `Courier partner ${courier} assigned with AWB: ${order.shiprocket_awb}. Waiting for carrier pickup scan.`,
      },
      {
        title: "Packed & Tamper Sealed",
        location: "Zupe Warehouse",
        timestamp: formatPlacedDate,
        completed: true,
        description: "Package sealed and shipping label affixed.",
      },
      {
        title: "Order Placed & Verified",
        location: "Online Storefront",
        timestamp: formatPlacedDate,
        completed: true,
        description: "Order placed and confirmed successfully.",
      },
    ];
  }

  // Default: Warehouse Fulfillment
  return [
    {
      title: "Warehouse Fulfillment & Packaging",
      location: "Zupe Fulfillment Warehouse",
      timestamp: "In Progress",
      completed: true,
      active: true,
      description: "Our warehouse team is picking, inspecting, and packing your items for courier handover.",
    },
    {
      title: "Order Placed & Verified",
      location: "Online Storefront",
      timestamp: formatPlacedDate,
      completed: true,
      active: false,
      description: `Order placed and payment verified on ${formatPlacedDate}.`,
    },
  ];
}

function getStatusTitle(status?: string, liveCurrentStatus?: string): string {
  const norm = (status || "").toLowerCase();
  const liveNorm = (liveCurrentStatus || "").toLowerCase();

  if (norm.includes("deliver") && !norm.includes("rto")) {
    return "Delivered Successfully";
  }
  if (norm.includes("out for delivery")) {
    return "Out for Delivery Today";
  }
  if (liveNorm.includes("pickup") || norm.includes("pickup") || norm.includes("ndr")) {
    return "Pickup Scheduled with Courier";
  }
  if (norm.includes("transit") || norm.includes("shipped")) {
    return "In Transit";
  }
  if (norm.includes("rto delivered")) {
    return "RTO Returned to Origin";
  }
  if (norm.includes("rto") || norm.includes("return")) {
    return "RTO Return Initiated";
  }
  return "Processing at Warehouse";
}

function OrderTrackingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams?.get("query") || searchParams?.get("id") || searchParams?.get("awb") || "";

  const [activeTab, setActiveTab] = useState<TrackingTab>("order");
  const [inputTerm, setInputTerm] = useState(urlQuery);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorSupport, setErrorSupport] = useState<string | null>(null);
  const [matchedOrders, setMatchedOrders] = useState<ERPOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ERPOrder | null>(null);
  const [liveTracking, setLiveTracking] = useState<any>(null);
  const [copiedAWB, setCopiedAWB] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0); // First item open by default
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
      setErrorMessage("Please enter an Order ID, AWB number, or Mobile Number");
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
      fetchTracking(urlQuery, false);
    }
  }, [urlQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputTerm.trim()) {
      router.push(`/order-tracking?query=${encodeURIComponent(inputTerm.trim())}`);
      fetchTracking(inputTerm.trim(), true);
    }
  };

  const handleSelectSample = (sampleId: string) => {
    setInputTerm(sampleId);
    setActiveTab("order");
    router.push(`/order-tracking?query=${encodeURIComponent(sampleId)}`);
    fetchTracking(sampleId, true);
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

  const sampleTags = [
    { label: "#1054", note: "Out for Delivery", id: "1054" },
    { label: "#1055", note: "In Transit", id: "1055" },
    { label: "#1057", note: "Delivered", id: "1057" },
    { label: "#1058", note: "RTO Return", id: "1058" },
  ];

  const faqs = [
    {
      q: "Where can I find my Order ID or AWB Tracking Number?",
      a: "Find your Order ID in your order confirmation message or account. Your AWB / tracking number is available once the parcel is handed to the courier.",
      icon: Package,
    },
    {
      q: "How long does standard delivery take?",
      a: "Orders are dispatched within 24 business hours. Typical delivery takes 3 to 5 business days across India.",
      icon: Truck,
    },
    {
      q: "Can I track my order if I paid via Cash on Delivery (COD)?",
      a: "Yes! All prepaid and COD orders have full live tracking with SMS and WhatsApp milestone notifications.",
      icon: PackageCheck,
    },
    {
      q: "What should I do if my delivery executive hasn't arrived?",
      a: "You'll receive delivery executive updates on the morning of delivery. If an attempt is missed, our courier partner will automatically re-attempt on the following business day.",
      icon: Headphones,
    },
  ];

  const orderItems = React.useMemo(() => {
    if (!selectedOrder) return [];
    if (Array.isArray(selectedOrder.items)) return selectedOrder.items;
    if (typeof selectedOrder.items === "string") {
      try {
        return JSON.parse(selectedOrder.items);
      } catch {
        return [];
      }
    }
    return [];
  }, [selectedOrder]);

  const isCod = React.useMemo(() => {
    if (!selectedOrder) return false;
    const pm = (selectedOrder.payment_method || "").toLowerCase();
    return pm.includes("cash on delivery") || pm === "cod";
  }, [selectedOrder]);

  const hasAwb = Boolean(
    selectedOrder?.shiprocket_awb && selectedOrder.shiprocket_awb.trim() !== ""
  );
  const hasRealAwb = Boolean(
    hasAwb && !selectedOrder?.shiprocket_awb?.startsWith("SR-AWB-")
  );

  const cleanOrderId = (selectedOrder?.shopify_order_id || selectedOrder?.id || "").replace(/^#*/, "");

  const milestoneStep = getMilestoneStep(selectedOrder?.delivery_status || selectedOrder?.status);

  const steps = [
    { label: "Ordered", icon: Package },
    { label: "Shipped", icon: Truck },
    { label: "Out for Delivery", icon: MapPin },
    { label: "Delivered", icon: Package },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-[#111111] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Hero & Search Header */}
        <div className="pt-8 pb-4 px-4 sm:px-6">
          <div className="max-w-xl md:max-w-2xl mx-auto text-center">
            {/* Live Order Tracking Capsule Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 mb-3 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7A00] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF7A00]"></span>
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FF7A00]">
                ((•)) LIVE ORDER TRACKING
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-gray-900 tracking-tight leading-tight">
              Track Your <span className="text-[#FF7A00]">Order</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              Stay updated on your order journey. Enter your order details below to check your latest delivery status.
            </p>

            {/* Search Box Card with 3 Tabs */}
            <div className="mt-6 bg-white rounded-3xl shadow-sm border border-gray-100 p-3.5 sm:p-5 text-left">
              {/* 3 Tabs */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("order")}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "order"
                      ? "bg-orange-50/90 border border-[#FF7A00] text-[#FF7A00] shadow-2xs"
                      : "bg-[#F9FAFB] border border-gray-100 text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Package className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Order ID</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("awb")}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "awb"
                      ? "bg-orange-50/90 border border-[#FF7A00] text-[#FF7A00] shadow-2xs"
                      : "bg-[#F9FAFB] border border-gray-100 text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Truck className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">AWB / Tracking ID</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("phone")}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "phone"
                      ? "bg-orange-50/90 border border-[#FF7A00] text-[#FF7A00] shadow-2xs"
                      : "bg-[#F9FAFB] border border-gray-100 text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Mobile Number</span>
                </button>
              </div>

              {/* Search Input Form */}
              <form onSubmit={handleSearchSubmit} className="space-y-3">
                <div className="relative flex items-center bg-[#F9FAFB] rounded-2xl border border-gray-200/90 px-3.5 py-3 focus-within:border-[#FF7A00] focus-within:bg-white transition-all">
                  <div className="text-gray-500 mr-2.5 flex-shrink-0">
                    {activeTab === "order" && <Package className="w-4 h-4" />}
                    {activeTab === "awb" && <Truck className="w-4 h-4" />}
                    {activeTab === "phone" && <Phone className="w-4 h-4" />}
                  </div>
                  <input
                    type="text"
                    value={inputTerm}
                    onChange={(e) => setInputTerm(e.target.value)}
                    placeholder={
                      activeTab === "order"
                        ? "Order ID (e.g. ZPS12345 or #1055)"
                        : activeTab === "awb"
                        ? "AWB / Tracking Number (e.g. 7D141219305)"
                        : "10-digit Mobile Number (e.g. 9876543210)"
                    }
                    className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none font-medium"
                  />
                  {inputTerm && (
                    <button
                      type="button"
                      onClick={() => setInputTerm("")}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-full flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#FF5500] hover:from-[#E66E00] hover:to-[#E04B00] active:scale-[0.99] text-white font-extrabold text-sm transition-all shadow-md shadow-[#FF7A00]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Tracking Order...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Track Order →</span>
                    </>
                  )}
                </button>
              </form>

              {/* Secure & Real-Time Tracking pill */}
              <div className="mt-3 py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center gap-2 text-emerald-700 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Secure &amp; Real-Time Tracking</span>
              </div>
            </div>

            {/* Quick Test Demo Suggestions */}
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 text-xs text-gray-500">
              <span className="font-semibold text-gray-400 text-[11px]">Quick Test:</span>
              {sampleTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleSelectSample(tag.id)}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-orange-50 border border-gray-200 hover:border-[#FF7A00]/40 text-gray-700 hover:text-[#FF7A00] transition-all cursor-pointer font-bold text-[11px]"
                >
                  {tag.label} <span className="text-[10px] text-gray-400 font-normal">({tag.note})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="max-w-xl md:max-w-2xl mx-auto px-4 sm:px-6 mt-4 space-y-4">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
              <div className="text-xs sm:text-sm flex-1">
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                      <span>Chat with Zupe Support on WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Multiple Matches (e.g. searched by phone) */}
          {matchedOrders.length > 1 && (
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Found {matchedOrders.length} orders matching your search:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {matchedOrders.map((ord) => {
                  const isSelected = selectedOrder?.id === ord.id;
                  return (
                    <button
                      key={ord.id}
                      onClick={() => {
                        setSelectedOrder(ord);
                        scrollToJourney();
                      }}
                      className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-orange-50/70 border-[#FF7A00] ring-2 ring-[#FF7A00]/20 shadow-2xs"
                          : "bg-[#F9FAFB] border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-sm text-gray-900">
                          {ord.shopify_order_id || ord.id}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {ord.delivery_status || ord.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {ord.items?.[0]?.product_name || "Zupe Store Item"}
                      </p>
                      <p className="text-xs font-extrabold text-[#FF7A00] mt-1.5">
                        ₹{Number(ord.total_amount || 0).toLocaleString()}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Order Tracking Display */}
          {selectedOrder && (
            <div className="space-y-4">
              {/* 1. 4-Step Milestone Stepper Card */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-sm">
                <div className="relative flex items-center justify-between px-2 sm:px-4">
                  {/* Background Gray Connector Line */}
                  <div className="absolute left-6 right-6 top-5 -translate-y-1/2 h-[3px] bg-gray-100" />
                  {/* Active Orange Connector Line */}
                  <div
                    className="absolute left-6 top-5 -translate-y-1/2 h-[3px] bg-[#FF7A00] transition-all duration-500"
                    style={{
                      width:
                        milestoneStep === 1
                          ? "0%"
                          : milestoneStep === 2
                          ? "33%"
                          : milestoneStep === 3
                          ? "66%"
                          : "calc(100% - 48px)",
                    }}
                  />

                  {/* 4 Steps */}
                  {steps.map((st, i) => {
                    const stepNum = i + 1;
                    const isPast = milestoneStep > stepNum;
                    const isCurrent = milestoneStep === stepNum;

                    return (
                      <div key={i} className="flex flex-col items-center relative z-10">
                        <div
                          className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all ${
                            isCurrent
                              ? "bg-orange-50 text-[#FF7A00] border-2 border-[#FF7A00] shadow-sm ring-4 ring-orange-100"
                              : isPast
                              ? "bg-orange-50 text-[#FF7A00] border border-orange-200"
                              : "bg-gray-50 text-gray-300 border border-gray-200"
                          }`}
                        >
                          <st.icon className="w-5 h-5" />
                          {(isPast || (isCurrent && stepNum === 1)) && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold border-2 border-white">
                              ✓
                            </span>
                          )}
                        </div>
                        <span
                          className={`mt-2 text-[10px] sm:text-xs font-bold text-center tracking-tight ${
                            isCurrent
                              ? "text-gray-900 font-extrabold"
                              : isPast
                              ? "text-gray-700"
                              : "text-gray-400"
                          }`}
                        >
                          {st.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Order Header Card */}
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                    Order #{cleanOrderId}
                  </h2>
                  <button
                    onClick={() => copyToClipboard(cleanOrderId, "id")}
                    className="p-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                    title="Copy Order ID"
                  >
                    {copiedOrderId ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span>
                    Placed on{" "}
                    {new Date(selectedOrder.created_at || Date.now()).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </p>

                {/* Inner Highlight Status Card */}
                <div className="bg-gradient-to-r from-orange-50 via-amber-50/50 to-orange-50/40 rounded-2xl p-4 border border-orange-200/70 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF9800] to-[#FF5722] flex items-center justify-center text-white shadow-md shadow-orange-500/20 text-xl flex-shrink-0">
                      📦
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold mb-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Live Courier Scan</span>
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-[#FF7A00]">
                        {getStatusTitle(
                          selectedOrder.delivery_status || selectedOrder.status,
                          liveTracking?.current_status
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      fetchTracking(selectedOrder.shopify_order_id || selectedOrder.id || inputTerm, true)
                    }
                    disabled={loading}
                    title="Refresh live status"
                    className="p-2.5 rounded-xl bg-white border border-gray-200/80 hover:bg-gray-50 text-gray-600 hover:text-gray-900 shadow-2xs transition-all active:scale-95 cursor-pointer flex-shrink-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#FF7A00]" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Optional COD Switch to Prepaid Offer */}
              {(() => {
                const isCodPending =
                  isCod &&
                  (selectedOrder.payment_status || "").toLowerCase() !== "paid" &&
                  (selectedOrder.payment_status || "").toLowerCase() !== "completed";

                if (!isCodPending) return null;

                const baseAmount = Number(selectedOrder.total_amount) || 0;
                const discounted = Math.max(0, baseAmount - 49);

                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border-2 border-[#FF7A00]/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FF7A00] text-white flex items-center justify-center shrink-0 font-bold text-base shadow-sm">
                        ⚡
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-gray-900 text-xs sm:text-sm">
                            Switch to Prepaid &amp; Save ₹49!
                          </h4>
                          <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            Discount
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5">
                          Pay ₹{discounted.toLocaleString()} online now instead of cash. Free shipping included!
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/checkout?method=prepaid&switch=cod&orderId=${encodeURIComponent(
                        selectedOrder.id
                      )}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white font-extrabold text-xs shadow-sm transition-all whitespace-nowrap active:scale-[0.98]"
                    >
                      <span>Pay ₹{discounted.toLocaleString()} Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })()}

              {/* 3. Live Shipment Journey Card */}
              {(() => {
                const checkpoints = buildTrackingCheckpoints(selectedOrder, liveTracking);

                return (
                  <div
                    id="live-shipment-journey"
                    ref={journeySectionRef}
                    className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF7A00] flex items-center justify-center flex-shrink-0">
                          <Truck className="w-4 h-4" />
                        </div>
                        <span>Live Shipment Journey</span>
                      </h3>
                      {lastUpdated && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Live Status Updated - {lastUpdated}</span>
                        </span>
                      )}
                    </div>

                    {/* Timeline Vertical Stack */}
                    <div className="relative pl-6 space-y-3.5 my-2">
                      {/* Vertical connector line */}
                      <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-[#FF7A00] via-orange-200 to-gray-200" />

                      {checkpoints.map((cp, idx) => (
                        <div key={idx} className="relative">
                          {/* Node Icon */}
                          <div
                            className={`absolute -left-[23px] top-4 w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                              cp.active
                                ? "bg-[#FF7A00] ring-4 ring-orange-100 text-white"
                                : cp.completed
                                ? "bg-emerald-500 text-white"
                                : "bg-gray-200 text-gray-400"
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

                          {/* Checkpoint Detail Card */}
                          <div className="bg-[#F9FAFB] rounded-2xl p-4 border border-gray-100/90 ml-2">
                            <h4
                              className={`text-sm font-extrabold ${
                                cp.active ? "text-[#FF7A00]" : "text-gray-900"
                              }`}
                            >
                              {cp.title}
                            </h4>
                            {cp.timestamp && (
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <span>{cp.timestamp}</span>
                              </p>
                            )}
                            {cp.location && (
                              <p className="text-xs font-semibold text-gray-600 mt-1 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <span>{cp.location}</span>
                              </p>
                            )}
                            {cp.description && (
                              <p className="text-xs text-gray-500 leading-relaxed mt-2 pt-2 border-t border-gray-100">
                                {cp.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* 4. Shipment & Tracking Details Card */}
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF7A00] flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <span>Shipment &amp; Tracking Details</span>
                </h3>

                {/* Row 1: Courier Partner */}
                <div className="bg-[#F9FAFB] rounded-2xl p-3.5 sm:p-4 border border-gray-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF7A00] flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium">Courier Partner</p>
                      <p className="text-sm font-extrabold text-gray-900">
                        {selectedOrder.courier_partner || (hasAwb ? "Courier Partner" : "Assigned upon dispatch")}
                      </p>
                    </div>
                  </div>
                  {selectedOrder.courier_partner ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold italic border border-blue-200">
                      {selectedOrder.courier_partner} &gt;
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-[11px] font-semibold border border-gray-200">
                      Standard Express
                    </span>
                  )}
                </div>

                {/* Row 2: AWB / Waybill Number */}
                <div className="bg-[#F9FAFB] rounded-2xl p-3.5 sm:p-4 border border-gray-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF7A00] flex items-center justify-center flex-shrink-0">
                      <BarcodeIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium">AWB / Waybill Number</p>
                      <p className="text-sm font-mono font-extrabold text-gray-900">
                        {hasAwb ? selectedOrder.shiprocket_awb : "Pending Dispatch"}
                      </p>
                    </div>
                  </div>
                  {hasAwb && (
                    <button
                      onClick={() =>
                        copyToClipboard(selectedOrder.shiprocket_awb!, "awb")
                      }
                      className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      title="Copy AWB"
                    >
                      {copiedAWB ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                {/* Row 3: External Tracking */}
                <div className="bg-[#F9FAFB] rounded-2xl p-3.5 sm:p-4 border border-gray-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF7A00] flex items-center justify-center flex-shrink-0">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium">External Tracking</p>
                      {hasAwb ? (
                        <a
                          href={getCourierTrackingUrl(
                            selectedOrder.courier_partner,
                            selectedOrder.shiprocket_awb
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm font-bold text-[#FF7A00] hover:underline inline-flex items-center gap-1"
                        >
                          <span>Open Courier Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium italic block pt-0.5">
                          Available once dispatched
                        </span>
                      )}
                    </div>
                  </div>
                  {hasAwb ? <ChevronRight className="w-4 h-4 text-gray-400" /> : null}
                </div>
              </div>

              {/* 5. Items in this Package Card */}
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF7A00] flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <span>Items in this Package</span>
                </h3>

                {/* Items List */}
                <div className="divide-y divide-gray-100">
                  {orderItems.length > 0 ? (
                    orderItems.map((it: any, idx: number) => (
                      <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-3.5">
                        <div className="relative w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                          <Image
                            src={it.image || getProductImageFallback(it.product_name)}
                            alt={it.product_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 truncate">
                            {it.product_name}
                          </h4>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Qty: {it.quantity}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 font-extrabold text-sm text-gray-900">
                          ₹{((Number(it.unit_price || it.price) || 0) * (Number(it.quantity) || 1)).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-3.5 flex items-center gap-3.5">
                      <div className="relative w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-[#FF7A00] flex-shrink-0">
                        <Package className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate">
                          Curated Zupe Item
                        </h4>
                        <p className="text-xs text-gray-400 mt-0.5">Qty: 1</p>
                      </div>
                      <div className="text-right flex-shrink-0 font-extrabold text-sm text-gray-900">
                        ₹{Number(selectedOrder.total_amount || 0).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span>Payment Method</span>
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isCod ? "Cash on Delivery" : "Prepaid (Completed)"}</span>
                  </span>
                </div>

                {/* Total Paid */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="font-extrabold text-sm text-gray-900">
                    Total Paid
                  </span>
                  <span className="bg-[#FF7A00] text-white font-extrabold px-4 py-1.5 rounded-full text-sm shadow-xs shadow-[#FF7A00]/25">
                    ₹{Number(selectedOrder.total_amount || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 6. Shipping Destination Card */}
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF7A00] flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span>Shipping Destination</span>
                </h3>

                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center gap-2.5 text-gray-900 font-extrabold text-sm">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{selectedOrder.customer_name || "Valued Customer"}</span>
                  </div>

                  {selectedOrder.shipping_address && (
                    <div className="flex items-start gap-2.5 text-gray-600 leading-relaxed">
                      <Home className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span>{selectedOrder.shipping_address}</span>
                    </div>
                  )}

                  {selectedOrder.customer_phone && (
                    <div className="flex items-center gap-2.5 text-gray-600 font-mono">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>Phone: {selectedOrder.customer_phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 7. How Your Order Reaches You (Delivery Process Guide) */}
              <div className="space-y-4 pt-2">
                <div className="text-center pt-2 pb-1">
                  <div className="inline-flex items-center justify-center gap-1.5">
                    <h3 className="text-xl sm:text-2xl font-display font-extrabold text-gray-900 tracking-tight">
                      How Your Order <span className="text-[#FF7A00]">Reaches You</span>
                    </h3>
                    <span className="text-[#FF7A00] text-base -mt-2">✨</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    A quick look at our fast, safe and reliable delivery process.
                  </p>
                  <div className="w-12 h-1 bg-[#FF7A00] rounded-full mx-auto mt-2.5 mb-2" />
                </div>

                <div className="relative space-y-3">
                  {/* Dashed orange line connecting the number badges on the left */}
                  <div className="absolute left-[29px] sm:left-[33px] top-7 bottom-7 w-[2px] border-l-2 border-dashed border-[#FF7A00]/40 z-0 pointer-events-none" />

                  {/* Step 1: Order Dispatched */}
                  <div className="relative z-10 bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-sm flex items-center justify-between gap-3 overflow-hidden">
                    <div className="flex items-start gap-3 sm:gap-3.5 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF7A00] font-extrabold text-sm flex items-center justify-center flex-shrink-0 border border-orange-100 mt-0.5">
                        1
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-sm sm:text-base text-gray-900">
                            Order Dispatched
                          </h4>
                          <span className="text-[#FF7A00] text-xs">✨</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed mt-1 max-w-[260px] sm:max-w-sm">
                          Orders are carefully packed within 24 hours in tamper-proof parcels with strict quality control.
                        </p>
                      </div>
                    </div>
                    <DeliveryBoxIllustration />
                  </div>

                  {/* Step 2: Express Logistics */}
                  <div className="relative z-10 bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-sm flex items-center justify-between gap-3 overflow-hidden">
                    <div className="flex items-start gap-3 sm:gap-3.5 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF7A00] font-extrabold text-sm flex items-center justify-center flex-shrink-0 border border-orange-100 mt-0.5">
                        2
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-sm sm:text-base text-gray-900">
                          Express Logistics
                        </h4>
                        <p className="text-xs text-gray-500 leading-relaxed mt-1 max-w-[260px] sm:max-w-sm">
                          Shipped through our trusted courier partners (Delhivery, Bluedart, Shadowfax) with live tracking updates.
                        </p>
                      </div>
                    </div>
                    <DeliveryTruckIllustration />
                  </div>

                  {/* Step 3: Doorstep Delivery */}
                  <div className="relative z-10 bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-sm flex items-center justify-between gap-3 overflow-hidden">
                    <div className="flex items-start gap-3 sm:gap-3.5 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF7A00] font-extrabold text-sm flex items-center justify-center flex-shrink-0 border border-orange-100 mt-0.5">
                        3
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-sm sm:text-base text-gray-900">
                          Doorstep Delivery
                        </h4>
                        <p className="text-xs text-gray-500 leading-relaxed mt-1 max-w-[260px] sm:max-w-sm">
                          Get real-time WhatsApp &amp; Email updates, with OTP verification to ensure safe and secure delivery.
                        </p>
                      </div>
                    </div>
                    <DoorstepDeliveryIllustration />
                  </div>
                </div>
              </div>

              {/* 8. Frequently Asked Questions Accordion */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-50 text-[#FF7A00] flex items-center justify-center border border-orange-200/80 font-black text-sm flex-shrink-0">
                    ?
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900">
                      Frequently Asked Questions
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Quick answers about your order and delivery.
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  {faqs.map((faq, idx) => {
                    const isOpen = faqOpen === idx;
                    const IconComponent = faq.icon;
                    return (
                      <div
                        key={idx}
                        className={`rounded-2xl transition-all ${
                          isOpen
                            ? "bg-[#FFF8F4] border border-[#FFD8C2] p-4 shadow-2xs"
                            : "bg-white p-3.5 sm:p-4 border border-gray-100 hover:border-gray-200 shadow-2xs"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setFaqOpen(isOpen ? null : idx)}
                          className="w-full flex items-center justify-between gap-3 text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                                isOpen
                                  ? "bg-orange-100/80 text-[#FF7A00]"
                                  : "bg-orange-50 text-[#FF7A00]"
                              }`}
                            >
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <span className="font-extrabold text-xs sm:text-sm text-gray-900">
                              {faq.q}
                            </span>
                          </div>
                          <div className="text-[#FF7A00] flex-shrink-0 ml-1">
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </button>

                        {isOpen && (
                          <div className="mt-3 pt-2.5 border-t border-orange-200/60 pl-12 pr-2 text-xs text-gray-600 leading-relaxed">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 9. Zupe Care Support Card (Dark Card) */}
              <div className="bg-[#0B1220] rounded-3xl p-5 sm:p-6 text-white shadow-lg border border-gray-800 space-y-4">
                <div className="flex items-center gap-2 text-[#FF7A00] text-xs font-bold tracking-wider uppercase">
                  <Shield className="w-4 h-4" />
                  <span className="text-gray-500 font-light">|</span>
                  <span>ZUPE CARE SUPPORT</span>
                </div>

                <div>
                  <h4 className="text-base sm:text-lg font-extrabold text-white">
                    Need help with this shipment?
                  </h4>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                    Our support team can help with address issues or courier delivery questions.
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  <a
                    href={`https://wa.me/919744122853?text=${encodeURIComponent(
                      `Hi Zupe Store, I need help with my Order #${cleanOrderId}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-sm transition-all shadow-md active:scale-[0.99] cursor-pointer"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </a>

                  <a
                    href="tel:+919744122853"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-extrabold text-sm transition-all border border-white/10 active:scale-[0.99] cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call +91 97441 22853</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* When no order is looked up yet (Default Guide & FAQs View) */}
          {!selectedOrder && !loading && (
            <div className="space-y-6 my-4">
              {/* How Your Order Reaches You */}
              <div className="space-y-4 pt-2">
                <div className="text-center pt-2 pb-1">
                  <div className="inline-flex items-center justify-center gap-1.5">
                    <h3 className="text-xl sm:text-2xl font-display font-extrabold text-gray-900 tracking-tight">
                      How Your Order <span className="text-[#FF7A00]">Reaches You</span>
                    </h3>
                    <span className="text-[#FF7A00] text-base -mt-2">✨</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    A quick look at our fast, safe and reliable delivery process.
                  </p>
                  <div className="w-12 h-1 bg-[#FF7A00] rounded-full mx-auto mt-2.5 mb-2" />
                </div>

                <div className="relative space-y-3">
                  <div className="absolute left-[29px] sm:left-[33px] top-7 bottom-7 w-[2px] border-l-2 border-dashed border-[#FF7A00]/40 z-0 pointer-events-none" />

                  {/* Step 1 */}
                  <div className="relative z-10 bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-sm flex items-center justify-between gap-3 overflow-hidden">
                    <div className="flex items-start gap-3 sm:gap-3.5 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF7A00] font-extrabold text-sm flex items-center justify-center flex-shrink-0 border border-orange-100 mt-0.5">
                        1
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-sm sm:text-base text-gray-900">
                            Order Dispatched
                          </h4>
                          <span className="text-[#FF7A00] text-xs">✨</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed mt-1 max-w-[260px] sm:max-w-sm">
                          Orders are carefully packed within 24 hours in tamper-proof parcels with strict quality control.
                        </p>
                      </div>
                    </div>
                    <DeliveryBoxIllustration />
                  </div>

                  {/* Step 2 */}
                  <div className="relative z-10 bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-sm flex items-center justify-between gap-3 overflow-hidden">
                    <div className="flex items-start gap-3 sm:gap-3.5 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF7A00] font-extrabold text-sm flex items-center justify-center flex-shrink-0 border border-orange-100 mt-0.5">
                        2
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-sm sm:text-base text-gray-900">
                          Express Logistics
                        </h4>
                        <p className="text-xs text-gray-500 leading-relaxed mt-1 max-w-[260px] sm:max-w-sm">
                          Shipped through our trusted courier partners (Delhivery, Bluedart, Shadowfax) with live tracking updates.
                        </p>
                      </div>
                    </div>
                    <DeliveryTruckIllustration />
                  </div>

                  {/* Step 3 */}
                  <div className="relative z-10 bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-sm flex items-center justify-between gap-3 overflow-hidden">
                    <div className="flex items-start gap-3 sm:gap-3.5 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF7A00] font-extrabold text-sm flex items-center justify-center flex-shrink-0 border border-orange-100 mt-0.5">
                        3
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-sm sm:text-base text-gray-900">
                          Doorstep Delivery
                        </h4>
                        <p className="text-xs text-gray-500 leading-relaxed mt-1 max-w-[260px] sm:max-w-sm">
                          Get real-time WhatsApp &amp; Email updates, with OTP verification to ensure safe and secure delivery.
                        </p>
                      </div>
                    </div>
                    <DoorstepDeliveryIllustration />
                  </div>
                </div>
              </div>

              {/* FAQs Accordion */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-50 text-[#FF7A00] flex items-center justify-center border border-orange-200/80 font-black text-sm flex-shrink-0">
                    ?
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900">
                      Frequently Asked Questions
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Quick answers about your order and delivery.
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  {faqs.map((faq, idx) => {
                    const isOpen = faqOpen === idx;
                    const IconComponent = faq.icon;
                    return (
                      <div
                        key={idx}
                        className={`rounded-2xl transition-all ${
                          isOpen
                            ? "bg-[#FFF8F4] border border-[#FFD8C2] p-4 shadow-2xs"
                            : "bg-white p-3.5 sm:p-4 border border-gray-100 hover:border-gray-200 shadow-2xs"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setFaqOpen(isOpen ? null : idx)}
                          className="w-full flex items-center justify-between gap-3 text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                                isOpen
                                  ? "bg-orange-100/80 text-[#FF7A00]"
                                  : "bg-orange-50 text-[#FF7A00]"
                              }`}
                            >
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <span className="font-extrabold text-xs sm:text-sm text-gray-900">
                              {faq.q}
                            </span>
                          </div>
                          <div className="text-[#FF7A00] flex-shrink-0 ml-1">
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </button>

                        {isOpen && (
                          <div className="mt-3 pt-2.5 border-t border-orange-200/60 pl-12 pr-2 text-xs text-gray-600 leading-relaxed">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Trust Guarantees Bar */}
          <div className="flex items-center justify-around gap-2 pt-6 pb-2 text-[11px] sm:text-xs text-gray-600 border-t border-gray-200/60 mt-6">
            <div className="flex items-center gap-1.5 font-bold">
              <Zap className="w-4 h-4 text-[#FF7A00]" />
              <span>Instant Updates</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-[#FF7A00]" />
              <span>Safe &amp; Secure</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold">
              <Headphones className="w-4 h-4 text-[#FF7A00]" />
              <span>Need Help? Contact Support</span>
            </div>
          </div>
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
