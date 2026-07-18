"use client";

import { useMemo, useState } from "react";
import {
  AdminButton,
  AdminPanel,
  BarChart,
  FilterPills,
  PanelTable,
  StatCardRow,
  StatusChip,
  UserCell,
} from "@/components/admin/ui/AdminPrimitives";
import { adminUserProfileHref } from "@/lib/admin-routes";
import { formatNumber } from "@/lib/admin-utils";
import { formatDate } from "@/lib/data-mappers";
import {
  useAdminPaymentAnalytics,
  useAdminPayments,
  useRefundPayment,
} from "@/services/admin-api-hooks";
import { useAdminUiStore } from "@/store/admin-ui.store";
import { api } from "@/lib/api";

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function paymentStatusChip(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    SUCCEEDED: { label: "Paid", className: "st-paid" },
    REFUNDED: { label: "Refunded", className: "st-refund" },
    FAILED: { label: "Failed", className: "st-failed" },
    CANCELLED: { label: "Cancelled", className: "st-cancel" },
    REQUIRES_PAYMENT_METHOD: { label: "Pending", className: "st-pending" },
    PROCESSING: { label: "Processing", className: "st-pending" },
  };
  return map[status] ?? { label: status, className: "st-pending" };
}

export function PaymentsManagementPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [page, setPage] = useState(1);
  const [filterIndex, setFilterIndex] = useState(0);
  const [search, setSearch] = useState("");

  const statusMap = ["", "SUCCEEDED", "FAILED", "REQUIRES_PAYMENT_METHOD", "REFUNDED"];
  const status = statusMap[filterIndex];

  const paymentsQuery = useAdminPayments({ page, limit: 15, status: status || undefined, search: search || undefined });
  const analyticsQuery = useAdminPaymentAnalytics();
  const refundMutation = useRefundPayment();

  const payments = paymentsQuery.data?.data ?? [];
  const meta = paymentsQuery.data?.meta;
  const analytics = analyticsQuery.data;

  const monthlyChart = useMemo(() => {
    return (analytics?.monthlyRevenue ?? []).map((m) => ({
      label: m.month.slice(5),
      value: Math.round(m.amountCents / 100),
      display: formatCents(m.amountCents),
    }));
  }, [analytics?.monthlyRevenue]);

  const dailyChart = useMemo(() => {
    return (analytics?.dailyRevenue ?? []).slice(-14).map((d) => ({
      label: d.day.slice(8),
      value: Math.round(d.amountCents / 100),
      display: formatCents(d.amountCents),
    }));
  }, [analytics?.dailyRevenue]);

  const handleExport = async () => {
    try {
      const response = await api.get("/payments/admin/export", {
        params: { status: status || undefined, search: search || undefined },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "payments-export.csv";
      link.click();
      window.URL.revokeObjectURL(url);
      showToast("CSV exported");
    } catch {
      showToast("Export failed");
    }
  };

  const rows = payments.map((p) => {
    const doctor = p.bookingDraft?.doctor?.user;
    const patient = p.bookingDraft?.patient?.user;
    const chip = paymentStatusChip(p.status);
    return [
      <UserCell key={`p-${p.id}`} firstName={patient?.firstName} lastName={patient?.lastName} sub={patient?.email} userId={(patient as { id?: string })?.id} />,
      <UserCell key={`d-${p.id}`} firstName={doctor?.firstName} lastName={doctor?.lastName} sub="Doctor" userId={(doctor as { id?: string })?.id} />,
      formatCents(p.amountCents),
      p.confirmedAt ? formatDate(p.confirmedAt) : formatDate(p.createdAt),
      <StatusChip key={`s-${p.id}`} label={chip.label} className={chip.className} />,
      <div key={`a-${p.id}`} className="btn-row">
        {p.receiptUrl && (
          <a href={p.receiptUrl} target="_blank" rel="noopener noreferrer" className="admin-link-btn">
            Receipt
          </a>
        )}
        {p.status === "SUCCEEDED" && (
          <AdminButton
            variant="danger"
            onClick={() =>
              refundMutation.mutate(
                { id: p.id, reason: "Admin refund" },
                { onSuccess: () => showToast("Refund initiated") },
              )
            }
          >
            Refund
          </AdminButton>
        )}
      </div>,
    ];
  });

  return (
    <>
      <StatCardRow
        items={[
          {
            ic: "ic1",
            icon: "💰",
            num: analyticsQuery.isLoading ? "—" : formatCents(analytics?.totalRevenueCents ?? 0),
            label: "Total Revenue",
            tag: `${analytics?.succeededPayments ?? 0} paid`,
            tagClass: "tt-g",
          },
          {
            ic: "ic2",
            icon: "✅",
            num: analyticsQuery.isLoading ? "—" : `${analytics?.successRate ?? 0}%`,
            label: "Success Rate",
            tag: "All payments",
            tagClass: "tt-g",
          },
          {
            ic: "ic3",
            icon: "❌",
            num: analyticsQuery.isLoading ? "—" : formatNumber(analytics?.failedPayments ?? 0),
            label: "Failed",
            tag: "Needs review",
            tagClass: "tt-r",
          },
          {
            ic: "ic4",
            icon: "⏳",
            num: analyticsQuery.isLoading ? "—" : formatNumber(analytics?.pendingPayments ?? 0),
            label: "Pending",
            tag: "Awaiting payment",
            tagClass: "tt-b",
          },
        ]}
      />

      <div className="admin-charts-row">
        <AdminPanel title="📈 Monthly Revenue" bodyClassName="panel-bd">
          <BarChart data={monthlyChart.length ? monthlyChart : [{ label: "—", value: 0, display: "$0" }]} />
        </AdminPanel>
        <AdminPanel title="📊 Daily Revenue (14 days)" bodyClassName="panel-bd">
          <BarChart
            data={dailyChart.length ? dailyChart : [{ label: "—", value: 0, display: "$0" }]}
            barStyle={{ background: "linear-gradient(180deg,#1a56a0,#2563eb)" }}
          />
        </AdminPanel>
      </div>

      <AdminPanel
        title="💳 Payments Management"
        actions={
          <div className="btn-row">
            <input
              type="search"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="admin-search-input"
            />
            <AdminButton onClick={handleExport}>Export CSV</AdminButton>
          </div>
        }
        bodyClassName="panel-bd"
      >
        <FilterPills
          filters={["All", "Paid", "Failed", "Pending", "Refunded"]}
          activeIndex={filterIndex}
          onChange={(i) => {
            setFilterIndex(i);
            setPage(1);
          }}
        />
        <PanelTable
          title=""
          headers={["Patient", "Doctor", "Amount", "Date", "Status", "Actions"]}
          rows={paymentsQuery.isLoading ? [] : rows}
          emptyMessage={paymentsQuery.isLoading ? "Loading..." : "No payments found"}
        />
        {meta && meta.totalPages > 1 && (
          <div className="admin-pagination">
            <AdminButton onClick={() => page > 1 && setPage((p) => p - 1)}>Previous</AdminButton>
            <span>
              Page {meta.page} of {meta.totalPages}
            </span>
            <AdminButton onClick={() => page < meta.totalPages && setPage((p) => p + 1)}>Next</AdminButton>
          </div>
        )}
      </AdminPanel>
    </>
  );
}
