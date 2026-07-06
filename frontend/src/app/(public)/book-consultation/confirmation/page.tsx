"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { usePaymentConfirmation } from "@/services/api-hooks";
import { formatCurrency } from "@/lib/data-mappers";
import "@/styles/book-consultation-page.css";

function consultationLabel(type: string) {
  const map: Record<string, string> = {
    VIDEO: "Video Consultation",
    AUDIO: "Phone Consultation",
    CHAT: "Chat Consultation",
    IN_PERSON: "In-Person",
  };
  return map[type] ?? type;
}

export default function AppointmentConfirmationPage() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId") ?? "";
  const { data, isLoading, isError } = usePaymentConfirmation(appointmentId);

  const downloadInvoice = async () => {
    if (!data?.paymentId) return;
    try {
      const response = await api.get(`/payments/${data.paymentId}/invoice`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${data.invoiceNumber ?? data.paymentId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Unable to download invoice. Please try from your payment history.");
    }
  };

  if (!appointmentId) {
    return (
      <div className="book-consultation-page">
        <div className="confirm-page show">
          <h2>Invalid confirmation link</h2>
          <Link href="/book-consultation" className="cbtn-primary">
            Book a Consultation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="book-consultation-page">
      <div className="confirm-page show">
        {isLoading ? (
          <p>Loading confirmation...</p>
        ) : isError || !data ? (
          <>
            <h2>Confirmation not found</h2>
            <p>Your payment may still be processing. Check your patient dashboard shortly.</p>
            <Link href="/patient/consultations" className="cbtn-primary">
              Go to Dashboard
            </Link>
          </>
        ) : (
          <>
            <div className="confirm-circle success-animate">
              <i className="ti ti-circle-check" aria-hidden="true" />
            </div>
            <h2>Appointment Confirmed!</h2>
            <p>Your payment was successful. A confirmation email has been sent to your inbox.</p>
            <div className="confirm-details">
              <div className="cd-row">
                <span>Appointment ID</span>
                <span>{data.appointmentId}</span>
              </div>
              <div className="cd-row">
                <span>Doctor</span>
                <span>{data.doctor}</span>
              </div>
              <div className="cd-row">
                <span>Specialty</span>
                <span>{data.specialty}</span>
              </div>
              <div className="cd-row">
                <span>Patient</span>
                <span>{data.patient}</span>
              </div>
              <div className="cd-row">
                <span>Date & Time</span>
                <span>{new Date(data.scheduledAt).toLocaleString()}</span>
              </div>
              <div className="cd-row">
                <span>Meeting Type</span>
                <span>{consultationLabel(data.consultationType)}</span>
              </div>
              <div className="cd-row">
                <span>Amount Paid</span>
                <span style={{ color: "#1a56a0" }}>{formatCurrency(data.amountPaid)}</span>
              </div>
              <div className="cd-row">
                <span>Payment Status</span>
                <span className="pay-status-paid">{data.paymentStatus}</span>
              </div>
              <div className="cd-row">
                <span>Transaction ID</span>
                <span className="txn-id">{data.transactionId ?? "—"}</span>
              </div>
              {data.invoiceNumber && (
                <div className="cd-row">
                  <span>Invoice Number</span>
                  <span>{data.invoiceNumber}</span>
                </div>
              )}
            </div>
            <div className="confirm-btns">
              {data.receiptUrl && (
                <a href={data.receiptUrl} target="_blank" rel="noopener noreferrer" className="cbtn-primary">
                  View Receipt
                </a>
              )}
              {data.paymentId && (
                <button type="button" className="cbtn-secondary" onClick={downloadInvoice}>
                  Download Invoice
                </button>
              )}
              <Link href="/patient" className="cbtn-secondary">
                Return to Dashboard
              </Link>
              <Link href="/book-consultation" className="cbtn-secondary">
                Book Another
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
