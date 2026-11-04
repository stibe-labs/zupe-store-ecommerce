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

// ─── SVG Path Generator ───────────────────────────────────────────────────────
// Generates the pill-shaped nav bar with a smooth concave notch that wraps the
// raised circular active indicator. Geometry tuned to match reference video.
//
// W, H: viewBox dimensions
// r: corner radius (H/2 for a perfect pill)
// cx: horizontal center of the active indicator
// notch_hw: half-width of notch from center (tighter = more like reference)
// depth: how deep the notch dips below the bar's top edge
function getNavSvgPath(
  W: number,
  H: number,
  r: number,
  cx: number,
  notch_hw: number,
  depth: number
): string {
  const safeCx = Math.max(r, Math.min(W - r, cx));
  const x1 = Math.max(r, safeCx - notch_hw);
  const x2 = Math.min(W - r, safeCx + notch_hw);

  // Left notch bezier: flat approach → smooth dip to depth
  // Control points create the characteristic "hugging" curve
  const lp1x = Math.max(r, safeCx - notch_hw * 0.4);
  const lp2x = Math.max(r, safeCx - notch_hw * 0.1);
  const rp1x = Math.min(W - r, safeCx + notch_hw * 0.1);
  const rp2x = Math.min(W - r, safeCx + notch_hw * 0.4);

  return [
    `M ${r} 0`,
    `L ${x1.toFixed(2)} 0`,
    // Left shoulder: flat → concave dip
    `C ${lp1x.toFixed(2)} 0, ${lp2x.toFixed(2)} ${depth}, ${safeCx.toFixed(2)} ${depth}`,
    // Right shoulder: concave dip → flat
    `C ${rp1x.toFixed(2)} ${depth}, ${rp2x.toFixed(2)} 0, ${x2.toFixed(2)} 0`,
    `L ${(W - r).toFixed(2)} 0`,
    // Top-right pill corner
    `A ${r} ${r} 0 0 1 ${W} ${r}`,
    `L ${W} ${(H - r).toFixed(2)}`,
    // Bottom-right pill corner
    `A ${r} ${r} 0 0 1 ${(W - r).toFixed(2)} ${H}`,
    `L ${r} ${H}`,
    // Bottom-left pill corner
    `A ${r} ${r} 0 0 1 0 ${(H - r).toFixed(2)}`,
    `L 0 ${r}`,
    // Top-left pill corner
    `A ${r} ${r} 0 0 1 ${r} 0`,
    "Z",
  ].join(" ");
}

