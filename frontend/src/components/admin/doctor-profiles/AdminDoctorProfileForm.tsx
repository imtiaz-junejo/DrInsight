"use client";

import { useCallback, useRef, type ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import {
  AWARD_ICONS,
  BOARD_CERT_ICONS,
  LECTURE_TYPES,
} from "@/components/doctor/pages/ProfileTextPickers";
import { charCountLabel } from "@/components/admin/site-management/seo-settings-utils";
import { ArticleRichTextField } from "@/components/editor/ArticleRichTextField";
import { serpPreview } from "@/lib/admin-doctor-seo";
import type { AdminDoctorProfileFormValues } from "@/lib/admin-doctor-profile-schema";
import type { DoctorProfile } from "@/services/api-hooks";

function AdminPipeTextArea({
  value,
  onChange,
  rows = 4,
  picker,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  picker: (insertAtCursor: (text: string) => void) => ReactNode;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = useCallback(
    (text: string) => {
      const textarea = textareaRef.current;
      if (!textarea) {
        onChange(`${value}${text}`);
        return;
      }

      const start = textarea.selectionStart ?? value.length;
      const end = textarea.selectionEnd ?? value.length;
      const next = `${value.slice(0, start)}${text}${value.slice(end)}`;
      const cursor = start + text.length;

      onChange(next);

      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(cursor, cursor);
      });
    },
    [onChange, value],
  );

  return (
    <>
      {picker(insertAtCursor)}
      <textarea ref={textareaRef} rows={rows} value={value} onChange={(event) => onChange(event.target.value)} />
    </>
  );
}

function IconPicker({
  icons,
  hint,
  onPick,
}: {
  icons: readonly string[];
  hint: string;
  onPick: (icon: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        alignItems: "center",
        marginBottom: 8,
        padding: 8,
        background: "var(--gray-50)",
        border: "1px solid var(--gray-200)",
        borderRadius: 8,
      }}
    >
      <span style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--gray-500)", marginRight: 2 }}>Icon:</span>
      {icons.map((icon) => (
        <button
          key={icon}
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onPick(icon)}
          title={`Start a new line with ${icon}`}
          style={{
            width: 30,
            height: 30,
            border: "1.5px solid var(--gray-200)",
            background: "#fff",
            borderRadius: 7,
            fontSize: ".95rem",
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          {icon}
        </button>
      ))}
      <span style={{ fontSize: ".7rem", color: "var(--gray-400)", marginLeft: 6 }}>
        tap to start a line, then type {hint}
      </span>
    </div>
  );
}

function TypePicker({ onPick }: { onPick: (line: string) => void }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        alignItems: "center",
        marginBottom: 8,
        padding: 8,
        background: "var(--gray-50)",
        border: "1px solid var(--gray-200)",
        borderRadius: 8,
      }}
    >
      <span style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--gray-500)", marginRight: 2 }}>Type:</span>
      {LECTURE_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onPick(`Talk Title|Venue|${type}|2026`)}
          style={{
            padding: "5px 12px",
            border: "1.5px solid var(--gray-200)",
            background: "#fff",
            borderRadius: 50,
            fontSize: ".72rem",
            fontWeight: 700,
            color: "var(--gray-700)",
            cursor: "pointer",
          }}
        >
          {type}
        </button>
      ))}
      <span style={{ fontSize: ".7rem", color: "var(--gray-400)", marginLeft: 6 }}>
        tap a type to add a templated line, then edit it
      </span>
    </div>
  );
}

