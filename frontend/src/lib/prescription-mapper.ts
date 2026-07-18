import type { PrescriptionMed, PrescriptionPreviewData } from "@/components/doctor/patient/EPrescriptionBuilder";
import type { Prescription } from "@/services/doctor-api-hooks";
import { consultationTypeLabel } from "@/lib/data-mappers";
import { doctorDisplayName, formatDateTime } from "@/lib/doctor-utils";
import {
  formatDoctorPrescriptionId,
  formatPatientDisplayId,
  formatPatientPrescriptionId,
} from "@/lib/member-ids";

function patientAge(dob?: string | null): string {
  if (!dob) return "—";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "—";
  return String(Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)));
}

function genderLabel(g?: string | null): string {
  if (!g) return "—";
  const lower = g.toLowerCase();
  if (lower === "m" || lower === "male") return "Male";
  if (lower === "f" || lower === "female") return "Female";
  return g;
}

export function prescriptionStatusLabel(status?: string | null): string {
  switch ((status ?? "").toUpperCase()) {
    case "ISSUED":
      return "Active";
    case "PENDING_REVIEW":
      return "Pending Review";
    case "DRAFT":
      return "Draft";
    default:
      return status?.replace(/_/g, " ") ?? "Active";
  }
}

export function prescriptionStatusClass(status?: string | null): string {
  switch ((status ?? "").toUpperCase()) {
    case "ISSUED":
      return "st-active";
    case "PENDING_REVIEW":
      return "st-new";
    case "DRAFT":
      return "st-followup";
    default:
      return "st-active";
  }
}

function mapItems(items: Prescription["items"]): PrescriptionMed[] {
  return (items ?? []).map((item) => ({
    name: item.medication,
    strength: item.strength ?? "",
    dosage: item.dosage ?? "",
    frequency: item.frequency ?? "",
    route: item.route ?? "Oral",
    duration: item.duration ?? "",
    food: item.food ?? "",
    instructions: item.instructions ?? "",
    quantity: item.quantity ?? "",
    refill: item.refill ?? "",
  }));
}

function emptyPreview(): PrescriptionPreviewData {
  return {
    rxNo: "—",
    verifyId: "—",
    issuedAt: "—",
    status: "Active",
    consult: {
      consultId: "—",
      apptId: "—",
      doctorId: "—",
      patientId: "—",
      dateTime: "—",
      status: "—",
      type: "—",
      followupRef: "—",
    },
    doctor: {
      name: "—",
      qualification: "—",
      specialization: "—",
      reg: "—",
      signature: "",
    },
    patient: {
      name: "—",
      id: "—",
      age: "—",
      gender: "—",
      dob: "—",
      height: "—",
      weight: "—",
      bmi: "—",
      blood: "—",
      phone: "—",
      email: "—",
      city: "—",
      country: "—",
      allergies: "None reported",
      chronic: "None reported",
      currentMeds: "None",
      emergency: "—",
    },
    summary: {
      reason: "",
      chiefComplaint: "",
      notes: "",
      symptomDuration: "",
      prevTreatment: "",
      prevConsultRef: "",
      reports: [],
    },
    symptoms: {
      reported: [],
      duration: "",
      severity: "",
      frequency: "",
      progression: "",
      associated: "",
      aggravating: "",
      relieving: "",
    },
    exam: {
      appearance: "",
      alertness: "",
      speech: "",
      respiratory: "",
      swelling: "",
      skin: "",
      temp: "",
      bp: "",
      sugar: "",
      spo2: "",
      hr: "",
      other: "",
      observations: "",
    },
    assessment: {
      provisional: "",
      differential: "",
      icd10: "",
      impression: "",
      risk: "",
    },
    investigations: [],
    meds: [],
    advice: {
      diet: "",
      lifestyle: "",
      exercise: "",
      hydration: "",
      sleep: "",
      homeCare: "",
      isolation: "",
      warning: "",
      emergency: "",
    },
    followup: {
      required: "",
      date: "",
      after: "",
      type: "",
      referral: "",
      referralNotes: "",
    },
    doctorNotes: {
      text: "",
      includeInPatient: false,
    },
  };
}

