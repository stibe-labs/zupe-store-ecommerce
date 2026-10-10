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

    const companyEmail = process.env.SMTP_USER || "stibelabs@gmail.com";

    const emailResult = await sendEmail({
      to: email,
      subject: "Your Zupe Store Verification Code",
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background: #ffffff; border-radius: 20px; border: 1px solid #f0f0f0;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #111111; font-size: 26px; font-weight: 800; margin: 0;">
              Zupe<span style="color: #FF7A00;">store</span>
            </h1>
            <p style="color: #888888; font-size: 11px; margin-top: 4px;">from ${companyEmail}</p>
          </div>
          <h2 style="color: #111111; font-size: 20px; text-align: center; margin-bottom: 8px;">
            Verify Your Email
          </h2>
          <p style="color: #666666; text-align: center; font-size: 14px; margin-bottom: 28px;">
            Hi${name ? ` ${name}` : ""}, use the verification code below to complete your Zupe Store sign up:
          </p>
          <div style="background: #FFF5F2; border: 1.5px dashed #FF7A00; border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #FF7A00; font-family: monospace;">
              ${otp}
            </span>
          </div>
          <p style="color: #999999; font-size: 12px; text-align: center; line-height: 1.5;">
            This code expires in 15 minutes. If you did not request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    // If real email dispatch succeeded
    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        emailSent: true,
        message: `Verification code sent to your email from ${companyEmail}! Please check your inbox & spam folder.`,
      });
    }

    // If email service credentials are not yet configured or had an issue,
    // return OTP to the client so registration is NEVER blocked.
    return NextResponse.json({
      success: true,
      emailSent: false,
      otp,
      message: `Verification code: ${otp} (Email setup pending: ${emailResult.error || "Please set SMTP_PASS"})`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
