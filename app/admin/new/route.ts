// app/admin/products/new/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const form = await request.formData();

  const nameEn = String(form.get("nameEn") ?? "").trim();
  const sku = String(form.get("sku") ?? "").trim();
  const barcode = (form.get("barcode") ?? "") as string;
  const retailPriceGBP = String(form.get("retailPriceGBP") ?? "").trim(); // Prisma Decimal يقبل string
  const wholesalePriceGBP = String(form.get("wholesalePriceGBP") ?? "").trim();
  const countryOfOrigin = (form.get("countryOfOrigin") ?? "") as string;
  const description = (form.get("description") ?? "") as string;
  const isActive = form.get("isActive") != null; // موجودة = true

  try {
    await prisma.product.create({
      data: {
        nameEn,
        sku,
        barcode: barcode || null,
        retailPriceGBP,      // string OK
        wholesalePriceGBP,   // string OK
        countryOfOrigin: countryOfOrigin || null,
        description: description || null,
        isActive,
      },
    });
  } catch (error: any) {
    console.error("[CREATE PRODUCT] code:", error?.code, "msg:", error?.message);
    // ممكن تضيف معالجة أفضل لاحقًا
  }

  return NextResponse.redirect(new URL("/admin/products", request.url), 303);
}
