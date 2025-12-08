// app/api/auth/register/route.ts

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
};

function generateCustomerNumber() {
  // رقم عميل بسيط وفريد (ليس مهم شكله حالياً، فقط unique)
  return `C${Date.now()}`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as
      | RegisterBody
      | null;

    const email = body?.email?.toLowerCase().trim();
    const password = body?.password;
    const name = body?.name?.trim() || null;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // لأن email ليس unique في الـ schema، نستخدم findFirst
    const existing = await prisma.customer.findFirst({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This email is already registered." },
        { status: 400 }
      );
    }

    // نولد رقم عميل
    const customerNumber = generateCustomerNumber();

    // نعمل hash للباسوورد
    const passwordHash = await bcrypt.hash(password, 10);

    // نستخدم customerNumber كقاعدة للـ codeHash (legacy field)
    const codeHash = await bcrypt.hash(customerNumber, 10);

    const customer = await prisma.customer.create({
      data: {
        email,
        name,
        number: customerNumber,
        codeHash,
        passwordHash,
        isActive: true,
        isAdmin: false,
        customerType: "RETAIL", // زبون مفرد دائماً عند التسجيل
      },
    });

    const res = NextResponse.json({
      ok: true,
      customerId: customer.id,
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
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
