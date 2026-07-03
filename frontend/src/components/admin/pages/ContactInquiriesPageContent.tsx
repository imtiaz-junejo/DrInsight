"use client";

import { PanelTable, UserCell } from "@/components/admin/ui/AdminPrimitives";
import { formatDate } from "@/lib/data-mappers";
import { useAdminContactSubmissions } from "@/services/admin-api-hooks";

export function ContactInquiriesPageContent() {
  const query = useAdminContactSubmissions();
  const submissions = query.data ?? [];

  const rows = submissions.map((s) => {
    const parts = s.name.trim().split(/\s+/);
    const firstName = parts[0] ?? s.name;
    const lastName = parts.slice(1).join(" ") || undefined;
    return [
      <UserCell key={`n-${s.id}`} firstName={firstName} lastName={lastName} sub={s.email} />,
    s.email,
    s.subject ?? "General Inquiry",
    s.message.length > 60 ? `${s.message.slice(0, 60)}…` : s.message,
    formatDate(s.createdAt),
    "New",
    "—",
  ];
  });

  return (
    <PanelTable
      title="📩 Contact Form Submissions"
      headers={["Name", "Email", "Subject", "Message Preview", "Received", "Status", "Actions"]}
      rows={query.isLoading ? [] : rows}
      pagerInfo={query.isLoading ? "Loading..." : `Showing ${submissions.length} inquiries`}
      emptyMessage={query.isLoading ? "Loading..." : "No contact inquiries yet"}
    />
  );
}
