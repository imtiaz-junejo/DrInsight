"use client";

import { PanelTable } from "@/components/admin/ui/AdminPrimitives";

// TODO: connect GET /prescriptions admin list when backend supports ADMIN role access
export function PrescriptionsPageContent() {
  return (
    <PanelTable
      title="💊 Issued Prescriptions"
      actions={
        <div className="panel-search">
          <input placeholder="Search by patient or drug..." />
        </div>
      }
      headers={["Patient", "Doctor", "Medication", "Dosage", "Issued", "Status"]}
      rows={[]}
      pagerInfo="Showing 0 of 0 prescriptions — TODO: admin prescriptions API"
      emptyMessage="No prescriptions available — admin prescriptions endpoint missing"
    />
  );
}
