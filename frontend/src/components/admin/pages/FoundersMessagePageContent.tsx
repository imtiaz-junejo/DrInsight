"use client";

import { useEffect, useRef, useState } from "react";
import {
  AdminButton,
  AdminPanel,
  FormGrid,
  FormItem,
  ToggleSwitch,
} from "@/components/admin/ui/AdminPrimitives";
import { uploadFile } from "@/lib/upload";
import { useAdminUiStore } from "@/store/admin-ui.store";
import {
  type FounderCredential,
  type FounderMessage,
  useAdminFounderMessage,
  useUpsertFounderMessage,
} from "@/services/admin-api-hooks";

type FounderForm = {
  founderName: string;
  designation: string;
  imageUrl: string;
  headline: string;
  messageHtml: string;
  signatureImageUrl: string;
  videoUrl: string;
  isActive: boolean;
  eyebrow: string;
  subline: string;
  badgeText: string;
  credentials: FounderCredential[];
  tags: string[];
  signatureName: string;
  signatureTitle: string;
  locationLine: string;
};

const EMPTY_FORM: FounderForm = {
  founderName: "",
  designation: "",
  imageUrl: "",
  headline: "",
  messageHtml: "",
  signatureImageUrl: "",
  videoUrl: "",
  isActive: true,
  eyebrow: "A Message from Our Founder",
  subline: "",
  badgeText: "✓ Verified MD",
  credentials: [],
  tags: [],
  signatureName: "",
  signatureTitle: "",
  locationLine: "",
};

function mapToForm(data: FounderMessage): FounderForm {
  return {
    founderName: data.founderName ?? "",
    designation: data.designation ?? "",
    imageUrl: data.imageUrl ?? "",
    headline: data.headline ?? "",
    messageHtml: data.messageHtml ?? "",
    signatureImageUrl: data.signatureImageUrl ?? "",
    videoUrl: data.videoUrl ?? "",
    isActive: data.isActive ?? true,
    eyebrow: data.eyebrow ?? "A Message from Our Founder",
    subline: data.subline ?? "",
    badgeText: data.badgeText ?? "✓ Verified MD",
    credentials: Array.isArray(data.credentials) ? data.credentials : [],
    tags: data.tags ?? [],
    signatureName: data.signatureName ?? "",
    signatureTitle: data.signatureTitle ?? "",
    locationLine: data.locationLine ?? "",
  };
}

