"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { validateImageFile } from "@/lib/upload";

export function ProfileImageUpload({
  previewUrl,
  fallbackLabel,
  disabled = false,
  onFileSelect,
  onRemove,
  error,
}: {
  previewUrl: string | null;
  fallbackLabel: string;
  disabled?: boolean;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setLocalError(null);
  }, [previewUrl]);

  const handleFile = (file: File) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setLocalError(null);
    onFileSelect(file);
  };

  const displayError = error ?? localError;

  return (
    <div className="cp-profile-upload">
      <div className={cn("cp-avatar-pic", previewUrl && "has-image")}>
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Profile preview" />
        ) : (
          fallbackLabel
        )}
      </div>
      <div className="cp-profile-upload-actions">
        <button
          type="button"
          className="cp-upload-btn"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          {previewUrl ? "Change photo" : "Upload photo"}
        </button>
        {previewUrl && (
          <button type="button" className="cp-upload-btn cp-upload-btn-muted" disabled={disabled} onClick={onRemove}>
            Remove
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      {displayError && <p className="cp-upload-error">{displayError}</p>}
    </div>
  );
}
