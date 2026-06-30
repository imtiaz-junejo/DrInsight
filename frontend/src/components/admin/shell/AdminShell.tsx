"use client";

import type { ReactNode } from "react";
import { useAdminUiStore } from "@/store/admin-ui.store";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

export function AdminShell({ children }: { children: ReactNode }) {
  const toastMessage = useAdminUiStore((s) => s.toastMessage);
  const toastVisible = useAdminUiStore((s) => s.toastVisible);

  return (
    <div className="admin-root">
      <div className="app">
        <AdminSidebar />
        <div className="main">
          <AdminTopbar />
          <div className="content">{children}</div>
        </div>
      </div>
      <div className={`toast${toastVisible ? " show" : ""}`}>{toastMessage}</div>
    </div>
  );
}
