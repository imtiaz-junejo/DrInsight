import type { Appointment } from "@/services/api-hooks.types";

export type ManualBookingSource = "WALK_IN" | "PHONE" | "CLINIC_VISIT" | "EMERGENCY";

export type ModalState =
  | { kind: "edit"; appt: Appointment }
  | { kind: "cancel"; appt: Appointment }
  | { kind: "details"; appt: Appointment }
  | null;