// ─── Component ────────────────────────────────────────────────────────────────
export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, openCart, isOpen: isCartOpen } = useCart();
  const { isAuthenticated } = useAuth();
  const { isSearchOpen, openSearch } = useSearch();

  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [navWidth, setNavWidth] = useState(380);

  // ── Bar geometry constants ──────────────────────────────────────────────────
  const BAR_H = 68;        // px - bar total height
  const BAR_R = 34;        // px - corner radius (= H/2 for pill)
  const CIRCLE_D = 50;     // px - active indicator circle diameter
  const CIRCLE_R = CIRCLE_D / 2; // 25px
  // Circle center sits 12px ABOVE the bar's top edge
  // → circle rises 37px above bar, dips 13px into notch
  const CIRCLE_Y_OFFSET = -12; // negative = above bar top
  const NOTCH_HW = 36;    // px - half-width of notch (tighter = more reference-like)
  const NOTCH_DEPTH = CIRCLE_R + CIRCLE_Y_OFFSET + 2; // = 15px (accommodates circle's lower arc)

  // ── Responsive width measurement ───────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w > 0) setNavWidth(w);
      }
    };
    update();
    const ro = typeof ResizeObserver !== "undefined"
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
    [navWidth, slotW]
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
    stiffness: 350,
    damping: 28,
    mass: 0.9,
  });

  // ── Sync active index with route/modal state ────────────────────────────────
  useEffect(() => {
    const idx = getActiveIndex();
    setActiveIndex(idx);
    motionX.set(centers[idx]);
  }, [pathname, isSearchOpen, isCartOpen, centers]);

  // ── Drive SVG notch morphing synchronously with spring ─────────────────────
  useEffect(() => {
    const unsub = springX.on("change", (x) => {
      pathRef.current?.setAttribute(
        "d",
        getNavSvgPath(navWidth, BAR_H, BAR_R, x, NOTCH_HW, NOTCH_DEPTH)
      );
    });
    return unsub;
  }, [springX, navWidth]);

  // ── Route guard ────────────────────────────────────────────────────────────
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/checkout")) {
    return null;
  }

  const initialD = getNavSvgPath(
    navWidth, BAR_H, BAR_R, centers[activeIndex], NOTCH_HW, NOTCH_DEPTH
  );

  return (
    <nav
      ref={containerRef}
      aria-label="Mobile Bottom Navigation"
      style={{ bottom: "max(12px, env(safe-area-inset-bottom, 12px))", height: `${BAR_H}px` }}
      className="fixed inset-x-3 sm:hidden z-40 max-w-[430px] mx-auto select-none"
    >
      {/* ── 1. Dynamic SVG bar with morphing concave notch ── */}
      <svg
        width="100%"
        height={BAR_H}
        viewBox={`0 0 ${navWidth} ${BAR_H}`}
        className="absolute inset-0 w-full overflow-visible"
        style={{ filter: "drop-shadow(0 8px 24px rgba(0,29,64,0.13))" }}
      >
        <path
          ref={pathRef}
          d={initialD}
          fill="#FFFFFF"
          stroke="#E8ECF2"
          strokeWidth="1"
        />
      </svg>

      {/* ── 2. Raised circular active indicator ── */}
      {/* Positioned so its center is CIRCLE_Y_OFFSET px relative to bar top */}
      <motion.div
        className="absolute z-20 pointer-events-none"
        style={{
          // x spring drives horizontal center
          // We offset by -CIRCLE_R so the div's left edge is correct
          x: springX,
          left: -CIRCLE_R,
          // Vertically: center at CIRCLE_Y_OFFSET from bar top
          top: CIRCLE_Y_OFFSET - CIRCLE_R,
          width: CIRCLE_D,
          height: CIRCLE_D,
        }}
      >
        {/* Outer ring (white border) */}
        <div
          className="w-full h-full rounded-full bg-[#001D40] flex items-center justify-center"
          style={{
            boxShadow: "0 6px 20px rgba(0,29,64,0.32), 0 0 0 3px #FFFFFF",
          }}
        >
          {/* Active icon with crossfade */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={activeIndex}
              initial={{ scale: 0.55, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.55, opacity: 0 }}
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

      {/* ── 3. Clickable icon buttons (all 5 items) ── */}
      <div
        className="absolute inset-0 z-10"
        style={{ height: BAR_H }}
      >
        {navItems.map((item, index) => {
          const isActive = activeIndex === index;
          const cx = centers[index];

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
              style={{
                position: "absolute",
                left: cx,
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 44,
                height: 44,
              }}
              aria-label={item.label}
              className="flex items-center justify-center cursor-pointer touch-manipulation focus:outline-none group"
            >
              {/* Inactive icon — fades when active, shows when inactive */}
              <span
                className="relative flex items-center justify-center transition-all duration-200"
                style={{
                  color: "#001D40",
                  opacity: isActive ? 0 : 0.72,
                  transform: isActive ? "scale(0.5)" : "scale(1)",
                  pointerEvents: isActive ? "none" : "auto",
                  transition: "opacity 200ms ease, transform 200ms ease",
                }}
              >
                {item.icon}

                {/* Bag badge when inactive */}
                {index === 3 && totalItems > 0 && !isActive && (
                  <span className="absolute -top-2 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-[#E02B2B] text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white shadow-sm leading-none">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
