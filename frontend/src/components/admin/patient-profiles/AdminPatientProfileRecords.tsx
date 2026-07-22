"use client";

import Link from "next/link";
import { StatusChip } from "@/components/admin/ui/AdminPrimitives";
import { formatDate } from "@/lib/data-mappers";
import {
  appointmentStatusChip,
  consultationTypeIcon,
  formatAdminAppointmentDateTime,
  formatRelativeTime,
  prescriptionStatusChip,
  questionStatusChip,
} from "@/lib/admin-utils";
import { useAdminPatientContent } from "@/services/admin-api-hooks";

const PREVIEW_LIMIT = 5;

function SectionPanel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="panel admin-profile-record-panel">
      <div className="panel-hd">
        <h3>{title}</h3>
        {action}
      </div>
      <div className="panel-bd admin-profile-record-bd">{children}</div>
    </div>
  );
}

function EmptyNote({ message }: { message: string }) {
  return <p className="admin-profile-record-empty">{message}</p>;
}

export function AdminPatientProfileRecords({ patientId }: { patientId: string }) {
  const contentQuery = useAdminPatientContent(patientId);
  const appointments = contentQuery.data?.appointments ?? [];
  const prescriptions = contentQuery.data?.prescriptions ?? [];
  const questions = contentQuery.data?.questions ?? [];
  const bookmarks = contentQuery.data?.bookmarks ?? [];

  if (contentQuery.isLoading) {
    return <div className="admin-profile-records">Loading activity records...</div>;
  }

  return (
    <div className="admin-profile-records">
      <SectionPanel
        title="📅 Appointment History"
        action={
          <Link href="/admin/appointments" className="btn">
            View All
          </Link>
        }
      >
        {appointments.length ? (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Type</th>
                  <th>Date &amp; Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, PREVIEW_LIMIT).map((item) => {
                  const status = appointmentStatusChip(item.status);
                  return (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.doctorName ?? "—"}</strong>
                        <div className="cell-sub">{item.doctorSpecialty ?? "—"}</div>
                      </td>
                      <td>{consultationTypeIcon(item.consultationType)}</td>
                      <td>{formatAdminAppointmentDateTime(item.scheduledAt)}</td>
                      <td>
                        <StatusChip label={status.label} className={status.className} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyNote message="No appointments yet." />
        )}
      </SectionPanel>

      <SectionPanel
        title="💊 Prescriptions"
        action={
          <Link href="/admin/prescriptions" className="btn">
            View All
          </Link>
        }
      >
        {prescriptions.length ? (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Prescriber</th>
                  <th>Issued</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.slice(0, PREVIEW_LIMIT).map((item) => {
                  const status = prescriptionStatusChip(item.status);
                  return (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.medication ?? item.diagnosis ?? item.prescriptionNumber ?? "—"}</strong>
                      </td>
                      <td>{item.dosage ?? "—"}</td>
                      <td>{item.doctorName ?? "—"}</td>
                      <td>{item.date ? formatDate(item.date) : "—"}</td>
                      <td>
                        <StatusChip label={status.label} className={status.className} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyNote message="No prescriptions yet." />
        )}
      </SectionPanel>

      <SectionPanel title="❓ Questions Asked">
        {questions.length ? (
          <div className="admin-profile-question-list">
            {questions.slice(0, PREVIEW_LIMIT).map((item) => {
              const status = questionStatusChip(item.status);
              return (
                <div className="admin-profile-question-item" key={item.id}>
                  <div className="admin-profile-question-title">{item.title}</div>
                  <div className="admin-profile-question-meta">
                    <span>{item.date ? formatDate(item.date) : "—"}</span>
                    <StatusChip label={status.label} className={status.className} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyNote message="No questions asked yet." />
        )}
      </SectionPanel>

      <SectionPanel title="🔖 Saved & Read Articles">
        {bookmarks.length ? (
          <div className="admin-profile-bookmark-list">
            {bookmarks.slice(0, PREVIEW_LIMIT).map((item) => (
              <div className="admin-profile-bookmark-item" key={item.id}>
                <div>
                  <div className="admin-profile-bookmark-title">{item.title}</div>
                  <div className="admin-profile-bookmark-category">{item.category ?? "Article"}</div>
                </div>
                <span className="admin-profile-bookmark-date">{formatRelativeTime(item.date)}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyNote message="No saved articles yet." />
        )}
      </SectionPanel>
    </div>
  );
}
