-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'REFERRAL_REWARD';

-- AlterTable
ALTER TABLE "users" ADD COLUMN "referredById" TEXT;

-- CreateIndex
CREATE INDEX "users_referredById_idx" ON "users"("referredById");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
