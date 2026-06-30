"use client";

import {
  AdminPanel,
  BarChart,
  GridTwo,
  PanelTable,
  StatCardRow,
} from "@/components/admin/ui/AdminPrimitives";

// TODO: connect traffic analytics API when backend exists
export function TrafficAnalyticsPageContent() {
  const chartData = [
    { label: "Mon", value: 0, display: "0K" },
    { label: "Tue", value: 0, display: "0K" },
    { label: "Wed", value: 0, display: "0K" },
    { label: "Thu", value: 0, display: "0K" },
    { label: "Fri", value: 0, display: "0K" },
    { label: "Sat", value: 0, display: "0K" },
    { label: "Sun", value: 0, display: "0K" },
  ];

  return (
    <>
      <StatCardRow
        items={[
          { ic: "ic1", icon: "👁️", num: "—", label: "Page Views (30d)", tag: "No API", tagClass: "tt-g" },
          { ic: "ic2", icon: "👥", num: "—", label: "Unique Visitors", tag: "No API", tagClass: "tt-g" },
          { ic: "ic3", icon: "⏱️", num: "—", label: "Avg Session Duration", tag: "No API", tagClass: "tt-g" },
          { ic: "ic4", icon: "📉", num: "—", label: "Bounce Rate", tag: "No API", tagClass: "tt-g" },
        ]}
      />
      <AdminPanel title="📈 Visitors — Last 7 Days" bodyClassName="panel-bd">
        <BarChart data={chartData} />
      </AdminPanel>
      <GridTwo>
        <PanelTable title="🔝 Top Pages" headers={["Page", "Views", "Avg Time", "Bounce Rate"]} rows={[]} emptyMessage="No traffic data — TODO: analytics API" />
        <PanelTable title="🌍 Traffic Sources" headers={["Source", "Visitors", "% of Total"]} rows={[]} emptyMessage="No traffic data — TODO: analytics API" />
      </GridTwo>
    </>
  );
}
