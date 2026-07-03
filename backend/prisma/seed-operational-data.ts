import {
  AppointmentStatus,
  BookingDraftStatus,
  ConsultationType,
  MessageType,
  NotificationType,
  PaymentStatus,
  VideoProvider,
} from '@prisma/client';
import { PAKISTANI_CITIES, PAKISTANI_HOSPITALS, pick } from './seed-data';

export const SEED_PREFIX = 'drinsight-seed';

export const APPOINTMENT_COUNT = 520;
export const REVIEW_COUNT = 300;
export const CONVERSATION_COUNT = 150;
export const MESSAGE_COUNT = 900;
export const PRESCRIPTION_COUNT = 210;
export const BOOKING_DRAFT_COUNT = 330;
export const PAYMENT_COUNT = 310;
export const NOTIFICATION_COUNT = 400;

export function seedKey(kind: string, index: number): string {
  return `${SEED_PREFIX}-${kind}-${String(index).padStart(4, '0')}`;
}

export function appointmentSeedKey(index: number): string {
  return seedKey('appt', index);
}

export function draftSeedKey(index: number): string {
  return seedKey('draft', index);
}

export function paymentSeedKey(index: number): string {
  return seedKey('pi', index);
}

export function messageSeedKey(index: number): string {
  return seedKey('msg', index);
}

export function notificationSeedKey(index: number): string {
  return seedKey('notif', index);
}

export function appointmentStatus(index: number): AppointmentStatus {
  if (index <= 220) return AppointmentStatus.COMPLETED;
  if (index <= 270) return AppointmentStatus.CONFIRMED;
  if (index <= 320) return AppointmentStatus.PENDING;
  if (index <= 400) return AppointmentStatus.CANCELLED;
  if (index <= 430) return AppointmentStatus.IN_PROGRESS;
  if (index <= 480) return AppointmentStatus.NO_SHOW;
  return index % 2 === 0 ? AppointmentStatus.CONFIRMED : AppointmentStatus.PENDING;
}

export function consultationType(index: number): ConsultationType {
  const types = [
    ConsultationType.VIDEO,
    ConsultationType.AUDIO,
    ConsultationType.CHAT,
    ConsultationType.IN_PERSON,
  ];
  return pick(types, index);
}

export function videoProvider(index: number): VideoProvider | null {
  const type = consultationType(index);
  if (type === ConsultationType.IN_PERSON || type === ConsultationType.CHAT) return null;
  const providers = [VideoProvider.WEBRTC, VideoProvider.AGORA, VideoProvider.DAILY];
  return pick(providers, index);
}

export function appointmentReason(index: number): string {
  const reasons = [
    'Persistent headache and dizziness for one week',
    'Follow-up for hypertension medication review',
    'Skin rash after change in detergent',
    'Child fever and sore throat since yesterday',
    'Lower back pain after lifting at work',
    'Diabetes follow-up and HbA1c discussion',
    'Anxiety, poor sleep, and work-related stress',
    'Seasonal allergy with blocked nose and sneezing',
    'Knee pain while walking upstairs',
    'Abdominal discomfort and acidity after meals',
    'Post-operative wound check after minor surgery',
    'Recurrent urinary tract infection symptoms',
    'Chest tightness on exertion — cardiology review',
    'Pregnancy antenatal check at 28 weeks',
    'Thyroid symptoms with fatigue and weight gain',
    'Eye redness and irritation from screen use',
    'Dental referral for jaw pain and headache',
    'Review of lab reports from local pathology lab',
    'Second opinion on MRI findings',
    'Telemedicine consult from rural Sindh clinic referral',
  ];
  return pick(reasons, index);
}

export function appointmentNotes(index: number, status: AppointmentStatus, city: string): string | null {
  if (status === AppointmentStatus.COMPLETED) {
    return `Consultation completed via DrInsight. Patient counselled on lifestyle changes and follow-up plan. Referred to ${pick(PAKISTANI_HOSPITALS, index)} if in-person tests are required in ${city}.`;
  }
  if (status === AppointmentStatus.IN_PROGRESS) {
    return 'Video consultation currently in progress.';
  }
  if (status === AppointmentStatus.CONFIRMED) {
    return 'Patient confirmed availability. Reminder SMS sent in Urdu and English.';
  }
  return null;
}

