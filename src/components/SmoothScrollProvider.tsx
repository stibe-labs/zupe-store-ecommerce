"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Disable Lenis smooth scroll on admin dashboard routes so all modals, tables, and sidebars scroll natively without interception
    if (pathname?.startsWith("/admin")) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove("lenis");
        document.body.classList.remove("lenis");
      }
      return;
    }

    const isTouch = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    const lenis = new Lenis({
      duration: isTouch ? 0.6 : 0.85,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: isTouch ? 1 : 1.5,
      prevent: (node: HTMLElement) => {
        // Prevent Lenis from intercepting scroll whenever node or any ancestor is inside a modal or has data-lenis-prevent
        return Boolean(
          node.hasAttribute("data-lenis-prevent") ||
          node.closest?.("[data-lenis-prevent]") ||
          node.closest?.('[role="dialog"]') ||
          node.closest?.(".fixed.inset-0")
        );
      },
    });

    lenisRef.current = lenis;

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

    // Only observe body attributes (classes & styles) without choking the main thread with childList & subtree
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
      cancelAnimationFrame(rafId);
      observer.disconnect();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [pathname]);

  return <>{children}</>;
}
