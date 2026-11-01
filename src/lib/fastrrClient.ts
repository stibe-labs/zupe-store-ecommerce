"use client";

/**
 * Triggers Shiprocket Fastrr Smart 1-Click Checkout modal
 */
export async function launchFastrrCheckout(items: any[]): Promise<boolean> {
  try {
    const res = await fetch("/api/shiprocket/checkout-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((it) => ({
          id: it.id,
          name: it.name || it.title,
          price: it.price,
          quantity: it.quantity || 1,
          poster_image: it.poster_image || it.image,
        })),
        redirectUrl: `${window.location.origin}/order-tracking`,
      }),
    });

    const data = await res.json();
    if (!data.success || !data.token) {
      console.warn("[Fastrr Checkout] Token failed, falling back to standard checkout:", data);
      window.location.href = "/checkout";
      return false;
    }

    if (typeof window !== "undefined" && (window as any).HeadlessCheckout) {
      const mockEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
      (window as any).HeadlessCheckout.addToCart(mockEvent, data.token, {
        fallbackUrl: `${window.location.origin}/checkout`,
        isInitiatedFromApp: false,
      });
      return true;
    } else {
      window.location.href = "/checkout";
      return false;
    }
  } catch (err) {
    console.error("[Fastrr Checkout] Exception:", err);
    window.location.href = "/checkout";
    return false;
  }
}

