"use client";

import "@/styles/e-prescription.css";
import { useEPrescriptionBuilder } from "./hooks/useEPrescriptionBuilder";
import { EPrescriptionBuilderView } from "./EPrescriptionBuilderView";
import type { EPrescriptionBuilderProps } from "./hooks/useEPrescriptionBuilder";

export function EPrescriptionBuilder(props: EPrescriptionBuilderProps) {
  const model = useEPrescriptionBuilder(props);
  return <EPrescriptionBuilderView {...model} />;
}

export type { PrescriptionMed, PrescriptionPreviewData } from "./types";
export { COMMON_MEDS, SYMPTOMS, INVESTIGATIONS } from "./constants";
