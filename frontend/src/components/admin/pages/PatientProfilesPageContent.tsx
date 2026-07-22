"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AdminButton,
  AdminPagination,
  AdminPanel,
  AdminTable,
  FilterPills,
  StatCardRow,
  StatusChip,
  UserCell,
} from "@/components/admin/ui/AdminPrimitives";
import { adminPatientProfileHref } from "@/lib/admin-routes";
import { patientAgeLabel } from "@/lib/admin-patient-profile-mapper";
import { formatNumber, formatRelativeTime } from "@/lib/admin-utils";
import { useAdminPatientManage, usePlatformStats } from "@/services/admin-api-hooks";

const STATUS_FILTERS = ["All", "Active", "Pending", "Suspended"] as const;
const SORT_FILTERS = ["Registration Date", "Name", "Last Active"] as const;
const SORT_MAP: Record<(typeof SORT_FILTERS)[number], string> = {
  "Registration Date": "createdAt",
  Name: "name",
  "Last Active": "lastActive",
};

export function PatientProfilesPageContent() {
  const router = useRouter();
  const statsQuery = usePlatformStats();
  const stats = statsQuery.data;
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusIndex, setStatusIndex] = useState(0);
  const [sortIndex, setSortIndex] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const accountStatus =
    statusIndex === 1 ? "active" : statusIndex === 2 ? "pending" : statusIndex === 3 ? "suspended" : undefined;

  const patientsQuery = useAdminPatientManage({
    page,
    limit: 20,
    search: search || undefined,
    accountStatus,
    sort: SORT_MAP[SORT_FILTERS[sortIndex]],
    order: "desc",
  });

  const patients = patientsQuery.data?.data ?? [];
  const meta = patientsQuery.data?.meta;

  const statCards = useMemo(
    () => [
      {
        ic: "ic1",
        icon: "🧑‍🤝‍🧑",
        num: formatNumber(meta?.total ?? stats?.patientCount ?? patients.length),
        label: "Patient Profiles",
        tag: statsQuery.isLoading ? "—" : `+${formatNumber(stats?.patientsThisWeek ?? 0)} this week`,
        tagClass: "tt-g",
      },
      {
        ic: "ic2",
        icon: "📅",
        num: formatNumber(stats?.patientsWithActiveBookings ?? 0),
        label: "With Active Bookings",
        tag: `${stats?.patientsWithActiveBookingsPercent ?? 0}%`,
        tagClass: "tt-b",
      },
      {
        ic: "ic3",
        icon: "❓",
        num: formatNumber(stats?.askDoctorQuestionCount ?? 0),
        label: "Asked a Question",
        tag: `${stats?.patientsAskedQuestionPercent ?? 0}%`,
        tagClass: "tt-b",
      },
      {
        ic: "ic4",
        icon: "🔖",
        num: formatNumber(stats?.publicationBookmarkCount ?? 0),
        label: "Saved Articles",
        tag: `avg ${stats?.savedArticlesAvgPerPatient ?? 0}/user`,
        tagClass: "tt-g",
      },
    ],
    [meta?.total, stats, patients.length, statsQuery.isLoading],
  );

  const viewPatient = (patientId: string, withEdit = false) => {
    const href = withEdit ? `${adminPatientProfileHref(patientId)}?edit=1` : adminPatientProfileHref(patientId);
    router.push(href);
  };

  const rows = patients.map((patient) => {
    const user = patient.user;
    const isSuspended = user?.status === "SUSPENDED";
    const ageGender = [patientAgeLabel(patient.dateOfBirth), patient.gender].filter((item) => item && item !== "—").join(" / ");
    return [
      <UserCell
        key={patient.id}
        firstName={user?.firstName}
        lastName={user?.lastName}
        sub={patient.patientNumber ?? `#PT-${patient.id.slice(-4)}`}
        seed={patient.id}
        patientProfileId={patient.id}
      />,
      ageGender || "—",
      user?.email ?? "—",
      patient.city ?? "—",
      user?.lastSeenAt ? formatRelativeTime(user.lastSeenAt) : "—",
      <StatusChip
        key={`${patient.id}-acct`}
        label={isSuspended ? "Suspended" : user?.status === "PENDING" ? "Pending" : "Active"}
        className={isSuspended ? "ch-r" : user?.status === "PENDING" ? "ch-a" : "ch-g"}
      />,
      <div key={`${patient.id}-a`} className="btn-row">
        <AdminButton onClick={() => viewPatient(patient.id, false)}>View</AdminButton>
        <AdminButton variant="green" onClick={() => viewPatient(patient.id, true)}>
          Edit
        </AdminButton>
      </div>,
    ];
  });

  return (
    <>
      <StatCardRow items={statCards} />

      <AdminPanel title="🧑‍🤝‍🧑 Patient Profiles">
        <div style={{ display: "grid", gap: 12, marginBottom: 14 }}>
          <input
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, phone, patient number, city..."
            style={{ width: "100%" }}
          />
          <FilterPills
            filters={[...STATUS_FILTERS]}
            activeIndex={statusIndex}
            onChange={(index) => {
              setStatusIndex(index);
              setPage(1);
            }}
          />
          <FilterPills
            filters={[...SORT_FILTERS]}
            activeIndex={sortIndex}
            onChange={(index) => {
              setSortIndex(index);
              setPage(1);
            }}
          />
        </div>
        <AdminTable
          headers={["Patient", "Age/Gender", "Email", "City", "Last Active", "Status", "Actions"]}
          rows={rows}
          loading={patientsQuery.isLoading}
          emptyMessage="No patient profiles found"
        />
        {meta && meta.totalPages > 1 ? (
          <AdminPagination
            info={`Showing ${patients.length} of ${meta.total} patients`}
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        ) : (
          <div style={{ fontSize: ".74rem", color: "var(--gray-400)", marginTop: 10 }}>
            Showing {patients.length} of {meta?.total ?? 0} patients
          </div>
        )}
      </AdminPanel>
    </>
  );
}
