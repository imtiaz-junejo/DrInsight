"use client";

import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { usePatientUiStore } from "@/store/patient-ui.store";
import { PatientDashHeader } from "./PatientDashHeader";
import { ConsultationModal, PatientFooter, ReviewModal } from "./PatientFooter";
import { PatientSidebar } from "./PatientSidebar";

export function PatientShell({ children }: { children: ReactNode }) {
  const toastMessage = usePatientUiStore((s) => s.toastMessage);
  const toastVisible = usePatientUiStore((s) => s.toastVisible);

  return (
    <>
      <SiteHeader />
      <div className="patient-root">
        <PatientDashHeader />
        <div className="dash-body">
          <div className="dash-grid">
            <PatientSidebar />
            <main className="dash-main">{children}</main>
          </div>
        </div>
        <PatientFooter />
        <ConsultationModal />
        <ReviewModal />
        <div className={`toast${toastVisible ? " show" : ""}`}>{toastMessage}</div>
      </div>
    </>
  );
}
