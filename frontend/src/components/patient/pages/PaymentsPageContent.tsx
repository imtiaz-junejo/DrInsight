"use client";

import { useMemo, useState } from "react";
import { DashButton, DashCard, DashPageHeader } from "@/components/patient/ui/PatientPrimitives";
import { formatDate } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/patient-utils";
import {
  downloadPaymentInvoice,
  usePatientPayments,
  type PaymentRecord,
} from "@/services/patient-api-hooks";
import { usePatientUiStore } from "@/store/patient-ui.store";

function formatCents(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    SUCCEEDED: { label: "Paid", cls: "pay-badge-success" },
    REFUNDED: { label: "Refunded", cls: "pay-badge-refund" },
    FAILED: { label: "Failed", cls: "pay-badge-failed" },
    CANCELLED: { label: "Cancelled", cls: "pay-badge-cancel" },
    REQUIRES_PAYMENT_METHOD: { label: "Pending", cls: "pay-badge-pending" },
    PROCESSING: { label: "Processing", cls: "pay-badge-pending" },
  };
  return map[status] ?? { label: status, cls: "pay-badge-pending" };
}

export function PaymentsPageContent() {
  const showToast = usePatientUiStore((s) => s.showToast);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const paymentsQuery = usePatientPayments({
    page,
    limit: 10,
    status: statusFilter || undefined,
    search: search || undefined,
  });

  const payments = paymentsQuery.data?.data ?? [];
  const meta = paymentsQuery.data?.meta;

  const handleInvoice = async (paymentId: string) => {
    try {
      const response = await downloadPaymentInvoice(paymentId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${paymentId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      showToast("Invoice downloaded");
    } catch {
      showToast("Unable to download invoice");
    }
  };

  const rows = useMemo(
    () =>
      payments.map((p: PaymentRecord) => {
        const doctor = p.appointment?.doctor?.user ?? p.bookingDraft?.doctor?.user;
        const doctorName = doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "—";
        const scheduled = p.appointment?.scheduledAt ?? p.bookingDraft?.scheduledAt;
        const badge = statusBadge(p.status);
        return (
          <tr key={p.id}>
            <td>
              <span className={`pay-badge ${badge.cls}`}>{badge.label}</span>
            </td>
            <td>
              <strong>{doctorName}</strong>
            </td>
            <td>{scheduled ? formatDate(scheduled) : "—"}</td>
            <td>{formatCents(p.amountCents, p.currency)}</td>
            <td>{p.confirmedAt ? formatDate(p.confirmedAt) : formatDate(p.createdAt ?? "")}</td>
            <td>
              <div className="pay-actions">
                {p.receiptUrl && (
                  <a href={p.receiptUrl} target="_blank" rel="noopener noreferrer" className="pay-action-link">
                    Receipt
                  </a>
                )}
                <button type="button" className="pay-action-link" onClick={() => handleInvoice(p.id)}>
                  Invoice
                </button>
              </div>
            </td>
          </tr>
        );
      }),
    [payments, showToast],
  );

  return (
    <>
      <DashPageHeader
        subtitle="🏥 Patient Dashboard"
        title="Payment History"
        dateStr={todayFormatted()}
      />

      <DashCard title="💳 Your Payments">
        <div className="pay-filters">
          <input
            type="search"
            placeholder="Search by doctor or transaction..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pay-search"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="pay-filter-select"
          >
            <option value="">All statuses</option>
            <option value="SUCCEEDED">Paid</option>
            <option value="REFUNDED">Refunded</option>
            <option value="FAILED">Failed</option>
            <option value="REQUIRES_PAYMENT_METHOD">Pending</option>
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="pt-table pay-history-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Doctor</th>
                <th>Appointment</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentsQuery.isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 24, color: "var(--gray-400)" }}>
                    Loading payments...
                  </td>
                </tr>
              ) : rows.length > 0 ? (
                rows
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 24, color: "var(--gray-400)" }}>
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="pay-pagination">
            <DashButton variant="outline" onClick={() => page > 1 && setPage((p) => p - 1)}>
              Previous
            </DashButton>
            <span>
              Page {meta.page} of {meta.totalPages}
            </span>
            <DashButton variant="outline" onClick={() => page < meta.totalPages && setPage((p) => p + 1)}>
              Next
            </DashButton>
          </div>
        )}
      </DashCard>
    </>
  );
}
