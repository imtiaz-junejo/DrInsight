import 'dotenv/config';
import {
  AppointmentStatus,
  PaymentStatus,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { createPrismaClient } from '../src/prisma/create-prisma-client';
import { DOCTOR_COUNT, PATIENT_COUNT, PAKISTANI_CITIES, SEED_DOMAIN, pick } from './seed-data';
import {
  APPOINTMENT_COUNT,
  BOOKING_DRAFT_COUNT,
  CONVERSATION_COUNT,
  MESSAGE_COUNT,
  NOTIFICATION_COUNT,
  PAYMENT_COUNT,
  PRESCRIPTION_COUNT,
  REVIEW_COUNT,
  SEED_PREFIX,
  appointmentNotes,
  appointmentReason,
  appointmentSeedKey,
  appointmentStatus,
  bookingDraftStatus,
  buildConversationMessage,
  buildConversationPairs,
  cancelReason,
  consultationType,
  draftSeedKey,
  feeToAmountCents,
  messageSeedKey,
  messagesPerConversation,
  notificationSeedKey,
  notificationTemplate,
  paymentSeedKey,
  paymentStatus,
  prescriptionDiagnosis,
  prescriptionItems,
  prescriptionNotes,
  reviewComment,
  reviewRating,
  scheduledAt,
  seedKey,
  videoProvider,
} from './seed-operational-data';
import { assertDevelopmentEnvironment } from './seed-shared';

export type OperationalSeedStats = {
  appointments: { created: number; skipped: number; total: number };
  bookingDrafts: { created: number; skipped: number; total: number };
  payments: { created: number; skipped: number; total: number };
  conversations: { created: number; skipped: number; total: number };
  messages: { created: number; skipped: number; total: number };
  reviews: { created: number; skipped: number; total: number };
  prescriptions: { created: number; skipped: number; total: number };
  notifications: { created: number; skipped: number; total: number };
};

type DoctorProfileRow = {
  id: string;
  userId: string;
  consultationFee: Prisma.Decimal;
  user: { id: string; firstName: string; lastName: string; email: string };
};

type PatientProfileRow = {
  id: string;
  userId: string;
  user: { id: string; firstName: string; lastName: string; email: string };
};

type AppointmentRow = {
  id: string;
  meetingRoomId: string | null;
  doctorId: string;
  patientId: string;
  status: AppointmentStatus;
  scheduledAt: Date;
};

async function resolveDoctorProfiles(prisma: PrismaClient): Promise<DoctorProfileRow[]> {
  const seedDoctorEmails = Array.from({ length: DOCTOR_COUNT }, (_, i) => `doctor${i + 1}@${SEED_DOMAIN}`);

  let doctors = await prisma.doctorProfile.findMany({
    where: { user: { email: { in: seedDoctorEmails } } },
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    orderBy: { user: { email: 'asc' } },
  });

  if (doctors.length === 0) {
    doctors = await prisma.doctorProfile.findMany({
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'asc' },
      take: DOCTOR_COUNT,
    });
  }

  if (doctors.length === 0) {
    throw new Error('No doctor profiles found. Run Phase 1 seed first.');
  }

  return doctors;
}

async function resolvePatientProfiles(prisma: PrismaClient): Promise<PatientProfileRow[]> {
  const seedPatientEmails = Array.from({ length: PATIENT_COUNT }, (_, i) => `patient${i + 1}@${SEED_DOMAIN}`);

  let patients = await prisma.patientProfile.findMany({
    where: { user: { email: { in: seedPatientEmails } } },
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    orderBy: { user: { email: 'asc' } },
  });

  if (patients.length === 0) {
    patients = await prisma.patientProfile.findMany({
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'asc' },
      take: PATIENT_COUNT,
    });
  }

  if (patients.length === 0) {
    throw new Error('No patient profiles found. Run Phase 1 seed first.');
  }

  return patients;
}

async function loadSeedAppointments(prisma: PrismaClient): Promise<Map<string, AppointmentRow>> {
  const rows = await prisma.appointment.findMany({
    where: { meetingRoomId: { startsWith: `${SEED_PREFIX}-appt-` } },
    select: {
      id: true,
      meetingRoomId: true,
      doctorId: true,
      patientId: true,
      status: true,
      scheduledAt: true,
    },
  });

  return new Map(
    rows
      .filter((row): row is AppointmentRow & { meetingRoomId: string } => Boolean(row.meetingRoomId))
      .map((row) => [row.meetingRoomId, row]),
  );
}

