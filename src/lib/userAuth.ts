// Customer Security & Authentication Utilities for Zupe Store
// 100% compatible with Cloudflare Workers Edge runtime & Node.js using Web Crypto API

import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from "./adminAuth";

export const USER_COOKIE_NAME = "zupe_user_session_token";
const USER_SECRET =
  process.env.USER_AUTH_SECRET ||
  "zupe_customer_auth_secret_edge_2026_super_secure_key";

export interface CustomerSessionPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  exp: number;
}

/**
 * Generate a signed session token for a customer.
 * Uses HMAC-SHA256 via Web Crypto API.
 */
export async function createUserSessionToken(user: {
  id: string;
  email: string;
  name: string;
  role?: string;
}): Promise<string> {
  const payload: CustomerSessionPayload = {
    id: user.id,
    email: user.email.toLowerCase().trim(),
    name: user.name,
    role: user.role || "customer",
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  const payloadStr = JSON.stringify(payload);
  const encodedPayload = Buffer.from(payloadStr).toString("base64url");

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(USER_SECRET),
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

/**
 * Verify a customer session token.
 */
export async function verifyUserSessionToken(
  token?: string | null
): Promise<{ valid: boolean; user?: CustomerSessionPayload }> {
  if (!token || typeof token !== "string") return { valid: false };

  const parts = token.split(".");
  if (parts.length !== 2) return { valid: false };

  const [encodedPayload, signatureStr] = parts;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(USER_SECRET),
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
    const payload = JSON.parse(payloadJson) as CustomerSessionPayload;

    if (payload.exp && Date.now() > payload.exp) {
      return { valid: false }; // Expired
    }

    return { valid: true, user: payload };
  } catch {
    return { valid: false };
  }
}

/**
 * Extract and authenticate user from an incoming NextRequest.
 * Checks for user cookie, Authorization header, and admin session fallback.
 */
export async function getAuthenticatedUser(req: Request): Promise<{
  authenticated: boolean;
  isAdmin: boolean;
  user?: CustomerSessionPayload;
}> {
  const cookieHeader = req.headers.get("cookie") || "";
  const authHeader = req.headers.get("authorization") || "";

  // 1. Check for Admin token first
  let adminToken: string | undefined;
  const adminCookieMatch = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE_NAME}=([^;]+)`)
  );
  if (adminCookieMatch) {
    adminToken = decodeURIComponent(adminCookieMatch[1]);
  }

  if (adminToken) {
    const adminSession = await verifyAdminSessionToken(adminToken);
    if (adminSession.valid) {
      return {
        authenticated: true,
        isAdmin: true,
        user: {
          id: "admin",
          email: adminSession.email || "admin@zupestore.com",
          name: "Zupe Administrator",
          role: "admin",
          exp: Date.now() + 86400000,
        },
      };
    }
  }

  // 2. Check for User token in Cookie
  let userToken: string | undefined;
  const userCookieMatch = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${USER_COOKIE_NAME}=([^;]+)`)
  );
  if (userCookieMatch) {
    userToken = decodeURIComponent(userCookieMatch[1]);
  }

  // 3. Check for User token in Authorization: Bearer <token>
  if (!userToken && authHeader.startsWith("Bearer ")) {
    userToken = authHeader.substring(7).trim();
  }

  if (userToken) {
    const verified = await verifyUserSessionToken(userToken);
    if (verified.valid && verified.user) {
      return {
        authenticated: true,
        isAdmin: false,
        user: verified.user,
      };
    }
  }

  return { authenticated: false, isAdmin: false };
}
