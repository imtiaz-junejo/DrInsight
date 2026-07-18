"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AdminButton,
  AdminPanel,
  FormGrid,
  FormItem,
} from "@/components/admin/ui/AdminPrimitives";
import { SeoImageUpload } from "@/components/admin/site-management/SeoImageUpload";
import { CONFIG_PAGE_OPTIONS, configPageLabel } from "@/config/configuration-pages";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { uploadFile } from "@/lib/upload";
import { useAdminUiStore } from "@/store/admin-ui.store";
import {
  useDeleteMediaAsset,
  useSetPageHero,
  useSiteBranding,
  useUpdateSiteBranding,
} from "@/services/configuration-api-hooks";

export function BrandingMediaPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const brandingQuery = useSiteBranding();
  const updateBranding = useUpdateSiteBranding();
  const setPageHero = useSetPageHero();
  const deleteMedia = useDeleteMediaAsset();

  const [draft, setDraft] = useState({
    logoUrl: "",
    faviconUrl: "",
    footerLogoUrl: "",
    heroImageUrl: "",
    wordmarkText: "",
    tagline: "",
  });
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [heroPageId, setHeroPageId] = useState<string>(CONFIG_PAGE_OPTIONS[0].id);
  const [heroImageUrl, setHeroImageUrl] = useState("");

  const branding = brandingQuery.data;

  useEffect(() => {
    if (!branding) return;
    const next = {
      logoUrl: branding.logoUrl ?? "",
      faviconUrl: branding.faviconUrl ?? "",
      footerLogoUrl: branding.footerLogoUrl ?? "",
      heroImageUrl: branding.heroImageUrl ?? "",
      wordmarkText: branding.wordmarkText ?? "",
      tagline: branding.tagline ?? "",
    };
    setDraft(next);
    setSavedSnapshot(JSON.stringify(next));
    setHeroImageUrl(branding.pageHeroImages?.[heroPageId] ?? "");
  }, [branding, heroPageId]);

  const dirty = savedSnapshot !== JSON.stringify(draft);
  useUnsavedChangesWarning(dirty);

  const heroKeys = useMemo(
    () => Object.keys(branding?.pageHeroImages ?? {}),
    [branding?.pageHeroImages],
  );

  const handleSaveBranding = () => {
    updateBranding.mutate(draft, {
      onSuccess: () => {
        setSavedSnapshot(JSON.stringify(draft));
        showToast("✅ Branding saved");
      },
      onError: () => showToast("⚠️ Failed to save branding"),
    });
  };

  const handleSaveHero = () => {
    if (!heroImageUrl) {
      showToast("⚠️ Upload an image first");
      return;
    }
    setPageHero.mutate(
      { pageId: heroPageId, imageUrl: heroImageUrl },
      {
        onSuccess: () => showToast("✅ Hero image saved"),
        onError: () => showToast("⚠️ Failed to save hero image"),
      },
    );
  };

  const handleRemoveHero = () => {
    setPageHero.mutate(
      { pageId: heroPageId, imageUrl: null },
      {
        onSuccess: () => {
          setHeroImageUrl("");
          showToast("Hero image removed");
        },
      },
    );
  };

  return (
    <>
      <AdminPanel
        title="🎨 Brand Assets"
        actions={
          <AdminButton variant="primary" onClick={handleSaveBranding}>
            💾 Save Branding
          </AdminButton>
        }
        bodyClassName="panel-bd"
      >
        <FormGrid>
          <div className="fg-item">
            <label>Site Logo</label>
            <SeoImageUpload
              value={draft.logoUrl}
              onChange={(url) => setDraft((d) => ({ ...d, logoUrl: url }))}
              onUpload={(file) => uploadFile(file, "drinsight/branding")}
            />
          </div>
          <div className="fg-item">
            <label>Favicon</label>
            <SeoImageUpload
              value={draft.faviconUrl}
              onChange={(url) => setDraft((d) => ({ ...d, faviconUrl: url }))}
              onUpload={(file) => uploadFile(file, "drinsight/branding")}
            />
          </div>
          <div className="fg-item">
            <label>Footer Logo</label>
            <SeoImageUpload
              value={draft.footerLogoUrl}
              onChange={(url) => setDraft((d) => ({ ...d, footerLogoUrl: url }))}
              onUpload={(file) => uploadFile(file, "drinsight/branding")}
            />
          </div>
          <div className="fg-item">
            <label>Homepage Hero Image</label>
            <SeoImageUpload
              value={draft.heroImageUrl}
              onChange={(url) => setDraft((d) => ({ ...d, heroImageUrl: url }))}
              onUpload={(file) => uploadFile(file, "drinsight/branding")}
            />
          </div>
          <FormItem label="Site Wordmark Text">
            <input
              value={draft.wordmarkText}
              onChange={(e) => setDraft((d) => ({ ...d, wordmarkText: e.target.value }))}
            />
          </FormItem>
          <FormItem label="Tagline">
            <input
              value={draft.tagline}
              onChange={(e) => setDraft((d) => ({ ...d, tagline: e.target.value }))}
            />
          </FormItem>
        </FormGrid>
      </AdminPanel>

      <AdminPanel title="🖼️ Page Hero Images (banner background per page)" bodyClassName="panel-bd">
        <p className="seo-hint" style={{ marginBottom: 12 }}>
          Set a hero banner image for any page of the website. Recommended: wide landscape, ~1600×500px,
          under 400 KB.
        </p>
        <FormGrid>
          <FormItem label="Select Page" full>
            <select
              value={heroPageId}
              onChange={(e) => {
                const id = e.target.value;
                setHeroPageId(id);
                setHeroImageUrl(branding?.pageHeroImages?.[id] ?? "");
              }}
            >
              {CONFIG_PAGE_OPTIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </FormItem>
          <div className="fg-item" style={{ gridColumn: "1 / -1" }}>
            <label>Hero Image</label>
            <SeoImageUpload
              value={heroImageUrl}
              onChange={setHeroImageUrl}
              onUpload={(file) => uploadFile(file, "drinsight/branding/heroes")}
            />
          </div>
        </FormGrid>
        <div className="btn-row" style={{ marginTop: 12 }}>
          <AdminButton variant="primary" onClick={handleSaveHero}>
            💾 Save Hero Image
          </AdminButton>
          <AdminButton variant="danger" onClick={handleRemoveHero}>
            Remove Hero
          </AdminButton>
        </div>
        <div style={{ marginTop: 14 }}>
          {heroKeys.length ? (
            <>
              <div style={{ fontSize: ".74rem", color: "var(--gray-400)", marginBottom: 8 }}>
                Pages with a hero image ({heroKeys.length}):
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: 10,
                }}
              >
                {heroKeys.map((key) => (
                  <div
                    key={key}
                    style={{
                      border: "1.5px solid var(--gray-200)",
                      borderRadius: 9,
                      overflow: "hidden",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={branding?.pageHeroImages?.[key]}
                      alt=""
                      style={{ width: "100%", height: 64, objectFit: "cover", display: "block" }}
                    />
                    <div style={{ fontSize: ".7rem", fontWeight: 600, padding: "5px 8px" }}>
                      {configPageLabel(key)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ fontSize: ".74rem", color: "var(--gray-400)" }}>
              No page hero images set yet.
            </div>
          )}
        </div>
      </AdminPanel>

      <AdminPanel
        title={`🗂 Media Library (${branding?.media?.length ?? 0})`}
        bodyClassName="panel-bd"
      >
        {branding?.media?.length ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
              gap: 10,
            }}
          >
            {branding.media.map((m) => (
              <div
                key={m.id}
                style={{
                  position: "relative",
                  border: "1.5px solid var(--gray-200)",
                  borderRadius: 9,
                  overflow: "hidden",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.url}
                  alt=""
                  style={{ width: "100%", height: 80, objectFit: "cover", display: "block" }}
                />
                <button
                  type="button"
                  className="btn danger"
                  style={{ position: "absolute", top: 4, right: 4, padding: "2px 7px" }}
                  onClick={() =>
                    deleteMedia.mutate(m.id, {
                      onSuccess: () => showToast("Media removed"),
                    })
                  }
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              fontSize: ".8rem",
              color: "var(--gray-400)",
              textAlign: "center",
              padding: 14,
            }}
          >
            No media yet — images you upload above appear here.
          </div>
        )}
      </AdminPanel>
    </>
  );
}
