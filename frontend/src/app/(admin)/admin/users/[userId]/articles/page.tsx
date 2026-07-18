import type { Metadata } from "next";
import { DoctorArticlesPageContent } from "@/components/admin/pages/DoctorArticlesPageContent";

export const metadata: Metadata = {
  title: "Doctor Articles — DrInsight Admin",
  robots: { index: false, follow: false },
};

export default async function DoctorArticlesPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <DoctorArticlesPageContent userId={userId} />;
}
