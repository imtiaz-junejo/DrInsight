"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { useAuthStore } from "@/store/auth.store";

type NavLink = { href: string; label: string; cta?: boolean };

function linksForRole(role?: string): NavLink[] {
  const publicLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/health-tools", label: "Health Tools" },
    { href: "/doctors", label: "Our Doctors" },
    { href: "/ask-doctor", label: "Ask the Doctor" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];

  if (role === "PATIENT") {
    return [
      { href: "/patient", label: "Patient Dashboard" },
      { href: "/book-consultation", label: "Book Consultation", cta: true },
      { href: "/doctors", label: "Doctors" },
      { href: "/blog", label: "Blog" },
    ];
  }

  if (role === "DOCTOR") {
    return [
      { href: "/doctor", label: "Doctor Dashboard" },
      { href: "/doctor#schedule", label: "Schedule" },
      { href: "/doctor#patients", label: "Patients" },
      { href: "/blog", label: "Articles" },
    ];
  }

  if (role === "ADMIN") {
    return [
      { href: "/admin", label: "Admin Dashboard" },
      { href: "/admin#users", label: "Users" },
      { href: "/admin#content", label: "Content" },
      { href: "/admin#analytics", label: "Analytics" },
    ];
  }

  return [...publicLinks, { href: "/book-consultation", label: "Book Consultation", cta: true }];
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navLinks = linksForRole(user?.role);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-[100] border-b border-gray-200 bg-white shadow-[var(--shadow-sm)]">
      <div className="mx-auto flex h-[70px] max-w-[1240px] items-center justify-between px-6">
        <Link href="/">
          <Logo />
        </Link>

        <div className="hidden items-center md:flex">
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
          className="flex flex-col gap-1.5 p-1 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className="block h-0.5 w-6 bg-gray-800" />
          <span className="block h-0.5 w-6 bg-gray-800" />
          <span className="block h-0.5 w-6 bg-gray-800" />
        </button>
      </div>

      {mobileOpen && (
        <div className="flex flex-col gap-1 border-t border-gray-200 bg-white px-6 py-4 md:hidden">
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
