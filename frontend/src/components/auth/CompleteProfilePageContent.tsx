"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { cn } from "@/lib/utils";
import { CONTACT_PHONE } from "@/lib/site-contact";
import { phoneHref } from "@/lib/contact-utils";
import { COUNTRY_OPTIONS } from "@/lib/countries";
import { uploadFile } from "@/lib/upload";
import {
  fieldNeedsInput,
  initialsForName,
  providerLabel,
  type CompleteProfilePayload,
  type ProfileFieldKey,
} from "@/lib/profile-completeness";
import { resolvePostLoginPath } from "@/lib/oauth";
import { normalizeGenderForForm, toDateInputValue } from "@/lib/patient-profile";
import { useCompleteProfile, useProfileCompleteness } from "@/services/profile-api-hooks";
import { useAuthStore } from "@/store/auth.store";
import { FloatingInput } from "@/components/ui/floating-input";
import { FloatingSelect } from "@/components/ui/floating-select";
import { SearchableFloatingSelect } from "@/components/ui/searchable-floating-select";
import { Logo } from "@/components/layout/Logo";
import { RadioPills } from "@/components/auth/RadioPills";
import { ProfileImageUpload } from "@/components/auth/ProfileImageUpload";
import { DocumentUploadField } from "@/components/auth/DocumentUploadField";
import { EmailVerificationField } from "@/components/auth/EmailVerificationField";
import {
  BLOOD_GROUP_OPTIONS,
  CONTENT_PREFERENCE_OPTIONS,
  CONTRIBUTION_OPTIONS,
  GENDER_OPTIONS,
  LANGUAGE_OPTIONS,
  NEWSLETTER_FREQUENCY_OPTIONS,
  PATIENT_HEALTH_TAGS,
  PATIENT_SUBS,
  PHYSICIAN_CLINICAL_TAGS,
  PHYSICIAN_SUBS,
  REGULATORY_BODY_OPTIONS,
  type AccountType,
  type SubType,
} from "@/components/auth/registration-constants";

