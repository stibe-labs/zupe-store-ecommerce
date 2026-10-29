import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/adminAuth";
import { USER_COOKIE_NAME } from "@/lib/userAuth";

export async function POST(req: NextRequest) {
  try {
    const host = (req.headers.get("host") || "").toLowerCase().split(":")[0];
    const cookieDomain = host.endsWith("zupestore.in") ? ".zupestore.in" : undefined;

    const response = NextResponse.json({
      success: true,
      message: "Admin logged out successfully",
    });

    // Delete host-only cookie
    response.cookies.delete(ADMIN_COOKIE_NAME);
    response.cookies.delete(USER_COOKIE_NAME);

    // Delete cross-subdomain cookie if applicable
    if (cookieDomain) {
      response.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: "",
        domain: cookieDomain,
        maxAge: 0,
        path: "/",
      });
      response.cookies.set({
        name: USER_COOKIE_NAME,
        value: "",
        domain: cookieDomain,
        maxAge: 0,
        path: "/",
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase().split(":")[0];
  const cookieDomain = host.endsWith("zupestore.in") ? ".zupestore.in" : undefined;

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";

  const response = NextResponse.redirect(url);
  response.cookies.delete(ADMIN_COOKIE_NAME);
  response.cookies.delete(USER_COOKIE_NAME);

  if (cookieDomain) {
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: "",
      domain: cookieDomain,
      maxAge: 0,
      path: "/",
    });
    response.cookies.set({
      name: USER_COOKIE_NAME,
      value: "",
      domain: cookieDomain,
      maxAge: 0,
      path: "/",
    });
  }

  return response;
}
