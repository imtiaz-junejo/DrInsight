"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type MenuItem = { label: string; href: string };

export type SiteBranding = {
  logoUrl: string;
  faviconUrl: string;
  footerLogoUrl: string;
  heroImageUrl: string;
  wordmarkText: string;
  tagline: string;
  pageHeroImages: Record<string, string>;
  media: Array<{ id: string; url: string; label?: string | null; mimeType?: string | null }>;
};

export type ContactDetails = {
  phone: string;
  whatsapp: string;
  email: string;
  hours: string;
  address: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string;
  map: string;
};

export type AdvertisementSettings = {
  adsense: string;
  banner: string;
  sidebar: string;
  inarticle: string;
};

export type GeneralSettings = {
  siteName: string;
  siteUrl: string;
  timezone: string;
  smtpHost: string;
  smtpFrom: string;
  smtpPassword: string;
  smtpPasswordConfigured: boolean;
  emailJsServiceId: string;
  emailJsTemplateId: string;
  emailJsPublicKey: string;
  smsProvider: "textbelt" | "custom";
  smsApiKey: string;
  smsApiKeyConfigured: boolean;
  smsCustomUrl: string;
  smsSenderName: string;
  smsTestNumber: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
};

export type PublicSiteConfig = {
  siteName: string;
  siteUrl: string;
  tagline: string;
  wordmarkText: string;
  logoUrl: string;
  footerLogoUrl: string;
  faviconUrl: string;
  heroImageUrl: string;
  headerMenu: MenuItem[];
  footerMenu: MenuItem[];
  contact: ContactDetails;
  socialLinks: GeneralSettings["socialLinks"];
  pageHeroImages: Record<string, string>;
  advertisements: { banner: string; sidebar: string; inarticle: string };
};

export function useSiteBranding() {
  return useQuery({
    queryKey: ["admin-branding"],
    queryFn: async () => {
      const { data } = await api.get<SiteBranding>("/site-admin/configuration/branding");
      return data;
    },
  });
}

export function useUpdateSiteBranding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<SiteBranding>) => {
      const { data } = await api.patch("/site-admin/configuration/branding", body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-branding"] });
      qc.invalidateQueries({ queryKey: ["public-site-config"] });
    },
  });
}

export function useSetPageHero() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ pageId, imageUrl }: { pageId: string; imageUrl: string | null }) => {
      const { data } = await api.patch(`/site-admin/configuration/page-hero/${pageId}`, { imageUrl });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-branding"] }),
  });
}

export function useDeleteMediaAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/site-admin/configuration/media/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-branding"] }),
  });
}

export function useSiteMenus() {
  return useQuery({
    queryKey: ["admin-menus"],
    queryFn: async () => {
      const { data } = await api.get<{ header: MenuItem[]; footer: MenuItem[] }>(
        "/site-admin/configuration/menus",
      );
      return data;
    },
  });
}

export function useUpdateSiteMenus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { header: MenuItem[]; footer: MenuItem[] }) => {
      const { data } = await api.put("/site-admin/configuration/menus", body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-menus"] });
      qc.invalidateQueries({ queryKey: ["public-site-config"] });
    },
  });
}

export function useContactDetails() {
  return useQuery({
    queryKey: ["admin-contact-details"],
    queryFn: async () => {
      const { data } = await api.get<ContactDetails>("/site-admin/configuration/contact");
      return data;
    },
  });
}

export function useUpdateContactDetails() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<ContactDetails>) => {
      const { data } = await api.patch("/site-admin/configuration/contact", body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-contact-details"] });
      qc.invalidateQueries({ queryKey: ["public-site-config"] });
    },
  });
}

export function useAdvertisements() {
  return useQuery({
    queryKey: ["admin-advertisements"],
    queryFn: async () => {
      const { data } = await api.get<AdvertisementSettings>("/site-admin/configuration/advertisements");
      return data;
    },
  });
}

export function useUpdateAdvertisements() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: AdvertisementSettings) => {
      const { data } = await api.patch("/site-admin/configuration/advertisements", body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-advertisements"] });
      qc.invalidateQueries({ queryKey: ["public-site-config"] });
    },
  });
}

export function useGeneralSettings() {
  return useQuery({
    queryKey: ["admin-general-settings"],
    queryFn: async () => {
      const { data } = await api.get<GeneralSettings>("/site-admin/configuration/settings");
      return data;
    },
  });
}

export function useUpdateGeneralSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<GeneralSettings> & Record<string, unknown>) => {
      const { data } = await api.patch("/site-admin/configuration/settings", body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-general-settings"] });
      qc.invalidateQueries({ queryKey: ["public-site-config"] });
      qc.invalidateQueries({ queryKey: ["admin-seo-global"] });
    },
  });
}

export function useTestSmsOtp() {
  return useMutation({
    mutationFn: async (phone: string) => {
      const { data } = await api.post<{ ok: boolean; message: string }>(
        "/site-admin/configuration/settings/test-sms",
        { phone },
      );
      return data;
    },
  });
}

export function useSecuritySettings() {
  return useQuery({
    queryKey: ["admin-security-settings"],
    queryFn: async () => {
      const { data } = await api.get<{ requireTwoFactor: boolean }>(
        "/site-admin/configuration/security",
      );
      return data;
    },
  });
}

export function useUpdateSecuritySettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { requireTwoFactor?: boolean }) => {
      const { data } = await api.patch("/site-admin/configuration/security", body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-security-settings"] }),
  });
}

export function useChangeAdminPassword() {
  return useMutation({
    mutationFn: async (body: { newPassword: string; confirmPassword: string }) => {
      const { data } = await api.post("/site-admin/configuration/security/change-password", body);
      return data;
    },
  });
}

export function useExportConfigurationBackup() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.get<Record<string, unknown>>("/site-admin/configuration/backup/export");
      return data;
    },
  });
}

export function useRestoreConfigurationBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post("/site-admin/configuration/backup/restore", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries();
    },
  });
}

export function usePublicSiteConfig() {
  return useQuery({
    queryKey: ["public-site-config"],
    queryFn: async () => {
      const { data } = await api.get<PublicSiteConfig>("/site-admin/public/site-config");
      return data;
    },
    staleTime: 60_000,
  });
}

export function usePublicAdvertisements() {
  return useQuery({
    queryKey: ["public-advertisements"],
    queryFn: async () => {
      const { data } = await api.get<AdvertisementSettings>("/site-admin/public/advertisements");
      return data;
    },
    staleTime: 60_000,
  });
}
