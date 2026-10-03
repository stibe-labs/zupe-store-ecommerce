import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";

export async function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const url = req.nextUrl.clone();
  const { pathname } = url;

  // -- 1. Protect Admin Portal Pages (/admin, /admin/*) --
  if (pathname.startsWith("/admin")) {
    // If visitor visits /admin/login directly, redirect to storefront (no separate login page needed)
    if (pathname === "/admin/login") {
      url.pathname = "/";
      url.searchParams.set("auth", "admin");
      return NextResponse.redirect(url);
    }

    // Check for valid Admin Session Token
    const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!adminToken) {
      // No separate login page: redirect unauthorized visitors to storefront with auth modal trigger
      url.pathname = "/";
      url.searchParams.set("auth", "admin");
      return NextResponse.redirect(url);
    }

    const session = await verifyAdminSessionToken(adminToken);
    if (!session.valid) {
      // Token expired or invalid signature: redirect to storefront with modal trigger
      url.pathname = "/";
      url.searchParams.set("auth", "admin");
      const res = NextResponse.redirect(url);
      res.cookies.delete(ADMIN_COOKIE_NAME);
      return res;
    }

    return NextResponse.next();
  }

  // -- 2. Protect Admin Internal APIs (/api/admin/*) --
  if (pathname.startsWith("/api/admin")) {
    // Exempt admin auth and external webhook sync routes
    const isExempt =
      pathname.startsWith("/api/admin/auth") ||
      pathname.startsWith("/api/admin/sync");

    if (!isExempt) {
      const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
      if (!adminToken) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: Admin authentication required" },
          { status: 401 }
        );
      }

      const session = await verifyAdminSessionToken(adminToken);
      if (!session.valid) {
        return NextResponse.json(
          { success: false, error: "Invalid or expired admin session token" },
          { status: 401 }
        );
      }
    }

    return NextResponse.next();
  }

  // -- 3. Admin Subdomain Routing (e.g. admin.zupestore.com) --
  const isAdminSubdomain =
    host.startsWith("admin.") || host.startsWith("admin.localhost");

  if (isAdminSubdomain) {
    if (pathname === "/" || pathname === "") {
      url.pathname = "/admin";
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
