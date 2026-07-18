"use client";

import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useDoctorUiStore } from "@/store/doctor-ui.store";
import { DoctorFooter, PatientDetailModal } from "./DoctorFooter";
import { DoctorSidebar } from "./DoctorSidebar";

export function DoctorShell({ children }: { children: ReactNode }) {
  const toastMessage = useDoctorUiStore((s) => s.toastMessage);
  const toastVisible = useDoctorUiStore((s) => s.toastVisible);

  return (
    <>
      <SiteHeader />
      <div className="doctor-root">
        <div className="dash-body">
          <div className="dash-grid">
            <DoctorSidebar />
            <div className="dash-main-col">
              <main className="dash-main">{children}</main>
              <DoctorFooter />
            </div>
          </div>
        </div>
        <PatientDetailModal />
        <div className={`toast${toastVisible ? " show" : ""}`}>{toastMessage}</div>
      </div>
    </>
  );
}
