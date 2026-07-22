"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import "@/styles/medical-review-process-page.css";

const CONTACT_EMAILS = {
  review: "review@drinsight.org",
  corrections: "corrections@drinsight.org",
  reviewers: "reviewers@drinsight.org",
  editorial: "editorial@drinsight.org",
  urgent: "urgent@drinsight.org",
} as const;

const TOC = [
  { id: "s1", num: "1", label: "Review Philosophy" },
  { id: "s2", num: "2", label: "Who Reviews" },
  { id: "s3", num: "3", label: "Reviewer Qualifications" },
  { id: "s4", num: "4", label: "Review Process" },
  { id: "s5", num: "5", label: "What Is Evaluated" },
  { id: "s6", num: "6", label: "Specialty Standards" },
  { id: "s7", num: "7", label: "Evidence Standards" },
  { id: "s8", num: "8", label: "Review Badges" },
  { id: "s9", num: "9", label: "Content Currency" },
  { id: "s10", num: "10", label: "When Content Fails" },
  { id: "s11", num: "11", label: "Post-Publication" },
  { id: "s12", num: "12", label: "Corrections" },
  { id: "s13", num: "13", label: "Reviewer Independence" },
  { id: "s14", num: "14", label: "Meet the Reviewers" },
  { id: "s15", num: "15", label: "Become a Reviewer" },
  { id: "s16", num: "16", label: "Contact Review Team" },
];

const PHILOSOPHY = [
  { icon: "🎯", title: "Independence", text: "Reviewers are always independent of the content's author — no co-authorship or institutional conflicts permitted." },
  { icon: "🔬", title: "Evidence-First", text: "Every factual claim verified against peer-reviewed literature before any article is approved." },
  { icon: "⏱️", title: "Currency", text: "Information must reflect current clinical guidelines and active clinical practice — not outdated standards." },
  { icon: "🌍", title: "Completeness", text: "No significant clinical omissions that could affect reader safety or lead to incorrect decisions." },
  { icon: "⚖️", title: "Balance", text: "Competing evidence presented fairly without commercial bias or undue prominence of any treatment." },
  { icon: "🛡️", title: "Safety", text: "Adequate warnings, contraindications, red flags, and emergency guidance always included where relevant." },
  { icon: "💛", title: "Compassion", text: "Patient-facing content reviewed for tone, sensitivity, accessibility, and safe messaging compliance." },
  { icon: "🔄", title: "Continuity", text: "Review is not a one-time event — all content is monitored, scheduled for re-review, and updated." },
];

const GEO_PILLS = [
  "🇵🇰 Pakistan", "🇬🇧 United Kingdom", "🇺🇸 United States", "🇦🇺 Australia",
  "🇨🇦 Canada", "🇮🇳 India", "🇸🇦 Gulf Region", "🇪🇺 European Union",
];

const CHECKLIST_ROWS = [
  ["🎯 Clinical Accuracy", "All facts verified correct against current peer-reviewed evidence"],
  ["📚 Source Quality", "Peer-reviewed, credible, not retracted, correctly interpreted"],
  ["⏱️ Currency", "Information reflects current guidelines and clinical practice"],
  ["🔍 Completeness", "No significant clinical omissions that could affect safety"],
  ["🛡️ Safety", "Adequate warnings, contraindications, and safety guidance included"],
  ["🚩 Red Flags", "Emergency symptoms clearly identified and appropriately emphasised"],
  ["💊 Drug Information", "Names, doses, interactions, and indications verified against current formularies"],
  ["🔬 Diagnostic Criteria", "Matches current DSM-5, ICD-11, and specialty classification systems"],
  ["⚖️ Balance", "Competing evidence presented fairly without undue prominence"],
  ["🎭 Bias", "No commercial or personal bias detectable in framing or emphasis"],
  ["💛 Tone", "Compassionate, appropriate, non-alarming while remaining accurate"],
  ["📖 Readability", "Appropriate plain language for stated target audience"],
  ["🌍 Inclusivity", "Diverse populations (age, gender, ethnicity, comorbidities) considered"],
  ["⚠️ Disclaimer", "Medical disclaimer appropriately placed and clearly visible"],
  ["🔗 References", "All sources correctly cited, accessible, and within age guidelines"],
];

const SPECIALTY_ACCORDIONS = [
  {
    id: "s6-neurology",
    title: "🧠 Neurology & Neurosurgery",
    items: [
      "Reviewed by neurologist or neurosurgeon with subspecialty match",
      "Diagnostic criteria verified against current DSM-5 / ICD-11 / international neurology society guidelines",
      "Epilepsy, stroke, and movement disorder content requires subspecialist review",
      "Neuroimaging descriptions reviewed for accuracy and appropriate clinical caveats",
    ],
  },
  {
    id: "s6-cardiology",
    title: "❤️ Cardiology & Cardiothoracic Surgery",
    items: [
      "Reviewed by cardiologist or cardiothoracic surgeon",
      "Drug information verified against current ESC, AHA/ACC, and local formulary guidelines",
      "Cardiac emergency content reviewed for appropriate urgency framing",
      "Anticoagulation and antiarrhythmic content requires consultant-level cardiologist review",
    ],
  },
  {
    id: "s6-pediatrics",
    title: "🧒 Pediatrics",
    items: [
      "Reviewed by board-certified paediatrician",
      "All dosing information confirmed as weight-based and age-stratified",
      "Developmental milestones verified against WHO and AAP standards",
      "Vaccine content verified against WHO EPI schedule and local national immunisation programme",
      "No content contradicting established vaccine safety evidence is published",
    ],
  },
  {
    id: "s6-psychiatry",
    title: "🧠 Psychiatry & Mental Health",
    items: [
      "Reviewed by psychiatrist or clinical psychologist",
      "Safe messaging guidelines compliance confirmed by reviewer",
      "Crisis resource inclusion verified in all relevant articles",
      "Stigma-free, person-first language confirmed throughout",
      "Medication information verified against current prescribing guidelines",
    ],
  },
  {
    id: "s6-oncology",
    title: "🧬 Oncology",
    items: [
      "Reviewed by oncologist with tumour-type subspecialty match where possible",
      "Staging information verified against current AJCC / TNM classification",
      "Treatment protocols verified against current NCCN, ESMO, or equivalent guidelines",
      "Survival statistics sourced from population-level data with appropriate caveats",
      "Clinical trial references clearly labelled as experimental",
    ],
  },
  {
    id: "s6-pharmacology",
    title: "💊 Pharmacology & Drug Content",
    items: [
      "Reviewed by clinical pharmacologist or specialist physician",
      "All drug information cross-referenced with BNF (British National Formulary), FDA prescribing information, and local national formulary",
      "Off-label use clearly labelled throughout",
      "Black box warnings prominently displayed",
    ],
  },
  {
    id: "s6-surgical",
    title: "🔪 Surgical Specialties",
    items: [
      "Reviewed by surgeon with matching specialty certification",
      "Surgical indications and contraindications verified against current guidelines",
      "Complication rates sourced from peer-reviewed literature",
      "Recovery and outcome data presented as population averages with appropriate caveats",
    ],
  },
  {
    id: "s6-radiology",
    title: "🔬 Radiology & Pathology",
    items: [
      "Reviewed by radiologist or pathologist respectively",
      "Imaging descriptions reviewed for educational accuracy with appropriate disclaimers",
      "Laboratory reference ranges verified and clearly labelled as population norms",
      "Imaging examples confirmed as licensed or AI-generated — never real patient data without consent",
    ],
  },
];