export function cancelReason(index: number): string {
  const reasons = [
    'Patient requested reschedule due to family emergency',
    'Doctor unavailable because of emergency surgery at hospital',
    'Patient could not join video call — poor internet in rural area',
    'Duplicate booking created by mistake',
    'Patient travelled out of city unexpectedly',
    'Clinic power outage — rescheduled by support team',
  ];
  return pick(reasons, index);
}

export function scheduledAt(index: number, status: AppointmentStatus): Date {
  const date = new Date();
  const dayOffset =
    status === AppointmentStatus.PENDING || status === AppointmentStatus.CONFIRMED
      ? 2 + (index % 21)
      : status === AppointmentStatus.IN_PROGRESS
        ? 0
        : -(1 + (index % 120));

  date.setDate(date.getDate() + dayOffset);
  date.setHours(9 + (index % 9), (index * 11) % 60, 0, 0);
  return date;
}

export function reviewRating(index: number): number {
  const weights = [5, 5, 4, 5, 4, 3, 5, 4, 5, 4];
  return pick(weights, index);
}

export function reviewComment(index: number, doctorLastName: string, city: string): string {
  const comments = [
    `Very professional consultation. Dr. ${doctorLastName} explained everything clearly in Urdu and English. Highly recommended for patients in ${city}.`,
    `Appointment started on time and the video quality was good. Prescription was shared promptly on WhatsApp as well.`,
    `Knowledgeable doctor with a calm bedside manner. Wait time was minimal and follow-up advice was practical.`,
    `Good experience overall. Would prefer slightly longer consultation time but still satisfied.`,
    `Excellent telemedicine service. Saved me a trip from ${city} to Karachi for a simple follow-up.`,
    `Doctor listened patiently to all symptoms and did not rush the call. Lab test recommendations were reasonable.`,
    `Helpful guidance for my mother's diabetes management. Polite staff and clear instructions.`,
    `Average experience — diagnosis was fine but connection dropped once during the call.`,
    `Outstanding care. Dr. ${doctorLastName} followed up the next day to check improvement.`,
    `Affordable consultation fee compared to private hospital OPD in ${city}. Will book again.`,
  ];
  return pick(comments, index);
}

const PATIENT_MESSAGE_TEMPLATES = [
  'Assalam o Alaikum doctor, thank you for accepting my consultation request.',
  'Doctor sahab, I have uploaded my recent blood test report in the chat.',
  'My symptoms are slightly better since starting the medicine you prescribed last week.',
  'Should I continue the same dose of Panadol if fever returns tonight?',
  'I am available for a video call after Maghrib today if that suits you.',
  'Thank you doctor. May I request a medical certificate for my office in Karachi?',
  'The rash has reduced but itching remains at night. What should I apply?',
  'Can you advise if this medicine is safe during breastfeeding?',
  'I missed one dose yesterday — should I take a double dose today?',
  'Shukriya doctor, your advice was very helpful for my father in Lahore.',
];

const DOCTOR_MESSAGE_TEMPLATES = [
  'Wa Alaikum Assalam. Please share your current symptoms and any recent test reports.',
  'I have reviewed your reports. Your vitals look stable but we should monitor blood pressure daily.',
  'Continue the prescribed antibiotics for five full days even if you feel better earlier.',
  'Please visit the nearest emergency department if breathing difficulty or chest pain develops.',
  'I recommend a follow-up in two weeks or sooner if symptoms worsen.',
  'Apply the prescribed cream twice daily and avoid direct sunlight on the affected area.',
  'Your fasting sugar is slightly high — reduce sugary chai and walk 30 minutes daily.',
  'I am sending an updated prescription now. Take medicines after meals unless stated otherwise.',
  'Kindly keep hydrated and use ORS if there is vomiting or loose motions.',
  'Feel free to message here if you have questions before our next appointment.',
];

