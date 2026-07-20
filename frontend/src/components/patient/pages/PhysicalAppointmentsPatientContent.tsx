"use client";

import Link from "next/link";
import { useMemo } from "react";
import { EmptyState } from "@/components/patient/ui/PatientShared";
import { PatientAppointmentCard } from "@/components/patient/ui/PatientAppointmentCard";
import { DashButton, DashCard, DashPageHeader } from "@/components/patient/ui/PatientPrimitives";
import { todayFormatted } from "@/lib/patient-utils";
import { usePatientAppointments } from "@/services/patient-api-hooks";
import { usePatientUiStore } from "@/store/patient-ui.store";

export type PatientPhysicalView = "upcoming" | "pending" | "confirmed" | "completed" | "cancelled";

const VIEW_META: Record<PatientPhysicalView, [string, string, string]> = {
  upcoming: ["📅 Upcoming Physical Appointments", "Your confirmed in-person clinic visits coming up", "No appointments in this category yet."],
  pending: ["🕒 Pending Requests", "Physical appointment requests awaiting doctor approval", "No appointments in this category yet."],
  confirmed: ["✅ Confirmed Appointments", "In-person appointments confirmed by the doctor", "No appointments in this category yet."],
  completed: ["🏁 Completed Visits", "Clinic visits you have completed", "No appointments in this category yet."],
  cancelled: ["❌ Cancelled Appointments", "Appointments that were cancelled", "No appointments in this category yet."],
};

const VIEW_PARAMS: Record<PatientPhysicalView, { kind: "PHYSICAL"; status?: string; range?: "upcoming" }> = {
  upcoming: { kind: "PHYSICAL", status: "CONFIRMED", range: "upcoming" },
  pending: { kind: "PHYSICAL", status: "PENDING" },
  confirmed: { kind: "PHYSICAL", status: "CONFIRMED", range: "upcoming" },
  completed: { kind: "PHYSICAL", status: "COMPLETED" },
  cancelled: { kind: "PHYSICAL", status: "CANCELLED" },
};

export function PhysicalAppointmentsPatientContent({ view }: { view: PatientPhysicalView }) {
  const showToast = usePatientUiStore((s) => s.showToast);
  const appointmentsQuery = usePatientAppointments({ ...VIEW_PARAMS[view], limit: 20 });
  const meta = VIEW_META[view];

  const list = useMemo(() => appointmentsQuery.data?.data ?? [], [appointmentsQuery.data?.data]);

  return (
    <>
      <DashPageHeader
        subtitle="🏥 Patient Dashboard"
        title="Physical Appointments"
        dateStr={todayFormatted()}
        actions={
          <Link href="/book-consultation">
            <DashButton variant="solid" onClick={() => showToast("Opening clinic booking...")}>
              + Book Physical Visit
            </DashButton>
          </Link>
        }
      />

      <DashCard title={meta[0]}>
        <div style={{ fontSize: "0.78rem", color: "var(--gray-500)", margin: "-4px 0 12px" }}>{meta[1]}</div>
        <div className="cons-list">
          {appointmentsQuery.isLoading ? (
            <EmptyState message="Loading appointments..." />
          ) : list.length > 0 ? (
            list.map((appt) => <PatientAppointmentCard key={appt.id} appt={appt} />)
          ) : (
            <div style={{ padding: "34px 10px", textAlign: "center", color: "var(--gray-400)", fontSize: "0.86rem" }}>
              {meta[2]}
            </div>
          )}
        </div>
      </DashCard>
    </>
  );
}
