"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import "@/styles/author-guidelines-page.css";

const TOC = [
  { id: "s1", num: "1", label: "Why Write for Us" },
  { id: "s2", num: "2", label: "Who Can Contribute" },
  { id: "s3", num: "3", label: "Qualification Standards" },
  { id: "s4", num: "4", label: "Types of Content" },
  { id: "s5", num: "5", label: "Before You Write" },
  { id: "s6", num: "6", label: "Article Structure" },
  { id: "s7", num: "7", label: "Writing Style Guide" },
  { id: "s8", num: "8", label: "Evidence & Sources" },
  { id: "s9", num: "9", label: "Submission Process" },
  { id: "s10", num: "10", label: "Apply to Write" },
  { id: "s11", num: "11", label: "Author Rights & Payments" },
  { id: "s12", num: "12", label: "Conflict of Interest" },
  { id: "s13", num: "13", label: "Editorial Standards" },
  { id: "s14", num: "14", label: "Contact & Support" },
];

const WHY_CARDS = [
  { icon: "📢", title: "Massive Reach", text: "Your articles reach 500K+ monthly readers across 50+ countries worldwide." },
  { icon: "🎓", title: "CPD/CME Credit", text: "Receive a CPD/CME recognition letter for each published article on request." },
  { icon: "🏅", title: "Author Profile", text: "A full, verified author bio page showcasing your credentials and publications." },
  { icon: "💰", title: "Paid Opportunities", text: "Honorarium paid per published article for qualified medical authors." },
  { icon: "🌍", title: "Fight Misinformation", text: "Help counter harmful medical misinformation with clinically accurate content." },
  { icon: "🔗", title: "Portfolio Building", text: "Published articles are DOI-linked and citable for academic and professional portfolios." },
  { icon: "🤝", title: "Editorial Support", text: "Dedicated editorial team assists you throughout the writing and review process." },
  { icon: "📊", title: "Analytics Access", text: "See how many readers your articles reach, their engagement, and ratings." },
];

const CONTENT_TYPES = [
  { icon: "📄", title: "Clinical Overview Articles", text: "Comprehensive patient-facing guides covering conditions, symptoms, diagnosis, treatment, and prevention.", bg: "linear-gradient(135deg,#eff6ff,#fff)", border: "#bfdbfe", tags: ["Patients", "1,200+ words", "Peer reviewed"] },
  { icon: "🩺", title: "Professional Reference Articles", text: "Technical clinical content for healthcare professionals — pathophysiology, management protocols, clinical pearls.", bg: "linear-gradient(135deg,#f0fdf4,#fff)", border: "#a7f3d0", tags: ["HCPs", "1,500+ words", "Specialist review"] },
  { icon: "💊", title: "Drug & Medication Guides", text: "Educational drug information — indications, dosing ranges, side effects, interactions, and patient counselling.", bg: "linear-gradient(135deg,#fffbeb,#fff)", border: "#fde68a", tags: ["General/HCPs", "Pharmacologist review"] },
  { icon: "🔬", title: "Research Explainers", text: "Accessible summaries of new clinical trials, systematic reviews, and significant research findings.", bg: "linear-gradient(135deg,#f3f0ff,#fff)", border: "#c4b5fd", tags: ["General/HCPs", 'Labelled "Emerging Evidence"'] },
  { icon: "📋", title: "Symptom Guides", text: "Patient-facing content helping readers understand symptoms, possible causes, red flags, and when to seek care.", bg: "linear-gradient(135deg,#f0fdf4,#fff)", border: "#a7f3d0", tags: ["Patients", "No specific diagnoses"] },
  { icon: "✅", title: "Health & Wellness Articles", text: "Evidence-based general wellness content — nutrition, exercise, sleep, mental wellbeing, and prevention.", bg: "linear-gradient(135deg,#eff6ff,#fff)", border: "#bfdbfe", tags: ["General public", "Allied health OK"] },
];

const CHECKLIST = [
  { strong: "Topic approval:", text: <>Confirm your topic with our Editorial team before writing — many topics are already covered or assigned. Email: <span style={{ color: "var(--blue)", fontWeight: 600 }}>authors@medauthority.com</span></> },
  { strong: "Scope check:", text: "Confirm the article falls within your recognised specialty or professional scope" },
  { strong: "Source gathering:", text: "Identify minimum 5 peer-reviewed sources from the last 10 years (preferably last 5 years) before writing" },
  { strong: "COI self-check:", text: "Identify any financial, professional, or personal conflicts of interest related to the topic" },
  { strong: "Target audience:", text: "Confirm whether the article is for patients, healthcare professionals, or both — this determines tone and structure" },
  { strong: "Safe messaging:", text: "If your article covers mental health, suicide, eating disorders, or substance use — review our Safe Messaging Guidelines first" },
  { strong: "Original content:", text: "Confirm this article has not been published elsewhere and is entirely original work. We do not accept simultaneously submitted or republished content" },
  { strong: "AI disclosure:", text: "If you used AI writing tools, you must disclose this at submission. AI-generated content may not be submitted without explicit editorial approval and full disclosure" },
];

