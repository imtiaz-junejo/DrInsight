"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ConsultationCard, EmptyState } from "@/components/patient/ui/PatientShared";
import { DashButton, DashCard, DashPageHeader } from "@/components/patient/ui/PatientPrimitives";
import { mapAppointmentToConsultation } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/patient-utils";
import { usePatientAppointments } from "@/services/patient-api-hooks";
import { usePatientUiStore } from "@/store/patient-ui.store";

export type PatientOnlineView =
  | "pending"
  | "upcoming"
  | "ongoing"
  | "completed"
  | "cancelled"
  | "history";

const VIEW_META: Record<PatientOnlineView, [string, string, string]> = {
  pending: ["🕒 Pending Requests", "Requests awaiting doctor approval", "No pending consultation requests."],
  upcoming: ["📅 Upcoming Consultations", "Accepted consultations scheduled ahead", "No upcoming consultations — book one to get started."],
  ongoing: ["🟢 Ongoing Consultations", "Sessions in progress right now", "No consultation is currently in progress."],
  completed: ["✅ Completed Consultations", "Finished consultations with notes & prescriptions", "No completed consultations yet."],
  cancelled: ["❌ Cancelled Consultations", "Cancelled or rejected consultations", "Nothing here — no cancellations."],
  history: ["📜 Consultation History", "Your full online consultation history", "No consultations recorded yet."],
};

type AppointmentParams = {
  kind: "ONLINE";
  status?: string;
  range?: "upcoming" | "past";
  limit?: number;
  page?: number;
};

const VIEW_PARAMS: Record<PatientOnlineView, AppointmentParams> = {
  pending: { kind: "ONLINE", status: "PENDING", limit: 20 },
  upcoming: { kind: "ONLINE", status: "CONFIRMED", range: "upcoming", limit: 20 },
  ongoing: { kind: "ONLINE", status: "IN_PROGRESS", limit: 20 },
  completed: { kind: "ONLINE", status: "COMPLETED", limit: 20 },
  cancelled: { kind: "ONLINE", status: "CANCELLED", limit: 20 },
  history: { kind: "ONLINE", limit: 30 },
};

export function OnlineConsultationsPatientContent({ view }: { view: PatientOnlineView }) {
  const showToast = usePatientUiStore((s) => s.showToast);
  const appointmentsQuery = usePatientAppointments(VIEW_PARAMS[view], view === "ongoing");
  const meta = VIEW_META[view];

  const list = useMemo(() => {
    const data = appointmentsQuery.data?.data ?? [];
    if (view === "history") {
      return [...data]
        .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
        .map((a) => mapAppointmentToConsultation(a));
    }
    return data.map((a) => mapAppointmentToConsultation(a));
  }, [appointmentsQuery.data?.data, view]);

  return (
    <>
      <DashPageHeader
        subtitle="🏥 Patient Dashboard"
        title={meta[0].replace(/^[^\s]+\s/, "")}
        dateStr={todayFormatted()}
        actions={
          <Link href="/book-consultation">
            <DashButton variant="solid" onClick={() => showToast("Opening booking...")}>
              + Book New
            </DashButton>
          </Link>
        }
      />

      <DashCard title={meta[0]}>
        <div style={{ fontSize: "0.78rem", color: "var(--gray-500)", margin: "-4px 0 12px" }}>{meta[1]}</div>
        <div className="cons-list">
          {appointmentsQuery.isLoading ? (
            <EmptyState message="Loading consultations..." />
          ) : list.length > 0 ? (
            list.map((item) => <ConsultationCard key={item.id} item={item} variant="full" />)
          ) : (
            <div className="oc-empty" style={{ padding: "34px 10px", textAlign: "center", color: "var(--gray-400)", fontSize: "0.86rem" }}>
              <span style={{ fontSize: "2rem", display: "block", marginBottom: 8 }}>🗂️</span>
              {meta[2]}
            </div>
          )}
        </div>
      </DashCard>
    </>
  );
}
