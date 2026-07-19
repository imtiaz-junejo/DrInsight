"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DashCard, DashPageHeader } from "@/components/doctor/ui/DoctorPrimitives";
import { ArticleRichTextEditor, type ArticleRichTextEditorHandle } from "@/components/blog/ArticleRichTextEditor";
import { buildArticlePreviewHtml, type ArticlePreviewData } from "@/components/blog/article-preview-html";
import { DEFAULT_ARTICLE_DISCLAIMER } from "@/components/blog/SubmitArticleForm";
import { slugifyTitle } from "@/lib/blog-toc";
import { todayFormatted } from "@/lib/doctor-utils";
import { uploadFile } from "@/lib/upload";
import { useBlogCategories } from "@/services/api-hooks";
import { useCreateBlogPost, useDoctorProfile } from "@/services/doctor-api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

const SPECIALTIES = [
  "Cardiology",
  "Neurology",
  "Endocrinology",
  "Gastroenterology",
  "Nephrology",
  "Pulmonology",
  "Psychiatry",
  "Pediatrics",
  "Oncology",
  "Dermatology",
  "Internal Medicine",
  "Family Medicine",
  "Emergency Medicine",
  "Other",
];

const ARTICLE_TYPES = [
  "Clinical Overview",
  "Drug / Medication Guide",
  "Symptom Guide",
  "Research Update",
  "Patient Education",
  "Procedure Guide",
  "Clinical Reference",
];

const AUDIENCES = [
  "General Public / Patients",
  "Healthcare Professionals",
  "Medical Students",
  "Both (Patient + Professional)",
];

const WORD_RANGES = ["1,000–1,500 words", "1,500–2,500 words", "2,500–4,000 words", "4,000+ words"];

const COI_OPTIONS = [
  "None — I have no conflicts of interest related to this article",
  "Pharmaceutical — I have received funding / honoraria from a pharma company",
  "Research — I received research funding related to this topic",
  "Advisory — I serve on an advisory board related to this topic",
  "Other — I will describe in the notes below",
];

function todayInput(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function readFormPreview(form: HTMLFormElement, editor: ArticleRichTextEditorHandle | null): ArticlePreviewData {
  const val = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)?.value ?? "";
  return {
    title: val("artTitle"),
    subtitle: val("artSubtitle"),
    spec: val("artSpec"),
    type: val("artType"),
    audience: val("artAudience"),
    read: val("artReadTime"),
    tags: val("artTags"),
    published: val("artPublished"),
    heroIcon: val("artHeroIcon") || "🩺",
    authorName: val("artAuthorName"),
    authorCreds: val("artAuthorCreds"),
    authorRole: val("artAuthorRole"),
    abstract: val("artAbstract"),
    body: editor?.getHtml() ?? "",
    points: val("artPoints"),
    ref: val("artRef"),
  };
}

