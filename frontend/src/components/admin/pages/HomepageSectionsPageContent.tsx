"use client";

import { useState } from "react";
import { HomepageSectionEditor } from "@/components/admin/site-management/HomepageSectionEditor";
import {
  AdminButton,
  AdminPanel,
  ToggleRow,
  ToggleSwitch,
} from "@/components/admin/ui/AdminPrimitives";
import { formatRelativeTime } from "@/lib/data-mappers";
import { useAdminUiStore } from "@/store/admin-ui.store";
import {
  useDuplicateHomepageSection,
  useHomepageSections,
  usePublishHomepageSection,
  usePublishHomepageSections,
  useReorderHomepageSections,
  useRevertHomepageSection,
  useSaveHomepageSectionDraft,
  useUpdateHomepageSection,
  type HomepageSection,
} from "@/services/cms-api-hooks";

export function HomepageSectionsPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const sectionsQuery = useHomepageSections();
  const updateSection = useUpdateHomepageSection();
  const reorder = useReorderHomepageSections();
  const publishAll = usePublishHomepageSections();
  const saveDraft = useSaveHomepageSectionDraft();
  const publishOne = usePublishHomepageSection();
  const revert = useRevertHomepageSection();
  const duplicate = useDuplicateHomepageSection();
  const [editing, setEditing] = useState<HomepageSection | null>(null);
  const sections = sectionsQuery.data ?? [];

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const items = sections.map((section, i) => {
      if (i === index) return { id: section.id, displayOrder: target + 1 };
      if (i === target) return { id: section.id, displayOrder: index + 1 };
      return { id: section.id, displayOrder: i + 1 };
    });
    reorder.mutate(items, { onSuccess: () => showToast(direction === -1 ? "Moved up" : "Moved down") });
  };

  return (
    <>
      <AdminPanel
        title="🏠 Homepage Section Order & Visibility"
        actions={
          <AdminButton
            variant="primary"
            onClick={() =>
              publishAll.mutate(undefined, {
                onSuccess: (res) => showToast(`Published ${res.published ?? 0} section(s) to live site`),
              })
            }
          >
            Publish Changes
          </AdminButton>
        }
        bodyClassName="panel-bd"
      >
        {sectionsQuery.isLoading ? <p className="empty-state">Loading sections...</p> : null}
        {sections.map((section, i) => (
          <ToggleRow
            key={section.id}
            title={`${i + 1}. ${section.title}${section.status === "DRAFT" ? " (Draft)" : ""}`}
            subtitle={`Position ${i + 1} on homepage · Updated ${section.updatedAt ? formatRelativeTime(section.updatedAt) : "—"}`}
            actions={
              <>
                <AdminButton onClick={() => setEditing(section)}>Edit</AdminButton>
                <AdminButton
                  onClick={() =>
                    duplicate.mutate(section.id, { onSuccess: () => showToast("Section duplicated") })
                  }
                >
                  Duplicate
                </AdminButton>
                <AdminButton onClick={() => move(i, -1)}>↑</AdminButton>
                <AdminButton onClick={() => move(i, 1)}>↓</AdminButton>
                <ToggleSwitch
                  checked={section.isVisible}
                  onChange={(checked) =>
                    updateSection.mutate(
                      { id: section.id, isVisible: checked },
                      { onSuccess: () => showToast(`${section.title} ${checked ? "shown" : "hidden"}`) },
                    )
                  }
                />
              </>
            }
          />
        ))}
        {!sectionsQuery.isLoading && sections.length === 0 ? (
          <p className="empty-state">No homepage sections configured.</p>
        ) : null}
      </AdminPanel>

      {editing ? (
        <HomepageSectionEditor
          section={editing}
          onClose={() => setEditing(null)}
          saving={saveDraft.isPending || publishOne.isPending}
          onSaveDraft={(data) =>
            saveDraft.mutate(
              { id: editing.id, ...data },
              {
                onSuccess: (updated) => {
                  showToast("Draft saved");
                  setEditing(updated as HomepageSection);
                },
              },
            )
          }
          onPublish={() =>
            publishOne.mutate(editing.id, {
              onSuccess: () => {
                showToast("Section published");
                setEditing(null);
              },
            })
          }
          onRevert={() =>
            revert.mutate(editing.id, {
              onSuccess: () => {
                showToast("Reverted to published version");
                setEditing(null);
              },
            })
          }
        />
      ) : null}
    </>
  );
}
