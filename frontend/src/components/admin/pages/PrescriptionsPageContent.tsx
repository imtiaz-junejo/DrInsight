"use client";

import { PanelTable, UserCell } from "@/components/admin/ui/AdminPrimitives";
import { formatDate } from "@/lib/data-mappers";
import { useAdminPrescriptions } from "@/services/admin-api-hooks";

export function PrescriptionsPageContent() {
  const query = useAdminPrescriptions();
  const prescriptions = query.data ?? [];

  const rows = prescriptions.map((rx) => {
    const firstItem = rx.items?.[0];
    const doctorName = rx.doctor?.user
      ? `Dr. ${rx.doctor.user.firstName} ${rx.doctor.user.lastName}`
      : "—";
    return [
      <UserCell
        key={`p-${rx.id}`}
        firstName={rx.patient?.user?.firstName}
        lastName={rx.patient?.user?.lastName}
        sub={rx.diagnosis ?? "Prescription"}
      />,
      doctorName,
      firstItem?.medication ?? "—",
      firstItem?.dosage ?? "—",
      formatDate(rx.createdAt),
      "Issued",
    ];
  });

  return (
    <PanelTable
      title="💊 Issued Prescriptions"
      actions={
        <div className="panel-search">
          <input placeholder="Search by patient or drug..." />
        </div>
      }
      headers={["Patient", "Doctor", "Medication", "Dosage", "Issued", "Status"]}
      rows={query.isLoading ? [] : rows}
      pagerInfo={query.isLoading ? "Loading..." : `Showing ${prescriptions.length} prescriptions`}
      emptyMessage={query.isLoading ? "Loading..." : "No prescriptions found"}
    />
  );
}
