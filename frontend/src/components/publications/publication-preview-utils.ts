import {
  PUBLICATION_STATUS_LABELS,
  PUBLICATION_TYPE_LABELS,
  type Publication,
  type PublicationType,
} from "@/services/publications-api-hooks";

export interface ResearchArticleAuthor {
  name: string;
  affiliation?: string | null;
  role?: string | null;
  orcid?: string | null;
  isPrimary?: boolean;
}

export interface ResearchArticleReference {
  citation: string;
  doi?: string | null;
}

export interface ResearchArticleEditorial {
  reviewingPhysician?: string | null;
  lastReviewedDate?: string | null;
  peerReviewOutcome?: string | null;
  nextScheduledReview?: string | null;
  evidenceGrade?: string | null;
  openAccess?: boolean;
  physicianReviewed?: boolean;
  downloadCount?: number | null;
  citationCount?: number | null;
}

export interface ResearchArticlePreviewData {
  title?: string;
  subtitle?: string | null;
  publicationType?: PublicationType;
  medicalSpecialty?: string | null;
  status?: string | null;
  publicationDate?: string | null;
  articleId?: string | null;
  doi?: string | null;
  license?: string | null;
  readTimeMinutes?: number | null;
  coverImageUrl?: string | null;
  abstractBackground?: string | null;
  abstractMethods?: string | null;
  abstractResults?: string | null;
  abstractConclusions?: string | null;
  keywords?: string[];
  introduction?: string | null;
  objectives?: string | null;
  methodsContent?: string | null;
  methodsTable?: string | null;
  results?: string | null;
  figureData?: string | null;
  figureCaption?: string | null;
  resultSummary?: string | null;
  discussion?: string | null;
  practiceImplications?: string | null;
  limitations?: string | null;
  conclusion?: string | null;
  keyFindings?: string | null;
  authorContributions?: string | null;
  ethicsStatement?: string | null;
  clinicalTrialRegistration?: string | null;
  dataAvailabilityStatement?: string | null;
  fundingSource?: string | null;
  conflictsOfInterest?: string | null;
  acknowledgments?: string | null;
  abbreviations?: string | null;
  authors?: ResearchArticleAuthor[];
  references?: ResearchArticleReference[];
  attachments?: { fileName: string; fileUrl: string; type: string }[];
  editorial?: ResearchArticleEditorial;
}

