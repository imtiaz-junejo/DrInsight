"use client";

import { useRef, useState } from "react";
import { DashCard, DashPageHeader } from "@/components/doctor/ui/DoctorPrimitives";
import { slugifyTitle } from "@/lib/blog-toc";
import { todayFormatted } from "@/lib/doctor-utils";
import { useBlogCategories } from "@/services/api-hooks";
import { useCreateBlogPost } from "@/services/doctor-api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

const DEFAULT_DISCLAIMER =
  "This article is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional regarding any medical condition.";

export function SubmitArticlePageContent() {
  const showToast = useDoctorUiStore((s) => s.showToast);
  const createPost = useCreateBlogPost();
  const { data: categories } = useBlogCategories();

  const [submitted, setSubmitted] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDraft, setIsDraft] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const execFmt = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val ?? undefined);
    updateWordCount();
  };

  const updateWordCount = () => {
    const text = editorRef.current?.innerText ?? "";
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
    setCharCount(text.length);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, draft = false) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem("artTitle") as HTMLInputElement).value.trim();
    const subtitle = (form.elements.namedItem("artSubtitle") as HTMLInputElement).value.trim();
    const categoryId = (form.elements.namedItem("artCategory") as HTMLSelectElement).value;
    const specialty = (form.elements.namedItem("artSpec") as HTMLSelectElement).value;
    const excerpt = (form.elements.namedItem("artAbstract") as HTMLTextAreaElement).value.trim();
    const content = editorRef.current?.innerHTML.trim() ?? "";
    const summaryRaw = (form.elements.namedItem("artPoints") as HTMLTextAreaElement).value.trim();
    const takeawaysRaw = (form.elements.namedItem("artTakeaways") as HTMLTextAreaElement).value.trim();
    const referenceUrl = (form.elements.namedItem("artRef") as HTMLInputElement).value.trim();
    const tagsRaw = (form.elements.namedItem("artTags") as HTMLInputElement).value.trim();
    const seoTitle = (form.elements.namedItem("artSeoTitle") as HTMLInputElement).value.trim();
    const seoDescription = (form.elements.namedItem("artSeoDesc") as HTMLTextAreaElement).value.trim();
    const coverImageAlt = (form.elements.namedItem("artCoverAlt") as HTMLInputElement).value.trim();
    const coverImageCaption = (form.elements.namedItem("artCoverCaption") as HTMLInputElement).value.trim();
    const disclaimer =
      (form.elements.namedItem("artDisclaimer") as HTMLTextAreaElement).value.trim() || DEFAULT_DISCLAIMER;

    if (!title || !categoryId || !specialty || !excerpt || !content || !referenceUrl) {
      showToast("⚠️ Please fill in all required fields");
      return;
    }

    const summaryPoints = summaryRaw
      .split("\n")
      .map((line) => line.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean);
    const keyTakeaways = takeawaysRaw
      .split("\n")
      .map((line) => line.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean);
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setIsDraft(draft);

    try {
      await createPost.mutateAsync({
        title,
        slug: slugifyTitle(title),
        subtitle: subtitle || undefined,
        excerpt,
        content,
        categoryId,
        specialty,
        coverImageUrl: previewUrl || undefined,
        coverImageAlt: coverImageAlt || undefined,
        coverImageCaption: coverImageCaption || undefined,
        tags,
        summaryPoints,
        keyTakeaways,
        references: [{ text: referenceUrl, url: referenceUrl }],
        medicalDisclaimer: disclaimer,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt,
        metaKeywords: tags,
        status: draft ? "DRAFT" : "DRAFT",
      });
      setSubmitted(true);
      showToast(draft ? "Saved as draft ✓" : "Article submitted for review ✓");
    } catch {
      showToast("⚠️ Failed to submit article. Please try again.");
    } finally {
      setIsDraft(false);
    }
  };

  const handleImage = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      showToast("⚠️ Image too large. Max 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviewUrl(ev.target?.result as string);
      showToast("✓ Image uploaded successfully");
    };
    reader.readAsDataURL(file);
  };

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
        <form ref={formRef} className="art-form" onSubmit={(e) => handleSubmit(e, false)}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="artTitle">Article Title *</label>
              <input type="text" id="artTitle" name="artTitle" placeholder="e.g. Understanding Atrial Fibrillation in 2026" />
            </div>
            <div className="form-group">
              <label htmlFor="artSubtitle">Subtitle</label>
              <input type="text" id="artSubtitle" name="artSubtitle" placeholder="A brief descriptive subtitle for the article header" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="artCategory">Category *</label>
              <select id="artCategory" name="artCategory" defaultValue="">
                <option value="">Select category...</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="artSpec">Medical Specialty *</label>
              <select id="artSpec" name="artSpec" defaultValue="">
                <option value="">Select specialty...</option>
                {categories?.map((cat) => (
                  <option key={cat.slug} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="artAbstract">
              Article Abstract / Excerpt * <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(shown in header & SEO)</span>
            </label>
            <textarea id="artAbstract" name="artAbstract" rows={4} placeholder="Provide a concise summary of your article..." />
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
                if (file?.type.startsWith("image/")) handleImage(file);
              }}
            >
              {!previewUrl ? (
                <div>
                  <div style={{ fontSize: "2.8rem", marginBottom: 10 }}>🖼️</div>
                  <div style={{ fontWeight: 700, color: "var(--gray-700)", marginBottom: 4, fontSize: "0.9rem" }}>Upload Featured Image</div>
                  <div style={{ fontSize: "0.77rem", color: "var(--gray-400)" }}>Click to browse or drag & drop · JPG, PNG, WebP · Max 5MB</div>
                </div>
              ) : (
                <>
                  <img src={previewUrl} alt="Featured preview" style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 8 }} />
                  <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 8 }}>
                    <button type="button" className="art-submit-btn draft" style={{ width: "auto", padding: "7px 16px", fontSize: "0.76rem" }} onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                      🔄 Change
                    </button>
                    <button type="button" className="art-submit-btn draft" style={{ width: "auto", padding: "7px 16px", fontSize: "0.76rem", color: "var(--red)", borderColor: "var(--red)" }} onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); if (fileRef.current) fileRef.current.value = ""; }}>
                      ✕ Remove
                    </button>
                  </div>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); }} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="artCoverAlt">Cover Image Alt Text</label>
              <input type="text" id="artCoverAlt" name="artCoverAlt" placeholder="Describe the cover image for accessibility" />
            </div>
            <div className="form-group">
              <label htmlFor="artCoverCaption">Cover Image Caption</label>
              <input type="text" id="artCoverCaption" name="artCoverCaption" placeholder="Image credit and caption shown below the hero image" />
            </div>
          </div>

          <div className="form-group">
            <label>
              📝 Article Content * <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(Full article body — use H2/H3 for sections)</span>
            </label>
            <div className="rte-wrap">
              <div className="rte-toolbar">
                <div className="rte-tb-group">
                  <select className="rte-select" defaultValue="" onChange={(e) => { if (e.target.value) execFmt("formatBlock", e.target.value); e.target.value = ""; }}>
                    <option value="">Paragraph</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                    <option value="h4">Heading 4</option>
                  </select>
                </div>
                <div className="rte-tb-group">
                  <button type="button" className="rte-btn" onClick={() => execFmt("bold")}><strong>B</strong></button>
                  <button type="button" className="rte-btn" onClick={() => execFmt("italic")}><em>I</em></button>
                  <button type="button" className="rte-btn" onClick={() => execFmt("underline")}><u>U</u></button>
                </div>
                <div className="rte-tb-group">
                  <button type="button" className="rte-btn" onClick={() => execFmt("insertUnorderedList")}>• List</button>
                  <button type="button" className="rte-btn" onClick={() => execFmt("insertOrderedList")}>1. List</button>
                </div>
                <div className="rte-tb-group rte-wordcount-wrap">
                  <span className="rte-wc-label">
                    Words: <strong>{wordCount}</strong>
                  </span>
                </div>
              </div>
              <div
                ref={editorRef}
                className="rte-editor"
                contentEditable
                suppressContentEditableWarning
                onInput={updateWordCount}
                data-placeholder="Start writing your full article here..."
              />
              <div className="rte-footer">
                <span style={{ fontSize: "0.72rem", color: "var(--gray-400)" }}>💡 Use Heading 2 for main sections, Heading 3 for subsections.</span>
                <span style={{ fontSize: "0.72rem", color: "var(--gray-400)" }}>{charCount} characters</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="artPoints">Summary Points — What Readers Will Learn <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(one per line)</span></label>
            <textarea id="artPoints" name="artPoints" rows={4} placeholder={"• Point 1\n• Point 2\n• Point 3"} />
          </div>
          <div className="form-group">
            <label htmlFor="artTakeaways">Key Takeaways <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(one per line)</span></label>
            <textarea id="artTakeaways" name="artTakeaways" rows={4} placeholder={"• Takeaway 1\n• Takeaway 2"} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="artRef">Primary Reference (PubMed / DOI) *</label>
              <input type="url" id="artRef" name="artRef" placeholder="https://pubmed.ncbi.nlm.nih.gov/..." />
            </div>
            <div className="form-group">
              <label htmlFor="artTags">Tags <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(comma-separated)</span></label>
              <input type="text" id="artTags" name="artTags" placeholder="migraine, neurology, headache" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="artSeoTitle">SEO Title</label>
              <input type="text" id="artSeoTitle" name="artSeoTitle" placeholder="Custom title for search engines (defaults to article title)" />
            </div>
            <div className="form-group">
              <label htmlFor="artSeoDesc">Meta Description</label>
              <textarea id="artSeoDesc" name="artSeoDesc" rows={2} placeholder="Short description for search engine results" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="artDisclaimer">Medical Disclaimer</label>
            <textarea id="artDisclaimer" name="artDisclaimer" rows={3} defaultValue={DEFAULT_DISCLAIMER} />
          </div>

          <div style={{ background: "#fffbeb", borderLeft: "4px solid var(--amber)", borderRadius: 6, padding: "12px 16px", fontSize: "0.8rem", color: "#92400e", lineHeight: 1.6 }}>
            ⚠️ <strong>Editorial Notice:</strong> All submitted articles undergo a multi-stage review process. By submitting, you confirm this is original work and you hold valid medical licensure.
          </div>
          <div className="art-btn-row">
            <button
              type="button"
              className="art-submit-btn draft"
              disabled={createPost.isPending}
              onClick={() => {
                if (formRef.current) {
                  handleSubmit({ preventDefault: () => undefined, currentTarget: formRef.current } as React.FormEvent<HTMLFormElement>, true);
                }
              }}
            >
              {createPost.isPending && isDraft ? "Saving..." : "💾 Save as Draft"}
            </button>
            <button type="submit" className="art-submit-btn" disabled={createPost.isPending}>
              {createPost.isPending && !isDraft ? "Submitting..." : "📤 Submit for Review"}
            </button>
          </div>
        </form>
      </DashCard>
    </>
  );
}
