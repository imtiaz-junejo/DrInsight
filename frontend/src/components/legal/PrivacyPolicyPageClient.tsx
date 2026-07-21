"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { DEFAULT_LINKS, PolicyFooterLinks } from "@/components/legal/PolicyFooterLinks";
import { usePolicyPageScroll } from "@/hooks/usePolicyPageScroll";
import "@/styles/privacy-policy-page.css";

const SECTION_IDS = [
  "s1",
  "s2",
  "s3",
  "s4",
  "s5",
  "s6",
  "s7",
  "s8",
  "s9",
  "s10",
  "s11",
  "s12",
  "s13",
  "s14",
] as const;

const TOC_ITEMS = [
  { id: "s1", num: 1, label: "Who We Are" },
  { id: "s2", num: 2, label: "Information We Collect" },
  { id: "s3", num: 3, label: "How We Use Your Data" },
  { id: "s4", num: 4, label: "Legal Basis (GDPR)" },
  { id: "s5", num: 5, label: "Cookies & Tracking" },
  { id: "s6", num: 6, label: "Third-Party Sharing" },
  { id: "s7", num: 7, label: "Medical & Sensitive Data" },
  { id: "s8", num: 8, label: "Data Retention" },
  { id: "s9", num: 9, label: "Your Rights & Choices" },
  { id: "s10", num: 10, label: "Children's Privacy" },
  { id: "s11", num: 11, label: "International Transfers" },
  { id: "s12", num: 12, label: "Data Security" },
  { id: "s13", num: 13, label: "Policy Changes" },
  { id: "s14", num: 14, label: "Contact Us" },
] as const;

const PLAIN_LIST_ITEMS = [
  { icon: "📦", text: "We collect only the data necessary to run this platform — nothing more" },
  {
    icon: "🚫",
    text: (
      <>
        We <strong>never sell</strong> your personal information to third parties, ever
      </>
    ),
  },
  { icon: "🗑️", text: "You can request deletion of your data at any time" },
  { icon: "🍪", text: "We use cookies to improve your experience — you can opt out of non-essential ones" },
  { icon: "⚕️", text: "We take medical data privacy extremely seriously with HIPAA & GDPR protections" },
  { icon: "🩺", text: "This site is not a substitute for professional medical advice" },
] as const;

const COLLECTION_CARDS = [
  {
    icon: "📋",
    title: "You Provide Directly",
    items: [
      "Name & email (registration)",
      "Password (encrypted)",
      "Contact form messages",
      "Newsletter sign-up",
      "Comment submissions",
      "Topic suggestion forms",
      "Author/reviewer applications",
    ],
  },
  {
    icon: "🤖",
    title: "Collected Automatically",
    items: [
      "IP address",
      "Browser type & version",
      "Device type (mobile/desktop)",
      "Operating system",
      "Pages visited & time spent",
      "Referring URL",
      "Click & scroll depth data",
    ],
  },
  {
    icon: "🍪",
    title: "Cookie & Tracking Data",
    items: [
      "Session cookies",
      "Analytics cookies",
      "Preference cookies",
      "Marketing pixels (if enabled)",
      "See full details in Section 5",
    ],
  },
  {
    icon: "🔗",
    title: "Third-Party Login",
    items: [
      "Google OAuth: name, email, photo",
      "Facebook Login: name, email, photo",
      "Only if you choose to use social login",
    ],
  },
  {
    icon: "📧",
    title: "Email Interaction Data",
    items: [
      "Newsletter open rates",
      "Click-through rates",
      "Unsubscribe actions",
      "Aggregated only — not individual profiles",
    ],
  },
] as const;

const PURPOSE_ROWS = [
  ["Providing and improving the platform", "Usage data, device info"],
  ["Sending newsletters and health updates", "Email address, preferences"],
  ["Responding to contact form inquiries", "Name, email, message"],
  ["Personalising content recommendations", "Reading history, specialty preferences"],
  ["Moderating comments", "Name, email, comment content"],
  ["Analytics and performance monitoring", "IP address, usage data (anonymised)"],
  ["Legal compliance", "All data as required by applicable law"],
  ["Fraud prevention and security", "IP address, login activity"],
] as const;

