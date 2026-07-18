"use client";

import { useEffect, useState } from "react";
import {
  AdminButton,
  AdminPanel,
  FormGrid,
  FormItem,
} from "@/components/admin/ui/AdminPrimitives";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { useAdminUiStore } from "@/store/admin-ui.store";
import {
  useGeneralSettings,
  useTestSmsOtp,
  useUpdateGeneralSettings,
} from "@/services/configuration-api-hooks";

const SECRET_MASK = "********";

export function SettingsMgmtPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const settingsQuery = useGeneralSettings();
  const updateSettings = useUpdateGeneralSettings();
  const testSms = useTestSmsOtp();

  const [draft, setDraft] = useState({
    siteName: "",
    siteUrl: "",
    timezone: "",
    smtpHost: "",
    smtpFrom: "",
    smtpPassword: "",
    emailJsServiceId: "",
    emailJsTemplateId: "",
    emailJsPublicKey: "",
    smsProvider: "textbelt" as "textbelt" | "custom",
    smsApiKey: "",
    smsCustomUrl: "",
    smsSenderName: "",
    smsTestNumber: "",
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    youtube: "",
  });
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [smsStatus, setSmsStatus] = useState("");

  useEffect(() => {
    if (!settingsQuery.data) return;
    const s = settingsQuery.data;
    const next = {
      siteName: s.siteName ?? "",
      siteUrl: s.siteUrl ?? "",
      timezone: s.timezone ?? "",
      smtpHost: s.smtpHost ?? "",
      smtpFrom: s.smtpFrom ?? "",
      smtpPassword: s.smtpPasswordConfigured ? SECRET_MASK : "",
      emailJsServiceId: s.emailJsServiceId ?? "",
      emailJsTemplateId: s.emailJsTemplateId ?? "",
      emailJsPublicKey: s.emailJsPublicKey ?? "",
      smsProvider: s.smsProvider ?? "textbelt",
      smsApiKey: s.smsApiKeyConfigured ? SECRET_MASK : "",
      smsCustomUrl: s.smsCustomUrl ?? "",
      smsSenderName: s.smsSenderName ?? "",
      smsTestNumber: s.smsTestNumber ?? "",
      facebook: s.socialLinks.facebook ?? "",
      twitter: s.socialLinks.twitter ?? "",
      instagram: s.socialLinks.instagram ?? "",
      linkedin: s.socialLinks.linkedin ?? "",
      youtube: s.socialLinks.youtube ?? "",
    };
    setDraft(next);
    setSavedSnapshot(JSON.stringify(next));
  }, [settingsQuery.data]);

  const dirty = savedSnapshot !== JSON.stringify(draft);
  useUnsavedChangesWarning(dirty);

  const handleSave = () => {
    updateSettings.mutate(
      {
        siteName: draft.siteName,
        siteUrl: draft.siteUrl,
        timezone: draft.timezone,
        smtpHost: draft.smtpHost,
        smtpFrom: draft.smtpFrom,
        smtpPassword: draft.smtpPassword,
        emailJsServiceId: draft.emailJsServiceId,
        emailJsTemplateId: draft.emailJsTemplateId,
        emailJsPublicKey: draft.emailJsPublicKey,
        smsProvider: draft.smsProvider,
        smsApiKey: draft.smsApiKey,
        smsCustomUrl: draft.smsCustomUrl,
        smsSenderName: draft.smsSenderName,
        smsTestNumber: draft.smsTestNumber,
        socialLinks: {
          facebook: draft.facebook,
          twitter: draft.twitter,
          instagram: draft.instagram,
          linkedin: draft.linkedin,
          youtube: draft.youtube,
        },
      },
      {
        onSuccess: () => {
          setSavedSnapshot(JSON.stringify(draft));
          showToast("✅ Settings saved");
        },
        onError: () => showToast("⚠️ Failed to save settings"),
      },
    );
  };

  const handleTestSms = () => {
    setSmsStatus("Sending…");
    testSms.mutate(draft.smsTestNumber, {
      onSuccess: (res) => {
        setSmsStatus(res.message);
        showToast(res.message);
      },
      onError: () => {
        setSmsStatus("⚠️ SMS service unreachable");
        showToast("⚠️ SMS service unreachable");
      },
    });
  };

  return (
    <>
      <AdminPanel title="⚙️ General" bodyClassName="panel-bd">
        <FormGrid>
          <FormItem label="Site Name">
            <input
              value={draft.siteName}
              onChange={(e) => setDraft((d) => ({ ...d, siteName: e.target.value }))}
            />
          </FormItem>
          <FormItem label="Site URL">
            <input
              value={draft.siteUrl}
              onChange={(e) => setDraft((d) => ({ ...d, siteUrl: e.target.value }))}
            />
          </FormItem>
          <FormItem label="Timezone">
            <input
              value={draft.timezone}
              onChange={(e) => setDraft((d) => ({ ...d, timezone: e.target.value }))}
            />
          </FormItem>
        </FormGrid>
      </AdminPanel>

      <AdminPanel title="✉️ Email" bodyClassName="panel-bd">
        <FormGrid>
          <FormItem label="SMTP Host">
            <input
              value={draft.smtpHost}
              onChange={(e) => setDraft((d) => ({ ...d, smtpHost: e.target.value }))}
              placeholder="smtp.example.com"
            />
          </FormItem>
          <FormItem label="From Email">
            <input
              value={draft.smtpFrom}
              onChange={(e) => setDraft((d) => ({ ...d, smtpFrom: e.target.value }))}
              placeholder="noreply@drinsight.org"
            />
          </FormItem>
          <FormItem label="SMTP Password" full>
            <input
              type="password"
              value={draft.smtpPassword}
              onChange={(e) => setDraft((d) => ({ ...d, smtpPassword: e.target.value }))}
              placeholder={settingsQuery.data?.smtpPasswordConfigured ? "Leave blank to keep current" : ""}
            />
          </FormItem>
        </FormGrid>
        <p className="seo-hint" style={{ marginTop: 6 }}>
          Sending requires a server SMTP connection. Passwords are encrypted and never returned to the
          browser.
        </p>
      </AdminPanel>

      <AdminPanel title="🔐 OTP Email Service (EmailJS)" bodyClassName="panel-bd">
        <p className="seo-hint" style={{ marginBottom: 12 }}>
          Powers one-time codes without a backend. Create a free account at emailjs.com and paste your
          keys.
        </p>
        <FormGrid>
          <FormItem label="Service ID">
            <input
              value={draft.emailJsServiceId}
              onChange={(e) => setDraft((d) => ({ ...d, emailJsServiceId: e.target.value }))}
              placeholder="service_xxxxxxx"
            />
          </FormItem>
          <FormItem label="Template ID">
            <input
              value={draft.emailJsTemplateId}
              onChange={(e) => setDraft((d) => ({ ...d, emailJsTemplateId: e.target.value }))}
              placeholder="template_xxxxxxx"
            />
          </FormItem>
          <FormItem label="Public Key" full>
            <input
              value={draft.emailJsPublicKey}
              onChange={(e) => setDraft((d) => ({ ...d, emailJsPublicKey: e.target.value }))}
            />
          </FormItem>
        </FormGrid>
      </AdminPanel>

      <AdminPanel title="📱 OTP SMS Service (cell number codes)" bodyClassName="panel-bd">
        <p className="seo-hint" style={{ marginBottom: 12 }}>
          Send one-time codes by SMS via <strong>Textbelt</strong> or a custom gateway URL. API keys are
          stored encrypted server-side.
        </p>
        <FormGrid>
          <FormItem label="Provider">
            <select
              value={draft.smsProvider}
              onChange={(e) =>
                setDraft((d) => ({ ...d, smsProvider: e.target.value as "textbelt" | "custom" }))
              }
            >
              <option value="textbelt">Textbelt</option>
              <option value="custom">Custom API URL</option>
            </select>
          </FormItem>
          <FormItem label="Textbelt API Key">
            <input
              type="password"
              value={draft.smsApiKey}
              onChange={(e) => setDraft((d) => ({ ...d, smsApiKey: e.target.value }))}
              placeholder="textbelt (test) or your paid key"
            />
          </FormItem>
          <FormItem label="Custom API URL (if Custom)" full>
            <input
              value={draft.smsCustomUrl}
              onChange={(e) => setDraft((d) => ({ ...d, smsCustomUrl: e.target.value }))}
              placeholder="https://your-gateway.com/send"
            />
          </FormItem>
          <FormItem label="Sender Name (shown in message)">
            <input
              value={draft.smsSenderName}
              onChange={(e) => setDraft((d) => ({ ...d, smsSenderName: e.target.value }))}
            />
          </FormItem>
          <FormItem label="Test Cell Number">
            <input
              value={draft.smsTestNumber}
              onChange={(e) => setDraft((d) => ({ ...d, smsTestNumber: e.target.value }))}
              placeholder="+15551234567"
            />
          </FormItem>
        </FormGrid>
        <div className="btn-row" style={{ marginTop: 12 }}>
          <AdminButton variant="primary" onClick={handleTestSms}>
            📲 Send Test SMS OTP
          </AdminButton>
          {smsStatus ? (
            <span style={{ fontSize: ".76rem", color: "var(--gray-400)" }}>{smsStatus}</span>
          ) : null}
        </div>
      </AdminPanel>

      <AdminPanel
        title="🌐 Social Links"
        actions={
          <AdminButton variant="primary" onClick={handleSave}>
            💾 Save All Settings
          </AdminButton>
        }
        bodyClassName="panel-bd"
      >
        <FormGrid>
          <FormItem label="Facebook">
            <input value={draft.facebook} onChange={(e) => setDraft((d) => ({ ...d, facebook: e.target.value }))} />
          </FormItem>
          <FormItem label="X / Twitter">
            <input value={draft.twitter} onChange={(e) => setDraft((d) => ({ ...d, twitter: e.target.value }))} />
          </FormItem>
          <FormItem label="Instagram">
            <input value={draft.instagram} onChange={(e) => setDraft((d) => ({ ...d, instagram: e.target.value }))} />
          </FormItem>
          <FormItem label="LinkedIn">
            <input value={draft.linkedin} onChange={(e) => setDraft((d) => ({ ...d, linkedin: e.target.value }))} />
          </FormItem>
          <FormItem label="YouTube" full>
            <input value={draft.youtube} onChange={(e) => setDraft((d) => ({ ...d, youtube: e.target.value }))} />
          </FormItem>
        </FormGrid>
      </AdminPanel>
    </>
  );
}
