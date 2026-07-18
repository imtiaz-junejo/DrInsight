-- AlterEnum
ALTER TYPE "QuestionStatus" ADD VALUE 'APPROVED';

-- AlterTable
ALTER TABLE "ask_doctor_questions" ADD COLUMN "approvedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "doctor_profiles" ADD COLUMN "profileSlug" TEXT;
ALTER TABLE "doctor_profiles" ADD COLUMN "seoFocusKeyword" TEXT;
ALTER TABLE "doctor_profiles" ADD COLUMN "seoMetaTitle" TEXT;
ALTER TABLE "doctor_profiles" ADD COLUMN "seoMetaDescription" TEXT;
ALTER TABLE "doctor_profiles" ADD COLUMN "seoSchemaJson" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "doctor_profiles_profileSlug_key" ON "doctor_profiles"("profileSlug");

UPDATE "ask_doctor_questions"
SET status = 'APPROVED', "approvedAt" = COALESCE("approvedAt", NOW())
WHERE status = 'PENDING';
