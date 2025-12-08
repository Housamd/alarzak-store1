// app/api/account/orders/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
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

    const orders = await prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        createdAt: true,
        status: true,
        total: true,
        deliveryMethod: true,
        city: true,
        postcode: true,
      },
    });

    return NextResponse.json(orders);
  } catch (err) {
    console.error("Account orders error:", err);
    return NextResponse.json(
      { error: "Failed to load orders." },
      { status: 500 }
    );
  }
}
