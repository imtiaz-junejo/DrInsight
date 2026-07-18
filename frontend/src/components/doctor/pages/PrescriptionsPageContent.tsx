"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  DashButton,
  DashCard,
  DashPageHeader,
  FilterPills,
  StatCardRow,
  TableButton,
} from "@/components/doctor/ui/DoctorPrimitives";
import { formatDate } from "@/lib/data-mappers";
import {
  prescriptionDosageSummary,
  prescriptionPrimaryMedication,
  prescriptionRefillLabel,
  prescriptionStatusClass,
  prescriptionStatusLabel,
} from "@/lib/prescription-mapper";
import { todayFormatted } from "@/lib/doctor-utils";
import {
  type PrescriptionStatusFilter,
  useDoctorPrescriptionList,
  useDoctorPrescriptionStats,
} from "@/services/doctor-api-hooks";

const STATUS_FILTERS: Array<{ label: string; value?: PrescriptionStatusFilter }> = [
  { label: "All" },
  { label: "Active", value: "ISSUED" },
  { label: "Pending", value: "PENDING_REVIEW" },
  { label: "Draft", value: "DRAFT" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "patient", label: "Patient name" },
] as const;

function EmptyState({ loading, message }: { loading?: boolean; message: string }) {
  return (
    <tr>
      <td colSpan={7} style={{ textAlign: "center", color: "var(--gray-400)", padding: 32, fontSize: "0.84rem" }}>
        {loading ? "Loading prescriptions..." : message}
      </td>
    </tr>
  );
}

export function PrescriptionsPageContent() {
  const router = useRouter();
  const [filterIndex, setFilterIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]["value"]>("newest");

  const statusFilter = STATUS_FILTERS[filterIndex]?.value;
  const listQuery = useDoctorPrescriptionList({
    page,
    limit: 10,
    search: search.trim() || undefined,
    status: statusFilter,
    sort,
  });
  const statsQuery = useDoctorPrescriptionStats();

  const prescriptions = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta;
  const stats = statsQuery.data;

  const filterLabels = useMemo(
    () =>
      STATUS_FILTERS.map((filter) => {
        if (!stats || filter.value == null) return filter.label;
        const countMap: Partial<Record<PrescriptionStatusFilter, number>> = {
          ISSUED: stats.issued,
          PENDING_REVIEW: stats.pending,
          DRAFT: stats.draft,
        };
        const count = filter.value ? countMap[filter.value] : stats.total;
        return count != null ? `${filter.label} (${count})` : filter.label;
      }),
    [stats],
  );

  const statCards = useMemo(
    () => [
      {
        ic: "ic1",
        icon: "💊",
        num: String(stats?.total ?? 0),
        label: "Total Prescriptions",
        tag: "All issued",
        tagClass: "tt-b",
        bgIcon: "💊",
      },
      {
        ic: "ic2",
        icon: "✅",
        num: String(stats?.issued ?? 0),
        label: "Active",
        tag: "Currently valid",
        tagClass: "tt-g",
        bgIcon: "✅",
      },
      {
        ic: "ic3",
        icon: "⏳",
        num: String(stats?.pending ?? 0),
        label: "Pending Review",
        tag: "Awaiting approval",
        tagClass: "tt-a",
        bgIcon: "⏳",
      },
      {
        ic: "ic4",
        icon: "📝",
        num: String(stats?.draft ?? 0),
        label: "Drafts",
        tag: "Not yet issued",
        tagClass: "tt-gray",
        bgIcon: "📝",
      },
    ],
    [stats],
  );

  return (
    <>
      <DashPageHeader
        subtitle="👨‍⚕️ Physician Dashboard"
        title="Prescriptions"
        dateStr={todayFormatted()}
        actions={
          <Link href="/doctor/prescriptions/new">
            <DashButton variant="solid">💊 New Prescription</DashButton>
          </Link>
        }
      />

      <StatCardRow items={statCards} />

      <DashCard
        title="💊 Recent Prescriptions Issued"
        headerExtra={
          <span style={{ fontSize: "0.76rem", color: "var(--gray-400)" }}>
            {listQuery.isLoading ? "Loading..." : `${meta?.total ?? 0} total`}
          </span>
        }
      >
        <div className="search-bar">
          <div className="search-ico-w">
            <input
              className="search-inp"
              placeholder="Search by patient, medication, or Rx number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
          <FilterPills
            filters={filterLabels}
            activeIndex={filterIndex}
            onChange={(index) => {
              setFilterIndex(index);
              setPage(1);
            }}
          />
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as (typeof SORT_OPTIONS)[number]["value"]);
              setPage(1);
            }}
            style={{
              marginLeft: "auto",
              padding: "8px 12px",
              border: "1.5px solid var(--gray-200)",
              borderRadius: 8,
              fontSize: "0.8rem",
              fontFamily: "var(--font-body)",
              color: "var(--gray-700)",
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="pt-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Issued</th>
                <th>Refills</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {listQuery.isLoading || prescriptions.length === 0 ? (
                <EmptyState
                  loading={listQuery.isLoading}
                  message="No prescriptions issued yet. Create your first e-prescription for a patient."
                />
              ) : (
                prescriptions.map((rx) => {
                  const patientName =
                    `${rx.patient?.user?.firstName ?? ""} ${rx.patient?.user?.lastName ?? ""}`.trim() || "Patient";
                  const issuedDate = rx.issuedAt ?? rx.createdAt;
                  const isToday =
                    new Date(issuedDate).toDateString() === new Date().toDateString();

                  return (
                    <tr key={rx.id}>
                      <td>
                        <strong>{patientName}</strong>
                      </td>
                      <td>{prescriptionPrimaryMedication(rx)}</td>
                      <td>{prescriptionDosageSummary(rx)}</td>
                      <td>{isToday ? "Today" : formatDate(issuedDate)}</td>
                      <td>{prescriptionRefillLabel(rx)}</td>
                      <td>
                        <span className={`st-chip ${prescriptionStatusClass(rx.status)}`}>
                          {prescriptionStatusLabel(rx.status)}
                        </span>
                      </td>
                      <td>
                        <TableButton variant="view" onClick={() => router.push(`/doctor/prescriptions/${rx.id}`)}>
                          👁 View
                        </TableButton>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 16,
              fontSize: "0.8rem",
              color: "var(--gray-500)",
            }}
          >
            <span>
              Page {meta.page} of {meta.totalPages}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <DashButton
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Previous
              </DashButton>
              <DashButton
                variant="outline"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              >
                Next →
              </DashButton>
            </div>
          </div>
        ) : null}
      </DashCard>
    </>
  );
}
