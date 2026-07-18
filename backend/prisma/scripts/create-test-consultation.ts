import 'dotenv/config';
import { AppointmentStatus, ConsultationType, MeetingStatus, UserStatus } from '@prisma/client';
import { createPrismaClient } from '../../src/prisma/create-prisma-client';
import { randomBytes } from 'crypto';

type TestConsultation = {
  label: string;
  doctorEmail: string;
  patientEmail: string;
  scheduledAt: Date;
  reason: string;
};

function localTodayAt(hour: number, minute: number): Date {
  const scheduled = new Date();
  scheduled.setHours(hour, minute, 0, 0);
  return scheduled;
}

const TEST_CONSULTATIONS: TestConsultation[] = [
  {
    label: 'Live now (doctor1 + patient1)',
    doctorEmail: 'doctor1@drinsight.pk',
    patientEmail: 'patient1@drinsight.pk',
    scheduledAt: new Date(),
    reason: 'Immediate video consultation test — doctor1 & patient1',
  },
  {
    label: 'Today 11:30 (doctor2 + patient2)',
    doctorEmail: 'doctor2@drinsight.pk',
    patientEmail: 'patient2@drinsight.pk',
    scheduledAt: localTodayAt(11, 30),
    reason: 'Scheduled video consultation test — doctor2 & patient2 at 11:30',
  },
  {
    label: 'Today 12:30 (doctor3 + patient3)',
    doctorEmail: 'doctor3@drinsight.pk',
    patientEmail: 'patient3@drinsight.pk',
    scheduledAt: localTodayAt(12, 30),
    reason: 'Scheduled video consultation test — doctor3 & patient3 at 12:30',
  },
];

async function resolvePair(
  prisma: ReturnType<typeof createPrismaClient>,
  doctorEmail: string,
  patientEmail: string,
) {
  const [patientUser, doctorUser] = await Promise.all([
    prisma.user.findUnique({
      where: { email: patientEmail },
      include: { patientProfile: true },
    }),
    prisma.user.findUnique({
      where: { email: doctorEmail },
      include: { doctorProfile: true },
    }),
  ]);

  if (!patientUser?.patientProfile) {
    throw new Error(`Patient not found or missing profile: ${patientEmail}`);
  }
  if (!doctorUser?.doctorProfile) {
    throw new Error(`Doctor not found or missing profile: ${doctorEmail}`);
  }
  if (patientUser.status !== UserStatus.ACTIVE) {
    throw new Error(`Patient account is not ACTIVE (${patientEmail}): ${patientUser.status}`);
  }
  if (doctorUser.status !== UserStatus.ACTIVE) {
    throw new Error(`Doctor account is not ACTIVE (${doctorEmail}): ${doctorUser.status}`);
  }

  return { patientUser, doctorUser };
}

async function clearStaleAppointments(
  prisma: ReturnType<typeof createPrismaClient>,
  patientId: string,
  doctorId: string,
) {
  await prisma.appointment.updateMany({
    where: {
      patientId,
      doctorId,
      status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING, AppointmentStatus.IN_PROGRESS] },
    },
    data: {
      meetingStatus: MeetingStatus.CANCELLED,
      status: AppointmentStatus.CANCELLED,
      cancelledAt: new Date(),
      cancelReason: 'Replaced by test consultation seed script',
    },
  });
}

async function createConsultation(
  prisma: ReturnType<typeof createPrismaClient>,
  config: TestConsultation,
) {
  const { patientUser, doctorUser } = await resolvePair(
    prisma,
    config.doctorEmail,
    config.patientEmail,
  );

  const patientId = patientUser.patientProfile!.id;
  const doctorId = doctorUser.doctorProfile!.id;

  await clearStaleAppointments(prisma, patientId, doctorId);

  const roomId = `room_test_${randomBytes(8).toString('hex')}`;

  const appointment = await prisma.appointment.create({
    data: {
      patientId,
      doctorId,
      scheduledAt: config.scheduledAt,
      durationMinutes: 30,
      status: AppointmentStatus.CONFIRMED,
      consultationType: ConsultationType.VIDEO,
      reason: config.reason,
      meetingRoomId: roomId,
      roomId,
      meetingStatus: MeetingStatus.WAITING,
      videoProvider: 'WEBRTC',
    },
    include: {
      doctor: { include: { user: { select: { email: true, firstName: true, lastName: true } } } },
      patient: { include: { user: { select: { email: true, firstName: true, lastName: true } } } },
    },
  });

  await prisma.conversation.upsert({
    where: {
      patientId_doctorId: {
        patientId,
        doctorId,
      },
    },
    update: { appointmentId: appointment.id },
    create: {
      patientId,
      doctorId,
      appointmentId: appointment.id,
    },
  });

  return appointment;
}

async function main() {
  const prisma = createPrismaClient();
  const created: Array<{
    label: string;
    appointmentId: string;
    roomId: string;
    scheduledAt: Date;
    doctorEmail: string;
    patientEmail: string;
    doctorName: string;
    patientName: string;
  }> = [];

  for (const config of TEST_CONSULTATIONS) {
    const appointment = await createConsultation(prisma, config);
    const doctorName = `Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`;
    const patientName = `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`;

    created.push({
      label: config.label,
      appointmentId: appointment.id,
      roomId: appointment.roomId!,
      scheduledAt: appointment.scheduledAt,
      doctorEmail: config.doctorEmail,
      patientEmail: config.patientEmail,
      doctorName,
      patientName,
    });
  }

  console.log('\n=== Test Consultations Created ===\n');
  console.log(`Password for all seed accounts: Password123!\n`);

  for (const row of created) {
    console.log(`--- ${row.label} ---`);
    console.log(`Appointment ID:  ${row.appointmentId}`);
    console.log(`Room ID:         ${row.roomId}`);
    console.log(`Scheduled at:    ${row.scheduledAt.toLocaleString()}`);
    console.log(`Doctor:          ${row.doctorName} <${row.doctorEmail}>`);
    console.log(`Patient:         ${row.patientName} <${row.patientEmail}>`);
    console.log(`Doctor URL:      http://localhost:3000/consultation/doctor/${row.appointmentId}`);
    console.log(`Patient URL:     http://localhost:3000/consultation/patient/${row.appointmentId}`);
    console.log('');
  }

  console.log('--- Quick test (live now) ---');
  console.log('1. Login as doctor1@drinsight.pk → open Doctor URL for appointment #1 → Start & Join');
  console.log('2. Login as patient1@drinsight.pk → Join Video Call banner → Join');
  console.log('3. At 11:30 test doctor2/patient2; at 12:30 test doctor3/patient3\n');

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
