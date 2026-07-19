"use client";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  BadgeCheck,
  BookOpenText,
  CircleUserRound,
  DoctorIcon,
  DoctorIconInline,
  FileText,
  Globe,
  Link,
  MessageSquare,
  Pencil,
  PhysicianDashboardLabel,
  Save,
  Star,
  Stethoscope,
} from "@/components/doctor/icons/DoctorIcons";
import {
  DashButton,
  DashCard,
  DashPageHeader,
  GridTwo,
  ProfileRow,
} from "@/components/doctor/ui/DoctorPrimitives";
import {
  displayDob,
  emptyDoctorProfileForm,
  formToDoctorPayload,
  formToUserPayload,
  memberSinceLabel,
  profileToForm,
  type DoctorProfileFormState,
} from "@/lib/doctor-profile-form";
import { todayFormatted } from "@/lib/doctor-utils";
import { uploadFile, validateImageFile } from "@/lib/upload";
import type {
  DoctorAwardItem,
  DoctorCertificationItem,
  DoctorSpeakingItem,
} from "@/services/api-hooks";
import {
  useDoctorProfile,
  useUpdateDoctorProfile,
  useUpdateDoctorUser,
} from "@/services/doctor-api-hooks";
import { useAuthProfile } from "@/services/patient-api-hooks";
import { useAuthStore } from "@/store/auth.store";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

function FormField({
  label,
  hint,
  full,
  children,
}: {
  label: string;
  hint?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`dp-form-field${full ? " full" : ""}`}>
      <label>
        {label}
        {hint ? <span> {hint}</span> : null}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  type = "text",
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function TextArea({
  value,
  onChange,
  rows = 3,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />;
}

function ChipList({ items }: { items: string[] }) {
  if (!items.length) {
    return <span style={{ color: "var(--gray-400)", fontSize: "0.82rem" }}>None added</span>;
  }
  return (
    <>
      {items.map((item) => (
        <span key={item} className="dp-chip">
          {item}
        </span>
      ))}
    </>
  );
}

function LineList({ items }: { items: string[] }) {
  if (!items.length) {
    return <span style={{ color: "var(--gray-400)", fontSize: "0.82rem" }}>None added</span>;
  }
  return (
    <>
      {items.map((item) => (
        <div key={item} className="dp-line-item">
          {item}
        </div>
      ))}
    </>
  );
}

function CertGrid({ items }: { items: DoctorCertificationItem[] }) {
  if (!items.length) {
    return <span style={{ color: "var(--gray-400)", fontSize: "0.82rem" }}>None added</span>;
  }
  return (
    <div className="dp-cert-grid">
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="dp-cert-item">
          <div className="ico">
            <DoctorIcon icon={BadgeCheck} size="button" />
          </div>
          <div className="title">{item.title}</div>
          {item.subtitle ? <div className="sub">{item.subtitle}</div> : null}
        </div>
      ))}
    </div>
  );
}

