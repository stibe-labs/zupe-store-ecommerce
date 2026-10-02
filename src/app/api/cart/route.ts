import { NextRequest, NextResponse } from "next/server";
import { executeD1Query } from "@/lib/d1";

// In-memory cart fallback by userId
const userCarts = new Map<string, any[]>();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: true, items: [] });
    }

    // Try D1
    try {
      const d1Results = await executeD1Query(
        "SELECT cart_data FROM user_carts WHERE user_id = ?",
        [userId]
      );
      if (d1Results && d1Results.length > 0 && d1Results[0].cart_data) {
        const items = JSON.parse(d1Results[0].cart_data);
        return NextResponse.json({ success: true, items });
      }
    } catch (err) {
      // Fall through to memory
    }

    const items = userCarts.get(userId) || [];
    return NextResponse.json({ success: true, items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, items } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 });
    }

    userCarts.set(userId, items || []);

    // Sync to D1 if table exists
    try {
      await executeD1Query(
        `INSERT OR REPLACE INTO user_carts (user_id, cart_data, updated_at) VALUES (?, ?, ?)`,
        [userId, JSON.stringify(items || []), new Date().toISOString()]
      );
    } catch (err) {
      // Fail silently
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
