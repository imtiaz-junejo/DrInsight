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
  "Why Write for Us",
  "Who Can Contribute",
  "Qualification Standards",
  "Types of Content",
  "Pre-Submission Checklist",
  "Required Article Structure",
  "Writing Style Guide",
  "Evidence & Source Standards",
  "Submission Process",
  "Author Rights & Payments",
  "Conflict of Interest Policy",
];

// TODO: connect author guidelines CMS API when backend exists
export function AuthorGuidelinesPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);

  return (
    <>
      <AdminPanel
        title="📘 Author Guidelines Page Content"
        actions={
          <>
            <AdminButton onClick={() => showToast("Preview opened in new tab")}>👁 Preview Live Page</AdminButton>
            <AdminButton variant="primary" onClick={() => showToast("Author Guidelines saved & published")}>
              Save & Publish
            </AdminButton>
          </>
        }
        bodyClassName="panel-bd"
      >
        <FormGrid>
          <FormItem label="Page Title" full>
            <input defaultValue="Author Guidelines" />
          </FormItem>
          <FormItem label="Hero Subtitle" full>
            <textarea defaultValue="Everything you need to know about writing for DrInsight — from qualification standards and submission requirements to style guides and editorial standards." />
          </FormItem>
          <FormItem label="Last Updated Date">
            <input type="date" defaultValue="2026-06-01" />
          </FormItem>
          <FormItem label="Honorarium Rate (USD per article)">
            <input defaultValue="150 – 400" />
          </FormItem>
        </FormGrid>
      </AdminPanel>
      <AdminPanel
        title="📑 Guideline Sections"
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
            subtitle="Last edited 8 days ago"
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
