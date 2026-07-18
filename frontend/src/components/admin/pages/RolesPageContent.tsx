"use client";

import {
  AdminButton,
  AdminPanel,
  KvGrid,
} from "@/components/admin/ui/AdminPrimitives";
import { useAdminUiStore } from "@/store/admin-ui.store";
import { useRolesMatrix, useUpdateRolePermission } from "@/services/cms-api-hooks";

export function RolesPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const rolesQuery = useRolesMatrix();
  const updatePermission = useUpdateRolePermission();
  const roles = rolesQuery.data?.roles ?? [];
  const permissions = rolesQuery.data?.permissions ?? [];

  const isEnabled = (roleId: string, permissionId: string) => {
    const role = roles.find((r) => r.id === roleId);
    return role?.permissions.find((p) => p.permissionId === permissionId)?.enabled ?? false;
  };

  return (
    <>
      <AdminPanel
        title="🔑 Role-Based Permission Matrix"
        actions={
          <AdminButton variant="primary" onClick={() => showToast("Role management is configured in the database")}>
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
                  <th key={role.id}>{role.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm) => (
                <tr key={perm.id}>
                  <td>
                    <strong>{perm.name}</strong>
                  </td>
                  {roles.map((role) => (
                    <td key={role.id} style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={isEnabled(role.id, perm.id)}
                        onChange={(e) =>
                          updatePermission.mutate(
                            { roleId: role.id, permissionId: perm.id, enabled: e.target.checked },
                            { onSuccess: () => showToast(`${role.name}: ${perm.name} updated`) },
                          )
                        }
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
          items={roles.map((role) => ({
            value: role.name,
            label: role.description ?? "—",
          }))}
        />
      </AdminPanel>
    </>
  );
}
