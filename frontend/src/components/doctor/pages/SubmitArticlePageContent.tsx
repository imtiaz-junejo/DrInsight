"use client";

import { useRef, useState } from "react";
import { DashCard, DashPageHeader } from "@/components/doctor/ui/DoctorPrimitives";
import { todayFormatted } from "@/lib/doctor-utils";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

export function SubmitArticlePageContent() {
  const showToast = useDoctorUiStore((s) => s.showToast);
  const [submitted, setSubmitted] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const required = ["artTitle", "artSpec", "artAudience", "artType", "artAbstract", "artRef", "artCOI"] as const;
    for (const id of required) {
      const el = form.elements.namedItem(id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
      if (!el?.value.trim()) {
        showToast("⚠️ Please fill in all required fields");
        return;
      }
    }
    setSubmitted(true);
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
        <form className="art-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="artTitle">Article Title *</label>
              <input type="text" id="artTitle" name="artTitle" placeholder="e.g. Understanding Atrial Fibrillation in 2026" />
            </div>
            <div className="form-group">
              <label htmlFor="artSpec">Medical Specialty *</label>
              <select id="artSpec" name="artSpec" defaultValue="">
                <option value="">Select specialty...</option>
                {["Cardiology", "Neurology", "Endocrinology", "Gastroenterology", "Internal Medicine"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="artAudience">Target Audience *</label>
              <select id="artAudience" name="artAudience" defaultValue="">
                <option value="">Select audience...</option>
                <option>General Public / Patients</option>
                <option>Healthcare Professionals</option>
                <option>Both (Patient + Professional)</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="artType">Article Type *</label>
              <select id="artType" name="artType" defaultValue="">
                <option value="">Select type...</option>
                <option>Clinical Overview</option>
                <option>Drug / Medication Guide</option>
                <option>Patient Education</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="artAbstract">
              Article Abstract / Summary * <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(200–400 words)</span>
            </label>
            <textarea id="artAbstract" name="artAbstract" rows={5} placeholder="Provide a concise summary of your article..." />
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

          <div className="form-group">
            <label>
              📝 Article Content <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(Full article body — required)</span>
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
                <span style={{ fontSize: "0.72rem", color: "var(--gray-400)" }}>💡 Tip: Use Heading 2 for main sections, Heading 3 for subsections.</span>
                <span style={{ fontSize: "0.72rem", color: "var(--gray-400)" }}>{charCount} characters</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="artPoints">Key Clinical Points <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(one per line)</span></label>
            <textarea id="artPoints" name="artPoints" rows={4} placeholder={"• Point 1\n• Point 2\n• Point 3"} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="artRef">Primary Reference (PubMed / DOI) *</label>
              <input type="url" id="artRef" name="artRef" placeholder="https://pubmed.ncbi.nlm.nih.gov/..." />
            </div>
            <div className="form-group">
              <label htmlFor="artWords">Estimated Word Count</label>
              <select id="artWords" name="artWords">
                <option>1,000–1,500 words</option>
                <option>1,500–2,500 words</option>
                <option>2,500–4,000 words</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="artCOI">Conflict of Interest Disclosure *</label>
            <select id="artCOI" name="artCOI" defaultValue="">
              <option value="">Select...</option>
              <option>None — I have no conflicts of interest related to this article</option>
              <option>Pharmaceutical — I have received funding / honoraria from a pharma company</option>
            </select>
          </div>
          <div style={{ background: "#fffbeb", borderLeft: "4px solid var(--amber)", borderRadius: 6, padding: "12px 16px", fontSize: "0.8rem", color: "#92400e", lineHeight: 1.6 }}>
            ⚠️ <strong>Editorial Notice:</strong> All submitted articles undergo a multi-stage review process. By submitting, you confirm this is original work and you hold valid medical licensure.
          </div>
          <div className="art-btn-row">
            <button type="button" className="art-submit-btn draft" onClick={() => showToast("Saved as draft ✓")}>
              💾 Save as Draft
            </button>
            <button type="submit" className="art-submit-btn">
              📤 Submit for Review
            </button>
          </div>
        </form>
      </DashCard>
    </>
  );
}
