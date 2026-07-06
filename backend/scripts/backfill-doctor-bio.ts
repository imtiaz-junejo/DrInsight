import 'dotenv/config';
import { createPrismaClient } from '../src/prisma/create-prisma-client';
import { buildDoctorBioProfile, PAKISTANI_MEDICAL_UNIVERSITIES, pick } from '../prisma/seed-data';

async function main() {
  const prisma = createPrismaClient();
  try {
    const doctors = await prisma.doctorProfile.findMany({
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    let updated = 0;
    for (let index = 0; index < doctors.length; index++) {
      const doctor = doctors[index]!;
      if (doctor.bioFull && doctor.city && doctor.educationHistory) continue;

      const i = index + 1;
      const university =
        doctor.education?.split('—')[0]?.trim() ?? pick(PAKISTANI_MEDICAL_UNIVERSITIES, i);
      const bioProfile = buildDoctorBioProfile({
        index: i,
        firstName: doctor.user.firstName,
        lastName: doctor.user.lastName,
        specialty: doctor.specialty,
        subSpecialty: doctor.subSpecialty ?? doctor.specialty,
        city: doctor.city ?? 'Karachi',
        hospital: doctor.hospital ?? 'Private Practice',
        university,
        experienceYears: doctor.experienceYears,
        licenseNumber: doctor.licenseNumber,
        gender: doctor.gender ?? (i % 4 === 0 ? 'Female' : 'Male'),
      });

      await prisma.doctorProfile.update({
        where: { id: doctor.id },
        data: bioProfile,
      });
      updated += 1;
    }

    console.log(`Backfilled bio fields for ${updated} of ${doctors.length} doctor profiles.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
