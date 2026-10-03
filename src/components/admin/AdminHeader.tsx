"use client";

import React, { useState } from "react";
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
} from "lucide-react";

interface AdminHeaderProps {
  onOpenMobile?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function AdminHeader({
  onOpenMobile,
  onRefresh,
  isRefreshing = false,
}: AdminHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRange, setSelectedRange] = useState("01 Oct 2026 - 31 Oct 2026");
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);
  const [showAdminUserDropdown, setShowAdminUserDropdown] = useState(false);

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
    "01 Oct 2026 - 31 Oct 2026",
    "Last Month",
    "Custom Range",
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
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
            title="Refresh ERP Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
          </button>
        )}

        <Link
          href="/"
          target="_blank"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
        >
          <span>View Store</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Date Range Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRangeDropdown(!showRangeDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs sm:text-sm font-medium text-slate-700 transition-all"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">{selectedRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRangeDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-xs sm:text-sm">
              {dateOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setSelectedRange(opt);
                    setShowRangeDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-slate-50 font-medium ${
                    selectedRange === opt ? "text-blue-600 bg-blue-50/60 font-semibold" : "text-slate-700"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl relative transition-all">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </button>
        </div>

        {/* User Avatar & Dropdown */}
        <div className="relative pl-2 border-l border-slate-200">
          <button
            onClick={() => setShowAdminUserDropdown(!showAdminUserDropdown)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              A
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-800 hidden md:inline">
              Admin
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:inline" />
          </button>

          {showAdminUserDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-xs sm:text-sm">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-900">Zupe Admin</p>
                <p className="text-[11px] text-slate-400">admin@zupestore.com</p>
              </div>
              <Link
                href="/admin/settings"
                onClick={() => setShowAdminUserDropdown(false)}
                className="block px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
              >
                Settings
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
