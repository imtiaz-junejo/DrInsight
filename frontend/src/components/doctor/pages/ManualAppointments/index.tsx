"use client";

import { ManualAppointmentsContentView } from "./ManualAppointmentsContentView";
import { useManualAppointments } from "./hooks/useManualAppointments";

export function ManualAppointmentsContent() {
  const vm = useManualAppointments();
  return <ManualAppointmentsContentView {...vm} />;
}
