"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { DEFAULT_LINKS, PolicyFooterLinks } from "@/components/legal/PolicyFooterLinks";
import { SectionTitle } from "@/components/public/section-heading";
import { usePolicyPageScroll } from "@/hooks/usePolicyPageScroll";
import "@/styles/disclaimer-page.css";

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
  "s19",
  "s20",
] as const;

const TOC_ITEMS = [
  { id: "s1", num: 1, label: "No Doctor-Patient Relationship" },
  { id: "s2", num: 2, label: "Not a Substitute for Advice" },
  { id: "s3", num: 3, label: "Medical Emergency Disclaimer" },
  { id: "s4", num: 4, label: "Accuracy & Completeness" },
  { id: "s5", num: 5, label: "Information Currency" },
  { id: "s6", num: 6, label: "Drug & Medication Disclaimer" },
  { id: "s7", num: 7, label: "Specialty Disclaimers" },
  { id: "s8", num: 8, label: "Diagnostic Tools" },
  { id: "s9", num: 9, label: "Mental Health Content" },
  { id: "s10", num: 10, label: "Pediatric Content" },
  { id: "s11", num: 11, label: "Surgical Content" },
  { id: "s12", num: 12, label: "Research & Clinical Trials" },
  { id: "s13", num: 13, label: "Author & Reviewer" },
  { id: "s14", num: 14, label: "External Links" },
  { id: "s15", num: 15, label: "Affiliate & Sponsored" },
  { id: "s16", num: 16, label: "Geographic Disclaimer" },
  { id: "s17", num: 17, label: "Images & Media" },
  { id: "s18", num: 18, label: "Limitation of Liability" },
  { id: "s19", num: 19, label: "User Responsibility" },
  { id: "s20", num: 20, label: "Contact & Corrections" },
] as const;

const SPECIALTY_ACCORDIONS = [
  {
    title: "🧠 Neurology & Psychiatry",
    body: (
      <>
        Content covering neurological and psychiatric conditions is particularly sensitive. Symptom descriptions are
        general and overlap significantly between conditions. Psychiatric medication adjustments must only be made under
        direct physician supervision.{" "}
        <strong>
          Never stop antidepressants, antipsychotics, or antiepileptics abruptly based on any article.
        </strong>
      </>
    ),
  },
  {
    title: "❤️ Cardiology & Cardiovascular Medicine",
    body: "Cardiac symptoms such as chest pain, palpitations, and shortness of breath require immediate in-person evaluation. No online content can replicate an ECG, echocardiogram, or physical cardiac examination. Dosing of anticoagulants, antiarrhythmics, and cardiac medications is highly individualised.",
  },
  {
    title: "🫁 Pulmonology & Respiratory Medicine",
    body: "Respiratory symptoms — including breathlessness, chronic cough, and wheezing — have a wide differential diagnosis that requires clinical examination and investigations. Inhaler technique, dosing, and step-up/step-down therapy must be managed by a treating physician.",
  },
  {
    title: "🧒 Pediatrics",
    body: "Pediatric dosing is weight-based and age-specific. Content relating to children must never be applied without consulting a pediatrician. Normal developmental milestones and clinical thresholds differ significantly from adult medicine. In pediatric emergencies, call emergency services immediately.",
  },
  {
    title: "🔪 Surgical Specialties",
    body: "Articles describing surgical procedures are educational only. Surgical indications, contraindications, risks, and outcomes vary greatly between patients and institutions. No surgical decision should be made based on platform content alone. All surgical decisions must be made in consultation with a qualified, licensed surgeon.",
  },
  {
    title: "🧬 Oncology",
    body: "Cancer treatment is highly individualised based on tumour type, stage, molecular markers, and patient performance status. Treatment protocols referenced may not reflect current institutional or national guidelines. Always consult a multidisciplinary oncology team. Clinical trial references are clearly labelled as experimental.",
  },
  {
    title: "🧪 Diagnostic & Laboratory Medicine",
    body: "Reference ranges for laboratory values vary between laboratories, patient populations, and testing methodologies. Values presented are general guides only and must be interpreted in clinical context by a qualified physician. Radiological findings are described educationally — not diagnostically.",
  },
  {
    title: "🩸 Diabetes & Endocrinology",
    body: "Insulin dosing, oral hypoglycaemic agents, and thyroid medication are highly individualised. Blood glucose targets and HbA1c goals vary by patient age, comorbidities, and hypoglycaemia risk. Drug monitoring parameters mentioned are general — consult a specialist endocrinologist for personalised management.",
  },
] as const;

