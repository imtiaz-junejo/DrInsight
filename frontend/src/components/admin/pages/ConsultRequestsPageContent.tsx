"use client";

import {
  AdminButton,
  PanelTable,
} from "@/components/admin/ui/AdminPrimitives";
import {
  consultationTypeIcon,
  formatRelativeTime,
} from "@/lib/admin-utils";
import { useAdminUiStore } from "@/store/admin-ui.store";
import { useAdminAppointments, useUpdateAppointmentStatus } from "@/services/admin-api-hooks";

export function ConsultRequestsPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const requestsQuery = useAdminAppointments({ status: "PENDING", limit: 20 });
  const updateStatus = useUpdateAppointmentStatus();
  const requests = requestsQuery.data?.data ?? [];

  const rows = requests.map((a) => {
    const patientName = `${a.patient?.user?.firstName ?? ""} ${a.patient?.user?.lastName ?? ""}`.trim() || "—";
    const doctorName = a.doctor?.user
      ? `Dr. ${a.doctor.user.firstName} ${a.doctor.user.lastName}`
      : "Any available";
    return [
      patientName,
      doctorName,
      a.doctor?.specialty ?? "—",
      consultationTypeIcon(a.consultationType),
      formatRelativeTime(a.scheduledAt),
      <div key={`${a.id}-a`} className="btn-row">
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
            updateStatus.mutate({ id: a.id, status: "CANCELLED" }, { onSuccess: () => showToast("Request declined") });
          }}
        >
          Decline
        </AdminButton>
      </div>,
    ];
  });

  return (
    <PanelTable
      title="🆕 New Consultation Requests"
      headers={["Patient", "Requested Doctor", "Specialty", "Preferred Type", "Submitted", "Actions"]}
      rows={rows}
      loading={requestsQuery.isLoading}
      pagerInfo={`${requestsQuery.data?.meta.total ?? 0} pending requests`}
      emptyMessage="No pending consultation requests"
    />
  );
}
