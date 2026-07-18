import type { Metadata } from "next";
import { DoctorConsultationPageContent } from "@/components/consultation/DoctorConsultationPageContent";
import "@/styles/consultation.css";

export const metadata: Metadata = {
  title: "Video Consultation — DrInsight",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ appointmentId: string }>;
}

export default async function StandaloneDoctorConsultationPage({ params }: PageProps) {
  const { appointmentId } = await params;
  return <DoctorConsultationPageContent appointmentId={appointmentId} />;
}
