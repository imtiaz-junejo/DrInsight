"use client";

import Link from "next/link";
import { BookOpenText, DoctorIconInline, PhysicianDashboardLabel } from "@/components/doctor/icons/DoctorIcons";
import { DashButton, DashCard, DashPageHeader, TableButton } from "@/components/doctor/ui/DoctorPrimitives";
import { formatDate } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/doctor-utils";
import { useDoctorBlogPosts } from "@/services/doctor-api-hooks";
import { useAuthStore } from "@/store/auth.store";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

function blogStatusMeta(status?: string): { statusClass: string; statusLabel: string } {
  if (status === "PUBLISHED") return { statusClass: "as-live", statusLabel: "Live" };
  if (status === "DRAFT") return { statusClass: "as-draft", statusLabel: "Draft" };
  return { statusClass: "as-review", statusLabel: "Review" };
}

export function ArticlesPageContent() {
  const showToast = useDoctorUiStore((s) => s.showToast);
  const user = useAuthStore((s) => s.user);
  const blogQuery = useDoctorBlogPosts(user?.id);

  const articles = blogQuery.data?.data ?? [];
  const total = blogQuery.data?.meta.total ?? 0;

  return (
    <>
      <DashPageHeader
        subtitle={<PhysicianDashboardLabel />}
        title="My Articles"
        dateStr={todayFormatted()}
        actions={
          <Link href="/doctor/submit-article">
            <DashButton variant="solid">+ Write New Article</DashButton>
          </Link>
        }
      />

      <DashCard
        title={<DoctorIconInline icon={BookOpenText} size="button">Published & Draft Articles</DoctorIconInline>}
        headerExtra={<span style={{ fontSize: "0.76rem", color: "var(--gray-400)" }}>{blogQuery.isLoading ? "Loading..." : `${total} total`}</span>}
      >
        <div style={{ overflowX: "auto" }}>
          <table className="pt-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Published</th>
                <th>Views</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogQuery.isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>
                    Loading...
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>
                    No articles yet
                  </td>
                </tr>
              ) : (
                articles.map((post) => {
                  const status = (post as { status?: string }).status ?? "DRAFT";
                  const views = (post as { viewCount?: number }).viewCount;
                  const { statusClass, statusLabel } = blogStatusMeta(status);
                  const published = post.publishedAt ? formatDate(post.publishedAt) : "—";
                  const viewsDisplay = views != null ? views.toLocaleString() : "—";

                  return (
                    <tr key={post.id}>
                      <td style={{ fontWeight: 600, fontSize: "0.84rem", maxWidth: 220 }}>{post.title}</td>
                      <td>
                        <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 9px", borderRadius: 50, background: "var(--blue-light)", color: "var(--blue)" }}>
                          {post.category?.name ?? "Health"}
                        </span>
                      </td>
                      <td>{published}</td>
                      <td>{viewsDisplay !== "—" ? <strong>{viewsDisplay}</strong> : viewsDisplay}</td>
                      <td>
                        <span className={`art-status ${statusClass}`}>{statusLabel}</span>
                      </td>
                      <td>
                        <TableButton onClick={() => showToast("Opening editor...")}>Edit</TableButton>
                        <TableButton variant="view" onClick={() => showToast("Opening article...")}>
                          View
                        </TableButton>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </DashCard>
    </>
  );
}
