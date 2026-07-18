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
import { adminDoctorArticlesHref, adminUserProfileHref } from "@/lib/admin-routes";
import { formatNumber, formatSignedChange } from "@/lib/admin-utils";
import { useAdminUiStore } from "@/store/admin-ui.store";
import {
  useAdminDoctors,
  usePendingUsers,
  usePlatformStats,
  useUpdateUserStatus,
} from "@/services/admin-api-hooks";

export function DoctorsPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [filterIndex, setFilterIndex] = useState(0);
  const [page, setPage] = useState(1);
  const doctorsQuery = useAdminDoctors({ page, limit: 10 });
  const statsQuery = usePlatformStats();
  const pendingQuery = usePendingUsers();
  const updateStatus = useUpdateUserStatus();

  const stats = statsQuery.data;
  const doctors = doctorsQuery.data?.data ?? [];
  const pendingDoctors = (pendingQuery.data ?? []).filter((u) => u.role === "DOCTOR");
  const totalDoctors = stats?.doctorCount ?? doctorsQuery.data?.meta.total ?? 0;
  const verifiedDoctors = stats?.verifiedDoctorCount ?? Math.max(0, totalDoctors - pendingDoctors.length);
  const avgRating = stats?.averageRating ?? 0;
  const ratingChange = stats?.averageRatingChange ?? 0;

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
        userId={user?.id}
      />,
      doctor.specialty,
      doctor.hospital ?? "—",
      `$${Math.round(fee)}`,
      doctor.reviewCount > 0 ? `⭐ ${doctor.rating.toFixed(1)} (${doctor.reviewCount})` : "— (0)",
      <StatusChip key={`${doctor.id}-s`} label={isPending ? "Pending Verification" : "Verified"} className={isPending ? "ch-a" : "ch-g"} />,
      <div key={`${doctor.id}-a`} className="btn-row">
        {user?.id ? (
          <Link href={adminUserProfileHref(user.id)} className="btn">
            View
          </Link>
        ) : null}
        {isPending && user?.id ? (
          <AdminButton
            variant="green"
            onClick={() => {
              updateStatus.mutate({ id: user.id, status: "ACTIVE" }, { onSuccess: () => showToast("Doctor verified ✓") });
            }}
          >
            Verify
          </AdminButton>
        ) : user?.id ? (
          <Link href={adminDoctorArticlesHref(user.id)} className="btn">
            Articles
          </Link>
        ) : null}
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
            num: statsQuery.isLoading ? "—" : formatNumber(totalDoctors),
            label: "Total Doctors",
            tag: statsQuery.isLoading ? "—" : `${stats?.specialtyCount ?? 0} specialties`,
            tagClass: "tt-b",
          },
          {
            ic: "ic2",
            icon: "✅",
            num: statsQuery.isLoading ? "—" : formatNumber(verifiedDoctors),
            label: "Verified",
            tag: statsQuery.isLoading ? "—" : `${stats?.verifiedDoctorPercent ?? 0}%`,
            tagClass: "tt-g",
          },
          {
            ic: "ic3",
            icon: "⏳",
            num: statsQuery.isLoading ? "—" : formatNumber(stats?.pendingDoctors ?? pendingDoctors.length),
            label: "Pending Verification",
            tag: (stats?.pendingDoctors ?? pendingDoctors.length) > 0 ? "Action needed" : "Clear",
            tagClass: "tt-a",
          },
          {
            ic: "ic4",
            icon: "⭐",
            num: statsQuery.isLoading ? "—" : avgRating.toFixed(2),
            label: "Avg. Rating",
            tag: statsQuery.isLoading ? "—" : formatSignedChange(ratingChange),
            tagClass: "tt-g",
          },
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
