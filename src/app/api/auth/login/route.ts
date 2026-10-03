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

    // 1. Check if email matches SuperAdmin email
    const isAdminEmail =
      normEmail === configuredAdminEmail ||
      normEmail === "admin@zupestore.com";

    if (isAdminEmail) {
      const adminCheck = await verifyAdminCredentials(email, password);
      if (adminCheck.valid && adminCheck.email) {
        const token = await createAdminSessionToken(adminCheck.email);
        const res = NextResponse.json({
          success: true,
          redirect: "/admin",
          user: {
            id: "superadmin",
            name: adminCheck.name || "Zupe SuperAdmin",
            email: adminCheck.email,
            role: "admin",
          },
        });

        res.cookies.set({
          name: ADMIN_COOKIE_NAME,
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60, // 7 days
          path: "/",
        });

        return res;
      } else {
        return NextResponse.json(
          { success: false, error: "Invalid admin password" },
          { status: 401 }
        );
      }
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
