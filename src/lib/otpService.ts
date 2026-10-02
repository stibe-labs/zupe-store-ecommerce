// In-memory OTP storage with timestamp expiry

interface OTPRecord {
  code: string;
  expiresAt: number;
}

const otpMap = new Map<string, OTPRecord>();

export function generateOTP(email: string): string {
  const normalizedEmail = email.toLowerCase().trim();
  // 6-digit random code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpMap.set(normalizedEmail, { code, expiresAt });
  return code;
}

export function verifyOTP(
  email: string,
  inputCode: string
): { valid: boolean; message: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const record = otpMap.get(normalizedEmail);

  if (!record) {
    return { valid: false, message: "No verification code found. Please request a new one." };
  }

  if (Date.now() > record.expiresAt) {
    otpMap.delete(normalizedEmail);
    return { valid: false, message: "Verification code expired. Please request a new one." };
  }

  if (record.code !== inputCode.trim()) {
    return { valid: false, message: "Invalid verification code." };
  }

  // Consume code on success
  otpMap.delete(normalizedEmail);
  return { valid: true, message: "Code verified successfully." };
}
