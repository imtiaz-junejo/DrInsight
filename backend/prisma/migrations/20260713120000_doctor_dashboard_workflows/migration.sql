-- Doctor dashboard workflows: manual/physical appointment booking source,
-- clinic & online schedules, and Q&A draft/reject workflow.

-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('ONLINE', 'WALK_IN', 'PHONE');

-- AlterTable: appointments
ALTER TABLE "appointments"
  ADD COLUMN "bookingSource" "BookingSource" NOT NULL DEFAULT 'ONLINE',
  ADD COLUMN "bookedByUserId" TEXT;

-- AlterTable: doctor_profiles
ALTER TABLE "doctor_profiles"
  ADD COLUMN "clinicSchedule" JSONB,
  ADD COLUMN "onlineSchedule" JSONB;

-- AlterTable: ask_doctor_questions
ALTER TABLE "ask_doctor_questions"
  ADD COLUMN "answerDraft" TEXT,
  ADD COLUMN "rejectReason" TEXT,
  ADD COLUMN "rejectedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "appointments_bookingSource_idx" ON "appointments"("bookingSource");
