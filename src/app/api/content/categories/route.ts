import { NextRequest, NextResponse } from "next/server";
import { getCategories, saveCategories, StoreCategory, DEFAULT_STORE_CATEGORIES } from "@/lib/storeContent";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminAuth";
import { uploadBase64Media } from "@/lib/r2";

async function checkAdminAuth(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;
  const session = await verifyAdminSessionToken(token);
  return session.valid;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";
    const categories = await getCategories(all);
    return NextResponse.json(
      { success: true, categories },
      { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" } }
    );
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
      const reset = await saveCategories([...DEFAULT_STORE_CATEGORIES]);
      return NextResponse.json({ success: true, categories: reset });
    }

    const {
      name,
      slug,
      icon,
      customIcon,
      iconSize,
      iconShape,
      bgColor,
      iconColor,
      showInNavbar,
      showInPills,
      showInCollections,
      active,
      subcategories,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Category name is required" }, { status: 400 });
    }

    const current = await getCategories(true);
    const trimmedName = name.trim();

    // Check duplicate
    if (current.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase())) {
      return NextResponse.json({ success: false, error: "A category with this name already exists" }, { status: 400 });
    }

    const cleanSubcategories = Array.isArray(subcategories)
      ? Array.from(new Set(subcategories.map((s: any) => String(s).trim()).filter(Boolean)))
      : [];

    let resolvedCustomIcon = customIcon ? customIcon.trim() : undefined;
    if (resolvedCustomIcon && resolvedCustomIcon.startsWith("data:")) {
      try {
        resolvedCustomIcon = await uploadBase64Media(resolvedCustomIcon, "images");
      } catch (uploadErr) {
        console.warn("Failed to upload category icon to R2, stripping base64 to protect Worker CPU:", uploadErr);
        resolvedCustomIcon = undefined;
      }
    }

    const newCategory: StoreCategory = {
      id: "cat-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 6),
      name: trimmedName,
      slug: (slug && slug.trim()) || trimmedName,
      icon: icon || "Tag",
      customIcon: resolvedCustomIcon,
      iconSize: typeof iconSize === "number" ? Math.min(100, Math.max(50, iconSize)) : 85,
      iconShape: iconShape === "square" ? "square" : "round",
      bgColor: bgColor || "bg-orange-50",
      iconColor: iconColor || "text-[#FF7A00]",
      showInNavbar: showInNavbar !== false,
      showInPills: showInPills !== false,
      showInCollections: showInCollections !== false,
      order: current.length + 1,
      active: active !== false,
      subcategories: cleanSubcategories,
    };

    const updated = await saveCategories([...current, newCategory]);
    return NextResponse.json({ success: true, category: newCategory, categories: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin privileges required." },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Action 1: Bulk update all icons shape ("round" or "square")
    if (body.action === "update_all_shapes" && (body.iconShape === "round" || body.iconShape === "square")) {
      const current = await getCategories(true);
      const updated = current.map((c) => ({
        ...c,
        iconShape: body.iconShape as "round" | "square",
      }));
      const saved = await saveCategories(updated);
      return NextResponse.json({ success: true, categories: saved });
    }

    const { id, updates, reorder, applyShapeToAll } = body;

    if (reorder && Array.isArray(reorder)) {
      const sanitized = reorder.map((cat: any) => ({
        ...cat,
        customIcon: cat.customIcon?.startsWith("data:") ? undefined : cat.customIcon,
        subcategories: Array.isArray(cat.subcategories)
          ? Array.from(new Set(cat.subcategories.map((s: any) => String(s).trim()).filter(Boolean)))
          : [],
      }));
      const updated = await saveCategories(sanitized);
      return NextResponse.json({ success: true, categories: updated });
    }

    if (!id || !updates) {
      return NextResponse.json({ success: false, error: "Missing category ID or updates" }, { status: 400 });
    }

    const current = await getCategories(true);
    const index = current.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    if (updates.customIcon && typeof updates.customIcon === "string" && updates.customIcon.startsWith("data:")) {
      try {
        updates.customIcon = await uploadBase64Media(updates.customIcon, "images");
      } catch (uploadErr) {
        console.warn("Failed to upload updated category icon to R2, reverting:", uploadErr);
        delete updates.customIcon;
      }
    }

    if (updates.subcategories && Array.isArray(updates.subcategories)) {
      updates.subcategories = Array.from(
        new Set(updates.subcategories.map((s: any) => String(s).trim()).filter(Boolean))
      );
    }

    // If applyShapeToAll is true, apply the selected shape to ALL categories
    if (applyShapeToAll && (updates.iconShape === "round" || updates.iconShape === "square")) {
      const targetShape = updates.iconShape;
      const updatedList = current.map((c) => {
        if (c.id === id) {
          return { ...c, ...updates, iconShape: targetShape };
        }
        return { ...c, iconShape: targetShape };
      });
      const saved = await saveCategories(updatedList);
      return NextResponse.json({ success: true, category: saved.find((c) => c.id === id), categories: saved });
    }

    current[index] = { ...current[index], ...updates };
    const updated = await saveCategories([...current]);

    return NextResponse.json({ success: true, category: current[index], categories: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin privileges required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Category ID is required" }, { status: 400 });
    }

    if (id === "all") {
      return NextResponse.json(
        {
          success: false,
          error: "The primary 'All Categories' pill cannot be deleted. You can hide it by toggling 'Active' or 'In Home Pills'.",
        },
        { status: 400 }
      );
    }

    const current = await getCategories(true);
    const filtered = current.filter((c) => c.id !== id);

    if (filtered.length === current.length) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    const updated = await saveCategories(filtered);
    return NextResponse.json({ success: true, message: "Category deleted successfully", categories: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
