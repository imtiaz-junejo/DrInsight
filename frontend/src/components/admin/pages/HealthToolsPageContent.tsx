"use client";

import { useState } from "react";
import { HealthToolEditor } from "@/components/admin/site-management/HealthToolEditor";
import {
  AdminButton,
  AdminPanel,
  TemplateItem,
  ToggleSwitch,
} from "@/components/admin/ui/AdminPrimitives";
import { formatNumber } from "@/lib/admin-utils";
import { useAdminUiStore } from "@/store/admin-ui.store";
import {
  useCreateHealthTool,
  useDeleteHealthTool,
  useHealthTools,
  useUpdateHealthTool,
  type HealthToolItem,
} from "@/services/cms-api-hooks";

export function HealthToolsPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const toolsQuery = useHealthTools();
  const createTool = useCreateHealthTool();
  const updateTool = useUpdateHealthTool();
  const deleteTool = useDeleteHealthTool();
  const [editing, setEditing] = useState<HealthToolItem | null>(null);
  const tools = toolsQuery.data ?? [];

  return (
    <>
      <AdminPanel
        title="🛠️ Manage Health Tools & Calculators"
        actions={
          <AdminButton
            variant="primary"
            onClick={() =>
              createTool.mutate(
                {
                  slug: `tool-${Date.now()}`,
                  name: "New Health Tool",
                  description: "Description",
                  iconEmoji: "🧮",
                  category: "General",
                  route: "/health-tools",
                },
                {
                  onSuccess: (tool) => {
                    showToast("New tool created");
                    setEditing(tool as HealthToolItem);
                  },
                },
              )
            }
          >
            + New Tool
          </AdminButton>
        }
        bodyClassName="panel-bd"
      >
        {toolsQuery.isLoading ? <p className="empty-state">Loading health tools...</p> : null}
        {tools.map((tool) => (
          <TemplateItem
            key={tool.id}
            icon={tool.iconEmoji ?? "🧮"}
            title={`${tool.name}${tool.featured ? " ⭐" : ""}`}
            subtitle={`${tool.description ?? "—"} · ${tool.category ?? "General"} · ${formatNumber(tool.usageLast30Days)} uses (30d)`}
            actions={
              <>
                <AdminButton onClick={() => setEditing(tool)}>Edit</AdminButton>
                <ToggleSwitch
                  checked={tool.isActive}
                  onChange={(checked) =>
                    updateTool.mutate(
                      { id: tool.id, isActive: checked },
                      { onSuccess: () => showToast(`${tool.name} ${checked ? "enabled" : "disabled"}`) },
                    )
                  }
                />
              </>
            }
          />
        ))}
        {!toolsQuery.isLoading && tools.length === 0 ? (
          <p className="empty-state">No health tools configured.</p>
        ) : null}
      </AdminPanel>

      {editing ? (
        <HealthToolEditor
          tool={editing}
          onClose={() => setEditing(null)}
          saving={updateTool.isPending}
          onSave={(data) =>
            updateTool.mutate(
              { id: editing.id, ...data },
              {
                onSuccess: () => {
                  showToast("Tool saved");
                  setEditing(null);
                },
              },
            )
          }
          onDelete={() => {
            if (!confirm(`Delete "${editing.name}"?`)) return;
            deleteTool.mutate(editing.id, {
              onSuccess: () => {
                showToast("Tool deleted");
                setEditing(null);
              },
            });
          }}
        />
      ) : null}
    </>
  );
}
