"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import "@/styles/contact-page.css";

const SUBJECT_TABS = [
  "General Enquiry",
  "Medical Question",
  "Booking Support",
  "Technical Issue",
  "Partnership",
  "Media / Press",
  "Feedback",
];

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Pakistan",
  "India",
  "UAE",
  "Saudi Arabia",
  "Other",
];

type ContactCardLink = {
  text: string;
  href: string;
  color?: string;
  style?: CSSProperties;
};

type ContactCard = {
  icon: string;
  iconBg: string;
  title: string;
  desc: string;
  links: ContactCardLink[];
  badge: { text: string; bg?: string; color?: string };
};

const CONTACT_CARDS: ContactCard[] = [
  {
    icon: "📞",
    iconBg: "#e8f0fb",
    title: "Phone",
    desc: "Speak directly with our support team",
    links: [
      { text: "+1 (800) MED-HELP", href: "tel:+18006334357" },
      { text: "+1 (800) 633-4357", href: "tel:+18006334357", style: { marginTop: 3 } },
    ],
    badge: { text: "Mon–Fri 8AM–8PM", bg: undefined, color: undefined },
  },
  {
    icon: "📱",
    iconBg: "#dcfce7",
    title: "WhatsApp",
    desc: "Message us on WhatsApp anytime",
    links: [{ text: "+1 (800) 633-4357", href: "https://wa.me/18006334357", color: "#25d366" }],
    badge: { text: "24/7 Available", bg: "#dcfce7", color: "#166534" },
  },
  {
    icon: "✉️",
    iconBg: "#fef3c7",
    title: "Email",
    desc: "Send us your queries by email",
    links: [
      { text: "contact@medauthority.com", href: "mailto:contact@medauthority.com" },
      {
        text: "support@medauthority.com",
        href: "mailto:support@medauthority.com",
        style: { marginTop: 3, fontSize: ".74rem" },
      },
    ],
    badge: { text: "Reply within 2–4 hrs", bg: "#fef3c7", color: "#92400e" },
  },
  {
    icon: "💬",
    iconBg: "#fce7f3",
    title: "Live Chat",
    desc: "Chat with a support agent instantly",
    links: [{ text: "Start Chat →", href: "#" }],
    badge: { text: "Mon–Sat 8AM–10PM", bg: "#fce7f3", color: "#9d174d" },
  },
  {
    icon: "📍",
    iconBg: "#ede9fe",
    title: "Visit Us",
    desc: "123 Medical Plaza, Suite 400",
    links: [
      { text: "New York, NY 10001", href: "#" },
      { text: "Get Directions →", href: "https://maps.google.com/?q=123+Medical+Plaza+New+York+NY+10001", style: { fontSize: ".74rem", marginTop: 3 } },
    ],
    badge: { text: "By appointment only", bg: "#ede9fe", color: "#5b21b6" },
  },
];

const BUSINESS_HOURS = [
  { day: "Monday", time: "8:00 AM – 8:00 PM", today: false, closed: false },
  { day: "Tuesday ⭐", time: "8:00 AM – 8:00 PM", today: true, closed: false },
  { day: "Wednesday", time: "8:00 AM – 8:00 PM", today: false, closed: false },
  { day: "Thursday", time: "8:00 AM – 8:00 PM", today: false, closed: false },
  { day: "Friday", time: "8:00 AM – 6:00 PM", today: false, closed: false },
  { day: "Saturday", time: "9:00 AM – 5:00 PM", today: false, closed: false },
  { day: "Sunday", time: "Closed", today: false, closed: true },
];

