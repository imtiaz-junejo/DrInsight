import { seoUrlCrumb } from "@/components/admin/site-management/seo-settings-utils";
import type { DoctorProfile } from "@/services/api-hooks";

export interface AdminDoctorSeoDefaults {
  focus: string;
  secondary: string;
  title: string;
  desc: string;
  url: string;
}

export function doctorSlug(name: string) {
  return (
    String(name || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "doctor"
  );
}

export function doctorDisplayName(doctor: Pick<DoctorProfile, "user">) {
  const user = doctor.user;
  if (!user) return "Doctor";
  return `Dr. ${user.firstName} ${user.lastName}`.trim();
}

export function doctorSeoDefaults(
  doctor: Pick<
    DoctorProfile,
    "user" | "specialty" | "bio" | "professionalTitle" | "expertise" | "seoMetaTitle" | "seoMetaDescription"
  >,
): AdminDoctorSeoDefaults {
  const expertise = (doctor.expertise ?? []).filter(Boolean);
  const focus = expertise[0]?.toLowerCase() ?? `${(doctor.specialty ?? "").toLowerCase()} specialist`;
  const secondary = expertise.slice(1).join(", ");
  const name = doctorDisplayName(doctor);
  const mtRaw = `${name} — ${doctor.specialty ? `Consultant ${doctor.specialty}` : "Medical Author"} | DrInsight`;
  const title = mtRaw.length > 60 ? `${mtRaw.slice(0, 57).trim()}…` : mtRaw;
  let desc = (doctor.bio ?? doctor.professionalTitle ?? "").replace(/\s+/g, " ").trim();
  if (desc.length > 160) desc = `${desc.slice(0, 157).trim()}…`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://www.drinsight.org";
  const url = `${siteUrl}/authors/${doctorSlug(name)}`;
  return { focus, secondary, title, desc, url };
}

export function doctorCanonicalUrl(doctor: Pick<DoctorProfile, "profileSlug" | "user">, override?: string) {
  const trimmed = (override ?? "").trim();
  if (trimmed) return trimmed;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://www.drinsight.org";
  const slug = doctor.profileSlug ?? doctorSlug(doctorDisplayName(doctor));
  return `${siteUrl}/authors/${slug}`;
}

export function buildPhysicianSchema(input: {
  name: string;
  specialty?: string;
  bioShort?: string;
  metaTitle?: string;
  metaDesc?: string;
  expertise?: string[];
  languages?: string[];
  institution?: string;
  education?: string;
  seoFocus?: string;
  seoSecondary?: string;
  url: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  instagram?: string;
  linkedin?: string;
  rating?: number;
  reviewCount?: number;
}) {
  const keywords: string[] = [];
  const push = (value?: string) => {
    const trimmed = (value ?? "").trim();
    if (trimmed && !keywords.includes(trimmed)) keywords.push(trimmed);
  };
  push(input.seoFocus);
  (input.seoSecondary ?? "")
    .split(",")
    .map((part) => part.trim())
    .forEach(push);
  (input.expertise ?? []).forEach(push);

  const alumni = (input.education ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/—|·/);
      const name = parts.length > 1 ? parts[1].trim() : line;
      return { "@type": "EducationalOrganization", name };
    });

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": `${input.url}#physician`,
    name: input.name,
    url: input.url,
    description: input.metaDesc || input.bioShort || "",
    medicalSpecialty: input.specialty ?? "",
    knowsAbout: keywords,
    knowsLanguage: (input.languages ?? []).filter(Boolean),
    worksFor: { "@type": "MedicalOrganization", name: input.institution ?? "" },
    memberOf: { "@type": "MedicalOrganization", name: "The Dr Insight", url: "https://www.drinsight.org/" },
  };

  if (alumni.length) schema.alumniOf = alumni;
  const sameAs = [input.facebook, input.twitter, input.youtube, input.instagram, input.linkedin]
    .map((value) => (value ?? "").trim())
    .filter(Boolean);
  if (sameAs.length) schema.sameAs = sameAs;
  if (input.rating && input.rating > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: String(input.rating),
      reviewCount: String(input.reviewCount ?? 0),
      bestRating: "5",
    };
  }
  return JSON.stringify(schema, null, 2);
}

export function serpPreview(metaTitle: string, metaDesc: string, url: string) {
  return {
    title: metaTitle || "Doctor profile",
    crumb: seoUrlCrumb(url),
    description: metaDesc,
  };
}
