"use client";

import {
  AdminButton,
  AdminPanel,
  KvGrid,
} from "@/components/admin/ui/AdminPrimitives";
import { useAdminUiStore } from "@/store/admin-ui.store";

const roles = ["Super Admin", "Editorial Admin", "Support Admin", "Doctor", "Patient"];
const perms = [
  "Manage Users",
  "Manage Doctors",
  "Manage Content",
  "Review Articles",
  "Manage Settings",
  "View Analytics",
  "Manage Payments",
  "Manage Notifications",
];

function isChecked(roleIndex: number, permIndex: number) {
  if (roleIndex === 0) return true;
  if (roleIndex === 1 && permIndex < 5) return true;
  if (roleIndex === 2 && (permIndex === 3 || permIndex === 6)) return true;
  if (roleIndex === 3 && permIndex === 3) return true;
  return false;
}

// TODO: connect granular RBAC API when backend supports sub-roles
export function RolesPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);

  return (
    <>
      <AdminPanel
        title="🔑 Role-Based Permission Matrix"
        actions={
          <AdminButton variant="primary" onClick={() => showToast("New role created")}>
            + New Role
          </AdminButton>
        }
      >
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Permission</th>
                {roles.map((role) => (
                  <th key={role}>{role}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {perms.map((perm, pi) => (
                <tr key={perm}>
                  <td>
                    <strong>{perm}</strong>
                  </td>
                  {roles.map((role, ri) => (
                    <td key={role} style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        defaultChecked={isChecked(ri, pi)}
                        onChange={() => showToast(`${role}: ${perm} updated`)}
                        style={{ width: 16, height: 16, accentColor: "var(--blue)", cursor: "pointer" }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
      <AdminPanel title="📋 Role Descriptions" bodyClassName="panel-bd">
        <KvGrid
          items={[
            { value: "Super Admin", label: "Full unrestricted access to all modules" },
            { value: "Editorial Admin", label: "Manages content, review queue & editorial pages" },
            { value: "Support Admin", label: "Handles users, inquiries & prescriptions" },
            { value: "Doctor", label: "Access to own dashboard, patients & articles" },
            { value: "Patient", label: "Access to own dashboard & health records" },
          ]}
        />
      </AdminPanel>
    </>
  );
}
