import { z } from "zod";

export const adminPatientProfileSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
  patientNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  emergencyContact: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  healthInterests: z.string().optional(),
  languagePreference: z.string().optional(),
});

export type AdminPatientProfileFormValues = z.infer<typeof adminPatientProfileSchema>;
