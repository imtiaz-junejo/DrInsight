"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { AdminPanel, StatusChip } from "@/components/admin/ui/AdminPrimitives";
import { appointmentStatusChip, formatDateTime } from "@/lib/admin-utils";
import { adminAppointmentDetailHref } from "@/lib/admin-routes";
import { useAdminPatientContent } from "@/services/admin-api-hooks";

function ContentTable<T extends { id: string }>({
  headers,
  rows,
  loading,
  empty,
  renderRow,
}: {
  headers: string[];
  rows: T[];
  loading?: boolean;
  empty: string;
  renderRow: (item: T) => ReactNode[];
}) {
  if (loading) return <p style={{ fontSize: ".82rem", color: "var(--gray-400)" }}>Loading...</p>;
  if (!rows.length) return <p style={{ fontSize: ".82rem", color: "var(--gray-400)" }}>{empty}</p>;
  return (
    <div className="tbl-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id}>{renderRow(item).map((cell, index) => <td key={index}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminPatientContentPanel({ patientId, patientName }: { patientId: string; patientName: string }) {
  const contentQuery = useAdminPatientContent(patientId);
  const appointments = contentQuery.data?.appointments ?? [];
  const prescriptions = contentQuery.data?.prescriptions ?? [];
  const questions = contentQuery.data?.questions ?? [];

  return (
    <AdminPanel title={`📋 ${patientName} — Activity & Records`}>
      <div className="prw-note" style={{ marginBottom: 12 }}>
        Read-only history loaded from appointments, prescriptions, and Q&amp;A for this patient.
      </div>

      <SectionTitle icon="📅" label="Appointment History" count={appointments.length} />
      <ContentTable
        headers={["Doctor", "Type", "Date & Time", "Status", "Actions"]}
        rows={appointments}
        loading={contentQuery.isLoading}
        empty="No appointments yet."
        renderRow={(item) => {
          const status = appointmentStatusChip(item.status);
          return [
            <div key={`${item.id}-d`}>
              <strong>{item.doctorName ?? "—"}</strong>
              <div className="cell-sub">{item.doctorSpecialty ?? "—"}</div>
            </div>,
            item.consultationType,
            formatDateTime(item.scheduledAt),
            <StatusChip key={`${item.id}-s`} label={status.label} className={status.className} />,
            <Link key={`${item.id}-a`} href={adminAppointmentDetailHref(item.id)} className="btn">
              Details
            </Link>,
          ];
        }}
      />

      <SectionTitle icon="💊" label="Prescriptions" count={prescriptions.length} />
      <ContentTable
        headers={["Diagnosis", "Prescriber", "Issued", "Status"]}
        rows={prescriptions}
        loading={contentQuery.isLoading}
        empty="No prescriptions yet."
        renderRow={(item) => [
          <strong key={`${item.id}-d`}>{item.diagnosis ?? item.prescriptionNumber ?? "—"}</strong>,
          item.doctorName ?? "—",
          item.date ? formatDateTime(item.date) : "—",
          <StatusChip key={`${item.id}-s`} label={item.status} className="ch-b" />,
        ]}
      />

      <SectionTitle icon="❓" label="Questions Asked" count={questions.length} />
      <ContentTable
        headers={["Question", "Category", "Submitted", "Status"]}
        rows={questions}
        loading={contentQuery.isLoading}
        empty="No questions asked yet."
        renderRow={(item) => [
          <span key={`${item.id}-t`} style={{ fontWeight: 600, fontSize: ".84rem" }}>
            {item.title}
          </span>,
          item.category ?? "—",
          formatDateTime(item.date),
          <StatusChip key={`${item.id}-s`} label={item.status} className="ch-a" />,
        ]}
      />

    </AdminPanel>
  );
}

function SectionTitle({ icon, label, count }: { icon: string; label: string; count: number }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-d)",
        fontSize: ".98rem",
        fontWeight: 700,
        color: "var(--gray-900)",
        margin: "18px 0 8px",
      }}
    >
      {icon} {label}{" "}
      <span style={{ fontSize: ".74rem", fontWeight: 500, color: "var(--gray-400)" }}>({count})</span>
    </div>
  );
}
