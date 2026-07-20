import type { ManualBookingSource } from "./types";

export const BOOKING_SOURCES: Array<{ value: ManualBookingSource; label: string }> = [
  { value: "WALK_IN", label: "Walk-in" },
  { value: "PHONE", label: "Phone" },
  { value: "CLINIC_VISIT", label: "Clinic visit" },
  { value: "EMERGENCY", label: "Emergency" },
];
