"use client";

import {
  AdminPanel,
  BarChart,
  PanelTable,
  StatCardRow,
  UserCell,
} from "@/components/admin/ui/AdminPrimitives";
import { formatNumber } from "@/lib/admin-utils";
import { formatDate } from "@/lib/data-mappers";
import { useAdminPayments, usePlatformStats } from "@/services/admin-api-hooks";

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function RevenueAnalyticsPageContent() {
  const paymentsQuery = useAdminPayments({ limit: 100 });
  const statsQuery = usePlatformStats();
  const payments = paymentsQuery.data?.data ?? [];

  const totalCents = payments.reduce((sum, p) => sum + p.amountCents, 0);

  const monthlyMap = new Map<string, number>();
  for (const p of payments) {
    if (!p.confirmedAt) continue;
    const d = new Date(p.confirmedAt);
    const key = d.toLocaleDateString("en-US", { month: "short" });
    monthlyMap.set(key, (monthlyMap.get(key) || 0) + p.amountCents);
  }

  const chartData = Array.from(monthlyMap.entries())
    .slice(-6)
    .map(([label, value]) => ({
      label,
      value: Math.round(value / 100),
      display: formatCents(value),
    }));

  if (chartData.length === 0) {
    ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].forEach((label) => {
      chartData.push({ label, value: 0, display: "$0" });
    });
  }

  const rows = payments.slice(0, 20).map((p) => {
    const doctor = p.bookingDraft?.doctor?.user;
    const patient = p.bookingDraft?.patient?.user;
    return [
      <UserCell
        key={`d-${p.id}`}
        firstName={doctor?.firstName}
        lastName={doctor?.lastName}
        sub="Consultation"
      />,
      doctor ? "Specialist" : "—",
      formatCents(p.amountCents),
      p.confirmedAt ? formatDate(p.confirmedAt) : "—",
      "Paid",
    ];
  });

  return (
    <>
      <StatCardRow
        items={[
          {
            ic: "ic1",
            icon: "💰",
            num: paymentsQuery.isLoading ? "—" : formatCents(totalCents),
            label: "Total Revenue",
            tag: `${payments.length} payments`,
            tagClass: "tt-g",
          },
          {
            ic: "ic2",
            icon: "🩺",
            num: statsQuery.data ? formatNumber(statsQuery.data.appointmentCount ?? 0) : "—",
            label: "Consultations",
            tag: "All time",
            tagClass: "tt-b",
          },
          {
            ic: "ic3",
            icon: "👥",
            num: statsQuery.data ? formatNumber(statsQuery.data.patientCount ?? 0) : "—",
            label: "Active Patients",
            tag: "Platform",
            tagClass: "tt-a",
          },
          {
            ic: "ic4",
            icon: "💳",
            num: paymentsQuery.isLoading ? "—" : formatNumber(payments.length),
            label: "Successful Payments",
            tag: "Live data",
            tagClass: "tt-g",
          },
        ]}
      />
      <AdminPanel title="📈 Revenue — Last 6 Months" bodyClassName="panel-bd">
        <BarChart
          data={chartData}
          barStyle={{ background: "linear-gradient(180deg,var(--green),#10b981)" }}
        />
      </AdminPanel>
      <PanelTable
        title="💸 Recent Payments"
        headers={["Doctor", "Specialty", "Amount", "Period", "Status"]}
        rows={paymentsQuery.isLoading ? [] : rows}
        emptyMessage={paymentsQuery.isLoading ? "Loading..." : "No payment data yet"}
      />
    </>
  );
}
