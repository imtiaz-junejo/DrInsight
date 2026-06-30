"use client";

import Link from "next/link";
import {
  AdminButton,
  PanelTable,
  StatusChip,
  UserCell,
} from "@/components/admin/ui/AdminPrimitives";
import { useAdminUiStore } from "@/store/admin-ui.store";
import { useAdminDoctors } from "@/services/admin-api-hooks";

export function AuthorsPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const doctorsQuery = useAdminDoctors({ limit: 20 });

  const rows = (doctorsQuery.data?.data ?? []).map((doctor) => [
    <UserCell
      key={doctor.id}
      firstName={doctor.user?.firstName}
      lastName={doctor.user?.lastName}
      sub={`Reviewer · ${doctor.specialty}`}
      seed={doctor.id}
    />,
    doctor.specialty,
    "—",
    String(doctor.reviewCount),
    <StatusChip key={`${doctor.id}-s`} label="Verified" className="ch-g" />,
    <div key={`${doctor.id}-a`} className="btn-row">
      <AdminButton onClick={() => showToast("Opening profile...")}>View Profile</AdminButton>
    </div>,
  ]);

  return (
    <PanelTable
      title="✍️ Author Directory"
      actions={
        <Link href="/admin/doctors" className="btn">
          Manage Doctor Accounts →
        </Link>
      }
      headers={["Author", "Specialty", "Articles", "Reviews Given", "Status", "Actions"]}
      rows={rows}
      loading={doctorsQuery.isLoading}
      emptyMessage="No authors found"
    />
  );
}
