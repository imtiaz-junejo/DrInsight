"use client";

import Link from "next/link";
import {
  AdminButton,
  PanelTable,
  StatCardRow,
  StatusChip,
  UserCell,
} from "@/components/admin/ui/AdminPrimitives";
import { adminUserProfileHref } from "@/lib/admin-routes";
import { formatNumber, formatRelativeTime, userStatusChip } from "@/lib/admin-utils";
import { useAdminUiStore } from "@/store/admin-ui.store";
import { useAdminUsers, usePlatformStats } from "@/services/admin-api-hooks";

export function PatientsPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const statsQuery = usePlatformStats();
  const patientsQuery = useAdminUsers({ role: "PATIENT", limit: 50 });
  const stats = statsQuery.data;
  const patients = patientsQuery.data?.data ?? [];
  const patientCount = stats?.patientCount ?? patientsQuery.data?.meta.total ?? 0;

  const rows = patients.map((p) => {
    const status = userStatusChip(p.status);
    return [
      <UserCell key={p.id} firstName={p.firstName} lastName={p.lastName} sub={`#PT-${p.id.slice(-4)}`} seed={p.id} userId={p.id} />,
      "—",
      p.email,
      "—",
      formatRelativeTime(p.createdAt),
      <StatusChip key={`st-${p.id}`} label={status.label} className={status.className} />,
      <Link key={`act-${p.id}`} href={adminUserProfileHref(p.id)} className="btn">
        View
      </Link>,
    ];
  });

  return (
    <>
      <StatCardRow
        items={[
          {
            ic: "ic1",
            icon: "🧑‍🤝‍🧑",
            num: statsQuery.isLoading ? "—" : formatNumber(patientCount),
            label: "Total Patients",
            tag: statsQuery.isLoading ? "—" : `+${formatNumber(stats?.patientsThisWeek ?? 0)} this week`,
            tagClass: "tt-g",
          },
          {
            ic: "ic2",
            icon: "📅",
            num: statsQuery.isLoading ? "—" : formatNumber(stats?.patientsWithActiveBookings ?? 0),
            label: "With Active Bookings",
            tag: statsQuery.isLoading ? "—" : `${stats?.patientsWithActiveBookingsPercent ?? 0}%`,
            tagClass: "tt-b",
          },
          {
            ic: "ic3",
            icon: "❓",
            num: statsQuery.isLoading ? "—" : formatNumber(stats?.askDoctorQuestionCount ?? 0),
            label: "Asked a Question",
            tag: statsQuery.isLoading ? "—" : `${stats?.patientsAskedQuestionPercent ?? 0}%`,
            tagClass: "tt-b",
          },
          {
            ic: "ic4",
            icon: "🔖",
            num: statsQuery.isLoading ? "—" : formatNumber(stats?.publicationBookmarkCount ?? 0),
            label: "Saved Articles",
            tag: statsQuery.isLoading ? "—" : `avg ${stats?.savedArticlesAvgPerPatient ?? 0}/user`,
            tagClass: "tt-g",
          },
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
