"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { DoctorIconComponent } from "@/components/doctor/icons/DoctorIcons";
import {
  AlertTriangle,
  BookOpenText,
  DoctorIcon,
  DoctorIconInline,
  Eye,
  FileText,
  FlaskConical,
  Image,
  Info,
  Save,
  Shield,
  Users,
  X,
} from "@/components/doctor/icons/DoctorIcons";
import {
  ResearchArticlePreview,
} from "@/components/publications/PublicationPreview";
import type { ResearchArticlePreviewData } from "@/components/publications/publication-preview-utils";
import {
  RESEARCH_PUBLICATION_TYPES,
  PUBLICATION_TYPE_LABELS,
  type PublicationAttachment,
  type PublicationPayload,
  type PublicationReference,
  type PublicationType,
} from "@/services/publications-api-hooks";

export const MEDICAL_SPECIALTIES = [
  "Cardiovascular",
  "Neurology",
  "Endocrine & Metabolic",
  "Oncology",
  "Pediatrics",
  "Mental Health",
  "Preventive Health",
  "Infectious Disease",
  "Dental & Oral Health",
  "Other",
] as const;

export interface AuthorRow {
  name: string;
  affiliation: string;
}

export interface ReferenceRow {
  citation: string;
  doi: string;
}

export interface SubmitResearchFormState {
  publicationType: PublicationType;
  medicalSpecialty: string;
  title: string;
  publicationDate: string;
  articleId: string;
  doi: string;
  license: string;
  readTimeMinutes: string;
  authors: AuthorRow[];
  abstractBackground: string;
  abstractMethods: string;
  abstractResults: string;
  abstractConclusions: string;
  keywordsRaw: string;
  introduction: string;
  objectives: string;
  methodsContent: string;
  methodsTable: string;
  results: string;
  figureData: string;
  figureCaption: string;
  resultSummary: string;
  discussion: string;
  practiceImplications: string;
  limitations: string;
  conclusion: string;
  keyFindings: string;
  authorContributions: string;
  ethicsStatement: string;
  clinicalTrialRegistration: string;
  dataAvailabilityStatement: string;
  fundingSource: string;
  conflictsOfInterest: string;
  acknowledgments: string;
  abbreviations: string;
  references: ReferenceRow[];
  coverImageUrl: string | null;
  coverImageName: string | null;
  pdfFile: PublicationAttachment | null;
  supplementaryFiles: PublicationAttachment[];
}

export const EMPTY_AUTHOR: AuthorRow = { name: "", affiliation: "" };
export const EMPTY_REFERENCE: ReferenceRow = { citation: "", doi: "" };

