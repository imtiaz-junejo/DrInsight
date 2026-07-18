-- Patient dashboard: vitals, blog bookmarks, question linkage, health tool results

-- AlterTable ask_doctor_questions
ALTER TABLE "ask_doctor_questions" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "ask_doctor_questions" ADD COLUMN IF NOT EXISTS "submitterUserId" TEXT;
ALTER TABLE "ask_doctor_questions" ADD COLUMN IF NOT EXISTS "doctorId" TEXT;
ALTER TABLE "ask_doctor_questions" ADD COLUMN IF NOT EXISTS "attachments" JSONB;

CREATE INDEX IF NOT EXISTS "ask_doctor_questions_submitterUserId_idx" ON "ask_doctor_questions"("submitterUserId");
CREATE INDEX IF NOT EXISTS "ask_doctor_questions_doctorId_idx" ON "ask_doctor_questions"("doctorId");

DO $$ BEGIN
  ALTER TABLE "ask_doctor_questions" ADD CONSTRAINT "ask_doctor_questions_submitterUserId_fkey"
    FOREIGN KEY ("submitterUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ask_doctor_questions" ADD CONSTRAINT "ask_doctor_questions_doctorId_fkey"
    FOREIGN KEY ("doctorId") REFERENCES "doctor_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- AlterTable health_tool_usages
ALTER TABLE "health_tool_usages" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "health_tool_usages" ADD COLUMN IF NOT EXISTS "resultSummary" TEXT;
ALTER TABLE "health_tool_usages" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "health_tool_usages" ADD COLUMN IF NOT EXISTS "resultJson" JSONB;

CREATE INDEX IF NOT EXISTS "health_tool_usages_userId_createdAt_idx" ON "health_tool_usages"("userId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "health_tool_usages" ADD CONSTRAINT "health_tool_usages_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "VitalType" AS ENUM ('BLOOD_PRESSURE', 'HEART_RATE', 'OXYGEN_SATURATION', 'BMI', 'BLOOD_SUGAR', 'TEMPERATURE', 'WEIGHT', 'HEIGHT', 'LDL_CHOLESTEROL', 'STEPS');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "VitalStatus" AS ENUM ('NORMAL', 'HIGH', 'LOW', 'BORDERLINE', 'GOOD');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateTable blog_post_bookmarks
CREATE TABLE IF NOT EXISTS "blog_post_bookmarks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "readPercent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_post_bookmarks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "blog_post_bookmarks_userId_postId_key" ON "blog_post_bookmarks"("userId", "postId");
CREATE INDEX IF NOT EXISTS "blog_post_bookmarks_userId_idx" ON "blog_post_bookmarks"("userId");
CREATE INDEX IF NOT EXISTS "blog_post_bookmarks_postId_idx" ON "blog_post_bookmarks"("postId");

DO $$ BEGIN
  ALTER TABLE "blog_post_bookmarks" ADD CONSTRAINT "blog_post_bookmarks_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "blog_post_bookmarks" ADD CONSTRAINT "blog_post_bookmarks_postId_fkey"
    FOREIGN KEY ("postId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateTable patient_vital_readings
CREATE TABLE IF NOT EXISTS "patient_vital_readings" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "type" "VitalType" NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT,
    "status" "VitalStatus" NOT NULL DEFAULT 'NORMAL',
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_vital_readings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "patient_vital_readings_patientId_type_recordedAt_idx" ON "patient_vital_readings"("patientId", "type", "recordedAt");
CREATE INDEX IF NOT EXISTS "patient_vital_readings_patientId_recordedAt_idx" ON "patient_vital_readings"("patientId", "recordedAt");

DO $$ BEGIN
  ALTER TABLE "patient_vital_readings" ADD CONSTRAINT "patient_vital_readings_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
