"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { useAuthStore } from "@/store/auth.store";
import { usePublicSiteConfig } from "@/services/configuration-api-hooks";

type NavLink = { href: string; label: string; cta?: boolean };

const FALLBACK_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/health-tools", label: "Health Tools" },
  { href: "/our-doctors", label: "Our Doctors" },
  { href: "/ask-doctor", label: "Ask the Doctor" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

const navLinkBase =
  "nav-link rounded-[8px] px-3 py-1.5 text-[.875rem] font-medium text-gray-600 transition-all duration-[.22s]";

const navCtaBase =
  "nav-link-cta rounded-[8px] bg-blue px-4 py-1.5 text-[.875rem] font-semibold text-white transition-all duration-[.22s] hover:-translate-y-px hover:bg-blue-dark hover:text-white";

function buildBaseMenu(headerMenu: NavLink[]): NavLink[] {
  if (!headerMenu.length) return FALLBACK_LINKS;
  const cmsByHref = new Map(headerMenu.map((item) => [item.href, item]));
  return FALLBACK_LINKS.map((item) =>
    cmsByHref.has(item.href) ? { href: item.href, label: item.label } : item,
  );
}

function linksForRole(role: string | undefined, headerMenu: NavLink[]): NavLink[] {
  const base = buildBaseMenu(headerMenu);
  if (role === "PATIENT") {
    return [
      ...base,
      { href: "/patient", label: "Dashboard" },
      { href: "/book-consultation", label: "Book Consultation", cta: true },
    ];
  }

  if (role === "DOCTOR") {
    return [...base, { href: "/doctor", label: "Dashboard", cta: true }];
  }

  return [...base, { href: "/book-consultation", label: "Book Consultation", cta: true }];
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const siteConfig = usePublicSiteConfig();
  const headerMenu = useMemo(
    () =>
      (siteConfig.data?.headerMenu ?? []).map((item) => ({
        href: item.href,
        label: item.label,
      })),
    [siteConfig.data?.headerMenu],
  );
  const navLinks = linksForRole(user?.role, headerMenu);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <nav className="site-nav">
      <div className="nav-inner mx-auto flex h-16 max-w-[1240px] items-center justify-between px-6">
        <Link href="/" className="flex shrink-0 items-center">
          <Logo imgClassName="!h-[3.75rem] !max-h-[3.75rem] !p-0" />
        </Link>

        <div className="nav-links hidden min-[641px]:flex min-[641px]:items-center min-[641px]:gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                link.cta ? navCtaBase : navLinkBase,
                !link.cta && isActive(link.href) && "bg-blue-light font-semibold text-blue",
                !link.cta && !isActive(link.href) && "hover:bg-blue-light hover:text-blue",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          className="hamburger block border-0 bg-transparent p-1 min-[641px]:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span className="my-[5px] block h-0.5 w-6 bg-gray-800 transition-all duration-[.22s]" />
          <span className="my-[5px] block h-0.5 w-6 bg-gray-800 transition-all duration-[.22s]" />
          <span className="my-[5px] block h-0.5 w-6 bg-gray-800 transition-all duration-[.22s]" />
        </button>
      </div>

      <div className={cn("site-mobile-menu min-[641px]:hidden", mobileOpen && "open")}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "rounded-[8px]",
              isActive(link.href) && "bg-blue-light font-semibold text-blue",
              link.cta && "font-semibold text-blue",
            )}
          >
            {link.cta ? `📅 ${link.label}` : link.label}
          </Link>
        ))}
        {user ? (
          <button
            type="button"
            onClick={() => {
              clearAuth();
              setMobileOpen(false);
              router.push("/");
            }}
            className="rounded-[8px] border-0 bg-transparent"
          >
            Logout
          </button>
        ) : (
          <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-[8px]">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