const SUBMISSION_STEPS = [
  { num: "1", title: "✉️ Topic Proposal", badge: "First step", badgeClass: "sb-blue", text: <>Email your proposed topic to <strong style={{ color: "var(--blue)" }}>authors@medauthority.com</strong> with a 2–3 sentence outline. Receive approval or feedback within 3–5 business days before writing.</> },
  { num: "2", title: "📋 Author Brief Received", text: "Receive your detailed author brief — including target audience, required word count, source requirements, safe messaging guidance if applicable, COI disclosure form, and submission deadline." },
  { num: "3", title: "✍️ Write Your Article", badge: "You are here", badgeClass: "sb-blue", text: "Write using the required structure for your article type. Submit as a Google Doc or Word document (.docx). Include all inline citations. Complete and attach the COI disclosure form." },
  { num: "4", title: "🖊️ Editorial Pre-Screen", text: "Our editorial team reviews your submission within 3–5 business days for structure, completeness, source quality, and style guide compliance. Returned with feedback if pre-screen fails." },
  { num: "5", title: "🔬 Medical Peer Review", badge: "Quality gate", badgeClass: "sb-green", text: "An independent specialist reviewer evaluates clinical accuracy, completeness, safety, and balance. Standard review time: 7 business days. You will receive revision requests or approval notification." },
  { num: "6", title: "✅ Revisions (If Required)", text: "You have 5 business days to address reviewer comments and resubmit. Maximum 2 revision cycles. If revisions are not completed within deadline, article is returned to queue." },
  { num: "7", title: "📌 Final Sign-Off & Publication", badge: "✓ Published", badgeClass: "sb-green", text: "Senior Editor gives final approval. Your article is published with your full author byline, credentials, reviewer credit, publication date, and all citations. You receive a publication confirmation email." },
  { num: "8", title: "📊 Post-Publication", amber: true, text: "Access your article analytics dashboard. Receive reader feedback notifications. Be notified when your article is due for scheduled re-review. Earn your CPD/CME recognition letter on request." },
];

const COI_ITEMS = [
  { icon: "💰", title: "Financial relationships", text: "with pharmaceutical, device, or biotech companies relevant to article content" },
  { icon: "📊", title: "Research funding", text: "received from commercial entities related to article topic" },
  { icon: "🎤", title: "Speaker fees or honoraria", text: "received from organisations relevant to article content" },
  { icon: "🏢", title: "Employment or consultancy roles", text: "with companies relevant to article content" },
  { icon: "📦", title: "Stock or equity ownership", text: "in relevant healthcare or pharmaceutical companies" },
  { icon: "🤝", title: "Personal relationships", text: "that could create a perception of bias" },
];

const CONTACTS = [
  { title: "✍️ New Author Applications", email: "authors@medauthority.com", note: "Apply to join our author network. Response within 3–5 business days." },
  { title: "📋 Topic Proposals & Briefs", email: "editorial@medauthority.com", note: "Submit topic ideas or request a writing brief. Response within 3–5 business days." },
  { title: "📤 Article Submissions", email: "submissions@medauthority.com", note: "Submit completed articles for editorial pre-screen and peer review." },
  { title: "💰 Payments & Contracts", email: "payments@medauthority.com", note: "Queries about honoraria, author agreements, and CPD/CME letters." },
  { title: "📝 Corrections & Updates", email: "corrections@medauthority.com", note: "Request corrections or updates to your published articles." },
];

function Accordion({ id, title, open, onToggle, children }: { id: string; title: string; open: boolean; onToggle: (id: string) => void; children: React.ReactNode }) {
  return (
    <div className={`accordion${open ? " open" : ""}`}>
      <button type="button" className="acc-header" onClick={() => onToggle(id)} aria-expanded={open}>
        <h4>{title}</h4>
        <div className="acc-chevron">▾</div>
      </button>
      <div className="acc-body">{children}</div>
    </div>
  );
}

