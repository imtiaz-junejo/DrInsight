"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  Calendar,
  CalendarClock,
  Circle,
  CircleX,
  ClipboardList,
  Clock3,
  DoctorIcon,
  DoctorIconInline,
  FileText,
  MessageCircleX,
  MessageSquareMore,
  PhysicianDashboardLabel,
  Pill,
  Stethoscope,
  Bell,
  UserRound,
  Wallet,
  X,
} from "@/components/doctor/icons/DoctorIcons";
import { ConsModal, ConsModalButton } from "@/components/doctor/ui/ConsModal";
import { DashCard, DashPageHeader, PersonAvatar } from "@/components/doctor/ui/DoctorPrimitives";
import { formatDate, getInitials, gradientForId, isSameDay } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/doctor-utils";
import {
  useDoctorAppointments,
  useDoctorProfile,
  useRescheduleAppointment,
  useUpdateAppointmentStatus,
  type DoctorAppointmentParams,
} from "@/services/doctor-api-hooks";
import type { Appointment } from "@/services/api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

export type PhysicalView = "requests" | "upcoming" | "today" | "completed" | "cancelled";

const VIEW_META: Record<PhysicalView, [ReactNode, string]> = {
  requests: [
    <DoctorIconInline key="req" icon={MessageSquareMore} size="button">
      Appointment Requests
    </DoctorIconInline>,
    "New in-person appointment requests awaiting your decision",
  ],
  upcoming: [
    <DoctorIconInline key="up" icon={Calendar} size="button">
      Upcoming Appointments
    </DoctorIconInline>,
    "Confirmed in-person appointments scheduled ahead",
  ],
  today: [
    <DoctorIconInline key="today" icon={Stethoscope} size="button">
      Today&apos;s Appointments
    </DoctorIconInline>,
    "In-clinic visits scheduled for today",
  ],
  completed: [
    <DoctorIconInline key="done" icon={BadgeCheck} size="button">
      Completed Appointments
    </DoctorIconInline>,
    "No completed appointments yet.",
  ],
  cancelled: [
    <DoctorIconInline key="cancel" icon={CircleX} size="button">
      Cancelled Appointments
    </DoctorIconInline>,
    "Requests or appointments that were cancelled or rejected",
  ],
};

const VIEW_PARAMS: Record<PhysicalView, DoctorAppointmentParams> = {
  requests: { kind: "PHYSICAL", status: "PENDING" },
  upcoming: { kind: "PHYSICAL", status: "CONFIRMED", range: "upcoming" },
  today: { kind: "PHYSICAL", range: "today" },
  completed: { kind: "PHYSICAL", status: "COMPLETED" },
  cancelled: { kind: "PHYSICAL", status: "CANCELLED" },
};

function physChip(view: PhysicalView, appt: Appointment) {
  if (view === "today" && appt.status === "COMPLETED") {
    return (
      <span className="sch-chip sc-done">
        <DoctorIconInline icon={BadgeCheck} size="sm">
          Completed
        </DoctorIconInline>
      </span>
    );
  }
  if (view === "today" && appt.status === "CANCELLED") {
    return (
      <span className="sch-chip" style={{ background: "var(--gray-100)", color: "var(--gray-600)" }}>
        <DoctorIconInline icon={X} size="sm">
          Cancelled
        </DoctorIconInline>
      </span>
    );
  }
  switch (view) {
    case "requests":
      return (
        <span className="sch-chip sc-pend">
          <DoctorIconInline icon={Clock3} size="sm">
            Pending
          </DoctorIconInline>
        </span>
      );
    case "upcoming":
      return (
        <span className="sch-chip sc-up">
          <DoctorIconInline icon={Calendar} size="sm">
            Upcoming
          </DoctorIconInline>
        </span>
      );
    case "today":
      return (
        <span className="sch-chip sc-up">
          <DoctorIconInline icon={Stethoscope} size="sm">
            Today
          </DoctorIconInline>
        </span>
      );
    case "completed":
      return (
      <span className="sch-chip sc-done">
        <DoctorIconInline icon={BadgeCheck} size="sm">
          Completed
        </DoctorIconInline>
      </span>
    );
    case "cancelled":
      return (
        <span className="sch-chip" style={{ background: "var(--gray-100)", color: "var(--gray-600)" }}>
          ✕ Cancelled
        </span>
      );
  }
}

function patientName(appt: Appointment): string {
  return `${appt.patient?.user?.firstName ?? ""} ${appt.patient?.user?.lastName ?? ""}`.trim() || "Patient";
}

