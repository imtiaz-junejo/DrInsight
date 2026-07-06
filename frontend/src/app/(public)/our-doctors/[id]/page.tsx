"use client";

import { useParams } from "next/navigation";
import { DoctorBioPageContent } from "@/components/doctors/DoctorBioPageContent";

export default function DoctorDetailPage() {
  const params = useParams<{ id: string }>();
  return <DoctorBioPageContent doctorId={params.id} />;
}