export function AuthorGuidelinesContent() {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("s1");
  const [toast, setToast] = useState("");
  const [accordions, setAccordions] = useState<Record<string, boolean>>({
    "s6-clinical": true,
    "s7-formatting": true,
  });

  const sectionIds = TOC.map((t) => t.id);

  useEffect(() => {
    const onScroll = () => {
      const d = document.documentElement;
      const pct = (d.scrollTop / (d.scrollHeight - d.clientHeight)) * 100;
      setProgress(Number.isFinite(pct) ? pct : 0);
      let active = "s1";
      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 120) active = id;
      });
      setActiveSection(active);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [sectionIds]);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const toggleAcc = useCallback((id: string) => {
    setAccordions((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }, []);

  return (
    <div className="author-guidelines-page">
      <div className="reading-progress">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="breadcrumb">
        <div className="breadcrumb-inner">
          <Link href="/">🏠 Home</Link>
          <span>›</span>
          <Link href="/editorial-policy">Editorial</Link>
          <span>›</span>
          <span className="current">Author Guidelines</span>
        </div>
      </div>

      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-eyebrow">✍️ CONTRIBUTE TO MEDAUTHORITY</div>
          <h1>
            Author <span>Guidelines</span>
          </h1>
          <p>
            Everything you need to know about writing for MedAuthority — from qualification standards and submission
            requirements to style guides and editorial standards.
          </p>
          <div className="hero-meta-row">
            <span>📅 Last Updated: June 1, 2026</span>
            <span>📋 Version 2.1</span>
            <span>🔒 HIPAA &amp; GDPR Compliant</span>
          </div>
          <div className="hero-actions">
            <button type="button" className="btn-white" onClick={() => scrollTo("s10")}>
              ✍️ Apply to Write
            </button>
            <button type="button" className="btn-ghost" onClick={() => window.print()}>
              🖨️ Download PDF
            </button>
          </div>
          <div className="trust-strip">
            {["🩺 Physicians & Allied Health Professionals", "🔬 Evidence-Based Standards", "✅ Peer-Reviewed Process", "📋 Full COI Disclosure Required", "💰 Paid Opportunities"].map((pill) => (
              <div key={pill} className="trust-pill">{pill}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="main-layout">
        <aside className="toc-sidebar">
          <div className="toc-header">📑 Table of Contents</div>
          <nav className="toc-nav">
            {TOC.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`toc-item${activeSection === item.id ? " active" : ""}`}
                onClick={() => scrollTo(item.id)}
              >
                <div className="toc-num">{item.num}</div>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="toc-apply-box">
            <button type="button" className="toc-apply-btn" onClick={() => scrollTo("s10")}>
              ✍️ Apply to Become an Author
            </button>
          </div>
        </aside>

        <main className="content-area">
          <section className="content-section" id="s1">
            <div className="section-title">
              <div className="section-num">1</div>Why Write for MedAuthority
            </div>
            <div className="prose">
              <p>
                MedAuthority reaches <strong>over 500,000 patients, caregivers, and healthcare professionals</strong> every
                month. By contributing to our platform, you help us fulfil our mission of making accurate, evidence-based
                medical information accessible to everyone — regardless of geography, income, or background.
              </p>
            </div>
            <div className="card-grid-4">
              {WHY_CARDS.map((card) => (
                <div key={card.title} className="info-card">
                  <div className="card-icon">{card.icon}</div>
                  <h4>{card.title}</h4>
                  <p>{card.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="content-section" id="s2">
            <div className="section-title">
              <div className="section-num green">2</div>Who Can Contribute
            </div>
            <div className="prose">
              <p>
                MedAuthority welcomes contributions from qualified healthcare professionals and health science experts. We
                have three contributor categories, each with specific eligibility requirements.
              </p>
            </div>
            <div className="card-grid-3">
              <div className="info-card" style={{ borderTop: "4px solid var(--blue)" }}>
                <div className="card-icon">👨‍⚕️</div>
                <h4>Medical Doctors</h4>
                <p>Licensed physicians (MBBS, MD, DO, MBChB) actively practising in any clinical specialty. Can write clinical overview, symptom guide, drug guide, and professional reference articles.</p>
                <div style={{ marginTop: 10 }}>
                  <span className="badge badge-req">Required</span>{" "}
                  <span style={{ fontSize: ".78rem", color: "var(--gray-600)", marginLeft: 4 }}>Active medical licence</span>
                </div>
              </div>
              <div className="info-card" style={{ borderTop: "4px solid var(--green)" }}>
                <div className="card-icon">💊</div>
                <h4>Allied Health Professionals</h4>
                <p>Registered nurses, pharmacists, physiotherapists, dietitians, psychologists, and other licensed health professionals. Can write wellness, nutrition, rehabilitation, and mental health content.</p>
                <div style={{ marginTop: 10 }}>
                  <span className="badge badge-req">Required</span>{" "}
                  <span style={{ fontSize: ".78rem", color: "var(--gray-600)", marginLeft: 4 }}>Professional registration</span>
                </div>
              </div>
              <div className="info-card" style={{ borderTop: "4px solid var(--teal)" }}>
                <div className="card-icon">🔬</div>
                <h4>Medical Academics</h4>
                <p>Researchers, professors, and academics with active clinical or research involvement in health sciences. Can write research explainers, evidence reviews, and educational content.</p>
                <div style={{ marginTop: 10 }}>
                  <span className="badge badge-req">Required</span>{" "}
                  <span style={{ fontSize: ".78rem", color: "var(--gray-600)", marginLeft: 4 }}>Active institutional affiliation</span>
                </div>
              </div>
            </div>
            <div className="callout callout-red">
              <div className="callout-head">🚫 Who Cannot Contribute</div>
              <ul>
                <li>Individuals without a recognised medical or health science qualification</li>
                <li>Pharmaceutical, device, or supplement company employees writing about their own products</li>
                <li>Authors with undisclosed conflicts of interest related to article content</li>
                <li>Anyone writing outside their recognised specialty or professional scope</li>
              </ul>
            </div>
          </section>

          <section className="content-section" id="s3">
            <div className="section-title">
              <div className="section-num amber">3</div>Qualification Standards
            </div>
            <div className="prose">
              <p>
                All authors must meet specific qualification requirements before their first article is published. Your
                credentials are verified by our Editorial team and displayed on your author bio page.
              </p>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="qual-table">
                <thead>
                  <tr>
                    <th>Requirement</th>
                    <th>Medical Doctors</th>
                    <th>Allied Health</th>
                    <th>Academics</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><strong>Degree</strong></td><td>MBBS / MD / DO / MBChB or equivalent</td><td>Recognised professional degree</td><td>PhD / Masters + active research</td></tr>
                  <tr><td><strong>Licence</strong></td><td>Active, unrestricted licence <span className="badge badge-req">Required</span></td><td>Active professional registration <span className="badge badge-req">Required</span></td><td>Active institutional affiliation <span className="badge badge-req">Required</span></td></tr>
                  <tr><td><strong>Experience</strong></td><td>Minimum 3 years post-graduation clinical experience</td><td>Minimum 3 years active professional practice</td><td>Minimum 3 years research / teaching</td></tr>
                  <tr><td><strong>Specialty scope</strong></td><td>Must write within recognised specialty <span className="badge badge-req">Strictly enforced</span></td><td>Must write within professional scope</td><td>Must write within research area</td></tr>
                  <tr><td><strong>Disciplinary status</strong></td><td>No current disciplinary proceedings <span className="badge badge-req">Required</span></td><td>No current disciplinary proceedings</td><td>No academic misconduct findings</td></tr>
                  <tr><td><strong>COI disclosure</strong></td><td>Mandatory — updated per article <span className="badge badge-req">Required</span></td><td>Mandatory <span className="badge badge-req">Required</span></td><td>Mandatory <span className="badge badge-req">Required</span></td></tr>
                  <tr><td><strong>Review required</strong></td><td>Independent peer review by Tier 1 specialist <span className="badge badge-rec">Yes</span></td><td>Physician sign-off required <span className="badge badge-req">Required</span></td><td>Peer review by specialist required</td></tr>
                </tbody>
              </table>
            </div>
            <div className="callout callout-blue">
              <div className="callout-head">🔍 Credential Verification Process</div>
              <ul>
                <li>All credentials verified by Editorial team before first publication</li>
                <li>Annual re-verification of licensure status for all active authors</li>
                <li>Authors must notify MedAuthority immediately if licensure is suspended or revoked</li>
                <li>Verified credentials are publicly displayed on your author bio page with a verification badge</li>
              </ul>
            </div>
          </section>

          <section className="content-section" id="s4">
            <div className="section-title">
              <div className="section-num">4</div>Types of Content We Publish
            </div>
            <div className="content-type-grid">
              {CONTENT_TYPES.map((ct) => (
                <div key={ct.title} className="ct-card" style={{ background: ct.bg, borderColor: ct.border }}>
                  <div className="ct-icon">{ct.icon}</div>
                  <h4>{ct.title}</h4>
                  <p>{ct.text}</p>
                  <div className="ct-meta">
                    {ct.tags.map((tag) => (
                      <span key={tag} className="ct-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="content-section" id="s5">
            <div className="section-title">
              <div className="section-num teal">5</div>Before You Write — Pre-Submission Checklist
            </div>
            <div className="prose">
              <p>Before beginning your article, please confirm the following to avoid rejection at submission stage.</p>
            </div>
            <div className="checklist">
              {CHECKLIST.map((item) => (
                <div key={item.strong} className="cl-item">
                  <div className="ci-icon">✅</div>
                  <div><strong>{item.strong}</strong> {item.text}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="content-section" id="s6">
            <div className="section-title">
              <div className="section-num">6</div>Required Article Structure
            </div>
            <div className="prose">
              <p>All articles must follow our standard structure. Patient-facing and professional articles have slightly different requirements.</p>
            </div>
            <Accordion id="s6-clinical" title="📄 Clinical Overview Articles — Required Sections" open={!!accordions["s6-clinical"]} onToggle={toggleAcc}>
              <ul>
                <li><strong>Key Takeaways box</strong> — 4–6 bullet points at the top (patient-friendly summary)</li>
                <li><strong>What is [Condition]?</strong> — Plain language definition (2–3 paragraphs)</li>
                <li><strong>Causes &amp; Risk Factors</strong> — Evidence-based, comprehensive</li>
                <li><strong>Signs &amp; Symptoms</strong> — Clear, patient-friendly language</li>
                <li><strong>Diagnosis</strong> — How it&apos;s diagnosed; what tests are involved</li>
                <li><strong>Treatment Options</strong> — Current evidence-based treatment approaches</li>
                <li><strong>Prevention</strong> — Where applicable, evidence-based prevention strategies</li>
                <li><strong>When to See a Doctor</strong> — Red flags and urgency guidance (required)</li>
                <li><strong>Medical Disclaimer</strong> — Standard disclaimer (auto-added by Editorial)</li>
                <li><strong>References</strong> — Minimum 5 numbered, DOI-linked references</li>
              </ul>
            </Accordion>
            <Accordion id="s6-professional" title="🩺 Professional Reference Articles — Required Sections" open={!!accordions["s6-professional"]} onToggle={toggleAcc}>
              <ul>
                <li><strong>Clinical Summary Box</strong> — ICD-10 code, key diagnostic criteria, first-line treatment</li>
                <li><strong>Epidemiology &amp; Pathophysiology</strong> — Incidence, prevalence, mechanisms</li>
                <li><strong>Diagnostic Criteria</strong> — Current classification (DSM-5, ICD-11, specialty guidelines)</li>
                <li><strong>Differential Diagnosis</strong> — Key differentials with distinguishing features</li>
                <li><strong>Investigations</strong> — Appropriate workup with evidence basis</li>
                <li><strong>Management Protocols</strong> — Step-by-step, guideline-referenced</li>
                <li><strong>Pharmacotherapy</strong> — Drug names (generic + brand), doses, monitoring</li>
                <li><strong>Special Populations</strong> — Pregnancy, paediatrics, elderly, renal/hepatic impairment</li>
                <li><strong>Clinical Pearls</strong> — 3–5 practical clinical tips</li>
                <li><strong>References</strong> — Minimum 8 peer-reviewed, DOI-linked references</li>
              </ul>
            </Accordion>
            <Accordion id="s6-drug" title="💊 Drug & Medication Guide — Required Sections" open={!!accordions["s6-drug"]} onToggle={toggleAcc}>
              <ul>
                <li><strong>Drug Overview Box</strong> — Generic name, brand names, drug class, availability</li>
                <li><strong>Indications</strong> — Approved indications; off-label uses clearly labelled</li>
                <li><strong>Mechanism of Action</strong> — Plain language explanation</li>
                <li><strong>Dosing</strong> — General reference ranges only (never prescriptive); age-specific where relevant</li>
                <li><strong>Contraindications</strong> — Absolute and relative (comprehensive)</li>
                <li><strong>Side Effects</strong> — Common, serious, and black box warnings prominently displayed</li>
                <li><strong>Drug Interactions</strong> — Clinically significant interactions</li>
                <li><strong>Monitoring Parameters</strong> — Required lab monitoring, frequency</li>
                <li><strong>Patient Counselling Points</strong> — What patients should know</li>
                <li><strong>Dosing Disclaimer</strong> — Auto-added: &quot;Dosing is for educational reference only&quot;</li>
              </ul>
            </Accordion>
          </section>

          <section className="content-section" id="s7">
            <div className="section-title">
              <div className="section-num amber">7</div>Writing Style Guide
            </div>
            <div className="callout callout-blue">
              <div className="callout-head">📖 Tone & Language Standards</div>
              <ul>
                <li><strong>Patient-facing articles:</strong> Plain language, Flesch-Kincaid Grade 8–10, compassionate, non-alarmist</li>
                <li><strong>Professional articles:</strong> Technical, precise, evidence-referenced, clinical terminology expected</li>
                <li><strong>Both:</strong> Active voice preferred, present tense for established facts, no jargon without explanation</li>
              </ul>
            </div>
            <div className="style-row">
              <div className="style-block do-style">
                <div className="style-label">✅ Write Like This</div>
                <div className="style-example">&quot;High blood pressure — also called hypertension — means the force of blood pushing against your artery walls is consistently too high. Over time, this can damage your heart and blood vessels.&quot;</div>
              </div>
              <div className="style-block dont-style">
                <div className="style-label">❌ Not Like This</div>
                <div className="style-example">&quot;Arterial hypertension is characterised by persistently elevated systolic and/or diastolic blood pressure values, which can cause deleterious sequelae to the cardiovascular system if left untreated.&quot;</div>
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <Accordion id="s7-formatting" title="📝 Formatting Rules" open={!!accordions["s7-formatting"]} onToggle={toggleAcc}>
                <ul>
                  <li><strong>Headings:</strong> H2 for main sections, H3 for subsections — no H4 or deeper in patient articles</li>
                  <li><strong>Paragraphs:</strong> Maximum 4 sentences per paragraph in patient-facing content</li>
                  <li><strong>Lists:</strong> Use bullet points for 3+ items; avoid lists with fewer than 3 items</li>
                  <li><strong>Bold text:</strong> Use sparingly — only for key terms, warnings, or critical clinical points</li>
                  <li><strong>Numbers:</strong> Spell out 1–9 in body text; use numerals for 10+, all statistics, doses, ages</li>
                  <li><strong>Drug names:</strong> Generic name first, brand name in parentheses on first mention — e.g. metformin (Glucophage)</li>
                  <li><strong>Statistics:</strong> Always cite source inline — e.g. &quot;...affecting 1 in 10 adults (WHO, 2023)&quot;</li>
                  <li><strong>Avoid:</strong> Hyperbolic language, exclamation marks, first-person (&quot;I recommend...&quot;), and directly addressing readers as &quot;you&quot; in professional articles</li>
                </ul>
              </Accordion>
              <Accordion id="s7-medical" title="⚕️ Medical Language Rules" open={!!accordions["s7-medical"]} onToggle={toggleAcc}>
                <ul>
                  <li>Always use <strong>person-first language:</strong> &quot;person with diabetes&quot; not &quot;diabetic person&quot;</li>
                  <li>Use <strong>&quot;died by suicide&quot;</strong> not &quot;committed suicide&quot; — follow all safe messaging guidelines</li>
                  <li>Avoid stigmatising terms: &quot;addict&quot; → &quot;person with substance use disorder&quot;</li>
                  <li>Never state specific diagnoses for readers: &quot;you may have X&quot; — use &quot;a doctor can determine if...&quot;</li>
                  <li>Dose ranges must always be labelled <strong>&quot;general reference only&quot;</strong> — never as prescriptions</li>
                  <li>Off-label uses must always be explicitly labelled as &quot;off-label&quot; or &quot;not approved for this use&quot;</li>
                  <li>Experimental treatments must always be labelled &quot;experimental&quot; or &quot;investigational&quot;</li>
                  <li>Emergency symptoms must always include guidance to call emergency services immediately</li>
                </ul>
              </Accordion>
              <Accordion id="s7-inclusive" title="🌍 Inclusive Language Guidelines" open={!!accordions["s7-inclusive"]} onToggle={toggleAcc}>
                <ul>
                  <li>Use gender-neutral language where clinically appropriate — &quot;the patient&quot; rather than assuming gender</li>
                  <li>Acknowledge where clinical evidence is based on specific populations and may not generalise</li>
                  <li>Note regional availability differences for medications and treatments where relevant</li>
                  <li>Avoid cultural assumptions in examples — use globally relatable contexts</li>
                  <li>Consider diverse age groups in examples — not just working-age adults</li>
                </ul>
              </Accordion>
            </div>
            <div className="card-grid-2" style={{ marginTop: 16 }}>
              <div className="do-card">
                <h4>✅ Do Include</h4>
                <ul>
                  <li>Evidence-based statements with citations</li>
                  <li>Red flag symptoms and when to seek emergency care</li>
                  <li>Limitations of current evidence where relevant</li>
                  <li>Plain language explanations of medical terms</li>
                  <li>Balanced presentation of treatment options</li>
                  <li>Specific population considerations (pregnancy, children, elderly)</li>
                </ul>
              </div>
              <div className="dont-card">
                <h4>❌ Do NOT Include</h4>
                <ul>
                  <li>Specific diagnoses for readers based on symptoms</li>
                  <li>Prescriptive dosing instructions</li>
                  <li>Unsubstantiated health claims</li>
                  <li>Promotion of specific brands or products</li>
                  <li>Anecdotal evidence without clinical support</li>
                  <li>Claims that are not supported by cited sources</li>
                  <li>Content that could delay emergency treatment</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="content-section" id="s8">
            <div className="section-title">
              <div className="section-num">8</div>Evidence & Source Standards
            </div>
            <div className="callout callout-green">
              <div className="callout-head">✅ Accepted Source Types (in order of preference)</div>
              <ul>
                <li><strong>Tier 1 (Required for clinical claims):</strong> Systematic reviews, meta-analyses, Cochrane reviews, clinical practice guidelines from WHO/CDC/NHS/AHA/ADA/ESC/NICE and equivalent bodies</li>
                <li><strong>Tier 2 (Accepted with Tier 1 support):</strong> Randomised controlled trials (RCTs), cohort studies, case-control studies, peer-reviewed observational studies</li>
                <li><strong>Tier 3 (Supporting only — not standalone):</strong> Expert consensus statements, case series, recognised specialist textbooks (within last 10 years)</li>
              </ul>
            </div>
            <div className="callout callout-red">
              <div className="callout-head">❌ NOT Accepted as Sources</div>
              <ul>
                <li>Wikipedia or any user-edited content</li>
                <li>Non-peer-reviewed health websites or blogs</li>
                <li>Pharmaceutical company promotional materials or press releases</li>
                <li>Preprint studies not yet peer-reviewed (may be noted as &quot;emerging research&quot; only)</li>
                <li>Retracted studies — always check for retraction before citing</li>
                <li>AI-generated content presented as research evidence</li>
                <li>Sources older than 10 years (unless landmark studies with explicit justification)</li>
              </ul>
            </div>
            <div className="callout callout-blue">
              <div className="callout-head">📋 Citation Requirements</div>
              <ul>
                <li><strong>Minimum sources:</strong> 5 per clinical article · 8 per professional reference article · 3 per wellness article</li>
                <li><strong>Format:</strong> Numbered inline citations [1] with full reference list at end</li>
                <li><strong>Link format:</strong> All sources must include a direct PubMed URL or DOI link — e.g. https://doi.org/10.1016/...</li>
                <li><strong>Preferred age:</strong> Within 5 years. Maximum: 10 years (landmark studies excepted)</li>
                <li><strong>Statistics:</strong> Every statistic must include source and year inline in text</li>
              </ul>
            </div>
          </section>

          <section className="content-section" id="s9">
            <div className="section-title">
              <div className="section-num purple">9</div>Submission Process
            </div>
            <div className="process-timeline">
              {SUBMISSION_STEPS.map((step) => (
                <div key={step.num} className="process-step">
                  <div
                    className="step-dot"
                    style={step.amber ? { background: "linear-gradient(135deg,var(--amber),#f59e0b)" } : undefined}
                  >
                    {step.num}
                  </div>
                  <div className="step-body">
                    <h4>
                      {step.title}
                      {step.badge && <span className={`step-badge ${step.badgeClass}`}>{step.badge}</span>}
                    </h4>
                    <p>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="callout callout-amber">
              <div className="callout-head">⚡ Submission Timelines to Know</div>
              <ul>
                <li><strong>Topic approval response:</strong> 3–5 business days</li>
                <li><strong>Editorial pre-screen:</strong> 3–5 business days from submission</li>
                <li><strong>Medical peer review:</strong> 7 business days standard · 14 days maximum</li>
                <li><strong>Revision window:</strong> 5 business days to address reviewer comments</li>
                <li><strong>Final sign-off to publication:</strong> 2–3 business days after final approval</li>
                <li><strong>Total typical timeline:</strong> 3–5 weeks from submission to publication</li>
              </ul>
            </div>
          </section>

          <section className="content-section" id="s10">
            <div className="section-title">
              <div className="section-num green">10</div>Apply to Become an Author
            </div>
            <div className="apply-cta">
              <h3>Start Writing for MedAuthority</h3>
              <p>
                Join our network of 200+ verified medical authors contributing to the most trusted medical platform in the
                region. Your expertise can help hundreds of thousands of patients make better health decisions.
              </p>
              <div className="apply-steps-row">
                {["Submit Application Online", "Verification of Credentials", "Complete Orientation Module", "Sign Author Agreement", "Submit Your First Article"].map((label, i) => (
                  <div key={label} className="apply-step">
                    <div className="as-circle">{i + 1}</div>
                    <div className="as-label">{label}</div>
                  </div>
                ))}
              </div>
              <div className="apply-btns">
                <button type="button" className="btn-apply" onClick={() => showToast("Opening application form...")}>
                  ✍️ Apply to Become an Author →
                </button>
                <a href="mailto:authors@medauthority.com" className="btn-apply-ghost">
                  📧 authors@medauthority.com
                </a>
              </div>
            </div>
          </section>

          <section className="content-section" id="s11">
            <div className="section-title">
              <div className="section-num teal">11</div>Author Rights & Payments
            </div>
            <div className="card-grid-2">
              <div className="callout callout-green">
                <div className="callout-head">✅ What Authors Receive</div>
                <ul>
                  <li><strong>Named byline</strong> on every published article with full credentials</li>
                  <li><strong>Verified author bio page</strong> with photo, credentials, and all published articles</li>
                  <li><strong>Honorarium</strong> paid per published article (rates shared on application)</li>
                  <li><strong>CPD/CME recognition letter</strong> issued on request for each published article</li>
                  <li><strong>Article analytics</strong> — views, time on page, rating, and engagement data</li>
                  <li><strong>DOI-linked publications</strong> citable for academic portfolios and CVs</li>
                  <li><strong>Editorial support</strong> throughout writing and revision process</li>
                </ul>
              </div>
              <div className="callout callout-blue">
                <div className="callout-head">📋 License & Rights</div>
                <ul>
                  <li>Authors <strong>retain ownership</strong> of their original content</li>
                  <li>By submitting, authors grant MedAuthority a <strong>worldwide, royalty-free, non-exclusive licence</strong> to publish, display, and distribute the content</li>
                  <li>MedAuthority may edit content for clarity, length, and style guide compliance</li>
                  <li>Authors will be notified of any <strong>substantial editorial changes</strong> before publication</li>
                  <li>Content may be <strong>unpublished</strong> if it becomes clinically outdated or inaccurate — authors are notified</li>
                  <li>Authors may request <strong>retraction of their content</strong> with written justification</li>
                </ul>
              </div>
            </div>
            <div className="callout callout-amber">
              <div className="callout-head">⚠️ Important: AI Content Policy</div>
              <p>
                Authors may use AI writing tools as a drafting aid only. However: all AI-generated or AI-assisted content
                must be disclosed at submission. Content must be substantially reviewed, verified, and rewritten by the
                author — not submitted as generated. Articles found to be primarily AI-generated without disclosure will be
                rejected and the author account suspended.
              </p>
            </div>
          </section>

          <section className="content-section" id="s12">
            <div className="section-title">
              <div className="section-num red">12</div>Conflict of Interest Policy
            </div>
            <div className="prose">
              <p>
                All authors must disclose any financial, professional, or personal relationships that could influence — or
                appear to influence — the content they produce. Disclosure is mandatory and published transparently on every
                article.
              </p>
            </div>
            <div className="checklist">
              {COI_ITEMS.map((item) => (
                <div key={item.icon} className="cl-item">
                  <div className="ci-icon">{item.icon}</div>
                  <div><strong>{item.title}</strong> {item.text}</div>
                </div>
              ))}
            </div>
            <div className="card-grid-3" style={{ marginTop: 16 }}>
              <div className="info-card" style={{ borderTop: "3px solid var(--green)" }}>
                <h4 style={{ color: "var(--green)" }}>Minor COI</h4>
                <p>Disclosed and published on the article. Author may proceed with writing. Disclosure visible to all readers.</p>
              </div>
              <div className="info-card" style={{ borderTop: "3px solid var(--amber)" }}>
                <h4 style={{ color: "#d97706" }}>Moderate COI</h4>
                <p>Disclosed and published. Additional independent reviewer assigned to provide extra oversight of article.</p>
              </div>
              <div className="info-card" style={{ borderTop: "3px solid var(--red)" }}>
                <h4 style={{ color: "var(--red)" }}>Significant COI</h4>
                <p>Author recused from writing this article. Reassigned to a topic without conflict. No exceptions.</p>
              </div>
            </div>
          </section>

          <section className="content-section" id="s13">
            <div className="section-title">
              <div className="section-num">13</div>Editorial Standards & Commitments
            </div>
            <div className="callout callout-blue">
              <div className="callout-head">📋 Our Commitments to Authors</div>
              <ul>
                <li>Detailed, constructive editorial feedback on every submission</li>
                <li>Transparent review process — you will always know where your article is in the pipeline</li>
                <li>Respectful communication — all revision requests are specific, evidence-based, and professionally phrased</li>
                <li>Your author profile is maintained and updated with every new publication</li>
                <li>You are notified before any significant changes to your published article</li>
                <li>You are notified when your article is scheduled for re-review and invited to update it yourself</li>
              </ul>
            </div>
            <div className="callout callout-red">
              <div className="callout-head">⚠️ Grounds for Article Rejection or Removal</div>
              <ul>
                <li>Fundamental clinical inaccuracies that cannot be corrected through revision</li>
                <li>Content that could directly harm readers if acted upon</li>
                <li>Plagiarism — content not original or copied from another source</li>
                <li>Undisclosed conflicts of interest discovered after submission</li>
                <li>AI-generated content submitted without disclosure</li>
                <li>Fabricated or misrepresented citations</li>
                <li>Content written outside the author&apos;s recognised specialty or scope</li>
              </ul>
            </div>
            <div className="callout callout-gray">
              <div className="callout-head">📖 Related Resources</div>
              <ul>
                <li><Link href="/editorial-policy" className="link-blue">📋 Full Editorial Policy →</Link></li>
                <li><Link href="/contact" className="link-blue">🔬 Medical Review Process →</Link></li>
                <li><Link href="/contact" className="link-blue">👨‍⚕️ Medical Reviewer Guidelines →</Link></li>
                <li><Link href="/contact" className="link-blue">💛 Safe Messaging Guidelines →</Link></li>
              </ul>
            </div>
          </section>

          <section className="content-section" id="s14">
            <div className="section-title">
              <div className="section-num green">14</div>Contact & Support
            </div>
            <div className="contact-grid">
              {CONTACTS.map((c) => (
                <div key={c.email} className="contact-card">
                  <h4>{c.title}</h4>
                  <a href={`mailto:${c.email}`}>{c.email}</a>
                  <p>{c.note}</p>
                </div>
              ))}
              <div className="contact-card">
                <h4>📍 Mailing Address</h4>
                <p style={{ color: "var(--gray-700)", fontSize: ".84rem", lineHeight: 1.6, marginTop: 0 }}>
                  MedAuthority Inc.<br />123 Medical Plaza, Suite 400<br />New York, NY 10001, USA
                </p>
              </div>
            </div>
            <div className="callout callout-blue" style={{ marginTop: 8 }}>
              <div className="callout-head">⏱️ Response Time Commitments</div>
              <ul>
                <li>New author applications: <strong>3–5 business days</strong></li>
                <li>Topic proposal decisions: <strong>3–5 business days</strong></li>
                <li>Editorial pre-screen feedback: <strong>3–5 business days from submission</strong></li>
                <li>Medical peer review: <strong>7–14 business days</strong></li>
                <li>General inquiries: <strong>5–7 business days</strong></li>
              </ul>
            </div>
          </section>
        </main>
      </div>

      <div className="page-footer-bar">
        <div className="pf-bar-inner">
          <div className="pf-pills">
            <Link href="/editorial-policy" className="pf-pill">Editorial Policy</Link>
            <Link href="/contact" className="pf-pill">Medical Review Process</Link>
            <Link href="/privacy-policy" className="pf-pill">Privacy Policy</Link>
            <Link href="/terms-conditions" className="pf-pill">Terms & Conditions</Link>
            <Link href="/disclaimer" className="pf-pill">Disclaimer</Link>
          </div>
          <div className="pf-actions">
            <span style={{ fontSize: ".76rem", color: "var(--gray-400)" }}>Last updated: June 1, 2026 · v2.1</span>
            <button type="button" className="pf-btn gray" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              ↑ Back to Top
            </button>
            <button type="button" className="pf-btn green" onClick={() => scrollTo("s10")}>
              ✍️ Apply to Write
            </button>
            <button type="button" className="pf-btn" onClick={() => window.print()}>
              ⬇️ Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className={`toast${toast ? " show" : ""}`}>{toast}</div>
    </div>
  );
}
