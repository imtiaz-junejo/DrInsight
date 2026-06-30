"use client";

import Link from "next/link";
import { DashButton, DashCard, DashPageHeader, TableButton } from "@/components/doctor/ui/DoctorPrimitives";
import { DOCTOR_ARTICLES } from "@/components/doctor/data/doctor-demo-data";
import { todayFormatted } from "@/lib/doctor-utils";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

export function ArticlesPageContent() {
  const showToast = useDoctorUiStore((s) => s.showToast);

  return (
    <>
      <DashPageHeader
        subtitle="👨‍⚕️ Physician Dashboard"
        title="My Articles"
        dateStr={todayFormatted()}
        actions={
          <Link href="/doctor/submit-article">
            <DashButton variant="solid">+ Write New Article</DashButton>
          </Link>
        }
      />

      <DashCard title="📰 Published & Draft Articles" headerExtra={<span style={{ fontSize: "0.76rem", color: "var(--gray-400)" }}>47 total</span>}>
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
              {DOCTOR_ARTICLES.map(([title, category, published, views, statusClass, statusLabel]) => (
                <tr key={title}>
                  <td style={{ fontWeight: 600, fontSize: "0.84rem", maxWidth: 220 }}>{title}</td>
                  <td>
                    <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 9px", borderRadius: 50, background: "var(--blue-light)", color: "var(--blue)" }}>
                      {category}
                    </span>
                  </td>
                  <td>{published}</td>
                  <td>{views !== "—" ? <strong>{views}</strong> : views}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </DashCard>
    </>
  );
}
