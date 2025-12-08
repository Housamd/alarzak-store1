// lib/siteSettings.ts
import { prisma } from "@/lib/prisma";

export type SiteSettingsData = {
  id: number;
  siteName: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;

  heroTitle: string | null;
  heroSubtitle: string | null;
  heroImageUrl: string | null;
  heroHeight: string;
  heroContentAlign: string;

  productImageHeight: number;
  productImageFit: string;

  logoUrl: string | null;
};

const DEFAULT_SETTINGS: SiteSettingsData = {
  id: 1,
  siteName: "Al-Razak Cash & Carry",
  tagline: "The best place to stock your shop or your home.",
  primaryColor: "#111827",
  accentColor: "#16a34a",

  heroTitle: "Welcome to Al-Razak Cash & Carry",
  heroSubtitle:
    "Wholesale & retail groceries, from premium rice to everyday essentials, serving shops and families in Manchester.",
  heroImageUrl: null,
  heroHeight: "LARGE", // افتراضيًا بانر كبير
  heroContentAlign: "LEFT",

  productImageHeight: 220, // افتراضيًا صور أكبر
  productImageFit: "contain",

  logoUrl: null,
};

export async function getSiteSettings(): Promise<SiteSettingsData> {
  const existing = await prisma.siteSettings.findUnique({
    where: { id: 1 },
  });

  if (!existing) {
    const created = await prisma.siteSettings.create({
      data: {
        id: 1,
        siteName: DEFAULT_SETTINGS.siteName,
        tagline: DEFAULT_SETTINGS.tagline,
        primaryColor: DEFAULT_SETTINGS.primaryColor,
        accentColor: DEFAULT_SETTINGS.accentColor,
        heroTitle: DEFAULT_SETTINGS.heroTitle,
        heroSubtitle: DEFAULT_SETTINGS.heroSubtitle,
        heroImageUrl: DEFAULT_SETTINGS.heroImageUrl,
        heroHeight: DEFAULT_SETTINGS.heroHeight,
        heroContentAlign: DEFAULT_SETTINGS.heroContentAlign,
        productImageHeight: DEFAULT_SETTINGS.productImageHeight,
        productImageFit: DEFAULT_SETTINGS.productImageFit,
        logoUrl: DEFAULT_SETTINGS.logoUrl,
      },
    });

    return created as SiteSettingsData;
  }

  return {
    ...DEFAULT_SETTINGS,
    ...existing,
  };
}
