"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type FaqStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type ContentPublishStatus = "DRAFT" | "PUBLISHED";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  isActive: boolean;
  priority?: number;
  status?: FaqStatus;
  tags?: string[];
  relatedSpecialty?: string | null;
  relatedService?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomepageSectionConfig {
  headline?: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  imageUrl?: string;
  icon?: string;
  ctaText?: string;
  accentColor?: string;
  buttons?: Array<{ label: string; href: string; variant?: string }>;
  items?: Array<{ title?: string; subtitle?: string; icon?: string; description?: string; href?: string }>;
  stats?: Array<{ value?: string; label?: string }>;
  badges?: string[];
  [key: string]: unknown;
}

export interface HomepageSection {
  id: string;
  slug: string;
  title: string;
  displayOrder: number;
  isVisible: boolean;
  status?: ContentPublishStatus;
  config?: HomepageSectionConfig | null;
  draftConfig?: HomepageSectionConfig | null;
  updatedAt?: string;
}

export interface SeoPageSetting {
  id: string;
  pageName: string;
  path: string;
  metaTitle: string;
  metaDescription?: string | null;
  metaKeywords?: string[];
  canonicalUrl?: string | null;
  slug?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  twitterCard?: string | null;
  robots?: string | null;
  schemaJson?: Record<string, unknown> | null;
  sitemapPriority?: number | null;
  status?: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  inquiryType?: string | null;
  status: string;
  isRead?: boolean;
  createdAt: string;
  archivedAt?: string | null;
  assignedStaff?: { id: string; firstName: string; lastName: string; email?: string } | null;
  assignedStaffId?: string | null;
}

export interface ContactInquiryDetail extends ContactInquiry {
  attachments?: unknown;
  replies?: Array<{
    id: string;
    message: string;
    isInternal: boolean;
    createdAt: string;
    author?: { id: string; firstName: string; lastName: string };
  }>;
  notes?: Array<{
    id: string;
    note: string;
    createdAt: string;
    author?: { id: string; firstName: string; lastName: string };
  }>;
}

export interface CmsPageSection {
  id: string;
  title: string;
  contentHtml?: string | null;
  displayOrder: number;
  isVisible: boolean;
  updatedAt: string;
}

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  heroSubtitle?: string | null;
  lastUpdated?: string | null;
  version?: string | null;
  extra?: Record<string, unknown> | null;
  sections: CmsPageSection[];
}

export interface HealthToolItem {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  iconEmoji?: string | null;
  isActive: boolean;
  usageLast30Days: number;
  displayOrder?: number;
  category?: string | null;
  route?: string | null;
  featured?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  metaKeywords?: string[];
  settings?: Record<string, unknown> | null;
}

export interface AuditLogEntry {
  id: string;
  actorUserId?: string | null;
  actorName: string;
  actorRole?: string | null;
  actorEmail?: string | null;
  action: string;
  target?: string | null;
  ipAddress?: string | null;
  result: string;
  severity: string;
  category: string;
  createdAt: string;
}

export interface BlogCommentAdmin {
  id: string;
  authorName: string;
  authorEmail?: string | null;
  content: string;
  status: string;
  createdAt: string;
  post: { title: string; slug: string };
}

export function useAdminNavBadges() {
  return useQuery({
    queryKey: ["admin-nav-badges"],
    queryFn: async () => {
      const { data } = await api.get<Record<string, number>>("/site-admin/nav-badges");
      return data;
    },
    refetchInterval: 60_000,
  });
}

export function useAuditLogs(params?: { page?: number; limit?: number; category?: string }) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: async () => {
      const { data } = await api.get<{
        data: AuditLogEntry[];
        meta: { total: number; page: number; limit: number; totalPages: number };
        stats: {
          events24h: number;
          adminActions24h: number;
          failedLogins24h: number;
          openAlerts: number;
          latestCritical: AuditLogEntry | null;
        };
      }>("/audit-logs", { params });
      return data;
    },
  });
}

export function useAcknowledgeAuditAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.patch("/audit-logs/alerts/acknowledge");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-nav-badges"] });
    },
  });
}

export function useAdminBlogComments(params?: { status?: string; page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ["admin-blog-comments", params],
    queryFn: async () => {
      const { data } = await api.get<{
        data: BlogCommentAdmin[];
        meta: { total: number; page: number; limit: number; totalPages: number };
        stats: { totalAll: number; approved: number; pending: number; rejected: number };
      }>("/blog/comments/manage", { params });
      return data;
    },
  });
}

