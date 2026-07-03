"use client";

import Link from "next/link";
import { useMemo } from "react";
import "@/styles/about-page.css";
import { formatStatCount, mapDoctorProfile, specialtyEmoji } from "@/lib/data-mappers";
import { useDoctors, usePlatformStats } from "@/services/api-hooks";

const BG_CLASSES = ["bg1", "bg2", "bg3", "bg4", "bg5", "bg6"];

const PARTNERS = [
  { icon: "💊", name: "PharmaCare", badge: "Pharma", badgeClass: "badge-pharma" },
  { icon: "🔬", name: "BioResearch Labs", badge: "Research", badgeClass: "badge-research" },
  { icon: "🩻", name: "DiagnoScan", badge: "Diagnostics", badgeClass: "badge-diagnostics" },
  { icon: "🏥", name: "GlobalHealth Network", badge: "Hospital", badgeClass: "badge-hospital" },
  { icon: "🤖", name: "MedAI Solutions", badge: "Tech", badgeClass: "badge-tech" },
  { icon: "🛡️", name: "HealthShield", badge: "Insurance", badgeClass: "badge-insurance" },
  { icon: "🌿", name: "WellnessFirst", badge: "Wellness", badgeClass: "badge-wellness" },
  { icon: "📡", name: "TelemedConnect", badge: "Tech", badgeClass: "badge-tech" },
  { icon: "🧬", name: "GenomicsCo", badge: "Research", badgeClass: "badge-research" },
  { icon: "❤️", name: "CardioLink", badge: "Hospital", badgeClass: "badge-hospital" },
  { icon: "💉", name: "VaxGlobal", badge: "Pharma", badgeClass: "badge-pharma" },
  { icon: "🧠", name: "NeuroPath", badge: "Diagnostics", badgeClass: "badge-diagnostics" },
];

const TRUST_CARDS = [
  { icon: "🩺", title: "Board-Certified Physicians", text: "Every doctor on our platform is fully licensed, board-certified, and verified. No exceptions. Patient safety is never compromised." },
  { icon: "🔬", title: "Evidence-Based Content", text: "All articles, tools, and answers are grounded in peer-reviewed research, clinical guidelines, and the latest medical literature." },
  { icon: "🔄", title: "Regularly Updated", text: "Medical knowledge evolves. Our editorial team reviews and updates all content quarterly — or immediately when new guidelines emerge." },
  { icon: "🛡️", title: "HIPAA & GDPR Compliant", text: "Your personal and medical data is protected under the strictest privacy laws. We never sell or share your information with third parties." },
  { icon: "🌐", title: "Globally Accessible", text: "Available in 12 languages with doctors across 30+ specialties serving patients in over 50 countries around the world." },
  { icon: "💬", title: "Transparent & Accountable", text: "We clearly disclose our editorial process, funding sources, and medical review policies. No hidden agendas or conflicts of interest." },
];

const EDITORIAL_STEPS = [
  { num: "1", title: "Research & Drafting", text: "Experienced medical writers research the topic using peer-reviewed sources and clinical guidelines only." },
  { num: "2", title: "Specialist Review", text: "A board-certified specialist in the relevant field reviews all clinical claims and recommendations." },
  { num: "3", title: "Editorial Approval", text: "Our senior editor reviews for clarity, tone, and patient-appropriateness before publication." },
  { num: "4", title: "Quarterly Updates", text: "All content is reviewed every 3–6 months and updated when new evidence or guidelines are published." },
];

const GUIDELINES = [
  { icon: "📚", title: "Peer-Reviewed Sources Only", text: "We cite only PubMed, Cochrane, WHO, CDC, and recognized medical journals." },
  { icon: "🚫", title: "No Sponsored Medical Claims", text: "Advertisers never influence our medical content or editorial decisions." },
  { icon: "👁️", title: "Conflict of Interest Disclosure", text: "All authors and reviewers disclose any potential conflicts of interest." },
  { icon: "⚖️", title: "Balanced Perspectives", text: "We present all evidence fairly, including uncertainties and research limitations." },
  { icon: "♿", title: "Plain Language Commitment", text: "Medical information written at a reading level accessible to all patients." },
];

const PATIENT_VALUES = [
  { icon: "🤝", title: "Respect & Dignity", text: "Every patient is treated with empathy and without judgment." },
  { icon: "🔍", title: "Transparency", text: "Clear, honest information with no hidden agendas." },
  { icon: "⚡", title: "Accessibility", text: "24/7 access to tools, articles, and doctor answers." },
  { icon: "🌱", title: "Empowerment", text: "We educate patients to make confident health decisions." },
];

