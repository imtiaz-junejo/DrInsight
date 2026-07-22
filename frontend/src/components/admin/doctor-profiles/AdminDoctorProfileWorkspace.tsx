"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminDoctorBioPreview } from "@/components/admin/doctor-profiles/AdminDoctorBioPreview";
import { AdminDoctorContentPanel } from "@/components/admin/doctor-profiles/AdminDoctorContentPanel";
import { AdminDoctorProfileControls } from "@/components/admin/doctor-profiles/AdminDoctorProfileControls";
import { AdminDoctorProfileForm } from "@/components/admin/doctor-profiles/AdminDoctorProfileForm";
import { AdminButton, AdminPanel, StatusChip } from "@/components/admin/ui/AdminPrimitives";
import { buildPhysicianSchema } from "@/lib/admin-doctor-seo";
import { adminDoctorProfileSchema, type AdminDoctorProfileFormValues } from "@/lib/admin-doctor-profile-schema";
import { adminFormToApiPayload, doctorToAdminForm } from "@/lib/admin-doctor-profile-mapper";
import { uploadFile, validateImageFile } from "@/lib/upload";
import type { DoctorProfile } from "@/services/api-hooks";
import {
  useAdminDoctorDetail,
  useResetAdminDoctorSeo,
  useUpdateAdminDoctorProfile,
} from "@/services/admin-api-hooks";
import { useAdminUiStore } from "@/store/admin-ui.store";

interface Props {
  doctorId: string;
  editMode: boolean;
  onToggleEdit: () => void;
}

export function AdminDoctorProfileWorkspace({ doctorId, editMode, onToggleEdit }: Props) {
  const showToast = useAdminUiStore((s) => s.showToast);
  const detailQuery = useAdminDoctorDetail(doctorId);
  const updateProfile = useUpdateAdminDoctorProfile();
  const resetSeo = useResetAdminDoctorSeo();
  const [schemaManual, setSchemaManual] = useState(false);

  const doctor = detailQuery.data;
  const defaultValues = useMemo(() => (doctor ? doctorToAdminForm(doctor) : undefined), [doctor]);

  const form = useForm<AdminDoctorProfileFormValues>({
    resolver: zodResolver(adminDoctorProfileSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
      setSchemaManual(false);
    }
  }, [defaultValues, form]);

  const values = form.watch();

  useEffect(() => {
    if (!doctor || schemaManual) return;
    const schema = buildPhysicianSchema({
      name: values.fullName,
      specialty: values.specialty,
      bioShort: values.bioShort,
      metaTitle: values.metaTitle,
      metaDesc: values.metaDesc,
      expertise: values.expertise?.split(",").map((item) => item.trim()).filter(Boolean),
      languages: values.languages?.split(",").map((item) => item.trim()).filter(Boolean),
      institution: values.institution,
      education: values.education,
      seoFocus: values.seoFocus,
      seoSecondary: values.seoSecondary,
      url: values.seoUrl ?? "",
      facebook: values.facebook,
      twitter: values.twitter,
      youtube: values.youtube,
      instagram: values.instagram,
      linkedin: values.linkedin,
      rating: doctor.rating,
      reviewCount: doctor.reviewCount,
    });
    if (form.getValues("schema") !== schema) {
      form.setValue("schema", schema, { shouldDirty: false });
    }
  }, [
    values.fullName,
    values.specialty,
    values.bioShort,
    values.metaTitle,
    values.metaDesc,
    values.expertise,
    values.languages,
    values.institution,
    values.education,
    values.seoFocus,
    values.seoSecondary,
    values.seoUrl,
    values.facebook,
    values.twitter,
    values.youtube,
    values.instagram,
    values.linkedin,
    doctor,
    schemaManual,
    form,
  ]);

  const handleAvatarChange = useCallback(
    async (file: File) => {
      const error = validateImageFile(file);
      if (error) {
        showToast(error);
        return;
      }
      const url = await uploadFile(file, "drinsight/avatars");
      form.setValue("avatarUrl", url, { shouldDirty: true });
      showToast("🖼️ Photo added — click Save Doctor SEO to publish");
    },
    [form, showToast],
  );

  const handleSave = form.handleSubmit(async (formValues) => {
    if (!doctor) return;
    try {
      await updateProfile.mutateAsync({
        doctorId: doctor.id,
        ...adminFormToApiPayload(formValues),
      });
      showToast("✅ Saved — profile and SEO updated");
    } catch {
      showToast("Save failed — please try again");
    }
  });

  const handleResetSeo = () => {
    if (!doctor) return;
    resetSeo.mutate(doctor.id, {
      onSuccess: () => {
        showToast("SEO reset to defaults");
        detailQuery.refetch();
      },
    });
  };

  const handleCopySchema = async () => {
    const schema = form.getValues("schema");
    if (!schema) {
      showToast("Open the editor to copy the schema");
      return;
    }
    try {
      await navigator.clipboard.writeText(schema);
      showToast("📋 Schema copied");
    } catch {
      showToast("Could not copy schema");
    }
  };

  if (detailQuery.isLoading) {
    return <AdminPanel title="Loading doctor workspace...">Fetching profile from database...</AdminPanel>;
  }

  if (detailQuery.isError || !doctor) {
    return (
      <AdminPanel title="Profile unavailable">
        <p style={{ fontSize: "0.84rem", color: "var(--gray-700)" }}>
          Could not load this doctor profile. Please go back and try again.
        </p>
      </AdminPanel>
    );
  }

  const suspended = doctor.user?.status === "SUSPENDED";
  const hasCustomSeo = Boolean(doctor.seoMetaTitle || doctor.profileSlug);
  const doctorName = values.fullName || `Dr. ${doctor.user?.firstName ?? ""} ${doctor.user?.lastName ?? ""}`.trim();

  return (
    <FormProvider {...form}>
      <AdminPanel
        title={`👨‍⚕️ Editing: ${doctorName}`}
        actions={
          <div className="btn-row">
            <StatusChip label={doctor.specialty} className="ch-b" />
            {suspended ? <StatusChip label="🚫 Suspended" className="ch-r" /> : <StatusChip label="Active" className="ch-g" />}
            <AdminButton variant={editMode ? "green" : undefined} onClick={onToggleEdit}>
              {editMode ? "✓ Done Editing" : "✏️ Edit Profile & SEO"}
            </AdminButton>
          </div>
        }
      >
        {editMode ? <AdminDoctorProfileForm doctor={doctor} onAvatarChange={handleAvatarChange} /> : null}
        <div className="prw-grid">
          <div>
            <AdminDoctorBioPreview values={values} doctor={doctor} suspended={suspended} />
          </div>
          <div className="prw-controls">
            <AdminDoctorProfileControls
              doctor={doctor}
              hasCustomSeo={hasCustomSeo}
              onSave={handleSave}
              onResetSeo={handleResetSeo}
              onCopySchema={handleCopySchema}
              saving={updateProfile.isPending}
            />
          </div>
        </div>
      </AdminPanel>
      <AdminDoctorContentPanel doctorId={doctor.id} doctorName={doctorName} />
    </FormProvider>
  );
}
