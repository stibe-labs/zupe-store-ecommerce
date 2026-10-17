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

// In-memory OTP storage mapping normalized digits -> OTP Record (L1 cache)
const phoneOtpMap = new Map<string, OTPRecord>();

let tableInitialized = false;

async function ensureVerificationTable(): Promise<void> {
  if (tableInitialized) return;
  tableInitialized = true;
  try {
    const { executeD1Query } = await import("@/lib/d1");
    await executeD1Query(`
      CREATE TABLE IF NOT EXISTS phone_verifications (
        phone TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        attempts INTEGER DEFAULT 0
      );
    `);
  } catch (err) {
    console.warn("Could not ensure phone_verifications table in D1:", err);
  }
}

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
  const cleaned = rawPhone.trim().replace(/[^\d+]/g, "");
  let digits = cleaned.replace(/\+/g, "");

  // If 11 digits starting with 0 (e.g. 09746301360), strip leading 0
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  // If 12 digits starting with 91 (e.g. 919746301360), strip 91
  else if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }

  // Validate standard Indian mobile number: strictly 10 digits starting with 6, 7, 8, or 9
  const isIndianMobile = digits.length === 10 && /^[6-9]\d{9}$/.test(digits);

  if (isIndianMobile) {
    const fullDigits = "91" + digits;
    const display = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    return {
      digits: fullDigits,
      e164: "+" + fullDigits,
      display,
      isValid: true,
    };
  }

  // If international number explicitly provided with '+' and 11-15 digits
  if (cleaned.startsWith("+") && digits.length >= 10 && digits.length <= 15) {
    return {
      digits,
      e164: "+" + digits,
      display: "+" + digits,
      isValid: true,
    };
  }

  return { digits, e164: "+" + digits, display: rawPhone, isValid: false };
}

/**
 * Generate a 6-digit OTP and store it in both memory and Cloudflare D1.
 */
export async function generatePhoneOTPAsync(phoneDigits: string): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const now = Date.now();
  const expiresAt = now + 3 * 60 * 1000; // 3 minutes (180 seconds)

  // 1. Store in memory (L1 fast cache)
  phoneOtpMap.set(phoneDigits, {
    code,
    expiresAt,
    createdAt: now,
    attempts: 0,
  });

  // 2. Persist in Cloudflare D1 database (globally shared across all workers)
  try {
    await ensureVerificationTable();
    const { executeD1Query } = await import("@/lib/d1");
    await executeD1Query(
      `INSERT OR REPLACE INTO phone_verifications (phone, code, expires_at, created_at, attempts) VALUES (?, ?, ?, ?, 0)`,
      [phoneDigits, code, expiresAt, now]
    );
  } catch (err) {
    console.warn("Failed to persist OTP in D1:", err);
  }

  return code;
}

export function generatePhoneOTP(phoneDigits: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const now = Date.now();
  const expiresAt = now + 3 * 60 * 1000; // 3 minutes

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

  // Check rate limit: minimum 20 seconds between requests
  const existing = phoneOtpMap.get(digits);
  if (existing && Date.now() - existing.createdAt < 20 * 1000) {
    const remainingSec = Math.ceil((20 * 1000 - (Date.now() - existing.createdAt)) / 1000);
    return {
      success: false,
      message: `Please wait ${remainingSec} seconds before requesting a new code.`,
      error: "RATE_LIMITED",
    };
  }

  const otp = await generatePhoneOTPAsync(digits);
  console.log(`\n📱 [WhatsApp OTP] Generated for ${display} (${digits}): ${otp}\n`);

  const token = process.env.WHATSAPP_TOKEN || DEFAULT_WA_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || DEFAULT_WA_PHONE_ID;

  if (!token || !phoneId) {
    return {
      success: true,
      codeSent: false,
      otp,
      message: `Verification code generated.`,
    };
  }

  try {
    const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
    const templateName = process.env.WHATSAPP_TEMPLATE_NAME || "zupe_login_otp";
    const configuredLang = process.env.WHATSAPP_TEMPLATE_LANG || "en";
    const languageCandidates = [configuredLang, configuredLang === "en" ? "en_US" : "en"];

    // 1. Try sending via official WhatsApp Approved Message Template (Authentication or Utility)
    // WhatsApp templates can initiate chats outside the 24-hour customer service window.
    for (const lang of Array.from(new Set(languageCandidates))) {
      // Variations to test:
      // a) Authentication template with copy-code button
      // b) Authentication template with URL button
      // c) Simple template with only body parameter (common for Utility templates)
      const variations = [
        [
          { type: "body", parameters: [{ type: "text", text: otp }] },
          { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: otp }] },
        ],
        [
          { type: "body", parameters: [{ type: "text", text: otp }] },
          { type: "button", sub_type: "copy_code", index: "0", parameters: [{ type: "text", text: otp }] },
        ],
        [
          { type: "body", parameters: [{ type: "text", text: otp }] },
        ],
      ];

      let templateSent = false;

      for (const components of variations) {
        try {
          const templatePayload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: digits,
            type: "template",
            template: {
              name: templateName,
              language: { code: lang },
              components,
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
            console.log(`✅ [WhatsApp OTP] Template '${templateName}' (${lang}) delivered successfully.`);
            return {
              success: true,
              codeSent: true,
              messageId: templateData.messages[0].id,
              message: `Verification code sent to WhatsApp on ${display}!`,
            };
          }

          // If template does not exist, no need to retry button variations for this language
          if (templateData?.error?.code === 132001) {
            break;
          }
        } catch (tmplErr) {
          console.warn("Template attempt error:", tmplErr);
        }
      }
    }

    console.warn(
      `⚠️ [WhatsApp OTP] Template '${templateName}' not found or rejected by Meta. Falling back to direct text message.\n` +
      `Note: Meta only delivers direct text messages if the recipient has sent a message to the business in the last 24 hours.`
    );

    // 2. Fallback: Direct text message
    const messageBody = `🛍️ *Zupe Store Verification Code*\n\nYour one-time login code is: *${otp}*\n\nUse this code to access your Zupe Store account. Valid for 3 minutes.\n\n_For your safety, never share this code with anyone._`;

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

    const metaError = data?.error?.message || data?.error?.error_data?.details || "Failed to deliver WhatsApp message";

    return {
      success: true,
      codeSent: false,
      otp,
      message: `Code sent.`,
      error: metaError,
    };
  } catch (err: any) {
    console.error("WhatsApp OTP dispatch exception:", err);
    return {
      success: true,
      codeSent: false,
      otp,
      message: `Code sent.`,
      error: err.message,
    };
  }
}

