"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import "@/styles/editorial-policy-page.css";

const TOC = [
  { id: "s1", num: "1", label: "Editorial Philosophy" },
  { id: "s2", num: "2", label: "Editorial Independence" },
  { id: "s3", num: "3", label: "Who Creates Content" },
  { id: "s4", num: "4", label: "Author Standards" },
  { id: "s5", num: "5", label: "Reviewer Standards" },
  { id: "s6", num: "6", label: "Editorial Process" },
  { id: "s7", num: "7", label: "Evidence Standards" },
  { id: "s8", num: "8", label: "Content Types" },
  { id: "s9", num: "9", label: "Specialty Standards" },
  { id: "s10", num: "10", label: "Updating Content" },
  { id: "s11", num: "11", label: "Corrections Policy" },
  { id: "s12", num: "12", label: "Conflict of Interest" },
  { id: "s13", num: "13", label: "Sponsored Content" },
  { id: "s14", num: "14", label: "Safe Messaging" },
  { id: "s15", num: "15", label: "DEI Policy" },
  { id: "s16", num: "16", label: "Reader Feedback" },
  { id: "s17", num: "17", label: "Editorial Team" },
  { id: "s18", num: "18", label: "Contact Editorial" },
];

const PHILOSOPHY = [
  { icon: "🎯", title: "Accuracy First", text: "Every factual claim must be supported by credible, peer-reviewed evidence." },
  { icon: "🧬", title: "Evidence-Based", text: "Content reflects current best evidence from peer-reviewed literature." },
  { icon: "🩺", title: "Clinically Relevant", text: "Written to be practically useful in real-world healthcare contexts." },
  { icon: "🌍", title: "Accessible", text: "Complex medical information translated into clear, readable language." },
  { icon: "🔄", title: "Current", text: "Regularly reviewed and updated to reflect evolving medical knowledge." },
  { icon: "🤝", title: "Transparent", text: "Full disclosure of authorship, review, sources, and conflicts of interest." },
  { icon: "⚖️", title: "Balanced", text: "Multiple perspectives presented where clinical evidence is divided." },
  { icon: "💛", title: "Compassionate", text: "Written with sensitivity to patients experiencing health challenges." },
];

const CONTRIBUTORS = [
  { icon: "✍️", title: "Staff Medical Writers", text: "Full-time employed writers; minimum medical degree or advanced health science qualification required.", bg: "#e8f0fb", border: "#93c5fd", color: "var(--blue-dark)" },
  { icon: "👨‍⚕️", title: "Guest Medical Authors", text: "Licensed healthcare professionals contributing articles within their specialty; must meet full qualification standards.", bg: "#ecfdf5", border: "#a7f3d0", color: "#065f46" },
  { icon: "🔬", title: "Medical Reviewers", text: "Specialty-certified physicians who independently peer-review all content before publication.", bg: "#f3f0ff", border: "#c4b5fd", color: "var(--purple)" },
  { icon: "📝", title: "Health Journalists", text: "General health & wellness content only; all content must be physician-reviewed before publication.", bg: "#fffbeb", border: "#fde68a", color: "#92400e" },
  { icon: "🖊️", title: "Editorial Board", text: "Senior physicians governing editorial standards, content policies, and annual editorial policy reviews.", bg: "#fce7f3", border: "#f9a8d4", color: "#9d174d" },
];

const PROC_ROW1 = [
  { icon: "🎯", title: "Step 1", text: "Topic Identification & Assignment" },
  { icon: "📋", title: "Step 2", text: "Author Brief & Guidelines" },
  { icon: "✍️", title: "Step 3", text: "Author Drafts Content" },
  { icon: "🖊️", title: "Step 4", text: "Editorial Review" },
];

const PROC_ROW2 = [
  { icon: "🔬", title: "Step 5", text: "Medical Peer Review" },
  { icon: "✅", title: "Step 6", text: "Fact-Checking & Source Verification" },
  { icon: "📌", title: "Step 7", text: "Final Editorial Approval" },
  { icon: "🚀", title: "Step 8", text: "Publication & Post-Publication Monitoring" },
];

const REVIEW_SCHEDULE = [
  ["Drug & Medication Guides", "Every 6 months or upon label change"],
  ["Clinical Overview Articles", "Every 12 months"],
  ["Professional Reference Articles", "Every 12 months"],
  ["Symptom Guides", "Every 12 months"],
  ["Health & Wellness Articles", "Every 18 months"],
  ["Research Explainers", "Every 24 months"],
];

