-- CreateEnum
CREATE TYPE "TimeSlot" AS ENUM ('SABAH', 'OGLEN', 'AKSAM');

-- CreateEnum
CREATE TYPE "RecurrenceInterval" AS ENUM ('WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "service_requests"
  ADD COLUMN "preferredTimeSlot" "TimeSlot",
  ADD COLUMN "isRecurring" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "recurrenceInterval" "RecurrenceInterval",
  ADD COLUMN "recurrenceParentId" TEXT;

-- CreateIndex
CREATE INDEX "service_requests_recurrenceParentId_idx" ON "service_requests"("recurrenceParentId");

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_recurrenceParentId_fkey" FOREIGN KEY ("recurrenceParentId") REFERENCES "service_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
