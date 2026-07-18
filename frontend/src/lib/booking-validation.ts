export type PatientInfoField =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "dateOfBirth"
  | "gender"
  | "reason";

export type PatientInfoErrors = Partial<Record<PatientInfoField, string>>;

export interface PatientInfoInput {
  billingName: string;
  billingEmail: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  reason: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "response" in error) {
    const message = (error as { response?: { data?: { message?: string | string[] } } }).response?.data
      ?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string" && message.trim()) return message;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

export function validatePatientInfoForm(input: PatientInfoInput): {
  valid: boolean;
  errors: PatientInfoErrors;
  messages: string[];
} {
  const errors: PatientInfoErrors = {};
  const messages: string[] = [];

  const firstName = input.billingName.split(" ")[0]?.trim() ?? "";
  const lastName = input.billingName.split(" ").slice(1).join(" ").trim();
  const email = input.billingEmail.trim();
  const phoneDigits = input.phone.replace(/\D/g, "");

  if (!firstName) {
    errors.firstName = "First name is required";
    messages.push("First name");
  }
  if (!lastName) {
    errors.lastName = "Last name is required";
    messages.push("Last name");
  }
  if (!email) {
    errors.email = "Email address is required";
    messages.push("Email address");
  } else if (!EMAIL_RE.test(email)) {
    errors.email = "Enter a valid email address";
    messages.push("Valid email address");
  }
  if (!phoneDigits) {
    errors.phone = "Phone number is required";
    messages.push("Phone number");
  } else if (phoneDigits.length < 7) {
    errors.phone = "Enter a valid phone number";
    messages.push("Valid phone number");
  }
  if (!input.dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required";
    messages.push("Date of birth");
  }
  if (!input.gender) {
    errors.gender = "Please select biological sex";
    messages.push("Biological sex");
  }
  if (!input.reason.trim()) {
    errors.reason = "Please describe your reason for consultation";
    messages.push("Reason for consultation");
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    messages,
  };
}
