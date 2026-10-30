"use client";

import { useEffect } from "react";

/**
 * Background auto-checker for overdue 1-hour abandoned carts.
 * Periodically pings the cron endpoint to ensure overdue recovery messages
 * (for carts unpurchased for >= 1 hour) are dispatched automatically.
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

    // Run once 15 seconds after initial load, then every 2 minutes
    const initialTimer = setTimeout(checkOverdueCarts, 15000);
    const interval = setInterval(checkOverdueCarts, 120000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  return null;
}
