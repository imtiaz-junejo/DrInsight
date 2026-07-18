"use client";

import Link from "next/link";
import { useMemo } from "react";
import { EmptyState } from "@/components/patient/ui/PatientShared";
import { ActionButton, DashButton, DashCard, DashPageHeader } from "@/components/patient/ui/PatientPrimitives";
import { doctorFullName, formatDate, getInitials, gradientForId, specialtyEmoji } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/patient-utils";
import type { Appointment } from "@/services/api-hooks";
import { useCancelAppointment, usePatientAppointments } from "@/services/patient-api-hooks";
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

function physChip(status: string) {
  if (status === "PENDING") return <span className="cons-chip cc-pending">🕒 Pending Approval</span>;
  if (status === "CONFIRMED") return <span className="cons-chip cc-up">✅ Confirmed</span>;
  if (status === "COMPLETED") return <span className="cons-chip cc-done">✓ Completed</span>;
  return <span className="cons-chip cc-cancel">✕ Cancelled</span>;
}

function cardClass(status: string) {
  if (status === "PENDING") return "pending";
  if (status === "COMPLETED") return "completed";
  if (status === "CANCELLED") return "cancelled";
  return "upcoming";
}

function PhysicalCard({ appt }: { appt: Appointment }) {
  const showToast = usePatientUiStore((s) => s.showToast);
  const cancelMutation = useCancelAppointment();
  const doctor = appt.doctor;
  const initials = getInitials(doctor?.user?.firstName, doctor?.user?.lastName);
  const spec = `${specialtyEmoji(doctor?.specialty ?? "")} ${doctor?.specialty ?? "General"} · ${doctor?.subSpecialty ?? "Board Certified"}`;

  return (
    <div className={`cons-card ${cardClass(appt.status)}`}>
      <div className="cons-top">
        <div className="dr-av" style={{ background: gradientForId(appt.id) }}>
          {initials}
        </div>
        <div>
          <div className="cons-dr-name">{doctorFullName(doctor?.user)}</div>
          <div className="cons-dr-spec">{spec}</div>
        </div>
        {physChip(appt.status)}
      </div>
      <div className="cons-details">
        <span>🏥 {doctor?.hospital ?? "Dr Insight Clinic"}</span>
        <span>📅 {formatDate(appt.scheduledAt)}</span>
        <span>
          ⏰{" "}
          {new Date(appt.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </span>
      </div>
      {appt.reason ? (
        <div className="cons-note">
          📋 <strong>Reason:</strong> {appt.reason}
        </div>
      ) : null}
      <div className="cons-actions">
        {appt.status === "PENDING" ? (
          <>
            <ActionButton onClick={() => showToast("Reminder sent to clinic")}>🔔 Follow Up</ActionButton>
            <ActionButton
              variant="danger"
              onClick={() =>
                cancelMutation.mutate(appt.id, {
                  onSuccess: () => showToast("Request cancelled"),
                })
              }
            >
              ✕ Cancel Request
            </ActionButton>
          </>
        ) : null}
        {appt.status === "CONFIRMED" ? (
          <>
            <ActionButton variant="primary" onClick={() => showToast("Directions opened")}>
              🗺️ Get Directions
            </ActionButton>
            <ActionButton onClick={() => showToast("Reschedule request sent")}>🔁 Reschedule</ActionButton>
            <ActionButton
              variant="danger"
              onClick={() =>
                cancelMutation.mutate(appt.id, {
                  onSuccess: () => showToast("Appointment cancelled"),
                })
              }
            >
              ✕ Cancel
            </ActionButton>
          </>
        ) : null}
        {appt.status === "COMPLETED" ? (
          <>
            <ActionButton onClick={() => showToast("Opening visit summary...")}>📋 Visit Summary</ActionButton>
            <Link href="/book-consultation">
              <ActionButton variant="primary">🔄 Book Follow-up</ActionButton>
            </Link>
          </>
        ) : null}
        {appt.status === "CANCELLED" ? (
          <Link href="/book-consultation">
            <ActionButton variant="primary">🔄 Rebook</ActionButton>
          </Link>
        ) : null}
      </div>
    </div>
  );
}

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
            list.map((appt) => <PhysicalCard key={appt.id} appt={appt} />)
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
