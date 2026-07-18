"use client";

import { useRef, useState } from "react";

export function SeoImageUpload({
  value,
  onChange,
  onUpload,
}: {
  value: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<string>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await onUpload(file);
      onChange(url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="di-upload"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      role="button"
      tabIndex={0}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) void handleFile(file);
      }}
    >
      {!value ? <div className="di-upload-emoji">🖼️</div> : null}
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" />
      ) : null}
      <div className="di-upload-title">{uploading ? "Uploading…" : "Click to upload an image"}</div>
      <div className="di-upload-hint">PNG, JPG, WEBP · up to ~2 MB</div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
    </div>
  );
}
