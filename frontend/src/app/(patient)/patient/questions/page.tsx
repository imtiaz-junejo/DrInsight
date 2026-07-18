import { redirect } from "next/navigation";

export default function PatientQuestionsIndexPage() {
  redirect("/patient/questions/ask");
}
