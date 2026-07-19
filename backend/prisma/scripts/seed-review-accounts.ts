import 'dotenv/config';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import {
  AppointmentStatus,
  BookingDraftStatus,
  ClinicalNoteAuthorType,
  ClinicalNotePriority,
  ConsultationType,
  DoctorAvailability,
  LabOrderPriority,
  LabOrderStatus,
  MeetingParticipantRole,
  MeetingStatus,
  MessageType,
  NotificationType,
  PatientAlertSeverity,
  PatientAlertStatus,
  PaymentStatus,
  Prisma,
  QuestionStatus,
  UserRole,
  UserStatus,
  VitalStatus,
  VitalType,
  VideoProvider,
} from '@prisma/client';
import { createPrismaClient } from '../../src/prisma/create-prisma-client';
import {
  ALL_PAKISTANI_LANGUAGES,
  BLOOD_GROUPS,
  COMMON_ALLERGIES,
  GENDERS,
  MEDICAL_HISTORY_SNIPPETS,
  MEDICAL_SPECIALTIES,
  PAKISTANI_CITIES,
  PAKISTANI_HOSPITALS,
  PAKISTANI_MEDICAL_UNIVERSITIES,
  SEED_PASSWORD,
  avatarUrl,
  buildDoctorBioProfile,
  consultationFeePkr,
  dateOfBirth,
  doctorBio,
  emergencyContact,
  pakistaniPhone,
  pick,
  pmdcLicenseNumber,
} from '../seed-data';
import {
  buildConversationMessage,
  prescriptionDiagnosis,
  prescriptionItems,
  prescriptionNotes,
} from '../seed-operational-data';

const prisma = createPrismaClient();
const BCRYPT_ROUNDS = 12;
const PREFIX = 'review-seed';
const PASSWORD = process.env.REVIEW_SEED_PASSWORD ?? SEED_PASSWORD;

const REVIEW_ACCOUNTS = {
  doctor: 'doctor1@drinsight.pk',
  patient: 'patient1@drinsight.pk',
  admin: 'admin1@drinsight.pk',
} as const;

type ReviewUserBundle = {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
  doctorProfile?: { id: string; consultationFee: Prisma.Decimal };
  patientProfile?: { id: string };
};

function reviewKey(kind: string, slug: string): string {
  return `${PREFIX}-${kind}-${slug}`;
}

function buildReviewPrescriptionExtendedData(params: {
  rxIndex: number;
  diagnosis: string;
  notes: string;
  consultReason: string;
}): Prisma.InputJsonValue {
  const items = prescriptionItems(params.rxIndex);
  const meds = items.map((item) => ({
    name: item.medication,
    strength: "",
    dosage: item.dosage,
    frequency: item.frequency,
    route: "Oral",
    duration: item.duration,
    food: item.instructions?.toLowerCase().includes("before") ? "Before food" : "After food",
    instructions: item.instructions ?? "",
  }));

  return {
    summary: {
      reason: params.consultReason,
      chiefComplaint: "Sore throat, productive cough and low-grade fever.",
      notes: params.notes,
      symptomDuration: "5 days",
      prevTreatment: "OTC paracetamol with partial relief",
      prevConsultRef: "—",
      reports: [],
    },
    symptoms: {
      reported: ["Sore throat", "Cough", "Fever"],
      duration: "5 days",
      severity: "Moderate",
      frequency: "Daily",
      progression: "Stable",
      associated: "Mild body aches",
      aggravating: "Cold drinks, talking",
      relieving: "Warm fluids, rest",
    },
    exam: {
      appearance: "Mildly unwell, no respiratory distress",
      alertness: "Alert & oriented",
      speech: "Normal",
      respiratory: "None",
      swelling: "None visible",
      skin: "No rash noted on video",
      temp: "37.8 °C",
      bp: "118/76 mmHg",
      sugar: "—",
      spo2: "98%",
      hr: "82 bpm",
      other: "",
      observations:
        "Pharyngeal erythema reported by patient; no stridor or cyanosis observed on video.",
    },
    assessment: {
      provisional: params.diagnosis,
      differential: "Viral URTI; Group A streptococcal pharyngitis",
      icd10: "J06.9",
      impression: "Likely bacterial URTI — empirical antibiotic therapy appropriate.",
      risk: "Low — no red-flag features.",
    },
    investigations: ["CBC", "C-reactive protein (CRP)", "Throat swab culture if no improvement"],
    meds,
    advice: {
      diet: "Soft, warm foods; avoid spicy and cold items.",
      lifestyle: "Adequate rest; avoid crowded places until afebrile.",
      exercise: "Avoid strenuous activity until symptoms resolve.",
      hydration: "2–2.5 L fluids daily including warm teas.",
      sleep: "7–8 hours nightly.",
      homeCare: "Salt-water gargles 3× daily; steam inhalation as tolerated.",
      isolation: "Wear mask around family for 48 hours after starting antibiotics.",
      warning: "High fever above 39°C, difficulty swallowing, or breathing difficulty.",
      emergency: "Severe breathlessness or inability to swallow — seek urgent care.",
    },
    followup: {
      required: "Yes",
      date: "",
      after: "7 days",
      type: "Video",
      referral: "None",
      referralNotes: "",
    },
    doctorNotes: {
      text: params.notes,
      includeInPatient: false,
    },
  };
}

