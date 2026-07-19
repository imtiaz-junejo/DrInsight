-- Extend manual appointment booking sources to match doctor dashboard.

ALTER TYPE "BookingSource" ADD VALUE IF NOT EXISTS 'CLINIC_VISIT';
ALTER TYPE "BookingSource" ADD VALUE IF NOT EXISTS 'EMERGENCY';
