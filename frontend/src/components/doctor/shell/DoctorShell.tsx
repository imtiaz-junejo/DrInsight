"use client";

import type { ReactNode } from "react";
import { Navbar, TopBar } from "@/components/layout/SiteLayout";
import { useDoctorUiStore } from "@/store/doctor-ui.store";
import { DoctorDashHeader } from "./DoctorDashHeader";
import { DoctorFooter, PatientDetailModal } from "./DoctorFooter";
import { DoctorSidebar } from "./DoctorSidebar";

export function DoctorShell({ children }: { children: ReactNode }) {
  const toastMessage = useDoctorUiStore((s) => s.toastMessage);
  const toastVisible = useDoctorUiStore((s) => s.toastVisible);
  const mobileSidebarOpen = useDoctorUiStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useDoctorUiStore((s) => s.setMobileSidebarOpen);

  return (
    <>
      <TopBar />
      <Navbar />
      <div className="doctor-root">
        <DoctorDashHeader />
        <button
          type="button"
          className={`sidebar-backdrop${mobileSidebarOpen ? " visible" : ""}`}
          aria-label="Close navigation menu"
          onClick={() => setMobileSidebarOpen(false)}
        />
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
