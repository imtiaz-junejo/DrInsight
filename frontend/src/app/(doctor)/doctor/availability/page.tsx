import type { Metadata } from "next";
import { doctorPageMeta } from "@/config/doctor-nav";
import { OnlineAvailabilityContent } from "@/components/doctor/pages/OnlineAvailabilityContent";

const routeId = "oc-availability" as const;

export const metadata: Metadata = {
  title: `${doctorPageMeta[routeId][0]} — DrInsight`,
  description: doctorPageMeta[routeId][1],
};

export default function DoctorAvailabilityPage() {
  return <OnlineAvailabilityContent />;
}
