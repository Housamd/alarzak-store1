export const dynamic = "force-dynamic";
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

    const orders = await prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        status: true,
        deliveryMethod: true,
        total: true,
        city: true,
        postcode: true,
      },
    });

    const result = orders.map((o) => ({
      id: o.id,
      createdAt: o.createdAt.toISOString(),
      status: o.status,
      deliveryMethod: o.deliveryMethod,
      total: Number(o.total ?? 0),
      city: o.city,
      postcode: o.postcode,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error in /api/account/orders:", err);
    return NextResponse.json(
      { error: "Failed to load orders" },
      { status: 500 }
    );
  }
}
