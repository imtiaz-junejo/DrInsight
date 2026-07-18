"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { validateLicenseCertificateFile } from "@/lib/upload";

export function DocumentUploadField({
  label,
  previewUrl,
  fileName,
  disabled = false,
  onFileSelect,
  onRemove,
  hint = "JPG, PNG, WEBP, or PDF · up to 8 MB",
}: {
  label: string;
  previewUrl: string | null;
  fileName?: string | null;
  disabled?: boolean;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const isPdf = previewUrl?.toLowerCase().includes(".pdf") || fileName?.toLowerCase().endsWith(".pdf");

  const handleFile = (file: File) => {
    const validationError = validateLicenseCertificateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onFileSelect(file);
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div
        className={cn("cp-doc-upload", disabled && "disabled")}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) inputRef.current?.click();
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
      >
        {previewUrl && !isPdf ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Certificate preview" className="cp-doc-preview" />
        ) : previewUrl && isPdf ? (
          <div className="cp-doc-pdf">📄 {fileName || "PDF document"}</div>
        ) : (
          <div className="cp-doc-placeholder">
            <span>📎</span>
            <div>Click to upload certificate</div>
            <small>{hint}</small>
          </div>
        )}
      </div>
      {previewUrl && (
        <div className="cp-profile-upload-actions">
          <button
            type="button"
            className="cp-upload-btn"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            Replace
          </button>
          <button type="button" className="cp-upload-btn cp-upload-btn-muted" disabled={disabled} onClick={onRemove}>
            Remove
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      {error && <p className="cp-upload-error">{error}</p>}
    </div>
  );
}
