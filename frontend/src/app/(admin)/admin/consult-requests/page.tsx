import { redirect } from "next/navigation";

export default function AdminConsultRequestsRedirect() {
  redirect("/admin/consultations/pending");
}