const LEGAL_CARDS = [
  {
    icon: "✅",
    title: "Consent",
    text: "Newsletter sign-up, non-essential cookies, marketing communications",
    style: { background: "#ecfdf5", borderColor: "#a7f3d0" },
  },
  {
    icon: "📄",
    title: "Contractual Necessity",
    text: "Account creation, author agreements, service delivery",
    style: { background: "var(--blue-light)", borderColor: "#93c5fd" },
  },
  {
    icon: "⚖️",
    title: "Legitimate Interests",
    text: "Platform security, analytics, fraud prevention, content improvement",
    style: { background: "#fffbeb", borderColor: "#fde68a" },
  },
  {
    icon: "🏛️",
    title: "Legal Obligation",
    text: "Compliance with applicable laws, court orders, regulatory requirements",
    style: { background: "#f3f0ff", borderColor: "#c4b5fd" },
  },
] as const;

const COOKIE_ROWS = [
  ["🔵 Strictly Necessary", "Site functionality, login sessions", "Session", "no"],
  ["🟢 Performance / Analytics", "Google Analytics, page speed", "2 years", "yes"],
  ["🟡 Functional", "Saved preferences, font size", "1 year", "yes"],
  ["🔴 Marketing / Targeting", "Ad retargeting (if applicable)", "90 days", "yes"],
] as const;

const TP_ROWS = [
  ["Google Analytics", "Usage analytics", "Anonymised usage data"],
  ["Google AdSense", "Ad display", "Anonymised browsing data"],
  ["Mailchimp", "Newsletter delivery", "Email, name"],
  ["Hotjar", "Heatmaps & UX", "Anonymised interaction data"],
  ["Meta Pixel", "Ad conversion tracking", "Page visit data (if enabled)"],
  ["Cloudflare", "Security & CDN", "IP address (security only)"],
] as const;

const RETENTION_ROWS = [
  ["Account data", "While active + 90 days after deletion request", "Contractual"],
  ["Newsletter data", "Until unsubscribe + 30 days", "Consent"],
  ["Contact form submissions", "12 months", "Legitimate interest"],
  ["Comment data", "Indefinitely unless deletion requested", "Legitimate interest"],
  ["Analytics data (Google)", "26 months (GA default)", "Legitimate interest"],
  ["Legal / compliance records", "7 years (as required by law)", "Legal obligation"],
  ["Security / fraud logs", "12 months", "Legitimate interest"],
] as const;

const RIGHTS_CARDS = [
  { icon: "👁️", title: "Access", text: "Request a copy of all data we hold about you" },
  { icon: "✏️", title: "Rectification", text: "Correct any inaccurate personal data" },
  { icon: "🗑️", title: "Erasure", text: '"Right to be forgotten" — request full data deletion' },
  { icon: "⏸️", title: "Restrict Processing", text: "Limit how we use your data in certain situations" },
  { icon: "📦", title: "Portability", text: "Export your data in a machine-readable format" },
  { icon: "🚫", title: "Object", text: "Object to processing based on legitimate interests" },
  { icon: "🍪", title: "Withdraw Consent", text: "Unsubscribe or change cookie settings anytime" },
  { icon: "📣", title: "Lodge a Complaint", text: "Complain to your local data protection authority" },
] as const;

const SECURITY_BADGES = [
  { icon: "🔒", title: "TLS 1.2 / 1.3", text: "Encryption in transit (HTTPS)" },
  { icon: "🗄️", title: "AES-256", text: "Encryption at rest" },
  { icon: "👥", title: "Role-Based Access", text: "Least privilege principle" },
  { icon: "🔍", title: "Security Audits", text: "Regular penetration testing" },
  { icon: "📚", title: "Staff Training", text: "Data protection training for all staff" },
  { icon: "🚨", title: "Incident Response", text: "Breach response plan in place" },
] as const;

const VERSION_ROWS = [
  {
    version: "v2.1",
    date: "June 2026",
    note: "Added cookie categories table, updated third-party service list, updated retention periods",
  },
  {
    version: "v2.0",
    date: "January 2025",
    note: "Full rewrite for GDPR compliance, added DPA references, updated breach notification procedures",
  },
  { version: "v1.0", date: "March 2023", note: "Initial Privacy Policy published" },
] as const;