async function seedAppointments(
  prisma: PrismaClient,
  doctors: DoctorProfileRow[],
  patients: PatientProfileRow[],
) {
  const existing = await loadSeedAppointments(prisma);
  let created = 0;
  let skipped = 0;

  for (let index = 1; index <= APPOINTMENT_COUNT; index++) {
    const key = appointmentSeedKey(index);
    if (existing.has(key)) {
      skipped += 1;
      continue;
    }

    const doctor = doctors[index % doctors.length]!;
    const patient = patients[(index * 3) % patients.length]!;
    const status = appointmentStatus(index);
    const city = pick(PAKISTANI_CITIES, index).city;
    const scheduled = scheduledAt(index, status);
    const type = consultationType(index);
    const provider = videoProvider(index);

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        scheduledAt: scheduled,
        durationMinutes: index % 4 === 0 ? 45 : 30,
        status,
        consultationType: type,
        reason: appointmentReason(index),
        notes: appointmentNotes(index, status, city),
        meetingRoomId: key,
        videoProvider: provider ?? undefined,
        cancelledAt: status === AppointmentStatus.CANCELLED ? scheduled : null,
        cancelReason: status === AppointmentStatus.CANCELLED ? cancelReason(index) : null,
      },
      select: {
        id: true,
        meetingRoomId: true,
        doctorId: true,
        patientId: true,
        status: true,
        scheduledAt: true,
      },
    });

    existing.set(key, appointment as AppointmentRow);
    created += 1;
  }

  const total = await prisma.appointment.count({
    where: { meetingRoomId: { startsWith: `${SEED_PREFIX}-appt-` } },
  });

  return { created, skipped, total, map: existing };
}

async function seedBookingDrafts(
  prisma: PrismaClient,
  doctors: DoctorProfileRow[],
  patients: PatientProfileRow[],
  appointments: Map<string, AppointmentRow>,
) {
  let created = 0;
  let skipped = 0;

  for (let index = 1; index <= BOOKING_DRAFT_COUNT; index++) {
    const marker = `[${draftSeedKey(index)}]`;
    const existing = await prisma.bookingDraft.findFirst({
      where: { reason: { startsWith: marker } },
      select: { id: true },
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    const linkedAppointment = index <= 270 ? appointments.get(appointmentSeedKey(index)) : undefined;
    const doctor = linkedAppointment
      ? doctors.find((row) => row.id === linkedAppointment.doctorId) ?? doctors[index % doctors.length]!
      : doctors[index % doctors.length]!;
    const patient = linkedAppointment
      ? patients.find((row) => row.id === linkedAppointment.patientId) ??
        patients[(index * 3) % patients.length]!
      : patients[(index * 3) % patients.length]!;
    const feePkr = Number(doctor.consultationFee);
    const scheduled = linkedAppointment?.scheduledAt ?? scheduledAt(index, AppointmentStatus.PENDING);
    const expiresAt = new Date(scheduled);
    expiresAt.setHours(expiresAt.getHours() + (index % 6 === 0 ? -12 : 24));

    await prisma.bookingDraft.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        scheduledAt: scheduled,
        durationMinutes: 30,
        consultationType: consultationType(index),
        reason: `${marker} ${appointmentReason(index)}`,
        amountCents: feeToAmountCents(feePkr),
        currency: 'pkr',
        status: bookingDraftStatus(index),
        expiresAt,
      },
    });
    created += 1;
  }

  const total = await prisma.bookingDraft.count({
    where: { reason: { contains: `${SEED_PREFIX}-draft-` } },
  });

  return { created, skipped, total };
}

