"use client";

import { useState } from "react";
import Link from "next/link";
import "@/styles/terms-conditions-page.css";
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
  "s14",
  "s15",
  "s16",
  "s17",
  "s18",
];

const TOC_ITEMS = [
  { id: "s1", num: 1, label: "Acceptance of Terms" },
  { id: "s2", num: 2, label: "Eligibility & Accounts" },
  { id: "s3", num: 3, label: "Nature of Medical Content" },
  { id: "s4", num: 4, label: "Intellectual Property" },
  { id: "s5", num: 5, label: "Permitted & Prohibited Use" },
  { id: "s6", num: 6, label: "User-Generated Content" },
  { id: "s7", num: 7, label: "Author & Contributor Terms" },
  { id: "s8", num: 8, label: "Medical Reviewer Terms" },
  { id: "s9", num: 9, label: "Newsletter & Email" },
  { id: "s10", num: 10, label: "Third-Party Links" },
  { id: "s11", num: 11, label: "Advertising & Sponsored" },
  { id: "s12", num: 12, label: "Limitation of Liability" },
  { id: "s13", num: 13, label: "Indemnification" },
  { id: "s14", num: 14, label: "Termination & Suspension" },
  { id: "s15", num: 15, label: "Governing Law" },
  { id: "s16", num: 16, label: "Accessibility" },
  { id: "s17", num: 17, label: "Changes to Terms" },
  { id: "s18", num: 18, label: "Contact Information" },
];

const FOOTER_LINKS = DEFAULT_LINKS.filter((link) => link.href !== "/terms-conditions");

