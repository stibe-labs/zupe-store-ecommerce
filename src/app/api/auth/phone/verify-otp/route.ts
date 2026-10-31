import { NextRequest, NextResponse } from "next/server";
import { verifySmsOTP } from "@/lib/smsOtp";
import { findOrCreateWhatsAppUserAsync } from "@/lib/userStore";
import { createUserSessionToken, USER_COOKIE_NAME } from "@/lib/userAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, otp, name } = body;

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== "string" || !otp.trim()) {
      return NextResponse.json(
        { success: false, error: "Verification code is required" },
        { status: 400 }
      );
    }

    // 1. Verify OTP
    const verification = await verifySmsOTP(phone, otp);
    if (!verification.valid) {
      return NextResponse.json(
        { success: false, error: verification.message },
        { status: 400 }
      );
    }

    // 2. Find or create user account by phone
    const { user, isNew } = await findOrCreateWhatsAppUserAsync({ phone, name });

    const sessionUser = {
      id: user.id,
      name: user.name,
      phone: user.phone || phone,
      email: user.email,
      role: user.role || "customer",
    };

    // 3. Issue signed customer session token
    const token = await createUserSessionToken(sessionUser);

    const response = NextResponse.json({
      success: true,
      message: isNew ? "Account created successfully!" : "Signed in successfully!",
      isNew,
      user: sessionUser,
      token,
    });

    // 4. Set persistent session cookie (30 days)
    response.cookies.set({
      name: USER_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("SMS verify OTP error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Authentication failed" },
      { status: 500 }
    );
  }
}

