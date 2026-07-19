"use client";

import { useMemo } from "react";
import {
  Calendar,
  Clock3,
  DoctorIcon,
  DoctorIconInline,
  PhysicianDashboardLabel,
  Wallet,
} from "@/components/doctor/icons/DoctorIcons";
import { DashCard, DashPageHeader, EarningsChart, StatCardRow } from "@/components/doctor/ui/DoctorPrimitives";
import { earningsToChartData, formatCurrency } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/doctor-utils";
import { useDoctorEarnings } from "@/services/doctor-api-hooks";

function EmptyState({ loading, message }: { loading?: boolean; message: string }) {
  return (
    <div style={{ padding: "24px 0", textAlign: "center", color: "var(--gray-400)", fontSize: "0.84rem" }}>
      {loading ? "Loading..." : message}
    </div>
  );
}

export function EarningsPageContent() {
  const earningsQuery = useDoctorEarnings();
  const earnings = earningsQuery.data;
  const monthly = earnings?.monthly ?? [];
  const chartData = useMemo(() => earningsToChartData(monthly), [monthly]);
  const thisMonthCents = monthly.length ? monthly[monthly.length - 1].amountCents : 0;
  const yearCents = earnings?.totalCents ?? 0;

  return (
    <>
      <DashPageHeader subtitle={<PhysicianDashboardLabel />} title="Earnings" dateStr={todayFormatted()} />

      <StatCardRow
        items={[
          {
            ic: "ic2",
            icon: <DoctorIcon icon={Wallet} size="stat" />,
            num: earningsQuery.isLoading ? "—" : formatCurrency(thisMonthCents / 100),
            label: "This Month",
            tag: earningsQuery.isLoading ? "Loading" : `${monthly.length ? "Latest period" : "No data"}`,
            tagClass: "tt-g",
            bgIcon: <DoctorIcon icon={Wallet} size="stat" />,
          },
          {
            ic: "ic1",
            icon: <DoctorIcon icon={Wallet} size="stat" />,
            num: earningsQuery.isLoading ? "—" : formatCurrency(yearCents / 100),
            label: "Total Earned",
            tag: earningsQuery.isLoading ? "Loading" : "All time",
            tagClass: "tt-b",
            bgIcon: <DoctorIcon icon={Wallet} size="stat" />,
          },
          {
            ic: "ic3",
            icon: <DoctorIcon icon={Clock3} size="stat" />,
            num: earningsQuery.isLoading ? "—" : formatCurrency(0),
            label: "Pending",
            tag: "Processing",
            tagClass: "tt-a",
            bgIcon: <DoctorIcon icon={Clock3} size="stat" />,
          },
          {
            ic: "ic2",
            icon: <DoctorIcon icon={Calendar} size="stat" />,
            num: earningsQuery.isLoading ? "—" : String(earnings?.paymentCount ?? 0),
            label: "Total Consultations",
            tag: "Paid",
            tagClass: "tt-g",
            bgIcon: <DoctorIcon icon={Calendar} size="stat" />,
          },
        ]}
      />

      <DashCard title={<DoctorIconInline icon={Wallet} size="button">Monthly Earnings</DoctorIconInline>}>
        {earningsQuery.isLoading ? (
          <EmptyState loading message="" />
        ) : chartData.length === 0 ? (
          <EmptyState message="No earnings data yet" />
        ) : (
          <EarningsChart data={chartData} height={120} />
        )}
      </DashCard>
    </>
  );
}
