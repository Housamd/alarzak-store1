// app/api/admin/orders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (err) {
    console.error("Error fetching admin orders:", err);
    return NextResponse.json(
      { error: "Failed to load orders." },
      { status: 500 }
    );
  }
}
