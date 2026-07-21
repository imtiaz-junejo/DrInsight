"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { usePolicyPageScroll } from "@/hooks/usePolicyPageScroll";
import { DEFAULT_LINKS, PolicyFooterLinks } from "@/components/legal/PolicyFooterLinks";

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
];

const TOC_ITEMS = [
  { id: "s1", num: 1, label: "What Are Cookies?" },
  { id: "s2", num: 2, label: "Why We Use Cookies" },
  { id: "s3", num: 3, label: "Types of Cookies" },
  { id: "s4", num: 4, label: "Cookie Categories Detail" },
  { id: "s5", num: 5, label: "Third-Party Cookies" },
  { id: "s6", num: 6, label: "Cookies & Health Data" },
  { id: "s7", num: 7, label: "How Long Cookies Last" },
  { id: "s8", num: 8, label: "Manage Preferences" },
  { id: "s9", num: 9, label: "Browser Controls" },
  { id: "s10", num: 10, label: "Do Not Track" },
  { id: "s11", num: 11, label: "Mobile Apps" },
  { id: "s12", num: 12, label: "Policy Changes" },
  { id: "s13", num: 13, label: "Contact Us" },
];

const BROWSER_ACCORDIONS = [
  {
    id: "chrome",
    title: "🌐 Google Chrome",
    steps: [
      "Click the three-dot menu → Settings",
      "Privacy and security → Cookies and other site data",
      "Choose your preferred cookie setting",
      "To delete existing cookies: Clear browsing data → Cookies and other site data",
    ],
  },
  {
    id: "firefox",
    title: "🦊 Mozilla Firefox",
    steps: [
      "Click the hamburger menu → Settings",
      "Privacy & Security → Enhanced Tracking Protection",
      "Select Standard, Strict, or Custom",
      "To clear cookies: Clear Data → Cookies and Site Data",
    ],
  },
  {
    id: "safari-mac",
    title: "🧭 Safari (Mac)",
    steps: [
      "Safari menu → Preferences → Privacy",
      "Manage Website Data to view/delete cookies",
      'Check "Prevent cross-site tracking"',
    ],
  },
  {
    id: "safari-ios",
    title: "📱 Safari (iPhone / iPad)",
    steps: [
      "Settings → Safari → Privacy & Security",
      'Toggle "Prevent Cross-Site Tracking"',
      '"Block All Cookies" option available if needed',
    ],
  },
  {
    id: "edge",
    title: "🔵 Microsoft Edge",
    steps: [
      "Three-dot menu → Settings → Cookies and site permissions",
      "Manage and delete cookies and site data",
      "Choose Block, Allow, or Session only",
    ],
  },
  {
    id: "opera",
    title: "⚙️ Opera",
    steps: [
      "Opera menu → Settings → Advanced → Privacy & security",
      "Site Settings → Cookies and site data",
      "Choose your preferred level of cookie control",
    ],
  },
];

const FOOTER_LINKS = DEFAULT_LINKS.filter((link) => link.href !== "/cookie-policy");

type CookiePrefs = {
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
  social: boolean;
};

