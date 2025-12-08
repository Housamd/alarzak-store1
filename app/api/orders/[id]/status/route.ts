// app/api/admin/orders/[id]/status/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// نقيّد الحالات إلى الثلاثة التي نعرف أن DB يقبلها فعليًا
const ALLOWED_STATUSES = [
  "PENDING",
  "DISPATCHED",
  "CANCELLED",
] as const;

type OrderStatus = (typeof ALLOWED_STATUSES)[number];

function isValidStatus(
  value: any
): value is OrderStatus {
  return ALLOWED_STATUSES.includes(value);
}

export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const body = await req.json().catch(() => null);

    if (!body || !body.status) {
      return NextResponse.json(
        { error: "New status is required." },
        { status: 400 }
      );
    }

    const newStatus = String(body.status).toUpperCase();

    if (!isValidStatus(newStatus)) {
      return NextResponse.json(
        { error: "Invalid status value." },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: newStatus as OrderStatus },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error updating order status:", err);
    return NextResponse.json(
      { error: "Failed to update status." },
      { status: 500 }
    );
  }
}