async function seedPayments(prisma: PrismaClient, appointments: Map<string, AppointmentRow>) {
  let created = 0;
  let skipped = 0;

  for (let index = 1; index <= PAYMENT_COUNT; index++) {
    const intentId = paymentSeedKey(index);
    const existing = await prisma.payment.findUnique({
      where: { providerIntentId: intentId },
      select: { id: true },
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    const draft = await prisma.bookingDraft.findFirst({
      where: { reason: { startsWith: `[${draftSeedKey(index)}]` } },
      select: { id: true, amountCents: true, currency: true, status: true },
    });

    if (!draft) {
      throw new Error(`Missing booking draft for payment seed index ${index}.`);
    }

    const linkedAppointment = index <= 270 ? appointments.get(appointmentSeedKey(index)) : undefined;
    const draftStatus = bookingDraftStatus(index);
    const status = paymentStatus(index, draftStatus);
    const confirmedAt =
      status === PaymentStatus.SUCCEEDED ? new Date(Date.now() - index * 60_000) : null;

    await prisma.payment.create({
      data: {
        bookingDraftId: draft.id,
        appointmentId: linkedAppointment?.id,
        provider: index % 3 === 0 ? 'stripe' : 'jazzcash',
        providerIntentId: intentId,
        clientSecret: `${intentId}-secret`,
        amountCents: draft.amountCents,
        currency: draft.currency,
        status,
        metadata: {
          seedKey: intentId,
          channel: index % 2 === 0 ? 'mobile_app' : 'web',
        },
        confirmedAt,
      },
    });
    created += 1;
  }

  const total = await prisma.payment.count({
    where: { providerIntentId: { startsWith: `${SEED_PREFIX}-pi-` } },
  });

  return { created, skipped, total };
}

async function seedConversations(
  prisma: PrismaClient,
  doctors: DoctorProfileRow[],
  patients: PatientProfileRow[],
  appointments: Map<string, AppointmentRow>,
) {
  const pairs = buildConversationPairs(doctors.length, patients.length, CONVERSATION_COUNT);
  let created = 0;
  let skipped = 0;

  for (let index = 0; index < pairs.length; index++) {
    const pair = pairs[index]!;
    const doctor = doctors[pair.doctorIndex]!;
    const patient = patients[pair.patientIndex]!;

    const existing = await prisma.conversation.findUnique({
      where: {
        patientId_doctorId: {
          patientId: patient.id,
          doctorId: doctor.id,
        },
      },
      select: { id: true },
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    const linkedAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: doctor.id,
        patientId: patient.id,
        meetingRoomId: { startsWith: `${SEED_PREFIX}-appt-` },
        status: { in: [AppointmentStatus.COMPLETED, AppointmentStatus.CONFIRMED] },
        conversation: null,
      },
      orderBy: { scheduledAt: 'desc' },
      select: { id: true, scheduledAt: true },
    });

    await prisma.conversation.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        appointmentId: linkedAppointment?.id,
        lastMessageAt: linkedAppointment?.scheduledAt ?? new Date(),
      },
    });
    created += 1;
  }

  const total = await prisma.conversation.count({
    where: {
      doctor: { user: { email: { endsWith: `@${SEED_DOMAIN}` } } },
    },
  });

  return { created, skipped, total, pairs, doctors, patients };
}

async function seedMessages(
  prisma: PrismaClient,
  doctors: DoctorProfileRow[],
  patients: PatientProfileRow[],
  pairs: Array<{ doctorIndex: number; patientIndex: number }>,
) {
  let created = 0;
  let skipped = 0;
  let messageIndex = 0;

  for (let conversationIndex = 1; conversationIndex <= pairs.length; conversationIndex++) {
    const pair = pairs[conversationIndex - 1]!;
    const doctor = doctors[pair.doctorIndex]!;
    const patient = patients[pair.patientIndex]!;

    const conversation = await prisma.conversation.findUnique({
      where: {
        patientId_doctorId: {
          patientId: patient.id,
          doctorId: doctor.id,
        },
      },
      select: { id: true, createdAt: true },
    });

    if (!conversation) continue;

    const count = messagesPerConversation(conversationIndex, MESSAGE_COUNT, pairs.length);

    for (let slot = 1; slot <= count; slot++) {
      messageIndex += 1;
      const key = messageSeedKey(messageIndex);
      const existing = await prisma.message.findFirst({
        where: {
          conversationId: conversation.id,
          content: { startsWith: `[${key}]` },
        },
        select: { id: true },
      });

      if (existing) {
        skipped += 1;
        continue;
      }

      const fromDoctor = slot % 2 === 0;
      const senderId = fromDoctor ? doctor.user.id : patient.user.id;
      const content = buildConversationMessage(
        messageIndex,
        fromDoctor,
        patient.user.firstName,
        doctor.user.lastName,
      );
      const createdAt = new Date(conversation.createdAt);
      createdAt.setMinutes(createdAt.getMinutes() + slot * 7);

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId,
          content,
          type: slot % 11 === 0 ? 'FILE' : 'TEXT',
          attachmentUrl: slot % 11 === 0 ? 'https://res.cloudinary.com/demo/report.pdf' : null,
          readAt: slot % 3 === 0 ? createdAt : null,
          createdAt,
        },
      });
      created += 1;
    }

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });
  }

  const total = await prisma.message.count({
    where: { content: { contains: `${SEED_PREFIX}-msg-` } },
  });

  return { created, skipped, total };
}

