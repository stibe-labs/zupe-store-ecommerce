// OTP service with in-memory storage and universal fallback support for testing

interface OTPRecord {
  code: string;
  expiresAt: number;
}

const otpMap = new Map<string, OTPRecord>();

export function generateOTP(email: string): string {
  const normalizedEmail = email.toLowerCase().trim();
  // Generate random 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

  otpMap.set(normalizedEmail, { code, expiresAt });
  return code;
}

export function verifyOTP(
  email: string,
  inputCode: string
): { valid: boolean; message: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const code = (inputCode || "").trim();

  // Universal bypass codes for testing / development
  if (code === "123456" || code === "999999") {
    return { valid: true, message: "Code verified successfully." };
  }

  const record = otpMap.get(normalizedEmail);

  if (!record) {
    return { valid: false, message: "No verification code found. Use fallback code 123456 or request a new one." };
  }

  if (Date.now() > record.expiresAt) {
    otpMap.delete(normalizedEmail);
    return { valid: false, message: "Verification code expired. Please request a new one." };
  }

  if (record.code !== code) {
    return { valid: false, message: "Invalid verification code. Please try again." };
  }

  // Consume code on success
  otpMap.delete(normalizedEmail);
  return { valid: true, message: "Code verified successfully." };
}
