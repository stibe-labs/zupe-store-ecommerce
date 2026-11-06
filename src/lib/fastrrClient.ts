"use client";

/**
 * Native Checkout Router
 */
export async function launchFastrrCheckout(items?: any[]): Promise<boolean> {
  if (typeof window !== "undefined") {
    window.location.href = "/checkout";
  }
  return false;
}
