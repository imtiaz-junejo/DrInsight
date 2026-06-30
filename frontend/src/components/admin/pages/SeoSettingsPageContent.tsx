"use client";

import {
  AdminButton,
  AdminPanel,
  FormGrid,
  FormItem,
  StatusChip,
} from "@/components/admin/ui/AdminPrimitives";
import { useAdminUiStore } from "@/store/admin-ui.store";

const pages = [
  ["Homepage", "/", "MedAuthority — Trusted, Doctor-Reviewed Medical Information", "54"],
  ["About Us", "/about", "About MedAuthority — Our Mission, Doctors & Editorial Standards", "62"],
  ["Blog", "/blog", "Medical Health Articles — Expert Doctor-Written Guides | MedAuthority", "70"],
  ["Health Tools", "/health-tools", "Free Health Tools & Medical Calculators | MedAuthority", "54"],
  ["Book Consultation", "/book-consultation", "Book an Online Doctor Consultation — Video, Phone or Chat | MedAuthority", "72"],
  ["Ask a Doctor", "/ask-doctor", "Ask a Doctor Online — Get Answers from Real Specialists | MedAuthority", "70"],
  ["Editorial Policy", "/editorial-policy", "Editorial Policy — How We Ensure Medical Accuracy | MedAuthority", "65"],
  ["Author Guidelines", "/author-guidelines", "Author Guidelines — Write Medical Articles for MedAuthority", "60"],
];

// TODO: connect SEO settings CMS API when backend exists
export function SeoSettingsPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);

  return (
    <>
      <AdminPanel
        title="🔍 Page-Level SEO Settings"
        actions={
          <>
            <AdminButton onClick={() => showToast("Opening full SEO strategy doc...")}>📄 Full SEO Strategy</AdminButton>
            <AdminButton variant="primary" onClick={() => showToast("Sitemap regenerated")}>
              🔄 Regenerate Sitemap
            </AdminButton>
          </>
        }
      >
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Page</th>
                <th>Permalink</th>
                <th>Meta Title</th>
                <th>Length</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(([name, path, title, len]) => (
                <tr key={path}>
                  <td>
                    <strong>{name}</strong>
                  </td>
                  <td>
                    <code style={{ fontSize: "0.76rem", color: "var(--green)", background: "#f0fdf4", padding: "2px 7px", borderRadius: 5 }}>
                      {path}
                    </code>
                  </td>
                  <td style={{ maxWidth: 320 }}>{title}</td>
                  <td>
                    <StatusChip label={`${len} chars`} className={Number(len) <= 60 ? "ch-g" : "ch-a"} />
                  </td>
                  <td>
                    <div className="btn-row">
                      <AdminButton onClick={() => showToast(`Opening SEO editor: ${name}`)}>Edit SEO</AdminButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
      <AdminPanel
        title="⚙️ Global SEO Settings"
        actions={
          <AdminButton variant="primary" onClick={() => showToast("Global SEO settings saved")}>
            Save Changes
          </AdminButton>
        }
        bodyClassName="panel-bd"
      >
        <FormGrid>
          <FormItem label="Default Meta Title Suffix" full>
            <input defaultValue=" | MedAuthority" />
          </FormItem>
          <FormItem label="Default Meta Description" full>
            <textarea defaultValue="Evidence-based medical information reviewed by board-certified physicians." />
          </FormItem>
          <FormItem label="Google Search Console">
            <input defaultValue="Connected ✓" disabled />
          </FormItem>
          <FormItem label="XML Sitemap URL">
            <input defaultValue="https://medauthority.com/sitemap.xml" disabled />
          </FormItem>
        </FormGrid>
      </AdminPanel>
    </>
  );
}
