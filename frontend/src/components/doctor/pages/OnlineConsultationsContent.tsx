"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConsModal, ConsModalButton } from "@/components/doctor/ui/ConsModal";
import { DashCard, DashPageHeader, PersonAvatar } from "@/components/doctor/ui/DoctorPrimitives";
import { formatDate, getInitials, gradientForId } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/doctor-utils";
import {
  useDoctorAppointments,
  useRescheduleAppointment,
  useUpdateAppointmentStatus,
  type DoctorAppointmentParams,
} from "@/services/doctor-api-hooks";
import type { Appointment } from "@/services/api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

export type OnlineView =
  | "requests"
  | "upcoming"
  | "today"
  | "ongoing"
  | "completed"
  | "cancelled"
  | "history";

const VIEW_META: Record<OnlineView, [string, string]> = {
  requests: ["📥 Consultation Requests", "No incoming consultation requests right now."],
  upcoming: ["📅 Upcoming Consultations", "No accepted consultations scheduled ahead."],
  today: ["🗓️ Today's Consultations", "No consultations scheduled for today."],
  ongoing: ["🟢 Ongoing Consultations", "No session is in progress."],
  completed: ["🏁 Completed Consultations", "No completed consultations yet."],
  cancelled: ["❌ Cancelled Consultations", "Nothing here — no cancellations."],
  history: ["📜 Consultation History — audit-tracked", "No consultations recorded yet."],
};

const VIEW_PARAMS: Record<OnlineView, DoctorAppointmentParams> = {
  requests: { kind: "ONLINE", status: "PENDING" },
  upcoming: { kind: "ONLINE", status: "CONFIRMED", range: "upcoming" },
  today: { kind: "ONLINE", range: "today" },
  ongoing: { kind: "ONLINE", status: "IN_PROGRESS" },
  completed: { kind: "ONLINE", status: "COMPLETED" },
  cancelled: { kind: "ONLINE", status: "CANCELLED" },
  history: { kind: "ONLINE" },
};

const TYPE_META: Record<string, { icon: string; label: string; start: string }> = {
  VIDEO: { icon: "📹", label: "Video Consultation", start: "📹 Start Video Call" },
  AUDIO: { icon: "📞", label: "Voice Consultation", start: "📞 Start Voice Call" },
  CHAT: { icon: "💬", label: "Chat Consultation", start: "💬 Open Chat" },
};

function typeMeta(type: string) {
  return TYPE_META[type] ?? TYPE_META.VIDEO;
}

function patientName(appt: Appointment): string {
  return `${appt.patient?.user?.firstName ?? ""} ${appt.patient?.user?.lastName ?? ""}`.trim() || "Patient";
}

