"use client";

import {
  AdminButton,
  AdminPanel,
  FormGrid,
  FormItem,
  ToggleRow,
  ToggleSwitch,
} from "@/components/admin/ui/AdminPrimitives";
import { useAdminUiStore } from "@/store/admin-ui.store";

const sections = [
  "Our Mission & Values",
  "Content Creation Process",
  "Medical Review Standards",
  "Sourcing & Citation Policy",
  "Conflict of Interest Disclosure",
  "Corrections & Updates Policy",
  "Advertising & Sponsorship Policy",
];

// TODO: connect editorial policy CMS API when backend exists
export function EditorialPolicyPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);

  return (
    <>
      <AdminPanel
        title="📜 Editorial Policy Page Content"
        actions={
          <>
            <AdminButton onClick={() => showToast("Preview opened in new tab")}>👁 Preview Live Page</AdminButton>
            <AdminButton variant="primary" onClick={() => showToast("Editorial Policy saved & published")}>
              Save & Publish
            </AdminButton>
          </>
        }
        bodyClassName="panel-bd"
      >
        <FormGrid>
          <FormItem label="Page Title" full>
            <input defaultValue="Editorial Policy" />
          </FormItem>
          <FormItem label="Hero Subtitle" full>
            <textarea defaultValue="DrInsight is committed to providing accurate, evidence-based medical information reviewed by licensed healthcare professionals." />
          </FormItem>
          <FormItem label="Last Updated Date">
            <input type="date" defaultValue="2026-06-01" />
          </FormItem>
          <FormItem label="Version Number">
            <input defaultValue="2.1" />
          </FormItem>
        </FormGrid>
      </AdminPanel>
      <AdminPanel
        title="📑 Policy Sections"
        actions={
          <AdminButton variant="primary" onClick={() => showToast("New section added")}>
            + Add Section
          </AdminButton>
        }
        bodyClassName="panel-bd"
      >
        {sections.map((section, i) => (
          <ToggleRow
            key={section}
            title={`${i + 1}. ${section}`}
            subtitle="Last edited 12 days ago"
            actions={
              <>
                <AdminButton onClick={() => showToast(`Opening editor for: ${section}`)}>Edit</AdminButton>
                <ToggleSwitch defaultChecked onChange={() => showToast("Section visibility updated")} />
              </>
            }
          />
        ))}
      </AdminPanel>
    </>
  );
}
