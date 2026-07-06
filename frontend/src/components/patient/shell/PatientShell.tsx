"use client";

import type { ReactNode } from "react";
import { Navbar, TopBar } from "@/components/layout/SiteLayout";
import { usePatientUiStore } from "@/store/patient-ui.store";
import { PatientDashHeader } from "./PatientDashHeader";
import { ConsultationModal, PatientFooter, ReviewModal } from "./PatientFooter";
import { PatientSidebar } from "./PatientSidebar";

export function PatientShell({ children }: { children: ReactNode }) {
  const toastMessage = usePatientUiStore((s) => s.toastMessage);
  const toastVisible = usePatientUiStore((s) => s.toastVisible);
  const mobileSidebarOpen = usePatientUiStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = usePatientUiStore((s) => s.setMobileSidebarOpen);

  return (
    <>
      <TopBar />
      <Navbar />
      <div className="patient-root">
        <PatientDashHeader />
        <button
          type="button"
          className={`sidebar-backdrop${mobileSidebarOpen ? " visible" : ""}`}
          aria-label="Close navigation menu"
          onClick={() => setMobileSidebarOpen(false)}
        />
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
