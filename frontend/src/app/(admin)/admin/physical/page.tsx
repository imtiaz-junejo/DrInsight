import { redirect } from "next/navigation";

export default function AdminPhysicalIndexPage() {
  redirect("/admin/physical/pending");
}
