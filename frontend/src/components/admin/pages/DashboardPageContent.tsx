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
import { formatDate } from "@/lib/data-mappers";
import {
  useAdminAppointments,
  useAdminBlogPosts,
  useAdminPayments,
  usePendingUsers,
  usePlatformStats,
} from "@/services/admin-api-hooks";

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function DashboardPageContent() {
  const statsQuery = usePlatformStats();
  const appointmentsQuery = useAdminAppointments({ limit: 100 });
  const pendingUsersQuery = usePendingUsers();
  const paymentsQuery = useAdminPayments({ limit: 100 });
  const draftPostsQuery = useAdminBlogPosts({ limit: 10, status: "DRAFT" });

  const stats = statsQuery.data;
  const totalUsers = stats?.userCount ?? (stats?.patientCount ?? 0) + (stats?.doctorCount ?? 0) + (stats?.adminCount ?? 0);
  const appointments = appointmentsQuery.data?.data ?? [];
  const pendingUsers = pendingUsersQuery.data ?? [];
  const draftPosts = draftPostsQuery.data?.data ?? [];
  const paymentList = paymentsQuery.data?.data ?? [];
  const revenueCents = stats?.revenueLast30DaysCents ?? paymentList.reduce((sum, p) => sum + p.amountCents, 0);

  const last7Days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => {
    const dayAppointments = appointments.filter((a) => {
      const d = new Date(a.scheduledAt);
      return d.getDay() === index;
    });
    return { label: day, value: dayAppointments.length };
  });

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
      num: statsQuery.isLoading ? "—" : formatNumber(stats?.verifiedDoctorCount ?? stats?.doctorCount ?? 0),
      label: "Verified Doctors",
      tag: `+${pendingUsers.filter((u) => u.role === "DOCTOR").length} pending`,
      tagClass: "tt-a",
    },
    {
      ic: "ic3",
      icon: "📅",
      num: statsQuery.isLoading
        ? "—"
        : formatNumber(stats?.appointmentsLast30Days ?? appointmentsQuery.data?.meta.total ?? 0),
      label: "Consultations (30d)",
      tag: `${stats?.pendingAppointments ?? 0} pending`,
      tagClass: "tt-g",
    },
    {
      ic: "ic4",
      icon: "💰",
      num: statsQuery.isLoading && paymentsQuery.isLoading ? "—" : formatCents(revenueCents),
      label: "Revenue (30d)",
            tag: `${stats?.paymentsLast30Days ?? paymentList.length ?? 0} payments`,
      tagClass: "tt-g",
    },
  ];

  const recentUserRows = pendingUsers.slice(0, 5).map((user) => {
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

  const reviewRows = draftPosts.slice(0, 5).map((post) => [
    post.title,
    post.author ? `${post.author.firstName} ${post.author.lastName}` : "—",
    post.category?.name ?? "—",
    post.publishedAt ? formatDate(post.publishedAt) : "Draft",
    <StatusChip key={post.id} label="Draft" className="sc-pend" />,
  ]);

  return (
    <>
      <StatCardRow items={statCards} />
      <AdminPanel title="📈 Platform Activity — Appointments by Weekday" bodyClassName="panel-bd">
        <BarChart data={last7Days} />
      </AdminPanel>
      <GridTwo>
        <PanelTable
          title="🔬 Pending Review Queue"
          actions={<PanelLink href="/admin/review-queue">View all →</PanelLink>}
          headers={["Article", "Author", "Specialty", "Submitted", "Status"]}
          rows={reviewRows}
          loading={draftPostsQuery.isLoading}
          emptyMessage="No articles in review queue"
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
