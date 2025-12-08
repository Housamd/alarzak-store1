// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sendOrderEmail } from "@/lib/email/sendEmail";

type DeliveryMethod = "SHIP" | "PICKUP";

type CheckoutItem = {
  productId: string;
  qty: number;
};

type CheckoutBody = {
  customerName: string;
  customerType: "BUSINESS" | "PERSONAL";
  businessName: string | null;
  street: string;
  city: string;
  postcode: string;
  phone: string;
  email: string | null;
  deliveryMethod: DeliveryMethod;
  notes: string | null;
  items: CheckoutItem[];
};

// 4 باوند لكل 14 كغ (نستخدم Math.ceil: كل 14 كغ أو جزء منها)
function calculateShippingGBP(totalWeightKg: number): number {
  if (totalWeightKg <= 0) return 0;
  const units = Math.ceil(totalWeightKg / 14);
  return units * 4;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as
      | CheckoutBody
      | null;

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const {
      customerName,
      customerType,
      businessName,
      street,
      city,
      postcode,
      phone,
      email,
      deliveryMethod,
      notes,
      items,
    } = body;

    // تحقق أساسي من الحقول المطلوبة
    if (
      !customerName?.trim() ||
      !street?.trim() ||
      !city?.trim() ||
      !postcode?.trim() ||
      !phone?.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required customer or address fields.",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty." },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const session = cookieStore.get("customer_session");
    const customerId = session?.value ?? null;

    // لو في عميل مسجّل، نجيبه من قاعدة البيانات (لتحديد نوعه: جملة/مفرق)
    let dbCustomer: any = null;
    if (customerId) {
      dbCustomer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: {
          id: true,
          customerType: true,
          email: true,
          name: true,
        },
      });
    }

    // نوع التسعير الفعلي:
    // - لو العميل في DB نوعه WHOLESALE → نستخدم wholesalePrice
    // - غير ذلك → retailPrice
    const effectiveCustomerType =
      dbCustomer?.customerType === "WHOLESALE"
        ? "WHOLESALE"
        : "RETAIL";

    // ==== تحميل المنتجات ====
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        nameEn: true,
        sku: true,
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

    const orderItemsData: {
      productId: string;
      qty: number;
      unitPrice: number;
    }[] = [];

    for (const cartItem of items) {
      const product = productMap.get(cartItem.productId);
      if (!product) continue;

      const qty = Number(cartItem.qty || 0);
      if (qty <= 0) continue;

      // اختيار السعر حسب نوع العميل
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

      orderItemsData.push({
        productId: product.id,
        qty,
        unitPrice: Number(priceNumber.toFixed(2)),
      });
    }

    if (orderItemsData.length === 0) {
      return NextResponse.json(
        { error: "No valid items in cart." },
        { status: 400 }
      );
    }

    // ==== حساب الشحن ====
    const shippingGBP = calculateShippingGBP(
      totalWeightKg
    );

    // ==== حساب VAT (بسيط: 20% على subtotal) ====
    const vat = subtotal * 0.2;

    // ==== المجموع النهائي ====
    const total = subtotal + vat + shippingGBP;

    // نكتب معلومات الشحن داخل الملاحظات كحد أدنى
    const shippingNote = `Shipping: £${shippingGBP.toFixed(
      2
    )} on total weight ${totalWeightKg.toFixed(
      2
    )} kg (charged at £4 per 14kg).`;

    const finalNotes = notes
      ? `${notes}\n\n${shippingNote}`
      : shippingNote;

    // ==== إنشاء الطلب في قاعدة البيانات ====
    const order = await prisma.order.create({
      data: {
        customerId: customerId ?? null,

        customerName: customerName.trim(),
        customerType: dbCustomer?.customerType ?? null,
        street: street.trim(),
        city: city.trim(),
        postcode: postcode.trim(),
        phone: phone.trim(),

        deliveryMethod:
          deliveryMethod === "PICKUP"
            ? "PICKUP"
            : "SHIP",
        notes: finalNotes,

        subtotal: Number(subtotal.toFixed(2)),
        vat: Number(vat.toFixed(2)),
        total: Number(total.toFixed(2)),

        acceptedTermsAt: new Date(),

        items: {
          create: orderItemsData.map((oi) => ({
            productId: oi.productId,
            qty: oi.qty,
            unitPrice: Number(
              oi.unitPrice.toFixed(2)
            ),
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    });

    // ==== تحديث بيانات الزبون في جدول Customer (لو مسجّل) ====
    if (customerId) {
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          businessName:
            businessName || undefined,
          street: street.trim(),
          city: city.trim(),
          postcode: postcode.trim(),
          phone: phone.trim(),
        },
      });
    }

    // ==== محاولة إرسال إيميل تأكيد (لو في إيميل) ====
    const emailToUse =
      email || dbCustomer?.email || null;
    if (emailToUse) {
      const orderForEmail = {
        ...order,
        email: emailToUse,
      };
      await sendOrderEmail(orderForEmail);
    }

    return NextResponse.json({
      ok: true,
      reference: order.id,
      message: `Order placed successfully. Reference: ${order.id}`,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to submit order." },
      { status: 500 }
    );
  }
}
