// app/api/account/profile/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// اختيارياً: GET لو احتجناه مستقبلاً (يمكن إبقاؤه كما هو الآن أو تركه)
export async function GET() {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get("customer_session");
    const customerId = session?.value ?? null;

    if (!customerId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        email: true,
        businessName: true,
        street: true,
        city: true,
        postcode: true,
        phone: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (err) {
    console.error("GET /api/account/profile error:", err);
    return NextResponse.json(
      { error: "Failed to load profile." },
      { status: 500 }
    );
  }
}

// PATCH: تحديث عنوان الزبون وبيانات الاتصال فقط
export async function PATCH(req: Request) {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get("customer_session");
    const customerId = session?.value ?? null;

    if (!customerId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid body." },
        { status: 400 }
      );
    }

    // نبني كائن التحديث فقط من الحقول المسموح بها
    const updateData: any = {};

    if ("businessName" in body) {
      updateData.businessName =
        body.businessName ?? null;
    }
    if ("street" in body) {
      updateData.street = body.street ?? null;
    }
    if ("city" in body) {
      updateData.city = body.city ?? null;
    }
    if ("postcode" in body) {
      updateData.postcode = body.postcode ?? null;
    }
    if ("phone" in body) {
      updateData.phone = body.phone ?? null;
    }

    // لو ما في حقل واحد قابل للتعديل
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Nothing to update." },
        { status: 400 }
      );
    }

    const updated = await prisma.customer.update({
      where: { id: customerId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        businessName: true,
        street: true,
        city: true,
        postcode: true,
        phone: true,
      },
    });

    return NextResponse.json({
      ok: true,
      customer: updated,
    });
  } catch (err) {
    console.error("PATCH /api/account/profile error:", err);
    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 }
    );
  }
}
