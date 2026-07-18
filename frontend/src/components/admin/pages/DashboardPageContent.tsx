"use client";

import Link from "next/link";
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
import { adminUserProfileHref } from "@/lib/admin-routes";import {
  formatNumber,
  formatRelativeTime,
  userRoleChip,
} from "@/lib/admin-utils";
import {
  useAdminAppointments,
  useAdminBlogPosts,
  useAdminPayments,
  useAdminUsers,
  usePlatformStats,
} from "@/services/admin-api-hooks";

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatGrowthPercent(value?: number): string {
  if (value == null) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value}%`;
}

export function DashboardPageContent() {
  const statsQuery = usePlatformStats();
  const appointmentsQuery = useAdminAppointments({ limit: 100 });
  const recentUsersQuery = useAdminUsers({ limit: 5 });
  const paymentsQuery = useAdminPayments({ limit: 100 });
  const draftPostsQuery = useAdminBlogPosts({ limit: 10, status: "DRAFT" });

  const stats = statsQuery.data;
  const totalUsers = stats?.userCount ?? (stats?.patientCount ?? 0) + (stats?.doctorCount ?? 0) + (stats?.adminCount ?? 0);
  const appointments = appointmentsQuery.data?.data ?? [];
  const recentUsers = recentUsersQuery.data?.data ?? [];
  const draftPosts = draftPostsQuery.data?.data ?? [];
  const paymentList = paymentsQuery.data?.data ?? [];
  const revenueCents = stats?.revenueLast30DaysCents ?? paymentList.reduce((sum, p) => sum + p.amountCents, 0);

  const last7Days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
    const dayIndex = index === 6 ? 0 : index + 1;
    const dayAppointments = appointments.filter((a) => new Date(a.scheduledAt).getDay() === dayIndex);
    return { label: day, value: dayAppointments.length };
  });

  const statCards = [
    {
      ic: "ic1",
      icon: "👥",
      num: statsQuery.isLoading ? "—" : formatNumber(totalUsers),
      label: "Total Users",
      tag: statsQuery.isLoading ? "—" : `+${formatNumber(stats?.usersThisWeek ?? 0)} this week`,
      tagClass: "tt-g",
    },
    {
      ic: "ic2",
      icon: "👨‍⚕️",
      num: statsQuery.isLoading ? "—" : formatNumber(stats?.verifiedDoctorCount ?? stats?.doctorCount ?? 0),
      label: "Verified Doctors",
      tag: statsQuery.isLoading ? "—" : `+${formatNumber(stats?.pendingDoctors ?? 0)} pending`,
      tagClass: "tt-a",
    },
    {
      ic: "ic3",
      icon: "📅",
      num: statsQuery.isLoading
        ? "—"
        : formatNumber(stats?.appointmentsLast30Days ?? appointmentsQuery.data?.meta.total ?? 0),
      label: "Consultations (30d)",
      tag: statsQuery.isLoading ? "—" : formatGrowthPercent(stats?.appointmentsGrowthPercent),
      tagClass: "tt-g",
    },
    {
      ic: "ic4",
      icon: "💰",
      num: statsQuery.isLoading && paymentsQuery.isLoading ? "—" : formatCents(revenueCents),
      label: "Revenue (30d)",
      tag: statsQuery.isLoading ? "—" : formatGrowthPercent(stats?.revenueGrowthPercent),
      tagClass: "tt-g",
    },
  ];

  const recentUserRows = recentUsers.slice(0, 5).map((user) => {
    const role = userRoleChip(user.role, user.status);
    return [
      <UserCell
        key={user.id}
        firstName={user.firstName}
        lastName={user.lastName}
        sub={user.email}
        seed={user.id}
        userId={user.id}
      />,
      <StatusChip key={`${user.id}-role`} label={role.label} className={role.className} />,
      formatRelativeTime(user.createdAt),
    ];
  });

  const reviewRows = draftPosts.slice(0, 5).map((post) => [
    post.title,
    post.author?.id ? (
      <Link key={`${post.id}-author`} href={adminUserProfileHref(post.author.id)} className="cell-user-link">
        {post.author.firstName} {post.author.lastName}
      </Link>
    ) : (
      "—"
    ),
    post.specialty ?? post.category?.name ?? "—",
    post.createdAt ? formatRelativeTime(post.createdAt) : "—",
    <StatusChip key={post.id} label="Pending Review" className="ch-a" />,
  ]);

  return (
    <>
      <StatCardRow items={statCards} />
      <AdminPanel title="📈 Platform Activity — Last 7 Days" bodyClassName="panel-bd">
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
          loading={recentUsersQuery.isLoading}
          emptyMessage="No recently registered users"
        />
      </GridTwo>
    </>
  );
}
