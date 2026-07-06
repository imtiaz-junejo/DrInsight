-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'REFUNDED';

-- AlterTable
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "patientId" TEXT;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "doctorId" TEXT;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "stripeChargeId" TEXT;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "receiptUrl" TEXT;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "invoiceNumber" TEXT;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "platformFeeCents" INTEGER NOT NULL DEFAULT 500;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "taxCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "consultationFeeCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "billingName" TEXT;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "billingEmail" TEXT;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "billingCountry" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "payments_invoiceNumber_key" ON "payments"("invoiceNumber");
CREATE INDEX IF NOT EXISTS "payments_patientId_idx" ON "payments"("patientId");
CREATE INDEX IF NOT EXISTS "payments_doctorId_idx" ON "payments"("doctorId");