const FAQ_ITEMS = [
  {
    q: "How quickly will I receive a response?",
    a: "Email enquiries are typically answered within 2–4 hours during business hours (Mon–Fri, 8AM–8PM EST). WhatsApp messages are answered within 1 hour. Phone calls are answered immediately during office hours. After-hours messages receive a response on the next business day.",
  },
  {
    q: "Can I contact you in a language other than English?",
    a: "Yes — our support team speaks English, Spanish, French, Arabic, Urdu, Hindi, and Mandarin. Please mention your preferred language in your message and we will assign a representative who speaks your language.",
  },
  {
    q: "How do I cancel or reschedule a consultation?",
    a: "You can cancel or reschedule via your patient portal, by emailing support@medauthority.com with your booking reference, or by calling our helpline. Free rescheduling is available up to 2 hours before your appointment. Full refunds are issued for cancellations made 24+ hours in advance.",
  },
  {
    q: "I'm a doctor — how do I join MedAuthority's panel?",
    a: "We welcome board-certified physicians to join our platform. Please email partnerships@medauthority.com with your CV, medical licence, board certification details, and a brief statement of interest. Our medical director reviews all applications within 5 business days.",
  },
  {
    q: "How do I report a technical issue with the platform?",
    a: 'Select "Technical Issue" in the contact form above and describe the problem in detail — include your browser, device, and a screenshot if possible. Our technical team typically resolves reported issues within 24 hours. For urgent issues during a live consultation, call our helpline immediately.',
  },
  {
    q: "Do you offer media interviews or expert quotes?",
    a: "Yes — Dr. Javed Kumbhar and our specialist team are available for media interviews, expert quotes, and health commentary. Please contact media@medauthority.com with your publication details, deadline, and topic. We typically respond to media enquiries within 4 hours.",
  },
];

const SOCIAL_BTNS = [
  { icon: "𝕏", title: "Twitter / X" },
  { icon: "f", title: "Facebook" },
  { icon: "in", title: "LinkedIn" },
  { icon: "▶", title: "YouTube" },
  { icon: "📸", title: "Instagram" },
  { icon: "🎵", title: "TikTok" },
];

