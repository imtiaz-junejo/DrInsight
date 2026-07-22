import { splitFullName } from "@/lib/doctor-profile-form";
import type { AdminPatientProfileFormValues } from "@/lib/admin-patient-profile-schema";
import type { AdminPatientProfile } from "@/services/admin-api-hooks";

function formatDobInput(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function patientToAdminForm(patient: AdminPatientProfile): AdminPatientProfileFormValues {
  const user = patient.user;
  return {
    fullName: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim(),
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    avatarUrl: user?.avatarUrl ?? "",
    patientNumber: patient.patientNumber ?? "",
    dateOfBirth: formatDobInput(patient.dateOfBirth),
    gender: patient.gender ?? "",
    bloodGroup: patient.bloodGroup ?? "",
    allergies: (patient.allergies ?? []).join(", "),
    medicalHistory: patient.medicalHistory ?? "",
    emergencyContact: patient.emergencyContact ?? "",
    city: patient.city ?? "",
    province: patient.province ?? "",
    country: patient.country ?? "",
    address: patient.address ?? "",
    postalCode: patient.postalCode ?? "",
    healthInterests: (patient.healthInterests ?? []).join(", "),
    languagePreference: patient.languagePreference ?? "",
  };
}

export function adminFormToPatientPayload(values: AdminPatientProfileFormValues) {
  const { firstName, lastName } = splitFullName(values.fullName);
  return {
    firstName,
    lastName,
    phone: values.phone?.trim() || undefined,
    avatarUrl: values.avatarUrl?.trim() || undefined,
    patientNumber: values.patientNumber?.trim() || undefined,
    dateOfBirth: values.dateOfBirth?.trim() || undefined,
    gender: values.gender?.trim() || undefined,
    bloodGroup: values.bloodGroup?.trim() || undefined,
    allergies: values.allergies
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    medicalHistory: values.medicalHistory?.trim() || undefined,
    emergencyContact: values.emergencyContact?.trim() || undefined,
    city: values.city?.trim() || undefined,
    province: values.province?.trim() || undefined,
    country: values.country?.trim() || undefined,
    address: values.address?.trim() || undefined,
    postalCode: values.postalCode?.trim() || undefined,
    healthInterests: values.healthInterests
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    languagePreference: values.languagePreference?.trim() || undefined,
  };
}

export function patientAgeLabel(dateOfBirth?: string | null): string {
  if (!dateOfBirth) return "—";
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return "—";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return `${age} yrs`;
}

export function patientLocationLabel(patient: AdminPatientProfile): string {
  return [patient.city, patient.province, patient.country].filter(Boolean).join(", ") || "—";
}

export function patientAddressLabel(patient: AdminPatientProfile): string {
  return [patient.address, patient.city, patient.province, patient.postalCode, patient.country]
    .filter((item) => item?.trim())
    .join(", ") || "—";
}

export function bmiTagClassName(tag?: string | null): string {
  if (tag === "Normal") return "ch-g";
  if (tag === "Obese") return "ch-r";
  if (tag === "Overweight" || tag === "Underweight") return "ch-a";
  return "ch-gray";
}
