import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatTitleCase(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pin = searchParams.get("pincode") || searchParams.get("pin") || "";
    const cleanPin = pin.replace(/\D/g, "").slice(0, 6);

    if (cleanPin.length !== 6) {
      return NextResponse.json(
        { success: false, valid: false, error: "Pincode must be exactly 6 digits" },
        { status: 400 }
      );
    }

    let city = "";
    let district = "";
    let state = "";
    let postOffices: string[] = [];

    // 1. Primary Source: Official India Post Postal Directory API (Government of India Postal Network)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "VittalLifestyle/1.0",
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data[0]?.Status === "Success" && Array.isArray(data[0]?.PostOffice)) {
          const offices = data[0].PostOffice;
          if (offices.length > 0) {
            const primaryPo = offices[0];
            district = formatTitleCase(primaryPo.District || "");
            state = formatTitleCase(primaryPo.State || "");
            city = district || formatTitleCase(primaryPo.Name || "");
            postOffices = Array.from(new Set(offices.map((po: any) => formatTitleCase(po.Name)).filter(Boolean))) as string[];
          }
        }
      }
    } catch (apiErr) {
      console.warn("India Post API lookup warning:", apiErr);
    }

    // 2. High-speed Offline Fallback: Embedded Government India Post Pincode Database
    if (!city || !state) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pincodeCore: any = require("@devzoy/indian-pincode");
        if (pincodeCore.validate(cleanPin)) {
          const details = pincodeCore.getDetails(cleanPin);
          if (details) {
            district = formatTitleCase((details.districts && details.districts[0]) || "");
            state = formatTitleCase(details.state || "");
            city = district;
          }
        }
      } catch (offlineErr) {
        console.warn("Offline pincode lookup warning:", offlineErr);
      }
    }

    if (!city && !state) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          pincode: cleanPin,
          error: "Pincode not found in Indian postal directory",
        },
        { status: 404 }
      );
    }

    const placeDisplay = state ? (city && city.toLowerCase() !== state.toLowerCase() ? `${city}, ${state}` : state) : city;

    return NextResponse.json(
      {
        success: true,
        valid: true,
        pincode: cleanPin,
        city,
        district,
        state,
        place: placeDisplay,
        display: `${placeDisplay} - ${cleanPin}`,
        post_offices: postOffices,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Pincode lookup error" },
      { status: 500 }
    );
  }
}
