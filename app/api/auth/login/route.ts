// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const rawEmail =
      body && typeof body.email === "string" ? body.email : "";
    const email = rawEmail.toLowerCase().trim();

    const password =
      body && typeof body.password === "string"
        ? body.password
        : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // email ليس فريد في السكيمة، لذا نستخدم findFirst
    const customer = await prisma.customer.findFirst({
      where: { email },
    });

    if (!customer || !customer.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(
      password,
      customer.passwordHash
    );

    if (!match) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const res = NextResponse.json({
      ok: true,
      customerId: customer.id,
    });

    // كوكي جلسة الزبون
    res.cookies.set("customer_session", customer.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // أسبوع
    });

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
