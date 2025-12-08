-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "countryOfOrigin" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "grossWeightKg" DECIMAL(8,3),
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
