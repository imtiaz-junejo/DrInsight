-- CreateEnum
CREATE TYPE "BookingDraftStatus" AS ENUM ('DRAFT', 'PAYMENT_PENDING', 'CONFIRMED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('REQUIRES_PAYMENT_METHOD', 'REQUIRES_CONFIRMATION', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "booking_drafts" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 30,
    "consultationType" "ConsultationType" NOT NULL DEFAULT 'VIDEO',
    "reason" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "BookingDraftStatus" NOT NULL DEFAULT 'DRAFT',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "bookingDraftId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'stripe',
    "providerIntentId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "PaymentStatus" NOT NULL DEFAULT 'REQUIRES_PAYMENT_METHOD',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_drafts_patientId_idx" ON "booking_drafts"("patientId");

-- CreateIndex
CREATE INDEX "booking_drafts_doctorId_idx" ON "booking_drafts"("doctorId");

-- CreateIndex
CREATE INDEX "booking_drafts_status_idx" ON "booking_drafts"("status");

-- CreateIndex
CREATE INDEX "booking_drafts_expiresAt_idx" ON "booking_drafts"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "payments_bookingDraftId_key" ON "payments"("bookingDraftId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_appointmentId_key" ON "payments"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_providerIntentId_key" ON "payments"("providerIntentId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- AddForeignKey
ALTER TABLE "booking_drafts" ADD CONSTRAINT "booking_drafts_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_drafts" ADD CONSTRAINT "booking_drafts_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingDraftId_fkey" FOREIGN KEY ("bookingDraftId") REFERENCES "booking_drafts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
