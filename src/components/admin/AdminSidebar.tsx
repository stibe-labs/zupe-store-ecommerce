"use client";

import React, { useState, useEffect } from "react";
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
  LogOut,
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

  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [ndrCount, setNdrCount] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [profitMargin, setProfitMargin] = useState<number>(28.4);

  useEffect(() => {
    const fetchSidebarBadges = async () => {
      try {
        const res = await fetch("/api/admin/dashboard/stats?timeframe=all");
        const data = await res.json();
        if (data.success && data.kpis) {
          setOrdersCount(data.kpis.totalOrders || 0);
          setNdrCount(data.kpis.ndrOrders || 0);
          setTotalOrders(data.kpis.totalOrders || 0);
          if (data.kpis.profitMargin !== undefined) {
            setProfitMargin(data.kpis.profitMargin);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch sidebar metrics:", err);
      }
    };

    fetchSidebarBadges();
  }, []);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
      badge: ordersCount > 0 ? String(ordersCount) : undefined,
    },
    {
      name: "Shipments",
      href: "/admin/shipments",
      icon: Truck,
      badge: ndrCount > 0 ? `${ndrCount} NDR` : undefined,
      badgeColor: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
    },
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#121417] text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-white/[0.07] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand / Logo */}
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-white/[0.08]">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FA521C] to-[#FF7A45] flex items-center justify-center text-white shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-extrabold text-lg text-white tracking-tight font-display">
                  Zupe
                </span>
                <span className="text-xs uppercase tracking-widest text-[#FA521C] font-bold">
                  Store
                </span>
              </div>
            </Link>
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
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
                      ? "bg-gradient-to-r from-[#FA521C] to-[#FF6B35] text-white shadow-md shadow-orange-500/25 font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
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
                        item.badgeColor
                          ? item.badgeColor
                          : isActive
                          ? "bg-white/20 text-white"
                          : "bg-white/10 text-slate-300"
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
        <div className="p-4 space-y-3 border-t border-white/[0.08]">
          <div className="p-3 rounded-xl bg-[#181B20] border border-white/[0.08] flex items-center justify-between shadow-inner">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Total Live Orders
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base font-bold text-white">
                  {totalOrders.toLocaleString()}
                </span>
                <span className="text-xs text-emerald-400 font-medium flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> {profitMargin}% margin
                </span>
              </div>
            </div>
            {/* Mini Sparkline Bar Chart Icon */}
            <div className="w-9 h-7 flex items-end justify-between gap-1 px-1">
              <div className="w-1.5 h-3 bg-[#FA521C]/50 rounded-t" />
              <div className="w-1.5 h-4 bg-[#FA521C]/80 rounded-t" />
              <div className="w-1.5 h-6 bg-[#FA521C] rounded-t" />
            </div>
          </div>

          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#FA521C]/15 text-[#FA521C] flex items-center justify-center text-xs font-bold">
                Z
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">Zupe Store</p>
                <p className="text-[10px] text-slate-500">Live Production ERP</p>
              </div>
            </div>

            <button
              onClick={async () => {
                await fetch("/api/admin/auth/logout", { method: "POST" });
                window.location.href = "/";
              }}
              title="Lock Admin Session"
              className="inline-flex items-center gap-1 p-1.5 rounded-lg text-slate-400 hover:text-[#FA521C] hover:bg-white/[0.06] transition-colors text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
