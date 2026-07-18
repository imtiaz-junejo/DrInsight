import type { Metadata } from "next";
import { Suspense } from "react";
import { DoctorNoteDetailPageContent } from "@/components/doctor/pages/DoctorNoteDetailPageContent";

export const metadata: Metadata = {
  title: "Note Details — DrInsight",
  description: "View clinical note details",
};

export default async function DoctorNoteDetailPage({
  params,
}: {
  params: Promise<{ patientId: string; noteId: string }>;
}) {
  const { patientId, noteId } = await params;
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading note...</div>}>
      <DoctorNoteDetailPageContent patientId={patientId} noteId={noteId} />
    </Suspense>
  );
}
