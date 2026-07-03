"use client";

import {
  AdminButton,
  PanelTable,
  StatCardRow,
  StatusChip,
  UserCell,
} from "@/components/admin/ui/AdminPrimitives";
import { formatNumber, formatRelativeTime, userRoleChip } from "@/lib/admin-utils";
import { useAdminUiStore } from "@/store/admin-ui.store";
import { useAdminUsers, usePlatformStats } from "@/services/admin-api-hooks";

export function PatientsPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const statsQuery = usePlatformStats();
  const patientsQuery = useAdminUsers({ role: "PATIENT", limit: 50 });
  const patients = patientsQuery.data?.data ?? [];
  const patientCount = statsQuery.data?.patientCount ?? patientsQuery.data?.meta.total ?? 0;

  const rows = patients.map((p) => [
    <UserCell key={p.id} firstName={p.firstName} lastName={p.lastName} sub={p.email} />,
    "—",
    p.email,
    "—",
    formatRelativeTime(p.createdAt),
    <StatusChip key={`st-${p.id}`} {...userRoleChip(p.status)} />,
    <AdminButton key={`act-${p.id}`} onClick={() => showToast(`Viewing ${p.firstName}...`)}>
      View
    </AdminButton>,
  ]);

  return (
    <>
      <StatCardRow
        items={[
          { ic: "ic1", icon: "🧑‍🤝‍🧑", num: formatNumber(patientCount), label: "Total Patients", tag: "Live data", tagClass: "tt-g" },
          { ic: "ic2", icon: "📅", num: formatNumber(patients.filter((p) => p.status === "ACTIVE").length), label: "Active Patients", tag: "From list", tagClass: "tt-b" },
          {
            ic: "ic3",
            icon: "❓",
            num: statsQuery.data ? String(statsQuery.data.answeredQuestions) : "—",
            label: "Questions Answered",
            tag: "Platform",
            tagClass: "tt-b",
          },
          { ic: "ic4", icon: "📰", num: statsQuery.data ? formatNumber(statsQuery.data.blogCount) : "—", label: "Blog Articles", tag: "Published", tagClass: "tt-g" },
        ]}
      />
      <PanelTable
        title="Patient Accounts"
        actions={<AdminButton onClick={() => showToast("Exporting CSV...")}>⬇ Export</AdminButton>}
        headers={["Patient", "Age/Gender", "Email", "Consultations", "Last Active", "Status", "Actions"]}
        rows={patientsQuery.isLoading ? [] : rows}
        pagerInfo={
          patientsQuery.isLoading
            ? "Loading patients..."
            : `Showing ${patients.length} of ${patientsQuery.data?.meta.total ?? patientCount} patients`
        }
        emptyMessage={patientsQuery.isLoading ? "Loading..." : "No patient records found"}
      />
    </>
  );
}
