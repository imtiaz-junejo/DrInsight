"use client";

import Link from "next/link";
import { EXTENDED_VITALS, HEALTH_TOOL_HISTORY } from "@/components/patient/data/patient-demo-data";
import { VitalsGrid } from "@/components/patient/ui/PatientShared";
import { DashButton, DashCard, DashPageHeader } from "@/components/patient/ui/PatientPrimitives";
import { todayFormatted } from "@/lib/patient-utils";
import { usePatientUiStore } from "@/store/patient-ui.store";

export function HealthPageContent() {
  const showToast = usePatientUiStore((s) => s.showToast);

  return (
    <>
      <DashPageHeader
        subtitle="🏥 Patient Dashboard"
        title="Health Metrics"
        dateStr={todayFormatted()}
        actions={<DashButton variant="solid" onClick={() => showToast("Opening log form...")}>+ Log Reading</DashButton>}
      />

      <DashCard
        title="❤️ Current Vitals"
        headerExtra={<span style={{ fontSize: "0.76rem", color: "var(--gray-400)" }}>Last recorded: May 28, 2026</span>}
      >
        <VitalsGrid vitals={EXTENDED_VITALS} columns={3} />
      </DashCard>

      <DashCard title="📋 Health Tool History" actions={<Link href="/health-tools" className="card-action">Run New Tool →</Link>}>
        <div style={{ overflowX: "auto" }}>
          <table className="pt-table">
            <thead>
              <tr>
                <th>Tool</th>
                <th>Result</th>
                <th>Date</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {HEALTH_TOOL_HISTORY.map((row) => (
                <tr key={row.tool}>
                  <td>{row.tool}</td>
                  <td>
                    <span className={`st-chip ${row.resultClass}`}>{row.result}</span>
                  </td>
                  <td>{row.date}</td>
                  <td>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashCard>
    </>
  );
}
