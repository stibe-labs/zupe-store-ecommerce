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
    let city = req.headers.get("cf-ipcity") || "";
    let state = req.headers.get("cf-region") || "";
    let pincode = (req.headers.get("cf-postal-code") || "").replace(/\D/g, "").slice(0, 6);

    // If headers didn't provide complete info, query ip-api.com
    if (!city || !pincode || pincode.length !== 6) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const ipRes = await fetch("http://ip-api.com/json", {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (ipRes.ok) {
          const ipData = await ipRes.json();
          if (ipData.status === "success" && ipData.countryCode === "IN") {
            if (!city && ipData.city) city = ipData.city;
            if (!state && ipData.regionName) state = ipData.regionName;
            if (!pincode && ipData.zip) {
              const cleanZip = String(ipData.zip).replace(/\D/g, "").slice(0, 6);
              if (cleanZip.length === 6) pincode = cleanZip;
            }
          }
        }
      } catch (ipErr) {
        console.warn("IP geolocation fallback warning:", ipErr);
      }
    }

    // If we have a 6-digit pincode, reconcile with Government India Post directory
    if (pincode && pincode.length === 6) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pincodeCore: any = require("@devzoy/indian-pincode");
        if (pincodeCore.validate(pincode)) {
          const details = pincodeCore.getDetails(pincode);
          if (details) {
            city = formatTitleCase((details.districts && details.districts[0]) || city);
            state = formatTitleCase(details.state || state);
          }
        }
      } catch (err) {
        console.warn("Auto-detect pincode reconcile warning:", err);
      }
    }

    city = formatTitleCase(city) || "Thrissur";
    state = formatTitleCase(state) || "Kerala";
    pincode = pincode && pincode.length === 6 ? pincode : "680001";

    const place = `${city}, ${state}`;
    const display = `${place} - ${pincode}`;

    return NextResponse.json({
      success: true,
      city,
      state,
      pincode,
      place,
      display,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      city: "Thrissur",
      state: "Kerala",
      pincode: "680001",
      place: "Thrissur, Kerala",
      display: "Thrissur, Kerala - 680001",
    });
  }
}
