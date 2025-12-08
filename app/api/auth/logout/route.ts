// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const res = NextResponse.json({ ok: true });

    // حذف كوكي جلسة الزبون
    res.cookies.set("customer_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return res;
  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
