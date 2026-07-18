export const CONFIG_PAGE_OPTIONS = [
  { id: "home", label: "Homepage", path: "/" },
  { id: "about", label: "About Us", path: "/about" },
  { id: "blog", label: "Blog", path: "/blog" },
  { id: "health-tools", label: "Health Tools", path: "/health-tools" },
  { id: "book-consultation", label: "Book Consultation", path: "/book-consultation" },
  { id: "ask-the-doctor", label: "Ask a Doctor", path: "/ask-doctor" },
  { id: "our-doctors", label: "Our Doctors", path: "/our-doctors" },
  { id: "editorial-policy", label: "Editorial Policy", path: "/editorial-policy" },
  { id: "author-guidelines", label: "Author Guidelines", path: "/author-guidelines" },
  { id: "contact", label: "Contact", path: "/contact" },
  { id: "faq", label: "FAQ", path: "/faq" },
  { id: "privacy", label: "Privacy Policy", path: "/privacy-policy" },
  { id: "terms", label: "Terms of Use", path: "/terms-conditions" },
] as const;

export function configPageLabel(pageId: string) {
  return CONFIG_PAGE_OPTIONS.find((p) => p.id === pageId)?.label ?? pageId;
}