const TESTIMONIALS = [
  {
    quote:
      "For the first time, I felt like I actually understood my diagnosis. Dr. Mitchell explained everything clearly and patiently. Life-changing experience.",
    initials: "MJ",
    name: "Maria J. — Cardiology Patient",
  },
  {
    quote:
      "The health tools helped me catch pre-diabetes early. I'm now managing it with diet alone, thanks to this platform. Truly grateful.",
    initials: "DK",
    name: "David K. — Endocrinology Patient",
  },
  {
    quote:
      "As someone with health anxiety, having access to verified information stopped me from spiraling with Dr. Google. Absolute game changer.",
    initials: "SR",
    name: "Sofia R. — Mental Health Patient",
  },
];

const ACCREDITATIONS = [
  { icon: "🛡️", label: "HIPAA", sub: "Compliant" },
  { icon: "🇪🇺", label: "GDPR", sub: "Compliant" },
  { icon: "🏥", label: "AMA", sub: "Aligned" },
  { icon: "🌍", label: "WHO", sub: "Guidelines" },
  { icon: "🔒", label: "SSL", sub: "256-bit Encrypted" },
  { icon: "⭐", label: "HONcode", sub: "Certified" },
];

const FOUNDER_CREDENTIALS = [
  { icon: "🎓", text: "MBBS, MD — Internal Medicine" },
  { icon: "🏥", text: "20+ Years Clinical Experience" },
  { icon: "📋", text: "Board Certified — AMA & USMLE" },
  { icon: "🔬", text: "Former Chief of Medicine, NYU" },
  { icon: "📚", text: "40+ Peer-Reviewed Publications" },
  { icon: "🌍", text: "WHO Advisory Panel Member" },
];

