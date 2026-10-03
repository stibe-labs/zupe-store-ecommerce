// Admin Security & Authentication Utilities for Zupe Store ERP
// Fully compatible with Cloudflare Workers Edge runtime & Node.js

const ADMIN_SECRET = "zupe_admin_secret_key_2026_super_secure_edge_token";
export const ADMIN_COOKIE_NAME = "zupe_admin_token";

// Configured credentials
const DEFAULT_ADMIN_EMAIL = "admin@zupestore.com";
const DEFAULT_ADMIN_PASSWORD = "ZupeAdmin@2026";
const OWNER_EMAIL = "muhammedijasp0@gmail.com";

export async function verifyAdminCredentials(
  email?: string,
  password?: string
): Promise<{ valid: boolean; email?: string; name?: string }> {
  if (!email || !password) return { valid: false };

  const normEmail = email.toLowerCase().trim();
  const configuredEmail = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).toLowerCase().trim();
  const configuredPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

  // Check against configured admin or owner email
  const isEmailMatch =
    normEmail === configuredEmail ||
    normEmail === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
    normEmail === OWNER_EMAIL.toLowerCase();

  const isPasswordMatch = password === configuredPassword;

  if (isEmailMatch && isPasswordMatch) {
    return {
      valid: true,
      email: normEmail,
      name: normEmail === OWNER_EMAIL ? "Ijas (Admin)" : "Zupe Admin",
    };
  }

  return { valid: false };
}

// Generate a signed token string
export async function createAdminSessionToken(email: string): Promise<string> {
  const payload = {
    email,
    role: "admin",
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiration
  };

  const payloadStr = JSON.stringify(payload);
  const encodedPayload = Buffer.from(payloadStr).toString("base64url");

  // Sign using Web Crypto API HMAC-SHA256
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(ADMIN_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(encodedPayload)
  );

  const signatureStr = Buffer.from(signature).toString("base64url");
  return `${encodedPayload}.${signatureStr}`;
}

// Verify a signed token string
export async function verifyAdminSessionToken(
  token?: string | null
): Promise<{ valid: boolean; email?: string }> {
  if (!token || typeof token !== "string") return { valid: false };

  const parts = token.split(".");
  if (parts.length !== 2) return { valid: false };

  const [encodedPayload, signatureStr] = parts;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(ADMIN_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const sigBuffer = Buffer.from(signatureStr, "base64url");
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBuffer,
      encoder.encode(encodedPayload)
    );

    if (!isValid) return { valid: false };

    const payloadJson = Buffer.from(encodedPayload, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadJson);

    if (payload.exp && Date.now() > payload.exp) {
      return { valid: false }; // Expired
    }

    if (payload.role !== "admin") {
      return { valid: false };
    }

    return { valid: true, email: payload.email };
  } catch (err) {
    return { valid: false };
  }
}
