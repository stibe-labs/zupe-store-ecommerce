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
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FFE600] pointer-events-auto"
        >
          {/* Centered Small Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [0.85, 1, 0.95],
              opacity: 1,
            }}
            transition={{
              duration: 1.2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center"
          >
            <Image
              src="/zupe-logo.png"
              alt="Zupe Store"
              width={160}
              height={160}
              priority
              className="object-contain drop-shadow-md"
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
