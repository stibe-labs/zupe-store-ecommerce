"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen() {
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        if (sessionStorage.getItem("zp_splash_shown")) {
          return false;
        }
      } catch (e) {}
    }
    return true;
  });

  useEffect(() => {
    if (!loading) return;
    try {
      sessionStorage.setItem("zp_splash_shown", "1");
    } catch (e) {}

    const timer = setTimeout(() => {
      setLoading(false);
    }, 900);

    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--zp-white,#FFFFFF)] pointer-events-auto"
        >
          {/* Centered Logo only */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{
              scale: [0.92, 1, 0.95],
              opacity: 1,
            }}
            transition={{
              duration: 1.2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center select-none"
          >
            <Image
              src="/zupe-logo.webp"
              alt="Zupe Store"
              width={112}
              height={112}
              priority
              className="object-contain w-full h-full drop-shadow-md"
            />
          </motion.div>

          {/* Minimalist Loading Dots */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 mt-4"
          >
            <span className="w-2 h-2 rounded-full bg-black/80 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-black/80 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-black/80 animate-bounce" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
