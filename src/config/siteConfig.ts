/**
 * Unified Site & White-Label Configuration System
 * 
 * Centralized settings for Domain, Branding, Contact Info, Order IDs, and Warehouse.
 * All values can be customized either here directly or overridden via environment variables
 * (.env.local / Cloudflare Workers environment variables) for instant white-labeling,
 * rebranding, domain migration, or multi-tenant deployment.
 */

let rawUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.STORE_BASE_URL ||
  "https://vittallifestyle.com";

if (rawUrl.includes("workers.dev") || !rawUrl.startsWith("http")) {
  rawUrl = "https://vittallifestyle.com";
}

const cleanUrl = rawUrl.replace(/\/+$/, "");

export interface SiteConfig {
  // Domain & Base URLs
  url: string;
  domain: string;

  // Brand & Identity
  slug: string; // e.g. "vittallifestyle" (used for csv filenames, cache keys, identifiers)
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  legalName: string;
  orderPrefix: string; // e.g. "VL" for #VL-1001

  // Visual Assets
  logoUrl: string;
  logoPng: string;
  faviconUrl: string;

  // Contact & Support
  supportEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  whatsappWebhookVerifyToken: string;

  // Customer synthetic email domain (for phone-only customers)
  customerEmailDomain: string;

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

  // Email & Identifier Helpers for White-Labeling
  isSyntheticEmail: (email?: string | null) => boolean;
  generateSyntheticEmail: (identifier: string) => string;
}

const domainHost = cleanUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
const siteSlug = process.env.NEXT_PUBLIC_SITE_SLUG || "vittallifestyle";
const customerDomain = process.env.CUSTOMER_EMAIL_DOMAIN || `customer.${domainHost}`;

export const siteConfig: SiteConfig = {
  url: cleanUrl,
  domain: domainHost,
  slug: siteSlug,

  name: process.env.NEXT_PUBLIC_SITE_NAME || "Vittal Lifestyle",
  shortName: process.env.NEXT_PUBLIC_SITE_SHORT_NAME || "Vittal Lifestyle",
  tagline:
    process.env.NEXT_PUBLIC_SITE_TAGLINE ||
    "Curated Gym Supplements, Outfits, Dates & Nuts, and Chocolates.",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "Explore premium fitness nutrition, stylish outfits & apparels, hand-picked dates & nuts, and artisanal chocolates.",
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME || "Vittal Lifestyle India",
  orderPrefix: process.env.NEXT_PUBLIC_ORDER_PREFIX || "VL",

  logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || "/vl-logo-nobg.png",
  logoPng: process.env.NEXT_PUBLIC_LOGO_PNG || "/vl-logo-nobg.png",
  faviconUrl: process.env.NEXT_PUBLIC_FAVICON_URL || "/favicon.ico",

  supportEmail:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@vittallifestyle.com",
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  whatsappWebhookVerifyToken:
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || `${siteSlug}_wa_secret_2026`,

  customerEmailDomain: customerDomain,

  fulfillmentCenter:
    process.env.NEXT_PUBLIC_FULFILLMENT_CENTER ||
    `${process.env.NEXT_PUBLIC_SITE_NAME || "Vittal Lifestyle"} Fulfillment Center`,
  dispatchBay:
    process.env.NEXT_PUBLIC_DISPATCH_BAY ||
    "Logistics Dispatch Bay",
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

  isSyntheticEmail(email?: string | null): boolean {
    if (!email || !email.includes("@")) return true;
    const clean = email.trim().toLowerCase();
    return (
      clean.includes("@customer.") ||
      clean.endsWith(".local") ||
      clean.endsWith(`@customer.${domainHost}`) ||
      clean.endsWith(`@${customerDomain}`) ||
      clean.endsWith("@customer.zupestore.com")
    );
  },

  generateSyntheticEmail(identifier: string): string {
    const digits = identifier.replace(/\D/g, "");
    return `${digits || identifier}@${customerDomain}`;
  },
};

export default siteConfig;

