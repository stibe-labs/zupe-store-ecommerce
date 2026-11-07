import { NextRequest, NextResponse } from "next/server";
import { lookupPincode, isValidPincode } from "@/lib/pincodeService";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pin = searchParams.get("pincode") || searchParams.get("pin");

    if (!pin) {
      return NextResponse.json(
        { success: false, valid: false, error: "Pincode is required" },
        { status: 400 }
      );
    }

    const cleanPin = pin.replace(/\D/g, "");
    if (cleanPin.length !== 6) {
      return NextResponse.json(
        { success: false, valid: false, error: "Pincode must be exactly 6 digits" },
        { status: 400 }
      );
    }

    const details = lookupPincode(cleanPin);
    if (!details || !details.valid) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          pincode: cleanPin,
          error: "Pincode not found in India Post directory",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        valid: true,
        pincode: details.pincode,
        city: details.city,
        district: details.district,
        state: details.state,
        post_offices: details.post_offices,
        coordinates: {
          lat: details.latitude,
          lng: details.longitude,
        },
      },
      {
        headers: {
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Pincode lookup failed" },
      { status: 500 }
    );
  }
}