export function parseLines(value?: string | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseTable(value?: string | null): { headers: string[]; rows: string[][] } | null {
  const rows = parseLines(value).map((row) => row.split("|").map((cell) => cell.trim()));
  if (!rows.length) return null;
  return { headers: rows[0], rows: rows.slice(1) };
}

export function parseFigure(value?: string | null): { label: string; val: string }[] {
  return parseLines(value)
    .map((line) => {
      const parts = line.split("|");
      return { label: (parts[0] ?? "").trim(), val: (parts[1] ?? "").trim() };
    })
    .filter((bar) => bar.label);
}

export function parseKeyFindings(value?: string | null) {
  return parseLines(value).map((line) => {
    const parts = line.split("|");
    const icon = (parts[0] ?? "").trim();
    const title = (parts[1] ?? "").trim();
    const description = (parts[2] ?? "").trim();
    if (!title && !description) return { icon, title: icon, description: "" };
    return { icon, title, description };
  });
}

export function parseAbbreviations(value?: string | null) {
  return parseLines(value)
    .map((line) => {
      const parts = line.split("|");
      return { abbr: (parts[0] ?? "").trim(), full: (parts[1] ?? "").trim() };
    })
    .filter((item) => item.abbr);
}

export function fmtPubDate(value?: string | null): string {
  if (!value) return "";
  const parts = value.slice(0, 10).split("-");
  if (parts.length < 2) return value;
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const monthIndex = parseInt(parts[1], 10) - 1;
  const day = parts[2] ? String(parseInt(parts[2], 10)) : "";
  return `${months[monthIndex] ?? ""}${day ? ` ${day}` : ""} ${parts[0]}`.trim();
}

export function publicationToPreviewData(pub: Publication): ResearchArticlePreviewData {
  const authors =
    pub.authors?.length
      ? pub.authors.map((author) => ({
          name: author.name,
          affiliation: author.affiliation,
          role: author.role,
          orcid: author.orcid,
          isPrimary: author.isPrimary,
        }))
      : pub.doctor?.user
        ? [{
            name: `Dr. ${pub.doctor.user.firstName} ${pub.doctor.user.lastName}`,
            affiliation: pub.institution ?? pub.doctor.hospital,
            isPrimary: true,
          }]
        : [];

  return {
    title: pub.title,
    subtitle: pub.subtitle,
    publicationType: pub.publicationType,
    medicalSpecialty: pub.medicalSpecialty ?? pub.doctor?.specialty,
    status: PUBLICATION_STATUS_LABELS[pub.status],
    publicationDate: pub.publicationDate?.slice(0, 10) ?? pub.publishedAt?.slice(0, 10),
    articleId: pub.articleId,
    doi: pub.doi,
    license: pub.license,
    readTimeMinutes: pub.readTimeMinutes,
    coverImageUrl: pub.attachments?.find((a) => a.type === "COVER_IMAGE")?.fileUrl ?? null,
    abstractBackground: pub.abstractBackground ?? (pub.abstract && !pub.abstractMethods ? pub.abstract : null),
    abstractMethods: pub.abstractMethods,
    abstractResults: pub.abstractResults,
    abstractConclusions: pub.abstractConclusions,
    keywords: pub.keywords?.map((kw) => kw.keyword) ?? [],
    introduction: pub.introduction ?? pub.researchOverview,
    objectives: pub.objectives,
    methodsContent: pub.methodsContent ?? pub.researchMethodology ?? pub.methodologySteps,
    methodsTable: pub.methodsTable,
    results: pub.results,
    figureData: pub.figureData,
    figureCaption: pub.figureCaption,
    resultSummary: pub.resultSummary,
    discussion: pub.discussion,
    practiceImplications: pub.practiceImplications,
    limitations: pub.limitations,
    conclusion: pub.conclusion,
    keyFindings: pub.keyFindings,
    authorContributions: pub.authorContributions,
    ethicsStatement: pub.ethicsStatement ?? pub.ethicalApprovalNumber,
    clinicalTrialRegistration: pub.clinicalTrialRegistration,
    dataAvailabilityStatement: pub.dataAvailabilityStatement,
    fundingSource: pub.fundingSource,
    conflictsOfInterest: pub.conflictsOfInterest,
    acknowledgments: pub.acknowledgments,
    abbreviations: pub.abbreviations,
    authors,
    references:
      pub.references?.map((ref) => ({ citation: ref.citation, doi: ref.doi })) ?? [],
    attachments:
      pub.attachments
        ?.filter((a) => a.type !== "COVER_IMAGE")
        .map((a) => ({ fileName: a.fileName, fileUrl: a.fileUrl, type: a.type })) ?? [],
    editorial: {
      reviewingPhysician: pub.reviewingPhysician,
      lastReviewedDate: pub.lastReviewedDate?.slice(0, 10),
      peerReviewOutcome: pub.peerReviewOutcome,
      nextScheduledReview: pub.nextScheduledReview?.slice(0, 10),
      evidenceGrade: pub.evidenceGrade,
      openAccess: pub.openAccess,
      physicianReviewed: pub.physicianReviewed,
      downloadCount: pub.downloadCount,
      citationCount: pub.citationCount,
    },
  };
}

export function publicationTypeBadgeLabel(type?: PublicationType): string {
  if (!type) return "Evidence Review";
  return PUBLICATION_TYPE_LABELS[type] ?? type;
}
