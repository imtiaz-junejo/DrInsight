"use client";

import { AccountSettingsExperience } from "@/components/account/AccountSettingsExperience";
import { usePatientUiStore } from "@/store/patient-ui.store";

export function SettingsPageContent() {
  const showToast = usePatientUiStore((s) => s.showToast);

  return <AccountSettingsExperience subtitle="🏥 Patient Dashboard" showToast={showToast} />;
}