function atLocalTime(dayOffset: number, hour: number, minute = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function ensureUser(
  email: string,
  role: UserRole,
  firstName: string,
  lastName: string,
): Promise<ReviewUserBundle['user']> {
  const passwordHash = await hashPassword(PASSWORD);
  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      firstName,
      lastName,
      role,
      status: UserStatus.ACTIVE,
      phone: pakistaniPhone(role === UserRole.DOCTOR ? 1001 : role === UserRole.PATIENT ? 2001 : 1),
      avatarUrl: avatarUrl(firstName, lastName),
      emailVerified: true,
      profileCompletedAt: new Date(),
      isOnline: role === UserRole.DOCTOR,
      lastSeenAt: new Date(),
    },
    update: {
      status: UserStatus.ACTIVE,
      emailVerified: true,
      profileCompletedAt: new Date(),
      passwordHash,
    },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });

  return user;
}

async function ensureDoctorProfile(user: ReviewUserBundle['user']) {
  const cityInfo = pick(PAKISTANI_CITIES, 1);
  const specialtyInfo = pick(MEDICAL_SPECIALTIES, 1);
  const subSpecialty = pick(specialtyInfo.subSpecialties, 1);
  const hospital = pick(PAKISTANI_HOSPITALS, 1);
  const university = pick(PAKISTANI_MEDICAL_UNIVERSITIES, 1);
  const experienceYears = 12;
  const licenseNumber = 'PMDC-REVIEW-DOC-001';
  const bioProfile = buildDoctorBioProfile({
    index: 1,
    firstName: user.firstName,
    lastName: user.lastName,
    specialty: specialtyInfo.specialty,
    subSpecialty,
    city: cityInfo.city,
    hospital,
    university,
    experienceYears,
    licenseNumber,
    gender: 'Male',
  });

  return prisma.doctorProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      specialty: specialtyInfo.specialty,
      subSpecialty,
      licenseNumber,
      doctorNumber: 'DOC-REVIEW-001',
      bio: doctorBio(user.firstName, user.lastName, specialtyInfo.specialty, cityInfo.city, experienceYears, hospital),
      experienceYears,
      consultationFee: new Prisma.Decimal(consultationFeePkr(1)),
      rating: 4.8,
      reviewCount: 24,
      availability: DoctorAvailability.AVAILABLE,
      languages: pickMany(ALL_PAKISTANI_LANGUAGES, 3, 1),
      education: `${university} — MBBS, FCPS (${specialtyInfo.specialty})`,
      hospital,
      city: cityInfo.city,
      country: 'Pakistan',
      gender: 'Male',
      profileSlug: 'dr-javed-kumbhar-review',
      bookingEnabled: true,
      onlineAvailEnabled: true,
      physicalAvailEnabled: true,
      onlineSchedule: {
        monday: [{ start: '09:00', end: '13:00' }, { start: '17:00', end: '20:00' }],
        tuesday: [{ start: '09:00', end: '13:00' }],
        wednesday: [{ start: '14:00', end: '18:00' }],
        thursday: [{ start: '09:00', end: '13:00' }],
        friday: [{ start: '10:00', end: '14:00' }],
      },
      clinicSchedule: {
        monday: [{ start: '10:00', end: '14:00', clinic: hospital }],
        wednesday: [{ start: '10:00', end: '14:00', clinic: hospital }],
      },
      ...bioProfile,
    },
    update: {
      availability: DoctorAvailability.AVAILABLE,
      bookingEnabled: true,
      onlineAvailEnabled: true,
      physicalAvailEnabled: true,
      rating: 4.8,
      reviewCount: 24,
    },
    select: { id: true, consultationFee: true },
  });
}

function pickMany<T>(items: readonly T[], count: number, seed: number): T[] {
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    result.push(items[(seed + i) % items.length]!);
  }
  return Array.from(new Set(result));
}

async function ensurePatientProfile(user: ReviewUserBundle['user']) {
  const cityInfo = pick(PAKISTANI_CITIES, 2);
  const contactFirst = 'Ahmed';
  const contactLast = 'Khan';

  return prisma.patientProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      patientNumber: 'PT-REVIEW-001',
      dateOfBirth: dateOfBirth(1),
      gender: pick(GENDERS, 1),
      bloodGroup: pick(BLOOD_GROUPS, 1),
      allergies: pickMany(COMMON_ALLERGIES, 2, 1),
      medicalHistory: pick(MEDICAL_HISTORY_SNIPPETS, 1),
      emergencyContact: emergencyContact(contactFirst, contactLast, 1),
      city: cityInfo.city,
      province: cityInfo.province,
      country: 'Pakistan',
      address: `House 42, Block 5, ${cityInfo.city}`,
      postalCode: '75500',
      healthInterests: ['Cardiology', 'Diabetes', 'Nutrition'],
      languagePreference: 'English',
    },
    update: {
      city: cityInfo.city,
      province: cityInfo.province,
      country: 'Pakistan',
      address: `House 42, Block 5, ${cityInfo.city}`,
    },
    select: { id: true },
  });
}

