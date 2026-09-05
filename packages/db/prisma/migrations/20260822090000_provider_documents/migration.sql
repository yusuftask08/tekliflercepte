-- CreateEnum
CREATE TYPE "ProviderDocumentType" AS ENUM ('CERTIFICATE', 'INSURANCE');

-- CreateEnum
CREATE TYPE "ProviderDocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "provider_documents" (
    "id" TEXT NOT NULL,
    "providerProfileId" TEXT NOT NULL,
    "type" "ProviderDocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "label" TEXT,
    "status" "ProviderDocumentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,

    CONSTRAINT "provider_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "provider_documents_providerProfileId_idx" ON "provider_documents"("providerProfileId");

-- AddForeignKey
ALTER TABLE "provider_documents" ADD CONSTRAINT "provider_documents_providerProfileId_fkey" FOREIGN KEY ("providerProfileId") REFERENCES "provider_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
