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
import { useContactDetails, useUpdateContactDetails } from "@/services/configuration-api-hooks";

export function ContactDetailsPageContent() {
  const showToast = useAdminUiStore((s) => s.showToast);
  const contactQuery = useContactDetails();
  const updateContact = useUpdateContactDetails();

  const [draft, setDraft] = useState({
    phone: "",
    whatsapp: "",
    email: "",
    hours: "",
    address: "",
    map: "",
  });
  const [savedSnapshot, setSavedSnapshot] = useState("");

  useEffect(() => {
    if (!contactQuery.data) return;
    const next = {
      phone: contactQuery.data.phone ?? "",
      whatsapp: contactQuery.data.whatsapp ?? "",
      email: contactQuery.data.email ?? "",
      hours: contactQuery.data.hours ?? "",
      address: contactQuery.data.address ?? "",
      map: contactQuery.data.map ?? "",
    };
    setDraft(next);
    setSavedSnapshot(JSON.stringify(next));
  }, [contactQuery.data]);

  const dirty = savedSnapshot !== JSON.stringify(draft);
  useUnsavedChangesWarning(dirty);

  const handleSave = () => {
    updateContact.mutate(draft, {
      onSuccess: () => {
        setSavedSnapshot(JSON.stringify(draft));
        showToast("✅ Contact info saved");
      },
      onError: () => showToast("⚠️ Failed to save contact info"),
    });
  };

  return (
    <AdminPanel
      title="📞 Contact Details (shown across the website)"
      actions={
        <AdminButton variant="primary" onClick={handleSave}>
          💾 Save Contact Info
        </AdminButton>
      }
      bodyClassName="panel-bd"
    >
      <FormGrid>
        <FormItem label="Phone Number">
          <input
            value={draft.phone}
            onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
            placeholder="+1 …"
          />
        </FormItem>
        <FormItem label="WhatsApp Number">
          <input
            value={draft.whatsapp}
            onChange={(e) => setDraft((d) => ({ ...d, whatsapp: e.target.value }))}
          />
        </FormItem>
        <FormItem label="Email Address">
          <input
            value={draft.email}
            onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
            placeholder="drinsightofficial@gmail.com"
          />
        </FormItem>
        <FormItem label="Office Hours">
          <input
            value={draft.hours}
            onChange={(e) => setDraft((d) => ({ ...d, hours: e.target.value }))}
            placeholder="Mon–Fri, 9am–6pm"
          />
        </FormItem>
        <FormItem label="Office Address" full>
          <textarea
            rows={3}
            value={draft.address}
            onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
          />
        </FormItem>
        <FormItem label="Google Maps Link" full>
          <input
            value={draft.map}
            onChange={(e) => setDraft((d) => ({ ...d, map: e.target.value }))}
            placeholder="https://maps.google.com/…"
          />
        </FormItem>
      </FormGrid>
    </AdminPanel>
  );
}
