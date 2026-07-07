export type PartnerCategory =
  | "pharma"
  | "research"
  | "diagnostics"
  | "hospital"
  | "tech"
  | "insurance"
  | "wellness";

const CATEGORY_BADGES: Record<PartnerCategory, { className: string; label: string }> = {
  pharma: { className: "badge-pharma", label: "Pharma" },
  research: { className: "badge-research", label: "Research" },
  diagnostics: { className: "badge-diagnostics", label: "Diagnostics" },
  hospital: { className: "badge-hospital", label: "Hospital" },
  tech: { className: "badge-tech", label: "Tech" },
  insurance: { className: "badge-insurance", label: "Insurance" },
  wellness: { className: "badge-wellness", label: "Wellness" },
};

const PARTNER_ICONS_BY_NAME: Record<string, string> = {
  PharmaCare: "💊",
  "BioResearch Labs": "🔬",
  DiagnoScan: "🩻",
  "GlobalHealth Network": "🏥",
  "MedAI Solutions": "🤖",
  HealthShield: "🛡️",
  WellnessFirst: "🌿",
  TelemedConnect: "📡",
  GenomicsCo: "🧬",
  CardioLink: "❤️",
  VaxGlobal: "💉",
  NeuroPath: "🧠",
};

const CATEGORY_DEFAULT_ICONS: Record<PartnerCategory, string> = {
  pharma: "💊",
  research: "🔬",
  diagnostics: "🩻",
  hospital: "🏥",
  tech: "🤖",
  insurance: "🛡️",
  wellness: "🌿",
};

function normalizePartnerCategory(description?: string | null): PartnerCategory | null {
  if (!description?.trim()) return null;

  const value = description.toLowerCase().trim();
  if (value in CATEGORY_BADGES) return value as PartnerCategory;

  if (/pharma|pharmaceutical|vaccin|vax/.test(value)) return "pharma";
  if (/genomic|research/.test(value)) return "research";
  if (/diagnostic|neuro|neurology/.test(value)) return "diagnostics";
  if (/hospital|cardio|cardiology/.test(value)) return "hospital";
  if (/insurance/.test(value)) return "insurance";
  if (/wellness/.test(value)) return "wellness";
  if (/tech|technology|telemed|health technology/.test(value)) return "tech";

  return null;
}

export function resolvePartnerDisplay(partner: {
  companyName: string;
  description?: string | null;
}) {
  const category = normalizePartnerCategory(partner.description);
  const icon =
    PARTNER_ICONS_BY_NAME[partner.companyName] ??
    (category ? CATEGORY_DEFAULT_ICONS[category] : "🤝");
  const badge = category
    ? CATEGORY_BADGES[category]
    : { className: "badge-hospital", label: "Partner" };

  return {
    icon,
    badgeClass: badge.className,
    badgeLabel: badge.label,
  };
}

export function partnerCategoryIcon(
  companyName: string,
  description?: string | null,
): string {
  return resolvePartnerDisplay({ companyName, description }).icon;
}
