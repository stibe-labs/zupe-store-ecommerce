import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminCredentials,
  createAdminSessionToken,
  ADMIN_COOKIE_NAME,
} from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const verification = await verifyAdminCredentials(email, password);
    if (!verification.valid || !verification.email) {
      return NextResponse.json(
        { success: false, error: "Invalid admin email or password" },
        { status: 401 }
      );
    }

    const token = await createAdminSessionToken(verification.email);

    const response = NextResponse.json({
      success: true,
      user: {
        email: verification.email,
        name: verification.name,
      },
    });

    // Set secure HTTP-only admin cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    // Also set customer session token for seamless preview
    const { createUserSessionToken, USER_COOKIE_NAME } = await import("@/lib/userAuth");
    const userToken = await createUserSessionToken({
      id: "superadmin",
      name: verification.name || "Zupe SuperAdmin",
      email: verification.email,
      role: "admin",
    });

    response.cookies.set({
      name: USER_COOKIE_NAME,
      value: userToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Admin login error" },
      { status: 500 }
    );
  }
}
