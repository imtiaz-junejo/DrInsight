"use client";

import { DashCard, DashPageHeader, EarningsChart, StatCardRow } from "@/components/doctor/ui/DoctorPrimitives";
import { EARNINGS_CHART } from "@/components/doctor/data/doctor-demo-data";
import { todayFormatted } from "@/lib/doctor-utils";

export function EarningsPageContent() {
  return (
    <>
      <DashPageHeader subtitle="👨‍⚕️ Physician Dashboard" title="Earnings" dateStr={todayFormatted()} />

      <StatCardRow
        items={[
          { ic: "ic2", icon: "💰", num: "$3,240", label: "This Month", tag: "↑ 18%", tagClass: "tt-g", bgIcon: "💰" },
          { ic: "ic1", icon: "📈", num: "$38,120", label: "This Year", tag: "On track", tagClass: "tt-b", bgIcon: "📈" },
          { ic: "ic3", icon: "⏳", num: "$840", label: "Pending", tag: "Processing", tagClass: "tt-a", bgIcon: "⏳" },
          { ic: "ic2", icon: "📅", num: "142", label: "Total Consultations", tag: "This year", tagClass: "tt-g", bgIcon: "📅" },
        ]}
      />

      <DashCard title="💰 Monthly Earnings (2026)">
        <EarningsChart data={EARNINGS_CHART} height={120} />
      </DashCard>
    </>
  );
}