export function parseKeywords(value: string): string[] {
  return value
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

export function formStateToPreview(state: SubmitResearchFormState): ResearchArticlePreviewData {
  return {
    title: state.title,
    publicationType: state.publicationType,
    medicalSpecialty: state.medicalSpecialty,
    publicationDate: state.publicationDate,
    articleId: state.articleId,
    doi: state.doi,
    license: state.license,
    readTimeMinutes: state.readTimeMinutes ? Number(state.readTimeMinutes) : null,
    coverImageUrl: state.coverImageUrl,
    abstractBackground: state.abstractBackground,
    abstractMethods: state.abstractMethods,
    abstractResults: state.abstractResults,
    abstractConclusions: state.abstractConclusions,
    keywords: parseKeywords(state.keywordsRaw),
    introduction: state.introduction,
    objectives: state.objectives,
    methodsContent: state.methodsContent,
    methodsTable: state.methodsTable,
    results: state.results,
    figureData: state.figureData,
    figureCaption: state.figureCaption,
    resultSummary: state.resultSummary,
    discussion: state.discussion,
    practiceImplications: state.practiceImplications,
    limitations: state.limitations,
    conclusion: state.conclusion,
    keyFindings: state.keyFindings,
    authorContributions: state.authorContributions,
    ethicsStatement: state.ethicsStatement,
    clinicalTrialRegistration: state.clinicalTrialRegistration,
    dataAvailabilityStatement: state.dataAvailabilityStatement,
    fundingSource: state.fundingSource,
    conflictsOfInterest: state.conflictsOfInterest,
    acknowledgments: state.acknowledgments,
    abbreviations: state.abbreviations,
    authors: state.authors
      .filter((author) => author.name.trim())
      .map((author) => ({ name: author.name, affiliation: author.affiliation })),
    references: state.references
      .filter((ref) => ref.citation.trim())
      .map((ref) => ({ citation: ref.citation, doi: ref.doi || null })),
    attachments: [
      ...(state.pdfFile ? [{ fileName: state.pdfFile.fileName, fileUrl: state.pdfFile.fileUrl, type: "PDF" }] : []),
      ...state.supplementaryFiles.map((file) => ({
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        type: file.type,
      })),
    ],
    editorial: { openAccess: true, physicianReviewed: false },
  };
}

export function formStateToPayload(
  state: SubmitResearchFormState,
  submitForReview: boolean,
  slug?: string,
): PublicationPayload {
  const references: PublicationReference[] = state.references
    .filter((ref) => ref.citation.trim())
    .map((ref, index) => ({
      citation: ref.citation.trim(),
      doi: ref.doi.trim() || undefined,
      sortOrder: index,
    }));

  const attachments: PublicationAttachment[] = [];
  if (state.pdfFile) attachments.push(state.pdfFile);
  if (state.coverImageUrl && state.coverImageName) {
    attachments.push({
      type: "COVER_IMAGE",
      fileName: state.coverImageName,
      fileUrl: state.coverImageUrl,
    });
  }
  attachments.push(...state.supplementaryFiles);

  const abstractParts = [
    state.abstractBackground,
    state.abstractMethods,
    state.abstractResults,
    state.abstractConclusions,
  ]
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    title: state.title.trim(),
    slug,
    publicationType: state.publicationType,
    medicalSpecialty: state.medicalSpecialty || undefined,
    publicationDate: state.publicationDate || undefined,
    articleId: state.articleId.trim() || undefined,
    doi: state.doi.trim() || undefined,
    license: state.license.trim() || undefined,
    readTimeMinutes: state.readTimeMinutes ? Number(state.readTimeMinutes) : undefined,
    abstract: abstractParts.length ? abstractParts.join("\n\n") : undefined,
    abstractBackground: state.abstractBackground.trim() || undefined,
    abstractMethods: state.abstractMethods.trim() || undefined,
    abstractResults: state.abstractResults.trim() || undefined,
    abstractConclusions: state.abstractConclusions.trim() || undefined,
    keywords: parseKeywords(state.keywordsRaw),
    authors: state.authors
      .filter((author) => author.name.trim())
      .map((author, index) => ({
        name: author.name.trim(),
        affiliation: author.affiliation.trim() || undefined,
        isPrimary: index === 0,
        sortOrder: index,
      })),
    introduction: state.introduction.trim() || undefined,
    objectives: state.objectives.trim() || undefined,
    methodsContent: state.methodsContent.trim() || undefined,
    methodsTable: state.methodsTable.trim() || undefined,
    results: state.results.trim() || undefined,
    figureData: state.figureData.trim() || undefined,
    figureCaption: state.figureCaption.trim() || undefined,
    resultSummary: state.resultSummary.trim() || undefined,
    discussion: state.discussion.trim() || undefined,
    practiceImplications: state.practiceImplications.trim() || undefined,
    limitations: state.limitations.trim() || undefined,
    conclusion: state.conclusion.trim() || undefined,
    keyFindings: state.keyFindings.trim() || undefined,
    authorContributions: state.authorContributions.trim() || undefined,
    ethicsStatement: state.ethicsStatement.trim() || undefined,
    clinicalTrialRegistration: state.clinicalTrialRegistration.trim() || undefined,
    dataAvailabilityStatement: state.dataAvailabilityStatement.trim() || undefined,
    fundingSource: state.fundingSource.trim() || undefined,
    conflictsOfInterest: state.conflictsOfInterest.trim() || undefined,
    acknowledgments: state.acknowledgments.trim() || undefined,
    abbreviations: state.abbreviations.trim() || undefined,
    references,
    referenceCount: references.length || undefined,
    attachments,
    submitForReview,
  };
}

