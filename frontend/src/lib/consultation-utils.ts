import type { Appointment } from "@/services/api-hooks";

const ONLINE_TYPES = new Set(["VIDEO", "AUDIO", "CHAT"]);
const JOINABLE_STATUSES = new Set(["CONFIRMED", "IN_PROGRESS"]);

export function isOnlineConsultation(consultationType?: string | null): boolean {
  return ONLINE_TYPES.has(consultationType ?? "");
}

export function canJoinConsultationRoom(appt: Pick<Appointment, "status" | "consultationType">): boolean {
  return isOnlineConsultation(appt.consultationType) && JOINABLE_STATUSES.has(appt.status);
}

export function doctorConsultationPath(appointmentId: string): string {
  return `/consultation/doctor/${appointmentId}`;
}

export function patientConsultationPath(appointmentId: string): string {
  return `/consultation/patient/${appointmentId}`;
}

export function consultationActionLabel(appt: Pick<Appointment, "status" | "meetingStatus">): string {
  if (appt.status === "IN_PROGRESS" || appt.meetingStatus === "LIVE") return "Join →";
  return "Prep";
}

export function findNextJoinableAppointment(appointments: Appointment[]): Appointment | undefined {
  const now = Date.now();
  return appointments
    .filter((a) => canJoinConsultationRoom(a))
    .sort((a, b) => {
      const aDiff = Math.abs(new Date(a.scheduledAt).getTime() - now);
      const bDiff = Math.abs(new Date(b.scheduledAt).getTime() - now);
      return aDiff - bDiff;
    })[0];
}
