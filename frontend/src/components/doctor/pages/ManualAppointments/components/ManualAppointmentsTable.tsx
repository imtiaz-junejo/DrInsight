import {
  BadgeCheck,
  CircleX,
  DoctorIconInline,
  Eye,
  FileText,
  Pencil,
  X,
} from "@/components/doctor/icons/DoctorIcons";
import { DashCard } from "@/components/doctor/ui/DoctorPrimitives";
import { formatDate } from "@/lib/data-mappers";
import type { Appointment } from "@/services/api-hooks.types";
import type { ModalState } from "../types";
import { apptTime, patientName, sourceLabel } from "../utils";
import { MaStatusChip } from "./MaStatusChip";

export function ManualAppointmentsTable({
  counts,
  listLoading,
  list,
  updateStatusPending,
  openEdit,
  doComplete,
  setModal,
}: {
  counts: { confirmed: number; completed: number; cancelled: number; today: number };
  listLoading: boolean;
  list: Appointment[];
  updateStatusPending: boolean;
  openEdit: (appt: Appointment) => void;
  doComplete: (appt: Appointment) => void;
  setModal: (modal: ModalState) => void;
}) {
  return (
    <DashCard
      title={
        <DoctorIconInline icon={FileText} size="button">
          Manual Appointments{" "}
          <span style={{ fontWeight: 500, fontSize: ".72rem", color: "var(--gray-400)" }}>
            — {counts.confirmed} confirmed · {counts.today} today · {counts.completed} completed · {counts.cancelled}{" "}
            cancelled
          </span>
        </DoctorIconInline>
      }
    >
      <div className="pt-table-wrap">
        <table className="pt-table pt-table-manual">
          <colgroup>
            <col className="ma-col-id" />
            <col className="ma-col-patient" />
            <col className="ma-col-mobile" />
            <col className="ma-col-datetime" />
            <col className="ma-col-reason" />
            <col className="ma-col-status" />
            <col className="ma-col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Mobile</th>
              <th>Date &amp; Time</th>
              <th>Reason / Notes</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {listLoading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>
                  Loading...
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>
                  No manual appointments yet — use the form above to add one.
                </td>
              </tr>
            ) : (
              list.map((appt) => (
                <tr key={appt.id}>
                  <td className="ma-cell-id">
                    <strong>MA-{appt.id.slice(-4).toUpperCase()}</strong>
                    <div style={{ fontSize: ".7rem", color: "var(--gray-400)" }}>{sourceLabel(appt.bookingSource)}</div>
                  </td>
                  <td className="ma-cell-patient">
                    <strong>{patientName(appt)}</strong>
                    <div className="ma-cell-patient-meta">
                      <span className="cons-chip cc-done" style={{ fontSize: ".6rem", padding: "2px 7px" }}>
                        Registered
                      </span>
                      {appt.patient?.gender ? (
                        <span style={{ fontSize: ".7rem", color: "var(--gray-400)" }}>{appt.patient.gender}</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="ma-cell-mobile">{appt.patient?.user?.phone ?? "—"}</td>
                  <td className="ma-cell-datetime">
                    {formatDate(appt.scheduledAt)}
                    <div style={{ fontSize: ".7rem", color: "var(--gray-400)" }}>{apptTime(appt)}</div>
                  </td>
                  <td className="ma-cell-reason">
                    {appt.reason ?? "Manual booking"}
                    {appt.notes ? (
                      <div style={{ fontSize: ".7rem", color: "var(--gray-400)" }}>{appt.notes}</div>
                    ) : null}
                    {appt.cancelReason ? (
                      <div style={{ fontSize: ".7rem", color: "var(--gray-400)" }}>
                        <DoctorIconInline icon={CircleX} size="sm">
                          {appt.cancelReason}
                        </DoctorIconInline>
                      </div>
                    ) : null}
                  </td>
                  <td className="ma-cell-status">
                    <MaStatusChip appt={appt} />
                  </td>
                  <td className="ma-cell-actions">
                    <div className="pt-actions">
                      {appt.status === "CONFIRMED" ? (
                        <>
                          <button type="button" className="pt-act-btn" onClick={() => openEdit(appt)}>
                            <DoctorIconInline icon={Pencil} size="sm">
                              Edit / Reschedule
                            </DoctorIconInline>
                          </button>
                          <button
                            type="button"
                            className="pt-act-btn pt-act-btn-success"
                            disabled={updateStatusPending}
                            onClick={() => doComplete(appt)}
                          >
                            <DoctorIconInline icon={BadgeCheck} size="sm">
                              Complete
                            </DoctorIconInline>
                          </button>
                          <button
                            type="button"
                            className="pt-act-btn pt-act-btn-critical"
                            onClick={() => setModal({ kind: "cancel", appt })}
                          >
                            <DoctorIconInline icon={X} size="sm">
                              Cancel
                            </DoctorIconInline>
                          </button>
                          <button
                            type="button"
                            className="pt-act-btn pt-act-btn-neutral"
                            onClick={() => setModal({ kind: "details", appt })}
                          >
                            <DoctorIconInline icon={Eye} size="sm">
                              Details
                            </DoctorIconInline>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="pt-act-btn pt-act-btn-neutral"
                          onClick={() => setModal({ kind: "details", appt })}
                        >
                          <DoctorIconInline icon={Eye} size="sm">
                            Details
                          </DoctorIconInline>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DashCard>
  );
}
