"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  PublicationPreview,
  type PublicationPreviewData,
} from "@/components/publications/PublicationPreview";
import { DashCard, DashPageHeader } from "@/components/doctor/ui/DoctorPrimitives";
import { slugifyTitle } from "@/lib/blog-toc";
import { doctorDisplayName, todayFormatted } from "@/lib/doctor-utils";
import { uploadFile } from "@/lib/upload";
import { useDoctorProfile } from "@/services/doctor-api-hooks";
import {
  PUBLICATION_TYPE_LABELS,
  type PublicationAttachment,
  type PublicationPayload,
  type PublicationType,
  type PublicationVisibility,
  useCreatePublication,
  useDoctorPublication,
  useUpdatePublication,
} from "@/services/publications-api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

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

const PUBLICATION_TYPES = Object.keys(PUBLICATION_TYPE_LABELS) as PublicationType[];

const VISIBILITY_OPTIONS: { value: PublicationVisibility; label: string }[] = [
  { value: "PUBLIC", label: "Public — visible to everyone" },
  { value: "AFTER_APPROVAL", label: "After approval — hidden until approved" },
  { value: "PRIVATE", label: "Private — only you can see" },
];

interface AuthorRow {
  name: string;
  role: string;
  orcid: string;
  affiliation: string;
}

interface TeamMemberRow {
  name: string;
  role: string;
}

