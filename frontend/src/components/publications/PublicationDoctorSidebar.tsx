"use client";

import Link from "next/link";
import { formatNumber } from "@/lib/admin-utils";
import type { Publication } from "@/services/publications-api-hooks";

export function PublicationStatisticsPanel({
  viewCount,
  downloadCount,
  bookmarkCount,
  citationCount,
  shareCount,
}: {
  viewCount: number;
  downloadCount: number;
  bookmarkCount?: number;
  citationCount: number;
  shareCount: number;
}) {
  return (
    <div className="rapv-alt" style={{ marginTop: 0, marginBottom: 20 }}>
      <div>
        <div className="n">{formatNumber(viewCount)}</div>
        <div className="l">Views</div>
      </div>
      <div>
        <div className="n">{formatNumber(downloadCount)}</div>
        <div className="l">Downloads</div>
      </div>
      <div>
        <div className="n">{formatNumber(bookmarkCount ?? 0)}</div>
        <div className="l">Bookmarks</div>
      </div>
      <div>
        <div className="n">{formatNumber(citationCount)}</div>
        <div className="l">Citations</div>
      </div>
      <div>
        <div className="n">{formatNumber(shareCount)}</div>
        <div className="l">Shares</div>
      </div>
    </div>
  );
}

export function PublicationDoctorSidebar({
  pub,
  doctorPubTotal,
}: {
  pub: Publication;
  doctorPubTotal?: number;
}) {
  const doctor = pub.doctor;
  if (!doctor?.user) return null;

  const doctorName = `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`;
  const initials = `${doctor.user.firstName?.[0] ?? ""}${doctor.user.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <aside className="detail-sidebar">
      <div className="doctor-card">
        {doctor.user.avatarUrl ? (
          <img src={doctor.user.avatarUrl} alt="" className="doctor-av" style={{ objectFit: "cover" }} />
        ) : (
          <div className="doctor-av" style={{ background: "linear-gradient(135deg,var(--blue),var(--teal))" }}>
            {initials}
          </div>
        )}
        <h3>
          <Link href={`/our-doctors/${doctor.id}`}>{doctorName}</Link>
        </h3>
        <div className="doctor-spec">{doctor.specialty}</div>
        <div className="doctor-meta">
          {doctor.hospital ? (
            <>
              {doctor.hospital}
              <br />
            </>
          ) : null}
          {doctor.experienceYears ? `${doctor.experienceYears}+ years experience` : null}
          {doctorPubTotal ? (
            <>
              <br />
              {doctorPubTotal} approved publication{doctorPubTotal === 1 ? "" : "s"}
            </>
          ) : null}
        </div>
        <Link href={`/our-doctors/${doctor.id}`} className="sidebar-btn ghost">
          View Doctor Profile
        </Link>
        <Link href={`/book-consultation?doctorId=${doctor.id}`} className="sidebar-btn primary">
          Book Consultation
        </Link>
      </div>
    </aside>
  );
}
