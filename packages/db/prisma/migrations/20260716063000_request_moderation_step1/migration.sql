-- AlterEnum
ALTER TYPE "RequestStatus" ADD VALUE 'PENDING_REVIEW';
ALTER TYPE "RequestStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "users" ADD COLUMN "termsAcceptedAt" TIMESTAMP(3);
