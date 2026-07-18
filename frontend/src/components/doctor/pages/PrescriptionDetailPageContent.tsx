"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { prescriptionToPreviewData } from "@/lib/prescription-mapper";
import {
  useDeletePrescription,
  useDoctorPrescription,
  useDuplicatePrescription,
  useMarkPrescriptionCompleted,
} from "@/services/doctor-api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";
import { openPatientFromList } from "@/components/doctor/patient/PatientDetailModal";

const EPrescriptionViewer = dynamic(
  () => import("@/components/doctor/patient/EPrescriptionViewer").then((m) => m.EPrescriptionViewer),
  { ssr: false },
);

export function PrescriptionDetailPageContent({ prescriptionId }: { prescriptionId: string }) {
  const router = useRouter();
  const showToast = useDoctorUiStore((s) => s.showToast);
  const openPatientAction = useDoctorUiStore((s) => s.openPatientAction);

  const prescriptionQuery = useDoctorPrescription(prescriptionId);
  const deletePrescription = useDeletePrescription();
  const duplicatePrescription = useDuplicatePrescription();
  const markCompleted = useMarkPrescriptionCompleted();

  const previewData = useMemo(() => {
    if (!prescriptionQuery.data) return null;
    return prescriptionToPreviewData(prescriptionQuery.data);
  }, [prescriptionQuery.data]);

  const rx = prescriptionQuery.data;

  const handleClose = () => router.push("/doctor/prescriptions");

  const handleEdit = async () => {
    if (!rx?.patientId || !rx.patient?.user) return;
    try {
      await duplicatePrescription.mutateAsync(rx.id);
      const modalData = openPatientFromList({
        patientId: rx.patientId,
        user: rx.patient.user,
        condition: rx.diagnosis,
        gender: rx.patient.gender,
      });
      router.push("/doctor/prescriptions");
      openPatientAction(modalData, "prescription");
      showToast("✏️ Prescription loaded in editor");
    } catch {
      showToast("⚠️ Failed to open editor");
    }
  };

  const handleDuplicate = async () => {
    if (!rx?.patientId) return;
    try {
      await duplicatePrescription.mutateAsync(rx.id);
      showToast("✓ Prescription duplicated to draft");
      if (rx.patient?.user) {
        const modalData = openPatientFromList({
          patientId: rx.patientId,
          user: rx.patient.user,
          condition: rx.diagnosis,
          gender: rx.patient.gender,
        });
        router.push("/doctor/prescriptions");
        openPatientAction(modalData, "prescription");
      }
    } catch {
      showToast("⚠️ Failed to duplicate prescription");
    }
  };

  const handleDelete = async () => {
    if (!rx) return;
    const label = rx.prescriptionNumber ?? "this prescription";
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
    try {
      await deletePrescription.mutateAsync(rx.id);
      showToast("✓ Prescription deleted");
      router.push("/doctor/prescriptions");
    } catch {
      showToast("⚠️ Failed to delete prescription");
    }
  };

  const handleMarkCompleted = async () => {
    if (!rx) return;
    try {
      await markCompleted.mutateAsync(rx.id);
      showToast("✓ Prescription marked as completed");
    } catch {
      showToast("⚠️ Failed to update prescription status");
    }
  };

  const handleShare = async () => {
    if (!rx?.verifyId) {
      showToast("Verification link unavailable");
      return;
    }
    const url = `${window.location.origin}/verify/${rx.verifyId}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("🔗 Verification link copied to clipboard");
    } catch {
      showToast(url);
    }
  };

  if (prescriptionQuery.isLoading) {
    return (
      <div style={{ padding: 48, textAlign: "center", color: "var(--gray-400)" }}>Loading prescription...</div>
    );
  }

  if (prescriptionQuery.isError || !previewData) {
    return (
      <div style={{ padding: 48, textAlign: "center", color: "var(--gray-500)" }}>
        <p style={{ marginBottom: 16 }}>Prescription not found or you do not have access.</p>
        <button type="button" className="btn-w" onClick={handleClose}>
          ← Back to Prescriptions
        </button>
      </div>
    );
  }

  return (
    <EPrescriptionViewer
      data={previewData}
      onClose={handleClose}
      meta={{
        createdAt: rx?.createdAt,
        updatedAt: rx?.updatedAt,
        prescriptionId: rx?.id,
        patientId: rx?.patientId,
        status: rx?.status,
      }}
      actions={{
        onEdit: handleEdit,
        onDuplicate: handleDuplicate,
        onDelete: handleDelete,
        onMarkCompleted: rx?.status === "PENDING_REVIEW" ? handleMarkCompleted : undefined,
        onShare: handleShare,
      }}
    />
  );
}
