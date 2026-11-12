"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
  Palette,
  Star,
  Sparkles,
  X,
  LogOut,
  ShoppingCart,
  Tag,
  Calculator,
  MessageSquare,
  Target,
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

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.classList.remove("modal-open");
        document.documentElement.classList.remove("modal-open");
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [mobileOpen]);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
      badge: ordersCount > 0 ? String(ordersCount) : undefined,
    },
    {
      name: "WhatsApp",
      href: "/admin/whatsapp",
      icon: MessageSquare,
      badge: "Live",
      badgeColor: "bg-[#B8ED3E]/20 text-[#4A7C0F] border border-[#B8ED3E]/50",
      highlight: true,
    },
    {
      name: "Meta CRM",
      href: "/admin/crm",
      icon: Target,
      badge: "Pixel CAPI",
      badgeColor: "bg-[#111111]/10 text-[#111111] border border-[#111111]/20",
    },
    {
      name: "Abandoned Carts",
      href: "/admin/abandoned-carts",
      icon: ShoppingCart,
    },
    {
      name: "Shipments",
      href: "/admin/shipments",
      icon: Truck,
      badge: ndrCount > 0 ? `${ndrCount} NDR` : undefined,
      badgeColor: "bg-rose-100 text-rose-600 border border-rose-200",
    },
    { name: "Products", href: "/admin/products", icon: Box },
    { name: "Promo Codes", href: "/admin/promo-codes", icon: Tag },
    { name: "Social Proof", href: "/admin/reviews", icon: Sparkles },
    { name: "Website Content", href: "/admin/website-content", icon: Palette },
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
    {
      name: "Profit Studio",
      href: "/admin/calculator",
      icon: Calculator,
      badge: "Calc",
      badgeColor: "bg-[#B8ED3E]/20 text-[#4A7C0F] border border-[#B8ED3E]/40",
    },
    { name: "Customers", href: "/admin/customers", icon: UserCheck },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container — white with lime green accents */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white text-neutral-700 flex flex-col justify-between overflow-y-auto overscroll-contain transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-neutral-200/80 shadow-sm ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand / Logo */}
        <div>
          <div className="h-16 flex items-center justify-between px-5 border-b border-neutral-100">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="relative h-10 w-32 flex items-center justify-start group-hover:scale-105 transition-transform overflow-hidden flex-shrink-0">
                <Image
                  src="/vl-logo-nobg.png"
                  alt="Vittal Lifestyle"
                  width={128}
                  height={40}
                  className="object-contain w-auto h-9"
                  priority
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[9px] uppercase tracking-widest text-[#4A7C0F] font-bold bg-[#B8ED3E]/20 px-1.5 py-0.5 rounded-md">
                  Admin ERP
                </span>
              </div>
            </Link>
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-0.5 overflow-y-auto max-h-[calc(100vh-230px)]">
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
                      ? "bg-[#B8ED3E] text-[#111111] border-l-4 border-[#7ABF1E] shadow-sm font-bold"
                      : "text-neutral-500 hover:text-[#111111] hover:bg-[#B8ED3E]/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? "text-[#111111]" : "text-neutral-400 group-hover:text-[#4A7C0F]"
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
                          ? "bg-[#111111]/10 text-[#111111]"
                          : "bg-neutral-100 text-neutral-500"
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
        <div className="p-4 space-y-3 border-t border-neutral-100">
          <div className="p-3 rounded-xl bg-[#B8ED3E]/10 border border-[#B8ED3E]/40 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">
                Total Live Orders
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base font-bold text-[#111111]">
                  {totalOrders.toLocaleString()}
                </span>
                <span className="text-xs text-[#4A7C0F] font-medium flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> {profitMargin}% margin
                </span>
              </div>
            </div>
            {/* Mini Sparkline Bar Chart */}
            <div className="w-9 h-7 flex items-end justify-between gap-1 px-1">
              <div className="w-1.5 h-3 bg-[#B8ED3E]/50 rounded-t" />
              <div className="w-1.5 h-4 bg-[#B8ED3E]/80 rounded-t" />
              <div className="w-1.5 h-6 bg-[#B8ED3E] rounded-t" />
            </div>
          </div>

          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#B8ED3E] text-[#111111] flex items-center justify-center text-xs font-black">
                VL
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-800">Vittal Lifestyle</p>
                <p className="text-[10px] text-neutral-400">Live Production ERP</p>
              </div>
            </div>

            <button
              onClick={async () => {
                await fetch("/api/admin/auth/logout", { method: "POST" });
                window.location.href = "/";
              }}
              title="Lock Admin Session"
              className="inline-flex items-center gap-1 p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 transition-colors text-xs"
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