function AwardList({ items }: { items: DoctorAwardItem[] }) {
  if (!items.length) {
    return <span style={{ color: "var(--gray-400)", fontSize: "0.82rem" }}>None added</span>;
  }
  return (
    <>
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="dp-list-item">
          <span className="ico">
            <DoctorIcon icon={Star} size="sm" />
          </span>
          <div>
            <div className="title">{item.title}</div>
            <div className="sub">
              {[item.organization, item.year].filter(Boolean).join(" · ")}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function SpeakingList({ items }: { items: DoctorSpeakingItem[] }) {
  if (!items.length) {
    return <span style={{ color: "var(--gray-400)", fontSize: "0.82rem" }}>None added</span>;
  }
  return (
    <>
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="dp-list-item">
          <span className="ico">
            <DoctorIcon icon={MessageSquare} size="sm" />
          </span>
          <div>
            <div className="title">{item.title}</div>
            <div className="sub">
              {[item.venue, item.type, item.year].filter(Boolean).join(" · ")}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function SocialLinks({
  facebook,
  twitter,
  youtube,
  instagram,
  linkedin,
}: {
  facebook?: string | null;
  twitter?: string | null;
  youtube?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
}) {
  const links = [
    ["Facebook", facebook],
    ["Twitter / X", twitter],
    ["YouTube", youtube],
    ["Instagram", instagram],
    ["LinkedIn", linkedin],
  ].filter(([, url]) => Boolean(url)) as Array<[string, string]>;

  if (!links.length) {
    return <span style={{ color: "var(--gray-400)", fontSize: "0.82rem" }}>No social links added</span>;
  }

  return (
    <>
      {links.map(([label, url]) => (
        <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="dp-social-link">
          <DoctorIconInline icon={Link} size="sm">
            {label}
          </DoctorIconInline>
        </a>
      ))}
    </>
  );
}

export function ProfilePageContent() {
  const user = useAuthStore((s) => s.user);
  const showToast = useDoctorUiStore((s) => s.showToast);
  const authProfileQuery = useAuthProfile();
  const doctorProfileQuery = useDoctorProfile();
  const updateDoctorProfile = useUpdateDoctorProfile();
  const updateDoctorUser = useUpdateDoctorUser();

  const authProfile = authProfileQuery.data;
  const doctorProfile = doctorProfileQuery.data;
  const loading = authProfileQuery.isLoading || doctorProfileQuery.isLoading;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<DoctorProfileFormState>(emptyDoctorProfileForm);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [saving, setSaving] = useState(false);

  const savedAvatarUrl =
    authProfile?.avatarUrl ?? doctorProfile?.user?.avatarUrl ?? user?.avatarUrl ?? null;
  const displayAvatarUrl = avatarRemoved ? null : avatarPreview ?? savedAvatarUrl;

  const syncForm = useCallback(() => {
    if (!doctorProfile) return;
    setForm(
      profileToForm(doctorProfile, {
        email: authProfile?.email ?? user?.email,
        phone: authProfile?.phone ?? user?.phone,
        firstName: authProfile?.firstName ?? user?.firstName,
        lastName: authProfile?.lastName ?? user?.lastName,
      }),
    );
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarRemoved(false);
  }, [authProfile, doctorProfile, user]);

  useEffect(() => {
    if (doctorProfile && !editing) syncForm();
  }, [doctorProfile, authProfile, editing, syncForm]);

  const patchForm = <K extends keyof DoctorProfileFormState>(key: K, value: DoctorProfileFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      showToast(validationError);
      return;
    }
    setAvatarFile(file);
    setAvatarRemoved(false);
    setAvatarPreview(URL.createObjectURL(file));
    event.target.value = "";
  };

  const handleAvatarRemove = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarRemoved(true);
    showToast("Photo removed — Save to apply");
  };

  const startEdit = () => {
    syncForm();
    setEditing(true);
  };

  const cancelEdit = () => {
    syncForm();
    setEditing(false);
  };

  const handleSave = async () => {
    if (!doctorProfile) return;
    setSaving(true);
    try {
      let avatarUrl: string | null | undefined;
      if (avatarFile) {
        avatarUrl = await uploadFile(avatarFile, "drinsight/avatars");
      } else if (avatarRemoved) {
        avatarUrl = null;
      }

      await updateDoctorUser.mutateAsync(formToUserPayload(form, avatarUrl));
      await updateDoctorProfile.mutateAsync(formToDoctorPayload(form));
      showToast("Profile saved successfully");
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      setAvatarRemoved(false);
    } catch {
      showToast("Could not save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const memberSince = memberSinceLabel(authProfile?.createdAt ?? doctorProfile?.user?.createdAt);

  const headerActions = editing ? (
    <>
      <DashButton variant="outline" onClick={cancelEdit} disabled={saving}>
        Cancel
      </DashButton>
      <DashButton variant="solid" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : (
          <DoctorIconInline icon={Save} size="sm">
            Save Profile
          </DoctorIconInline>
        )}
      </DashButton>
    </>
  ) : (
    <DashButton variant="solid" onClick={startEdit}>
      <DoctorIconInline icon={Pencil} size="sm">
        Edit Profile
      </DoctorIconInline>
    </DashButton>
  );

  const readView = useMemo(() => {
    if (!doctorProfile) return null;
    const expertise = doctorProfile.expertise ?? [];
    const educationLines = (doctorProfile.education ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return (
      <>
        {displayAvatarUrl ? (
          <DashCard title="Profile Photo">
            <div className="dp-photo-row">
              <div className="dp-photo-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={displayAvatarUrl} alt="Profile" />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "var(--gray-900)",
                  }}
                >
                  {form.fullName || "—"}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--gray-500)", marginTop: 4 }}>
                  This photo appears on your public profile hero.
                </div>
              </div>
            </div>
          </DashCard>
        ) : null}

        <GridTwo>
          <DashCard title={<DoctorIconInline icon={CircleUserRound} size="button">Personal Information</DoctorIconInline>}>
            <ProfileRow label="Full Name" value={form.fullName || "—"} />
            <ProfileRow label="Email Address" value={form.email || "—"} />
            <ProfileRow label="Phone Number" value={form.phone || "—"} />
            <ProfileRow label="Date of Birth" value={displayDob(form.dob)} />
            <ProfileRow label="Country" value={form.country || "—"} />
            <ProfileRow label="Member Since" value={memberSince} />
          </DashCard>

          <DashCard title={<DoctorIconInline icon={Stethoscope} size="button">Professional Information</DoctorIconInline>}>
            <ProfileRow label="Primary Specialty" value={form.specialty || "—"} />
            <ProfileRow label="Credentials" value={form.credentials || "—"} />
            <ProfileRow label="Medical License" value={form.license || "—"} />
            <ProfileRow label="Regulatory Body" value={form.regBody || "—"} />
            <ProfileRow label="Institution" value={form.institution || "—"} />
            <ProfileRow label="City of Practice" value={form.city || "—"} />
            <ProfileRow
              label="Experience"
              value={form.experience ? `${form.experience} years` : "—"}
            />
            <ProfileRow label="Response Time" value={form.responseTime || "—"} />
            <ProfileRow label="Languages" value={form.languages || "—"} />
          </DashCard>
        </GridTwo>

        <DashCard title={<DoctorIconInline icon={FileText} size="button">Biography</DoctorIconInline>}>
          {form.title ? (
            <p style={{ fontSize: "0.9rem", color: "var(--gray-800)", lineHeight: 1.7, marginBottom: 8 }}>
              <strong>{form.title}</strong>
            </p>
          ) : null}
          {form.bioShort ? (
            <p style={{ fontSize: "0.86rem", color: "var(--gray-700)", lineHeight: 1.7, marginBottom: 6 }}>
              {form.bioShort}
            </p>
          ) : null}
          {form.bioFull ? (
            <p style={{ fontSize: "0.84rem", color: "var(--gray-500)", lineHeight: 1.7 }}>{form.bioFull}</p>
          ) : null}
          {!form.title && !form.bioShort && !form.bioFull ? (
            <span style={{ color: "var(--gray-400)", fontSize: "0.82rem" }}>No biography added</span>
          ) : null}
        </DashCard>

        <GridTwo>
          <DashCard title={<DoctorIconInline icon={Stethoscope} size="button">Areas of Expertise</DoctorIconInline>}>
            <ChipList items={expertise} />
          </DashCard>
          <DashCard title={<DoctorIconInline icon={BookOpenText} size="button">Education & Training</DoctorIconInline>}>
            <LineList items={educationLines} />
          </DashCard>
        </GridTwo>

        <DashCard title={<DoctorIconInline icon={BadgeCheck} size="button">Board Certifications & Professional Memberships</DoctorIconInline>}>
          <CertGrid items={doctorProfile.certifications ?? []} />
        </DashCard>

        <DashCard title={<DoctorIconInline icon={Star} size="button">Awards & Honors</DoctorIconInline>}>
          <AwardList items={doctorProfile.awards ?? []} />
        </DashCard>

        <DashCard title={<DoctorIconInline icon={MessageSquare} size="button">Lectures, Conferences & Teaching</DoctorIconInline>}>
          <SpeakingList items={doctorProfile.speakingEngagements ?? []} />
        </DashCard>

        <DashCard title={<DoctorIconInline icon={Globe} size="button">Social Media</DoctorIconInline>}>
          <SocialLinks
            facebook={form.facebook}
            twitter={form.twitter}
            youtube={form.youtube}
            instagram={form.instagram}
            linkedin={form.linkedin}
          />
        </DashCard>
      </>
    );
  }, [displayAvatarUrl, doctorProfile, form, memberSince]);

  const editView = (
    <>
      <div className="dp-edit-banner">
        <DoctorIconInline icon={Pencil} size="sm">
          <strong>Editing your profile.</strong>
        </DoctorIconInline>{" "}
        These details appear on your public profile page and are reviewed
        by the editorial team.
      </div>

      <DashCard title={<DoctorIconInline icon={CircleUserRound} size="button">Profile Photo</DoctorIconInline>}>
        <div className="dp-photo-row">
          <div className="dp-photo-preview">
            {displayAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayAvatarUrl} alt="Profile preview" />
            ) : (
              <DoctorIcon icon={CircleUserRound} size="stat" />
            )}
          </div>
          <div className="dp-photo-actions">
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} />
            <div className="dp-photo-hint">
              Shown as your circular photo in the profile hero. JPG/PNG, square works best.{" "}
              {displayAvatarUrl ? (
                <button
                  type="button"
                  onClick={handleAvatarRemove}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    color: "var(--red)",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: "inherit",
                  }}
                >
                  Remove photo
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </DashCard>

      <DashCard title={<DoctorIconInline icon={CircleUserRound} size="button">Personal Information</DoctorIconInline>}>
        <div className="dp-form-grid">
          <FormField label="Full Name">
            <TextInput value={form.fullName} onChange={(v) => patchForm("fullName", v)} />
          </FormField>
          <FormField label="Email Address">
            <TextInput value={form.email} onChange={() => undefined} disabled />
          </FormField>
          <FormField label="Phone Number">
            <TextInput value={form.phone} onChange={(v) => patchForm("phone", v)} />
          </FormField>
          <FormField label="Date of Birth">
            <TextInput type="date" value={form.dob} onChange={(v) => patchForm("dob", v)} />
          </FormField>
          <FormField label="Country">
            <TextInput value={form.country} onChange={(v) => patchForm("country", v)} />
          </FormField>
          <FormField label="City of Practice">
            <TextInput value={form.city} onChange={(v) => patchForm("city", v)} />
          </FormField>
        </div>
      </DashCard>

      <DashCard title={<DoctorIconInline icon={Stethoscope} size="button">Professional Information</DoctorIconInline>}>
        <div className="dp-form-grid">
          <FormField label="Primary Specialty">
            <TextInput value={form.specialty} onChange={(v) => patchForm("specialty", v)} />
          </FormField>
          <FormField label="Credentials" hint="(e.g. MBBS · MD · FCPS)">
            <TextInput value={form.credentials} onChange={(v) => patchForm("credentials", v)} />
          </FormField>
          <FormField label="Years of Experience">
            <TextInput value={form.experience} onChange={(v) => patchForm("experience", v)} />
          </FormField>
          <FormField label="Medical License">
            <TextInput value={form.license} onChange={(v) => patchForm("license", v)} />
          </FormField>
          <FormField label="Regulatory Body">
            <TextInput value={form.regBody} onChange={(v) => patchForm("regBody", v)} />
          </FormField>
          <FormField label="Institution / Hospital">
            <TextInput value={form.institution} onChange={(v) => patchForm("institution", v)} />
          </FormField>
          <FormField label="Response Time">
            <TextInput value={form.responseTime} onChange={(v) => patchForm("responseTime", v)} />
          </FormField>
          <FormField label="Languages" hint="(comma-separated)">
            <TextInput value={form.languages} onChange={(v) => patchForm("languages", v)} />
          </FormField>
          <FormField label="Professional Title / Headline" full>
            <TextArea value={form.title} onChange={(v) => patchForm("title", v)} rows={2} />
          </FormField>
        </div>
      </DashCard>

      <DashCard title={<DoctorIconInline icon={FileText} size="button">Biography & Expertise</DoctorIconInline>}>
        <div className="dp-form-grid">
          <FormField label="Short Bio" full>
            <TextArea value={form.bioShort} onChange={(v) => patchForm("bioShort", v)} rows={3} />
          </FormField>
          <FormField label="Full Biography" full>
            <TextArea value={form.bioFull} onChange={(v) => patchForm("bioFull", v)} rows={4} />
          </FormField>
          <FormField label="Areas of Expertise" hint="(comma-separated)" full>
            <TextArea value={form.expertise} onChange={(v) => patchForm("expertise", v)} rows={2} />
          </FormField>
          <FormField label="Education & Training" hint="(one per line)" full>
            <TextArea value={form.education} onChange={(v) => patchForm("education", v)} rows={4} />
          </FormField>
        </div>
      </DashCard>

      <DashCard title={<DoctorIconInline icon={BadgeCheck} size="button">Board Certifications & Professional Memberships</DoctorIconInline>}>
        <div className="dp-form-grid">
          <FormField
            label="Board Certifications & Memberships"
            hint="(one per line — icon|Title|Detail, e.g. hospital|American Board of Internal Medicine|Board Certified · 2009)"
            full
          >
            <TextArea value={form.boardCerts} onChange={(v) => patchForm("boardCerts", v)} rows={4} />
          </FormField>
        </div>
      </DashCard>

      <DashCard title={<DoctorIconInline icon={Star} size="button">Awards & Honors</DoctorIconInline>}>
        <div className="dp-form-grid">
          <FormField
            label="Awards & Honors"
            hint="(one per line — icon|Title|Organization|Year, e.g. gold|Best Research Award|AAN Annual Meeting|2024)"
            full
          >
            <TextArea value={form.awards} onChange={(v) => patchForm("awards", v)} rows={4} />
          </FormField>
        </div>
      </DashCard>

      <DashCard title={<DoctorIconInline icon={MessageSquare} size="button">Lectures, Conferences & Teaching</DoctorIconInline>}>
        <div className="dp-form-grid">
          <FormField
            label="Lectures, Conferences & Teaching"
            hint="(one per line — Title|Venue|Type|Year, e.g. Keynote: Topic|AAN Meeting, Boston|Conference|2024)"
            full
          >
            <TextArea value={form.lectures} onChange={(v) => patchForm("lectures", v)} rows={4} />
          </FormField>
        </div>
      </DashCard>

      <DashCard title={<DoctorIconInline icon={Globe} size="button">Social Media Links</DoctorIconInline>}>
        <div className="dp-form-grid">
          <FormField label="Facebook URL">
            <TextInput value={form.facebook} onChange={(v) => patchForm("facebook", v)} />
          </FormField>
          <FormField label="Twitter / X URL">
            <TextInput value={form.twitter} onChange={(v) => patchForm("twitter", v)} />
          </FormField>
          <FormField label="YouTube URL">
            <TextInput value={form.youtube} onChange={(v) => patchForm("youtube", v)} />
          </FormField>
          <FormField label="Instagram URL">
            <TextInput value={form.instagram} onChange={(v) => patchForm("instagram", v)} />
          </FormField>
          <FormField label="LinkedIn URL">
            <TextInput value={form.linkedin} onChange={(v) => patchForm("linkedin", v)} />
          </FormField>
        </div>
      </DashCard>

      <div className="dp-btn-row">
        <DashButton variant="solid" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : (
            <DoctorIconInline icon={Save} size="sm">
              Save Profile
            </DoctorIconInline>
          )}
        </DashButton>
        <DashButton variant="outline" onClick={cancelEdit} disabled={saving}>
          Cancel
        </DashButton>
      </div>
    </>
  );

  return (
    <>
      <DashPageHeader
        subtitle={<PhysicianDashboardLabel />}
        title="My Profile"
        dateStr={todayFormatted()}
        actions={headerActions}
      />

      {loading ? (
        <DashCard title="Loading profile">
          <div style={{ padding: "24px 0", textAlign: "center", color: "var(--gray-400)", fontSize: "0.84rem" }}>
            Loading...
          </div>
        </DashCard>
      ) : editing ? (
        editView
      ) : (
        readView
      )}
    </>
  );
}
