"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  EMPTY_AUTHOR,
  EMPTY_REFERENCE,
  MEDICAL_SPECIALTIES,
  SubmitResearchForm,
  formStateToPayload,
  type SubmitResearchFormState,
} from "@/components/doctor/publications/SubmitResearchForm";
import { DashCard, DashPageHeader } from "@/components/doctor/ui/DoctorPrimitives";
import { slugifyTitle } from "@/lib/blog-toc";
import { doctorDisplayName, todayFormatted } from "@/lib/doctor-utils";
import { uploadFile } from "@/lib/upload";
import { useDoctorProfile } from "@/services/doctor-api-hooks";
import {
  type PublicationAttachment,
  useCreatePublication,
  useDoctorPublication,
  useUpdatePublication,
} from "@/services/publications-api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

export { MEDICAL_SPECIALTIES } from "@/components/doctor/publications/SubmitResearchForm";

const DEFAULT_FORM_STATE = (): SubmitResearchFormState => ({
  publicationType: "EVIDENCE_REVIEW",
  medicalSpecialty: "",
  title: "",
  publicationDate: "",
  articleId: "",
  doi: "",
  license: "CC BY 4.0",
  readTimeMinutes: "10",
  authors: [{ ...EMPTY_AUTHOR }],
  abstractBackground: "",
  abstractMethods: "",
  abstractResults: "",
  abstractConclusions: "",
  keywordsRaw: "",
  introduction: "",
  objectives: "",
  methodsContent: "",
  methodsTable: "",
  results: "",
  figureData: "",
  figureCaption: "",
  resultSummary: "",
  discussion: "",
  practiceImplications: "",
  limitations: "",
  conclusion: "",
  keyFindings: "",
  authorContributions: "",
  ethicsStatement: "",
  clinicalTrialRegistration: "",
  dataAvailabilityStatement: "",
  fundingSource: "",
  conflictsOfInterest: "",
  acknowledgments: "",
  abbreviations: "",
  references: [{ ...EMPTY_REFERENCE }],
  coverImageUrl: null,
  coverImageName: null,
  pdfFile: null,
  supplementaryFiles: [],
});

