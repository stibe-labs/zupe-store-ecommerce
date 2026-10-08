import { NextRequest, NextResponse } from "next/server";
import {
  getUserAddresses,
  saveUserAddress,
  deleteUserAddress,
  setDefaultUserAddress,
  UserAddress,
} from "@/lib/addressStore";
import { getAuthenticatedUser } from "@/lib/userAuth";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get("email")?.toLowerCase().trim();
    const userId = searchParams.get("userId") || undefined;

    if (!auth.authenticated || !auth.user) {
      if (!queryEmail) {
        return NextResponse.json(
          { success: false, error: "Authentication or email required" },
          { status: 401 }
        );
      }
    }

    const targetEmail =
      auth.isAdmin && queryEmail
        ? queryEmail
        : auth.user
        ? auth.user.email
        : queryEmail!;

    if (!auth.isAdmin && auth.user && queryEmail && queryEmail !== auth.user.email) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Cannot access addresses of another user" },
        { status: 403 }
      );
    }

    const addresses = await getUserAddresses(targetEmail, userId);
    return NextResponse.json({ success: true, addresses });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load addresses" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    const body = await req.json();
    const {
      id,
      user_id,
      user_email,
      recipient_name,
      phone,
      street,
      city,
      state,
      postal_code,
      country,
      is_default,
      tag,
    } = body;

    if (!user_email || !recipient_name || !street || !city || !postal_code) {
      return NextResponse.json(
        { success: false, error: "Missing required address fields" },
        { status: 400 }
      );
    }

    const normalizedEmail = user_email.toLowerCase().trim();

    if (auth.authenticated && auth.user && !auth.isAdmin && normalizedEmail !== auth.user.email) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Cannot save address for another user" },
        { status: 403 }
      );
    }

    const address: UserAddress = {
      id: id || `addr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: user_id || auth.user?.id,
      user_email: normalizedEmail,
      recipient_name: recipient_name.trim(),
      phone: phone ? phone.trim() : "",
      street: street.trim(),
      city: city.trim(),
      state: state ? state.trim() : "",
      postal_code: postal_code.trim(),
      country: country || "India",
      is_default: !!is_default,
      tag: tag || "Home",
      created_at: new Date().toISOString(),
    };

    const saved = await saveUserAddress(address);
    return NextResponse.json({ success: true, address: saved });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save address" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");

    if (!id || !email) {
      return NextResponse.json(
        { success: false, error: "Address ID and email are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (auth.authenticated && auth.user && !auth.isAdmin && normalizedEmail !== auth.user.email) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Cannot delete address for another user" },
        { status: 403 }
      );
    }

    const ok = await deleteUserAddress(id, normalizedEmail);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete address" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    const body = await req.json();
    const { id, email, action } = body;

    if (!id || !email) {
      return NextResponse.json(
        { success: false, error: "Address ID and email are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (auth.authenticated && auth.user && !auth.isAdmin && normalizedEmail !== auth.user.email) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Cannot modify address for another user" },
        { status: 403 }
      );
    }

    if (action === "set_default") {
      const ok = await setDefaultUserAddress(id, normalizedEmail);
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json(
      { success: false, error: "Unsupported action" },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update address" },
      { status: 500 }
    );
  }
}
