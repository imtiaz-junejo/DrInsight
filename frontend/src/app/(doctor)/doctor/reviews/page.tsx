import type { Metadata } from "next";
import { doctorPageMeta } from "@/config/doctor-nav";
import { ReviewsPageContent } from "@/components/doctor/pages/ReviewsPageContent";

const routeId = "reviews" as const;

export const metadata: Metadata = {
  title: `${doctorPageMeta[routeId][0]} — MedAuthority`,
  description: doctorPageMeta[routeId][1],
};

export default function DoctorReviewsPage() {
  return <ReviewsPageContent />;
}
