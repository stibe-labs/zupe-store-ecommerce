import { NextRequest, NextResponse } from "next/server";
import { sendSmsOTP } from "@/lib/smsOtp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone = body?.phone;

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    const result = await sendSmsOTP(phone);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      codeSent: result.codeSent ?? true,
      message: result.message,
      otp: result.otp,
    });
  } catch (err: any) {
    console.error("SMS send OTP error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to send SMS verification code" },
      { status: 500 }
    );
  }
}
