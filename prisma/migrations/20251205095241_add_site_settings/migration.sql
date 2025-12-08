-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "siteName" TEXT NOT NULL DEFAULT 'Al-Razak Cash & Carry',
    "tagline" TEXT NOT NULL DEFAULT 'The best place to stock your shop or your home.',
    "primaryColor" TEXT NOT NULL DEFAULT '#111827',
    "accentColor" TEXT NOT NULL DEFAULT '#16a34a',
    "heroTitle" TEXT,
    "heroSubtitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);
