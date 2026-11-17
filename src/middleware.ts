import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";
import { USER_COOKIE_NAME, verifyUserSessionToken } from "@/lib/userAuth";

/**
 * Standard OWASP Recommended Security Headers
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(self), geolocation=(self)"
  );
  return response;
}

export async function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const url = req.nextUrl.clone();
  const { pathname } = url;

  // -- 0. Canonical Domain Enforcement: Redirect all *.workers.dev requests immediately to vittaldigital.com --
  if (host.includes("workers.dev")) {
    const targetUrl = new URL(pathname + url.search, "https://vittaldigital.com");
    return NextResponse.redirect(targetUrl, 301);
  }

  // Check if this request is on the admin subdomain (e.g. admin.vittaldigital.com or admin.localhost)
  const isAdminSubdomain =
    host.startsWith("admin.") || host.startsWith("admin.localhost");

  // Handle Admin Subdomain (e.g. admin.vittaldigital.com or admin.localhost)
  if (isAdminSubdomain) {
    // If accessing root "/" on admin subdomain
    if (pathname === "/" || pathname === "") {
      const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
      if (!adminToken) {
        url.pathname = "/admin/login";
        return applySecurityHeaders(NextResponse.redirect(url));
      }

      const session = await verifyAdminSessionToken(adminToken);
      if (!session.valid) {
        url.pathname = "/admin/login";
        url.searchParams.set("notice", "Admin session expired. Please sign in again.");
        const res = NextResponse.redirect(url);
        res.cookies.delete(ADMIN_COOKIE_NAME);
        return applySecurityHeaders(res);
      }

      url.pathname = "/admin";
      return applySecurityHeaders(NextResponse.rewrite(url));
    }

    // Direct /login alias to /admin/login
    if (pathname === "/login") {
      url.pathname = "/admin/login";
      return applySecurityHeaders(NextResponse.rewrite(url));
    }

    // If accessing clean paths like /orders, /products, /whatsapp on admin subdomain
    // rewrite them internally to /admin/orders, /admin/products, etc.
    const adminSections = [
      "orders",
      "whatsapp",
      "crm",
      "abandoned-carts",
      "shipments",
      "products",
      "promo-codes",
      "reviews",
      "website-content",
      "suppliers",
      "expenses",
      "payments",
      "rto-refund-balance",
      "reports",
      "calculator",
      "customers",
      "settings",
    ];

    const firstSegment = pathname.split("/")[1];
    if (adminSections.includes(firstSegment)) {
      url.pathname = `/admin${pathname}`;
      return applySecurityHeaders(NextResponse.rewrite(url));
    }
  }

  // -- 1. Protect Admin Portal Pages (/admin, /admin/*) --
  if (pathname.startsWith("/admin")) {
    // Dedicated Admin Login Page
    if (pathname === "/admin/login") {
      const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
      if (adminToken) {
        const session = await verifyAdminSessionToken(adminToken);
        if (session.valid) {
          url.pathname = isAdminSubdomain ? "/" : "/admin";
          url.search = "";
          return applySecurityHeaders(NextResponse.redirect(url));
        }
      }
      return applySecurityHeaders(NextResponse.next());
    }

    // Check for valid Admin Session Token
    const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!adminToken) {
      url.pathname = "/admin/login";
      url.searchParams.set("redirect", pathname + (url.search ? url.search : ""));
      return applySecurityHeaders(NextResponse.redirect(url));
    }

    const session = await verifyAdminSessionToken(adminToken);
    if (!session.valid) {
      url.pathname = "/admin/login";
      url.searchParams.set("redirect", pathname + (url.search ? url.search : ""));
      url.searchParams.set("notice", "Admin session expired. Please sign in again.");
      const res = NextResponse.redirect(url);
      res.cookies.delete(ADMIN_COOKIE_NAME);
      return applySecurityHeaders(res);
    }

    return applySecurityHeaders(NextResponse.next());
  }

  // -- 2. Protect Admin Internal APIs (/api/admin/*) --
  if (pathname.startsWith("/api/admin")) {
    // Only exempt admin login/auth routes, whatsapp media streaming proxy, and incoming external POST webhooks (Shiprocket/Shopify)
    const isExempt =
      pathname.startsWith("/api/admin/auth") ||
      pathname.startsWith("/api/admin/whatsapp/media") ||
      (req.method === "POST" && pathname.startsWith("/api/admin/sync"));

    if (!isExempt) {
      const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
      if (!adminToken) {
        return applySecurityHeaders(
          NextResponse.json(
            { success: false, error: "Unauthorized: Admin authentication required" },
            { status: 401 }
          )
        );
      }

      const session = await verifyAdminSessionToken(adminToken);
      if (!session.valid) {
        return applySecurityHeaders(
          NextResponse.json(
            { success: false, error: "Invalid or expired admin session token" },
            { status: 401 }
          )
        );
      }
    }

    return applySecurityHeaders(NextResponse.next());
  }

  // -- 3. Protect Customer Account Pages (/account, /orders) on main site --
  if (!isAdminSubdomain && (pathname === "/account" || pathname === "/orders")) {
    const userToken = req.cookies.get(USER_COOKIE_NAME)?.value;
    const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;

    let hasValidSession = false;

    if (adminToken) {
      const adminSession = await verifyAdminSessionToken(adminToken);
      if (adminSession.valid) hasValidSession = true;
    }

    if (!hasValidSession && userToken) {
      const userSession = await verifyUserSessionToken(userToken);
      if (userSession.valid) hasValidSession = true;
    }

    // If no valid session cookie found, redirect to signin with return URL
    if (!hasValidSession) {
      url.pathname = "/signin";
      url.searchParams.set("redirect", pathname);
      url.searchParams.set("notice", "Please sign in to access this page");
      const res = NextResponse.redirect(url);
      if (userToken) res.cookies.delete(USER_COOKIE_NAME);
      return applySecurityHeaders(res);
    }

    return applySecurityHeaders(NextResponse.next());
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
