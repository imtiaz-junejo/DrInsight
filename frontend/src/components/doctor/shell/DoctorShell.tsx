"use client";

import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useDoctorUiStore } from "@/store/doctor-ui.store";
import { DoctorDashHeader } from "./DoctorDashHeader";
import { DoctorFooter, PatientDetailModal } from "./DoctorFooter";
import { DoctorSidebar } from "./DoctorSidebar";

export function DoctorShell({ children }: { children: ReactNode }) {
  const toastMessage = useDoctorUiStore((s) => s.toastMessage);
  const toastVisible = useDoctorUiStore((s) => s.toastVisible);

  return (
    <>
      <SiteHeader />
      <div className="doctor-root">
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
    </>
  );
}
