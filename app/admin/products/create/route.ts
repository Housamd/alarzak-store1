// app/admin/products/create/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const uploadsDir = path.join(process.cwd(), "public", "uploads");
async function saveFiles(files: File[]) {
  await mkdir(uploadsDir, { recursive: true });
  const out: string[] = [];
  for (const f of files) {
    if (!f || typeof f.name !== "string" || f.size === 0) continue;
    const ext = path.extname(f.name || "").toLowerCase() || ".jpg";
    const filename = `${Date.now()}-${randomUUID()}${ext}`;
    const buf = Buffer.from(await f.arrayBuffer());
    await writeFile(path.join(uploadsDir, filename), buf);
    out.push(`/uploads/${filename}`);
  }
  return out;
}

export async function POST(request: Request) {
  const form = await request.formData();

  const nameEn = String(form.get("nameEn") ?? "").trim();
  const sku = String(form.get("sku") ?? "").trim();
  const barcode = String(form.get("barcode") ?? "").trim();
  const retailPriceGBP = String(form.get("retailPriceGBP") ?? "").trim();
  const wholesalePriceGBP = String(form.get("wholesalePriceGBP") ?? "").trim();
  const countryOfOrigin = String(form.get("countryOfOrigin") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const isActive = form.get("isActive") != null;

  const imagesFiles = form.getAll("images").filter((v) => v instanceof File) as File[];
  const imagePaths = await saveFiles(imagesFiles).catch(() => []);

  // 👇 التصنيفات المختارة (IDs)
  const categoryIds = form.getAll("categoryIds").map((v) => String(v));

  try {
    await prisma.product.create({
      data: {
        nameEn,
        sku,
        barcode: barcode || null,
        retailPriceGBP,
        wholesalePriceGBP,
        countryOfOrigin: countryOfOrigin || null,
        description: description || null,
        isActive,
        images: imagePaths,

        // ربط التصنيفات
        categories: categoryIds.length
          ? { connect: categoryIds.map((id) => ({ id })) }
          : undefined,
      },
    });
  } catch (e: any) {
    console.error("[PRODUCT CREATE]", e?.code, e?.message);
  }

  return NextResponse.redirect(new URL("/admin/products", request.url), 303);
}
