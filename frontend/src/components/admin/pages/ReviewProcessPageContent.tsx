"use client";

import {
  AdminButton,
  AdminPanel,
  FormGrid,
  FormItem,
  KvGrid,
} from "@/components/admin/ui/AdminPrimitives";
import { useAdminUiStore } from "@/store/admin-ui.store";

// TODO: connect review process settings API when backend CMS exists
export function ReviewProcessPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);

  return (
    <>
      <AdminPanel
        title="⚙️ Review Tier Configuration"
        actions={
          <AdminButton variant="primary" onClick={() => showToast("Settings saved")}>
            Save Changes
          </AdminButton>
        }
        bodyClassName="panel-bd"
      >
        <FormGrid>
          <FormItem label="Tier 1 — Minimum years post-qualification">
            <input type="number" defaultValue={5} />
          </FormItem>
          <FormItem label="Tier 2 — Minimum years clinical experience">
            <input type="number" defaultValue={7} />
          </FormItem>
          <FormItem label="Standard review deadline (business days)">
            <input type="number" defaultValue={7} />
          </FormItem>
          <FormItem label="Maximum revision cycles">
            <input type="number" defaultValue={2} />
          </FormItem>
          <FormItem label="Author revision window (business days)">
            <input type="number" defaultValue={5} />
          </FormItem>
          <FormItem label="Minimum sources per clinical article">
            <input type="number" defaultValue={5} />
          </FormItem>
        </FormGrid>
      </AdminPanel>
      <AdminPanel title="🔄 Content Currency Schedule" bodyClassName="panel-bd">
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Content Type</th>
                <th>Review Cycle (months)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Drug & Medication Guides", "6"],
                ["Clinical Overview Articles", "12"],
                ["Oncology Content", "6"],
                ["Mental Health Articles", "12"],
                ["Pediatric Content", "12"],
                ["Research Explainers", "24"],
              ].map(([type, cycle]) => (
                <tr key={type}>
                  <td>{type}</td>
                  <td>{cycle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
      <AdminPanel title="👨‍⚕️ Active Reviewer Pool" bodyClassName="panel-bd">
        <KvGrid
          items={[
            { value: "—", label: "Tier 1 — Specialty Reviewers" },
            { value: "—", label: "Tier 2 — General Reviewers" },
            { value: "—", label: "Tier 3 — Allied Health Reviewers" },
          ]}
        />
      </AdminPanel>
    </>
  );
}
