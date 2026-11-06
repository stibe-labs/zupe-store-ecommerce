"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

export function getStoredMetaAttribution() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("tj_meta_attribution");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Global helper to trigger unified Browser Pixel + Server CAPI event
export async function trackMetaPixelEvent(
  eventName: "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase",
  customData: Record<string, any> = {},
  userData: Record<string, any> = {}
) {
  if (typeof window === "undefined") return;

  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Fire Browser Meta Pixel
  if (window.fbq) {
    try {
      window.fbq("track", eventName, customData, { eventID: eventId });
    } catch (e) {
      console.warn("Browser Meta Pixel tracking warning:", e);
    }
  }

  // 2. Dispatch Server-Side CAPI with deduplication eventId
  try {
    fetch("/api/meta/capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        eventId,
        eventSourceUrl: window.location.href,
        userData,
        customData,
      }),
    }).catch(() => {});
  } catch {}
}

export function MetaPixelTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  useEffect(() => {
    // 1. Fetch Pixel configuration dynamically
    const initPixel = async () => {
      try {
        const res = await fetch("/api/content/meta-pixel-config");
        const data = await res.json();
        const pixelId = data?.pixelId || "";

        if (!pixelId || (!data?.isActive && data?.isActive !== undefined)) return;

        if (typeof window !== "undefined" && !window.fbq) {
          /* eslint-disable */
          (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
            if (f.fbq) return;
            n = f.fbq = function () {
              n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
            };
            if (!f._fbq) f._fbq = n;
            n.push = n;
            n.loaded = !0;
            n.version = "2.0";
            n.queue = [];
            t = b.createElement(e);
            t.async = !0;
            t.src = v;
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
          })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
          /* eslint-enable */

          window.fbq("init", pixelId);
          initialized.current = true;
          window.fbq("track", "PageView");
        }
      } catch (err) {
        console.warn("Meta Pixel init failed:", err);
      }
    };

    if (!initialized.current) {
      initPixel();
    }
  }, []);

  // Track PageView on route navigation
  useEffect(() => {
    if (initialized.current && window.fbq) {
      window.fbq("track", "PageView");
    }

    // Capture Meta Ad Attribution from URL
    if (searchParams) {
      const fbclid = searchParams.get("fbclid");
      const utmSource = searchParams.get("utm_source")?.toLowerCase();
      const utmCampaign = searchParams.get("utm_campaign");
      const utmMedium = searchParams.get("utm_medium");
      const utmContent = searchParams.get("utm_content");

      const isMetaTraffic =
        Boolean(fbclid) ||
        utmSource === "facebook" ||
        utmSource === "instagram" ||
        utmSource === "meta" ||
        utmSource === "ig" ||
        utmSource === "fb";

      if (isMetaTraffic) {
        try {
          localStorage.setItem(
            "tj_meta_attribution",
            JSON.stringify({
              fbclid: fbclid || undefined,
              utm_source: utmSource || (fbclid ? "meta_ads" : "facebook"),
              utm_campaign: utmCampaign || undefined,
              utm_medium: utmMedium || undefined,
              utm_content: utmContent || undefined,
              timestamp: new Date().toISOString(),
            })
          );
        } catch {}
      }
    }
  }, [pathname, searchParams]);

  return null;
}

