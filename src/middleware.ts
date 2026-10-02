import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const url = req.nextUrl.clone();

  // -- Admin subdomain routing --
  const isAdminSubdomain =
    host.startsWith("admin.") ||
    host.startsWith("admin.localhost");

  if (isAdminSubdomain) {
    if (url.pathname === "/" || url.pathname === "") {
      url.pathname = "/admin";
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
