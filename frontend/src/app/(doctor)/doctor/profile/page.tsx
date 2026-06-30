import type { Metadata } from "next";
import { doctorPageMeta } from "@/config/doctor-nav";
import { ProfilePageContent } from "@/components/doctor/pages/ProfilePageContent";

const routeId = "profile" as const;

export const metadata: Metadata = {
  title: `${doctorPageMeta[routeId][0]} — MedAuthority`,
  description: doctorPageMeta[routeId][1],
};

export default function DoctorProfilePage() {
  return <ProfilePageContent />;
}