async function seedReviews(
  prisma: PrismaClient,
  doctors: DoctorProfileRow[],
  patients: PatientProfileRow[],
  appointments: Map<string, AppointmentRow>,
) {
  let created = 0;
  let skipped = 0;

  for (let index = 1; index <= REVIEW_COUNT; index++) {
    if (index <= 220) {
      const appointment = appointments.get(appointmentSeedKey(index));
      if (!appointment || appointment.status !== AppointmentStatus.COMPLETED) continue;

      const existing = await prisma.review.findUnique({
        where: { appointmentId: appointment.id },
        select: { id: true },
      });

      if (existing) {
        skipped += 1;
        continue;
      }

      const doctor = doctors.find((row) => row.id === appointment.doctorId)!;
      const patient = patients.find((row) => row.id === appointment.patientId)!;
      const city = pick(PAKISTANI_CITIES, index).city;

      await prisma.review.create({
        data: {
          doctorId: doctor.id,
          patientId: patient.id,
          appointmentId: appointment.id,
          rating: reviewRating(index),
          comment: reviewComment(index, doctor.user.lastName, city),
        },
      });
      created += 1;
      continue;
    }

    const marker = `[${seedKey('review', index)}]`;
    const existing = await prisma.review.findFirst({
      where: { comment: { startsWith: marker } },
      select: { id: true },
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    const doctor = doctors[index % doctors.length]!;
    const patient = patients[(index * 5) % patients.length]!;
    const city = pick(PAKISTANI_CITIES, index).city;

    await prisma.review.create({
      data: {
        doctorId: doctor.id,
        patientId: patient.id,
        rating: reviewRating(index),
        comment: `${marker} ${reviewComment(index, doctor.user.lastName, city)}`,
      },
    });
    created += 1;
  }

  const total = await prisma.review.count();
  return { created, skipped, total };
}

async function seedPrescriptions(
  prisma: PrismaClient,
  doctors: DoctorProfileRow[],
  patients: PatientProfileRow[],
  appointments: Map<string, AppointmentRow>,
) {
  let created = 0;
  let skipped = 0;

  for (let index = 1; index <= PRESCRIPTION_COUNT; index++) {
    const appointment = appointments.get(appointmentSeedKey(index));
    if (!appointment || appointment.status !== AppointmentStatus.COMPLETED) continue;

    const existing = await prisma.prescription.findUnique({
      where: { appointmentId: appointment.id },
      select: { id: true },
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    const doctor = doctors.find((row) => row.id === appointment.doctorId)!;
    const patient = patients.find((row) => row.id === appointment.patientId)!;
    const city = pick(PAKISTANI_CITIES, index).city;

    await prisma.prescription.create({
      data: {
        appointmentId: appointment.id,
        doctorId: doctor.id,
        patientId: patient.id,
        diagnosis: prescriptionDiagnosis(index),
        items: prescriptionItems(index),
        notes: prescriptionNotes(index, city),
        pdfUrl: `https://res.cloudinary.com/demo/prescriptions/${appointmentSeedKey(index)}.pdf`,
      },
    });
    created += 1;
  }

  const total = await prisma.prescription.count({
    where: { pdfUrl: { contains: SEED_PREFIX } },
  });

  return { created, skipped, total };
}

async function seedNotifications(prisma: PrismaClient, doctors: DoctorProfileRow[], patients: PatientProfileRow[]) {
  const users = [...doctors.map((row) => row.user), ...patients.map((row) => row.user)];
  let created = 0;
  let skipped = 0;

  for (let index = 1; index <= NOTIFICATION_COUNT; index++) {
    const key = notificationSeedKey(index);
    const user = users[index % users.length]!;

    const existing = await prisma.notification.findFirst({
      where: {
        userId: user.id,
        data: {
          path: ['seedKey'],
          equals: key,
        },
      },
      select: { id: true },
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    const template = notificationTemplate(index);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - (index % 45));
    createdAt.setHours(8 + (index % 12), (index * 5) % 60, 0, 0);

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: template.type,
        title: template.title,
        body: template.body,
        data: {
          seedKey: key,
          locale: index % 2 === 0 ? 'ur-PK' : 'en-PK',
        },
        readAt: index % 3 === 0 ? createdAt : null,
        createdAt,
      },
    });
    created += 1;
  }

  let seedTotal = 0;
  for (let index = 1; index <= NOTIFICATION_COUNT; index++) {
    const row = await prisma.notification.findFirst({
      where: {
        data: {
          path: ['seedKey'],
          equals: notificationSeedKey(index),
        },
      },
      select: { id: true },
    });
    if (row) seedTotal += 1;
  }

  return { created, skipped, total: seedTotal };
}

export async function seedOperationalPhase(prisma: PrismaClient): Promise<OperationalSeedStats> {
  console.log('Starting Phase 3 operational seed (incremental upsert)...');

  const doctors = await resolveDoctorProfiles(prisma);
  const patients = await resolvePatientProfiles(prisma);

  const appointmentResult = await seedAppointments(prisma, doctors, patients);
  const bookingDraftResult = await seedBookingDrafts(
    prisma,
    doctors,
    patients,
    appointmentResult.map,
  );
  const paymentResult = await seedPayments(prisma, appointmentResult.map);
  const conversationResult = await seedConversations(
    prisma,
    doctors,
    patients,
    appointmentResult.map,
  );
  const messageResult = await seedMessages(
    prisma,
    conversationResult.doctors,
    conversationResult.patients,
    conversationResult.pairs,
  );
  const reviewResult = await seedReviews(
    prisma,
    doctors,
    patients,
    appointmentResult.map,
  );
  const prescriptionResult = await seedPrescriptions(
    prisma,
    doctors,
    patients,
    appointmentResult.map,
  );
  const notificationResult = await seedNotifications(prisma, doctors, patients);

  if (
    appointmentResult.total < APPOINTMENT_COUNT ||
    bookingDraftResult.total < BOOKING_DRAFT_COUNT ||
    paymentResult.total < PAYMENT_COUNT ||
    messageResult.total < MESSAGE_COUNT ||
    reviewResult.total < REVIEW_COUNT ||
    prescriptionResult.total < PRESCRIPTION_COUNT ||
    notificationResult.total < NOTIFICATION_COUNT
  ) {
    throw new Error(
      `Operational seed below expected totals: appointments=${appointmentResult.total}, drafts=${bookingDraftResult.total}, payments=${paymentResult.total}, messages=${messageResult.total}, reviews=${reviewResult.total}, prescriptions=${prescriptionResult.total}, notifications=${notificationResult.total}`,
    );
  }

  const conversationTotal = await prisma.conversation.count({
    where: {
      doctor: { user: { email: { endsWith: `@${SEED_DOMAIN}` } } },
    },
  });

  if (conversationTotal < CONVERSATION_COUNT) {
    throw new Error(`Operational seed below expected conversation total: ${conversationTotal}`);
  }

  return {
    appointments: {
      created: appointmentResult.created,
      skipped: appointmentResult.skipped,
      total: appointmentResult.total,
    },
    bookingDrafts: bookingDraftResult,
    payments: paymentResult,
    conversations: {
      created: conversationResult.created,
      skipped: conversationResult.skipped,
      total: conversationTotal,
    },
    messages: messageResult,
    reviews: reviewResult,
    prescriptions: prescriptionResult,
    notifications: notificationResult,
  };
}

async function main() {
  assertDevelopmentEnvironment();

  const prisma = createPrismaClient();

  try {
    const stats = await seedOperationalPhase(prisma);
    console.log('Phase 3 operational seed completed successfully.');
    console.log(stats);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Phase 3 operational seed failed:', error);
    process.exit(1);
  });
}
