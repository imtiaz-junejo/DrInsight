"use client";

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
import { AdminDoctorProfileWorkspace } from "@/components/admin/doctor-profiles/AdminDoctorProfileWorkspace";
import { formatNumber } from "@/lib/admin-utils";
import { useAdminUiStore } from "@/store/admin-ui.store";
import { useAdminDoctorManage } from "@/services/admin-api-hooks";

const STATUS_FILTERS = ["All", "Verified", "Pending", "Suspended"] as const;
const SORT_FILTERS = ["Registration Date", "Name", "Experience", "Rating", "Last Active"] as const;
const SORT_MAP: Record<(typeof SORT_FILTERS)[number], string> = {
  "Registration Date": "createdAt",
  Name: "name",
  Experience: "experience",
  Rating: "rating",
  "Last Active": "lastActive",
};

export function DoctorProfilesPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusIndex, setStatusIndex] = useState(0);
  const [sortIndex, setSortIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const verificationStatus =
    statusIndex === 1 ? "verified" : statusIndex === 2 ? "pending" : statusIndex === 3 ? "suspended" : undefined;

  const doctorsQuery = useAdminDoctorManage({
    page,
    limit: 20,
    search: search || undefined,
    verificationStatus,
    sort: SORT_MAP[SORT_FILTERS[sortIndex]],
    order: "desc",
  });

  const doctors = doctorsQuery.data?.data ?? [];
  const meta = doctorsQuery.data?.meta;
  const customSeoCount = doctorsQuery.data?.stats?.customSeoCount ?? 0;

  const statCards = useMemo(
    () => [
      {
        ic: "ic1",
        icon: "👨‍⚕️",
        num: formatNumber(meta?.total ?? doctors.length),
        label: "Doctor Profiles",
        tag: "Editable",
        tagClass: "tt-b",
      },
      {
        ic: "ic2",
        icon: "🔍",
        num: formatNumber(customSeoCount),
        label: "Custom SEO Set",
        tag: "Overrides live",
        tagClass: "tt-g",
      },
      {
        ic: "ic3",
        icon: "🧬",
        num: "Physician",
        label: "Schema Type",
        tag: "schema.org",
        tagClass: "tt-b",
      },
      {
        ic: "ic4",
        icon: "🔗",
        num: "/authors/",
        label: "Canonical Base",
        tag: "clean URLs",
        tagClass: "tt-a",
      },
    ],
    [meta?.total, doctors.length, customSeoCount],
  );

  const openDoctor = (doctorId: string, withEdit = false) => {
    setSelectedId(doctorId);
    setEditMode(withEdit);
    showToast("Loaded doctor into the editor");
    requestAnimationFrame(() => {
      document.getElementById("doctor-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const rows = doctors.map((doctor) => {
    const user = doctor.user;
    const isSuspended = user?.status === "SUSPENDED";
    const hasSeo = Boolean(doctor.seoMetaTitle || doctor.profileSlug);
    return [
      <UserCell
        key={doctor.id}
        firstName={user?.firstName}
        lastName={user?.lastName}
        sub={doctor.credentials ?? doctor.professionalTitle ?? undefined}
        seed={doctor.id}
        doctorProfileId={doctor.id}
      />,
      doctor.specialty,
      doctor.hospital ?? "—",
      <StatusChip
        key={`${doctor.id}-acct`}
        label={isSuspended ? "Suspended" : user?.status === "PENDING" ? "Pending" : "Active"}
        className={isSuspended ? "ch-r" : user?.status === "PENDING" ? "ch-a" : "ch-g"}
      />,
      <StatusChip
        key={`${doctor.id}-seo`}
        label={hasSeo ? "Custom SEO" : "Using defaults"}
        className={hasSeo ? "ch-g" : "ch-gray"}
      />,
      <div key={`${doctor.id}-a`} className="btn-row">
        <AdminButton onClick={() => openDoctor(doctor.id, false)}>Open</AdminButton>
        <AdminButton variant="green" onClick={() => openDoctor(doctor.id, true)}>
          Edit SEO
        </AdminButton>
      </div>,
    ];
  });

  return (
    <>
      <StatCardRow items={statCards} />

      <AdminPanel title="👨‍⚕️ Doctor Profiles">
        <div style={{ display: "grid", gap: 12, marginBottom: 14 }}>
          <input
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, phone, PMDC, specialty, hospital, city..."
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
          headers={["Doctor", "Specialty", "Institution", "Account", "SEO Status", "Actions"]}
          rows={rows}
          loading={doctorsQuery.isLoading}
          emptyMessage="No doctor profiles found"
        />
        {meta && meta.totalPages > 1 ? (
          <AdminPagination
            info={`Showing ${doctors.length} of ${meta.total} doctors`}
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        ) : (
          <div style={{ fontSize: ".74rem", color: "var(--gray-400)", marginTop: 10 }}>
            Showing {doctors.length} of {meta?.total ?? 0} doctors
          </div>
        )}
      </AdminPanel>

      <div id="doctor-workspace">
        {selectedId ? (
          <AdminDoctorProfileWorkspace
            doctorId={selectedId}
            editMode={editMode}
            onToggleEdit={() => setEditMode((value) => !value)}
          />
        ) : null}
      </div>
    </>
  );
}
