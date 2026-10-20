"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen() {
  const pathname = usePathname();

  // Never block checkout, order, auth, or admin pages with a splash screen
  const isExcludedRoute =
    pathname === "/signin" ||
    pathname === "/login" ||
    pathname === "/checkout" ||
    pathname?.startsWith("/checkout") ||
    pathname?.startsWith("/orders") ||
    pathname?.startsWith("/order-tracking") ||
    pathname?.startsWith("/admin");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isExcludedRoute) {
      setLoading(false);
      return;
    }

    try {
      if (!sessionStorage.getItem("zp_splash_shown")) {
        sessionStorage.setItem("zp_splash_shown", "1");
        setLoading(true);

        const timer = setTimeout(() => {
          setLoading(false);
        }, 700);

        return () => clearTimeout(timer);
      }
    } catch (e) {
      setLoading(false);
    }
  }, [pathname, isExcludedRoute]);

  if (isExcludedRoute || !loading) return null;

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: "easeInOut" } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white pointer-events-auto"
        >
          {/* Centered Logo */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center select-none animate-pulse">
            <Image
              src="/zupe-logo.webp"
              alt="Zupe Store"
              width={112}
              height={112}
              priority
              className="object-contain w-full h-full drop-shadow-md"
            />
          </div>

          {/* Minimalist Loading Dots */}
          <div className="flex items-center gap-2 mt-4">
            <span className="w-2 h-2 rounded-full bg-black/80 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-black/80 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-black/80 animate-bounce" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
