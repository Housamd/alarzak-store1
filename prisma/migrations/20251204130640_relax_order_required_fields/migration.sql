/*
  Warnings:

  - You are about to drop the column `passwordHash` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Order` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('RETAIL', 'WHOLESALE');

-- DropIndex
DROP INDEX "public"."Customer_email_key";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "passwordHash",
ADD COLUMN     "customerType" "CustomerType" NOT NULL DEFAULT 'RETAIL';

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "status",
ADD COLUMN     "acceptedTermsAt" TIMESTAMP(3);