export function useUpdateBlogCommentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch(`/blog/comments/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-comments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-nav-badges"] });
    },
  });
}

export function useFaqs(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  sort?: string;
}) {
  return useQuery({
    queryKey: ["admin-faqs", params],
    queryFn: async () => {
      const { data } = await api.get<
        FaqItem[] | { data: FaqItem[]; meta: { total: number; page: number; limit: number; totalPages: number } }
      >("/site-admin/faqs", { params: params?.page ? params : undefined });
      if (Array.isArray(data)) return { data, meta: { total: data.length, page: 1, limit: data.length, totalPages: 1 } };
      return data;
    },
  });
}

export function useFaq(id: string | null) {
  return useQuery({
    queryKey: ["admin-faq", id],
    queryFn: async () => {
      const { data } = await api.get<FaqItem>(`/site-admin/faqs/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { question: string; answer: string; category: string }) => {
      const { data } = await api.post<FaqItem>("/site-admin/faqs", body);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-faqs"] }),
  });
}

export function useUpdateFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<FaqItem> & { id: string }) => {
      const { data } = await api.patch<FaqItem>(`/site-admin/faqs/${id}`, body);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-faqs"] }),
  });
}

export function useDeleteFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/site-admin/faqs/${id}`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-faqs"] }),
  });
}

export function useDuplicateFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<FaqItem>(`/site-admin/faqs/${id}/duplicate`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-faqs"] }),
  });
}

export function useHomepageSections() {
  return useQuery({
    queryKey: ["admin-homepage-sections"],
    queryFn: async () => {
      const { data } = await api.get<HomepageSection[]>("/site-admin/homepage-sections");
      return data;
    },
  });
}

export function useUpdateHomepageSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<HomepageSection> & { id: string }) => {
      const { data } = await api.patch(`/site-admin/homepage-sections/${id}`, body);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-homepage-sections"] }),
  });
}

export function useReorderHomepageSections() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: Array<{ id: string; displayOrder: number }>) => {
      const { data } = await api.patch("/site-admin/homepage-sections/reorder", { items });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-homepage-sections"] }),
  });
}

export function usePublishHomepageSections() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/site-admin/homepage-sections/publish");
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-homepage-sections"] }),
  });
}

export function useHomepageSection(id: string | null) {
  return useQuery({
    queryKey: ["admin-homepage-section", id],
    queryFn: async () => {
      const { data } = await api.get<HomepageSection>(`/site-admin/homepage-sections/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useSaveHomepageSectionDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: {
      id: string;
      title?: string;
      isVisible?: boolean;
      draftConfig?: HomepageSectionConfig;
    }) => {
      const { data } = await api.patch(`/site-admin/homepage-sections/${id}/draft`, body);
      return data;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin-homepage-sections"] });
      queryClient.invalidateQueries({ queryKey: ["admin-homepage-section", vars.id] });
    },
  });
}

export function usePublishHomepageSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/site-admin/homepage-sections/${id}/publish`);
      return data;
    },
    onSuccess: (_d, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin-homepage-sections"] });
      queryClient.invalidateQueries({ queryKey: ["admin-homepage-section", id] });
    },
  });
}

export function useRevertHomepageSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/site-admin/homepage-sections/${id}/revert`);
      return data;
    },
    onSuccess: (_d, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin-homepage-sections"] });
      queryClient.invalidateQueries({ queryKey: ["admin-homepage-section", id] });
    },
  });
}

export function useDuplicateHomepageSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/site-admin/homepage-sections/${id}/duplicate`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-homepage-sections"] }),
  });
}

export function useSeoPages() {
  return useQuery({
    queryKey: ["admin-seo-pages"],
    queryFn: async () => {
      const { data } = await api.get<SeoPageSetting[]>("/site-admin/seo/pages");
      return data;
    },
  });
}

export function useGlobalSeo() {
  return useQuery({
    queryKey: ["admin-seo-global"],
    queryFn: async () => {
      const { data } = await api.get<GlobalSeoSettings>("/site-admin/seo/global");
      return data;
    },
  });
}

export interface GlobalSeoSettings {
  siteTitle: string;
  defaultMetaTitleSuffix: string;
  defaultMetaDescription: string;
  defaultMetaKeywords: string;
  ogTitle: string;
  ogDescription: string;
  twitterHandle: string;
  globalSchemaJson: Record<string, unknown>;
  googleSearchConsole: string;
  googleAnalyticsId: string;
  xmlSitemapUrl: string;
  robotsTxt: string;
  sitemapXml: string;
  siteUrl: string;
  faviconUrl: string;
  socialSharingImageUrl: string;
}

export function useSeoPage(id: string | null) {
  return useQuery({
    queryKey: ["admin-seo-page", id],
    queryFn: async () => {
      const { data } = await api.get<SeoPageSetting>(`/site-admin/seo/pages/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useUpdateSeoPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<SeoPageSetting> & { id: string }) => {
      const { data } = await api.patch(`/site-admin/seo/pages/${id}`, body);
      return data;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin-seo-pages"] });
      queryClient.invalidateQueries({ queryKey: ["admin-seo-page", vars.id] });
    },
  });
}

