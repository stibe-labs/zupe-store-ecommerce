import { NextRequest, NextResponse } from "next/server";
import { TJ_CATALOG_PRODUCTS, formatProductForShiprocket } from "@/lib/fastrr";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const products = TJ_CATALOG_PRODUCTS.map(formatProductForShiprocket);

    return NextResponse.json({
      data: {
        total: products.length,
        products,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch collection products" }, { status: 500 });
  }
}
