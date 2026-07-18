"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AdminButton,
  AdminPanel,
  FormGrid,
  FormItem,
  StatusChip,
} from "@/components/admin/ui/AdminPrimitives";
import { SeoImageUpload } from "@/components/admin/site-management/SeoImageUpload";
import { SeoCharCount, SeoSerpPreview } from "@/components/admin/site-management/SeoSerpPreview";
import {
  buildPageSchema,
  downloadTextFile,
  globalDraftFromSettings,
  joinKeywords,
  pageDefaultCanonical,
  splitKeywords,
} from "@/components/admin/site-management/seo-settings-utils";
import { uploadFile } from "@/lib/upload";
import { useAdminUiStore } from "@/store/admin-ui.store";
import {
  useGlobalSeo,
  useRegenerateSitemap,
  useResetSeoPage,
  useSeoPages,
  useUpdateGlobalSeo,
  useUpdateSeoPage,
  type SeoPageSetting,
} from "@/services/cms-api-hooks";

export function SeoSettingsPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const pagesQuery = useSeoPages();
  const globalQuery = useGlobalSeo();
  const updatePage = useUpdateSeoPage();
  const resetPage = useResetSeoPage();
  const updateGlobal = useUpdateGlobalSeo();
  const regenerateSitemap = useRegenerateSitemap();

  const pages = pagesQuery.data ?? [];
  const globalSeo = globalQuery.data;

  const [globalDraft, setGlobalDraft] = useState(globalDraftFromSettings());
  const [selectedPageId, setSelectedPageId] = useState("");
  const [schemaManual, setSchemaManual] = useState(false);
  const [showSocialPreview, setShowSocialPreview] = useState(false);

  const [pageDraft, setPageDraft] = useState({
    focus: "",
    secondary: "",
    metaTitle: "",
    metaDescription: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: "",
    twitterCard: "summary_large_image",
    robots: "index,follow",
    sitemapPriority: 0.5,
    schemaJson: "",
  });

  useEffect(() => {
    if (globalSeo) setGlobalDraft(globalDraftFromSettings(globalSeo));
  }, [globalSeo]);

  useEffect(() => {
    if (!selectedPageId && pages.length) setSelectedPageId(pages[0].id);
  }, [pages, selectedPageId]);

  const selectedPage = useMemo(
    () => pages.find((p) => p.id === selectedPageId) ?? null,
    [pages, selectedPageId],
  );

  const siteUrl = globalDraft.siteUrl || "https://drinsight.org";

  const loadPageDraft = (page: SeoPageSetting) => {
      const { focus, secondary } = splitKeywords(page.metaKeywords ?? []);
      const schema =
        page.schemaJson != null
          ? JSON.stringify(page.schemaJson, null, 2)
          : JSON.stringify(
              buildPageSchema({ ...page, metaKeywords: page.metaKeywords ?? [] }, siteUrl),
              null,
              2,
            );
      setSchemaManual(page.schemaJson != null);
      setPageDraft({
        focus,
        secondary,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription ?? "",
        canonicalUrl: page.canonicalUrl ?? pageDefaultCanonical(siteUrl, page.path),
        ogTitle: page.ogTitle ?? "",
        ogDescription: page.ogDescription ?? "",
        ogImageUrl: page.ogImageUrl ?? globalDraft.socialSharingImageUrl ?? "",
        twitterCard: page.twitterCard ?? "summary_large_image",
        robots: page.robots ?? "index,follow",
        sitemapPriority: page.sitemapPriority ?? 0.5,
        schemaJson: schema,
      });
      setShowSocialPreview(false);
  };

  useEffect(() => {
    if (selectedPage) loadPageDraft(selectedPage);
  }, [selectedPage, siteUrl, globalDraft.socialSharingImageUrl]);

  const customizedPages = pages.filter(
    (p) =>
      (p.metaKeywords?.length ?? 0) > 0 ||
      p.metaDescription ||
      p.canonicalUrl ||
      p.schemaJson ||
      p.ogTitle ||
      p.ogDescription,
  );

  const previewUrl =
    pageDraft.canonicalUrl ||
    (selectedPage ? pageDefaultCanonical(siteUrl, selectedPage.path) : "");

  const patchPageDraft = (patch: Partial<typeof pageDraft>, resetSchema = true) => {
    if (resetSchema) setSchemaManual(false);
    setPageDraft((d) => ({ ...d, ...patch }));
  };

  useEffect(() => {
    if (schemaManual || !selectedPage) return;
    const keywords = joinKeywords(pageDraft.focus, pageDraft.secondary);
    const schema = buildPageSchema(
      {
        pageName: selectedPage.pageName,
        path: selectedPage.path,
        metaTitle: pageDraft.metaTitle,
        metaDescription: pageDraft.metaDescription,
        canonicalUrl: pageDraft.canonicalUrl,
        metaKeywords: keywords,
      },
      siteUrl,
    );
    const next = JSON.stringify(schema, null, 2);
    setPageDraft((d) => (d.schemaJson === next ? d : { ...d, schemaJson: next }));
  }, [
    pageDraft.focus,
    pageDraft.secondary,
    pageDraft.metaTitle,
    pageDraft.metaDescription,
    pageDraft.canonicalUrl,
    schemaManual,
    selectedPage,
    siteUrl,
  ]);

  const handleSaveGlobal = () => {
    let globalSchemaJson: Record<string, unknown> | undefined;
    if (globalDraft.globalSchemaJson.trim()) {
      try {
        globalSchemaJson = JSON.parse(globalDraft.globalSchemaJson);
      } catch {
        showToast("⚠️ Invalid JSON-LD schema");
        return;
      }
    }
    updateGlobal.mutate(
      {
        siteTitle: globalDraft.siteTitle,
        defaultMetaTitleSuffix: globalDraft.defaultMetaTitleSuffix,
        defaultMetaDescription: globalDraft.defaultMetaDescription,
        defaultMetaKeywords: globalDraft.defaultMetaKeywords,
        ogTitle: globalDraft.ogTitle,
        ogDescription: globalDraft.ogDescription,
        twitterHandle: globalDraft.twitterHandle,
        globalSchemaJson,
        googleSearchConsole: globalDraft.googleSearchConsole,
        googleAnalyticsId: globalDraft.googleAnalyticsId,
        xmlSitemapUrl: globalDraft.xmlSitemapUrl,
        robotsTxt: globalDraft.robotsTxt,
        sitemapXml: globalDraft.sitemapXml,
        siteUrl: globalDraft.siteUrl,
        faviconUrl: globalDraft.faviconUrl,
        socialSharingImageUrl: globalDraft.socialSharingImageUrl,
      },
      {
        onSuccess: () => showToast("✅ Global SEO settings saved"),
      },
    );
  };

  const handleSavePage = () => {
    if (!selectedPage) return;
    let schemaJson: Record<string, unknown> | undefined;
    if (pageDraft.schemaJson.trim()) {
      try {
        schemaJson = JSON.parse(pageDraft.schemaJson);
      } catch {
        showToast("⚠️ Invalid JSON-LD schema");
        return;
      }
    }
    const keywords = joinKeywords(pageDraft.focus, pageDraft.secondary);
    updatePage.mutate(
      {
        id: selectedPage.id,
        metaTitle: pageDraft.metaTitle,
        metaDescription: pageDraft.metaDescription || undefined,
        metaKeywords: keywords,
        canonicalUrl: pageDraft.canonicalUrl || undefined,
        ogTitle: pageDraft.ogTitle || undefined,
        ogDescription: pageDraft.ogDescription || undefined,
        ogImageUrl: pageDraft.ogImageUrl || undefined,
        twitterCard: pageDraft.twitterCard,
        robots: pageDraft.robots,
        sitemapPriority: Number(pageDraft.sitemapPriority),
        schemaJson,
      },
      {
        onSuccess: () => {
          const label =
            selectedPage.path === "/" ? "the homepage" : `${selectedPage.path}`;
          showToast(`✅ Page SEO saved — live on ${label}`);
        },
      },
    );
  };

  const handleResetPage = () => {
    if (!selectedPage) return;
    resetPage.mutate(selectedPage.id, {
      onSuccess: () => showToast("Page SEO reset"),
    });
  };

  const handleRegenSchema = () => {
    setSchemaManual(false);
    if (!selectedPage) return;
    const keywords = joinKeywords(pageDraft.focus, pageDraft.secondary);
    const schema = buildPageSchema(
      {
        pageName: selectedPage.pageName,
        path: selectedPage.path,
        metaTitle: pageDraft.metaTitle,
        metaDescription: pageDraft.metaDescription,
        canonicalUrl: pageDraft.canonicalUrl,
        metaKeywords: keywords,
      },
      siteUrl,
    );
    setPageDraft((d) => ({ ...d, schemaJson: JSON.stringify(schema, null, 2) }));
    showToast("🔄 WebPage schema regenerated");
  };

  return (
    <>
      <AdminPanel title="🔍 Global SEO & Meta Tags" bodyClassName="panel-bd">
        <FormGrid>
          <FormItem label="Site Title" full>
            <input
              value={globalDraft.siteTitle}
              onChange={(e) => setGlobalDraft((d) => ({ ...d, siteTitle: e.target.value }))}
              placeholder="The Dr Insight — Trusted, Doctor-Reviewed Medical Information"
            />
          </FormItem>
          <FormItem label="Default Meta Description" full>
            <textarea
              rows={2}
              value={globalDraft.defaultMetaDescription}
              onChange={(e) =>
                setGlobalDraft((d) => ({ ...d, defaultMetaDescription: e.target.value }))
              }
              placeholder="Evidence-based medical information reviewed by board-certified physicians."
            />
          </FormItem>
          <FormItem label="Meta Keywords">
            <input
              value={globalDraft.defaultMetaKeywords}
              onChange={(e) =>
                setGlobalDraft((d) => ({ ...d, defaultMetaKeywords: e.target.value }))
              }
              placeholder="health, doctor, medical advice"
            />
          </FormItem>
          <FormItem label="Default Title Suffix">
            <input
              value={globalDraft.defaultMetaTitleSuffix}
              onChange={(e) =>
                setGlobalDraft((d) => ({ ...d, defaultMetaTitleSuffix: e.target.value }))
              }
              placeholder=" | DrInsight"
            />
          </FormItem>
        </FormGrid>
      </AdminPanel>

      <AdminPanel title="📣 Open Graph & Twitter Cards" bodyClassName="panel-bd">
        <FormGrid>
          <FormItem label="OG Title">
            <input
              value={globalDraft.ogTitle}
              onChange={(e) => setGlobalDraft((d) => ({ ...d, ogTitle: e.target.value }))}
            />
          </FormItem>
          <FormItem label="Twitter Handle">
            <input
              value={globalDraft.twitterHandle}
              onChange={(e) => setGlobalDraft((d) => ({ ...d, twitterHandle: e.target.value }))}
              placeholder="@drinsight"
            />
          </FormItem>
          <FormItem label="OG Description" full>
            <textarea
              rows={2}
              value={globalDraft.ogDescription}
              onChange={(e) => setGlobalDraft((d) => ({ ...d, ogDescription: e.target.value }))}
            />
          </FormItem>
        </FormGrid>
      </AdminPanel>

      {/* ── Analytics & Verification (reference layout) ── */}
      <AdminPanel title="📈 Analytics & Verification" bodyClassName="panel-bd">
        <FormGrid>
          <FormItem label="Google Analytics ID">
            <input
              value={globalDraft.googleAnalyticsId}
              onChange={(e) => setGlobalDraft((d) => ({ ...d, googleAnalyticsId: e.target.value }))}
              placeholder="G-XXXXXXX"
            />
          </FormItem>
          <FormItem label="Search Console Verification">
            <input
              value={globalDraft.googleSearchConsole}
              onChange={(e) => setGlobalDraft((d) => ({ ...d, googleSearchConsole: e.target.value }))}
              placeholder="verification token"
            />
          </FormItem>

          <details className="seo-more-settings">
            <summary>Site defaults, branding &amp; social sharing</summary>
            <div className="seo-more-bd">
              <FormGrid>
                <FormItem label="Site URL" full>
                  <input
                    value={globalDraft.siteUrl}
                    onChange={(e) => setGlobalDraft((d) => ({ ...d, siteUrl: e.target.value }))}
                    placeholder="https://drinsight.org"
                  />
                </FormItem>
                <FormItem label="Default Meta Title Suffix">
                  <input
                    value={globalDraft.defaultMetaTitleSuffix}
                    onChange={(e) =>
                      setGlobalDraft((d) => ({ ...d, defaultMetaTitleSuffix: e.target.value }))
                    }
                    placeholder=" | DrInsight"
                  />
                </FormItem>
                <FormItem label="XML Sitemap URL">
                  <input
                    value={globalDraft.xmlSitemapUrl}
                    onChange={(e) => setGlobalDraft((d) => ({ ...d, xmlSitemapUrl: e.target.value }))}
                    placeholder="https://drinsight.org/sitemap.xml"
                  />
                </FormItem>
                <FormItem label="Default Meta Description" full>
                  <textarea
                    rows={2}
                    value={globalDraft.defaultMetaDescription}
                    onChange={(e) =>
                      setGlobalDraft((d) => ({ ...d, defaultMetaDescription: e.target.value }))
                    }
                    placeholder="Evidence-based medical information reviewed by board-certified physicians."
                  />
                </FormItem>
                <div className="fg-item">
                  <label>Favicon</label>
                  <SeoImageUpload
                    value={globalDraft.faviconUrl}
                    onChange={(url) => setGlobalDraft((d) => ({ ...d, faviconUrl: url }))}
                    onUpload={(file) => uploadFile(file, "drinsight/seo")}
                  />
                </div>
                <div className="fg-item">
                  <label>Default Social Sharing Image</label>
                  <SeoImageUpload
                    value={globalDraft.socialSharingImageUrl}
                    onChange={(url) => setGlobalDraft((d) => ({ ...d, socialSharingImageUrl: url }))}
                    onUpload={(file) => uploadFile(file, "drinsight/seo")}
                  />
                </div>
              </FormGrid>
            </div>
          </details>
        </FormGrid>
      </AdminPanel>

      <AdminPanel title="🧬 Schema Markup (JSON-LD)" bodyClassName="panel-bd">
        <textarea
          className="di-code"
          value={globalDraft.globalSchemaJson}
          onChange={(e) => setGlobalDraft((d) => ({ ...d, globalSchemaJson: e.target.value }))}
        />
      </AdminPanel>

      {/* ── robots.txt ── */}
      <AdminPanel title="🤖 robots.txt" bodyClassName="panel-bd">
        <textarea
          className="di-code"
          value={globalDraft.robotsTxt}
          onChange={(e) => setGlobalDraft((d) => ({ ...d, robotsTxt: e.target.value }))}
        />
        <p className="seo-hint">
          robots.txt and sitemap.xml must be uploaded as files at your domain root.
        </p>
      </AdminPanel>

      {/* ── 3. sitemap.xml ── */}
      <AdminPanel title="🗺 sitemap.xml" bodyClassName="panel-bd">
        <textarea
          className="di-code"
          value={globalDraft.sitemapXml}
          onChange={(e) => setGlobalDraft((d) => ({ ...d, sitemapXml: e.target.value }))}
        />
        <div className="btn-row" style={{ marginTop: 10 }}>
          <AdminButton
            onClick={() =>
              regenerateSitemap.mutate(undefined, {
                onSuccess: (data) => {
                  setGlobalDraft((d) => ({ ...d, sitemapXml: data.sitemapXml }));
                  showToast("🔄 Sitemap regenerated — click Save to keep it");
                },
              })
            }
          >
            🔄 Regenerate from Pages
          </AdminButton>
          <AdminButton onClick={() => downloadTextFile("sitemap.xml", globalDraft.sitemapXml)}>
            ⬇ Download sitemap.xml
          </AdminButton>
        </div>
        <p className="seo-hint">
          Regenerate builds one URL per site page using your Site URL from Settings. Download the
          file and upload it to your domain root.
        </p>
      </AdminPanel>

      {/* ── 4. Global save (standalone, as in reference) ── */}
      <div className="seo-save-global">
        <AdminButton variant="primary" onClick={() => !updateGlobal.isPending && handleSaveGlobal()}>
          💾 Save All Global SEO Settings
        </AdminButton>
      </div>

      {/* ── 5. Per-Page SEO ── */}
      <AdminPanel title="📄 Per-Page SEO" bodyClassName="panel-bd">
        <p className="seo-intro">
          Set the <strong>primary &amp; secondary focus keywords, meta title, meta description, canonical URL and JSON-LD schema</strong> for each page. Article, Research Publication and Doctor Profile pages are managed in their own SEO editors. Saved settings apply live on each page via <code>assets/page-seo.js</code>.
        </p>

        <FormGrid>
          <FormItem label="Select Page" full>
            <select
              value={selectedPageId}
              onChange={(e) => setSelectedPageId(e.target.value)}
              disabled={!pages.length}
            >
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.pageName}
                </option>
              ))}
            </select>
          </FormItem>

          <div className="fg-item">
            <label>Primary Focus Keyword</label>
            <input
              value={pageDraft.focus}
              onChange={(e) => patchPageDraft({ focus: e.target.value })}
              placeholder="e.g. online doctor consultation"
            />
          </div>

          <div className="fg-item">
            <label>
              Secondary Focus Keywords{" "}
              <span className="seo-label-muted">(comma-separated)</span>
            </label>
            <input
              value={pageDraft.secondary}
              onChange={(e) => patchPageDraft({ secondary: e.target.value })}
              placeholder="e.g. ask a doctor, medical advice online"
            />
          </div>

          <div className="fg-item">
            <label>
              Meta Title <SeoCharCount value={pageDraft.metaTitle} max={60} />
            </label>
            <input
              value={pageDraft.metaTitle}
              onChange={(e) => patchPageDraft({ metaTitle: e.target.value })}
              placeholder="≤ 60 characters"
            />
          </div>

          <div className="fg-item full">
            <label>
              Meta Description <SeoCharCount value={pageDraft.metaDescription} max={160} />
            </label>
            <textarea
              rows={2}
              value={pageDraft.metaDescription}
              onChange={(e) => patchPageDraft({ metaDescription: e.target.value })}
              placeholder="≤ 160 characters"
            />
          </div>

          <div className="fg-item full">
            <label>
              Page URL <span className="seo-label-muted">(canonical link)</span>
            </label>
            <input
              value={pageDraft.canonicalUrl}
              onChange={(e) => patchPageDraft({ canonicalUrl: e.target.value }, false)}
              placeholder={
                selectedPage
                  ? pageDefaultCanonical(siteUrl, selectedPage.path)
                  : "https://www.drinsight.org/about.html"
              }
            />
          </div>

          <details className="seo-more-settings">
            <summary>Open Graph, Twitter Card &amp; robots</summary>
            <div className="seo-more-bd">
              <FormGrid>
                <FormItem label="Open Graph Title" full>
                  <input
                    value={pageDraft.ogTitle}
                    onChange={(e) => setPageDraft((d) => ({ ...d, ogTitle: e.target.value }))}
                    placeholder={pageDraft.metaTitle}
                  />
                </FormItem>
                <FormItem label="Open Graph Description" full>
                  <textarea
                    rows={2}
                    value={pageDraft.ogDescription}
                    onChange={(e) => setPageDraft((d) => ({ ...d, ogDescription: e.target.value }))}
                    placeholder={pageDraft.metaDescription}
                  />
                </FormItem>
                <div className="fg-item full">
                  <label>Open Graph / Social Image</label>
                  <SeoImageUpload
                    value={pageDraft.ogImageUrl}
                    onChange={(url) => setPageDraft((d) => ({ ...d, ogImageUrl: url }))}
                    onUpload={(file) => uploadFile(file, "drinsight/seo")}
                  />
                </div>
                <FormItem label="Twitter Card">
                  <select
                    value={pageDraft.twitterCard}
                    onChange={(e) => setPageDraft((d) => ({ ...d, twitterCard: e.target.value }))}
                  >
                    <option value="summary">summary</option>
                    <option value="summary_large_image">summary_large_image</option>
                  </select>
                </FormItem>
                <FormItem label="Robots">
                  <input
                    value={pageDraft.robots}
                    onChange={(e) => setPageDraft((d) => ({ ...d, robots: e.target.value }))}
                    placeholder="index,follow"
                  />
                </FormItem>
                <FormItem label="Sitemap Priority">
                  <input
                    type="number"
                    min={0}
                    max={1}
                    step={0.1}
                    value={pageDraft.sitemapPriority}
                    onChange={(e) =>
                      setPageDraft((d) => ({ ...d, sitemapPriority: Number(e.target.value) }))
                    }
                  />
                </FormItem>
              </FormGrid>
            </div>
          </details>
        </FormGrid>

        <SeoSerpPreview
          title={pageDraft.metaTitle || selectedPage?.pageName || ""}
          url={previewUrl}
          description={pageDraft.metaDescription}
          focus={pageDraft.focus}
          secondary={pageDraft.secondary}
        />

        <div className="fg-item full">
          <label className="seo-schema-label">
            <span>
              Schema Markup (JSON-LD){" "}
              <span className="seo-label-muted">— auto-generated · WebPage</span>
            </span>
            <AdminButton onClick={handleRegenSchema}>🔄 Regenerate</AdminButton>
          </label>
          <textarea
            className="di-code"
            rows={12}
            value={pageDraft.schemaJson}
            onChange={(e) => {
              setSchemaManual(true);
              setPageDraft((d) => ({ ...d, schemaJson: e.target.value }));
            }}
          />
        </div>

        <div className="btn-row" style={{ marginTop: 12 }}>
          <AdminButton variant="primary" onClick={() => !updatePage.isPending && handleSavePage()}>
            💾 Save Page SEO
          </AdminButton>
          <AdminButton onClick={handleResetPage}>Reset This Page</AdminButton>
          <AdminButton onClick={() => setShowSocialPreview((v) => !v)}>👁 Preview</AdminButton>
        </div>

        {showSocialPreview ? (
          <div className="seo-social-preview">
            <div className="seo-social-preview-kicker">Social share preview</div>
            {pageDraft.ogImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pageDraft.ogImageUrl}
                alt=""
                style={{
                  width: "100%",
                  maxHeight: 200,
                  objectFit: "cover",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              />
            ) : null}
            <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 6 }}>
              {pageDraft.ogTitle || pageDraft.metaTitle || selectedPage?.pageName}
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--gray-500)" }}>
              {pageDraft.ogDescription || pageDraft.metaDescription}
            </div>
          </div>
        ) : null}

        <div style={{ marginTop: 14 }}>
          {customizedPages.length ? (
            <>
              <div className="seo-custom-list">
                Pages with custom SEO ({customizedPages.length}):
              </div>
              <div className="seo-chip-row">
                {customizedPages.map((p) => (
                  <StatusChip key={p.id} label={p.pageName} className="ch-b" />
                ))}
              </div>
            </>
          ) : (
            <div className="seo-custom-list">No per-page SEO customised yet.</div>
          )}
        </div>
      </AdminPanel>
    </>
  );
}
