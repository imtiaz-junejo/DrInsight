"use client";

import {
  AdminButton,
  AdminPanel,
  TemplateItem,
  ToggleSwitch,
} from "@/components/admin/ui/AdminPrimitives";
import { useAdminUiStore } from "@/store/admin-ui.store";

const tools = [
  ["⚖️", "BMI Calculator", "Body Mass Index assessment"],
  ["❤️", "Heart Risk Calculator", "10-year cardiovascular risk score"],
  ["🩸", "Diabetes Risk Assessment", "Type 2 diabetes risk screener"],
  ["🧠", "PHQ-9 Depression Screener", "Mental health screening tool"],
  ["🫁", "Lung Age Calculator", "Estimates lung age from spirometry"],
  ["💓", "Blood Pressure Tracker", "Log and trend BP readings"],
  ["🍽️", "Calorie Calculator", "Daily calorie needs estimator"],
  ["🫘", "eGFR / Kidney Function", "Kidney function estimator"],
];

// TODO: connect health tools CMS/analytics API when backend exists
export function HealthToolsPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);

  return (
    <AdminPanel
      title="🧮 Health Tools & Calculators"
      actions={
        <AdminButton variant="primary" onClick={() => showToast("New tool created")}>
          + New Tool
        </AdminButton>
      }
      bodyClassName="panel-bd"
    >
      {tools.map(([icon, name, desc]) => (
        <TemplateItem
          key={name}
          icon={icon}
          title={name}
          subtitle={`${desc} · — uses (30d) — TODO: usage analytics API`}
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
