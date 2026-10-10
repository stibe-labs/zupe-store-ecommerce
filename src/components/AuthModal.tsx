"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { AuthCard } from "@/components/AuthCard";

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    authModalNotice,
  } = useAuth();

  // Lock background scrolling when Auth modal is open
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");
      const originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.classList.remove("modal-open");
        document.documentElement.classList.remove("modal-open");
        document.body.style.overflow = originalBodyOverflow;
      };
    }
  }, [isAuthModalOpen]);

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            data-lenis-prevent
            className="relative w-full max-w-[460px] z-10 my-auto"
          >
            <AuthCard
              isModal={true}
              onClose={closeAuthModal}
              initialMode={authModalMode || "login"}
              notice={authModalNotice}
              showBadges={false}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
