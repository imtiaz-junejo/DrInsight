"use client";

import { useState } from "react";
import { AnalyticsRangeToolbar } from "@/components/admin/analytics/AnalyticsRangeToolbar";
import {
  AdminPanel,
  BarChart,
  GridTwo,
  PanelTable,
  StatCardRow,
} from "@/components/admin/ui/AdminPrimitives";
import { exportTableCsv, type AnalyticsRangeParams } from "@/lib/analytics-range";
import { formatNumber } from "@/lib/admin-utils";
import { useTrafficAnalytics } from "@/services/analytics-api-hooks";

export function TrafficAnalyticsPageContent() {
  const [rangeParams, setRangeParams] = useState<AnalyticsRangeParams>({ range: "month" });
  const analyticsQuery = useTrafficAnalytics(rangeParams);
  const data = analyticsQuery.data;
  const stats = data?.stats;
  const loading = analyticsQuery.isLoading;

  const topPageRows = data?.topPages ?? [];
  const sourceRows = (data?.trafficSources ?? []).map((source) => [
    source.source,
    formatNumber(source.visitors),
    `${source.pct}%`,
  ]);

  const handleExport = () => {
    exportTableCsv(
      "traffic-top-pages.csv",
      ["Page", "Views", "Avg Time", "Bounce Rate"],
      topPageRows,
    );
  };

  return (
    <>
      <AnalyticsRangeToolbar value={rangeParams} onChange={setRangeParams} onExport={handleExport} />
      <StatCardRow
        items={[
          {
            ic: "ic1",
            icon: "👁️",
            num: loading ? "—" : formatNumber(stats?.pageViews30d ?? 0),
            label: "Page Views",
            tag: loading ? "..." : (stats?.pageViewsTag ?? "—"),
            tagClass: stats?.pageViewsTagClass ?? "tt-b",
          },
          {
            ic: "ic2",
            icon: "👥",
            num: loading ? "—" : formatNumber(stats?.uniqueVisitors ?? 0),
            label: "Unique Visitors",
            tag: loading ? "..." : (stats?.visitorsTag ?? "—"),
            tagClass: stats?.visitorsTagClass ?? "tt-b",
          },
          {
            ic: "ic3",
            icon: "⏱️",
            num: loading ? "—" : (stats?.avgSessionDuration ?? "—"),
            label: "Avg Session Duration",
            tag: loading ? "..." : (stats?.durationTag ?? "—"),
            tagClass: stats?.durationTagClass ?? "tt-b",
          },
          {
            ic: "ic4",
            icon: "📉",
            num: loading ? "—" : (stats?.bounceRate ?? "—"),
            label: "Bounce Rate",
            tag: loading ? "..." : (stats?.bounceTag ?? "—"),
            tagClass: stats?.bounceTagClass ?? "tt-b",
          },
        ]}
      />
      <AdminPanel title="📈 Visitors — Last 7 Days" bodyClassName="panel-bd">
        {loading ? (
          <p style={{ color: "var(--gray-500)" }}>Loading chart...</p>
        ) : (
          <BarChart data={data?.visitorsByDay ?? []} />
        )}
      </AdminPanel>
      <GridTwo>
        <PanelTable
          title="🔝 Top Pages"
          headers={["Page", "Views", "Avg Time", "Bounce Rate"]}
          rows={topPageRows}
          loading={loading}
          emptyMessage="No traffic data yet"
        />
        <PanelTable
          title="🌍 Traffic Sources"
          headers={["Source", "Visitors", "% of Total"]}
          rows={sourceRows}
          loading={loading}
          emptyMessage="No traffic data yet"
        />
      </GridTwo>
    </>
  );
}
