"use client";

import { useMemo } from "react";
import {
  ClipboardList,
  DoctorIconInline,
  PhysicianDashboardLabel,
  Star,
} from "@/components/doctor/icons/DoctorIcons";
import { DashCard, DashPageHeader, GridTwo, PersonAvatar } from "@/components/doctor/ui/DoctorPrimitives";
import { formatDate, getInitials, gradientForId, starsDisplay } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/doctor-utils";
import { useDoctorProfile, useDoctorReviews } from "@/services/doctor-api-hooks";

function EmptyState({ loading, message }: { loading?: boolean; message: string }) {
  return (
    <div style={{ padding: "24px 0", textAlign: "center", color: "var(--gray-400)", fontSize: "0.84rem" }}>
      {loading ? "Loading..." : message}
    </div>
  );
}

export function ReviewsPageContent() {
  const profileQuery = useDoctorProfile();
  const reviewsQuery = useDoctorReviews(profileQuery.data?.id);

  const reviews = reviewsQuery.data?.data ?? [];
  const rating = profileQuery.data?.rating ?? 0;
  const reviewCount = profileQuery.data?.reviewCount ?? 0;

  const breakdown = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const rev of reviews) {
      const idx = Math.min(Math.max(Math.round(rev.rating), 1), 5) - 1;
      counts[idx]++;
    }
    const total = reviews.length || 1;
    return [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      pct: Math.round((counts[stars - 1] / total) * 100),
    }));
  }, [reviews]);

  const loading = profileQuery.isLoading || reviewsQuery.isLoading;

  return (
    <>
      <DashPageHeader subtitle={<PhysicianDashboardLabel />} title="Reviews & Ratings" dateStr={todayFormatted()} />

      <GridTwo>
        <DashCard title={<DoctorIconInline icon={Star} size="button">Patient Reviews</DoctorIconInline>}>
          {loading ? (
            <EmptyState loading message="" />
          ) : (
            <>
              <div className="rev-summary">
                <div className="rev-big">{rating.toFixed(1)}</div>
                <div>
                  <div className="stars-row">{starsDisplay(rating)}</div>
                  <div style={{ fontSize: "0.74rem", color: "var(--gray-400)" }}>Based on {reviewCount} reviews</div>
                </div>
              </div>
              {reviews.length === 0 ? (
                <EmptyState message="No reviews yet" />
              ) : (
                reviews.map((rev) => {
                  const pUser = rev.patient?.user;
                  const name = `${pUser?.firstName ?? ""} ${pUser?.lastName ?? ""}`.trim() || "Patient";
                  const initials = getInitials(pUser?.firstName, pUser?.lastName);
                  const bg = gradientForId(rev.id);
                  return (
                    <div key={rev.id} className="rev-item">
                      <div className="rev-hd">
                        <PersonAvatar initials={initials} className="rev-av" style={{ background: bg }} seed={name} />
                        <span className="rev-name">{name}</span>
                        <span className="rev-stars">{starsDisplay(rev.rating)}</span>
                      </div>
                      <div className="rev-text">&quot;{rev.comment ?? "No comment"}&quot;</div>
                      <div className="rev-date">{formatDate(rev.createdAt)}</div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </DashCard>

        <DashCard title={<DoctorIconInline icon={ClipboardList} size="button">Rating Breakdown</DoctorIconInline>}>
          {loading ? (
            <EmptyState loading message="" />
          ) : reviews.length === 0 ? (
            <EmptyState message="No rating data yet" />
          ) : (
            breakdown.map(({ stars, pct }) => (
              <div key={stars} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: "0.78rem", width: 15 }}>{stars}★</span>
                <div style={{ flex: 1, height: 8, background: "var(--gray-200)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "var(--amber)", borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: "0.74rem", color: "var(--gray-400)", width: 30 }}>{pct}%</span>
              </div>
            ))
          )}
        </DashCard>
      </GridTwo>
    </>
  );
}
