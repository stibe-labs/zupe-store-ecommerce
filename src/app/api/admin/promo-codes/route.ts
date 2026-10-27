import { NextRequest, NextResponse } from "next/server";
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponActive,
  Coupon,
} from "@/lib/couponStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const coupons = await getAllCoupons();

    const now = Date.now();
    let activeCount = 0;
    let expiredCount = 0;
    let totalUses = 0;

    coupons.forEach((c) => {
      totalUses += c.usage_count || 0;
      const isExpired = c.expires_at ? new Date(c.expires_at).getTime() < now : false;
      if (isExpired) {
        expiredCount++;
      } else if (c.is_active) {
        activeCount++;
      }
    });

    return NextResponse.json({
      success: true,
      coupons,
      kpis: {
        total: coupons.length,
        active: activeCount,
        expired: expiredCount,
        totalUses,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load promo codes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.code || !body.code.trim()) {
      return NextResponse.json(
        { success: false, error: "Promo code is required." },
        { status: 400 }
      );
    }

    if (body.discount_value === undefined || Number(body.discount_value) <= 0) {
      return NextResponse.json(
        { success: false, error: "A valid positive discount value is required." },
        { status: 400 }
      );
    }

    if (body.discount_type === "PERCENTAGE" && Number(body.discount_value) > 100) {
      return NextResponse.json(
        { success: false, error: "Percentage discount cannot exceed 100%." },
        { status: 400 }
      );
    }

    const newCoupon = await createCoupon({
      code: body.code,
      description: body.description,
      discount_type: body.discount_type === "FLAT" ? "FLAT" : "PERCENTAGE",
      discount_value: Number(body.discount_value),
      min_order_amount: body.min_order_amount ? Number(body.min_order_amount) : 0,
      max_discount_amount: body.max_discount_amount ? Number(body.max_discount_amount) : null,
      expires_at: body.expires_at || null,
      usage_limit: body.usage_limit ? Number(body.usage_limit) : null,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
      applicable_type: body.applicable_type === "SPECIFIC" ? "SPECIFIC" : "ALL",
      applicable_products: Array.isArray(body.applicable_products) ? body.applicable_products : [],
    });

    return NextResponse.json({ success: true, coupon: newCoupon });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create promo code" },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, is_active, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Coupon ID is required." },
        { status: 400 }
      );
    }

    // Quick toggle action
    if (action === "toggle") {
      const success = await toggleCouponActive(id, Boolean(is_active));
      return NextResponse.json({ success });
    }

    // Full update
    if (updates.discount_type === "PERCENTAGE" && updates.discount_value && Number(updates.discount_value) > 100) {
      return NextResponse.json(
        { success: false, error: "Percentage discount cannot exceed 100%." },
        { status: 400 }
      );
    }

    const updated = await updateCoupon(id, {
      ...updates,
      is_active: is_active !== undefined ? Boolean(is_active) : undefined,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Promo code not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, coupon: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update promo code" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Coupon ID is required." },
        { status: 400 }
      );
    }

    const success = await deleteCoupon(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete promo code" },
      { status: 500 }
    );
  }
}
