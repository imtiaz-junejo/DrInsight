import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ appointmentId: string }>;
}

export default async function LegacyPatientConsultationPage({ params }: PageProps) {
  const { appointmentId } = await params;
  redirect(`/consultation/patient/${appointmentId}`);
}
