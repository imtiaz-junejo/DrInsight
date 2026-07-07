"use client";

import Link from "next/link";
import { useMemo } from "react";
import "@/styles/about-page.css";
import {
  SectionDescription,
  SectionEyebrow,
  SectionHeading,
  SectionTitle,
} from "@/components/public/section-heading";
import { formatStatCount, getInitials, mapDoctorProfile, specialtyEmoji } from "@/lib/data-mappers";
import { resolvePartnerDisplay } from "@/lib/partner-category";
import { useDoctors, useFounderMessage, usePlatformStats, useRecentReviews, useTrustedPartners } from "@/services/api-hooks";

const BG_CLASSES = ["bg1", "bg2", "bg3", "bg4", "bg5", "bg6"];

const TRUST_CARDS = [
  { icon: "🩺", title: "Board-Certified Physicians", text: "Every doctor on our platform is fully licensed, board-certified, and verified. No exceptions. Patient safety is never compromised." },
  { icon: "🔬", title: "Evidence-Based Content", text: "All articles, tools, and answers are grounded in peer-reviewed research, clinical guidelines, and the latest medical literature." },
  { icon: "🔄", title: "Regularly Updated", text: "Medical knowledge evolves. Our editorial team reviews and updates all content quarterly — or immediately when new guidelines emerge." },
  { icon: "🛡️", title: "HIPAA & GDPR Compliant", text: "Your personal and medical data is protected under the strictest privacy laws. We never sell or share your information with third parties." },
  { icon: "🌐", title: "Globally Accessible", text: "Doctors across multiple specialties serve patients in countries worldwide through our digital health platform." },
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

const ACCREDITATIONS = [
  { icon: "🛡️", label: "HIPAA", sub: "Compliant" },
  { icon: "🇪🇺", label: "GDPR", sub: "Compliant" },
  { icon: "🏥", label: "AMA", sub: "Aligned" },
  { icon: "🌍", label: "WHO", sub: "Guidelines" },
  { icon: "🔒", label: "SSL", sub: "256-bit Encrypted" },
  { icon: "⭐", label: "HONcode", sub: "Certified" },
];

export function AboutPageContent() {
  const { data: stats } = usePlatformStats();
  const { data: doctorsData, isLoading } = useDoctors({ limit: 5 });
  const { data: founderMessage, isLoading: founderLoading } = useFounderMessage();
  const { data: trustedPartners, isLoading: partnersLoading } = useTrustedPartners();
  const { data: reviews } = useRecentReviews(3);

  const heroPills = useMemo(
    () => [
      "🏥 Founded 2018",
      `👨‍⚕️ ${stats ? formatStatCount(stats.doctorCount) : "—"} Doctors`,
      `🌍 ${stats?.specialtyCount ?? "—"} Specialties`,
      stats?.countryCount ? `🗺️ ${stats.countryCount} Countries` : "🛡️ HIPAA Compliant",
    ],
    [stats],
  );

  const testimonials = useMemo(
    () =>
      (reviews ?? []).map((review) => {
        const patientName = review.patient?.user
          ? `${review.patient.user.firstName} ${review.patient.user.lastName}`
          : "Verified Patient";
        const specialty = review.doctor?.specialty ?? "Patient";
        return {
          quote: review.comment ?? "Excellent care and clear medical guidance.",
          initials: getInitials(review.patient?.user?.firstName, review.patient?.user?.lastName) || "VP",
          name: `${patientName} — ${specialty}`,
        };
      }),
    [reviews],
  );

  const founderCredentials = founderMessage?.credentials ?? [];
  const founderTags = founderMessage?.tags ?? [];
  const partners = trustedPartners ?? [];

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
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="eyebrow-hero">Our Story</div>
          <h1>Dedicated to Evidence-Based Medicine & Patient Trust</h1>
          <p>
            DrInsight was founded with a single mission — to make trusted, doctor-verified medical information
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
          <SectionHeading
            className="section-header"
            eyebrow="Purpose & Direction"
            title="Our Mission & Vision"
            description="Every decision we make is guided by our commitment to patient welfare, scientific integrity, and medical excellence."
          />
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

      {founderMessage ? (
        <div className="founder-section">
          <div className="founder-inner">
            <div className="founder-left">
              <div className="founder-avatar-wrap">
                <div className="founder-avatar">
                  {founderMessage.imageUrl ? (
                    <img
                      src={founderMessage.imageUrl}
                      alt={founderMessage.founderName}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                    />
                  ) : (
                    "👨‍⚕️"
                  )}
                </div>
                {founderMessage.badgeText ? <div className="founder-badge">{founderMessage.badgeText}</div> : null}
              </div>
              <div className="founder-name">{founderMessage.founderName}</div>
              <div className="founder-title">{founderMessage.designation}</div>
              {founderMessage.subline ? <div className="founder-sub">{founderMessage.subline}</div> : null}
              <div className="founder-credentials">
                {founderCredentials.length > 0 ? (
                  founderCredentials.map((cred) => (
                    <div key={cred.text} className="cred-item">
                      <span>{cred.icon}</span>
                      {cred.text}
                    </div>
                  ))
                ) : (
                  <div className="cred-item">
                    <span>🩺</span>
                    Credentials coming soon
                  </div>
                )}
              </div>
              {founderTags.length > 0 ? (
                <div className="founder-tags" style={{ marginTop: 16, justifyContent: "center" }}>
                  {founderTags.map((tag) => (
                    <span key={tag} className="founder-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="founder-right">
              <div className="founder-message">
                <SectionEyebrow className="eyebrow">
                  {founderMessage.eyebrow ?? "A Message from Our Founder"}
                </SectionEyebrow>
                <div className="founder-quote-mark">&quot;</div>
                <SectionTitle>{founderMessage.headline}</SectionTitle>
                <div dangerouslySetInnerHTML={{ __html: founderMessage.messageHtml }} />
                {founderMessage.videoUrl ? (
                  <div style={{ marginTop: 20 }}>
                    <a href={founderMessage.videoUrl} target="_blank" rel="noopener noreferrer" className="btn-blue">
                      ▶ Watch Founder Video
                    </a>
                  </div>
                ) : null}
                <div className="founder-signature">
                  {founderMessage.signatureImageUrl ? (
                    <img
                      src={founderMessage.signatureImageUrl}
                      alt="Signature"
                      style={{ height: 48, objectFit: "contain" }}
                    />
                  ) : (
                    <div className="sig-icon">✚</div>
                  )}
                  <div className="sig-text">
                    <strong>{founderMessage.signatureName ?? founderMessage.founderName}</strong>
                    {founderMessage.signatureTitle ? <span>{founderMessage.signatureTitle}</span> : null}
                    {founderMessage.locationLine ? (
                      <span style={{ fontSize: "0.74rem", color: "var(--blue)", marginTop: 2, display: "block" }}>
                        {founderMessage.locationLine}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : founderLoading ? (
        <p style={{ textAlign: "center", color: "var(--gray-500)", padding: "48px 20px" }}>Loading founder message...</p>
      ) : null}

      <section>
        <div className="section-inner">
          <SectionHeading
            className="section-header"
            eyebrow="Our Medical Team"
            title="Meet Our Specialist Doctors"
            description="A diverse team of board-certified physicians, surgeons, and specialists united by a passion for patient-centered care."
          />
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
            <Link href="/our-doctors" className="btn-blue">
              View All {stats ? formatStatCount(stats.doctorCount) : "—"} Doctors →
            </Link>
          </div>
        </div>
      </section>

      <div className="stats-row">
        <div className="stats-inner">
          <div className="stat-item">
            <strong>{stats ? formatStatCount(stats.patientCount) : "—"}</strong>
            <span>Patients Served</span>
            <p>Across {stats?.countryCount ?? "—"} countries</p>
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
          <SectionHeading
            className="section-header"
            eyebrow="Trusted Partners & Affiliates"
            title="Platforms & Resources We Work With"
            description="We collaborate with leading healthcare platforms, research institutions, and technology partners to deliver the highest standard of medical care."
          />
        </div>
        <div className="marquee-track-wrap">
          {partnersLoading ? (
            <p style={{ textAlign: "center", color: "var(--gray-500)" }}>Loading partners...</p>
          ) : partners.length > 0 ? (
            <div className="marquee-track">
              {[...partners, ...partners].map((partner, i) => {
                const { icon, badgeClass, badgeLabel } = resolvePartnerDisplay(partner);
                return (
                <div key={`${partner.id}-${i}`} className="partner-tile">
                  <span className="partner-tile-icon">{icon}</span>
                  <span className="partner-tile-name">{partner.companyName}</span>
                  <span className={`partner-badge ${badgeClass}`}>{badgeLabel}</span>
                </div>
                );
              })}
            </div>
          ) : (
            <p style={{ textAlign: "center", color: "var(--gray-500)" }}>No partners to display yet.</p>
          )}
        </div>
      </section>

      <section>
        <div className="section-inner">
          <SectionHeading
            className="section-header"
            eyebrow="Why Choose Us"
            title="Why Patients Trust DrInsight"
            description="We hold ourselves to the highest standards of medical accuracy, ethics, and patient-centered care."
          />
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
              <SectionEyebrow className="eyebrow">Our Standards</SectionEyebrow>
              <SectionTitle>Editorial Guidelines & Medical Review Process</SectionTitle>
              <SectionDescription align="left">
                Every piece of content on DrInsight passes through a rigorous multi-step medical review process before it
                reaches you. We follow the highest journalistic and clinical standards.
              </SectionDescription>
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
            <div className="editorial-visual border border-gray-400">
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
              <SectionEyebrow className="eyebrow">Patient First</SectionEyebrow>
              <SectionTitle>Our Patient-Centered Approach</SectionTitle>
              <SectionDescription align="left">
                Everything we build, write, and offer is designed around one question:{" "}
                <strong>&quot;Does this truly help the patient?&quot;</strong> We believe that empowered patients make better
                health decisions.
              </SectionDescription>
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
              {testimonials.length > 0 ? (
                testimonials.map((t) => (
                  <div key={t.initials + t.name} className="t-mini">
                    <p>&ldquo;{t.quote}&rdquo;</p>
                    <div className="t-mini-author">
                      <div className="t-avatar">{t.initials}</div>
                      <div>
                        <div className="t-name">{t.name}</div>
                        <div style={{ fontSize: "0.66rem", color: "var(--gray-400)" }}>★★★★★ Verified Patient</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: "var(--gray-500)" }}>No patient reviews yet.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="accred-section">
        <div style={{ maxWidth: 1240, margin: "auto" }}>
          <SectionTitle inverse>Accreditations & Compliance</SectionTitle>
          <SectionDescription inverse>
            Recognized by leading health organizations and compliant with all major medical data privacy regulations worldwide.
          </SectionDescription>
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
        <SectionEyebrow className="eyebrow" light>
          Get Started Today
        </SectionEyebrow>
        <SectionTitle inverse>Ready to Take Control of Your Health?</SectionTitle>
        <SectionDescription inverse>
          Join {stats ? formatStatCount(stats.patientsServed ?? stats.patientCount) : "—"} patients who trust DrInsight for accurate medical information and expert consultations.
        </SectionDescription>
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
