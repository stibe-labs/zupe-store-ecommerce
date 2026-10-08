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
    "camera=(), microphone=(), geolocation=()"
  );
  return response;
}

export async function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const url = req.nextUrl.clone();
  const { pathname } = url;

  // -- 1. Protect Admin Portal Pages (/admin, /admin/*) --
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      url.pathname = "/";
      url.searchParams.set("auth", "admin");
      return applySecurityHeaders(NextResponse.redirect(url));
    }

    // Check for valid Admin Session Token
    const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!adminToken) {
      url.pathname = "/";
      url.searchParams.set("auth", "admin");
      return applySecurityHeaders(NextResponse.redirect(url));
    }

    const session = await verifyAdminSessionToken(adminToken);
    if (!session.valid) {
      url.pathname = "/";
      url.searchParams.set("auth", "admin");
      const res = NextResponse.redirect(url);
      res.cookies.delete(ADMIN_COOKIE_NAME);
      return applySecurityHeaders(res);
    }

    return applySecurityHeaders(NextResponse.next());
  }

  // -- 2. Protect Admin Internal APIs (/api/admin/*) --
  if (pathname.startsWith("/api/admin")) {
    // Only exempt admin login/auth routes and incoming external POST webhooks (Shiprocket/Shopify)
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

  // -- 3. Protect Customer Account Pages (/account, /orders) --
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

  // -- 4. Admin Subdomain Routing (e.g. admin.zupestore.com) --
  const isAdminSubdomain =
    host.startsWith("admin.") || host.startsWith("admin.localhost");

  if (isAdminSubdomain) {
    if (pathname === "/" || pathname === "") {
      url.pathname = "/admin";
      return applySecurityHeaders(NextResponse.rewrite(url));
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
