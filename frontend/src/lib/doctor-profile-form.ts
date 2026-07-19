import type {
  DoctorAwardItem,
  DoctorCertificationItem,
  DoctorProfile,
  DoctorSpeakingItem,
} from "@/services/api-hooks";
import { formatDate } from "@/lib/data-mappers";
import { doctorDisplayName, stripDoctorPrefix } from "@/lib/doctor-utils";

export type DoctorProfileFormState = {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  country: string;
  city: string;
  specialty: string;
  credentials: string;
  experience: string;
  license: string;
  regBody: string;
  institution: string;
  responseTime: string;
  languages: string;
  title: string;
  bioShort: string;
  bioFull: string;
  expertise: string;
  education: string;
  boardCerts: string;
  awards: string;
  lectures: string;
  facebook: string;
  twitter: string;
  youtube: string;
  instagram: string;
  linkedin: string;
};

export function emptyDoctorProfileForm(): DoctorProfileFormState {
  return {
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    country: "",
    city: "",
    specialty: "",
    credentials: "",
    experience: "",
    license: "",
    regBody: "",
    institution: "",
    responseTime: "",
    languages: "",
    title: "",
    bioShort: "",
    bioFull: "",
    expertise: "",
    education: "",
    boardCerts: "",
    awards: "",
    lectures: "",
    facebook: "",
    twitter: "",
    instagram: "",
    youtube: "",
    linkedin: "",
  };
}

function formatDobInput(value?: string | Date | null): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function formatDobDisplay(value?: string | Date | null): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return formatDate(date.toISOString(), { month: "long", day: "numeric", year: "numeric" });
}

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const normalized = stripDoctorPrefix(fullName.trim());
  if (!normalized) return { firstName: "", lastName: "" };
  const parts = normalized.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export function certsToText(items?: DoctorCertificationItem[] | null): string {
  return (items ?? [])
    .map((item) => [item.icon ?? "🏥", item.title, item.subtitle].filter(Boolean).join("|"))
    .join("\n");
}

export function textToCerts(text: string): DoctorCertificationItem[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((part) => part.trim());
      const [icon, title, ...rest] = parts;
      return {
        icon: icon || "🏥",
        title: title || "",
        subtitle: rest.join("|") || "",
      };
    });
}

export function awardsToText(items?: DoctorAwardItem[] | null): string {
  return (items ?? [])
    .map((item) => [item.icon ?? "🏆", item.title, item.organization, item.year].filter(Boolean).join("|"))
    .join("\n");
}

export function textToAwards(text: string): DoctorAwardItem[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((part) => part.trim());
      const [icon, title, organization, year] = parts;
      return {
        icon: icon || "🏆",
        title: title || "",
        organization: organization || "",
        year: year || "",
      };
    });
}

export function lecturesToText(items?: DoctorSpeakingItem[] | null): string {
  return (items ?? [])
    .map((item) => [item.title, item.venue, item.type, item.year].filter(Boolean).join("|"))
    .join("\n");
}

export function textToLectures(text: string): DoctorSpeakingItem[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((part) => part.trim());
      const [title, venue, type, year] = parts;
      return {
        title: title || "",
        venue: venue || "",
        type: type || "Conference",
        year: year || "",
      };
    });
}

export function profileToForm(
  doctor: DoctorProfile,
  auth?: { email?: string; phone?: string | null; firstName?: string; lastName?: string } | null,
): DoctorProfileFormState {
  const user = doctor.user;
  return {
    fullName: doctorDisplayName(user?.firstName ?? auth?.firstName, user?.lastName ?? auth?.lastName),
    email: user?.email ?? auth?.email ?? "",
    phone: user?.phone ?? auth?.phone ?? "",
    dob: formatDobInput(doctor.dateOfBirth as string | undefined),
    country: doctor.country ?? "",
    city: doctor.city ?? "",
    specialty: doctor.specialty ?? "",
    credentials: doctor.credentials ?? "",
    experience: doctor.experienceYears ? String(doctor.experienceYears) : "",
    license: doctor.licenseNumber ?? "",
    regBody: doctor.licenseBoard ?? "",
    institution: doctor.hospital ?? "",
    responseTime: doctor.responseTime ?? "",
    languages: (doctor.languages ?? []).join(", "),
    title: doctor.professionalTitle ?? "",
    bioShort: doctor.bio ?? "",
    bioFull: doctor.bioFull ?? "",
    expertise: (doctor.expertise ?? []).join(", "),
    education: doctor.education ?? "",
    boardCerts: certsToText(doctor.certifications),
    awards: awardsToText(doctor.awards),
    lectures: lecturesToText(doctor.speakingEngagements),
    facebook: doctor.facebookUrl ?? "",
    twitter: doctor.twitterUrl ?? "",
    youtube: doctor.youtubeUrl ?? "",
    instagram: doctor.instagramUrl ?? "",
    linkedin: doctor.linkedinUrl ?? "",
  };
}

export function formToDoctorPayload(form: DoctorProfileFormState): Record<string, unknown> {
  const experienceYears = Number.parseInt(form.experience, 10);
  return {
    specialty: form.specialty.trim() || undefined,
    credentials: form.credentials.trim() || undefined,
    professionalTitle: form.title.trim() || undefined,
    experienceYears: Number.isFinite(experienceYears) ? experienceYears : 0,
    licenseNumber: form.license.trim() || undefined,
    licenseBoard: form.regBody.trim() || undefined,
    hospital: form.institution.trim() || undefined,
    responseTime: form.responseTime.trim() || undefined,
    languages: form.languages
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    bio: form.bioShort.trim() || undefined,
    bioFull: form.bioFull.trim() || undefined,
    expertise: form.expertise
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    education: form.education.trim() || undefined,
    city: form.city.trim() || undefined,
    country: form.country.trim() || undefined,
    dateOfBirth: form.dob || undefined,
    certifications: textToCerts(form.boardCerts),
    awards: textToAwards(form.awards),
    speakingEngagements: textToLectures(form.lectures),
    facebookUrl: form.facebook.trim() || undefined,
    twitterUrl: form.twitter.trim() || undefined,
    youtubeUrl: form.youtube.trim() || undefined,
    instagramUrl: form.instagram.trim() || undefined,
    linkedinUrl: form.linkedin.trim() || undefined,
  };
}

export function formToUserPayload(
  form: DoctorProfileFormState,
  avatarUrl?: string | null,
): { firstName: string; lastName: string; phone?: string; avatarUrl?: string | null } {
  const { firstName, lastName } = splitFullName(form.fullName);
  return {
    firstName,
    lastName,
    phone: form.phone.trim() || undefined,
    ...(avatarUrl !== undefined ? { avatarUrl } : {}),
  };
}

export function memberSinceLabel(createdAt?: string | null): string {
  if (!createdAt) return "—";
  return formatDate(createdAt, { month: "long", year: "numeric" });
}

export function displayDob(value?: string): string {
  if (!value) return "—";
  return formatDobDisplay(value);
}

export function parseChipList(value?: string): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseLineList(value?: string): string[] {
  return (value ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export { formatDobDisplay };
