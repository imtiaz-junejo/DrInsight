"use client";

import { useParams } from "next/navigation";
import { AuthorBioPageContent } from "@/components/doctors/DoctorBioPageContent";

export default function AuthorProfilePage() {
  const params = useParams<{ slug: string }>();
  return <AuthorBioPageContent slug={params.slug} />;
}