async function loadReviewBundle(): Promise<{
  doctor: ReviewUserBundle;
  patient: ReviewUserBundle;
  admin: ReviewUserBundle['user'];
}> {
  console.log('\n=== Ensuring review accounts ===\n');

  const doctorUser = await ensureUser(REVIEW_ACCOUNTS.doctor, UserRole.DOCTOR, 'Javed', 'Kumbhar');
  const patientUser = await ensureUser(REVIEW_ACCOUNTS.patient, UserRole.PATIENT, 'Wajiha', 'Nawaz');
  const adminUser = await ensureUser(REVIEW_ACCOUNTS.admin, UserRole.ADMIN, 'Admin', 'Reviewer');

  const doctorProfile = await ensureDoctorProfile(doctorUser);
  const patientProfile = await ensurePatientProfile(patientUser);

  console.log(`✓ Doctor:  ${doctorUser.email} (${doctorProfile.id})`);
  console.log(`✓ Patient: ${patientUser.email} (${patientProfile.id})`);
  console.log(`✓ Admin:   ${adminUser.email}`);

  return {
    doctor: { user: doctorUser, doctorProfile },
    patient: { user: patientUser, patientProfile },
    admin: adminUser,
  };
}

type ApptSeed = {
  slug: string;
  status: AppointmentStatus;
  type: ConsultationType;
  scheduledAt: Date;
  reason: string;
  enrich?: 'full' | 'payment' | 'none';
  bookingSource?: 'ONLINE' | 'WALK_IN' | 'PHONE';
};

