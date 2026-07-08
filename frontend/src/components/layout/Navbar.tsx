"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { useAuthStore } from "@/store/auth.store";

type NavLink = { href: string; label: string; cta?: boolean };

const PUBLIC_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/health-tools", label: "Health Tools" },
  { href: "/our-doctors", label: "Our Doctors" },
  { href: "/ask-doctor", label: "Ask the Doctor" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

const navLinkBase =
  "nav-link rounded-[8px] px-3.5 py-2 text-[.9rem] font-medium text-gray-600 transition-all duration-[.22s]";

const navCtaBase =
  "nav-link-cta rounded-[8px] bg-blue px-5 py-2 text-[.9rem] font-semibold text-white transition-all duration-[.22s] hover:-translate-y-px hover:bg-blue-dark hover:text-white";

function linksForRole(role?: string): NavLink[] {
  if (role === "PATIENT") {
    return [
      ...PUBLIC_LINKS,
      { href: "/patient", label: "Dashboard" },
      { href: "/book-consultation", label: "Book Consultation", cta: true },
    ];
  }

  if (role === "DOCTOR") {
    return [...PUBLIC_LINKS, { href: "/doctor", label: "Dashboard", cta: true }];
  }

  return [...PUBLIC_LINKS, { href: "/book-consultation", label: "Book Consultation", cta: true }];
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navLinks = linksForRole(user?.role);

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
    <nav className="site-nav border-b border-gray-200 bg-white shadow-[var(--shadow-sm)]">
      <div className="nav-inner mx-auto flex h-[70px] max-w-[1240px] items-center justify-between px-6">
        <Link href="/">
          <Logo />
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
