"use client";

import { useState } from "react";
import { HealthMetricsContent, HEALTH_VITAL_TYPES, type HealthVitalType } from "@/components/health/HealthMetricsContent";
import {
  useCreatePatientVital,
  usePatientHealthToolHistory,
  usePatientHealthVitals,
} from "@/services/patient-api-hooks";
import { usePatientUiStore } from "@/store/patient-ui.store";
import { useAuthStore } from "@/store/auth.store";

export function HealthPageContent() {
  const showToast = usePatientUiStore((s) => s.showToast);
  const user = useAuthStore((s) => s.user);
  const vitalsQuery = usePatientHealthVitals();
  const toolHistoryQuery = usePatientHealthToolHistory(20);
  const createVital = useCreatePatientVital();
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<HealthVitalType>(HEALTH_VITAL_TYPES[0].type);
  const [formValue, setFormValue] = useState("");

  const handleLog = () => {
    if (!formValue.trim()) {
      showToast("Enter a value");
      return;
    }
    const meta = HEALTH_VITAL_TYPES.find((v) => v.type === formType)!;
    createVital.mutate(
      { type: formType, value: formValue.trim(), unit: meta.unit },
      {
        onSuccess: () => {
          showToast("Vital reading saved");
          setFormValue("");
          setShowForm(false);
        },
        onError: () => showToast("Could not save reading"),
      },
    );
  };

  return (
    <HealthMetricsContent
      role="patient"
      subtitle="🏥 Patient Dashboard"
      vitals={vitalsQuery.data?.data ?? []}
      vitalsLoading={vitalsQuery.isLoading}
      lastRecordedAt={vitalsQuery.data?.lastRecordedAt}
      toolHistory={toolHistoryQuery.data ?? []}
      toolHistoryLoading={toolHistoryQuery.isLoading}
      showForm={showForm}
      onToggleForm={() => setShowForm((v) => !v)}
      formType={formType}
      onFormTypeChange={setFormType}
      formValue={formValue}
      onFormValueChange={setFormValue}
      onSaveVital={handleLog}
      savingVital={createVital.isPending}
      userEmail={user?.email}
      showToast={showToast}
    />
  );
}