async function upsertAppointment(
  doctorId: string,
  patientId: string,
  config: ApptSeed,
  doctorUserId: string,
  patientUserId: string,
) {
  const meetingRoomId = reviewKey('appt', config.slug);
  let appointment = await prisma.appointment.findFirst({ where: { meetingRoomId } });
  const isNew = !appointment;

  const roomId = `room_${config.slug}_${randomBytes(4).toString('hex')}`;
  const isPast = config.scheduledAt < new Date();
  const isLive = config.status === AppointmentStatus.IN_PROGRESS;

  if (!appointment) {
    appointment = await prisma.appointment.create({
    data: {
      patientId,
      doctorId,
      scheduledAt: config.scheduledAt,
      durationMinutes: config.type === ConsultationType.IN_PERSON ? 45 : 30,
      status: config.status,
      consultationType: config.type,
      bookingSource: config.bookingSource ?? 'ONLINE',
      reason: config.reason,
      notes:
        config.status === AppointmentStatus.COMPLETED
          ? 'Review seed — consultation completed successfully with follow-up plan documented.'
          : config.status === AppointmentStatus.CANCELLED
            ? 'Cancelled by patient request.'
            : null,
      meetingRoomId,
      roomId: config.type === ConsultationType.IN_PERSON ? null : roomId,
      meetingStatus:
        config.status === AppointmentStatus.COMPLETED
          ? MeetingStatus.ENDED
          : isLive
            ? MeetingStatus.LIVE
            : MeetingStatus.WAITING,
      videoProvider:
        config.type === ConsultationType.IN_PERSON || config.type === ConsultationType.CHAT
          ? null
          : VideoProvider.WEBRTC,
      startedAt: isPast || isLive ? new Date(config.scheduledAt.getTime() + 5 * 60_000) : null,
      endedAt:
        config.status === AppointmentStatus.COMPLETED
          ? new Date(config.scheduledAt.getTime() + 28 * 60_000)
          : null,
      durationSeconds: config.status === AppointmentStatus.COMPLETED ? 1680 : null,
      doctorJoinedAt: isPast || isLive ? new Date(config.scheduledAt.getTime() + 3 * 60_000) : null,
      patientJoinedAt: isPast || isLive ? new Date(config.scheduledAt.getTime() + 6 * 60_000) : null,
      cancelledAt: config.status === AppointmentStatus.CANCELLED ? config.scheduledAt : null,
      cancelReason: config.status === AppointmentStatus.CANCELLED ? 'Patient requested reschedule' : null,
    },
  });
  }

  if (isNew && config.type !== ConsultationType.IN_PERSON && (config.enrich === 'full' || isLive || config.status === AppointmentStatus.CONFIRMED)) {
    const meeting = await prisma.meeting.upsert({
      where: { appointmentId: appointment.id },
      create: {
        appointmentId: appointment.id,
        roomId: roomId!,
        status:
          config.status === AppointmentStatus.COMPLETED
            ? MeetingStatus.ENDED
            : isLive
              ? MeetingStatus.LIVE
              : MeetingStatus.WAITING,
        startedAt: appointment.startedAt,
        endedAt: appointment.endedAt,
        durationSeconds: appointment.durationSeconds,
        createdById: doctorUserId,
      },
      update: {},
    });

    for (const [userId, role] of [
      [doctorUserId, MeetingParticipantRole.DOCTOR],
      [patientUserId, MeetingParticipantRole.PATIENT],
    ] as const) {
      await prisma.meetingParticipant.upsert({
        where: { meetingId_userId: { meetingId: meeting.id, userId } },
        create: {
          meetingId: meeting.id,
          userId,
          role,
          joinedAt: appointment.startedAt,
          leftAt: appointment.endedAt,
          isConnected: isLive,
          cameraEnabled: true,
          micEnabled: true,
        },
        update: { isConnected: isLive },
      });
    }

    if (config.enrich === 'full') {
      await prisma.meetingChat.createMany({
        data: [
          {
            meetingId: meeting.id,
            senderId: patientUserId,
            content: 'Assalam o Alaikum doctor, thank you for the consultation.',
          },
          {
            meetingId: meeting.id,
            senderId: doctorUserId,
            content: 'Wa Alaikum Assalam. I have reviewed your reports — continue the prescribed medication.',
          },
        ],
        skipDuplicates: true,
      });
    }
  }

  const conversation = await prisma.conversation.upsert({
    where: { patientId_doctorId: { patientId, doctorId } },
    create: { patientId, doctorId, appointmentId: appointment.id, lastMessageAt: new Date() },
    update: { appointmentId: appointment.id, lastMessageAt: new Date() },
  });

  const msgMarker = reviewKey('msg', config.slug);
  const hasMsg = await prisma.message.findFirst({
    where: { conversationId: conversation.id, content: { startsWith: msgMarker } },
  });
  if (!hasMsg) {
    await prisma.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          senderId: patientUserId,
          content: `${msgMarker} ${buildConversationMessage(1, false, 'Wajiha', 'Kumbhar')}`,
          type: MessageType.TEXT,
        },
        {
          conversationId: conversation.id,
          senderId: doctorUserId,
          content: `${msgMarker} ${buildConversationMessage(2, true, 'Wajiha', 'Kumbhar')}`,
          type: MessageType.TEXT,
        },
      ],
    });
  }

  if (config.enrich === 'full' || config.enrich === 'payment') {
    const draftMarker = reviewKey('draft', config.slug);
    let draft = await prisma.bookingDraft.findFirst({ where: { reason: draftMarker } });
    if (!draft) {
      draft = await prisma.bookingDraft.create({
        data: {
          patientId,
          doctorId,
          scheduledAt: config.scheduledAt,
          durationMinutes: 30,
          consultationType: config.type,
          reason: draftMarker,
          amountCents: 350000,
          currency: 'pkr',
          status: BookingDraftStatus.CONFIRMED,
          expiresAt: new Date(config.scheduledAt.getTime() + 24 * 60 * 60_000),
        },
      });
    }

    const intentId = reviewKey('pi', config.slug);
    const paymentExists = await prisma.payment.findUnique({ where: { providerIntentId: intentId } });
    if (!paymentExists) {
      await prisma.payment.create({
        data: {
          bookingDraftId: draft.id,
          appointmentId: appointment.id,
          patientId,
          doctorId,
          provider: 'stripe',
          providerIntentId: intentId,
          clientSecret: `${intentId}-secret`,
          amountCents: 350000,
          currency: 'pkr',
          status:
            config.slug === 'pending-payment'
              ? PaymentStatus.REQUIRES_PAYMENT_METHOD
              : PaymentStatus.SUCCEEDED,
          confirmedAt: config.slug === 'pending-payment' ? null : new Date(),
          billingName: 'Wajiha Nawaz',
          billingEmail: REVIEW_ACCOUNTS.patient,
          billingCountry: 'PK',
          invoiceNumber: `INV-REVIEW-${config.slug.toUpperCase()}`,
        },
      });
    }
  }

  if (config.status === AppointmentStatus.COMPLETED && config.enrich === 'full') {
    const rxIndex = 1;
    const diagnosis = prescriptionDiagnosis(rxIndex);
    const notes = prescriptionNotes(rxIndex, 'Karachi');
    const extendedData = buildReviewPrescriptionExtendedData({
      rxIndex,
      diagnosis,
      notes,
      consultReason: config.reason,
    });
    const rxItems = prescriptionItems(rxIndex).map((item) => ({
      ...item,
      strength: "",
      route: "Oral",
      food: item.instructions?.toLowerCase().includes("before") ? "Before food" : "After food",
    }));
    const rxExists = await prisma.prescription.findUnique({ where: { appointmentId: appointment.id } });
    if (!rxExists) {
      await prisma.prescription.create({
        data: {
          appointmentId: appointment.id,
          doctorId,
          patientId,
          diagnosis,
          items: rxItems,
          notes,
          extendedData,
          status: 'ISSUED',
          prescriptionNumber: `RX-REVIEW-${config.slug.toUpperCase()}`,
          issuedAt: appointment.endedAt ?? config.scheduledAt,
        },
      });
    } else {
      await prisma.prescription.update({
        where: { id: rxExists.id },
        data: { extendedData, items: rxItems },
      });
    }

    const reviewExists = await prisma.review.findUnique({ where: { appointmentId: appointment.id } });
    if (!reviewExists) {
      await prisma.review.create({
        data: {
          appointmentId: appointment.id,
          doctorId,
          patientId,
          rating: 5,
          comment:
            'Excellent consultation. Dr. Kumbhar explained everything clearly and the video quality was great.',
        },
      });
    }

    const noteMarker = reviewKey('note', config.slug);
    const noteExists = await prisma.patientClinicalNote.findFirst({
      where: { title: noteMarker },
    });
    if (!noteExists) {
      await prisma.patientClinicalNote.create({
        data: {
          patientId,
          doctorId,
          appointmentId: appointment.id,
          authorId: doctorUserId,
          authorType: ClinicalNoteAuthorType.DOCTOR,
          title: noteMarker,
          noteType: 'SOAP Note',
          clinicalNotes:
            'Subjective: Patient reports improved symptoms. Objective: Vitals stable. Assessment: Resolving URTI. Plan: Continue supportive care, follow up in 2 weeks.',
          followUpNotes: 'Return if fever persists beyond 48 hours.',
          priority: ClinicalNotePriority.NORMAL,
          doctorReadAt: new Date(),
        },
      });
    }

    const labExists = await prisma.labOrder.findFirst({ where: { appointmentId: appointment.id } });
    if (!labExists) {
      await prisma.labOrder.create({
        data: {
          appointmentId: appointment.id,
          doctorId,
          patientId,
          tests: [
            { name: 'Complete Blood Count (CBC)', code: 'CBC' },
            { name: 'C-Reactive Protein (CRP)', code: 'CRP' },
          ],
          instructions: 'Fasting not required. Results within 24 hours.',
          priority: LabOrderPriority.ROUTINE,
          status: LabOrderStatus.ORDERED,
        },
      });
    }
  }

  return appointment;
}

