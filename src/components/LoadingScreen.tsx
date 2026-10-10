"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show splash for 1.4 seconds on initial load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FFC107] pointer-events-auto"
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
              src="/zupe-logo.png"
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
