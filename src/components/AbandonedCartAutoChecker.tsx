"use client";

import { useEffect } from "react";

/**
 * Background auto-checker for abandoned carts and checkouts:
 * 1. Cart additions: 1 hour overdue
 * 2. Checkout exits/backouts: 5 minutes overdue
 * Periodically pings the cron endpoint to ensure overdue recovery messages
 * are dispatched automatically without manual intervention.
 */
export function AbandonedCartAutoChecker() {
  useEffect(() => {
    const checkOverdueCarts = async () => {
      try {
        if (typeof document !== "undefined" && document.visibilityState === "visible") {
          await fetch("/api/cron/abandoned-checkouts", {
            method: "GET",
            cache: "no-store",
          });
        }
      } catch {}
    };

    // Run once 10 seconds after initial load, then every 60 seconds (1 minute)
    const initialTimer = setTimeout(checkOverdueCarts, 10000);
    const interval = setInterval(checkOverdueCarts, 60000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  return null;
}
