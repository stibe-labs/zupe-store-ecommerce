"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Calendar,
  Bell,
  ChevronDown,
  Menu,
  ExternalLink,
  RefreshCw,
  X,
  AlertTriangle,
  RotateCcw,
  ShoppingBag,
  CheckCircle2,
  Truck,
  Sun,
  Moon,
  Clock,
  Package,
  ShoppingCart,
  MessageSquare,
} from "lucide-react";
import { useAdminTheme } from "@/context/AdminThemeContext";

interface AdminHeaderProps {
  onOpenMobile?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  selectedRange?: string;
  onRangeChange?: (range: string) => void;
  hideDateFilter?: boolean;
}

interface AdminAlert {
  id: string;
  type: "order" | "whatsapp" | "ndr" | "rto" | "stock" | "cart";
  title: string;
  description: string;
  time: string;
  timestamp: number;
  href: string;
  badge: string;
  iconType: "ShoppingBag" | "Clock" | "AlertTriangle" | "RotateCcw" | "Package" | "ShoppingCart";
  iconColor: string;
  priority: "high" | "medium" | "normal";
}

export default function AdminHeader({
  onOpenMobile,
  onRefresh,
  isRefreshing = false,
  selectedRange,
  onRangeChange,
  hideDateFilter = false,
}: AdminHeaderProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useAdminTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [internalRange, setInternalRange] = useState("This Month");
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);
  const [showAdminUserDropdown, setShowAdminUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  // Browser Desktop Push Notifications State
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>("default");
  const [dismissedBanner, setDismissedBanner] = useState<boolean>(false);
  const initialOrdersLoadedRef = useRef<boolean>(false);
  const knownOrderIdsRef = useRef<Set<string>>(new Set());

  const activeRange = selectedRange || internalRange;

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLDivElement>(null);

  // Synthesized Web Audio Cashier / Success Chime
  const playOrderChime = () => {
    if (typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      // Note 1 (E5: 659.25Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Note 2 (G#5: 830.61Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(830.61, now + 0.1);
      gain2.gain.setValueAtTime(0.3, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.5);

      // Note 3 (B5: 987.77Hz)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = "triangle";
      osc3.frequency.setValueAtTime(987.77, now + 0.22);
      gain3.gain.setValueAtTime(0.35, now + 0.22);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.22);
      osc3.stop(now + 0.65);
    } catch (e) {
      console.warn("Could not play audio chime:", e);
    }
  };

  // Helper to trigger desktop notification
  const triggerBrowserNotification = (
    title: string,
    body: string,
    url: string = "/admin/orders"
  ) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "granted") {
      playOrderChime();
      try {
        const notif = new Notification(title, {
          body,
          icon: "/vl-logo-black.png",
          badge: "/favicon-32x32.png",
          tag: "vittal-order-" + Date.now(),
          requireInteraction: true,
        });
        notif.onclick = () => {
          window.focus();
          router.push(url);
          notif.close();
        };
      } catch (e) {
        console.warn("Notification error:", e);
      }
    }
  };

  // Check and request browser notification permission
  const requestNotificationPermission = () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission().then((perm) => {
        setBrowserPermission(perm);
        if (perm === "granted") {
          setDismissedBanner(true);
          triggerBrowserNotification(
            "🛍️ Order Notifications Activated! — Vittal ERP",
            "You will now receive instant desktop alerts with sound whenever new orders are confirmed, even when minimized.",
            "/admin/orders"
          );
        }
      });
    }
  };

  // On mount: check permission and prompt if default
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserPermission(Notification.permission);
      try {
        const dismissed = sessionStorage.getItem("admin_dismissed_notif_banner");
        if (dismissed === "1") {
          setDismissedBanner(true);
        }
      } catch {}

      // Automatically request permission on open if not asked yet
      if (Notification.permission === "default") {
        Notification.requestPermission().then((perm) => {
          setBrowserPermission(perm);
          if (perm === "granted") {
            setDismissedBanner(true);
            triggerBrowserNotification(
              "🛍️ Order Notifications Activated! — Vittal ERP",
              "You will now receive instant desktop alerts with sound whenever new orders are confirmed, even when minimized.",
              "/admin/orders"
            );
          }
        });
      }
    }
  }, []);

  // Background Order Poller for Minimized / Background Tabs
  const checkForNewConfirmedOrders = async () => {
    try {
      const res = await fetch(`/api/admin/orders?_t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success || !Array.isArray(data.orders)) return;

      const currentOrderIds = new Set<string>(data.orders.map((o: any) => o.id));

      if (!initialOrdersLoadedRef.current) {
        let savedIds: string[] = [];
        try {
          savedIds = JSON.parse(localStorage.getItem("admin_known_order_ids") || "[]");
        } catch {
          savedIds = [];
        }
        const initialSet = new Set<string>([...savedIds, ...Array.from(currentOrderIds)]);
        knownOrderIdsRef.current = initialSet;
        try {
          localStorage.setItem("admin_known_order_ids", JSON.stringify(Array.from(initialSet)));
        } catch {}
        initialOrdersLoadedRef.current = true;
        return;
      }

      // Check for any new orders
      const newOrders = data.orders.filter(
        (o: any) =>
          !knownOrderIdsRef.current.has(o.id) &&
          o.status !== "Cancelled"
      );

      if (newOrders.length > 0) {
        newOrders.forEach((newOrd: any) => {
          knownOrderIdsRef.current.add(newOrd.id);
          const cust = newOrd.customer_name || "Valued Customer";
          const amount = (Number(newOrd.total_amount) || 0).toLocaleString("en-IN");
          const ordId = newOrd.id?.startsWith("ord_") ? newOrd.id.substring(0, 16) : newOrd.id;

          triggerBrowserNotification(
            "🛍️ New Order Confirmed! — Vittal Lifestyle",
            `Order #${ordId} from ${cust} (₹${amount}) has been confirmed! Click to view & dispatch.`,
            `/admin/orders?search=${encodeURIComponent(newOrd.id)}`
          );
        });

        try {
          localStorage.setItem(
            "admin_known_order_ids",
            JSON.stringify(Array.from(knownOrderIdsRef.current))
          );
        } catch {}

        // Flash document title
        const originalTitle = document.title;
        document.title = `(${newOrders.length}) 🛍️ NEW ORDER CONFIRMED! — Vittal ERP`;
        const resetTitle = () => {
          document.title = originalTitle;
          window.removeEventListener("focus", resetTitle);
        };
        window.addEventListener("focus", resetTitle);
      }
    } catch (err) {
      console.warn("Background order check error:", err);
    }
  };

  useEffect(() => {
    checkForNewConfirmedOrders();
    const interval = setInterval(checkForNewConfirmedOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real-time alerts from ERP API
  const fetchAlerts = async () => {
    try {
      setLoadingAlerts(true);
      const res = await fetch(`/api/admin/alerts?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.alerts)) {
          let dismissedIds: string[] = [];
          try {
            dismissedIds = JSON.parse(localStorage.getItem("admin_dismissed_alerts") || "[]");
          } catch {
            dismissedIds = [];
          }
          const active = data.alerts.filter((a: AdminAlert) => !dismissedIds.includes(a.id));
          setAlerts(active);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch admin alerts:", err);
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isRefreshing) {
      fetchAlerts();
    }
  }, [isRefreshing]);

  const handleClearAllAlerts = () => {
    const ids = alerts.map((a) => a.id);
    let dismissedIds: string[] = [];
    try {
      dismissedIds = JSON.parse(localStorage.getItem("admin_dismissed_alerts") || "[]");
    } catch {
      dismissedIds = [];
    }
    const merged = Array.from(new Set([...dismissedIds, ...ids]));
    localStorage.setItem("admin_dismissed_alerts", JSON.stringify(merged));
    setAlerts([]);
  };

  const renderAlertIcon = (iconType: string) => {
    switch (iconType) {
      case "ShoppingBag":
        return <ShoppingBag className="w-4 h-4" />;
      case "Clock":
        return <Clock className="w-4 h-4" />;
      case "AlertTriangle":
        return <AlertTriangle className="w-4 h-4" />;
      case "RotateCcw":
        return <RotateCcw className="w-4 h-4" />;
      case "Package":
        return <Package className="w-4 h-4" />;
      case "ShoppingCart":
        return <ShoppingCart className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowAdminUserDropdown(false);
      }
      if (rangeRef.current && !rangeRef.current.contains(event.target as Node)) {
        setShowRangeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/admin/orders?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const dateOptions = [
    "Today",
    "Yesterday",
    "This Week",
    "This Month",
    "Last Month",
    "This Year",
    "All Time",
    "Custom Range",
  ];

  return (
    <>
      {/* Browser Notification Permission Prompt Banner */}
      {browserPermission === "default" && !dismissedBanner && (
        <div className="bg-gradient-to-r from-[#111111] via-[#1a2512] to-[#111111] text-white px-4 py-2 text-xs font-semibold flex items-center justify-between gap-3 border-b border-[#10B981]/30 sticky top-0 z-40 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-[#10B981]/20 text-[#10B981] flex items-center justify-center shrink-0">
              <Bell className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <p className="truncate">
              <span className="font-bold text-[#10B981]">Enable Desktop Alerts:</span> Allow browser notifications to receive sound alerts when orders are confirmed, even when this tab is minimized.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={requestNotificationPermission}
              className="px-3 py-1 bg-[#10B981] hover:bg-[#9FD92A] text-[#111111] rounded-lg font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              Allow Notifications
            </button>
            <button
              onClick={() => {
                setDismissedBanner(true);
                try {
                  sessionStorage.setItem("admin_dismissed_notif_banner", "1");
                } catch {}
              }}
              className="p-1 text-neutral-400 hover:text-white rounded-md transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <header className="h-16 bg-white border-b border-neutral-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 font-mograph">
      {/* Left: Mobile hamburger & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearch} className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders, customers, AWB..."
          className="w-full pl-9 pr-8 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/40 focus:border-[#7ABF1E] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200/60"
              aria-label="Clear admin search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Right Controls: Date Picker, Notifications, User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-neutral-500 hover:text-[#0B5D44] hover:bg-[#10B981]/10 rounded-xl transition-all"
            title="Refresh ERP Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#0B5D44]" : ""}`} />
          </button>
        )}

        <Link
          href="https://vittallifestyle.com"
          target="_blank"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:text-[#0B5D44] hover:bg-[#10B981]/10 hover:border-[#10B981]/40 rounded-xl border border-neutral-200/70 transition-all"
        >
          <span>Live Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Option A: Animated Theme Pill Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
          title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 select-none cursor-pointer ${
            theme === "dark"
              ? "bg-[#111111] border-[#10B981]/30 text-[#10B981] hover:bg-[#1a1a1a] hover:border-[#10B981]/60 shadow-sm"
              : "bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-[#10B981]/10 hover:border-[#10B981]/40 shadow-sm"
          }`}
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400 animate-in spin-in-90 duration-200" />
              <span className="hidden sm:inline">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-slate-500 animate-in spin-in-90 duration-200" />
              <span className="hidden sm:inline">Dark Mode</span>
            </>
          )}
        </button>

        {/* Date Range Selector Dropdown (Synced with Dashboard Filters) */}
        {!hideDateFilter && (
          <div className="relative" ref={rangeRef}>
            <button
              onClick={() => setShowRangeDropdown(!showRangeDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 border border-neutral-200 hover:bg-[#10B981]/10 hover:border-[#10B981]/40 rounded-xl text-xs sm:text-sm font-semibold text-neutral-700 transition-all"
            >
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">{activeRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRangeDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-xl shadow-xl py-1 z-50 text-xs sm:text-sm">
                {dateOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setInternalRange(opt);
                      if (onRangeChange) {
                        onRangeChange(opt);
                      }
                      setShowRangeDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-[#10B981]/10 font-medium ${
                      activeRange === opt ? "text-[#0B5D44] bg-[#10B981]/20 font-bold" : "text-neutral-700"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Real-Time ERP Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl relative transition-all"
            title="Notifications & ERP Alerts"
          >
            <Bell className="w-4 h-4" />
            {alerts.length > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-[#FF3B30] text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse shadow-sm">
                {alerts.length > 99 ? "99+" : alerts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-neutral-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in">
              {/* Desktop Push Notification Status Bar */}
              <div className="px-4 py-2 bg-neutral-50/90 border-b border-neutral-100 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      browserPermission === "granted"
                        ? "bg-emerald-500 animate-pulse"
                        : browserPermission === "denied"
                        ? "bg-rose-500"
                        : "bg-amber-400"
                    }`}
                  />
                  <span className="text-[11px] font-semibold text-neutral-700 truncate">
                    {browserPermission === "granted"
                      ? "Desktop Alerts: Active"
                      : browserPermission === "denied"
                      ? "Desktop Alerts: Blocked"
                      : "Desktop Alerts: Inactive"}
                  </span>
                </div>

                {browserPermission === "granted" ? (
                  <button
                    onClick={() => {
                      triggerBrowserNotification(
                        "🛍️ Test Order Notification",
                        "Desktop notifications are working! You will get alerts with sound even when this window is minimized.",
                        "/admin/orders"
                      );
                    }}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-700 hover:text-[#0B5D44] hover:border-[#10B981] shadow-2xs transition-colors shrink-0 cursor-pointer"
                  >
                    Test Alert
                  </button>
                ) : browserPermission === "default" ? (
                  <button
                    onClick={requestNotificationPermission}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#10B981] text-[#111111] hover:bg-[#9FD92A] transition-colors shrink-0 cursor-pointer"
                  >
                    Enable Now
                  </button>
                ) : null}
              </div>

              <div className="px-4 py-2 border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-neutral-900 text-sm">ERP Alerts</h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#10B981]/30 text-[#0B5D44]">
                    {alerts.length} New
                  </span>
                </div>
                {alerts.length > 0 && (
                  <button
                    onClick={handleClearAllAlerts}
                    className="text-xs text-neutral-400 hover:text-neutral-600 font-medium cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100">
                {alerts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-400">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2 opacity-80" />
                    No new alerts. All operations running smoothly!
                  </div>
                ) : (
                  alerts.map((alt) => {
                    return (
                      <Link
                        key={alt.id}
                        href={alt.href}
                        onClick={() => setShowNotifications(false)}
                        className="p-3.5 flex items-start gap-3 hover:bg-[#10B981]/5 transition-colors block"
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${alt.iconColor}`}>
                          {renderAlertIcon(alt.iconType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <p className="text-xs font-bold text-neutral-900 truncate">
                                {alt.title}
                              </p>
                              {alt.badge && (
                                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-neutral-100 text-neutral-600 shrink-0">
                                  {alt.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                              {alt.time}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
                            {alt.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Dropdown */}
        <div className="relative pl-2 border-l border-neutral-200" ref={userRef}>
          <button
            onClick={() => setShowAdminUserDropdown(!showAdminUserDropdown)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-[#10B981] text-[#111111] font-extrabold flex items-center justify-center text-xs shadow-sm ring-2 ring-[#10B981]/40">
              VL
            </div>
            <span className="text-xs sm:text-sm font-semibold text-neutral-800 hidden md:inline">
              Administrator
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 hidden md:inline" />
          </button>

          {showAdminUserDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-xl shadow-xl py-1 z-50 text-xs sm:text-sm">
              <div className="px-4 py-2 border-b border-neutral-100">
                <p className="font-bold text-neutral-900">Vittal Lifestyle Admin</p>
                <p className="text-[11px] text-neutral-400">admin@vittallifestyle.com</p>
              </div>
              <Link
                href="/admin/settings"
                onClick={() => setShowAdminUserDropdown(false)}
                className="block px-4 py-2 text-neutral-700 hover:text-[#0B5D44] hover:bg-[#10B981]/10 font-medium"
              >
                Store Settings
              </Link>
              <Link
                href="/admin/reports"
                onClick={() => setShowAdminUserDropdown(false)}
                className="block px-4 py-2 text-neutral-700 hover:text-[#0B5D44] hover:bg-[#10B981]/10 font-medium"
              >
                P&L Reports
              </Link>
              <button
                type="button"
                onClick={() => {
                  toggleTheme();
                  setShowAdminUserDropdown(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-neutral-700 hover:text-[#0B5D44] hover:bg-[#10B981]/10 transition-colors"
              >
                <span className="flex items-center gap-2">
                  {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-neutral-500" />}
                  Theme
                </span>
                <span className="text-[11px] font-bold text-[#0B5D44] uppercase">
                  {theme}
                </span>
              </button>
              <button
                onClick={async () => {
                  await fetch("/api/admin/auth/logout", { method: "POST" });
                  window.location.href = "/";
                }}
                className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 font-semibold border-t border-neutral-100"
              >
                Lock & Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
    </>
  );
}
