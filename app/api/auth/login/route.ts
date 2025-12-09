// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const emailRaw = (body as any)?.email as string | undefined;
    const password = (body as any)?.password as string | undefined;

    const email = emailRaw?.toLowerCase().trim() ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // مهم: Customer لا يملك unique على email، لذلك نستعمل findFirst
    const customer = await prisma.customer.findFirst({
      where: {
        email,
        isActive: true,
      },
    });

    if (!customer || !customer.passwordHash) {
      // لا تعطي تفاصيل للمهاجم
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(
      password,
      customer.passwordHash
    );

    if (!ok) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // لو وصلنا هنا → تسجيل الدخول ناجح
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
