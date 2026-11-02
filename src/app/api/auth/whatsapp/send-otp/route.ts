import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppOTP } from "@/lib/whatsappOtp";

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

    const result = await sendWhatsAppOTP(phone);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    // Check if phone number is already registered with a customer name
    let isExistingUser = false;
    let existingName: string | undefined = undefined;

    try {
      const { findUserByPhoneAsync } = await import("@/lib/userStore");
      const existingUser = await findUserByPhoneAsync(phone);
      if (
        existingUser?.name &&
        !existingUser.name.startsWith("Customer ") &&
        existingUser.name !== "Customer"
      ) {
        isExistingUser = true;
        existingName = existingUser.name;
      }
    } catch (checkErr) {
      console.warn("User lookup check error:", checkErr);
    }

    return NextResponse.json({
      success: true,
      codeSent: result.codeSent ?? true,
      message: result.message,
      is_existing_user: isExistingUser,
      name: existingName,
    });
  } catch (err: any) {
    console.error("WhatsApp send OTP error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to send WhatsApp verification code" },
      { status: 500 }
    );
  }
}
