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

    const configuredEmail = (process.env.ADMIN_EMAIL || SUPER_ADMIN_EMAIL).toLowerCase().trim();
    const isEmailValid = (email?: string | null) => {
      if (!email) return false;
      const normalized = email.toLowerCase().trim();
      return normalized === configuredEmail || normalized === SUPER_ADMIN_EMAIL.toLowerCase();
    };

    // 1. Check dedicated admin token
    if (adminToken) {
      const adminSession = await verifyAdminSessionToken(adminToken);
      if (adminSession.valid && isEmailValid(adminSession.email)) {
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
        isEmailValid(userSession.user?.email)
      ) {
        return NextResponse.json({
          isSuperAdmin: true,
          email: userSession.user.email,
          role: "admin",
        });
      }
    }

    return NextResponse.json({ isSuperAdmin: false }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ isSuperAdmin: false, error: err.message }, { status: 401 });
  }
}
