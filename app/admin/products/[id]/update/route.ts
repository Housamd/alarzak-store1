// app/admin/products/[id]/update/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;

  const form = await request.formData();

  const nameEn = String(form.get("nameEn") ?? "").trim();
  const sku = String(form.get("sku") ?? "").trim();
  const barcode = String(form.get("barcode") ?? "").trim();
  const retailPriceGBP = String(form.get("retailPriceGBP") ?? "").trim();
  const wholesalePriceGBP = String(form.get("wholesalePriceGBP") ?? "").trim();
  const countryOfOrigin = String(form.get("countryOfOrigin") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const isActive = form.get("isActive") != null;

  const categoryIds = form.getAll("categoryIds").map((v) => String(v));

  try {
    // نفصل كل القديم ثم نوصّل الجديد (أبسط)
    await prisma.product.update({
      where: { id }, // لو Int: { id: Number(id) }
      data: {
        nameEn,
        sku,
        barcode: barcode || null,
        retailPriceGBP,
        wholesalePriceGBP,
        countryOfOrigin: countryOfOrigin || null,
        description: description || null,
        isActive,

        categories: {
          set: [], // افصل الكل
          ...(categoryIds.length ? { connect: categoryIds.map((cid) => ({ id: cid })) } : {}),
        },
      },
    });
  } catch (e: any) {
    console.error("[PRODUCT UPDATE]", e?.code, e?.message);
  }

  return NextResponse.redirect(new URL("/admin/products", request.url), 303);
}
