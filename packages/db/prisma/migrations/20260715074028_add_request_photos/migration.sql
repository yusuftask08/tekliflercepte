-- AlterTable
ALTER TABLE "service_requests" ADD COLUMN     "photos" TEXT[] DEFAULT ARRAY[]::TEXT[];
