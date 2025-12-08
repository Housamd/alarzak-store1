/*
  Warnings:

  - You are about to drop the column `businessName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Order` table. All the data in the column will be lost.
  - The `customerType` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DISPATCHED', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "businessName",
DROP COLUMN "email",
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
DROP COLUMN "customerType",
ADD COLUMN     "customerType" "CustomerType";
