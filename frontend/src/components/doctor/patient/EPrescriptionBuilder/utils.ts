import { formatDateTime } from "@/lib/doctor-utils";
import type { Prescription } from "@/services/doctor-api-hooks";
import type { PrescriptionMed, PrescriptionPreviewData } from "./types";

export interface MedRow extends PrescriptionMed {
  id: string;
}

export function rxStamp(date = new Date()): string {
  return (
    date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " +
    date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  );
}

export function patientAge(dob?: string | null): string {
  if (!dob) return "—";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "—";
  const age = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  return String(age);
}

export function genderLabel(g?: string | null): string {
  if (!g) return "—";
  const lower = g.toLowerCase();
  if (lower === "m" || lower === "male") return "Male";
  if (lower === "f" || lower === "female") return "Female";
  return g;
}

export function emptyMed(): MedRow {
  return {
    id: crypto.randomUUID(),
    name: "",
    strength: "",
    dosage: "",
    frequency: "",
    route: "Oral",
    duration: "",
    food: "",
    instructions: "",
    quantity: "",
    refill: "",
  };
}

export function mapIssuedToPreview(base: PrescriptionPreviewData, issued: Prescription): PrescriptionPreviewData {
  return {
    ...base,
    rxNo: issued.prescriptionNumber ?? base.rxNo,
    verifyId: issued.verifyId ?? base.verifyId,
    status: issued.status ?? "Pending Review",
    issuedAt: issued.issuedAt ? formatDateTime(issued.issuedAt) : base.issuedAt,
    digitalSignature: issued.digitalSignature ?? base.digitalSignature,
  };
}