function apptTime(appt: Appointment): string {
  return new Date(appt.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function apptDateLabel(appt: Appointment): string {
  return isSameDay(new Date(appt.scheduledAt), new Date()) ? "Today" : formatDate(appt.scheduledAt);
}

function cardClass(appt: Appointment): string {
  if (appt.status === "COMPLETED") return "completed";
  if (appt.status === "CANCELLED") return "cancelled";
  return "upcoming";
}

function feeLabel(appt: Appointment): string | null {
  if (!appt.payment?.amountCents) return null;
  const amount = (appt.payment.amountCents / 100).toLocaleString();
  return appt.payment.currency?.toUpperCase() === "USD" ? `$${amount}` : `Rs. ${amount}`;
}

function physApptChip(appt: Appointment) {
  switch (appt.status) {
    case "PENDING":
      return (
        <span className="cons-chip cc-pending">
          <DoctorIconInline icon={Clock3} size="sm">
            Pending Approval
          </DoctorIconInline>
        </span>
      );
    case "CONFIRMED":
      return (
        <span className="cons-chip cc-up">
          <DoctorIconInline icon={Calendar} size="sm">
            Upcoming
          </DoctorIconInline>
        </span>
      );
    case "IN_PROGRESS":
      return (
        <span className="cons-chip cc-live">
          <DoctorIconInline icon={Circle} size="sm">
            Ongoing
          </DoctorIconInline>
        </span>
      );
    case "COMPLETED":
      return (
        <span className="cons-chip cc-done">
          <DoctorIconInline icon={BadgeCheck} size="sm">
            Completed
          </DoctorIconInline>
        </span>
      );
    case "CANCELLED":
      return (
        <span className="cons-chip cc-cancel">
          <DoctorIconInline icon={CircleX} size="sm">
            Cancelled
          </DoctorIconInline>
        </span>
      );
    default:
      return <span className="cons-chip cc-up">{appt.status}</span>;
  }
}

function toLocalInputDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toLocalInputTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type ModalState =
  | { kind: "reject"; appt: Appointment }
  | { kind: "cancel"; appt: Appointment }
  | { kind: "reschedule"; appt: Appointment }
  | { kind: "details"; appt: Appointment }
  | null;

export function PhysicalAppointmentsContent({ view }: { view: PhysicalView }) {
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalState>(null);
  const [reason, setReason] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const showToast = useDoctorUiStore((s) => s.showToast);
  const { data: profile } = useDoctorProfile();
  const updateStatus = useUpdateAppointmentStatus();
  const reschedule = useRescheduleAppointment();

  const query = useDoctorAppointments({ ...VIEW_PARAMS[view], page, limit: 15 });
  const meta = VIEW_META[view];
  const clinicName = profile?.hospital || "Dr Insight Clinic";

  const list = useMemo(() => {
    const data = query.data?.data ?? [];
    if (view !== "today") return data;
    return data.filter((a) => a.status !== "PENDING");
  }, [query.data, view]);

  const closeModal = () => {
    setModal(null);
    setReason("");
    setNewDate("");
    setNewTime("");
  };

  const openReschedule = (appt: Appointment) => {
    const d = new Date(appt.scheduledAt);
    setNewDate(toLocalInputDate(d));
    setNewTime(toLocalInputTime(d));
    setModal({ kind: "reschedule", appt });
  };

  const doAccept = (appt: Appointment) => {
    updateStatus.mutate(
      { id: appt.id, status: "CONFIRMED" },
      { onSuccess: () => showToast("✅ Appointment accepted — patient notified") },
    );
  };

  const doReject = () => {
    if (!modal || modal.kind !== "reject") return;
    updateStatus.mutate(
      { id: modal.appt.id, status: "CANCELLED", cancelReason: reason.trim() || "Rejected by doctor" },
      {
        onSuccess: () => {
          closeModal();
          showToast("⛔ Appointment rejected — patient notified");
        },
        onError: (err) => showToast(err instanceof Error ? err.message : "Failed to reject"),
      },
    );
  };

  const doCancel = () => {
    if (!modal || modal.kind !== "cancel") return;
    updateStatus.mutate(
      { id: modal.appt.id, status: "CANCELLED", cancelReason: reason.trim() || "Cancelled by doctor" },
      {
        onSuccess: () => {
          closeModal();
          showToast("❌ Appointment cancelled — patient notified");
        },
        onError: (err) => showToast(err instanceof Error ? err.message : "Failed to cancel"),
      },
    );
  };

  const doComplete = (appt: Appointment) => {
    updateStatus.mutate(
      { id: appt.id, status: "COMPLETED" },
      { onSuccess: () => showToast("🏁 Marked as completed") },
    );
  };

  const doReschedule = () => {
    if (!modal || modal.kind !== "reschedule") return;
    if (!newDate) {
      showToast("⚠️ Pick a date first");
      return;
    }
    const scheduledAt = new Date(`${newDate}T${newTime || "09:00"}:00`);
    reschedule.mutate(
      { id: modal.appt.id, scheduledAt: scheduledAt.toISOString() },
      {
        onSuccess: () => {
          closeModal();
          showToast("🗓️ Rescheduled — patient notified");
        },
        onError: (err) => showToast(err instanceof Error ? err.message : "Failed to reschedule"),
      },
    );
  };

  const actionsFor = (appt: Appointment) => {
    if (view === "requests") {
      return (
        <>
          <button type="button" className="tbl-btn view" disabled={updateStatus.isPending} onClick={() => doAccept(appt)}>
            Accept
          </button>
          <button type="button" className="tbl-btn" onClick={() => setModal({ kind: "reject", appt })}>
            Reject
          </button>
          <button type="button" className="tbl-btn" onClick={() => openReschedule(appt)}>
            Reschedule
          </button>
        </>
      );
    }
    if (view === "upcoming") {
      return (
        <>
          <button type="button" className="tbl-btn view" onClick={() => openReschedule(appt)}>
            Reschedule
          </button>
          <button type="button" className="tbl-btn" onClick={() => setModal({ kind: "cancel", appt })}>
            Cancel
          </button>
        </>
      );
    }
    if (view === "today") {
      return (
        <>
          {appt.status !== "COMPLETED" && appt.status !== "CANCELLED" ? (
            <button type="button" className="tbl-btn view" disabled={updateStatus.isPending} onClick={() => doComplete(appt)}>
              Mark Complete
            </button>
          ) : null}
          <Link href="/doctor/patients" className="tbl-btn" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            Patient File
          </Link>
        </>
      );
    }
    return (
      <button type="button" className="tbl-btn" onClick={() => setModal({ kind: "details", appt })}>
        Details
      </button>
    );
  };

  const completedCardActions = (appt: Appointment) => (
    <>
      <button type="button" className="ca-btn" onClick={() => setModal({ kind: "details", appt })}>
        <DoctorIconInline icon={ClipboardList} size="sm">
          Full Summary
        </DoctorIconInline>
      </button>
      {appt.prescription?.id ? (
        <Link href={`/doctor/prescriptions/${appt.prescription.id}`} className="ca-btn primary" style={{ textDecoration: "none" }}>
          <DoctorIconInline icon={Pill} size="sm">
            View e-Prescription
          </DoctorIconInline>
        </Link>
      ) : (
        <Link href="/doctor/prescriptions/new" className="ca-btn primary" style={{ textDecoration: "none" }}>
          <DoctorIconInline icon={Pill} size="sm">
            Fill e-Prescription
          </DoctorIconInline>
        </Link>
      )}
    </>
  );

  const appointmentCard = (appt: Appointment) => {
    const fee = feeLabel(appt);
    return (
      <div key={appt.id} className={`cons-card ${cardClass(appt)}`}>
        <div className="cons-top">
          <PersonAvatar
            initials={getInitials(appt.patient?.user?.firstName, appt.patient?.user?.lastName)}
            seed={appt.id}
            style={{ background: gradientForId(appt.id) }}
          />
          <div>
            <div className="cons-dr-name">{patientName(appt)}</div>
            <div className="cons-dr-spec">
              <DoctorIconInline icon={UserRound} size="sm">
                Patient{appt.patient?.patientNumber ? ` · ID ${appt.patient.patientNumber}` : ""}
              </DoctorIconInline>
            </div>
          </div>
          {physApptChip(appt)}
        </div>
        <div className="cons-details">
          <span>
            <DoctorIconInline icon={Stethoscope} size="sm">
              In-Person Visit
            </DoctorIconInline>
          </span>
          <span>
            <DoctorIconInline icon={Calendar} size="sm">
              {formatDate(appt.scheduledAt)}
            </DoctorIconInline>
          </span>
          <span>
            <DoctorIconInline icon={Clock3} size="sm">
              {apptTime(appt)}
            </DoctorIconInline>
          </span>
          <span>
            <DoctorIconInline icon={Clock3} size="sm">
              {appt.durationMinutes} min
            </DoctorIconInline>
          </span>
          <span>
            <DoctorIconInline icon={Stethoscope} size="sm">
              {clinicName}
            </DoctorIconInline>
          </span>
          {fee ? (
            <span>
              <DoctorIconInline icon={Wallet} size="sm">
                {fee}
              </DoctorIconInline>
            </span>
          ) : null}
        </div>
        <div className="cons-note">
          <DoctorIconInline icon={ClipboardList} size="sm">
            <strong>Reason:</strong> {appt.reason ?? "In-person visit"}
          </DoctorIconInline>
        </div>
        <div className="cons-actions">{completedCardActions(appt)}</div>
      </div>
    );
  };

  const totalPages = query.data?.meta?.totalPages ?? 1;

  return (
    <>
      <DashPageHeader subtitle={<PhysicianDashboardLabel />} title="Physical Appointments" dateStr={todayFormatted()} />

      {view === "requests" && list.length > 0 ? (
        <div className="alert-banner">
          <div className="ab-ico">
            <DoctorIcon icon={Bell} size="stat" />
          </div>
          <div className="ab-text">
            <strong>
              {list.length} new physical appointment request{list.length !== 1 ? "s" : ""}
            </strong>
            <span>Accept, reject, or propose a new time — patients are notified automatically.</span>
          </div>
        </div>
      ) : null}

      <DashCard title={meta[0]}>
        {view === "completed" ? (
          query.isLoading ? (
            <div style={{ padding: "24px 0", textAlign: "center", color: "var(--gray-400)", fontSize: "0.84rem" }}>
              Loading...
            </div>
          ) : list.length === 0 ? (
            <div className="oc-empty">
              <span className="big">
                <DoctorIcon icon={ClipboardList} size="stat" />
              </span>
              {meta[1]}
            </div>
          ) : (
            <div className="cons-list">{list.map(appointmentCard)}</div>
          )
        ) : (
          <>
            <div style={{ fontSize: ".78rem", color: "var(--gray-500)", marginBottom: 10 }}>{meta[1]}</div>
            <div style={{ overflowX: "auto" }}>
              <table className="pt-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Clinic</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {query.isLoading ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>
                        Loading...
                      </td>
                    </tr>
                  ) : list.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>
                        No appointments in this category.
                      </td>
                    </tr>
                  ) : (
                    list.map((appt) => (
                      <tr key={appt.id}>
                        <td>
                          <strong>{patientName(appt)}</strong>
                          {appt.bookingSource && appt.bookingSource !== "ONLINE" ? (
                            <div style={{ fontSize: ".7rem", color: "var(--gray-400)" }}>
                              Manual (
                              {appt.bookingSource === "PHONE"
                                ? "Phone"
                                : appt.bookingSource === "CLINIC_VISIT"
                                  ? "Clinic visit"
                                  : appt.bookingSource === "EMERGENCY"
                                    ? "Emergency"
                                    : "Walk-in"}
                              )
                            </div>
                          ) : null}
                        </td>
                        <td>{clinicName}</td>
                        <td>{apptDateLabel(appt)}</td>
                        <td>{apptTime(appt)}</td>
                        <td style={{ fontSize: ".78rem", color: "var(--gray-500)" }}>
                          {appt.reason ?? "—"}
                          {view === "cancelled" && appt.cancelReason ? (
                            <div style={{ fontSize: ".7rem", color: "var(--gray-400)" }}>
                              <DoctorIconInline icon={CircleX} size="sm">
                                {appt.cancelReason}
                              </DoctorIconInline>
                            </div>
                          ) : null}
                        </td>
                        <td>{physChip(view, appt)}</td>
                        <td>
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{actionsFor(appt)}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
        {totalPages > 1 ? (
          <div className="table-pager">
            <span>
              Page {page} of {totalPages} · {query.data?.meta?.total ?? 0} appointments
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" className="tbl-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                ← Prev
              </button>
              <button
                type="button"
                className="tbl-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        ) : null}
      </DashCard>

      <ConsModal
        open={modal?.kind === "reject"}
        icon={<DoctorIcon icon={MessageCircleX} size="button" />}
        title="Reject Appointment Request"
        warn
        onClose={closeModal}
        footer={
          <>
            <ConsModalButton variant="ghost" onClick={closeModal}>
              Back
            </ConsModalButton>
            <ConsModalButton variant="red" onClick={doReject} disabled={updateStatus.isPending}>
              <DoctorIconInline icon={MessageCircleX} size="sm">
                Reject Request
              </DoctorIconInline>
            </ConsModalButton>
          </>
        }
      >
        <p>
          Reject the in-person appointment request from <b>{modal ? patientName(modal.appt) : ""}</b>?
        </p>
        <div style={{ marginTop: 12 }}>
          <label>Reason for rejection</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Slot unavailable — please rebook next week"
          />
        </div>
      </ConsModal>

      <ConsModal
        open={modal?.kind === "cancel"}
        icon={<DoctorIcon icon={AlertTriangle} size="button" />}
        title="Cancel Appointment"
        warn
        onClose={closeModal}
        footer={
          <>
            <ConsModalButton variant="ghost" onClick={closeModal}>
              Keep it
            </ConsModalButton>
            <ConsModalButton variant="red" onClick={doCancel} disabled={updateStatus.isPending}>
              <DoctorIconInline icon={X} size="sm">
                Cancel Appointment
              </DoctorIconInline>
            </ConsModalButton>
          </>
        }
      >
        <p>
          Cancel <b>{modal ? patientName(modal.appt) : ""}</b>&rsquo;s appointment on{" "}
          {modal ? `${apptDateLabel(modal.appt)} · ${apptTime(modal.appt)}` : ""}?
        </p>
        <div style={{ marginTop: 12 }}>
          <label>Reason</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason shared with the patient..." />
        </div>
      </ConsModal>

      <ConsModal
        open={modal?.kind === "reschedule"}
        icon={<DoctorIcon icon={CalendarClock} size="button" />}
        title="Reschedule Appointment"
        onClose={closeModal}
        footer={
          <>
            <ConsModalButton variant="ghost" onClick={closeModal}>
              Back
            </ConsModalButton>
            <ConsModalButton variant="blue" onClick={doReschedule} disabled={reschedule.isPending}>
              <DoctorIconInline icon={CalendarClock} size="sm">
                Confirm New Slot
              </DoctorIconInline>
            </ConsModalButton>
          </>
        }
      >
        <p>
          Pick a new date &amp; time for <b>{modal ? patientName(modal.appt) : ""}</b>&rsquo;s in-clinic visit.
        </p>
        <div className="oc-grid2">
          <div className="oc-field">
            <label>New Date</label>
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
          </div>
          <div className="oc-field">
            <label>New Time</label>
            <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
          </div>
        </div>
      </ConsModal>

      <ConsModal
        open={modal?.kind === "details"}
        icon={<DoctorIcon icon={ClipboardList} size="button" />}
        title={`Appointment Details${modal ? ` — #APT-${modal.appt.id.slice(-4).toUpperCase()}` : ""}`}
        onClose={closeModal}
        footer={
          <ConsModalButton variant="ghost" onClick={closeModal}>
            Close
          </ConsModalButton>
        }
      >
        {modal?.kind === "details" ? (
          <>
            <p>
              <strong>{patientName(modal.appt)}</strong>
              {modal.appt.patient?.patientNumber ? ` · ID ${modal.appt.patient.patientNumber}` : ""}
            </p>
            <p className="cons-sub">
              In-Person ·{" "}
              <DoctorIconInline icon={Calendar} size="sm">
                {formatDate(modal.appt.scheduledAt)}
              </DoctorIconInline>
              {" · "}
              <DoctorIconInline icon={Clock3} size="sm">
                {apptTime(modal.appt)}
              </DoctorIconInline>
              {" · "}
              {modal.appt.durationMinutes} min · {clinicName}
            </p>
            <p className="cons-sub">
              <DoctorIconInline icon={ClipboardList} size="sm">
                <strong>Reason:</strong> {modal.appt.reason ?? "—"}
              </DoctorIconInline>
            </p>
            {modal.appt.notes ? (
              <p className="cons-sub">
                <DoctorIconInline icon={FileText} size="sm">
                  <strong>Notes:</strong> {modal.appt.notes}
                </DoctorIconInline>
              </p>
            ) : null}
            {modal.appt.cancelReason ? (
              <p className="cons-sub">
                <DoctorIconInline icon={CircleX} size="sm">
                  <strong>Cancelled:</strong> {modal.appt.cancelReason}
                </DoctorIconInline>
              </p>
            ) : null}
          </>
        ) : null}
      </ConsModal>
    </>
  );
}
