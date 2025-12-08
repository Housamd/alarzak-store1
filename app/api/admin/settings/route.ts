// app/api/admin/settings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/siteSettings";

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json(settings);
  } catch (err) {
    console.error("GET /api/admin/settings error:", err);
    return NextResponse.json(
      { error: "Failed to load settings." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid body." },
        { status: 400 }
      );
    }

    const {
      siteName,
      tagline,
      primaryColor,
      accentColor,
      heroTitle,
      heroSubtitle,
      heroImageUrl,
      heroHeight,
      heroContentAlign,
      productImageHeight,
      productImageFit,
      logoUrl,
    } = body;

    const data: any = {};

    if (typeof siteName === "string") data.siteName = siteName;
    if (typeof tagline === "string") data.tagline = tagline;
    if (typeof primaryColor === "string")
      data.primaryColor = primaryColor;
    if (typeof accentColor === "string")
      data.accentColor = accentColor;

    if (typeof heroTitle === "string" || heroTitle === null)
      data.heroTitle = heroTitle;
    if (
      typeof heroSubtitle === "string" ||
      heroSubtitle === null
    )
      data.heroSubtitle = heroSubtitle;

    if (typeof heroImageUrl === "string" || heroImageUrl === null)
      data.heroImageUrl = heroImageUrl;

    if (typeof heroHeight === "string")
      data.heroHeight = heroHeight;
    if (typeof heroContentAlign === "string")
      data.heroContentAlign = heroContentAlign;

    if (typeof productImageHeight === "number")
      data.productImageHeight = productImageHeight;
    if (typeof productImageFit === "string")
      data.productImageFit = productImageFit;

    if (typeof logoUrl === "string" || logoUrl === null)
      data.logoUrl = logoUrl;

    const updated = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: data,
      create: {
        id: 1,
        siteName: data.siteName || "Al-Razak Cash & Carry",
        tagline:
          data.tagline ||
          "The best place to stock your shop or your home.",
        primaryColor: data.primaryColor || "#111827",
        accentColor: data.accentColor || "#16a34a",
        heroTitle: data.heroTitle ?? null,
        heroSubtitle: data.heroSubtitle ?? null,
        heroImageUrl: data.heroImageUrl ?? null,
        heroHeight: data.heroHeight || "LARGE",
        heroContentAlign: data.heroContentAlign || "LEFT",
        productImageHeight: data.productImageHeight || 220,
        productImageFit: data.productImageFit || "contain",
        logoUrl: data.logoUrl ?? null,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("POST /api/admin/settings error:", err);
    return NextResponse.json(
      { error: "Failed to save settings." },
      { status: 500 }
    );
  }
}
