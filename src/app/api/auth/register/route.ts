import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otpService";
import { saveUser, findUserByEmail } from "@/lib/userStore";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, otp } = await req.json();

    if (!name || !email || !password || !otp) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Verify OTP
    const otpResult = verifyOTP(email, otp);
    if (!otpResult.valid) {
      return NextResponse.json(
        { success: false, error: otpResult.message },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Create new user
    const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const simpleHash = Buffer.from(password).toString("base64");

    saveUser({
      id: userId,
      name,
      email: email.toLowerCase().trim(),
      password_hash: simpleHash,
      phone: "",
      created_at: new Date().toISOString(),
    });

    const session: UserSession = {
      id: userId,
      name,
      email: email.toLowerCase().trim(),
      role: "customer",
    };

    return NextResponse.json({ success: true, user: session });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Registration failed" },
      { status: 500 }
    );
  }
}
