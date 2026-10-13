export interface BaseAddress {
  id?: string;
  street?: string;
  postal_code?: string;
  postalCode?: string;
  is_default?: boolean | number;
  [key: string]: any;
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
    const key = normalizeAddressKey(addr.street, addr.postal_code || addr.postalCode);
    const isDef = Boolean(addr.is_default && addr.is_default !== 0);

    if (!map.has(key)) {
      const finalIsDef = isDef && !defaultFound;
      if (finalIsDef) defaultFound = true;
      map.set(key, { ...addr, is_default: finalIsDef });
    } else {
      // If a duplicate entry had is_default = true and we haven't seen one yet, transfer default
      if (isDef && !defaultFound) {
        defaultFound = true;
        const existing = map.get(key)!;
        map.set(key, { ...existing, is_default: true });
      }
    }
  }

  const result = Array.from(map.values());
  if (!defaultFound && result.length > 0) {
    result[0] = { ...result[0], is_default: true };
  }
  return result;
}
