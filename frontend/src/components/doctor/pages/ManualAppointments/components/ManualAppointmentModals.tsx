import {
  AlertTriangle,
  DoctorIcon,
  DoctorIconInline,
  Pencil,
  Save,
  X,
} from "@/components/doctor/icons/DoctorIcons";
import { ConsModal, ConsModalButton } from "@/components/doctor/ui/ConsModal";
import { formatDate } from "@/lib/data-mappers";
import type { Appointment } from "@/services/api-hooks.types";
import type { DoctorProfile } from "@/services/api-hooks.types";
import type { DoctorAppointmentDetail } from "@/services/doctor-api-hooks";
import type { ModalState } from "../types";
import { apptTime, patientName, slotLabel } from "../utils";
import { ManualAppointmentDetailsBody } from "./ManualAppointmentDetailsBody";

export function ManualAppointmentModals({
  modal,
  closeModal,
  editDate,
  setEditDate,
  editTime,
  setEditTime,
  editSlots,
  doEdit,
  reschedulePending,
  cancelWhy,
  setCancelWhy,
  doCancel,
  updateStatusPending,
  detailData,
  detailLoading,
  profile,
}: {
  modal: ModalState;
  closeModal: () => void;
  editDate: string;
  setEditDate: (date: string) => void;
  editTime: string;
  setEditTime: (time: string) => void;
  editSlots: string[];
  doEdit: () => void;
  reschedulePending: boolean;
  cancelWhy: string;
  setCancelWhy: (reason: string) => void;
  doCancel: () => void;
  updateStatusPending: boolean;
  detailData: DoctorAppointmentDetail | undefined;
  detailLoading: boolean;
  profile: DoctorProfile | undefined;
}) {
  return (
    <>
      <ConsModal
        open={modal?.kind === "edit"}
        icon={<DoctorIcon icon={Pencil} size="button" />}
        title={`Edit / Reschedule — MA-${modal ? modal.appt.id.slice(-4).toUpperCase() : ""}`}
        onClose={closeModal}
        footer={
          <>
            <ConsModalButton variant="ghost" onClick={closeModal}>
              Back
            </ConsModalButton>
            <ConsModalButton variant="blue" onClick={doEdit} disabled={reschedulePending}>
              <DoctorIconInline icon={Save} size="sm">
                Save Changes
              </DoctorIconInline>
            </ConsModalButton>
          </>
        }
      >
        {modal?.kind === "edit" ? (
          <>
            <p>
              <b>{patientName(modal.appt)}</b>
              {modal.appt.patient?.user?.phone ? ` · ${modal.appt.patient.user.phone}` : ""}
            </p>
            <div className="oc-grid2">
              <div className="oc-field">
                <label>Appointment Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => {
                    setEditDate(e.target.value);
                    setEditTime("");
                  }}
                />
              </div>
              <div className="oc-field">
                <label>Appointment Time</label>
                <select value={editTime} onChange={(e) => setEditTime(e.target.value)}>
                  <option value="">Select a slot...</option>
                  {editSlots.map((s) => (
                    <option key={s} value={s}>
                      {slotLabel(s)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        ) : null}
      </ConsModal>

      <ConsModal
        open={modal?.kind === "cancel"}
        icon={<DoctorIcon icon={AlertTriangle} size="button" />}
        title="Cancel Manual Appointment"
        warn
        onClose={closeModal}
        footer={
          <>
            <ConsModalButton variant="ghost" onClick={closeModal}>
              Keep it
            </ConsModalButton>
            <ConsModalButton variant="red" onClick={doCancel} disabled={updateStatusPending}>
              <DoctorIconInline icon={X} size="sm">
                Cancel Appointment
              </DoctorIconInline>
            </ConsModalButton>
          </>
        }
      >
        <p>
          Cancel <b>{modal ? patientName(modal.appt) : ""}</b>&rsquo;s appointment on{" "}
          {modal ? `${formatDate(modal.appt.scheduledAt)} · ${apptTime(modal.appt)}` : ""}?
        </p>
        <div style={{ marginTop: 12 }}>
          <label>Reason</label>
          <textarea
            value={cancelWhy}
            onChange={(e) => setCancelWhy(e.target.value)}
            placeholder="Reason (shared with registered patients)"
          />
        </div>
      </ConsModal>

      <ConsModal
        open={modal?.kind === "details"}
        icon="📋"
        title={`Manual Appointment — MA-${modal ? modal.appt.id.slice(-4).toUpperCase() : ""}`}
        onClose={closeModal}
        footer={
          <ConsModalButton variant="ghost" onClick={closeModal}>
            Close
          </ConsModalButton>
        }
      >
        {modal?.kind === "details" ? (
          <ManualAppointmentDetailsBody
            appt={(detailData ?? modal.appt) as DoctorAppointmentDetail}
            clinicLabel={
              profile?.city
                ? `${profile?.hospital || "Dr Insight Clinic"} — ${profile.city}`
                : profile?.hospital || "Dr Insight Clinic"
            }
            doctorName={
              profile?.user
                ? `Dr. ${profile.user.firstName} ${profile.user.lastName}`.trim()
                : "Doctor"
            }
            loading={detailLoading}
          />
        ) : null}
      </ConsModal>
    </>
  );
}
