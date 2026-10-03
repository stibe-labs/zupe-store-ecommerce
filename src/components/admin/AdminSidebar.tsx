"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  Box,
  Users,
  DollarSign,
  CreditCard,
  RotateCcw,
  BarChart2,
  UserCheck,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function AdminSidebar({
  mobileOpen = false,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag, badge: "12" },
    { name: "Shipments", href: "/admin/shipments", icon: Truck },
    { name: "Products", href: "/admin/products", icon: Box },
    { name: "Suppliers", href: "/admin/suppliers", icon: Users },
    { name: "Expenses", href: "/admin/expenses", icon: DollarSign },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    {
      name: "RTO Refund Balance",
      href: "/admin/rto-refund-balance",
      icon: RotateCcw,
      highlight: true,
    },
    { name: "Reports", href: "/admin/reports", icon: BarChart2 },
    { name: "Customers", href: "/admin/customers", icon: UserCheck },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0B132B] text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand / Logo */}
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                Zupestore
              </span>
            </Link>
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)]">
            {navigation.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? "bg-blue-500 text-white"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Orders Sparkline Card & Brand Footnote */}
        <div className="p-4 space-y-3 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-inner">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Total Orders
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base font-bold text-white">1,248</span>
                <span className="text-xs text-emerald-400 font-medium flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
                </span>
              </div>
            </div>
            {/* Mini Sparkline Bar Chart Icon */}
            <div className="w-9 h-7 flex items-end justify-between gap-1 px-1">
              <div className="w-1.5 h-3 bg-blue-500/60 rounded-t" />
              <div className="w-1.5 h-4 bg-blue-500/80 rounded-t" />
              <div className="w-1.5 h-6 bg-blue-500 rounded-t" />
            </div>
          </div>

          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-slate-300 text-xs">
                🛍️
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">Zupestore</p>
                <p className="text-[10px] text-slate-500">Grow. Sell. Everywhere.</p>
              </div>
            </div>

            <button
              onClick={async () => {
                await fetch("/api/admin/auth/logout", { method: "POST" });
                window.location.href = "/admin/login";
              }}
              title="Lock Admin Session"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors text-xs"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
