"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AdminButton,
  AdminPanel,
  PanelTable,
  StatCardRow,
  StatusChip,
  UserCell,
} from "@/components/admin/ui/AdminPrimitives";
import { adminAppointmentDetailHref } from "@/lib/admin-routes";
import {
  appointmentStatusChip,
  consultationTypeIcon,
  formatDateTime,
  formatNumber,
} from "@/lib/admin-utils";
import { exportTableCsv } from "@/lib/analytics-range";
import { useAdminUiStore } from "@/store/admin-ui.store";
import { useAdminAppointments, useUpdateAppointmentStatus } from "@/services/admin-api-hooks";
import { useConsultationAnalytics } from "@/services/analytics-api-hooks";

export type AdminOnlineView =
  | "pending"
  | "approved"
  | "upcoming"
  | "ongoing"
  | "completed"
  | "cancelled"
  | "reports";

const VIEW_TITLES: Record<AdminOnlineView, string> = {
  pending: "🕒 Pending Consultation Requests",
  approved: "✅ Approved Consultations",
  upcoming: "📅 Upcoming Consultations",
  ongoing: "🟢 Ongoing Consultations",
  completed: "🏁 Completed Consultations",
  cancelled: "❌ Cancelled & Rejected Consultations",
  reports: "📊 Consultation Reports",
};

type AppointmentParams = {
  kind: "ONLINE";
  status?: string;
  range?: "upcoming" | "past";
  limit?: number;
  page?: number;
};

const VIEW_PARAMS: Record<Exclude<AdminOnlineView, "reports">, AppointmentParams> = {
  pending: { kind: "ONLINE", status: "PENDING", limit: 20 },
  approved: { kind: "ONLINE", status: "CONFIRMED", limit: 20 },
  upcoming: { kind: "ONLINE", status: "CONFIRMED", range: "upcoming", limit: 20 },
  ongoing: { kind: "ONLINE", status: "IN_PROGRESS", limit: 20 },
  completed: { kind: "ONLINE", status: "COMPLETED", limit: 20 },
  cancelled: { kind: "ONLINE", status: "CANCELLED", limit: 20 },
};

