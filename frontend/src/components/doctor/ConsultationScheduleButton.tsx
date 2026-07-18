"use client";

import Link from "next/link";
import type { Appointment } from "@/services/api-hooks";
import {
  canJoinConsultationRoom,
  consultationActionLabel,
  doctorConsultationPath,
} from "@/lib/consultation-utils";

interface ConsultationScheduleButtonProps {
  appointment: Appointment;
  onPrepFallback?: () => void;
  compact?: boolean;
}

export function ConsultationScheduleButton({
  appointment,
  onPrepFallback,
  compact,
}: ConsultationScheduleButtonProps) {
  const live = appointment.status === "IN_PROGRESS" || appointment.meetingStatus === "LIVE";
  const label = live ? "Join →" : compact ? "Prep" : consultationActionLabel(appointment);

  if (canJoinConsultationRoom(appointment)) {
    return (
      <Link href={doctorConsultationPath(appointment.id)} className={`sch-btn sch-btn-link${live ? " go" : ""}`}>
        {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="sch-btn"
      onClick={() => onPrepFallback?.()}
    >
      Prep
    </button>
  );
}
