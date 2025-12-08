-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isBestSeller" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOnOffer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isShortDate" BOOLEAN NOT NULL DEFAULT false;
