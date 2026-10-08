import { NextRequest, NextResponse } from "next/server";
import { getCategories, saveCategories, StoreCategory, DEFAULT_STORE_CATEGORIES } from "@/lib/storeContent";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";
    const categories = await getCategories(all);
    return NextResponse.json({ success: true, categories });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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

    const newCategory: StoreCategory = {
      id: "cat-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 6),
      name: trimmedName,
      slug: (slug && slug.trim()) || trimmedName,
      icon: icon || "Tag",
      customIcon: customIcon ? customIcon.trim() : undefined,
      bgColor: bgColor || "bg-orange-50",
      iconColor: iconColor || "text-[#FA521C]",
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
    const body = await req.json();
    const { id, updates, reorder } = body;

    if (reorder && Array.isArray(reorder)) {
      const sanitized = reorder.map((cat: any) => ({
        ...cat,
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

    if (updates.subcategories && Array.isArray(updates.subcategories)) {
      updates.subcategories = Array.from(
        new Set(updates.subcategories.map((s: any) => String(s).trim()).filter(Boolean))
      );
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
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Category ID is required" }, { status: 400 });
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
