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
    "camera=(), microphone=(), geolocation=(self)"
  );
  return response;
}

export async function middleware(req: NextRequest) {
  const rawHost = req.headers.get("host") || "";
  const host = rawHost.toLowerCase().split(":")[0];
  const url = req.nextUrl.clone();
  const { pathname } = url;

  const isAdminSubdomain =
    host.startsWith("admin.") || host.startsWith("admin.localhost");

  // =========================================================================
  // 1. ADMIN SUBDOMAIN STRICT PROTECTION & ROUTING (e.g. admin.zupestore.in)
  // =========================================================================
  if (isAdminSubdomain) {
    // 1A. API Routes on Admin Subdomain
    if (pathname.startsWith("/api")) {
      const isAuthExempt = pathname.startsWith("/api/admin/auth");
      const isSyncWebhook =
        req.method === "POST" && pathname.startsWith("/api/admin/sync");

      if (pathname.startsWith("/api/admin") && !isAuthExempt && !isSyncWebhook) {
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

    // 1B. Admin Login Page (/login or /admin/login)
    const isLoginPage = pathname === "/login" || pathname === "/admin/login";
    const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;

    if (isLoginPage) {
      if (adminToken) {
        const session = await verifyAdminSessionToken(adminToken);
        if (session.valid) {
          url.pathname = "/";
          url.search = "";
          return applySecurityHeaders(NextResponse.redirect(url));
        }
      }
      if (pathname === "/login") {
        url.pathname = "/admin/login";
        return applySecurityHeaders(NextResponse.rewrite(url));
      }
      return applySecurityHeaders(NextResponse.next());
    }

    // 1C. ALL Other Pages on Admin Subdomain MUST REQUIRE AUTHENTICATION
    if (!adminToken) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("redirect", pathname + (url.search || ""));
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }

    const session = await verifyAdminSessionToken(adminToken);
    if (!session.valid) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("redirect", pathname + (url.search || ""));
      loginUrl.searchParams.set("notice", "Admin session expired. Please sign in again.");
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete(ADMIN_COOKIE_NAME);
      return applySecurityHeaders(res);
    }

    // 1D. Authenticated Subdomain Path Rewriting
    if (pathname === "/" || pathname === "") {
      url.pathname = "/admin";
      return applySecurityHeaders(NextResponse.rewrite(url));
    }

    if (!pathname.startsWith("/admin")) {
      url.pathname = `/admin${pathname}`;
      return applySecurityHeaders(NextResponse.rewrite(url));
    }

    return applySecurityHeaders(NextResponse.next());
  }

  // =========================================================================
  // 2. MAIN DOMAIN ADMIN PORTAL PROTECTION (/admin, /admin/*)
  // =========================================================================
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
      if (adminToken) {
        const session = await verifyAdminSessionToken(adminToken);
        if (session.valid) {
          url.pathname = "/admin";
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

  // =========================================================================
  // 3. MAIN DOMAIN ADMIN INTERNAL APIS (/api/admin/*)
  // =========================================================================
  if (pathname.startsWith("/api/admin")) {
    const isExempt =
      pathname.startsWith("/api/admin/auth") ||
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

  // =========================================================================
  // 4. CUSTOMER ACCOUNT PAGES (/account, /orders)
  // =========================================================================
  if (pathname === "/account" || pathname === "/orders") {
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
