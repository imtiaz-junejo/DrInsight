import type { Metadata } from "next";
import { NewPrescriptionPageContent } from "@/components/doctor/pages/NewPrescriptionPageContent";

export const metadata: Metadata = {
  title: "New Prescription — DrInsight",
  description: "Write a new e-prescription",
};

export default function DoctorNewPrescriptionPage() {
  return <NewPrescriptionPageContent />;
}
