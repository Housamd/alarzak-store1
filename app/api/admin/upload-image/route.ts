// app/api/admin/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file uploaded." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(
      process.cwd(),
      "public",
      "uploads"
    );
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    const sanitizedName = file.name
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.\-_]/g, "");
    const filename = `${Date.now()}-${sanitizedName}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Upload failed." },
      { status: 500 }
    );
  }
}