const FOOTER_LINKS = DEFAULT_LINKS.filter((link) => link.href !== "/privacy-policy");

export default function PrivacyPolicyPageClient() {
  const { activeSection, scrollToSection } = usePolicyPageScroll([...SECTION_IDS]);
  const [versionOpen, setVersionOpen] = useState(true);

  const toggleVersionAccord = useCallback(() => {
    setVersionOpen((prev) => !prev);
  }, []);

  return (
    <div className="privacy-policy-page">

      <div className="page-hero">
        <div className="hero-inner">
          <h1>🛡️ Privacy Policy</h1>
          <p>
            &quot;Your privacy matters to us. Here&apos;s exactly how we collect, use, and protect your information.&quot;
          </p>
          <div className="hero-meta">
            <span>📅 Effective: January 1, 2025</span>
            <span>🔄 Last Updated: June 1, 2026</span>
            <span>📋 Version 2.1</span>
          </div>
          <div className="hero-badge-wrap">
            <div className="hero-badge">📖 Plain English Summary Available Below</div>
          </div>
        </div>
      </div>

      <div className="never-sell">
        <p>
          🔒 <strong>We NEVER sell your personal information to third parties.</strong> &nbsp;|&nbsp; 🛡️ HIPAA
          Compliant &nbsp;|&nbsp; 🇪🇺 GDPR Compliant &nbsp;|&nbsp; ♿ WCAG 2.1 AA
        </p>
      </div>

      <div className="plain-wrap">
        <div className="plain-box">
          <h3>🛡️ Quick Summary — What This Policy Means For You</h3>
          <ul className="plain-list">
            {PLAIN_LIST_ITEMS.map((item) => (
              <li key={typeof item.text === "string" ? item.text : item.icon}>
                <span>{item.icon}</span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="main-wrap">
        <div className="toc-sidebar">
          <div className="toc-head">📑 Contents</div>
          <div className="toc-list">
            {TOC_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`toc-item${activeSection === item.id ? " active" : ""}`}
                onClick={() => scrollToSection(item.id)}
              >
                <div className="toc-num">{item.num}</div>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div id="content-area">
          <div className="section" id="s1">
            <div className="sec-title">
              <div className="sec-num">1</div>Who We Are
            </div>
            <div className="callout c-blue">
              <div className="ch">🏥 About DrInsight</div>
              <p>
                DrInsight is a medical education and health information website. We publish content written and
                reviewed by qualified healthcare professionals. We do <strong>not</strong> provide medical diagnosis,
                treatment, or prescriptions.
              </p>
            </div>
            <div className="prose">
              <p>
                <strong>Company:</strong> DrInsight &nbsp;|&nbsp; <strong>Registration:</strong>{" "}
                #NY-2018-MED-4471
              </p>
              <p>
                <strong>Registered Office:</strong> DrInsight, Badin, Sindh Pakistan
              </p>
              <p>
                <strong>Data Controller:</strong> DrInsight
              </p>
              <p>
                <strong>Data Protection Officer (DPO):</strong> Dr. Javed Kumbhar —{" "}
                <a href="mailto:contact@drinsight.org">contact@drinsight.org</a>
              </p>
            </div>
          </div>

          <div className="section" id="s2">
            <div className="sec-title">
              <div className="sec-num">2</div>Information We Collect
            </div>
            <div className="collection-grid">
              {COLLECTION_CARDS.map((card) => (
                <div key={card.title} className="coll-card">
                  <div className="coll-card-ico">{card.icon}</div>
                  <h4>{card.title}</h4>
                  <ul>
                    {card.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="section" id="s3">
            <div className="sec-title">
              <div className="sec-num">3</div>How We Use Your Information
            </div>
            <div className="table-scroll">
              <table className="purpose-table">
                <thead>
                  <tr>
                    <th>Purpose</th>
                    <th>Data Used</th>
                  </tr>
                </thead>
                <tbody>
                  {PURPOSE_ROWS.map(([purpose, data]) => (
                    <tr key={purpose}>
                      <td>{purpose}</td>
                      <td>{data}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="section" id="s4">
            <div className="sec-title">
              <div className="sec-num">4</div>Legal Basis for Processing (GDPR)
            </div>
            <div className="legal-grid">
              {LEGAL_CARDS.map((card) => (
                <div key={card.title} className="legal-card" style={card.style}>
                  <i>{card.icon}</i>
                  <h4>{card.title}</h4>
                  <p>{card.text}</p>
                </div>
              ))}
            </div>
            <div className="callout c-blue">
              <div className="ch">🌍 Note for Non-EU Users</div>
              <p>
                Even if GDPR does not apply to you directly, we apply these same data protection standards globally to
                all users of DrInsight.
              </p>
            </div>
          </div>

          <div className="section" id="s5">
            <div className="sec-title">
              <div className="sec-num">5</div>Cookies & Tracking Technologies
            </div>
            <div className="prose">
              <p>
                Cookies are small text files stored on your device that help us remember your preferences and understand
                how you use our platform. We use the following categories:
              </p>
            </div>
            <div className="table-scroll">
              <table className="cookie-table">
                <thead>
                  <tr>
                    <th>Cookie Type</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                    <th>Can Opt Out?</th>
                  </tr>
                </thead>
                <tbody>
                  {COOKIE_ROWS.map(([type, purpose, duration, optOut]) => (
                    <tr key={type}>
                      <td>{type}</td>
                      <td>{purpose}</td>
                      <td>{duration}</td>
                      <td>
                        {optOut === "yes" ? (
                          <span className="can-opt">✅ Yes</span>
                        ) : (
                          <span className="no-opt">❌ No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="callout c-green">
              <div className="ch">🍪 Manage Your Cookie Preferences</div>
              <p>
                You can manage your cookie preferences at any time via our Cookie Settings panel. Changing preferences
                will not affect your ability to read content on this platform.
              </p>
            </div>
            <Link href="/cookie-policy" className="cookie-pref-btn">
              🍪 Manage Cookie Preferences
            </Link>
          </div>

          <div className="section" id="s6">
            <div className="sec-title">
              <div className="sec-num">6</div>Third-Party Services & Sharing
            </div>
            <div className="callout c-green">
              <div className="ch">🚫 We DO NOT Sell Your Data</div>
              <p>
                <strong>
                  We never sell, rent, or trade your personal information to third parties for their marketing
                  purposes. This is an absolute, non-negotiable commitment.
                </strong>
              </p>
            </div>
            <div className="prose">
              <p>
                <strong>Circumstances where data may be shared:</strong>
              </p>
            </div>
            <div className="callout c-gray">
              <div className="ch">📋 Limited Sharing With</div>
              <ul>
                <li>
                  <strong>Service providers:</strong> Hosting (AWS), email delivery (Mailchimp), analytics (Google
                  Analytics) — under strict data processing agreements
                </li>
                <li>
                  <strong>Legal requirements:</strong> Court orders, law enforcement requests — only as legally required
                </li>
                <li>
                  <strong>Business transfers:</strong> In case of merger or acquisition — users will be notified in
                  advance
                </li>
                <li>
                  <strong>Medical reviewers/authors:</strong> Limited to content they directly contribute to
                </li>
              </ul>
            </div>
            <div className="table-scroll">
              <table className="tp-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Purpose</th>
                    <th>Data Shared</th>
                    <th>Privacy Policy</th>
                  </tr>
                </thead>
                <tbody>
                  {TP_ROWS.map(([service, purpose, data]) => (
                    <tr key={service}>
                      <td>{service}</td>
                      <td>{purpose}</td>
                      <td>{data}</td>
                      <td>
                        <a href="#" className="tp-link">
                          View →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="section amber-l" id="s7">
            <div className="sec-title">
              <div className="sec-num amber">7</div>Medical Information & Sensitive Data
            </div>
            <div className="callout c-amber">
              <div className="ch">⚕️ Special Notice Regarding Health Information</div>
              <ul>
                <li>
                  This platform is informational only and does <strong>not</strong> collect or store personal medical
                  records
                </li>
                <li>
                  Any health topics discussed in comments or contact forms are treated with heightened confidentiality
                </li>
                <li>We do not share any health-related communications with third parties</li>
                <li>No health condition profiling — we do not build profiles of your medical interests</li>
                <li>
                  Google Analytics is configured with <strong>IP anonymisation</strong> enabled
                </li>
              </ul>
            </div>
            <div className="callout c-blue">
              <div className="ch">🛡️ Health Data Compliance</div>
              <ul>
                <li>
                  <strong>HIPAA</strong> — For US users, where applicable, we follow HIPAA guidance on tracking
                  technologies
                </li>
                <li>
                  <strong>GDPR Article 9</strong> — Special category health data protections for EU users
                </li>
                <li>
                  <strong>PDPA / Local Regulations</strong> — We respect applicable local health data laws
                </li>
              </ul>
            </div>
            <div className="callout c-red">
              <div className="ch">⚠️ Important Reminder</div>
              <p>
                Do not submit personal medical information through our contact forms. For medical concerns, always
                consult a licensed healthcare professional. Our platform does not provide medical consultations through
                contact forms.
              </p>
            </div>
          </div>

          <div className="section" id="s8">
            <div className="sec-title">
              <div className="sec-num">8</div>Data Retention
            </div>
            <div className="table-scroll">
              <table className="ret-table">
                <thead>
                  <tr>
                    <th>Data Type</th>
                    <th>Retention Period</th>
                    <th>Basis</th>
                  </tr>
                </thead>
                <tbody>
                  {RETENTION_ROWS.map(([type, period, basis]) => (
                    <tr key={type}>
                      <td>{type}</td>
                      <td>{period}</td>
                      <td>{basis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="section green-l" id="s9">
            <div className="sec-title">
              <div className="sec-num green">9</div>Your Rights & Choices
            </div>
            <div className="rights-grid">
              {RIGHTS_CARDS.map((card) => (
                <div key={card.title} className="right-card">
                  <i>{card.icon}</i>
                  <h4>{card.title}</h4>
                  <p>{card.text}</p>
                </div>
              ))}
            </div>
            <div className="callout c-blue">
              <div className="ch">📬 How to Exercise Your Rights</div>
              <ul>
                <li>
                  Email: <a href="mailto:contact@drinsight.org">contact@drinsight.org</a>
                </li>
                <li>
                  Response time: Within <strong>30 days</strong>
                </li>
                <li>Identity verification required before processing requests</li>
                <li>No fee charged for rights requests (unless manifestly unfounded or excessive)</li>
              </ul>
            </div>
            <button type="button" className="data-request-btn">
              📋 Submit a Data Request →
            </button>
          </div>

          <div className="section red-l" id="s10">
            <div className="sec-title">
              <div className="sec-num red">10</div>Children&apos;s Privacy
            </div>
            <div className="callout c-red">
              <div className="ch">🔞 Children&apos;s Privacy Notice</div>
              <ul>
                <li>
                  This platform is intended for users <strong>18 years and older</strong>
                </li>
                <li>
                  We do not knowingly collect data from children under 13 (COPPA) or under 16 (GDPR)
                </li>
                <li>
                  If a child&apos;s data is discovered, it will be <strong>deleted immediately</strong> without notice
                </li>
                <li>
                  Parents or guardians may contact us at{" "}
                  <a href="mailto:contact@drinsight.org">contact@drinsight.org</a>
                </li>
                <li>
                  Medical content is written for adult healthcare professionals and informed adult readers
                </li>
              </ul>
            </div>
          </div>

          <div className="section" id="s11">
            <div className="sec-title">
              <div className="sec-num">11</div>International Data Transfers
            </div>
            <div className="prose">
              <p>
                Our primary servers are located in the <strong>United States</strong>. Data may be transferred
                internationally via third-party services. We ensure adequate safeguards are in place for all
                international transfers.
              </p>
            </div>
            <div className="callout c-blue">
              <div className="ch">🌍 Transfer Safeguards</div>
              <ul>
                <li>
                  <strong>EU Standard Contractual Clauses (SCCs)</strong> — for transfers from the EU to third countries
                </li>
                <li>
                  <strong>Adequacy decisions</strong> — where recognised by applicable data protection authorities
                </li>
                <li>
                  <strong>Data Processing Agreements (DPAs)</strong> — signed with all third-party service providers
                </li>
                <li>
                  <strong>Privacy Shield successor frameworks</strong> — where applicable
                </li>
              </ul>
            </div>
          </div>

          <div className="section green-l" id="s12">
            <div className="sec-title">
              <div className="sec-num green">12</div>Data Security
            </div>
            <div className="security-grid">
              {SECURITY_BADGES.map((badge) => (
                <div key={badge.title} className="sec-badge">
                  <i>{badge.icon}</i>
                  <h4>{badge.title}</h4>
                  <p>{badge.text}</p>
                </div>
              ))}
            </div>
            <div className="callout c-red">
              <div className="ch">🚨 Data Breach Notification</div>
              <p>
                In the event of a confirmed data breach affecting your personal information, we will notify affected
                users within <strong>72 hours</strong> of discovering the breach, as required by GDPR and applicable
                laws.
              </p>
            </div>
            <div className="callout c-gray">
              <div className="ch">📋 Security Disclaimer</div>
              <p>
                No method of transmission over the internet is 100% secure. We strive for best-in-class security but
                cannot guarantee absolute security of data transmitted to or stored on our platform.
              </p>
            </div>
          </div>

          <div className="section" id="s13">
            <div className="sec-title">
              <div className="sec-num">13</div>Changes to This Policy
            </div>
            <div className="prose">
              <p>
                We reserve the right to update this Privacy Policy at any time. Continued use of the platform after
                changes constitutes acceptance of the updated policy.
              </p>
            </div>
            <div className="callout c-blue">
              <div className="ch">📬 How We Notify You</div>
              <ul>
                <li>Email notification to all registered users</li>
                <li>Prominent banner notice on website homepage</li>
                <li>Updated &quot;Last Modified&quot; date and version number at top of this page</li>
              </ul>
            </div>
            <div className={`accord${versionOpen ? " open" : ""}`}>
              <button type="button" className="accord-head" onClick={toggleVersionAccord}>
                <h4>📋 Version History</h4>
                <div className="accord-chev">▾</div>
              </button>
              <div className="accord-body">
                <table className="version-table">
                  <tbody>
                    {VERSION_ROWS.map((row) => (
                      <tr key={row.version}>
                        <td>
                          <span className="version-tag">{row.version}</span>
                        </td>
                        <td>
                          <strong>{row.date}</strong>
                        </td>
                        <td>{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="section" id="s14">
            <div className="sec-title">
              <div className="sec-num">14</div>Contact Us
            </div>
            <div className="contact-grid">
              <div className="contact-card">
                <h4>🛡️ Data Protection Officer</h4>
                <a href="mailto:privacy@drinsight.org">privacy@drinsight.org</a>
                <p>All privacy & data requests</p>
              </div>
              <div className="contact-card">
                <h4>✉️ General Inquiries</h4>
                <a href="mailto:contact@drinsight.org">contact@drinsight.org</a>
                <p>All general enquiries</p>
              </div>
              <div className="contact-card">
                <h4>⚖️ Legal Department</h4>
                <a href="mailto:legal@drinsight.org">legal@drinsight.org</a>
                <p>Legal and compliance matters</p>
              </div>
              <div className="contact-card">
                <h4>📍 Mailing Address</h4>
                <p>
                  DrInsight Inc.
                  <br />
                  Badin
                  <br />
                  Pakistan
                </p>
              </div>
            </div>
            <div className="callout c-green">
              <div className="ch">⏱️ Response Time Commitment</div>
              <p>
                We aim to respond to all privacy-related requests within <strong>5–7 business days</strong>. Data subject
                rights requests will be fulfilled within <strong>30 days</strong> as required by GDPR.
              </p>
            </div>
            <button type="button" className="data-request-btn">
              📋 Submit a Privacy Request →
            </button>
          </div>
        </div>
      </div>

      <div className="policy-footer">
        <div className="pf-inner">
          <div className="pill-links">
            <PolicyFooterLinks links={FOOTER_LINKS} />
          </div>
          <div className="pf-btns">
            <span style={{ fontSize: ".72rem", color: "var(--gray-400)" }}>
              Last updated: June 1, 2026 · v2.1
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
