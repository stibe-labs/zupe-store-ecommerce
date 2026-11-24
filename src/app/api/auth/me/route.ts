import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/userAuth";

export const dynamic = "force-dynamic";

/**
 * Authoritative stateless customer/admin session check backed by the signed HttpOnly cookie.
 * Ensures client-side AuthContext stays 100% in sync with server-side auth enforcement.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { authenticated: false, user: null },
        {
          status: 200,
          headers: { "Cache-Control": "no-store, max-age=0" },
        }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        isAdmin: auth.isAdmin,
        user: {
          id: auth.user.id,
          name: auth.user.name,
          email: auth.user.email || undefined,
          phone: auth.user.phone || undefined,
          role: auth.user.role || "customer",
        },
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch {
    return NextResponse.json(
      { authenticated: false, user: null },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  }
}
