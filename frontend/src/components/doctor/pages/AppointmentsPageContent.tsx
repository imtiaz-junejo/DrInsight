"use client";

import { useMemo } from "react";
import {
  CardLink,
  DashCard,
  DashPageHeader,
  PersonAvatar,
} from "@/components/doctor/ui/DoctorPrimitives";
import {
  consultationTypeLabel,
  formatDate,
  formatTimeSlot,
  getInitials,
  gradientForId,
  isSameDay,
  scheduleChipForStatus,
} from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/doctor-utils";
import { useDoctorAppointments, useUpdateAppointmentStatus } from "@/services/doctor-api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

function EmptyState({ loading, message }: { loading?: boolean; message: string }) {
  return (
    <div style={{ padding: "24px 0", textAlign: "center", color: "var(--gray-400)", fontSize: "0.84rem" }}>
      {loading ? "Loading..." : message}
    </div>
  );
}

export function AppointmentsPageContent() {
  const showToast = useDoctorUiStore((s) => s.showToast);
  const updateStatus = useUpdateAppointmentStatus();
  const appointmentsQuery = useDoctorAppointments({ limit: 100 });

  const today = useMemo(() => new Date(), []);
  const allAppointments = appointmentsQuery.data?.data ?? [];

  const todayAppointments = useMemo(
    () =>
      allAppointments
        .filter((a) => isSameDay(new Date(a.scheduledAt), today))
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [allAppointments, today],
  );

  const pastAppointments = useMemo(
    () =>
      allAppointments
        .filter((a) => a.status === "COMPLETED" || new Date(a.scheduledAt) < today)
        .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()),
    [allAppointments, today],
  );

  return (
    <>
      <DashPageHeader subtitle="👨‍⚕️ Physician Dashboard" title="Consultations" dateStr={todayFormatted()} />

      <DashCard title="📅 Today's Appointments" actions={<CardLink onClick={() => showToast("Opening calendar...")}>Full Calendar →</CardLink>}>
        {appointmentsQuery.isLoading ? (
          <EmptyState loading message="" />
        ) : todayAppointments.length === 0 ? (
          <EmptyState message="No appointments scheduled for today" />
        ) : (
          todayAppointments.map((appt) => {
            const user = appt.patient?.user;
            const name = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Patient";
            const initials = getInitials(user?.firstName, user?.lastName);
            const avatarBg = gradientForId(appt.id);
            const { chip, chipLabel, live } = scheduleChipForStatus(appt.status);
            const sub = `${consultationTypeLabel(appt.consultationType)} · ${appt.reason ?? "Consultation"}`;

            return (
              <div key={appt.id} className="sch-item">
                <div className="sch-time">{formatTimeSlot(appt.scheduledAt)}</div>
                <PersonAvatar initials={initials} className="sch-av" style={{ background: avatarBg }} seed={name} />
                <div className="sch-info">
                  <div className="sch-name">{name}</div>
                  <div className="sch-sub">{sub}</div>
                </div>
                <span className={`sch-chip ${chip}`}>{chipLabel}</span>
                {appt.status === "PENDING" ? (
                  <button
                    type="button"
                    className="sch-btn"
                    disabled={updateStatus.isPending}
                    onClick={() =>
                      updateStatus.mutate(
                        { id: appt.id, status: "CONFIRMED" },
                        { onSuccess: () => showToast("Consultation confirmed!") },
                      )
                    }
                  >
                    Confirm
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`sch-btn${live ? " go" : ""}`}
                    onClick={() => showToast(live ? "Joining call..." : "Preparing...")}
                  >
                    {live ? "Join →" : "Prep"}
                  </button>
                )}
              </div>
            );
          })
        )}
      </DashCard>

      <DashCard title="✅ Past Consultations">
        <div style={{ overflowX: "auto" }}>
          <table className="pt-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Type</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {appointmentsQuery.isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>
                    Loading...
                  </td>
                </tr>
              ) : pastAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>
                    No past consultations
                  </td>
                </tr>
              ) : (
                pastAppointments.map((appt) => {
                  const name = `${appt.patient?.user?.firstName ?? ""} ${appt.patient?.user?.lastName ?? ""}`.trim() || "Patient";
                  return (
                    <tr key={appt.id}>
                      <td>
                        <strong>{name}</strong>
                      </td>
                      <td>
                        <span className="cons-chip cc-up">{consultationTypeLabel(appt.consultationType)}</span>
                      </td>
                      <td>{formatDate(appt.scheduledAt)}</td>
                      <td>{appt.durationMinutes} min</td>
                      <td>
                        <span className={`st-chip ${appt.payment?.status === "SUCCEEDED" ? "st-active" : appt.payment?.status === "REFUNDED" ? "st-refund" : "st-pending"}`}>
                          {appt.payment?.status === "SUCCEEDED"
                            ? "Paid"
                            : appt.payment?.status === "REFUNDED"
                              ? "Refunded"
                              : appt.payment?.status === "FAILED"
                                ? "Failed"
                                : appt.payment?.status === "CANCELLED"
                                  ? "Cancelled"
                                  : "Pending"}
                        </span>
                      </td>
                      <td>
                        <span className="st-chip st-active">
                          {appt.status === "COMPLETED" ? "✓ Completed" : appt.status}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>{appt.notes ?? appt.reason ?? "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </DashCard>
    </>
  );
}