export function DoctorArticleSubmitForm() {
  const showToast = useDoctorUiStore((s) => s.showToast);
  const createPost = useCreateBlogPost();
  const { data: categories } = useBlogCategories();
  const { data: profile } = useDoctorProfile();

  const [submitted, setSubmitted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [isDraft, setIsDraft] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const editorRef = useRef<ArticleRichTextEditorHandle>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile?.user || !formRef.current) return;
    const form = formRef.current;
    const nameField = form.elements.namedItem("artAuthorName") as HTMLInputElement;
    const credsField = form.elements.namedItem("artAuthorCreds") as HTMLInputElement;
    const roleField = form.elements.namedItem("artAuthorRole") as HTMLInputElement;
    if (!nameField.value) {
      nameField.value = `Dr. ${profile.user.firstName} ${profile.user.lastName}`.trim();
    }
    if (!credsField.value && profile.credentials) credsField.value = profile.credentials;
    if (!roleField.value) {
      const role = [profile.professionalTitle || profile.specialty, profile.experienceYears ? `${profile.experienceYears} years experience` : ""]
        .filter(Boolean)
        .join(" · ");
      if (role) roleField.value = role;
    }
    refreshPreview();
  }, [profile]);

  const refreshPreview = () => {
    if (!formRef.current) return;
    setPreviewHtml(buildArticlePreviewHtml(readFormPreview(formRef.current, editorRef.current)));
  };

  const resolveCategoryId = (specialty: string): string => {
    const list = categories ?? [];
    const match = list.find((c) => c.name.toLowerCase() === specialty.toLowerCase());
    return match?.id ?? list[0]?.id ?? "";
  };

  const handleImage = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      showToast("⚠️ Image too large. Max 5MB.");
      return;
    }
    try {
      setUploadingImage(true);
      const url = await uploadFile(file, "drinsight/blog");
      setPreviewUrl(url);
      showToast("✓ Image uploaded successfully");
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewUrl(ev.target?.result as string);
        showToast("✓ Image added");
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
      refreshPreview();
    }
  };

  const handleSubmit = async (draft = false) => {
    const form = formRef.current;
    if (!form) return;
    const title = (form.elements.namedItem("artTitle") as HTMLInputElement).value.trim();
    const specialty = (form.elements.namedItem("artSpec") as HTMLSelectElement).value;
    const articleType = (form.elements.namedItem("artType") as HTMLSelectElement).value;
    const excerpt = (form.elements.namedItem("artAbstract") as HTMLTextAreaElement).value.trim();
    const content = editorRef.current?.getHtml() ?? "";
    const referenceUrl = (form.elements.namedItem("artRef") as HTMLInputElement).value.trim();
    const categoryId = resolveCategoryId(specialty);

    if (!title || !specialty || !articleType || !excerpt || !content || !referenceUrl || !categoryId) {
      showToast("⚠️ Please fill in all required fields");
      return;
    }

    const preview = readFormPreview(form, editorRef.current);
    const pointsRaw = (form.elements.namedItem("artPoints") as HTMLTextAreaElement).value.trim();
    const summaryPoints = pointsRaw
      .split("\n")
      .map((line) => line.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean);
    const tagsRaw = (form.elements.namedItem("artTags") as HTMLInputElement).value.trim();
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (articleType && !tags.includes(articleType)) tags.unshift(articleType);

    const coi = (form.elements.namedItem("artCOI") as HTMLSelectElement).value;
    const readTime = Number((form.elements.namedItem("artReadTime") as HTMLInputElement).value) || undefined;
    const publishedAt = (form.elements.namedItem("artPublished") as HTMLInputElement).value || undefined;

    setIsDraft(draft);
    try {
      await createPost.mutateAsync({
        title,
        slug: slugifyTitle(title),
        subtitle: preview.subtitle || undefined,
        excerpt,
        content,
        categoryId,
        specialty,
        coverImageUrl: previewUrl || undefined,
        tags,
        summaryPoints,
        keyTakeaways: summaryPoints,
        references: [{ text: referenceUrl, url: referenceUrl }],
        medicalDisclaimer: coi ? `${DEFAULT_ARTICLE_DISCLAIMER}\n\nConflict of interest: ${coi}` : DEFAULT_ARTICLE_DISCLAIMER,
        seoTitle: title,
        seoDescription: excerpt,
        metaKeywords: tags,
        status: "DRAFT",
        readTimeMinutes: readTime,
        publishedAt,
      });
      setSubmitted(true);
      showToast(draft ? "Saved as draft ✓" : "Article submitted for review ✓");
    } catch {
      showToast("⚠️ Failed to save article. Please try again.");
    } finally {
      setIsDraft(false);
    }
  };

  const initialPreview = useMemo(() => buildArticlePreviewHtml({
    title: "",
    subtitle: "",
    spec: "",
    type: "",
    audience: "",
    read: "8",
    tags: "",
    published: todayInput(),
    heroIcon: "🩺",
    authorName: "",
    authorCreds: "",
    authorRole: "",
    abstract: "",
    body: "",
    points: "",
    ref: "",
  }), []);

  if (submitted) {
    return (
      <>
        <DashPageHeader subtitle="👨‍⚕️ Physician Dashboard" title="Submit an Article" dateStr={todayFormatted()} />
        <DashCard title="✍️ New Article Submission">
          <div className="submit-success show">
            <div style={{ fontSize: "3.5rem", marginBottom: 14 }}>✅</div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--gray-900)", marginBottom: 8 }}>
              Article Submitted Successfully!
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--gray-600)", marginBottom: 20 }}>
              Your article has been sent to our editorial team. You&apos;ll receive a notification within 24–48 hours.
            </p>
            <button type="button" className="art-submit-btn" style={{ width: "auto", padding: "10px 24px" }} onClick={() => setSubmitted(false)}>
              ✍️ Submit Another Article
            </button>
          </div>
        </DashCard>
      </>
    );
  }

  return (
    <>
      <DashPageHeader subtitle="👨‍⚕️ Physician Dashboard" title="Submit an Article" dateStr={todayFormatted()} />

      <DashCard
        title="✍️ New Article Submission"
        headerExtra={<span style={{ fontSize: "0.76rem", color: "var(--gray-400)" }}>All submissions reviewed within 48 hours</span>}
      >
        <form
          ref={formRef}
          className="art-form"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit(false);
          }}
          onInput={refreshPreview}
        >
          <div className="pub-sec-lbl">📄 Article Details</div>
          <div className="form-group">
            <label htmlFor="artTitle">Article Title *</label>
            <input type="text" id="artTitle" name="artTitle" placeholder="e.g. Understanding Atrial Fibrillation in 2026" />
          </div>
          <div className="form-group">
            <label htmlFor="artSubtitle">
              Subtitle / Standfirst <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(one-line hook under the title)</span>
            </label>
            <input type="text" id="artSubtitle" name="artSubtitle" placeholder="A short, compelling summary line" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="artSpec">Medical Specialty *</label>
              <select id="artSpec" name="artSpec" defaultValue="">
                <option value="">Select specialty...</option>
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="artType">Article Type *</label>
              <select id="artType" name="artType" defaultValue="">
                <option value="">Select type...</option>
                {ARTICLE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="artAudience">Target Audience *</label>
              <select id="artAudience" name="artAudience" defaultValue="">
                <option value="">Select audience...</option>
                {AUDIENCES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="artReadTime">Reading Time (minutes) *</label>
              <input type="number" id="artReadTime" name="artReadTime" min={1} defaultValue={8} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="artTags">
              Tags <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(comma-separated — shown as topic chips)</span>
            </label>
            <input type="text" id="artTags" name="artTags" placeholder="e.g. Cardiology, Atrial Fibrillation, Stroke Prevention" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="artPublished">Published Date *</label>
              <input type="date" id="artPublished" name="artPublished" defaultValue={todayInput()} />
            </div>
            <div className="form-group">
              <label htmlFor="artHeroIcon">
                Hero Illustration (emoji) <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(cover banner)</span>
              </label>
              <input type="text" id="artHeroIcon" name="artHeroIcon" maxLength={4} defaultValue="🩺" style={{ maxWidth: 120 }} />
            </div>
          </div>

          <div className="pub-sec-lbl">👤 Author (Written by)</div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="artAuthorName">Author Name *</label>
              <input type="text" id="artAuthorName" name="artAuthorName" placeholder="Dr. Full Name" />
            </div>
            <div className="form-group">
              <label htmlFor="artAuthorCreds">Author Credentials</label>
              <input type="text" id="artAuthorCreds" name="artAuthorCreds" placeholder="e.g. MBBS, MD, FACC" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="artAuthorRole">Author Role / Experience</label>
            <input type="text" id="artAuthorRole" name="artAuthorRole" placeholder="e.g. Consultant Cardiologist · 15 years experience" />
          </div>
          <div className="prw-note-lite">
            ℹ️ The reviewing physician, peer-review status and last-reviewed date are added by the editorial team during review.
          </div>

          <div className="pub-sec-lbl">📝 Content</div>
          <div className="form-group">
            <label htmlFor="artAbstract">
              Article Abstract / Quick Summary * <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(200–400 words)</span>
            </label>
            <textarea
              id="artAbstract"
              name="artAbstract"
              rows={5}
              placeholder="Provide a concise summary of your article — key points, clinical relevance, and target readers."
            />
          </div>

          <div className="form-group">
            <label>
              📸 Featured Image <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(Upload a cover image for your article)</span>
            </label>
            <div
              className="feat-img-box"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("drag-over");
              }}
              onDragLeave={(e) => e.currentTarget.classList.remove("drag-over")}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("drag-over");
                const file = e.dataTransfer.files[0];
                if (file?.type.startsWith("image/")) void handleImage(file);
              }}
            >
              {!previewUrl ? (
                <div>
                  <div style={{ fontSize: "2.8rem", marginBottom: 10 }}>🖼️</div>
                  <div style={{ fontWeight: 700, color: "var(--gray-700)", marginBottom: 4, fontSize: "0.9rem" }}>
                    {uploadingImage ? "Uploading..." : "Upload Featured Image"}
                  </div>
                  <div style={{ fontSize: "0.77rem", color: "var(--gray-400)" }}>Click to browse or drag & drop · JPG, PNG, WebP · Max 5MB</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--gray-400)", marginTop: 4 }}>Recommended: 1200 × 630px (16:9 ratio)</div>
                </div>
              ) : (
                <>
                  <img src={previewUrl} alt="Featured preview" style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 8 }} />
                  <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 8 }}>
                    <button
                      type="button"
                      className="art-submit-btn draft"
                      style={{ width: "auto", padding: "7px 16px", fontSize: "0.76rem" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        fileRef.current?.click();
                      }}
                    >
                      🔄 Change
                    </button>
                    <button
                      type="button"
                      className="art-submit-btn draft"
                      style={{ width: "auto", padding: "7px 16px", fontSize: "0.76rem", color: "var(--red)", borderColor: "var(--red)" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewUrl(null);
                        if (fileRef.current) fileRef.current.value = "";
                        refreshPreview();
                      }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleImage(f);
              }}
            />
          </div>

          <div className="form-group">
            <label>
              📝 Article Content <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(Full article body — required)</span>
            </label>
            <ArticleRichTextEditor ref={editorRef} onChange={refreshPreview} />
          </div>

          <div className="form-group">
            <label htmlFor="artPoints">
              Key Clinical Points <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(one per line)</span>
            </label>
            <textarea id="artPoints" name="artPoints" rows={4} placeholder={"• Point 1\n• Point 2\n• Point 3"} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="artRef">Primary Reference (PubMed / DOI) *</label>
              <input type="url" id="artRef" name="artRef" placeholder="https://pubmed.ncbi.nlm.nih.gov/..." />
            </div>
            <div className="form-group">
              <label htmlFor="artWords">Estimated Word Count</label>
              <select id="artWords" name="artWords" defaultValue={WORD_RANGES[1]}>
                {WORD_RANGES.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="artCOI">Conflict of Interest Disclosure *</label>
            <select id="artCOI" name="artCOI" defaultValue="">
              <option value="">Select...</option>
              {COI_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div style={{ background: "#fffbeb", borderLeft: "4px solid var(--amber)", borderRadius: 6, padding: "12px 16px", fontSize: "0.8rem", color: "#92400e", lineHeight: 1.6 }}>
            ⚠️ <strong>Editorial Notice:</strong> All submitted articles undergo a multi-stage review process. By submitting, you confirm this is original work and you hold valid medical licensure. View our{" "}
            <a href="#" style={{ color: "var(--blue)", fontWeight: 600 }}>
              Editorial Policy →
            </a>
          </div>

          <div className="art-btn-row">
            <button type="button" className="art-submit-btn draft" disabled={createPost.isPending} onClick={() => void handleSubmit(true)}>
              {createPost.isPending && isDraft ? "Saving..." : "💾 Save as Draft"}
            </button>
            <button type="submit" className="art-submit-btn" disabled={createPost.isPending}>
              {createPost.isPending && !isDraft ? "Submitting..." : "📤 Submit for Review"}
            </button>
          </div>
        </form>

        <div style={{ marginTop: 22 }}>
          <div className="pubprev-lbl">👁 Live Preview — how your article appears on the public article page</div>
          <div className="pubprev-wrap" dangerouslySetInnerHTML={{ __html: previewHtml || initialPreview }} />
        </div>
      </DashCard>
    </>
  );
}
