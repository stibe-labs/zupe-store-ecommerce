import { NextRequest, NextResponse } from "next/server";
import { findUserByEmailAsync } from "@/lib/userStore";
import {
  verifyAdminCredentials,
  createAdminSessionToken,
  ADMIN_COOKIE_NAME,
} from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normEmail = (email || "").toLowerCase().trim();
    const configuredAdminEmail = (process.env.ADMIN_EMAIL || "admin@zupestore.com").toLowerCase().trim();

    // 1. Separate Admin and Customer login contexts
    const isAdminEmail =
      normEmail === configuredAdminEmail ||
      normEmail === "admin@zupestore.com";

    if (isAdminEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "Administrator accounts must sign in securely at /admin/login",
        },
        { status: 403 }
      );
    }

    // 2. Otherwise, check standard customer account
    const user = await findUserByEmailAsync(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "No account found with this email" },
        { status: 404 }
      );
    }

    const inputHash = Buffer.from(password).toString("base64");
    if (user.password_hash !== inputHash) {
      return NextResponse.json(
        { success: false, error: "Invalid password" },
        { status: 401 }
      );
    }

    const session = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: "customer",
    };

    return NextResponse.json({ success: true, user: session });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Login failed" },
      { status: 500 }
    );
  }
}
