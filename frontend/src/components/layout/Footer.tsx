"use client";

import Link from "next/link";
import { useState } from "react";
import "@/styles/site-footer.css";
import { phoneHref, whatsappHref } from "@/lib/contact-utils";
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_HOURS, CONTACT_PHONE_DISPLAY } from "@/lib/site-contact";
import { BRAND_LOGO_ALT, FOOTER_LOGO_SRC } from "@/config/brand-logos";
import {
  AdFacebookIcon,
  AdLinkedInIcon,
  AdXIcon,
  AdYouTubeIcon,
} from "@/components/blog/ArticleDetailIcons";
import { useNewsletterSubscribe } from "@/services/api-hooks";
import { usePublicSiteConfig } from "@/services/configuration-api-hooks";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/our-doctors", label: "Our Doctors" },
  { href: "/blog", label: "Blog" },
  { href: "/research-publications", label: "Research & Publications" },
  { href: "/author-guidelines", label: "Author Guidelines" },
  { href: "/editorial-policy#s6", label: "Medical Review Process" },
  { href: "/editorial-policy", label: "Editorial Policy" },
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
  { href: "/sitemap", label: "Sitemap" },
  { href: "/faq", label: "FAQ" },
] as const;

const SOCIAL_LINKS = ["𝕏", "f", "in", "▶", "📸"] as const;

const FOOTER_SOCIAL_ORDER = [
  { key: "facebook", label: "Facebook", icon: "facebook" as const },
  { key: "twitter", label: "X", icon: "x" as const },
  { key: "instagram", label: "Instagram", icon: "instagram" as const },
  { key: "linkedin", label: "LinkedIn", icon: "linkedin" as const },
  { key: "youtube", label: "YouTube", icon: "youtube" as const },
] as const;

function FooterInstagramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FooterSocialIcon({ type, size = 14 }: { type: (typeof FOOTER_SOCIAL_ORDER)[number]["icon"]; size?: number }) {
  switch (type) {
    case "facebook":
      return <AdFacebookIcon size={size} />;
    case "x":
      return <AdXIcon size={size} />;
    case "instagram":
      return <FooterInstagramIcon size={size} />;
    case "linkedin":
      return <AdLinkedInIcon size={size} />;
    case "youtube":
      return <AdYouTubeIcon size={size} />;
  }
}

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
  const siteConfig = usePublicSiteConfig();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const phone = CONTACT_PHONE_DISPLAY;
  const emailAddr = CONTACT_EMAIL;
  const hours = CONTACT_HOURS;
  const address = CONTACT_ADDRESS;
  const whatsapp = CONTACT_PHONE_DISPLAY;
  const footerLogo = siteConfig.data?.footerLogoUrl?.trim() || FOOTER_LOGO_SRC;
  const tagline =
    siteConfig.data?.tagline ||
    "Your trusted platform for evidence-based medical information, expert doctor consultations, and health tools — reviewed and approved by licensed physicians.";
  const social = siteConfig.data?.socialLinks;
  const socialItems = [
    { key: "twitter", label: "𝕏", href: social?.twitter },
    { key: "facebook", label: "f", href: social?.facebook },
    { key: "linkedin", label: "in", href: social?.linkedin },
    { key: "youtube", label: "▶", href: social?.youtube },
    { key: "instagram", label: "📸", href: social?.instagram },
  ].filter((s) => s.href);

  const footerSocialItems = FOOTER_SOCIAL_ORDER.map((item) => ({
    ...item,
    href: social?.[item.key as keyof NonNullable<typeof social>] ?? "#",
  }));

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
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
              src={footerLogo}
              alt={BRAND_LOGO_ALT}
              style={{
                maxWidth: 220,
                width: "100%",
                height: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
          <p>{tagline}</p>
          <div className="footer-brand-meta">
            <div className="footer-compliance-badges">
              <div className="hipaa-badge">🛡️ HIPAA Compliant</div>
              <div className="hipaa-badge">🇪🇺 GDPR Compliant</div>
            </div>
            <div className="footer-social">
            {(socialItems.length ? socialItems : SOCIAL_LINKS.map((icon) => ({ key: icon, label: icon, href: "#" }))).map(
              (item) => (
                <a
                  key={item.key}
                  href={item.href || "#"}
                  className="social-btn"
                  aria-label="Social link"
                  target={item.href && item.href !== "#" ? "_blank" : undefined}
                  rel={item.href && item.href !== "#" ? "noopener noreferrer" : undefined}
                >
                  {item.label}
                </a>
              ),
            )}
            </div>
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

        <div className="footer-col footer-col-contact">
          <h4>Contact Information</h4>
          <div className="footer-contact-item">
            <PhoneIcon />
            <a href={phoneHref(phone)}>{phone}</a>
          </div>
          <div className="footer-contact-item">
            <EmailIcon />
            <a href={`mailto:${emailAddr}`}>{emailAddr}</a>
          </div>
          <div className="footer-contact-item">
            <LocationIcon />
            <span>{address}</span>
          </div>
          <div className="footer-contact-item footer-contact-item-hours">
            <ClockIcon />
            <span>{hours}</span>
          </div>
          <div className="footer-contact-item footer-contact-item-whatsapp">
            <span aria-hidden="true">📱</span>
            <span>
              WhatsApp:{" "}
              <a href={whatsappHref(whatsapp)}>{whatsapp}</a>
            </span>
          </div>
        </div>

        <div className="footer-col footer-col-insights">
          <h4>Expert Health Insights</h4>
          <p className="footer-insights-desc">
            Get our latest physician-written medical tips and health updates
          </p>
          <form className="footer-subscribe" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Your email address"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={newsletter.isPending}>
              {newsletter.isPending ? "Subscribing..." : "Subscribe Free →"}
            </button>
            {message && <p className="footer-subscribe-msg">{message}</p>}
            <p className="footer-insights-legal">
              By continuing, you agree to DrInsight{" "}
              <Link href="/terms-conditions">Terms of Use</Link> and{" "}
              <Link href="/privacy-policy">Privacy Policy</Link>. You may unsubscribe at any time.
            </p>
          </form>
          <div className="footer-follow-us">
            <div className="footer-follow-label">Follow Us</div>
            <div className="footer-follow-social">
              {footerSocialItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  className="footer-social-circle"
                  aria-label={item.label}
                  target={item.href !== "#" ? "_blank" : undefined}
                  rel={item.href !== "#" ? "noopener noreferrer" : undefined}
                >
                  <FooterSocialIcon type={item.icon} />
                </a>
              ))}
            </div>
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
