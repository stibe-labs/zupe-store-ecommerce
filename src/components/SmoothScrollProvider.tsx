"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis | null;
  }
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Disable Lenis smooth scroll on admin dashboard routes
    if (pathname?.startsWith("/admin")) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        window.__lenis = null;
      }
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove("lenis");
        document.body.classList.remove("lenis");
      }
      return;
    }

    const isTouch = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    const lenis = new Lenis({
      duration: isTouch ? 0.75 : 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: isTouch ? 1.2 : 1.5,
      infinite: false,
      prevent: (node: HTMLElement) => {
        return Boolean(
          node.hasAttribute("data-lenis-prevent") ||
          node.closest?.("[data-lenis-prevent]") ||
          node.closest?.('[role="dialog"]') ||
          node.closest?.(".fixed.inset-0")
        );
      },
    });

    lenisRef.current = lenis;
    window.__lenis = lenis;

    // Scroll to hash target on initial load or navigation
    const scrollToHashTarget = () => {
      if (typeof window !== "undefined" && window.location.hash) {
        try {
          const target = document.querySelector(window.location.hash);
          if (target) {
            lenis.scrollTo(target as HTMLElement, {
              offset: -75,
              duration: 1.0,
              easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            });
            return true;
          }
        } catch (_) {}
      }
      return false;
    };

    let timer1: NodeJS.Timeout | null = null;
    let timer2: NodeJS.Timeout | null = null;
    if (typeof window !== "undefined" && window.location.hash) {
      if (!scrollToHashTarget()) {
        timer1 = setTimeout(scrollToHashTarget, 200);
        timer2 = setTimeout(scrollToHashTarget, 600);
      }
    }

    const handleHashChange = () => {
      scrollToHashTarget();
    };
    window.addEventListener("hashchange", handleHashChange);

    // Intercept in-page anchor links for buttery-smooth scrolling
    const handleAnchorClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement)?.closest?.("a");
      if (!link) return;
      const href = link.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        const targetElement = document.querySelector(href);
        if (targetElement) {
          e.preventDefault();
          lenis.scrollTo(targetElement as HTMLElement, {
            offset: -75,
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);

    // Monitor for modal openings to freeze window scroll completely
    const checkModalState = () => {
      const isLocked =
        document.body.style.overflow === "hidden" ||
        document.documentElement.style.overflow === "hidden" ||
        document.body.classList.contains("modal-open");

      if (isLocked) {
        lenis.stop();
      } else {
        lenis.start();
      }
    };

    const observer = new MutationObserver(checkModalState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      window.removeEventListener("hashchange", handleHashChange);
      if (timer1) clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
      cancelAnimationFrame(rafId);
      observer.disconnect();
      lenis.destroy();
      lenisRef.current = null;
      window.__lenis = null;
    };
  }, [pathname]);

  return <>{children}</>;
}
