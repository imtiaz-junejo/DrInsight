-- CreateEnum
CREATE TYPE "ClinicalNoteAuthorType" AS ENUM ('DOCTOR', 'PATIENT');

-- CreateEnum
CREATE TYPE "ClinicalNotePriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'CLINICAL_NOTE';

-- AlterTable
ALTER TABLE "patient_clinical_notes" ADD COLUMN "authorId" TEXT;
ALTER TABLE "patient_clinical_notes" ADD COLUMN "authorType" "ClinicalNoteAuthorType" NOT NULL DEFAULT 'DOCTOR';
ALTER TABLE "patient_clinical_notes" ADD COLUMN "priority" "ClinicalNotePriority" NOT NULL DEFAULT 'NORMAL';
ALTER TABLE "patient_clinical_notes" ADD COLUMN "attachments" JSONB;
ALTER TABLE "patient_clinical_notes" ADD COLUMN "followUpReminderAt" TIMESTAMP(3);
ALTER TABLE "patient_clinical_notes" ADD COLUMN "patientReadAt" TIMESTAMP(3);
ALTER TABLE "patient_clinical_notes" ADD COLUMN "doctorReadAt" TIMESTAMP(3);

-- Backfill authorId from doctor profile user
UPDATE "patient_clinical_notes" n
SET "authorId" = d."userId"
FROM "doctor_profiles" d
WHERE n."doctorId" = d."id" AND n."authorId" IS NULL;

-- Set doctorReadAt for existing doctor-authored notes
UPDATE "patient_clinical_notes"
SET "doctorReadAt" = "createdAt"
WHERE "authorType" = 'DOCTOR' AND "doctorReadAt" IS NULL AND "isDraft" = false;

ALTER TABLE "patient_clinical_notes" ALTER COLUMN "authorId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "patient_clinical_notes_authorId_idx" ON "patient_clinical_notes"("authorId");
CREATE INDEX "patient_clinical_notes_authorType_idx" ON "patient_clinical_notes"("authorType");
CREATE INDEX "patient_clinical_notes_priority_idx" ON "patient_clinical_notes"("priority");

-- AddForeignKey
ALTER TABLE "patient_clinical_notes" ADD CONSTRAINT "patient_clinical_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
