import { NextRequest, NextResponse } from "next/server";
import {
  getShowcaseCollections,
  saveShowcaseCollections,
  DEFAULT_SHOWCASE_COLLECTIONS,
  ShowcaseCollectionsConfig,
} from "@/lib/storeContent";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";

async function checkAdminAuth(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;
  const session = await verifyAdminSessionToken(token);
  return session.valid;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const collections = await getShowcaseCollections();
    return NextResponse.json({ success: true, collections });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin privileges required." },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (body.action === "reset_defaults") {
      const reset = await saveShowcaseCollections({ ...DEFAULT_SHOWCASE_COLLECTIONS });
      return NextResponse.json({ success: true, collections: reset });
    }

    const { collections } = body;
    if (!collections || typeof collections !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid collections payload provided." },
        { status: 400 }
      );
    }

    const validatedConfig: ShowcaseCollectionsConfig = {
      topPickzProductIds: Array.isArray(collections.topPickzProductIds)
        ? collections.topPickzProductIds.map(String)
        : [],
      newArrivalsProductIds: Array.isArray(collections.newArrivalsProductIds)
        ? collections.newArrivalsProductIds.map(String)
        : [],
      bestSellersProductIds: Array.isArray(collections.bestSellersProductIds)
        ? collections.bestSellersProductIds.map(String)
        : [],
      todayDealsProductIds: Array.isArray(collections.todayDealsProductIds)
        ? collections.todayDealsProductIds.map(String)
        : [],
    };

    const updated = await saveShowcaseCollections(validatedConfig);
    return NextResponse.json({ success: true, collections: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
