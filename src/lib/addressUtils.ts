export interface BaseAddress {
  id?: string;
  street?: string;
  postal_code?: string;
  postalCode?: string;
  city?: string;
  state?: string;
  is_default?: boolean | number;
  [key: string]: any;
}

/**
 * Sanitizes street/complete address by removing duplicated city, state, postal code,
 * "India", and repeated comma-separated segments.
 */
export function cleanStreetAddress(
  rawStreet?: string,
  city?: string,
  state?: string,
  postalCode?: string
): string {
  if (!rawStreet) return "";

  const text = rawStreet.trim();
  const normCity = (city || "").toLowerCase().trim();
  const normState = (state || "").toLowerCase().trim();
  const normPin = (postalCode || "").replace(/\D/g, "").trim();

  // If postal code is in text, extract it if not explicitly passed
  const extractedPinMatch = text.match(/\b([1-9][0-9]{5})\b/);
  const targetPin = normPin || (extractedPinMatch ? extractedPinMatch[1] : "");

  const parts = text.split(",").map((p) => p.trim()).filter(Boolean);
  const seen = new Set<string>();
  const cleanParts: string[] = [];

  for (const part of parts) {
    const lower = part.toLowerCase();
    const digitsOnly = part.replace(/\D/g, "");

    // Skip isolated 6-digit pin codes
    if (digitsOnly.length === 6 && (digitsOnly === targetPin || !targetPin)) {
      continue;
    }

    // Skip isolated country, city, state, or state-pincode
    if (
      lower === "india" ||
      (normCity && lower === normCity) ||
      (normState && lower === normState) ||
      (normState && targetPin && (lower === `${normState} ${targetPin}` || lower === `${normState}-${targetPin}`)) ||
      (normCity && normState && lower === `${normCity} ${normState}`)
    ) {
      continue;
    }

    // Strip trailing or embedded city, state, pincode words
    let cleanedPart = part;
    if (targetPin) {
      cleanedPart = cleanedPart.replace(new RegExp(`\\b${targetPin}\\b`, "gi"), "").trim();
    }
    if (normState) {
      cleanedPart = cleanedPart.replace(new RegExp(`\\b${normState}\\b`, "gi"), "").trim();
    }
    if (normCity) {
      cleanedPart = cleanedPart.replace(new RegExp(`\\b${normCity}\\b`, "gi"), "").trim();
    }
    cleanedPart = cleanedPart.replace(/\s+/g, " ").replace(/^[, -]+|[, -]+$/g, "").trim();

    if (!cleanedPart) continue;

    // Deduplicate identical segments (case-insensitive)
    const normKey = cleanedPart.toLowerCase();
    if (!seen.has(normKey)) {
      seen.add(normKey);
      cleanParts.push(cleanedPart);
    }
  }

  const result = cleanParts.join(", ");
  return (result || text).slice(0, 200);
}

export function normalizeAddressKey(street?: string, postalCode?: string): string {
  const cleanStreet = (street || "")
    .toLowerCase()
    .replace(/[,\.\-\/\\#]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const cleanPostal = (postalCode || "").replace(/\D/g, "").trim();
  return `${cleanStreet}|${cleanPostal}`;
}

export function deduplicateAddresses<T extends Record<string, any>>(list: T[]): T[] {
  if (!Array.isArray(list)) return [];
  const map = new Map<string, T>();
  let defaultFound = false;

  for (const addr of list) {
    if (!addr || !addr.street) continue;
    const sanitizedStreet = cleanStreetAddress(
      addr.street,
      addr.city,
      addr.state,
      addr.postal_code || addr.postalCode
    );
    const key = normalizeAddressKey(sanitizedStreet, addr.postal_code || addr.postalCode);
    const isDef = Boolean(addr.is_default && addr.is_default !== 0);

    const normalizedItem = {
      ...addr,
      street: sanitizedStreet,
    };

    if (!map.has(key)) {
      const finalIsDef = isDef && !defaultFound;
      if (finalIsDef) defaultFound = true;
      map.set(key, { ...normalizedItem, is_default: finalIsDef });
    } else {
      // If a duplicate entry had is_default = true and we haven't seen one yet, transfer default
      if (isDef && !defaultFound) {
        defaultFound = true;
        const existing = map.get(key)!;
        map.set(key, { ...existing, ...normalizedItem, is_default: true });
      }
    }
  }

  const result = Array.from(map.values());
  if (!defaultFound && result.length > 0) {
    result[0] = { ...result[0], is_default: true };
  }
  return result;
}