interface SubmitResearchFormProps {
  state: SubmitResearchFormState;
  onChange: (patch: Partial<SubmitResearchFormState>) => void;
  onAuthorsChange: (authors: AuthorRow[]) => void;
  onReferencesChange: (references: ReferenceRow[]) => void;
  uploading: string | null;
  onUploadPdf: () => void;
  onUploadCover: () => void;
  onUploadSupplementary: () => void;
  onRemovePdf: () => void;
  onRemoveCover: () => void;
  onRemoveSupplementary: (index: number) => void;
  isSaving: boolean;
  isDraft: boolean;
  onSaveDraft: () => void;
  onSubmit: () => void;
}

function SectionLabel({ icon, children }: { icon: DoctorIconComponent; children: React.ReactNode }) {
  return (
    <div className="pub-sec-lbl">
      <DoctorIconInline icon={icon} size="button">
        {children}
      </DoctorIconInline>
    </div>
  );
}

export function SubmitResearchForm({
  state,
  onChange,
  onAuthorsChange,
  onReferencesChange,
  uploading,
  onUploadPdf,
  onUploadCover,
  onUploadSupplementary,
  onRemovePdf,
  onRemoveCover,
  onRemoveSupplementary,
  isSaving,
  isDraft,
  onSaveDraft,
  onSubmit,
}: SubmitResearchFormProps) {
  const previewData = useMemo(() => formStateToPreview(state), [state]);

  return (
    <form
      className="art-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div
        style={{
          background: "var(--blue-light)",
          borderLeft: "4px solid var(--blue)",
          borderRadius: 6,
          padding: "12px 16px",
          fontSize: "0.8rem",
          color: "var(--blue-dark)",
          lineHeight: 1.6,
          marginBottom: 4,
        }}
      >
        <DoctorIconInline icon={Info} size="sm">
          <strong>Your research, your credit.</strong>
        </DoctorIconInline>{" "}
        This is your own research — DrInsight reviews and
        publishes it as a full peer-reviewed article. Everything below is credited to you.
      </div>

      <SectionLabel icon={FileText}>Publication Details</SectionLabel>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="pType">Publication Type *</label>
          <select
            id="pType"
            value={state.publicationType}
            onChange={(e) => onChange({ publicationType: e.target.value as PublicationType })}
          >
            {RESEARCH_PUBLICATION_TYPES.map((type) => (
              <option key={type} value={type}>
                {PUBLICATION_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="pArea">Focus Area *</label>
          <select
            id="pArea"
            value={state.medicalSpecialty}
            onChange={(e) => onChange({ medicalSpecialty: e.target.value })}
          >
            <option value="">Select specialty...</option>
            {MEDICAL_SPECIALTIES.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="pTitle">Title *</label>
        <input
          id="pTitle"
          type="text"
          value={state.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Full research title"
        />
      </div>

      <div className="form-group">
        <label htmlFor="pPublished">Published Date *</label>
        <input
          id="pPublished"
          type="date"
          value={state.publicationDate}
          onChange={(e) => onChange({ publicationDate: e.target.value })}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="pArticleId">Article ID</label>
          <input
            id="pArticleId"
            type="text"
            value={state.articleId}
            onChange={(e) => onChange({ articleId: e.target.value })}
            placeholder="DI-ER-2026-000"
          />
        </div>
        <div className="form-group">
          <label htmlFor="pDoi">DOI</label>
          <input
            id="pDoi"
            type="text"
            value={state.doi}
            onChange={(e) => onChange({ doi: e.target.value })}
            placeholder="10.00000/drinsight.2026.000"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="pLicense">License</label>
          <input
            id="pLicense"
            type="text"
            value={state.license}
            onChange={(e) => onChange({ license: e.target.value })}
            placeholder="CC BY 4.0"
          />
        </div>
        <div className="form-group">
          <label htmlFor="pRead">Read Time (minutes)</label>
          <input
            id="pRead"
            type="number"
            min={1}
            value={state.readTimeMinutes}
            onChange={(e) => onChange({ readTimeMinutes: e.target.value })}
          />
        </div>
      </div>

      <SectionLabel icon={Users}>Authors &amp; Affiliations</SectionLabel>
      <div className="form-group">
        <label>
          Authors{" "}
          <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>
            (name + affiliation — numbered automatically)
          </span>
        </label>
        {state.authors.map((author, index) => (
          <div key={index} className="pub-arow">
            <input
              type="text"
              value={author.name}
              onChange={(e) =>
                onAuthorsChange(
                  state.authors.map((row, rowIndex) =>
                    rowIndex === index ? { ...row, name: e.target.value } : row,
                  ),
                )
              }
              placeholder="Author name (e.g. Dr. A. Rehman)"
            />
            <input
              type="text"
              value={author.affiliation}
              onChange={(e) =>
                onAuthorsChange(
                  state.authors.map((row, rowIndex) =>
                    rowIndex === index ? { ...row, affiliation: e.target.value } : row,
                  ),
                )
              }
              placeholder="Affiliation / department"
            />
            <button
              type="button"
              className="pub-mem-del"
              onClick={() =>
                onAuthorsChange(
                  state.authors.length > 1
                    ? state.authors.filter((_, rowIndex) => rowIndex !== index)
                    : state.authors,
                )
              }
              title="Remove"
            >
              <DoctorIcon icon={X} size="sm" />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="art-submit-btn draft"
          style={{ width: "auto", padding: "7px 16px", fontSize: "0.78rem", marginTop: 8 }}
          onClick={() => onAuthorsChange([...state.authors, { ...EMPTY_AUTHOR }])}
        >
          ＋ Add Author
        </button>
      </div>

      <SectionLabel icon={FileText}>Structured Abstract</SectionLabel>
      {(
        [
          ["abstractBackground", "Background *"],
          ["abstractMethods", "Methods *"],
          ["abstractResults", "Results *"],
          ["abstractConclusions", "Conclusions *"],
        ] as const
      ).map(([field, label]) => (
        <div key={field} className="form-group">
          <label htmlFor={field}>{label}</label>
          <textarea
            id={field}
            rows={2}
            value={state[field]}
            onChange={(e) => onChange({ [field]: e.target.value })}
          />
        </div>
      ))}
      <div className="form-group">
        <label htmlFor="pKeywords">
          Keywords <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(comma-separated)</span>
        </label>
        <input
          id="pKeywords"
          type="text"
          value={state.keywordsRaw}
          onChange={(e) => onChange({ keywordsRaw: e.target.value })}
        />
      </div>

      <SectionLabel icon={BookOpenText}>Full Text</SectionLabel>
      {(
        [
          ["introduction", "Introduction *", 3],
          ["objectives", "Objectives (one per line)", 3],
          ["methodsContent", "Methods *", 3],
          ["methodsTable", 'Methods Table (one row per line, columns separated by " | "; first row = headers)', 5],
          ["results", "Results *", 3],
          ["figureData", "Figure Data (Label | value per line)", 4],
          ["figureCaption", "Figure Caption (optional)", 1, "input"],
          ["resultSummary", "Result Summary (green highlight box under the figure)", 2],
          ["discussion", "Discussion *", 3],
          ["practiceImplications", "Practice Implications (one per line)", 3],
          ["limitations", "Limitations (one per line)", 3],
          ["conclusion", "Conclusion *", 2],
          ["keyFindings", "Key Findings (Icon | Title | short description per line)", 4],
        ] as const
      ).map((item) => {
        const [field, label, rows] = item;
        const kind = item[3];
        if (kind === "input") {
          return (
            <div key={field} className="form-group">
              <label htmlFor={field}>{label}</label>
              <input
                id={field}
                type="text"
                value={state[field as keyof SubmitResearchFormState] as string}
                onChange={(e) => onChange({ [field]: e.target.value })}
              />
            </div>
          );
        }
        return (
          <div key={field} className="form-group">
            <label htmlFor={field}>
              {label.split(" (")[0]}{" "}
              {label.includes("(") ? (
                <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>
                  ({label.split("(")[1]}
                </span>
              ) : null}
            </label>
            <textarea
              id={field}
              rows={rows}
              value={state[field as keyof SubmitResearchFormState] as string}
              onChange={(e) => onChange({ [field]: e.target.value })}
            />
          </div>
        );
      })}

      <SectionLabel icon={Shield}>Disclosures &amp; Review</SectionLabel>
      <div className="form-group">
        <label htmlFor="pContributions">
          Author Contributions <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(one per line)</span>
        </label>
        <textarea
          id="pContributions"
          rows={3}
          value={state.authorContributions}
          onChange={(e) => onChange({ authorContributions: e.target.value })}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="pEthics">Ethics Approval / IRB Statement</label>
          <textarea
            id="pEthics"
            rows={2}
            value={state.ethicsStatement}
            onChange={(e) => onChange({ ethicsStatement: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="pTrialReg">Clinical Trial Registration</label>
          <input
            id="pTrialReg"
            type="text"
            value={state.clinicalTrialRegistration}
            onChange={(e) => onChange({ clinicalTrialRegistration: e.target.value })}
            placeholder="e.g. NCT01234567 or Not applicable"
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="pDataAvail">Data Availability Statement</label>
        <textarea
          id="pDataAvail"
          rows={2}
          value={state.dataAvailabilityStatement}
          onChange={(e) => onChange({ dataAvailabilityStatement: e.target.value })}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="pFunding">Funding</label>
          <textarea
            id="pFunding"
            rows={2}
            value={state.fundingSource}
            onChange={(e) => onChange({ fundingSource: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="pCoi">Conflicts of Interest</label>
          <textarea
            id="pCoi"
            rows={2}
            value={state.conflictsOfInterest}
            onChange={(e) => onChange({ conflictsOfInterest: e.target.value })}
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="pAck">Acknowledgments</label>
        <textarea
          id="pAck"
          rows={2}
          value={state.acknowledgments}
          onChange={(e) => onChange({ acknowledgments: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label htmlFor="pAbbrev">
          Abbreviations <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(ABBR | Full meaning per line)</span>
        </label>
        <textarea
          id="pAbbrev"
          rows={3}
          value={state.abbreviations}
          onChange={(e) => onChange({ abbreviations: e.target.value })}
          placeholder={"BP | Blood Pressure\nCVD | Cardiovascular Disease"}
        />
      </div>

      <SectionLabel icon={BookOpenText}>References</SectionLabel>
      <div className="form-group">
        <label>
          References <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(full citation + optional DOI)</span>
        </label>
        {state.references.map((ref, index) => (
          <div key={index} className="pub-arow">
            <textarea
              value={ref.citation}
              onChange={(e) =>
                onReferencesChange(
                  state.references.map((row, rowIndex) =>
                    rowIndex === index ? { ...row, citation: e.target.value } : row,
                  ),
                )
              }
              placeholder="Full citation (authors. title. journal. year;vol:pages.)"
            />
            <input
              type="text"
              value={ref.doi}
              onChange={(e) =>
                onReferencesChange(
                  state.references.map((row, rowIndex) =>
                    rowIndex === index ? { ...row, doi: e.target.value } : row,
                  ),
                )
              }
              placeholder="DOI (optional)"
              style={{ maxWidth: 190 }}
            />
            <button
              type="button"
              className="pub-mem-del"
              onClick={() =>
                onReferencesChange(
                  state.references.length > 1
                    ? state.references.filter((_, rowIndex) => rowIndex !== index)
                    : state.references,
                )
              }
              title="Remove"
            >
              <DoctorIcon icon={X} size="sm" />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="art-submit-btn draft"
          style={{ width: "auto", padding: "7px 16px", fontSize: "0.78rem", marginTop: 8 }}
          onClick={() => onReferencesChange([...state.references, { ...EMPTY_REFERENCE }])}
        >
          ＋ Add Reference
        </button>
      </div>

      <SectionLabel icon={FileText}>Attachments</SectionLabel>
      <div className="form-group">
        <label>Cover Image</label>
        <div className="file-upload-box" onClick={onUploadCover}>
          {uploading === "cover" ? (
            <span>Uploading...</span>
          ) : state.coverImageUrl ? (
            <>
              <img
                src={state.coverImageUrl}
                alt="Cover preview"
                style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 8 }}
              />
              <span className="file-chip" style={{ marginTop: 8 }}>
                <DoctorIconInline icon={Image} size="sm">
                  {state.coverImageName}
                </DoctorIconInline>
              </span>
            </>
          ) : (
            <>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>
                <DoctorIcon icon={Image} size="stat" />
              </div>
              <div style={{ fontWeight: 700, color: "var(--gray-700)", fontSize: "0.88rem" }}>Upload Cover Image</div>
            </>
          )}
        </div>
        {state.coverImageUrl ? (
          <button
            type="button"
            className="art-submit-btn draft"
            style={{ width: "auto", padding: "6px 14px", fontSize: "0.74rem", marginTop: 8 }}
            onClick={onRemoveCover}
          >
            Remove Cover
          </button>
        ) : null}
      </div>
      <div className="form-group">
        <label>Publication PDF (max 20MB)</label>
        <div className="file-upload-box" onClick={onUploadPdf}>
          {uploading === "pdf" ? (
            <span>Uploading...</span>
          ) : state.pdfFile ? (
            <span className="file-chip">
              <DoctorIconInline icon={FileText} size="sm">
                {state.pdfFile.fileName}
              </DoctorIconInline>
            </span>
          ) : (
            <>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>
                <DoctorIcon icon={FileText} size="stat" />
              </div>
              <div style={{ fontWeight: 700, color: "var(--gray-700)", fontSize: "0.88rem" }}>Upload PDF</div>
            </>
          )}
        </div>
        {state.pdfFile ? (
          <button
            type="button"
            className="art-submit-btn draft"
            style={{ width: "auto", padding: "6px 14px", fontSize: "0.74rem", marginTop: 8 }}
            onClick={onRemovePdf}
          >
            Remove PDF
          </button>
        ) : null}
      </div>
      <div className="form-group">
        <label>Supplementary Files</label>
        <div className="file-upload-box" onClick={onUploadSupplementary}>
          {uploading === "supplementary" ? (
            <span>Uploading...</span>
          ) : (
            <>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>
                <DoctorIcon icon={FileText} size="stat" />
              </div>
              <div style={{ fontWeight: 700, color: "var(--gray-700)", fontSize: "0.88rem" }}>Add Supplementary File</div>
            </>
          )}
        </div>
        {state.supplementaryFiles.length > 0 ? (
          <div style={{ marginTop: 8 }}>
            {state.supplementaryFiles.map((file, index) => (
              <span key={`${file.fileName}-${index}`} className="file-chip">
                <DoctorIconInline icon={FileText} size="sm">
                  {file.fileName}
                </DoctorIconInline>
                <button
                  type="button"
                  style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--red)", marginLeft: 4 }}
                  onClick={() => onRemoveSupplementary(index)}
                >
                  <DoctorIcon icon={X} size="sm" />
                </button>
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div style={{ marginTop: 22 }}>
        <div className="pubprev-lbl">
          <DoctorIconInline icon={Eye} size="sm">
            Live Preview — full research article as it will publish
          </DoctorIconInline>
        </div>
        <ResearchArticlePreview data={previewData} showEditorialStats={false} />
      </div>

      <div
        style={{
          background: "#fffbeb",
          borderLeft: "4px solid var(--amber)",
          borderRadius: 6,
          padding: "12px 16px",
          fontSize: "0.8rem",
          color: "#92400e",
          lineHeight: 1.6,
          marginTop: 18,
        }}
      >
        <DoctorIconInline icon={AlertTriangle} size="sm">
          <strong>Editorial Notice:</strong>
        </DoctorIconInline>{" "}
        All research undergoes multi-stage physician review before going
        live. By submitting, you confirm this is original, evidence-based work and that you hold valid medical
        licensure. See our{" "}
        <Link href="/editorial-policy" style={{ color: "var(--blue)", fontWeight: 600 }}>
          Editorial Policy →
        </Link>
      </div>

      <div className="art-btn-row">
        <button type="button" className="art-submit-btn draft" disabled={isSaving} onClick={onSaveDraft}>
          {isSaving && isDraft ? "Saving..." : (
            <DoctorIconInline icon={Save} size="sm">
              Save as Draft
            </DoctorIconInline>
          )}
        </button>
        <button type="submit" className="art-submit-btn" disabled={isSaving}>
          {isSaving && !isDraft ? "Submitting..." : (
            <DoctorIconInline icon={FlaskConical} size="sm">
              Submit for Review
            </DoctorIconInline>
          )}
        </button>
      </div>
    </form>
  );
}
