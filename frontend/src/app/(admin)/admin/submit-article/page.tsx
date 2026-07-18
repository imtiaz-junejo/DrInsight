import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminSubmitArticlePageContent } from "@/components/admin/pages/AdminSubmitArticlePageContent";
import "@/styles/doctor-dashboard.css";

export const metadata: Metadata = {
  title: "Submit Article — Admin — DrInsight",
  robots: { index: false, follow: false },
};

export default function AdminSubmitArticlePage() {
  return (
    <Suspense fallback={<p style={{ padding: 24 }}>Loading editor...</p>}>
      <AdminSubmitArticlePageContent />
    </Suspense>
  );
}
