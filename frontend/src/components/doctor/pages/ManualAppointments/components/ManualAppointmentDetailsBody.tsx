import { formatDate } from "@/lib/data-mappers";
import type { DoctorAppointmentDetail } from "@/services/doctor-api-hooks";
import {
  apptTime,
  auditStamp,
  buildMaAuditEntries,
  isRegisteredPatient,
  maDemographicsLine,
  patientName,
  sourceLabel,
} from "../utils";

export function ManualAppointmentDetailsBody({
  appt,
  clinicLabel,
  doctorName,
  loading,
}: {
  appt: DoctorAppointmentDetail;
  clinicLabel: string;
  doctorName: string;
  loading: boolean;
}) {
  const registered = isRegisteredPatient(appt);
  const auditEntries = buildMaAuditEntries(appt, doctorName);
  const demographics = maDemographicsLine(appt);

  return (
    <>
      <p>
        <b>{patientName(appt)}</b>{" "}
        {registered ? (
          <span className="cons-chip cc-done">✓ Registered</span>
        ) : (
          <span className="cons-chip cc-pending">No account</span>
        )}
      </p>
      {demographics ? <p className="cons-sub">{demographics}</p> : null}
      <p className="cons-sub">
        📅 {formatDate(appt.scheduledAt)} · ⏰ {apptTime(appt)} · 🏥 {clinicLabel} · Source:{" "}
        {sourceLabel(appt.bookingSource)}
      </p>
      <p className="cons-sub">
        📋 <b>Reason:</b> {appt.reason ?? "Manual booking"}
        {appt.notes ? (
          <>
            <br />
            🗒️ <b>Notes:</b> {appt.notes}
          </>
        ) : null}
        {appt.cancelReason ? (
          <>
            <br />
            ❌ <b>Cancelled:</b> {appt.cancelReason}
          </>
        ) : null}
      </p>
      <div style={{ marginTop: 12 }}>
        <label>Audit Log</label>
        <div className="cons-note-list">
          {loading && auditEntries.length === 0 ? (
            <div className="cons-note-item">Loading audit log...</div>
          ) : auditEntries.length === 0 ? (
            <div className="cons-note-item">No audit entries yet.</div>
          ) : (
            auditEntries.map((entry, i) => (
              <div key={`${entry.at}-${i}`} className="cons-note-item">
                {entry.action}
                <span className="cons-note-time">
                  {auditStamp(entry.at)} — {entry.who}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
