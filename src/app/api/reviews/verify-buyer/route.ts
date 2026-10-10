import { NextRequest, NextResponse } from "next/server";
import { getOrders } from "@/lib/orderStore";
import { getERPOrders } from "@/lib/erpStore";
import { executeD1Query } from "@/lib/d1";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";

function normalizeText(s: string): string {
  return (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = (searchParams.get("productId") || "").trim();
    const productName = (searchParams.get("productName") || "").trim();
    const email = (searchParams.get("email") || "").toLowerCase().trim();
    const phone = (searchParams.get("phone") || "").replace(/\D/g, "");
    const orderId = (searchParams.get("orderId") || "").trim();

    if (!productId && !productName) {
      return NextResponse.json(
        { success: false, error: "Product ID, slug, or product name is required" },
        { status: 400 }
      );
    }

    if (!email && !phone && !orderId) {
      return NextResponse.json({
        success: true,
        isVerified: false,
        message: "Please sign in to verify your purchase.",
      });
    }

    // Resolve product identifiers and aliases from DEFAULT_PRODUCTS
    const targetNormId = normalizeText(productId);
    const targetNormName = normalizeText(productName);

    const matchingCatalog = DEFAULT_PRODUCTS.find((p) => {
      const pNormId = normalizeText(p.id);
      const pNormSlug = normalizeText(p.slug || "");
      const pNormName = normalizeText(p.name);
      return (
        (targetNormId && (pNormId === targetNormId || pNormSlug === targetNormId || pNormName === targetNormId)) ||
        (targetNormName && (pNormName === targetNormName || pNormSlug === targetNormName))
      );
    });

    const candidateAliases = new Set<string>();
    if (targetNormId) candidateAliases.add(targetNormId);
    if (targetNormName) candidateAliases.add(targetNormName);
    if (matchingCatalog) {
      candidateAliases.add(normalizeText(matchingCatalog.id));
      if (matchingCatalog.slug) candidateAliases.add(normalizeText(matchingCatalog.slug));
      candidateAliases.add(normalizeText(matchingCatalog.name));
    }

    // Helper to test if a single item matches this product
    const isItemMatch = (rawId: any, rawName: any) => {
      const itNormId = normalizeText(String(rawId || ""));
      const itNormName = normalizeText(String(rawName || ""));

      for (const alias of candidateAliases) {
        if (!alias) continue;
        if (itNormId === alias || itNormName === alias) return true;
        if (alias.length >= 4 && (itNormId.includes(alias) || alias.includes(itNormId))) return true;
        if (alias.length >= 4 && (itNormName.includes(alias) || alias.includes(itNormName))) return true;
      }
      return false;
    };

    const matchesProduct = (items: any[]) => {
      if (!Array.isArray(items)) return false;
      return items.some((it) => isItemMatch(it.product_id || it.id, it.name || it.product_name));
    };

    // 1. Check Storefront Orders
    const allStoreOrders = getOrders();

    if (orderId) {
      const match = allStoreOrders.find((o) => o.id.toLowerCase() === orderId.toLowerCase());
      if (match && matchesProduct(match.items)) {
        return NextResponse.json({
          success: true,
          isVerified: true,
          orderId: match.id,
          customerName: match.customer_name,
          customerEmail: match.customer_email,
        });
      }
    }

    const userStoreOrders = allStoreOrders.filter((o) => {
      const oEmail = (o.customer_email || "").toLowerCase().trim();
      const oPhone = (o.customer_phone || "").replace(/\D/g, "");
      return (
        (email && oEmail === email) ||
        (phone && oPhone.length >= 7 && (oPhone.includes(phone) || phone.includes(oPhone)))
      );
    });

    for (const o of userStoreOrders) {
      if (matchesProduct(o.items)) {
        return NextResponse.json({
          success: true,
          isVerified: true,
          orderId: o.id,
          customerName: o.customer_name,
          customerEmail: o.customer_email,
        });
      }
    }

    // 2. Check ERP Orders
    try {
      const allErpOrders = await getERPOrders();

      if (orderId) {
        const matchErp = allErpOrders.find((o) => o.id.toLowerCase() === orderId.toLowerCase());
        if (matchErp) {
          let items = matchErp.items;
          if (typeof items === "string") {
            try { items = JSON.parse(items); } catch { items = []; }
          }
          if (matchesProduct(items)) {
            return NextResponse.json({
              success: true,
              isVerified: true,
              orderId: matchErp.id,
              customerName: matchErp.customer_name,
              customerEmail: matchErp.guest_email,
            });
          }
        }
      }

      const userErpOrders = allErpOrders.filter((o) => {
        const oEmail = (o.guest_email || "").toLowerCase().trim();
        const oPhone = (o.customer_phone || "").replace(/\D/g, "");
        return (
          (email && oEmail === email) ||
          (phone && oPhone.length >= 7 && (oPhone.includes(phone) || phone.includes(oPhone)))
        );
      });

      for (const o of userErpOrders) {
        let items = o.items;
        if (typeof items === "string") {
          try { items = JSON.parse(items); } catch { items = []; }
        }
        if (matchesProduct(items)) {
          return NextResponse.json({
            success: true,
            isVerified: true,
            orderId: o.id,
            customerName: o.customer_name,
            customerEmail: o.guest_email,
          });
        }
      }
    } catch (erpErr) {
      console.warn("ERP verify buyer lookup error:", erpErr);
    }

    // 3. Check D1 Database directly if available
    try {
      const emailQuery = email || "";
      const phoneQuery = phone || "";
      if (emailQuery || phoneQuery) {
        const d1Rows = await executeD1Query(
          `SELECT o.id, o.user_id, o.guest_email, oi.product_id, oi.product_name 
           FROM orders o 
           JOIN order_items oi ON o.id = oi.order_id 
           WHERE LOWER(o.guest_email) = ? OR LOWER(o.user_id) = ?`,
          [emailQuery, emailQuery]
        );

        if (Array.isArray(d1Rows)) {
          for (const row of d1Rows) {
            if (isItemMatch(row.product_id, row.product_name)) {
              return NextResponse.json({
                success: true,
                isVerified: true,
                orderId: row.id,
                customerName: row.user_id || email.split("@")[0],
                customerEmail: row.guest_email || email,
              });
            }
          }
        }
      }
    } catch (d1Err) {
      console.warn("D1 verify buyer query fallback:", d1Err);
    }

    return NextResponse.json({
      success: true,
      isVerified: false,
      message: `No verified purchase found for this product under ${email || "your account"}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
