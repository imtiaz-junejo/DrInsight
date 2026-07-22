import {
  awardsToText,
  certsToText,
  formToDoctorPayload,
  lecturesToText,
  profileToForm,
  splitFullName,
  textToAwards,
  textToCerts,
  textToLectures,
  type DoctorProfileFormState,
} from "@/lib/doctor-profile-form";
import { doctorSeoDefaults, doctorCanonicalUrl } from "@/lib/admin-doctor-seo";
import type { AdminDoctorProfileFormValues } from "@/lib/admin-doctor-profile-schema";
import type { DoctorProfile } from "@/services/api-hooks";
import { specialtyEmoji } from "@/lib/data-mappers";
import { formatDate } from "@/lib/data-mappers";

export function doctorToAdminForm(doctor: DoctorProfile): AdminDoctorProfileFormValues {
  const base = profileToForm(doctor, doctor.user);
  const defaults = doctorSeoDefaults(doctor);
  const location = [doctor.city, doctor.country].filter(Boolean).join(", ");
  const schema =
    doctor.seoSchemaJson != null
      ? JSON.stringify(doctor.seoSchemaJson, null, 2)
      : "";

  return {
    ...base,
    specLabel: `${specialtyEmoji(doctor.specialty)} ${doctor.specialty}`,
    photoIcon: specialtyEmoji(doctor.specialty),
    location,
    coiDeclaration: doctor.conflictOfInterest ?? "",
    coiUpdated: doctor.coiUpdatedAt
      ? formatDate(doctor.coiUpdatedAt, { month: "long", day: "numeric", year: "numeric" })
      : "",
    roleAuthorSince:
      doctor.authorSince ??
      (doctor.user?.createdAt
        ? formatDate(doctor.user.createdAt, { month: "long", year: "numeric" })
        : ""),
    roleEditorialBoard: doctor.editorialBoard
      ? `Yes — ${doctor.platformRole ?? `${doctor.specialty} Section Editor`}`
      : doctor.platformRole ?? "Contributing Author",
    roleReviewerFor: doctor.medicalReviewerFor ?? doctor.specialty,
    seoFocus: doctor.seoFocusKeyword ?? defaults.focus,
    seoSecondary: doctor.seoSecondaryKeywords ?? defaults.secondary,
    metaTitle: doctor.seoMetaTitle ?? defaults.title,
    metaDesc: doctor.seoMetaDescription ?? defaults.desc,
    seoUrl: doctorCanonicalUrl(doctor),
    schema,
    avatarUrl: doctor.user?.avatarUrl ?? "",
  };
}

export function adminFormToApiPayload(values: AdminDoctorProfileFormValues) {
  const { firstName, lastName } = splitFullName(values.fullName);
  const [cityPart, countryPart] = values.location?.includes(",")
    ? values.location.split(",").map((part) => part.trim())
    : [values.location?.trim() ?? "", ""];
  const doctorPayload = formToDoctorPayload({
    fullName: values.fullName,
    email: values.email ?? "",
    phone: values.phone ?? "",
    dob: "",
    country: countryPart,
    city: cityPart,
    specialty: values.specialty,
    credentials: values.credentials ?? "",
    experience: values.experience ?? "",
    license: values.license ?? "",
    regBody: values.regBody ?? "",
    institution: values.institution ?? "",
    responseTime: values.responseTime ?? "",
    languages: values.languages ?? "",
    title: values.title ?? "",
    bioShort: values.bioShort ?? "",
    bioFull: values.bioFull ?? "",
    expertise: values.expertise ?? "",
    education: values.education ?? "",
    boardCerts: values.boardCerts ?? "",
    awards: values.awards ?? "",
    lectures: values.lectures ?? "",
    facebook: values.facebook ?? "",
    twitter: values.twitter ?? "",
    youtube: values.youtube ?? "",
    instagram: values.instagram ?? "",
    linkedin: values.linkedin ?? "",
  } satisfies DoctorProfileFormState);

  let seoSchemaJson: unknown;
  if (values.schema?.trim()) {
    try {
      seoSchemaJson = JSON.parse(values.schema);
    } catch {
      seoSchemaJson = values.schema;
    }
  }

  const editorialBoard = /^yes/i.test(values.roleEditorialBoard ?? "");

  return {
    firstName,
    lastName,
    phone: values.phone,
    avatarUrl: values.avatarUrl || undefined,
    ...doctorPayload,
    city: cityPart || doctorPayload.city,
    country: countryPart || doctorPayload.country,
    conflictOfInterest: values.coiDeclaration?.trim() || undefined,
    coiUpdatedAt: values.coiUpdated ? new Date(values.coiUpdated).toISOString() : undefined,
    authorSince: values.roleAuthorSince?.trim() || undefined,
    platformRole: values.roleEditorialBoard?.trim() || undefined,
    editorialBoard,
    medicalReviewerFor: values.roleReviewerFor?.trim() || undefined,
    profileSlug: values.seoUrl?.split("/").filter(Boolean).pop(),
    seoFocusKeyword: values.seoFocus?.trim() || undefined,
    seoSecondaryKeywords: values.seoSecondary?.trim() || undefined,
    seoMetaTitle: values.metaTitle?.trim() || undefined,
    seoMetaDescription: values.metaDesc?.trim() || undefined,
    seoSchemaJson,
    certifications: textToCerts(values.boardCerts ?? ""),
    awards: textToAwards(values.awards ?? ""),
    speakingEngagements: textToLectures(values.lectures ?? ""),
  };
}

export function adminFormTogglePayload(
  doctor: DoctorProfile,
  key: "bookingEnabled" | "contactEnabled" | "onlineAvailEnabled" | "physicalAvailEnabled",
  value: boolean,
) {
  return {
    doctorId: doctor.id,
    bookingEnabled: key === "bookingEnabled" ? value : doctor.bookingEnabled !== false,
    contactEnabled: key === "contactEnabled" ? value : doctor.contactEnabled !== false,
    onlineAvailEnabled: key === "onlineAvailEnabled" ? value : doctor.onlineAvailEnabled !== false,
    physicalAvailEnabled: key === "physicalAvailEnabled" ? value : doctor.physicalAvailEnabled !== false,
  };
}

export { certsToText, awardsToText, lecturesToText };
