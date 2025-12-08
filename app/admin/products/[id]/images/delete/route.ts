// app/admin/products/[id]/images/delete/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const idParam = params.id;
  const n = Number(idParam);
  const where = Number.isInteger(n) && String(n) === idParam ? { id: n } : { id: idParam };

  const form = await request.formData();
  const url = String(form.get("url") ?? "").trim();

  try {
    const prod = await prisma.product.findUnique({
      where: where as any,
      select: { images: true },
    });
    const current = (prod?.images ?? []) as string[];
    const updated = current.filter((u) => u !== url);

    await prisma.product.update({
      where: where as any,
      data: { images: updated },
    });

    // حذف الملف من القرص (اختياري)
    if (url.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", url);
      // تجاهل الخطأ إن لم يوجد
      await unlink(filePath).catch(() => {});
    }
  } catch (e: any) {
    console.error("[IMAGE DELETE ERROR]", e?.message || e);
  }

  return NextResponse.redirect(new URL(`/admin/products/${idParam}/edit`, request.url), 303);
}
