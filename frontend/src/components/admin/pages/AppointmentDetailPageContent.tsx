"use client";

import Link from "next/link";
import {
  AdminButton,
  AdminPanel,
  GridTwo,
  PanelTable,
  StatusChip,
  UserCell,
} from "@/components/admin/ui/AdminPrimitives";
import { adminUserProfileHref, adminDoctorProfileHref } from "@/lib/admin-routes";
import {
  appointmentStatusChip,
  consultationTypeIcon,
  formatDateTime,
  formatRelativeTime,
} from "@/lib/admin-utils";
import {
  useAdminAppointment,
  useUpdateAppointmentStatus,
} from "@/services/admin-api-hooks";
import { useAdminUiStore } from "@/store/admin-ui.store";

function formatCents(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function paymentStatusLabel(status: string): { label: string; className: string } {
  const map: Record<string, { label: string; className: string }> = {
    SUCCEEDED: { label: "Paid", className: "ch-g" },
    REFUNDED: { label: "Refunded", className: "ch-a" },
    FAILED: { label: "Failed", className: "ch-r" },
    CANCELLED: { label: "Cancelled", className: "ch-r" },
    REQUIRES_PAYMENT_METHOD: { label: "Pending", className: "ch-a" },
    PROCESSING: { label: "Processing", className: "ch-a" },
  };
  return map[status] ?? { label: status, className: "ch-gray" };
}

function meetingLink(appointment: { meetingRoomId?: string | null; videoProvider?: string | null }) {
  if (!appointment.meetingRoomId) return "—";
  if (appointment.videoProvider === "ZOOM") {
    return `https://zoom.us/j/${appointment.meetingRoomId}`;
  }
  return appointment.meetingRoomId;
}

export function AppointmentDetailPageContent({ appointmentId }: { appointmentId: string }) {
  const showToast = useAdminUiStore((s) => s.showToast);
  const appointmentQuery = useAdminAppointment(appointmentId);
  const updateStatus = useUpdateAppointmentStatus();
  const appointment = appointmentQuery.data;

  if (appointmentQuery.isLoading) {
    return <AdminPanel title="Loading appointment...">Fetching appointment details...</AdminPanel>;
  }

  if (appointmentQuery.isError || !appointment) {
    return (
      <AdminPanel title="Appointment not found">
        <Link href="/admin/appointments" className="detail-back">
          ← Back to Appointments
        </Link>
      </AdminPanel>
    );
  }

  const status = appointmentStatusChip(appointment.status);
  const payment = appointment.payment;
  const paymentChip = payment ? paymentStatusLabel(payment.status) : null;
  const prescription = appointment.prescription;
  const prescriptionItems = Array.isArray(prescription?.items)
    ? (prescription.items as Array<{ medication?: string; dosage?: string }>)
    : [];

  const auditRows = appointment.auditLogs.map((entry) => [
    formatRelativeTime(entry.createdAt),
    entry.actorName,
    entry.action,
    entry.target ?? "—",
    <StatusChip key={`${entry.id}-r`} label={entry.result} className={entry.result === "FAILED" ? "ch-r" : "ch-g"} />,
  ]);

  const canConfirm = appointment.status === "PENDING";
  const canComplete = appointment.status === "CONFIRMED" || appointment.status === "IN_PROGRESS";
  const canCancel = !["CANCELLED", "COMPLETED", "NO_SHOW"].includes(appointment.status);

  return (
    <>
      <Link href="/admin/appointments" className="detail-back">
        ← Back to Appointments
      </Link>

      <div className="profile-hero">
        <div style={{ flex: 1 }}>
          <h2>Appointment #APT-{appointment.id.slice(-4)}</h2>
          <div className="profile-meta">
            <StatusChip label={status.label} className={status.className} />
            <StatusChip
              label={consultationTypeIcon(appointment.consultationType)}
              className="ch-b"
            />
            {paymentChip ? (
              <StatusChip label={paymentChip.label} className={paymentChip.className} />
            ) : null}
          </div>
          <div className="btn-row" style={{ marginTop: 14 }}>
            {canConfirm ? (
              <AdminButton
                variant="green"
                onClick={() =>
                  updateStatus.mutate(
                    { id: appointment.id, status: "CONFIRMED" },
                    { onSuccess: () => showToast("Appointment confirmed") },
                  )
                }
              >
                Approve
              </AdminButton>
            ) : null}
            {canComplete ? (
              <AdminButton
                variant="green"
                onClick={() =>
                  updateStatus.mutate(
                    { id: appointment.id, status: "COMPLETED" },
                    { onSuccess: () => showToast("Appointment completed") },
                  )
                }
              >
                Complete
              </AdminButton>
            ) : null}
            {canCancel ? (
              <AdminButton
                variant="danger"
                onClick={() =>
                  updateStatus.mutate(
                    { id: appointment.id, status: "CANCELLED" },
                    { onSuccess: () => showToast("Appointment cancelled") },
                  )
                }
              >
                Cancel
              </AdminButton>
            ) : null}
          </div>
        </div>
      </div>

      <GridTwo>
        <AdminPanel title="Patient">
          {appointment.patient?.user ? (
            <>
              <UserCell
                firstName={appointment.patient.user.firstName}
                lastName={appointment.patient.user.lastName}
                sub={appointment.patient.user.email}
                userId={appointment.patient.user.id}
                seed={appointment.patient.user.id}
              />
              <dl className="detail-list" style={{ marginTop: 12 }}>
                <div className="detail-row">
                  <dt>Phone</dt>
                  <dd>{appointment.patient.user.phone ?? "—"}</dd>
                </div>
                <div className="detail-row">
                  <dt>Status</dt>
                  <dd>{appointment.patient.user.status}</dd>
                </div>
              </dl>
              <Link href={adminUserProfileHref(appointment.patient.user.id)} className="btn" style={{ marginTop: 10 }}>
                View profile
              </Link>
            </>
          ) : (
            "—"
          )}
        </AdminPanel>

        <AdminPanel title="Doctor">
          {appointment.doctor?.user ? (
            <>
              <UserCell
                firstName={appointment.doctor.user.firstName}
                lastName={appointment.doctor.user.lastName}
                sub={appointment.doctor.specialty}
                doctorProfileId={appointment.doctor.id}
                seed={appointment.doctor.id}
              />
              <dl className="detail-list" style={{ marginTop: 12 }}>
                <div className="detail-row">
                  <dt>Email</dt>
                  <dd>{appointment.doctor.user.email}</dd>
                </div>
                <div className="detail-row">
                  <dt>Phone</dt>
                  <dd>{appointment.doctor.user.phone ?? "—"}</dd>
                </div>
              </dl>
              <Link href={adminDoctorProfileHref(appointment.doctor.id)} className="btn" style={{ marginTop: 10 }}>
                View profile
              </Link>
            </>
          ) : (
            "—"
          )}
        </AdminPanel>
      </GridTwo>

      <GridTwo>
        <AdminPanel title="Consultation Details">
          <dl className="detail-list">
            <div className="detail-row">
              <dt>Specialty</dt>
              <dd>{appointment.doctor?.specialty ?? "—"}</dd>
            </div>
            <div className="detail-row">
              <dt>Type</dt>
              <dd>{consultationTypeIcon(appointment.consultationType)}</dd>
            </div>
            <div className="detail-row">
              <dt>Date & time</dt>
              <dd>{formatDateTime(appointment.scheduledAt)}</dd>
            </div>
            <div className="detail-row">
              <dt>Duration</dt>
              <dd>{appointment.durationMinutes} minutes</dd>
            </div>
            <div className="detail-row">
              <dt>Symptoms / reason</dt>
              <dd>{appointment.reason ?? "—"}</dd>
            </div>
            <div className="detail-row">
              <dt>Notes</dt>
              <dd>{appointment.notes ?? "—"}</dd>
            </div>
            <div className="detail-row">
              <dt>Meeting link</dt>
              <dd>
                {meetingLink(appointment) !== "—" ? (
                  <a href={meetingLink(appointment)} target="_blank" rel="noreferrer">
                    {meetingLink(appointment)}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div className="detail-row">
              <dt>Created</dt>
              <dd>{formatDateTime(appointment.createdAt)}</dd>
            </div>
            <div className="detail-row">
              <dt>Last updated</dt>
              <dd>{formatDateTime(appointment.updatedAt)}</dd>
            </div>
          </dl>
        </AdminPanel>

        <AdminPanel title="Payment">
          {payment ? (
            <dl className="detail-list">
              <div className="detail-row">
                <dt>Status</dt>
                <dd>
                  <StatusChip label={paymentChip!.label} className={paymentChip!.className} />
                </dd>
              </div>
              <div className="detail-row">
                <dt>Amount</dt>
                <dd>{formatCents(payment.amountCents, payment.currency)}</dd>
              </div>
              <div className="detail-row">
                <dt>Method</dt>
                <dd>{payment.paymentMethod ?? "—"}</dd>
              </div>
              <div className="detail-row">
                <dt>Invoice</dt>
                <dd>{payment.invoiceNumber ?? "—"}</dd>
              </div>
              <div className="detail-row">
                <dt>Billing name</dt>
                <dd>{payment.billingName ?? "—"}</dd>
              </div>
              <div className="detail-row">
                <dt>Confirmed at</dt>
                <dd>{payment.confirmedAt ? formatDateTime(payment.confirmedAt) : "—"}</dd>
              </div>
              {payment.receiptUrl ? (
                <div className="detail-row">
                  <dt>Receipt</dt>
                  <dd>
                    <a href={payment.receiptUrl} target="_blank" rel="noreferrer">
                      View receipt
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : (
            <p>No payment record linked to this appointment.</p>
          )}
        </AdminPanel>
      </GridTwo>

      {prescription ? (
        <AdminPanel title="Prescription">
          <dl className="detail-list">
            <div className="detail-row">
              <dt>Diagnosis</dt>
              <dd>{prescription.diagnosis ?? "—"}</dd>
            </div>
            <div className="detail-row">
              <dt>Notes</dt>
              <dd>{prescription.notes ?? "—"}</dd>
            </div>
            <div className="detail-row">
              <dt>Issued</dt>
              <dd>{formatDateTime(prescription.createdAt)}</dd>
            </div>
            {prescription.pdfUrl ? (
              <div className="detail-row">
                <dt>PDF</dt>
                <dd>
                  <a href={prescription.pdfUrl} target="_blank" rel="noreferrer">
                    Download prescription
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
          {prescriptionItems.length > 0 ? (
            <PanelTable
              title="Medications"
              headers={["Medication", "Dosage"]}
              rows={prescriptionItems.map((item, index) => [
                item.medication ?? "—",
                item.dosage ?? "—",
              ])}
            />
          ) : null}
        </AdminPanel>
      ) : null}

      {appointment.review ? (
        <AdminPanel title="Patient Review">
          <dl className="detail-list">
            <div className="detail-row">
              <dt>Rating</dt>
              <dd>⭐ {appointment.review.rating.toFixed(1)}</dd>
            </div>
            <div className="detail-row">
              <dt>Comment</dt>
              <dd>{appointment.review.comment ?? "—"}</dd>
            </div>
            <div className="detail-row">
              <dt>Submitted</dt>
              <dd>{formatDateTime(appointment.review.createdAt)}</dd>
            </div>
          </dl>
        </AdminPanel>
      ) : null}

      {auditRows.length > 0 ? (
        <PanelTable
          title="Audit / Activity History"
          headers={["Time", "Actor", "Action", "Target", "Result"]}
          rows={auditRows}
        />
      ) : null}
    </>
  );
}
