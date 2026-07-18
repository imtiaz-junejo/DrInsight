"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AdminButton,
  AdminPanel,
  PanelTable,
  StatCardRow,
  StatusChip,
  UserCell,
} from "@/components/admin/ui/AdminPrimitives";
import { adminUserProfileHref } from "@/lib/admin-routes";
import { formatNumber } from "@/lib/admin-utils";
import { useAdminUiStore } from "@/store/admin-ui.store";
import { useAdminDoctors, useUpdateDoctorSeo, useUpdateUserStatus } from "@/services/admin-api-hooks";

export function DoctorProfilesPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [seoForm, setSeoForm] = useState({
    profileSlug: "",
    seoFocusKeyword: "",
    seoMetaTitle: "",
    seoMetaDescription: "",
  });

  const doctorsQuery = useAdminDoctors({ page, limit: 20 });
  const updateSeo = useUpdateDoctorSeo();
  const updateStatus = useUpdateUserStatus();

  const doctors = doctorsQuery.data?.data ?? [];
  const meta = doctorsQuery.data?.meta;
  const customSeoCount = doctors.filter((d) => d.seoMetaTitle || d.profileSlug).length;

  const statCards = useMemo(
    () => [
      {
        ic: "ic1",
        icon: "👨‍⚕️",
        num: formatNumber(meta?.total ?? doctors.length),
        label: "Doctor Profiles",
        tag: "Editable",
        tagClass: "tt-b",
      },
      {
        ic: "ic2",
        icon: "🔍",
        num: formatNumber(customSeoCount),
        label: "Custom SEO Set",
        tag: "Overrides live",
        tagClass: "tt-g",
      },
      {
        ic: "ic3",
        icon: "🧬",
        num: "Physician",
        label: "Schema Type",
        tag: "schema.org",
        tagClass: "tt-b",
      },
      {
        ic: "ic4",
        icon: "🔗",
        num: "/authors/",
        label: "Canonical Base",
        tag: "clean URLs",
        tagClass: "tt-a",
      },
    ],
    [meta?.total, doctors.length, customSeoCount],
  );

  const selected = doctors.find((d) => d.id === selectedId);

  const openSeo = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    if (!doctor) return;
    setSelectedId(doctorId);
    const user = doctor.user;
    const name = user ? `Dr. ${user.firstName} ${user.lastName}` : "Doctor";
    setSeoForm({
      profileSlug: doctor.profileSlug ?? "",
      seoFocusKeyword: doctor.seoFocusKeyword ?? doctor.specialty ?? "",
      seoMetaTitle: doctor.seoMetaTitle ?? `${name} — ${doctor.specialty} | DrInsight`,
      seoMetaDescription: doctor.seoMetaDescription ?? doctor.bio?.slice(0, 160) ?? "",
    });
  };

  const rows = doctors.map((doctor) => {
    const user = doctor.user;
    const isSuspended = user?.status === "SUSPENDED";
    const hasSeo = Boolean(doctor.seoMetaTitle || doctor.profileSlug);
    return [
      <UserCell
        key={doctor.id}
        firstName={user?.firstName}
        lastName={user?.lastName}
        sub={doctor.credentials ?? doctor.professionalTitle ?? undefined}
        seed={doctor.id}
        userId={user?.id}
      />,
      doctor.specialty,
      doctor.hospital ?? "—",
      <StatusChip
        key={`${doctor.id}-acct`}
        label={isSuspended ? "Suspended" : "Active"}
        className={isSuspended ? "ch-r" : "ch-g"}
      />,
      <StatusChip
        key={`${doctor.id}-seo`}
        label={hasSeo ? "Custom SEO" : "Using defaults"}
        className={hasSeo ? "ch-g" : "ch-gray"}
      />,
      <div key={`${doctor.id}-a`} className="btn-row">
        {user?.id ? (
          <Link href={adminUserProfileHref(user.id)} className="btn">
            Open
          </Link>
        ) : null}
        <AdminButton onClick={() => openSeo(doctor.id)}>Edit SEO</AdminButton>
        {user?.id && !isSuspended ? (
          <AdminButton
            variant="danger"
            onClick={() => {
              updateStatus.mutate({ id: user.id, status: "SUSPENDED" }, { onSuccess: () => showToast("Doctor suspended") });
            }}
          >
            Suspend
          </AdminButton>
        ) : user?.id ? (
          <AdminButton
            variant="green"
            onClick={() => {
              updateStatus.mutate({ id: user.id, status: "ACTIVE" }, { onSuccess: () => showToast("Doctor reactivated") });
            }}
          >
            Reactivate
          </AdminButton>
        ) : null}
      </div>,
    ];
  });

  return (
    <>
      <StatCardRow items={statCards} />
      <PanelTable
        title="👨‍⚕️ Doctor Profiles"
        headers={["Doctor", "Specialty", "Institution", "Account", "SEO Status", "Actions"]}
        rows={rows}
        loading={doctorsQuery.isLoading}
        pagerInfo={`Showing ${doctors.length} of ${meta?.total ?? 0} doctors`}
        emptyMessage="No doctor profiles found"
      />
      {selected ? (
        <AdminPanel title={`📇 SEO — ${selected.user?.firstName ?? ""} ${selected.user?.lastName ?? ""}`}>
          <div className="form-grid">
            <div className="fg-item">
              <label>Profile URL Slug</label>
              <input
                value={seoForm.profileSlug}
                onChange={(e) => setSeoForm((f) => ({ ...f, profileSlug: e.target.value }))}
                placeholder="dr-javed-kumbhar"
              />
            </div>
            <div className="fg-item">
              <label>Focus Keyword</label>
              <input
                value={seoForm.seoFocusKeyword}
                onChange={(e) => setSeoForm((f) => ({ ...f, seoFocusKeyword: e.target.value }))}
              />
            </div>
            <div className="fg-item full">
              <label>Meta Title</label>
              <input
                value={seoForm.seoMetaTitle}
                onChange={(e) => setSeoForm((f) => ({ ...f, seoMetaTitle: e.target.value }))}
              />
            </div>
            <div className="fg-item full">
              <label>Meta Description</label>
              <textarea
                rows={3}
                value={seoForm.seoMetaDescription}
                onChange={(e) => setSeoForm((f) => ({ ...f, seoMetaDescription: e.target.value }))}
              />
            </div>
          </div>
          <div className="btn-row" style={{ marginTop: 14 }}>
            <AdminButton
              variant="primary"
              onClick={() => {
                updateSeo.mutate(
                  { doctorId: selected.id, ...seoForm },
                  { onSuccess: () => showToast("✅ SEO saved") },
                );
              }}
            >
              💾 Save SEO
            </AdminButton>
            <AdminButton onClick={() => setSelectedId(null)}>Close</AdminButton>
          </div>
        </AdminPanel>
      ) : null}
    </>
  );
}
