import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/couponStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal, items } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { success: false, valid: false, error: "Please enter a valid promo code." },
        { status: 400 }
      );
    }

    const subtotalNum = Number(subtotal) || 0;
    const itemsList = Array.isArray(items) ? items : [];

    const result = await validateCoupon(code, subtotalNum, itemsList);

    if (!result.valid) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: result.error || "Invalid promo code.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      discount: result.discount,
      code: result.code,
      description: result.description,
      message: result.message,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        valid: false,
        error: err.message || "Failed to validate promo code.",
      },
      { status: 500 }
    );
  }
}
