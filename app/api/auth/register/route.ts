// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const rawEmail =
      body && typeof body.email === "string" ? body.email : "";
    const email = rawEmail.toLowerCase().trim();

    const name =
      body && typeof body.name === "string" ? body.name.trim() : "";
    const password =
      body && typeof body.password === "string"
        ? body.password
        : "";
    const confirmPassword =
      body && typeof body.confirmPassword === "string"
        ? body.confirmPassword
        : password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 6 characters long.",
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    // تحقق: هل يوجد زبون بنفس الإيميل؟
    const existing = await prisma.customer.findFirst({
      where: { email },
    });

    if (existing && existing.passwordHash) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // حقل number مطلوب و unique → نستخدم الإيميل كنمبر بسيط (أو نستطيع توليد شيء خاص)
    const customerNumber =
      existing?.number ||
      `CUST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const customer = existing
      ? await prisma.customer.update({
          where: { id: existing.id },
          data: {
            name: name || existing.name,
            email,
            passwordHash,
            codeHash: existing.codeHash || passwordHash,
            // customerType: نتركه للـ default (RETAIL)
          },
        })
      : await prisma.customer.create({
          data: {
            number: customerNumber,
            codeHash: passwordHash, // نستخدمه كقيمة افتراضية – لن يؤثر على منطقك الحالي
            name: name || null,
            email,
            passwordHash,
            // customerType: نتركه للـ default (RETAIL)
          },
        });

    const res = NextResponse.json({
      ok: true,
      customerId: customer.id,
    });

    // تسجيل الدخول مباشرة بعد إنشاء الحساب
    res.cookies.set("customer_session", customer.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
