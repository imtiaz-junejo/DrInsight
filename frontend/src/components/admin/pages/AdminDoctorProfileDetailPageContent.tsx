"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { AdminDoctorProfileWorkspace } from "@/components/admin/doctor-profiles/AdminDoctorProfileWorkspace";

export function AdminDoctorProfileDetailPageContent({ doctorId }: { doctorId: string }) {
  const searchParams = useSearchParams();
  const [editMode, setEditMode] = useState(searchParams.get("edit") === "1");

  return (
    <>
      <Link href="/admin/doctor-profiles" className="detail-back">
        ← Back to Doctor Profiles
      </Link>

      <AdminDoctorProfileWorkspace
        doctorId={doctorId}
        editMode={editMode}
        onToggleEdit={() => setEditMode((value) => !value)}
      />
    </>
  );
}