export function AdminConsultationsPageContent({ view }: { view: AdminOnlineView }) {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [page, setPage] = useState(1);
  const updateStatus = useUpdateAppointmentStatus();

  const listParams = view === "reports" ? undefined : { ...VIEW_PARAMS[view], page };
  const appointmentsQuery = useAdminAppointments(listParams);
  const analyticsQuery = useConsultationAnalytics({ range: "month" });
  const pendingQuery = useAdminAppointments({ kind: "ONLINE", status: "PENDING", limit: 1 });
  const upcomingQuery = useAdminAppointments({ kind: "ONLINE", status: "CONFIRMED", range: "upcoming", limit: 1 });
  const ongoingQuery = useAdminAppointments({ kind: "ONLINE", status: "IN_PROGRESS", limit: 1 });
  const completedQuery = useAdminAppointments({ kind: "ONLINE", status: "COMPLETED", limit: 1 });

  const appointments = appointmentsQuery.data?.data ?? [];
  const meta = appointmentsQuery.data?.meta;

  const statCards = useMemo(
    () => [
      {
        ic: "ic3",
        icon: "🕒",
        num: formatNumber(pendingQuery.data?.meta.total ?? 0),
        label: "Pending",
        tag: "awaiting doctor",
        tagClass: "tt-a",
      },
      {
        ic: "ic1",
        icon: "📅",
        num: formatNumber(upcomingQuery.data?.meta.total ?? 0),
        label: "Upcoming",
        tag: "confirmed",
        tagClass: "tt-b",
      },
      {
        ic: "ic2",
        icon: "🟢",
        num: formatNumber(ongoingQuery.data?.meta.total ?? 0),
        label: "Ongoing",
        tag: "live now",
        tagClass: "tt-g",
      },
      {
        ic: "ic4",
        icon: "🏁",
        num: formatNumber(completedQuery.data?.meta.total ?? 0),
        label: "Completed",
        tag: `${formatNumber(appointmentsQuery.data?.meta.total ?? 0)} in view`,
        tagClass: "tt-g",
      },
    ],
    [pendingQuery.data, upcomingQuery.data, ongoingQuery.data, completedQuery.data, appointmentsQuery.data],
  );

  if (view === "reports") {
    const data = analyticsQuery.data;
    const specialtyRows = (data?.bySpecialty ?? []).map((row) => [row.specialty, String(row.consultations), row.avgRating]);
    return (
      <>
        <StatCardRow items={statCards} />
        <PanelTable
          title="📊 Consultations by Specialty"
          actions={
            <AdminButton
              onClick={() => {
                exportTableCsv(
                  "consultation-reports.csv",
                  ["Specialty", "Consultations", "Avg Rating"],
                  specialtyRows.map((r) => r.map(String)),
                );
                showToast("CSV exported");
              }}
            >
              ⬇ Export CSV
            </AdminButton>
          }
          headers={["Specialty", "Consultations", "Avg Rating"]}
          rows={specialtyRows}
          loading={analyticsQuery.isLoading}
          emptyMessage="No consultation analytics yet"
        />
      </>
    );
  }

  const rows = appointments.map((a) => {
    const status = appointmentStatusChip(a.status);
    const patientUser = a.patient?.user;
    const doctorUser = a.doctor?.user;
    const fee = a.payment?.amountCents ? `$${(a.payment.amountCents / 100).toFixed(0)}` : "—";
    return [
      <strong key={`${a.id}-id`}>{a.id.slice(0, 8).toUpperCase()}</strong>,
      patientUser ? (
        <UserCell
          key={`${a.id}-p`}
          firstName={patientUser.firstName}
          lastName={patientUser.lastName}
          userId={(patientUser as { id?: string }).id}
          seed={(patientUser as { id?: string }).id}
        />
      ) : (
        "—"
      ),
      doctorUser ? (
        <UserCell
          key={`${a.id}-d`}
          firstName={doctorUser.firstName}
          lastName={doctorUser.lastName}
          sub={a.doctor?.specialty}
          userId={(doctorUser as { id?: string }).id}
          seed={(doctorUser as { id?: string }).id}
        />
      ) : (
        "—"
      ),
      a.doctor?.specialty ?? "—",
      consultationTypeIcon(a.consultationType),
      formatDateTime(a.scheduledAt),
      fee,
      <StatusChip key={`${a.id}-s`} label={status.label} className={status.className} />,
      <div key={`${a.id}-a`} className="btn-row">
        <Link href={adminAppointmentDetailHref(a.id)} className="btn">
          👁 View
        </Link>
        {view === "pending" ? (
          <>
            <AdminButton
              variant="green"
              onClick={() => {
                updateStatus.mutate({ id: a.id, status: "CONFIRMED" }, { onSuccess: () => showToast("Confirmed ✓") });
              }}
            >
              Confirm
            </AdminButton>
            <AdminButton
              variant="danger"
              onClick={() => {
                updateStatus.mutate({ id: a.id, status: "CANCELLED" }, { onSuccess: () => showToast("Declined") });
              }}
            >
              Decline
            </AdminButton>
          </>
        ) : null}
      </div>,
    ];
  });

  return (
    <>
      <StatCardRow items={statCards} />
      <AdminPanel title="🔎 Filter Consultations">
        <p style={{ fontSize: "0.78rem", color: "var(--gray-500)", margin: 0 }}>
          Use the sidebar views to filter by consultation status. Advanced filters load from live appointment data.
        </p>
      </AdminPanel>
      <PanelTable
        title={VIEW_TITLES[view]}
        actions={
          <AdminButton
            onClick={() => {
              exportTableCsv(
                `consultations-${view}.csv`,
                ["ID", "Patient", "Doctor", "Specialty", "Type", "Scheduled", "Fee", "Status"],
                appointments.map((a) => [
                  a.id,
                  `${a.patient?.user?.firstName ?? ""} ${a.patient?.user?.lastName ?? ""}`.trim(),
                  `${a.doctor?.user?.firstName ?? ""} ${a.doctor?.user?.lastName ?? ""}`.trim(),
                  a.doctor?.specialty ?? "",
                  a.consultationType,
                  a.scheduledAt,
                  String(a.payment?.amountCents ?? ""),
                  a.status,
                ]),
              );
              showToast("CSV exported");
            }}
          >
            ⬇ Export CSV
          </AdminButton>
        }
        headers={["ID", "Patient", "Doctor", "Specialty", "Type", "Date & Time", "Fee", "Status", "Actions"]}
        rows={rows}
        loading={appointmentsQuery.isLoading}
        pagerInfo={`Showing ${appointments.length} of ${meta?.total ?? 0} consultations`}
        emptyMessage="No consultations match the current filters."
      />
      {meta && meta.totalPages > 1 ? (
        <div className="btn-row" style={{ marginTop: 12 }}>
          <button type="button" className="btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            ← Prev
          </button>
          <span style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>
            Page {page} of {meta.totalPages}
          </span>
          <button type="button" className="btn" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next →
          </button>
        </div>
      ) : null}
    </>
  );
}
