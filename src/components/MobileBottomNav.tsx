"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
  Home,
  Store,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from "@/context/SearchContext";

/**
 * Generates the SVG path for the floating bottom navigation bar with a
 * dynamically morphing concave notch around the active circular indicator.
 */
function getNavSvgPath(
  W: number,
  H: number = 62,
  r: number = 22,
  cx: number,
  notch_w: number = 36,
  depth: number = 30
): string {
  // Clamp cx safely within bounds
  const safeCx = Math.max(r, Math.min(W - r, cx));
  const x_notch_left = Math.max(r, safeCx - notch_w);
  const x_notch_right = Math.min(W - r, safeCx + notch_w);

  const cp1_x = Math.max(r, safeCx - 18);
  const cp2_x = safeCx - 14;
  const cp3_x = safeCx + 14;
  const cp4_x = Math.min(W - r, safeCx + 18);

  return [
    `M ${r} 0`,
    `L ${x_notch_left.toFixed(2)} 0`,
    `C ${cp1_x.toFixed(2)} 0, ${cp2_x.toFixed(2)} ${depth}, ${safeCx.toFixed(2)} ${depth}`,
    `C ${cp3_x.toFixed(2)} ${depth}, ${cp4_x.toFixed(2)} 0, ${x_notch_right.toFixed(2)} 0`,
    `L ${(W - r).toFixed(2)} 0`,
    `A ${r} ${r} 0 0 1 ${W} ${r}`,
    `L ${W} ${(H - r).toFixed(2)}`,
    `A ${r} ${r} 0 0 1 ${(W - r).toFixed(2)} ${H}`,
    `L ${r} ${H}`,
    `A ${r} ${r} 0 0 1 0 ${(H - r).toFixed(2)}`,
    `L 0 ${r}`,
    `A ${r} ${r} 0 0 1 ${r} 0`,
    "Z",
  ].join(" ");
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, openCart, isOpen: isCartOpen } = useCart();
  const { isAuthenticated } = useAuth();
  const { isSearchOpen, openSearch } = useSearch();

  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [navWidth, setNavWidth] = useState(380);

  // Measure container width responsively
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w > 0) {
          setNavWidth(w);
        }
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Equal 5-item distribution centers
  const pad = Math.round(navWidth * 0.12);
  const step = (navWidth - 2 * pad) / 4;
  const centers = useMemo(
    () => [pad, pad + step, pad + 2 * step, pad + 3 * step, pad + 4 * step],
    [navWidth, pad, step]
  );

  // Determine active index
  const getRouteIndex = () => {
    if (isSearchOpen) return 2;
    if (isCartOpen) return 3;
    if (pathname === "/") return 0;
    if (pathname?.startsWith("/products")) return 1;
    if (
      pathname === "/account" ||
      pathname === "/signin" ||
      pathname === "/login"
    ) {
      return 4;
    }
    return 0; // Default Home
  };

  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Spring animation values
  const motionX = useMotionValue(centers[0]);
  const springX = useSpring(motionX, {
    stiffness: 340,
    damping: 26,
    mass: 0.8,
  });

  // Keep spring and path synced to route changes
  useEffect(() => {
    const targetIdx = getRouteIndex();
    setActiveIndex(targetIdx);
    motionX.set(centers[targetIdx]);
  }, [pathname, isSearchOpen, isCartOpen, centers]);

  // Synchronously drive the SVG dynamic curved notch via Framer Motion spring
  useEffect(() => {
    const unsubscribe = springX.on("change", (latestX) => {
      if (pathRef.current) {
        pathRef.current.setAttribute("d", getNavSvgPath(navWidth, 62, 22, latestX));
      }
    });
    return () => unsubscribe();
  }, [springX, navWidth]);

  // Navigation Items
  const navItems = [
    {
      label: "Home",
      href: "/",
      inactiveIcon: <Home className="w-5 h-5 stroke-[1.9]" />,
      activeIcon: <Home className="w-5 h-5 stroke-[2.2]" />,
      action: () => {
        if (pathname === "/" && !isSearchOpen && !isCartOpen) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          router.push("/");
        }
      },
    },
    {
      label: "Shop",
      href: "/products",
      inactiveIcon: <Store className="w-5 h-5 stroke-[1.9]" />,
      activeIcon: <Store className="w-5 h-5 stroke-[2.2]" />,
      action: () => {
        router.push("/products");
      },
    },
    {
      label: "Search",
      inactiveIcon: <Search className="w-5 h-5 stroke-[1.9]" />,
      activeIcon: <Search className="w-5 h-5 stroke-[2.2]" />,
      action: () => {
        openSearch();
      },
    },
    {
      label: "Bag",
      inactiveIcon: <ShoppingBag className="w-5 h-5 stroke-[1.9]" />,
      activeIcon: <ShoppingBag className="w-5 h-5 stroke-[2.2]" />,
      action: () => {
        openCart();
      },
    },
    {
      label: "Account",
      href: "/account",
      inactiveIcon: <User className="w-5 h-5 stroke-[1.9]" />,
      activeIcon: <User className="w-5 h-5 stroke-[2.2]" />,
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
  ];

  const handleItemClick = (index: number) => {
    if (index === activeIndex) {
      if (index === 0 && pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    setActiveIndex(index);
    motionX.set(centers[index]);
    navItems[index].action();
  };

  // Hide on admin dashboard and checkout flows
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/checkout")
  ) {
    return null;
  }

  const initialD = getNavSvgPath(navWidth, 62, 22, centers[activeIndex]);

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      ref={containerRef}
      style={{
        bottom: "max(12px, env(safe-area-inset-bottom, 12px))",
      }}
      className="fixed inset-x-3 sm:hidden z-40 max-w-[420px] mx-auto select-none pointer-events-auto h-[62px]"
    >
      {/* 1. Dynamic SVG Background with Morphing Curved Notch */}
      <svg
        width="100%"
        height="62"
        viewBox={`0 0 ${navWidth} 62`}
        className="w-full h-full overflow-visible"
        style={{
          filter: "drop-shadow(0 10px 25px rgba(0, 29, 64, 0.12))",
        }}
      >
        <path
          ref={pathRef}
          d={initialD}
          fill="#FFFFFF"
          stroke="#F1F5F9"
          strokeWidth="1"
        />
      </svg>

      {/* 2. Floating Circular Active Indicator (Rises above the curved notch) */}
      <motion.div
        style={{
          x: springX,
          left: -24, // Centers the 48px bubble at cx
        }}
        className="absolute -top-3 z-20 w-12 h-12 rounded-full bg-[#001D40] text-white flex items-center justify-center shadow-[0_8px_18px_rgba(0,29,64,0.35)] border-[3px] border-white pointer-events-none"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeIndex}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="flex items-center justify-center text-white"
          >
            {navItems[activeIndex].activeIcon}
          </motion.div>
        </AnimatePresence>

        {/* Active Bag Notification Badge */}
        {activeIndex === 3 && totalItems > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E02B2B] text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-sm">
            {totalItems}
          </span>
        )}
      </motion.div>

      {/* 3. Inactive Outline Navigation Icons */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {navItems.map((item, index) => {
          const isActive = activeIndex === index;
          const cx = centers[index];

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => handleItemClick(index)}
              style={{
                left: cx,
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
              aria-label={item.label}
              className="absolute w-12 h-12 flex items-center justify-center cursor-pointer pointer-events-auto group touch-manipulation focus:outline-none"
            >
              {/* Inactive Icon: Fades out cleanly when active */}
              <span
                className={`transition-all duration-200 flex items-center justify-center text-[#001D40]/75 group-hover:text-[#001D40] group-active:scale-90 ${
                  isActive
                    ? "opacity-0 scale-50 pointer-events-none"
                    : "opacity-100 scale-100"
                }`}
              >
                {item.inactiveIcon}

                {/* Inactive Bag Badge */}
                {index === 3 && totalItems > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#E02B2B] text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white shadow-xs">
                    {totalItems}
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
