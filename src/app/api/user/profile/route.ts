import { NextRequest, NextResponse } from "next/server";
import { updateUserAsync, findUserByEmailAsync } from "@/lib/userStore";
import { getAuthenticatedUser } from "@/lib/userAuth";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get("email")?.toLowerCase().trim();

    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ success: false, error: "Authentication required to access user profile" }, { status: 401 });
    }

    // Only admin can query other users' profiles
    const targetEmail = auth.isAdmin && queryEmail ? queryEmail : auth.user.email;
    if (!auth.isAdmin && queryEmail && queryEmail !== auth.user.email) {
      return NextResponse.json({ success: false, error: "Forbidden: Cannot access another user's profile" }, { status: 403 });
    }

    const user = await findUserByEmailAsync(targetEmail);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role || "customer",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ success: false, error: "Authentication required to update profile" }, { status: 401 });
    }

    const body = await req.json();
    const { email, name, phone } = body;

    const targetEmail = auth.isAdmin && email ? email.toLowerCase().trim() : auth.user.email;
    if (!auth.isAdmin && email && email.toLowerCase().trim() !== auth.user.email) {
      return NextResponse.json({ success: false, error: "Forbidden: Cannot modify another user's profile" }, { status: 403 });
    }

    const updated = await updateUserAsync(targetEmail, { name, phone });
    if (!updated) {
      return NextResponse.json({ success: false, error: "Could not update user" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone || "",
        role: updated.role || "customer",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
