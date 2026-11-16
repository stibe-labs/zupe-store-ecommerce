/**
 * Meta (Facebook) Pixel Client Tracking Library
 * Pixel ID: 2452586698455782 (zupestorepixel1)
 */

export const META_PIXEL_ID = "2452586698455782";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

/**
 * Safely call fbq if available in browser
 */
export const fbq = (...args: any[]) => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    try {
      window.fbq(...args);
    } catch (err) {
      console.warn("Meta Pixel call error:", err);
    }
  }
};

/**
 * 1. Track PageView
 */
export const trackPageView = () => {
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
 * Triggered when checkout page opens
 */
export interface InitiateCheckoutParams {
  value: number;
  currency?: string;
  num_items: number;
  content_ids?: Array<string | number>;
}

export const trackInitiateCheckout = (params: InitiateCheckoutParams) => {
  fbq("track", "InitiateCheckout", {
    value: Number(params.value) || 0,
    currency: params.currency || "INR",
    num_items: Number(params.num_items) || 1,
    content_ids: (params.content_ids || []).map(String),
    content_type: "product",
  });
};

/**
 * 5. Track Purchase (Client-Side)
 * Triggered on Order Confirmation page once per order.
 * Deduped with sessionStorage to avoid re-firing on browser refreshes.
 */
export interface PurchaseParams {
  orderId: string;
  value: number;
  currency?: string;
  num_items: number;
  content_ids?: Array<string | number>;
}

export const trackPurchase = (params: PurchaseParams): boolean => {
  if (!params.orderId) return false;

  const storageKey = `meta_purchase_fired_${params.orderId}`;
  if (typeof window !== "undefined") {
    try {
      if (sessionStorage.getItem(storageKey)) {
        // Already fired for this order ID in this session - prevent duplicate on refresh!
        return false;
      }
      sessionStorage.setItem(storageKey, "true");
    } catch {
      // Local storage disabled or error
    }
  }

  fbq(
    "track",
    "Purchase",
    {
      value: Number(params.value) || 0,
      currency: params.currency || "INR",
      num_items: Number(params.num_items) || 1,
      content_ids: (params.content_ids || []).map(String),
      content_type: "product",
    },
    { eventID: String(params.orderId) } // Matches server event_id for Meta CAPI deduplication!
  );

  return true;
};

