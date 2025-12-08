// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const categorySlug = searchParams.get("category");

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      AND: [
        q
          ? {
              OR: [
                { nameEn: { contains: q, mode: "insensitive" } },
                { sku: { contains: q, mode: "insensitive" } },
                { barcode: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        categorySlug
          ? {
              categories: {
                some: { slug: categorySlug },
              },
            }
          : {},
      ],
    },
    include: { categories: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(products);
}