const PLAIN_LIST_ITEMS = [
  { icon: "📖", text: "We publish health information — not personalised medical advice" },
  { icon: "🩺", text: "Our content does not create a doctor-patient relationship of any kind" },
  { icon: "⚠️", text: "Information may not apply to your specific medical situation" },
  { icon: "✅", text: "Always consult a real, licensed doctor before making health decisions" },
  { icon: "⚖️", text: "We are not responsible for how you use our content" },
  { icon: "🔗", text: "External links are provided for reference only — not as endorsement" },
  {
    icon: "💊",
    text: "Drug and treatment information may vary by country and may change over time",
  },
] as const;

const FOOTER_LINKS = DEFAULT_LINKS.filter((link) => link.href !== "/disclaimer");

export default function DisclaimerPageClient() {
  const { progress, activeSection, scrollToSection, scrollToTop } = usePolicyPageScroll([...SECTION_IDS]);
  const [fontSize, setFontSize] = useState(14);
  const [openAccords, setOpenAccords] = useState<Set<number>>(() => new Set([0]));

  const changeFontSize = useCallback((dir: -1 | 0 | 1) => {
    if (dir === 0) {
      setFontSize(14);
      return;
    }
    setFontSize((prev) => Math.min(20, Math.max(12, prev + dir)));
  }, []);

  const toggleAccord = useCallback((index: number) => {
    setOpenAccords((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="disclaimer-page">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="critical-banner">
        <div className="cb-inner">
          <SectionTitle inverse>🚨 IMPORTANT MEDICAL NOTICE</SectionTitle>
          <p>
            The content published on DrInsight is intended for general informational and educational purposes only.
            It is <strong>not a substitute</strong> for professional medical advice, diagnosis, or treatment. Always
            seek the advice of a qualified healthcare provider regarding any medical condition. Never disregard
            professional medical advice or delay seeking it because of something you have read on this platform.
          </p>
          <div className="emg-numbers">
            <div className="emg-num">
              🇵🇰 Pakistan: <strong>115</strong>
            </div>
            <div className="emg-num">
              🇺🇸 USA: <strong>911</strong>
            </div>
            <div className="emg-num">
              🇬🇧 UK: <strong>999</strong>
            </div>
            <div className="emg-num">
              🇪🇺 EU: <strong>112</strong>
            </div>
            <div className="emg-num">
              🇦🇺 Australia: <strong>000</strong>
            </div>
            <div className="emg-num">
              🌍 International: <strong>112</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="page-hero">
        <div className="hero-inner">
          <h1>⚖️ Disclaimer</h1>
          <p>
            &quot;Important information about the nature, limitations, and intended use of content published on this
            platform.&quot;
          </p>
          <div className="hero-meta">
            <span>📅 Effective: January 1, 2025</span>
            <span>🔄 Last Updated: June 1, 2026</span>
          </div>
          <div className="hero-actions">
            <button type="button" className="hero-btn primary" onClick={handlePrint}>
              🖨️ Print Disclaimer
            </button>
            <button type="button" className="hero-btn">
              ⬇️ Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="font-controls">
        <div className="fc-inner">
          <span className="fc-label">Text Size:</span>
          <button type="button" className="fc-btn" onClick={() => changeFontSize(-1)}>
            A−
          </button>
          <button type="button" className="fc-btn" onClick={() => changeFontSize(0)}>
            A
          </button>
          <button type="button" className="fc-btn" onClick={() => changeFontSize(1)}>
            A+
          </button>
          <span style={{ fontSize: ".72rem", color: "var(--gray-400)", marginLeft: "8px" }}>
            🔒 HIPAA · GDPR Compliant · Version 2.1
          </span>
        </div>
      </div>

      <div className="plain-wrap">
        <div className="plain-box">
          <h3>📋 In Simple Terms — What This Disclaimer Covers</h3>
          <ul className="plain-list">
            {PLAIN_LIST_ITEMS.map((item) => (
              <li key={item.text}>
                <span>{item.icon}</span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="main-wrap" id="main-content">
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

        <div id="content-area" style={{ fontSize: `${fontSize}px` }}>
          <div className="section" id="s1">
            <div className="sec-title">
              <div className="sec-num">1</div>No Doctor-Patient Relationship
            </div>
            <div className="callout c-blue">
              <div className="ch">🩺 No Professional-Patient Relationship Is Formed</div>
              <ul>
                <li>
                  Reading, accessing, or interacting with any content on DrInsight does <strong>not</strong> create a
                  doctor-patient, therapist-patient, pharmacist-patient, or any other professional-patient relationship
                </li>
                <li>
                  Submitting a comment, question, or contact form message does <strong>not</strong> constitute a medical
                  consultation
                </li>
                <li>
                  Authors and medical reviewers contribute in an educational capacity only — not as your personal
                  healthcare provider
                </li>
                <li>Their credentials are listed for transparency and credibility purposes only</li>
                <li>
                  Any perceived personal medical advice in content or comments should be disregarded — always consult
                  your own licensed healthcare provider
                </li>
              </ul>
            </div>
          </div>

          <div className="section" id="s2">
            <div className="sec-title">
              <div className="sec-num">2</div>Not a Substitute for Professional Medical Advice
            </div>
            <div className="prose">
              <p>
                All articles, guides, and health content on this platform are written for general educational awareness
                only. Content is <strong>not tailored</strong> to your individual medical history, current medications,
                allergies, comorbidities, genetic factors, or local healthcare protocols.
              </p>
            </div>
            <div className="do-dont">
              <div className="do-card do">
                <h4>✅ You Should ALWAYS</h4>
                <ul>
                  <li>Consult a licensed physician before starting, stopping, or changing any treatment</li>
                  <li>Seek a second opinion for serious diagnoses</li>
                  <li>Follow the advice of your treating healthcare team over anything published here</li>
                  <li>Bring our articles to your doctor for discussion — not as a replacement for their advice</li>
                </ul>
              </div>
              <div className="do-card dont">
                <h4>❌ You Should NEVER</h4>
                <ul>
                  <li>Self-diagnose based on content from this platform</li>
                  <li>Self-medicate based on drug information published here</li>
                  <li>Discontinue prescribed treatment after reading our content</li>
                  <li>Delay seeking emergency care because of content you read here</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="section" id="s3">
            <div className="sec-title">
              <div className="sec-num">3</div>Medical Emergency Disclaimer
            </div>
            <div className="callout c-red">
              <div className="ch">🚨 Emergency Notice — Stop Reading and Call Emergency Services If You Experience</div>
              <ul>
                <li>Chest pain or suspected heart attack</li>
                <li>Difficulty breathing or respiratory distress</li>
                <li>Signs of stroke: facial drooping, arm weakness, speech difficulty (FAST)</li>
                <li>Severe allergic reaction (anaphylaxis)</li>
                <li>Loss of consciousness</li>
                <li>Severe bleeding or trauma</li>
                <li>Suicidal thoughts or self-harm crisis</li>
                <li>Poisoning or overdose</li>
                <li>Seizures</li>
                <li>Any life-threatening condition</li>
              </ul>
            </div>
            <table className="emg-table">
              <thead>
                <tr>
                  <th>Country / Region</th>
                  <th>Emergency Number</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🇵🇰 Pakistan</td>
                  <td>115 (Rescue) · 1122 (Punjab Rescue)</td>
                </tr>
                <tr>
                  <td>🇺🇸 United States</td>
                  <td>911</td>
                </tr>
                <tr>
                  <td>🇬🇧 United Kingdom</td>
                  <td>999</td>
                </tr>
                <tr>
                  <td>🇪🇺 European Union</td>
                  <td>112</td>
                </tr>
                <tr>
                  <td>🇦🇺 Australia</td>
                  <td>000</td>
                </tr>
                <tr>
                  <td>🌍 International (Most Countries)</td>
                  <td>112</td>
                </tr>
              </tbody>
            </table>
            <div className="callout c-purple">
              <div className="ch">🧠 Mental Health Crises</div>
              <p>
                For mental health crises, contact your local suicide prevention hotline, a mental health professional,
                or go to the nearest emergency room immediately. In Pakistan: Umang helpline 0317-4288665. In the US:
                Dial or text 988.
              </p>
            </div>
          </div>

          <div className="section" id="s4">
            <div className="sec-title">
              <div className="sec-num">4</div>Accuracy & Completeness of Information
            </div>
            <div className="prose">
              <p>
                We make every effort to ensure content is accurate, evidence-based, and up to date at the time of
                publication. Content is written by qualified medical professionals and reviewed by specialty-certified
                physicians. However, we cannot guarantee that all information is free from error or omission, that content
                reflects the most current clinical guidelines at all times, or that content is applicable to every
                geographic region or healthcare system.
              </p>
            </div>
            <div className="callout c-gray">
              <div className="ch">📋 Cross-Reference With Primary Sources</div>
              <ul>
                <li>PubMed / MEDLINE (pubmed.ncbi.nlm.nih.gov)</li>
                <li>WHO Guidelines (who.int)</li>
                <li>National medical society publications</li>
                <li>Peer-reviewed journals specific to the specialty</li>
              </ul>
            </div>
            <div className="prose">
              <p>
                Publication date and last review date are displayed on every article —{" "}
                <strong>always check these before relying on any clinical information.</strong>
              </p>
            </div>
          </div>

          <div className="section" id="s5">
            <div className="sec-title">
              <div className="sec-num">5</div>Medical Information Currency & Updates
            </div>
            <div className="callout c-green">
              <div className="ch">✅ Our Commitments</div>
              <ul>
                <li>Displaying a &quot;Last Medically Reviewed&quot; date on every article</li>
                <li>Conducting scheduled content audits every 12 months</li>
                <li>Updating or retiring content that becomes clinically outdated</li>
                <li>Flagging articles under review with an &quot;Under Review&quot; banner</li>
              </ul>
            </div>
            <div className="prose">
              <p>
                Despite these efforts, there may be a gap between current best practices and published content. Users —
                especially healthcare professionals — should <strong>always verify clinical information</strong> against
                current institutional and national guidelines before applying it in practice.
              </p>
              <p>
                To report potentially outdated content: 📧{" "}
                <a href="mailto:editorial@drinsight.org">editorial@drinsight.org</a>
              </p>
            </div>
          </div>

          <div className="section" id="s6">
            <div className="sec-title">
              <div className="sec-num">6</div>Drug, Medication & Treatment Disclaimer
            </div>
            <div className="callout c-amber">
              <div className="ch">💊 Important Notice Regarding Drug & Medication Information</div>
              <ul>
                <li>Drug information published here is for general educational purposes only</li>
                <li>We do not recommend specific medications for individual patients</li>
                <li>
                  Drug information may vary by country, approval status, dosing guidelines, drug interactions, and age
                  group
                </li>
                <li>Always consult a licensed pharmacist or prescribing physician before taking any medication</li>
                <li>Do not adjust, stop, or start any medication based on content from this platform</li>
                <li>
                  Dosages mentioned are general reference ranges only — <strong>not prescriptions</strong>
                </li>
                <li>Drug approvals referenced may reflect one country&apos;s standards and may not apply globally</li>
              </ul>
            </div>
          </div>

          <div className="section" id="s7">
            <div className="sec-title">
              <div className="sec-num">7</div>Specialty-Specific Disclaimers
            </div>
            {SPECIALTY_ACCORDIONS.map((accord, index) => (
              <div
                key={accord.title}
                className={`accord${openAccords.has(index) ? " open" : ""}`}
                onClick={() => toggleAccord(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleAccord(index);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="accord-head">
                  <h4>{accord.title}</h4>
                  <div className="accord-chev">▾</div>
                </div>
                <div className="accord-body">
                  <p>{accord.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="section" id="s8">
            <div className="sec-title">
              <div className="sec-num">8</div>Diagnostic Tools & Symptom Checkers
            </div>
            <div className="callout c-gray">
              <div className="ch">📋 Regarding Health Tools, Calculators & Symptom Checkers</div>
              <ul>
                <li>These tools are for general awareness only — not diagnostic instruments</li>
                <li>Results do not constitute a medical diagnosis</li>
                <li>They are not validated for clinical use</li>
                <li>They cannot account for your full medical history, examination, or investigations</li>
                <li>Always consult a physician to interpret results in your clinical context</li>
                <li>
                  Risk scores (CHA₂DS₂-VASc, HEART Score, Wells Criteria) are educational references — clinical
                  application requires full patient assessment by a qualified clinician
                </li>
              </ul>
            </div>
          </div>

          <div className="section" id="s9">
            <div className="sec-title">
              <div className="sec-num">9</div>Mental Health Content Disclaimer
            </div>
            <div className="callout c-purple">
              <div className="ch">🧠 Mental Health — Special Notice</div>
              <ul>
                <li>
                  Mental health content covers depression, anxiety, trauma, psychosis, addiction, eating disorders, and
                  suicide — for awareness and education only
                </li>
                <li>
                  This content is <strong>not</strong> a replacement for professional psychological or psychiatric care
                </li>
                <li>
                  Content discussing suicide, self-harm, and eating disorders follows safe messaging guidelines from
                  recognized mental health organisations
                </li>
              </ul>
            </div>
            <div className="callout c-red">
              <div className="ch">🚨 If You Are in Crisis Right Now</div>
              <ul>
                <li>Tell someone you trust immediately</li>
                <li>Contact a mental health professional or your GP</li>
                <li>
                  Call your local crisis line: US: <strong>988</strong> · Pakistan: <strong>0317-4288665</strong>{" "}
                  (Umang) · UK: <strong>116 123</strong> (Samaritans)
                </li>
                <li>Go to your nearest emergency room</li>
              </ul>
            </div>
          </div>

          <div className="section" id="s10">
            <div className="sec-title">
              <div className="sec-num">10</div>Pediatric Content Disclaimer
            </div>
            <div className="callout c-amber">
              <div className="ch">👶 Important Notice for Parents & Caregivers</div>
              <ul>
                <li>Pediatric content is written for parents, caregivers, and healthcare professionals</li>
                <li>Pediatric dosing is weight-based and age-specific — adult doses are never applicable to children</li>
                <li>
                  Normal physiological parameters, developmental milestones, and disease presentation differ
                  significantly from adult medicine
                </li>
                <li>
                  Content on this platform should <strong>never</strong> be used to self-treat a child
                </li>
                <li>Always consult a board-certified pediatrician for concerns about a child&apos;s health</li>
                <li>
                  In pediatric emergencies, call emergency services immediately — do not consult online resources first
                </li>
              </ul>
            </div>
          </div>

          <div className="section" id="s11">
            <div className="sec-title">
              <div className="sec-num">11</div>Surgical & Procedural Content Disclaimer
            </div>
            <div className="prose">
              <p>
                Descriptions of surgical procedures and medical interventions are provided for patient education and
                general understanding only. Surgical content does <strong>not</strong> serve as surgical consent
                information, replace pre-operative counseling by a surgeon, account for individual surgical risk factors,
                or reflect outcomes at any specific institution.
              </p>
              <p>
                Complication rates, recovery times, and success rates mentioned are general population averages. All
                surgical decisions must be made in consultation with a qualified, licensed surgeon.
              </p>
            </div>
          </div>

          <div className="section" id="s12">
            <div className="sec-title">
              <div className="sec-num">12</div>Research & Clinical Trial Information
            </div>
            <div className="callout c-teal">
              <div className="ch">🔬 Regarding Research Studies & Emerging Therapies</div>
              <ul>
                <li>
                  Articles referencing research studies are intended to inform readers of developments in medical science
                  only
                </li>
                <li>
                  Referenced studies may be preliminary, early-phase, not yet peer-reviewed, not yet approved for clinical
                  use, or conducted on specific populations
                </li>
                <li>
                  Mention of a clinical trial or experimental treatment does <strong>not</strong> constitute endorsement
                  or recommendation
                </li>
                <li>
                  For clinical trial participation information: ClinicalTrials.gov or consult your treating physician
                </li>
              </ul>
            </div>
          </div>

          <div className="section" id="s13">
            <div className="sec-title">
              <div className="sec-num">13</div>Author & Reviewer Disclaimer
            </div>
            <div className="callout c-blue">
              <div className="ch">⚕️ Independent Contributors</div>
              <ul>
                <li>
                  Authors and medical reviewers are independent contributors — their inclusion does not constitute an
                  endorsement of DrInsight by their employing institution or professional society
                </li>
                <li>
                  Authors contribute in their personal professional capacity; views expressed may not represent any
                  medical organisation
                </li>
                <li>
                  Authors and reviewers disclose conflicts of interest — published on each article and author bio page
                </li>
                <li>
                  Medical reviewer approval indicates review at a specific point in time — it does not guarantee perpetual
                  accuracy as medicine evolves
                </li>
              </ul>
            </div>
          </div>

          <div className="section" id="s14">
            <div className="sec-title">
              <div className="sec-num">14</div>External Links Disclaimer
            </div>
            <div className="prose">
              <p>
                This platform contains links to external websites including medical journals, government health agencies
                (WHO, CDC, NHS), academic institutions, and patient advocacy organisations. External links are provided
                for reference and convenience only.
              </p>
            </div>
            <div className="callout c-gray">
              <div className="ch">📋 We Do NOT</div>
              <ul>
                <li>Control the content of external sites</li>
                <li>Endorse external sites or their content</li>
                <li>Guarantee the accuracy of externally linked information</li>
                <li>Accept responsibility for external site privacy practices</li>
                <li>Monitor all external links in real time for changes</li>
              </ul>
            </div>
            <div className="prose">
              <p>
                To report a broken or inappropriate external link: 📧{" "}
                <a href="mailto:editorial@drinsight.org">editorial@drinsight.org</a>
              </p>
            </div>
          </div>

          <div className="section" id="s15">
            <div className="sec-title">
              <div className="sec-num">15</div>Affiliate & Sponsored Content Disclaimer
            </div>
            <div className="callout c-amber">
              <div className="ch">💰 Affiliate & Sponsorship Transparency</div>
              <ul>
                <li>
                  DrInsight may participate in affiliate marketing programs — we may earn a commission if you purchase
                  through an affiliate link, at no additional cost to you
                </li>
                <li>
                  All affiliate relationships are disclosed at the top of relevant articles:{" "}
                  <strong>&quot;This article contains affiliate links&quot;</strong>
                </li>
                <li>
                  Sponsored content is clearly labelled: <strong>Sponsored | Paid Partnership | Advertisement</strong>
                </li>
                <li>
                  Affiliate and sponsorship relationships do <strong>not</strong> influence our editorial content or
                  medical accuracy standards
                </li>
                <li>We do not recommend products or services we do not believe are beneficial and safe</li>
              </ul>
            </div>
          </div>

          <div className="section" id="s16">
            <div className="sec-title">
              <div className="sec-num">16</div>Geographic & Jurisdictional Disclaimer
            </div>
            <div className="prose">
              <p>
                DrInsight is accessible globally but content may primarily reflect international guidelines (WHO,
                international medical societies) and US, UK, and European clinical standards where specified. Drug names,
                availability, dosages, and approval status vary significantly by country.
              </p>
            </div>
            <div className="callout c-blue">
              <div className="ch">⚕️ Readers Outside Primary Regions Should</div>
              <ul>
                <li>Verify drug availability and approved indications in their country</li>
                <li>Consult local clinical guidelines and national formularies</li>
                <li>Seek advice from locally licensed healthcare providers</li>
                <li>Check with their national medicines regulatory authority for drug approval status</li>
              </ul>
            </div>
          </div>

          <div className="section" id="s17">
            <div className="sec-title">
              <div className="sec-num">17</div>Images, Illustrations & Media Disclaimer
            </div>
            <div className="callout c-gray">
              <div className="ch">🖼️ Medical Images & Illustrations</div>
              <ul>
                <li>
                  Medical images, anatomical illustrations, and infographics are used for educational illustration
                  purposes only
                </li>
                <li>
                  They may be simplified representations of complex anatomy, not drawn to scale, or generalised
                  depictions
                </li>
                <li>Licensed stock images are used — not actual patient cases unless explicitly stated</li>
                <li>Any resemblance to real patients in illustrations is entirely coincidental</li>
                <li>
                  Clinical photographs (where used) are published with full informed consent from the depicted individual
                </li>
                <li>Images do not constitute diagnostic reference material for clinical use</li>
              </ul>
            </div>
          </div>

          <div className="section" id="s18">
            <div className="sec-title">
              <div className="sec-num">18</div>Limitation of Liability
            </div>
            <div className="callout c-red">
              <div className="ch">⚖️ Legal Limitation of Liability</div>
              <p>
                To the fullest extent permitted by applicable law, DrInsight and its officers, directors, employees,
                authors, reviewers, and agents shall not be liable for:
              </p>
            </div>
            <div className="liab-list">
              <div className="liab-item">
                <span>⚠️</span>
                <p>Any medical decision made in reliance on platform content</p>
              </div>
              <div className="liab-item">
                <span>🚨</span>
                <p>Any harm, injury, death, or loss resulting from use of this platform</p>
              </div>
              <div className="liab-item">
                <span>❌</span>
                <p>Any inaccuracy, error, or omission in published content</p>
              </div>
              <div className="liab-item">
                <span>⏳</span>
                <p>Any delay in updating outdated medical information</p>
              </div>
              <div className="liab-item">
                <span>📵</span>
                <p>Any action taken or not taken based on platform content</p>
              </div>
              <div className="liab-item">
                <span>💻</span>
                <p>Interruption of service or technical errors affecting access to content</p>
              </div>
            </div>
            <div className="prose">
              <p>
                This limitation applies to all types of claims including negligence, breach of contract, and statutory
                claims. Some jurisdictions do not permit exclusion of certain liabilities — in such cases, liability is
                limited to the maximum extent permitted by local law.
              </p>
            </div>
          </div>

          <div className="section" id="s19">
            <div className="sec-title">
              <div className="sec-num">19</div>User Responsibility
            </div>
            <div className="callout c-green">
              <div className="ch">✅ By Using This Platform, You Acknowledge</div>
              <ul>
                <li>You are responsible for how you use the information provided</li>
                <li>You will consult qualified healthcare professionals before making medical decisions</li>
                <li>You will not use this platform as a substitute for emergency services</li>
                <li>You understand the educational and informational nature of all content</li>
                <li>
                  Healthcare professionals will verify clinical information against current institutional guidelines before
                  applying it in practice
                </li>
                <li>You will report any content you believe to be inaccurate or harmful</li>
              </ul>
            </div>
          </div>

          <div className="section" id="s20">
            <div className="sec-title">
              <div className="sec-num">20</div>Contact & Corrections
            </div>
            <div className="prose">
              <p>
                We take the accuracy of medical content extremely seriously. If you believe any content on this platform
                is medically inaccurate, outdated, missing important safety information, potentially harmful, or in
                violation of safe messaging guidelines — please contact our editorial team immediately.
              </p>
            </div>
            <div className="contact-grid">
              <div className="contact-card">
                <h4>📝 Corrections & Inaccuracies</h4>
                <a href="mailto:corrections@drinsight.org">corrections@drinsight.org</a>
                <p>Reviewed within 5 business days</p>
              </div>
              <div className="contact-card">
                <h4>✍️ General Editorial</h4>
                <a href="mailto:editorial@drinsight.org">editorial@drinsight.org</a>
                <p>All editorial enquiries</p>
              </div>
              <div className="contact-card">
                <h4>🧠 Safe Messaging Concerns</h4>
                <a href="mailto:safemessaging@drinsight.org">safemessaging@drinsight.org</a>
                <p>Mental health content issues</p>
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
            <div className="callout c-blue" style={{ marginTop: "12px" }}>
              <div className="ch">⏱️ Response Commitment</div>
              <p>
                All correction requests are reviewed within <strong>5 business days</strong>. Confirmed inaccuracies are
                corrected and logged in the article&apos;s correction notice. We publish a transparent correction policy —
                corrections are <strong>never</strong> silently edited.
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
            <span style={{ fontSize: ".72rem", color: "var(--gray-400)" }}>Last updated: June 1, 2026</span>
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
