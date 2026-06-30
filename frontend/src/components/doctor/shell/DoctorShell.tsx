"use client";

import type { ReactNode } from "react";
import { useDoctorUiStore } from "@/store/doctor-ui.store";
import { DoctorDashHeader } from "./DoctorDashHeader";
import { DoctorFooter, PatientDetailModal } from "./DoctorFooter";
import { DoctorSidebar } from "./DoctorSidebar";
import { DoctorDemoBar, DoctorSiteNav, DoctorSiteTopbar } from "./DoctorSiteChrome";

export function DoctorShell({ children }: { children: ReactNode }) {
  const toastMessage = useDoctorUiStore((s) => s.toastMessage);
  const toastVisible = useDoctorUiStore((s) => s.toastVisible);

  return (
    <div className="doctor-root">
      <DoctorSiteTopbar />
      <DoctorSiteNav />
      <DoctorDemoBar />
      <DoctorDashHeader />
      <div className="dash-body">
        <div className="dash-grid">
          <DoctorSidebar />
          <main className="dash-main">{children}</main>
        </div>
      </div>
      <DoctorFooter />
      <PatientDetailModal />
      <div className={`toast${toastVisible ? " show" : ""}`}>{toastMessage}</div>
    </div>
  );
}
