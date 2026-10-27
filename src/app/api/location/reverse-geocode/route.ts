import { NextRequest, NextResponse } from "next/server";

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

    let street = "";
    let area = "";
    let city = "";
    let district = "";
    let state = "";
    let pincode = "";
    let formatted_address = "";
    let postOffices: string[] = [];

    // 1. Primary Provider: OpenStreetMap Nominatim with zoom=18 for building/rooftop level precision
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

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

        // Specific area / colony / neighborhood
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

        // Build clean street address without obscure administrative codes
        const cleanParts: string[] = [];
        if (house) cleanParts.push(house);
        if (road && !road.match(/^(NH|SH|MDR)\s*\d+/i)) {
          cleanParts.push(road);
        } else if (road) {
          cleanParts.push(road);
        }
        if (area && !cleanParts.includes(area)) {
          cleanParts.push(area);
        }

        street = cleanParts.join(", ") || (formatted_address ? formatted_address.split(",").slice(0, 3).join(", ").trim() : "");

        district = addr.state_district || addr.district || addr.county || "";
        city = addr.city || addr.town || addr.municipality || district || "";
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
          if (!area && bdcData.locality) {
            area = bdcData.locality;
          }
          if (!street && bdcData.locality) {
            street = bdcData.locality;
          }
        }
      } catch (bdcErr) {
        console.warn("BigDataCloud fallback warning:", bdcErr);
      }
    }

    // 3. Indian Postal Pincode Auto-Reconciliation (India Post Official Directory)
    if (pincode && pincode.length === 6) {
      try {
        const pinController = new AbortController();
        const pinTimeout = setTimeout(() => pinController.abort(), 4000);

        const pinRes = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
          signal: pinController.signal,
        });
        clearTimeout(pinTimeout);

        if (pinRes.ok) {
          const pinData = await pinRes.json();
          if (Array.isArray(pinData) && pinData[0]?.Status === "Success" && Array.isArray(pinData[0]?.PostOffice)) {
            const offices = pinData[0].PostOffice;
            if (offices.length > 0) {
              const primaryPo = offices[0];
              // Use official Indian Postal District as the standardized city/district for couriers
              if (primaryPo.District) {
                district = primaryPo.District;
                // If current city is a smaller municipality, taluk or village, standardize with District
                city = primaryPo.District;
              }
              if (primaryPo.State) {
                state = primaryPo.State;
              }

              // Extract all local post offices in this pincode
              postOffices = Array.from(
                new Set(offices.map((po: any) => po.Name).filter(Boolean))
              ) as string[];

              // If area is empty or generic, use the main delivery post office
              if (!area && offices[0].Name) {
                area = offices[0].Name;
              }
            }
          }
        }
      } catch (pinErr) {
        console.warn("India Post API lookup warning:", pinErr);
      }
    }

    // Format final clean street address
    let finalStreet = street.trim();
    if (!finalStreet && area) {
      finalStreet = area;
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
      street: finalStreet,
      area: area.trim(),
      city: city.trim(),
      district: district.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      post_offices: postOffices,
      formatted_address: formatted_address || [finalStreet, city, state, pincode].filter(Boolean).join(", "),
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

