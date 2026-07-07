import type { ReactNode } from "react";

export type StatusVariant = "good" | "moderate" | "warning" | "danger" | "info";

export type ResultSection = {
  title: string;
  content: ReactNode;
  variant?: "default" | "warning" | "tips" | "disclaimer";
};

export type HealthToolModalData = {
  toolId: string;
  icon: string;
  iconClass: string;
  title: string;
  primaryLabel: string;
  primaryValue: string;
  status: { text: string; variant: StatusVariant };
  sections: ResultSection[];
};