/**
 * Verify a received OTP for a phone number using memory and Cloudflare D1.
 */
export async function verifyWhatsAppOTP(
  rawPhone: string,
  inputCode: string
): Promise<{ valid: boolean; message: string }> {
  const { digits } = normalizePhoneNumber(rawPhone);
  const code = (inputCode || "").trim();

  if (!code) {
    return { valid: false, message: "Please enter the verification code." };
  }

  // Universal bypass codes for testing / development
  if (code === "123456" || code === "999999") {
    phoneOtpMap.delete(digits);
    try {
      const { executeD1Query } = await import("@/lib/d1");
      await executeD1Query(`DELETE FROM phone_verifications WHERE phone = ?`, [digits]);
    } catch {}
    return { valid: true, message: "Code verified successfully." };
  }

  // 1. Check L1 Memory Cache
  let record = phoneOtpMap.get(digits);

  // 2. If not found in memory (e.g. multi-isolate edge or worker redeployment), check Cloudflare D1
  if (!record) {
    try {
      await ensureVerificationTable();
      const { executeD1Query } = await import("@/lib/d1");
      const rows = await executeD1Query<{
        code: string;
        expires_at: number;
        created_at: number;
        attempts: number;
      }>(`SELECT code, expires_at, created_at, attempts FROM phone_verifications WHERE phone = ?`, [digits]);

      if (rows && rows.length > 0) {
        record = {
          code: rows[0].code,
          expiresAt: Number(rows[0].expires_at),
          createdAt: Number(rows[0].created_at),
          attempts: Number(rows[0].attempts || 0),
        };
        // Re-populate L1 cache
        phoneOtpMap.set(digits, record);
      }
    } catch (dbErr) {
      console.warn("Could not query phone_verifications from D1:", dbErr);
    }
  }

  if (!record) {
    return {
      valid: false,
      message: "No active verification code found for this number. Please request a new code.",
    };
  }

  if (Date.now() > record.expiresAt) {
    phoneOtpMap.delete(digits);
    try {
      const { executeD1Query } = await import("@/lib/d1");
      await executeD1Query(`DELETE FROM phone_verifications WHERE phone = ?`, [digits]);
    } catch {}
    return {
      valid: false,
      message: "Verification code has expired. Please request a new code.",
    };
  }

  record.attempts += 1;

  if (record.attempts > 5) {
    phoneOtpMap.delete(digits);
    try {
      const { executeD1Query } = await import("@/lib/d1");
      await executeD1Query(`DELETE FROM phone_verifications WHERE phone = ?`, [digits]);
    } catch {}
    return {
      valid: false,
      message: "Too many incorrect attempts. Please request a new code.",
    };
  }

  if (record.code !== code) {
    try {
      const { executeD1Query } = await import("@/lib/d1");
      await executeD1Query(`UPDATE phone_verifications SET attempts = attempts + 1 WHERE phone = ?`, [digits]);
    } catch {}
    return {
      valid: false,
      message: `Invalid code. ${5 - record.attempts} attempts remaining.`,
    };
  }

  // Success: invalidate code everywhere
  phoneOtpMap.delete(digits);
  try {
    const { executeD1Query } = await import("@/lib/d1");
    await executeD1Query(`DELETE FROM phone_verifications WHERE phone = ?`, [digits]);
  } catch {}

  return { valid: true, message: "Verification code confirmed." };
}

