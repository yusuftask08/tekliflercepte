-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "questions" JSONB;

-- AlterTable
ALTER TABLE "service_requests" ADD COLUMN     "answers" JSONB;
