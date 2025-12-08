// app/api/checkout/preview/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

type CheckoutItem = {
  productId: string;
  qty: number;
};

type PreviewBody = {
  items: CheckoutItem[];
};

// 4 باوند لكل 14 كغ أو جزء منها
function calculateShippingGBP(totalWeightKg: number): number {
  if (totalWeightKg <= 0) return 0;
  const units = Math.ceil(totalWeightKg / 14);
  return units * 4;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as
      | PreviewBody
      | null;

    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty." },
        { status: 400 }
      );
    }

    const items = body.items;

    // نحدد العميل من الكوكي لمعرفة هل هو جملة أم مفرق
    const cookieStore = cookies();
    const session = cookieStore.get("customer_session");
    const customerId = session?.value ?? null;

    let dbCustomer: any = null;
    if (customerId) {
      dbCustomer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: {
          id: true,
          customerType: true,
        },
      });
    }

    const effectiveCustomerType =
      dbCustomer?.customerType === "WHOLESALE"
        ? "WHOLESALE"
        : "RETAIL";

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        retailPriceGBP: true,
        wholesalePriceGBP: true,
        grossWeightKg: true,
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        {
          error:
            "Some products in your cart could not be found. Please refresh and try again.",
        },
        { status: 400 }
      );
    }

    const productMap = new Map(
      products.map((p) => [p.id, p])
    );

    let subtotal = 0;
    let totalWeightKg = 0;

    for (const cartItem of items) {
      const product = productMap.get(cartItem.productId);
      if (!product) continue;

      const qty = Number(cartItem.qty || 0);
      if (qty <= 0) continue;

      const priceNumber =
        effectiveCustomerType === "WHOLESALE"
          ? Number(product.wholesalePriceGBP)
          : Number(product.retailPriceGBP);

      subtotal += priceNumber * qty;

      const weightPerUnit =
        product.grossWeightKg != null
          ? Number(product.grossWeightKg)
          : 0;
      totalWeightKg += weightPerUnit * qty;
    }

    if (subtotal <= 0) {
      return NextResponse.json(
        { error: "No valid items in cart." },
        { status: 400 }
      );
    }

    const shipping = calculateShippingGBP(totalWeightKg);
    const vat = subtotal * 0.2;
    const total = subtotal + vat + shipping;

    return NextResponse.json({
      subtotal: Number(subtotal.toFixed(2)),
      vat: Number(vat.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      total: Number(total.toFixed(2)),
      totalWeightKg: Number(totalWeightKg.toFixed(3)),
    });
  } catch (err) {
    console.error("Checkout preview error:", err);
    return NextResponse.json(
      { error: "Failed to calculate totals." },
      { status: 500 }
    );
  }
}
