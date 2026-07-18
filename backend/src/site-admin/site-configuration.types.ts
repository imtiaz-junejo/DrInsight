export type MenuItem = { label: string; href: string };

export type AdvertisementSettings = {
  adsense?: string;
  banner?: string;
  sidebar?: string;
  inarticle?: string;
};

export type SocialLinks = {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
};

export type IntegrationSecrets = {
  smtpPassword?: string;
  emailJsServiceId?: string;
  emailJsTemplateId?: string;
  emailJsPublicKey?: string;
  smsProvider?: 'textbelt' | 'custom';
  smsApiKey?: string;
  smsCustomUrl?: string;
  smsSenderName?: string;
  smsTestNumber?: string;
};

export const CONFIG_PAGE_OPTIONS: Array<{ id: string; label: string; path: string }> = [
  { id: 'home', label: 'Homepage', path: '/' },
  { id: 'about', label: 'About Us', path: '/about' },
  { id: 'blog', label: 'Blog', path: '/blog' },
  { id: 'health-tools', label: 'Health Tools', path: '/health-tools' },
  { id: 'book-consultation', label: 'Book Consultation', path: '/book-consultation' },
  { id: 'ask-the-doctor', label: 'Ask a Doctor', path: '/ask-doctor' },
  { id: 'our-doctors', label: 'Our Doctors', path: '/our-doctors' },
  { id: 'editorial-policy', label: 'Editorial Policy', path: '/editorial-policy' },
  { id: 'author-guidelines', label: 'Author Guidelines', path: '/author-guidelines' },
  { id: 'contact', label: 'Contact', path: '/contact' },
  { id: 'faq', label: 'FAQ', path: '/faq' },
  { id: 'privacy', label: 'Privacy Policy', path: '/privacy-policy' },
  { id: 'terms', label: 'Terms of Use', path: '/terms-conditions' },
];

export const DEFAULT_HEADER_MENU: MenuItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Health Tools', href: '/health-tools' },
  { label: 'Our Doctors', href: '/our-doctors' },
  { label: 'Ask the Doctor', href: '/ask-doctor' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export const DEFAULT_FOOTER_MENU: MenuItem[] = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms-conditions' },
  { label: 'Medical Disclaimer', href: '/disclaimer' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
  { label: 'Sitemap', href: '/sitemap' },
  { label: 'FAQ', href: '/faq' },
];

export function normalizeMenuItems(raw: unknown, fallback: MenuItem[]): MenuItem[] {
  if (!Array.isArray(raw)) return fallback;
  const items = raw
    .map((entry) => {
      if (Array.isArray(entry) && entry.length >= 2) {
        return { label: String(entry[0] ?? '').trim(), href: String(entry[1] ?? '').trim() };
      }
      if (entry && typeof entry === 'object' && 'label' in entry && 'href' in entry) {
        const obj = entry as { label?: string; href?: string };
        return { label: String(obj.label ?? '').trim(), href: String(obj.href ?? '').trim() };
      }
      return null;
    })
    .filter((item): item is MenuItem => Boolean(item?.label && item?.href));
  return items.length ? items : fallback;
}

export function pageHeroMap(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'string' && value.trim()) out[key] = value.trim();
  }
  return out;
}
