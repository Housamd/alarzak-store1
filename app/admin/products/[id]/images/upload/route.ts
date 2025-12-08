// app/admin/products/[id]/images/upload/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const uploadsDir = path.join(process.cwd(), "public", "uploads");

async function saveFiles(files: File[]) {
  await mkdir(uploadsDir, { recursive: true });
  const saved: string[] = [];
  for (const f of files) {
    if (!f || typeof f.name !== "string" || f.size === 0) continue;
    const ext = path.extname(f.name || "").toLowerCase() || ".jpg";
    const filename = `${Date.now()}-${randomUUID()}${ext}`;
    const buffer = Buffer.from(await f.arrayBuffer());
    await writeFile(path.join(uploadsDir, filename), buffer);
    saved.push(`/uploads/${filename}`);
  }
  return saved;
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const idParam = params.id;
  const n = Number(idParam);
  const where = Number.isInteger(n) && String(n) === idParam ? { id: n } : { id: idParam };

  const form = await request.formData();
  const files = form.getAll("images").filter((v) => v instanceof File) as File[];

  try {
    const newPaths = await saveFiles(files);
    const existing = await prisma.product.findUnique({
      where: where as any,
      select: { images: true },
    });

    const current = (existing?.images ?? []) as string[];
    const updated = [...current, ...newPaths];

    await prisma.product.update({
      where: where as any,
      data: { images: updated },
    });
  } catch (e: any) {
    console.error("[UPLOAD APPEND ERROR]", e?.message || e);
  }

  return NextResponse.redirect(new URL(`/admin/products/${idParam}/edit`, request.url), 303);
}
