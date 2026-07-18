-- Permanent public member IDs for doctors (DOC-####) and patients (PT-####)

CREATE SEQUENCE IF NOT EXISTS doctor_profile_number_seq START WITH 1001;
CREATE SEQUENCE IF NOT EXISTS patient_profile_number_seq START WITH 1001;

ALTER TABLE "doctor_profiles" ADD COLUMN IF NOT EXISTS "doctorNumber" TEXT;
ALTER TABLE "patient_profiles" ADD COLUMN IF NOT EXISTS "patientNumber" TEXT;

-- Backfill existing doctor profiles in creation order
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt", id) AS rn
  FROM "doctor_profiles"
  WHERE "doctorNumber" IS NULL
)
UPDATE "doctor_profiles" d
SET "doctorNumber" = 'DOC-' || LPAD(numbered.rn::text, 4, '0')
FROM numbered
WHERE d.id = numbered.id;

-- Backfill existing patient profiles in creation order
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt", id) AS rn
  FROM "patient_profiles"
  WHERE "patientNumber" IS NULL
)
UPDATE "patient_profiles" p
SET "patientNumber" = 'PT-' || LPAD(numbered.rn::text, 4, '0')
FROM numbered
WHERE p.id = numbered.id;

-- Align sequences with max assigned values
SELECT setval(
  'doctor_profile_number_seq',
  GREATEST(
    COALESCE((SELECT MAX(CAST(SUBSTRING("doctorNumber" FROM 5) AS INTEGER)) FROM "doctor_profiles" WHERE "doctorNumber" ~ '^DOC-[0-9]+$'), 0),
    1000
  ) + 1,
  false
);

SELECT setval(
  'patient_profile_number_seq',
  GREATEST(
    COALESCE((SELECT MAX(CAST(SUBSTRING("patientNumber" FROM 4) AS INTEGER)) FROM "patient_profiles" WHERE "patientNumber" ~ '^PT-[0-9]+$'), 0),
    1000
  ) + 1,
  false
);

CREATE UNIQUE INDEX IF NOT EXISTS "doctor_profiles_doctorNumber_key" ON "doctor_profiles"("doctorNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "patient_profiles_patientNumber_key" ON "patient_profiles"("patientNumber");
