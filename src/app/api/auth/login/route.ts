import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/userStore";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = findUserByEmail(email);
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
