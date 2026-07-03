import Link from "next/link";
import type { ReactNode } from "react";

export type FaqItem = { id: string; question: string; answer: ReactNode };
export type FaqSection = { category: string; icon: string; title: string; countLabel: string; items: FaqItem[] };

export const FAQ_CATEGORIES = [
  { id: "all", icon: "📋", label: "All Topics", count: 35 },
  { id: "consultations", icon: "🩺", label: "Consultations", count: 7 },
  { id: "health-tools", icon: "🔬", label: "Health Tools", count: 6 },
  { id: "privacy", icon: "🔒", label: "Privacy & Security", count: 6 },
  { id: "billing", icon: "💳", label: "Billing & Payments", count: 6 },
  { id: "medical-content", icon: "📰", label: "Medical Content", count: 5 },
  { id: "account", icon: "👤", label: "My Account", count: 5 },
] as const;

export const FAQ_SECTIONS: FaqSection[] = [
  {
    category: "consultations",
    icon: "🩺",
    title: "Consultations & Appointments",
    countLabel: "7 questions",
    items: [
      {
        id: "consultations-book",
        question: "How do I book a consultation with a doctor?",
        answer: (
          <>
            <p>
              Booking is quick and straightforward. Simply click the <strong>&quot;Book Consultation&quot;</strong>{" "}
              button in the navigation or visit our{" "}
              <Link href="/book-consultation">booking page</Link>. You&apos;ll be guided through three steps:
            </p>
            <ul>
              <li>Choose your medical specialty and preferred doctor</li>
              <li>Select a date and time that suits you</li>
              <li>Enter your details and confirm your appointment</li>
            </ul>
            <p>
              You&apos;ll receive an email confirmation instantly, along with a reminder 24 hours before your
              appointment.
            </p>
          </>
        ),
      },
      {
        id: "consultations-types",
        question: "What types of consultations do you offer?",
        answer: (
          <>
            <p>We offer three convenient consultation formats to suit your needs:</p>
            <ul>
              <li>
                <strong>Video Call</strong> – Face-to-face consultation via secure encrypted video
              </li>
              <li>
                <strong>Phone Call</strong> – Audio-only consultation ideal for follow-ups
              </li>
              <li>
                <strong>Chat / Messaging</strong> – Asynchronous text-based consultations for non-urgent queries
              </li>
            </ul>
            <p>
              All formats are conducted by board-certified physicians and are fully{" "}
              <span className="inline-badge">🛡️ HIPAA Compliant</span>.
            </p>
          </>
        ),
      },
      {
        id: "consultations-availability",
        question: "How soon can I get an appointment?",
        answer: (
          <>
            <p>
              For general consultations, same-day and next-day slots are frequently available. Specialist appointments
              typically have availability within 1–3 business days. We also offer an <strong>urgent care</strong> queue
              for time-sensitive concerns where a doctor responds within 2–4 hours.
            </p>
            <p>
              You can check real-time availability on the booking page — no account required to browse slots.
            </p>
          </>
        ),
      },
      {
        id: "consultations-reschedule",
        question: "Can I reschedule or cancel my appointment?",
        answer: (
          <>
            <p>
              Yes. You can reschedule or cancel at no charge as long as you do so{" "}
              <strong>at least 2 hours before</strong> your scheduled appointment time. To make changes:
            </p>
            <ul>
              <li>
                Log in to your account and go to <em>My Appointments</em>
              </li>
              <li>
                Select the appointment and click <em>Reschedule</em> or <em>Cancel</em>
              </li>
              <li>Alternatively, click the link in your confirmation email</li>
            </ul>
            <p>
              Cancellations made within 2 hours of the appointment may incur a{" "}
              <span className="inline-badge amber">cancellation fee</span>. Please see our{" "}
              <Link href="/terms-conditions">Terms &amp; Conditions</Link> for details.
            </p>
          </>
        ),
      },
      {
        id: "consultations-certified",
        question: "Are your doctors board-certified and licensed?",
        answer: (
          <>
            <p>
              Absolutely. Every physician on MedAuthority undergoes a rigorous credentialing process before joining our
              platform. All doctors are:
            </p>
            <ul>
              <li>Licensed to practice medicine in their respective states or countries</li>
              <li>Board-certified in their declared specialty</li>
              <li>Verified against national medical licensing databases</li>
              <li>Subject to ongoing peer review and patient feedback monitoring</li>
            </ul>
            <p>
              You can view each doctor&apos;s credentials, specialties, and patient ratings on their individual profile
              pages.
            </p>
          </>
        ),
      },
      {
        id: "consultations-prescription",
        question: "Can I get a prescription from an online consultation?",
        answer: (
          <>
            <p>
              Yes, in many cases. If a prescription is clinically appropriate and legally permissible via telemedicine in
              your jurisdiction, our doctors can issue e-prescriptions that are sent directly to your chosen pharmacy.
            </p>
            <p>
              Please note that prescriptions for controlled substances are subject to additional legal restrictions and
              may require an in-person visit. Our doctors will always advise on the best course of action for your
              specific situation.
            </p>
          </>
        ),
      },
      {
        id: "consultations-prepare",
        question: "What should I prepare before my consultation?",
        answer: (
          <>
            <p>To make the most of your consultation time, we recommend:</p>
            <ul>
              <li>Writing down your symptoms, when they started, and any changes you&apos;ve noticed</li>
              <li>Listing current medications, vitamins, and supplements with dosages</li>
              <li>Having your medical history summary or any recent test results ready to share</li>
              <li>Testing your camera and microphone beforehand (for video calls)</li>
              <li>Being in a quiet, private space for the duration of the call</li>
            </ul>
          </>
        ),
      },
    ],
  },
  {
    category: "health-tools",
    icon: "🔬",
    title: "Health Tools & Calculators",
    countLabel: "6 questions",
    items: [
      {
        id: "health-tools-free",
        question: "Are the health tools on MedAuthority free to use?",
        answer: (
          <>
            <p>
              Yes — all 15+ health tools and calculators on MedAuthority are completely <strong>free to use</strong>{" "}
              with no account required. Our tools include BMI calculator, pregnancy due-date calculator, diabetes risk
              assessor, blood pressure tracker, calorie estimator, and more.
            </p>
            <p>These tools are designed to provide helpful guidance and are reviewed by our medical team for accuracy.</p>
          </>
        ),
      },
      {
        id: "health-tools-accuracy",
        question: "How accurate are your health calculators?",
        answer: (
          <>
            <p>
              Our calculators are built on validated clinical formulas widely used in medical practice (such as the
              Framingham Risk Score, WHO BMI classifications, and ACOG pregnancy dating methods). They are reviewed and
              updated regularly by our editorial team of licensed physicians.
            </p>
            <p>
              However, <strong>these tools are for informational and educational purposes only</strong> and are not a
              substitute for a professional diagnosis. Always consult a qualified healthcare provider for personal
              medical advice. See our <Link href="/disclaimer">Medical Disclaimer</Link> for full details.
            </p>
          </>
        ),
      },
      {
        id: "health-tools-data",
        question: "Is the data I enter into health tools stored or shared?",
        answer: (
          <>
            <p>
              Data you enter into our anonymous health tools (such as age, weight, or symptoms) is processed entirely in
              your browser and is <strong>not stored on our servers</strong> nor linked to any personal identity.
            </p>
            <p>
              If you&apos;re logged in to your account, you may optionally save tool results to your health profile — but
              this is always opt-in and encrypted. Please review our{" "}
              <Link href="/privacy-policy">Privacy Policy</Link> for complete details.
            </p>
          </>
        ),
      },
      {
        id: "health-tools-track",
        question: "Can I track my health metrics over time?",
        answer: (
          <>
            <p>
              Yes, registered users can save and track health metrics over time via their personal health dashboard. You
              can log blood pressure readings, weight, blood glucose, and other vitals, then view trend charts and share
              summaries with your doctor.
            </p>
            <p>This feature is available on free accounts with expanded history retention for Pro subscribers.</p>
          </>
        ),
      },
      {
        id: "health-tools-symptom",
        question: "Do you have a symptom checker?",
        answer: (
          <>
            <p>
              Yes. Our AI-assisted symptom checker allows you to enter your symptoms and receive a list of possible
              conditions, urgency indicators, and recommended next steps. It is reviewed by licensed physicians and
              updated regularly.
            </p>
            <p>
              <strong>Important:</strong> The symptom checker is a triage aid, not a diagnosis. If you have a medical
              emergency, call 911 or go to your nearest emergency room immediately. Do not rely on the symptom checker
              for urgent situations.
            </p>
          </>
        ),
      },
      {
        id: "health-tools-mobile",
        question: "Are the tools available on mobile?",
        answer: (
          <p>
            Yes. All health tools are fully optimized for mobile browsers and work on any smartphone or tablet. No app
            download is required. Our website is responsive and designed to deliver a smooth experience across all
            screen sizes.
          </p>
        ),
      },
    ],
  },
  {
    category: "privacy",
    icon: "🔒",
    title: "Privacy & Security",
    countLabel: "6 questions",
    items: [
      {
        id: "privacy-hipaa",
        question: "Is MedAuthority HIPAA compliant?",
        answer: (
          <>
            <p>
              Yes. MedAuthority is fully compliant with the{" "}
              <strong>Health Insurance Portability and Accountability Act (HIPAA)</strong>. All protected health
              information (PHI) is encrypted in transit and at rest, access is strictly role-based, and all partners
              and vendors handling PHI sign Business Associate Agreements (BAAs).
            </p>
            <p>
              We are also <span className="inline-badge">🇪🇺 GDPR Compliant</span> for our users in the European Union
              and EEA.
            </p>
          </>
        ),
      },
      {
        id: "privacy-who-sees",
        question: "Who can see my consultation and health data?",
        answer: (
          <>
            <p>
              Your consultation records and health data are strictly confidential. Only the following parties can access
              your data:
            </p>
            <ul>
              <li>You (via your secure account)</li>
              <li>The doctor(s) involved in your specific consultation</li>
              <li>Authorised MedAuthority staff for platform operations (under strict data access controls)</li>
            </ul>
            <p>
              We never sell, rent, or share your personal health information with advertisers or third parties for
              marketing purposes. Read our full <Link href="/privacy-policy">Privacy Policy</Link> for details.
            </p>
          </>
        ),
      },
      {
        id: "privacy-breaches",
        question: "How do you protect my data from breaches?",
        answer: (
          <>
            <p>We apply multiple layers of security including:</p>
            <ul>
              <li>256-bit AES encryption for data at rest</li>
              <li>TLS 1.3 for all data in transit</li>
              <li>Multi-factor authentication (MFA) for all staff and optional for patients</li>
              <li>Regular third-party penetration testing and security audits</li>
              <li>Automated intrusion detection and anomaly monitoring</li>
            </ul>
            <p>
              In the unlikely event of a data incident, we will notify affected users as required by applicable law.
            </p>
          </>
        ),
      },
      {
        id: "privacy-deletion",
        question: "Can I request deletion of my account and data?",
        answer: (
          <>
            <p>
              Yes. You have the right to request deletion of your account and all associated personal data at any time.
              To submit a deletion request, go to <em>Account Settings → Privacy → Delete My Account</em>, or contact us
              at <a href="mailto:privacy@medauthority.com">privacy@medauthority.com</a>.
            </p>
            <p>
              Please note that certain data may be retained for legally required periods (e.g. medical records for 7
              years as mandated by law) even after account deletion. This will be clearly communicated to you during the
              deletion process.
            </p>
          </>
        ),
      },
      {
        id: "privacy-cookies",
        question: "Do you use cookies? Can I opt out?",
        answer: (
          <>
            <p>
              Yes, we use cookies to operate the website, remember your preferences, and analyse aggregate usage
              patterns. We <strong>do not</strong> use cookies for advertising or behavioural tracking.
            </p>
            <p>
              You can review and manage your cookie preferences at any time via the cookie consent banner or through{" "}
              <em>Account Settings → Privacy → Cookie Preferences</em>. Read our full{" "}
              <Link href="/cookie-policy">Cookie Policy</Link> for details.
            </p>
          </>
        ),
      },
      {
        id: "privacy-video",
        question: "Is my video consultation private and encrypted?",
        answer: (
          <>
            <p>
              Yes. All video consultations are conducted over an end-to-end encrypted connection. Sessions are{" "}
              <strong>not recorded</strong> without your explicit consent, and no video or audio data is ever stored on
              our servers by default.
            </p>
            <p>
              You may optionally consent to session recording (for medical documentation purposes), in which case
              recordings are encrypted and accessible only to you and your treating physician.
            </p>
          </>
        ),
      },
    ],
  },
  {
    category: "billing",
    icon: "💳",
    title: "Billing & Payments",
    countLabel: "6 questions",
    items: [
      {
        id: "billing-methods",
        question: "What payment methods do you accept?",
        answer: (
          <>
            <p>We accept all major payment methods:</p>
            <ul>
              <li>Visa, Mastercard, American Express, Discover</li>
              <li>PayPal and PayPal Pay Later</li>
              <li>Apple Pay and Google Pay</li>
              <li>HSA/FSA cards (for eligible consultations)</li>
              <li>Bank transfer (for corporate/enterprise accounts)</li>
            </ul>
            <p>
              All payments are processed securely via Stripe and are PCI-DSS compliant. We never store your full card
              details on our servers.
            </p>
          </>
        ),
      },
      {
        id: "billing-cost",
        question: "How much does a consultation cost?",
        answer: (
          <>
            <p>Consultation fees vary by specialty and format. As a general guide:</p>
            <ul>
              <li>
                <strong>General Practice:</strong> from $49 per session
              </li>
              <li>
                <strong>Specialist Consultation:</strong> from $89 per session
              </li>
              <li>
                <strong>Follow-up Appointment:</strong> from $29 per session
              </li>
              <li>
                <strong>Urgent Care Queue:</strong> from $39 per session
              </li>
            </ul>
            <p>
              All fees are displayed clearly before you confirm your booking. There are no hidden charges. You can also
              subscribe to a <a href="#">MedAuthority Care Plan</a> for reduced per-consultation rates.
            </p>
          </>
        ),
      },
      {
        id: "billing-insurance",
        question: "Does insurance cover online consultations?",
        answer: (
          <>
            <p>
              Telehealth coverage varies significantly between insurance providers and plans. Many US insurers now cover
              telemedicine visits following regulatory changes that expanded telehealth access.
            </p>
            <p>
              We recommend checking with your insurer directly. MedAuthority provides an itemised receipt and
              consultation summary after every appointment that you can submit to your insurer for potential
              reimbursement. We do not directly bill insurance at this time but are working to add this feature.
            </p>
          </>
        ),
      },
      {
        id: "billing-refund",
        question: "What is your refund policy?",
        answer: (
          <>
            <p>
              We offer a <strong>full refund</strong> in the following situations:
            </p>
            <ul>
              <li>You cancelled your appointment at least 2 hours in advance</li>
              <li>The doctor was unable to connect or did not join the session</li>
              <li>There was a significant technical failure on our platform that prevented the consultation</li>
            </ul>
            <p>
              Refunds are processed within 3–5 business days to your original payment method. For disputes or special
              circumstances, contact <a href="mailto:billing@medauthority.com">billing@medauthority.com</a>. See our
              full <Link href="/terms-conditions">Terms &amp; Conditions</Link> for the complete refund policy.
            </p>
          </>
        ),
      },
      {
        id: "billing-plans",
        question: "Do you offer subscription or care plans?",
        answer: (
          <>
            <p>
              Yes. MedAuthority Care Plans offer discounted consultation rates, priority booking, and unlimited access to
              premium health tools. Plans are available monthly or annually. Current options include:
            </p>
            <ul>
              <li>
                <strong>Basic Plan:</strong> 2 consultations/month + all tools — $39/mo
              </li>
              <li>
                <strong>Family Plan:</strong> Up to 5 family members, 5 consultations/month — $79/mo
              </li>
              <li>
                <strong>Pro Plan:</strong> Unlimited consultations + dedicated care coordinator — $149/mo
              </li>
            </ul>
            <p>You can cancel or pause your plan at any time from your account settings.</p>
          </>
        ),
      },
      {
        id: "billing-invoice",
        question: "Will I receive an invoice for my consultation?",
        answer: (
          <p>
            Yes. A detailed invoice is automatically emailed to you after each payment and is also available in your
            account under <em>My Account → Billing History</em>. Invoices include the doctor&apos;s name, specialty,
            date, duration, and service description — suitable for insurance reimbursement claims or expense reporting.
          </p>
        ),
      },
    ],
  },
  {
    category: "medical-content",
    icon: "📰",
    title: "Medical Content & Editorial Standards",
    countLabel: "5 questions",
    items: [
      {
        id: "medical-content-authors",
        question: "Who writes and reviews the medical articles on MedAuthority?",
        answer: (
          <>
            <p>
              All medical articles are written by qualified medical writers or physicians and then independently
              reviewed by at least one licensed doctor specializing in the relevant area. We follow a strict{" "}
              <Link href="/editorial-policy">Editorial Policy</Link> that requires:
            </p>
            <ul>
              <li>Citation of peer-reviewed sources and clinical guidelines</li>
              <li>Clear disclosure of the reviewing physician&apos;s credentials</li>
              <li>Regular review and update cycles (at least every 12 months)</li>
              <li>Transparent disclosure of any potential conflicts of interest</li>
            </ul>
          </>
        ),
      },
      {
        id: "medical-content-updates",
        question: "How often is the medical content updated?",
        answer: (
          <>
            <p>
              All articles display a <strong>&quot;Last Medically Reviewed&quot;</strong> date. Our editorial team
              follows a scheduled review cycle:
            </p>
            <ul>
              <li>High-traffic and clinical guidance articles: reviewed every 6 months</li>
              <li>General health articles: reviewed every 12 months</li>
              <li>Breaking health news or guideline updates: updated promptly when new evidence emerges</li>
            </ul>
            <p>
              If you notice outdated information, you can flag it using the feedback button at the bottom of each
              article.
            </p>
          </>
        ),
      },
      {
        id: "medical-content-trust",
        question: "Can I trust the information on MedAuthority for medical decisions?",
        answer: (
          <>
            <p>
              Our content is evidence-based and physician-reviewed, making it one of the most reliable sources for
              general medical information online. However,{" "}
              <strong>website content is never a substitute for personalised medical advice</strong>.
            </p>
            <p>
              Always consult a qualified healthcare provider before making any medical decision, changing medications,
              or starting a new treatment. If you have a medical emergency, call 911 immediately. See our full{" "}
              <Link href="/disclaimer">Medical Disclaimer</Link>.
            </p>
          </>
        ),
      },
      {
        id: "medical-content-sponsored",
        question: "Does MedAuthority accept sponsored content or paid promotions?",
        answer: (
          <>
            <p>
              MedAuthority maintains strict editorial independence. We do not allow pharmaceutical companies, device
              manufacturers, or other commercial interests to influence our medical content or tool outputs.
            </p>
            <p>
              Any sponsored content or advertorial material is clearly labelled as{" "}
              <span className="inline-badge amber">Sponsored</span> and is kept entirely separate from our editorial
              articles. Our advertising relationships never influence clinical recommendations. See our{" "}
              <Link href="/editorial-policy">Editorial Policy</Link> for full details.
            </p>
          </>
        ),
      },
      {
        id: "medical-content-submit",
        question: "Can I submit a question to be answered in the blog?",
        answer: (
          <p>
            Yes! We love hearing from our readers. You can submit a health question via our{" "}
            <Link href="/ask-doctor">Ask the Doctor</Link> page. Popular questions are selected by our editorial team and
            turned into full articles authored and reviewed by our physicians. Your question will be anonymised before
            publication.
          </p>
        ),
      },
    ],
  },
  {
    category: "account",
    icon: "👤",
    title: "My Account",
    countLabel: "5 questions",
    items: [
      {
        id: "account-required",
        question: "Do I need an account to use MedAuthority?",
        answer: (
          <>
            <p>
              No account is needed to browse medical articles, use the health tools, or read the blog. However, you will
              need to create a free account to:
            </p>
            <ul>
              <li>Book a doctor consultation</li>
              <li>Save and track health tool results over time</li>
              <li>Access your consultation history and records</li>
              <li>Subscribe to the newsletter with personalised content</li>
            </ul>
            <p>Creating an account takes under 2 minutes and is completely free.</p>
          </>
        ),
      },
      {
        id: "account-password",
        question: "How do I reset my password?",
        answer: (
          <>
            <p>
              To reset your password, click <strong>&quot;Forgot Password&quot;</strong> on the login page and enter
              your registered email address. You&apos;ll receive a secure reset link within a few minutes. The link
              expires after 30 minutes for security reasons.
            </p>
            <p>
              If you don&apos;t receive the email, check your spam folder or contact{" "}
              <a href="mailto:support@medauthority.com">support@medauthority.com</a>.
            </p>
          </>
        ),
      },
      {
        id: "account-family",
        question: "Can I add family members to my account?",
        answer: (
          <>
            <p>
              Yes. With a <strong>Family Care Plan</strong>, you can add up to 4 additional family members under one
              account. Each member has their own private health profile and consultation history. The primary account
              holder manages billing and subscriptions.
            </p>
            <p>
              You can add family members from <em>Account Settings → Family Members → Add Member</em>.
            </p>
          </>
        ),
      },
      {
        id: "account-update",
        question: "How do I update my medical history or personal details?",
        answer: (
          <p>
            You can update your personal information, medical history, allergies, current medications, and contact
            details at any time from <em>Account Settings → My Health Profile</em>. Keeping this information current
            helps your doctors provide more accurate and personalised care during consultations.
          </p>
        ),
      },
      {
        id: "account-export",
        question: "How do I download or export my health records?",
        answer: (
          <>
            <p>
              You can download your complete health records at any time in PDF or HL7 FHIR format from{" "}
              <em>Account Settings → My Health Profile → Export Records</em>. This includes consultation summaries,
              prescriptions, test results, and saved health tool data.
            </p>
            <p>
              This right to data portability is part of our HIPAA and GDPR compliance commitments. Exports are available
              within minutes.
            </p>
          </>
        ),
      },
    ],
  },
];
