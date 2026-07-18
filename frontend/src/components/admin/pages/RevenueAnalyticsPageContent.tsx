"use client";

import { useMemo, useState } from "react";
import { AnalyticsRangeToolbar } from "@/components/admin/analytics/AnalyticsRangeToolbar";
import {
  AdminPanel,
  BarChart,
  PanelTable,
  StatCardRow,
  StatusChip,
} from "@/components/admin/ui/AdminPrimitives";
import { exportTableCsv, type AnalyticsRangeParams } from "@/lib/analytics-range";
import { formatCurrency, formatNumber } from "@/lib/admin-utils";
import { useRevenueAnalytics } from "@/services/analytics-api-hooks";

export function RevenueAnalyticsPageContent() {
  const [rangeParams, setRangeParams] = useState<AnalyticsRangeParams>({ range: "month" });
  const analyticsQuery = useRevenueAnalytics(rangeParams);
  const data = analyticsQuery.data;
  const stats = data?.stats;
  const loading = analyticsQuery.isLoading;

  const chartData = useMemo(() => {
    const monthly = data?.monthlyRevenue ?? [];
    return monthly.map((item) => ({
      label: item.month,
      value: Math.round(item.amountCents / 100),
      display: formatCurrency(item.amountCents),
    }));
  }, [data?.monthlyRevenue]);

  const payoutRows = useMemo(
    () =>
      (data?.pendingPayouts ?? []).map((p) => [
        p.doctorName,
        p.specialty,
        formatCurrency(p.amountCents),
        p.period,
        <StatusChip key={p.doctorName + p.period} label={p.status} className={p.status === "Paid" ? "ch-g" : "ch-a"} />,
      ]),
    [data?.pendingPayouts],
  );

  const handleExport = () => {
    exportTableCsv(
      "doctor-payouts.csv",
      ["Doctor", "Specialty", "Amount Due", "Period", "Status"],
      (data?.pendingPayouts ?? []).map((p) => [
        p.doctorName,
        p.specialty,
        formatCurrency(p.amountCents),
        p.period,
        p.status,
      ]),
    );
  };

  return (
    <>
      <AnalyticsRangeToolbar value={rangeParams} onChange={setRangeParams} onExport={handleExport} />
      <StatCardRow
        items={[
          {
            ic: "ic1",
            icon: "💰",
            num: loading ? "—" : formatCurrency(data?.totalRevenueCents ?? 0),
            label: "Revenue",
            tag: loading ? "..." : (stats?.revenueTag ?? "—"),
            tagClass: stats?.revenueTagClass ?? "tt-b",
          },
          {
            ic: "ic2",
            icon: "🩺",
            num: loading ? "—" : formatCurrency(data?.consultationRevenueCents ?? 0),
            label: "From Consultations",
            tag: loading ? "..." : (stats?.consultationShare ?? "—"),
            tagClass: "tt-b",
          },
          {
            ic: "ic3",
            icon: "💳",
            num: loading ? "—" : formatNumber(data?.succeededPayments ?? 0),
            label: "Successful Payments",
            tag: loading ? "..." : `${data?.successRate ?? 0}% success`,
            tagClass: "tt-g",
          },
          {
            ic: "ic4",
            icon: "🏦",
            num: loading ? "—" : formatCurrency(data?.platformFeesCents ?? 0),
            label: "Platform Fees Collected",
            tag: loading ? "..." : (stats?.platformShare ?? "—"),
            tagClass: "tt-g",
          },
        ]}
      />
      <AdminPanel title="📈 Revenue — Last 6 Months" bodyClassName="panel-bd">
        {loading ? (
          <p style={{ color: "var(--gray-500)" }}>Loading chart...</p>
        ) : chartData.length === 0 ? (
          <p style={{ color: "var(--gray-500)" }}>No revenue data for this period</p>
        ) : (
          <BarChart
            data={chartData.slice(-6)}
            barStyle={{ background: "linear-gradient(180deg,var(--green),#10b981)" }}
          />
        )}
      </AdminPanel>
      <PanelTable
        title="💸 Doctor Payouts"
        headers={["Doctor", "Specialty", "Amount Due", "Period", "Status"]}
        rows={loading ? [] : payoutRows}
        loading={loading}
        emptyMessage="No payout data for this period"
      />
    </>
  );
}
