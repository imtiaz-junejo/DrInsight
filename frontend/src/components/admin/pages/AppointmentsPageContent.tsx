"use client";

import { useMemo, useState } from "react";
import {
  AdminButton,
  FilterPills,
  PanelTable,
  StatCardRow,
  StatusChip,
} from "@/components/admin/ui/AdminPrimitives";
import {
  appointmentStatusChip,
  consultationTypeIcon,
  formatDateTime,
  formatNumber,
} from "@/lib/admin-utils";
import { useAdminUiStore } from "@/store/admin-ui.store";
import { useAdminAppointments, useUpdateAppointmentStatus } from "@/services/admin-api-hooks";

export function AppointmentsPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [filterIndex, setFilterIndex] = useState(0);
  const [page, setPage] = useState(1);
  const appointmentsQuery = useAdminAppointments({ page, limit: 10 });
  const updateStatus = useUpdateAppointmentStatus();

  const appointments = useMemo(() => appointmentsQuery.data?.data ?? [], [appointmentsQuery.data?.data]);
  const meta = appointmentsQuery.data?.meta;

  const stats = useMemo(() => {
    const completed = appointments.filter((a) => a.status === "COMPLETED").length;
    const upcoming = appointments.filter((a) => a.status === "CONFIRMED" || a.status === "PENDING").length;
    const cancelled = appointments.filter((a) => a.status === "CANCELLED").length;
    const totalCount = meta?.total ?? appointments.length;
    return { total: totalCount, completed, upcoming, cancelled };
  }, [appointments, meta?.total]);

  const filtered = appointments.filter((a) => {
    const date = new Date(a.scheduledAt);
    const today = new Date();
    if (filterIndex === 1) return date.toDateString() === today.toDateString();
    if (filterIndex === 2) return a.status === "CONFIRMED" || a.status === "PENDING";
    if (filterIndex === 3) return a.status === "COMPLETED";
    if (filterIndex === 4) return a.status === "CANCELLED";
    return true;
  });

  const rows = filtered.map((a) => {
    const status = appointmentStatusChip(a.status);
    const patientName = `${a.patient?.user?.firstName ?? ""} ${a.patient?.user?.lastName ?? ""}`.trim();
    const doctorName = `Dr. ${a.doctor?.user?.firstName ?? ""} ${a.doctor?.user?.lastName ?? ""}`.trim();
    return [
      patientName || "—",
      doctorName || "—",
      consultationTypeIcon(a.consultationType),
      formatDateTime(a.scheduledAt),
      <StatusChip key={`${a.id}-s`} label={status.label} className={status.className} />,
      <div key={`${a.id}-a`} className="btn-row">
        <AdminButton onClick={() => showToast("Opening details...")}>Details</AdminButton>
        {a.status !== "CANCELLED" && a.status !== "COMPLETED" ? (
          <AdminButton
            variant="danger"
            onClick={() => {
              updateStatus.mutate({ id: a.id, status: "CANCELLED" }, { onSuccess: () => showToast("Appointment cancelled") });
            }}
          >
            Cancel
          </AdminButton>
        ) : null}
      </div>,
    ];
  });

  return (
    <>
      <StatCardRow
        items={[
          { ic: "ic1", icon: "📅", num: formatNumber(stats.total), label: "Total (30 days)", tag: "Live data", tagClass: "tt-g" },
          { ic: "ic2", icon: "✅", num: formatNumber(stats.completed), label: "Completed", tag: "Current page", tagClass: "tt-g" },
          { ic: "ic3", icon: "⏳", num: formatNumber(stats.upcoming), label: "Upcoming", tag: "Scheduled", tagClass: "tt-b" },
          { ic: "ic4", icon: "❌", num: formatNumber(stats.cancelled), label: "Cancelled", tag: "Current page", tagClass: "tt-r" },
        ]}
      />
      <FilterPills filters={["All", "Today", "Upcoming", "Completed", "Cancelled"]} activeIndex={filterIndex} onChange={setFilterIndex} />
      <PanelTable
        title="All Appointments"
        actions={<AdminButton onClick={() => showToast("Exporting CSV...")}>⬇ Export</AdminButton>}
        headers={["Patient", "Doctor", "Type", "Date & Time", "Status", "Actions"]}
        rows={rows}
        loading={appointmentsQuery.isLoading}
        pagerInfo={`Showing ${rows.length} of ${meta?.total ?? 0} appointments`}
        page={page}
        totalPages={meta?.totalPages ?? 1}
        onPageChange={setPage}
        emptyMessage="No appointments found"
      />
    </>
  );
}