export function useResetSeoPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/site-admin/seo/pages/${id}/reset`);
      return data;
    },
    onSuccess: (_d, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin-seo-pages"] });
      queryClient.invalidateQueries({ queryKey: ["admin-seo-page", id] });
    },
  });
}

export function useUpdateGlobalSeo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<GlobalSeoSettings>) => {
      const { data } = await api.patch("/site-admin/seo/global", body);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-seo-global"] }),
  });
}

export function useRegenerateSitemap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ sitemapXml: string }>("/site-admin/seo/sitemap/regenerate");
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-seo-global"] }),
  });
}

export function useCmsPage(slug: string) {
  return useQuery({
    queryKey: ["admin-cms-page", slug],
    queryFn: async () => {
      const { data } = await api.get<CmsPage>(`/site-admin/cms-pages/${slug}`);
      return data;
    },
  });
}

export function useUpdateCmsPage(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<CmsPage>) => {
      const { data } = await api.patch<CmsPage>(`/site-admin/cms-pages/${slug}`, body);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-cms-page", slug] }),
  });
}

export function useUpdateCmsSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      slug,
      ...body
    }: Partial<CmsPageSection> & { id: string; slug: string }) => {
      const { data } = await api.patch(`/site-admin/cms-sections/${id}`, body);
      return data;
    },
    onSuccess: (_data, vars) => queryClient.invalidateQueries({ queryKey: ["admin-cms-page", vars.slug] }),
  });
}

export function useCreateCmsSection(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { title: string; contentHtml?: string }) => {
      const { data } = await api.post(`/site-admin/cms-pages/${slug}/sections`, body);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-cms-page", slug] }),
  });
}

export function useHealthTools() {
  return useQuery({
    queryKey: ["admin-health-tools"],
    queryFn: async () => {
      const { data } = await api.get<HealthToolItem[]>("/site-admin/health-tools");
      return data;
    },
  });
}

export function useUpdateHealthTool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<HealthToolItem> & { id: string }) => {
      const { data } = await api.patch(`/site-admin/health-tools/${id}`, body);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-health-tools"] }),
  });
}

export function useCreateHealthTool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<HealthToolItem> & { slug: string; name: string }) => {
      const { data } = await api.post("/site-admin/health-tools", body);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-health-tools"] }),
  });
}

export function useHealthTool(id: string | null) {
  return useQuery({
    queryKey: ["admin-health-tool", id],
    queryFn: async () => {
      const { data } = await api.get<HealthToolItem>(`/site-admin/health-tools/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useDeleteHealthTool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/site-admin/health-tools/${id}`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-health-tools"] }),
  });
}

export function useReorderHealthTools() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: Array<{ id: string; displayOrder: number }>) => {
      const { data } = await api.patch("/site-admin/health-tools/reorder", { items });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-health-tools"] }),
  });
}

export function useAdminContactInquiries(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  inquiryType?: string;
  sort?: string;
}) {
  return useQuery({
    queryKey: ["admin-contact-inquiries", params],
    queryFn: async () => {
      const { data } = await api.get<{
        data: ContactInquiry[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>("/contact/submissions", { params: { page: params?.page ?? 1, limit: params?.limit ?? 20, ...params } });
      return data;
    },
  });
}

export function useContactInquiry(id: string | null) {
  return useQuery({
    queryKey: ["admin-contact-inquiry", id],
    queryFn: async () => {
      const { data } = await api.get<ContactInquiryDetail>(`/contact/submissions/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useAssignContactInquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, assignedStaffId }: { id: string; assignedStaffId: string | null }) => {
      const { data } = await api.patch(`/contact/submissions/${id}/assign`, { assignedStaffId });
      return data;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin-contact-inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["admin-contact-inquiry", vars.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-nav-badges"] });
    },
  });
}

export function useReplyContactInquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, message, isInternal }: { id: string; message: string; isInternal?: boolean }) => {
      const { data } = await api.post(`/contact/submissions/${id}/replies`, { message, isInternal });
      return data;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin-contact-inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["admin-contact-inquiry", vars.id] });
    },
  });
}

