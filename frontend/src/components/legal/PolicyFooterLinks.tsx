import Link from "next/link";

type PolicyLink = { label: string; href: string };

const DEFAULT_LINKS: PolicyLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-conditions" },
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "Editorial Policy", href: "/editorial-policy" },
];

type Props = {
  links: PolicyLink[];
  className?: string;
};

export function PolicyFooterLinks({ links, className = "pill-link" }: Props) {
  return (
    <>
      {links.map((link) => (
        <Link key={link.href} href={link.href} className={className}>
          {link.label}
        </Link>
      ))}
    </>
  );
}

export { DEFAULT_LINKS };
