import { redirect } from "next/navigation";

export default function PatientConsultationsIndexPage() {
  redirect("/patient/consultations/upcoming");
}
