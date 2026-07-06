"use client";

import Link from "next/link";
import { useState } from "react";
import "@/styles/site-footer.css";
import { phoneHref, whatsappHref } from "@/lib/contact-utils";
import { CONTACT_PHONE } from "@/lib/site-contact";
import { useNewsletterSubscribe } from "@/services/api-hooks";

const CONTACT_EMAIL = "contact@drinsight.org";
const BUSINESS_HOURS = "Mon–Fri: 8AM–8PM | Sat: 9AM–5PM";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/health-tools", label: "Health Tools" },
  { href: "/ask-doctor", label: "Ask the Doctor" },
  { href: "/blog", label: "Blog" },
  { href: "/book-consultation", label: "Book Consultation" },
  { href: "/contact", label: "Contact Us" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-conditions", label: "Terms & Conditions" },
  { href: "/disclaimer", label: "Disclaimer" },
] as const;

const MEDICAL_CATEGORIES = [
  { href: "/blog#clinical", label: "Clinical Specialties" },
  { href: "/blog#surgical", label: "Surgical Specialties" },
  { href: "/blog#diagnostic", label: "Diagnostic Specialties" },
  { href: "/blog", label: "Preventive Health" },
  { href: "/blog", label: "Mental Health" },
  { href: "/blog", label: "Women's Health" },
  { href: "/blog", label: "Men's Health" },
  { href: "/blog", label: "Pediatrics" },
  { href: "/blog", label: "Nutrition" },
] as const;

const BOTTOM_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-conditions", label: "Terms of Service" },
  { href: "/disclaimer", label: "Medical Disclaimer" },
  { href: "/cookie-policy", label: "Cookie Policy" },
  { href: "/faq", label: "FAQs" },
  { href: "/sitemap", label: "Sitemap" },
] as const;

const SOCIAL_LINKS = ["𝕏", "f", "in", "▶", "📸"] as const;

function PhoneIcon() {
  return (
    <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function Footer() {
  const newsletter = useNewsletterSubscribe();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubscribe = async () => {
    if (!email.trim()) return;
    try {
      await newsletter.mutateAsync(email.trim());
      setMessage("Subscribed successfully!");
      setEmail("");
    } catch {
      setMessage("Subscription failed. Please try again.");
    }
  };

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="logo" style={{ marginBottom: 14 }}>
            <img
              src="/assets/logo/footer-logo.png"
              alt="DrInsight"
              style={{
                maxWidth: 220,
                width: "100%",
                height: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
          <p>
            Your trusted platform for evidence-based medical information, expert doctor consultations, and health
            tools — reviewed and approved by licensed physicians.
          </p>
          <div className="hipaa-badge">🛡️ HIPAA Compliant</div>
          <div className="hipaa-badge" style={{ marginTop: 6 }}>
            🇪🇺 GDPR Compliant
          </div>
          <div className="footer-social" style={{ marginTop: 16 }}>
            {SOCIAL_LINKS.map((icon) => (
              <a key={icon} href="#" className="social-btn" aria-label="Social link">
                {icon}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            {QUICK_LINKS.map(({ href, label }) => (
              <li key={href + label}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Medical Categories</h4>
          <ul>
            {MEDICAL_CATEGORIES.map(({ href, label }) => (
              <li key={label}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact Information</h4>
          <div className="footer-contact-item">
            <PhoneIcon />
            <a href={phoneHref(CONTACT_PHONE)}>{CONTACT_PHONE}</a>
          </div>
          <div className="footer-contact-item">
            <EmailIcon />
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </div>
          <div className="footer-contact-item">
            <LocationIcon />
            <span>
              123 Medical Plaza, Suite 400
              <br />
              New York, NY 10001, USA
            </span>
          </div>
          <div className="footer-contact-item">
            <ClockIcon />
            {BUSINESS_HOURS}
          </div>
          <div className="footer-contact-item" style={{ color: "#25d366" }}>
            📱 WhatsApp:{" "}
            <a href={whatsappHref(CONTACT_PHONE)} style={{ color: "#25d366" }}>
              {CONTACT_PHONE}
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Expert Health Insights</h4>
          <p style={{ fontSize: "0.82rem", marginBottom: 14 }}>
            Get weekly medical tips and health news from our specialists.
          </p>
          <div className="footer-subscribe">
            <input
              type="email"
              placeholder="Your email address"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="button" onClick={handleSubscribe} disabled={newsletter.isPending}>
              {newsletter.isPending ? "Subscribing..." : "Subscribe Free →"}
            </button>
            {message && (
              <p style={{ fontSize: "0.72rem", color: "#475569", marginTop: 8 }}>{message}</p>
            )}
            <p style={{ fontSize: "0.72rem", color: "#475569", marginTop: 8 }}>
              🔒 GDPR compliant. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div>
          <p>© 2026 DrInsight. All rights reserved.</p>
          <p style={{ marginTop: 4, fontSize: "0.75rem", color: "#475569" }}>
            ⚕️ The content on DrInsight is for informational purposes only and is not a substitute for
            professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for
            medical decisions.
          </p>
        </div>
        <div className="footer-bottom-links">
          {BOTTOM_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
