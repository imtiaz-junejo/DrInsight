"use client";

import {
  AdminButton,
  AdminPanel,
  ToggleRow,
  ToggleSwitch,
} from "@/components/admin/ui/AdminPrimitives";
import { useAdminUiStore } from "@/store/admin-ui.store";

const faqs = [
  ["How does MedAuthority review medical content?", "Editorial"],
  ["How do I book a consultation?", "Consultations"],
  ["Is my health data secure?", "Privacy & Security"],
  ["How do I become a contributing author?", "Authors"],
  ["Can I get a refund for a cancelled consultation?", "Billing"],
  ["How do I reset my password?", "Account"],
];

// TODO: connect FAQ CMS API when backend exists
export function FaqsPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);

  return (
    <AdminPanel
      title="❓ Frequently Asked Questions"
      actions={
        <AdminButton variant="primary" onClick={() => showToast("New FAQ added")}>
          + Add FAQ
        </AdminButton>
      }
      bodyClassName="panel-bd"
    >
      {faqs.map(([question, category], i) => (
        <ToggleRow
          key={question}
          title={`${i + 1}. ${question}`}
          subtitle={`Category: ${category}`}
          actions={
            <>
              <AdminButton onClick={() => showToast("Opening editor...")}>Edit</AdminButton>
              <AdminButton variant="danger" onClick={() => showToast("FAQ deleted")}>
                Delete
              </AdminButton>
              <ToggleSwitch defaultChecked onChange={() => showToast("Visibility updated")} />
            </>
          }
        />
      ))}
    </AdminPanel>
  );
}
