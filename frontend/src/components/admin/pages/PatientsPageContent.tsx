"use client";

import {
  AdminButton,
  PanelTable,
  StatCardRow,
} from "@/components/admin/ui/AdminPrimitives";
import { formatNumber } from "@/lib/admin-utils";
import { useAdminUiStore } from "@/store/admin-ui.store";
import { usePlatformStats } from "@/services/admin-api-hooks";

// TODO: connect GET /patients or GET /users?role=PATIENT when backend endpoint exists
export function PatientsPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const statsQuery = usePlatformStats();
  const patientCount = statsQuery.data?.patientCount ?? 0;

  return (
    <>
      <StatCardRow
        items={[
          { ic: "ic1", icon: "🧑‍🤝‍🧑", num: formatNumber(patientCount), label: "Total Patients", tag: "Platform stats", tagClass: "tt-g" },
          { ic: "ic2", icon: "📅", num: "—", label: "With Active Bookings", tag: "No API", tagClass: "tt-b" },
          {
            ic: "ic3",
            icon: "❓",
            num: statsQuery.data ? String(statsQuery.data.answeredQuestions) : "—",
            label: "Asked a Question",
            tag: "Answered count",
            tagClass: "tt-b",
          },
          { ic: "ic4", icon: "🔖", num: "—", label: "Saved Articles", tag: "No API", tagClass: "tt-g" },
        ]}
      />
      <PanelTable
        title="Patient Accounts"
        actions={<AdminButton onClick={() => showToast("Exporting CSV...")}>⬇ Export</AdminButton>}
        headers={["Patient", "Age/Gender", "Email", "Consultations", "Last Active", "Status", "Actions"]}
        rows={[]}
        pagerInfo={`Showing 0 of ${patientCount} patients — TODO: patient list API`}
        emptyMessage="No patient records — connect patient list API"
      />
    </>
  );
}