async function seedAppointments(bundle: { doctor: ReviewUserBundle; patient: ReviewUserBundle }) {
  const { doctor, patient } = bundle;
  const doctorId = doctor.doctorProfile!.id;
  const patientId = patient.patientProfile!.id;

  const configs: ApptSeed[] = [
    {
      slug: 'live-now',
      status: AppointmentStatus.IN_PROGRESS,
      type: ConsultationType.VIDEO,
      scheduledAt: atLocalTime(0, new Date().getHours(), new Date().getMinutes()),
      reason: 'Live video consultation — review & test WebRTC room',
      enrich: 'none',
    },
    {
      slug: 'today-1130',
      status: AppointmentStatus.CONFIRMED,
      type: ConsultationType.VIDEO,
      scheduledAt: atLocalTime(0, 11, 30),
      reason: "Today's confirmed video follow-up",
    },
    {
      slug: 'today-1530',
      status: AppointmentStatus.CONFIRMED,
      type: ConsultationType.AUDIO,
      scheduledAt: atLocalTime(0, 15, 30),
      reason: "Today's phone consultation",
    },
    {
      slug: 'tomorrow-chat',
      status: AppointmentStatus.CONFIRMED,
      type: ConsultationType.CHAT,
      scheduledAt: atLocalTime(1, 10, 0),
      reason: 'Chat consultation — medication questions',
    },
    {
      slug: 'next-week-pending',
      status: AppointmentStatus.PENDING,
      type: ConsultationType.VIDEO,
      scheduledAt: atLocalTime(5, 9, 0),
      reason: 'Pending approval — new patient concern',
    },
    {
      slug: 'past-video-full',
      status: AppointmentStatus.COMPLETED,
      type: ConsultationType.VIDEO,
      scheduledAt: atLocalTime(-7, 10, 0),
      reason: 'Completed video consult — hypertension review',
      enrich: 'full',
    },
    {
      slug: 'past-video-2',
      status: AppointmentStatus.COMPLETED,
      type: ConsultationType.VIDEO,
      scheduledAt: atLocalTime(-14, 11, 0),
      reason: 'Completed video consult — diabetes follow-up',
      enrich: 'payment',
    },
    {
      slug: 'past-audio',
      status: AppointmentStatus.COMPLETED,
      type: ConsultationType.AUDIO,
      scheduledAt: atLocalTime(-21, 16, 0),
      reason: 'Completed phone consult — allergy symptoms',
      enrich: 'payment',
    },
    {
      slug: 'past-inperson',
      status: AppointmentStatus.COMPLETED,
      type: ConsultationType.IN_PERSON,
      scheduledAt: atLocalTime(-30, 10, 30),
      reason: 'In-person clinic visit — ECG review',
      enrich: 'payment',
      bookingSource: 'WALK_IN',
    },
    {
      slug: 'cancelled',
      status: AppointmentStatus.CANCELLED,
      type: ConsultationType.VIDEO,
      scheduledAt: atLocalTime(-3, 14, 0),
      reason: 'Cancelled — patient travel conflict',
    },
    {
      slug: 'no-show',
      status: AppointmentStatus.NO_SHOW,
      type: ConsultationType.VIDEO,
      scheduledAt: atLocalTime(-10, 9, 30),
      reason: 'Patient did not join video call',
    },
    {
      slug: 'pending-payment',
      status: AppointmentStatus.PENDING,
      type: ConsultationType.VIDEO,
      scheduledAt: atLocalTime(3, 11, 0),
      reason: 'Awaiting payment confirmation',
      enrich: 'payment',
    },
  ];

  let created = 0;
  for (const config of configs) {
    const before = await prisma.appointment.findFirst({ where: { meetingRoomId: reviewKey('appt', config.slug) } });
    await upsertAppointment(
      doctorId,
      patientId,
      config,
      bundle.doctor.user.id,
      bundle.patient.user.id,
    );
    if (!before) created += 1;
  }

  // Extra patients for doctor dashboard variety
  const extraPatients = await prisma.patientProfile.findMany({
    where: { user: { email: { in: ['patient2@drinsight.pk', 'patient3@drinsight.pk'] } } },
    include: { user: { select: { id: true, firstName: true, lastName: true } } },
    take: 3,
  });

  for (let i = 0; i < extraPatients.length; i++) {
    const extra = extraPatients[i]!;
    const slug = `extra-patient-${i + 1}`;
    const before = await prisma.appointment.findFirst({ where: { meetingRoomId: reviewKey('appt', slug) } });
    await upsertAppointment(
      doctorId,
      extra.id,
      {
        slug,
        status: AppointmentStatus.CONFIRMED,
        type: ConsultationType.VIDEO,
        scheduledAt: atLocalTime(0, 13 + i, 0),
        reason: `Today's consult with ${extra.user.firstName} ${extra.user.lastName}`,
      },
      bundle.doctor.user.id,
      extra.user.id,
    );
    if (!before) created += 1;
  }

  console.log(`✓ Appointments: ${created} new review appointments seeded`);
}

