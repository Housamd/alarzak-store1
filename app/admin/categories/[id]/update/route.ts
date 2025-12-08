// app/admin/categories/[id]/update/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const slug = toSlug(name);

  try {
    await prisma.category.update({
      where: { id: params.id },
      data: { name, slug },
    });
  } catch (e: any) {
    console.error("[CATEGORY UPDATE]", e?.code, e?.message);
  }
  return NextResponse.redirect(new URL("/admin/categories", request.url), 303);
}
