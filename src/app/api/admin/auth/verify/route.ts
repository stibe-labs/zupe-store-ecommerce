import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";
import { USER_COOKIE_NAME, verifyUserSessionToken } from "@/lib/userAuth";

const SUPER_ADMIN_EMAIL = "admin@zupestore.com";

/**
 * Cryptographically verifies if the current session belongs to the Super Admin.
 * Strictly verifies the HTTP-only signed tokens using HMAC-SHA256.
 */
export async function GET(req: NextRequest) {
  try {
    const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const userToken = req.cookies.get(USER_COOKIE_NAME)?.value;

    // 1. Check dedicated admin token
    if (adminToken) {
      const adminSession = await verifyAdminSessionToken(adminToken);
      if (
        adminSession.valid &&
        adminSession.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL
      ) {
        return NextResponse.json({
          isSuperAdmin: true,
          email: adminSession.email,
          role: "admin",
        });
      }
    }

    // 2. Check signed user session token
    if (userToken) {
      const userSession = await verifyUserSessionToken(userToken);
      if (
        userSession.valid &&
        userSession.user?.role === "admin" &&
        userSession.user?.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL
      ) {
        return NextResponse.json({
          isSuperAdmin: true,
          email: userSession.user.email,
          role: "admin",
        });
      }
    }

    return NextResponse.json({ isSuperAdmin: false }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ isSuperAdmin: false }, { status: 200 });
  }
}
