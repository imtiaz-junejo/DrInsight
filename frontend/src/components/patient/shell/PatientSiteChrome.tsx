"use client";

import Link from "next/link";
import { usePatientUiStore } from "@/store/patient-ui.store";

export function PatientSiteTopbar() {
  return (
    <div className="site-topbar">
      <div className="site-topbar-inner">
        <div className="site-topbar-emergency">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          Emergency: <strong>911</strong> &nbsp;|&nbsp; Medical Helpline: <strong>+1 (800) MED-HELP</strong>
        </div>
        <div className="site-topbar-right">
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/login">Portal Login</Link>
        </div>
      </div>
    </div>
  );
}

export function PatientSiteNav() {
  const mobileMenuOpen = usePatientUiStore((s) => s.mobileMenuOpen);
  const toggleMobileMenu = usePatientUiStore((s) => s.toggleMobileMenu);
  const setMobileMenuOpen = usePatientUiStore((s) => s.setMobileMenuOpen);

  return (
    <nav className="site-nav">
      <div className="nav-inner">
        <Link href="/" className="logo">
          <div className="logo-icon">✚</div>
          MedAuthority
        </Link>
        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/about">About Us</Link>
          <Link href="/health-tools">Health Tools</Link>
          <Link href="/ask-doctor">Ask the Doctor</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/book-consultation" className="btn-book">
            Book Consultation
          </Link>
        </div>
        <button type="button" className="hamburger" onClick={toggleMobileMenu} aria-label="Toggle menu">
          <span />
          <span />
          <span />
        </button>
      </div>
      <div className={`mobile-menu${mobileMenuOpen ? " open" : ""}`}>
        <Link href="/" onClick={() => setMobileMenuOpen(false)}>
          Home
        </Link>
        <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
          About Us
        </Link>
        <Link href="/health-tools" onClick={() => setMobileMenuOpen(false)}>
          Health Tools
        </Link>
        <Link href="/ask-doctor" onClick={() => setMobileMenuOpen(false)}>
          Ask the Doctor
        </Link>
        <Link href="/blog" onClick={() => setMobileMenuOpen(false)}>
          Blog
        </Link>
        <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
          Contact
        </Link>
        <Link href="/book-consultation" onClick={() => setMobileMenuOpen(false)}>
          Book Consultation
        </Link>
      </div>
    </nav>
  );
}

export function PatientDemoBar() {
  return (
    <div className="demo-bar">
      <div className="demo-bar-inner">
        <strong>🏥 Patient Dashboard</strong>
        <span style={{ color: "#92400e", opacity: 0.7, fontSize: "0.8rem" }}>|</span>
        <Link href="/doctor">
          <button type="button" className="demo-switch-btn">
            👨‍⚕️ Switch to Doctor View
          </button>
        </Link>
      </div>
    </div>
  );
}
