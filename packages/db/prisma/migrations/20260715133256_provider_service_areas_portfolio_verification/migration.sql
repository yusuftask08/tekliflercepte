-- AlterTable
ALTER TABLE "provider_profiles" ADD COLUMN     "identityVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "portfolioPhotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "serviceCities" TEXT[] DEFAULT ARRAY[]::TEXT[];
