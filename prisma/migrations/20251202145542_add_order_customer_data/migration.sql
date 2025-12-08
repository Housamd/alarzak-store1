/*
  Warnings:

  - You are about to drop the column `acceptedTermsAt` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_customerId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "acceptedTermsAt",
ADD COLUMN     "businessName" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "customerType" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "postcode" TEXT,
ADD COLUMN     "street" TEXT,
ALTER COLUMN "customerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
