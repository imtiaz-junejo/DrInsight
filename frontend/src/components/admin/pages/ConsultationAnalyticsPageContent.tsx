"use client";

import { useMemo } from "react";
import {
  AdminPanel,
  GridTwo,
  PanelTable,
  ProgressBar,
  StatCardRow,
} from "@/components/admin/ui/AdminPrimitives";
import { formatNumber } from "@/lib/admin-utils";
import { useAdminAppointments, usePlatformStats } from "@/services/admin-api-hooks";

export function ConsultationAnalyticsPageContent() {
  const appointmentsQuery = useAdminAppointments({ limit: 100 });
  const statsQuery = usePlatformStats();
  const appointments = useMemo(() => appointmentsQuery.data?.data ?? [], [appointmentsQuery.data?.data]);
  const total = appointmentsQuery.data?.meta.total ?? 0;

  const byType = useMemo(() => {
    const counts = { VIDEO: 0, AUDIO: 0, CHAT: 0, IN_PERSON: 0 };
    appointments.forEach((a) => {
      const key = a.consultationType as keyof typeof counts;
      if (key in counts) counts[key] += 1;
    });
    const sum = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return [
      { label: "📹 Video", count: counts.VIDEO, pct: Math.round((counts.VIDEO / sum) * 100) },
      { label: "📞 Phone", count: counts.AUDIO, pct: Math.round((counts.AUDIO / sum) * 100) },
      { label: "💬 Chat", count: counts.CHAT, pct: Math.round((counts.CHAT / sum) * 100) },
    ];
  }, [appointments]);

  const completed = appointments.filter((a) => a.status === "COMPLETED").length;
  const completionRate = appointments.length > 0 ? ((completed / appointments.length) * 100).toFixed(1) : "0";

  const specialtyMap = appointments.reduce<Record<string, number>>((acc, a) => {
    const spec = a.doctor?.specialty ?? "Unknown";
    acc[spec] = (acc[spec] ?? 0) + 1;
    return acc;
  }, {});

  const specialtyRows = Object.entries(specialtyMap).map(([specialty, count]) => [specialty, String(count), "—"]);

  return (
    <>
      <StatCardRow
        items={[
          { ic: "ic1", icon: "📅", num: formatNumber(total), label: "Consultations (30d)", tag: "Live data", tagClass: "tt-g" },
          { ic: "ic2", icon: "✅", num: `${completionRate}%`, label: "Completion Rate", tag: "Current sample", tagClass: "tt-g" },
          { ic: "ic3", icon: "⭐", num: (statsQuery.data?.averageRating ?? 0).toFixed(2), label: "Avg Rating", tag: "Platform stats", tagClass: "tt-g" },
          { ic: "ic4", icon: "⏱️", num: "—", label: "Avg Duration", tag: "No API", tagClass: "tt-b" },
        ]}
      />
      <GridTwo>
        <AdminPanel title="📊 Consultations by Type" bodyClassName="panel-bd">
          {byType.map((item, i) => (
            <div key={item.label} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", marginBottom: 5 }}>
                <span>
                  {item.label} — {item.count} ({item.pct}%)
                </span>
              </div>
              <ProgressBar percent={item.pct} color={["var(--blue)", "var(--teal)", "var(--purple)"][i]} />
            </div>
          ))}
        </AdminPanel>
        <PanelTable
          title="🩺 By Specialty"
          headers={["Specialty", "Consultations", "Avg Rating"]}
          rows={specialtyRows}
          loading={appointmentsQuery.isLoading}
          emptyMessage="No consultation data"
        />
      </GridTwo>
    </>
  );
}
