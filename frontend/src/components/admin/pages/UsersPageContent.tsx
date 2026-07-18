"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AdminButton,
  FilterPills,
  PanelTable,
  StatCardRow,
  StatusChip,
  UserCell,
} from "@/components/admin/ui/AdminPrimitives";
import { adminUserProfileHref } from "@/lib/admin-routes";
import {
  formatNumber,
  formatRelativeTime,
  formatSharePercent,
  userRoleChip,
  userStatusChip,
} from "@/lib/admin-utils";
import { useAdminUiStore } from "@/store/admin-ui.store";
import {
  useAdminUsers,
  usePlatformStats,
  useUpdateUserStatus,
} from "@/services/admin-api-hooks";

export function UsersPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [filterIndex, setFilterIndex] = useState(0);
  const statsQuery = usePlatformStats();
  const updateStatus = useUpdateUserStatus();

  const roleParam = useMemo(() => {
    if (filterIndex === 1) return "PATIENT";
    if (filterIndex === 2) return "DOCTOR";
    if (filterIndex === 3) return "ADMIN";
    return undefined;
  }, [filterIndex]);

  const usersQuery = useAdminUsers({ role: roleParam, limit: 100 });
  const stats = statsQuery.data;
  const users = usersQuery.data?.data ?? [];
  const totalUsers =
    stats?.userCount ?? (stats?.patientCount ?? 0) + (stats?.doctorCount ?? 0) + (stats?.adminCount ?? 0);

  const filtered = users.filter((user) => {
    if (filterIndex === 4) return user.status === "SUSPENDED";
    return true;
  });

  const rows = filtered.map((user) => {
    const role = userRoleChip(user.role, user.status);
    const status = userStatusChip(user.status);
    return [
      <UserCell key={user.id} firstName={user.firstName} lastName={user.lastName} sub={`#USR-${user.id.slice(-4)}`} seed={user.id} userId={user.id} />,
      <StatusChip key={`${user.id}-r`} label={role.label} className={role.className} />,
      user.email,
      <StatusChip key={`${user.id}-s`} label={status.label} className={status.className} />,
      formatRelativeTime(user.createdAt),
      <div key={`${user.id}-a`} className="btn-row">
        <Link href={adminUserProfileHref(user.id)} className="btn">
          View
        </Link>
        {user.status === "PENDING" && user.role === "DOCTOR" ? (
          <AdminButton
            variant="green"
            onClick={() => {
              updateStatus.mutate({ id: user.id, status: "ACTIVE" }, { onSuccess: () => showToast("Doctor verified ✓") });
            }}
          >
            Verify
          </AdminButton>
        ) : user.status === "SUSPENDED" ? (
          <AdminButton
            variant="green"
            onClick={() => {
              updateStatus.mutate({ id: user.id, status: "ACTIVE" }, { onSuccess: () => showToast("User reactivated") });
            }}
          >
            Reactivate
          </AdminButton>
        ) : user.status !== "ACTIVE" ? (
          <AdminButton
            variant="green"
            onClick={() => {
              updateStatus.mutate({ id: user.id, status: "ACTIVE" }, { onSuccess: () => showToast("User activated") });
            }}
          >
            Activate
          </AdminButton>
        ) : (
          <AdminButton
            variant="danger"
            onClick={() => {
              updateStatus.mutate({ id: user.id, status: "SUSPENDED" }, { onSuccess: () => showToast("User suspended") });
            }}
          >
            Suspend
          </AdminButton>
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
            icon: "👥",
            num: statsQuery.isLoading ? "—" : formatNumber(totalUsers),
            label: "Total Users",
            tag: "All roles",
            tagClass: "tt-b",
          },
          {
            ic: "ic2",
            icon: "🧑‍🤝‍🧑",
            num: statsQuery.isLoading ? "—" : formatNumber(stats?.patientCount ?? 0),
            label: "Patients",
            tag: statsQuery.isLoading ? "—" : formatSharePercent(stats?.patientCount ?? 0, totalUsers),
            tagClass: "tt-g",
          },
          {
            ic: "ic3",
            icon: "👨‍⚕️",
            num: statsQuery.isLoading ? "—" : formatNumber(stats?.doctorCount ?? 0),
            label: "Doctors",
            tag: statsQuery.isLoading ? "—" : formatSharePercent(stats?.doctorCount ?? 0, totalUsers),
            tagClass: "tt-a",
          },
          {
            ic: "ic4",
            icon: "🛡️",
            num: statsQuery.isLoading ? "—" : formatNumber(stats?.adminCount ?? 0),
            label: "Admins/Staff",
            tag: statsQuery.isLoading ? "—" : formatSharePercent(stats?.adminCount ?? 0, totalUsers),
            tagClass: "tt-b",
          },
        ]}
      />
      <FilterPills
        filters={["All Users", "Patients", "Doctors", "Admins", "Suspended"]}
        activeIndex={filterIndex}
        onChange={setFilterIndex}
      />
      <PanelTable
        title="All Users"
        headers={["User", "Role", "Email", "Status", "Joined", "Actions"]}
        rows={rows}
        loading={usersQuery.isLoading}
        pagerInfo={`Showing ${rows.length} of ${usersQuery.data?.meta.total ?? rows.length} users`}
        emptyMessage="No users match filter"
      />
    </>
  );
}
