import { NextRequest, NextResponse } from "next/server";
import { getSuppliers, addSupplier, updateSupplier } from "@/lib/erpStore";

export async function GET(req: NextRequest) {
  try {
    const suppliers = await getSuppliers();
    return NextResponse.json({ success: true, suppliers });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, code, contact_person, email, phone, address, initial_rto_balance } = body;

    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: "Supplier Name and Supplier Code are required" },
        { status: 400 }
      );
    }

    const supplier = await addSupplier({
      name,
      code,
      contact_person,
      email,
      phone,
      address,
      initial_rto_balance: Number(initial_rto_balance) || 0,
    });

    return NextResponse.json({ success: true, supplier });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Supplier ID is required" },
        { status: 400 }
      );
    }

    const updated = await updateSupplier(id, updates);
    return NextResponse.json({ success: true, supplier: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