function generateRefNum() {
  return `MSG-2026-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export default function ContactPage() {
  const [activeSubject, setActiveSubject] = useState("General Enquiry");
  const [subject, setSubject] = useState("General Enquiry");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("United States");
  const [message, setMessage] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refNum, setRefNum] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  function setSubjectTab(label: string) {
    setActiveSubject(label);
    setSubject(label);
  }

  function submitForm() {
    if (!privacy) {
      alert("Please agree to the Privacy Policy to proceed.");
      return;
    }
    setRefNum(generateRefNum());
    setSubmitted(true);
  }

  function resetForm() {
    setSubmitted(false);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setCountry("United States");
    setMessage("");
    setNewsletter(false);
    setPrivacy(false);
    setActiveSubject("General Enquiry");
    setSubject("General Enquiry");
    setRefNum("");
  }

  function toggleFAQ(index: number) {
    setOpenFaq((prev) => (prev === index ? -1 : index));
  }

  return (
    <div className="contact-page">
      <div className="breadcrumb">
        <div className="bc-inner">
          🏠 <Link href="/">Home</Link> › <span>Contact Us</span>
        </div>
      </div>

      <div className="page-hero">
        <div className="hero-inner">
          <div className="eyebrow">Get in Touch</div>
          <h1>We&apos;re Here to Help You</h1>
          <p>
            Whether you have a medical question, need help booking a consultation, or have feedback about
            our platform — our team is ready to assist you.
          </p>
          <div className="hero-pills">
            <div className="hero-pill">⚡ Response within 2 hours</div>
            <div className="hero-pill">📞 Phone & WhatsApp available</div>
            <div className="hero-pill">🌍 Available in 12 languages</div>
          </div>
        </div>
      </div>

      <div className="emg-wrap">
        <div className="emg-banner">
          <span style={{ fontSize: "1.5rem" }}>🚨</span>
          <div>
            <strong>Medical Emergency? Call 911 immediately.</strong>
            <p>For urgent medical queries outside office hours, use our 24/7 Ask the Doctor service.</p>
          </div>
          <Link href="/ask-doctor" className="emg-btn">
            Ask a Doctor Now →
          </Link>
        </div>
      </div>

      <div className="contact-cards-section">
        <div className="contact-cards">
          {CONTACT_CARDS.map((card) => (
            <div key={card.title} className="contact-card">
              <div className="cc-icon" style={{ background: card.iconBg }}>
                {card.icon}
              </div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
              {card.links.map((link) => (
                <a
                  key={link.text}
                  href={link.href}
                  className="cc-link"
                  style={{ color: link.color, ...link.style }}
                >
                  {link.text}
                </a>
              ))}
              <div
                className="hours-badge"
                style={
                  card.badge.bg
                    ? { background: card.badge.bg, color: card.badge.color }
                    : undefined
                }
              >
                {card.badge.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="main-section">
        <div className="form-card">
          <h2>Send Us a Message</h2>
          <p>Fill in the form below and our team will respond within 2–4 hours during business hours.</p>

          {!submitted ? (
            <div id="contact-form">
              <div className="subject-label">What is your enquiry about?</div>
              <div className="subject-tabs" id="subject-tabs">
                {SUBJECT_TABS.map((tab) => (
                  <div
                    key={tab}
                    className={`subj-tab${activeSubject === tab ? " active" : ""}`}
                    onClick={() => setSubjectTab(tab)}
                    onKeyDown={(e) => e.key === "Enter" && setSubjectTab(tab)}
                    role="button"
                    tabIndex={0}
                  >
                    {tab}
                  </div>
                ))}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first-name">First Name *</label>
                  <input
                    id="first-name"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="last-name">Last Name *</label>
                  <input
                    id="last-name"
                    type="text"
                    placeholder="Smith"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row single">
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <select id="country" value={country} onChange={(e) => setCountry(e.target.value)}>
                    {COUNTRIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row single">
                <div className="form-group">
                  <label htmlFor="subject-input">Subject *</label>
                  <input
                    id="subject-input"
                    type="text"
                    placeholder="Briefly describe your enquiry"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-row single">
                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    placeholder="Please describe your enquiry in detail. The more information you provide, the better we can assist you..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={1000}
                    required
                  />
                  <div className="msg-count">{message.length} / 1000</div>
                </div>
              </div>
              <div className="form-check-row">
                <input
                  type="checkbox"
                  id="newsletter-check"
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                />
                <label htmlFor="newsletter-check">
                  Subscribe to our weekly health newsletter — free expert tips every Monday
                </label>
              </div>
              <div className="form-check-row">
                <input
                  type="checkbox"
                  id="privacy-check"
                  checked={privacy}
                  onChange={(e) => setPrivacy(e.target.checked)}
                />
                <label htmlFor="privacy-check">
                  I agree to the{" "}
                  <Link href="/privacy-policy" className="privacy-link">
                    Privacy Policy
                  </Link>{" "}
                  and consent to MedAuthority processing my data *
                </label>
              </div>
              <button type="button" className="submit-btn" onClick={submitForm}>
                ✉️ Send Message
              </button>

              <div className="form-privacy-note">
                🔒 Your data is protected under HIPAA & GDPR. We never share your information with third parties.
              </div>
            </div>
          ) : (
            <div className="success-box show" id="success-box">
              <div className="success-icon">✅</div>
              <h3>Message Sent Successfully!</h3>
              <p>
                Thank you for reaching out. Our team will review your message and respond to your email
                within 2–4 hours during business hours (Mon–Fri, 8AM–8PM EST).
              </p>
              <p style={{ marginTop: 10 }}>
                Your reference number: <strong id="ref-num">{refNum}</strong>
              </p>
              <button type="button" className="reset-btn" onClick={resetForm}>
                Send Another Message
              </button>
            </div>
          )}
        </div>

        <div className="sidebar">
          <div className="sidebar-card">
            <h3>📍 Office & Contact Info</h3>
            <div className="info-item">
              <div className="info-ico" style={{ background: "#e8f0fb" }}>
                📍
              </div>
              <div>
                <h4>Head Office</h4>
                <p>
                  123 Medical Plaza, Suite 400
                  <br />
                  New York, NY 10001, USA
                </p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-ico" style={{ background: "#dcfce7" }}>
                📞
              </div>
              <div>
                <h4>Phone Numbers</h4>
                <a href="tel:+18006334357">+1 (800) MED-HELP (633-4357)</a>
                <br />
                <a href="tel:+18005551234" style={{ fontSize: ".74rem" }}>
                  +1 (800) 555-1234 (International)
                </a>
              </div>
            </div>
            <div className="info-item">
              <div className="info-ico" style={{ background: "#fef3c7" }}>
                ✉️
              </div>
              <div>
                <h4>Email Addresses</h4>
                <a href="mailto:contact@medauthority.com">contact@medauthority.com</a>
                <br />
                <a href="mailto:support@medauthority.com" style={{ fontSize: ".74rem" }}>
                  support@medauthority.com
                </a>
                <br />
                <a href="mailto:media@medauthority.com" style={{ fontSize: ".74rem" }}>
                  media@medauthority.com
                </a>
              </div>
            </div>
            <div className="info-item">
              <div className="info-ico" style={{ background: "#fce7f3" }}>
                📱
              </div>
              <div>
                <h4>WhatsApp</h4>
                <a href="https://wa.me/18006334357" style={{ color: "#25d366", fontWeight: 600 }}>
                  +1 (800) 633-4357
                </a>
                <p style={{ fontSize: ".72rem", marginTop: 2 }}>Available 24/7 for non-emergency queries</p>
              </div>
            </div>
            <a href="https://wa.me/18006334357" className="whatsapp-btn">
              <span>💬</span> Chat on WhatsApp
            </a>
          </div>

          <div className="sidebar-card">
            <h3>🕐 Business Hours</h3>
            <div className="open-now">
              <div className="open-dot" />
              Open Now
            </div>
            <div className="hours-grid">
              {BUSINESS_HOURS.map((row) => (
                <div
                  key={row.day}
                  className={`hours-row${row.today ? " today" : ""}${row.closed ? " closed" : ""}`}
                >
                  <span className="day">{row.day}</span>
                  <span className="time" style={row.closed ? { color: "var(--gray-400)" } : undefined}>
                    {row.time}
                  </span>
                </div>
              ))}
            </div>
            <p className="hours-note">
              All times in Eastern Standard Time (EST). Online consultations available outside office hours.
            </p>
          </div>

          <div className="sidebar-card map-card">
            <h3>🗺️ Find Us</h3>
            <a
              href="https://maps.google.com/?q=123+Medical+Plaza+New+York+NY+10001"
              target="_blank"
              rel="noopener noreferrer"
              className="map-placeholder"
            >
              <div className="map-pin">📍</div>
              <h4>MedAuthority HQ</h4>
              <p>
                123 Medical Plaza, Suite 400
                <br />
                New York, NY 10001
              </p>
              <span className="directions-btn">Get Directions →</span>
            </a>
            <p className="map-note">
              📌 Near Penn Station · ♿ Fully accessible · 🅿️ Parking available in building
            </p>
          </div>

          <div className="sidebar-card">
            <h3>🌐 Follow Us</h3>
            <p className="social-desc">
              Stay updated with the latest health news, doctor tips, and platform updates.
            </p>
            <div className="social-row">
              {SOCIAL_BTNS.map((s) => (
                <div key={s.title} className="social-btn" title={s.title}>
                  {s.icon}
                </div>
              ))}
            </div>
            <p className="social-note">@MedAuthority · 120K followers across all platforms</p>
          </div>
        </div>
      </div>

      <div className="faq-mini">
        <div className="eyebrow">Common Queries</div>
        <h2>Frequently Asked Contact Questions</h2>
        <p>Quick answers to the most common questions about reaching our team</p>
        <div className="faq-grid">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={item.q}
              className={`faq-item${openFaq === i ? " open" : ""}`}
              onClick={() => toggleFAQ(i)}
              onKeyDown={(e) => e.key === "Enter" && toggleFAQ(i)}
              role="button"
              tabIndex={0}
            >
              <div className="faq-q">
                <h4>{item.q}</h4>
                <div className="faq-chev">▾</div>
              </div>
              <div className="faq-a">{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="cta-strip">
        <div className="eyebrow" style={{ color: "#93c5fd" }}>
          Ready for Expert Care?
        </div>
        <h2>Don&apos;t Wait — Talk to a Doctor Today</h2>
        <p>
          Book a video, phone, or chat consultation with a specialist from the comfort of your home.
          Same-day appointments available.
        </p>
        <div className="cta-btns">
          <Link href="/book-consultation" className="btn-white">
            📅 Book a Consultation
          </Link>
          <Link href="/ask-doctor" className="btn-ghost">
            💬 Ask a Doctor Free
          </Link>
        </div>
      </div>
    </div>
  );
}
