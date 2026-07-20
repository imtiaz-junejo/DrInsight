import { BadgeCheck, DoctorIconInline, X } from "@/components/doctor/icons/DoctorIcons";
import type { Appointment } from "@/services/api-hooks.types";

export function MaStatusChip({ appt }: { appt: Appointment }) {
  if (appt.status === "CONFIRMED") {
    return (
      <span className="sch-chip sc-up">
        <DoctorIconInline icon={BadgeCheck} size="sm">
          Confirmed
        </DoctorIconInline>
      </span>
    );
  }
  if (appt.status === "COMPLETED") {
    return (
      <span className="sch-chip sc-done">
        <DoctorIconInline icon={BadgeCheck} size="sm">
          Completed
        </DoctorIconInline>
      </span>
    );
  }
  return (
    <span className="sch-chip" style={{ background: "var(--gray-100)", color: "var(--gray-600)" }}>
      <DoctorIconInline icon={X} size="sm">
        Cancelled
      </DoctorIconInline>
    </span>
  );
}
