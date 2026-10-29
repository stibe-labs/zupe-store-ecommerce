"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function LoadingScreen() {
  const pathname = usePathname();

  // Excluded routes where splash screen is never shown
  const isExcludedRoute =
    pathname === "/signin" ||
    pathname === "/login" ||
    pathname === "/checkout" ||
    pathname?.startsWith("/checkout") ||
    pathname?.startsWith("/orders") ||
    pathname?.startsWith("/order-tracking") ||
    pathname?.startsWith("/admin");

  useEffect(() => {
    const splashEl = document.getElementById("initial-splash-screen");
    if (!splashEl) return;

    if (isExcludedRoute) {
      splashEl.classList.add("splash-hidden");
      document.documentElement.classList.add("splash-hidden");
      return;
    }

    try {
      const alreadyShown = sessionStorage.getItem("zp_splash_shown");
      if (alreadyShown) {
        splashEl.classList.add("splash-hidden");
        document.documentElement.classList.add("splash-hidden");
        return;
      }

      // Mark splash as shown for the current browser session
      sessionStorage.setItem("zp_splash_shown", "1");

      // Keep splash smoothly visible for 800ms, then trigger smooth CSS fade-out
      const fadeTimer = setTimeout(() => {
        splashEl.classList.add("splash-fade-out");

        const removeTimer = setTimeout(() => {
          splashEl.classList.add("splash-hidden");
          document.documentElement.classList.add("splash-hidden");
        }, 450);

        return () => clearTimeout(removeTimer);
      }, 800);

      return () => clearTimeout(fadeTimer);
    } catch {
      splashEl.classList.add("splash-hidden");
      document.documentElement.classList.add("splash-hidden");
    }
  }, [pathname, isExcludedRoute]);

  return null;
}
