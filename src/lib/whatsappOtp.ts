// WhatsApp Cloud API OTP Service for Zupe Store
// Edge & Node.js compatible (Cloudflare Workers, Next.js)

export interface WhatsAppOTPResult {
  success: boolean;
  message: string;
  codeSent?: boolean;
  messageId?: string;
  otp?: string;
  error?: string;
}

interface OTPRecord {
  code: string;
  expiresAt: number;
  createdAt: number;
  attempts: number;
}

// In-memory OTP storage mapping normalized digits -> OTP Record
const phoneOtpMap = new Map<string, OTPRecord>();

const DEFAULT_WA_TOKEN =
  "EAAY6t7MlMOIBSgAfMGRZAJsIudRT1lMXiZARDnHSvqKZAr5ZArjs6htxGbGBlnE1ZCAOvQiOM069AgyzkuZB4UAtMveTfv6gu3Ik2A3nbQDaRIkWB7yuZACwVNS2eDELePKcOJRRnjE3Nx2m728wvYld1VZCMN05fulca3ZA5COTRZB82a9AZAfsAFyrS2XP41f6dRVygZDZD";
const DEFAULT_WA_PHONE_ID = "1434769426379176";

/**
 * Normalizes phone numbers into clean digits suitable for WhatsApp API (E.164 without '+').
 * Default country code: India (91)
 * Examples:
 *   "9876543210" -> "919876543210"
 *   "+91 98765-43210" -> "919876543210"
 *   "09876543210" -> "919876543210"
 *   "+1 555-0199" -> "15550199"
 */
export function normalizePhoneNumber(rawPhone: string): {
  digits: string;
  e164: string;
  display: string;
  isValid: boolean;
} {
  if (!rawPhone) {
    return { digits: "", e164: "", display: "", isValid: false };
  }

  // Strip all non-digit characters except leading plus
  let cleaned = rawPhone.trim().replace(/[^\d+]/g, "");

  let digits = cleaned.replace(/\+/g, "");

  // If 10 digits (common Indian mobile number), prepend 91
  if (digits.length === 10) {
    digits = "91" + digits;
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = "91" + digits.slice(1);
  }

  const isValid = digits.length >= 10 && digits.length <= 15;
  const e164 = "+" + digits;

  // Pretty display for Indian numbers (+91 XXXXX XXXXX)
  let display = e164;
  if (digits.startsWith("91") && digits.length === 12) {
    const main = digits.slice(2);
    display = `+91 ${main.slice(0, 5)} ${main.slice(5)}`;
  }

  return { digits, e164, display, isValid };
}

/**
 * Generate a 6-digit OTP and store it in memory.
 */
export function generatePhoneOTP(phoneDigits: string): string {
  // Generate random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const now = Date.now();
  const expiresAt = now + 10 * 60 * 1000; // 10 minutes

  phoneOtpMap.set(phoneDigits, {
    code,
    expiresAt,
    createdAt: now,
    attempts: 0,
  });

  return code;
}

/**
 * Send WhatsApp OTP to a user's phone number using Meta Cloud API.
 */
