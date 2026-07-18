/** Display patient ID with leading hash, e.g. PT-2891 → #PT-2891 */
export function formatPatientDisplayId(patientNumber?: string | null, fallbackProfileId?: string): string {
  if (patientNumber?.trim()) {
    const value = patientNumber.trim();
    if (value.startsWith("#")) return value;
    if (value.startsWith("PT-")) return `#${value}`;
    return `#PT-${value}`;
  }
  if (fallbackProfileId) {
    return `#PT-${fallbackProfileId.slice(-4).toUpperCase()}`;
  }
  return "—";
}

/** Prescription document patient ID without hash, e.g. PT-2891 */
export function formatPatientPrescriptionId(patientNumber?: string | null, fallbackProfileId?: string): string {
  if (patientNumber?.trim()) {
    const value = patientNumber.trim().replace(/^#/, "");
    return value.startsWith("PT-") ? value : `PT-${value}`;
  }
  if (fallbackProfileId) {
    return `PT-${fallbackProfileId.slice(-4).toUpperCase()}`;
  }
  return "—";
}

/** Prescription document doctor ID, e.g. DOC-1042 */
export function formatDoctorPrescriptionId(doctorNumber?: string | null, fallbackProfileId?: string): string {
  if (doctorNumber?.trim()) {
    const value = doctorNumber.trim().replace(/^#/, "");
    return value.startsWith("DOC-") ? value : `DOC-${value}`;
  }
  if (fallbackProfileId) {
    return `DOC-${fallbackProfileId.slice(-4).toUpperCase()}`;
  }
  return "—";
}

export function formatDoctorDisplayId(doctorNumber?: string | null, fallbackProfileId?: string): string {
  if (doctorNumber?.trim()) {
    const value = doctorNumber.trim();
    if (value.startsWith("#")) return value;
    if (value.startsWith("DOC-")) return `#${value}`;
    return `#DOC-${value}`;
  }
  if (fallbackProfileId) {
    return `#DOC-${fallbackProfileId.slice(-4).toUpperCase()}`;
  }
  return "—";
}
