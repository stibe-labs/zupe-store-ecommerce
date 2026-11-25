/**
 * Pure client-side Card input formatting, BIN network detection, Luhn checksum,
 * expiry validation, and safe HTML/URL helpers for Turkiye Jam's first-party PyDart Pay checkout.
 *
 * PCI-DSS Boundary:
 *  - Runs strictly in the customer's browser for UX & pre-validation.
 *  - Raw PAN / CVV is NEVER sent to turkiyejam.com or pydart.com servers;
 *    card submission goes strictly Browser -> Razorpay PCI Level 1 API via razorpay.js.
 */

export type CardNetworkId = "visa" | "mastercard" | "rupay" | "amex" | "maestro" | "unknown";

export interface EnabledCardNetworks {
  visa: boolean;
  mastercard: boolean;
  rupay: boolean;
  amex: boolean;
  maestro: boolean;
}

export const DEFAULT_ENABLED_CARD_NETWORKS: EnabledCardNetworks = {
  visa: true,
  mastercard: true,
  rupay: true,
  amex: false,
  maestro: true,
};

export function stripCardDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function detectCardNetwork(rawNumber: string): CardNetworkId {
  const digits = stripCardDigits(rawNumber);
  if (!digits) return "unknown";

  if (/^4/.test(digits)) return "visa";
  if (/^3[47]/.test(digits)) return "amex";
  if (/^(60(?!11)|652[12]|81|82|508[5-9]|353|356)/.test(digits)) return "rupay";
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(digits)) {
    return "mastercard";
  }
  if (/^(50|5[6-9]|6\d)/.test(digits)) return "maestro";
  return "unknown";
}

export function getExpectedCardLengths(network: CardNetworkId): number[] {
  switch (network) {
    case "amex":
      return [15];
    case "maestro":
      return [12, 13, 14, 15, 16, 17, 18, 19];
    case "visa":
      return [13, 16, 19];
    case "mastercard":
    case "rupay":
      return [16];
    default:
      return [15, 16, 19];
  }
}

export function getExpectedCvvLength(network: CardNetworkId): number {
  return network === "amex" ? 4 : 3;
}

export function formatCardNumberDisplay(raw: string): string {
  const digits = stripCardDigits(raw).slice(0, 19);
  const network = detectCardNetwork(digits);
  if (network === "amex") {
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)]
      .filter(Boolean)
      .join(" ");
  }
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function formatCardExpiryDisplay(raw: string): string {
  const digits = stripCardDigits(raw).slice(0, 4);
  if (digits.length === 0) return "";
  if (digits.length === 1 && Number(digits) > 1) return `0${digits} / `;
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

export function isValidLuhn(rawNumber: string): boolean {
  const digits = stripCardDigits(rawNumber);
  if (digits.length < 12 || digits.length > 19 || /^0+$/.test(digits)) return false;

  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits.charCodeAt(i) - 48;
    if (digit < 0 || digit > 9) return false;
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export interface ParsedCardExpiry {
  valid: boolean;
  month: string;
  year2: string;
  year4: number;
  error?: string;
}

export function parseCardExpiry(
  rawExpiry: string,
  referenceDate: Date = new Date()
): ParsedCardExpiry {
  const digits = stripCardDigits(rawExpiry);
  if (digits.length !== 4 && digits.length !== 6) {
    return { valid: false, month: "", year2: "", year4: 0, error: "Enter expiry as MM / YY." };
  }

  const monthNum = Number(digits.slice(0, 2));
  if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
    return { valid: false, month: "", year2: "", year4: 0, error: "Enter a valid month (01–12)." };
  }

  const yearPart = digits.length === 6 ? digits.slice(2, 6) : digits.slice(2, 4);
  const year4 = yearPart.length === 4 ? Number(yearPart) : 2000 + Number(yearPart);
  const year2 = String(year4).slice(-2);
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth() + 1;

  if (year4 < currentYear || (year4 === currentYear && monthNum < currentMonth)) {
    return {
      valid: false,
      month: String(monthNum).padStart(2, "0"),
      year2,
      year4,
      error: "This card has expired.",
    };
  }
  if (year4 > currentYear + 25) {
    return {
      valid: false,
      month: String(monthNum).padStart(2, "0"),
      year2,
      year4,
      error: "Check the expiry year on your card.",
    };
  }

  return {
    valid: true,
    month: String(monthNum).padStart(2, "0"),
    year2,
    year4,
  };
}

export interface CardValidationResult {
  valid: boolean;
  network: CardNetworkId;
  digits: string;
  expiryMonth: string;
  expiryYear2: string;
  cvv: string;
  cardholderName: string;
  errors: {
    number?: string;
    expiry?: string;
    cvv?: string;
    name?: string;
  };
}

export function validateCardInput(params: {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
  enabledNetworks?: EnabledCardNetworks;
  referenceDate?: Date;
}): CardValidationResult {
  const digits = stripCardDigits(params.number);
  const network = detectCardNetwork(digits);
  const cvv = stripCardDigits(params.cvv);
  const cardholderName = params.name.trim().replace(/\s+/g, " ");
  const errors: CardValidationResult["errors"] = {};

  const allowedLengths = getExpectedCardLengths(network);
  if (!digits) {
    errors.number = "Enter your card number.";
  } else if (!allowedLengths.includes(digits.length) || !isValidLuhn(digits)) {
    errors.number = "Enter a valid card number.";
  } else if (
    params.enabledNetworks &&
    network !== "unknown" &&
    !params.enabledNetworks[network]
  ) {
    const label =
      network === "amex"
        ? "American Express"
        : network.charAt(0).toUpperCase() + network.slice(1);
    errors.number = `${label} cards are not enabled here. Please use Visa, Mastercard, or RuPay.`;
  }

  const parsedExpiry = parseCardExpiry(params.expiry, params.referenceDate);
  if (!parsedExpiry.valid) {
    errors.expiry = parsedExpiry.error || "Enter a valid expiry date.";
  }

  const expectedCvv = getExpectedCvvLength(network);
  if (!cvv) {
    errors.cvv = "Enter CVV.";
  } else if (cvv.length !== expectedCvv) {
    errors.cvv = `Enter the ${expectedCvv}-digit CVV.`;
  }

  if (cardholderName.length < 2) {
    errors.name = "Enter the name printed on your card.";
  } else if (cardholderName.length > 80) {
    errors.name = "Name on card is too long.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    network,
    digits,
    expiryMonth: parsedExpiry.month,
    expiryYear2: parsedExpiry.year2,
    cvv,
    cardholderName,
    errors,
  };
}

export function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function extractPyDartOrderIdFromUrl(payUrl?: string | null): string {
  if (!payUrl) return "";
  try {
    const parsed = new URL(payUrl, "https://turkiyejam.com");
    const match = parsed.pathname.match(/\/pay\/([a-zA-Z0-9_-]{6,64})/);
    return match ? match[1] : "";
  } catch {
    return "";
  }
}

export function formatBankDisplayName(rawName: string): string {
  return rawName
    .replace(/\s*-\s*Retail Banking/gi, "")
    .replace(/\s*-\s*Corporate Banking/gi, " (Corporate)")
    .replace(/\(Erstwhile[- ]+/gi, "(")
    .replace(/\s{2,}/g, " ")
    .trim();
}