export function FoundersMessagePageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const founderQuery = useAdminFounderMessage();
  const upsertMutation = useUpsertFounderMessage();
  const editorRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<FounderForm>(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState("");
  const [signaturePreview, setSignaturePreview] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (founderQuery.data) {
      const mapped = mapToForm(founderQuery.data);
      setForm(mapped);
      setImagePreview(mapped.imageUrl);
      setSignaturePreview(mapped.signatureImageUrl);
      if (editorRef.current) {
        editorRef.current.innerHTML = mapped.messageHtml;
      }
    }
  }, [founderQuery.data]);

  const syncEditor = () => {
    if (editorRef.current) {
      setForm((prev) => ({ ...prev, messageHtml: editorRef.current?.innerHTML ?? "" }));
    }
  };

  const execFmt = (command: string) => {
    document.execCommand(command, false);
    syncEditor();
  };

  const handleImageUpload = async (file: File | undefined, field: "imageUrl" | "signatureImageUrl") => {
    if (!file) return;
    try {
      setUploading(true);
      const url = await uploadFile(file, "drinsight/founder");
      if (field === "imageUrl") {
        setImagePreview(url);
        setForm((prev) => ({ ...prev, imageUrl: url }));
      } else {
        setSignaturePreview(url);
        setForm((prev) => ({ ...prev, signatureImageUrl: url }));
      }
      showToast("Image uploaded");
    } catch {
      showToast("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const addCredential = () => {
    syncEditor();
    setForm((prev) => ({
      ...prev,
      credentials: [...prev.credentials, { icon: "⭐", text: "New credential" }],
    }));
  };

  const removeCredential = (index: number) => {
    syncEditor();
    setForm((prev) => ({
      ...prev,
      credentials: prev.credentials.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    syncEditor();
    setForm((prev) => ({ ...prev, tags: [...prev.tags, "New tag"] }));
  };

  const removeTag = (index: number) => {
    syncEditor();
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    syncEditor();
    if (!form.founderName.trim()) {
      showToast("Founder name cannot be empty");
      return;
    }
    if (!form.headline.trim()) {
      showToast("Headline cannot be empty");
      return;
    }

    try {
      await upsertMutation.mutateAsync({
        founderName: form.founderName.trim(),
        designation: form.designation.trim(),
        imageUrl: form.imageUrl || undefined,
        headline: form.headline.trim(),
        messageHtml: form.messageHtml,
        signatureImageUrl: form.signatureImageUrl || undefined,
        videoUrl: form.videoUrl.trim() || undefined,
        isActive: form.isActive,
        eyebrow: form.eyebrow.trim() || undefined,
        subline: form.subline.trim() || undefined,
        badgeText: form.badgeText.trim() || undefined,
        credentials: form.credentials,
        tags: form.tags,
        signatureName: form.signatureName.trim() || undefined,
        signatureTitle: form.signatureTitle.trim() || undefined,
        locationLine: form.locationLine.trim() || undefined,
      });
      showToast("Founder's Message saved & published ✓");
    } catch {
      showToast("Failed to save founder message");
    }
  };

  if (founderQuery.isLoading) {
    return <p style={{ color: "var(--gray-500)" }}>Loading founder message...</p>;
  }

  return (
    <>
      <AdminPanel
        title="🩺 A Message from Our Founder"
        actions={
          <>
            <AdminButton onClick={() => window.open("/about", "_blank")}>👁 Preview Live Page</AdminButton>
            <AdminButton variant="primary" onClick={handleSave}>
              Save & Publish
            </AdminButton>
          </>
        }
        bodyClassName="panel-bd"
      >
        <p style={{ fontSize: "0.82rem", color: "var(--gray-600)" }}>
          Edit every part of the founder section shown on the public About page — photo, identity, credentials,
          expertise tags, the message itself, and the signature.
        </p>
        <div className="btn-row" style={{ marginTop: 12, alignItems: "center" }}>
          <span style={{ fontSize: "0.82rem", color: "var(--gray-600)" }}>Published on About page</span>
          <ToggleSwitch
            defaultChecked={form.isActive}
            onChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))}
          />
        </div>
      </AdminPanel>

      <AdminPanel title="🧑‍⚕️ Founder Photo & Identity" bodyClassName="panel-bd">
        <FormGrid>
          <FormItem label="Founder Photo" full>
            <div className="img-upload">
              <div className="img-thumb round lg">
                {imagePreview ? <img src={imagePreview} alt="" /> : "👨‍⚕️"}
              </div>
              <div className="img-upload-actions">
                <label className="upload-btn">
                  📁 Upload photo
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={(e) => handleImageUpload(e.target.files?.[0], "imageUrl")}
                  />
                </label>
                <span className="upload-hint">Square headshot recommended (shown as a circle).</span>
              </div>
            </div>
          </FormItem>
          <FormItem label="Verified Badge Text" full>
            <input
              value={form.badgeText}
              onChange={(e) => setForm((prev) => ({ ...prev, badgeText: e.target.value }))}
            />
          </FormItem>
          <FormItem label="Founder Name">
            <input
              value={form.founderName}
              onChange={(e) => setForm((prev) => ({ ...prev, founderName: e.target.value }))}
            />
          </FormItem>
          <FormItem label="Designation">
            <input
              value={form.designation}
              onChange={(e) => setForm((prev) => ({ ...prev, designation: e.target.value }))}
            />
          </FormItem>
          <FormItem label="Sub-line" full>
            <input
              value={form.subline}
              onChange={(e) => setForm((prev) => ({ ...prev, subline: e.target.value }))}
              placeholder="DrInsight — Est. 2018"
            />
          </FormItem>
        </FormGrid>
      </AdminPanel>

      <AdminPanel
        title="🎓 Credentials"
        actions={
          <AdminButton variant="primary" onClick={addCredential}>
            + Add Credential
          </AdminButton>
        }
        bodyClassName="panel-bd"
      >
        <div className="fg-item full" style={{ gap: 8 }}>
          {form.credentials.map((cred, index) => (
            <div key={index} className="repeat-item">
              <input
                style={{ maxWidth: 70, textAlign: "center" }}
                value={cred.icon}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    credentials: prev.credentials.map((item, i) =>
                      i === index ? { ...item, icon: e.target.value } : item,
                    ),
                  }))
                }
              />
              <input
                value={cred.text}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    credentials: prev.credentials.map((item, i) =>
                      i === index ? { ...item, text: e.target.value } : item,
                    ),
                  }))
                }
              />
              <button type="button" className="icon-btn-sm" title="Remove" onClick={() => removeCredential(index)}>
                🗑
              </button>
            </div>
          ))}
        </div>
      </AdminPanel>

      <AdminPanel
        title="🏷️ Expertise Tags"
        actions={
          <AdminButton variant="primary" onClick={addTag}>
            + Add Tag
          </AdminButton>
        }
        bodyClassName="panel-bd"
      >
        <div className="fg-item full" style={{ gap: 8 }}>
          {form.tags.map((tag, index) => (
            <div key={index} className="repeat-item">
              <input
                value={tag}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    tags: prev.tags.map((item, i) => (i === index ? e.target.value : item)),
                  }))
                }
              />
              <button type="button" className="icon-btn-sm" title="Remove" onClick={() => removeTag(index)}>
                🗑
              </button>
            </div>
          ))}
        </div>
      </AdminPanel>

      <AdminPanel title="💬 Message Content" bodyClassName="panel-bd">
        <FormGrid>
          <FormItem label="Eyebrow" full>
            <input value={form.eyebrow} onChange={(e) => setForm((prev) => ({ ...prev, eyebrow: e.target.value }))} />
          </FormItem>
          <FormItem label="Headline" full>
            <input value={form.headline} onChange={(e) => setForm((prev) => ({ ...prev, headline: e.target.value }))} />
          </FormItem>
          <FormItem label="Video URL (optional)" full>
            <input
              value={form.videoUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
              placeholder="https://youtube.com/..."
            />
          </FormItem>
        </FormGrid>
        <div className="fg-item full" style={{ marginTop: 12 }}>
          <label>
            Rich-text Message{" "}
            <span className="live-preview-note">(use toolbar for bold, lists, etc.)</span>
          </label>
          <div className="rte-toolbar" style={{ marginTop: 8 }}>
            <button type="button" className="rte-btn" onClick={() => execFmt("bold")}>
              <strong>B</strong>
            </button>
            <button type="button" className="rte-btn" onClick={() => execFmt("italic")}>
              <em>I</em>
            </button>
            <button type="button" className="rte-btn" onClick={() => execFmt("insertUnorderedList")}>
              • List
            </button>
          </div>
          <div
            ref={editorRef}
            className="rte-editor"
            contentEditable
            suppressContentEditableWarning
            onInput={syncEditor}
            style={{ minHeight: 180, marginTop: 8 }}
          />
        </div>
      </AdminPanel>

      <AdminPanel title="✍️ Signature" bodyClassName="panel-bd">
        <FormGrid>
          <FormItem label="Signature Image (optional)" full>
            <div className="img-upload">
              <div className="img-thumb">
                {signaturePreview ? <img src={signaturePreview} alt="" /> : "✍️"}
              </div>
              <div className="img-upload-actions">
                <label className="upload-btn">
                  📁 Upload signature
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={(e) => handleImageUpload(e.target.files?.[0], "signatureImageUrl")}
                  />
                </label>
              </div>
            </div>
          </FormItem>
          <FormItem label="Signature Name">
            <input
              value={form.signatureName}
              onChange={(e) => setForm((prev) => ({ ...prev, signatureName: e.target.value }))}
            />
          </FormItem>
          <FormItem label="Signature Title">
            <input
              value={form.signatureTitle}
              onChange={(e) => setForm((prev) => ({ ...prev, signatureTitle: e.target.value }))}
            />
          </FormItem>
          <FormItem label="Location / Website Line" full>
            <input
              value={form.locationLine}
              onChange={(e) => setForm((prev) => ({ ...prev, locationLine: e.target.value }))}
            />
          </FormItem>
        </FormGrid>
      </AdminPanel>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <AdminButton variant="primary" onClick={handleSave}>
          Save & Publish
        </AdminButton>
      </div>
    </>
  );
}
