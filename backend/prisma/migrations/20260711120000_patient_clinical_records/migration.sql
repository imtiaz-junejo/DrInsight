-- CreateEnum
CREATE TYPE "PrescriptionStatus" AS ENUM ('DRAFT', 'ISSUED', 'PENDING_REVIEW');

-- CreateEnum
CREATE TYPE "PatientAlertSeverity" AS ENUM ('CRITICAL', 'URGENT', 'STABLE');

-- CreateEnum
CREATE TYPE "PatientAlertStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'REMOVED');

-- AlterTable
ALTER TABLE "prescriptions" ADD COLUMN "status" "PrescriptionStatus" NOT NULL DEFAULT 'ISSUED';
ALTER TABLE "prescriptions" ADD COLUMN "prescriptionNumber" TEXT;
ALTER TABLE "prescriptions" ADD COLUMN "verifyId" TEXT;
ALTER TABLE "prescriptions" ADD COLUMN "extendedData" JSONB;
ALTER TABLE "prescriptions" ADD COLUMN "followUpDate" TIMESTAMP(3);
ALTER TABLE "prescriptions" ADD COLUMN "digitalSignature" TEXT;
ALTER TABLE "prescriptions" ADD COLUMN "issuedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "prescriptions_prescriptionNumber_key" ON "prescriptions"("prescriptionNumber");
CREATE INDEX "prescriptions_status_idx" ON "prescriptions"("status");

-- CreateTable
CREATE TABLE "prescription_drafts" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescription_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_clinical_notes" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "title" TEXT NOT NULL,
    "noteType" TEXT NOT NULL DEFAULT 'Progress Note',
    "clinicalNotes" TEXT NOT NULL DEFAULT '',
    "followUpNotes" TEXT,
    "privateNotes" TEXT,
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_clinical_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_critical_alerts" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "severity" "PatientAlertSeverity" NOT NULL,
    "category" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "clinicalNotes" TEXT,
    "attachments" JSONB,
    "reviewDate" TIMESTAMP(3),
    "notifyTeam" BOOLEAN NOT NULL DEFAULT true,
    "status" "PatientAlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_critical_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_critical_alert_history" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "performedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_critical_alert_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prescription_drafts_doctorId_patientId_key" ON "prescription_drafts"("doctorId", "patientId");
CREATE INDEX "prescription_drafts_patientId_idx" ON "prescription_drafts"("patientId");

CREATE INDEX "patient_clinical_notes_patientId_idx" ON "patient_clinical_notes"("patientId");
CREATE INDEX "patient_clinical_notes_doctorId_idx" ON "patient_clinical_notes"("doctorId");
CREATE INDEX "patient_clinical_notes_appointmentId_idx" ON "patient_clinical_notes"("appointmentId");
CREATE INDEX "patient_clinical_notes_createdAt_idx" ON "patient_clinical_notes"("createdAt");

CREATE INDEX "patient_critical_alerts_patientId_status_idx" ON "patient_critical_alerts"("patientId", "status");
CREATE INDEX "patient_critical_alerts_doctorId_idx" ON "patient_critical_alerts"("doctorId");
CREATE INDEX "patient_critical_alerts_severity_idx" ON "patient_critical_alerts"("severity");

CREATE INDEX "patient_critical_alert_history_alertId_idx" ON "patient_critical_alert_history"("alertId");
CREATE INDEX "patient_critical_alert_history_createdAt_idx" ON "patient_critical_alert_history"("createdAt");

-- AddForeignKey
ALTER TABLE "prescription_drafts" ADD CONSTRAINT "prescription_drafts_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prescription_drafts" ADD CONSTRAINT "prescription_drafts_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "patient_clinical_notes" ADD CONSTRAINT "patient_clinical_notes_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "patient_clinical_notes" ADD CONSTRAINT "patient_clinical_notes_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "patient_clinical_notes" ADD CONSTRAINT "patient_clinical_notes_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "patient_critical_alerts" ADD CONSTRAINT "patient_critical_alerts_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "patient_critical_alerts" ADD CONSTRAINT "patient_critical_alerts_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "patient_critical_alert_history" ADD CONSTRAINT "patient_critical_alert_history_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "patient_critical_alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
