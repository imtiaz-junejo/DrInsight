"use client";

import { useState } from "react";
import {
  AdminButton,
  FilterPills,
  PanelTable,
  StatCardRow,
  StatusChip,
  UserCell,
} from "@/components/admin/ui/AdminPrimitives";
import { formatRelativeTime, userRoleChip, userStatusChip } from "@/lib/admin-utils";
import { useAdminUiStore } from "@/store/admin-ui.store";
import {
  usePendingUsers,
  usePlatformStats,
  useUpdateUserStatus,
} from "@/services/admin-api-hooks";

// TODO: connect GET /users list when backend endpoint exists
export function UsersPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [filterIndex, setFilterIndex] = useState(0);
  const statsQuery = usePlatformStats();
  const pendingQuery = usePendingUsers();
  const updateStatus = useUpdateUserStatus();

  const stats = statsQuery.data;
  const users = pendingQuery.data ?? [];
  const filtered = users.filter((user) => {
    if (filterIndex === 1) return user.role === "PATIENT";
    if (filterIndex === 2) return user.role === "DOCTOR";
    if (filterIndex === 3) return user.role === "ADMIN";
    if (filterIndex === 4) return user.status === "SUSPENDED";
    return true;
  });

  const rows = filtered.map((user) => {
    const role = userRoleChip(user.role, user.status);
    const status = userStatusChip(user.status);
    return [
      <UserCell key={user.id} firstName={user.firstName} lastName={user.lastName} sub={`#USR-${user.id.slice(-4)}`} seed={user.id} />,
      <StatusChip key={`${user.id}-r`} label={role.label} className={role.className} />,
      user.email,
      <StatusChip key={`${user.id}-s`} label={status.label} className={status.className} />,
      formatRelativeTime(user.createdAt),
      <div key={`${user.id}-a`} className="btn-row">
        <AdminButton onClick={() => showToast("Opening profile...")}>View</AdminButton>
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
            num: stats ? String((stats.patientCount ?? 0) + (stats.doctorCount ?? 0)) : "—",
            label: "Total Users",
            tag: "Partial data",
            tagClass: "tt-b",
          },
          { ic: "ic2", icon: "🧑‍🤝‍🧑", num: stats ? String(stats.patientCount) : "—", label: "Patients", tag: "Platform stats", tagClass: "tt-g" },
          { ic: "ic3", icon: "👨‍⚕️", num: stats ? String(stats.doctorCount) : "—", label: "Doctors", tag: "Platform stats", tagClass: "tt-a" },
          { ic: "ic4", icon: "🛡️", num: "—", label: "Admins/Staff", tag: "No API", tagClass: "tt-b" },
        ]}
      />
      <FilterPills
        filters={["All Users", "Patients", "Doctors", "Admins", "Suspended"]}
        activeIndex={filterIndex}
        onChange={setFilterIndex}
      />
      <PanelTable
        title="All Users"
        actions={
          <>
            <AdminButton variant="primary" onClick={() => showToast("Opening add-user form...")}>
              + Add User
            </AdminButton>
            <AdminButton onClick={() => showToast("Exporting CSV...")}>⬇ Export</AdminButton>
          </>
        }
        headers={["User", "Role", "Email", "Status", "Joined", "Actions"]}
        rows={rows}
        loading={pendingQuery.isLoading}
        pagerInfo={`Showing ${rows.length} pending users — TODO: full user list API`}
        emptyMessage="No users match filter — only pending users available via API"
      />
    </>
  );
}