const TEAM = [
  { initials: "JK", name: "Dr. Javed Kumbhar", role: "Editor-in-Chief", sub: "MBBS, MD · Founder & Medical Director", bg: "linear-gradient(135deg,#1a56a0,#0891b2)" },
  { initials: "SM", name: "Dr. Sarah Mitchell", role: "Medical Editor", sub: "Cardiology Section Editor", bg: "linear-gradient(135deg,#dc2626,#f59e0b)" },
  { initials: "JO", name: "Dr. James Okafor", role: "Medical Editor", sub: "Neurology Section Editor", bg: "linear-gradient(135deg,#7c3aed,#4a90d9)" },
  { initials: "PS", name: "Dr. Priya Sharma", role: "Medical Editor", sub: "Endocrinology Section Editor", bg: "linear-gradient(135deg,#059669,#0891b2)" },
  { initials: "EC", name: "Dr. Emily Chen", role: "Medical Editor", sub: "Psychiatry / Women's Health", bg: "linear-gradient(135deg,#db2777,#f59e0b)" },
  { initials: "CR", name: "Dr. Carlos Rivera", role: "Medical Editor", sub: "Paediatrics Section Editor", bg: "linear-gradient(135deg,#d97706,#059669)" },
  { initials: "✅", name: "Verification Specialists", role: "Fact-Checking Team", sub: "Independent source verification on all articles", bg: "#475569", muted: true },
  { initials: "💻", name: "Digital Team", role: "SEO & Digital Editor", sub: "Search optimisation — editorial integrity maintained", bg: "#0891b2", muted: true },
  { initials: "🎨", name: "Medical Illustration", role: "Content Designers", sub: "Medically accurate diagrams & infographics", bg: "var(--purple)", muted: true },
];

const CONTACTS = [
  { title: "✉️ General Editorial", email: "editorial@medauthority.com", note: "General editorial enquiries" },
  { title: "🔍 Corrections & Inaccuracies", email: "corrections@medauthority.com", note: "Report inaccurate content" },
  { title: "✍️ Author Applications", email: "authors@medauthority.com", note: "Join as a medical author" },
  { title: "🔬 Reviewer Applications", email: "reviewers@medauthority.com", note: "Join as a medical reviewer" },
  { title: "📣 Sponsored Content", email: "partnerships@medauthority.com", note: "Partnership & advertising enquiries" },
  { title: "🧠 Safe Messaging", email: "safemessaging@medauthority.com", note: "Safe messaging concerns" },
];

function Accordion({ id, title, open, onToggle, children }: { id: string; title: string; open: boolean; onToggle: (id: string) => void; children: React.ReactNode }) {
  return (
    <div className={`acc${open ? " open" : ""}`}>
      <button type="button" className="acc-h" onClick={() => onToggle(id)} aria-expanded={open}>
        <h4>{title}</h4>
        <div className="acc-chev">▾</div>
      </button>
      <div className="acc-b">{children}</div>
    </div>
  );
}

