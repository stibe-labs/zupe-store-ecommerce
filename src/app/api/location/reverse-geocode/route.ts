import { NextRequest, NextResponse } from "next/server";
import {
  findNearestPincode,
  lookupPincode,
  isValidPincode,
  cleanCityName,
  formatPlaceName,
} from "@/lib/pincodeService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get("lat") || searchParams.get("latitude");
    const lngStr = searchParams.get("lng") || searchParams.get("lon") || searchParams.get("longitude");
    const accuracyStr = searchParams.get("accuracy");
    const accuracy = accuracyStr ? parseFloat(accuracyStr) : null;

    if (!latStr || !lngStr) {
      return NextResponse.json(
        { success: false, error: "Latitude (lat) and Longitude (lng) are required" },
        { status: 400 }
      );
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { success: false, error: "Invalid coordinates provided" },
        { status: 400 }
      );
    }

    // Step 1: Instant high-precision reverse lookup against official Government India Post dataset
    const nearestGeo = findNearestPincode(lat, lng, 35);

    let pincode = nearestGeo?.pincode || "";
    let district = nearestGeo?.district || "";
    let state = nearestGeo?.state || "";
    let city = nearestGeo?.city || district || "";
    let postOffices: string[] = nearestGeo?.post_offices || [];
    let street = "";
    let area = "";
    let formatted_address = "";

    // Step 2: OpenStreetMap Nominatim for local street, building, and road details (fast 3.5s timeout)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "User-Agent": "ZupeStoreEcommerce/2.0 (support@zupestore.com)",
            "Accept-Language": "en-IN,en;q=0.9",
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (nomRes.ok) {
        const nomData = await nomRes.json();
        const addr = nomData.address || {};
        formatted_address = nomData.display_name || "";

        area =
          addr.suburb ||
          addr.neighbourhood ||
          addr.residential ||
          addr.colony ||
          addr.sector ||
          addr.village ||
          addr.hamlet ||
          "";

        const road = addr.road || "";
        const house = addr.house_number || addr.building || addr.house_name || "";

        const cleanParts: string[] = [];
        if (house) cleanParts.push(house);
        if (road) cleanParts.push(road);
        if (area && !cleanParts.includes(area)) {
          cleanParts.push(area);
        }

        street = cleanParts.join(", ");

        // If Nominatim provided a postcode, verify it against the official India Post directory
        if (addr.postcode) {
          const rawPin = String(addr.postcode).replace(/\D/g, "").slice(0, 6);
          if (rawPin.length === 6 && isValidPincode(rawPin)) {
            // Only accept if it is a genuinely existing Indian pincode
            const verified = lookupPincode(rawPin);
            if (verified) {
              pincode = verified.pincode;
              district = verified.district;
              state = verified.state;
              if (verified.post_offices.length > 0) {
                postOffices = verified.post_offices;
              }
            }
          }
        }

        const nomCity = addr.city || addr.town || addr.municipality || "";
        if (nomCity) {
          city = cleanCityName(nomCity, state);
        }
      }
    } catch (nomErr) {
      console.warn("Nominatim reverse geocode fallback:", nomErr);
    }

    // Step 3: Ensure city and state are clean and never duplicate
    state = formatPlaceName(state || "Kerala");
    city = cleanCityName(city || district || "Kochi", state);

    if (!street && area) {
      street = area;
    } else if (!street && postOffices.length > 0) {
      street = postOffices[0];
    } else if (!street) {
      street = `${city}, ${district}`;
    }

    const isHighAccuracy = accuracy !== null && accuracy <= 200;
    const accuracyLabel =
      accuracy === null
        ? "Detected"
        : accuracy <= 100
        ? `GPS Precision (~${Math.round(accuracy)}m)`
        : accuracy <= 500
        ? `Area Precision (~${Math.round(accuracy)}m)`
        : `Network Estimated (~${(accuracy / 1000).toFixed(1)} km)`;

    return NextResponse.json({
      success: true,
      street: street.trim(),
      area: (area || postOffices[0] || city).trim(),
      city: city.trim(),
      district: district.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      post_offices: postOffices,
      formatted_address: formatted_address || [street, city, state, pincode].filter(Boolean).join(", "),
      coordinates: { lat, lng },
      accuracy_meters: accuracy,
      is_high_accuracy: isHighAccuracy,
      accuracy_label: accuracyLabel,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to reverse geocode location" },
      { status: 500 }
    );
  }
}