function apptTime(appt: Appointment): string {
  return new Date(appt.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function ocChip(appt: Appointment) {
  switch (appt.status) {
    case "PENDING":
      return <span className="cons-chip cc-pending">🕒 Pending Approval</span>;
    case "CONFIRMED":
      return <span className="cons-chip cc-up">📅 Upcoming</span>;
    case "IN_PROGRESS":
      return <span className="cons-chip cc-live">🟢 Ongoing</span>;
    case "COMPLETED":
      return <span className="cons-chip cc-done">🏁 Completed</span>;
    case "CANCELLED":
      return <span className="cons-chip cc-cancel">❌ Cancelled</span>;
    default:
      return <span className="cons-chip cc-up">{appt.status}</span>;
  }
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

type ModalState =
  | { kind: "reject"; appt: Appointment }
  | { kind: "cancel"; appt: Appointment }
  | { kind: "reschedule"; appt: Appointment }
  | { kind: "complete"; appt: Appointment }
  | { kind: "details"; appt: Appointment }
  | null;

export function OnlineConsultationsContent({ view }: { view: OnlineView }) {
  const router = useRouter();
  const showToast = useDoctorUiStore((s) => s.showToast);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalState>(null);
  const [reason, setReason] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const updateStatus = useUpdateAppointmentStatus();
  const reschedule = useRescheduleAppointment();

  const query = useDoctorAppointments({ ...VIEW_PARAMS[view], page, limit: view === "history" ? 20 : 15 });
  const todayQuery = useDoctorAppointments({ kind: "ONLINE", range: "today", limit: 20 });
  const meta = VIEW_META[view];

  const list = useMemo(() => {
    const data = query.data?.data ?? [];
    if (view !== "today") return data;
    return data.filter((a) => a.status === "CONFIRMED" || a.status === "IN_PROGRESS");
  }, [query.data, view]);

  const todaysActive = useMemo(
    () => (todayQuery.data?.data ?? []).filter((a) => a.status === "CONFIRMED" || a.status === "IN_PROGRESS"),
    [todayQuery.data],
  );

  const closeModal = () => {
    setModal(null);
    setReason("");
    setNewDate("");
    setNewTime("");
  };

  const openReschedule = (appt: Appointment) => {
    const d = new Date(appt.scheduledAt);
    const pad = (n: number) => String(n).padStart(2, "0");
    setNewDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
    setNewTime(`${pad(d.getHours())}:${pad(d.getMinutes())}`);
    setModal({ kind: "reschedule", appt });
  };

  const doAccept = (appt: Appointment) => {
    updateStatus.mutate(
      { id: appt.id, status: "CONFIRMED" },
      { onSuccess: () => showToast("✅ Request accepted — patient notified") },
    );
  };

  const doStatusWithReason = (kind: "reject" | "cancel") => {
    if (!modal || modal.kind !== kind) return;
    updateStatus.mutate(
      {
        id: modal.appt.id,
        status: "CANCELLED",
        cancelReason: reason.trim() || (kind === "reject" ? "Rejected by doctor" : "Cancelled by doctor"),
      },
      {
        onSuccess: () => {
          closeModal();
          showToast(kind === "reject" ? "⛔ Request rejected — patient notified" : "❌ Consultation cancelled — patient notified");
        },
        onError: (err) => showToast(err instanceof Error ? err.message : "Action failed"),
      },
    );
  };

  const doComplete = () => {
    if (!modal || modal.kind !== "complete") return;
    updateStatus.mutate(
      { id: modal.appt.id, status: "COMPLETED" },
      {
        onSuccess: () => {
          closeModal();
          showToast("🏁 Completed — patient can now view the prescription");
        },
        onError: (err) => showToast(err instanceof Error ? err.message : "Failed to complete"),
      },
    );
  };

  const doReschedule = () => {
    if (!modal || modal.kind !== "reschedule") return;
    if (!newDate) {
      showToast("⚠️ Pick a date first");
      return;
    }
    reschedule.mutate(
      { id: modal.appt.id, scheduledAt: new Date(`${newDate}T${newTime || "09:00"}:00`).toISOString() },
      {
        onSuccess: () => {
          closeModal();
          showToast("🗓️ Rescheduled — consultation moved to Upcoming");
        },
        onError: (err) => showToast(err instanceof Error ? err.message : "Failed to reschedule"),
      },
    );
  };

  const startConsultation = (appt: Appointment) => {
    router.push(`/doctor/consultation/${appt.id}`);
  };

  const cardActions = (appt: Appointment) => {
    if (appt.status === "PENDING") {
      return (
        <>
          <button type="button" className="ca-btn primary" disabled={updateStatus.isPending} onClick={() => doAccept(appt)}>
            ✓ Accept
          </button>
          <button type="button" className="ca-btn" onClick={() => openReschedule(appt)}>
            🗓️ Reschedule
          </button>
          <button type="button" className="ca-btn" onClick={() => setModal({ kind: "details", appt })}>
            📋 Details
          </button>
          <button type="button" className="ca-btn danger" onClick={() => setModal({ kind: "reject", appt })}>
            ⛔ Reject
          </button>
        </>
      );
    }
    if (appt.status === "CONFIRMED") {
      return (
        <>
          <button type="button" className="ca-btn primary" onClick={() => startConsultation(appt)}>
            {typeMeta(appt.consultationType).start}
          </button>
          <button type="button" className="ca-btn" onClick={() => setModal({ kind: "details", appt })}>
            📋 Details
          </button>
          <button type="button" className="ca-btn" onClick={() => openReschedule(appt)}>
            🗓️ Reschedule
          </button>
          <button type="button" className="ca-btn danger" onClick={() => setModal({ kind: "cancel", appt })}>
            ✕ Cancel
          </button>
        </>
      );
    }
    if (appt.status === "IN_PROGRESS") {
      return (
        <>
          <button type="button" className="ca-btn primary" onClick={() => startConsultation(appt)}>
            🟢 Rejoin Session
          </button>
          <button type="button" className="ca-btn" onClick={() => setModal({ kind: "complete", appt })}>
            🏁 Mark Completed
          </button>
          <button type="button" className="ca-btn" onClick={() => setModal({ kind: "details", appt })}>
            📋 Details
          </button>
        </>
      );
    }
    if (appt.status === "COMPLETED") {
      return (
        <>
          <button type="button" className="ca-btn" onClick={() => setModal({ kind: "details", appt })}>
            📋 Full Summary
          </button>
          {appt.prescription?.id ? (
            <Link href={`/doctor/prescriptions/${appt.prescription.id}`} className="ca-btn primary" style={{ textDecoration: "none" }}>
              💊 View e-Prescription
            </Link>
          ) : (
            <Link href="/doctor/prescriptions/new" className="ca-btn primary" style={{ textDecoration: "none" }}>
              💊 Fill e-Prescription
            </Link>
          )}
        </>
      );
    }
    return (
      <button type="button" className="ca-btn" onClick={() => setModal({ kind: "details", appt })}>
        📋 Details
      </button>
    );
  };

  const consultationCard = (appt: Appointment) => {
    const t = typeMeta(appt.consultationType);
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
              🧑 Patient{appt.patient?.patientNumber ? ` · 🆔 ${appt.patient.patientNumber}` : ""}
            </div>
          </div>
          {ocChip(appt)}
        </div>
        <div className="cons-details">
          <span>
            {t.icon} {t.label}
          </span>
          <span>📅 {formatDate(appt.scheduledAt)}</span>
          <span>⏰ {apptTime(appt)}</span>
          <span>⏱️ {appt.durationMinutes} min</span>
          {fee ? <span>💵 {fee}</span> : null}
        </div>
        {appt.status === "CANCELLED" ? (
          <div className="cons-note">
            ❌ <strong>Cancelled:</strong> {appt.cancelReason ?? "Not specified"}
          </div>
        ) : (
          <div className="cons-note">
            📋 <strong>Reason:</strong> {appt.reason ?? "Consultation"}
          </div>
        )}
        <div className="cons-actions">{cardActions(appt)}</div>
      </div>
    );
  };

  const totalPages = query.data?.meta?.totalPages ?? 1;

  return (
    <>
      <DashPageHeader
        subtitle="👨‍⚕️ Physician Dashboard"
        title="Online Consultation"
        dateStr={todayFormatted()}
        actions={
          <button type="button" className="btn-w" onClick={() => router.push("/doctor/availability")}>
            🗓️ Availability
          </button>
        }
      />

      {(view === "today" || view === "upcoming") && todaysActive.length > 0 ? (
        <div className="alert-banner">
          <div className="ab-ico">⏰</div>
          <div className="ab-text">
            <strong>
              {todaysActive.length} consultation{todaysActive.length > 1 ? "s" : ""} scheduled today
            </strong>
            <span>
              {todaysActive
                .map((x) => `${typeMeta(x.consultationType).icon} ${patientName(x)} · ${apptTime(x)}`)
                .join("  ·  ")}
            </span>
          </div>
          <button type="button" className="ab-btn" onClick={() => router.push("/doctor/consultations/today")}>
            View →
          </button>
        </div>
      ) : null}

      {view === "history" ? (
        <DashCard title={meta[0]}>
          <div style={{ overflowX: "auto" }}>
            <table className="pt-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Type</th>
                  <th>Date &amp; Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th></th>
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
                      {meta[1]}
                    </td>
                  </tr>
                ) : (
                  list.map((appt) => {
                    const t = typeMeta(appt.consultationType);
                    return (
                      <tr key={appt.id}>
                        <td>
                          <strong>{patientName(appt)}</strong>
                          <div style={{ fontSize: ".72rem", color: "var(--gray-400)" }}>
                            #APT-{appt.id.slice(-4).toUpperCase()}
                          </div>
                        </td>
                        <td>
                          <span className="cons-chip cc-up">
                            {t.icon} {t.label.replace(" Consultation", "")}
                          </span>
                        </td>
                        <td>
                          {formatDate(appt.scheduledAt)}
                          <div style={{ fontSize: ".72rem", color: "var(--gray-400)" }}>{apptTime(appt)}</div>
                        </td>
                        <td>{appt.durationMinutes} min</td>
                        <td>{ocChip(appt)}</td>
                        <td style={{ fontSize: ".78rem", color: "var(--gray-500)" }}>
                          {appt.notes ?? appt.reason ?? "—"}
                        </td>
                        <td>
                          <button type="button" className="ca-btn" onClick={() => setModal({ kind: "details", appt })}>
                            👁
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </DashCard>
      ) : (
        <DashCard title={meta[0]}>
          {query.isLoading ? (
            <div style={{ padding: "24px 0", textAlign: "center", color: "var(--gray-400)", fontSize: "0.84rem" }}>
              Loading...
            </div>
          ) : list.length === 0 ? (
            <div className="oc-empty">
              <span className="big">🗂️</span>
              {meta[1]}
            </div>
          ) : (
            <div className="cons-list">{list.map(consultationCard)}</div>
          )}
        </DashCard>
      )}

      {totalPages > 1 ? (
        <div className="table-pager">
          <span>
            Page {page} of {totalPages} · {query.data?.meta?.total ?? 0} consultations
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button" className="tbl-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ← Prev
            </button>
            <button type="button" className="tbl-btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next →
            </button>
          </div>
        </div>
      ) : null}

      <ConsModal
        open={modal?.kind === "reject"}
        icon="⛔"
        title="Reject Consultation Request"
        warn
        onClose={closeModal}
        footer={
          <>
            <ConsModalButton variant="ghost" onClick={closeModal}>
              Back
            </ConsModalButton>
            <ConsModalButton variant="red" onClick={() => doStatusWithReason("reject")} disabled={updateStatus.isPending}>
              ⛔ Reject Request
            </ConsModalButton>
          </>
        }
      >
        <p>
          Reject the {modal ? typeMeta(modal.appt.consultationType).label.toLowerCase() : ""} request from{" "}
          <b>{modal ? patientName(modal.appt) : ""}</b>?
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
        icon="⚠️"
        title="Cancel Consultation"
        warn
        onClose={closeModal}
        footer={
          <>
            <ConsModalButton variant="ghost" onClick={closeModal}>
              Keep it
            </ConsModalButton>
            <ConsModalButton variant="red" onClick={() => doStatusWithReason("cancel")} disabled={updateStatus.isPending}>
              ✕ Cancel Consultation
            </ConsModalButton>
          </>
        }
      >
        <p>
          Cancel the consultation with <b>{modal ? patientName(modal.appt) : ""}</b> (
          {modal ? `${formatDate(modal.appt.scheduledAt)} · ${apptTime(modal.appt)}` : ""})?
        </p>
        <div style={{ marginTop: 12 }}>
          <label>Reason</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason shared with the patient..." />
        </div>
      </ConsModal>

      <ConsModal
        open={modal?.kind === "reschedule"}
        icon="🗓️"
        title="Reschedule Consultation"
        onClose={closeModal}
        footer={
          <>
            <ConsModalButton variant="ghost" onClick={closeModal}>
              Back
            </ConsModalButton>
            <ConsModalButton variant="blue" onClick={doReschedule} disabled={reschedule.isPending}>
              🗓️ Confirm New Slot
            </ConsModalButton>
          </>
        }
      >
        <p>
          Pick a new date &amp; time for <b>{modal ? patientName(modal.appt) : ""}</b>&rsquo;s{" "}
          {modal ? typeMeta(modal.appt.consultationType).label.toLowerCase() : ""}.
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
        open={modal?.kind === "complete"}
        icon="🏁"
        title="Mark Consultation Completed"
        onClose={closeModal}
        footer={
          <>
            <ConsModalButton variant="ghost" onClick={closeModal}>
              Back
            </ConsModalButton>
            <ConsModalButton variant="blue" onClick={doComplete} disabled={updateStatus.isPending}>
              🏁 Mark Completed
            </ConsModalButton>
          </>
        }
      >
        <p>
          Complete the {modal ? typeMeta(modal.appt.consultationType).label.toLowerCase() : ""} with{" "}
          <b>{modal ? patientName(modal.appt) : ""}</b>?
        </p>
        <p className="cons-sub">
          {modal?.kind === "complete" && modal.appt.prescription?.id
            ? "✓ e-Prescription attached."
            : "⚠️ No e-prescription attached (optional)."}
        </p>
      </ConsModal>

      <ConsModal
        open={modal?.kind === "details"}
        icon="📋"
        title={`Consultation Details${modal ? ` — #APT-${modal.appt.id.slice(-4).toUpperCase()}` : ""}`}
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
              {modal.appt.patient?.patientNumber ? ` · 🆔 ${modal.appt.patient.patientNumber}` : ""}
            </p>
            <p className="cons-sub">
              {typeMeta(modal.appt.consultationType).icon} {typeMeta(modal.appt.consultationType).label} · 📅{" "}
              {formatDate(modal.appt.scheduledAt)} · ⏰ {apptTime(modal.appt)} · ⏱️ {modal.appt.durationMinutes} min
              {feeLabel(modal.appt) ? ` · 💵 ${feeLabel(modal.appt)}` : ""}
            </p>
            <p className="cons-sub">
              📋 <strong>Reason:</strong> {modal.appt.reason ?? "Consultation"}
            </p>
            {modal.appt.notes ? (
              <div className="cons-note-list">
                <div className="cons-note-item">{modal.appt.notes}</div>
              </div>
            ) : null}
            {modal.appt.cancelReason ? (
              <p className="cons-sub">
                ❌ <strong>Cancelled:</strong> {modal.appt.cancelReason}
              </p>
            ) : null}
          </>
        ) : null}
      </ConsModal>
    </>
  );
}
