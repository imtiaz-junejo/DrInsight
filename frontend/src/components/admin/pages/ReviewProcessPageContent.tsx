"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ApprovalTimeline } from "@/components/admin/editorial/ApprovalTimeline";
import {
  AdminButton,
  AdminPanel,
  FilterPills,
  FormGrid,
  FormItem,
  KvGrid,
} from "@/components/admin/ui/AdminPrimitives";
import { formatNumber } from "@/lib/admin-utils";
import { useAdminUiStore } from "@/store/admin-ui.store";
import {
  useArticleReviewQueue,
  useMedicalReview,
  useMedicalReviewers,
  useUpdateMedicalReviewStage,
} from "@/services/editorial-api-hooks";
import { useReviewProcess, useUpdateReviewProcess } from "@/services/cms-api-hooks";
import type { EditorialReviewStage } from "@/services/editorial-api-hooks";

export function ReviewProcessPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const reviewQuery = useReviewProcess();
  const updateReview = useUpdateReviewProcess();
  const articlesQuery = useArticleReviewQueue({ limit: 20 });
  const reviewersQuery = useMedicalReviewers();
  const updateStage = useUpdateMedicalReviewStage();

  const [form, setForm] = useState({
    tier1MinYears: 5,
    tier2MinYears: 7,
    reviewDeadlineDays: 7,
    maxRevisionCycles: 2,
    authorRevisionWindowDays: 5,
    minSourcesPerArticle: 5,
  });
  const [selectedPostId, setSelectedPostId] = useState<string | undefined>();
  const medicalReviewQuery = useMedicalReview(selectedPostId);

  useEffect(() => {
    if (!reviewQuery.data?.settings) return;
    setForm(reviewQuery.data.settings);
  }, [reviewQuery.data?.settings]);

  const pool = reviewQuery.data?.reviewerPool;
  const schedules = reviewQuery.data?.schedules ?? [];
  const articles = articlesQuery.data?.data ?? [];
  const review = medicalReviewQuery.data;

  useEffect(() => {
    if (!selectedPostId && articles[0]?.id) {
      setSelectedPostId(articles[0].id);
    }
  }, [articles, selectedPostId]);

  return (
    <>
      <AdminPanel
        title="⚙️ Review Tier Configuration"
        actions={
          <AdminButton
            variant="primary"
            onClick={() => updateReview.mutate(form, { onSuccess: () => showToast("Settings saved") })}
          >
            Save Changes
          </AdminButton>
        }
        bodyClassName="panel-bd"
      >
        <FormGrid>
          <FormItem label="Tier 1 — Minimum years post-qualification">
            <input
              type="number"
              value={form.tier1MinYears}
              onChange={(e) => setForm((f) => ({ ...f, tier1MinYears: Number(e.target.value) }))}
            />
          </FormItem>
          <FormItem label="Tier 2 — Minimum years clinical experience">
            <input
              type="number"
              value={form.tier2MinYears}
              onChange={(e) => setForm((f) => ({ ...f, tier2MinYears: Number(e.target.value) }))}
            />
          </FormItem>
          <FormItem label="Standard review deadline (business days)">
            <input
              type="number"
              value={form.reviewDeadlineDays}
              onChange={(e) => setForm((f) => ({ ...f, reviewDeadlineDays: Number(e.target.value) }))}
            />
          </FormItem>
          <FormItem label="Maximum revision cycles">
            <input
              type="number"
              value={form.maxRevisionCycles}
              onChange={(e) => setForm((f) => ({ ...f, maxRevisionCycles: Number(e.target.value) }))}
            />
          </FormItem>
          <FormItem label="Author revision window (business days)">
            <input
              type="number"
              value={form.authorRevisionWindowDays}
              onChange={(e) => setForm((f) => ({ ...f, authorRevisionWindowDays: Number(e.target.value) }))}
            />
          </FormItem>
          <FormItem label="Minimum sources per clinical article">
            <input
              type="number"
              value={form.minSourcesPerArticle}
              onChange={(e) => setForm((f) => ({ ...f, minSourcesPerArticle: Number(e.target.value) }))}
            />
          </FormItem>
        </FormGrid>
      </AdminPanel>

      <AdminPanel title="🔄 Content Currency Schedule" bodyClassName="panel-bd">
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Content Type</th>
                <th>Review Cycle (months)</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((row) => (
                <tr key={row.id}>
                  <td>{row.contentType}</td>
                  <td>{row.reviewCycleMonths}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>

      <AdminPanel title="👨‍⚕️ Active Reviewer Pool" bodyClassName="panel-bd">
        <KvGrid
          items={[
            { value: formatNumber(pool?.tier1 ?? 0), label: "Tier 1 — Specialty Reviewers" },
            { value: formatNumber(pool?.tier2 ?? 0), label: "Tier 2 — General Reviewers" },
            { value: formatNumber(pool?.tier3 ?? 0), label: "Tier 3 — Allied Health Reviewers" },
          ]}
        />
        {(reviewersQuery.data ?? []).length > 0 ? (
          <div className="tbl-wrap" style={{ marginTop: 16 }}>
            <table>
              <thead>
                <tr>
                  <th>Reviewer</th>
                  <th>Specialty</th>
                  <th>Tier</th>
                </tr>
              </thead>
              <tbody>
                {(reviewersQuery.data ?? []).slice(0, 10).map((r) => (
                  <tr key={r.user.id}>
                    <td>
                      Dr. {r.user.firstName} {r.user.lastName}
                    </td>
                    <td>{r.specialty ?? r.user.doctorProfile?.specialty ?? "—"}</td>
                    <td>Tier {r.tier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </AdminPanel>

      <AdminPanel
        title="🩺 Medical Review Process"
        actions={<Link href="/admin/review-queue" className="btn">Article Review Queue →</Link>}
        bodyClassName="panel-bd"
      >
        <p style={{ fontSize: "0.84rem", color: "var(--gray-600)", marginBottom: 16 }}>
          Submitted → Editorial Screening → Medical Review → Revision Requested → Final Editorial Review → Approved → Published
        </p>
        <FilterPills
          filters={articles.map((a) => a.title.slice(0, 40) + (a.title.length > 40 ? "…" : ""))}
          activeIndex={Math.max(
            0,
            articles.findIndex((a) => a.id === selectedPostId),
          )}
          onChange={(index) => setSelectedPostId(articles[index]?.id)}
        />
        {selectedPostId && review ? (
          <>
            <ApprovalTimeline stages={review.stages} />
            <div className="btn-row" style={{ marginTop: 16 }}>
              {review.stages
                .filter((s) => s.status === "IN_PROGRESS" || s.status === "PENDING")
                .slice(0, 1)
                .map((stage) => (
                  <AdminButton
                    key={stage.id}
                    variant="green"
                    onClick={() =>
                      updateStage.mutate(
                        {
                          reviewId: review.id,
                          stage: stage.stage as EditorialReviewStage,
                          action: "complete",
                        },
                        { onSuccess: () => showToast("Stage marked complete") },
                      )
                    }
                  >
                    Mark {stage.stage.replace(/_/g, " ")} Complete
                  </AdminButton>
                ))}
              <AdminButton
                variant="danger"
                onClick={() => {
                  const active = review.stages.find((s) => s.status === "IN_PROGRESS");
                  if (!active) return;
                  updateStage.mutate(
                    {
                      reviewId: review.id,
                      stage: active.stage as EditorialReviewStage,
                      action: "request_changes",
                      notes: "Changes requested by editor",
                    },
                    { onSuccess: () => showToast("Changes requested") },
                  );
                }}
              >
                Request Changes
              </AdminButton>
            </div>
          </>
        ) : (
          <p className="empty-state">Select an article to view its medical review pipeline.</p>
        )}
      </AdminPanel>
    </>
  );
}
