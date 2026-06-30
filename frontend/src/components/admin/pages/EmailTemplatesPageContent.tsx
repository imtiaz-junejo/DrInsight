"use client";

import {
  AdminButton,
  AdminPanel,
  TemplateItem,
  ToggleSwitch,
} from "@/components/admin/ui/AdminPrimitives";
import { useAdminUiStore } from "@/store/admin-ui.store";

const emailTemplates: Record<string, string> = {
  "Welcome / Registration": "👋",
  "Email Verification": "✅",
  "Password Reset": "🔑",
  "Appointment Confirmation": "📅",
  "Appointment Reminder (24h)": "⏰",
  "Appointment Cancelled": "❌",
  "Article Approved": "📰",
  "Article Rejected": "📝",
  "Doctor Account Verified": "🩺",
  "Weekly Newsletter": "📧",
};

// TODO: connect email templates API when backend exists
export function EmailTemplatesPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);

  return (
    <AdminPanel
      title="✉️ Automated Email Templates"
      actions={
        <AdminButton variant="primary" onClick={() => showToast("New template created")}>
          + New Template
        </AdminButton>
      }
      bodyClassName="panel-bd"
    >
      {Object.entries(emailTemplates).map(([name, icon]) => (
        <TemplateItem
          key={name}
          icon={icon}
          title={name}
          subtitle="Sent automatically · Last edited 2 weeks ago"
          actions={
            <>
              <AdminButton onClick={() => showToast(`Opening editor: ${name}`)}>Edit</AdminButton>
              <ToggleSwitch defaultChecked onChange={(checked) => showToast(`${name} ${checked ? "enabled" : "disabled"}`)} />
            </>
          }
        />
      ))}
    </AdminPanel>
  );
}
