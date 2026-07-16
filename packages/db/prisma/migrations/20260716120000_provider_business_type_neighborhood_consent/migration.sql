-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('SAHIS', 'SIRKET');

-- AlterTable
ALTER TABLE "provider_profiles" ADD COLUMN "businessType" "BusinessType",
ADD COLUMN "neighborhood" TEXT,
ADD COLUMN "dataConsentAt" TIMESTAMP(3);
