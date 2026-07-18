import type { Metadata } from "next";
import { AdminUserProfilePageContent } from "@/components/admin/pages/AdminUserProfilePageContent";

export const metadata: Metadata = {
  title: "User Profile — DrInsight Admin",
  robots: { index: false, follow: false },
};

export default async function AdminUserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <AdminUserProfilePageContent userId={userId} />;
}