export function TermsConditionsPageClient() {
  const { activeSection, scrollToSection, scrollToTop } = usePolicyPageScroll(SECTION_IDS);
  const [versionOpen, setVersionOpen] = useState(true);

  const handlePrint = () => window.print();

  return (
    <div className="terms-conditions-page">

      <div className="page-hero">
        <div className="hero-inner">
          <h1>⚖️ Terms & Conditions</h1>
          <p>
            &quot;Please read these terms carefully before using our platform. By accessing our content, you agree to
            be bound by these terms.&quot;
          </p>
          <div className="hero-meta">
            <span>📅 Effective: January 1, 2025</span>
            <span>🔄 Last Updated: June 1, 2026</span>
            <span>📋 Version 2.1</span>
          </div>
          <div className="hero-badge-wrap">
            <div className="hero-badge">⚖️ Governed by the Laws of New York, USA</div>
          </div>
          <div className="hero-actions">
            <button type="button" className="hero-btn primary" onClick={handlePrint}>
              🖨️ Print Terms
            </button>
            <button type="button" className="hero-btn">
              ⬇️ Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="plain-wrap">
        <div className="plain-box">
          <h3>⚖️ Quick Summary — What These Terms Mean For You</h3>
          <ul className="plain-list">
            <li>
              <span>⚕️</span>This is a medical information platform — not a substitute for professional medical advice
            </li>
            <li>
              <span>©️</span>All content is protected by copyright — do not copy or republish without written permission
            </li>
            <li>
              <span>🔞</span>You must be 18+ to create an account or submit content
            </li>
            <li>
              <span>🚫</span>We reserve the right to suspend accounts that violate these terms
            </li>
            <li>
              <span>⚖️</span>We are not liable for decisions made based on our content
            </li>
            <li>
              <span>🔄</span>These terms may be updated — continued use means acceptance of new terms
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

        <div id="content-area">
          <div className="section blue-sec" id="s1">
            <div className="sec-title">
              <div className="sec-num">1</div>
              Acceptance of Terms
            </div>
            <div className="prose">
              <p>
                By accessing or using DrInsight (the &quot;Platform&quot;), you agree to be legally bound by these
                Terms & Conditions (&quot;Terms&quot;), our Privacy Policy, and our Disclaimer. If you do not agree, you
                must immediately stop using the platform. These Terms constitute a legally binding agreement between you
                (&quot;User&quot;) and DrInsight (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;).
              </p>
            </div>
            <div className="callout c-blue">
              <div className="ch">📋 Acceptance Methods Include</div>
              <ul>
                <li>Visiting or browsing any page of the platform</li>
                <li>Creating a user account</li>
                <li>Submitting a comment, form, or content</li>
                <li>Subscribing to our newsletter</li>
              </ul>
            </div>
            <div className="callout c-amber">
              <div className="ch">⚕️ Special Notice for Healthcare Professionals</div>
              <p>
                If you are a licensed medical professional accessing this platform for clinical reference, you
                acknowledge that this content does not replace clinical judgment, institutional guidelines, or
                peer-reviewed primary sources.
              </p>
            </div>
          </div>

          <div className="section blue-sec" id="s2">
            <div className="sec-title">
              <div className="sec-num">2</div>
              Eligibility & User Accounts
            </div>
            <div className="callout c-blue">
              <div className="ch">🔞 Age Requirements</div>
              <ul>
                <li>
                  You must be at least <strong>18 years of age</strong> to use this platform
                </li>
                <li>Users between 13–17 may access general content only with verified parental consent</li>
                <li>We reserve the right to terminate accounts found to belong to minors</li>
              </ul>
            </div>
            <div className="prose">
              <p>
                <strong>Account Registration:</strong> You agree to provide accurate, current, and complete information
                during registration. You are responsible for maintaining the confidentiality of your password. Notify us
                immediately of any unauthorized access at{" "}
                <a href="mailto:drinsightofficial@gmail.com">drinsightofficial@gmail.com</a>. One person may not maintain
                multiple accounts. Accounts are non-transferable.
              </p>
            </div>
            <div className="callout c-gray">
              <div className="ch">📋 Account Responsibilities</div>
              <ul>
                <li>You are fully responsible for all activity that occurs under your account</li>
                <li>We reserve the right to refuse registration or cancel accounts at our sole discretion</li>
                <li>Inactive accounts (no login for 24 months) may be deactivated with prior email notice</li>
              </ul>
            </div>
          </div>

          <div className="section amber-sec" id="s3">
            <div className="sec-title">
              <div className="sec-num amber">3</div>
              Nature of Medical Content
            </div>
            <div className="callout c-amber">
              <div className="ch">⚕️ Critical Medical Content Notice</div>
              <ul>
                <li>✅ Content is written and reviewed by qualified medical professionals</li>
                <li>✅ Content is based on current medical literature and guidelines</li>
                <li>✅ Content is regularly updated to reflect evolving medical knowledge</li>
                <li>❌ Does NOT constitute a doctor-patient relationship</li>
                <li>❌ Does NOT replace professional medical diagnosis or treatment</li>
                <li>❌ Should NOT be used for self-diagnosis or self-medication</li>
                <li>❌ Does NOT constitute emergency medical advice</li>
              </ul>
            </div>
            <div className="callout c-red">
              <div className="ch">🚨 Emergency Notice</div>
              <p>
                If you are experiencing a medical emergency, immediately call your local emergency services (115 / 911
                / 999 / 112) or go to the nearest emergency room.{" "}
                <strong>Do not rely on this platform in an emergency situation.</strong>
              </p>
            </div>
            <div className="prose">
              <p>
                Medical guidelines and treatment protocols vary by country and region, institutional policies, individual
                patient circumstances, and date of publication vs. current standards.
              </p>
            </div>
          </div>

          <div className="section blue-sec" id="s4">
            <div className="sec-title">
              <div className="sec-num">4</div>
              Intellectual Property Rights
            </div>
            <div className="prose">
              <p>
                All content on this platform — including articles, blog posts, medical illustrations, infographics,
                videos, logos, graphics, UI design, and code — is the exclusive intellectual property of DrInsight
                Inc. or its licensed contributors. Protected under copyright law, trademark law, database rights, and
                moral rights of authors.
              </p>
            </div>
            <div className="ip-grid">
              <div className="ip-card ip-can">
                <h4>✅ What You MAY Do</h4>
                <ul>
                  <li>Read and share article links on social media</li>
                  <li>Print single copies for personal, non-commercial use</li>
                  <li>Quote brief excerpts (under 50 words) with full attribution and link back</li>
                  <li>Use content for personal educational reference</li>
                </ul>
              </div>
              <div className="ip-card ip-cannot">
                <h4>❌ What You May NOT Do</h4>
                <ul>
                  <li>Reproduce or republish full articles without written permission</li>
                  <li>Scrape, crawl, or harvest content using automated tools</li>
                  <li>Remove or alter copyright notices or author attributions</li>
                  <li>Use our content for commercial purposes without a licensing agreement</li>
                  <li>Create derivative works without prior written consent</li>
                  <li>Claim authorship of any content on this platform</li>
                </ul>
              </div>
            </div>
            <div className="callout c-gray">
              <div className="ch">📋 Licensing & DMCA</div>
              <ul>
                <li>
                  Reprint or syndication requests:{" "}
                  <a href="mailto:drinsightofficial@gmail.com">drinsightofficial@gmail.com</a>
                </li>
                <li>
                  To report copyright infringement: <a href="mailto:drinsightofficial@gmail.com">drinsightofficial@gmail.com</a>
                </li>
                <li>
                  Include: your contact info, description of the work, URL of infringing content, and statement of good
                  faith belief
                </li>
              </ul>
            </div>
          </div>

          <div className="section red-sec" id="s5">
            <div className="sec-title">
              <div className="sec-num red">5</div>
              Permitted & Prohibited Use
            </div>
            <div className="do-dont">
              <div className="do-card do">
                <h4>✅ Permitted Use</h4>
                <ul>
                  <li>Accessing and reading published content</li>
                  <li>Sharing articles via social media links</li>
                  <li>Subscribing to newsletters</li>
                  <li>Submitting comments in good faith</li>
                  <li>Contacting us through official forms</li>
                  <li>Applying to become an author or medical reviewer</li>
                </ul>
              </div>
              <div className="do-card dont">
                <h4>❌ Prohibited Use</h4>
                <ul>
                  <li>Using the platform for any unlawful purpose</li>
                  <li>Posting false or dangerous medical information in comments</li>
                  <li>Impersonating a medical professional or our staff</li>
                  <li>Uploading malware, viruses, or malicious code</li>
                  <li>Attempting unauthorized access to our systems</li>
                  <li>Using bots, scrapers, or data-mining tools</li>
                  <li>Spam, phishing, or unsolicited commercial messaging</li>
                  <li>Posting defamatory, harassing, or discriminatory content</li>
                </ul>
              </div>
            </div>
            <div className="callout c-red">
              <div className="ch">⚠️ Violations</div>
              <p>
                Violations may result in <strong>immediate account suspension, permanent ban, or legal action</strong>,
                or all three. We take the posting of dangerous medical misinformation with particular seriousness.
              </p>
            </div>
          </div>

          <div className="section blue-sec" id="s6">
            <div className="sec-title">
              <div className="sec-num">6</div>
              User-Generated Content
            </div>
            <div className="prose">
              <p>
                By submitting any content to the platform, you grant DrInsight a worldwide, royalty-free,
                non-exclusive, perpetual license to use, display, reproduce, and distribute that content. You retain
                ownership of your original content.
              </p>
            </div>
            <div className="callout c-blue">
              <div className="ch">📋 You Confirm Your Content</div>
              <ul>
                <li>Does not violate any third-party intellectual property rights</li>
                <li>Does not contain personal medical information about identifiable individuals</li>
                <li>Does not contain false or misleading medical claims</li>
                <li>Is not spam, promotional, or commercially motivated without disclosure</li>
              </ul>
            </div>
            <div className="callout c-red">
              <div className="ch">🚫 No Medical Advice in Comments</div>
              <p>
                Users may not provide medical advice to other users in comments. Any comment that appears to constitute
                medical advice will be removed and replaced with a notice directing the reader to consult a qualified
                healthcare professional.
              </p>
            </div>
          </div>

          <div className="section green-sec" id="s7">
            <div className="sec-title">
              <div className="sec-num green">7</div>
              Author & Contributor Terms
            </div>
            <div className="callout c-green">
              <div className="ch">✍️ Key Author Agreement Terms</div>
              <ul>
                <li>Content must be original and not published elsewhere without disclosure</li>
                <li>Authors must disclose any conflicts of interest before and during engagement</li>
                <li>Authors grant the platform a license to publish, edit, and promote their content</li>
                <li>Authors remain responsible for the medical accuracy of their submissions</li>
                <li>
                  Authors may NOT use AI-generated content without explicit editorial approval and clear disclosure
                </li>
                <li>Platform reserves the right to unpublish content that becomes outdated or inaccurate</li>
                <li>Authors must maintain active medical licensure throughout their engagement</li>
                <li>Authors must notify the platform immediately if their licensure status changes</li>
              </ul>
            </div>
            <div className="prose">
              <p>
                Authors must agree to a separate Author Agreement before publishing. Compensation terms (if applicable)
                are outlined separately in the Author Agreement.
              </p>
            </div>
          </div>

          <div className="section green-sec" id="s8">
            <div className="sec-title">
              <div className="sec-num green">8</div>
              Medical Reviewer Terms
            </div>
            <div className="callout c-green">
              <div className="ch">🔬 Reviewers Confirm They</div>
              <ul>
                <li>Hold valid, current licensure in their stated specialty</li>
                <li>Have no undisclosed conflicts of interest with reviewed content</li>
                <li>Will review content based on current clinical evidence and guidelines</li>
                <li>Will flag outdated or inaccurate content for revision or retraction</li>
              </ul>
            </div>
            <div className="prose">
              <p>
                Reviewer credit does not constitute endorsement of the entire platform. The platform reserves the right
                to remove reviewer attribution from content that has been substantially altered after review. Medical
                Reviewers must agree to a separate Reviewer Agreement before engaging.
              </p>
            </div>
          </div>

          <div className="section blue-sec" id="s9">
            <div className="sec-title">
              <div className="sec-num">9</div>
              Newsletter & Email Communications
            </div>
            <div className="callout c-blue">
              <div className="ch">📬 Email Communications Policy</div>
              <ul>
                <li>By subscribing, you consent to receive our newsletter and health content emails</li>
                <li>Every email includes a clear and functional unsubscribe link</li>
                <li>
                  Unsubscribe requests are processed within <strong>10 business days</strong>
                </li>
                <li>We do not send promotional emails on behalf of third parties without explicit disclosure</li>
                <li>
                  Transactional emails (account-related) may still be sent after unsubscribing from marketing emails
                </li>
              </ul>
            </div>
          </div>

          <div className="section blue-sec" id="s10">
            <div className="sec-title">
              <div className="sec-num">10</div>
              Third-Party Links & Services
            </div>
            <div className="prose">
              <p>
                Our platform may contain links to external websites, medical journals, government health portals, and
                third-party tools. We provide these links for convenience and reference only.
              </p>
            </div>
            <div className="callout c-gray">
              <div className="ch">📋 We Do Not</div>
              <ul>
                <li>Endorse, control, or take responsibility for the content of linked third-party sites</li>
                <li>Guarantee the accuracy of third-party medical information</li>
                <li>Accept responsibility for external site privacy practices</li>
              </ul>
            </div>
            <div className="prose">
              <p>
                Visiting third-party links is entirely at your own risk. We recommend reviewing the privacy policy of
                any external site you visit.
              </p>
            </div>
          </div>

          <div className="section amber-sec" id="s11">
            <div className="sec-title">
              <div className="sec-num amber">11</div>
              Advertising & Sponsored Content
            </div>
            <div className="callout c-amber">
              <div className="ch">📣 Advertising Transparency</div>
              <ul>
                <li>This platform may display third-party advertisements via Google AdSense or similar networks</li>
                <li>
                  All sponsored articles are clearly labelled:{" "}
                  <strong>Sponsored | Paid Partnership | Advertisement</strong>
                </li>
                <li>Sponsored content is subject to the same editorial accuracy standards as organic content</li>
                <li>
                  Advertisers have <strong>no editorial influence</strong> over non-sponsored content
                </li>
                <li>We do not endorse advertised products or services</li>
                <li>
                  For advertising inquiries:{" "}
                  <a href="mailto:drinsightofficial@gmail.com">drinsightofficial@gmail.com</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="section red-sec" id="s12">
            <div className="sec-title">
              <div className="sec-num red">12</div>
              Disclaimers & Limitation of Liability
            </div>
            <div className="callout c-gray">
              <div className="ch">📋 Content Disclaimer</div>
              <p>
                Content is provided &quot;as is&quot; without warranties of any kind. We make no warranty that content
                is complete, accurate, or up to date at all times; applicable to your specific medical situation; or
                free from errors or omissions.
              </p>
            </div>
            <div className="callout c-red">
              <div className="ch">⚖️ Limitation of Liability</div>
              <p>To the maximum extent permitted by law, DrInsight shall not be liable for:</p>
            </div>
            <div className="liab-list">
              <div className="liab-item">
                <span>⚠️</span>
                <p>Any medical decisions made based on platform content</p>
              </div>
              <div className="liab-item">
                <span>💸</span>
                <p>Any direct, indirect, incidental, or consequential damages</p>
              </div>
              <div className="liab-item">
                <span>📉</span>
                <p>Loss of data, revenue, or business opportunity</p>
              </div>
              <div className="liab-item">
                <span>🚨</span>
                <p>Harm resulting from reliance on platform content</p>
              </div>
              <div className="liab-item">
                <span>💻</span>
                <p>Interruption of service or technical errors</p>
              </div>
            </div>
            <div className="prose">
              <p>
                <strong>Maximum Liability Cap:</strong> Maximum liability of DrInsight to any user shall not
                exceed the amount paid by that user to the platform in the preceding 12 months, or $100, whichever is
                greater.
              </p>
            </div>
          </div>

          <div className="section red-sec" id="s13">
            <div className="sec-title">
              <div className="sec-num red">13</div>
              Indemnification
            </div>
            <div className="callout c-red">
              <div className="ch">⚖️ User Indemnification Obligation</div>
              <p>
                You agree to indemnify, defend, and hold harmless DrInsight, its officers, directors, employees,
                authors, reviewers, and agents from any claims, damages, losses, or expenses (including legal fees)
                arising from:
              </p>
              <ul>
                <li>Your use or misuse of the platform</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Any content you submit to the platform</li>
                <li>Any medical decisions you make based on platform content</li>
              </ul>
            </div>
          </div>

          <div className="section red-sec" id="s14">
            <div className="sec-title">
              <div className="sec-num red">14</div>
              Termination & Suspension
            </div>
            <div className="callout c-red">
              <div className="ch">🚫 We May Terminate or Suspend Access If You</div>
              <ul>
                <li>Violate any provision of these Terms</li>
                <li>Provide false registration information</li>
                <li>Engage in abusive, fraudulent, or harmful behaviour</li>
                <li>Post medically dangerous or misleading information</li>
              </ul>
            </div>
            <div className="callout c-gray">
              <div className="ch">📋 Effects of Termination</div>
              <ul>
                <li>Your right to access the platform ceases immediately</li>
                <li>Your account data may be retained as required by law</li>
                <li>Content you authored may remain published per the Author Agreement</li>
                <li>
                  You may appeal termination by emailing:{" "}
                  <a href="mailto:drinsightofficial@gmail.com">drinsightofficial@gmail.com</a>
                </li>
              </ul>
            </div>
            <div className="prose">
              <p>
                You may terminate your account at any time by using the account deletion option in Settings or emailing{" "}
                <a href="mailto:drinsightofficial@gmail.com">drinsightofficial@gmail.com</a>.
              </p>
            </div>
          </div>

          <div className="section purple-sec" id="s15">
            <div className="sec-title">
              <div className="sec-num purple">15</div>
              Governing Law & Dispute Resolution
            </div>
            <div className="callout c-purple">
              <div className="ch">⚖️ Legal Framework</div>
              <ul>
                <li>
                  These Terms are governed by the laws of <strong>New York, USA</strong>
                </li>
                <li>Any disputes shall first be attempted to be resolved through good-faith negotiation</li>
                <li>If unresolved within 30 days, disputes shall be submitted to binding arbitration</li>
                <li>
                  <strong>Class action waiver:</strong> You waive any right to participate in class-action lawsuits
                  against DrInsight
                </li>
                <li>Courts of New York, USA shall have exclusive jurisdiction for matters not subject to arbitration</li>
                <li>
                  Exception: Either party may seek injunctive relief in any court for intellectual property violations
                </li>
              </ul>
            </div>
          </div>

          <div className="section green-sec" id="s16">
            <div className="sec-title">
              <div className="sec-num green">16</div>
              Accessibility Commitment
            </div>
            <div className="callout c-green">
              <div className="ch">♿ WCAG 2.1 Level AA Commitment</div>
              <ul>
                <li>We aim to comply with WCAG 2.1 Level AA accessibility standards</li>
                <li>Screen reader compatibility throughout the platform</li>
                <li>Full keyboard navigation support</li>
                <li>Font size adjustment controls (A− / A / A+)</li>
                <li>High contrast mode toggle</li>
                <li>Alt text on all images and medical illustrations</li>
                <li>
                  To report an accessibility issue:{" "}
                  <a href="mailto:drinsightofficial@gmail.com">drinsightofficial@gmail.com</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="section blue-sec" id="s17">
            <div className="sec-title">
              <div className="sec-num">17</div>
              Changes to Terms
            </div>
            <div className="prose">
              <p>
                We reserve the right to modify these Terms at any time. Continued use after changes constitutes
                acceptance of updated Terms. If you do not agree to updated Terms, you must stop using the platform and
                may delete your account.
              </p>
            </div>
            <div className="callout c-blue">
              <div className="ch">📬 How We Notify You</div>
              <ul>
                <li>
                  Email to registered users at least <strong>14 days before</strong> major changes take effect
                </li>
                <li>Prominent banner on homepage</li>
                <li>Updated version number and date at top of this page</li>
              </ul>
            </div>
            <div className={`accord${versionOpen ? " open" : ""}`}>
              <button
                type="button"
                className="accord-head"
                onClick={() => setVersionOpen((open) => !open)}
                aria-expanded={versionOpen}
              >
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
                      <td>Added author AI content policy, updated liability cap, updated emergency numbers</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="version-tag">v2.0</span>
                      </td>
                      <td>
                        <strong>January 2025</strong>
                      </td>
                      <td>
                        Full rewrite — added arbitration clause, WCAG commitment, class action waiver
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="version-tag">v1.0</span>
                      </td>
                      <td>
                        <strong>March 2023</strong>
                      </td>
                      <td>Initial Terms & Conditions published</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="section blue-sec" id="s18">
            <div className="sec-title">
              <div className="sec-num">18</div>
              Contact Information
            </div>
            <div className="contact-grid">
              <div className="contact-card">
                <h4>⚖️ Legal & Terms Inquiries</h4>
                <a href="mailto:drinsightofficial@gmail.com">drinsightofficial@gmail.com</a>
                <p>All legal and terms-related enquiries</p>
              </div>
              <div className="contact-card">
                <h4>©️ Copyright / DMCA</h4>
                <a href="mailto:drinsightofficial@gmail.com">drinsightofficial@gmail.com</a>
                <p>Copyright infringement reports</p>
              </div>
              <div className="contact-card">
                <h4>👤 Account Issues</h4>
                <a href="mailto:drinsightofficial@gmail.com">drinsightofficial@gmail.com</a>
                <p>Account deletion, suspension appeals</p>
              </div>
              <div className="contact-card">
                <h4>📣 Advertising</h4>
                <a href="mailto:drinsightofficial@gmail.com">drinsightofficial@gmail.com</a>
                <p>Partnership and advertising inquiries</p>
              </div>
              <div className="contact-card">
                <h4>✉️ General Contact</h4>
                <a href="mailto:drinsightofficial@gmail.com">drinsightofficial@gmail.com</a>
                <p>All other enquiries</p>
              </div>
              <div className="contact-card">
                <h4>📍 Mailing Address</h4>
                <p>
                  DrInsight
                  <br />
                  123 Medical Plaza, Suite 400
                  <br />
                  New York, NY 10001, USA
                </p>
              </div>
            </div>
            <div className="callout c-blue" style={{ marginTop: 12 }}>
              <div className="ch">⏱️ Response Time Commitment</div>
              <p>
                We aim to respond to all legal and terms-related enquiries within{" "}
                <strong>7–10 business days</strong>. Urgent matters involving safety or copyright infringement are
                prioritised.
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
          <div className="pf-btns">
            <span className="pf-meta">Last updated: June 1, 2026 · v2.1</span>
            <button type="button" className="pf-btn gray" onClick={scrollToTop}>
              ↑ Back to Top
            </button>
            <button type="button" className="pf-btn" onClick={handlePrint}>
              🖨️ Print
            </button>
            <button type="button" className="pf-btn green">
              ⬇️ Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
