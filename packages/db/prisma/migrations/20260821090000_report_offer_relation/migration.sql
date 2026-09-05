-- CreateIndex
CREATE INDEX "reports_offerId_idx" ON "reports"("offerId");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
