import { redirect } from "next/navigation";

export default function AdminQuestionsIndexPage() {
  redirect("/admin/questions/pending");
}
