"use client";

import { useState } from "react";
import { InquiryDetailsDrawer } from "@/components/admin/site-management/InquiryDetailsDrawer";
import {
  AdminButton,
  AdminPagination,
  AdminPanel,
  FilterPills,
  PanelTable,
  StatusChip,
  UserCell,
} from "@/components/admin/ui/AdminPrimitives";
import { formatRelativeTime } from "@/lib/data-mappers";
import { useAdminUiStore } from "@/store/admin-ui.store";
import {
  useAdminContactInquiries,
  useDeleteContactInquiry,
  useUpdateContactStatus,
  type ContactInquiry,
} from "@/services/cms-api-hooks";

const STATUS_FILTERS = ["All", "New", "In Progress", "Resolved", "Archived"] as const;
const STATUS_MAP: Record<(typeof STATUS_FILTERS)[number], string | undefined> = {
  All: undefined,
  New: "NEW",
  "In Progress": "IN_PROGRESS",
  Resolved: "RESOLVED",
  Archived: "ARCHIVED",
};

function statusChip(status: string) {
  if (status === "RESOLVED") return { label: "Resolved", className: "ch-g" };
  if (status === "IN_PROGRESS") return { label: "In Progress", className: "ch-b" };
  if (status === "ARCHIVED") return { label: "Archived", className: "ch-b" };
  return { label: "New", className: "ch-a" };
}

export function ContactInquiriesPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusIdx, setStatusIdx] = useState(0);
  const [viewing, setViewing] = useState<ContactInquiry | null>(null);

  const query = useAdminContactInquiries({
    page,
    limit: 20,
    search: search || undefined,
    status: STATUS_MAP[STATUS_FILTERS[statusIdx]],
  });
  const updateStatus = useUpdateContactStatus();
  const deleteInquiry = useDeleteContactInquiry();
  const submissions = query.data?.data ?? [];
  const meta = query.data?.meta;

  const rows = submissions.map((s) => {
    const parts = s.name.trim().split(/\s+/);
    const status = statusChip(s.status);
    return [
      <UserCell key={`n-${s.id}`} firstName={parts[0]} lastName={parts.slice(1).join(" ") || undefined} sub={s.email} />,
      s.email,
      s.subject ?? "General Inquiry",
      s.message.length > 60 ? `${s.message.slice(0, 60)}…` : s.message,
      formatRelativeTime(s.createdAt),
      <StatusChip key={`st-${s.id}`} label={status.label} className={status.className} />,
      <div key={`a-${s.id}`} className="btn-row">
        <AdminButton onClick={() => setViewing(s)}>View</AdminButton>
        {status.label !== "Resolved" ? (
          <AdminButton
            variant="green"
            onClick={() =>
              updateStatus.mutate(
                { id: s.id, status: "RESOLVED" },
                { onSuccess: () => showToast("Marked as resolved ✓") },
              )
            }
          >
            Resolve
          </AdminButton>
        ) : null}
        <AdminButton
          variant="danger"
          onClick={() => {
            if (!confirm("Delete this inquiry?")) return;
            deleteInquiry.mutate(s.id, { onSuccess: () => showToast("Inquiry deleted") });
          }}
        >
          Delete
        </AdminButton>
      </div>,
    ];
  });

  return (
    <>
      <AdminPanel title="📩 Contact Form Submissions" bodyClassName="panel-bd">
        <div className="search-bar" style={{ marginBottom: 12 }}>
          <input
            placeholder="Search inquiries..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearch(searchInput)}
          />
          <AdminButton onClick={() => { setSearch(searchInput); setPage(1); }}>Search</AdminButton>
        </div>
        <FilterPills
          filters={[...STATUS_FILTERS]}
          activeIndex={statusIdx}
          onChange={(i) => {
            setStatusIdx(i);
            setPage(1);
          }}
        />
      </AdminPanel>
      <PanelTable
        title=""
        headers={["Name", "Email", "Subject", "Message Preview", "Received", "Status", "Actions"]}
        rows={query.isLoading ? [] : rows}
        pagerInfo={
          query.isLoading
            ? "Loading..."
            : meta
              ? `Showing ${submissions.length} of ${meta.total} inquiries`
              : `Showing ${submissions.length} inquiries`
        }
        emptyMessage={query.isLoading ? "Loading..." : "No contact inquiries yet"}
      />
      {meta && meta.totalPages > 1 ? (
        <AdminPagination
          info={`Page ${page} of ${meta.totalPages}`}
          page={page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      ) : null}
      {viewing ? <InquiryDetailsDrawer inquiry={viewing} onClose={() => setViewing(null)} /> : null}
    </>
  );
}