export function AboutPageContent() {
  const { data: stats } = usePlatformStats();
  const { data: doctorsData, isLoading } = useDoctors({ limit: 4 });

  const heroPills = useMemo(
    () => [
      "🏥 Founded 2018",
      `👨‍⚕️ ${stats ? formatStatCount(stats.doctorCount) : "200+"} Doctors`,
      "🌍 50+ Countries",
      "🛡️ HIPAA Compliant",
    ],
    [stats],
  );

  const doctors = useMemo(() => {
    return (doctorsData?.data ?? []).map((d, i) => {
      const mapped = mapDoctorProfile(d);
      return {
        id: d.id,
        emoji: specialtyEmoji(d.specialty),
        bg: BG_CLASSES[i % BG_CLASSES.length],
        name: mapped.name,
        specialty: d.specialty,
        exp: `${d.experienceYears} years experience`,
        tags: mapped.tags.length > 0 ? mapped.tags : [d.specialty],
        rating: `${d.rating.toFixed(1)} (${d.reviewCount})`,
      };
    });
  }, [doctorsData]);

  return (
    <div className="about-page">
      <div className="breadcrumb">
        <div className="breadcrumb-inner">
          🏠 <Link href="/">Home</Link> › <span>About Us</span>
        </div>
      </div>

      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="eyebrow-hero">Our Story</div>
          <h1>Dedicated to Evidence-Based Medicine & Patient Trust</h1>
          <p>
            MedAuthority was founded with a single mission — to make trusted, doctor-verified medical information
            accessible to everyone, everywhere, at any time.
          </p>
          <div className="hero-pills">
            {heroPills.map((pill) => (
              <div key={pill} className="hero-pill">
                {pill}
              </div>
            ))}
          </div>
        </div>
      </div>

      <section>
        <div className="section-inner">
          <div className="section-header">
            <div className="eyebrow">Purpose & Direction</div>
            <h2>Our Mission & Vision</h2>
            <p>Every decision we make is guided by our commitment to patient welfare, scientific integrity, and medical excellence.</p>
          </div>
          <div className="mv-grid">
            <div className="mv-card mission">
              <div className="mv-card-icon">🎯</div>
              <h3>Our Mission</h3>
              <p>
                To democratize access to accurate, evidence-based medical information by connecting patients with
                board-certified specialists — breaking down barriers of cost, geography, and language. We believe every
                person deserves access to reliable health guidance, regardless of where they live or what they can afford.
              </p>
            </div>
            <div className="mv-card vision">
              <div className="mv-card-icon">🔭</div>
              <h3>Our Vision</h3>
              <p>
                To become the world&apos;s most trusted digital health platform — where patients find clarity, doctors share
                expertise, and communities grow healthier together. We envision a future where preventable diseases are caught
                early, misinformation is eliminated, and every patient feels empowered in their health journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="founder-section">
        <div className="founder-inner">
          <div className="founder-left">
            <div className="founder-avatar-wrap">
              <div className="founder-avatar">👨‍⚕️</div>
              <div className="founder-badge">✓ Verified MD</div>
            </div>
            <div className="founder-name">Dr. Javed Kumbhar</div>
            <div className="founder-title">Founder & Medical Director</div>
            <div className="founder-sub">MedAuthority — Est. 2018</div>
            <div className="founder-credentials">
              {FOUNDER_CREDENTIALS.map((cred) => (
                <div key={cred.text} className="cred-item">
                  <span>{cred.icon}</span>
                  {cred.text}
                </div>
              ))}
            </div>
            <div className="founder-tags" style={{ marginTop: 16, justifyContent: "center" }}>
              {["Internal Medicine", "Preventive Health", "Digital Health", "Medical Education"].map((tag) => (
                <span key={tag} className="founder-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="founder-right">
            <div className="founder-message">
              <div className="eyebrow">A Message from Our Founder</div>
              <div className="founder-quote-mark">&quot;</div>
              <h2>Building a Platform Where Every Patient Deserves the Truth</h2>
              <p>
                When I began my medical career over two decades ago, I was struck by one consistent challenge: patients were
                leaving consultations confused, overwhelmed, or misinformed — not because their doctors lacked expertise, but
                because the healthcare system lacked accessibility and clarity.
              </p>
              <p>
                I founded <strong>MedAuthority</strong> in 2018 with a simple conviction — that{" "}
                <strong>accurate, evidence-based medical information should be a right, not a privilege.</strong> Every person,
                regardless of their location, income, or background, deserves access to the kind of trusted guidance that only a
                good doctor can provide.
              </p>
              <p>
                What started as a small team of passionate physicians has grown into a platform trusted by over{" "}
                <strong>{stats ? formatStatCount(stats.patientCount) : "500,000"} patients across 50 countries.</strong> Our doctors don&apos;t just answer questions — they
                empower patients to make confident, informed decisions about their health. Every article is reviewed. Every tool
                is validated. Every consultation is held to the highest clinical standard.
              </p>
              <p>
                We are not just a website. We are a movement toward a healthier, better-informed world. And we are only just
                beginning.
              </p>
              <div className="founder-signature">
                <div className="sig-icon">✚</div>
                <div className="sig-text">
                  <strong>Dr. Javed Kumbhar</strong>
                  <span>MBBS, MD — Founder & Medical Director, MedAuthority</span>
                  <span style={{ fontSize: "0.74rem", color: "var(--blue)", marginTop: 2, display: "block" }}>
                    📍 New York, USA &nbsp;|&nbsp; 🌐 medauthority.com
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section>
        <div className="section-inner">
          <div className="section-header">
            <div className="eyebrow">Our Medical Team</div>
            <h2>Meet Our Specialist Doctors</h2>
            <p>A diverse team of board-certified physicians, surgeons, and specialists united by a passion for patient-centered care.</p>
          </div>
          {isLoading ? (
            <p style={{ textAlign: "center", color: "var(--gray-500)" }}>Loading doctors...</p>
          ) : doctors.length > 0 ? (
            <div className="doctors-grid">
              {doctors.map((doc) => (
                <div key={doc.id} className="doctor-card">
                  <div className={`doctor-avatar-box ${doc.bg}`}>
                    {doc.emoji}
                    <div className="verified-badge">✓</div>
                  </div>
                  <div className="doctor-info">
                    <h3>{doc.name}</h3>
                    <div className="specialty">{doc.specialty}</div>
                    <div className="exp">{doc.exp}</div>
                    <div className="doctor-tags">
                      {doc.tags.map((tag) => (
                        <span key={tag} className="doctor-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="rating">
                      ★★★★★ <span style={{ color: "var(--gray-600)", fontWeight: 400 }}>{doc.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: "center", color: "var(--gray-500)" }}>No doctors available yet.</p>
          )}
          <div style={{ textAlign: "center", marginTop: 28 }}>
            <Link href="/doctors" className="btn-blue">
              View All {stats ? formatStatCount(stats.doctorCount) : "200+"} Doctors →
            </Link>
          </div>
        </div>
      </section>

      <div className="stats-row">
        <div className="stats-inner">
          <div className="stat-item">
            <strong>{stats ? formatStatCount(stats.patientCount) : "—"}</strong>
            <span>Patients Served</span>
            <p>Across 50+ countries</p>
          </div>
          <div className="stat-item">
            <strong>{stats ? formatStatCount(stats.doctorCount) : "—"}</strong>
            <span>Specialist Doctors</span>
            <p>Board-certified experts</p>
          </div>
          <div className="stat-item">
            <strong>{stats ? formatStatCount(stats.blogCount) : "—"}</strong>
            <span>Medical Articles</span>
            <p>Reviewed & updated regularly</p>
          </div>
          <div className="stat-item">
            <strong>{stats ? `${stats.averageRating.toFixed(1)}★` : "—"}</strong>
            <span>Average Rating</span>
            <p>From verified patients</p>
          </div>
        </div>
      </div>

      <section className="partners-section">
        <div className="section-inner">
          <div className="section-header">
            <div className="eyebrow">Trusted Partners & Affiliates</div>
            <h2>Platforms & Resources We Work With</h2>
            <p>
              We collaborate with leading healthcare platforms, research institutions, and technology partners to deliver the
              highest standard of medical care.
            </p>
          </div>
        </div>
        <div className="marquee-track-wrap">
          <div className="marquee-track">
            {[...PARTNERS, ...PARTNERS].map((partner, i) => (
              <div key={`${partner.name}-${i}`} className="partner-tile">
                <span className="partner-tile-icon">{partner.icon}</span>
                <span className="partner-tile-name">{partner.name}</span>
                <span className={`partner-badge ${partner.badgeClass}`}>{partner.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="section-inner">
          <div className="section-header">
            <div className="eyebrow">Why Choose Us</div>
            <h2>Why Patients Trust MedAuthority</h2>
            <p>We hold ourselves to the highest standards of medical accuracy, ethics, and patient-centered care.</p>
          </div>
          <div className="trust-grid">
            {TRUST_CARDS.map((card) => (
              <div key={card.title} className="trust-card">
                <div className="trust-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-section">
        <div className="section-inner">
          <div className="editorial-inner">
            <div className="editorial-content">
              <div className="eyebrow">Our Standards</div>
              <h2>Editorial Guidelines & Medical Review Process</h2>
              <p>
                Every piece of content on MedAuthority passes through a rigorous multi-step medical review process before it
                reaches you. We follow the highest journalistic and clinical standards.
              </p>
              <p>
                Our editorial team includes medical writers, licensed physicians, and specialty reviewers who collaborate to
                ensure accuracy, clarity, and patient safety.
              </p>
              <div className="process-steps">
                {EDITORIAL_STEPS.map((step) => (
                  <div key={step.num} className="process-step">
                    <div className="step-num">{step.num}</div>
                    <div className="step-text">
                      <h4>{step.title}</h4>
                      <p>{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="editorial-visual">
              <h3>📋 Our Editorial Standards</h3>
              {GUIDELINES.map((item) => (
                <div key={item.title} className="guideline-item">
                  <span>{item.icon}</span>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="patient-section">
        <div className="section-inner">
          <div className="patient-inner">
            <div className="patient-content">
              <div className="eyebrow">Patient First</div>
              <h2>Our Patient-Centered Approach</h2>
              <p>
                Everything we build, write, and offer is designed around one question:{" "}
                <strong>&quot;Does this truly help the patient?&quot;</strong> We believe that empowered patients make better
                health decisions.
              </p>
              <p>
                Our approach combines clinical excellence with compassionate communication — ensuring every patient feels heard,
                respected, and well-informed at every step.
              </p>
              <div className="patient-values">
                {PATIENT_VALUES.map((value) => (
                  <div key={value.title} className="value-item">
                    <div>{value.icon}</div>
                    <h4>{value.title}</h4>
                    <p>{value.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="patient-card">
              <h3>💬 What Patients Say About Us</h3>
              {TESTIMONIALS.map((t) => (
                <div key={t.initials} className="t-mini">
                  <p>&ldquo;{t.quote}&rdquo;</p>
                  <div className="t-mini-author">
                    <div className="t-avatar">{t.initials}</div>
                    <div>
                      <div className="t-name">{t.name}</div>
                      <div style={{ fontSize: "0.66rem", color: "var(--gray-400)" }}>★★★★★ Verified Patient</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="accred-section">
        <div style={{ maxWidth: 1240, margin: "auto" }}>
          <h2>Accreditations & Compliance</h2>
          <p>Recognized by leading health organizations and compliant with all major medical data privacy regulations worldwide.</p>
          <div className="accred-badges">
            {ACCREDITATIONS.map((item) => (
              <div key={item.label} className="accred-badge">
                <div>{item.icon}</div>
                <strong>{item.label}</strong>
                <span>{item.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="about-cta">
        <div className="eyebrow" style={{ color: "#93c5fd" }}>
          Get Started Today
        </div>
        <h2>Ready to Take Control of Your Health?</h2>
        <p>Join {stats ? formatStatCount(stats.patientCount) : "500,000+"} patients who trust MedAuthority for accurate medical information and expert consultations.</p>
        <div className="cta-btns">
          <Link href="/book-consultation" className="btn-primary">
            📅 Book a Consultation
          </Link>
          <Link href="/ask-doctor" className="btn-outline">
            💬 Ask a Doctor Free
          </Link>
        </div>
      </div>
    </div>
  );
}