export function CookiePolicyPageClient() {
  const { activeSection, scrollToSection } = usePolicyPageScroll(SECTION_IDS, 120);

  const [modalOpen, setModalOpen] = useState(false);
  const [prefs, setPrefs] = useState<CookiePrefs>({
    analytics: false,
    functional: false,
    marketing: false,
    social: false,
  });
  const [openAccords, setOpenAccords] = useState<Record<string, boolean>>({
    chrome: true,
    version: true,
  });

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const togglePref = (key: keyof CookiePrefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAccord = (id: string) => {
    setOpenAccords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const acceptAll = () => {
    setPrefs({ analytics: true, functional: true, marketing: true, social: true });
    setTimeout(() => {
      closeModal();
      alert("✅ All cookies accepted. Thank you!");
    }, 300);
  };

  const rejectAll = () => {
    setPrefs({ analytics: false, functional: false, marketing: false, social: false });
    setTimeout(() => {
      closeModal();
      alert("✅ Non-essential cookies rejected. Only strictly necessary cookies are active.");
    }, 300);
  };

  const savePrefs = () => {
    const labels = ["Analytics", "Functional", "Marketing", "Social Media"];
    const keys: (keyof CookiePrefs)[] = ["analytics", "functional", "marketing", "social"];
    const enabled = labels.filter((_, i) => prefs[keys[i]]);
    closeModal();
    alert(
      "✅ Preferences saved!\nEnabled: " + (enabled.length ? enabled.join(", ") : "None (except strictly necessary)"),
    );
  };

  return (
    <div className="cookie-policy-page">

      <div className={`modal-overlay${modalOpen ? "" : " hidden"}`}>
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">
          <div className="modal-header">
            <h3 id="cookie-modal-title">🍪 Cookie Preferences</h3>
            <button type="button" className="modal-close" onClick={closeModal} aria-label="Close">
              ✕
            </button>
          </div>
          <div className="modal-body">
            <div className="cookie-row">
              <div className="cookie-row-left">
                <span className="cookie-row-icon">🔵</span>
                <div>
                  <h4>Strictly Necessary</h4>
                  <p>Essential for the site to function. Cannot be disabled.</p>
                </div>
              </div>
              <div className="toggle-wrap">
                <button type="button" className="toggle always" disabled aria-label="Strictly necessary cookies always on" />
              </div>
            </div>
            <div className="cookie-row">
              <div className="cookie-row-left">
                <span className="cookie-row-icon">🟢</span>
                <div>
                  <h4>Analytics & Performance</h4>
                  <p>Help us understand how readers use the platform.</p>
                </div>
              </div>
              <div className="toggle-wrap">
                <button
                  type="button"
                  className={`toggle${prefs.analytics ? " on" : ""}`}
                  onClick={() => togglePref("analytics")}
                  aria-pressed={prefs.analytics}
                  aria-label="Toggle analytics cookies"
                />
              </div>
            </div>
            <div className="cookie-row">
              <div className="cookie-row-left">
                <span className="cookie-row-icon">🟡</span>
                <div>
                  <h4>Functional & Preferences</h4>
                  <p>Remember your settings, font size, and bookmarks.</p>
                </div>
              </div>
              <div className="toggle-wrap">
                <button
                  type="button"
                  className={`toggle${prefs.functional ? " on" : ""}`}
                  onClick={() => togglePref("functional")}
                  aria-pressed={prefs.functional}
                  aria-label="Toggle functional cookies"
                />
              </div>
            </div>
            <div className="cookie-row">
              <div className="cookie-row-left">
                <span className="cookie-row-icon">🔴</span>
                <div>
                  <h4>Marketing & Advertising</h4>
                  <p>Relevant ads and campaign performance measurement.</p>
                </div>
              </div>
              <div className="toggle-wrap">
                <button
                  type="button"
                  className={`toggle${prefs.marketing ? " on" : ""}`}
                  onClick={() => togglePref("marketing")}
                  aria-pressed={prefs.marketing}
                  aria-label="Toggle marketing cookies"
                />
              </div>
            </div>
            <div className="cookie-row">
              <div className="cookie-row-left">
                <span className="cookie-row-icon">🟠</span>
                <div>
                  <h4>Social Media</h4>
                  <p>Enable sharing buttons and embedded social content.</p>
                </div>
              </div>
              <div className="toggle-wrap">
                <button
                  type="button"
                  className={`toggle${prefs.social ? " on" : ""}`}
                  onClick={() => togglePref("social")}
                  aria-pressed={prefs.social}
                  aria-label="Toggle social media cookies"
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="modal-btn accept" onClick={acceptAll}>
              Accept All
            </button>
            <button type="button" className="modal-btn reject" onClick={rejectAll}>
              Reject Non-Essential
            </button>
            <button type="button" className="modal-btn save" onClick={savePrefs}>
              💾 Save Custom
            </button>
          </div>
        </div>
      </div>

      <div className="page-hero">
        <div className="hero-inner">
          <h1>🍪 Cookie Policy</h1>
          <p>
            &quot;We use cookies to improve your experience on our platform. Here&apos;s exactly what we use, why we use
            it, and how you can control it.&quot;
          </p>
          <div className="hero-meta">
            <span>📅 Effective: January 1, 2025</span>
            <span>🔄 Last Updated: June 1, 2026</span>
            <span>📋 Version 2.1</span>
          </div>
          <div className="hero-actions">
            <button type="button" className="hero-btn primary" onClick={openModal}>
              🍪 Manage My Cookie Preferences
            </button>
          </div>
        </div>
      </div>

      <div className="plain-box-wrap">
        <div className="plain-box">
          <h3>🍪 In Simple Terms — What This Cookie Policy Means</h3>
          <ul className="plain-list">
            <li>
              <span>🗂️</span>Cookies are small files stored on your device when you visit our site
            </li>
            <li>
              <span>🔵</span>Some cookies are essential — the site won&apos;t work properly without them
            </li>
            <li>
              <span>🟢</span>Others help us understand how readers use our platform so we can improve it
            </li>
            <li>
              <span>⚕️</span>
              We <strong>never</strong> use cookies to collect sensitive medical or health information
            </li>
            <li>
              <span>✅</span>You can accept, reject, or customize non-essential cookies at any time
            </li>
            <li>
              <span>📖</span>
              Changing your preferences will <strong>not</strong> affect your ability to read our content
            </li>
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

        <div className="content">
          <div className="section" id="s1">
            <div className="sec-title">
              <div className="sec-num">1</div>What Are Cookies?
            </div>
            <div className="prose">
              <p>
                Cookies are small text files placed on your device (computer, tablet, or smartphone) when you visit a
                website. They allow the website to remember information about your visit — such as your preferred
                language, font size settings, or whether you&apos;ve already accepted our cookie notice.
              </p>
            </div>
            <div className="cookie-flow">
              <div className="flow-step">
                <div>🌐</div>
                <span>You visit DrInsight</span>
              </div>
              <div className="flow-arrow">→</div>
              <div className="flow-step">
                <div>🖥️</div>
                <span>Server sends cookie</span>
              </div>
              <div className="flow-arrow">→</div>
              <div className="flow-step">
                <div>💾</div>
                <span>Stored on your device</span>
              </div>
              <div className="flow-arrow">→</div>
              <div className="flow-step">
                <div>🔄</div>
                <span>Next visit</span>
              </div>
              <div className="flow-arrow">→</div>
              <div className="flow-step">
                <div>✅</div>
                <span>Site remembers your preferences</span>
              </div>
            </div>
            <div className="callout c-green">
              <div className="callout-head">✅ What Cookies CANNOT Do</div>
              <ul>
                <li>❌ Not viruses or malware</li>
                <li>❌ Cannot access other files on your device</li>
                <li>❌ Cannot carry personal medical records</li>
                <li>❌ Cannot execute programs</li>
                <li>❌ Cannot identify you personally without your consent</li>
              </ul>
            </div>
            <div className="prose">
              <p>
                <strong>Similar technologies also covered:</strong> Web beacons (tiny tracking images) · Pixel tags (ad
                conversion tracking) · Local storage · Session storage ·{" "}
                <span className="prose-highlight-green">We do NOT use browser fingerprinting.</span>
              </p>
            </div>
          </div>

          <div className="section" id="s2">
            <div className="sec-title">
              <div className="sec-num">2</div>Why We Use Cookies
            </div>
            <div className="callout c-green">
              <div className="callout-head">✅ We Use Cookies To</div>
              <ul>
                <li>Keep the platform functioning correctly</li>
                <li>Remember your preferences (font size, contrast mode, language)</li>
                <li>Keep you logged into your account across pages</li>
                <li>Understand how readers navigate and use our content</li>
                <li>Measure article performance and reading patterns</li>
                <li>Deliver relevant content recommendations</li>
                <li>Detect and prevent security threats and fraud</li>
                <li>Display relevant advertisements (where applicable)</li>
                <li>Enable social media sharing features</li>
              </ul>
            </div>
            <div className="callout c-red">
              <div className="callout-head">🚫 We Do NOT Use Cookies To</div>
              <ul>
                <li>Collect sensitive health or medical information</li>
                <li>Build profiles of your medical conditions or treatments</li>
                <li>Sell your data to third parties</li>
                <li>Track your activity across unrelated websites without disclosure</li>
                <li>Target you with health-related advertising based on medical behaviour</li>
              </ul>
            </div>
          </div>

          <div className="section" id="s3">
            <div className="sec-title">
              <div className="sec-num">3</div>Types of Cookies We Use
            </div>
            <div className="table-scroll">
              <table className="overview-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cookie Type</th>
                    <th>Purpose</th>
                    <th>Can You Opt Out?</th>
                    <th>Default Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>
                      <span className="cat-pill cat-necessary">🔵 Strictly Necessary</span>
                    </td>
                    <td>Core site functionality</td>
                    <td>
                      <span className="no-opt">❌ No</span>
                    </td>
                    <td>
                      <span className="status-on">Always ON</span>
                    </td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>
                      <span className="cat-pill cat-analytics">🟢 Performance / Analytics</span>
                    </td>
                    <td>Usage measurement</td>
                    <td>
                      <span className="can-opt">✅ Yes</span>
                    </td>
                    <td>
                      <span className="status-off">Off by default</span>
                    </td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>
                      <span className="cat-pill cat-functional">🟡 Functional</span>
                    </td>
                    <td>Preferences & personalisation</td>
                    <td>
                      <span className="can-opt">✅ Yes</span>
                    </td>
                    <td>
                      <span className="status-off">Off by default</span>
                    </td>
                  </tr>
                  <tr>
                    <td>4</td>
                    <td>
                      <span className="cat-pill cat-marketing">🔴 Marketing / Advertising</span>
                    </td>
                    <td>Ad targeting & retargeting</td>
                    <td>
                      <span className="can-opt">✅ Yes</span>
                    </td>
                    <td>
                      <span className="status-off">Off by default</span>
                    </td>
                  </tr>
                  <tr>
                    <td>5</td>
                    <td>
                      <span className="cat-pill cat-social">🟠 Social Media</span>
                    </td>
                    <td>Sharing & embed features</td>
                    <td>
                      <span className="can-opt">✅ Yes</span>
                    </td>
                    <td>
                      <span className="status-off">Off by default</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="section" id="s4">
            <div className="sec-title">
              <div className="sec-num">4</div>Cookie Categories in Detail
            </div>

            <div className="cat-header cat-necessary-bg">🔵 Category 1 — Strictly Necessary Cookies</div>
            <div className="prose">
              <p>
                These cookies are essential for the platform to function and cannot be disabled. They do not require
                your consent under most privacy laws.
              </p>
            </div>
            <div className="table-scroll">
              <table className="cookie-table">
                <thead>
                  <tr>
                    <th>Cookie Name</th>
                    <th>Provider</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>session_id</code>
                    </td>
                    <td>
                      <span className="provider-tag">DrInsight</span>
                    </td>
                    <td>Maintains your login session</td>
                    <td>Session</td>
                  </tr>
                  <tr>
                    <td>
                      <code>csrf_token</code>
                    </td>
                    <td>
                      <span className="provider-tag">DrInsight</span>
                    </td>
                    <td>Prevents cross-site request forgery</td>
                    <td>Session</td>
                  </tr>
                  <tr>
                    <td>
                      <code>cookie_consent</code>
                    </td>
                    <td>
                      <span className="provider-tag">DrInsight</span>
                    </td>
                    <td>Stores your cookie preferences</td>
                    <td>12 months</td>
                  </tr>
                  <tr>
                    <td>
                      <code>lang_pref</code>
                    </td>
                    <td>
                      <span className="provider-tag">DrInsight</span>
                    </td>
                    <td>Remembers your language selection</td>
                    <td>12 months</td>
                  </tr>
                  <tr>
                    <td>
                      <code>acc_settings</code>
                    </td>
                    <td>
                      <span className="provider-tag">DrInsight</span>
                    </td>
                    <td>Saves accessibility preferences (font size, contrast)</td>
                    <td>12 months</td>
                  </tr>
                  <tr>
                    <td>
                      <code>load_balancer</code>
                    </td>
                    <td>
                      <span className="provider-tag">DrInsight</span>
                    </td>
                    <td>Routes traffic for site performance</td>
                    <td>Session</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="cat-header cat-analytics-bg cat-header-spaced">
              🟢 Category 2 — Performance & Analytics Cookies
            </div>
            <div className="prose">
              <p>
                Help us understand how visitors interact with our platform. Data collected is aggregated and
                anonymised — not linked to individual users.
              </p>
            </div>
            <div className="table-scroll">
              <table className="cookie-table">
                <thead>
                  <tr>
                    <th>Cookie Name</th>
                    <th>Provider</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>_ga</code>
                    </td>
                    <td>
                      <span className="provider-tag">Google Analytics</span>
                    </td>
                    <td>Distinguishes unique users</td>
                    <td>2 years</td>
                  </tr>
                  <tr>
                    <td>
                      <code>_ga_XXXXXX</code>
                    </td>
                    <td>
                      <span className="provider-tag">Google Analytics</span>
                    </td>
                    <td>Session state tracking</td>
                    <td>2 years</td>
                  </tr>
                  <tr>
                    <td>
                      <code>_gid</code>
                    </td>
                    <td>
                      <span className="provider-tag">Google Analytics</span>
                    </td>
                    <td>Distinguishes users (24hr)</td>
                    <td>24 hours</td>
                  </tr>
                  <tr>
                    <td>
                      <code>_gat</code>
                    </td>
                    <td>
                      <span className="provider-tag">Google Analytics</span>
                    </td>
                    <td>Throttles request rate</td>
                    <td>1 minute</td>
                  </tr>
                  <tr>
                    <td>
                      <code>hj_id</code>
                    </td>
                    <td>
                      <span className="provider-tag">Hotjar</span>
                    </td>
                    <td>Anonymous heatmap & session recording</td>
                    <td>365 days</td>
                  </tr>
                  <tr>
                    <td>
                      <code>hj_ses</code>
                    </td>
                    <td>
                      <span className="provider-tag">Hotjar</span>
                    </td>
                    <td>Session tracking</td>
                    <td>30 minutes</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="cat-header cat-functional-bg cat-header-spaced">🟡 Category 3 — Functional Cookies</div>
            <div className="prose">
              <p>Enable enhanced and personalised features. Store your stated preferences to improve return visits.</p>
            </div>
            <div className="table-scroll">
              <table className="cookie-table">
                <thead>
                  <tr>
                    <th>Cookie Name</th>
                    <th>Provider</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>font_size</code>
                    </td>
                    <td>
                      <span className="provider-tag">DrInsight</span>
                    </td>
                    <td>Remembers font size preference</td>
                    <td>6 months</td>
                  </tr>
                  <tr>
                    <td>
                      <code>dark_mode</code>
                    </td>
                    <td>
                      <span className="provider-tag">DrInsight</span>
                    </td>
                    <td>Saves dark/light mode setting</td>
                    <td>6 months</td>
                  </tr>
                  <tr>
                    <td>
                      <code>bookmarks</code>
                    </td>
                    <td>
                      <span className="provider-tag">DrInsight</span>
                    </td>
                    <td>Stores saved/bookmarked articles</td>
                    <td>12 months</td>
                  </tr>
                  <tr>
                    <td>
                      <code>newsletter_dismissed</code>
                    </td>
                    <td>
                      <span className="provider-tag">DrInsight</span>
                    </td>
                    <td>Prevents repeated newsletter popup</td>
                    <td>30 days</td>
                  </tr>
                  <tr>
                    <td>
                      <code>specialty_pref</code>
                    </td>
                    <td>
                      <span className="provider-tag">DrInsight</span>
                    </td>
                    <td>Saves preferred specialty filters</td>
                    <td>6 months</td>
                  </tr>
                  <tr>
                    <td>
                      <code>intercom_id</code>
                    </td>
                    <td>
                      <span className="provider-tag">Intercom</span>
                    </td>
                    <td>Live chat session identification</td>
                    <td>9 months</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="cat-header cat-marketing-bg cat-header-spaced">
              🔴 Category 4 — Marketing & Advertising Cookies
            </div>
            <div className="callout c-amber" style={{ marginBottom: 10 }}>
              <div className="callout-head">⚠️ Important Health Data Notice</div>
              <p>
                We instruct all advertising partners NOT to use health-related behavioural data for ad targeting. No
                health condition profiling is permitted.
              </p>
            </div>
            <div className="table-scroll">
              <table className="cookie-table">
                <thead>
                  <tr>
                    <th>Cookie Name</th>
                    <th>Provider</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>_fbp</code>
                    </td>
                    <td>
                      <span className="provider-tag">Meta / Facebook</span>
                    </td>
                    <td>Ad delivery and conversion tracking</td>
                    <td>90 days</td>
                  </tr>
                  <tr>
                    <td>
                      <code>fr</code>
                    </td>
                    <td>
                      <span className="provider-tag">Meta / Facebook</span>
                    </td>
                    <td>Ad targeting across Facebook network</td>
                    <td>90 days</td>
                  </tr>
                  <tr>
                    <td>
                      <code>IDE</code>
                    </td>
                    <td>
                      <span className="provider-tag">Google DoubleClick</span>
                    </td>
                    <td>Ad personalisation and measurement</td>
                    <td>13 months</td>
                  </tr>
                  <tr>
                    <td>
                      <code>test_cookie</code>
                    </td>
                    <td>
                      <span className="provider-tag">Google DoubleClick</span>
                    </td>
                    <td>Checks browser cookie support</td>
                    <td>15 minutes</td>
                  </tr>
                  <tr>
                    <td>
                      <code>NID</code>
                    </td>
                    <td>
                      <span className="provider-tag">Google</span>
                    </td>
                    <td>Ad preferences and remarketing</td>
                    <td>6 months</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="cat-header cat-social-bg cat-header-spaced">🟠 Category 5 — Social Media Cookies</div>
            <div className="prose">
              <p>
                Set by social media platforms when you interact with embedded share buttons. These platforms may track
                your visit even if you don&apos;t click the buttons. To limit this, log out of social platforms before
                visiting, or use private browsing mode.
              </p>
            </div>
            <div className="table-scroll">
              <table className="cookie-table">
                <thead>
                  <tr>
                    <th>Cookie Name</th>
                    <th>Provider</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>_twitter_sess</code>
                    </td>
                    <td>
                      <span className="provider-tag">Twitter / X</span>
                    </td>
                    <td>Session management for share buttons</td>
                    <td>Session</td>
                  </tr>
                  <tr>
                    <td>
                      <code>ct0</code>
                    </td>
                    <td>
                      <span className="provider-tag">Twitter / X</span>
                    </td>
                    <td>CSRF protection for Twitter widgets</td>
                    <td>1 year</td>
                  </tr>
                  <tr>
                    <td>
                      <code>li_at</code>
                    </td>
                    <td>
                      <span className="provider-tag">LinkedIn</span>
                    </td>
                    <td>LinkedIn share button tracking</td>
                    <td>1 year</td>
                  </tr>
                  <tr>
                    <td>
                      <code>bcookie</code>
                    </td>
                    <td>
                      <span className="provider-tag">LinkedIn</span>
                    </td>
                    <td>Browser identification</td>
                    <td>2 years</td>
                  </tr>
                  <tr>
                    <td>
                      <code>YSC</code>
                    </td>
                    <td>
                      <span className="provider-tag">YouTube</span>
                    </td>
                    <td>Tracks YouTube video interactions</td>
                    <td>Session</td>
                  </tr>
                  <tr>
                    <td>
                      <code>VISITOR_INFO1_LIVE</code>
                    </td>
                    <td>
                      <span className="provider-tag">YouTube</span>
                    </td>
                    <td>Estimates YouTube bandwidth</td>
                    <td>6 months</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="section" id="s5">
            <div className="sec-title">
              <div className="sec-num">5</div>Third-Party Cookies
            </div>
            <div className="table-scroll">
              <table className="tp-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Category</th>
                    <th>Purpose</th>
                    <th>Privacy Policy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Google Analytics</td>
                    <td>
                      <span className="cat-pill cat-analytics">Analytics</span>
                    </td>
                    <td>Usage measurement</td>
                    <td>
                      <a href="#" className="tp-link">
                        View →
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td>Google AdSense</td>
                    <td>
                      <span className="cat-pill cat-marketing">Advertising</span>
                    </td>
                    <td>Ad display</td>
                    <td>
                      <a href="#" className="tp-link">
                        View →
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td>Google Fonts</td>
                    <td>
                      <span className="cat-pill cat-functional">Functional</span>
                    </td>
                    <td>Font delivery</td>
                    <td>
                      <a href="#" className="tp-link">
                        View →
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td>Hotjar</td>
                    <td>
                      <span className="cat-pill cat-analytics">Analytics</span>
                    </td>
                    <td>Heatmaps & recordings</td>
                    <td>
                      <a href="#" className="tp-link">
                        View →
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td>Meta Pixel</td>
                    <td>
                      <span className="cat-pill cat-marketing">Advertising</span>
                    </td>
                    <td>Conversion tracking</td>
                    <td>
                      <a href="#" className="tp-link">
                        View →
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td>YouTube</td>
                    <td>
                      <span className="cat-pill cat-functional">Functional</span>
                    </td>
                    <td>Embedded video playback</td>
                    <td>
                      <a href="#" className="tp-link">
                        View →
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td>Mailchimp</td>
                    <td>
                      <span className="cat-pill cat-functional">Functional</span>
                    </td>
                    <td>Newsletter tracking</td>
                    <td>
                      <a href="#" className="tp-link">
                        View →
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td>Intercom</td>
                    <td>
                      <span className="cat-pill cat-functional">Functional</span>
                    </td>
                    <td>Live chat support</td>
                    <td>
                      <a href="#" className="tp-link">
                        View →
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td>Cloudflare</td>
                    <td>
                      <span className="cat-pill cat-necessary">Necessary</span>
                    </td>
                    <td>Security & performance</td>
                    <td>
                      <a href="#" className="tp-link">
                        View →
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td>LinkedIn Insight</td>
                    <td>
                      <span className="cat-pill cat-marketing">Advertising</span>
                    </td>
                    <td>B2B audience analytics</td>
                    <td>
                      <a href="#" className="tp-link">
                        View →
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="prose">
              <p>
                Third-party cookies are governed by the privacy policies of those providers. We conduct annual reviews
                of all third-party integrations and will update this table whenever a new service is added.
              </p>
            </div>
          </div>

          <div className="section" id="s6">
            <div className="sec-title">
              <div className="sec-num">6</div>Cookies & Sensitive Health Data
            </div>
            <div className="health-notice">
              <h3>⚕️ Special Notice Regarding Health Data & Cookies</h3>
              <ul className="health-list">
                <li>
                  <span>🚫</span>
                  <div>
                    <strong>No health condition profiling:</strong> We do not use cookies to build profiles of medical
                    conditions, symptoms, or treatments you read about.
                  </div>
                </li>
                <li>
                  <span>🚫</span>
                  <div>
                    <strong>No sensitive targeting:</strong> We instruct all advertising partners not to use health
                    topic browsing for ad targeting.
                  </div>
                </li>
                <li>
                  <span>✅</span>
                  <div>
                    <strong>Anonymised analytics:</strong> All analytics data is aggregated — individual reading
                    patterns are not linked to identifiable users.
                  </div>
                </li>
                <li>
                  <span>✅</span>
                  <div>
                    <strong>No data brokering:</strong> We never sell cookie-derived data to health insurers, employers,
                    or pharmaceutical companies.
                  </div>
                </li>
                <li>
                  <span>✅</span>
                  <div>
                    <strong>IP anonymisation:</strong> Google Analytics is configured with IP anonymisation enabled.
                  </div>
                </li>
              </ul>
            </div>
            <div className="callout c-blue">
              <div className="callout-head">🛡️ Compliance</div>
              <ul>
                <li>GDPR Article 9 (special category health data)</li>
                <li>HIPAA guidance on tracking technologies (where applicable)</li>
                <li>FTC guidance on health data and advertising</li>
              </ul>
            </div>
          </div>

          <div className="section" id="s7">
            <div className="sec-title">
              <div className="sec-num">7</div>How Long Cookies Last
            </div>
            <div className="duration-grid">
              <div className="duration-card session">
                <div className="duration-icon">⏱️</div>
                <h4>Session Cookies</h4>
                <p>
                  Temporary — exist only while your browser is open. Deleted automatically when you close your browser.
                  Used for: login sessions, CSRF tokens, temporary navigation state.
                </p>
              </div>
              <div className="duration-card persistent">
                <div className="duration-icon">📅</div>
                <h4>Persistent Cookies</h4>
                <p>
                  Remain on your device for a set period. Duration: 24 hours to 2 years. Used for: remembering
                  preferences, analytics measurement, ad tracking. See Section 4 for full reference.
                </p>
              </div>
            </div>
            <div className="prose">
              <p>
                Cookie durations may be shorter if you: clear browser cookies manually · use private/incognito browsing
                · use a cookie-blocking extension · set your browser to reject cookies.
              </p>
            </div>
          </div>

          <div className="section" id="s8">
            <div className="sec-title">
              <div className="sec-num">8</div>How to Manage Your Cookie Preferences
            </div>
            <div className="callout c-green">
              <div className="callout-head">✅ Option A — Cookie Preference Center (Recommended)</div>
              <p>
                Click the button below (or the floating 🍪 button at bottom-left) to open our interactive Cookie
                Preference Panel and control each category individually.
              </p>
            </div>
            <button type="button" className="pref-center-btn" onClick={openModal}>
              🍪 Open Cookie Preference Center
            </button>
            <div className="callout c-blue">
              <div className="callout-head">💡 Option B — Accept All / Reject All</div>
              <ul>
                <li>
                  <strong>Accept All:</strong> Enables all cookie categories including analytics, functional, marketing,
                  and social
                </li>
                <li>
                  <strong>Reject All Non-Essential:</strong> Only strictly necessary cookies remain active — your
                  content access is unchanged
                </li>
                <li>Preferences are saved for 12 months and can be updated at any time</li>
              </ul>
            </div>
          </div>

          <div className="section" id="s9">
            <div className="sec-title">
              <div className="sec-num">9</div>Browser-Level Cookie Controls
            </div>
            {BROWSER_ACCORDIONS.map((acc) => (
              <div key={acc.id} className={`accord${openAccords[acc.id] ? " open" : ""}`}>
                <button type="button" className="accord-head" onClick={() => toggleAccord(acc.id)}>
                  <h4>{acc.title}</h4>
                  <div className="accord-chev">▾</div>
                </button>
                <div className="accord-body">
                  <ol>
                    {acc.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
            <div className="callout c-amber" style={{ marginTop: 12 }}>
              <div className="callout-head">⚠️ Note</div>
              <p>
                Disabling cookies at the browser level may affect the functionality of other websites you visit, not
                just ours. We recommend using our Cookie Preference Center for platform-specific control.
              </p>
            </div>
          </div>

          <div className="section" id="s10">
            <div className="sec-title">
              <div className="sec-num">10</div>Do Not Track (DNT) Signals
            </div>
            <div className="prose">
              <p>
                Some browsers offer a &quot;Do Not Track&quot; (DNT) signal that can be sent to websites. Currently
                there is no universal standard for how websites must respond to DNT signals.
              </p>
              <p>
                <strong>Our current DNT response:</strong> We acknowledge DNT signals. We do not currently alter our
                cookie behaviour in response to DNT signals due to lack of standardisation. We recommend using our
                Cookie Preference Center for direct control over tracking. We support the{" "}
                <strong>Global Privacy Control (GPC)</strong> signal where technically feasible, and will update this
                section if a universal DNT standard is established.
              </p>
            </div>
          </div>

          <div className="section" id="s11">
            <div className="sec-title">
              <div className="sec-num">11</div>Cookie Policy for Mobile Apps
            </div>
            <div className="prose">
              <p>
                If you use the DrInsight mobile application, this section applies. Mobile apps may use device
                identifiers (IDFA on iOS, GAID on Android) instead of traditional cookies, app analytics tools (Firebase
                Analytics), and push notification tokens (only with explicit permission).
              </p>
            </div>
            <div className="callout c-blue">
              <div className="callout-head">📱 How to Control Mobile Tracking</div>
              <ul>
                <li>
                  <strong>iOS:</strong> Settings → Privacy & Security → Tracking → Toggle off per app
                </li>
                <li>
                  <strong>Android:</strong> Settings → Privacy → Ads → Opt out of Ads Personalisation
                </li>
              </ul>
            </div>
          </div>

          <div className="section" id="s12">
            <div className="sec-title">
              <div className="sec-num">12</div>Changes to This Cookie Policy
            </div>
            <div className="prose">
              <p>
                We may update this Cookie Policy to reflect new cookies, changes in third-party services, updates to
                privacy laws, or user feedback. Material changes trigger re-display of the cookie consent banner and
                email notification to registered users.
              </p>
            </div>
            <div className={`accord${openAccords.version ? " open" : ""}`}>
              <button type="button" className="accord-head" onClick={() => toggleAccord("version")}>
                <h4>📋 Version History</h4>
                <div className="accord-chev">▾</div>
              </button>
              <div className="accord-body">
                <table className="version-table">
                  <tbody>
                    <tr>
                      <td>
                        <span className="version-tag">v2.1</span>
                      </td>
                      <td>
                        <strong>June 2026</strong>
                      </td>
                      <td>Added LinkedIn Insight, updated Hotjar duration, GPC compliance update</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="version-tag">v2.0</span>
                      </td>
                      <td>
                        <strong>January 2025</strong>
                      </td>
                      <td>Full rewrite, added GPC support section, new health data protections</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="version-tag">v1.0</span>
                      </td>
                      <td>
                        <strong>March 2023</strong>
                      </td>
                      <td>Initial Cookie Policy published</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="section" id="s13">
            <div className="sec-title">
              <div className="sec-num">13</div>Contact Us
            </div>
            <div className="contact-grid">
              <div className="contact-card">
                <h4>🍪 Cookie Enquiries</h4>
                <a href="mailto:privacy@drinsight.org">privacy@drinsight.org</a>
                <p>For cookie questions or to request active cookie list</p>
              </div>
              <div className="contact-card">
                <h4>🛡️ Data Protection Officer</h4>
                <a href="mailto:dpo@drinsight.org">dpo@drinsight.org</a>
                <p>For GDPR-related data concerns</p>
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
              <div className="contact-card">
                <h4>🇪🇺 EU Supervisory Authority</h4>
                <p>
                  EU-based users may complain to their local Data Protection Authority (DPA) if unhappy with our cookie
                  practices.
                </p>
              </div>
            </div>
            <div className="callout c-green" style={{ marginTop: 14 }}>
              <div className="callout-head">⏱️ Response Time</div>
              <p>
                We aim to respond to all cookie-related enquiries within <strong>5–7 business days</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="policy-footer">
        <div className="pf-inner">
          <div className="pill-links">
            <PolicyFooterLinks links={FOOTER_LINKS} />
          </div>
          <div className="pf-actions">
            <span className="pf-meta">Last updated: June 1, 2026 · v2.1</span>
            <button type="button" className="pf-btn" onClick={openModal}>
              🍪 Manage Preferences
            </button>
          </div>
        </div>
      </div>

      <button type="button" className="floating-cookie" onClick={openModal}>
        🍪 Cookie Settings
      </button>
    </div>
  );
}