export function useAddContactInquiryNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      const { data } = await api.post(`/contact/submissions/${id}/notes`, { note });
      return data;
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin-contact-inquiry", vars.id] });
    },
  });
}

export function useMarkContactInquiryRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/contact/submissions/${id}/read`);
      return data;
    },
    onSuccess: (_d, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin-contact-inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["admin-contact-inquiry", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-nav-badges"] });
    },
  });
}

export function useDeleteContactInquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/contact/submissions/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contact-inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["admin-nav-badges"] });
    },
  });
}

export function usePublicFaqs() {
  return useQuery({
    queryKey: ["public-faqs"],
    queryFn: async () => {
      const { data } = await api.get<FaqItem[]>("/site-admin/public/faqs");
      return data;
    },
    staleTime: 60_000,
  });
}

export function usePublicHomepageSections() {
  return useQuery({
    queryKey: ["public-homepage-sections"],
    queryFn: async () => {
      const { data } = await api.get<HomepageSection[]>("/site-admin/public/homepage-sections");
      return data;
    },
    staleTime: 60_000,
  });
}

export function usePublicHealthTools() {
  return useQuery({
    queryKey: ["public-health-tools"],
    queryFn: async () => {
      const { data } = await api.get<HealthToolItem[]>("/site-admin/public/health-tools");
      return data;
    },
    staleTime: 60_000,
  });
}

export function usePublicSeo(path: string) {
  return useQuery({
    queryKey: ["public-seo", path],
    queryFn: async () => {
      const { data } = await api.get<SeoPageSetting | null>("/site-admin/public/seo", { params: { path } });
      return data;
    },
    staleTime: 300_000,
  });
}

export function useReviewProcess() {
  return useQuery({
    queryKey: ["admin-review-process"],
    queryFn: async () => {
      const { data } = await api.get<{
        settings: {
          tier1MinYears: number;
          tier2MinYears: number;
          reviewDeadlineDays: number;
          maxRevisionCycles: number;
          authorRevisionWindowDays: number;
          minSourcesPerArticle: number;
        };
        schedules: Array<{ id: string; contentType: string; reviewCycleMonths: number }>;
        reviewerPool: { tier1: number; tier2: number; tier3: number };
      }>("/site-admin/review-process");
      return data;
    },
  });
}

export function useUpdateReviewProcess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, number>) => {
      const { data } = await api.put("/site-admin/review-process", body);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-review-process"] }),
  });
}

export function useRolesMatrix() {
  return useQuery({
    queryKey: ["admin-roles-matrix"],
    queryFn: async () => {
      const { data } = await api.get<{
        roles: Array<{
          id: string;
          key: string;
          name: string;
          description?: string | null;
          permissions: Array<{ permissionId: string; enabled: boolean }>;
        }>;
        permissions: Array<{ id: string; key: string; name: string }>;
      }>("/site-admin/roles");
      return data;
    },
  });
}

export function useUpdateRolePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      roleId,
      permissionId,
      enabled,
    }: {
      roleId: string;
      permissionId: string;
      enabled: boolean;
    }) => {
      const { data } = await api.patch(`/site-admin/roles/${roleId}/permissions/${permissionId}`, { enabled });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-roles-matrix"] }),
  });
}

export function useTrafficAnalytics(params?: { range?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: ["admin-traffic-analytics", params],
    queryFn: async () => {
      const { data } = await api.get<{
        stats: {
          pageViews30d: number;
          uniqueVisitors: number;
          avgSessionDuration: string;
          bounceRate: string;
        };
        visitorsByDay: Array<{ label: string; value: number; display: string }>;
        topPages: string[][];
        trafficSources: Array<{ source: string; visitors: number; pct: number }>;
      }>("/site-admin/analytics/traffic", { params });
      return data;
    },
  });
}

export function useUpdateContactStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch(`/contact/submissions/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contact-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-nav-badges"] });
    },
  });
}

// ─── Blog CMS ───────────────────────────────────────────────────────────────

export interface BlogCategoryAdmin {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  icon?: string | null;
  color?: string | null;
  isActive: boolean;
  parent?: { id: string; name: string; slug: string } | null;
  _count?: { posts: number };
}

export interface BlogTagAdmin {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  isActive: boolean;
  _count?: { posts: number };
}

export interface BlogAuthorAdmin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  status: string;
  articlesPublished: number;
}

