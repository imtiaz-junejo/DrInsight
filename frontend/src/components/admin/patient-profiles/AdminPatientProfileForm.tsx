"use client";

import { useFormContext } from "react-hook-form";
import type { AdminPatientProfileFormValues } from "@/lib/admin-patient-profile-schema";

function Field({
  label,
  name,
  type = "text",
  as = "input",
  rows,
}: {
  label: string;
  name: keyof AdminPatientProfileFormValues;
  type?: string;
  as?: "input" | "textarea";
  rows?: number;
}) {
  const { register } = useFormContext<AdminPatientProfileFormValues>();
  return (
    <label className="fg-item" style={{ display: "block", marginBottom: 12 }}>
      <span style={{ display: "block", fontSize: ".72rem", fontWeight: 700, color: "var(--gray-500)", marginBottom: 4 }}>
        {label}
      </span>
      {as === "textarea" ? (
        <textarea {...register(name)} rows={rows ?? 3} style={{ width: "100%" }} />
      ) : (
        <input {...register(name)} type={type} style={{ width: "100%" }} readOnly={name === "email"} />
      )}
    </label>
  );
}

export function AdminPatientProfileForm() {
  return (
    <div
      style={{
        marginBottom: 16,
        padding: 16,
        border: "1.5px solid var(--blue-light)",
        borderRadius: 12,
        background: "#f8fbff",
      }}
    >
      <div style={{ fontFamily: "var(--font-d)", fontWeight: 700, marginBottom: 12 }}>✏️ Edit Patient Profile</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        <Field label="Full Name" name="fullName" />
        <Field label="Email" name="email" />
        <Field label="Phone" name="phone" />
        <Field label="Patient Number" name="patientNumber" />
        <Field label="Date of Birth" name="dateOfBirth" type="date" />
        <Field label="Gender" name="gender" />
        <Field label="Blood Group" name="bloodGroup" />
        <Field label="City" name="city" />
        <Field label="Province" name="province" />
        <Field label="Country" name="country" />
        <Field label="Postal Code" name="postalCode" />
        <Field label="Language Preference" name="languagePreference" />
      </div>
      <Field label="Address" name="address" />
      <Field label="Allergies (comma-separated)" name="allergies" />
      <Field label="Health Interests (comma-separated)" name="healthInterests" />
      <Field label="Medical History" name="medicalHistory" as="textarea" rows={4} />
      <Field label="Emergency Contact" name="emergencyContact" />
    </div>
  );
}