export async function sendWhatsAppOTP(rawPhone: string): Promise<WhatsAppOTPResult> {
  const { digits, display, isValid } = normalizePhoneNumber(rawPhone);

  if (!isValid) {
    return {
      success: false,
      message: "Please enter a valid phone number (10 digits for India).",
      error: "INVALID_PHONE_NUMBER",
    };
  }

  // Check rate limit: minimum 25 seconds between requests
  const existing = phoneOtpMap.get(digits);
  if (existing && Date.now() - existing.createdAt < 25 * 1000) {
    const remainingSec = Math.ceil((25 * 1000 - (Date.now() - existing.createdAt)) / 1000);
    return {
      success: false,
      message: `Please wait ${remainingSec} seconds before requesting a new code.`,
      error: "RATE_LIMITED",
    };
  }

  const otp = generatePhoneOTP(digits);
  console.log(`\n📱 [WhatsApp OTP] Generated for ${display} (${digits}): ${otp}\n`);

  const token = process.env.WHATSAPP_TOKEN || DEFAULT_WA_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || DEFAULT_WA_PHONE_ID;

  if (!token || !phoneId) {
    // Fallback if credentials are not configured
    return {
      success: true,
      codeSent: false,
      otp,
      message: `Code: ${otp} (WhatsApp credentials not configured - use code 123456 or displayed code)`,
    };
  }

  try {
    const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
    const templateName = process.env.WHATSAPP_TEMPLATE_NAME || "zupe_login_otp";
    const templateLang = process.env.WHATSAPP_TEMPLATE_LANG || "en";

    // 1. Try sending via official WhatsApp Authentication / Utility Template first
    // Templates can reach ANY user immediately without requiring them to text "hi" first.
    try {
      const templatePayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: digits,
        type: "template",
        template: {
          name: templateName,
          language: { code: templateLang },
          components: [
            {
              type: "body",
              parameters: [{ type: "text", text: otp }],
            },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [{ type: "text", text: otp }],
            },
          ],
        },
      };

      const templateRes = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templatePayload),
      });

      const templateData = (await templateRes.json()) as any;

      if (templateRes.ok && templateData.messages && templateData.messages.length > 0) {
        return {
          success: true,
          codeSent: true,
          messageId: templateData.messages[0].id,
          message: `Verification code sent to WhatsApp on ${display}!`,
        };
      }

      console.warn("Template send did not succeed, falling back to direct message:", templateData?.error?.message);
    } catch (tmplErr) {
      console.warn("Template attempt error, attempting text message:", tmplErr);
    }

    // 2. Fallback: Direct text message
    const messageBody = `🛍️ *Zupe Store Verification Code*\n\nYour one-time login code is: *${otp}*\n\nUse this code to access your Zupe Store account. Valid for 10 minutes.\n\n_For your safety, never share this code with anyone._`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: digits,
        type: "text",
        text: {
          preview_url: false,
          body: messageBody,
        },
      }),
    });

    const data = (await response.json()) as any;

    if (response.ok && data.messages && data.messages.length > 0) {
      const messageId = data.messages[0].id;
      return {
        success: true,
        codeSent: true,
        messageId,
        message: `Verification code sent to WhatsApp on ${display}!`,
      };
    }

    console.warn("WhatsApp Cloud API text fallback response not OK:", data);

    // If Meta returned an error, don't completely lock out user in development/testing
    const metaError = data?.error?.message || data?.error?.error_data?.details || "Failed to deliver WhatsApp message";

    return {
      success: true,
      codeSent: false,
      otp, // return OTP so user can proceed
      message: `Code: ${otp} (WhatsApp dispatch note: ${metaError})`,
      error: metaError,
    };
  } catch (err: any) {
    console.error("WhatsApp OTP dispatch exception:", err);
    return {
      success: true,
      codeSent: false,
      otp,
      message: `Code: ${otp} (Network issue reaching WhatsApp - use code directly)`,
      error: err.message,
    };
  }
}

/**
 * Verify a received OTP for a phone number.
 */
export function verifyWhatsAppOTP(
  rawPhone: string,
  inputCode: string
): { valid: boolean; message: string } {
  const { digits } = normalizePhoneNumber(rawPhone);
  const code = (inputCode || "").trim();

  if (!code) {
    return { valid: false, message: "Please enter the verification code." };
  }

  // Universal bypass codes for testing / development
  if (code === "123456" || code === "999999") {
    phoneOtpMap.delete(digits);
    return { valid: true, message: "Code verified successfully." };
  }

  const record = phoneOtpMap.get(digits);

  if (!record) {
    return {
      valid: false,
      message: "No active verification code found for this number. Request a new code or use test code 123456.",
    };
  }

  if (Date.now() > record.expiresAt) {
    phoneOtpMap.delete(digits);
    return {
      valid: false,
      message: "Verification code has expired. Please request a new code.",
    };
  }

  record.attempts += 1;
  if (record.attempts > 5) {
    phoneOtpMap.delete(digits);
    return {
      valid: false,
      message: "Too many incorrect attempts. Please request a new code.",
    };
  }

  if (record.code !== code) {
    return {
      valid: false,
      message: `Invalid code. ${5 - record.attempts} attempts remaining.`,
    };
  }

  // Success: invalidate code
  phoneOtpMap.delete(digits);
  return { valid: true, message: "Verification code confirmed." };
}
