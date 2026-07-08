import {
  PublicationAttachmentType,
  PublicationReviewAction,
  PublicationStatus,
  PublicationType,
  PublicationVisibility,
} from '@prisma/client';

export const SEED_PUBLICATION_SLUG_PREFIX = 'drinsight-research-';

export type SeedPublicationTemplate = {
  slug: string;
  specialty: string;
  publicationType: PublicationType;
  status: PublicationStatus;
  title: string;
  subtitle: string;
  journalName: string;
  publisher: string;
  featured?: boolean;
  pinned?: boolean;
  featuredOrder?: number;
};

export const PUBLICATION_STATUS_QUEUE: PublicationStatus[] = [
  ...Array(18).fill('APPROVED' as PublicationStatus),
  'UNDER_REVIEW',
  'UNDER_REVIEW',
  'SUBMITTED',
  'SUBMITTED',
  'SUBMITTED',
  'DRAFT',
  'DRAFT',
  'DRAFT',
  'NEEDS_REVISION',
  'NEEDS_REVISION',
  'REJECTED',
  'REJECTED',
];

export const SEED_PUBLICATION_TEMPLATES: SeedPublicationTemplate[] = [
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}hypertension-targets-adults-2024`,
    specialty: 'Cardiology',
    publicationType: PublicationType.REVIEW_ARTICLE,
    status: PublicationStatus.APPROVED,
    title: 'Blood Pressure Targets in Adults: A Plain-Language Review of Current Guidelines',
    subtitle: 'Synthesising ACC/AHA and ESC recommendations for primary care',
    journalName: 'Journal of Clinical Hypertension',
    publisher: 'Wiley',
    featured: true,
    pinned: true,
    featuredOrder: 1,
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}heart-failure-gdmt-uptitration`,
    specialty: 'Cardiology',
    publicationType: PublicationType.JOURNAL_ARTICLE,
    status: PublicationStatus.APPROVED,
    title: 'Guideline-Directed Medical Therapy Uptitration in Heart Failure with Reduced Ejection Fraction',
    subtitle: 'A multicentre observational cohort from tertiary centres in Pakistan',
    journalName: 'European Heart Journal Open',
    publisher: 'Oxford University Press',
    featured: true,
    featuredOrder: 2,
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}atrial-fibrillation-anticoagulation`,
    specialty: 'Cardiology',
    publicationType: PublicationType.CLINICAL_TRIAL,
    status: PublicationStatus.APPROVED,
    title: 'Direct Oral Anticoagulants Versus Warfarin in Non-Valvular Atrial Fibrillation: Regional Outcomes',
    subtitle: 'Prospective registry analysis of stroke and bleeding events',
    journalName: 'Heart Rhythm',
    publisher: 'Elsevier',
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}migraine-prevention-cgrp-2025`,
    specialty: 'Neurology',
    publicationType: PublicationType.REVIEW_ARTICLE,
    status: PublicationStatus.APPROVED,
    title: 'Migraine Prevention in 2025: CGRP Pathway Inhibitors and Evidence Gaps',
    subtitle: 'Clinical implications for neurologists and primary care physicians',
    journalName: 'The Lancet Neurology',
    publisher: 'Elsevier',
    featured: true,
    featuredOrder: 3,
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}acute-ischemic-stroke-thrombolysis-window`,
    specialty: 'Neurology',
    publicationType: PublicationType.RESEARCH_PAPER,
    status: PublicationStatus.APPROVED,
    title: 'Door-to-Needle Times and Functional Outcomes in Acute Ischemic Stroke',
    subtitle: 'A quality-improvement initiative across six stroke-ready hospitals',
    journalName: 'Stroke',
    publisher: 'American Heart Association',
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}pediatric-epilepsy-ketogenic-diet`,
    specialty: 'Neurology',
    publicationType: PublicationType.CASE_STUDY,
    status: PublicationStatus.UNDER_REVIEW,
    title: 'Refractory Childhood Epilepsy Managed with Modified Ketogenic Protocol: Case Series',
    subtitle: 'Nutritional monitoring and seizure-frequency outcomes over 18 months',
    journalName: 'Epilepsia Open',
    publisher: 'Wiley',
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}psoriasis-biologics-comparative`,
    specialty: 'Dermatology',
    publicationType: PublicationType.REVIEW_ARTICLE,
    status: PublicationStatus.APPROVED,
    title: 'Comparative Effectiveness of IL-17 and IL-23 Inhibitors in Moderate-to-Severe Psoriasis',
    subtitle: 'Network meta-analysis with PASI 90 endpoints',
    journalName: 'British Journal of Dermatology',
    publisher: 'Oxford University Press',
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}melanoma-dermoscopy-primary-care`,
    specialty: 'Dermatology',
    publicationType: PublicationType.RESEARCH_PAPER,
    status: PublicationStatus.APPROVED,
    title: 'Dermoscopy Training for Primary Care Physicians: Impact on Melanoma Referral Accuracy',
    subtitle: 'Before-and-after study in urban outpatient clinics',
    journalName: 'JAMA Dermatology',
    publisher: 'American Medical Association',
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}atopic-dermatitis-pediatric-emollients`,
    specialty: 'Dermatology',
    publicationType: PublicationType.JOURNAL_ARTICLE,
    status: PublicationStatus.SUBMITTED,
    title: 'Emollient Adherence and Flare Frequency in Pediatric Atopic Dermatitis',
    subtitle: 'Parent-reported outcomes from a 12-week pragmatic trial',
    journalName: 'Pediatric Dermatology',
    publisher: 'Wiley',
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}childhood-asthma-inhaler-technique`,
    specialty: 'Pediatrics',
    publicationType: PublicationType.RESEARCH_PAPER,
    status: PublicationStatus.APPROVED,
    title: 'Metered-Dose Inhaler Technique in School-Age Children with Persistent Asthma',
    subtitle: 'Video-assisted coaching versus standard inhaler education',
    journalName: 'Pediatric Pulmonology',
    publisher: 'Wiley',
    featured: true,
    featuredOrder: 4,
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}neonatal-jaundice-phototherapy-protocol`,
    specialty: 'Pediatrics',
    publicationType: PublicationType.JOURNAL_ARTICLE,
    status: PublicationStatus.APPROVED,
    title: 'Phototherapy Thresholds for Neonatal Hyperbilirubinemia in South Asian Newborns',
    subtitle: 'Prospective cohort aligned with updated AAP guidance',
    journalName: 'Journal of Pediatrics',
    publisher: 'Elsevier',
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}pediatric-obesity-lifestyle-intervention`,
    specialty: 'Pediatrics',
    publicationType: PublicationType.CLINICAL_TRIAL,
    status: PublicationStatus.DRAFT,
    title: 'Family-Based Lifestyle Intervention for Adolescent Obesity: Protocol for a Randomised Trial',
    subtitle: 'Structured physical activity and dietary counselling in community settings',
    journalName: 'Trials',
    publisher: 'BioMed Central',
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}knee-osteoarthritis-prp-injection`,
    specialty: 'Orthopedics',
    publicationType: PublicationType.CLINICAL_TRIAL,
    status: PublicationStatus.APPROVED,
    title: 'Platelet-Rich Plasma Injections for Knee Osteoarthritis: Six-Month Functional Outcomes',
    subtitle: 'Double-blind placebo-controlled study in adults aged 45–70',
    journalName: 'American Journal of Sports Medicine',
    publisher: 'SAGE Publications',
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}rotator-cuff-tear-conservative-management`,
    specialty: 'Orthopedics',
    publicationType: PublicationType.REVIEW_ARTICLE,
    status: PublicationStatus.APPROVED,
    title: 'Non-Operative Management of Partial-Thickness Rotator Cuff Tears',
    subtitle: 'Evidence review of physiotherapy and corticosteroid strategies',
    journalName: 'Journal of Shoulder and Elbow Surgery',
    publisher: 'Elsevier',
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}hip-fracture-geriatric-co-management`,
    specialty: 'Orthopedics',
    publicationType: PublicationType.RESEARCH_PAPER,
    status: PublicationStatus.NEEDS_REVISION,
    title: 'Orthogeriatric Co-Management After Hip Fracture: Length of Stay and Complication Rates',
    subtitle: 'Interrupted time-series analysis at a tertiary trauma centre',
    journalName: 'Injury',
    publisher: 'Elsevier',
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}major-depression-ssri-augmentation`,
    specialty: 'Psychiatry',
    publicationType: PublicationType.JOURNAL_ARTICLE,
    status: PublicationStatus.APPROVED,
    title: 'Aripiprazole Augmentation in SSRI-Resistant Major Depressive Disorder',
    subtitle: 'Open-label extension with PHQ-9 and functional remission endpoints',
    journalName: 'Journal of Clinical Psychiatry',
    publisher: 'Physicians Postgraduate Press',
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}anxiety-disorders-cbt-telehealth`,
    specialty: 'Psychiatry',
    publicationType: PublicationType.RESEARCH_PAPER,
    status: PublicationStatus.APPROVED,
    title: 'Cognitive Behavioural Therapy Delivered via Telehealth for Generalised Anxiety Disorder',
    subtitle: 'Non-inferiority trial compared with in-person sessions',
    journalName: 'JAMA Psychiatry',
    publisher: 'American Medical Association',
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}bipolar-disorder-lithium-monitoring`,
    specialty: 'Psychiatry',
    publicationType: PublicationType.CASE_STUDY,
    status: PublicationStatus.REJECTED,
    title: 'Lithium Toxicity Presenting as Acute Confusion: Diagnostic Pitfalls in Older Adults',
    subtitle: 'Case report with therapeutic drug monitoring recommendations',
    journalName: 'Bipolar Disorders',
    publisher: 'Wiley',
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}inflammatory-bowel-disease-biologics`,
    specialty: 'Gastroenterology',
    publicationType: PublicationType.REVIEW_ARTICLE,
    status: PublicationStatus.APPROVED,
    title: 'Biologic Therapy Sequencing in Moderate-to-Severe Crohn Disease',
    subtitle: 'Comparative persistence and steroid-sparing outcomes',
    journalName: 'Gastroenterology',
    publisher: 'Elsevier',
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}helicobacter-pylori-eradication-regimens`,
    specialty: 'Gastroenterology',
    publicationType: PublicationType.JOURNAL_ARTICLE,
    status: PublicationStatus.APPROVED,
    title: 'Bismuth Quadruple Therapy for Helicobacter pylori Eradication in a High-Resistance Region',
    subtitle: 'Culture-guided regimen selection and 13C-urea breath test confirmation',
    journalName: 'Gut',
    publisher: 'BMJ Publishing Group',
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}nafld-fibrosis-non-invasive-scores`,
    specialty: 'Gastroenterology',
    publicationType: PublicationType.RESEARCH_PAPER,
    status: PublicationStatus.SUBMITTED,
    title: 'FIB-4 and ELF Score Performance in Detecting Advanced Fibrosis in NAFLD',
    subtitle: 'Cross-sectional validation cohort with liver biopsy reference',
    journalName: 'Hepatology',
    publisher: 'Wiley',
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}type-2-diabetes-hba1c-targets`,
    specialty: 'Endocrinology',
    publicationType: PublicationType.REVIEW_ARTICLE,
    status: PublicationStatus.APPROVED,
    title: 'Type 2 Diabetes: Understanding HbA1c Targets and Individualised Glycaemic Goals',
    subtitle: 'Plain-language synthesis of ADA and EASD consensus statements',
    journalName: 'Diabetes Care',
    publisher: 'American Diabetes Association',
    featured: true,
    featuredOrder: 5,
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}thyroid-nodules-fine-needle-aspiration`,
    specialty: 'Endocrinology',
    publicationType: PublicationType.RESEARCH_PAPER,
    status: PublicationStatus.APPROVED,
    title: 'Ultrasound-Guided Fine-Needle Aspiration of Thyroid Nodules: Bethesda Category Distribution',
    subtitle: 'Five-year institutional pathology audit',
    journalName: 'Thyroid',
    publisher: 'Mary Ann Liebert',
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}pcos-metformin-fertility-outcomes`,
    specialty: 'Endocrinology',
    publicationType: PublicationType.CLINICAL_TRIAL,
    status: PublicationStatus.UNDER_REVIEW,
    title: 'Metformin and Lifestyle Intervention in Polycystic Ovary Syndrome: Ovulation and Live-Birth Rates',
    subtitle: 'Randomised factorial design in reproductive-age women',
    journalName: 'Fertility and Sterility',
    publisher: 'Elsevier',
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}hypertension-screening-primary-care`,
    specialty: 'Family Medicine',
    publicationType: PublicationType.JOURNAL_ARTICLE,
    status: PublicationStatus.APPROVED,
    title: 'Opportunistic Blood Pressure Screening in Family Medicine Clinics',
    subtitle: 'Yield of newly detected hypertension and linkage to care',
    journalName: 'Annals of Family Medicine',
    publisher: 'Annals of Family Medicine',
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}diabetes-prevention-lifestyle-pk`,
    specialty: 'Family Medicine',
    publicationType: PublicationType.RESEARCH_PAPER,
    status: PublicationStatus.APPROVED,
    title: 'Community Lifestyle Coaching for Prediabetes: Weight and Fasting Glucose Trajectories',
    subtitle: 'Pragmatic cluster trial in semi-urban family practices',
    journalName: 'Family Practice',
    publisher: 'Oxford University Press',
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}antenatal-anaemia-iron-supplementation`,
    specialty: 'Gynecology',
    publicationType: PublicationType.CLINICAL_TRIAL,
    status: PublicationStatus.APPROVED,
    title: 'Intravenous Iron Versus Oral Iron for Antenatal Anaemia in the Second Trimester',
    subtitle: 'Haemoglobin response and maternal fatigue scores at 34 weeks',
    journalName: 'Obstetrics & Gynecology',
    publisher: 'Lippincott Williams & Wilkins',
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}gestational-diabetes-postpartum-screening`,
    specialty: 'Gynecology',
    publicationType: PublicationType.JOURNAL_ARTICLE,
    status: PublicationStatus.APPROVED,
    title: 'Postpartum Glucose Screening Uptake After Gestational Diabetes Mellitus',
    subtitle: 'Retrospective review of OGTT completion at 6–12 weeks',
    journalName: 'International Journal of Gynaecology & Obstetrics',
    publisher: 'Wiley',
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}endometriosis-diagnostic-delay`,
    specialty: 'Gynecology',
    publicationType: PublicationType.RESEARCH_PAPER,
    status: PublicationStatus.DRAFT,
    title: 'Diagnostic Interval in Endometriosis: Symptom Onset to Surgical Confirmation',
    subtitle: 'Patient-reported timelines from a multicentre survey',
    journalName: 'Human Reproduction',
    publisher: 'Oxford University Press',
  },
  {
    slug: `${SEED_PUBLICATION_SLUG_PREFIX}physical-activity-depression-meta`,
    specialty: 'Psychiatry',
    publicationType: PublicationType.CONFERENCE_PAPER,
    status: PublicationStatus.APPROVED,
    title: 'Physical Activity and Depression: Pooled Findings Across 24 Randomised Trials',
    subtitle: 'Conference proceedings summary with effect-size pooling',
    journalName: 'World Congress of Psychiatry Proceedings',
    publisher: 'World Psychiatric Association',
  },
];

export const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&q=80',
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
  'https://images.unsplash.com/photo-1530497615205-8416fa94cf39?w=800&q=80',
  'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&q=80',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80',
];

export const OPEN_ACCESS_PDF_URLS = [
  'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4121913/pdf/main.pdf',
  'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4681110/pdf/main.pdf',
  'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5449424/pdf/main.pdf',
  'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6312795/pdf/main.pdf',
  'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7148363/pdf/main.pdf',
  'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7234679/pdf/main.pdf',
];

export function buildPublicationContent(template: SeedPublicationTemplate) {
  const specialty = template.specialty;
  const title = template.title;

  const abstract = `Background: ${title} addresses an important clinical question in ${specialty.toLowerCase()} relevant to physicians practising in resource-diverse settings. Objective: We aimed to evaluate current evidence, summarise practice implications, and identify areas requiring further investigation. Methods: We conducted a structured review of peer-reviewed literature published between 2018 and 2025, screened studies against predefined inclusion criteria, and extracted data on study design, population characteristics, interventions, and clinically meaningful endpoints. Results: The analysis included multiple high-quality studies demonstrating consistent associations between guideline-concordant care and improved patient outcomes. Heterogeneity across populations was noted, particularly regarding comorbidity burden and access to specialist follow-up. Safety outcomes remained favourable when monitoring protocols were followed. Conclusion: Findings support evidence-based approaches aligned with international standards while highlighting the need for locally adapted implementation strategies. Clinicians should individualise decisions using shared decision-making and document follow-up plans clearly.`;

  const introduction = `Clinical practice in ${specialty.toLowerCase()} continues to evolve as new trials, registry data, and consensus statements refine how we prevent, diagnose, and treat common conditions. ${template.subtitle}. This publication summarises the rationale for the study, contextualises it within contemporary guidelines, and explains why the question matters for both specialists and front-line clinicians. Patients increasingly expect transparent, evidence-linked explanations of therapeutic choices; this work was undertaken to meet that need with rigorously sourced information.`;

  const methodology = `We performed a systematic search of MEDLINE, Embase, Cochrane Central, and regional indexes using specialty-specific MeSH terms and keyword combinations related to the primary research question. Two reviewers independently screened titles and abstracts, resolved disagreements by consensus, and assessed risk of bias using recognised tools appropriate to study design. Data were synthesised narratively where meta-analysis was not feasible. Ethical approval was obtained where primary data collection occurred, and all participating centres provided governance sign-off before patient enrolment.`;

  const results = `The primary analysis demonstrated statistically and clinically meaningful differences favouring guideline-concordant management across key endpoints. Secondary outcomes included patient-reported measures, healthcare utilisation, and safety signals such as adverse events requiring unplanned contact. Subgroup analyses suggested consistent direction of effect across age strata and common comorbidities, although confidence intervals widened in smaller cohorts. Sensitivity analyses did not materially alter the principal findings.`;

  const discussion = `Our results align with international literature while emphasising implementation factors relevant to regional practice. Strengths include transparent methodology, pre-specified endpoints, and multidisciplinary authorship. Limitations include residual confounding in observational components and follow-up duration that may not capture long-term harms or benefits. Future research should prioritise pragmatic trials embedded in routine care pathways.`;

  const conclusion = `This ${template.publicationType.replace(/_/g, ' ').toLowerCase()} contributes actionable evidence for ${specialty.toLowerCase()} clinicians. Adoption of the recommended approach should be paired with patient education, structured follow-up, and audit of outcomes at the service level.`;

  const keywords = [
    specialty.split(' ')[0]!,
    template.publicationType.replace(/_/g, ' '),
    'Evidence-Based Medicine',
    'Clinical Outcomes',
    'Patient Safety',
    'Guidelines',
    'South Asia',
    'Primary Care',
  ];

  return { abstract, introduction, methodology, results, discussion, conclusion, keywords };
}

export function buildDoi(slug: string, index: number): string {
  return `10.1000/drinsight.${index}.${slug.slice(-8).replace(/-/g, '')}`;
}

export function buildIssn(specialty: string): string {
  const base = specialty.charCodeAt(0) * 100 + specialty.length;
  return `2091-${String(1000 + (base % 900)).padStart(4, '0')}`;
}

export const REVIEW_FEEDBACK: Record<string, { internalNotes: string; feedback: string }> = {
  APPROVE: {
    internalNotes: 'Methodology sound, references current, COI disclosed. Approved for public listing.',
    feedback: 'Congratulations — your publication has been approved and is now visible on the Research & Publications page.',
  },
  REJECT: {
    internalNotes: 'Insufficient primary data and incomplete ethical approval documentation.',
    feedback: 'Unfortunately we cannot approve this submission. Please address the methodological concerns and consider resubmitting as a case series with complete governance paperwork.',
  },
  REQUEST_REVISION: {
    internalNotes: 'Good topic; revise discussion, add sensitivity analysis, expand limitations paragraph.',
    feedback: 'Your manuscript shows promise. Please revise per reviewer comments on statistical reporting and resubmit within 14 days.',
  },
};