const REVIEW_SCHEDULE = [
  ["Drug & Medication Guides", "Every 6 months", "Drug label change, recall, or safety warning"],
  ["Clinical Overview Articles", "Every 12 months", "New major guideline published"],
  ["Professional Reference Articles", "Every 12 months", "Significant new RCT or guideline"],
  ["Surgical Procedure Articles", "Every 12 months", "New technique or safety data"],
  ["Oncology Content", "Every 6 months", "New trial results or protocol update"],
  ["Mental Health Articles", "Every 12 months", "New DSM/ICD update or guideline"],
  ["Pediatric Content", "Every 12 months", "New AAP/WHO guideline published"],
  ["Research Explainers", "Every 24 months", "Study retracted or superseded"],
  ["Health & Wellness", "Every 18 months", "Significant new evidence emerges"],
  ["Symptom Guides", "Every 12 months", "New diagnostic criteria published"],
];

const CORRECTIONS_TABLE = [
  ["Typographical error", "24 hours", "Not required"],
  ["Minor factual error", "5 business days", "Correction notice on article"],
  ["Significant clinical error", "48 hours", "Prominent correction banner"],
  ["Safety-critical error", "Immediate unpublish", "Urgent banner + email to bookmarkers"],
  ["Full retraction", "Within 24 hours of decision", "Permanent retraction notice at URL"],
];

const REVIEWER_FILTERS = [
  { key: "all", label: "All Specialties" },
  { key: "cardiology", label: "Cardiology" },
  { key: "neurology", label: "Neurology" },
  { key: "endocrinology", label: "Endocrinology" },
  { key: "psychiatry", label: "Psychiatry" },
  { key: "pediatrics", label: "Pediatrics" },
];

const REVIEWERS = [
  {
    spec: "cardiology",
    initials: "JK",
    bg: "linear-gradient(135deg,#0f3d7a,#1a56a0)",
    name: "Dr. Javed Kumbhar",
    cred: "MBBS, MD, FCPS · Cardiology",
    inst: ["🏥 Aga Khan University Hospital", "📍 Karachi, Pakistan"],
    specText: "Specialises in: Heart Failure, Hypertension, CAD · 20+ years experience",
    reviewed: "47",
    since: "Jan 2024",
  },
  {
    spec: "neurology",
    initials: "JO",
    bg: "linear-gradient(135deg,#7c3aed,#4a90d9)",
    name: "Dr. James Okafor",
    cred: "MBBS, MD, MRCP · Neurology",
    inst: ["🏥 NYU Langone Medical Center", "📍 Karachi, Pakistan"],
    specText: "Specialises in: Migraine, Neuro-Oncology, Movement Disorders · 12 years",
    reviewed: "64",
    since: "Sep 2020",
  },
  {
    spec: "cardiology",
    initials: "SM",
    bg: "linear-gradient(135deg,#dc2626,#f59e0b)",
    name: "Dr. Sarah Mitchell",
    cred: "MBBS, MD, MRCP · Cardiology",
    inst: ["🏥 King's College Hospital", "📍 London, United Kingdom"],
    specText: "Specialises in: Arrhythmia, Cardiac Imaging, Preventive Cardiology · 15 years",
    reviewed: "89",
    since: "Mar 2021",
  },
  {
    spec: "endocrinology",
    initials: "PS",
    bg: "linear-gradient(135deg,#059669,#0891b2)",
    name: "Dr. Priya Sharma",
    cred: "MBBS, MD, FRCP · Endocrinology",
    inst: ["🏥 AIIMS New Delhi", "📍 New Delhi, India"],
    specText: "Specialises in: Diabetes, Thyroid Disorders, Obesity Medicine · 14 years",
    reviewed: "76",
    since: "Jun 2021",
  },
  {
    spec: "psychiatry",
    initials: "EC",
    bg: "linear-gradient(135deg,#db2777,#f59e0b)",
    name: "Dr. Emily Chen",
    cred: "MD, Board Certified · Psychiatry",
    inst: ["🏥 Stanford Medicine", "📍 San Francisco, USA"],
    specText: "Specialises in: Mood Disorders, Women's Mental Health, CBT · 11 years",
    reviewed: "52",
    since: "Jan 2022",
  },
  {
    spec: "pediatrics",
    initials: "CR",
    bg: "linear-gradient(135deg,#d97706,#059669)",
    name: "Dr. Carlos Rivera",
    cred: "MD, Board Certified · Pediatrics",
    inst: ["🏥 Children's Hospital Los Angeles", "📍 Los Angeles, USA"],
    specText: "Specialises in: Paediatric Infectious Disease, Vaccines, Neonatology · 10 years",
    reviewed: "38",
    since: "Apr 2022",
  },
];

const APPLY_BENEFITS = [
  "✅ Named reviewer credit on every article you review",
  "✅ Full reviewer bio page on the platform",
  "✅ CPD / CME recognition letter on request",
  "✅ Honorarium for completed reviews (where applicable)",
  "✅ Invitation to Editorial Board events and webinars",
  "✅ Flexible scheduling — review at your convenience",
];