export function buildConversationMessage(
  index: number,
  fromDoctor: boolean,
  patientFirstName: string,
  doctorLastName: string,
): string {
  const prefix = `[${messageSeedKey(index)}] `;
  if (fromDoctor) {
    const body = pick(DOCTOR_MESSAGE_TEMPLATES, index).replace('your', `${patientFirstName}'s`);
    return `${prefix}${body} — Dr. ${doctorLastName}`;
  }
  return `${prefix}${pick(PATIENT_MESSAGE_TEMPLATES, index)}`;
}

export type PrescriptionItem = {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
};

const PAKISTANI_PRESCRIPTION_SETS: PrescriptionItem[][] = [
  [
    { medication: 'Panadol (Paracetamol) 500mg', dosage: '1 tablet', frequency: 'Every 6 hours as needed', duration: '3 days', instructions: 'Do not exceed 4g paracetamol per day' },
    { medication: 'Arinac Forte', dosage: '1 tablet', frequency: 'Twice daily', duration: '5 days', instructions: 'Take after food; avoid if gastric ulcer history' },
  ],
  [
    { medication: 'Augmentin 625mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '7 days', instructions: 'Complete full antibiotic course' },
    { medication: 'Risek (Omeprazole) 20mg', dosage: '1 capsule', frequency: 'Once daily before breakfast', duration: '14 days' },
  ],
  [
    { medication: 'Glucophage (Metformin) 500mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '30 days', instructions: 'Take with meals; monitor for GI upset' },
    { medication: 'Concor (Bisoprolol) 2.5mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days' },
  ],
  [
    { medication: 'Ventolin Inhaler (Salbutamol)', dosage: '2 puffs', frequency: 'As needed for wheeze', duration: 'As required', instructions: 'Rinse mouth after use' },
    { medication: 'Montiget (Montelukast) 10mg', dosage: '1 tablet', frequency: 'At bedtime', duration: '14 days' },
  ],
  [
    { medication: 'Flagyl (Metronidazole) 400mg', dosage: '1 tablet', frequency: 'Three times daily', duration: '7 days', instructions: 'Avoid alcohol during treatment' },
    { medication: 'Entamizole (Diloxanide furoate)', dosage: '1 tablet', frequency: 'Three times daily', duration: '5 days' },
  ],
  [
    { medication: 'Atorvastatin 20mg', dosage: '1 tablet', frequency: 'At bedtime', duration: '30 days' },
    { medication: 'Disprin (Aspirin) 75mg', dosage: '1 tablet', frequency: 'Once daily after food', duration: '30 days', instructions: 'Stop if black stools or bleeding' },
  ],
  [
    { medication: 'Calpol Syrup 120mg/5ml', dosage: '5ml', frequency: 'Every 6 hours as needed', duration: '3 days', instructions: 'For pediatric use as directed by weight' },
    { medication: 'ORS Sachets (WHO formula)', dosage: '1 sachet in 1L water', frequency: 'Sip frequently', duration: '2 days' },
  ],
  [
    { medication: 'Hydryllin DM Syrup', dosage: '10ml', frequency: 'Three times daily', duration: '5 days', instructions: 'Avoid driving if drowsy' },
    { medication: 'Panadol (Paracetamol) 500mg', dosage: '1 tablet', frequency: 'Every 8 hours', duration: '3 days' },
  ],
];

export function prescriptionDiagnosis(index: number): string {
  const diagnoses = [
    'Acute upper respiratory tract infection',
    'Essential hypertension — stable on current therapy',
    'Type 2 diabetes mellitus — suboptimal glycemic control',
    'Allergic rhinitis with seasonal exacerbation',
    'Gastroesophageal reflux disease',
    'Uncomplicated urinary tract infection',
    'Acute gastroenteritis with mild dehydration',
    'Tension-type headache',
    'Mild asthma exacerbation',
    'Viral fever — symptomatic management',
  ];
  return pick(diagnoses, index);
}

export function prescriptionItems(index: number): PrescriptionItem[] {
  return pick(PAKISTANI_PRESCRIPTION_SETS, index);
}

export function prescriptionNotes(index: number, city: string): string {
  return `Patient counselled on diet, hydration, and follow-up at local facility in ${city} if symptoms persist beyond prescribed duration. Emergency services available via ${pick(PAKISTANI_HOSPITALS, index)}.`;
}

export function bookingDraftStatus(index: number): BookingDraftStatus {
  if (index <= 220) return BookingDraftStatus.CONFIRMED;
  if (index <= 270) return BookingDraftStatus.CONFIRMED;
  if (index <= 290) return BookingDraftStatus.PAYMENT_PENDING;
  if (index <= 310) return BookingDraftStatus.DRAFT;
  if (index <= 320) return BookingDraftStatus.EXPIRED;
  return BookingDraftStatus.CANCELLED;
}

export function paymentStatus(index: number, draftStatus: BookingDraftStatus): PaymentStatus {
  if (draftStatus === BookingDraftStatus.CONFIRMED) {
    return index % 15 === 0 ? PaymentStatus.PROCESSING : PaymentStatus.SUCCEEDED;
  }
  if (draftStatus === BookingDraftStatus.PAYMENT_PENDING) {
    return index % 2 === 0 ? PaymentStatus.REQUIRES_CONFIRMATION : PaymentStatus.REQUIRES_PAYMENT_METHOD;
  }
  if (draftStatus === BookingDraftStatus.EXPIRED) return PaymentStatus.CANCELLED;
  if (draftStatus === BookingDraftStatus.CANCELLED) {
    return index % 2 === 0 ? PaymentStatus.FAILED : PaymentStatus.CANCELLED;
  }
  return PaymentStatus.REQUIRES_PAYMENT_METHOD;
}

export function feeToAmountCents(feePkr: number): number {
  return Math.round(feePkr * 100);
}

export type NotificationTemplate = {
  type: NotificationType;
  title: string;
  body: string;
};

export function notificationTemplate(index: number): NotificationTemplate {
  const city = pick(PAKISTANI_CITIES, index).city;
  const templates: NotificationTemplate[] = [
    { type: NotificationType.APPOINTMENT, title: 'Appointment booked', body: `Your telemedicine appointment in ${city} has been confirmed. Please join five minutes early.` },
    { type: NotificationType.APPOINTMENT, title: 'Appointment reminder', body: `Reminder: your consultation starts in one hour. Check your internet connection and microphone.` },
    { type: NotificationType.APPOINTMENT, title: 'Appointment cancelled', body: 'Your appointment was cancelled. You can rebook any available slot with the same doctor.' },
    { type: NotificationType.MESSAGE, title: 'New message', body: 'You have a new secure message from your doctor in the consultation chat.' },
    { type: NotificationType.PRESCRIPTION, title: 'Prescription ready', body: 'Your e-prescription is ready to download. Share it with your nearest pharmacy in Pakistan.' },
    { type: NotificationType.SYSTEM, title: 'Payment received', body: 'We received your consultation payment in PKR. A receipt has been emailed to you.' },
    { type: NotificationType.REVIEW, title: 'Rate your consultation', body: 'How was your recent visit? Your feedback helps other patients in Pakistan choose quality care.' },
    { type: NotificationType.SYSTEM, title: 'Profile updated', body: 'Your DrInsight profile details were updated successfully.' },
  ];
  return pick(templates, index);
}

export function buildConversationPairs(
  doctorCount: number,
  patientCount: number,
  count: number,
): Array<{ doctorIndex: number; patientIndex: number }> {
  const pairs: Array<{ doctorIndex: number; patientIndex: number }> = [];
  const seen = new Set<string>();
  let cursor = 1;

  while (pairs.length < count) {
    const doctorIndex = cursor % doctorCount;
    const patientIndex = (cursor * 13 + 7) % patientCount;
    const key = `${doctorIndex}:${patientIndex}`;
    cursor += 1;
    if (seen.has(key)) continue;
    seen.add(key);
    pairs.push({ doctorIndex, patientIndex });
  }

  return pairs;
}

export function messagesPerConversation(conversationIndex: number, totalMessages: number, totalConversations: number): number {
  const base = Math.floor(totalMessages / totalConversations);
  const remainder = totalMessages % totalConversations;
  return base + (conversationIndex <= remainder ? 1 : 0);
}
