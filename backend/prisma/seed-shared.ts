import { ADMIN_COUNT, DOCTOR_COUNT, PATIENT_COUNT } from './seed-data';
import {
  ASK_DOCTOR_COUNT,
  BLOG_CATEGORIES,
  BLOG_POST_COUNT,
  CONTACT_COUNT,
  NEWSLETTER_COUNT,
} from './seed-content-data';
import {
  APPOINTMENT_COUNT,
  BOOKING_DRAFT_COUNT,
  CONVERSATION_COUNT,
  MESSAGE_COUNT,
  NOTIFICATION_COUNT,
  PAYMENT_COUNT,
  PRESCRIPTION_COUNT,
  REVIEW_COUNT,
} from './seed-operational-data';

/** Every Prisma model in schema.prisma — all are covered by the seed system. */
export const SCHEMA_MODELS = [
  'User',
  'RefreshToken',
  'DoctorProfile',
  'PatientProfile',
  'Appointment',
  'BookingDraft',
  'Payment',
  'BlogCategory',
  'BlogPost',
  'Conversation',
  'Message',
  'Notification',
  'Review',
  'Prescription',
  'AskDoctorQuestion',
  'ContactSubmission',
  'NewsletterSubscriber',
] as const;

export type SchemaModel = (typeof SCHEMA_MODELS)[number];

export const SEED_MODEL_MINIMUMS: Record<SchemaModel, number> = {
  User: ADMIN_COUNT + DOCTOR_COUNT + PATIENT_COUNT,
  RefreshToken: 1,
  DoctorProfile: DOCTOR_COUNT,
  PatientProfile: PATIENT_COUNT,
  Appointment: APPOINTMENT_COUNT,
  BookingDraft: BOOKING_DRAFT_COUNT,
  Payment: PAYMENT_COUNT,
  BlogCategory: BLOG_CATEGORIES.length,
  BlogPost: BLOG_POST_COUNT,
  Conversation: CONVERSATION_COUNT,
  Message: MESSAGE_COUNT,
  Notification: NOTIFICATION_COUNT,
  Review: REVIEW_COUNT,
  Prescription: PRESCRIPTION_COUNT,
  AskDoctorQuestion: ASK_DOCTOR_COUNT,
  ContactSubmission: CONTACT_COUNT,
  NewsletterSubscriber: NEWSLETTER_COUNT,
};

export function assertDevelopmentEnvironment(): void {
  const nodeEnv = process.env.NODE_ENV?.toLowerCase();
  if (nodeEnv === 'production') {
    console.error('Refusing to seed: NODE_ENV is production. Demo seed is for development only.');
    process.exit(1);
  }
}
