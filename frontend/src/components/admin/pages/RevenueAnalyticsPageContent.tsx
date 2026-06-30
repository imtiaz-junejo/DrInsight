"use client";

import {
  AdminPanel,
  BarChart,
  PanelTable,
  StatCardRow,
} from "@/components/admin/ui/AdminPrimitives";

// TODO: connect revenue/payments analytics API when backend exists
export function RevenueAnalyticsPageContent() {
  const chartData = [
    { label: "Jan", value: 0, display: "$0K" },
    { label: "Feb", value: 0, display: "$0K" },
    { label: "Mar", value: 0, display: "$0K" },
    { label: "Apr", value: 0, display: "$0K" },
    { label: "May", value: 0, display: "$0K" },
    { label: "Jun", value: 0, display: "$0K" },
  ];

  return (
    <>
      <StatCardRow
        items={[
          { ic: "ic1", icon: "💰", num: "—", label: "Revenue (30d)", tag: "No API", tagClass: "tt-g" },
          { ic: "ic2", icon: "🩺", num: "—", label: "From Consultations", tag: "No API", tagClass: "tt-b" },
          { ic: "ic3", icon: "📰", num: "—", label: "Article Honoraria Paid", tag: "No API", tagClass: "tt-a" },
          { ic: "ic4", icon: "💳", num: "—", label: "Platform Fees Collected", tag: "No API", tagClass: "tt-g" },
        ]}
      />
      <AdminPanel title="📈 Revenue — Last 6 Months" bodyClassName="panel-bd">
        <BarChart
          data={chartData}
          barStyle={{ background: "linear-gradient(180deg,var(--green),#10b981)" }}
        />
      </AdminPanel>
      <PanelTable
        title="💸 Pending Doctor Payouts"
        headers={["Doctor", "Specialty", "Amount Due", "Period", "Status"]}
        rows={[]}
        emptyMessage="No payout data — TODO: payments/payout admin API"
      />
    </>
  );
}
