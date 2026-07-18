"use client";

import { useState } from "react";
import { AnalyticsRangeToolbar } from "@/components/admin/analytics/AnalyticsRangeToolbar";
import {
  AdminPanel,
  GridTwo,
  PanelTable,
  ProgressBar,
  StatCardRow,
} from "@/components/admin/ui/AdminPrimitives";
import { exportTableCsv, type AnalyticsRangeParams } from "@/lib/analytics-range";
import { formatNumber } from "@/lib/admin-utils";
import { useConsultationAnalytics } from "@/services/analytics-api-hooks";

export function ConsultationAnalyticsPageContent() {
  const [rangeParams, setRangeParams] = useState<AnalyticsRangeParams>({ range: "month" });
  const analyticsQuery = useConsultationAnalytics(rangeParams);
  const data = analyticsQuery.data;
  const stats = data?.stats;
  const loading = analyticsQuery.isLoading;

  const byType = data?.consultationsByType ?? [];
  const specialtyRows = (data?.bySpecialty ?? []).map((row) => [
    row.specialty,
    String(row.consultations),
    row.avgRating,
  ]);

  const handleExport = () => {
    exportTableCsv(
      "consultations-by-specialty.csv",
      ["Specialty", "Consultations", "Avg Rating"],
      specialtyRows.map((row) => row.map(String)),
    );
  };

  return (
    <>
      <AnalyticsRangeToolbar value={rangeParams} onChange={setRangeParams} onExport={handleExport} />
      <StatCardRow
        items={[
          {
            ic: "ic1",
            icon: "📅",
            num: loading ? "—" : formatNumber(stats?.consultations ?? 0),
            label: "Consultations",
            tag: loading ? "..." : (stats?.consultationsTag ?? "—"),
            tagClass: stats?.consultationsTagClass ?? "tt-b",
          },
          {
            ic: "ic2",
            icon: "✅",
            num: loading ? "—" : `${stats?.completionRate ?? 0}%`,
            label: "Completion Rate",
            tag: loading ? "..." : (stats?.completionTag ?? "—"),
            tagClass: stats?.completionTagClass ?? "tt-b",
          },
          {
            ic: "ic3",
            icon: "⭐",
            num: loading ? "—" : (stats?.avgRating ?? 0).toFixed(2),
            label: "Avg Rating",
            tag: loading ? "..." : (stats?.ratingTag ?? "—"),
            tagClass: stats?.ratingTagClass ?? "tt-b",
          },
          {
            ic: "ic4",
            icon: "⏱️",
            num: loading ? "—" : `${stats?.avgDuration ?? 0} min`,
            label: "Avg Duration",
            tag: loading ? "..." : (stats?.durationTag ?? "—"),
            tagClass: stats?.durationTagClass ?? "tt-b",
          },
        ]}
      />
      <GridTwo>
        <AdminPanel title="📊 Consultations by Type" bodyClassName="panel-bd">
          {loading ? (
            <p style={{ color: "var(--gray-500)" }}>Loading...</p>
          ) : byType.length === 0 ? (
            <p style={{ color: "var(--gray-500)" }}>No consultation data for this period</p>
          ) : (
            byType.map((item, i) => (
              <div key={item.label} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", marginBottom: 5 }}>
                  <span>
                    {item.label} — {item.count} ({item.pct}%)
                  </span>
                </div>
                <ProgressBar percent={item.pct} color={["var(--blue)", "var(--teal)", "var(--purple)"][i % 3]} />
              </div>
            ))
          )}
        </AdminPanel>
        <PanelTable
          title="🩺 By Specialty"
          headers={["Specialty", "Consultations", "Avg Rating"]}
          rows={specialtyRows}
          loading={loading}
          emptyMessage="No consultation data"
        />
      </GridTwo>
    </>
  );
}
