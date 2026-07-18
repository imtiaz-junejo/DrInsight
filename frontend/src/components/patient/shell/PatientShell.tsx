"use client";

import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { usePatientUiStore } from "@/store/patient-ui.store";
import { ConsultationModal, PatientFooter, ReviewModal } from "./PatientFooter";
import { PatientSidebar } from "./PatientSidebar";
import { PatientConsultationJoinPrompt } from "@/components/consultation/PatientConsultationJoinPrompt";

export function PatientShell({ children }: { children: ReactNode }) {
  const toastMessage = usePatientUiStore((s) => s.toastMessage);
  const toastVisible = usePatientUiStore((s) => s.toastVisible);

  return (
    <>
      <SiteHeader />
      <div className="patient-root">
        <div className="dash-body">
          <PatientConsultationJoinPrompt />
          <div className="dash-grid">
            <PatientSidebar />
            <div className="dash-main-col">
              <main className="dash-main">{children}</main>
              <PatientFooter />
            </div>
          </div>
        </div>
        <ConsultationModal />
        <ReviewModal />
        <div className={`toast${toastVisible ? " show" : ""}`}>{toastMessage}</div>
      </div>
    </>
  );
}
