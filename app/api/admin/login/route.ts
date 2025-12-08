// app/api/admin/login/route.ts
import { NextResponse } from "next/server";

//  ✅ هنا تضع كلمة سر الأدمن الجديدة التي تريدها
const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || "AlRazak2025!";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const password =
      body && typeof body.password === "string"
        ? body.password
        : "";

    if (!password) {
      return NextResponse.json(
        { error: "Password is required." },
        { status: 400 }
      );
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid admin password." },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ ok: true });

    // كوكي دخول الأدمن
    res.cookies.set("admin_auth", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 4, // 4 ساعات
    });

    return res;
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
