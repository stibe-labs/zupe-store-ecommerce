import { NextRequest, NextResponse } from "next/server";
import { generateOTP } from "@/lib/otpService";
import { sendEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const otp = generateOTP(email);

    console.log(`\n🔑 OTP for ${email}: ${otp}\n`);

    const emailResult = await sendEmail({
      to: email,
      subject: "Your Zupe Store Verification Code",
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #6C5CE7, #A29BFE); border-radius: 12px; text-align: center; line-height: 48px;">
              <span style="color: white; font-weight: bold; font-size: 24px;">Z</span>
            </div>
          </div>
          <h2 style="color: #2D3436; font-size: 24px; text-align: center; margin-bottom: 8px;">
            Verify Your Email
          </h2>
          <p style="color: #636E72; text-align: center; margin-bottom: 32px;">
            Hi${name ? ` ${name}` : ""}, use the code below to complete your sign up:
          </p>
          <div style="background: #F8F9FA; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #6C5CE7;">
              ${otp}
            </span>
          </div>
          <p style="color: #B2BEC3; font-size: 13px; text-align: center;">
            This code expires in 10 minutes. If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: emailResult.success
        ? "OTP sent to your email"
        : `OTP generated (check server logs). ${emailResult.error || ""}`,
      emailSent: emailResult.success,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
