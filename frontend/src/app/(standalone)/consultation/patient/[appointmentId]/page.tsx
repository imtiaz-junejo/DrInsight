import type { Metadata } from "next";
import { PatientConsultationPageContent } from "@/components/consultation/PatientConsultationPageContent";
import "@/styles/consultation.css";

export const metadata: Metadata = {
  title: "Video Consultation — DrInsight",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ appointmentId: string }>;
}

export default async function StandalonePatientConsultationPage({ params }: PageProps) {
  const { appointmentId } = await params;
  return <PatientConsultationPageContent appointmentId={appointmentId} />;
}
