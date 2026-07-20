import { getBlogCategoryVisuals } from "@/lib/blog-category";
import { MEDICAL_SPECIALTIES, type MedicalSpecialty } from "@/lib/medical-specialties";

export const DEFAULT_ARTICLE_HERO_ICON = "🩺";
export const DEFAULT_HERO_ICON_OPTION_ID = "default";

export type HeroIconOption = {
  id: string;
  icon: string;
  label: string;
};

/** Fine-tuned icons for specialties where blog category matching is too generic. */
const SPECIALTY_ICON_OVERRIDES: Partial<Record<MedicalSpecialty, string>> = {
  "Allergy & Immunology": "🤧",
  "Clinical Psychology": "🧘",
  "Dental & Oral Health": "🦷",
  "Nutrition & Dietetics": "🍎",
  "Oral & Maxillofacial Surgery": "🦷",
  Podiatry: "🦶",
  Other: "🩺",
};

export function getSpecialtyHeroIcon(specialty: string): string {
  if (!specialty.trim()) return DEFAULT_ARTICLE_HERO_ICON;

  const override = SPECIALTY_ICON_OVERRIDES[specialty as MedicalSpecialty];
  if (override) return override;

  return getBlogCategoryVisuals(specialty).emoji;
}

export const HERO_ICON_DROPDOWN_OPTIONS: HeroIconOption[] = [
  { id: DEFAULT_HERO_ICON_OPTION_ID, icon: DEFAULT_ARTICLE_HERO_ICON, label: "Default (Medical)" },
  ...MEDICAL_SPECIALTIES.map((specialty) => ({
    id: specialty,
    icon: getSpecialtyHeroIcon(specialty),
    label: specialty,
  })),
];

export function resolveHeroIcon(optionId: string): string {
  const option = HERO_ICON_DROPDOWN_OPTIONS.find((entry) => entry.id === optionId);
  return option?.icon ?? DEFAULT_ARTICLE_HERO_ICON;
}

export function getDefaultHeroIconForSpecialty(specialty: string): string {
  if (!specialty.trim()) return DEFAULT_ARTICLE_HERO_ICON;
  return getSpecialtyHeroIcon(specialty);
}

export function getHeroIconOptionIdForSpecialty(specialty: string): string {
  if (!specialty.trim()) return DEFAULT_HERO_ICON_OPTION_ID;
  return MEDICAL_SPECIALTIES.includes(specialty as MedicalSpecialty) ? specialty : DEFAULT_HERO_ICON_OPTION_ID;
}