const APPLY_STEPS = [
  "Complete online application form at /reviewer-application",
  "Submit proof of qualifications and active medical licensure",
  "Complete DrInsight Reviewer Orientation Module (approx. 2 hours)",
  "Sign Medical Reviewer Agreement and submit COI disclosure",
  "Complete one trial review with Editorial feedback",
  "Approved reviewers added to active reviewer network",
];

function Accordion({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  open: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
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

export function MedicalReviewProcessContent() {
  const [activeSection, setActiveSection] = useState("s1");
  const [accordions, setAccordions] = useState<Record<string, boolean>>({ "s6-neurology": true });
  const [reviewerFilter, setReviewerFilter] = useState("all");

  const sectionIds = TOC.map((t) => t.id);

  useEffect(() => {
    const onScroll = () => {
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

  const filteredReviewers =
    reviewerFilter === "all" ? REVIEWERS : REVIEWERS.filter((r) => r.spec === reviewerFilter);

  return (
    <div className="medical-review-page">
      <div className="hero">
        <div className="hero-in">
          <h1>🔬 Our Medical Review Process</h1>
          <p>
            &quot;Every article published on DrInsight passes through a rigorous, multi-stage medical review
            process — ensuring what you read is accurate, current, and clinically trustworthy.&quot;
          </p>
          <div className="hero-meta">📅 Last Updated: June 1, 2026 &nbsp;|&nbsp; Version 2.1</div>
          <div className="trust-pills">
            <div className="tp">🩺 Reviewed by Licensed Physicians</div>
            <div className="tp">🎓 Specialty-Certified Reviewers</div>
            <div className="tp">🔬 Evidence-Based Standards</div>
            <div className="tp">🔄 Reviewed Every 12 Months</div>
            <div className="tp">✅ Zero Advertiser Influence</div>
            <div className="tp">📋 Full COI Disclosure</div>
          </div>
        </div>
      </div>

      <div className="mission">
        <div className="mission-in">
          <h2>🏥 Why Our Review Process Matters</h2>
          <p>
            Medical misinformation is one of the most dangerous phenomena of the digital age. Inaccurate health
            content can delay diagnosis, encourage harmful self-treatment, undermine trust in healthcare, and — in
            worst cases — cost lives. At DrInsight, we believe that publishing medical content is a profound
            responsibility. This page exists to be fully transparent about exactly how we uphold that responsibility
            — every single day, for every single article.
          </p>
        </div>
      </div>

      <div className="main-wrap">
        <div className="toc-side">
          <div className="toc-hd">📑 Contents</div>
          <div className="toc-list">
            {TOC.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`ti${activeSection === item.id ? " active" : ""}`}
                onClick={() => scrollTo(item.id)}
              >
                <div className="tn">{item.num}</div>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div id="content">
          <div className="sec" id="s1">
            <div className="stitle">
              <div className="snum">1</div>Our Review Philosophy
            </div>
            <div className="phil-grid">
              {PHILOSOPHY.map((p) => (
                <div key={p.title} className="phil-card">
                  <div className="ph-ico">{p.icon}</div>
                  <h4>{p.title}</h4>
                  <p>{p.text}</p>
                </div>
              ))}
            </div>
            <div className="box box-r">
              <div className="bh">🚫 What Medical Review Is NOT</div>
              <ul>
                <li>❌ A rubber stamp — reviewers genuinely challenge, query, and revise content</li>
                <li>❌ A commercial endorsement — reviewer credit does not imply personal product recommendation</li>
                <li>❌ A substitute for clinical consultation — all reviewed content remains educational only</li>
                <li>❌ Permanent — all reviewed content has an expiry date and is scheduled for re-review</li>
              </ul>
            </div>
          </div>

          <div className="sec" id="s2">
            <div className="stitle">
              <div className="snum g">2</div>Who Our Medical Reviewers Are
            </div>
            <div className="tier-grid">
              <div className="tier-card tc-t1">
                <div className="tier-ico">🥇</div>
                <h3>Tier 1 — Specialty Medical Reviewers</h3>
                <ul>
                  <li>Board-certified or fellowship-trained specialists</li>
                  <li>Active clinical practice in stated specialty</li>
                  <li>Minimum 5 years post-qualification experience</li>
                  <li>Review articles only within their specific area of expertise</li>
                  <li>Examples: Cardiologist reviewing cardiology; Neurosurgeon reviewing neurosurgery</li>
                </ul>
              </div>
              <div className="tier-card tc-t2">
                <div className="tier-ico">🥈</div>
                <h3>Tier 2 — General Medical Reviewers</h3>
                <ul>
                  <li>Licensed physicians with broad clinical experience</li>
                  <li>Minimum MBBS/MD plus 7 years clinical experience</li>
                  <li>Review general medicine, primary care, and wellness content</li>
                  <li>Refer specialty content upward to Tier 1 reviewers</li>
                </ul>
              </div>
              <div className="tier-card tc-t3">
                <div className="tier-ico">🥉</div>
                <h3>Tier 3 — Allied Health Reviewers</h3>
                <ul>
                  <li>Registered nurses, pharmacists, physiotherapists, dietitians, psychologists</li>
                  <li>Licensed and actively practicing in their field</li>
                  <li>Review content within their specific professional scope only</li>
                  <li>All allied health reviewed content also undergoes physician sign-off</li>
                </ul>
              </div>
            </div>
            <div className="box box-b">
              <div className="bh">🌍 Reviewer Geographic Representation</div>
              <p style={{ marginBottom: 8 }}>
                Our reviewer network spans multiple countries and healthcare systems, ensuring content reflects
                diverse clinical contexts. Regional variations in guidelines and practice are noted in articles
                where relevant.
              </p>
              <div className="geo-pills">
                {GEO_PILLS.map((pill) => (
                  <div key={pill} className="gp">
                    {pill}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sec" id="s3">
            <div className="stitle">
              <div className="snum">3</div>Reviewer Qualification Standards
            </div>
            <div className="box box-g">
              <div className="bh">🎓 Academic & Licensure Requirements</div>
              <ul>
                <li>Medical degree (MBBS, MD, DO, MBChB, or equivalent) from accredited institution</li>
                <li>
                  Postgraduate specialist qualification: MRCP / FRCP / FRCS (UK) · FCPS / MCPS (Pakistan) · Board
                  Certification (USA) · FRACP / FRACS (Australia) · DM / MS / MCh (India) · or equivalent
                </li>
                <li>Active, unrestricted medical license in country of practice</li>
                <li>No current or pending disciplinary proceedings</li>
                <li>Minimum 5 years post-specialist qualification clinical experience</li>
              </ul>
            </div>
            <div className="box box-b">
              <div className="bh">🏥 Active Practice Requirements</div>
              <ul>
                <li>Currently seeing patients in clinical practice</li>
                <li>Affiliated with a recognised hospital, clinic, or academic institution</li>
                <li>Maintains continuing medical education (CME) requirements for their specialty</li>
                <li>Up to date with current clinical guidelines in their specialty area</li>
              </ul>
            </div>
            <div className="box box-gray">
              <div className="bh">📋 Platform-Specific Requirements</div>
              <ul>
                <li>Completes DrInsight Reviewer Orientation Program</li>
                <li>Signs Medical Reviewer Agreement before first review</li>
                <li>Submits full Conflict of Interest Disclosure</li>
                <li>Annual licensure re-verification</li>
                <li>Minimum 4 reviews per year to maintain active reviewer status</li>
                <li>Immediate notification if licensure status changes</li>
              </ul>
            </div>
          </div>

          <div className="sec" id="s4">
            <div className="stitle">
              <div className="snum">4</div>The Review Process — Full Step by Step
            </div>
            <div className="phase-grid">
              <div className="phase">
                <div className="phase-dot ph-blue">📥</div>
                <h4>Phase 1</h4>
                <p>Pre-Review Preparation</p>
              </div>
              <div className="phase">
                <div className="phase-dot ph-green">🔬</div>
                <h4>Phase 2</h4>
                <p>Active Medical Review</p>
              </div>
              <div className="phase">
                <div className="phase-dot ph-amber">📋</div>
                <h4>Phase 3</h4>
                <p>Decision & Resolution</p>
              </div>
              <div className="phase">
                <div className="phase-dot ph-purple">🚀</div>
                <h4>Phase 4</h4>
                <p>Publication & Beyond</p>
              </div>
            </div>

            <div className="box box-b" style={{ marginBottom: 6 }}>
              <div className="bh">🔵 Phase 1 — Pre-Review Preparation</div>
            </div>
            <div className="phase-steps">
              <div className="ps">
                <div className="ps-hd">
                  <div className="ps-num ps-blue">1</div>
                  <h4>📥 Content Submission</h4>
                </div>
                <div className="ps-body">
                  Author submits completed draft via editorial CMS including full article text with inline citations,
                  reference list with DOI/PubMed links, COI declaration, target audience and specialty category tag.
                  <ul>
                    <li>Draft must meet minimum word count and source requirements</li>
                    <li>Specialty tag determines which reviewer tier is assigned</li>
                  </ul>
                </div>
              </div>
              <div className="ps">
                <div className="ps-hd">
                  <div className="ps-num ps-blue">2</div>
                  <h4>🖊️ Editorial Pre-Screen</h4>
                </div>
                <div className="ps-body">
                  Staff editor conducts pre-review check before medical review assignment:
                  <ul>
                    <li>✅ Article structure complete and logical</li>
                    <li>✅ Minimum 5 peer-reviewed sources included</li>
                    <li>✅ Plain language standards met (patient-facing content)</li>
                    <li>✅ Author COI disclosure submitted</li>
                    <li>✅ Safe messaging guidelines followed (if applicable)</li>
                    <li>Articles failing pre-screen returned to author with specific written feedback</li>
                  </ul>
                </div>
              </div>
              <div className="ps">
                <div className="ps-hd">
                  <div className="ps-num ps-blue">3</div>
                  <h4>👨‍⚕️ Reviewer Assignment</h4>
                </div>
                <div className="ps-body">
                  Managing Editor identifies appropriate reviewer — matching specialty exactly, confirming reviewer is
                  independent of author, and confirming no undisclosed COI with article topic. Reviewer receives
                  article draft, review brief and checklist, and deadline (standard: 7 business days).
                </div>
              </div>
            </div>

            <div className="box box-g" style={{ marginBottom: 6 }}>
              <div className="bh">🟢 Phase 2 — Active Medical Review</div>
            </div>
            <div className="phase-steps">
              <div className="ps">
                <div className="ps-hd">
                  <div className="ps-num ps-green">4</div>
                  <h4>🔬 Clinical Accuracy Review</h4>
                </div>
                <div className="ps-body">
                  Reviewer systematically evaluates every factual claim — checking each cited source is peer-reviewed,
                  correctly interpreted, current, and not retracted. Verifies drug names, doses, diagnostic criteria
                  (DSM-5, ICD-11), and treatment protocols against current national and international guidelines.
                </div>
              </div>
              <div className="ps">
                <div className="ps-hd">
                  <div className="ps-num ps-green">5</div>
                  <h4>🛡️ Completeness & Safety Review</h4>
                </div>
                <div className="ps-body">
                  Reviewer evaluates what is present AND what is missing:
                  <ul>
                    <li>All significant contraindications listed?</li>
                    <li>Red flag symptoms clearly identified?</li>
                    <li>Drug interactions and side effects adequately covered?</li>
                    <li>Appropriate &quot;when to seek medical care&quot; guidance?</li>
                    <li>Vulnerable populations addressed? (pregnancy, pediatrics, elderly, renal/hepatic impairment)</li>
                  </ul>
                </div>
              </div>
              <div className="ps">
                <div className="ps-hd">
                  <div className="ps-num ps-green">6</div>
                  <h4>⚖️ Balance & Bias Review</h4>
                </div>
                <div className="ps-body">
                  Reviewer assesses whether evidence is presented fairly where there is genuine clinical debate,
                  whether any treatment is given undue prominence without evidence basis, and whether there is any
                  suggestion of commercial influence in framing or emphasis.
                </div>
              </div>
              <div className="ps">
                <div className="ps-hd">
                  <div className="ps-num ps-green">7</div>
                  <h4>💛 Tone & Accessibility Review</h4>
                </div>
                <div className="ps-body">
                  For patient-facing content — reviewer additionally assesses language appropriateness, compassionate
                  and non-alarming tone, adequate plain language explanation of medical terms, safe messaging
                  compliance, and cultural sensitivity and inclusivity.
                </div>
              </div>
            </div>

            <div className="box box-a" style={{ marginBottom: 6 }}>
              <div className="bh">🟡 Phase 3 — Review Decision & Resolution</div>
            </div>
            <div className="decision-grid">
              <div className="dec-card dc-g">
                <h4>✅ APPROVED</h4>
                <ul>
                  <li>Content meets all clinical standards</li>
                  <li>Reviewer submits signed approval with review date</li>
                  <li>Reviewer credit added to article</li>
                  <li>Article advances to final editorial sign-off</li>
                </ul>
              </div>
              <div className="dec-card dc-a">
                <h4>🔄 REVISIONS NEEDED</h4>
                <ul>
                  <li>Specific changes required before approval</li>
                  <li>Detailed revision notes returned to author</li>
                  <li>Author has 5 business days to revise and resubmit</li>
                  <li>Revised article returns to same reviewer</li>
                  <li>Maximum 2 revision cycles before escalation to Editorial Board</li>
                </ul>
              </div>
              <div className="dec-card dc-r">
                <h4>❌ REJECTED</h4>
                <ul>
                  <li>Fundamental clinical errors or unsafe content</li>
                  <li>Editorial Board notified immediately</li>
                  <li>Author may appeal within 10 business days</li>
                  <li>If upheld: article not published</li>
                  <li>If overturned: independent second opinion assigned</li>
                </ul>
              </div>
            </div>
            <div className="phase-steps">
              <div className="ps">
                <div className="ps-hd">
                  <div className="ps-num ps-amber">9</div>
                  <h4>✅ Fact-Check Verification</h4>
                </div>
                <div className="ps-body">
                  Independent fact-checker (separate from reviewer) verifies all numerical statistics and percentages,
                  drug names and doses, source accessibility and correct referencing, no retracted studies in reference
                  list, and all diagnostic criteria match current classification systems.
                </div>
              </div>
              <div className="ps">
                <div className="ps-hd">
                  <div className="ps-num ps-amber">10</div>
                  <h4>📌 Final Editorial Sign-Off</h4>
                </div>
                <div className="ps-body">
                  Senior Editor confirms medical reviewer approval is documented, fact-check is complete, reviewer
                  credit and review date are added, all metadata is correct, and article is cleared for publication.
                </div>
              </div>
            </div>

            <div className="box box-p" style={{ marginBottom: 6 }}>
              <div className="bh">🟣 Phase 4 — Publication & Beyond</div>
            </div>
            <div className="phase-steps">
              <div className="ps">
                <div className="ps-hd">
                  <div className="ps-num ps-purple">11</div>
                  <h4>🚀 Publication with Full Transparency</h4>
                </div>
                <div className="ps-body">
                  Article published with author byline and credentials, medical reviewer credit with review date,
                  publication date, all citations and references, medical disclaimer, and conflict of interest
                  disclosures — all visible to readers.
                </div>
              </div>
              <div className="ps">
                <div className="ps-hd">
                  <div className="ps-num ps-purple">12</div>
                  <h4>🔄 Post-Publication Monitoring</h4>
                </div>
                <div className="ps-body">
                  Article entered into content review calendar. Monitored for new clinical guidelines, drug safety
                  updates, new high-quality research, reader feedback, and reviewer-initiated alerts when significant
                  new evidence emerges.
                </div>
              </div>
            </div>
          </div>

          <div className="sec" id="s5">
            <div className="stitle">
              <div className="snum g">5</div>What Reviewers Evaluate
            </div>
            <div className="table-scroll">
              <table className="check-table">
                <thead>
                  <tr>
                    <th>Review Area</th>
                    <th>What Is Checked</th>
                  </tr>
                </thead>
                <tbody>
                  {CHECKLIST_ROWS.map(([area, checked]) => (
                    <tr key={area}>
                      <td>{area}</td>
                      <td>{checked}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="sec" id="s6">
            <div className="stitle">
              <div className="snum">6</div>Specialty-Specific Review Standards
            </div>
            {SPECIALTY_ACCORDIONS.map((acc) => (
              <Accordion
                key={acc.id}
                id={acc.id}
                title={acc.title}
                open={!!accordions[acc.id]}
                onToggle={toggleAcc}
              >
                <ul>
                  {acc.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Accordion>
            ))}
          </div>

          <div className="sec" id="s7">
            <div className="stitle">
              <div className="snum t">7</div>Evidence & Source Standards
            </div>
            <div className="prose">
              <p>
                We follow a strict evidence hierarchy when evaluating sources. All clinical claims must be supported
                by the highest available tier of evidence.
              </p>
            </div>
            <div className="pyramid">
              <div className="pyr-tier pt1" style={{ marginLeft: "15%", marginRight: "15%" }}>
                <div>
                  <h4>🥇 Systematic Reviews & Meta-Analyses</h4>
                  <span>Highest Quality — Required for all clinical claims</span>
                </div>
              </div>
              <div className="pyr-tier pt2" style={{ marginLeft: "10%", marginRight: "10%" }}>
                <div>
                  <h4>🥈 Randomised Controlled Trials (RCTs)</h4>
                  <span>Gold standard for treatment efficacy</span>
                </div>
              </div>
              <div className="pyr-tier pt3" style={{ marginLeft: "5%", marginRight: "5%" }}>
                <div>
                  <h4>🥉 Cohort & Case-Control Studies</h4>
                  <span>Accepted with Tier 1 support</span>
                </div>
              </div>
              <div className="pyr-tier pt4">
                <div>
                  <h4>📋 Expert Consensus & Clinical Guidelines</h4>
                  <span>WHO, CDC, NHS, AHA, ADA, ESC, NICE, and equivalents</span>
                </div>
              </div>
              <div className="pyr-tier pt5">
                <div>
                  <h4>📄 Case Reports & Expert Opinion</h4>
                  <span>Supporting evidence only — never standalone for clinical claims</span>
                </div>
              </div>
            </div>
            <div className="box box-g">
              <div className="bh">✅ Source Requirements</div>
              <ul>
                <li>
                  Minimum <strong>5 peer-reviewed sources</strong> per clinical article
                </li>
                <li>
                  Minimum <strong>8 peer-reviewed sources</strong> per professional reference article
                </li>
                <li>
                  Minimum <strong>3 peer-reviewed sources</strong> per wellness or general health article
                </li>
                <li>
                  Maximum source age: <strong>10 years</strong> (landmark studies excepted)
                </li>
                <li>
                  Preferred source age: within <strong>5 years</strong>
                </li>
                <li>All sources linked to PubMed DOI or official guideline URL</li>
              </ul>
            </div>
            <div className="box box-r">
              <div className="bh">❌ NOT Accepted as Sources</div>
              <ul>
                <li>Wikipedia or user-edited content</li>
                <li>Non-peer-reviewed health blogs or websites</li>
                <li>Pharmaceutical promotional materials</li>
                <li>Unverified preprints (labelled &quot;emerging research&quot; only if referenced)</li>
                <li>Retracted studies</li>
                <li>AI-generated content presented as research evidence</li>
              </ul>
            </div>
          </div>

          <div className="sec" id="s8">
            <div className="stitle">
              <div className="snum g">8</div>Review Badges — What They Mean
            </div>
            <div className="prose">
              <p>
                Every article on DrInsight displays a review badge that indicates its current review status. Here is
                what each badge means.
              </p>
            </div>
            <div className="badge-showcase">
              <div className="rbadge rb-g">
                <div className="rb-hd">✅ Medically Reviewed</div>
                <div className="rb-row">
                  <span>Reviewed By</span>
                  <span>Dr. Sarah Mitchell, FCPS</span>
                </div>
                <div className="rb-row">
                  <span>Specialty</span>
                  <span>Cardiology</span>
                </div>
                <div className="rb-row">
                  <span>Review Date</span>
                  <span>June 1, 2026</span>
                </div>
                <div className="rb-row">
                  <span>Next Review</span>
                  <span>June 2027</span>
                </div>
                <p style={{ fontSize: ".72rem", color: "#065f46", marginTop: 8, lineHeight: 1.5 }}>
                  Displayed on every reviewed article. Confirms full review by a qualified specialist. Links to
                  reviewer&apos;s full bio page.
                </p>
              </div>
              <div className="rbadge rb-a">
                <div className="rb-hd">🔄 Currently Under Review</div>
                <div className="rb-row">
                  <span>Last Reviewed</span>
                  <span>June 2025</span>
                </div>
                <div className="rb-row">
                  <span>Update Expected</span>
                  <span>August 2026</span>
                </div>
                <p style={{ fontSize: ".72rem", color: "#78350f", marginTop: 8, lineHeight: 1.5 }}>
                  Displayed when scheduled re-review is in progress. Shows previous review date so readers can assess
                  currency of information.
                </p>
              </div>
              <div className="rbadge rb-y">
                <div className="rb-hd">⚠️ Review Due</div>
                <div className="rb-row">
                  <span>Last Reviewed</span>
                  <span>May 2025</span>
                </div>
                <div className="rb-row">
                  <span>Status</span>
                  <span>Overdue for review</span>
                </div>
                <p style={{ fontSize: ".72rem", color: "#713f12", marginTop: 8, lineHeight: 1.5 }}>
                  Displayed when content has passed its scheduled review date. Encourages readers to cross-reference
                  with current guidelines. Triggers priority review assignment.
                </p>
              </div>
              <div className="rbadge rb-p">
                <div className="rb-hd">🔬 Expert Reviewed</div>
                <div className="rb-row">
                  <span>Reviewed By</span>
                  <span>Prof. James Okafor, FRCP</span>
                </div>
                <div className="rb-row">
                  <span>Subspecialty</span>
                  <span>Interventional Cardiology</span>
                </div>
                <div className="rb-row">
                  <span>Review Date</span>
                  <span>June 1, 2026</span>
                </div>
                <p style={{ fontSize: ".72rem", color: "#4c1d95", marginTop: 8, lineHeight: 1.5 }}>
                  Displayed on professional-level clinical reference articles. Indicates subspecialty-level review.
                  Highest tier of review credibility on the platform.
                </p>
              </div>
              <div className="rbadge rb-c">
                <div className="rb-hd">📝 Correction Notice</div>
                <div className="rb-row">
                  <span>Updated</span>
                  <span>March 15, 2026</span>
                </div>
                <div className="rb-row">
                  <span>Reason</span>
                  <span>Dosing range corrected</span>
                </div>
                <div className="rb-row">
                  <span>Basis</span>
                  <span>Updated WHO guidelines</span>
                </div>
                <p style={{ fontSize: ".72rem", color: "#7f1d1d", marginTop: 8, lineHeight: 1.5 }}>
                  Displayed transparently on corrected articles. Shows what was corrected and why. Full correction log
                  maintained in article footer.
                </p>
              </div>
            </div>
          </div>

          <div className="sec" id="s9">
            <div className="stitle">
              <div className="snum">9</div>Content Currency & Re-Review Schedule
            </div>
            <div className="table-scroll">
              <table className="rev-table">
                <thead>
                  <tr>
                    <th>Content Type</th>
                    <th>Standard Review Cycle</th>
                    <th>Triggered Early If</th>
                  </tr>
                </thead>
                <tbody>
                  {REVIEW_SCHEDULE.map(([type, cycle, trigger]) => (
                    <tr key={type}>
                      <td>{type}</td>
                      <td>{cycle}</td>
                      <td>{trigger}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="box box-b">
              <div className="bh">🔄 Re-Review Workflow</div>
              <ul>
                <li>Editorial calendar tracks all review due dates across the entire content library</li>
                <li>
                  Managing Editor assigns re-review <strong>30 days before due date</strong>
                </li>
                <li>Same reviewer invited to re-review where possible for continuity</li>
                <li>If original reviewer unavailable, new Tier 1 reviewer assigned</li>
                <li>Re-review follows identical process to initial review</li>
                <li>Updated review date and reviewer credit added on approval</li>
              </ul>
            </div>
          </div>

          <div className="sec" id="s10">
            <div className="stitle">
              <div className="snum r">10</div>When Content Fails Review
            </div>
            <div className="fail-grid">
              <div className="fail-card fa">
                <div className="fh">🟡 Scenario A — Minor Issues</div>
                <ul>
                  <li>Reviewer requests specific factual corrections or source updates</li>
                  <li>Author revises within 5 business days</li>
                  <li>Re-review by same reviewer</li>
                  <li>Article not published until corrections confirmed</li>
                  <li>If already published: correction applied within 48 hours, correction notice added</li>
                </ul>
              </div>
              <div className="fail-card fb_">
                <div className="fh">🔴 Scenario B — Significant Clinical Errors</div>
                <ul>
                  <li>Multiple inaccuracies or significant omissions identified</li>
                  <li>Article returned to author for substantial revision</li>
                  <li>Editorial Board notified immediately</li>
                  <li>If published: article temporarily unpublished pending correction</li>
                  <li>⚠️ Amber banner displayed at original URL during review</li>
                  <li>Revised article requires full re-review before republication</li>
                </ul>
              </div>
              <div className="fail-card fc_">
                <div className="fh">🚨 Scenario C — Fundamentally Unsafe Content</div>
                <ul>
                  <li>Content that could directly harm readers — immediately unpublished</li>
                  <li>Editorial Board emergency meeting convened</li>
                  <li>Author formally notified with full explanation</li>
                  <li>Retraction notice published at original URL permanently</li>
                  <li>Reason for retraction stated transparently</li>
                  <li>Registered users who bookmarked the article notified by email</li>
                  <li>Author&apos;s publishing privileges reviewed</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="sec" id="s11">
            <div className="stitle">
              <div className="snum t">11</div>Post-Publication Monitoring
            </div>
            <div className="box box-b">
              <div className="bh">📊 Ongoing Monitoring Systems</div>
              <ul>
                <li>
                  <strong>Content Review Calendar</strong> — Every article tracked with next review due date
                </li>
                <li>
                  <strong>Guidelines Alert System</strong> — Editorial team subscribed to alerts from WHO, CDC, NHS,
                  AHA, ESC, ADA, AAP, NICE, SIGN, and 40+ major medical societies
                </li>
                <li>
                  <strong>PubMed Alerts</strong> — New publication alerts by specialty keyword
                </li>
                <li>
                  <strong>Drug Safety Alerts</strong> — FDA and MHRA drug safety communications and recall
                  notifications
                </li>
              </ul>
            </div>
            <div className="box box-g">
              <div className="bh">👥 Reader Feedback Monitoring</div>
              <ul>
                <li>👍/👎 ratings reviewed weekly by editorial team</li>
                <li>
                  &quot;Report an error&quot; submissions reviewed within <strong>5 business days</strong>
                </li>
                <li>
                  Comments reviewed daily — clinical concerns escalated to reviewer within <strong>24 hours</strong>
                </li>
                <li>
                  All external reports acknowledged within <strong>2 business days</strong>
                </li>
              </ul>
            </div>
            <div className="box box-a">
              <div className="bh">🔬 Reviewer Network Alerts</div>
              <ul>
                <li>
                  Reviewers are encouraged to proactively flag articles they have reviewed when significant new
                  evidence emerges
                </li>
                <li>
                  Reviewer-initiated urgent reviews processed within <strong>48 hours</strong>
                </li>
                <li>Annual reviewer survey to identify content areas requiring priority re-review</li>
              </ul>
            </div>
          </div>

          <div className="sec" id="s12">
            <div className="stitle">
              <div className="snum r">12</div>Corrections & Retractions
            </div>
            <div className="table-scroll">
              <table className="rev-table">
                <thead>
                  <tr>
                    <th>Correction Type</th>
                    <th>Response Time</th>
                    <th>Public Notice</th>
                  </tr>
                </thead>
                <tbody>
                  {CORRECTIONS_TABLE.map(([type, time, notice]) => (
                    <tr key={type}>
                      <td>{type}</td>
                      <td>{time}</td>
                      <td>{notice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="box box-g">
              <div className="bh">✅ Correction Transparency Commitments</div>
              <ul>
                <li>All corrections logged permanently in article footer</li>
                <li>Correction notices never silently removed</li>
                <li>Retraction notices remain permanently at original URL</li>
                <li>Annual corrections report published publicly by Editorial Board</li>
                <li>
                  📧 To report a correction:{" "}
                  <a href={`mailto:${CONTACT_EMAILS.corrections}`} className="inline-link">
                    {CONTACT_EMAILS.corrections}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="sec" id="s13">
            <div className="stitle">
              <div className="snum">13</div>Reviewer Independence & Conflict of Interest
            </div>
            <div className="box box-b">
              <div className="bh">⚖️ Independence Requirements</div>
              <ul>
                <li>Reviewer must be institutionally independent of the article&apos;s author</li>
                <li>Reviewer must have no personal or financial relationship with the article&apos;s author</li>
                <li>
                  Reviewer must have no commercial relationship with the article&apos;s subject matter that is
                  undisclosed
                </li>
              </ul>
            </div>
            <div className="box box-a">
              <div className="bh">💰 Conflict of Interest Declaration Covers</div>
              <ul>
                <li>Financial relationships with pharmaceutical or device companies</li>
                <li>Funded research related to article topic</li>
                <li>Speaker fees or honoraria from companies related to article topic</li>
                <li>Stock ownership in relevant healthcare companies</li>
                <li>Employment or consultancy relationships</li>
                <li>Personal relationships with article author</li>
              </ul>
            </div>
            <div className="box box-gray">
              <div className="bh">📋 COI Management Protocol</div>
              <ul>
                <li>
                  <strong>Minor disclosed COI:</strong> Reviewer proceeds with disclosure published on article
                </li>
                <li>
                  <strong>Moderate COI:</strong> Second independent reviewer assigned for additional oversight
                </li>
                <li>
                  <strong>Significant COI:</strong> Reviewer recused; new reviewer assigned
                </li>
                <li>All COI disclosures published on every reviewed article AND on reviewer bio page</li>
                <li>COI disclosures updated annually by all reviewers</li>
              </ul>
            </div>
            <div className="box box-a">
              <div className="bh">⚠️ AI-Generated Content — Reviewer Alert</div>
              <ul>
                <li>
                  Reviewers must <strong>flag any article</strong> that appears to be primarily AI-generated without
                  author disclosure
                </li>
                <li>
                  AI-assisted content that has <strong>not been substantially rewritten</strong> by the human author
                  should be <strong>rejected outright</strong>
                </li>
                <li>
                  If AI use is disclosed by the author, reviewers must apply <strong>extra scrutiny</strong> to
                  factual accuracy and source verification
                </li>
                <li>
                  Reviewers may <strong>not use AI tools</strong> to write or conduct their review — the review must
                  reflect the reviewer&apos;s own independent clinical judgment
                </li>
              </ul>
            </div>
          </div>

          <div className="sec" id="s14">
            <div className="stitle">
              <div className="snum g">14</div>Meet Our Review Team
            </div>
            <div className="box box-b" style={{ marginBottom: 14 }}>
              <div className="bh">👨‍⚕️ Verified Medical Reviewers</div>
              <p>
                Currently <strong>47 verified medical reviewers</strong> across <strong>12 specialties</strong> —
                independently verified by our editorial team before every engagement.
              </p>
            </div>
            <div className="rv-filter">
              {REVIEWER_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className={`rf${reviewerFilter === f.key ? " on" : ""}`}
                  onClick={() => setReviewerFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="rv-grid">
              {filteredReviewers.map((rv) => (
                <div key={rv.name} className="rv-card" data-spec={rv.spec}>
                  <div className="rv-av" style={{ background: rv.bg }}>
                    {rv.initials}
                  </div>
                  <div className="rv-body">
                    <div className="rv-name">{rv.name}</div>
                    <div className="rv-cred">{rv.cred}</div>
                    {rv.inst.map((line) => (
                      <div key={line} className="rv-inst">
                        {line}
                      </div>
                    ))}
                    <div className="rv-spec">{rv.specText}</div>
                    <div className="rv-stats">
                      <div className="rv-stat">
                        <strong>{rv.reviewed}</strong>
                        <span>Articles Reviewed</span>
                      </div>
                      <div className="rv-stat">
                        <strong>{rv.since}</strong>
                        <span>Reviewer Since</span>
                      </div>
                    </div>
                    <Link href="/our-doctors" className="rv-btn">
                      View Full Profile →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sec" id="s15">
            <div className="stitle">
              <div className="snum p">15</div>Become a Medical Reviewer
            </div>
            <div className="apply-card">
              <h3>✍️ Join Our Medical Review Network</h3>
              <p>
                We are looking for specialist physicians, allied health professionals, and clinical academics who are
                passionate about combating medical misinformation and contributing to public health education.
              </p>
              <div className="apply-benefits">
                {APPLY_BENEFITS.map((benefit) => (
                  <div key={benefit} className="ab">
                    {benefit}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: ".82rem", fontWeight: 700, opacity: 0.9, marginBottom: 8 }}>
                📋 Application Process
              </div>
              <div className="apply-steps">
                {APPLY_STEPS.map((step, i) => (
                  <div key={step} className="as-item">
                    <div className="as-num">{i + 1}</div>
                    {step}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: ".78rem", opacity: 0.75, marginBottom: 14 }}>
                ⏱️ Time commitment: Minimum 4 reviews per year · Each review typically takes 1–3 hours
              </div>
              <div className="apply-btns">
                <Link href="/contact" className="app-btn-w">
                  Apply to Become a Reviewer →
                </Link>
                <a href={`mailto:${CONTACT_EMAILS.reviewers}`} className="app-btn-o">
                  📧 {CONTACT_EMAILS.reviewers}
                </a>
              </div>
            </div>
          </div>

          <div className="sec" id="s16">
            <div className="stitle">
              <div className="snum">16</div>Contact the Review Team
            </div>
            <div className="contact-grid">
              <div className="cc">
                <h4>🔬 Medical Review Inquiries</h4>
                <a href={`mailto:${CONTACT_EMAILS.review}`}>{CONTACT_EMAILS.review}</a>
                <p>General review process questions</p>
              </div>
              <div className="cc">
                <h4>📝 Report a Clinical Inaccuracy</h4>
                <a href={`mailto:${CONTACT_EMAILS.corrections}`}>{CONTACT_EMAILS.corrections}</a>
                <p>Reviewed within 5 business days</p>
              </div>
              <div className="cc">
                <h4>✍️ Reviewer Applications</h4>
                <a href={`mailto:${CONTACT_EMAILS.reviewers}`}>{CONTACT_EMAILS.reviewers}</a>
                <p>Apply to join the reviewer network</p>
              </div>
              <div className="cc">
                <h4>📖 Editorial Board</h4>
                <a href={`mailto:${CONTACT_EMAILS.editorial}`}>{CONTACT_EMAILS.editorial}</a>
                <p>Senior editorial inquiries</p>
              </div>
              <div className="cc urgent">
                <h4>🚨 Urgent Safety Concern</h4>
                <a href={`mailto:${CONTACT_EMAILS.urgent}`}>{CONTACT_EMAILS.urgent}</a>
                <p>Content posing immediate risk · Response within 4 hours during business hours</p>
              </div>
              <div className="cc">
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
            <div className="box box-b">
              <div className="bh">⏱️ Response Time Commitments</div>
              <ul>
                <li>
                  General review inquiries: within <strong>5–7 business days</strong>
                </li>
                <li>
                  Correction reports: acknowledged within <strong>48 hours</strong>, resolved within{" "}
                  <strong>5 business days</strong>
                </li>
                <li>
                  Urgent safety concerns: response within <strong>4 hours</strong> during business hours
                </li>
                <li>
                  Reviewer applications: initial response within <strong>5 business days</strong>
                </li>
                <li>
                  Writing for DrInsight? Read the{" "}
                  <Link href="/author-guidelines" className="inline-link">
                    Author Guidelines
                  </Link>{" "}
                  before submitting
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="pfoot">
        <div className="pf-in">
          <div className="pill-links">
            <Link href="/editorial-policy" className="plink">
              Editorial Policy
            </Link>
            <Link href="/privacy-policy" className="plink">
              Privacy Policy
            </Link>
            <Link href="/terms-conditions" className="plink">
              Terms & Conditions
            </Link>
            <Link href="/disclaimer" className="plink">
              Disclaimer
            </Link>
            <Link href="/cookie-policy" className="plink">
              Cookie Policy
            </Link>
            <Link href="/author-guidelines" className="plink">
              Author Guidelines
            </Link>
            <Link href="/contact" className="plink">
              Contact
            </Link>
            <Link href="/our-doctors" className="plink">
              Our Doctors
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
