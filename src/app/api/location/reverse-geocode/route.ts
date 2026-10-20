import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get("lat") || searchParams.get("latitude");
    const lngStr = searchParams.get("lng") || searchParams.get("lon") || searchParams.get("longitude");

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

    let street = "";
    let city = "";
    let state = "";
    let pincode = "";
    let formatted_address = "";

    // 1. Primary Provider: OpenStreetMap Nominatim
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            "User-Agent": "ZupeStoreEcommerce/1.0 (support@zupestore.com)",
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

        // Build a readable street address line
        const streetParts = [
          addr.house_number || addr.building,
          addr.road,
          addr.residential,
          addr.neighbourhood,
          addr.suburb,
        ].filter(Boolean);

        street = streetParts.join(", ") || (formatted_address ? formatted_address.split(",").slice(0, 3).join(", ").trim() : "");
        city = addr.city || addr.town || addr.village || addr.suburb || addr.city_district || addr.county || "";
        state = addr.state || "";

        if (addr.postcode) {
          pincode = String(addr.postcode).replace(/\D/g, "").slice(0, 6);
        }
      }
    } catch (nomErr) {
      console.warn("Nominatim reverse geocode fallback:", nomErr);
    }

    // 2. Secondary Provider Fallback: BigDataCloud Reverse Geocoding
    if (!city || !state || !pincode) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const bdcRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (bdcRes.ok) {
          const bdcData = await bdcRes.json();
          if (!city) city = bdcData.city || bdcData.locality || "";
          if (!state) state = bdcData.principalSubdivision || "";
          if (!pincode && bdcData.postcode) {
            pincode = String(bdcData.postcode).replace(/\D/g, "").slice(0, 6);
          }
          if (!street && bdcData.locality) {
            street = bdcData.locality;
          }
        }
      } catch (bdcErr) {
        console.warn("BigDataCloud fallback warning:", bdcErr);
      }
    }

    // 3. Optional Post-Office refinement if pincode is available but city/state is generic
    if (pincode && pincode.length === 6 && (!city || !state)) {
      try {
        const pinRes = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        if (pinRes.ok) {
          const pinData = await pinRes.json();
          if (Array.isArray(pinData) && pinData[0]?.Status === "Success" && pinData[0]?.PostOffice?.length > 0) {
            const po = pinData[0].PostOffice[0];
            if (!city && po.District) city = po.District;
            if (!state && po.State) state = po.State;
          }
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      formatted_address: formatted_address || [street, city, state, pincode].filter(Boolean).join(", "),
      coordinates: { lat, lng },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to reverse geocode location" },
      { status: 500 }
    );
  }
}
