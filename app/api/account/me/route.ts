// app/api/account/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get("customer_session");

    if (!session?.value) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const customerId = session.value;

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      // لا نطلب حقول غريبة حتى لا نصطدم بأي عمود ناقص
      select: {
        id: true,
        number: true,
        name: true,
        email: true,
        street: true,
        city: true,
        postcode: true,
        phone: true,
        businessName: true,
        customerType: true,
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
    console.error("Error in /api/account/me:", err);
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    );
  }
}
