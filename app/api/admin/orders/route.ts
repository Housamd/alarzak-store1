// app/api/admin/orders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
      },
    });

    const plain = orders.map((o) => ({
      id: o.id,
      createdAt: o.createdAt.toISOString(),
      status: o.status, // OrderStatus
      deliveryMethod: o.deliveryMethod, // SHIP / PICKUP
      total: Number(o.total || 0),

      customerName:
        o.customerName || o.customer?.name || null,
      customerType:
        o.customerType ||
        o.customer?.customerType ||
        null,
      street: o.street || null,
      city: o.city || null,
      postcode: o.postcode || null,
      phone: o.phone || null,
    }));

    return NextResponse.json(plain);
  } catch (err) {
    console.error("Error fetching admin orders:", err);
    return NextResponse.json(
      { error: "Failed to load orders." },
      { status: 500 }
    );
  }
}
