-- AlterTable
ALTER TABLE "users" ADD COLUMN "phoneVerificationCodeHash" TEXT,
ADD COLUMN "phoneVerificationExpiresAt" TIMESTAMP(3),
ADD COLUMN "phoneVerificationAttempts" INTEGER NOT NULL DEFAULT 0;