async function seedVitals(patientId: string) {
  const marker = reviewKey('vital', 'batch');
  const existing = await prisma.patientVitalReading.count({
    where: { patientId, notes: marker },
  });
  if (existing > 0) {
    console.log('✓ Vitals: already seeded');
    return;
  }

  const now = Date.now();
  const readings = [
    { type: VitalType.BLOOD_PRESSURE, value: '118/76', unit: 'mmHg', status: VitalStatus.NORMAL, daysAgo: 1 },
    { type: VitalType.HEART_RATE, value: '72', unit: 'bpm', status: VitalStatus.NORMAL, daysAgo: 1 },
    { type: VitalType.BLOOD_SUGAR, value: '98', unit: 'mg/dL', status: VitalStatus.NORMAL, daysAgo: 2 },
    { type: VitalType.WEIGHT, value: '62', unit: 'kg', status: VitalStatus.NORMAL, daysAgo: 3 },
    { type: VitalType.TEMPERATURE, value: '36.8', unit: '°C', status: VitalStatus.NORMAL, daysAgo: 4 },
    { type: VitalType.OXYGEN_SATURATION, value: '98', unit: '%', status: VitalStatus.NORMAL, daysAgo: 5 },
    { type: VitalType.BLOOD_PRESSURE, value: '124/82', unit: 'mmHg', status: VitalStatus.BORDERLINE, daysAgo: 7 },
    { type: VitalType.BLOOD_SUGAR, value: '142', unit: 'mg/dL', status: VitalStatus.HIGH, daysAgo: 10 },
  ];

  await prisma.patientVitalReading.createMany({
    data: readings.map((r) => ({
      patientId,
      type: r.type,
      value: r.value,
      unit: r.unit,
      status: r.status,
      notes: marker,
      recordedAt: new Date(now - r.daysAgo * 24 * 60 * 60_000),
    })),
  });
  console.log(`✓ Vitals: ${readings.length} readings seeded`);
}

async function seedAskDoctor(bundle: { doctor: ReviewUserBundle; patient: ReviewUserBundle }) {
  const questions = [
    {
      slug: 'answered',
      status: QuestionStatus.PENDING,
      category: 'Cardiology',
      title: 'Is occasional chest tightness during exercise normal?',
      question:
        'I am 35 and notice mild chest tightness when jogging. No pain at rest. Should I be worried?',
      answer:
        'Occasional exertional tightness can be benign but cardiac causes must be excluded. I recommend an ECG and clinical review — please book a consultation.',
      answered: true,
    },
    {
      slug: 'pending',
      status: QuestionStatus.PENDING,
      category: 'General Medicine',
      title: 'Can I take ibuprofen with my blood pressure medication?',
      question:
        'I take amlodipine 5mg daily. Is it safe to use ibuprofen for headaches?',
      answered: false,
    },
    {
      slug: 'patient-note',
      status: QuestionStatus.APPROVED,
      category: 'Follow-up',
      title: 'Symptom update after last visit',
      question: 'Fever has resolved but cough persists for 5 days. Should I restart antibiotics?',
      answer: 'If cough is dry and improving, antibiotics are usually not needed. Stay hydrated and book follow-up if worsening.',
      answered: true,
    },
  ];

  let created = 0;
  for (const q of questions) {
    const marker = reviewKey('qa', q.slug);
    const exists = await prisma.askDoctorQuestion.findFirst({
      where: { question: { startsWith: marker } },
    });
    if (exists) continue;

    await prisma.askDoctorQuestion.create({
      data: {
        category: q.category,
        title: q.title,
        question: `${marker} ${q.question}`,
        answer: q.answered ? q.answer : null,
        status: q.answered ? QuestionStatus.ANSWERED : q.status,
        submitterUserId: bundle.patient.user.id,
        doctorId: bundle.doctor.doctorProfile!.id,
        answeredById: q.answered ? bundle.doctor.user.id : null,
        answeredAt: q.answered ? new Date() : null,
        approvedAt: q.status === QuestionStatus.APPROVED ? new Date() : null,
        helpfulCount: q.answered ? 3 : 0,
      },
    });
    created += 1;
  }
  console.log(`✓ Ask Doctor: ${created} questions seeded`);
}

