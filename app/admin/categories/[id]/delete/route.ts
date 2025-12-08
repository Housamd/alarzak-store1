// app/admin/categories/[id]/delete/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.category.delete({ where: { id: params.id } });
  } catch (e: any) {
    console.error("[CATEGORY DELETE]", e?.code, e?.message);
  }
  return NextResponse.redirect(new URL("/admin/categories", request.url), 303);
}
