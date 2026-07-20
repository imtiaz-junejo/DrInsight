"use client";

import { AccountSettingsExperience } from "@/components/account/AccountSettingsExperience";
import { PhysicianDashboardLabel } from "@/components/doctor/icons/DoctorIcons";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

export function SettingsPageContent() {
  const showToast = useDoctorUiStore((s) => s.showToast);

  return <AccountSettingsExperience subtitle={<PhysicianDashboardLabel />} showToast={showToast} />;
}
