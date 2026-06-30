"use client";

import {
  AdminPanel,
  BarChart,
  GridTwo,
  PanelLink,
  PanelTable,
  StatCardRow,
  StatusChip,
  UserCell,
} from "@/components/admin/ui/AdminPrimitives";
import {
  formatNumber,
  formatRelativeTime,
  userRoleChip,
} from "@/lib/admin-utils";
import {
  useAdminAppointments,
  usePendingUsers,
  usePlatformStats,
} from "@/services/admin-api-hooks";

export function DashboardPageContent() {
  const statsQuery = usePlatformStats();
  const appointmentsQuery = useAdminAppointments({ limit: 100 });
  const pendingUsersQuery = usePendingUsers();

  const stats = statsQuery.data;
  const totalUsers = (stats?.patientCount ?? 0) + (stats?.doctorCount ?? 0);
  const appointments = appointmentsQuery.data?.data ?? [];
  const pendingUsers = pendingUsersQuery.data ?? [];

  const last7Days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
    const dayAppointments = appointments.filter((a) => {
      const d = new Date(a.scheduledAt);
      return d.getDay() === (index + 1) % 7;
    });
    return { label: day, value: dayAppointments.length || 0 };
  });

  const chartData = last7Days.some((d) => d.value > 0)
    ? last7Days
    : [
        { label: "Mon", value: 0 },
        { label: "Tue", value: 0 },
        { label: "Wed", value: 0 },
        { label: "Thu", value: 0 },
        { label: "Fri", value: 0 },
        { label: "Sat", value: 0 },
        { label: "Sun", value: 0 },
      ];

  const statCards = [
    {
      ic: "ic1",
      icon: "👥",
      num: statsQuery.isLoading ? "—" : formatNumber(totalUsers),
      label: "Total Users",
      tag: stats ? `+${pendingUsers.length} pending` : "—",
      tagClass: "tt-g",
    },
    {
      ic: "ic2",
      icon: "👨‍⚕️",
      num: statsQuery.isLoading ? "—" : formatNumber(stats?.doctorCount ?? 0),
      label: "Verified Doctors",
      tag: `+${pendingUsers.filter((u) => u.role === "DOCTOR").length} pending`,
      tagClass: "tt-a",
    },
    {
      ic: "ic3",
      icon: "📅",
      num: appointmentsQuery.isLoading ? "—" : formatNumber(appointmentsQuery.data?.meta.total ?? 0),
      label: "Consultations (30d)",
      tag: appointments.length > 0 ? "Live data" : "No data",
      tagClass: "tt-g",
    },
    {
      ic: "ic4",
      icon: "💰",
      num: "—",
      label: "Revenue (30d)",
      tag: "No API",
      tagClass: "tt-gray",
    },
  ];

  const recentUserRows = pendingUsers.slice(0, 3).map((user) => {
    const role = userRoleChip(user.role, user.status);
    return [
      <UserCell
        key={user.id}
        firstName={user.firstName}
        lastName={user.lastName}
        sub={user.email}
        seed={user.id}
      />,
      <StatusChip key={`${user.id}-role`} label={role.label} className={role.className} />,
      formatRelativeTime(user.createdAt),
    ];
  });

  return (
    <>
      <StatCardRow items={statCards} />
      <AdminPanel title="📈 Platform Activity — Last 7 Days" bodyClassName="panel-bd">
        <BarChart data={chartData} />
      </AdminPanel>
      <GridTwo>
        <PanelTable
          title="🔬 Pending Review Queue"
          actions={<PanelLink href="/admin/review-queue">View all →</PanelLink>}
          headers={["Article", "Author", "Specialty", "Submitted", "Status"]}
          rows={[]}
          emptyMessage="No articles in review queue — TODO: connect review queue API"
        />
        <PanelTable
          title="👥 Recently Registered"
          actions={<PanelLink href="/admin/users">View all →</PanelLink>}
          headers={["User", "Role", "Joined"]}
          rows={recentUserRows}
          loading={pendingUsersQuery.isLoading}
          emptyMessage="No recently registered users"
        />
      </GridTwo>
    </>
  );
}
