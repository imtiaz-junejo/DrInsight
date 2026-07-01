import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Health Tools & Calculators — MedAuthority",
  description:
    "15+ free, medically reviewed health calculators — BMI, BMR, calorie needs, heart rate zones, pregnancy due date, diabetes risk, and more.",
};

export default function HealthToolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
