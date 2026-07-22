"use client";



import Link from "next/link";

import { useSearchParams } from "next/navigation";

import { useState } from "react";

import { AdminPatientProfileView } from "@/components/admin/patient-profiles/AdminPatientProfileView";

import { AdminPatientProfileWorkspace } from "@/components/admin/patient-profiles/AdminPatientProfileWorkspace";



export function AdminPatientProfileDetailPageContent({ patientId }: { patientId: string }) {

  const searchParams = useSearchParams();

  const [editMode, setEditMode] = useState(searchParams.get("edit") === "1");



  return (

    <>

      <Link href="/admin/patient-profiles" className="detail-back">

        ← Back to Patient Profiles

      </Link>



      {editMode ? (

        <AdminPatientProfileWorkspace

          patientId={patientId}

          editMode={editMode}

          onToggleEdit={() => setEditMode(false)}

        />

      ) : (

        <AdminPatientProfileView patientId={patientId} onEdit={() => setEditMode(true)} />

      )}

    </>

  );

}

