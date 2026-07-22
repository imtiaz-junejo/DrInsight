"use client";

import { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminPatientBioPreview } from "@/components/admin/patient-profiles/AdminPatientBioPreview";
import { AdminPatientContentPanel } from "@/components/admin/patient-profiles/AdminPatientContentPanel";
import { AdminPatientProfileControls } from "@/components/admin/patient-profiles/AdminPatientProfileControls";
import { AdminPatientProfileForm } from "@/components/admin/patient-profiles/AdminPatientProfileForm";
import { AdminButton, AdminPanel, StatusChip } from "@/components/admin/ui/AdminPrimitives";
import { adminFormToPatientPayload, patientToAdminForm } from "@/lib/admin-patient-profile-mapper";
import { adminPatientProfileSchema, type AdminPatientProfileFormValues } from "@/lib/admin-patient-profile-schema";
import { useAdminPatientDetail, useUpdateAdminPatientProfile } from "@/services/admin-api-hooks";
import { useAdminUiStore } from "@/store/admin-ui.store";

interface Props {
  patientId: string;
  editMode: boolean;
  onToggleEdit: () => void;
}

export function AdminPatientProfileWorkspace({ patientId, editMode, onToggleEdit }: Props) {
  const showToast = useAdminUiStore((s) => s.showToast);
  const detailQuery = useAdminPatientDetail(patientId);
  const updateProfile = useUpdateAdminPatientProfile();
  const patient = detailQuery.data;
  const defaultValues = useMemo(() => (patient ? patientToAdminForm(patient) : undefined), [patient]);

  const form = useForm<AdminPatientProfileFormValues>({
    resolver: zodResolver(adminPatientProfileSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (defaultValues) form.reset(defaultValues);
  }, [defaultValues, form]);

  const values = form.watch();

  const handleSave = form.handleSubmit(async (formValues) => {
    if (!patient) return;
    try {
      await updateProfile.mutateAsync({
        patientId: patient.id,
        ...adminFormToPatientPayload(formValues),
      });
      showToast("✅ Patient profile saved");
      detailQuery.refetch();
    } catch {
      showToast("Save failed — please try again");
    }
  });

  if (detailQuery.isLoading) {
    return <AdminPanel title="Loading patient workspace...">Fetching profile from database...</AdminPanel>;
  }

  if (detailQuery.isError || !patient) {
    return (
      <AdminPanel title="Profile unavailable">
        <p style={{ fontSize: "0.84rem", color: "var(--gray-700)" }}>
          Could not load this patient profile. Please go back and try again.
        </p>
      </AdminPanel>
    );
  }

  const suspended = patient.user?.status === "SUSPENDED";
  const patientName = values.fullName || `${patient.user?.firstName ?? ""} ${patient.user?.lastName ?? ""}`.trim();

  return (
    <FormProvider {...form}>
      <AdminPanel
        title={`Patient: ${patientName}`}
        actions={
          <div className="btn-row">
            {suspended ? <StatusChip label="🚫 Suspended" className="ch-r" /> : <StatusChip label="Active" className="ch-g" />}
            <AdminButton variant={editMode ? "green" : undefined} onClick={onToggleEdit}>
              {editMode ? "✓ Done Editing" : "✏️ Edit Profile"}
            </AdminButton>
          </div>
        }
      >
        {editMode ? <AdminPatientProfileForm /> : null}
        <div className="prw-grid">
          <div>
            <AdminPatientBioPreview values={values} patient={patient} suspended={suspended} />
          </div>
          <div className="prw-controls">
            <AdminPatientProfileControls patient={patient} onSave={handleSave} saving={updateProfile.isPending} />
          </div>
        </div>
      </AdminPanel>
      <AdminPatientContentPanel patientId={patient.id} patientName={patientName} />
    </FormProvider>
  );
}
