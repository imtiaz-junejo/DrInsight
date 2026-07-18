"use client";

import { PanelTable, UserCell } from "@/components/admin/ui/AdminPrimitives";
import { formatDate } from "@/lib/data-mappers";
import { useAdminPrescriptions } from "@/services/admin-api-hooks";

export function PrescriptionsPageContent() {
  const query = useAdminPrescriptions();
  const prescriptions = query.data ?? [];

  const rows = prescriptions.map((rx) => {
    const firstItem = rx.items?.[0];
    return [
      <UserCell
        key={`p-${rx.id}`}
        firstName={rx.patient?.user?.firstName}
        lastName={rx.patient?.user?.lastName}
        sub={rx.diagnosis ?? "Prescription"}
        userId={(rx.patient?.user as { id?: string })?.id}
      />,
      rx.doctor?.user ? (
        <UserCell
          key={`d-${rx.id}`}
          firstName={rx.doctor.user.firstName}
          lastName={rx.doctor.user.lastName}
          sub="Doctor"
          userId={(rx.doctor.user as { id?: string }).id}
        />
      ) : (
        "—"
      ),
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
