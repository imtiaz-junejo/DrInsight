"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { useAuthStore } from "@/store/auth.store";

type NavLink = { href: string; label: string; cta?: boolean };

// The public navbar is the single, shared navigation for the entire public
// site (including the 404 page). Every visitor — guest, patient, or doctor —
// sees the exact same set of links; the only thing that changes based on
// auth state is the trailing call-to-action button, which becomes a
// "role-aware button" rather than a full replacement of the navbar.
const PUBLIC_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/health-tools", label: "Health Tools" },
  { href: "/our-doctors", label: "Our Doctors" },
  { href: "/ask-doctor", label: "Ask the Doctor" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

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

  // Admins never see the public navbar — the proxy redirects them to
  // /admin before any public page renders. Guests fall back to the
  // standard public link set with the default "Book Consultation" CTA.
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

  return (
    <nav className="sticky top-0 z-[100] border-b border-gray-200 bg-white shadow-[var(--shadow-sm)]">
      <div className="mx-auto flex h-[70px] max-w-[1240px] items-center justify-between px-4 sm:px-6">
        <Link href="/">
          <Logo />
        </Link>

        <div className="hidden items-center lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded px-3.5 py-2 text-[.9rem] font-medium text-gray-600 transition-all duration-[.22s]",
                link.cta && "bg-blue px-4 font-semibold text-white hover:bg-blue-dark hover:text-white",
                isActive(link.href) && !link.cta && "bg-blue-light font-semibold text-blue",
                !isActive(link.href) && !link.cta && "hover:bg-blue-light hover:text-blue",
              )}
            >
              {link.label}
            </Link>
          ))}
          {/* {user ? (
            <button
              type="button"
              onClick={() => {
                clearAuth();
                router.push("/");
              }}
              className="rounded-lg border border-gray-200 px-4 py-2 text-[.9rem] font-semibold text-gray-600 transition hover:bg-blue-light hover:text-blue"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-lg border border-gray-200 px-4 py-2 text-[.9rem] font-semibold text-gray-600 transition hover:bg-blue-light hover:text-blue"
            >
              Login
            </Link>
          )} */}
        </div>

        <button
          className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1.5 p-2 lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className="block h-0.5 w-6 bg-gray-800" />
          <span className="block h-0.5 w-6 bg-gray-800" />
          <span className="block h-0.5 w-6 bg-gray-800" />
        </button>
      </div>

      {mobileOpen && (
        <div className="flex flex-col gap-1 border-t border-gray-200 bg-white px-4 py-4 sm:px-6 lg:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-[.92rem] font-medium text-gray-700 hover:bg-blue-light hover:text-blue"
            >
              {link.label}
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
              className="rounded-lg px-3 py-2.5 text-left text-[.92rem] font-medium text-red"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-[.92rem] font-medium text-blue"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
