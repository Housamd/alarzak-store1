// app/api/account/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get("customer_session");

    if (!session || !session.value) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const customerId = session.value;

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // نرجّع فقط بيانات أساسية
    return NextResponse.json({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      customerType: customer.customerType,
    });
  } catch (err) {
    console.error("Error in /api/account/me:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
