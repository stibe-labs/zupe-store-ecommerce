"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { Home, Store, Search, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from "@/context/SearchContext";

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, openCart, isOpen: isCartOpen } = useCart();
  const { isAuthenticated } = useAuth();
  const { isSearchOpen, openSearch } = useSearch();

  const containerRef = useRef<HTMLDivElement>(null);
  const [navWidth, setNavWidth] = useState(380);

  // ── Bar geometry constants ──────────────────────────────────────────────────
  const BAR_H = 62;      // px - clean, balanced bottom bar height
  const CIRCLE_D = 46;   // px - active circular bubble (sits completely inside bar)
  const CIRCLE_R = CIRCLE_D / 2; // 23px

  // ── Responsive width measurement ───────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w > 0) setNavWidth(w);
      }
    };
    update();
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(update)
        : null;
    if (ro && containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", update);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // ── Navigation items (order: Shop, Search, Home[center], Bag, Account) ─────
  const navItems = useMemo(
    () => [
      {
        label: "Shop",
        icon: <Store className="w-[20px] h-[20px]" strokeWidth={1.9} />,
        action: () => router.push("/products"),
      },
      {
        label: "Search",
        icon: <Search className="w-[20px] h-[20px]" strokeWidth={1.9} />,
        action: () => openSearch(),
      },
      {
        label: "Home",
        icon: <Home className="w-[20px] h-[20px]" strokeWidth={2.2} />,
        action: () => {
          if (pathname === "/" && !isSearchOpen && !isCartOpen) {
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            router.push("/");
          }
        },
      },
      {
        label: "Bag",
        icon: <ShoppingBag className="w-[20px] h-[20px]" strokeWidth={1.9} />,
        action: () => openCart(),
      },
      {
        label: "Account",
        icon: <User className="w-[20px] h-[20px]" strokeWidth={1.9} />,
        action: () => {
          if (isAuthenticated) {
            router.push("/account");
          } else {
            router.push(
              "/signin?redirect=/account&notice=Please sign in to view your profile and orders"
            );
          }
        },
      },
    ],
    [router, openSearch, openCart, isAuthenticated, pathname, isSearchOpen, isCartOpen]
  );

  // ── Equal 5-slot item centers ───────────────────────────────────────────────
  const slotW = navWidth / 5;
  const centers = useMemo(
    () => navItems.map((_, i) => (i + 0.5) * slotW),
    [navWidth, slotW, navItems]
  );

  // ── Active index determination ──────────────────────────────────────────────
  const getActiveIndex = () => {
    if (isSearchOpen) return 1; // Search
    if (isCartOpen) return 3;   // Bag
    if (pathname === "/") return 2; // Home (center)
    if (pathname?.startsWith("/products")) return 0; // Shop
    if (
      pathname === "/account" ||
      pathname === "/signin" ||
      pathname === "/login"
    ) {
      return 4; // Account
    }
    return 2; // Default: Home (center)
  };

  const [activeIndex, setActiveIndex] = useState(2); // Home = default

  // ── Spring-driven horizontal position ──────────────────────────────────────
  const motionX = useMotionValue(centers[2]); // Start at Home
  const springX = useSpring(motionX, {
    stiffness: 380,
    damping: 30,
    mass: 0.8,
  });

  // ── Sync active index with route/modal state ────────────────────────────────
  useEffect(() => {
    const idx = getActiveIndex();
    setActiveIndex(idx);
    motionX.set(centers[idx]);
  }, [pathname, isSearchOpen, isCartOpen, centers]);

  // ── Route guard ────────────────────────────────────────────────────────────
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/checkout")) {
    return null;
  }

  return (
    <nav
      ref={containerRef}
      aria-label="Mobile Bottom Navigation"
      style={{
        bottom: "max(12px, env(safe-area-inset-bottom, 12px))",
        height: `${BAR_H}px`,
      }}
      className="fixed inset-x-3 sm:hidden z-40 max-w-[420px] mx-auto select-none"
    >
      {/* ── 1. Floating Pill Bar Background ── */}
      <div className="relative w-full h-full bg-white/95 backdrop-blur-md rounded-full border border-slate-200/90 shadow-[0_8px_30px_rgba(0,29,64,0.13)]">
        {/* ── 2. Sliding Active Bubble Indicator (Completely Inside Bar) ── */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 z-20 pointer-events-none"
          style={{
            x: springX,
            left: -CIRCLE_R,
            width: CIRCLE_D,
            height: CIRCLE_D,
          }}
        >
          <div
            className="relative w-full h-full rounded-full bg-[#001D40] flex items-center justify-center shadow-[0_4px_14px_rgba(0,29,64,0.28)]"
          >
            {/* Active Icon with Crossfade / Pop Animation */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={activeIndex}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
                className="flex items-center justify-center text-white"
              >
                {navItems[activeIndex].icon}
              </motion.span>
            </AnimatePresence>

            {/* Bag badge when active */}
            {activeIndex === 3 && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E02B2B] text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-sm leading-none">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </div>
        </motion.div>

        {/* ── 3. Clickable Navigation Buttons (All 5 items inside bar) ── */}
        <div className="absolute inset-0 z-10 flex">
          {navItems.map((item, index) => {
            const isActive = activeIndex === index;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (isActive) {
                    if (index === 2 && pathname === "/") {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                    return;
                  }
                  setActiveIndex(index);
                  motionX.set(centers[index]);
                  item.action();
                }}
                className="flex-1 h-full flex items-center justify-center cursor-pointer touch-manipulation focus:outline-none group"
                aria-label={item.label}
              >
                {/* Inactive Icon — fades out smoothly when active indicator is positioned over it */}
                <span
                  className="relative flex items-center justify-center transition-all duration-200"
                  style={{
                    color: "#001D40",
                    opacity: isActive ? 0 : 0.68,
                    transform: isActive ? "scale(0.55)" : "scale(1)",
                    pointerEvents: isActive ? "none" : "auto",
                    transition: "opacity 180ms ease, transform 180ms ease",
                  }}
                >
                  {item.icon}

                  {/* Bag badge when inactive */}
                  {index === 3 && totalItems > 0 && !isActive && (
                    <span className="absolute -top-2 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-[#E02B2B] text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white shadow-xs leading-none">
                      {totalItems > 9 ? "9+" : totalItems}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
