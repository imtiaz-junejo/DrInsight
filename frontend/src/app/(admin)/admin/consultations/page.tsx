import { redirect } from "next/navigation";

export default function AdminConsultationsIndexPage() {
  redirect("/admin/consultations/pending");
}
