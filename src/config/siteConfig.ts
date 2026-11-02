/**
 * Unified Site & White-Label Configuration System
 * 
 * Centralized settings for Domain, Branding, Contact Info, Order IDs, and Warehouse.
 * All values can be customized either here directly or overridden via environment variables
 * (.env.local / Cloudflare Workers environment variables) for instant white-labeling,
 * rebranding, domain migration, or multi-tenant deployment.
 */

const rawUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.STORE_BASE_URL ||
  "https://turkiyejam.com";

const cleanUrl = rawUrl.replace(/\/+$/, "");

export interface SiteConfig {
  // Domain & Base URLs
  url: string;
  domain: string;

  // Brand & Identity
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  legalName: string;
  orderPrefix: string; // e.g. "TJ" for #TJ-1001

  // Visual Assets
  logoUrl: string;
  logoPng: string;
  faviconUrl: string;

  // Contact & Support
  supportEmail: string;
  supportPhone: string;
  whatsappNumber: string; // Country code + digits, e.g. "916238165935"

  // Warehouse & Fulfillment (for Shiprocket, Invoices, and Tracking milestones)
  fulfillmentCenter: string;
  dispatchBay: string;
  shiprocketPickupLocation: string;

  // URL Helper Methods
  getAbsoluteUrl: (path: string) => string;
  getTrackOrderUrl: (query: string) => string;
  getRecoveryUrl: (recoveryToken: string) => string;
  getWhatsAppConfirmUrl: (token: string, orderId: string) => string;
  getWhatsAppCancelUrl: (token: string, orderId: string) => string;
}

export const siteConfig: SiteConfig = {
  url: cleanUrl,
  domain: cleanUrl.replace(/^https?:\/\//, ""),

  name: process.env.NEXT_PUBLIC_SITE_NAME || "Turkiye Jam",
  shortName: process.env.NEXT_PUBLIC_SITE_SHORT_NAME || "Turkiye Jam",
  tagline:
    process.env.NEXT_PUBLIC_SITE_TAGLINE ||
    "100% Authentic Turkish Epimedium Herbal Macun",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "Experience 100% original Themra Epimedium Turkish Herbal Macun. Express 1–2 day discreet delivery with unused strip refund guarantee.",
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME || "Turkiye Jam India",
  orderPrefix: process.env.NEXT_PUBLIC_ORDER_PREFIX || "TJ",

  logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || "/turkiye-jam-logo.svg",
  logoPng: process.env.NEXT_PUBLIC_LOGO_PNG || "/turkiye-jam-logo.png",
  faviconUrl: process.env.NEXT_PUBLIC_FAVICON_URL || "/favicon.png",

  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@turkiyejam.com",
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+91 73567 65036",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "916238165935",

  fulfillmentCenter:
    process.env.NEXT_PUBLIC_FULFILLMENT_CENTER ||
    "Turkiye Jam Fulfillment Center, Ernakulam",
  dispatchBay:
    process.env.NEXT_PUBLIC_DISPATCH_BAY ||
    "Ernakulam Logistics Dispatch Bay",
  shiprocketPickupLocation:
    process.env.SHIPROCKET_PICKUP_LOCATION || "work",

  getAbsoluteUrl(path: string) {
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${cleanUrl}${p}`;
  },

  getTrackOrderUrl(query: string) {
    const cleanQuery = (query || "").replace(/^#/, "").trim();
    return `${cleanUrl}/order-tracking?query=${encodeURIComponent(cleanQuery)}`;
  },

  getRecoveryUrl(recoveryToken: string) {
    return `${cleanUrl}/checkout?recover=${encodeURIComponent(recoveryToken)}`;
  },

  getWhatsAppConfirmUrl(token: string, orderId: string) {
    return `${cleanUrl}/api/orders/whatsapp-confirm?token=${encodeURIComponent(token)}&orderId=${encodeURIComponent(orderId)}`;
  },

  getWhatsAppCancelUrl(token: string, orderId: string) {
    return `${cleanUrl}/api/orders/whatsapp-cancel?token=${encodeURIComponent(token)}&orderId=${encodeURIComponent(orderId)}`;
  },
};

export default siteConfig;

