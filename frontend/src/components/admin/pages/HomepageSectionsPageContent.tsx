"use client";

import {
  AdminButton,
  AdminPanel,
  ToggleRow,
  ToggleSwitch,
} from "@/components/admin/ui/AdminPrimitives";
import { useAdminUiStore } from "@/store/admin-ui.store";

const sections = [
  "Hero Banner",
  "Trust Badges Strip",
  "Featured Specialties",
  "Top Health Tools",
  "Latest Articles",
  "Meet Our Doctors",
  "Patient Testimonials",
  "Newsletter Signup",
  "Statistics Counter",
  "App Download CTA",
];

// TODO: connect homepage CMS API when backend exists
export function HomepageSectionsPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);

  return (
    <AdminPanel
      title="🏠 Homepage Section Order & Visibility"
      actions={
        <AdminButton variant="primary" onClick={() => showToast("Changes published to live site")}>
          Publish Changes
        </AdminButton>
      }
      bodyClassName="panel-bd"
    >
      {sections.map((section, i) => (
        <ToggleRow
          key={section}
          title={`${i + 1}. ${section}`}
          subtitle={`Position ${i + 1} on homepage`}
          actions={
            <>
              <AdminButton onClick={() => showToast(`Opening editor: ${section}`)}>Edit</AdminButton>
              <AdminButton onClick={() => showToast("Move up")}>↑</AdminButton>
              <AdminButton onClick={() => showToast("Move down")}>↓</AdminButton>
              <ToggleSwitch defaultChecked onChange={(checked) => showToast(`${section} ${checked ? "shown" : "hidden"}`)} />
            </>
          }
        />
      ))}
    </AdminPanel>
  );
}
