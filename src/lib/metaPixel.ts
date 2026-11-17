/**
 * Meta (Facebook) Pixel Client Tracking Library
 * Pixel ID: 2452586698455782 (zupestorepixel1)
 *
 * Rules:
 * 1. Strict Domain Isolation: NEVER run on admin.zupestore.in, *.workers.dev, or /admin routes.
 * 2. Deduplication: Purchase event uses eventID for Meta CAPI and sessionStorage to prevent repeat on page refresh.
 * 3. Safe Queueing: If script is downloading, events queue cleanly without error.
 */

export const META_PIXEL_ID = "2452586698455782";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

/**
 * Determine if Meta Pixel tracking is permitted in the current runtime context.
 * Blocks:
 * - admin.zupestore.in & admin subdomains
 * - zupe-store.stibelabs.workers.dev & any Cloudflare preview (*.workers.dev)
 * - /admin/* paths
 */
export function isPixelTrackingAllowed(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const host = (window.location.hostname || "").toLowerCase();
    const path = (window.location.pathname || "").toLowerCase();

    // 1. Exclude admin.zupestore.in and any admin subdomain
    if (host === "admin.zupestore.in" || host.startsWith("admin.")) {
      return false;
    }

    // 2. Exclude Cloudflare Workers test sites (*.workers.dev)
    if (host.includes("workers.dev")) {
      return false;
    }

    // 3. Exclude admin routes (/admin, /admin/...)
    if (path === "/admin" || path.startsWith("/admin/")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Safely call fbq if tracking is allowed, with fallback queue initialization
 */
export const fbq = (...args: any[]) => {
  if (!isPixelTrackingAllowed()) return;
  if (typeof window === "undefined") return;

  try {
    if (typeof window.fbq === "function") {
      window.fbq(...args);
    } else {
      // Initialize fallback queue if fbevents.js is still hydrating
      const n: any = function (...queueArgs: any[]) {
        if (n.callMethod) {
          n.callMethod.apply(n, queueArgs);
        } else {
          n.queue.push(queueArgs);
        }
      };
      if (!window._fbq) window._fbq = n;
      n.push = n;
      n.loaded = false;
      n.version = "2.0";
      n.queue = [];
      window.fbq = n;
      window.fbq(...args);
    }
  } catch (err) {
    console.warn("[Meta Pixel] fbq dispatch error:", err);
  }
};

/**
 * 1. Track PageView
 */
export const trackPageView = () => {
  if (!isPixelTrackingAllowed()) return;
  fbq("track", "PageView");
};

/**
 * 2. Track ViewContent
 * Triggered when a product page opens
 */
export interface ViewContentParams {
  id: string | number;
  name?: string;
  price: number;
  currency?: string;
}

export const trackViewContent = (params: ViewContentParams) => {
  if (!isPixelTrackingAllowed()) return;
  if (!params.id) return;

  fbq("track", "ViewContent", {
    content_ids: [String(params.id)],
    content_name: params.name || "",
    content_type: "product",
    value: Number(params.price) || 0,
    currency: params.currency || "INR",
  });
};

/**
 * 3. Track AddToCart
 * Triggered when customer clicks Add to Cart
 */
export interface AddToCartParams {
  id: string | number;
  name?: string;
  price: number;
  quantity: number;
  currency?: string;
}

export const trackAddToCart = (params: AddToCartParams) => {
  if (!isPixelTrackingAllowed()) return;
  if (!params.id) return;

  const qty = Math.max(1, Number(params.quantity) || 1);
  const unitPrice = Number(params.price) || 0;
  fbq("track", "AddToCart", {
    content_ids: [String(params.id)],
    content_name: params.name || "",
    content_type: "product",
    value: unitPrice * qty,
    currency: params.currency || "INR",
    quantity: qty,
  });
};

/**
 * 4. Track InitiateCheckout
 * Triggered every time checkout is opened with cart items
 */
export interface InitiateCheckoutParams {
  value: number;
  currency?: string;
  num_items: number;
  content_ids?: Array<string | number>;
}

export const trackInitiateCheckout = (params: InitiateCheckoutParams) => {
  if (!isPixelTrackingAllowed()) return;

  const rawIds = params.content_ids && params.content_ids.length > 0 ? params.content_ids : ["zupe_product"];
  const contentIds = rawIds.map(String).filter(Boolean);

  fbq("track", "InitiateCheckout", {
    value: Number(params.value) || 0,
    currency: params.currency || "INR",
    num_items: Number(params.num_items) || 1,
    content_ids: contentIds,
    content_type: "product",
  });
};

/**
 * 5. Track Purchase (Client-Side)
 * Triggered for BOTH COD and Razorpay Prepaid orders.
 * Guaranteed to fire once per orderID (deduped via sessionStorage across page refreshes).
 */
export interface PurchaseParams {
  orderId: string;
  value: number;
  currency?: string;
  num_items?: number;
  content_ids?: Array<string | number>;
}

export const trackPurchase = (params: PurchaseParams): boolean => {
  if (!isPixelTrackingAllowed()) return false;
  if (!params.orderId) return false;

  const orderValue = Number(params.value) || 0;
  if (orderValue <= 0) {
    console.warn("[Meta Pixel] Skipping Purchase track: value is 0 or invalid", params);
    return false;
  }

  const storageKey = `meta_purchase_fired_${params.orderId}`;
  if (typeof window !== "undefined") {
    try {
      if (sessionStorage.getItem(storageKey)) {
        // Already fired for this order in this session - prevent duplicate on refresh!
        return false;
      }
      sessionStorage.setItem(storageKey, "true");
    } catch {
      // Local storage disabled or error
    }
  }

  const rawIds = params.content_ids && params.content_ids.length > 0 ? params.content_ids : ["zupe_product"];
  const contentIds = rawIds.map(String).filter(Boolean);

  fbq(
    "track",
    "Purchase",
    {
      value: orderValue,
      currency: params.currency || "INR",
      num_items: Number(params.num_items) || 1,
      content_ids: contentIds,
      content_type: "product",
    },
    { eventID: String(params.orderId) } // Matches server event_id for Meta CAPI deduplication!
  );

  console.log(`[Meta Pixel] Purchase event tracked for Order #${params.orderId}: ₹${orderValue}`);
  return true;
};
