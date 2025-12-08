// app/admin/products/[id]/delete/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id; // عندك id = String حسب السكيمة

  try {
    await prisma.$transaction([
      // احذف أي عناصر طلب مرتبطة بهذا المنتج (عدّل الاسم لو موديلك مختلف)
      prisma.orderItem.deleteMany({ where: { productId: id } }),
      // احذف المنتج نفسه
      prisma.product.delete({ where: { id } }),
    ]);
  } catch (error: any) {
    console.error("[DELETE PRODUCT TX] code:", error?.code, "msg:", error?.message);
    // بنرجّع للقائمة على كل حال
  }

  return NextResponse.redirect(new URL("/admin/products", request.url), 303);
}
