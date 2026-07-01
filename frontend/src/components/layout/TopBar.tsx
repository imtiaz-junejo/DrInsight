"use client";

import Link from "next/link";

export function TopBar() {
  return (
    <div className="bg-blue-dark py-[.15rem] text-[.8rem] text-[#cbd5e1]">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 px-6">
        <div className="flex items-center gap-2 font-semibold text-[#fca5a5]">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          Emergency: <strong>911</strong> &nbsp;|&nbsp; Medical Helpline:{" "}
          <strong>+1 (800) MED-HELP</strong>
        </div>
        <div>
          {/* <Link href="/about" className="ml-4 text-[#93c5fd] transition hover:text-white">
            About
          </Link>
          <Link href="/contact" className="ml-4 text-[#93c5fd] transition hover:text-white">
            Contact
          </Link> */}
          <Link href="/login" className="ml-4 text-[#93c5fd] transition hover:text-white">
            Portal Login
          </Link>
        </div>
      </div>
    </div>
  );
}
