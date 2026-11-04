"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Home, Store, Search, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from "@/context/SearchContext";

// ─── SVG Path Generator ───────────────────────────────────────────────────────
// Generates the floating nav bar with a deep concave notch that cradles the
// raised circular active indicator. Geometry precisely matches the reference video.
function getNavSvgPath(
  W: number,
  H: number,
  r: number,
  cx: number,
  notch_hw: number,
  depth: number
): string {
  // Ensure notch boundaries never collide with corner arcs
  const safeCx = Math.max(r + notch_hw, Math.min(W - r - notch_hw, cx));
  const x1 = safeCx - notch_hw;
  const x2 = safeCx + notch_hw;

  // Cubic Bézier control points for smooth tangent entry and trough
  const lp1x = safeCx - notch_hw * 0.45;
  const lp2x = safeCx - notch_hw * 0.35;
  const rp1x = safeCx + notch_hw * 0.35;
  const rp2x = safeCx + notch_hw * 0.45;

  return [
    `M ${r} 0`,
    `L ${x1.toFixed(2)} 0`,
    // Left concave scoop: horizontal entry at x1 → trough at safeCx, depth
    `C ${lp1x.toFixed(2)} 0, ${lp2x.toFixed(2)} ${depth}, ${safeCx.toFixed(2)} ${depth}`,
    // Right concave scoop: trough at safeCx, depth → horizontal exit at x2
    `C ${rp1x.toFixed(2)} ${depth}, ${rp2x.toFixed(2)} 0, ${x2.toFixed(2)} 0`,
    `L ${(W - r).toFixed(2)} 0`,
    // Top-right corner arc
    `A ${r} ${r} 0 0 1 ${W} ${r}`,
    `L ${W} ${(H - r).toFixed(2)}`,
    // Bottom-right corner arc
    `A ${r} ${r} 0 0 1 ${(W - r).toFixed(2)} ${H}`,
    `L ${r} ${H}`,
    // Bottom-left corner arc
    `A ${r} ${r} 0 0 1 0 ${(H - r).toFixed(2)}`,
    `L 0 ${r}`,
    // Top-left corner arc
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

  // ── Reference geometry constants ──────────────────────────────────────────
  const BAR_H = 64;       // px - bar height
  const BAR_R = 18;       // px - smooth corner radius
  const CIRCLE_D = 48;    // px - circular active indicator diameter
  const CIRCLE_R = CIRCLE_D / 2; // 24px
  const CIRCLE_CY = 0;    // px - center aligned with top edge of bar (rises 24px, dips 24px)
  const NOTCH_HW = 34;    // px - half-width of scoop
  const NOTCH_DEPTH = 28; // px - deep concave scoop (leaves ~4px clearance around circle)

  // ── Equal 5-slot item centers with safe flank padding ───────────────────────
  // pad = BAR_R + NOTCH_HW + 2 ensures notch never collides with corner arcs
  const pad = BAR_R + NOTCH_HW + 2; // 18 + 34 + 2 = 54px
  const step = (navWidth - 2 * pad) / 4;
  const centers = useMemo(
    () => [
      pad,
      pad + step,
      navWidth / 2,
      navWidth - pad - step,
      navWidth - pad,
    ],
    [navWidth, pad, step]
  );

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
        icon: <Store className="w-5 h-5" strokeWidth={1.9} />,
        action: () => router.push("/products"),
      },
      {
        label: "Search",
        icon: <Search className="w-5 h-5" strokeWidth={1.9} />,
        action: () => openSearch(),
      },
      {
        label: "Home",
        icon: <Home className="w-5 h-5" strokeWidth={2.2} />,
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
        icon: <ShoppingBag className="w-5 h-5" strokeWidth={1.9} />,
        action: () => openCart(),
      },
      {
        label: "Account",
        icon: <User className="w-5 h-5" strokeWidth={1.9} />,
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

  // ── Active index determination ──────────────────────────────────────────────
  const getActiveIndex = useCallback(() => {
    if (isSearchOpen) return 1; // Search
    if (isCartOpen) return 3;   // Bag
    if (pathname === "/") return 2; // Home (center)
    if (
      pathname?.startsWith("/products") ||
      pathname?.startsWith("/product") ||
      pathname?.startsWith("/category")
    ) {
      return 0; // Shop
    }
    if (
      pathname === "/account" ||
      pathname === "/signin" ||
      pathname === "/login"
    ) {
      return 4; // Account
    }
    return 2; // Default: Home (center)
  }, [pathname, isSearchOpen, isCartOpen]);

  const [activeIndex, setActiveIndex] = useState(() => getActiveIndex());

  // ── Spring-driven horizontal position ──────────────────────────────────────
  const motionX = useMotionValue(centers[activeIndex]);
  const springX = useSpring(motionX, {
    stiffness: 380,
    damping: 30,
    mass: 0.8,
  });

  // Animated SVG path value via useTransform (evaluated at 60fps)
  const pathD = useTransform(springX, (x) =>
    getNavSvgPath(navWidth, BAR_H, BAR_R, x, NOTCH_HW, NOTCH_DEPTH)
  );

  // Helper to directly update SVG path
  const updateSvgPath = useCallback(
    (cx: number, width: number) => {
      if (pathRef.current) {
        pathRef.current.setAttribute(
          "d",
          getNavSvgPath(width, BAR_H, BAR_R, cx, NOTCH_HW, NOTCH_DEPTH)
        );
      }
    },
    [BAR_H, BAR_R, NOTCH_HW, NOTCH_DEPTH]
  );

  // ── Sync active index with route/modal state ────────────────────────────────
  useEffect(() => {
    const idx = getActiveIndex();
    setActiveIndex(idx);
    motionX.set(centers[idx]);
  }, [getActiveIndex, centers, motionX]);

  // ── Drive SVG notch morphing synchronously with spring ─────────────────────
  useEffect(() => {
    updateSvgPath(springX.get(), navWidth);
    const unsub = springX.on("change", (x) => {
      updateSvgPath(x, navWidth);
    });
    return unsub;
  }, [springX, navWidth, updateSvgPath]);

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
      className="fixed inset-x-3 sm:hidden z-40 max-w-[430px] mx-auto select-none pointer-events-auto"
    >
      {/* ── 1. Dynamic SVG bar with morphing concave notch ── */}
      <svg
        width="100%"
        height={BAR_H}
        viewBox={`0 0 ${navWidth} ${BAR_H}`}
        className="absolute inset-0 w-full overflow-visible"
        style={{
          filter: "drop-shadow(0 10px 25px rgba(0, 29, 64, 0.12))",
        }}
      >
        <motion.path
          ref={pathRef}
          d={pathD}
          fill="#FFFFFF"
          stroke="#E8ECF2"
          strokeWidth="1"
        />
      </svg>

      {/* ── 2. Raised circular active indicator (cradled in the notch) ── */}
      <motion.div
        className="absolute z-20 pointer-events-none"
        style={{
          x: springX,
          left: -CIRCLE_R, // Centers the 48px bubble at cx
          top: CIRCLE_CY - CIRCLE_R, // top = 0 - 24 = -24px (rises 24px above bar)
          width: CIRCLE_D,
          height: CIRCLE_D,
        }}
      >
        {/* Navy Bubble with subtle transit hop and elevation shadow */}
        <motion.div
          key={activeIndex}
          initial={{ y: -6, scale: 0.94 }}
          animate={{ y: 0, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 450,
            damping: 24,
            mass: 0.7,
          }}
          className="w-full h-full rounded-full bg-[#001D40] flex items-center justify-center border-2 border-white"
          style={{
            boxShadow: "0 8px 20px rgba(0, 29, 64, 0.35)",
          }}
        >
          {/* Active white icon with smooth transition */}
          <motion.span
            key={`icon-${activeIndex}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="flex items-center justify-center text-white"
          >
            {navItems[activeIndex].icon}
          </motion.span>

          {/* Bag notification badge when active */}
          {activeIndex === 3 && totalItems > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E02B2B] text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-sm leading-none">
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
        </motion.div>
      </motion.div>

      {/* ── 3. Clickable icon buttons (all 5 items) ── */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
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
                width: 48,
                height: 48,
              }}
              aria-label={item.label}
              className="flex items-center justify-center cursor-pointer pointer-events-auto touch-manipulation focus:outline-none group"
            >
              {/* Inactive outline icon in Vittal Navy */}
              <span
                className="relative flex items-center justify-center text-[#001D40]/75 group-hover:text-[#001D40] group-active:scale-90 transition-all duration-200"
                style={{
                  opacity: isActive ? 0 : 1,
                  transform: isActive ? "scale(0.5)" : "scale(1)",
                  pointerEvents: isActive ? "none" : "auto",
                }}
              >
                {item.icon}

                {/* Bag badge when inactive */}
                {index === 3 && totalItems > 0 && !isActive && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#E02B2B] text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white shadow-sm leading-none">
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