async function seedPatientNotes(bundle: { doctor: ReviewUserBundle; patient: ReviewUserBundle }) {
  const notes = [
    {
      slug: 'unread-doctor',
      authorType: ClinicalNoteAuthorType.DOCTOR,
      authorId: bundle.doctor.user.id,
      title: 'Post-consultation follow-up (unread)',
      read: false,
    },
    {
      slug: 'read-doctor',
      authorType: ClinicalNoteAuthorType.DOCTOR,
      authorId: bundle.doctor.user.id,
      title: 'Hypertension management plan',
      read: true,
    },
    {
      slug: 'patient-submitted',
      authorType: ClinicalNoteAuthorType.PATIENT,
      authorId: bundle.patient.user.id,
      title: 'Symptom diary — cough update',
      read: false,
    },
  ];

  let created = 0;
  for (const n of notes) {
    const marker = reviewKey('pnote', n.slug);
    const exists = await prisma.patientClinicalNote.findFirst({
      where: { clinicalNotes: { startsWith: marker } },
    });
    if (exists) continue;

    await prisma.patientClinicalNote.create({
      data: {
        patientId: bundle.patient.patientProfile!.id,
        doctorId: bundle.doctor.doctorProfile!.id,
        authorId: n.authorId,
        authorType: n.authorType,
        title: n.title,
        noteType: n.authorType === ClinicalNoteAuthorType.PATIENT ? 'Symptom Update' : 'Progress Note',
        clinicalNotes: `${marker} ${
          n.authorType === ClinicalNoteAuthorType.PATIENT
            ? 'Patient reports improved sleep but occasional night cough persists.'
            : 'Doctor review note for dashboard testing — vitals stable, continue current plan.'
        }`,
        priority: ClinicalNotePriority.NORMAL,
        patientReadAt: n.read ? new Date() : null,
        doctorReadAt: new Date(),
      },
    });
    created += 1;
  }
  console.log(`✓ Clinical notes: ${created} notes seeded`);
}

async function seedCriticalAlert(bundle: { doctor: ReviewUserBundle; patient: ReviewUserBundle }) {
  const marker = reviewKey('alert', 'bp');
  const exists = await prisma.patientCriticalAlert.findFirst({
    where: { reason: { startsWith: marker } },
  });
  if (exists) {
    console.log('✓ Critical alert: already seeded');
    return;
  }

  await prisma.patientCriticalAlert.create({
    data: {
      patientId: bundle.patient.patientProfile!.id,
      doctorId: bundle.doctor.doctorProfile!.id,
      severity: PatientAlertSeverity.URGENT,
      category: 'Blood Pressure',
      reason: `${marker} Elevated BP reading logged — 148/94 mmHg`,
      clinicalNotes: 'Patient advised home monitoring. Review within 48 hours.',
      notifyTeam: true,
      status: PatientAlertStatus.ACTIVE,
    },
  });
  console.log('✓ Critical alert: 1 alert seeded');
}

async function seedNotifications(bundle: { doctor: ReviewUserBundle; patient: ReviewUserBundle }) {
  const items = [
    { userId: bundle.patient.user.id, type: NotificationType.APPOINTMENT, title: 'Consultation confirmed', body: 'Your video consultation with Dr. Kumbhar is confirmed for today.' },
    { userId: bundle.patient.user.id, type: NotificationType.PRESCRIPTION, title: 'New prescription available', body: 'Dr. Kumbhar issued a new prescription after your last visit.' },
    { userId: bundle.patient.user.id, type: NotificationType.MESSAGE, title: 'New message from doctor', body: 'Dr. Kumbhar sent you a follow-up message.' },
    { userId: bundle.doctor.user.id, type: NotificationType.APPOINTMENT, title: 'New booking request', body: 'Wajiha Nawaz requested a video consultation.' },
    { userId: bundle.doctor.user.id, type: NotificationType.MESSAGE, title: 'Patient message', body: 'Wajiha Nawaz sent a message in consultation chat.' },
    { userId: bundle.doctor.user.id, type: NotificationType.SYSTEM, title: 'Dashboard review ready', body: 'Review seed data loaded for pre-deployment testing.' },
  ];

  let created = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    const marker = reviewKey('notif', String(i));
    const exists = await prisma.notification.findFirst({
      where: { data: { path: ['reviewSeedKey'], equals: marker } },
    });
    if (exists) continue;

    await prisma.notification.create({
      data: {
        userId: item.userId,
        type: item.type,
        title: item.title,
        body: item.body,
        data: { reviewSeed: true, reviewSeedKey: marker },
        readAt: i % 2 === 0 ? new Date() : null,
      },
    });
    created += 1;
  }
  console.log(`✓ Notifications: ${created} seeded`);
}