export interface AdminBlogPostDetail {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  excerpt: string;
  content: string;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  coverImageCaption?: string | null;
  status: string;
  specialty?: string | null;
  tags?: string[];
  summaryPoints?: string[];
  keyTakeaways?: string[];
  references?: Array<{ text?: string; url?: string }>;
  medicalDisclaimer?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  featured?: boolean;
  pinned?: boolean;
  category?: { id: string; name: string; slug: string };
  author?: { id: string; firstName: string; lastName: string };
}

export function useAdminBlogPost(slug: string) {
  return useQuery({
    queryKey: ["admin-blog-post", slug],
    queryFn: async () => {
      const { data } = await api.get<AdminBlogPostDetail>(`/blog/manage/${slug}`);
      return data;
    },
    enabled: Boolean(slug),
  });
}

export function useAdminBlogStats() {
  return useQuery({
    queryKey: ["admin-blog-stats"],
    queryFn: async () => {
      const { data } = await api.get<{ total: number; published: number; draft: number; archived: number }>(
        "/blog/manage/stats",
      );
      return data;
    },
  });
}

export function useCreateBlogPostAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post("/blog", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      queryClient.invalidateQueries({ queryKey: ["admin-blog-stats"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-blog"] });
      queryClient.invalidateQueries({ queryKey: ["blog"] });
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, ...payload }: { slug: string } & Record<string, unknown>) => {
      const { data } = await api.patch(`/blog/${slug}`, payload);
      return data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      queryClient.invalidateQueries({ queryKey: ["admin-blog-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-blog-post", vars.slug] });
      queryClient.invalidateQueries({ queryKey: ["doctor-blog"] });
      queryClient.invalidateQueries({ queryKey: ["blog"] });
    },
  });
}

export function usePublishBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      const { data } = await api.post(`/blog/manage/${slug}/publish`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      queryClient.invalidateQueries({ queryKey: ["admin-blog-stats"] });
    },
  });
}

export function useUnpublishBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      const { data } = await api.post(`/blog/manage/${slug}/unpublish`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      queryClient.invalidateQueries({ queryKey: ["admin-blog-stats"] });
    },
  });
}

export function useArchiveBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      const { data } = await api.post(`/blog/manage/${slug}/archive`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      queryClient.invalidateQueries({ queryKey: ["admin-blog-stats"] });
    },
  });
}

export function useDuplicateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      const { data } = await api.post(`/blog/manage/${slug}/duplicate`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      queryClient.invalidateQueries({ queryKey: ["admin-blog-stats"] });
    },
  });
}

export function useAdminCategoriesManage(params?: {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}) {
  return useQuery({
    queryKey: ["admin-categories-manage", params],
    queryFn: async () => {
      const { data } = await api.get<{
        data: BlogCategoryAdmin[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>("/blog/categories/manage", { params });
      return data;
    },
  });
}

export function useCreateBlogCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<BlogCategoryAdmin>) => {
      const { data } = await api.post<BlogCategoryAdmin>("/blog/categories", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories-manage"] });
      queryClient.invalidateQueries({ queryKey: ["admin-blog-categories"] });
    },
  });
}

export function useUpdateBlogCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<BlogCategoryAdmin> & { id: string }) => {
      const { data } = await api.patch<BlogCategoryAdmin>(`/blog/categories/${id}`, body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories-manage"] });
      queryClient.invalidateQueries({ queryKey: ["admin-blog-categories"] });
    },
  });
}

export function useDeleteBlogCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/blog/categories/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories-manage"] });
      queryClient.invalidateQueries({ queryKey: ["admin-blog-categories"] });
    },
  });
}

export function useAdminTagsManage(params?: {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}) {
  return useQuery({
    queryKey: ["admin-tags-manage", params],
    queryFn: async () => {
      const { data } = await api.get<{
        data: BlogTagAdmin[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>("/blog/tags/manage", { params });
      return data;
    },
  });
}

export function useCreateBlogTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<BlogTagAdmin>) => {
      const { data } = await api.post<BlogTagAdmin>("/blog/tags", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags-manage"] });
    },
  });
}

export function useUpdateBlogTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<BlogTagAdmin> & { id: string }) => {
      const { data } = await api.patch<BlogTagAdmin>(`/blog/tags/${id}`, body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags-manage"] });
    },
  });
}

export function useDeleteBlogTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/blog/tags/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags-manage"] });
    },
  });
}

export function useAdminAuthors(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ["admin-authors", params],
    queryFn: async () => {
      const { data } = await api.get<{
        data: BlogAuthorAdmin[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>("/blog/authors/manage", { params });
      return data;
    },
  });
}

export function useDeleteBlogComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/blog/comments/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-comments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-nav-badges"] });
    },
  });
}
