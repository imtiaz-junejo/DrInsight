export const EMAIL_TEMPLATE_VARIABLES = [
  "{{patientName}}",
  "{{doctorName}}",
  "{{appointmentDate}}",
  "{{appointmentTime}}",
  "{{verificationCode}}",
  "{{resetLink}}",
  "{{hospitalName}}",
] as const;

export const OTP_TEMPLATE_VARIABLES = ["{{otp}}", "{{userName}}", "{{expiry}}"] as const;

export const EMAIL_CATEGORIES = [
  "Onboarding",
  "Security",
  "Appointments",
  "Editorial",
  "Marketing",
  "General",
] as const;

export const OTP_PURPOSES = [
  { value: "LOGIN", label: "Login OTP" },
  { value: "REGISTRATION", label: "Registration OTP" },
  { value: "EMAIL_VERIFICATION", label: "Email Verification" },
  { value: "PHONE_VERIFICATION", label: "Phone Verification" },
  { value: "PASSWORD_RESET", label: "Password Reset" },
  { value: "TWO_FACTOR", label: "Two-Factor Authentication" },
] as const;

export const NOTIFICATION_CHANNELS = [
  { value: "IN_APP", label: "In-App" },
  { value: "EMAIL", label: "Email" },
  { value: "SMS", label: "SMS" },
  { value: "PUSH", label: "Push Notification" },
] as const;

export const NOTIFICATION_AUDIENCES = [
  { value: "ALL_USERS", label: "All Users" },
  { value: "PATIENTS", label: "Patients" },
  { value: "DOCTORS", label: "Doctors" },
  { value: "ADMINS", label: "Admins" },
  { value: "INDIVIDUAL", label: "Individual User" },
] as const;

export const NOTIFICATION_PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
] as const;

export const CAMPAIGN_STATUSES = [
  { value: "DRAFT", label: "Draft", chip: "ch-gray" },
  { value: "SCHEDULED", label: "Scheduled", chip: "ch-a" },
  { value: "SENT", label: "Sent", chip: "ch-g" },
  { value: "ARCHIVED", label: "Archived", chip: "ch-b" },
] as const;

export function purposeLabel(purpose: string) {
  return OTP_PURPOSES.find((item) => item.value === purpose)?.label ?? purpose;
}

export function audienceLabel(audience: string) {
  return NOTIFICATION_AUDIENCES.find((item) => item.value === audience)?.label ?? audience;
}

export function channelLabel(channel: string) {
  return NOTIFICATION_CHANNELS.find((item) => item.value === channel)?.label ?? channel;
}

export function formatChannels(channels: string[]) {
  return channels.map(channelLabel).join(" + ");
}