async function seedPrescriptionDraft(bundle: { doctor: ReviewUserBundle; patient: ReviewUserBundle }) {
  await prisma.prescriptionDraft.upsert({
    where: {
      doctorId_patientId: {
        doctorId: bundle.doctor.doctorProfile!.id,
        patientId: bundle.patient.patientProfile!.id,
      },
    },
    create: {
      doctorId: bundle.doctor.doctorProfile!.id,
      patientId: bundle.patient.patientProfile!.id,
      data: {
        diagnosis: 'Draft prescription for review',
        items: prescriptionItems(2),
        notes: 'Auto-saved draft — complete before issuing.',
      },
    },
    update: {},
  });
  console.log('✓ Prescription draft: ensured');
}

async function backfillPrescriptionExtendedData() {
  const prescriptions = await prisma.prescription.findMany({
    where: { extendedData: { equals: Prisma.DbNull } },
    include: { appointment: true },
  });

  let updated = 0;
  for (const [index, rx] of prescriptions.entries()) {
    const rxIndex = (index % 8) + 1;
    const diagnosis = rx.diagnosis ?? prescriptionDiagnosis(rxIndex);
    const notes = rx.notes ?? prescriptionNotes(rxIndex, 'Karachi');
    await prisma.prescription.update({
      where: { id: rx.id },
      data: {
        extendedData: buildReviewPrescriptionExtendedData({
          rxIndex,
          diagnosis,
          notes,
          consultReason: rx.appointment?.reason ?? diagnosis,
        }),
      },
    });
    updated += 1;
  }

  console.log(`✓ Prescription extendedData backfill: ${updated} updated`);
}

async function main() {
  const bundle = await loadReviewBundle();

  console.log('\n=== Seeding review dashboard data ===\n');

  await seedAppointments(bundle);
  await seedVitals(bundle.patient.patientProfile!.id);
  await seedAskDoctor(bundle);
  await seedPatientNotes(bundle);
  await seedCriticalAlert(bundle);
  await seedNotifications(bundle);
  await seedPrescriptionDraft(bundle);
  await backfillPrescriptionExtendedData();

  const doctorId = bundle.doctor.doctorProfile!.id;
  const patientId = bundle.patient.patientProfile!.id;

  const summary = {
    appointmentsDoctor: await prisma.appointment.count({ where: { doctorId } }),
    appointmentsPatient: await prisma.appointment.count({ where: { patientId } }),
    betweenPair: await prisma.appointment.count({ where: { doctorId, patientId } }),
    prescriptions: await prisma.prescription.count({ where: { doctorId, patientId } }),
    clinicalNotes: await prisma.patientClinicalNote.count({ where: { patientId } }),
    vitals: await prisma.patientVitalReading.count({ where: { patientId } }),
    questions: await prisma.askDoctorQuestion.count({ where: { submitterUserId: bundle.patient.user.id } }),
    notificationsDoctor: await prisma.notification.count({ where: { userId: bundle.doctor.user.id } }),
    notificationsPatient: await prisma.notification.count({ where: { userId: bundle.patient.user.id } }),
    payments: await prisma.payment.count({ where: { patientId } }),
    reviews: await prisma.review.count({ where: { doctorId } }),
    labOrders: await prisma.labOrder.count({ where: { patientId } }),
  };

  console.log('\n=== Review seed complete ===\n');
  console.log('Login credentials (all accounts):');
  console.log(`  Password: ${PASSWORD}`);
  console.log(`  Doctor:   ${REVIEW_ACCOUNTS.doctor}`);
  console.log(`  Patient:  ${REVIEW_ACCOUNTS.patient}`);
  console.log(`  Admin:    ${REVIEW_ACCOUNTS.admin}`);
  console.log('\nData summary:', summary);

  const liveAppt = await prisma.appointment.findFirst({
    where: { meetingRoomId: reviewKey('appt', 'live-now') },
    select: { id: true },
  });
  if (liveAppt) {
    console.log(`\nLive consultation test URLs:`);
    console.log(`  Doctor:  http://localhost:3000/consultation/doctor/${liveAppt.id}`);
    console.log(`  Patient: http://localhost:3000/consultation/patient/${liveAppt.id}`);
  }
}

main()
  .catch((error) => {
    console.error('Review seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
