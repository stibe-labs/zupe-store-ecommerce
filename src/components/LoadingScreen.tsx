"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function LoadingScreen() {
  const pathname = usePathname();

  // Excluded routes where splash screen is never shown
  const isExcludedRoute =
    pathname === "/signin" ||
    pathname === "/login" ||
    pathname?.startsWith("/brand") ||
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

      // Respect prefers-reduced-motion: dismiss immediately without artificial delay
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

      if (prefersReducedMotion) {
        splashEl.classList.add("splash-hidden");
        document.documentElement.classList.add("splash-hidden");
        return;
      }

      // Let the full Logo #80 choreography (handle -> bag -> V-check -> gold sparkle -> wordmark) land smoothly
      let removeTimer: ReturnType<typeof setTimeout> | undefined;
      const fadeTimer = setTimeout(() => {
        splashEl.classList.add("splash-fade-out");

        removeTimer = setTimeout(() => {
          splashEl.classList.add("splash-hidden");
          document.documentElement.classList.add("splash-hidden");
        }, 420);
      }, 1050);

      return () => {
        clearTimeout(fadeTimer);
        if (removeTimer) clearTimeout(removeTimer);
      };
    } catch {
      splashEl.classList.add("splash-hidden");
      document.documentElement.classList.add("splash-hidden");
    }
  }, [pathname, isExcludedRoute]);

  return null;
}
