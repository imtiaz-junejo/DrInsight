import type { Metadata } from "next";
import { PatientNoteDetailPageContent } from "@/components/patient/pages/PatientNoteDetailPageContent";

export const metadata: Metadata = {
  title: "Doctor Note — DrInsight",
  description: "View consultation note from your doctor",
};

export default async function PatientNoteDetailPage({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) {
  const { noteId } = await params;
  return <PatientNoteDetailPageContent noteId={noteId} />;
}