export function EditorialPolicyContent() {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("s1");
  const [accordions, setAccordions] = useState<Record<string, boolean>>({
    "s8-clinical": true,
    "s9-mental": true,
    "s18-version": true,
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

  return (
    <div className="editorial-policy-page">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="breadcrumb">
        <div className="bc">
          🏠 <Link href="/">Home</Link> › <span>Editorial Policy</span>
        </div>
      </div>

      <div className="page-hero">
        <div className="hero-inner">
          <h1>📋 Editorial Policy</h1>
          <p>
            &quot;Our commitment to publishing accurate, evidence-based, and clinically reviewed medical content — written
            by qualified professionals, for everyone.&quot;
          </p>
          <div className="hero-meta">
            <span>📅 Effective: January 1, 2025</span>
            <span>🔄 Last Updated: June 1, 2026</span>
            <span>📋 Version 2.1</span>
          </div>
          <div className="hero-actions">
            <button type="button" className="hero-btn primary" onClick={() => window.print()}>
              🖨️ Print Policy
            </button>
            <button type="button" className="hero-btn" onClick={() => window.print()}>
              ⬇️ Download PDF
            </button>
          </div>
          <div className="trust-strip">
            {["✅ Written by Verified Medical Professionals", "🔬 Evidence-Based Content Only", "🔄 Regularly Reviewed & Updated", "🚫 No Advertiser Editorial Influence", "📋 Full COI Disclosure"].map((pill) => (
              <div key={pill} className="trust-pill">{pill}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="mission-box">
        <div className="mission-inner">
          <h2>🏥 Our Editorial Mission</h2>
          <p>
            MedAuthority is committed to being the most trusted source of medical information for patients, caregivers,
            and healthcare professionals. Every piece of content we publish undergoes a rigorous multi-stage editorial
            process — from expert authorship and peer review to fact-checking and post-publication monitoring. We believe
            that accurate medical information saves lives, and we treat every article with that responsibility in mind.
          </p>
        </div>
      </div>

      <div className="main-wrap">
        <div className="toc-sidebar">
          <div className="toc-head">📑 Table of Contents</div>
          <div className="toc-list">
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
          </div>
        </div>

        <div id="ca">
          <div className="section" id="s1">
            <div className="sec-title"><div className="sn">1</div>Our Editorial Philosophy</div>
            <div className="phil-grid">
              {PHILOSOPHY.map((p) => (
                <div key={p.title} className="phil-card">
                  <div className="phil-ico">{p.icon}</div>
                  <h4>{p.title}</h4>
                  <p>{p.text}</p>
                </div>
              ))}
            </div>
            <div className="box box-g">
              <div className="bh">✅ What We Are</div>
              <p>MedAuthority is a medically led, editorially independent health information platform. We publish content designed to educate, inform, and empower — never to alarm, mislead, or promote commercial interests.</p>
            </div>
            <div className="box box-r">
              <div className="bh">🚫 What We Are NOT</div>
              <ul>
                <li>❌ Not a diagnostic tool or replacement for medical consultation</li>
                <li>❌ Not a prescription service</li>
                <li>❌ Not a marketing platform for pharmaceutical companies</li>
                <li>❌ Not influenced by advertising revenue in our editorial decisions</li>
              </ul>
            </div>
          </div>

          <div className="section" id="s2">
            <div className="sec-title"><div className="sn">2</div>Editorial Independence</div>
            <div className="box box-b">
              <div className="bh">⚖️ Absolute Editorial Independence — Non-Negotiable</div>
              <p>MedAuthority maintains a strict firewall between editorial and commercial operations. Editorial decisions are made exclusively by our Editorial Board and medical team. The following parties have <strong>zero influence</strong> over editorial content:</p>
              <ul>
                <li>Advertisers and sponsors</li>
                <li>Pharmaceutical companies</li>
                <li>Medical device manufacturers</li>
                <li>Affiliate partners, investors, or shareholders</li>
              </ul>
            </div>
            <div className="box box-gray">
              <div className="bh">💼 Commercial Relationships (Transparently Disclosed)</div>
              <ul>
                <li>Display advertising — Google AdSense and direct ad sales</li>
                <li>Sponsored content — clearly labelled on every piece</li>
                <li>Affiliate links — disclosed per article</li>
              </ul>
            </div>
            <div className="prose">
              <p>
                These commercial relationships <strong>never affect</strong> which topics we cover, how we present clinical
                evidence, which treatments or medications we mention, or our editorial tone or conclusions. Any attempt by
                a commercial partner to influence editorial content results in <strong>immediate termination</strong> of that
                partnership. Editorial Independence Statements are signed annually by all Editorial Board members.
              </p>
            </div>
          </div>

          <div className="section" id="s3">
            <div className="sec-title"><div className="sn">3</div>Who Creates Our Content</div>
            <div className="contrib-grid">
              {CONTRIBUTORS.map((c) => (
                <div key={c.title} className="contrib-card" style={{ background: c.bg, borderColor: c.border }}>
                  <div className="ci">{c.icon}</div>
                  <h4 style={{ color: c.color }}>{c.title}</h4>
                  <p>{c.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="section g" id="s4">
            <div className="sec-title"><div className="sn g">4</div>Author Qualification Standards</div>
            <div className="box box-g">
              <div className="bh">✅ Minimum Requirements — Clinical & Specialty Articles</div>
              <ul>
                <li>Hold a valid medical degree (MBBS, MD, DO, or equivalent)</li>
                <li>Hold active, unrestricted licensure in their country of practice</li>
                <li>Minimum 3 years post-graduation clinical experience</li>
                <li>Authoring within their recognised specialty or area of training</li>
                <li>No current disciplinary action by any medical licensing board</li>
                <li>Disclose all relevant conflicts of interest</li>
                <li>Agree to Author Agreement and Editorial Policy</li>
              </ul>
            </div>
            <div className="box box-b">
              <div className="bh">🔍 Verification Process</div>
              <ul>
                <li>Credential verification by Editorial team before first publication</li>
                <li>Annual re-verification of licensure status</li>
                <li>Authors must notify MedAuthority immediately if licensure is suspended or revoked</li>
                <li>Credentials published on author bio page with verification badge</li>
              </ul>
            </div>
            <div className="box box-gray">
              <div className="bh">📋 Additional Requirements</div>
              <ul>
                <li><strong>Surgical Articles:</strong> Board certification + active surgical practice required</li>
                <li><strong>Diagnostic/Lab Articles:</strong> Relevant specialist qualification in Radiology, Pathology, or Nuclear Medicine</li>
                <li><strong>Allied Health/Wellness:</strong> Registered nurse, pharmacist, physiotherapist, or equivalent licensed professional — physician review required</li>
              </ul>
            </div>
          </div>

          <div className="section g" id="s5">
            <div className="sec-title"><div className="sn g">5</div>Medical Reviewer Standards</div>
            <div className="box box-g">
              <div className="bh">🔬 Minimum Requirements to Serve as Medical Reviewer</div>
              <ul>
                <li>Medical degree plus recognised specialist qualification (MRCP, FRCS, FCPS, Board Certification, or equivalent)</li>
                <li>Active clinical practice in the relevant specialty</li>
                <li>Minimum 5 years post-specialty qualification experience</li>
                <li>No current disciplinary action</li>
                <li>Full conflict of interest disclosure</li>
                <li>Independence from the article&apos;s author — no co-authorship or institutional conflict</li>
                <li>Must sign Medical Reviewer Agreement before reviewing</li>
              </ul>
            </div>
            <div className="box box-b">
              <div className="bh">📋 Reviewer Responsibilities</div>
              <ul>
                <li>Review clinical accuracy against current evidence and guidelines</li>
                <li>Verify cited sources are credible and correctly interpreted</li>
                <li>Flag outdated information, missing safety warnings, or clinical errors</li>
                <li>Approve, request revisions, or reject content</li>
                <li>Re-review content after major updates</li>
                <li>Flag content for retraction if it becomes clinically unsafe</li>
              </ul>
            </div>
          </div>

          <div className="section" id="s6">
            <div className="sec-title"><div className="sn">6</div>The Editorial Process — Step by Step</div>
            <div className="proc-wrap">
              <div className="proc-row">
                {PROC_ROW1.map((step) => (
                  <div key={step.title} className="proc-step">
                    <div className="proc-num blue">{step.icon}</div>
                    <h4>{step.title}</h4>
                    <p>{step.text}</p>
                  </div>
                ))}
              </div>
              <div className="proc-row">
                {PROC_ROW2.map((step) => (
                  <div key={step.title} className="proc-step">
                    <div className="proc-num teal">{step.icon}</div>
                    <h4>{step.title}</h4>
                    <p>{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="box box-b">
              <div className="bh">🔍 Step 4 — Editorial Review Checks</div>
              <ul>
                <li>Completeness and structure against brief</li>
                <li>Plain language and readability (Flesch-Kincaid target score)</li>
                <li>Source quality and citation accuracy</li>
                <li>Compliance with Editorial Style Guide</li>
                <li>Missing safety information or disclaimers</li>
              </ul>
            </div>
            <div className="box box-t">
              <div className="bh">🔬 Step 5 — Medical Peer Review Checks</div>
              <ul>
                <li>Clinical accuracy of all factual claims against current guidelines</li>
                <li>Currency of information — no outdated recommendations</li>
                <li>Completeness — no significant clinical omissions</li>
                <li>Safety — adequate warnings and contraindications included</li>
                <li>Balance — no commercial bias or misleading framing</li>
              </ul>
            </div>
            <div className="box box-g">
              <div className="bh">🚀 Step 8 — Post-Publication Monitoring</div>
              <ul>
                <li>Reader feedback reviewed and actioned</li>
                <li>Comments moderated by medical team</li>
                <li>Flagged for scheduled content review</li>
                <li>Monitored for new clinical guidelines that may affect accuracy</li>
                <li>Registered users who bookmarked significantly corrected articles notified by email</li>
              </ul>
            </div>
          </div>

          <div className="section" id="s7">
            <div className="sec-title"><div className="sn">7</div>Evidence Standards & Source Hierarchy</div>
            <div className="ev-tier ev-t1">
              <div className="ev-ico">🥇</div>
              <div>
                <h4>Tier 1 — Highest Quality (Required for all clinical claims)</h4>
                <p>Systematic reviews & meta-analyses (Cochrane, PubMed) · Randomised controlled trials (RCTs) · Clinical practice guidelines: WHO, CDC, NHS, AHA, ADA, ESC, NICE, and equivalent national bodies</p>
              </div>
            </div>
            <div className="ev-tier ev-t2">
              <div className="ev-ico">🥈</div>
              <div>
                <h4>Tier 2 — Strong Evidence (Accepted with Tier 1 support)</h4>
                <p>Cohort and case-control studies · Peer-reviewed observational studies · Expert consensus statements from recognised medical organisations</p>
              </div>
            </div>
            <div className="ev-tier ev-t3">
              <div className="ev-ico">🥉</div>
              <div>
                <h4>Tier 3 — Supporting Evidence (Supplement only — not standalone)</h4>
                <p>Case reports and case series · Expert opinion from recognised specialists · Government health agency guidance documents</p>
              </div>
            </div>
            <div className="ev-tier ev-no">
              <div className="ev-ico">❌</div>
              <div>
                <h4>NOT Accepted as Sources</h4>
                <p>Wikipedia or user-edited wikis · Non-peer-reviewed blogs · Pharmaceutical promotional materials · Unreviewed preprints (may be labelled &quot;emerging research&quot;) · Retracted studies · Anonymous online sources · AI-generated content presented as research</p>
              </div>
            </div>
            <div className="box box-gray">
              <div className="bh">📋 Citation Requirements</div>
              <ul>
                <li>Minimum <strong>5 peer-reviewed sources</strong> per clinical article</li>
                <li>Maximum source age: 10 years (exceptions for landmark studies)</li>
                <li>Preferred source age: within 5 years</li>
                <li>All sources linked directly to PubMed, DOI, or official guidelines</li>
              </ul>
            </div>
          </div>

          <div className="section" id="s8">
            <div className="sec-title"><div className="sn">8</div>Content Types & Standards Per Format</div>
            <Accordion id="s8-clinical" title="📄 Clinical Overview Articles" open={!!accordions["s8-clinical"]} onToggle={toggleAcc}>
              <p><strong>Audience:</strong> Patients, caregivers, general public · <strong>Tone:</strong> Plain language, Flesch-Kincaid Grade 8–10 · <strong>Min. word count:</strong> 1,200 words</p>
              <ul>
                <li>Required: Definition, causes, symptoms, diagnosis, treatment, prevention, when to see a doctor, key takeaways, references</li>
                <li>Medical reviewer: Required</li>
              </ul>
            </Accordion>
            <Accordion id="s8-professional" title="🩺 Professional / Clinical Reference Articles" open={!!accordions["s8-professional"]} onToggle={toggleAcc}>
              <p><strong>Audience:</strong> Healthcare professionals · <strong>Tone:</strong> Technical, precise, evidence-referenced · <strong>Min. word count:</strong> 1,500 words</p>
              <ul>
                <li>Required: Pathophysiology, diagnostic criteria, differential diagnosis, management protocols, drug information, clinical pearls, references</li>
                <li>Medical reviewer: Required (same specialty)</li>
              </ul>
            </Accordion>
            <Accordion id="s8-drug" title="💊 Drug & Medication Guides" open={!!accordions["s8-drug"]} onToggle={toggleAcc}>
              <p>Must include: Indications, contraindications, dosing (general ranges only), side effects, drug interactions, monitoring parameters, patient counselling points.</p>
              <ul>
                <li>Must include disclaimer: &quot;Dosing is for educational reference only. Always consult prescribing guidelines.&quot;</li>
                <li>Updated whenever drug label changes are identified</li>
                <li>Medical reviewer: Required (clinical pharmacologist or relevant specialist)</li>
              </ul>
            </Accordion>
            <Accordion id="s8-research" title="🔬 Research Explainers" open={!!accordions["s8-research"]} onToggle={toggleAcc}>
              <ul>
                <li>Must clearly state study limitations and level of evidence</li>
                <li>Must not overstate findings beyond what the study supports</li>
                <li>Labelled: &quot;Research Update&quot; or &quot;Emerging Evidence&quot;</li>
                <li>Medical reviewer: Required</li>
              </ul>
            </Accordion>
            <Accordion id="s8-symptom" title="📋 Symptom Guides" open={!!accordions["s8-symptom"]} onToggle={toggleAcc}>
              <ul>
                <li>Must include: Possible causes (general), when to seek care, red flag symptoms, what to expect at a doctor&apos;s visit</li>
                <li>Must NOT suggest specific diagnoses</li>
                <li>Must prominently encourage professional consultation</li>
                <li>Medical reviewer: Required</li>
              </ul>
            </Accordion>
            <Accordion id="s8-wellness" title="✅ Health & Wellness Articles" open={!!accordions["s8-wellness"]} onToggle={toggleAcc}>
              <p>Audience: General public · Based on established public health evidence · May be written by qualified allied health professionals · Must be reviewed by a physician if containing clinical claims · Clearly distinguished from clinical articles in labelling.</p>
            </Accordion>
          </div>

          <div className="section" id="s9">
            <div className="sec-title"><div className="sn">9</div>Specialty-Specific Editorial Standards</div>
            <Accordion id="s9-mental" title="🧠 Mental Health Content" open={!!accordions["s9-mental"]} onToggle={toggleAcc}>
              <ul>
                <li>Follows safe messaging guidelines for suicide, self-harm, and eating disorders</li>
                <li>Reviewed by a psychiatrist or clinical psychologist</li>
                <li>Includes crisis resources in all articles covering mental health emergencies</li>
                <li>Uses person-first, non-stigmatising language throughout</li>
                <li>Avoids sensationalism or graphic descriptions of self-harm methods</li>
              </ul>
            </Accordion>
            <Accordion id="s9-pediatric" title="🧒 Pediatric Content" open={!!accordions["s9-pediatric"]} onToggle={toggleAcc}>
              <ul>
                <li>Written and reviewed by a board-certified paediatrician</li>
                <li>Clearly indicates age ranges for all clinical information</li>
                <li>Vaccine content follows WHO and national immunisation schedules</li>
                <li>No content contradicting established vaccine safety evidence will be published</li>
              </ul>
            </Accordion>
            <Accordion id="s9-oncology" title="🧬 Oncology Content" open={!!accordions["s9-oncology"]} onToggle={toggleAcc}>
              <ul>
                <li>Reviewed by an oncologist with relevant subspecialty expertise</li>
                <li>Clearly states cancer staging, treatment protocols, and survival statistics are population-level data</li>
                <li>Emotionally sensitive framing — avoids language that increases patient anxiety unnecessarily</li>
                <li>Clinical trial references clearly labelled as experimental</li>
              </ul>
            </Accordion>
            <Accordion id="s9-pharma" title="💊 Pharmacology & Drug Content" open={!!accordions["s9-pharma"]} onToggle={toggleAcc}>
              <ul>
                <li>Reviewed by a clinical pharmacologist or specialist physician</li>
                <li>Drug doses stated as general ranges only — never as prescriptions</li>
                <li>Generic and brand names both listed; regional availability differences noted</li>
              </ul>
            </Accordion>
            <Accordion id="s9-cardio" title="❤️ Cardiology & Cardiovascular Medicine" open={!!accordions["s9-cardio"]} onToggle={toggleAcc}>
              <ul>
                <li>Reviewed by a board-certified cardiologist</li>
                <li>Cardiac symptoms always include urgent red-flag guidance</li>
                <li>Anticoagulant and antiarrhythmic dosing is never presented as prescriptive</li>
                <li>ECG and imaging interpretations described educationally only</li>
              </ul>
            </Accordion>
            <Accordion id="s9-radiology" title="🔬 Diagnostic & Radiology Content" open={!!accordions["s9-radiology"]} onToggle={toggleAcc}>
              <ul>
                <li>Laboratory reference ranges clearly labelled as general population norms</li>
                <li>Radiological findings described educationally — not diagnostically</li>
                <li>Imaging examples are licensed or AI-generated — never real patient images without consent</li>
              </ul>
            </Accordion>
          </div>

          <div className="section" id="s10">
            <div className="sec-title"><div className="sn">10</div>Updating & Maintaining Content</div>
            <table className="sched-table">
              <thead>
                <tr><th>Content Type</th><th>Review Frequency</th></tr>
              </thead>
              <tbody>
                {REVIEW_SCHEDULE.map(([type, freq]) => (
                  <tr key={type}><td>{type}</td><td>{freq}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="box box-a">
              <div className="bh">🚨 Triggers for Immediate Review</div>
              <ul>
                <li>New clinical guideline published by a major medical society</li>
                <li>Drug recall, safety warning, or label update issued</li>
                <li>Major new research significantly changes standard of care</li>
                <li>Reader or reviewer flags clinical inaccuracy</li>
                <li>Public health emergency affecting a covered topic</li>
              </ul>
            </div>
            <div className="box box-gray">
              <div className="bh">📅 Update Labelling on Every Article</div>
              <ul>
                <li>Originally Published: [Date]</li>
                <li>Last Medically Reviewed: [Date]</li>
                <li>Last Updated: [Date]</li>
                <li>Reviewed by: [Name, Credentials]</li>
                <li>Articles pending review display: ⏳ &quot;This article is currently under review&quot;</li>
                <li>Significantly outdated articles display: ⚠️ &quot;Last reviewed more than 12 months ago&quot;</li>
              </ul>
            </div>
          </div>

          <div className="section r" id="s11">
            <div className="sec-title"><div className="sn r">11</div>Corrections & Retractions Policy</div>
            <div className="corr-grid">
              <div className="corr-card minor">
                <h4>✏️ Minor Corrections</h4>
                <ul>
                  <li>Typographical errors, broken links, formatting</li>
                  <li>Corrected immediately without formal notice</li>
                  <li>No correction notice required</li>
                </ul>
              </div>
              <div className="corr-card factual">
                <h4>📝 Factual Corrections</h4>
                <ul>
                  <li>Inaccurate clinical data or statistics</li>
                  <li>Corrected within 5 business days</li>
                  <li>Correction notice added to article</li>
                  <li>Author and reviewer notified</li>
                </ul>
              </div>
              <div className="corr-card safety">
                <h4>🚨 Clinical Safety Corrections</h4>
                <ul>
                  <li>Content that could affect patient safety</li>
                  <li>Corrected within 48 hours</li>
                  <li>Prominent correction banner added</li>
                  <li>Editorial Board root cause review</li>
                </ul>
              </div>
            </div>
            <div className="box box-r">
              <div className="bh">🔴 Retractions Policy</div>
              <p>Full article removal when content is fundamentally flawed or clinically unsafe. A retraction notice is published at the original URL. If author misconduct is identified, the matter is reported to relevant professional regulatory bodies. All retractions are permanently logged in editorial records.</p>
            </div>
            <div className="prose">
              <p>📧 To report a correction: <strong>corrections@medauthority.com</strong> · Response commitment: within 5 business days</p>
            </div>
          </div>

          <div className="section" id="s12">
            <div className="sec-title"><div className="sn">12</div>Conflict of Interest Policy</div>
            <div className="box box-b">
              <div className="bh">📋 Definition</div>
              <p>&quot;A conflict of interest exists when an author or reviewer has financial, professional, or personal relationships that could influence — or appear to influence — the content they produce or review.&quot;</p>
            </div>
            <div className="box box-a">
              <div className="bh">💰 Mandatory Disclosures — All Authors & Reviewers</div>
              <ul>
                <li>Financial relationships with pharmaceutical, device, or biotech companies</li>
                <li>Research funding from commercial entities</li>
                <li>Speaker fees or honoraria from commercial organisations</li>
                <li>Employment or consultancy roles with relevant companies</li>
                <li>Ownership of stocks or equity in relevant healthcare companies</li>
                <li>Personal relationships that may create bias</li>
              </ul>
            </div>
            <div className="prose">
              <p>Disclosures are submitted before first article, updated annually, reviewed by the Editorial Board, and published on each article and author bio page. Significant conflicts may result in topic reassignment, additional independent review, or exclusion from reviewing specific topics. Editorial Board members are subject to the same policy with annual public disclosure.</p>
            </div>
          </div>

          <div className="section a" id="s13">
            <div className="sec-title"><div className="sn a">13</div>Sponsored & Advertiser Content Policy</div>
            <div className="box box-r">
              <div className="bh">🚫 Absolute Rules — Non-Negotiable</div>
              <ul>
                <li>Advertisers have zero editorial influence over any non-sponsored content</li>
                <li>We do not publish positive coverage of a product in exchange for advertising revenue</li>
                <li>We do not allow pharmaceutical companies to ghostwrite or direct content</li>
                <li>We do not suppress negative clinical information about advertised products</li>
              </ul>
            </div>
            <div className="box box-a">
              <div className="bh">📣 Sponsored Content Rules</div>
              <ul>
                <li>Every piece of sponsored content is clearly labelled: <strong>Sponsored Content | Paid Partnership | Advertisement</strong></li>
                <li>Sponsored content is subject to the same medical accuracy standards as editorial content</li>
                <li>Sponsors may not make unsubstantiated health claims, reference unapproved indications, or target vulnerable populations inappropriately</li>
                <li>Sponsors are disclosed by name in every sponsored article</li>
                <li>Affiliate links disclosed with: <em>&quot;This article contains affiliate links.&quot;</em></li>
              </ul>
            </div>
          </div>

          <div className="section p" id="s14">
            <div className="sec-title"><div className="sn p">14</div>Safe Messaging Guidelines</div>
            <div className="box box-a">
              <div className="bh">⚠️ Topics Requiring Safe Messaging Protocols</div>
              <ul>
                <li>🧠 Suicide and self-harm</li>
                <li>🍽️ Eating disorders</li>
                <li>💊 Substance use and addiction</li>
                <li>🏃 Disordered exercise behaviour</li>
                <li>⚖️ Body image and weight stigma</li>
              </ul>
            </div>
            <div className="box box-r">
              <div className="bh">🚫 We Will NEVER</div>
              <ul>
                <li>Describe specific methods of self-harm or suicide</li>
                <li>Sensationalise or romanticise eating disorder behaviours</li>
                <li>Use stigmatising language — e.g., we say &quot;died by suicide&quot; not &quot;committed suicide&quot;</li>
                <li>Publish triggering before/after images</li>
                <li>Present extreme thinness as aspirational or desirable</li>
              </ul>
            </div>
            <div className="box box-g">
              <div className="bh">✅ We ALWAYS</div>
              <ul>
                <li>Follow Reporting on Suicide guidelines (reportingonsuicide.org)</li>
                <li>Follow NEDA and WHO safe messaging guidelines for eating disorders</li>
                <li>Include crisis resources at the top and bottom of all relevant articles</li>
                <li>Encourage professional help-seeking in all mental health content</li>
                <li>Use person-first, compassionate, non-stigmatising language throughout</li>
              </ul>
            </div>
          </div>

          <div className="section p" id="s15">
            <div className="sec-title"><div className="sn p">15</div>Diversity, Equity & Inclusion in Health Content</div>
            <div className="box box-p">
              <div className="bh">🌍 Our DEI Editorial Commitments</div>
              <ul>
                <li>Acknowledge when research evidence lacks diversity across race, ethnicity, sex, or geography</li>
                <li>Use inclusive, gender-affirming language throughout all content</li>
                <li>Represent diverse patient populations in examples and imagery</li>
                <li>Cover health disparities and social determinants of health</li>
                <li>Avoid weight stigma in all nutrition and wellness content</li>
                <li>Include accessibility considerations: screen readers, alt text, plain language</li>
                <li>Actively seek authors from diverse medical backgrounds and geographic regions including Pakistan, South Asia, Africa, and the Middle East</li>
                <li>Conduct annual DEI audit of content library by the Editorial Board</li>
              </ul>
            </div>
          </div>

          <div className="section" id="s16">
            <div className="sec-title"><div className="sn">16</div>Reader Feedback & Engagement</div>
            <div className="box box-g">
              <div className="bh">📊 How We Use Reader Feedback</div>
              <ul>
                <li>👍 / 👎 helpfulness ratings reviewed monthly by editorial team</li>
                <li>Star ratings and article quality scores monitored per article</li>
                <li>&quot;Report an error&quot; submissions reviewed within 5 business days</li>
                <li>&quot;Suggest a topic&quot; submissions reviewed by Editorial Board quarterly</li>
                <li>Reader-submitted questions may inspire future article topics</li>
              </ul>
            </div>
            <div className="box box-r">
              <div className="bh">🚫 Comment Moderation Policy</div>
              <ul>
                <li>All comments reviewed before publication by our medical team</li>
                <li>Comments containing medical misinformation removed immediately</li>
                <li>Comments attempting to provide medical advice to other readers removed</li>
                <li>Abusive, discriminatory, or off-topic comments removed</li>
                <li>Repeat violators have commenting privileges permanently revoked</li>
                <li>Constructive criticism and questions welcomed and responded to</li>
              </ul>
            </div>
          </div>

          <div className="section" id="s17">
            <div className="sec-title"><div className="sn">17</div>Editorial Team Structure</div>
            <div className="team-grid">
              {TEAM.map((member) => (
                <div key={member.name} className="team-card" style={member.muted ? { background: "var(--gray-50)" } : undefined}>
                  <div className="team-av" style={{ background: member.bg }}>{member.initials}</div>
                  <div className="team-role">{member.role}</div>
                  <h4>{member.name}</h4>
                  <p>{member.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="section" id="s18">
            <div className="sec-title"><div className="sn">18</div>Contact the Editorial Team</div>
            <div className="contact-grid">
              {CONTACTS.map((c) => (
                <div key={c.email} className="contact-card">
                  <h4>{c.title}</h4>
                  <a href={`mailto:${c.email}`}>{c.email}</a>
                  <p>{c.note}</p>
                </div>
              ))}
            </div>
            <div className="box box-b">
              <div className="bh">⏱️ Response Time Commitment</div>
              <p>All editorial enquiries are responded to within <strong>5–7 business days</strong>. Correction reports acknowledged within <strong>48 hours</strong> and resolved within <strong>5 business days</strong>. Clinical safety issues escalated and resolved within <strong>48 hours</strong>.</p>
            </div>
            <Accordion id="s18-version" title="📋 Policy Version History" open={!!accordions["s18-version"]} onToggle={toggleAcc}>
              <table className="ver-table">
                <tbody>
                  <tr>
                    <td><span className="ver-tag">v2.1</span></td>
                    <td><strong>June 2026</strong></td>
                    <td>Added author AI content policy, updated safe messaging section, expanded DEI commitments</td>
                  </tr>
                  <tr>
                    <td><span className="ver-tag">v2.0</span></td>
                    <td><strong>January 2025</strong></td>
                    <td>Full rewrite — added GPC support, expanded evidence hierarchy, new corrections framework</td>
                  </tr>
                  <tr>
                    <td><span className="ver-tag">v1.0</span></td>
                    <td><strong>March 2023</strong></td>
                    <td>Initial Editorial Policy published</td>
                  </tr>
                </tbody>
              </table>
            </Accordion>
          </div>
        </div>
      </div>

      <div className="policy-footer">
        <div className="pf-inner">
          <div className="pill-links">
            <Link href="/privacy-policy" className="pill-link">Privacy Policy</Link>
            <Link href="/terms-conditions" className="pill-link">Terms & Conditions</Link>
            <Link href="/disclaimer" className="pill-link">Disclaimer</Link>
            <Link href="/cookie-policy" className="pill-link">Cookie Policy</Link>
            <Link href="/author-guidelines" className="pill-link">Author Guidelines</Link>
          </div>
          <div className="pf-btns">
            <span style={{ fontSize: ".72rem", color: "var(--gray-400)" }}>Last updated: June 1, 2026 · v2.1</span>
            <button type="button" className="pf-btn gray" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              ↑ Back to Top
            </button>
            <button type="button" className="pf-btn" onClick={() => window.print()}>
              🖨️ Print
            </button>
            <button type="button" className="pf-btn g" onClick={() => window.print()}>
              ⬇️ Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
