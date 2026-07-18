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
  useAdvertisements,
  useUpdateAdvertisements,
} from "@/services/configuration-api-hooks";

export function AdvertisementsPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const adsQuery = useAdvertisements();
  const updateAds = useUpdateAdvertisements();

  const [draft, setDraft] = useState({
    adsense: "",
    banner: "",
    sidebar: "",
    inarticle: "",
  });
  const [savedSnapshot, setSavedSnapshot] = useState("");

  useEffect(() => {
    if (!adsQuery.data) return;
    setDraft({
      adsense: adsQuery.data.adsense ?? "",
      banner: adsQuery.data.banner ?? "",
      sidebar: adsQuery.data.sidebar ?? "",
      inarticle: adsQuery.data.inarticle ?? "",
    });
    setSavedSnapshot(JSON.stringify(adsQuery.data));
  }, [adsQuery.data]);

  const dirty = savedSnapshot !== JSON.stringify(draft);
  useUnsavedChangesWarning(dirty);

  const handleSave = () => {
    updateAds.mutate(draft, {
      onSuccess: () => {
        setSavedSnapshot(JSON.stringify(draft));
        showToast("✅ Ad settings saved");
      },
      onError: () => showToast("⚠️ Failed to save ad settings"),
    });
  };

  return (
    <AdminPanel
      title="💰 Advertisement Management"
      actions={
        <AdminButton variant="primary" onClick={handleSave}>
          💾 Save Ad Settings
        </AdminButton>
      }
      bodyClassName="panel-bd"
    >
      <p className="seo-hint" style={{ marginBottom: 12 }}>
        Ad code is stored here; inject into the live site carefully and in line with your ad network
        policies and the site&apos;s Advertising Policy.
      </p>
      <FormGrid>
        <FormItem label="Google AdSense Code" full>
          <textarea
            className="di-code"
            value={draft.adsense}
            onChange={(e) => setDraft((d) => ({ ...d, adsense: e.target.value }))}
          />
        </FormItem>
        <FormItem label="Banner Ad HTML (top of pages)" full>
          <textarea
            className="di-code"
            value={draft.banner}
            onChange={(e) => setDraft((d) => ({ ...d, banner: e.target.value }))}
          />
        </FormItem>
        <FormItem label="Sidebar Ad HTML" full>
          <textarea
            className="di-code"
            value={draft.sidebar}
            onChange={(e) => setDraft((d) => ({ ...d, sidebar: e.target.value }))}
          />
        </FormItem>
        <FormItem label="In-Article Ad HTML" full>
          <textarea
            className="di-code"
            value={draft.inarticle}
            onChange={(e) => setDraft((d) => ({ ...d, inarticle: e.target.value }))}
          />
        </FormItem>
      </FormGrid>
    </AdminPanel>
  );
}
