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
} from "lucide-react";

interface AdminHeaderProps {
  onOpenMobile?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

interface AdminAlert {
  id: string;
  title: string;
  description: string;
  time: string;
  href: string;
  icon: any;
  iconColor: string;
}

export default function AdminHeader({
  onOpenMobile,
  onRefresh,
  isRefreshing = false,
}: AdminHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRange, setSelectedRange] = useState("This Month");
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);
  const [showAdminUserDropdown, setShowAdminUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [alerts, setAlerts] = useState<AdminAlert[]>([
    {
      id: "alt-1",
      title: "Consignment NDR Alert",
      description: "AWB SR-AWB-9871104 marked as Customer Unreachable. Follow up required.",
      time: "25m ago",
      href: "/admin/shipments",
      icon: Truck,
      iconColor: "text-amber-500 bg-amber-50",
    },
    {
      id: "alt-2",
      title: "Supplier RTO Credit Available",
      description: "₹500 doorstep return credit ready to claim against Supplier A.",
      time: "1h ago",
      href: "/admin/rto-refund-balance",
      icon: RotateCcw,
      iconColor: "text-[#FA521C] bg-orange-50",
    },
    {
      id: "alt-3",
      title: "New Store Order Placed",
      description: "Order #1059 for Portable Steam Iron placed via COD.",
      time: "2h ago",
      href: "/admin/orders",
      icon: ShoppingBag,
      iconColor: "text-emerald-500 bg-emerald-50",
    },
  ]);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLDivElement>(null);

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
    "Last 7 Days",
    "This Month",
    "Last Month",
    "All Time",
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
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
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C] transition-all"
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
            className="p-2 text-slate-500 hover:text-[#FA521C] hover:bg-orange-50 rounded-xl transition-all"
            title="Refresh ERP Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#FA521C]" : ""}`} />
          </button>
        )}

        <Link
          href="/"
          target="_blank"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#FA521C] hover:bg-orange-50 hover:border-orange-200 rounded-xl border border-slate-200/70 transition-all"
        >
          <span>Live Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Date Range Selector Dropdown */}
        <div className="relative" ref={rangeRef}>
          <button
            onClick={() => setShowRangeDropdown(!showRangeDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 transition-all"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">{selectedRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRangeDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-xs sm:text-sm">
              {dateOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setSelectedRange(opt);
                    setShowRangeDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-slate-50 font-medium ${
                    selectedRange === opt ? "text-[#FA521C] bg-orange-50/80 font-semibold" : "text-slate-700"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl relative transition-all"
            title="Notifications & Alerts"
          >
            <Bell className="w-4 h-4" />
            {alerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#FA521C] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {alerts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900 text-sm">ERP Alerts</h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-[#FA521C]">
                    {alerts.length} New
                  </span>
                </div>
                <button
                  onClick={() => setAlerts([])}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  Clear all
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {alerts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No new alerts. All operations running smoothly!
                  </div>
                ) : (
                  alerts.map((alt) => {
                    const Icon = alt.icon;
                    return (
                      <Link
                        key={alt.id}
                        href={alt.href}
                        onClick={() => setShowNotifications(false)}
                        className="p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors block"
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${alt.iconColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {alt.title}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {alt.time}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
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
        <div className="relative pl-2 border-l border-slate-200" ref={userRef}>
          <button
            onClick={() => setShowAdminUserDropdown(!showAdminUserDropdown)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-[#121417] text-[#FA521C] font-extrabold flex items-center justify-center text-xs shadow-sm ring-2 ring-[#FA521C]/30">
              Z
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-800 hidden md:inline">
              Administrator
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:inline" />
          </button>

          {showAdminUserDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-xs sm:text-sm">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-900">Zupe Store Admin</p>
                <p className="text-[11px] text-slate-400">admin@zupestore.in</p>
              </div>
              <Link
                href="/admin/settings"
                onClick={() => setShowAdminUserDropdown(false)}
                className="block px-4 py-2 text-slate-700 hover:text-[#FA521C] hover:bg-orange-50/60 font-medium"
              >
                Store Settings
              </Link>
              <Link
                href="/admin/reports"
                onClick={() => setShowAdminUserDropdown(false)}
                className="block px-4 py-2 text-slate-700 hover:text-[#FA521C] hover:bg-orange-50/60 font-medium"
              >
                P&L Reports
              </Link>
              <button
                onClick={async () => {
                  await fetch("/api/admin/auth/logout", { method: "POST" });
                  window.location.href = "/";
                }}
                className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 font-semibold border-t border-slate-100"
              >
                Lock & Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
