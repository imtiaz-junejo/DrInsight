"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AdminButton,
  FilterPills,
  PanelTable,
  StatCardRow,
  StatusChip,
  UserCell,
} from "@/components/admin/ui/AdminPrimitives";
import { formatNumber } from "@/lib/admin-utils";
import { useAdminUiStore } from "@/store/admin-ui.store";
import {
  useAdminDoctors,
  usePendingUsers,
  usePlatformStats,
  useUpdateUserStatus,
} from "@/services/admin-api-hooks";
import { useDoctorSpecialties } from "@/services/api-hooks";

export function DoctorsPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [filterIndex, setFilterIndex] = useState(0);
  const [page, setPage] = useState(1);
  const doctorsQuery = useAdminDoctors({ page, limit: 10 });
  const specialtiesQuery = useDoctorSpecialties();
  const statsQuery = usePlatformStats();
  const pendingQuery = usePendingUsers();
  const updateStatus = useUpdateUserStatus();

  const doctors = doctorsQuery.data?.data ?? [];
  const pendingDoctors = (pendingQuery.data ?? []).filter((u) => u.role === "DOCTOR");
  const avgRating = statsQuery.data?.averageRating ?? 0;

  const filteredDoctors = doctors.filter((doctor) => {
    const userId = doctor.user?.id;
    const isPending = pendingDoctors.some((p) => p.id === userId);
    if (filterIndex === 1) return !isPending;
    if (filterIndex === 2) return isPending;
    return true;
  });

  const rows = filteredDoctors.map((doctor) => {
    const user = doctor.user;
    const isPending = pendingDoctors.some((p) => p.id === user?.id);
    const fee = typeof doctor.consultationFee === "string" ? parseFloat(doctor.consultationFee) : doctor.consultationFee;
    return [
      <UserCell
        key={doctor.id}
        firstName={user?.firstName}
        lastName={user?.lastName}
        sub={`${doctor.specialty} · ${doctor.experienceYears} yrs`}
        seed={doctor.id}
      />,
      doctor.specialty,
      doctor.hospital ?? "—",
      `$${Math.round(fee)}`,
      doctor.reviewCount > 0 ? `⭐ ${doctor.rating.toFixed(1)} (${doctor.reviewCount})` : "— (0)",
      <StatusChip key={`${doctor.id}-s`} label={isPending ? "Pending Verification" : "Verified"} className={isPending ? "ch-a" : "ch-g"} />,
      <div key={`${doctor.id}-a`} className="btn-row">
        <AdminButton onClick={() => showToast("Opening profile...")}>View</AdminButton>
        {isPending && user?.id ? (
          <AdminButton
            variant="green"
            onClick={() => {
              updateStatus.mutate({ id: user.id, status: "ACTIVE" }, { onSuccess: () => showToast("Doctor verified ✓") });
            }}
          >
            Verify
          </AdminButton>
        ) : (
          <Link href="/admin/authors" className="btn">
            Articles
          </Link>
        )}
      </div>,
    ];
  });

  return (
    <>
      <StatCardRow
        items={[
          {
            ic: "ic1",
            icon: "👨‍⚕️",
            num: formatNumber(doctorsQuery.data?.meta.total ?? 0),
            label: "Total Doctors",
            tag: `${specialtiesQuery.data?.length ?? 0} specialties`,
            tagClass: "tt-b",
          },
          {
            ic: "ic2",
            icon: "✅",
            num: formatNumber(Math.max(0, (doctorsQuery.data?.meta.total ?? 0) - pendingDoctors.length)),
            label: "Verified",
            tag: "Live data",
            tagClass: "tt-g",
          },
          {
            ic: "ic3",
            icon: "⏳",
            num: String(pendingDoctors.length),
            label: "Pending Verification",
            tag: pendingDoctors.length > 0 ? "Action needed" : "None",
            tagClass: "tt-a",
          },
          { ic: "ic4", icon: "⭐", num: avgRating.toFixed(2), label: "Avg. Rating", tag: "Platform stats", tagClass: "tt-g" },
        ]}
      />
      <FilterPills filters={["All", "Verified", "Pending", "Suspended", "By Specialty"]} activeIndex={filterIndex} onChange={setFilterIndex} />
      <PanelTable
        title="Doctor Accounts"
        actions={
          <AdminButton variant="primary" onClick={() => showToast("Opening add-doctor form...")}>
            + Add Doctor
          </AdminButton>
        }
        headers={["Doctor", "Specialty", "Institution", "Consult Fee", "Rating", "Status", "Actions"]}
        rows={rows}
        loading={doctorsQuery.isLoading}
        pagerInfo={`Showing ${rows.length} of ${doctorsQuery.data?.meta.total ?? 0} doctors`}
        page={page}
        totalPages={doctorsQuery.data?.meta.totalPages ?? 1}
        onPageChange={setPage}
        emptyMessage="No doctors found"
      />
    </>
  );
}
