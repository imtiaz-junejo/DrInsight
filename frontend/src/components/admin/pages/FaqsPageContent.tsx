"use client";

import { useMemo, useState } from "react";
import { FaqEditorModal } from "@/components/admin/site-management/FaqEditorModal";
import {
  AdminButton,
  AdminPagination,
  AdminPanel,
  FilterPills,
  ToggleRow,
  ToggleSwitch,
} from "@/components/admin/ui/AdminPrimitives";
import { useAdminUiStore } from "@/store/admin-ui.store";
import {
  useCreateFaq,
  useDeleteFaq,
  useDuplicateFaq,
  useFaqs,
  useUpdateFaq,
  type FaqItem,
} from "@/services/cms-api-hooks";

const STATUS_FILTERS = ["All", "Published", "Draft", "Archived"] as const;
const STATUS_MAP: Record<(typeof STATUS_FILTERS)[number], string | undefined> = {
  All: undefined,
  Published: "PUBLISHED",
  Draft: "DRAFT",
  Archived: "ARCHIVED",
};

export function FaqsPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusIdx, setStatusIdx] = useState(0);
  const [editing, setEditing] = useState<FaqItem | null | undefined>(undefined);

  const faqsQuery = useFaqs({
    page,
    limit: 20,
    search: search || undefined,
    status: STATUS_MAP[STATUS_FILTERS[statusIdx]],
    sort: "newest",
  });
  const createFaq = useCreateFaq();
  const updateFaq = useUpdateFaq();
  const deleteFaq = useDeleteFaq();
  const duplicateFaq = useDuplicateFaq();

  const faqs = faqsQuery.data?.data ?? [];
  const meta = faqsQuery.data?.meta;

  const categories = useMemo(() => {
    const set = new Set(faqs.map((f) => f.category));
    return Array.from(set).sort();
  }, [faqs]);

  const handleSave = (data: Record<string, unknown>) => {
    if (editing?.id) {
      updateFaq.mutate(
        { id: editing.id, ...data } as Partial<FaqItem> & { id: string },
        {
          onSuccess: () => {
            showToast("FAQ saved");
            setEditing(undefined);
          },
        },
      );
    } else {
      createFaq.mutate(data as { question: string; answer: string; category: string }, {
        onSuccess: () => {
          showToast("FAQ created");
          setEditing(undefined);
        },
      });
    }
  };

  return (
    <>
      <AdminPanel
        title="❓ Frequently Asked Questions"
        actions={
          <AdminButton variant="primary" onClick={() => setEditing(null)}>
            + Add FAQ
          </AdminButton>
        }
        bodyClassName="panel-bd"
      >
        <div className="search-bar" style={{ marginBottom: 12 }}>
          <input
            placeholder="Search FAQs..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearch(searchInput)}
          />
          <AdminButton onClick={() => setSearch(searchInput)}>Search</AdminButton>
        </div>
        <FilterPills
          filters={[...STATUS_FILTERS]}
          activeIndex={statusIdx}
          onChange={(i) => {
            setStatusIdx(i);
            setPage(1);
          }}
        />
        {categories.length > 0 ? (
          <p style={{ fontSize: ".78rem", color: "var(--gray-500)", margin: "8px 0" }}>
            Categories: {categories.join(", ")}
          </p>
        ) : null}
        {faqsQuery.isLoading ? <p className="empty-state">Loading FAQs...</p> : null}
        {faqs.map((faq, i) => (
          <ToggleRow
            key={faq.id}
            title={`${(page - 1) * 20 + i + 1}. ${faq.question}`}
            subtitle={`Category: ${faq.category} · Priority: ${faq.priority ?? 0} · ${faq.status ?? "PUBLISHED"}`}
            actions={
              <>
                <AdminButton onClick={() => setEditing(faq)}>Edit</AdminButton>
                <AdminButton
                  onClick={() =>
                    duplicateFaq.mutate(faq.id, { onSuccess: () => showToast("FAQ duplicated") })
                  }
                >
                  Duplicate
                </AdminButton>
                <AdminButton
                  variant="danger"
                  onClick={() =>
                    deleteFaq.mutate(faq.id, { onSuccess: () => showToast("FAQ deleted") })
                  }
                >
                  Delete
                </AdminButton>
                <ToggleSwitch
                  checked={faq.isActive}
                  onChange={(checked) =>
                    updateFaq.mutate(
                      { id: faq.id, isActive: checked },
                      { onSuccess: () => showToast("Visibility updated") },
                    )
                  }
                />
              </>
            }
          />
        ))}
        {!faqsQuery.isLoading && faqs.length === 0 ? (
          <p className="empty-state">No FAQs match your filters.</p>
        ) : null}
        {meta && meta.totalPages > 1 ? (
          <AdminPagination
            info={`Page ${page} of ${meta.totalPages}`}
            page={page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        ) : null}
      </AdminPanel>

      {editing !== undefined ? (
        <FaqEditorModal
          faq={editing}
          onClose={() => setEditing(undefined)}
          onSave={handleSave}
          saving={createFaq.isPending || updateFaq.isPending}
        />
      ) : null}
    </>
  );
}
