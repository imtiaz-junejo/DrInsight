"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { AdminPanel, PanelLink, StatusChip } from "@/components/admin/ui/AdminPrimitives";
import { formatDateTime, formatNumber } from "@/lib/admin-utils";
import type { AdminDoctorContentItem } from "@/services/admin-api-hooks";
import { useAdminDoctorContent } from "@/services/admin-api-hooks";

function statusChip(statusLabel: string) {
  const normalized = statusLabel.toLowerCase();
  if (normalized.includes("live") || normalized.includes("publish")) return "ch-g";
  if (normalized.includes("review") || normalized.includes("pending")) return "ch-a";
  if (normalized.includes("draft")) return "ch-gray";
  return "ch-b";
}

export function AdminDoctorContentPanel({ doctorId, doctorName }: { doctorId: string; doctorName: string }) {
  const contentQuery = useAdminDoctorContent(doctorId);
  const articles = contentQuery.data?.articles ?? [];
  const publications = contentQuery.data?.publications ?? [];
  const liveArts = articles.filter((item) => item.statusLabel === "Live").length;
  const livePubs = publications.filter((item) => item.statusLabel === "Published").length;

  return (
    <AdminPanel
      title="📰 Articles & Research Publications"
      actions={
        <div className="btn-row">
          <StatusChip label="Auto-listed · read-only" className="ch-gray" />
          <PanelLink href="/admin/review-queue">Article queue →</PanelLink>
          <PanelLink href="/admin/publication-review">Research queue →</PanelLink>
        </div>
      }
    >
      <div className="prw-note" style={{ marginBottom: 12 }}>
        These come from the doctor&apos;s <strong>Submit Article</strong> / <strong>Submit Research</strong>{" "}
        submissions and their review queues. They are shown here read-only and <strong>auto-appear</strong> on{" "}
        <code>{doctorName}</code>&apos;s public profile once <em>Live/Published</em>. {liveArts} article(s) and{" "}
        {livePubs} publication(s) are currently public.
      </div>

      <div style={{ fontFamily: "var(--font-d)", fontSize: ".98rem", fontWeight: 700, color: "var(--gray-900)", margin: "4px 0 8px" }}>
        📝 Articles <span style={{ fontSize: ".74rem", fontWeight: 500, color: "var(--gray-400)" }}>({articles.length})</span>
      </div>
      <ContentTable
        headers={["Title", "Category", "Published", "Views", "Status"]}
        rows={articles}
        loading={contentQuery.isLoading}
        empty="No articles submitted yet."
        renderRow={(item) => [
          <Link key={`${item.id}-t`} href={item.slug ? `/blog/${item.slug}` : "#"} style={{ fontWeight: 600, fontSize: ".84rem" }}>
            {item.title}
          </Link>,
          <StatusChip key={`${item.id}-c`} label={item.category ?? "—"} className="ch-b" />,
          item.date ? formatDateTime(item.date) : "—",
          item.views != null ? <strong key={`${item.id}-v`}>{formatNumber(item.views)}</strong> : "—",
          <StatusChip key={`${item.id}-s`} label={item.statusLabel} className={statusChip(item.statusLabel)} />,
        ]}
      />

      <div style={{ fontFamily: "var(--font-d)", fontSize: ".98rem", fontWeight: 700, color: "var(--gray-900)", margin: "18px 0 8px" }}>
        🔬 Research & Publications{" "}
        <span style={{ fontSize: ".74rem", fontWeight: 500, color: "var(--gray-400)" }}>({publications.length})</span>
      </div>
      <ContentTable
        headers={["Title", "Type", "Venue", "Status"]}
        rows={publications}
        loading={contentQuery.isLoading}
        empty="No research submitted yet."
        renderRow={(item) => [
          <span key={`${item.id}-t`} style={{ fontWeight: 600, fontSize: ".84rem" }}>
            {item.title}
          </span>,
          <StatusChip key={`${item.id}-ty`} label={item.type ?? "—"} className="ch-p" />,
          <span key={`${item.id}-v`} style={{ fontSize: ".78rem", color: "var(--gray-500)" }}>
            {item.venue || "—"}
          </span>,
          <StatusChip key={`${item.id}-s`} label={item.statusLabel} className={statusChip(item.statusLabel)} />,
        ]}
      />
    </AdminPanel>
  );
}

function ContentTable<T extends AdminDoctorContentItem>({
  headers,
  rows,
  loading,
  empty,
  renderRow,
}: {
  headers: string[];
  rows: T[];
  loading: boolean;
  empty: string;
  renderRow: (item: T) => ReactNode[];
}) {
  return (
    <div className="tbl-wrap">
      <table className="rtbl">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={headers.length} style={{ color: "var(--gray-400)" }}>
                Loading...
              </td>
            </tr>
          ) : rows.length ? (
            rows.map((row) => (
              <tr key={row.id}>
                {renderRow(row).map((cell, index) => (
                  <td key={index}>{cell}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} style={{ color: "var(--gray-400)" }}>
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
