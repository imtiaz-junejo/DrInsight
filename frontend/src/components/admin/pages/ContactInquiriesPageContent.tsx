"use client";

import { PanelTable } from "@/components/admin/ui/AdminPrimitives";

// TODO: connect GET /contact/submissions when backend admin endpoint exists
export function ContactInquiriesPageContent() {
  return (
    <PanelTable
      title="📩 Contact Form Submissions"
      headers={["Name", "Email", "Subject", "Message Preview", "Received", "Status", "Actions"]}
      rows={[]}
      pagerInfo="Showing 0 of 0 inquiries — TODO: contact submissions list API"
      emptyMessage="No contact inquiries — admin list endpoint missing"
    />
  );
}
