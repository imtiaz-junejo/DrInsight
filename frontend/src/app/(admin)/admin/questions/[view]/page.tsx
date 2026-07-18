import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { adminPageMeta } from "@/config/admin-nav";
import {
  AdminQuestionsPageContent,
  type AdminQuestionView,
} from "@/components/admin/pages/AdminQuestionsPageContent";

const VIEWS: AdminQuestionView[] = ["pending", "approved", "rejected", "answered", "reports"];

export async function generateMetadata({ params }: { params: Promise<{ view: string }> }): Promise<Metadata> {
  const { view } = await params;
  const meta = adminPageMeta[`qa-${view}`];
  if (!meta) return { title: "Patient Q&A — DrInsight Admin" };
  return { title: `${meta[0]} — DrInsight Admin`, description: meta[1] };
}

export default async function AdminQuestionsViewPage({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;
  if (!VIEWS.includes(view as AdminQuestionView)) notFound();
  return <AdminQuestionsPageContent view={view as AdminQuestionView} />;
}
