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
import { appointmentStatusChip, formatDateTime, formatNumber } from "@/lib/admin-utils";
import { exportTableCsv } from "@/lib/analytics-range";
import { useAdminUiStore } from "@/store/admin-ui.store";
import { useAdminAppointments, useUpdateAppointmentStatus } from "@/services/admin-api-hooks";

export type AdminPhysicalView =
  | "pending"
  | "approved"
  | "rejected"
  | "upcoming"
  | "completed"
  | "cancelled";

const VIEW_TITLES: Record<AdminPhysicalView, string> = {
  pending: "🕒 Pending Physical Requests",
  approved: "✅ Approved Physical Visits",
  rejected: "⛔ Rejected Physical Requests",
  upcoming: "📅 Upcoming Physical Visits",
  completed: "🏁 Completed Physical Visits",
  cancelled: "❌ Cancelled Physical Appointments",
};

type AppointmentParams = {
  kind: "PHYSICAL";
  status?: string;
  range?: "upcoming" | "past";
  limit?: number;
  page?: number;
};

const VIEW_PARAMS: Record<AdminPhysicalView, AppointmentParams> = {
  pending: { kind: "PHYSICAL", status: "PENDING", limit: 20 },
  approved: { kind: "PHYSICAL", status: "CONFIRMED", limit: 20 },
  rejected: { kind: "PHYSICAL", status: "CANCELLED", limit: 20 },
  upcoming: { kind: "PHYSICAL", status: "CONFIRMED", range: "upcoming", limit: 20 },
  completed: { kind: "PHYSICAL", status: "COMPLETED", limit: 20 },
  cancelled: { kind: "PHYSICAL", status: "CANCELLED", limit: 20 },
};

function physicalChip(view: AdminPhysicalView, status: string) {
  if (view === "rejected") return { label: "⛔ Rejected", className: "ch-r" };
  return appointmentStatusChip(status);
}

export function AdminPhysicalPageContent({ view }: { view: AdminPhysicalView }) {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [page, setPage] = useState(1);
  const [patientSearch, setPatientSearch] = useState("");
  const updateStatus = useUpdateAppointmentStatus();

  const appointmentsQuery = useAdminAppointments({
    ...VIEW_PARAMS[view],
    page,
    search: patientSearch || undefined,
  });

  const pendingQuery = useAdminAppointments({ kind: "PHYSICAL", status: "PENDING", limit: 1 });
  const approvedQuery = useAdminAppointments({ kind: "PHYSICAL", status: "CONFIRMED", limit: 1 });
  const upcomingQuery = useAdminAppointments({ kind: "PHYSICAL", status: "CONFIRMED", range: "upcoming", limit: 1 });
  const completedQuery = useAdminAppointments({ kind: "PHYSICAL", status: "COMPLETED", limit: 1 });

  const appointments = useMemo(() => {
    const data = appointmentsQuery.data?.data ?? [];
    if (view === "rejected") {
      return data.filter((a) => Boolean(a.cancelReason));
    }
    if (view === "cancelled") {
      return data.filter((a) => !a.cancelReason || view === "cancelled");
    }
    return data;
  }, [appointmentsQuery.data?.data, view]);

  const meta = appointmentsQuery.data?.meta;

  const statCards = useMemo(
    () => [
      {
        ic: "ic3",
        icon: "🕒",
        num: formatNumber(pendingQuery.data?.meta.total ?? 0),
        label: "Pending Requests",
        tag: (pendingQuery.data?.meta.total ?? 0) > 0 ? "Action needed" : "All clear",
        tagClass: (pendingQuery.data?.meta.total ?? 0) > 0 ? "tt-a" : "tt-g",
      },
      {
        ic: "ic1",
        icon: "✅",
        num: formatNumber(approvedQuery.data?.meta.total ?? 0),
        label: "Approved",
        tag: "Awaiting visit",
        tagClass: "tt-b",
      },
      {
        ic: "ic2",
        icon: "📅",
        num: formatNumber(upcomingQuery.data?.meta.total ?? 0),
        label: "Upcoming",
        tag: "Scheduled",
        tagClass: "tt-b",
      },
      {
        ic: "ic4",
        icon: "🏁",
        num: formatNumber(completedQuery.data?.meta.total ?? 0),
        label: "Completed",
        tag: "Clinic visits",
        tagClass: "tt-g",
      },
    ],
    [pendingQuery.data, approvedQuery.data, upcomingQuery.data, completedQuery.data],
  );

  const rows = appointments.map((a) => {
    const chip = physicalChip(view, a.status);
    const patientUser = a.patient?.user;
    const doctorUser = a.doctor?.user;
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
      <div key={`${a.id}-d`}>
        {doctorUser ? `Dr. ${doctorUser.firstName} ${doctorUser.lastName}` : "—"}
        <div style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>{a.doctor?.specialty}</div>
      </div>,
      <div key={`${a.id}-c`}>
        {a.doctor?.hospital ?? "—"}
        <div style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>{a.doctor?.city ?? "—"}</div>
      </div>,
      <div key={`${a.id}-dt`}>
        {formatDateTime(a.scheduledAt)}
      </div>,
      <StatusChip key={`${a.id}-s`} label={chip.label} className={chip.className} />,
      <div key={`${a.id}-a`} className="btn-row">
        <Link href={adminAppointmentDetailHref(a.id)} className="btn">
          View
        </Link>
        {view === "pending" ? (
          <>
            <AdminButton
              variant="green"
              onClick={() => {
                updateStatus.mutate({ id: a.id, status: "CONFIRMED" }, { onSuccess: () => showToast("Approved ✓") });
              }}
            >
              ✓ Approve
            </AdminButton>
            <AdminButton
              variant="danger"
              onClick={() => {
                updateStatus.mutate({ id: a.id, status: "CANCELLED" }, { onSuccess: () => showToast("Rejected") });
              }}
            >
              ✕ Reject
            </AdminButton>
          </>
        ) : null}
      </div>,
    ];
  });

  return (
    <>
      <StatCardRow items={statCards} />
      <AdminPanel title="🔍 Filter Physical Appointments">
        <div className="form-grid" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div className="fg-item" style={{ minWidth: 180, flex: 1 }}>
            <label>Patient</label>
            <input
              placeholder="Search patient name..."
              value={patientSearch}
              onChange={(e) => {
                setPatientSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="btn-row" style={{ alignSelf: "flex-end" }}>
            <AdminButton
              onClick={() => {
                exportTableCsv(
                  `physical-${view}.csv`,
                  ["ID", "Patient", "Doctor", "Clinic", "Scheduled", "Status"],
                  appointments.map((a) => [
                    a.id,
                    `${a.patient?.user?.firstName ?? ""} ${a.patient?.user?.lastName ?? ""}`.trim(),
                    `${a.doctor?.user?.firstName ?? ""} ${a.doctor?.user?.lastName ?? ""}`.trim(),
                    a.doctor?.hospital ?? "",
                    a.scheduledAt,
                    a.status,
                  ]),
                );
                showToast("CSV exported");
              }}
            >
              ⬇ Export Report (CSV)
            </AdminButton>
          </div>
        </div>
      </AdminPanel>
      <PanelTable
        title={VIEW_TITLES[view]}
        headers={["ID", "Patient", "Doctor", "Clinic", "Date & Time", "Status", "Actions"]}
        rows={rows}
        loading={appointmentsQuery.isLoading}
        pagerInfo={`Showing ${appointments.length} of ${meta?.total ?? 0} appointments`}
        emptyMessage="No physical appointments match the current filters."
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