interface UploadedFileState {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

const EMPTY_AUTHOR: AuthorRow = { name: "", role: "", orcid: "", affiliation: "" };
const EMPTY_MEMBER: TeamMemberRow = { name: "", role: "" };

function parseKeywords(value: string): string[] {
  return value
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

function toDateInput(value?: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export function SubmitPublicationPageContent() {
  const showToast = useDoctorUiStore((s) => s.showToast);
  const searchParams = useSearchParams();
  const editId = searchParams.get("id") ?? undefined;

  const { data: profile } = useDoctorProfile();
  const { data: existingPublication, isLoading: loadingExisting } = useDoctorPublication(editId);
  const createPublication = useCreatePublication();
  const updatePublication = useUpdatePublication();

  const formRef = useRef<HTMLFormElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const supplementaryRef = useRef<HTMLInputElement>(null);

  const [submitted, setSubmitted] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const [publicationType, setPublicationType] = useState<PublicationType>("RESEARCH_PAPER");
  const [medicalSpecialty, setMedicalSpecialty] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [language, setLanguage] = useState("English");
  const [researchCategory, setResearchCategory] = useState("");

  const [primaryAuthor, setPrimaryAuthor] = useState<AuthorRow>({ ...EMPTY_AUTHOR });
  const [coAuthors, setCoAuthors] = useState<AuthorRow[]>([{ ...EMPTY_AUTHOR }]);
  const [institution, setInstitution] = useState("");
  const [department, setDepartment] = useState("");
  const [orcid, setOrcid] = useState("");
  const [correspondingAuthor, setCorrespondingAuthor] = useState("");

  const [journalName, setJournalName] = useState("");
  const [publisher, setPublisher] = useState("");
  const [volume, setVolume] = useState("");
  const [issue, setIssue] = useState("");
  const [pages, setPages] = useState("");
  const [doi, setDoi] = useState("");
  const [issn, setIssn] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const [acceptanceDate, setAcceptanceDate] = useState("");
  const [submissionDate, setSubmissionDate] = useState("");

  const [researchMethodology, setResearchMethodology] = useState("");
  const [studyDesign, setStudyDesign] = useState("");
  const [sampleSize, setSampleSize] = useState("");
  const [fundingSource, setFundingSource] = useState("");
  const [ethicalApprovalNumber, setEthicalApprovalNumber] = useState("");
  const [clinicalTrialRegistration, setClinicalTrialRegistration] = useState("");
  const [researchOverview, setResearchOverview] = useState("");
  const [methodologySteps, setMethodologySteps] = useState("");
  const [partners, setPartners] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMemberRow[]>([{ ...EMPTY_MEMBER }]);

  const [referenceCount, setReferenceCount] = useState("");
  const [readTimeMinutes, setReadTimeMinutes] = useState("");
  const [reviewingPhysician, setReviewingPhysician] = useState("");
  const [physicianReviewed, setPhysicianReviewed] = useState(true);
  const [evidenceBased, setEvidenceBased] = useState(true);
  const [openAccess, setOpenAccess] = useState(true);
  const [fullyReferenced, setFullyReferenced] = useState(true);
  const [coiDisclosed, setCoiDisclosed] = useState(true);

  const [doiUrl, setDoiUrl] = useState("");
  const [journalUrl, setJournalUrl] = useState("");
  const [pubmedUrl, setPubmedUrl] = useState("");
  const [googleScholarUrl, setGoogleScholarUrl] = useState("");

  const [visibility, setVisibility] = useState<PublicationVisibility>("AFTER_APPROVAL");
  const [seoTitle, setSeoTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywordsRaw, setKeywordsRaw] = useState("");

  const [pdfFile, setPdfFile] = useState<UploadedFileState | null>(null);
  const [coverImage, setCoverImage] = useState<UploadedFileState | null>(null);
  const [supplementaryFiles, setSupplementaryFiles] = useState<UploadedFileState[]>([]);

  useEffect(() => {
    if (!profile || editId) return;
    const displayName = doctorDisplayName(profile.user?.firstName, profile.user?.lastName);
    const credentials = profile.credentials ? `, ${profile.credentials}` : "";
    setPrimaryAuthor({
      name: `${displayName}${credentials}`,
      role: "Lead Author",
      orcid: "",
      affiliation: profile.hospital ?? "",
    });
    setInstitution(profile.hospital ?? "");
    setCorrespondingAuthor(displayName);
    setMedicalSpecialty(profile.specialty ?? "");
  }, [profile, editId]);

  useEffect(() => {
    if (!existingPublication) return;

    setPublicationType(existingPublication.publicationType);
    setMedicalSpecialty(existingPublication.medicalSpecialty ?? "");
    setTitle(existingPublication.title);
    setSubtitle(existingPublication.subtitle ?? "");
    setAbstract(existingPublication.abstract);
    setLanguage(existingPublication.language ?? "English");
    setResearchCategory(existingPublication.researchCategory ?? "");
    setSlug(existingPublication.slug);
    setSlugTouched(true);

    const authors = existingPublication.authors ?? [];
    const primary = authors.find((author) => author.isPrimary) ?? authors[0];
    if (primary) {
      setPrimaryAuthor({
        name: primary.name,
        role: primary.role ?? "",
        orcid: primary.orcid ?? "",
        affiliation: primary.affiliation ?? "",
      });
    }
    const others = authors.filter((author) => author !== primary);
    setCoAuthors(
      others.length
        ? others.map((author) => ({
            name: author.name,
            role: author.role ?? "",
            orcid: author.orcid ?? "",
            affiliation: author.affiliation ?? "",
          }))
        : [{ ...EMPTY_AUTHOR }],
    );

    setInstitution(existingPublication.institution ?? "");
    setDepartment(existingPublication.department ?? "");
    setOrcid(existingPublication.orcid ?? "");
    setCorrespondingAuthor(existingPublication.correspondingAuthor ?? "");

    setJournalName(existingPublication.journalName ?? "");
    setPublisher(existingPublication.publisher ?? "");
    setVolume(existingPublication.volume ?? "");
    setIssue(existingPublication.issue ?? "");
    setPages(existingPublication.pages ?? "");
    setDoi(existingPublication.doi ?? "");
    setIssn(existingPublication.issn ?? "");
    setPublicationDate(toDateInput(existingPublication.publicationDate));
    setAcceptanceDate(toDateInput(existingPublication.acceptanceDate));
    setSubmissionDate(toDateInput(existingPublication.submissionDate));

    setResearchMethodology(existingPublication.researchMethodology ?? "");
    setStudyDesign(existingPublication.studyDesign ?? "");
    setSampleSize(existingPublication.sampleSize ?? "");
    setFundingSource(existingPublication.fundingSource ?? "");
    setEthicalApprovalNumber(existingPublication.ethicalApprovalNumber ?? "");
    setClinicalTrialRegistration(existingPublication.clinicalTrialRegistration ?? "");
    setResearchOverview(existingPublication.researchOverview ?? "");
    setMethodologySteps(existingPublication.methodologySteps ?? "");
    setPartners(existingPublication.partners ?? "");

    setReferenceCount(
      existingPublication.referenceCount != null ? String(existingPublication.referenceCount) : "",
    );
    setReadTimeMinutes(
      existingPublication.readTimeMinutes != null ? String(existingPublication.readTimeMinutes) : "",
    );
    setReviewingPhysician(existingPublication.reviewingPhysician ?? "");
    setPhysicianReviewed(existingPublication.physicianReviewed);
    setEvidenceBased(existingPublication.evidenceBased);
    setOpenAccess(existingPublication.openAccess);
    setFullyReferenced(existingPublication.fullyReferenced);
    setCoiDisclosed(existingPublication.coiDisclosed);

    setDoiUrl(existingPublication.doiUrl ?? "");
    setJournalUrl(existingPublication.journalUrl ?? "");
    setPubmedUrl(existingPublication.pubmedUrl ?? "");
    setGoogleScholarUrl(existingPublication.googleScholarUrl ?? "");

    setVisibility(existingPublication.visibility);
    setSeoTitle(existingPublication.seoTitle ?? "");
    setMetaDescription(existingPublication.metaDescription ?? "");
    setKeywordsRaw(existingPublication.keywords?.map((keyword) => keyword.keyword).join(", ") ?? "");

    const attachments = existingPublication.attachments ?? [];
    const pdf = attachments.find((attachment) => attachment.type === "PDF");
    const cover = attachments.find((attachment) => attachment.type === "COVER_IMAGE");
    const supplementary = attachments.filter((attachment) => attachment.type === "SUPPLEMENTARY");

    if (pdf) {
      setPdfFile({
        fileName: pdf.fileName,
        fileUrl: pdf.fileUrl,
        fileSize: pdf.fileSize ?? 0,
        mimeType: pdf.mimeType ?? "application/pdf",
      });
    }
    if (cover) {
      setCoverImage({
        fileName: cover.fileName,
        fileUrl: cover.fileUrl,
        fileSize: cover.fileSize ?? 0,
        mimeType: cover.mimeType ?? "image/jpeg",
      });
    }
    if (supplementary.length) {
      setSupplementaryFiles(
        supplementary.map((attachment) => ({
          fileName: attachment.fileName,
          fileUrl: attachment.fileUrl,
          fileSize: attachment.fileSize ?? 0,
          mimeType: attachment.mimeType ?? "application/octet-stream",
        })),
      );
    }
  }, [existingPublication]);

  useEffect(() => {
    if (!slugTouched && title.trim()) {
      setSlug(slugifyTitle(title));
    }
  }, [title, slugTouched]);

  const previewData: PublicationPreviewData = useMemo(
    () => ({
      title,
      subtitle,
      abstract,
      publicationType,
      medicalSpecialty,
      publicationDate,
      physicianReviewed,
      evidenceBased,
      openAccess,
      fullyReferenced,
      coiDisclosed,
      referenceCount: referenceCount ? Number(referenceCount) : null,
      readTimeMinutes: readTimeMinutes ? Number(readTimeMinutes) : null,
      journalName,
      doi,
      reviewingPhysician,
      researchOverview,
      methodologySteps,
      partners,
      keywords: parseKeywords(keywordsRaw),
      authors: [
        { name: primaryAuthor.name, role: primaryAuthor.role, isPrimary: true },
        ...coAuthors
          .filter((author) => author.name.trim())
          .map((author) => ({ name: author.name, role: author.role })),
      ],
      teamMembers: teamMembers.filter((member) => member.name.trim() || member.role.trim()),
    }),
    [
      title,
      subtitle,
      abstract,
      publicationType,
      medicalSpecialty,
      publicationDate,
      physicianReviewed,
      evidenceBased,
      openAccess,
      fullyReferenced,
      coiDisclosed,
      referenceCount,
      readTimeMinutes,
      journalName,
      doi,
      reviewingPhysician,
      researchOverview,
      methodologySteps,
      partners,
      keywordsRaw,
      primaryAuthor,
      coAuthors,
      teamMembers,
    ],
  );

  const handleFileUpload = async (
    file: File,
    kind: "pdf" | "cover" | "supplementary",
  ): Promise<boolean> => {
    if (kind === "pdf") {
      if (file.type !== "application/pdf") {
        showToast("⚠️ PDF must be a .pdf file");
        return false;
      }
      if (file.size > 20 * 1024 * 1024) {
        showToast("⚠️ PDF too large. Max 20MB.");
        return false;
      }
    } else if (kind === "cover") {
      if (!file.type.startsWith("image/")) {
        showToast("⚠️ Cover must be an image file");
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast("⚠️ Image too large. Max 5MB.");
        return false;
      }
    } else if (file.size > 10 * 1024 * 1024) {
      showToast("⚠️ Supplementary file too large. Max 10MB.");
      return false;
    }

    setUploading(kind);
    try {
      const url = await uploadFile(file, "drinsight/publications");
      const uploaded: UploadedFileState = {
        fileName: file.name,
        fileUrl: url,
        fileSize: file.size,
        mimeType: file.type,
      };
      if (kind === "pdf") setPdfFile(uploaded);
      else if (kind === "cover") setCoverImage(uploaded);
      else setSupplementaryFiles((prev) => [...prev, uploaded]);
      showToast("✓ File uploaded successfully");
      return true;
    } catch {
      showToast("⚠️ File upload failed. Please try again.");
      return false;
    } finally {
      setUploading(null);
    }
  };

  const buildAuthorsPayload = () => {
    const authors = [
      {
        name: primaryAuthor.name.trim(),
        role: primaryAuthor.role.trim() || undefined,
        orcid: primaryAuthor.orcid.trim() || orcid.trim() || undefined,
        affiliation: primaryAuthor.affiliation.trim() || institution.trim() || undefined,
        isPrimary: true,
        sortOrder: 0,
      },
      ...coAuthors
        .filter((author) => author.name.trim())
        .map((author, index) => ({
          name: author.name.trim(),
          role: author.role.trim() || undefined,
          orcid: author.orcid.trim() || undefined,
          affiliation: author.affiliation.trim() || undefined,
          isPrimary: false,
          sortOrder: index + 1,
        })),
      ...teamMembers
        .filter((member) => member.name.trim())
        .map((member, index) => ({
          name: member.name.trim(),
          role: member.role.trim() || undefined,
          isPrimary: false,
          sortOrder: coAuthors.length + index + 1,
        })),
    ];

    const seen = new Set<string>();
    return authors.filter((author) => {
      const key = author.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const buildAttachmentsPayload = (): PublicationAttachment[] => {
    const attachments: PublicationAttachment[] = [];
    if (pdfFile) {
      attachments.push({
        type: "PDF",
        fileName: pdfFile.fileName,
        fileUrl: pdfFile.fileUrl,
        fileSize: pdfFile.fileSize,
        mimeType: pdfFile.mimeType,
      });
    }
    if (coverImage) {
      attachments.push({
        type: "COVER_IMAGE",
        fileName: coverImage.fileName,
        fileUrl: coverImage.fileUrl,
        fileSize: coverImage.fileSize,
        mimeType: coverImage.mimeType,
      });
    }
    supplementaryFiles.forEach((file) => {
      attachments.push({
        type: "SUPPLEMENTARY",
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
      });
    });
    return attachments;
  };

  const buildPayload = (submitForReview: boolean): PublicationPayload => ({
    title: title.trim(),
    slug: slug.trim() || slugifyTitle(title),
    subtitle: subtitle.trim() || undefined,
    abstract: abstract.trim(),
    researchCategory: researchCategory.trim() || undefined,
    medicalSpecialty: medicalSpecialty || undefined,
    publicationType,
    language,
    authors: buildAuthorsPayload(),
    institution: institution.trim() || undefined,
    department: department.trim() || undefined,
    orcid: orcid.trim() || undefined,
    correspondingAuthor: correspondingAuthor.trim() || primaryAuthor.name.trim() || undefined,
    journalName: journalName.trim() || undefined,
    publisher: publisher.trim() || undefined,
    volume: volume.trim() || undefined,
    issue: issue.trim() || undefined,
    pages: pages.trim() || undefined,
    doi: doi.trim() || undefined,
    issn: issn.trim() || undefined,
    publicationDate: publicationDate || undefined,
    acceptanceDate: acceptanceDate || undefined,
    submissionDate: submissionDate || undefined,
    researchMethodology: researchMethodology.trim() || undefined,
    studyDesign: studyDesign.trim() || undefined,
    sampleSize: sampleSize.trim() || undefined,
    fundingSource: fundingSource.trim() || undefined,
    ethicalApprovalNumber: ethicalApprovalNumber.trim() || undefined,
    clinicalTrialRegistration: clinicalTrialRegistration.trim() || undefined,
    researchOverview: researchOverview.trim() || undefined,
    methodologySteps: methodologySteps.trim() || undefined,
    partners: partners.trim() || undefined,
    referenceCount: referenceCount ? Number(referenceCount) : undefined,
    reviewingPhysician: reviewingPhysician.trim() || undefined,
    physicianReviewed,
    evidenceBased,
    openAccess,
    fullyReferenced,
    coiDisclosed,
    doiUrl: doiUrl.trim() || undefined,
    journalUrl: journalUrl.trim() || undefined,
    pubmedUrl: pubmedUrl.trim() || undefined,
    googleScholarUrl: googleScholarUrl.trim() || undefined,
    visibility,
    seoTitle: seoTitle.trim() || title.trim() || undefined,
    metaDescription: metaDescription.trim() || abstract.trim() || undefined,
    keywords: parseKeywords(keywordsRaw),
    attachments: buildAttachmentsPayload(),
    readTimeMinutes: readTimeMinutes ? Number(readTimeMinutes) : undefined,
    submitForReview,
  });

  const validateForm = () => {
    if (!title.trim()) {
      showToast("⚠️ Please enter a publication title");
      return false;
    }
    if (!abstract.trim() || abstract.trim().length < 10) {
      showToast("⚠️ Abstract must be at least 10 characters");
      return false;
    }
    if (!publicationType) {
      showToast("⚠️ Please select a publication type");
      return false;
    }
    if (!medicalSpecialty) {
      showToast("⚠️ Please select a medical specialty");
      return false;
    }
    if (!primaryAuthor.name.trim()) {
      showToast("⚠️ Please enter a lead author");
      return false;
    }
    return true;
  };

  const handleSubmit = async (draft: boolean) => {
    if (!validateForm()) return;
    setIsDraft(draft);

    try {
      const payload = buildPayload(!draft);
      if (editId) {
        await updatePublication.mutateAsync({ id: editId, payload });
      } else {
        await createPublication.mutateAsync(payload);
      }
      setSubmitted(true);
      showToast(draft ? "Saved as draft ✓" : "Publication submitted for review ✓");
    } catch {
      showToast("⚠️ Failed to save publication. Please try again.");
    } finally {
      setIsDraft(false);
    }
  };

  const isSaving = createPublication.isPending || updatePublication.isPending;

  if (editId && loadingExisting) {
    return (
      <>
        <DashPageHeader
          subtitle="👨‍⚕️ Physician Dashboard"
          title="Edit Publication"
          dateStr={todayFormatted()}
        />
        <DashCard title="📤 Loading publication...">
          <p style={{ color: "var(--gray-400)", padding: 24, textAlign: "center" }}>Loading...</p>
        </DashCard>
      </>
    );
  }

  if (submitted) {
    return (
      <>
        <DashPageHeader
          subtitle="👨‍⚕️ Physician Dashboard"
          title={editId ? "Edit Publication" : "Submit a Publication"}
          dateStr={todayFormatted()}
        />
        <DashCard title="📤 Publication Submission">
          <div className="submit-success show">
            <div style={{ fontSize: "3.5rem", marginBottom: 14 }}>✅</div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.3rem",
                color: "var(--gray-900)",
                marginBottom: 8,
              }}
            >
              Publication Submitted Successfully!
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--gray-600)", marginBottom: 20 }}>
              Your publication has been sent to the editorial team and will appear on the Research
              &amp; Publications page after physician sign-off.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/doctor/publications" className="art-submit-btn" style={{ width: "auto", padding: "10px 24px", textDecoration: "none", display: "inline-block" }}>
                📚 View My Publications
              </Link>
              <button
                type="button"
                className="art-submit-btn draft"
                style={{ width: "auto", padding: "10px 24px" }}
                onClick={() => setSubmitted(false)}
              >
                📤 Submit Another
              </button>
            </div>
          </div>
        </DashCard>
      </>
    );
  }

  return (
    <>
      <DashPageHeader
        subtitle="👨‍⚕️ Physician Dashboard"
        title={editId ? "Edit Publication" : "Submit a Publication"}
        dateStr={todayFormatted()}
        actions={
          <Link href="/doctor/publications" className="btn-wo" style={{ textDecoration: "none" }}>
            📚 My Publications
          </Link>
        }
      />

      <DashCard
        title="📤 New Publication Submission"
        headerExtra={
          <span style={{ fontSize: "0.76rem", color: "var(--gray-400)" }}>
            Appears on the public Research &amp; Publications page after review
          </span>
        }
      >
        <form
          ref={formRef}
          className="art-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(false);
          }}
        >
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pubType">Publication Type *</label>
              <select
                id="pubType"
                value={publicationType}
                onChange={(e) => setPublicationType(e.target.value as PublicationType)}
              >
                {PUBLICATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {PUBLICATION_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="pubSpecialty">Focus Area / Specialty *</label>
              <select
                id="pubSpecialty"
                value={medicalSpecialty}
                onChange={(e) => setMedicalSpecialty(e.target.value)}
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
            <label htmlFor="pubTitle">Title *</label>
            <input
              id="pubTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Full publication title"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pubSubtitle">Subtitle</label>
              <input
                id="pubSubtitle"
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Optional subtitle"
              />
            </div>
            <div className="form-group">
              <label htmlFor="pubSlug">URL Slug</label>
              <input
                id="pubSlug"
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                placeholder="auto-generated-from-title"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="pubAbstract">
              Abstract / Summary *{" "}
              <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(min 10 characters)</span>
            </label>
            <textarea
              id="pubAbstract"
              rows={4}
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              placeholder="A concise summary of the publication."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pubLanguage">Language</label>
              <select id="pubLanguage" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option>English</option>
                <option>Urdu</option>
                <option>Arabic</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="pubCategory">Research Category</label>
              <input
                id="pubCategory"
                type="text"
                value={researchCategory}
                onChange={(e) => setResearchCategory(e.target.value)}
                placeholder="e.g. Systematic Review, Cohort Study"
              />
            </div>
          </div>

          <div className="pub-sec-lbl">👤 Authors &amp; Affiliation</div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pubLeadAuthor">Lead Author *</label>
              <input
                id="pubLeadAuthor"
                type="text"
                value={primaryAuthor.name}
                onChange={(e) => setPrimaryAuthor((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Dr. A. Rehman, MBBS"
              />
            </div>
            <div className="form-group">
              <label htmlFor="pubLeadRole">Lead Author Role</label>
              <input
                id="pubLeadRole"
                type="text"
                value={primaryAuthor.role}
                onChange={(e) => setPrimaryAuthor((prev) => ({ ...prev, role: e.target.value }))}
                placeholder="e.g. Lead Researcher"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pubCorresponding">Corresponding Author</label>
              <input
                id="pubCorresponding"
                type="text"
                value={correspondingAuthor}
                onChange={(e) => setCorrespondingAuthor(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="pubOrcid">ORCID</label>
              <input
                id="pubOrcid"
                type="text"
                value={orcid}
                onChange={(e) => setOrcid(e.target.value)}
                placeholder="0000-0000-0000-0000"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pubInstitution">Institution</label>
              <input
                id="pubInstitution"
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="pubDepartment">Department</label>
              <input
                id="pubDepartment"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              Co-authors{" "}
              <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(add/remove dynamically)</span>
            </label>
            {coAuthors.map((author, index) => (
              <div key={index} className="pub-member-row">
                <input
                  type="text"
                  value={author.name}
                  onChange={(e) =>
                    setCoAuthors((prev) =>
                      prev.map((row, rowIndex) =>
                        rowIndex === index ? { ...row, name: e.target.value } : row,
                      ),
                    )
                  }
                  placeholder="Co-author name"
                />
                <input
                  type="text"
                  value={author.role}
                  onChange={(e) =>
                    setCoAuthors((prev) =>
                      prev.map((row, rowIndex) =>
                        rowIndex === index ? { ...row, role: e.target.value } : row,
                      ),
                    )
                  }
                  placeholder="Role"
                />
                <input
                  type="text"
                  value={author.orcid}
                  onChange={(e) =>
                    setCoAuthors((prev) =>
                      prev.map((row, rowIndex) =>
                        rowIndex === index ? { ...row, orcid: e.target.value } : row,
                      ),
                    )
                  }
                  placeholder="ORCID"
                />
                <button
                  type="button"
                  className="pub-mem-del"
                  onClick={() =>
                    setCoAuthors((prev) =>
                      prev.length > 1 ? prev.filter((_, rowIndex) => rowIndex !== index) : prev,
                    )
                  }
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="art-submit-btn draft"
              style={{ width: "auto", padding: "7px 16px", fontSize: "0.78rem", marginTop: 8 }}
              onClick={() => setCoAuthors((prev) => [...prev, { ...EMPTY_AUTHOR }])}
            >
              ＋ Add Co-author
            </button>
          </div>

          <div className="pub-sec-lbl">📖 Journal &amp; Publication Details</div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pubJournal">Journal Name</label>
              <input
                id="pubJournal"
                type="text"
                value={journalName}
                onChange={(e) => setJournalName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="pubPublisher">Publisher</label>
              <input
                id="pubPublisher"
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pubVolume">Volume</label>
              <input id="pubVolume" type="text" value={volume} onChange={(e) => setVolume(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="pubIssue">Issue</label>
              <input id="pubIssue" type="text" value={issue} onChange={(e) => setIssue(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="pubPages">Pages</label>
              <input id="pubPages" type="text" value={pages} onChange={(e) => setPages(e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pubDoi">DOI</label>
              <input id="pubDoi" type="text" value={doi} onChange={(e) => setDoi(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="pubIssn">ISSN</label>
              <input id="pubIssn" type="text" value={issn} onChange={(e) => setIssn(e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pubPubDate">Publication Date</label>
              <input
                id="pubPubDate"
                type="date"
                value={publicationDate}
                onChange={(e) => setPublicationDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="pubAcceptDate">Acceptance Date</label>
              <input
                id="pubAcceptDate"
                type="date"
                value={acceptanceDate}
                onChange={(e) => setAcceptanceDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="pubSubmitDate">Submission Date</label>
              <input
                id="pubSubmitDate"
                type="date"
                value={submissionDate}
                onChange={(e) => setSubmissionDate(e.target.value)}
              />
            </div>
          </div>

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
            ℹ️ <strong>Your research, your credit.</strong> This publication and its research team belong
            to you — DrInsight only reviews and publishes it.
          </div>

          <div className="pub-sec-lbl">🔬 Your Research</div>

          <div className="form-group">
            <label htmlFor="pubOverview">Research Overview / Background</label>
            <textarea
              id="pubOverview"
              rows={3}
              value={researchOverview}
              onChange={(e) => setResearchOverview(e.target.value)}
              placeholder="Briefly describe your research — its aim, scope, and why it matters."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pubMethodology">Research Methodology</label>
              <input
                id="pubMethodology"
                type="text"
                value={researchMethodology}
                onChange={(e) => setResearchMethodology(e.target.value)}
                placeholder="e.g. Systematic review, RCT"
              />
            </div>
            <div className="form-group">
              <label htmlFor="pubStudyDesign">Study Design</label>
              <input
                id="pubStudyDesign"
                type="text"
                value={studyDesign}
                onChange={(e) => setStudyDesign(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pubSampleSize">Sample Size</label>
              <input
                id="pubSampleSize"
                type="text"
                value={sampleSize}
                onChange={(e) => setSampleSize(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="pubFunding">Funding Source</label>
              <input
                id="pubFunding"
                type="text"
                value={fundingSource}
                onChange={(e) => setFundingSource(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pubEthics">Ethical Approval Number</label>
              <input
                id="pubEthics"
                type="text"
                value={ethicalApprovalNumber}
                onChange={(e) => setEthicalApprovalNumber(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="pubTrialReg">Clinical Trial Registration</label>
              <input
                id="pubTrialReg"
                type="text"
                value={clinicalTrialRegistration}
                onChange={(e) => setClinicalTrialRegistration(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="pubMethodSteps">
              Methodology Steps{" "}
              <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>
                (one step per line — shown as a numbered process)
              </span>
            </label>
            <textarea
              id="pubMethodSteps"
              rows={4}
              value={methodologySteps}
              onChange={(e) => setMethodologySteps(e.target.value)}
              placeholder={"Literature search across peer-reviewed databases\nScreening against evidence standards\nSynthesis & plain-language drafting\nIndependent physician review"}
            />
          </div>

          <div className="form-group">
            <label>
              Research Team Members{" "}
              <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>
                (add everyone who contributed)
              </span>
            </label>
            {teamMembers.map((member, index) => (
              <div key={index} className="pub-member-row">
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) =>
                    setTeamMembers((prev) =>
                      prev.map((row, rowIndex) =>
                        rowIndex === index ? { ...row, name: e.target.value } : row,
                      ),
                    )
                  }
                  placeholder="Member name"
                />
                <input
                  type="text"
                  value={member.role}
                  onChange={(e) =>
                    setTeamMembers((prev) =>
                      prev.map((row, rowIndex) =>
                        rowIndex === index ? { ...row, role: e.target.value } : row,
                      ),
                    )
                  }
                  placeholder="Role"
                />
                <button
                  type="button"
                  className="pub-mem-del"
                  onClick={() =>
                    setTeamMembers((prev) =>
                      prev.length > 1 ? prev.filter((_, rowIndex) => rowIndex !== index) : prev,
                    )
                  }
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="art-submit-btn draft"
              style={{ width: "auto", padding: "7px 16px", fontSize: "0.78rem", marginTop: 8 }}
              onClick={() => setTeamMembers((prev) => [...prev, { ...EMPTY_MEMBER }])}
            >
              ＋ Add Member
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="pubPartners">
              Partners / Collaborators / Funding{" "}
              <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(comma-separated)</span>
            </label>
            <input
              id="pubPartners"
              type="text"
              value={partners}
              onChange={(e) => setPartners(e.target.value)}
              placeholder="e.g. Hospital, Research grant, Collaborating institute"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pubRefs">Number of References</label>
              <input
                id="pubRefs"
                type="number"
                min={0}
                value={referenceCount}
                onChange={(e) => setReferenceCount(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="pubReadTime">Estimated Read Time (minutes)</label>
              <input
                id="pubReadTime"
                type="number"
                min={1}
                value={readTimeMinutes}
                onChange={(e) => setReadTimeMinutes(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="pubReviewer">Reviewing Physician / Panel</label>
              <input
                id="pubReviewer"
                type="text"
                value={reviewingPhysician}
                onChange={(e) => setReviewingPhysician(e.target.value)}
                placeholder="e.g. Dr. J. Kumbhar, MBBS, RMP"
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              Quality &amp; Trust Checklist{" "}
              <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>
                (shown as trust badges on the public page)
              </span>
            </label>
            <div className="pub-check-grid">
              <label className="pub-check">
                <input
                  type="checkbox"
                  checked={physicianReviewed}
                  onChange={(e) => setPhysicianReviewed(e.target.checked)}
                />{" "}
                ✅ Physician-Reviewed
              </label>
              <label className="pub-check">
                <input
                  type="checkbox"
                  checked={evidenceBased}
                  onChange={(e) => setEvidenceBased(e.target.checked)}
                />{" "}
                🧬 Evidence-Based
              </label>
              <label className="pub-check">
                <input type="checkbox" checked={openAccess} onChange={(e) => setOpenAccess(e.target.checked)} />{" "}
                🔓 Open Access
              </label>
              <label className="pub-check">
                <input
                  type="checkbox"
                  checked={fullyReferenced}
                  onChange={(e) => setFullyReferenced(e.target.checked)}
                />{" "}
                🔗 Fully Referenced
              </label>
              <label className="pub-check">
                <input
                  type="checkbox"
                  checked={coiDisclosed}
                  onChange={(e) => setCoiDisclosed(e.target.checked)}
                />{" "}
                📋 COI Disclosed
              </label>
            </div>
          </div>

          <div className="pub-sec-lbl">🔗 External Links</div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pubDoiUrl">DOI URL</label>
              <input
                id="pubDoiUrl"
                type="url"
                value={doiUrl}
                onChange={(e) => setDoiUrl(e.target.value)}
                placeholder="https://doi.org/..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="pubJournalUrl">Journal URL</label>
              <input
                id="pubJournalUrl"
                type="url"
                value={journalUrl}
                onChange={(e) => setJournalUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pubPubmed">PubMed URL</label>
              <input
                id="pubPubmed"
                type="url"
                value={pubmedUrl}
                onChange={(e) => setPubmedUrl(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="pubScholar">Google Scholar URL</label>
              <input
                id="pubScholar"
                type="url"
                value={googleScholarUrl}
                onChange={(e) => setGoogleScholarUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="pub-sec-lbl">🔍 SEO &amp; Visibility</div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pubVisibility">Visibility</label>
              <select
                id="pubVisibility"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as PublicationVisibility)}
              >
                {VISIBILITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="pubKeywords">
                Keywords <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(comma-separated)</span>
              </label>
              <input
                id="pubKeywords"
                type="text"
                value={keywordsRaw}
                onChange={(e) => setKeywordsRaw(e.target.value)}
                placeholder="hypertension, cardiology, blood pressure"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pubSeoTitle">SEO Title</label>
              <input
                id="pubSeoTitle"
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Custom title for search engines"
              />
            </div>
            <div className="form-group">
              <label htmlFor="pubMetaDesc">Meta Description</label>
              <textarea
                id="pubMetaDesc"
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Short description for search engine results"
              />
            </div>
          </div>

          <div className="pub-sec-lbl">📎 Attachments</div>

          <div className="form-group">
            <label>Publication PDF <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(max 20MB)</span></label>
            <div className="file-upload-box" onClick={() => pdfRef.current?.click()}>
              {uploading === "pdf" ? (
                <span>Uploading...</span>
              ) : pdfFile ? (
                <span className="file-chip">📄 {pdfFile.fileName}</span>
              ) : (
                <>
                  <div style={{ fontSize: "2rem", marginBottom: 8 }}>📄</div>
                  <div style={{ fontWeight: 700, color: "var(--gray-700)", fontSize: "0.88rem" }}>
                    Upload PDF
                  </div>
                  <div style={{ fontSize: "0.77rem", color: "var(--gray-400)" }}>Click to browse · PDF only · Max 20MB</div>
                </>
              )}
            </div>
            <input
              ref={pdfRef}
              type="file"
              accept="application/pdf"
              style={{ display: "none" }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) await handleFileUpload(file, "pdf");
                e.target.value = "";
              }}
            />
            {pdfFile ? (
              <button
                type="button"
                className="art-submit-btn draft"
                style={{ width: "auto", padding: "6px 14px", fontSize: "0.74rem", marginTop: 8 }}
                onClick={() => setPdfFile(null)}
              >
                ✕ Remove PDF
              </button>
            ) : null}
          </div>

          <div className="form-group">
            <label>Cover Image <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(max 5MB)</span></label>
            <div className="file-upload-box" onClick={() => coverRef.current?.click()}>
              {uploading === "cover" ? (
                <span>Uploading...</span>
              ) : coverImage ? (
                <>
                  <img
                    src={coverImage.fileUrl}
                    alt="Cover preview"
                    style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 8 }}
                  />
                  <span className="file-chip" style={{ marginTop: 8 }}>
                    🖼️ {coverImage.fileName}
                  </span>
                </>
              ) : (
                <>
                  <div style={{ fontSize: "2rem", marginBottom: 8 }}>🖼️</div>
                  <div style={{ fontWeight: 700, color: "var(--gray-700)", fontSize: "0.88rem" }}>
                    Upload Cover Image
                  </div>
                  <div style={{ fontSize: "0.77rem", color: "var(--gray-400)" }}>
                    JPG, PNG, WebP · Max 5MB
                  </div>
                </>
              )}
            </div>
            <input
              ref={coverRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) await handleFileUpload(file, "cover");
                e.target.value = "";
              }}
            />
            {coverImage ? (
              <button
                type="button"
                className="art-submit-btn draft"
                style={{ width: "auto", padding: "6px 14px", fontSize: "0.74rem", marginTop: 8 }}
                onClick={() => setCoverImage(null)}
              >
                ✕ Remove Cover
              </button>
            ) : null}
          </div>

          <div className="form-group">
            <label>
              Supplementary Files{" "}
              <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(max 10MB each)</span>
            </label>
            <div className="file-upload-box" onClick={() => supplementaryRef.current?.click()}>
              {uploading === "supplementary" ? (
                <span>Uploading...</span>
              ) : (
                <>
                  <div style={{ fontSize: "2rem", marginBottom: 8 }}>📎</div>
                  <div style={{ fontWeight: 700, color: "var(--gray-700)", fontSize: "0.88rem" }}>
                    Add Supplementary File
                  </div>
                  <div style={{ fontSize: "0.77rem", color: "var(--gray-400)" }}>Datasets, tables, figures · Max 10MB</div>
                </>
              )}
            </div>
            <input
              ref={supplementaryRef}
              type="file"
              style={{ display: "none" }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) await handleFileUpload(file, "supplementary");
                e.target.value = "";
              }}
            />
            {supplementaryFiles.length > 0 ? (
              <div style={{ marginTop: 8 }}>
                {supplementaryFiles.map((file, index) => (
                  <span key={`${file.fileName}-${index}`} className="file-chip">
                    📎 {file.fileName}
                    <button
                      type="button"
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        color: "var(--red)",
                        marginLeft: 4,
                      }}
                      onClick={() =>
                        setSupplementaryFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index))
                      }
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div style={{ marginTop: 22 }}>
            <div className="pubprev-lbl">
              👁 Live Preview — how your publication appears on the Research &amp; Publications page
            </div>
            <PublicationPreview data={previewData} />
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
            ⚠️ <strong>Editorial Notice:</strong> All publications undergo multi-stage review before going
            live. By submitting, you confirm this is original, evidence-based work and that you hold valid
            medical licensure.
          </div>

          <div className="art-btn-row">
            <button
              type="button"
              className="art-submit-btn draft"
              disabled={isSaving}
              onClick={() => handleSubmit(true)}
            >
              {isSaving && isDraft ? "Saving..." : "💾 Save as Draft"}
            </button>
            <button type="submit" className="art-submit-btn" disabled={isSaving}>
              {isSaving && !isDraft ? "Submitting..." : "📤 Submit for Review"}
            </button>
          </div>
        </form>
      </DashCard>
    </>
  );
}