export function prescriptionToPreviewData(rx: Prescription): PrescriptionPreviewData {
  const ext = rx.extendedData as Partial<PrescriptionPreviewData> | null | undefined;
  const patientUser = rx.patient?.user;
  const doctorUser = rx.doctor?.user;
  const patientProfile = rx.patient;
  const doctorProfile = rx.doctor;
  const appointment = rx.appointment;

  const patientName = patientUser
    ? `${patientUser.firstName ?? ""} ${patientUser.lastName ?? ""}`.trim()
    : ext?.patient?.name ?? "Patient";
  const patientId = rx.patientId ?? patientProfile?.id ?? ext?.patient?.id ?? "—";
  const patientCode = formatPatientPrescriptionId(patientProfile?.patientNumber, patientId !== "—" ? patientId : undefined);
  const patientDisplayId = formatPatientDisplayId(patientProfile?.patientNumber, patientId !== "—" ? patientId : undefined);
  const doctorCode = formatDoctorPrescriptionId(doctorProfile?.doctorNumber, rx.doctorId ?? doctorProfile?.id);

  const doctorName = doctorUser
    ? doctorDisplayName(doctorUser.firstName, doctorUser.lastName)
    : ext?.doctor?.name ?? "Doctor";

  const built = emptyPreview();

  const merged: PrescriptionPreviewData = ext?.patient
    ? {
        ...built,
        ...ext,
        consult: { ...built.consult, ...(ext.consult ?? {}) },
        doctor: { ...built.doctor, ...(ext.doctor ?? {}) },
        patient: { ...built.patient, ...(ext.patient ?? {}) },
        summary: { ...built.summary, ...(ext.summary ?? {}) },
        symptoms: { ...built.symptoms, ...(ext.symptoms ?? {}) },
        exam: { ...built.exam, ...(ext.exam ?? {}) },
        assessment: { ...built.assessment, ...(ext.assessment ?? {}) },
        advice: { ...built.advice, ...(ext.advice ?? {}) },
        followup: { ...built.followup, ...(ext.followup ?? {}) },
        doctorNotes: { ...built.doctorNotes, ...(ext.doctorNotes ?? {}) },
        investigations: ext.investigations ?? built.investigations,
        meds: ext.meds?.length ? ext.meds : mapItems(rx.items),
      }
    : {
        ...built,
        consult: {
          consultId: appointment?.id ? `CONS-${appointment.id.slice(0, 8).toUpperCase()}` : "—",
          apptId: appointment?.id ?? "—",
          doctorId: doctorCode,
          patientId: patientCode,
          dateTime: appointment?.scheduledAt ? formatDateTime(appointment.scheduledAt) : formatDateTime(rx.createdAt),
          status: appointment?.status ?? "Completed",
          type: appointment?.consultationType
            ? consultationTypeLabel(appointment.consultationType)
            : "Video",
          followupRef: rx.followUpDate ? formatDateTime(rx.followUpDate).split("·")[0]?.trim() ?? "—" : "—",
        },
        doctor: {
          name: doctorName,
          qualification:
            doctorProfile?.credentials ??
            [doctorProfile?.professionalTitle, doctorProfile?.education].filter(Boolean).join(", ") ??
            "—",
          specialization: doctorProfile?.specialty ?? "—",
          reg: doctorProfile?.licenseNumber ?? "—",
          signature: doctorName.replace(/^Dr\.?\s*/i, ""),
        },
        patient: {
          name: patientName,
          id: patientDisplayId,
          age: patientAge(patientProfile?.dateOfBirth),
          gender: genderLabel(patientProfile?.gender),
          dob: patientProfile?.dateOfBirth
            ? new Date(patientProfile.dateOfBirth).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—",
          height: "—",
          weight: "—",
          bmi: "—",
          blood: patientProfile?.bloodGroup ?? "—",
          phone: patientUser?.phone ?? patientUser?.email ?? "—",
          email: patientUser?.email ?? "—",
          city: patientProfile?.city ?? "—",
          country: patientProfile?.country ?? "Pakistan",
          allergies: patientProfile?.allergies?.length ? patientProfile.allergies.join(", ") : "None reported",
          chronic: patientProfile?.medicalHistory ?? "None reported",
          currentMeds: "None",
          emergency: patientProfile?.emergencyContact ?? "—",
        },
        summary: {
          reason: appointment?.reason ?? "",
          chiefComplaint: appointment?.reason ?? "",
          notes: rx.notes ?? appointment?.notes ?? "",
          symptomDuration: "",
          prevTreatment: "",
          prevConsultRef: "",
          reports: [],
        },
        assessment: {
          provisional: rx.diagnosis ?? "",
          differential: "",
          icd10: "",
          impression: "",
          risk: "",
        },
        meds: mapItems(rx.items),
        followup: {
          required: rx.followUpDate ? "Yes" : "",
          date: rx.followUpDate
            ? new Date(rx.followUpDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "",
          after: "",
          type: "",
          referral: "",
          referralNotes: "",
        },
        doctorNotes: {
          text: rx.notes ?? "",
          includeInPatient: false,
        },
      };

  return {
    ...merged,
    rxNo: rx.prescriptionNumber ?? merged.rxNo,
    verifyId: rx.verifyId ?? merged.verifyId,
    status: prescriptionStatusLabel(rx.status),
    issuedAt: rx.issuedAt ? formatDateTime(rx.issuedAt) : formatDateTime(rx.createdAt),
    digitalSignature: rx.digitalSignature ?? merged.digitalSignature,
    consult: {
      ...merged.consult,
      doctorId: doctorCode,
      patientId: patientCode,
    },
    doctor: {
      ...merged.doctor,
    },
    patient: {
      ...merged.patient,
      id: patientDisplayId,
    },
    assessment: {
      ...merged.assessment,
      provisional: rx.diagnosis ?? merged.assessment.provisional,
    },
    meds: merged.meds.length ? merged.meds : mapItems(rx.items),
    doctorNotes: {
      ...merged.doctorNotes,
      text: rx.notes ?? merged.doctorNotes.text,
    },
  };
}

export function prescriptionRefillLabel(rx: Prescription): string {
  const refills = (rx.items ?? [])
    .map((item) => item.refill?.trim())
    .filter((value): value is string => Boolean(value));
  if (refills.length === 0) return "—";
  const first = refills[0];
  if (/remaining/i.test(first)) return first;
  if (first === "0" || /^0\s/.test(first)) return "0 remaining";
  return `${first} remaining`;
}

export function prescriptionPrimaryMedication(rx: Prescription): string {
  const count = rx.items?.length ?? 0;
  if (!count) return "—";
  const first = rx.items[0]?.medication ?? "—";
  return count > 1 ? `${first} +${count - 1} more` : first;
}

export function prescriptionDosageSummary(rx: Prescription): string {
  const first = rx.items?.[0];
  if (!first) return "—";
  const dose = [first.dosage, first.frequency].filter(Boolean).join(" — ");
  return dose || "—";
}