export function AdminDoctorProfileForm({
  doctor,
  onAvatarChange,
}: {
  doctor: DoctorProfile;
  onAvatarChange: (file: File) => Promise<void>;
}) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<AdminDoctorProfileFormValues>();

  const values = watch();
  const setField = (name: keyof AdminDoctorProfileFormValues, value: string) =>
    setValue(name, value, { shouldDirty: true });
  const metaTitleCount = charCountLabel(values.metaTitle ?? "", 60);
  const metaDescCount = charCountLabel(values.metaDesc ?? "", 160);
  const serp = serpPreview(values.metaTitle ?? "", values.metaDesc ?? "", values.seoUrl ?? "");

  return (
    <>
    <div
      style={{
        background: "#fffbeb",
        border: "1.5px solid var(--amber)",
        borderRadius: 10,
        padding: "12px 14px",
        marginBottom: 14,
        fontSize: ".8rem",
        color: "#92400e",
        lineHeight: 1.55,
      }}
    >
      ✏️ <strong>Editing the doctor&apos;s profile page.</strong> Content changes update the live preview on the
      right. Scroll down for the SEO &amp; Metadata block. Click <strong>Save Doctor SEO</strong> to publish.
      </div>
    <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 16 }}>
      <div className="fg-item" style={{ gridColumn: "1 / -1" }}>
        <label>
          Profile Photo{" "}
          <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>
            (hero image — shown as a circle on the public profile)
          </span>
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 66,
              height: 66,
              borderRadius: "50%",
              overflow: "hidden",
              background: "var(--gray-100)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.7rem",
              flex: "0 0 auto",
              border: "2px solid var(--gray-200)",
            }}
          >
            {values.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={values.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              values.photoIcon || "👨‍⚕️"
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            style={{ fontSize: ".82rem" }}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              await onAvatarChange(file);
            }}
          />
          {values.avatarUrl ? (
            <button type="button" className="btn danger" style={{ padding: "5px 12px", fontSize: ".74rem" }} onClick={() => setValue("avatarUrl", "")}>
              Remove
            </button>
          ) : null}
        </div>
      </div>

      {[
        ["fullName", "Full Name"],
        ["credentials", "Credentials (e.g. MBBS · MD · MRCP)"],
        ["specialty", "Specialty"],
        ["specLabel", "Specialty Badge (emoji + label)"],
        ["photoIcon", "Profile Icon (emoji)"],
        ["experience", "Years of Experience"],
      ].map(([name, label]) => (
        <div className="fg-item" key={name}>
          <label>{label}</label>
          <input {...register(name as keyof AdminDoctorProfileFormValues)} />
          {errors[name as keyof AdminDoctorProfileFormValues] ? (
            <span style={{ color: "var(--red)", fontSize: ".72rem" }}>
              {errors[name as keyof AdminDoctorProfileFormValues]?.message as string}
            </span>
          ) : null}
        </div>
      ))}

      <div className="fg-item" style={{ gridColumn: "1 / -1" }}>
        <label>Professional Title / Headline</label>
        <input {...register("title")} />
      </div>

      {[
        ["institution", "Institution / Hospital"],
        ["location", "Location"],
        ["email", "Public Contact Email"],
        ["phone", "Contact Phone"],
        ["license", "Medical License"],
        ["regBody", "Regulatory Body"],
        ["languages", "Languages (comma-separated)"],
        ["responseTime", "Response Time"],
      ].map(([name, label]) => (
        <div className="fg-item" key={name}>
          <label>{label}</label>
          <input {...register(name as keyof AdminDoctorProfileFormValues)} />
        </div>
      ))}

      <div className="fg-item" style={{ gridColumn: "1 / -1" }}>
        <label>
          Expertise <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(comma-separated)</span>
        </label>
        <input {...register("expertise")} />
      </div>

      {[
        ["bioShort", "Short Bio", 3],
        ["education", "Education & Training", 4],
      ].map(([name, label, rows]) => (
        <div className="fg-item" style={{ gridColumn: "1 / -1" }} key={name}>
          <label>
            {label}
            {name === "education" ? (
              <span style={{ fontWeight: 400, color: "var(--gray-400)" }}> (one per line)</span>
            ) : null}
          </label>
          <textarea rows={rows as number} {...register(name as keyof AdminDoctorProfileFormValues)} />
        </div>
      ))}

      <div className="fg-item art-content-card" style={{ gridColumn: "1 / -1" }}>
        <label>Full Biography</label>
        <ArticleRichTextField
          value={values.bioFull ?? ""}
          onChange={(html) => setValue("bioFull", html)}
          placeholder="Write the doctor's full professional biography here..."
        />
      </div>

      <div className="fg-item" style={{ gridColumn: "1 / -1", marginTop: 8, borderTop: "1.5px dashed var(--gray-200)", paddingTop: 16 }}>
        <label style={{ fontFamily: "var(--font-d)", fontSize: ".95rem", color: "var(--gray-800)" }}>
          🏅 Board Certifications, Awards & Speaking
        </label>
        <div style={{ fontSize: ".75rem", color: "var(--gray-400)", marginTop: 2 }}>
          Doctor-filled from the physician dashboard — reviewable here.
        </div>
      </div>

      <div className="fg-item" style={{ gridColumn: "1 / -1" }}>
        <label>
          Board Certifications & Professional Memberships{" "}
          <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(one per line — icon|Title|Detail)</span>
        </label>
        <AdminPipeTextArea
          value={values.boardCerts ?? ""}
          onChange={(value) => setField("boardCerts", value)}
          picker={(insertAtCursor) => (
            <IconPicker
              icons={BOARD_CERT_ICONS}
              hint="Title|Detail"
              onPick={(icon) => insertAtCursor(`${icon}|`)}
            />
          )}
        />
      </div>

      <div className="fg-item" style={{ gridColumn: "1 / -1" }}>
        <label>
          Awards & Honors{" "}
          <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(one per line — icon|Title|Organization|Year)</span>
        </label>
        <AdminPipeTextArea
          value={values.awards ?? ""}
          onChange={(value) => setField("awards", value)}
          picker={(insertAtCursor) => (
            <IconPicker
              icons={AWARD_ICONS}
              hint="Title|Organization|Year"
              onPick={(icon) => insertAtCursor(`${icon}|`)}
            />
          )}
        />
      </div>

      <div className="fg-item" style={{ gridColumn: "1 / -1" }}>
        <label>
          Lectures, Conferences & Teaching{" "}
          <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(one per line — Title|Venue|Type|Year)</span>
        </label>
        <AdminPipeTextArea
          value={values.lectures ?? ""}
          onChange={(value) => setField("lectures", value)}
          picker={(insertAtCursor) => (
            <TypePicker onPick={(line) => insertAtCursor(`${line}\n`)} />
          )}
        />
      </div>

      <div className="fg-item" style={{ gridColumn: "1 / -1", marginTop: 8, borderTop: "1.5px dashed var(--gray-200)", paddingTop: 16 }}>
        <label style={{ fontFamily: "var(--font-d)", fontSize: ".95rem", color: "var(--gray-800)" }}>
          💰 Conflict of Interest Disclosure{" "}
          <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(admin-controlled)</span>
        </label>
      </div>
      <div className="fg-item" style={{ gridColumn: "1 / -1" }}>
        <label>Declaration Statement</label>
        <textarea rows={3} {...register("coiDeclaration")} />
      </div>
      <div className="fg-item">
        <label>Disclosure Last Updated</label>
        <input {...register("coiUpdated")} />
      </div>

      <div className="fg-item" style={{ gridColumn: "1 / -1", marginTop: 8, borderTop: "1.5px dashed var(--gray-200)", paddingTop: 16 }}>
        <label style={{ fontFamily: "var(--font-d)", fontSize: ".95rem", color: "var(--gray-800)" }}>
          ✍️ Role at DrInsight <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(admin-controlled)</span>
        </label>
      </div>
      <div className="fg-item">
        <label>Author Since</label>
        <input {...register("roleAuthorSince")} />
      </div>
      <div className="fg-item">
        <label>Editorial Board Status</label>
        <input {...register("roleEditorialBoard")} />
      </div>
      <div className="fg-item" style={{ gridColumn: "1 / -1" }}>
        <label>
          Medical Reviewer For <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(comma-separated)</span>
        </label>
        <input {...register("roleReviewerFor")} />
      </div>

      <div className="fg-item" style={{ gridColumn: "1 / -1", marginTop: 8, borderTop: "1.5px dashed var(--gray-200)", paddingTop: 16 }}>
        <label style={{ fontFamily: "var(--font-d)", fontSize: ".95rem", color: "var(--gray-800)" }}>🔗 Social Media Links</label>
      </div>
      {[
        ["facebook", "Facebook URL"],
        ["twitter", "Twitter / X URL"],
        ["youtube", "YouTube URL"],
        ["instagram", "Instagram URL"],
        ["linkedin", "LinkedIn URL"],
      ].map(([name, label]) => (
        <div className="fg-item" key={name}>
          <label>{label}</label>
          <input {...register(name as keyof AdminDoctorProfileFormValues)} />
        </div>
      ))}

      <div className="fg-item" style={{ gridColumn: "1 / -1", marginTop: 8, borderTop: "1.5px dashed var(--gray-200)", paddingTop: 16 }}>
        <label style={{ fontFamily: "var(--font-d)", fontSize: ".95rem", color: "var(--gray-800)" }}>🔍 SEO &amp; Metadata</label>
        <div style={{ fontSize: ".75rem", color: "var(--gray-400)", marginTop: 2 }}>
          Pre-filled automatically from the profile. Edit any field to override — the search preview and Physician JSON-LD
          schema rebuild live.
        </div>
      </div>
      <div className="fg-item">
        <label>Focus Keyword</label>
        <input {...register("seoFocus")} placeholder="e.g. consultant neurologist" />
      </div>
      <div className="fg-item">
        <label>
          Secondary Keywords <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(comma-separated)</span>
        </label>
        <input {...register("seoSecondary")} />
      </div>
      <div className="fg-item">
        <label>
          Meta Title{" "}
          <span style={{ fontWeight: 400, color: metaTitleCount.color }}>{metaTitleCount.text}</span>
        </label>
        <input {...register("metaTitle")} placeholder="≤ 60 characters" />
      </div>
      <div className="fg-item" style={{ gridColumn: "1 / -1" }}>
        <label>
          Meta Description{" "}
          <span style={{ fontWeight: 400, color: metaDescCount.color }}>{metaDescCount.text}</span>
        </label>
        <textarea rows={2} {...register("metaDesc")} placeholder="≤ 160 characters" />
      </div>
      <div className="fg-item" style={{ gridColumn: "1 / -1" }}>
        <label>
          Page URL <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(canonical link)</span>
        </label>
        <input {...register("seoUrl")} />
      </div>
      <div className="fg-item" style={{ gridColumn: "1 / -1" }}>
        <label>Search Preview</label>
        <div
          style={{
            border: "1.5px solid var(--gray-200)",
            borderRadius: 8,
            padding: "12px 14px",
            background: "#fff",
          }}
        >
          <div style={{ color: "#1a0dab", fontSize: "1.02rem", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {serp.title}
          </div>
          <div style={{ color: "#006621", fontSize: ".78rem", margin: "2px 0" }}>{serp.crumb}</div>
          <div style={{ color: "#4d5156", fontSize: ".82rem", lineHeight: 1.45 }}>{serp.description}</div>
        </div>
      </div>
      <div className="fg-item" style={{ gridColumn: "1 / -1" }}>
        <label>
          Schema Markup (JSON-LD){" "}
          <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>— auto-generated · Physician</span>
        </label>
        <textarea rows={8} className="di-code" {...register("schema")} />
      </div>
    </div>
    </>
  );
}
