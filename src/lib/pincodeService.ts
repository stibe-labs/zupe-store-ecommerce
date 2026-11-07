import pincodeCore from "@devzoy/indian-pincode";
import centroidsData from "@/data/indiaPincodeCentroids.json";
import postOfficesData from "@/data/indiaPostOffices.json";

export interface PincodeLookupResult {
  pincode: string;
  city: string;
  district: string;
  state: string;
  post_offices: string[];
  valid: boolean;
  latitude?: number;
  longitude?: number;
}

// Convert "ERNAKULAM" -> "Ernakulam", "NEW DELHI" -> "New Delhi"
export function formatPlaceName(name: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim();
}

// Sanitize city input so it NEVER duplicates or appends the state name
export function cleanCityName(cityRaw: string, stateRaw?: string): string {
  if (!cityRaw) return "";
  let cleaned = cityRaw.trim();

  // If city contains repeated state or comma patterns like "Perumbavoor, Kerala, Kerala, Kerala"
  if (stateRaw && stateRaw.trim()) {
    const stateEscaped = stateRaw.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Strip trailing or repeated state occurrences
    const stateRegex = new RegExp(`(,\\s*${stateEscaped})+`, "gi");
    cleaned = cleaned.replace(stateRegex, "");
  }

  // Also strip common Indian state names if attached with comma
  const commonStates = [
    "Kerala", "Karnataka", "Tamil Nadu", "Maharashtra", "Delhi", "Gujarat",
    "Uttar Pradesh", "Rajasthan", "Madhya Pradesh", "West Bengal", "Andhra Pradesh",
    "Telangana", "Punjab", "Haryana", "Bihar", "Odisha", "Assam", "Goa"
  ];
  for (const st of commonStates) {
    const reg = new RegExp(`(,\\s*${st})+`, "gi");
    cleaned = cleaned.replace(reg, "");
  }

  // Strip repeated words separated by commas
  cleaned = cleaned.replace(/,\s*([a-zA-Z\s]+)(?:,\s*\1)+/gi, ", $1");

  // Remove leading/trailing commas and whitespace
  cleaned = cleaned.replace(/^[\s,]+|[\s,]+$/g, "").trim();

  return formatPlaceName(cleaned);
}

// Validate whether a 6-digit string is an authentic Indian postal PIN code
export function isValidPincode(pincode: string): boolean {
  const clean = String(pincode || "").replace(/\D/g, "");
  if (clean.length !== 6) return false;
  return Boolean(pincodeCore.validate(clean));
}

// Instant local lookup from official Government of India dataset
export function lookupPincode(pincode: string): PincodeLookupResult | null {
  const clean = String(pincode || "").replace(/\D/g, "");
  if (clean.length !== 6) return null;

  const valid = pincodeCore.validate(clean);
  if (!valid) return null;

  const details = pincodeCore.getDetails(clean);
  const rawDistrict = (details?.districts && details.districts[0]) || "";
  const rawState = details?.state || "";

  const district = formatPlaceName(rawDistrict);
  const state = formatPlaceName(rawState);
  const postOffices = (postOfficesData as Record<string, string[]>)[clean] || [];

  // Default city to the primary post office name or district name
  const primaryPo = postOffices.length > 0 ? postOffices[0].replace(/\s+(HO|SO|BO)$/i, "") : "";
  const city = primaryPo ? formatPlaceName(primaryPo) : district;

  const coords = (centroidsData as unknown as Record<string, [number, number]>)[clean];

  return {
    pincode: clean,
    city,
    district,
    state,
    post_offices: postOffices,
    valid: true,
    latitude: coords ? coords[0] / 100000 : undefined,
    longitude: coords ? coords[1] / 100000 : undefined,
  };
}

// Fast reverse lookup: Given GPS coordinates (lat, lng), finds the closest authentic Indian PIN code
export function findNearestPincode(
  lat: number,
  lng: number,
  maxDistanceKm: number = 30
): PincodeLookupResult | null {
  if (isNaN(lat) || isNaN(lng) || lat < 6 || lat > 38 || lng < 68 || lng > 98) {
    // Outside India's geographic bounding box
    return null;
  }

  const centroids = centroidsData as unknown as Record<string, [number, number]>;
  let nearestPin: string | null = null;
  let minSquaredDist = Infinity;

  const targetLatScaled = lat * 100000;
  const targetLngScaled = lng * 100000;

  for (const [pin, [cLat, cLng]] of Object.entries(centroids)) {
    const dLat = cLat - targetLatScaled;
    const dLng = cLng - targetLngScaled;
    const sqDist = dLat * dLat + dLng * dLng;

    if (sqDist < minSquaredDist) {
      minSquaredDist = sqDist;
      nearestPin = pin;
    }
  }

  if (!nearestPin) return null;

  // Approximate distance in km: 1 degree latitude ~ 111 km
  const latDiffKm = (Math.sqrt(minSquaredDist) / 100000) * 111;
  if (latDiffKm > maxDistanceKm) {
    return null;
  }

  return lookupPincode(nearestPin);
}