function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isBootstrapped = useAuthStore((s) => s.isBootstrapped);
  const user = useAuthStore((s) => s.user);

  const completenessQuery = useProfileCompleteness({ enabled: isBootstrapped && isAuthenticated });
  const completeMutation = useCompleteProfile();

  const [accountType, setAccountType] = useState<AccountType>("patient");
  const [subType, setSubType] = useState<SubType>("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [allergies, setAllergies] = useState("");
  const [healthTags, setHealthTags] = useState<Set<string>>(new Set());
  const [contentPreference, setContentPreference] = useState("");
  const [newsletterFrequency, setNewsletterFrequency] = useState("");
  const [languagePreference, setLanguagePreference] = useState("English");
  const [specialty, setSpecialty] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [regulatoryBody, setRegulatoryBody] = useState<string>(REGULATORY_BODY_OPTIONS[0]);
  const [experienceYears, setExperienceYears] = useState("");
  const [clinicalTags, setClinicalTags] = useState<Set<string>>(new Set());
  const [contribSelected, setContribSelected] = useState<Set<number>>(new Set());
  const [contribAll, setContribAll] = useState(false);
  const [consent, setConsent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [savedAvatarUrl, setSavedAvatarUrl] = useState<string | null>(null);
  const [licenseCertPreview, setLicenseCertPreview] = useState<string | null>(null);
  const [licenseCertFile, setLicenseCertFile] = useState<File | null>(null);
  const [licenseCertFileName, setLicenseCertFileName] = useState<string | null>(null);
  const [licenseCertRemoved, setLicenseCertRemoved] = useState(false);
  const [savedLicenseCertUrl, setSavedLicenseCertUrl] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const missingFields = completenessQuery.data?.missingFields ?? [];
  const profile = completenessQuery.data?.profile;
  const oauthProvider = completenessQuery.data?.oauthProvider ?? null;
  const redirectPath = searchParams.get("redirect");

  useEffect(() => {
    if (!isBootstrapped) return;
    if (!isAuthenticated) {
      const completePath = redirectPath
        ? `/complete-profile?redirect=${encodeURIComponent(redirectPath)}`
        : "/complete-profile";
      router.replace(`/login?redirect=${encodeURIComponent(completePath)}`);
    }
  }, [isBootstrapped, isAuthenticated, redirectPath, router]);

  useEffect(() => {
    if (!completenessQuery.data) return;

    if (completenessQuery.data.profileCompleted || !completenessQuery.data.requiresCompletion) {
      const role = (user?.role ?? completenessQuery.data.profile.role) as "ADMIN" | "DOCTOR" | "PATIENT";
      router.replace(resolvePostLoginPath(role, redirectPath));
      return;
    }

    const p = completenessQuery.data.profile;
    const type = completenessQuery.data.accountType ?? "patient";
    setAccountType(type);
    setSubType((p.accountSubType as SubType) ?? "");
    setFirstName(p.firstName && p.firstName.toLowerCase() !== "user" ? p.firstName : "");
    setLastName(p.lastName ?? "");
    setPhone(p.phone ?? "");
    setDob(toDateInputValue(p.dateOfBirth));
    setGender(normalizeGenderForForm(p.gender));
    setCountry(p.country ?? "");
    setCity(p.city ?? "");
    setAddress(p.address ?? "");
    setBloodGroup(p.bloodGroup ?? "");
    setEmergencyContact(p.emergencyContact ?? "");
    setAllergies(p.allergies?.join(", ") ?? "");
    setHealthTags(new Set(p.healthInterests ?? []));
    setContentPreference(p.contentPreference ?? "");
    setNewsletterFrequency(p.newsletterFrequency ?? "");
    setLanguagePreference(p.languagePreference ?? "English");
    setSpecialty(p.specialty ?? "");
    setLicenseNumber(p.licenseNumber ?? "");
    setRegulatoryBody(p.regulatoryBody ?? REGULATORY_BODY_OPTIONS[0]);
    setExperienceYears(p.experienceYears != null ? String(p.experienceYears) : "");
    setEmailVerified(Boolean(p.emailVerified));
    setSavedAvatarUrl(p.avatarUrl ?? null);
    setAvatarPreview(p.avatarUrl ?? null);
    setAvatarFile(null);
    setAvatarRemoved(false);
    setSavedLicenseCertUrl(p.licenseCertificateUrl ?? null);
    setLicenseCertPreview(p.licenseCertificateUrl ?? null);
    setLicenseCertFile(null);
    setLicenseCertFileName(null);
    setLicenseCertRemoved(false);
    setClinicalTags(new Set(p.clinicalInterests ?? []));
    const contribIndexes = new Set<number>();
    p.contributions?.forEach((title) => {
      const idx = CONTRIBUTION_OPTIONS.findIndex((c) => c.title === title);
      if (idx >= 0) contribIndexes.add(idx);
    });
    setContribSelected(contribIndexes);
  }, [completenessQuery.data, redirectPath, router, user?.role]);

  const displayName = useMemo(() => {
    if (!profile) return "Your Name";
    const full = `${profile.firstName} ${profile.lastName}`.trim();
    if (full && profile.firstName.toLowerCase() !== "user") return full;
    return profile.email.split("@")[0] || "Your Name";
  }, [profile]);

  const needs = (field: ProfileFieldKey, value?: string | null) =>
    fieldNeedsInput(field, missingFields, value);

  function selectType(type: AccountType) {
    setAccountType(type);
    setSubType("");
    setAlert(null);
  }

  function selectSub(value: SubType) {
    setSubType(value);
    setAlert(null);
  }

  function toggleTag(tag: string, physician: boolean) {
    if (physician) {
      setClinicalTags((prev) => {
        const next = new Set(prev);
        if (next.has(tag)) next.delete(tag);
        else next.add(tag);
        return next;
      });
    } else {
      setHealthTags((prev) => {
        const next = new Set(prev);
        if (next.has(tag)) next.delete(tag);
        else next.add(tag);
        return next;
      });
    }
    setAlert(null);
  }

  function toggleContrib(index: number) {
    setContribSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      setContribAll(next.size === CONTRIBUTION_OPTIONS.length);
      return next;
    });
    setAlert(null);
  }

  function toggleContribAll(checked: boolean) {
    setContribAll(checked);
    setContribSelected(checked ? new Set(CONTRIBUTION_OPTIONS.map((_, i) => i)) : new Set());
    setAlert(null);
  }

  const regulatoryBodyOptions = useMemo(
    () => REGULATORY_BODY_OPTIONS.map((opt) => ({ value: opt, label: opt })),
    [],
  );

  function handleAvatarSelect(file: File) {
    if (avatarPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(file);
    setAvatarRemoved(false);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleAvatarRemove() {
    if (avatarPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setAvatarRemoved(true);
    setAvatarPreview(null);
  }

  function handleLicenseCertSelect(file: File) {
    if (licenseCertPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(licenseCertPreview);
    }
    setLicenseCertFile(file);
    setLicenseCertRemoved(false);
    setLicenseCertFileName(file.name);
    setLicenseCertPreview(URL.createObjectURL(file));
  }

  function handleLicenseCertRemove() {
    if (licenseCertPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(licenseCertPreview);
    }
    setLicenseCertFile(null);
    setLicenseCertFileName(null);
    setLicenseCertRemoved(true);
    setLicenseCertPreview(null);
  }

  function validateClient(): string | null {
    if (!subType) return "Please select your account sub-type.";
    if (!emailVerified) return "Please verify your email address before continuing.";
    if (!firstName.trim() || firstName.trim().toLowerCase() === "user") return "Please enter your first name.";
    if (!lastName.trim()) return "Please enter your last name.";
    if (!phone.trim()) return "Please enter your phone number.";
    if (!/^\+?[0-9 ()-]{7,18}$/.test(phone.trim()) || phone.replace(/\D/g, "").length < 10) {
      return "Please enter a valid phone number.";
    }
    if (accountType === "patient") {
      if (!dob) return "Please enter your date of birth.";
      if (!gender) return "Please select your gender.";
      if (!city.trim()) return "Please enter your city.";
      if (!country.trim()) return "Please select your country.";
      if (!emergencyContact.trim()) return "Please enter an emergency contact number.";
      if (healthTags.size === 0) return "Please select at least one health interest.";
      if (!contentPreference) return "Please select a preferred content type.";
      if (!newsletterFrequency) return "Please select a newsletter frequency.";
      if (!languagePreference) return "Please select a language preference.";
    } else {
      if (!dob) return "Please enter your date of birth.";
      if (!gender) return "Please select your gender.";
      if (!city.trim()) return "Please enter your city.";
      if (!country.trim()) return "Please select your country.";
      if (!specialty.trim()) return "Please enter your specialization.";
      if (!licenseNumber.trim()) return "Please enter your medical license number.";
      if (!regulatoryBody.trim()) return "Please select your regulatory body.";
      if (!experienceYears.trim() || Number(experienceYears) < 0) {
        return "Please enter your years of experience.";
      }
      if (clinicalTags.size === 0) return "Please select at least one clinical interest.";
    }
    if (!consent) return "Please confirm the privacy policy and terms before continuing.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAlert(null);

    const validationError = validateClient();
    if (validationError) {
      setAlert({ type: "error", message: validationError });
      return;
    }

    const payload: CompleteProfilePayload = {
      accountType,
      accountSubType: subType,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      city: city.trim(),
      country: country.trim(),
      address: address.trim() || undefined,
      gender: gender || undefined,
      dateOfBirth: dob || undefined,
      bloodGroup: bloodGroup || undefined,
      emergencyContact: emergencyContact.trim() || undefined,
      allergies: allergies.trim() || undefined,
      healthInterests: Array.from(healthTags),
      contentPreference,
      newsletterFrequency,
      languagePreference,
      specialty: specialty.trim() || undefined,
      licenseNumber: licenseNumber.trim() || undefined,
      regulatoryBody: regulatoryBody.trim() || undefined,
      experienceYears: experienceYears.trim() ? Number(experienceYears) : undefined,
      clinicalInterests: Array.from(clinicalTags),
      contributions: Array.from(contribSelected).map((i) => CONTRIBUTION_OPTIONS[i].title),
    };

    try {
      let avatarUrl: string | null | undefined;
      if (avatarFile) {
        avatarUrl = await uploadFile(avatarFile, "drinsight/avatars");
      } else if (avatarRemoved) {
        avatarUrl = null;
      } else if (savedAvatarUrl) {
        avatarUrl = savedAvatarUrl;
      }

      let licenseCertificateUrl: string | null | undefined;
      if (accountType === "physician") {
        if (licenseCertFile) {
          licenseCertificateUrl = await uploadFile(licenseCertFile, "drinsight/licenses");
        } else if (licenseCertRemoved) {
          licenseCertificateUrl = null;
        } else if (savedLicenseCertUrl) {
          licenseCertificateUrl = savedLicenseCertUrl;
        }
      }

      const result = await completeMutation.mutateAsync({
        ...payload,
        avatarUrl,
        licenseCertificateUrl,
      });
      setAlert({ type: "success", message: "Profile saved! Redirecting..." });
      const role = result.profile.role as "ADMIN" | "DOCTOR" | "PATIENT";
      window.setTimeout(() => {
        window.location.assign(resolvePostLoginPath(role, redirectPath));
      }, 700);
    } catch (err) {
      let message = "Could not save your profile. Please try again.";
      if (isAxiosError(err)) {
        const responseMessage = err.response?.data?.message;
        if (typeof responseMessage === "string" && responseMessage) message = responseMessage;
        else if (Array.isArray(responseMessage)) message = responseMessage.join(", ");
      }
      setAlert({ type: "error", message });
    }
  }

  if (!isBootstrapped || !isAuthenticated || completenessQuery.isLoading) {
    return (
      <div className="complete-profile-page">
        <div className="cp-loading">Loading your profile...</div>
      </div>
    );
  }

  if (completenessQuery.isError || !profile) {
    return (
      <div className="complete-profile-page">
        <div className="cp-wrap">
          <div className="cp-card register-page">
            <p className="cp-loading">Unable to load your profile. Please try signing in again.</p>
            <Link href="/login" className="btn-next" style={{ display: "inline-block", textAlign: "center", marginTop: 16 }}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="complete-profile-page">
      <div className="cp-topbar">
        <div className="cp-topbar-inner">
          <div className="cp-topbar-emergency">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            Emergency: <strong>115</strong>
            <span className="hidden sm:inline">
              {" "}
              &nbsp;|&nbsp; Medical Helpline: <strong>{CONTACT_PHONE}</strong>
            </span>
          </div>
          <div>
            <Link href="/login">Back to Login</Link>
          </div>
        </div>
      </div>

      <div className="cp-progress-header">
        <div className="cp-progress-inner">
          <div className="cp-progress-logo">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          <div className="cp-progress-steps">
            <div className="cp-p-step done">
              <div className="cp-p-step-circle">✓</div>
              <div className="cp-p-step-label">Sign in</div>
              <div className="cp-p-line" />
            </div>
            <div className="cp-p-step active">
              <div className="cp-p-step-circle">2</div>
              <div className="cp-p-step-label">Your details</div>
              <div className="cp-p-line" />
            </div>
            <div className="cp-p-step">
              <div className="cp-p-step-circle">3</div>
              <div className="cp-p-step-label">Dashboard</div>
              <div className="cp-p-line" />
            </div>
          </div>
        </div>
      </div>

      <div className="cp-wrap">
        <div className="cp-intro">
          <div className="cp-intro-eyebrow">One quick step</div>
          <h1>Complete your profile</h1>
          <p>
            Thanks for signing in with a social account. We just need a few more details before your dashboard is ready.
          </p>
        </div>

        <div className="cp-card register-page">
          {alert && <div className={cn("cp-alert", alert.type)}>{alert.message}</div>}

          <div className="cp-avatar-row">
            <ProfileImageUpload
              previewUrl={avatarPreview}
              fallbackLabel={initialsForName(profile.firstName, profile.lastName, profile.email)}
              onFileSelect={handleAvatarSelect}
              onRemove={handleAvatarRemove}
            />
            <div className="cp-avatar-meta">
              <strong>{displayName}</strong>
              <span>{profile.email}</span>
              <div className="cp-provider-badge">🔗 {providerLabel(oauthProvider)}</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="cp-section-title">
              Account type <span className="cp-tag">Confirm</span>
            </div>
            <div className="type-grid">
              <div
                className={cn("type-card", accountType === "patient" && "selected")}
                onClick={() => selectType("patient")}
                onKeyDown={(e) => e.key === "Enter" && selectType("patient")}
                role="button"
                tabIndex={0}
              >
                <div className="tc-icon">🏥</div>
                <div className="tc-title">Patient</div>
                <div className="tc-desc">I&apos;m seeking medical info or consultations</div>
              </div>
              <div
                className={cn("type-card", accountType === "physician" && "selected")}
                onClick={() => selectType("physician")}
                onKeyDown={(e) => e.key === "Enter" && selectType("physician")}
                role="button"
                tabIndex={0}
              >
                <div className="tc-icon">👨‍⚕️</div>
                <div className="tc-title">Physician</div>
                <div className="tc-desc">I&apos;m a licensed healthcare professional</div>
              </div>
            </div>

            {accountType === "patient" && (
              <div>
                <div className="sub-section-label">I am a…</div>
                <div className="sub-grid">
                  {PATIENT_SUBS.map((s) => (
                    <div
                      key={s.id}
                      className={cn("sub-card", subType === s.id && "selected")}
                      onClick={() => selectSub(s.id)}
                      onKeyDown={(e) => e.key === "Enter" && selectSub(s.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="sc-icon">{s.icon}</div>
                      <div className="sc-title">{s.title}</div>
                      <div className="sc-desc">{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {accountType === "physician" && (
              <div>
                <div className="sub-section-label">I am a…</div>
                <div className="sub-grid">
                  {PHYSICIAN_SUBS.map((s) => (
                    <div
                      key={s.id}
                      className={cn("sub-card", subType === s.id && "selected")}
                      onClick={() => selectSub(s.id)}
                      onKeyDown={(e) => e.key === "Enter" && selectSub(s.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="sc-icon">{s.icon}</div>
                      <div className="sc-title">{s.title}</div>
                      <div className="sc-desc">{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="cp-section-title">
              Basic details <span className="cp-tag">Required</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <FloatingInput
                  type="text"
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  readOnly={!needs("firstName", firstName)}
                />
              </div>
              <div className="form-group">
                <FloatingInput
                  type="text"
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  readOnly={!needs("lastName", lastName)}
                />
              </div>
            </div>

            <EmailVerificationField
              email={profile.email}
              initialVerified={emailVerified}
              onVerifiedChange={setEmailVerified}
            />

            <div className="form-row">
              <div className="form-group">
                <FloatingInput
                  type="tel"
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  readOnly={!needs("phone", phone)}
                />
              </div>
              <div className="form-group">
                <FloatingInput
                  type="date"
                  label="Date of Birth"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  readOnly={!needs("dateOfBirth", dob)}
                />
              </div>
            </div>

            <div className="form-group">
              <FloatingSelect
                label="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={!needs("gender", gender)}
              >
                <option value="">Select…</option>
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </FloatingSelect>
            </div>

            <div className="form-row">
              <div className="form-group">
                <FloatingInput
                  type="text"
                  label="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  readOnly={!needs("city", city)}
                />
              </div>
              <div className="form-group">
                <SearchableFloatingSelect
                  label="Country"
                  value={country}
                  onChange={setCountry}
                  options={COUNTRY_OPTIONS}
                  disabled={!needs("country", country)}
                />
              </div>
            </div>

            <div className="form-group">
              <FloatingInput
                type="text"
                label="Address (optional)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {accountType === "patient" && (
              <div>
                <div className="cp-section-title">
                  Health details <span className="cp-tag">Patients</span>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <FloatingSelect
                      label="Blood Group (optional)"
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                    >
                      <option value="">Select</option>
                      {BLOOD_GROUP_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </FloatingSelect>
                  </div>
                  <div className="form-group">
                    <FloatingInput
                      type="tel"
                      label="Emergency Contact"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      readOnly={!needs("emergencyContact", emergencyContact)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Known allergies / conditions <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(optional)</span>
                  </label>
                  <textarea
                    className="form-textarea"
                    placeholder="e.g. Penicillin allergy, asthma..."
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                  />
                </div>

                <div className="cp-section-title">
                  Your health profile <span className="cp-tag">Patients</span>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Health interests <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(select all that apply)</span>
                  </label>
                  <div className="tag-cloud">
                    {PATIENT_HEALTH_TAGS.map((tag) => (
                      <span
                        key={tag}
                        className={cn("tag-pill", healthTags.has(tag) && "selected")}
                        onClick={() => toggleTag(tag, false)}
                        onKeyDown={(e) => e.key === "Enter" && toggleTag(tag, false)}
                        role="button"
                        tabIndex={0}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred content type</label>
                  <RadioPills
                    options={CONTENT_PREFERENCE_OPTIONS}
                    value={contentPreference}
                    onChange={setContentPreference}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Newsletter frequency</label>
                  <RadioPills
                    options={NEWSLETTER_FREQUENCY_OPTIONS}
                    value={newsletterFrequency}
                    onChange={setNewsletterFrequency}
                  />
                </div>
                <div className="form-group">
                  <FloatingSelect
                    label="Language Preference"
                    value={languagePreference}
                    onChange={(e) => setLanguagePreference(e.target.value)}
                  >
                    {LANGUAGE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </FloatingSelect>
                </div>
              </div>
            )}

            {accountType === "physician" && (
              <div>
                <div className="cp-section-title">
                  Professional details <span className="cp-tag">Doctors</span>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <FloatingInput
                      type="text"
                      label="Specialization"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      readOnly={!needs("specialty", specialty)}
                    />
                  </div>
                  <div className="form-group">
                    <FloatingInput
                      type="text"
                      label="Medical License Number"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      readOnly={!needs("licenseNumber", licenseNumber)}
                    />
                  </div>
                </div>
                <p className="input-note">⚠️ License will be verified before author/reviewer access is granted</p>
                <DocumentUploadField
                  label="PMDC License Certificate"
                  previewUrl={licenseCertPreview}
                  fileName={licenseCertFileName}
                  onFileSelect={handleLicenseCertSelect}
                  onRemove={handleLicenseCertRemove}
                />
                <div className="form-group">
                  <SearchableFloatingSelect
                    label="Regulatory Body / Medical Council"
                    value={regulatoryBody}
                    onChange={setRegulatoryBody}
                    options={regulatoryBodyOptions}
                    disabled={!needs("regulatoryBody", regulatoryBody)}
                  />
                </div>
                <div className="form-group">
                  <FloatingInput
                    type="number"
                    label="Years of Experience"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    readOnly={!needs("experienceYears", experienceYears)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Clinical interests</label>
                  <div className="tag-cloud">
                    {PHYSICIAN_CLINICAL_TAGS.map((tag) => (
                      <span
                        key={tag}
                        className={cn("tag-pill", clinicalTags.has(tag) && "selected")}
                        onClick={() => toggleTag(tag, true)}
                        onKeyDown={(e) => e.key === "Enter" && toggleTag(tag, true)}
                        role="button"
                        tabIndex={0}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Would you like to contribute?</label>
                  <div className="contrib-grid">
                    {CONTRIBUTION_OPTIONS.map((c, i) => (
                      <div
                        key={c.title}
                        className={cn("contrib-card", contribSelected.has(i) && "selected")}
                        onClick={() => toggleContrib(i)}
                        onKeyDown={(e) => e.key === "Enter" && toggleContrib(i)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="cc-icon">{c.icon}</div>
                        <div className="cc-title">{c.title}</div>
                        <div className="cc-desc">{c.desc}</div>
                      </div>
                    ))}
                  </div>
                  <label className="contrib-all-row">
                    <input
                      type="checkbox"
                      checked={contribAll}
                      onChange={(e) => toggleContribAll(e.target.checked)}
                    />
                    <span>All</span>
                  </label>
                  {contribSelected.size > 0 && (
                    <div className="contrib-note">
                      📋 You&apos;ll need to complete a contributor agreement after registration
                    </div>
                  )}
                </div>
              </div>
            )}

            <label className="agree-row">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
              <span>
                I confirm this information is accurate and agree to the{" "}
                <Link href="/privacy-policy">Privacy Policy</Link> and{" "}
                <Link href="/terms-conditions">Terms of Service</Link>.
              </span>
            </label>

            <div className="btn-row">
              <button type="submit" className="btn-next" disabled={completeMutation.isPending}>
                {completeMutation.isPending ? "Saving…" : "Save and continue →"}
              </button>
            </div>
          </form>

          <div className="cp-security-box">
            🔒 Your information is encrypted and only used to personalize your DrInsight experience. Need help? Call{" "}
            <a href={phoneHref(CONTACT_PHONE)}>{CONTACT_PHONE}</a>.
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompleteProfilePageContent() {
  return (
    <Suspense
      fallback={
        <div className="complete-profile-page">
          <div className="cp-loading">Loading your profile...</div>
        </div>
      }
    >
      <CompleteProfileContent />
    </Suspense>
  );
}
