"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/health-tools", label: "Health Tools" },
  { href: "/doctors", label: "Our Doctors" },
  { href: "/ask-doctor", label: "Ask the Doctor" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-[100] border-b border-gray-200 bg-white shadow-[var(--shadow-sm)]">
      <div className="mx-auto flex h-[70px] max-w-[1240px] items-center justify-between px-6">
        <Link href="/">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3.5 py-2 text-[.9rem] font-medium text-gray-600 transition-all duration-[.22s]",
                isActive(link.href) && "bg-blue-light font-semibold text-blue",
                !isActive(link.href) && "hover:bg-blue-light hover:text-blue",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/book-consultation"
            className="rounded-lg bg-blue px-5 py-2 text-[.9rem] font-semibold text-white transition hover:-translate-y-px hover:bg-blue-dark"
          >
            Book Consultation
          </Link>
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
          <Link
            href="/book-consultation"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg px-3 py-2.5 text-[.92rem] font-medium text-blue"
          >
            📅 Book Consultation
          </Link>
        </div>
      )}
    </nav>
  );
}
