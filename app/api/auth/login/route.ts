// app/api/auth/login/route.ts

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as
      | LoginBody
      | null;

    const email = body?.email?.toLowerCase().trim();
    const password = body?.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // نستخدم findFirst لأن email ليس unique في الـ schema
    const customer = await prisma.customer.findFirst({
      where: { email },
    });

    // لو لا يوجد عميل أو لا يوجد passwordHash → نرجع 401، ليس 500
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

    // نجاح: نعيد JSON ونضبط الكوكي
    const res = NextResponse.json({
      ok: true,
      customerId: customer.id,
      isAdmin: customer.isAdmin,
    });

    res.cookies.set("customer_session", customer.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
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
