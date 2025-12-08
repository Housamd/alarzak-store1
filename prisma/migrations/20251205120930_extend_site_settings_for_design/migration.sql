-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "heroContentAlign" TEXT NOT NULL DEFAULT 'LEFT',
ADD COLUMN     "heroHeight" TEXT NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "heroImageUrl" TEXT,
ADD COLUMN     "productImageFit" TEXT NOT NULL DEFAULT 'contain',
ADD COLUMN     "productImageHeight" INTEGER NOT NULL DEFAULT 180;