function toDateInput(value?: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function publicationToFormState(pub: NonNullable<ReturnType<typeof useDoctorPublication>["data"]>): SubmitResearchFormState {
  const cover = pub.attachments?.find((a) => a.type === "COVER_IMAGE");
  const pdf = pub.attachments?.find((a) => a.type === "PDF");
  const supplementary = pub.attachments?.filter((a) => a.type === "SUPPLEMENTARY") ?? [];

  return {
    publicationType: pub.publicationType,
    medicalSpecialty: pub.medicalSpecialty ?? "",
    title: pub.title,
    publicationDate: toDateInput(pub.publicationDate),
    articleId: pub.articleId ?? "",
    doi: pub.doi ?? "",
    license: pub.license ?? "CC BY 4.0",
    readTimeMinutes: String(pub.readTimeMinutes ?? 10),
    authors: pub.authors?.length
      ? pub.authors.map((author) => ({
          name: author.name,
          affiliation: author.affiliation ?? "",
        }))
      : [{ ...EMPTY_AUTHOR }],
    abstractBackground: pub.abstractBackground ?? "",
    abstractMethods: pub.abstractMethods ?? "",
    abstractResults: pub.abstractResults ?? "",
    abstractConclusions: pub.abstractConclusions ?? "",
    keywordsRaw: pub.keywords?.map((kw) => kw.keyword).join(", ") ?? "",
    introduction: pub.introduction ?? pub.researchOverview ?? "",
    objectives: pub.objectives ?? "",
    methodsContent: pub.methodsContent ?? pub.researchMethodology ?? pub.methodologySteps ?? "",
    methodsTable: pub.methodsTable ?? "",
    results: pub.results ?? "",
    figureData: pub.figureData ?? "",
    figureCaption: pub.figureCaption ?? "",
    resultSummary: pub.resultSummary ?? "",
    discussion: pub.discussion ?? "",
    practiceImplications: pub.practiceImplications ?? "",
    limitations: pub.limitations ?? "",
    conclusion: pub.conclusion ?? "",
    keyFindings: pub.keyFindings ?? "",
    authorContributions: pub.authorContributions ?? "",
    ethicsStatement: pub.ethicsStatement ?? pub.ethicalApprovalNumber ?? "",
    clinicalTrialRegistration: pub.clinicalTrialRegistration ?? "",
    dataAvailabilityStatement: pub.dataAvailabilityStatement ?? "",
    fundingSource: pub.fundingSource ?? "",
    conflictsOfInterest: pub.conflictsOfInterest ?? "",
    acknowledgments: pub.acknowledgments ?? "",
    abbreviations: pub.abbreviations ?? "",
    references: pub.references?.length
      ? pub.references.map((ref) => ({ citation: ref.citation, doi: ref.doi ?? "" }))
      : [{ ...EMPTY_REFERENCE }],
    coverImageUrl: cover?.fileUrl ?? null,
    coverImageName: cover?.fileName ?? null,
    pdfFile: pdf
      ? {
          type: "PDF",
          fileName: pdf.fileName,
          fileUrl: pdf.fileUrl,
          fileSize: pdf.fileSize ?? undefined,
          mimeType: pdf.mimeType ?? "application/pdf",
        }
      : null,
    supplementaryFiles: supplementary.map((file) => ({
      type: "SUPPLEMENTARY",
      fileName: file.fileName,
      fileUrl: file.fileUrl,
      fileSize: file.fileSize ?? undefined,
      mimeType: file.mimeType ?? "application/octet-stream",
    })),
  };
}

export function SubmitPublicationPageContent() {
  const showToast = useDoctorUiStore((s) => s.showToast);
  const searchParams = useSearchParams();
  const editId = searchParams.get("id") ?? undefined;

  const { data: profile } = useDoctorProfile();
  const { data: existingPublication, isLoading: loadingExisting } = useDoctorPublication(editId);
  const createPublication = useCreatePublication();
  const updatePublication = useUpdatePublication();

  const pdfRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const supplementaryRef = useRef<HTMLInputElement>(null);

  const [submitted, setSubmitted] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [formState, setFormState] = useState<SubmitResearchFormState>(DEFAULT_FORM_STATE);

  useEffect(() => {
    if (!profile || editId) return;
    const displayName = doctorDisplayName(profile.user?.firstName, profile.user?.lastName);
    const credentials = profile.credentials ? `, ${profile.credentials}` : "";
    setFormState((prev) => ({
      ...prev,
      authors: [{ name: `${displayName}${credentials}`, affiliation: profile.hospital ?? "" }],
      medicalSpecialty: profile.specialty ?? "",
    }));
  }, [profile, editId]);

  useEffect(() => {
    if (!existingPublication) return;
    setFormState(publicationToFormState(existingPublication));
  }, [existingPublication]);

  const patchForm = (patch: Partial<SubmitResearchFormState>) => {
    setFormState((prev) => ({ ...prev, ...patch }));
  };

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
      const uploaded: PublicationAttachment = {
        type: kind === "pdf" ? "PDF" : "SUPPLEMENTARY",
        fileName: file.name,
        fileUrl: url,
        fileSize: file.size,
        mimeType: file.type,
      };
      if (kind === "pdf") patchForm({ pdfFile: uploaded });
      else if (kind === "cover") patchForm({ coverImageUrl: url, coverImageName: file.name });
      else
        patchForm({
          supplementaryFiles: [...formState.supplementaryFiles, uploaded],
        });
      showToast("✓ File uploaded successfully");
      return true;
    } catch {
      showToast("⚠️ File upload failed. Please try again.");
      return false;
    } finally {
      setUploading(null);
    }
  };

  const validateForm = () => {
    if (!formState.title.trim()) {
      showToast("⚠️ Please enter a publication title");
      return false;
    }
    if (!formState.medicalSpecialty) {
      showToast("⚠️ Please select a focus area");
      return false;
    }
    if (!formState.publicationDate) {
      showToast("⚠️ Please enter a published date");
      return false;
    }
    const abstractParts = [
      formState.abstractBackground,
      formState.abstractMethods,
      formState.abstractResults,
      formState.abstractConclusions,
    ].filter((part) => part.trim());
    if (!abstractParts.length || abstractParts.join("").length < 10) {
      showToast("⚠️ Please complete the structured abstract");
      return false;
    }
    if (!formState.authors.some((author) => author.name.trim())) {
      showToast("⚠️ Please add at least one author");
      return false;
    }
    return true;
  };

  const handleSubmit = async (draft: boolean) => {
    if (!validateForm()) return;
    setIsDraft(draft);
    try {
      const payload = formStateToPayload(formState, !draft, slugifyTitle(formState.title));
      if (editId) {
        await updatePublication.mutateAsync({ id: editId, payload });
      } else {
        await createPublication.mutateAsync(payload);
      }
      setSubmitted(true);
      showToast(draft ? "Saved as draft ✓" : "Research submitted for review ✓");
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
          title="Submit Research Publication"
          dateStr={todayFormatted()}
        />
        <DashCard title="🔬 Loading research...">
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
          title="Submit Research Publication"
          dateStr={todayFormatted()}
        />
        <DashCard title="🔬 New Research Publication">
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
              Research Submitted Successfully!
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--gray-600)", marginBottom: 20 }}>
              Your research has been sent to the editorial team. After physician review it publishes as a full
              research article on the public Research &amp; Publications page.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/doctor/publications"
                className="art-submit-btn"
                style={{ width: "auto", padding: "10px 24px", textDecoration: "none", display: "inline-block" }}
              >
                📚 View My Publications
              </Link>
              <button
                type="button"
                className="art-submit-btn draft"
                style={{ width: "auto", padding: "10px 24px" }}
                onClick={() => {
                  setSubmitted(false);
                  setFormState(DEFAULT_FORM_STATE());
                }}
              >
                🔬 Submit Another
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
        title="Submit Research Publication"
        dateStr={todayFormatted()}
        actions={
          <Link href="/doctor/publications" className="btn-wo" style={{ textDecoration: "none" }}>
            📰 My Articles
          </Link>
        }
      />

      <DashCard
        title="🔬 New Research Publication"
        headerExtra={
          <span style={{ fontSize: "0.76rem", color: "var(--gray-400)" }}>
            Publishes as a full research article on the Research &amp; Publications page
          </span>
        }
      >
        <SubmitResearchForm
          state={formState}
          onChange={patchForm}
          onAuthorsChange={(authors) => patchForm({ authors })}
          onReferencesChange={(references) => patchForm({ references })}
          uploading={uploading}
          onUploadPdf={() => pdfRef.current?.click()}
          onUploadCover={() => coverRef.current?.click()}
          onUploadSupplementary={() => supplementaryRef.current?.click()}
          onRemovePdf={() => patchForm({ pdfFile: null })}
          onRemoveCover={() => patchForm({ coverImageUrl: null, coverImageName: null })}
          onRemoveSupplementary={(index) =>
            patchForm({
              supplementaryFiles: formState.supplementaryFiles.filter((_, fileIndex) => fileIndex !== index),
            })
          }
          isSaving={isSaving}
          isDraft={isDraft}
          onSaveDraft={() => handleSubmit(true)}
          onSubmit={() => handleSubmit(false)}
        />

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
      </DashCard>
    </>
  );
}
