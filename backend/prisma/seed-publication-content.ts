/**
 * Rich publication content for DrInsight research article seeding.
 * Matches ResearchArticlePreview format from doctor-dashboard.html.
 */

export type PublicationArticleType =
  | 'EVIDENCE_REVIEW'
  | 'CLINICAL_EXPLAINER'
  | 'META_SUMMARY'
  | 'PRACTICE_GUIDE';

export type ArticleTopic = {
  key: string;
  publicationType: PublicationArticleType;
  title: string;
  subtitle: string;
  keywords: string[];
  figureData: string;
  methodsTable: string;
  keyFindings: string;
};

export type RichPublicationContent = {
  abstractBackground: string;
  abstractMethods: string;
  abstractResults: string;
  abstractConclusions: string;
  introduction: string;
  objectives: string;
  methodsContent: string;
  methodsTable: string;
  results: string;
  figureData: string;
  figureCaption: string;
  resultSummary: string;
  discussion: string;
  practiceImplications: string;
  limitations: string;
  conclusion: string;
  keyFindings: string;
  authorContributions: string;
  ethicsStatement: string;
  clinicalTrialRegistration: string;
  dataAvailabilityStatement: string;
  fundingSource: string;
  conflictsOfInterest: string;
  acknowledgments: string;
  abbreviations: string;
  references: { citation: string; doi: string }[];
  readTimeMinutes: number;
};

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

export const REVIEW_FEEDBACK: Record<string, { internalNotes: string; feedback: string }> = {
  APPROVE: {
    internalNotes: 'Methodology sound, references current, COI disclosed. Approved for public listing.',
    feedback:
      'Congratulations — your publication has been approved and is now visible on the Research & Publications page.',
  },
  REJECT: {
    internalNotes: 'Insufficient primary data and incomplete ethical approval documentation.',
    feedback:
      'Unfortunately we cannot approve this submission. Please address the methodological concerns and consider resubmitting as a case series with complete governance paperwork.',
  },
  REQUEST_REVISION: {
    internalNotes: 'Good topic; revise discussion, add sensitivity analysis, expand limitations paragraph.',
    feedback:
      'Your manuscript shows promise. Please revise per reviewer comments on statistical reporting and resubmit within 14 days.',
  },
};

const TYPE_CODES: Record<PublicationArticleType, string> = {
  EVIDENCE_REVIEW: 'ER',
  CLINICAL_EXPLAINER: 'CE',
  META_SUMMARY: 'MS',
  PRACTICE_GUIDE: 'PG',
};

export function buildArticleId(type: PublicationArticleType, year: number, seq: number): string {
  return `DI-${TYPE_CODES[type]}-${year}-${String(seq).padStart(3, '0')}`;
}

export function buildDoi(index: number, slug: string): string {
  return `10.1000/drinsight.${index}.${slug.slice(-12).replace(/-/g, '')}`;
}

export function buildIssn(specialty: string): string {
  const base = specialty.charCodeAt(0) * 100 + specialty.length;
  return `2091-${String(1000 + (base % 900)).padStart(4, '0')}`;
}

function t(
  key: string,
  publicationType: PublicationArticleType,
  title: string,
  subtitle: string,
  keywords: string[],
  figureData: string,
  methodsTable: string,
  keyFindings: string,
): ArticleTopic {
  return { key, publicationType, title, subtitle, keywords, figureData, methodsTable, keyFindings };
}

export const ARTICLE_TOPICS_BY_SPECIALTY: Record<string, ArticleTopic[]> = {
  'Cardiology': [
    t(
      'hypertension-targets',
      'EVIDENCE_REVIEW',
      'Blood Pressure Targets in Adults: A Plain-Language Evidence Review of Current Guidelines',
      'Synthesising ACC/AHA and ESC recommendations for primary and specialist care',
      ["Hypertension","Blood Pressure","Cardiovascular Risk","Clinical Guidelines","Evidence Review"],
      `Stroke | -25%
Heart failure | -19%
MI | -16%
CV death | -12%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🎯|Target|<130/80 mmHg for most higher-risk adults
🌿|First Step|Lifestyle change before medication in stage 1
❤️|Benefit|Fewer strokes, heart-failure and CV events
👴|Caution|Individualise for older or frail patients`,
    ),
    t(
      'heart-failure-gdmt',
      'CLINICAL_EXPLAINER',
      'Guideline-Directed Medical Therapy Uptitration in Heart Failure with Reduced Ejection Fraction',
      'Stepwise initiation of ACEi/ARB/ARNI, beta-blocker, MRA, and SGLT2 inhibitor therapy',
      ["Heart Failure","HFrEF","GDMT","SGLT2 Inhibitors","Cardiology"],
      `Hospitalisation | -28%
CV death | -18%
Worsening HF | -31%
Symptom score | -22%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `💊|Quartet|Four foundational drug classes improve survival
📈|Uptitration|Serial dose increases over weeks, not months
🏥|Admissions|Fewer heart-failure hospitalisations with full GDMT
⚠️|Monitoring|Check renal function and potassium at each step`,
    ),
    t(
      'af-anticoagulation',
      'META_SUMMARY',
      'Direct Oral Anticoagulants Versus Warfarin in Non-Valvular Atrial Fibrillation',
      'Pooled stroke prevention and bleeding outcomes from contemporary registries',
      ["Atrial Fibrillation","DOAC","Warfarin","Stroke Prevention","Anticoagulation"],
      `Stroke | -34%
ICH | -52%
Major bleed | -8%
Mortality | -10%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🩸|Stroke|DOACs reduce ischaemic stroke vs warfarin in NVAF
🧠|ICH|Intracranial haemorrhage favourably lower with DOACs
💊|Adherence|Once-daily agents improve persistence in routine care
👴|Renal|Dose-adjust for creatinine clearance and age`,
    ),
    t(
      'statin-primary-prevention',
      'PRACTICE_GUIDE',
      'Statin Therapy for Primary Cardiovascular Prevention in Adults',
      'Risk-based initiation aligned with pooled trial and guideline evidence',
      ["Statins","LDL Cholesterol","Primary Prevention","ASCVD Risk","Lipids"],
      `LDL reduction | -38%
Major vascular events | -21%
MI | -24%
Stroke | -17%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `📊|Risk|Use pooled cohort equations before starting therapy
💊|Intensity|Moderate- or high-intensity statin by baseline risk
🥗|Lifestyle|Diet and activity remain first-line adjuncts
🔁|Follow-up|Recheck lipids and adherence at 8–12 weeks`,
    ),
    t(
      'acs-dual-antiplatelet',
      'EVIDENCE_REVIEW',
      'Dual Antiplatelet Therapy Duration After Acute Coronary Syndromes',
      'Balancing ischaemic benefit against bleeding in PCI-treated patients',
      ["Acute Coronary Syndrome","DAPT","PCI","Antiplatelet Therapy","Bleeding Risk"],
      `Stent thrombosis | -42%
Major bleed | +14%
MI | -19%
Net clinical benefit | +9%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `⏱️|Duration|12 months default; shorten in high bleed risk
🩹|Bleeding|Use PRECISE-DAPT or ARC-HBR to stratify
💊|P2Y12|Prasugrel or ticagrelor preferred when bleeding risk low
📋|Discharge|Provide written antiplatelet plan at hospital discharge`,
    ),
  ],
  'Neurology': [
    t(
      'migraine-cgrp',
      'EVIDENCE_REVIEW',
      'Migraine Prevention in 2025: CGRP Pathway Inhibitors and Evidence Gaps',
      'Clinical implications for neurologists and primary care physicians',
      ["Migraine","CGRP","Headache","Preventive Therapy","Neurology"],
      `Monthly migraine days | -4.2
50% responder rate | 58%
Disability (MIDAS) | -32%
Treatment discontinuation | 18%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🧬|Mechanism|CGRP monoclonal antibodies block trigeminovascular signalling
📉|Frequency|Mean reduction of 3–5 migraine days per month
💉|Route|Subcutaneous or intravenous quarterly options available
⚠️|CV risk|Long-term cardiovascular safety still under surveillance`,
    ),
    t(
      'acute-stroke-thrombolysis',
      'CLINICAL_EXPLAINER',
      'Door-to-Needle Times and Functional Outcomes in Acute Ischaemic Stroke',
      'Quality-improvement lessons from stroke-ready hospital networks',
      ["Stroke","Thrombolysis","tPA","Door-to-Needle","Acute Care"],
      `mRS 0-1 at 90d | +22%
Symptomatic ICH | 4.8%
Door-to-needle | 38 min
Mortality | -11%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `⏱️|Time|Every 15-minute delay reduces good outcome odds
🚑|Prehospital|EMS notification cuts in-hospital delays
🧠|Imaging|CT-first protocols avoid unnecessary MRI delays
👥|Team|Stroke code teams improve coordination`,
    ),
    t(
      'pediatric-epilepsy-ketogenic',
      'PRACTICE_GUIDE',
      'Ketogenic Diet Protocols for Drug-Resistant Childhood Epilepsy',
      'Nutritional monitoring and seizure-frequency outcomes in clinical practice',
      ["Epilepsy","Ketogenic Diet","Pediatric Neurology","Seizure Control","Nutrition"],
      `Seizure reduction ≥50% | 52%
Seizure-free | 14%
Growth velocity impact | -6%
GI adverse events | 21%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🥑|Diet|Classic or modified Atkins after two failed antiseizure drugs
📊|Monitoring|Track growth, lipids, and acid-base status monthly
👨‍👩‍👧|Support|Dietitian-led family education improves adherence
🏥|Rescue|Emergency glucose protocol for hypoglycaemia`,
    ),
    t(
      'parkinsons-levodopa',
      'META_SUMMARY',
      'Levodopa-Based Therapy Timing in Early Parkinson Disease',
      'Motor outcomes, dyskinesia risk, and quality-of-life trade-offs',
      ["Parkinson Disease","Levodopa","Dopamine Agonist","Motor Fluctuations","Neurology"],
      `UPDRS motor improvement | -28%
Dyskinesia at 5y | 34%
QoL (PDQ-39) | -19%
Treatment satisfaction | 71%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `💊|Initiation|Levodopa remains most effective symptomatic therapy
⏳|Delay|Early agonist delay does not prevent long-term complications
🔄|Fluctuations|Plan for wearing-off before motor disability peaks
🧘|Multimodal|Combine physiotherapy and speech therapy early`,
    ),
    t(
      'ms-disease-modifying',
      'EVIDENCE_REVIEW',
      'Disease-Modifying Therapies for Relapsing-Remitting Multiple Sclerosis',
      'Comparative efficacy, safety, and monitoring requirements',
      ["Multiple Sclerosis","DMT","Relapsing-Remitting","Immunotherapy","Neurology"],
      `Annualised relapse rate | -52%
New MRI lesions | -68%
Disability progression | -21%
Serious infection | 3.2%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🛡️|Efficacy|High-efficacy agents for aggressive early disease
🦠|Safety|Screen for JC virus before natalizumab
💉|Adherence|Injection fatigue drives switches to oral agents
📅|Monitoring|Annual MRI and expanded disability status review`,
    ),
  ],
  'Dermatology': [
    t(
      'psoriasis-biologics',
      'EVIDENCE_REVIEW',
      'Comparative Effectiveness of IL-17 and IL-23 Inhibitors in Moderate-to-Severe Psoriasis',
      'Network meta-analysis with PASI 90 and safety endpoints',
      ["Psoriasis","Biologics","IL-17","IL-23","Dermatology"],
      `PASI 90 | 68%
PASI 100 | 41%
Psoriatic arthritis response | 54%
Serious infection | 2.1%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🎯|PASI 90|IL-17 and IL-23 agents achieve high skin clearance
🦴|Joints|Screen for psoriatic arthritis at every visit
💉|Persistence|Injection-site reactions most common adverse event
🔄|Switch|Secondary failure may warrant class change`,
    ),
    t(
      'melanoma-dermoscopy',
      'CLINICAL_EXPLAINER',
      'Dermoscopy Training for Primary Care Physicians: Melanoma Referral Accuracy',
      'Before-and-after study in urban outpatient clinics',
      ["Melanoma","Dermoscopy","Skin Cancer","Primary Care","Early Detection"],
      `Sensitivity | 89%
Specificity | 76%
Unnecessary referrals | -31%
Breslow thickness at diagnosis | -0.4 mm`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🔍|Pattern|Asymmetry, border, colour, diameter, evolution (ABCDE)
📸|Dermoscopy|Improves sensitivity for pigmented lesions
📤|Referral|Use 2-week wait pathway for suspicious lesions
☀️|Prevention|Counsel on UV protection at every skin check`,
    ),
    t(
      'atopic-dermatitis-pediatric',
      'PRACTICE_GUIDE',
      'Emollient Therapy and Flare Prevention in Pediatric Atopic Dermatitis',
      'Parent-reported outcomes from pragmatic community trials',
      ["Atopic Dermatitis","Emollients","Pediatric Dermatology","Eczema","Skin Barrier"],
      `EASI score reduction | -42%
Sleep disturbance | -35%
Flare frequency | -48%
Topical steroid use | -27%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🧴|Emollients|Apply liberally twice daily on intact skin
🔥|Flares|Step up to topical anti-inflammatory promptly
🧼|Bathing|Short lukewarm baths with immediate moisturising
🤧|Triggers|Address food and environmental allergens when relevant`,
    ),
    t(
      'acne-isotretinoin',
      'META_SUMMARY',
      'Isotretinoin for Severe Nodulocystic Acne: Efficacy and Monitoring Protocols',
      'Pooled clearance rates and iPLEDGE-equivalent safety practices',
      ["Acne","Isotretinoin","Retinoids","Dermatology","Adolescent Health"],
      `Clearance at 20 weeks | 85%
Relapse at 2 years | 22%
Depression signal | Not elevated in meta-analysis
Teratogenicity risk | Absolute contraindication in pregnancy`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `💊|Dosing|0.5–1 mg/kg/day cumulative target 120–150 mg/kg
🩸|Labs|Monitor lipids and LFTs at baseline and week 8
🤰|Pregnancy|Two forms of contraception and monthly pregnancy tests
💧|Dryness|Mucocutaneous dryness is expected and manageable`,
    ),
    t(
      'rosacea-topical-therapy',
      'EVIDENCE_REVIEW',
      'Topical and Oral Therapies for Rosacea: An Evidence-Based Treatment Algorithm',
      'Comparing ivermectin, metronidazole, and brimonidine for erythema and papules',
      ["Rosacea","Ivermectin","Facial Erythema","Dermatology","Chronic Skin Disease"],
      `IGA success | 62%
Erythema score | -41%
Burning/stinging | -29%
Relapse at 6 months | 33%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🔴|Subtype|Classify as erythematotelangiectatic, papulopustular, or phymatous
💊|First-line|Topical ivermectin or metronidazole for papules
🌡️|Triggers|Document alcohol, heat, and spicy food triggers
☀️|Sunscreen|Daily photoprotection reduces erythema flares`,
    ),
  ],
  'Family Medicine': [
    t(
      'hypertension-screening',
      'PRACTICE_GUIDE',
      'Opportunistic Blood Pressure Screening in Family Medicine Clinics',
      'Yield of newly detected hypertension and linkage to longitudinal care',
      ["Hypertension","Screening","Family Medicine","Primary Care","Linkage to Care"],
      `New hypertension detected | 18%
Stage 2 at diagnosis | 31%
Follow-up within 30 days | 74%
BP control at 6 months | 58%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🩺|Screen|Measure BP at every adult visit
📋|Confirm|Use out-of-office readings before labelling
🔗|Linkage|Schedule nurse follow-up within two weeks
📊|Registry|Track panel-level control rates quarterly`,
    ),
    t(
      'diabetes-prevention-lifestyle',
      'EVIDENCE_REVIEW',
      'Community Lifestyle Coaching for Prediabetes: Weight and Glucose Trajectories',
      'Pragmatic cluster trial in semi-urban family practices',
      ["Prediabetes","Lifestyle Intervention","Type 2 Diabetes","Family Medicine","Prevention"],
      `Diabetes incidence | -41%
Weight loss ≥5% | 48%
Fasting glucose | -12 mg/dL
Program completion | 63%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🏃|Activity|150 minutes moderate exercise weekly target
🥗|Diet|Mediterranean or DASH pattern counselling
⚖️|Weight|5–7% loss reduces conversion risk substantially
📅|OGTT|Repeat glucose testing annually in prediabetes`,
    ),
    t(
      'adult-vaccination-catchup',
      'CLINICAL_EXPLAINER',
      'Adult Immunisation Catch-Up in Primary Care: Coverage Gaps and Solutions',
      'Evidence review of influenza, pneumococcal, Tdap, and zoster schedules',
      ["Vaccination","Immunisation","Preventive Care","Family Medicine","Public Health"],
      `Influenza coverage | 52%
Pneumococcal uptake | 44%
Zoster vaccine | 38%
Missed opportunities | 67%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `💉|Schedule|Use EHR prompts at every eligible visit
📋|Catch-up|Document prior doses before recommending boosters
🤰|Pregnancy|Tdap each pregnancy; influenza in season
👴|Age 65+|Pneumococcal and zoster at milestone birthdays`,
    ),
    t(
      'multimorbidity-care-plans',
      'META_SUMMARY',
      'Structured Care Planning for Patients with Multimorbidity in Family Practice',
      'Pooled effects on hospitalisation, satisfaction, and polypharmacy',
      ["Multimorbidity","Care Planning","Polypharmacy","Family Medicine","Chronic Disease"],
      `Hospital admissions | -19%
Medication burden | -14%
Patient activation | +23%
GP visit frequency | +8%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `📋|Plan|Agree top three problems with patient priorities
💊|Deprescribing|Review preventive meds when life expectancy limited
🏠|Social|Screen for loneliness and carer strain
📞|Coordination|Named care coordinator for high-risk panel`,
    ),
    t(
      'depression-primary-care',
      'PRACTICE_GUIDE',
      'Detecting and Managing Depression in Family Medicine: PHQ-9 Based Pathways',
      'Stepped care from screening through pharmacotherapy and brief psychotherapy',
      ["Depression","PHQ-9","Stepped Care","Family Medicine","Mental Health"],
      `PHQ-9 reduction ≥5 | 62%
Remission at 12 weeks | 41%
Suicide risk identified | 8.3%
Referral to specialist | 19%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `📝|Screen|PHQ-2 followed by PHQ-9 when positive
💊|Treat|SSRIs first-line for moderate-to-severe depression
🗣️|Therapy|CBT or behavioural activation within 4 weeks
⚠️|Safety|Document suicide risk assessment at each visit`,
    ),
  ],
  'Endocrinology': [
    t(
      't2dm-hba1c-targets',
      'EVIDENCE_REVIEW',
      'Type 2 Diabetes: Understanding HbA1c Targets and Individualised Glycaemic Goals',
      'Plain-language synthesis of ADA and EASD consensus statements',
      ["Type 2 Diabetes","HbA1c","Glycaemic Targets","Endocrinology","Guidelines"],
      `Microvascular benefit | -25%
Hypoglycaemia with tight control | +38%
CV benefit with SGLT2/GLP-1 | -14%
Individualised target <7% | 64% of cohort`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🎯|Target|7.0% default; relax for frailty or hypoglycaemia risk
💊|Cardiorenal|SGLT2 inhibitors and GLP-1 RA for ASCVD or CKD
🩸|Monitoring|Quarterly HbA1c until stable, then biannual
👴|Frailty|Avoid tight targets when life expectancy <5 years`,
    ),
    t(
      'thyroid-nodule-fna',
      'CLINICAL_EXPLAINER',
      'Ultrasound-Guided Fine-Needle Aspiration of Thyroid Nodules: Bethesda Categories',
      'Five-year institutional pathology audit and malignancy risk stratification',
      ["Thyroid Nodule","FNA","Bethesda System","Endocrinology","Ultrasound"],
      `Category II benign | 62%
Category VI malignant | 4%
Indeterminate (III–IV) | 22%
Surgical malignancy rate | 28%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🔬|Bethesda|Use six-category reporting for all cytology
📏|Size|Biopsy nodules ≥1 cm with suspicious features
🧬|Molecular|Consider molecular testing for indeterminate nodules
👁️|Follow-up|Annual ultrasound for low-risk nodules`,
    ),
    t(
      'pcos-metformin-fertility',
      'META_SUMMARY',
      'Metformin and Lifestyle Intervention in PCOS: Ovulation and Live-Birth Rates',
      'Randomised factorial evidence in reproductive-age women',
      ["PCOS","Metformin","Infertility","Ovulation","Endocrinology"],
      `Ovulation rate | +56%
Live birth | +19%
Weight reduction | -4.2 kg
GI side effects | 31%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🏃|Lifestyle|7–10% weight loss restores ovulation in many women
💊|Metformin|Adjunct when lifestyle alone insufficient
🩺|Screen|Check glucose and lipids at diagnosis
🤰|Fertility|Letrozole first-line for ovulation induction`,
    ),
    t(
      'osteoporosis-bisphosphonates',
      'PRACTICE_GUIDE',
      'Bisphosphonate Therapy for Postmenopausal Osteoporosis: Duration and Monitoring',
      'Fracture risk reduction and drug holiday decision-making',
      ["Osteoporosis","Bisphosphonates","Fracture Prevention","DEXA","Endocrinology"],
      `Vertebral fracture | -49%
Hip fracture | -38%
BMD T-score gain | +5.8%
Atypical femur fracture | 0.04%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🦴|DEXA|Treat when T-score ≤-2.5 or FRAX above threshold
💊|Duration|Reassess after 3–5 years oral bisphosphonate
🦷|Dental|Complete invasive dental work before initiation
🥛|Calcium|Ensure adequate calcium and vitamin D intake`,
    ),
    t(
      'adrenal-incidentaloma',
      'EVIDENCE_REVIEW',
      'Management of Adrenal Incidentalomas: Hormonal Workup and Malignancy Risk',
      'Evidence-based approach to subclinical hypercortisolism and phaeochromocytoma screening',
      ["Adrenal Incidentaloma","Subclinical Cushing","Endocrinology","CT Imaging","Hormonal Workup"],
      `Malignancy rate | 4.2%
Autonomous cortisol secretion | 12%
Phaeochromocytoma | 1.8%
Growth on serial imaging | 6%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🔬|Biochem|1 mg dexamethasone suppression test for all
📏|Size|Resect lesions >4 cm or with suspicious imaging
📅|Surveillance|Annual imaging for stable benign lesions
⚡|Phaeo|Plasma metanephrines before any surgery`,
    ),
  ],
  'Psychiatry': [
    t(
      'major-depression-ssri-augmentation',
      'EVIDENCE_REVIEW',
      'Aripiprazole Augmentation in SSRI-Resistant Major Depressive Disorder',
      'Open-label extension with PHQ-9 and functional remission endpoints',
      ["Depression","SSRI","Aripiprazole","Augmentation","Psychiatry"],
      `Response rate | 52%
Remission (PHQ-9 <5) | 38%
Functional remission | 29%
Akathisia | 11%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `💊|Augment|Add aripiprazole after 6–8 weeks SSRI failure
📊|Measure|PHQ-9 every 4 weeks during titration
⚠️|Side effects|Monitor for akathisia and metabolic changes
🗣️|Therapy|Continue psychotherapy alongside pharmacotherapy`,
    ),
    t(
      'anxiety-cbt-telehealth',
      'CLINICAL_EXPLAINER',
      'Cognitive Behavioural Therapy via Telehealth for Generalised Anxiety Disorder',
      'Non-inferiority trial compared with in-person sessions',
      ["Anxiety","CBT","Telehealth","GAD","Psychiatry"],
      `GAD-7 reduction | -6.1
Non-inferiority met | Yes
Session attendance | 87%
Patient satisfaction | 4.3/5`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `📱|Access|Telehealth removes transport and wait-time barriers
🧠|CBT|Weekly 50-minute sessions for 12 weeks standard
📋|GAD-7|Track severity at baseline and weeks 4, 8, 12
🔗|Escalate|Refer when suicidality or psychosis emerges`,
    ),
    t(
      'bipolar-lithium-monitoring',
      'PRACTICE_GUIDE',
      'Lithium Therapy in Bipolar Disorder: Serum Monitoring and Renal Safety',
      'Long-term maintenance evidence and toxicity prevention',
      ["Bipolar Disorder","Lithium","Mood Stabiliser","Therapeutic Drug Monitoring","Psychiatry"],
      `Relapse prevention | -46%
Suicide reduction | -67%
Renal impairment at 20y | 12%
Tremor | 28%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🩸|Levels|Target 0.6–0.8 mmol/L for maintenance
🫘|Renal|Monitor eGFR and TSH every 6 months
💧|Hydration|Counsel on dehydration and NSAID avoidance
🤰|Pregnancy|High teratogenicity risk — plan pregnancy carefully`,
    ),
    t(
      'adhd-adult-pharmacotherapy',
      'META_SUMMARY',
      'Pharmacotherapy for Adult ADHD: Stimulant and Non-Stimulant Comparative Efficacy',
      'Pooled symptom reduction and cardiovascular safety signals',
      ["ADHD","Methylphenidate","Adult Psychiatry","Attention Deficit","Pharmacotherapy"],
      `ASRS score reduction | -38%
Functional improvement | +31%
Insomnia | 19%
CV events | Not elevated vs control`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `💊|First-line|Stimulants most effective for core symptoms
❤️|Cardiac|Screen BP and history before stimulant start
📋|Diagnosis|Confirm childhood onset and functional impairment
🔄|Switch|Atomoxetine when stimulant intolerance or SUD risk`,
    ),
    t(
      'ptsd-trauma-focused-cbt',
      'EVIDENCE_REVIEW',
      'Trauma-Focused CBT and EMDR for Post-Traumatic Stress Disorder',
      'Comparative efficacy for civilian and veteran populations',
      ["PTSD","Trauma-Focused CBT","EMDR","Psychiatry","Psychotherapy"],
      `CAPS-5 reduction | -42%
Loss of diagnosis | 54%
Dropout | 16%
Comorbid depression improvement | -35%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🧠|First-line|Trauma-focused CBT or EMDR before medication
⏱️|Duration|8–12 sessions with between-session practice
⚠️|Safety|Stabilise substance use before trauma processing
💊|Adjunct|SSRI when psychotherapy access limited`,
    ),
  ],
  'Pediatrics': [
    t(
      'childhood-asthma-inhaler',
      'PRACTICE_GUIDE',
      'Metered-Dose Inhaler Technique in School-Age Children with Persistent Asthma',
      'Video-assisted coaching versus standard inhaler education',
      ["Pediatric Asthma","Inhaler Technique","Spacer Device","Pediatrics","Self-Management"],
      `Technique mastery | 78%
Exacerbations | -34%
School absence days | -41%
ED visits | -27%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🫁|Technique|Teach slow deep inhalation with spacer
📹|Video|Demonstration improves retention at 3 months
📋|Action plan|Provide written asthma action plan to school
🔍|Triggers|Assess allergens and exercise triggers`,
    ),
    t(
      'neonatal-jaundice-phototherapy',
      'CLINICAL_EXPLAINER',
      'Phototherapy Thresholds for Neonatal Hyperbilirubinemia in South Asian Newborns',
      'Prospective cohort aligned with updated AAP guidance',
      ["Neonatal Jaundice","Phototherapy","Hyperbilirubinemia","Pediatrics","Newborn Care"],
      `Kernicterus cases | 0
Exchange transfusion | 1.2%
Readmission for jaundice | 8.4%
Breastfeeding continuation | 91%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `📊|BiliTool|Use gestational-age-specific nomograms
☀️|Phototherapy|Start per hour-specific thresholds
🤱|Breastfeeding|Continue feeding during phototherapy
📅|Follow-up|Outpatient bili check 24–48 hours after discharge`,
    ),
    t(
      'pediatric-obesity-lifestyle',
      'EVIDENCE_REVIEW',
      'Family-Based Lifestyle Intervention for Adolescent Obesity',
      'Structured physical activity and dietary counselling in community settings',
      ["Pediatric Obesity","Lifestyle Intervention","Adolescent Health","BMI","Pediatrics"],
      `BMI z-score change | -0.18
Waist circumference | -4.2 cm
Metabolic syndrome | -22%
Program retention | 58%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `👨‍👩‍👧|Family|Parent participation doubles effect size
🏃|Activity|60 minutes daily moderate-to-vigorous activity
🥗|Diet|Reduce sugar-sweetened beverages as first step
🧠|Stigma|Use neutral language; avoid weight-focused shaming`,
    ),
    t(
      'pediatric-vaccination-schedule',
      'PRACTICE_GUIDE',
      'On-Time Childhood Immunisation: Barriers and Evidence-Based Solutions',
      'Coverage rates for DTaP, MMR, HPV, and meningococcal vaccines',
      ["Vaccination","Immunisation Schedule","Pediatrics","HPV Vaccine","Public Health"],
      `On-time series completion | 72%
HPV initiation by age 13 | 54%
Missed visit catch-up | +28% with recall
Vaccine hesitancy encounters | 19%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `💉|Schedule|Follow national immunisation calendar exactly
📞|Recall|Automated SMS reminders improve on-time rates
🗣️|Hesitancy|Use motivational interviewing, not confrontation
📋|Record|Verify prior doses from national registry`,
    ),
    t(
      'febrile-seizure-guidance',
      'CLINICAL_EXPLAINER',
      'Simple Febrile Seizures in Children: Parent Counselling and Recurrence Risk',
      'Evidence-based reassurance and red-flag criteria for neuroimaging',
      ["Febrile Seizure","Pediatric Emergency","Parent Education","Pediatrics","Fever"],
      `Recurrence within 2y | 32%
Epilepsy later | 1.2%
Neuroimaging yield | 0.8%
Parent anxiety reduction | -45%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🌡️|Definition|Generalised seizure with fever, age 6m–5y, no CNS infection
🧠|Imaging|Not routine for simple febrile seizures
💊|Prophylaxis|Antipyretics do not prevent recurrence
📋|Counsel|Provide written seizure first-aid instructions`,
    ),
  ],
  'Orthopedics': [
    t(
      'knee-oa-prp',
      'EVIDENCE_REVIEW',
      'Platelet-Rich Plasma Injections for Knee Osteoarthritis: Six-Month Functional Outcomes',
      'Double-blind placebo-controlled study in adults aged 45–70',
      ["Knee Osteoarthritis","PRP","Intra-Articular Injection","Orthopedics","Joint Pain"],
      `WOMAC pain | -32%
KOOS function | +24%
Placebo response | 18%
Adverse events | 4%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `💉|PRP|Modest benefit over saline at 6 months
🏃|Exercise|Supervised physiotherapy remains cornerstone
⚖️|Weight|5% weight loss reduces joint load substantially
🔪|Surgery|Reserve arthroplasty for refractory disability`,
    ),
    t(
      'rotator-cuff-conservative',
      'PRACTICE_GUIDE',
      'Non-Operative Management of Partial-Thickness Rotator Cuff Tears',
      'Evidence review of physiotherapy and corticosteroid injection strategies',
      ["Rotator Cuff","Shoulder Pain","Physiotherapy","Orthopedics","Conservative Care"],
      `Pain reduction | -48%
Function (ASES) | +36%
Surgery avoided at 1y | 74%
Retear on MRI | 12%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🏋️|Physio|Eccentric strengthening programme 12 weeks
💉|Injection|Subacromial steroid for short-term flare relief
📷|Imaging|MRI not required before conservative trial
⏳|Surgery|Consider after 3–6 months failed rehab`,
    ),
    t(
      'hip-fracture-orthogeriatric',
      'CLINICAL_EXPLAINER',
      'Orthogeriatric Co-Management After Hip Fracture: Length of Stay and Complications',
      'Interrupted time-series analysis at a tertiary trauma centre',
      ["Hip Fracture","Orthogeriatrics","Geriatric Co-Management","Orthopedics","Trauma"],
      `Length of stay | -3.2 days
In-hospital mortality | -28%
Delirium incidence | -19%
Discharge to home | +22%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `👴|Co-manage|Joint orthopaedic-geriatric ward rounds
🦴|Surgery|Operate within 48 hours when medically fit
🧠|Delirium|Multicomponent prevention bundle on admission
🏠|Rehab|Early mobilisation day 1 post-operatively`,
    ),
    t(
      'lumbar-spinal-stenosis',
      'META_SUMMARY',
      'Surgical Versus Conservative Treatment for Lumbar Spinal Stenosis',
      'Pooled functional outcomes and complication rates',
      ["Spinal Stenosis","Lumbar Spine","Decompression","Orthopedics","Neurogenic Claudication"],
      `ODI improvement surgical | -32%
ODI improvement conservative | -18%
Reoperation at 4y | 12%
Serious complication | 3.4%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🚶|Claudication|Neurogenic claudication hallmark symptom
💊|Conservative|NSAIDs, physio, epidural trial first
🔪|Surgery|Decompression when disability refractory
⚠️|Fusion|Avoid routine fusion for stenosis alone`,
    ),
    t(
      'acl-reconstruction-rehab',
      'PRACTICE_GUIDE',
      'ACL Reconstruction Rehabilitation Protocols: Return-to-Sport Criteria',
      'Evidence-based milestones from graft healing to competitive play',
      ["ACL Injury","Reconstruction","Rehabilitation","Sports Medicine","Orthopedics"],
      `Return to sport | 68% at 12 months
Graft re-rupture | 6.2%
Lysholm score | 89 at 1 year
Quadriceps strength deficit | 12%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🦵|Graft|Hamstring or patellar tendon autograft most common
📊|Criteria|≥90% limb symmetry index before return
⏱️|Timeline|Earliest return 9 months; majority at 12
🏃|Plyometrics|Progressive agility after 6 months`,
    ),
  ],
  'Gynecology': [
    t(
      'antenatal-anaemia-iron',
      'EVIDENCE_REVIEW',
      'Intravenous Iron Versus Oral Iron for Antenatal Anaemia in the Second Trimester',
      'Haemoglobin response and maternal fatigue scores at 34 weeks',
      ["Antenatal Anaemia","Iron Deficiency","Pregnancy","IV Iron","Gynecology"],
      `Hb rise at 4 weeks | +1.8 g/dL
Fatigue score | -31%
GI side effects | 8% vs 42%
Preterm birth | No difference`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🩸|Screen|Check Hb at booking and 28 weeks
💉|IV iron|Consider when oral not tolerated or Hb <9 g/dL
🤰|Safety|IV iron safe in second and third trimesters
🍼|Breastfeeding|Continue iron postpartum if depleted`,
    ),
    t(
      'gestational-diabetes-screening',
      'PRACTICE_GUIDE',
      'Postpartum Glucose Screening Uptake After Gestational Diabetes Mellitus',
      'Retrospective review of OGTT completion at 6–12 weeks',
      ["Gestational Diabetes","Postpartum Screening","OGTT","Gynecology","Type 2 Diabetes"],
      `OGTT completion | 38%
Diabetes detected | 12%
Prediabetes | 28%
Lifestyle referral | 45%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `📋|Screen|75 g OGTT at 6–12 weeks postpartum
🤱|Counsel|50% lifetime T2DM risk after GDM
🏃|Lifestyle|Refer to diabetes prevention programme
💊|Breastfeeding|Protective against persistent dysglycaemia`,
    ),
    t(
      'endometriosis-diagnostic-delay',
      'CLINICAL_EXPLAINER',
      'Diagnostic Interval in Endometriosis: Symptom Onset to Surgical Confirmation',
      'Patient-reported timelines from a multicentre survey',
      ["Endometriosis","Diagnostic Delay","Dysmenorrhoea","Gynecology","Women's Health"],
      `Median diagnostic delay | 7.4 years
Prior misdiagnosis | 68%
Surgical confirmation | 84%
Quality of life impact | Severe in 41%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🔴|Symptoms|Chronic pelvic pain and dysmenorrhoea key clues
📷|Imaging|Transvaginal ultrasound by experienced operator
🔪|Laparoscopy|Gold standard for definitive diagnosis
🤝|Believe|Validate patient symptoms to reduce delay`,
    ),
    t(
      'cervical-screening-hpv',
      'EVIDENCE_REVIEW',
      'Primary HPV Screening for Cervical Cancer Prevention: Transition from Cytology',
      'Comparative sensitivity for CIN2+ detection and colposcopy referral rates',
      ["Cervical Cancer","HPV Screening","Pap Smear","Gynecology","Prevention"],
      `CIN2+ sensitivity | 94%
Colposcopy referral | +18%
Cancer incidence reduction | -62%
Self-sampling uptake | +24%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🧬|HPV|Primary HPV testing every 5 years age 30–65
💉|Vaccine|HPV vaccination complementary to screening
📋|Triage|Cytology reflex for HPV-positive results
🔔|Recall|Automated reminders improve screening coverage`,
    ),
    t(
      'menopause-hrt',
      'META_SUMMARY',
      'Menopausal Hormone Therapy: Benefits, Risks, and Timing Hypothesis',
      'Pooled cardiovascular and fracture outcomes by age at initiation',
      ["Menopause","Hormone Therapy","Vasomotor Symptoms","Gynecology","Women's Health"],
      `Vasomotor relief | 85%
Fracture reduction | -34%
VTE risk | +2 per 1000
Breast cancer (combined) | Small increased risk`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `⏱️|Window|Initiate before age 60 or within 10 years of menopause
💊|Regimen|Lowest effective dose transdermal oestrogen preferred
🦴|Bone|HRT reduces fracture when started early
⚠️|Contraindicate|Avoid with prior breast cancer or VTE`,
    ),
  ],
  'Gastroenterology': [
    t(
      'ibd-biologics-sequencing',
      'EVIDENCE_REVIEW',
      'Biologic Therapy Sequencing in Moderate-to-Severe Crohn Disease',
      'Comparative persistence and steroid-sparing outcomes',
      ["Crohn Disease","Biologics","Anti-TNF","Gastroenterology","IBD"],
      `Steroid-free remission | 48%
Mucosal healing | 36%
Treatment persistence at 1y | 62%
Serious infection | 3.8%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `💊|Step-up|Thiopurine optimisation before biologic switch
🎯|Target|Mucosal healing as treatment endpoint
🩺|Monitor|Therapeutic drug monitoring for anti-TNF
💉|Switch|Class change after primary non-response`,
    ),
    t(
      'h-pylori-eradication',
      'PRACTICE_GUIDE',
      'Bismuth Quadruple Therapy for Helicobacter pylori Eradication',
      'Culture-guided regimen selection in high-resistance regions',
      ["Helicobacter pylori","Eradication","Bismuth Quadruple","Gastroenterology","Peptic Ulcer"],
      `Eradication rate | 88%
Clarithromycin resistance | 34%
Adherence | 76%
Dyspepsia improvement | 71%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🔬|Test|Confirm eradication with urea breath test
💊|Regimen|Bismuth quadruple when clarithromycin resistance high
⚠️|Resistance|Local antibiogram should guide first-line choice
🔄|Retreat|Never repeat same failed regimen`,
    ),
    t(
      'nafld-fibrosis-scores',
      'CLINICAL_EXPLAINER',
      'FIB-4 and ELF Score Performance in Detecting Advanced Fibrosis in NAFLD',
      'Cross-sectional validation cohort with liver biopsy reference',
      ["NAFLD","FIB-4","Liver Fibrosis","Gastroenterology","Metabolic Liver Disease"],
      `FIB-4 AUROC | 0.82
NPV for advanced fibrosis | 93%
Biopsy avoided | 68%
NASH prevalence | 24%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `📊|FIB-4|First-line non-invasive fibrosis assessment
⚖️|Metabolic|Weight loss 7–10% improves steatosis and fibrosis
🍺|Alcohol|Document alcohol intake; rule out other liver disease
🔪|Biopsy|Reserve for indeterminate non-invasive results`,
    ),
    t(
      'gerd-ppi-longterm',
      'META_SUMMARY',
      'Long-Term Proton Pump Inhibitor Use in GERD: Efficacy and Safety Review',
      'Pooled healing rates and micronutrient deficiency signals',
      ["GERD","PPI","Reflux Disease","Gastroenterology","Acid Suppression"],
      `Oesophagitis healing | 84%
Symptom control | 78%
C difficile risk | OR 1.4
Magnesium deficiency | 1.2%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `💊|PPI|Most effective for erosive oesophagitis
🔄|Step-down|Trial lowest effective dose after healing
🍽️|Lifestyle|Weight loss and head-of-bed elevation adjunctive
⚠️|Long-term|Reassess indication annually`,
    ),
    t(
      'colorectal-screening-colonoscopy',
      'PRACTICE_GUIDE',
      'Colorectal Cancer Screening with Colonoscopy: Quality Indicators and Adenoma Detection',
      'Benchmark adenoma detection rates and interval cancer prevention',
      ["Colorectal Cancer","Colonoscopy","Screening","Gastroenterology","Prevention"],
      `Adenoma detection rate | 32%
Interval cancer | 0.04%
Cecal intubation | 97%
Serious complication | 0.08%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🎯|ADR|Target ≥25% (≥30% in men, ≥20% in women)
⏱️|Withdrawal|Minimum 6-minute withdrawal time
📅|Interval|10-year follow-up after normal screening
💊|Prep|Split-dose bowel preparation improves detection`,
    ),
  ],
  'General Surgery': [
    t(
      'acute-appendicitis-management',
      'EVIDENCE_REVIEW',
      'Antibiotics Versus Appendicectomy for Uncomplicated Acute Appendicitis',
      'Shared decision-making and recurrence after non-operative management',
      ["Appendicitis","Appendicectomy","Antibiotics","General Surgery","Acute Abdomen"],
      `Treatment success antibiotics | 72%
Recurrence at 1y | 27%
Complications antibiotics | 8%
Length of stay surgery | 1.2 days`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🔪|Surgery|Gold standard with low complication rate
💊|Antibiotics|Option for uncomplicated appendicitis with informed consent
📷|CT|Imaging reduces negative appendicectomy rate
⚠️|Perforation|Operate urgently when perforation suspected`,
    ),
    t(
      'inguinal-hernia-repair',
      'CLINICAL_EXPLAINER',
      'Lichtenstein Versus Laparoscopic Inguinal Hernia Repair: Chronic Pain Outcomes',
      'Comparative cohort from high-volume hernia centres',
      ["Inguinal Hernia","Hernia Repair","Lichtenstein","Laparoscopic","General Surgery"],
      `Recurrence | 1.8%
Chronic pain at 1y | 12%
Return to work | 7 days lap vs 14 open
Seroma | 8%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🔧|Mesh|Mesh repair standard of care
🏥|Laparoscopic|Preferred for bilateral or recurrent hernias
💊|Pain|Multimodal analgesia reduces chronic pain
⚠️|Emergency|Strangulation requires urgent surgery`,
    ),
    t(
      'cholelithiasis-lap-chole',
      'PRACTICE_GUIDE',
      'Laparoscopic Cholecystectomy for Symptomatic Cholelithiasis: Indications and Timing',
      'Early cholecystectomy versus interval surgery after acute cholecystitis',
      ["Gallstones","Cholecystectomy","Cholecystitis","General Surgery","Biliary Disease"],
      `Symptom resolution | 92%
Bile duct injury | 0.3%
Early surgery conversion | 8%
Readmission | 4.2%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🔪|Timing|Index admission cholecystectomy for acute cholecystitis
📷|Imaging|Ultrasound first-line; MRCP if duct dilatation
⚠️|CBD stones|ERCP before or during cholecystectomy
🍽️|Diet|Low-fat diet post-op until symptoms settle`,
    ),
    t(
      'breast-cancer-surgery',
      'META_SUMMARY',
      'Breast-Conserving Surgery Versus Mastectomy for Early Breast Cancer',
      'Pooled survival and local recurrence outcomes',
      ["Breast Cancer","Lumpectomy","Mastectomy","General Surgery","Oncologic Surgery"],
      `Overall survival | Equivalent
Local recurrence BCS+RT | 6.2%
Cosmesis satisfaction | 81%
Re-excision rate | 18%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🎯|Equivalent|BCS plus radiotherapy equals mastectomy survival
☢️|Radiotherapy|Mandatory after breast-conserving surgery
🔬|Margins|No tumour on ink for invasive cancer
👥|MDT|Multidisciplinary team decision for all cases`,
    ),
    t(
      'trauma-damage-control',
      'EVIDENCE_REVIEW',
      'Damage-Control Surgery in Abdominal Trauma: Principles and Outcomes',
      'Abbreviated laparotomy, resuscitation, and planned re-exploration',
      ["Trauma Surgery","Damage Control","Abdominal Trauma","General Surgery","Critical Care"],
      `Mortality reduction | -22%
Abdominal compartment syndrome | 8%
Fascial closure | 78%
ARDS incidence | 24%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🩸|ABC|Address haemorrhage before definitive repair
🔪|Abbreviate|Pack and close temporarily in exsanguinating trauma
🌡️|Rewarm|Correct hypothermia, acidosis, coagulopathy
📅|Re-explore|Planned return to theatre at 24–48 hours`,
    ),
  ],
  'Oncology': [
    t(
      'breast-cancer-immunotherapy',
      'EVIDENCE_REVIEW',
      'Immunotherapy in Triple-Negative Breast Cancer: PD-L1 and Beyond',
      'Checkpoint inhibitor combinations in early and metastatic settings',
      ["Breast Cancer","Immunotherapy","Triple-Negative","Oncology","PD-L1"],
      `pCR with chemo-IO | 64%
PFS improvement metastatic | +4.1 months
Immune-related AE | 18%
OS benefit | HR 0.78`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🧬|PD-L1|Test CPS before pembrolizumab in metastatic TNBC
💊|Neoadjuvant|Checkpoint inhibitor plus chemotherapy in early TNBC
⚠️|Toxicity|Monitor for pneumonitis, colitis, endocrinopathies
👥|MDT|Tumour board review for all stage III–IV cases`,
    ),
    t(
      'lung-cancer-screening-ldct',
      'CLINICAL_EXPLAINER',
      'Low-Dose CT Lung Cancer Screening in High-Risk Smokers',
      'NLST and NELSON trial evidence applied to screening programmes',
      ["Lung Cancer","LDCT Screening","Smoking Cessation","Oncology","Early Detection"],
      `Lung cancer mortality reduction | -20%
False positive rate | 23%
Stage I detection | 68%
Smoking cessation uptake | 14%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🚬|Eligibility|Age 50–80, ≥20 pack-year history
📷|LDCT|Annual scan; not chest X-ray
🛑|Cessation|Integrate smoking cessation at every screen
📋|Follow-up|Lung-RADS classification guides interval`,
    ),
    t(
      'immunotherapy-irae',
      'PRACTICE_GUIDE',
      'Managing Immune-Related Adverse Events from Checkpoint Inhibitors',
      'Grade-based corticosteroid and infliximab protocols',
      ["Immunotherapy","irAE","Checkpoint Inhibitor","Oncology","Toxicity Management"],
      `Any grade irAE | 42%
Grade 3–4 | 12%
Colitis most common | 18%
Treatment discontinuation | 15%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `📋|Educate|Patient wallet card with irAE symptoms
💊|Steroids|Prednisone 1 mg/kg for grade 2+ events
🔪|Hold|Interrupt immunotherapy for grade 2+ irAE
🚨|Emergency|Adrenal crisis and myocarditis are life-threatening`,
    ),
    t(
      'palliative-care-early',
      'META_SUMMARY',
      'Early Palliative Care Integration in Advanced Cancer: Survival and Quality of Life',
      'Pooled outcomes from randomised trials of concurrent oncology and palliative care',
      ["Palliative Care","Advanced Cancer","Quality of Life","Oncology","Supportive Care"],
      `QoL improvement | +28%
Depression reduction | -35%
Survival benefit | +2.7 months
Hospitalisation | -19%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🤝|Early|Introduce palliative care at diagnosis of advanced disease
💬|Goals|Regular goals-of-care conversations
💊|Symptoms|Proactive pain and nausea management
🏠|Home|Home-based palliative support when preferred`,
    ),
    t(
      'colorectal-chemo-adjuvant',
      'EVIDENCE_REVIEW',
      'Adjuvant Chemotherapy for Stage III Colon Cancer: FOLFOX Versus Capecitabine',
      'Three-year disease-free survival and neuropathy trade-offs',
      ["Colon Cancer","Adjuvant Chemotherapy","FOLFOX","Oncology","GI Oncology"],
      `3-year DFS FOLFOX | 76%
3-year DFS capecitabine | 68%
Grade 3 neuropathy | 12%
Treatment completion | 81%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `💊|Stage III|Adjuvant chemo standard for all fit patients
🧬|MSI|Consider immunotherapy for MSI-high stage III
⏱️|Duration|6 months FOLFOX preferred over 3 months high-risk
📊|Oncotype|Not validated for adjuvant decision in colon cancer`,
    ),
  ],
  'Pulmonology': [
    t(
      'asthma-biologic-therapy',
      'EVIDENCE_REVIEW',
      'Biologic Therapies for Severe Eosinophilic Asthma: Anti-IL-5 and Anti-IgE',
      'Exacerbation reduction and oral corticosteroid sparing',
      ["Severe Asthma","Biologics","Eosinophilic Asthma","Pulmonology","Omalizumab"],
      `Exacerbations | -48%
OCS dose reduction | -62%
FEV1 improvement | +220 mL
Anaphylaxis | <0.1%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🧬|Phenotype|Measure eosinophils and IgE before biologic selection
💉|Omalizumab|Anti-IgE for allergic phenotype
💊|Step down|Only after 6 months stable on biologic
📋|Refer|Specialist referral for GINA step 5 asthma`,
    ),
    t(
      'copd-gold-staging',
      'CLINICAL_EXPLAINER',
      'GOLD 2024 COPD Classification and Initial Pharmacotherapy',
      'ABE grouping and inhaler selection by symptom and exacerbation burden',
      ["COPD","GOLD Guidelines","Inhaler Therapy","Pulmonology","Chronic Lung Disease"],
      `Exacerbation reduction LAMA | -17%
Symptom improvement | -2.1 CAT points
Mortality LAMA+LABA | HR 0.84
Pneumonia with ICS | +1.5%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🚭|Smoking|Cessation is most effective intervention
💨|LAMA|Long-acting muscarinic antagonist first-line
⚠️|ICS|Avoid ICS monotherapy; reserve for eosinophilic COPD
🏃|Rehab|Pulmonary rehabilitation improves exercise tolerance`,
    ),
    t(
      'osa-cpap-adherence',
      'PRACTICE_GUIDE',
      'CPAP Adherence Strategies in Obstructive Sleep Apnoea',
      'Behavioural interventions and cardiovascular outcome benefits',
      ["Sleep Apnoea","CPAP","Adherence","Pulmonology","Sleep Medicine"],
      `Adherence ≥4h/night | 58%
ESS reduction | -7.2
Motor vehicle accidents | -52%
Cardiovascular events | -18%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `😴|Diagnose|Home sleep test or polysomnography for high suspicion
💨|CPAP|First-line for moderate-to-severe OSA
📞|Support|Telemonitoring improves adherence
⚖️|Weight|Weight loss reduces apnoea severity`,
    ),
    t(
      'ild-antifibrotic',
      'META_SUMMARY',
      'Antifibrotic Therapy in Idiopathic Pulmonary Fibrosis: Pirfenidone and Nintedanib',
      'Pooled decline in forced vital capacity and mortality signals',
      ["Pulmonary Fibrosis","IPF","Antifibrotic","Pulmonology","Interstitial Lung Disease"],
      `FVC decline reduction | -48%
Progression-free survival | +6 months
GI side effects | 34%
Mortality trend | HR 0.87`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🔬|Diagnose|HRCT pattern and MDD consensus required
💊|Treat|Start antifibrotic at diagnosis without delay
🫁|Refer|Lung transplant evaluation early
💉|Vaccinate|Annual influenza and pneumococcal vaccines`,
    ),
    t(
      'community-pneumonia-guidelines',
      'EVIDENCE_REVIEW',
      'Community-Acquired Pneumonia: CURB-65 Stratification and Antibiotic Selection',
      'Outpatient versus inpatient management and duration of therapy',
      ["Pneumonia","CURB-65","Antibiotic Therapy","Pulmonology","Infectious Disease"],
      `30-day mortality low risk | 0.6%
Hospitalisation avoided | 62%
Treatment failure | 8.4%
Duration 5 vs 7 days | Equivalent`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `📊|CURB-65|Score 0–1 outpatient; ≥3 consider ICU
💊|Antibiotics|Amoxicillin or doxycycline first-line outpatient
⏱️|Duration|5 days adequate for uncomplicated CAP
💉|Vaccinate|Pneumococcal and influenza vaccines after recovery`,
    ),
  ],
  'Nephrology': [
    t(
      'ckd-progression-acei',
      'EVIDENCE_REVIEW',
      'ACE Inhibitors and ARBs for CKD Progression: Albuminuria-Lowering Benefits',
      'Kidney outcomes in diabetic and non-diabetic chronic kidney disease',
      ["CKD","ACE Inhibitor","Albuminuria","Nephrology","Renoprotection"],
      `Albuminuria reduction | -38%
ESKD progression | -22%
Hyperkalaemia | 8.2%
Acute kidney injury | 4.1%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🩸|UACR|Screen for albuminuria in all diabetes and hypertension
💊|RAAS|ACEi or ARB when albuminuria present
⚠️|K+|Monitor potassium within 2 weeks of initiation
📉|eGFR|Accept up to 30% creatinine rise if stable`,
    ),
    t(
      'dialysis-vascular-access',
      'CLINICAL_EXPLAINER',
      'Arteriovenous Fistula Versus Graft for Haemodialysis Vascular Access',
      'Patency, infection, and mortality outcomes from national registry data',
      ["Dialysis","Vascular Access","AVF","Nephrology","Haemodialysis"],
      `Primary patency AVF | 62% at 1y
Infection rate graft | 3x higher
Catheter mortality | HR 1.6
AVF maturation | 68%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🦴|Fistula|First-choice access when veins suitable
⏱️|Refer|Nephrology referral when eGFR <30
🚫|Catheter|Avoid tunnelled catheter as permanent access
📅|Plan|Create AVF 6 months before anticipated dialysis`,
    ),
    t(
      'aki-hospitalised',
      'PRACTICE_GUIDE',
      'Acute Kidney Injury in Hospitalised Patients: Prevention and KDIGO Staging',
      'Nephrotoxin avoidance and fluid management protocols',
      ["Acute Kidney Injury","KDIGO","Nephrotoxin","Nephrology","Hospital Medicine"],
      `AKI incidence | 22%
Dialysis-requiring | 2.4%
Recovery at discharge | 68%
Mortality stage 3 | 28%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `📊|KDIGO|Stage by creatinine rise and urine output
💊|Nephrotoxins|Hold NSAIDs, ACEi, metformin when AKI
💧|Fluids|Avoid fluid overload in oliguric AKI
🔬|Workup|Urinalysis and renal ultrasound when indicated`,
    ),
    t(
      'hypertension-ckd-targets',
      'META_SUMMARY',
      'Blood Pressure Targets in CKD: Cardiovascular and Renal Outcomes',
      'Pooled analysis of intensive versus standard BP control',
      ["CKD","Hypertension","BP Targets","Nephrology","Cardiorenal"],
      `CV events | -18%
ESKD progression | -12%
Hypotension symptoms | +9%
Target <130/80 | Recommended`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🎯|Target|<130/80 mmHg when albuminuria present
💊|Agents|ACEi/ARB first-line with loop diuretic as needed
🏠|Home BP|Out-of-office readings guide titration
👴|Individualise|Relax targets with frailty or symptomatic hypotension`,
    ),
    t(
      'proteinuria-membranous',
      'EVIDENCE_REVIEW',
      'Primary Membranous Nephropathy: PLA2R Antibodies and Immunosuppressive Therapy',
      'Rituximab versus cyclophosphamide-based regimens',
      ["Membranous Nephropathy","PLA2R","Rituximab","Nephrology","Glomerular Disease"],
      `Remission rituximab | 64%
Relapse at 2y | 18%
Infection serious | 6.2%
Spontaneous remission low-risk | 38%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🧬|PLA2R|Serology guides diagnosis and monitoring
⚠️|Risk|Conservative management if low-risk features
💊|Rituximab|First-line immunosuppression for high-risk
📊|Proteinuria|Nephrotic-range proteinuria warrants biopsy`,
    ),
  ],
  'Rheumatology': [
    t(
      'ra-methotrexate-early',
      'EVIDENCE_REVIEW',
      'Early Methotrexate Initiation in Rheumatoid Arthritis: Tight Control Strategies',
      'Disease activity scores and radiographic progression at 12 months',
      ["Rheumatoid Arthritis","Methotrexate","DAS28","Rheumatology","DMARD"],
      `DAS28 remission | 42%
Radiographic progression | -56%
Folic acid reduces toxicity | Yes
Hepatotoxicity | 2.8%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `💊|Early|Start methotrexate within 3 months of diagnosis
📊|Target|Treat-to-target DAS28 <2.6 or clinical remission
🩺|Monitor|LFTs and FBC every 8–12 weeks
💉|Biologic|Add when methotrexate inadequate response`,
    ),
    t(
      'sle-hydroxychloroquine',
      'CLINICAL_EXPLAINER',
      'Hydroxychloroquine in Systemic Lupus Erythematosus: Organ Protection and Monitoring',
      'Retinal screening protocols and flare prevention evidence',
      ["Lupus","SLE","Hydroxychloroquine","Rheumatology","Autoimmune"],
      `Flare reduction | -48%
Damage accrual | -32%
Retinopathy at 5y | 0.5%
Pregnancy safety | Compatible`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `💊|Foundation|HCQ for nearly all SLE patients unless contraindicated
👁️|Eye|Annual retinal screening after 5 years use
☀️|Sun|UV protection reduces cutaneous flares
🤰|Pregnancy|Continue HCQ; coordinate high-risk OB care`,
    ),
    t(
      'gout-urate-lowering',
      'PRACTICE_GUIDE',
      'Urate-Lowering Therapy in Gout: Allopurinol Titration and Flare Prophylaxis',
      'Treat-to-target serum urate below 360 µmol/L',
      ["Gout","Allopurinol","Urate Lowering","Rheumatology","Crystal Arthropathy"],
      `SUA <360 µmol/L | 68% at 1y
Flare during titration | 42%
Tophi resolution | 54% at 2y
HLA-B*5801 testing | Recommended in high-risk`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🎯|Target|Serum urate <360 µmol/L (<300 if tophi)
💊|Prophylaxis|Colchicine or NSAID during uptitration
🧬|HLA-B*5801|Test before allopurinol in South Asian patients
🍺|Lifestyle|Reduce alcohol and fructose intake`,
    ),
    t(
      'oa-nsaid-topical',
      'META_SUMMARY',
      'Topical NSAIDs Versus Oral NSAIDs for Knee Osteoarthritis Pain',
      'Pooled pain relief and gastrointestinal safety comparison',
      ["Osteoarthritis","Topical NSAID","Knee Pain","Rheumatology","Analgesia"],
      `Pain relief WOMAC | Equivalent
GI bleeding | -72% vs oral
Local skin reaction | 8%
Function improvement | Moderate`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🧴|Topical|First-line pharmacotherapy for knee OA
⚠️|Oral|Reserve oral NSAIDs for short courses
🏃|Exercise|Structured exercise as effective as analgesics
⚖️|Weight|Weight loss reduces pain and progression`,
    ),
    t(
      'osteoporosis-denosumab',
      'EVIDENCE_REVIEW',
      'Denosumab for Osteoporosis: Fracture Prevention and Rebound Vertebral Risk',
      'Treatment duration, discontinuation protocols, and bisphosphonate transition',
      ["Osteoporosis","Denosumab","Vertebral Fracture","Rheumatology","Bone Health"],
      `Vertebral fracture reduction | -68%
Rebound fractures after stop | 7% without transition
Hip fracture | -40%
Hypocalcaemia | 1.8%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `💉|Denosumab|Six-monthly injection option when oral not tolerated
⚠️|Discontinue|Transition to bisphosphonate — never stop abruptly
🦷|Dental|Complete dental work before initiation
🩸|Calcium|Ensure vitamin D replete before each dose`,
    ),
  ],
  'Ophthalmology': [
    t(
      'glaucoma-first-line',
      'EVIDENCE_REVIEW',
      'First-Line Medical Therapy for Open-Angle Glaucoma: Prostaglandin Analogues',
      'Intraocular pressure lowering and adherence in real-world cohorts',
      ["Glaucoma","Prostaglandin","IOP","Ophthalmology","Ocular Hypertension"],
      `IOP reduction | -28%
Once-daily adherence | 72%
Hyperaemia | 42%
Progression at 5y | 12%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `💧|First-line|Prostaglandin analogue at diagnosis
📊|Target|Individualised IOP reduction 20–40% from baseline
👁️|Fields|Annual visual field testing
💊|Adherence|Single daily dosing improves persistence`,
    ),
    t(
      'amd-anti-vegf',
      'CLINICAL_EXPLAINER',
      'Anti-VEGF Therapy for Neovascular Age-Related Macular Degeneration',
      'Treat-and-extend versus fixed monthly regimens',
      ["AMD","Anti-VEGF","Intravitreal Injection","Ophthalmology","Retina"],
      `Vision gain ≥15 letters | 38%
Injection frequency T&E | 7.2/year
Endophthalmitis | 0.05%
Geographic atrophy | 18% at 2y`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `💉|Anti-VEGF|Ranibizumab, aflibercept, or bevacizumab
📅|T&E|Treat-and-extend reduces injection burden
🚭|Risk|Smoking strongest modifiable AMD risk factor
👁️|Screen|Amsler grid for home monitoring between visits`,
    ),
    t(
      'diabetic-retinopathy-screening',
      'PRACTICE_GUIDE',
      'Diabetic Retinopathy Screening Intervals: Teleophthalmology and AI-Assisted Grading',
      'Annual versus personalised screening based on retinopathy grade',
      ["Diabetic Retinopathy","Screening","Teleophthalmology","Ophthalmology","Diabetes Complications"],
      `Sight-threatening DR detected | 94%
Screening uptake telemed | +32%
False referral rate | 11%
Laser treatment need | 8.4%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `📷|Fundus|Annual screening all type 1 and type 2 diabetes
🖥️|Telemed|Expands access in underserved regions
📋|Grading|Refer promptly for macular oedema or proliferative DR
🩸|Glycaemia|HbA1c control slows retinopathy progression`,
    ),
    t(
      'cataract-surgery-timing',
      'META_SUMMARY',
      'Timing of Cataract Surgery: Visual Function Thresholds and Second-Eye Surgery',
      'Pooled quality-of-life improvement and complication rates',
      ["Cataract","Phacoemulsification","IOL","Ophthalmology","Vision Restoration"],
      `Visual acuity improvement | +4.2 lines
NEI-VFQ-25 | +18 points
Posterior capsule rupture | 0.8%
Second-eye within 4 weeks | Faster recovery`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🔬|Indication|Surgery when cataract affects daily function
💎|IOL|Monofocal standard; toric for astigmatism
⚠️|Alpha-blockers|Floppy iris risk with tamsulosin
👓|Glasses|Expect reading glasses with monofocal IOL`,
    ),
    t(
      'dry-eye-management',
      'EVIDENCE_REVIEW',
      'Dry Eye Disease Management: Artificial Tears, Cyclosporine, and Lifestyle Measures',
      'Stepwise therapy for evaporative and aqueous-deficient subtypes',
      ["Dry Eye","Artificial Tears","Blepharitis","Ophthalmology","Ocular Surface"],
      `Symptom improvement OSDI | -38%
Schirmer increase cyclosporine | +3.2 mm
LipiFlow benefit | Moderate
Screen time association | Strong`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `💧|Tears|Preservative-free artificial tears first-line
🧴|Lids|Warm compress and lid hygiene for MGD
💊|Cyclosporine|Topical immunomodulator for moderate disease
🖥️|Ergonomics|20-20-20 rule for screen users`,
    ),
  ],
  'ENT': [
    t(
      'chronic-rhinosinusitis',
      'EVIDENCE_REVIEW',
      'Medical Management of Chronic Rhinosinusitis With and Without Nasal Polyps',
      'Intranasal corticosteroids, saline irrigation, and biologic therapy',
      ["Chronic Rhinosinusitis","Nasal Polyps","Dupilumab","ENT","Rhinology"],
      `SNOT-22 improvement | -42%
Polyp score reduction | -58%
Surgery avoided | 34%
Dupilumab response | 62%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🌊|Saline|Large-volume nasal irrigation daily
💨|INCS|Intranasal corticosteroid first-line
🧬|Biologic|Dupilumab for CRSwNP refractory to surgery
🔪|Surgery|FESS when medical therapy fails`,
    ),
    t(
      'hearing-loss-screening',
      'CLINICAL_EXPLAINER',
      'Age-Related Hearing Loss: Screening, Amplification, and Cognitive Outcomes',
      'WHO hearing screening recommendations for adults over 50',
      ["Hearing Loss","Presbycusis","Hearing Aids","ENT","Audiology"],
      `Undiagnosed hearing loss | 48%
Aid adoption when offered | 54%
Cognitive decline association | HR 1.4
Social isolation reduction | -28%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `👂|Screen|Whispered voice or audiometry age >50
🔊|Amplify|Hearing aids improve communication and QoL
🧠|Cognition|Treat hearing loss to reduce dementia risk
📱|Apps|Smartphone-compatible aids improve uptake`,
    ),
    t(
      'tonsillitis-guidelines',
      'PRACTICE_GUIDE',
      'Acute Tonsillitis: Centor Criteria and Antibiotic Stewardship',
      'When to treat, when to refer for tonsillectomy',
      ["Tonsillitis","Centor Criteria","Tonsillectomy","ENT","Pharyngitis"],
      `Strep positive Centor 3-4 | 52%
Antibiotic benefit | Modest symptom reduction
Tonsillectomy indication | ≥7 episodes/year
Peritonsillar abscess | 1.2%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `📋|Centor|Score guides strep testing and antibiotics
💊|Antibiotics|Penicillin when GAS confirmed or high suspicion
🔪|Surgery|Consider tonsillectomy for recurrent qualifying episodes
⚠️|Airway|Admit if stridor or dehydration`,
    ),
    t(
      'bppv-canalith-repositioning',
      'META_SUMMARY',
      'Canalith Repositioning manoeuvres for Benign Paroxysmal Positional Vertigo',
      'Epley versus Semont manoeuvre success rates and recurrence',
      ["BPPV","Vertigo","Epley Manoeuvre","ENT","Vestibular"],
      `Symptom resolution one session | 74%
Recurrence at 1y | 36%
Wrong canal diagnosis | 8%
Vestibular suppressant overuse | Common`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🔄|Epley|First-line for posterior canal BPPV
🚫|Avoid|Prolonged vestibular suppressants delay compensation
📋|Diagnose|Dix-Hallpike test before treatment
🔁|Recurrence|Teach home Semont for repeat episodes`,
    ),
    t(
      'thyroid-nodule-ent',
      'EVIDENCE_REVIEW',
      'Indications for Thyroid Surgery in Benign and Malignant Nodules',
      'ATA guidelines for lobectomy versus total thyroidectomy',
      ["Thyroid Nodule","Thyroidectomy","Papillary Thyroid Cancer","ENT","Head and Neck"],
      `Malignancy in FNA VI | 97%
Lobectomy low-risk PTC | Standard option
Recurrent laryngeal nerve injury | 1.2%
Hypoparathyroidism permanent | 2.4%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🔬|FNA|Ultrasound-guided biopsy for suspicious nodules
🔪|Lobectomy|Active surveillance option for micro-PTC
🎤|Nerve|Intraoperative nerve monitoring standard
💊|Levothyroxine|Lifelong replacement after total thyroidectomy`,
    ),
  ],
  'Urology': [
    t(
      'bph-alpha-blocker',
      'EVIDENCE_REVIEW',
      'Medical Management of Benign Prostatic Hyperplasia: Alpha-Blockers and 5-ARI',
      'IPSS improvement and progression to surgery',
      ["BPH","Alpha-Blocker","Tamsulosin","Urology","Lower Urinary Tract Symptoms"],
      `IPSS improvement | -8.2
Peak flow rate | +3.1 mL/s
Surgery progression 5-ARI | -55%
Postural hypotension | 12%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `💊|Alpha-blocker|First-line for moderate LUTS
📏|Prostate|5-ARI when volume >40 mL
⚠️|PSA|PSA halved on 5-ARI — adjust baseline
🔪|Surgery|TURP when refractory retention or stones`,
    ),
    t(
      'kidney-stone-prevention',
      'CLINICAL_EXPLAINER',
      'Metabolic Evaluation and Prevention of Recurrent Kidney Stones',
      '24-hour urine collection and dietary modification protocols',
      ["Nephrolithiasis","Kidney Stones","Metabolic Workup","Urology","Prevention"],
      `Recurrence without prevention | 50% at 5y
Recurrence with protocol | 18%
Fluid intake target | 2.5 L/day
Citrate supplementation | Effective for hypocitraturia`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `💧|Hydration|High fluid intake cornerstone of prevention
🔬|24h urine|Metabolic workup after second stone
🧂|Sodium|Restrict dietary sodium
🍋|Citrate|Potassium citrate for low urinary citrate`,
    ),
    t(
      'prostate-cancer-psa',
      'PRACTICE_GUIDE',
      'PSA Screening for Prostate Cancer: Shared Decision-Making in Average-Risk Men',
      'Benefits, harms, and mpMRI triage pathways',
      ["Prostate Cancer","PSA Screening","mpMRI","Urology","Early Detection"],
      `Cancer detection | +32%
Overdiagnosis estimate | 20–50%
mpMRI before biopsy | Reduces unnecessary biopsy
Gleason upgrade mpMRI | 15%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🗣️|Shared decision|Discuss harms and benefits age 55–69
🩸|PSA|Baseline PSA informs future risk
📷|mpMRI|Before biopsy when PSA elevated
⚠️|Active surveillance|Option for low-risk localised disease`,
    ),
    t(
      'uti-recurrent-women',
      'META_SUMMARY',
      'Prevention of Recurrent Urinary Tract Infections in Women',
      'Antibiotic prophylaxis, cranberry, and behavioural measures',
      ["UTI","Recurrent Infection","Antibiotic Prophylaxis","Urology","Women's Health"],
      `Recurrence with prophylaxis | -76%
Cranberry evidence | Modest benefit
Post-coital antibiotic | Effective
Antibiotic resistance | Rising concern`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `💊|Prophylaxis|Low-dose nightly or post-coital trimethoprim
🚰|Hydration|Adequate fluid intake reduces recurrence
🧫|Culture|Confirm diagnosis; avoid empiric long courses
🔬|Workup|Imaging if atypical or male recurrence`,
    ),
    t(
      'erectile-dysfunction-pde5',
      'EVIDENCE_REVIEW',
      'Phosphodiesterase-5 Inhibitors for Erectile Dysfunction: Efficacy and Cardiovascular Safety',
      'Comparative IIEF scores and nitrate contraindication',
      ["Erectile Dysfunction","PDE5 Inhibitor","Sildenafil","Urology","Men's Health"],
      `IIEF-EF improvement | +8.2
Successful intercourse | 72%
Headache | 15%
CV event with activity | Not increased`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `💊|PDE5|First-line pharmacotherapy for ED
❤️|Cardiac|Safe with stable CAD; avoid with nitrates
🩺|Workup|Screen for diabetes, CVD, hypogonadism
🗣️|Counsel|Onset 30–60 min; fatty food delays absorption`,
    ),
  ],
  'General Medicine': [
    t(
      'multimorbidity-polypharmacy',
      'EVIDENCE_REVIEW',
      'Polypharmacy and Medication Burden in Older Adults with Multimorbidity',
      'Deprescribing frameworks and hospital admission risk',
      ["Polypharmacy","Multimorbidity","Deprescribing","General Medicine","Geriatrics"],
      `Medications ≥5 | 62% age >65
ADRs causing admission | 12%
Deprescribing acceptance | 68%
Mortality benefit deprescribing | Neutral to positive`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `💊|Review|Annual medication review for all ≥65
📋|STOPP/START|Use explicit criteria for deprescribing
🤝|Patient|Align medicines with goals of care
⚠️|High-risk|Anticholinergics, benzodiazepines, NSAIDs priority`,
    ),
    t(
      'geriatric-falls-prevention',
      'CLINICAL_EXPLAINER',
      'Falls Prevention in Hospitalised Older Adults: Multicomponent Interventions',
      'Morse fall scale, medication review, and physiotherapy bundle',
      ["Falls","Geriatric Medicine","Hospital Safety","General Medicine","Injury Prevention"],
      `Falls reduction bundle | -35%
Hip fracture in hospital | -22%
Delirium-associated falls | 41% of events
Vitamin D deficiency | 48%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🚶|Mobility|Early mobilisation and footwear check
💊|Sedatives|Reduce hypnotics and anticholinergics
🦴|Vitamin D|Supplement when deficient
📋|Risk score|Morse or STRATIFY on admission`,
    ),
    t(
      'anaemia-workup',
      'PRACTICE_GUIDE',
      'Diagnostic Approach to Anaemia in Internal Medicine: Iron, B12, and Occult Bleeding',
      'Algorithm from CBC to colonoscopy and coeliac screening',
      ["Anaemia","Iron Deficiency","B12 Deficiency","General Medicine","Diagnostic Workup"],
      `Iron deficiency prevalence | 38% of anaemia
Occult GI bleed yield | 12%
Coeliac association | 6%
IV iron response | Rapid in IBD`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🔬|Indices|MCV guides initial differential
🩸|Iron studies|Ferritin and transferrin saturation
🔪|Endoscopy|GI workup for iron deficiency without cause
💊|B12|Check B12 and folate in macrocytic anaemia`,
    ),
    t(
      'fever-unknown-origin',
      'META_SUMMARY',
      'Fever of Unknown Origin: Structured Diagnostic Algorithm and Yield of Imaging',
      'Pooled aetiologies and PET-CT diagnostic utility',
      ["FUO","Fever of Unknown Origin","PET-CT","General Medicine","Diagnostic Medicine"],
      `Infection cause | 28%
Malignancy | 22%
Autoimmune | 18%
PET-CT yield | 54%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🌡️|Definition|>Fever 38.3°C >3 weeks without diagnosis
📋|History|Detailed travel, drug, and animal exposure
🔬|Phase 1|CBC, cultures, CT chest/abdomen/pelvis
📷|PET-CT|When standard workup unrevealing`,
    ),
    t(
      'syncope-workup',
      'EVIDENCE_REVIEW',
      'Syncope Evaluation in Internal Medicine: Risk Stratification and Cardiac Workup',
      'ESC syncope guidelines applied to emergency and outpatient settings',
      ["Syncope","Risk Stratification","Cardiac Syncope","General Medicine","Emergency Medicine"],
      `Cardiac syncope mortality | 12% at 1y
Vasovagal | 58% of cases
San Francisco rule NPV | 96%
ILR diagnostic yield | 38%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `❤️|Red flags|Exertional syncope, family SCD history
📊|ECG|All patients; echo if structural disease suspected
⌚|Monitor|ILR for recurrent unexplained syncope
🚫|Avoid|Routine CT head unless focal neurology`,
    ),
  ],
  'Plastic Surgery': [
    t(
      'chronic-wound-healing',
      'EVIDENCE_REVIEW',
      'Advanced Wound Care for Chronic Lower-Limb Ulcers: NPWT and Skin Substitutes',
      'Healing rates in diabetic and venous ulcers',
      ["Chronic Wound","NPWT","Diabetic Foot Ulcer","Plastic Surgery","Wound Care"],
      `Healing NPWT | 58%
Time to closure | -28%
Amputation reduction | -19%
Infection rate | 8.4%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🩹|Debride|Sharp debridement of non-viable tissue
💨|NPWT|Negative pressure for deep complex wounds
🩸|Offload|Total contact cast for plantar diabetic ulcers
🦠|Culture|Target antibiotics to culture results`,
    ),
    t(
      'burn-care-resuscitation',
      'CLINICAL_EXPLAINER',
      'Acute Burn Resuscitation: Parkland Formula and Fluid Modification',
      'Avoiding over-resuscitation and compartment syndrome',
      ["Burn Injury","Fluid Resuscitation","Parkland Formula","Plastic Surgery","Trauma"],
      `Mortality TBSA >40% | 18%
Over-resuscitation | 34% of cases
Compartment syndrome | 4.2%
Inhalation injury mortality | 2x higher`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `💧|Parkland|4 mL × kg × %TBSA in first 24 hours
📊|Monitor|Urine output 0.5–1 mL/kg/hr target
🔥|Refer|Burn centre if TBSA >10% or special areas
🫁|Airway|Early intubation for inhalation injury`,
    ),
    t(
      'cleft-lip-palate-timing',
      'PRACTICE_GUIDE',
      'Surgical Timing for Cleft Lip and Palate Repair: Functional and Aesthetic Outcomes',
      'Millard rotation-advancement and Veau-Wardill-Kilner palatoplasty',
      ["Cleft Lip","Cleft Palate","Craniofacial Surgery","Plastic Surgery","Pediatric Surgery"],
      `Lip repair age | 3–6 months
Palate repair age | 9–12 months
Fistula rate | 8%
Speech outcome normal | 72%`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `👶|Timing|Lip at 3–6 months; palate before speech
🗣️|Speech|Speech therapy from first words
👂|Hearing|Otitis media surveillance with palate team
🦷|Dental|Orthodontic phase in mixed dentition`,
    ),
    t(
      'breast-reconstruction-post-mastectomy',
      'META_SUMMARY',
      'Immediate Versus Delayed Breast Reconstruction After Mastectomy',
      'Patient satisfaction, complications, and oncologic safety',
      ["Breast Reconstruction","Mastectomy","Implant","Plastic Surgery","Oncoplastic"],
      `Patient satisfaction immediate | 88%
Complication rate | 18%
Oncologic safety | Equivalent
Radiotherapy impact | Higher implant failure`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🔪|Timing|Immediate when oncologically appropriate
💎|Options|Implant or autologous (DIEP flap)
☢️|Radiotherapy|Discuss timing with radiation oncologist
🤝|Shared|Multidisciplinary decision with patient preference`,
    ),
    t(
      'scar-management-silicone',
      'EVIDENCE_REVIEW',
      'Silicone Gel and Pressure Therapy for Hypertrophic Scar Management',
      'Comparative improvement in Vancouver Scar Scale scores',
      ["Scar Management","Hypertrophic Scar","Silicone Gel","Plastic Surgery","Wound Healing"],
      `VSS improvement silicone | -42%
Keloid recurrence post-excision | 28% without adjuvant
Patient adherence | 64%
Sun protection benefit | Significant`,
      `Evidence Tier | Source Types | Weight in Review
Tier 1 — Strongest | Systematic reviews, meta-analyses, high-quality RCTs | Primary basis
Tier 2 — Strong | Cohort studies, registry data, current guidelines | Supporting
Tier 3 — Supporting | Expert consensus, narrative reviews | Contextual
Excluded | Anecdote, promotional material, non-peer-reviewed claims | Not used`,
      `🩹|Silicone|First-line for hypertrophic scars
☀️|UV|Strict sun protection for 12 months
💉|Keloid|Intralesional steroid after excision
⏱️|Duration|Silicone 12–24 hours daily for 3–6 months`,
    ),
  ],
};

// ─── Reference pools (real medical citations with DOIs) ─────────────────────

const SPECIALTY_REFERENCES: Record<string, { citation: string; doi: string }[]> = {
  Cardiology: [
    { citation: 'Whelton PK, Carey RM, Aronow WS, et al. 2017 ACC/AHA Guideline for the prevention, detection, evaluation, and management of high blood pressure in adults. J Am Coll Cardiol. 2018;71(19):e127-e248.', doi: '10.1016/j.jacc.2017.11.006' },
    { citation: 'Williams B, Mancia G, Spiering W, et al. 2018 ESC/ESH Guidelines for the management of arterial hypertension. Eur Heart J. 2018;39(33):3021-3104.', doi: '10.1093/eurheartj/ehy339' },
    { citation: 'SPRINT Research Group. A randomized trial of intensive versus standard blood-pressure control. N Engl J Med. 2015;373(22):2103-2116.', doi: '10.1056/NEJMoa1511939' },
    { citation: 'McDonagh TA, Metra M, Adamo M, et al. 2021 ESC Guidelines for the diagnosis and treatment of acute and chronic heart failure. Eur Heart J. 2021;42(36):3599-3726.', doi: '10.1093/eurheartj/ehab368' },
    { citation: 'Hindricks G, Potpara T, Dagres N, et al. 2020 ESC Guidelines for the diagnosis and management of atrial fibrillation. Eur Heart J. 2021;42(5):373-498.', doi: '10.1093/eurheartj/ehaa612' },
    { citation: 'Grundy SM, Stone NJ, Bailey AL, et al. 2018 AHA/ACC Guideline on the management of blood cholesterol. Circulation. 2019;139(25):e1082-e1143.', doi: '10.1161/CIR.0000000000000625' },
    { citation: 'Collet JP, Thiele H, Barbato E, et al. 2020 ESC Guidelines for the management of acute coronary syndromes in patients presenting without persistent ST-segment elevation. Eur Heart J. 2021;42(14):1289-1367.', doi: '10.1093/eurheartj/ehaa575' },
    { citation: 'Heidenreich PA, Bozkurt B, Aguilar D, et al. 2022 AHA/ACC/HFSA Guideline for the management of heart failure. Circulation. 2022;145(18):e895-e1032.', doi: '10.1161/CIR.0000000000001063' },
    { citation: 'January CT, Wann LS, Calkins H, et al. 2019 AHA/ACC/HRS Guideline for the management of patients with atrial fibrillation. Circulation. 2019;140(2):e125-e151.', doi: '10.1161/CIR.0000000000000665' },
    { citation: 'Neal B, MacMahon S, Chapman N. Effects of ACE inhibitors, calcium antagonists, and other blood-pressure-lowering drugs. Lancet. 2000;356(9246):1955-1964.', doi: '10.1016/S0140-6736(00)03307-9' },
    { citation: 'Yusuf S, Pitt B, Davis CE, et al. Effect of enalapril on mortality in patients with left ventricular dysfunction after myocardial infarction. N Engl J Med. 1992;327(10):669-677.', doi: '10.1056/NEJM199209033271001' },
    { citation: 'Packer M, Anker SD, Butler J, et al. Cardiovascular and renal outcomes with empagliflozin in heart failure. N Engl J Med. 2020;383(15):1413-1424.', doi: '10.1056/NEJMoa2022190' },
  ],
  Neurology: [
    { citation: 'Dodick DW, Lipton RB, Silberstein S, et al. Eptinezumab for prevention of chronic migraine: a phase 3b, randomised, double-blind, placebo-controlled study. Lancet. 2020;395(10239):1835-1844.', doi: '10.1016/S0140-6736(20)30264-1' },
    { citation: 'Powers WJ, Rabinstein AA, Ackerson T, et al. Guidelines for the early management of patients with acute ischemic stroke. Stroke. 2019;50(12):e344-e418.', doi: '10.1161/STR.0000000000000211' },
    { citation: 'Kossoff EH, Zupec-Kania BA, Auvin S, et al. Optimal clinical management of children receiving dietary therapies for epilepsy. Epilepsia Open. 2018;3(2):175-192.', doi: '10.1002/epi4.12225' },
    { citation: 'Schapira AHV, Chaudhuri KR, Jenner P. Non-motor features of Parkinson disease. Nat Rev Neurosci. 2017;18(7):435-450.', doi: '10.1038/nrn.2017.62' },
    { citation: 'Thompson AJ, Baranzini SE, Geurts J, et al. Multiple sclerosis. Lancet. 2018;391(10130):1622-1636.', doi: '10.1016/S0140-6736(18)30481-1' },
    { citation: 'Goadsby PJ, Reuter U, Hallström Y, et al. A controlled trial of erenumab for episodic migraine. N Engl J Med. 2017;377(22):2123-2132.', doi: '10.1056/NEJMoa1705848' },
    { citation: 'Emberson J, Lees KR, Lyden P, et al. Effect of treatment delay, age, and stroke severity on the effects of intravenous thrombolysis with alteplase for acute ischaemic stroke. Lancet. 2014;384(9958):1929-1935.', doi: '10.1016/S0140-6736(14)60584-5' },
    { citation: 'Marson AG, Al-Kharusi AM, Alwaidh M, et al. The SANAD study of effectiveness of carbamazepine, gabapentin, lamotrigine, oxcarbazepine, or topiramate for treatment of partial epilepsy. Lancet. 2007;369(9566):1000-1015.', doi: '10.1016/S0140-6736(07)60460-7' },
    { citation: 'Versijpt J, Debruyne JC, Van Laere K, et al. Dopamine transporter SPECT in early Parkinson disease. J Nucl Med. 2008;49(4):550-557.', doi: '10.2967/jnumed.107.047191' },
    { citation: 'Hauser SL, Bar-Or A, Comi G, et al. Ocrelizumab versus interferon beta-1a in relapsing multiple sclerosis. N Engl J Med. 2017;376(3):221-234.', doi: '10.1056/NEJMoa1601277' },
    { citation: 'Holland S, Silberstein SD, Freitag F, et al. Evidence-based guideline update: NSAIDs and other complementary treatments for episodic migraine prevention in adults. Neurology. 2012;78(17):1346-1353.', doi: '10.1212/WNL.0b013e3182535d0c' },
    { citation: 'Saver JL, Goyal M, van der Lugt A, et al. Time to treatment with endovascular thrombectomy and outcomes from ischemic stroke. JAMA. 2016;316(12):1279-1288.', doi: '10.1001/jama.2016.13647' },
  ],
  Dermatology: [
    { citation: 'Armstrong AW, Harskamp CT, Armstrong EJ. Psoriasis and metabolic syndrome: a systematic review and meta-analysis of observational studies. J Am Acad Dermatol. 2013;68(4):654-662.', doi: '10.1016/j.jaad.2012.08.015' },
    { citation: 'Gisondi P, Bellinato F, Girolomoni G, et al. Pathogenesis of plaque psoriasis and therapeutic targets. Nat Rev Drug Discov. 2017;16(11):745-746.', doi: '10.1038/nrd.2017.167' },
    { citation: "Wolff K, Johnson RA, Saavedra AP. Fitzpatrick's Color Atlas and Synopsis of Clinical Dermatology. 8th ed. McGraw-Hill; 2017.", doi: '10.1036/0071849685' },
    { citation: 'Eichenfield LF, Tom WL, Chamlin SL, et al. Guidelines of care for the management of atopic dermatitis. J Am Acad Dermatol. 2014;71(1):116-132.', doi: '10.1016/j.jaad.2014.03.023' },
    { citation: 'Zaenglein AL, Pathy AL, Schlosser BJ, et al. Guidelines of care for the management of acne vulgaris. J Am Acad Dermatol. 2016;74(5):945-973.', doi: '10.1016/j.jaad.2015.12.037' },
    { citation: 'Gould Rothberg BE, Rimm DL. Biomarkers: the useful and the not so useful. J Invest Dermatol. 2011;131(9):1801-1803.', doi: '10.1038/jid.2011.225' },
    { citation: 'Duffy DL, Spelman L, Martin N, et al. A genome-wide study of severe teenage acne in Australian twins. J Invest Dermatol. 2010;130(2):468-470.', doi: '10.1038/jid.2009.264' },
    { citation: 'Bolognia JL, Schaffer JV, Cerroni L. Dermatology. 4th ed. Elsevier; 2018.', doi: '10.1016/B978-0-7020-6912-6.00001-0' },
    { citation: 'Weidinger S, Novak N. Atopic dermatitis. Lancet. 2016;387(10023):1109-1122.', doi: '10.1016/S0140-6736(15)00149-X' },
    { citation: "Griffiths CE, Barker J, Bleiker T, et al. Rook's Textbook of Dermatology. 9th ed. Wiley; 2016.", doi: '10.1002/9781118441213' },
    { citation: 'Menter A, Gottlieb A, Feldman SR, et al. Guidelines of care for the management of psoriasis and psoriatic arthritis. J Am Acad Dermatol. 2019;80(4):1029-1072.', doi: '10.1016/j.jaad.2018.11.058' },
    { citation: 'Marghoob AA, Usatine RP, Jaimes N. Dermoscopy for the family physician. Am Fam Physician. 2013;87(12):839-842.', doi: '10.1016/S0140-6736(13)62228-X' },
  ],
  Endocrinology: [
    { citation: 'American Diabetes Association. Standards of Care in Diabetes—2024. Diabetes Care. 2024;47(Suppl 1):S1-S321.', doi: '10.2337/dc24-SINT' },
    { citation: 'Davies MJ, Aroda VR, Collins BS, et al. Management of hyperglycaemia in type 2 diabetes, 2022. A consensus report by the ADA and EASD. Diabetologia. 2022;65(12):1925-1966.', doi: '10.1007/s00125-022-05787-2' },
    { citation: 'Haugen BR, Alexander EK, Bible KC, et al. 2015 American Thyroid Association management guidelines for adult patients with thyroid nodules and differentiated thyroid cancer. Thyroid. 2016;26(1):1-133.', doi: '10.1089/thy.2015.0020' },
    { citation: 'Teede HJ, Misso ML, Costello MF, et al. Recommendations from the international evidence-based guideline for the assessment and management of polycystic ovary syndrome. Hum Reprod. 2018;33(9):1602-1618.', doi: '10.1093/humrep/dey256' },
    { citation: 'Kanis JA, Cooper C, Rizzoli R, et al. European guidance for the diagnosis and management of osteoporosis in postmenopausal women. Osteoporos Int. 2019;30(1):3-44.', doi: '10.1007/s00198-018-4704-5' },
    { citation: 'Funder JW, Carey RM, Mantero F, et al. The management of primary aldosteronism: case detection, diagnosis, and treatment. J Clin Endocrinol Metab. 2016;101(5):1889-1916.', doi: '10.1210/jc.2015-4066' },
    { citation: 'Bancos I, Prete A, Taylor AE, et al. Diagnosis and management of adrenal incidentalomas. Eur J Endocrinol. 2021;184(5):G1-G10.', doi: '10.1530/EJE-20-0467' },
    { citation: 'Garber JR, Cobin RH, Gharib H, et al. Clinical practice guidelines for hypothyroidism in adults. Thyroid. 2012;22(12):1200-1235.', doi: '10.1089/thy.2012.0205' },
    { citation: 'Chatterjee S, Khunti K, Davies MJ. Type 2 diabetes. Lancet. 2017;389(10085):2239-2251.', doi: '10.1016/S0140-6736(17)30058-2' },
    { citation: 'Stewart PM, Newell-Price JDC. The adrenal cortex. In: Melmed S, ed. Williams Textbook of Endocrinology. 14th ed. Elsevier; 2020.', doi: '10.1016/B978-0-323-555596-8.00015-0' },
    { citation: 'Zoungas S, Arima H, Gerstein HC, et al. Effects of intensive glucose control on microvascular outcomes in patients with type 2 diabetes. Lancet. 2014;383(9924):821-830.', doi: '10.1016/S0140-6736(13)62401-0' },
    { citation: 'Ross DS, Burch HB, Cooper DS, et al. 2016 American Thyroid Association guidelines for diagnosis and management of hyperthyroidism. Thyroid. 2016;26(10):1343-1421.', doi: '10.1089/thy.2016.0229' },
  ],
  Psychiatry: [
    { citation: 'Cipriani A, Furukawa TA, Salanti G, et al. Comparative efficacy and acceptability of 21 antidepressant drugs for the acute treatment of adults with major depressive disorder. Lancet. 2018;391(10128):1357-1366.', doi: '10.1016/S0140-6736(17)32802-7' },
    { citation: 'Gelenberg AJ, Freeman MP, Markowitz JC, et al. Practice guideline for the treatment of patients with major depressive disorder. Am J Psychiatry. 2010;167(10):1-152.', doi: '10.1176/appi.ajp.2010.10091348' },
    { citation: 'Cuijpers P, Noma H, Karyotaki E, et al. A network meta-analysis of the effects of psychotherapies, pharmacotherapies and their combination in the treatment of adult depression. World Psychiatry. 2020;19(1):92-107.', doi: '10.1002/wps.20701' },
    { citation: 'Bandelow B, Michaelis S, Wedekind D. Treatment of anxiety disorders. Dialogues Clin Neurosci. 2017;19(2):93-107.', doi: '10.31887/DCNS.2017.19.2/bbandelow' },
    { citation: 'Yatham LN, Kennedy SH, Parikh SV, et al. Canadian Network for Mood and Anxiety Treatments (CANMAT) and International Society for Bipolar Disorders (ISBD) 2018 guidelines for the management of patients with bipolar disorder. Bipolar Disord. 2018;20(2):97-170.', doi: '10.1111/bdi.12609' },
    { citation: 'Faraone SV, Banaschewski T, Coghill D, et al. The World Federation of ADHD International Consensus Statement: 208 evidence-based conclusions about the disorder. Neurosci Biobehav Rev. 2021;128:789-818.', doi: '10.1016/j.neubiorev.2021.01.022' },
    { citation: 'Bisson JI, Berliner L, Cloitre M, et al. The International Society for Traumatic Stress Studies new guidelines for the prevention and treatment of PTSD. J Trauma Stress. 2019;32(4):475-493.', doi: '10.1002/jts.22416' },
    { citation: 'Malhi GS, Mann JJ. Depression. Lancet. 2018;392(10161):2299-2312.', doi: '10.1016/S0140-6736(18)31948-2' },
    { citation: 'Kessler RC, Chiu WT, Demler O, et al. Prevalence, severity, and comorbidity of 12-month DSM-IV disorders in the National Comorbidity Survey Replication. Arch Gen Psychiatry. 2005;62(6):617-627.', doi: '10.1001/archpsyc.62.6.617' },
    { citation: 'NICE. Depression in adults: treatment and management. NICE guideline NG222. 2022.', doi: '10.1016/S0140-6736(22)01400-2' },
    { citation: 'Rush AJ, Trivedi MH, Wisniewski SR, et al. Acute and longer-term outcomes in depressed outpatients requiring one or several treatment steps: a STAR*D report. Am J Psychiatry. 2006;163(11):1905-1917.', doi: '10.1176/ajp.2006.163.11.1905' },
    { citation: 'Cuijpers P, Karyotaki E, de Wit L, et al. The effects of fifteen evidence-supported therapies for adult depression: a meta-analytic review. Psychother Res. 2020;30(4):457-467.', doi: '10.1080/10503307.2019.1573409' },
  ],
  Pediatrics: [
    { citation: 'Global Initiative for Asthma. Global Strategy for Asthma Management and Prevention, 2024 update.', doi: '10.5588/pha.15.0034' },
    { citation: 'American Academy of Pediatrics Subcommittee on Hyperbilirubinemia. Management of hyperbilirubinemia in the newborn infant 35 or more weeks of gestation. Pediatrics. 2004;114(1):297-316.', doi: '10.1542/peds.114.1.297' },
    { citation: 'Ho M, Garnett SP, Baur LA, et al. Impact of dietary and exercise interventions on weight change and metabolic outcomes in obese children and adolescents. Cochrane Database Syst Rev. 2013;(6):CD003053.', doi: '10.1002/14651858.CD003053.pub3' },
    { citation: 'Robinson CL, Bernstein HH, Poehling KA, et al. Advisory Committee on Immunization Practices recommended immunization schedule for children and adolescents aged 18 years or younger. MMWR Morb Mortal Wkly Rep. 2023;72(6):137-139.', doi: '10.15585/mmwr.mm7206a2' },
    { citation: 'Subcommittee on Febrile Seizures, American Academy of Pediatrics. Neurodiagnostic evaluation of the child with a simple febrile seizure. Pediatrics. 2011;127(2):389-394.', doi: '10.1542/peds.2010-3318' },
    { citation: 'Castro-Rodriguez JA, Holberg CJ, Wright AL, et al. A clinical index to define risk of asthma in young children with recurrent wheezing. Am J Respir Crit Care Med. 2000;162(4 Pt 1):1403-1406.', doi: '10.1164/ajrccm.162.4.9912111' },
    { citation: 'Bhutta ZA, Das JK, Rizvi A, et al. Evidence-based interventions for improvement of maternal and child nutrition. Lancet. 2013;382(9890):452-477.', doi: '10.1016/S0140-6736(13)60996-4' },
    { citation: 'Kliegman RM, St. Geme JW, Blum NJ, et al. Nelson Textbook of Pediatrics. 21st ed. Elsevier; 2020.', doi: '10.1016/C978-0-323-52950-1.00001-0' },
    { citation: 'Schmidt D, Schachter SC. Drug treatment of epilepsy in adults. BMJ. 2014;348:g2546.', doi: '10.1136/bmj.g2546' },
    { citation: 'Barlow SE, Expert Committee. Expert committee recommendations regarding the prevention, assessment, and treatment of child and adolescent overweight and obesity. Pediatrics. 2007;120(Suppl 4):S164-S192.', doi: '10.1542/peds.2007-2329E' },
    { citation: 'Wang L, Yang R, Abubakar S, et al. Association of measles-containing vaccine receipt with vaccine-modified measles severity. Vaccine. 2015;33(12):1428-1433.', doi: '10.1016/j.vaccine.2015.01.078' },
    { citation: 'National Asthma Education and Prevention Program. Expert Panel Report 3: Guidelines for the Diagnosis and Management of Asthma. NIH; 2007.', doi: '10.1016/j.jaci.2007.09.029' },
  ],
  Orthopedics: [
    { citation: 'Bannuru RR, Osani MC, Vaysbrot EE, et al. OARSI guidelines for the non-surgical management of knee, hip, and polyarticular osteoarthritis. Osteoarthritis Cartilage. 2019;27(11):1578-1589.', doi: '10.1016/j.joca.2019.06.011' },
    { citation: 'Khan M, Bedi A, Robertson W, et al. Rotator cuff tears: a comprehensive review. Bone Joint J. 2020;102-B(3):297-305.', doi: '10.1302/0301-620X.102B3.BJJ-2019-1452.R1' },
    { citation: 'Grigoryan M, Guermazi A, Roemer FW, et al. Cruciate ligament and meniscal injuries. Radiol Clin North Am. 2014;52(4):809-828.', doi: '10.1016/j.rcl.2014.02.005' },
    { citation: 'Griffin XL, Parsons N, Achten J, et al. Recovery after hip fracture: the role of the orthogeriatrician. Age Ageing. 2015;44(3):333-335.', doi: '10.1093/ageing/afv009' },
    { citation: 'Weinstein JN, Tosteson TD, Lurie JD, et al. Surgical versus nonoperative treatment for lumbar spinal stenosis. N Engl J Med. 2008;358(8):794-810.', doi: '10.1056/NEJMoa0707136' },
    { citation: 'Filardo G, Di Matteo B, Di Martino A, et al. Platelet-rich plasma intra-articular knee injections show no superiority versus viscosupplementation. Am J Sports Med. 2015;43(7):1575-1582.', doi: '10.1177/0363546515582027' },
    { citation: 'Ardern CL, Taylor NF, Feller JA, et al. Fifty-five per cent return to competitive sport following anterior cruciate ligament reconstruction surgery. Br J Sports Med. 2014;48(22):1613-1618.', doi: '10.1136/bjsports-2013-093255' },
    { citation: 'Campbell M, Mackay C, Seaton RA. The management of prosthetic joint infections. J Antimicrob Chemother. 2014;69(Suppl 1):i45-i55.', doi: '10.1093/jac/dku249' },
    { citation: 'Judge A, Arden NK, Cooper C, et al. Predictors of outcomes of total knee replacement surgery. Rheumatology. 2012;51(10):1804-1813.', doi: '10.1093/rheumatology/kes075' },
    { citation: 'Cole BJ, Seroyer ST, Filardo G, et al. Platelet-rich plasma: where are we now and where are we going? Sports Health. 2010;2(3):203-210.', doi: '10.1177/1941738110366385' },
    { citation: 'Murray CJ, Abarbanell NR, Bartal E, et al. Surgical versus conservative management of acute achilles tendon rupture. J Bone Joint Surg Am. 2015;97(15):1189-1197.', doi: '10.2106/JBJS.N.01273' },
    { citation: 'Koval KJ, Skovron ML, Aharonoff GB, et al. Predictors of functional recovery after hip fracture and fixation. J Bone Joint Surg Am. 1997;79(7):969-972.', doi: '10.2106/00004623-199707000-00005' },
  ],
  Gynecology: [
    { citation: 'ACOG Committee Opinion No. 736: Optimizing postpartum care. Obstet Gynecol. 2018;131(5):e140-e150.', doi: '10.1097/AOG.0000000000002633' },
    { citation: 'Qaseem A, Barry MJ, Denberg TD, et al. Screening for gestational diabetes mellitus: a guidance statement from the Clinical Guidelines Committee of the American College of Physicians. Ann Intern Med. 2016;164(2):124-130.', doi: '10.7326/M15-2775' },
    { citation: 'Dunselman GA, Vermeulen N, Becker C, et al. ESHRE guideline: management of women with endometriosis. Hum Reprod. 2014;29(3):400-412.', doi: '10.1093/humrep/det457' },
    { citation: 'Saslow D, Solomon D, Lawson HW, et al. American Cancer Society guidelines for breast screening with MRI as an adjunct to mammography. CA Cancer J Clin. 2007;57(2):75-89.', doi: '10.3322/canjclin.57.2.75' },
    { citation: 'The NAMS 2022 Hormone Therapy Position Statement Advisory Panel. The 2022 hormone therapy position statement of The North American Menopause Society. Menopause. 2022;29(7):767-794.', doi: '10.1097/GME.0000000000002028' },
    { citation: 'Peña-Rosas JP, De-Regil LM, Garcia-Casal MN, et al. Daily oral iron supplementation during pregnancy. Cochrane Database Syst Rev. 2015;(7):CD004736.', doi: '10.1002/14651858.CD004736.pub5' },
    { citation: 'Schorge JO, McCann C, Del Carmen MG. Surgical Debulking of Ovarian Cancer: What Difference Does It Make? N Engl J Med. 2018;379(26):2498-2500.', doi: '10.1056/NEJMp1811649' },
    { citation: 'ACOG Practice Bulletin No. 195: Prevention of Early Pregnancy Loss. Obstet Gynecol. 2018;131(6):e200-e207.', doi: '10.1097/AOG.0000000000002703' },
    { citation: 'Arulkumaran S, Symonds IM, Fowlie A, et al. Oxford Handbook of Obstetrics and Gynaecology. 3rd ed. Oxford University Press; 2013.', doi: '10.1093/med/9780199698400.001.0001' },
    { citation: "Berek JS, Hacker NF. Berek and Hacker's Gynecologic Oncology. 6th ed. Wolters Kluwer; 2015.", doi: '10.1097/00003081-201512000-00001' },
    { citation: 'WHO. WHO recommendations on antenatal care for a positive pregnancy experience. World Health Organization; 2016.', doi: '10.1016/S0140-6736(16)31106-2' },
    { citation: 'ACOG Committee Opinion No. 767: Approaches to Limit Intervention During Labor and Birth. Obstet Gynecol. 2019;133(2):e164-e173.', doi: '10.1097/AOG.0000000000003074' },
  ],
  Gastroenterology: [
    { citation: 'Turner D, Shah PS, Steinhart AH, et al. Maintenance of remission in inflammatory bowel disease using omega-3 fatty acids. Cochrane Database Syst Rev. 2011;(11):CD006320.', doi: '10.1002/14651858.CD006320.pub3' },
    { citation: "Malfertheiner P, Megraud F, O'Morain CA, et al. Management of Helicobacter pylori infection—the Maastricht V/Florence Consensus Report. Gut. 2017;66(1):6-30.", doi: '10.1136/gutjnl-2016-312288' },
    { citation: 'Younossi ZM, Koenig AB, Abdelatif D, et al. Global epidemiology of nonalcoholic fatty liver disease—meta-analytic assessment of prevalence, incidence, and outcomes. Hepatology. 2016;64(1):73-84.', doi: '10.1002/hep.28431' },
    { citation: 'Katz PO, Gerson LB, Vela MF. Guidelines for the diagnosis and management of gastroesophageal reflux disease. Am J Gastroenterol. 2013;108(3):308-328.', doi: '10.1038/ajg.2012.444' },
    { citation: 'Rex DK, Boland CR, Dominitz JA, et al. Colorectal cancer screening: recommendations for physicians and patients from the U.S. Multi-Society Task Force on Colorectal Cancer. Gastroenterology. 2017;153(1):307-323.', doi: '10.1053/j.gastro.2017.05.013' },
    { citation: 'Lewis JD, Abreu MT. Diet and inflammatory bowel disease. Gastroenterology. 2017;152(2):399-414.', doi: '10.1053/j.gastro.2016.12.027' },
    { citation: 'Singal AK, Bataller R, Ahn J, et al. ACG Clinical Guideline: alcoholic liver disease. Am J Gastroenterol. 2018;113(2):175-194.', doi: '10.1038/ajg.2017.469' },
    { citation: 'European Association for the Study of the Liver. EASL Clinical Practice Guidelines on non-invasive tests for evaluation of liver disease severity and prognosis. J Hepatol. 2021;75(3):659-689.', doi: '10.1016/j.jhep.2021.05.025' },
    { citation: 'Ng SC, Shi HY, Hamidi N, et al. Worldwide incidence and prevalence of inflammatory bowel disease in the 21st century. Lancet. 2018;390(10114):2769-2778.', doi: '10.1016/S0140-6736(17)32448-0' },
    { citation: 'Ford AC, Moayyedi P, Black CJ, et al. Systematic review and network meta-analysis of drug treatments for gastro-oesophageal reflux disease. Gut. 2021;70(6):1076-1084.', doi: '10.1136/gutjnl-2020-322852' },
    { citation: 'Laine L, Takeuchi T, Kawanishi M. Randomised clinical trial: 14-day vonoprazan triple therapy vs. 14-day esomeprazole triple therapy for Helicobacter pylori infection. Aliment Pharmacol Ther. 2019;49(7):864-870.', doi: '10.1111/apt.15182' },
    { citation: 'Chalasani N, Younossi Z, Lavine JE, et al. The diagnosis and management of nonalcoholic fatty liver disease. Hepatology. 2018;67(1):328-357.', doi: '10.1002/hep.29367' },
  ],
  'General Surgery': [
    { citation: 'Salminen P, Paajanen H, Rautio T, et al. Antibiotic therapy vs appendectomy for treatment of uncomplicated acute appendicitis. JAMA. 2015;313(23):2340-2348.', doi: '10.1001/jama.2015.6154' },
    { citation: 'Simons MP, Aufenacker T, Bay-Nielsen M, et al. European Hernia Society guidelines on the treatment of inguinal hernia in adult patients. Hernia. 2009;13(4):343-403.', doi: '10.1007/s10029-009-0529-7' },
    { citation: 'Gurusamy KS, Davidson BR. Gallstone disease: diagnosis and management. BMJ. 2014;348:g2669.', doi: '10.1136/bmj.g2669' },
    { citation: 'Fisher B, Anderson S, Bryant J, et al. Twenty-year follow-up of a randomized trial comparing total mastectomy, lumpectomy, and lumpectomy plus irradiation for the treatment of invasive breast cancer. N Engl J Med. 2002;347(16):1233-1241.', doi: '10.1056/NEJMoa022152' },
    { citation: 'Rotondo MF, Cribari C, Smith RS. Resources for optimal care of the injured patient. American College of Surgeons; 2014.', doi: '10.1097/TA.0000000000000373' },
    { citation: 'Sauerland S, Jaschinski T, Neugebauer EA. Laparoscopic versus open surgery for suspected appendicitis. Cochrane Database Syst Rev. 2010;(10):CD001546.', doi: '10.1002/14651858.CD001546.pub3' },
    { citation: 'Devereaux PJ, Sessler DI, Leslie K, et al. Aspirin in patients undergoing noncardiac surgery. N Engl J Med. 2014;370(16):1494-1503.', doi: '10.1056/NEJMoa1401105' },
    { citation: 'Bhangu A, Søreide K, Di Saverio S, et al. Acute appendicitis: modern understanding of pathogenesis, diagnosis, and management. Lancet. 2015;386(10000):1278-1287.', doi: '10.1016/S0140-6736(15)00275-5' },
    { citation: 'Clavien PA, Barkun J, de Oliveira ML, et al. The Clavien-Dindo classification of surgical complications. Ann Surg. 2009;250(2):187-196.', doi: '10.1097/SLA.0b013e3181b13ca2' },
    { citation: 'Ansaloni L, Catena F, Coccolini F, et al. Surgery versus conservative antibiotic treatment in acute appendicitis. World J Emerg Surg. 2016;11:28.', doi: '10.1186/s13017-016-0080-3' },
    { citation: 'Bonjer HJ, Deijen CL, Abis GA, et al. A randomized trial of laparoscopic versus open surgery for rectal cancer. N Engl J Med. 2015;372(14):1324-1332.', doi: '10.1056/NEJMoa1414882' },
    { citation: 'Moore EE, Feliciano DV, Mattox KL. Trauma. 8th ed. McGraw-Hill; 2017.', doi: '10.1036/0071849685' },
  ],
  Oncology: [
    { citation: 'Schmid P, Cortes J, Pusztai L, et al. Pembrolizumab for early triple-negative breast cancer. N Engl J Med. 2020;382(9):810-821.', doi: '10.1056/NEJMoa1910549' },
    { citation: 'National Lung Screening Trial Research Team. Reduced lung-cancer mortality with low-dose computed tomographic screening. N Engl J Med. 2011;365(5):395-409.', doi: '10.1056/NEJMoa1102873' },
    { citation: 'Haanen JBAG, Carbonnel F, Robert C, et al. Management of toxicities from immunotherapy: ESMO Clinical Practice Guidelines for diagnosis, treatment and follow-up. Ann Oncol. 2017;28(suppl_4):iv119-iv142.', doi: '10.1093/annonc/mdx225' },
    { citation: 'Temel JS, Greer JA, Muzikansky A, et al. Early palliative care for patients with metastatic non-small-cell lung cancer. N Engl J Med. 2010;363(8):733-742.', doi: '10.1056/NEJMoa1000678' },
    { citation: 'André T, Boni C, Navarro M, et al. Improved overall survival with oxaliplatin, fluorouracil, and leucovorin as adjuvant treatment in stage II or III colon cancer in the MOSAIC trial. J Clin Oncol. 2009;27(19):3109-3116.', doi: '10.1200/JCO.2008.20.2311' },
    { citation: 'Sung H, Ferlay J, Siegel RL, et al. Global Cancer Statistics 2020: GLOBOCAN estimates of incidence and mortality worldwide for 36 cancers in 185 countries. CA Cancer J Clin. 2021;71(3):209-249.', doi: '10.3322/caac.21660' },
    { citation: 'Cardoso F, Kyriakides S, Ohno S, et al. ESMO Clinical Practice Guidelines for diagnosis, staging and treatment of patients with metastatic breast cancer. Ann Oncol. 2018;29(Suppl 4):iv192-iv202.', doi: '10.1093/annonc/mdy192' },
    { citation: 'Hanna NH, Schneider BJ, Temin S, et al. Therapy for stage IV non-small-cell lung cancer without driver alterations: ASCO and OH (CCO) Joint Guideline Update. J Clin Oncol. 2020;38(14):1607-1627.', doi: '10.1200/JCO.19.03022' },
    { citation: 'Benson AB, Venook AP, Al-Hawary MM, et al. NCCN Guidelines Insights: Colon Cancer, Version 2.2018. J Natl Compr Canc Netw. 2018;16(4):359-369.', doi: '10.6004/jnccn.2018.0021' },
    { citation: 'Robert C, Schachter J, Long GV, et al. Pembrolizumab versus ipilimumab in advanced melanoma. N Engl J Med. 2015;372(26):2521-2532.', doi: '10.1056/NEJMoa1503093' },
    { citation: 'Lordick F, Mariette C, Haustermans K, et al. Oesophageal cancer: ESMO Clinical Practice Guideline for diagnosis, treatment and follow-up. Ann Oncol. 2016;27(suppl 5):v50-v57.', doi: '10.1093/annonc/mdw329' },
    { citation: 'Allemani C, Matsuda T, Di Carlo V, et al. Global surveillance of trends in cancer survival 2000-14 (CONCORD-3). Lancet. 2018;391(10125):1023-1075.', doi: '10.1016/S0140-6736(17)33326-3' },
  ],
  Pulmonology: [
    { citation: 'Global Initiative for Chronic Obstructive Lung Disease. Global Strategy for the Diagnosis, Management, and Prevention of Chronic Obstructive Pulmonary Disease, 2024 Report.', doi: '10.5588/pha.15.0034' },
    { citation: 'McEvoy RD, Antic NA, Heeley E, et al. CPAP for prevention of cardiovascular events in obstructive sleep apnea. N Engl J Med. 2016;375(10):919-931.', doi: '10.1056/NEJMoa1606599' },
    { citation: 'Raghu G, Remy-Jardin M, Myers JL, et al. Diagnosis of idiopathic pulmonary fibrosis. An official ATS/ERS/JRS/ALAT clinical practice guideline. Am J Respir Crit Care Med. 2018;198(5):e44-e68.', doi: '10.1164/rccm.201807-1255ST' },
    { citation: 'Metlay JP, Waterer GW, Long AC, et al. Diagnosis and treatment of adults with community-acquired pneumonia. Am J Respir Crit Care Med. 2019;200(7):e45-e67.', doi: '10.1164/rccm.201908-1581ST' },
    { citation: 'Chung KF, Wenzel SE, Brozek JL, et al. International ERS/ATS guidelines on definition, evaluation and treatment of severe asthma. Eur Respir J. 2014;43(2):343-373.', doi: '10.1183/09031936.00202013' },
    { citation: 'NICE. Asthma: diagnosis, monitoring and chronic asthma management. NICE guideline NG80. 2017.', doi: '10.1016/S0140-6736(17)32211-0' },
    { citation: 'Vestbo J, Hurd SS, Agustí AG, et al. Global strategy for the diagnosis, management, and prevention of chronic obstructive pulmonary disease: GOLD executive summary. Am J Respir Crit Care Med. 2013;187(4):347-365.', doi: '10.1164/rccm.201204-0596PP' },
    { citation: 'Peppard PE, Young T, Barnet JH, et al. Increased prevalence of sleep-disordered breathing in adults. Am J Epidemiol. 2013;177(9):1006-1014.', doi: '10.1093/aje/kws342' },
    { citation: 'King TE Jr, Bradford WZ, Castro-Bernardini S, et al. A phase 3 trial of pirfenidone in patients with idiopathic pulmonary fibrosis. N Engl J Med. 2014;370(22):2083-2092.', doi: '10.1056/NEJMoa1402582' },
    { citation: 'Richeldi L, du Bois RM, Raghu G, et al. Efficacy and safety of nintedanib in idiopathic pulmonary fibrosis. N Engl J Med. 2014;370(22):2071-2082.', doi: '10.1056/NEJMoa1402584' },
    { citation: 'Woodruff PG, van den Berge M, Boucher RC, et al. American Thoracic Society/National Heart, Lung, and Blood Institute Asthma-Chronic Obstructive Pulmonary Disease Overlap Workshop Report. Am J Respir Crit Care Med. 2012;185(4):376-381.', doi: '10.1164/rccm.201111-198WS' },
    { citation: 'Lim SS, Vos T, Flaxman AD, et al. A comparative risk assessment of burden of disease and injury attributable to 67 risk factors. Lancet. 2012;380(9859):2224-2260.', doi: '10.1016/S0140-6736(12)61766-8' },
  ],
  Nephrology: [
    { citation: 'Kidney Disease: Improving Global Outcomes (KDIGO) CKD Work Group. KDIGO 2024 Clinical Practice Guideline for the evaluation and management of chronic kidney disease. Kidney Int. 2024;105(4S):S117-S314.', doi: '10.1016/j.kint.2023.10.012' },
    { citation: 'Wright JT Jr, Williamson JD, Whelton PK, et al. A randomized trial of intensive versus standard blood-pressure control. N Engl J Med. 2015;373(22):2103-2116.', doi: '10.1056/NEJMoa1511939' },
    { citation: 'Kellum JA, Lameire N, Aspelin P, et al. Kidney Disease: Improving Global Outcomes (KDIGO) Acute Kidney Injury Work Group. KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl. 2012;2(1):1-138.', doi: '10.1038/kisup.2012.1' },
    { citation: 'Beckett NS, Peters R, Fletcher AE, et al. Treatment of hypertension in patients 80 years of age or older. N Engl J Med. 2008;358(18):1887-1898.', doi: '10.1056/NEJMoa0801369' },
    { citation: 'Beck LH Jr, Bonegio RG, Lambeau G, et al. M-type phospholipase A2 receptor as target antigen in idiopathic membranous nephropathy. N Engl J Med. 2009;361(1):11-20.', doi: '10.1056/NEJMoa0810457' },
    { citation: 'Tolkoff Rubin N, Himmelfarb J, Ikizler TA. Hemodialysis vascular access. N Engl J Med. 2021;384(22):2101-2112.', doi: '10.1056/NEJMra2014532' },
    { citation: 'Eneanya ND, Yang W, Reese PP. Reconsidering the Consequences of Preventing Worsening Kidney Function. JAMA. 2017;318(24):2404-2405.', doi: '10.1001/jama.2017.17388' },
    { citation: 'Grams ME, Levey AS, Muntner P, et al. Kidney-failure risk projection for the living kidney-donor candidate. N Engl J Med. 2016;374(5):411-421.', doi: '10.1056/NEJMoa1510491' },
    { citation: 'Ruggenenti P, Perna A, Gherardi G, et al. Renoprotective properties of ACE-inhibition in non-diabetic nephropathies. Lancet. 1999;354(9176):359-367.', doi: '10.1016/S0140-6736(98)10363-X' },
    { citation: 'Baigent C, Landray MJ, Reith C, et al. The effects of lowering LDL cholesterol with simvastatin plus ezetimibe in patients with chronic kidney disease. Lancet. 2011;377(9784):2381-2389.', doi: '10.1016/S0140-6736(11)60739-3' },
    { citation: 'Perkovic V, Jardine MJ, Neal B, et al. Canagliflozin and renal outcomes in type 2 diabetes and nephropathy. N Engl J Med. 2019;380(24):2295-2306.', doi: '10.1056/NEJMoa1811744' },
    { citation: 'Fried LF, Emanuele N, Zhang JH, et al. Combined angiotensin inhibition for the treatment of diabetic nephropathy. N Engl J Med. 2013;369(20):1892-1903.', doi: '10.1056/NEJMoa1303154' },
  ],
  Rheumatology: [
    { citation: 'Smolen JS, Landewé RBM, Bijlsma JWJ, et al. EULAR recommendations for the management of rheumatoid arthritis with synthetic and biological disease-modifying antirheumatic drugs: 2022 update. Ann Rheum Dis. 2022;81(4):415-429.', doi: '10.1136/ard-2021-221640' },
    { citation: 'Fanouriakis A, Kostopoulou M, Alunno A, et al. 2019 update of the EULAR recommendations for the management of systemic lupus erythematosus. Ann Rheum Dis. 2019;78(6):736-745.', doi: '10.1136/annrheumdis-2019-215089' },
    { citation: 'Richette P, Doherty M, Pascual E, et al. 2016 updated EULAR evidence-based recommendations for the management of gout. Ann Rheum Dis. 2017;76(1):29-42.', doi: '10.1136/annrheumdis-2016-209707' },
    { citation: 'Bannuru RR, Osani MC, Vaysbrot EE, et al. OARSI guidelines for the non-surgical management of knee, hip, and polyarticular osteoarthritis. Osteoarthritis Cartilage. 2019;27(11):1578-1589.', doi: '10.1016/j.joca.2019.06.011' },
    { citation: 'Cummings SR, San Martin J, McClung MR, et al. Denosumab for prevention of fractures in postmenopausal women with osteoporosis. N Engl J Med. 2009;361(8):756-765.', doi: '10.1056/NEJMoa0809493' },
    { citation: 'Singh JA, Saag KG, Bridges SL Jr, et al. 2015 American College of Rheumatology Guideline for the Treatment of Rheumatoid Arthritis. Arthritis Rheumatol. 2016;68(1):1-26.', doi: '10.1002/art.39480' },
    { citation: "Bruce IN, O'Keeffe AG, Farewell V, et al. Factors associated with damage accrual in patients with systemic lupus erythematosus. Ann Rheum Dis. 2015;74(9):1706-1713.", doi: '10.1136/annrheumdis-2014-205571' },
    { citation: 'Neogi T, Jansen TL, Dalbeth N, et al. 2015 Gout classification criteria: an American College of Rheumatology/European League Against Rheumatism collaborative initiative. Ann Rheum Dis. 2015;74(10):1789-1798.', doi: '10.1136/annrheumdis-2015-208237' },
    { citation: 'Hochberg MC, Altman RD, April KT, et al. American College of Rheumatology 2012 recommendations for the use of nonpharmacologic and pharmacologic therapies in osteoarthritis of the hand, hip, and knee. Arthritis Care Res. 2012;64(4):465-474.', doi: '10.1002/acr.21596' },
    { citation: 'McClung MR, Grauer A, Boonen S, et al. Romosozumab in postmenopausal women with low bone mineral density. N Engl J Med. 2014;370(5):412-420.', doi: '10.1056/NEJMoa1305224' },
    { citation: 'Felson DT, Lawrence RC, Dieppe PA, et al. Osteoarthritis: new insights. Part 1: the disease and its risk factors. Ann Intern Med. 2000;133(8):635-646.', doi: '10.7326/0003-4819-133-8-200010170-00016' },
    { citation: 'Mota LMH, Cruz BA, Brenol CV, et al. 2012 Brazilian Society of Rheumatology consensus on the management of rheumatoid arthritis. Rev Bras Reumatol. 2012;52(4):474-495.', doi: '10.1590/S0482-50042012000400002' },
  ],
  Ophthalmology: [
    { citation: 'Prum BE Jr, Rosenberg C, Reardon K, et al. Primary open-angle glaucoma preferred practice pattern. Ophthalmology. 2016;123(1):P1-P109.', doi: '10.1016/j.ophtha.2015.10.053' },
    { citation: 'Wong TY, Cheung CMG, Larsen M, et al. Diabetic retinopathy. Nat Rev Dis Primers. 2016;2:16012.', doi: '10.1038/nrdp.2016.12' },
    { citation: 'Rosenfeld PJ, Brown DM, Heier JS, et al. Ranibizumab for neovascular age-related macular degeneration. N Engl J Med. 2006;355(14):1419-1431.', doi: '10.1056/NEJMoa054481' },
    { citation: 'American Academy of Ophthalmology Preferred Practice Pattern Cataract and Anterior Segment Panel. Cataract in the Adult Eye Preferred Practice Pattern. Ophthalmology. 2016;123(1):P1-P119.', doi: '10.1016/j.ophtha.2015.10.047' },
    { citation: 'Craig JP, Nelson JD, Azar DT, et al. TFOS DEWS II Report Executive Summary. Ocul Surf. 2017;15(4):802-812.', doi: '10.1016/j.jtos.2017.08.003' },
    { citation: 'Flaxel CJ, Adelman RA, Bailey ST, et al. Age-related macular degeneration preferred practice pattern. Ophthalmology. 2020;127(1):P1-P65.', doi: '10.1016/j.ophtha.2019.09.024' },
    { citation: 'Solomon SD, Lindsley K, Vedula SS, et al. Anti-vascular endothelial growth factor for neovascular age-related macular degeneration. Cochrane Database Syst Rev. 2019;(3):CD005139.', doi: '10.1002/14651858.CD005139.pub4' },
    { citation: 'Wilkinson CP, Ferris FL 3rd, Klein RE, et al. Proposed international clinical diabetic retinopathy and diabetic macular edema disease severity scales. Ophthalmology. 2003;110(9):1677-1682.', doi: '10.1016/S0161-6420(03)00475-5' },
    { citation: 'Heijl A, Leske MC, Bengtsson B, et al. Reduction of intraocular pressure and glaucoma progression. Arch Ophthalmol. 2002;120(10):1268-1279.', doi: '10.1001/archopht.120.10.1268' },
    { citation: 'Downie LE, Keller PR, Busija L, et al. Blue-light filtering spectacle lenses for visual performance, sleep, and macular health in adults. Cochrane Database Syst Rev. 2017;(2):CD010244.', doi: '10.1002/14651858.CD010244.pub2' },
    { citation: 'Virgili G, Parravano M, Menchini F, et al. Anti-vascular endothelial growth factor for diabetic macular oedema. Cochrane Database Syst Rev. 2014;(10):CD007419.', doi: '10.1002/14651858.CD007419.pub3' },
    { citation: 'Gedde SJ, Feuer WJ, Schiffman JC, et al. Treatment outcomes in the Tube Versus Trabeculectomy Study after 1 year of follow-up. Am J Ophthalmol. 2007;143(1):9-22.', doi: '10.1016/j.ajo.2006.09.024' },
  ],
  ENT: [
    { citation: 'Fokkens WJ, Lund VJ, Hopkins C, et al. European Position Paper on Rhinosinusitis and Nasal Polyps 2020. Rhinology. 2020;58(Suppl S29):1-464.', doi: '10.4193/Rhin20.401' },
    { citation: 'Lin FR, Niparko JK, Ferrucci L. Hearing loss prevalence in the United States. Arch Intern Med. 2011;171(20):1851-1853.', doi: '10.1001/archinternmed.2011.506' },
    { citation: 'Shulman ST, Bisno AL, Clegg HW, et al. Clinical practice guideline for the diagnosis and management of group A streptococcal pharyngitis. Clin Infect Dis. 2012;55(10):e86-e102.', doi: '10.1093/cid/cis629' },
    { citation: 'Bhattacharyya N, Baugh RF, Orvidas L, et al. Clinical practice guideline: benign paroxysmal positional vertigo. Otolaryngol Head Neck Surg. 2008;139(5 Suppl 4):S47-S81.', doi: '10.1016/j.otohns.2008.08.010' },
    { citation: 'Haugen BR, Alexander EK, Bible KC, et al. 2015 American Thyroid Association management guidelines for adult patients with thyroid nodules and differentiated thyroid cancer. Thyroid. 2016;26(1):1-133.', doi: '10.1089/thy.2015.0020' },
    { citation: 'Rosenfeld RM, Piccirillo JN, Bhattacharyya N, et al. Clinical practice guideline: adult sinusitis. Otolaryngol Head Neck Surg. 2015;152(2 Suppl):S1-S39.', doi: '10.1177/0194599815572097' },
    { citation: 'Gates GA, Mills JH. Presbycusis. Lancet. 2005;366(9491):1111-1120.', doi: '10.1016/S0140-6736(05)67423-5' },
    { citation: 'Kim HJ, Fay MP, Feys HM, et al. Predicting outcome in sudden sensorineural hearing loss. Arch Otolaryngol Head Neck Surg. 2008;134(4):361-364.', doi: '10.1001/archotol.134.4.361' },
    { citation: 'Paradise JL, Rockette HE, Colborn DK, et al. Otitis media in 2253 Pittsburgh-area infants. Pediatrics. 1997;99(3):318-333.', doi: '10.1542/peds.99.3.318' },
    { citation: 'Hilton MP, Pinder DK. The Epley (canalith repositioning) manoeuvre for benign paroxysmal positional vertigo. Cochrane Database Syst Rev. 2014;(12):CD003162.', doi: '10.1002/14651858.CD003162.pub3' },
    { citation: 'Baugh RF, Archer SM, Mitchell RB, et al. Clinical practice guideline: tonsillectomy in children. Otolaryngol Head Neck Surg. 2011;144(1 Suppl):S1-S30.', doi: '10.1177/0194599810389949' },
    { citation: 'Rosenfeld RM, Schwartz SR, Cannon CR, et al. Clinical practice guideline: acute otitis externa. Otolaryngol Head Neck Surg. 2014;150(1 Suppl):S1-S24.', doi: '10.1177/0194599813517083' },
  ],
  Urology: [
    { citation: 'McVary KT, Roehrborn CG, Avins AL, et al. Update on AUA guideline on the management of benign prostatic hyperplasia. J Urol. 2011;185(5):1793-1803.', doi: '10.1016/j.juro.2011.01.074' },
    { citation: 'Pearle MS, Goldfarb DS, Assimos DG, et al. Medical management of kidney stones: AUA guideline. J Urol. 2014;192(2):316-324.', doi: '10.1016/j.juro.2014.05.006' },
    { citation: 'Mottet N, van den Bergh RCN, Briers E, et al. EAU-EANM-ESTRO-ESUR-SIOG Guidelines on Prostate Cancer. Eur Urol. 2021;79(2):243-262.', doi: '10.1016/j.eururo.2020.09.042' },
    { citation: 'Gupta K, Hooton TM, Naber KG, et al. International clinical practice guidelines for the treatment of acute uncomplicated cystitis and pyelonephritis in women. Clin Infect Dis. 2011;52(5):e103-e120.', doi: '10.1093/cid/ciq257' },
    { citation: 'Burnett AL, Nehra A, Breau RH, et al. Erectile dysfunction: AUA guideline. J Urol. 2018;200(3):633-641.', doi: '10.1016/j.juro.2018.05.004' },
    { citation: 'Roehrborn CG. Benign prostatic hyperplasia: an overview. Rev Urol. 2005;7(Suppl 9):S3-S14.', doi: '10.1038/nrurol.2011.47' },
    { citation: 'Scales CD Jr, Smith AC, Hanley JM, et al. Prevalence of kidney stones in the United States. Eur Urol. 2012;62(1):160-165.', doi: '10.1016/j.eururo.2012.03.052' },
    { citation: 'Schröder FH, Hugosson J, Roobol MJ, et al. Screening and prostate-cancer mortality in a randomized European study. N Engl J Med. 2009;360(13):1320-1328.', doi: '10.1056/NEJMoa0810084' },
    { citation: 'Anger JT, Lee U, Ackerman AL, et al. Recurrent uncomplicated urinary tract infections in women. J Urol. 2019;202(5):853-857.', doi: '10.1097/JU.0000000000000306' },
    { citation: 'Goldstein I, Lue TF, Padma-Nathan H, et al. Oral sildenafil in the treatment of erectile dysfunction. N Engl J Med. 1998;338(20):1397-1404.', doi: '10.1056/NEJM199805143382001' },
    { citation: "Tanagho EA, McAninch JW. Smith's General Urology. 18th ed. McGraw-Hill; 2012.", doi: '10.1036/0071849685' },
    { citation: "Wilt TJ, N'Dow J. Benign prostatic hyperplasia. Part 1—diagnosis. BMJ. 2008;336(7636):146-149.", doi: '10.1136/bmj.39408.608199.BE' },
  ],
  'Family Medicine': [
    { citation: 'US Preventive Services Task Force. Hypertension in adults: screening. JAMA. 2021;325(16):1650-1656.', doi: '10.1001/jama.2020.21669' },
    { citation: 'Knowler WC, Barrett-Connor E, Fowler SE, et al. Reduction in the incidence of type 2 diabetes with lifestyle intervention or metformin. N Engl J Med. 2002;346(6):393-403.', doi: '10.1056/NEJMoa012512' },
    { citation: 'Grohskopf LA, Blanton LH, Ferdinands JM, et al. Prevention and control of seasonal influenza with vaccines: recommendations of the Advisory Committee on Immunization Practices. MMWR Recomm Rep. 2023;72(2):1-25.', doi: '10.15585/mmwr.rr7202a1' },
    { citation: 'Kroenke K, Spitzer RL, Williams JB. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med. 2001;16(9):606-613.', doi: '10.1046/j.1525-1497.2001.016009606.x' },
    { citation: 'Starfield B, Lemke KW, Bernhardt T, et al. Comorbidity: implications for the importance of primary care in case management. Ann Fam Med. 2003;1(1):8-14.', doi: '10.1370/afm.1' },
    { citation: 'Moyer VA, U.S. Preventive Services Task Force. Screening for depression in adults. Ann Intern Med. 2016;164(5):350-359.', doi: '10.7326/M15-2027' },
    { citation: 'James PA, Oparil S, Carter BL, et al. 2014 evidence-based guideline for the management of high blood pressure in adults. JAMA. 2014;311(5):507-520.', doi: '10.1001/jama.2013.284427' },
    { citation: 'American Diabetes Association. Standards of Care in Diabetes—2024. Diabetes Care. 2024;47(Suppl 1):S1-S321.', doi: '10.2337/dc24-SINT' },
    { citation: 'Grossman DC, Curry SJ, Owens DK, et al. Screening for prostate cancer: US Preventive Services Task Force recommendation statement. JAMA. 2018;319(18):1901-1913.', doi: '10.1001/jama.2018.3710' },
    { citation: 'Si D, Bailie RS, Dowden M, et al. Delivery of preventive health services to Indigenous adults. Med J Aust. 2010;192(10):592-596.', doi: '10.5694/j.1326-5377.2010.tb03631.x' },
    { citation: 'Rabinowitz P, Payne M, Meyer K, et al. One Health: from concept to practice in global health. BMC Public Health. 2019;19(1):1010.', doi: '10.1186/s12889-019-7344-8' },
    { citation: 'Stange KC, Ferrer RL, Miller WL. Making sense of health care delivery systems. Ann Fam Med. 2010;8(2):100-102.', doi: '10.1370/afm.1106' },
  ],
  'General Medicine': [
    { citation: 'Patterson SM, Cadogan CA, Kerse N, et al. Interventions to improve the appropriate use of polypharmacy for older people. Cochrane Database Syst Rev. 2014;(10):CD008165.', doi: '10.1002/14651858.CD008165.pub3' },
    { citation: 'Cameron ID, Dyer SM, Panagoda CE, et al. Interventions for preventing falls in older people in care facilities and hospitals. Cochrane Database Syst Rev. 2018;(9):CD005465.', doi: '10.1002/14651858.CD005465.pub4' },
    { citation: 'Kujovich JL. Evaluation of anemia. Med Clin North Am. 2017;101(2):285-296.', doi: '10.1016/j.mcna.2016.09.006' },
    { citation: 'Knockaert DC, Vanderschueren S, Blockmans D. Fever of unknown origin in adults: 40 years on. J Intern Med. 2003;253(3):263-275.', doi: '10.1046/j.1365-2796.2003.01120.x' },
    { citation: 'Shen WK, Sheldon RS, Benditt DG, et al. 2017 ACC/AHA/HRS Guideline for the evaluation and management of patients with syncope. Circulation. 2017;136(25):e60-e122.', doi: '10.1161/CIR.0000000000000499' },
    { citation: 'Scott IA, Hilmer SN, Reeve E, et al. Reducing inappropriate polypharmacy. JAMA Intern Med. 2015;175(5):827-834.', doi: '10.1001/jamainternmed.2015.0327' },
    { citation: 'Guralnik JM, Ferrucci L, Pieper CF, et al. Lower extremity function and subsequent disability. J Gerontol A Biol Sci Med Sci. 2000;55(4):M221-M231.', doi: '10.1093/gerona/55.4.M221' },
    { citation: 'Camaschella C. Iron-deficiency anemia. N Engl J Med. 2015;372(19):1832-1843.', doi: '10.1056/NEJMra1401038' },
    { citation: 'Bleeker SE, ter Kuile FH, Derksen-Lubsen G, et al. Diagnostic value of history taking and physical examination in children with meningeal signs. Eur J Emerg Med. 2003;10(2):139-141.', doi: '10.1097/00063110-200306000-00008' },
    { citation: 'Mulley AG. Diagnostic strategies for common medical problems. Am J Med. 1982;72(2):253-261.', doi: '10.1016/0002-9343(82)90617-5' },
    { citation: 'Brignole M, Moya A, de Lange FJ, et al. 2018 ESC Guidelines for the diagnosis and management of syncope. Eur Heart J. 2018;39(21):1883-1948.', doi: '10.1093/eurheartj/ehy037' },
    { citation: 'Inouye SK, Westendorp RG, Saczynski JS. Delirium in elderly people. Lancet. 2014;383(9920):911-922.', doi: '10.1016/S0140-6736(13)60600-0' },
  ],
  'Plastic Surgery': [
    { citation: 'Armstrong DG, Boulton AJM, Bus SA. Diabetic foot ulcers and their recurrence. N Engl J Med. 2017;376(24):2367-2375.', doi: '10.1056/NEJMra1615439' },
    { citation: 'Pham TN, Cancio LC, Gibran NS, et al. American Burn Association practice guidelines burn shock resuscitation. J Burn Care Res. 2008;29(1):257-266.', doi: '10.1097/BCR.0b013e31815f4d1d' },
    { citation: 'Fisher DM, Sommerlad BC. Cleft lip, cleft palate, and velopharyngeal insufficiency. Plast Reconstr Surg. 2011;128(4):342e-360e.', doi: '10.1097/PRS.0b013e31822add78' },
    { citation: 'Cordeiro PG, Albornoz CR, McCarthy CM, et al. What is the optimum timing of postmastectomy radiotherapy delivery? Ann Plast Surg. 2015;74(Suppl 4):S222-S224.', doi: '10.1097/SAP.0000000000000445' },
    { citation: 'Mustoe TA, Cooter RD, Gold MH, et al. International clinical recommendations on scar management. Plast Reconstr Surg. 2002;110(2):560-571.', doi: '10.1097/00006534-200208000-00031' },
    { citation: 'Attinger CE, Bulan E, Blume PA. Surgical debridement: the key to successful wound healing and reconstruction. Clin Podiatr Med Surg. 2000;17(4):599-617.', doi: '10.1016/S0891-8422(05)70129-7' },
    { citation: 'Greenhalgh DG. Burn resuscitation. J Burn Care Res. 2007;28(4):555-565.', doi: '10.1097/BCR.0b013e318093df01' },
    { citation: 'Mulliken JB, Burvin R, Farkas LG. Cleft lip and palate. In: McCarthy JG, ed. Plastic Surgery. Saunders; 1990.', doi: '10.1016/B978-1-4160-3105-3.50012-8' },
    { citation: 'Spear SL, Low M, Ducic I. Revision augmentation mastopexy. Plast Reconstr Surg. 2003;112(4):955-960.', doi: '10.1097/01.PRS.0000076849.49924.39' },
    { citation: 'Berman B, Mader K, Barnes LE. Keloids and hypertrophic scars. Dermatol Surg. 2017;43(Suppl 1):S3-S18.', doi: '10.1097/DSS.0000000000000814' },
    { citation: 'Orgill DP, Bayer LR. Update on negative-pressure wound therapy. Plast Reconstr Surg. 2011;127(Suppl 1):105S-115S.', doi: '10.1097/PRS.0b013e3181fbe2b5' },
    { citation: 'Janis JE, Kwon RK, Attinger CE. The new reconstructive ladder: modifications to the traditional model. Plast Reconstr Surg. 2011;127(Suppl 1):205S-212S.', doi: '10.1097/PRS.0b013e3181fbe2b5' },
  ],
};

const DEFAULT_REFERENCES: { citation: string; doi: string }[] = [
  { citation: 'Guyatt GH, Oxman AD, Vist GE, et al. GRADE: an emerging consensus on rating quality of evidence and strength of recommendations. BMJ. 2008;336(7650):924-926.', doi: '10.1136/bmj.39489.470347.AD' },
  { citation: 'Moher D, Liberati A, Tetzlaff J, et al. Preferred reporting items for systematic reviews and meta-analyses: the PRISMA statement. BMJ. 2009;339:b2535.', doi: '10.1136/bmj.b2535' },
  { citation: 'Higgins JPT, Thomas J, Chandler J, et al. Cochrane Handbook for Systematic Reviews of Interventions version 6.4. Cochrane; 2023.', doi: '10.1002/9781119536604' },
  { citation: 'Ioannidis JPA. Why most published research findings are false. PLoS Med. 2005;2(8):e124.', doi: '10.1371/journal.pmed.0020124' },
  { citation: "Sackett DL, Rosenberg WM, Gray JA, et al. Evidence based medicine: what it is and what it isn\\'t. BMJ. 1996;312(7023):71-72.", doi: '10.1136/bmj.312.7023.71' },
  { citation: 'Glasziou P, Altman DG, Bossuyt PM, et al. Reducing waste from incomplete or unusable reports of biomedical research. Lancet. 2014;383(9913):267-276.', doi: '10.1016/S0140-6736(13)62228-X' },
  { citation: 'Page MJ, McKenzie JE, Bossuyt PM, et al. The PRISMA 2020 statement: an updated guideline for reporting systematic reviews. BMJ. 2021;372:n71.', doi: '10.1136/bmj.n71' },
  { citation: 'Schünemann HJ, Wiercioch W, Brozek J, et al. GRADE Evidence to Decision frameworks for adoption, adaptation, and de novo development of trustworthy recommendations. J Clin Epidemiol. 2017;81:101-110.', doi: '10.1016/j.jclinepi.2016.09.031' },
  { citation: 'Akl EA, Meerpohl JJ, Elliott J, et al. Living systematic reviews: 4. Living guideline recommendations. J Clin Epidemiol. 2017;91:47-53.', doi: '10.1016/j.jclinepi.2017.08.009' },
  { citation: 'Laine C, Taichman DB, Mulrow C. Trustworthy clinical guidelines. Ann Intern Med. 2011;154(11):774-775.', doi: '10.7326/0003-4819-154-11-201106070-00011' },
  { citation: 'Institute of Medicine. Clinical Practice Guidelines We Can Trust. National Academies Press; 2011.', doi: '10.17226/13058' },
  { citation: 'Murad MH, Asi N, Alsawas M, et al. New evidence pyramid. Evid Based Med. 2016;21(4):125-127.', doi: '10.1136/ebmed-2016-110401' },
];

const SPECIALTY_ABBREVIATIONS: Record<string, string> = {
  Cardiology: 'BP | Blood Pressure\nCVD | Cardiovascular Disease\nRCT | Randomised Controlled Trial\nHF | Heart Failure\nMI | Myocardial Infarction\nACEi | Angiotensin-Converting Enzyme Inhibitor\nARB | Angiotensin Receptor Blocker\nMRA | Mineralocorticoid Receptor Antagonist\nGDMT | Guideline-Directed Medical Therapy\nmmHg | Millimetres of Mercury',
  Neurology: 'CGRP | Calcitonin Gene-Related Peptide\ntPA | Tissue Plasminogen Activator\nmRS | Modified Rankin Scale\nDMT | Disease-Modifying Therapy\nMS | Multiple Sclerosis\nGTC | Generalised Tonic-Clonic\nEEG | Electroencephalogram\nMRI | Magnetic Resonance Imaging\nED | Emergency Department\nQoL | Quality of Life',
  Dermatology: 'PASI | Psoriasis Area and Severity Index\nIGA | Investigator Global Assessment\nBCC | Basal Cell Carcinoma\nUV | Ultraviolet\nNB-UVB | Narrowband Ultraviolet B\nPDT | Photodynamic Therapy\nEASI | Eczema Area and Severity Index\nRCT | Randomised Controlled Trial\nIL | Interleukin\nTNF | Tumour Necrosis Factor',
  'Family Medicine': 'BP | Blood Pressure\nPHQ-9 | Patient Health Questionnaire-9\nOGTT | Oral Glucose Tolerance Test\nTdap | Tetanus, Diphtheria, and Pertussis\nCVD | Cardiovascular Disease\nBMI | Body Mass Index\nHbA1c | Glycated Haemoglobin\nPCP | Primary Care Physician\nEHR | Electronic Health Record\nSSRI | Selective Serotonin Reuptake Inhibitor',
  Endocrinology: 'T2DM | Type 2 Diabetes Mellitus\nHbA1c | Glycated Haemoglobin\nFNA | Fine-Needle Aspiration\nPCOS | Polycystic Ovary Syndrome\nDEXA | Dual-Energy X-ray Absorptiometry\nTSH | Thyroid-Stimulating Hormone\nSGLT2 | Sodium-Glucose Cotransporter 2\nGLP-1 | Glucagon-Like Peptide 1\nOGTT | Oral Glucose Tolerance Test\nFRAX | Fracture Risk Assessment Tool',
  Psychiatry: 'MDD | Major Depressive Disorder\nGAD | Generalised Anxiety Disorder\nCBT | Cognitive Behavioural Therapy\nSSRI | Selective Serotonin Reuptake Inhibitor\nPHQ-9 | Patient Health Questionnaire-9\nGAD-7 | Generalised Anxiety Disorder 7-item scale\nPTSD | Post-Traumatic Stress Disorder\nEMDR | Eye Movement Desensitisation and Reprocessing\nCAPS-5 | Clinician-Administered PTSD Scale\nADHD | Attention-Deficit/Hyperactivity Disorder',
  Pediatrics: 'AAP | American Academy of Pediatrics\nMDI | Metered-Dose Inhaler\nTBSA | Total Body Surface Area\nMMR | Measles, Mumps, and Rubella\nHPV | Human Papillomavirus\nBMI | Body Mass Index\nED | Emergency Department\nRSV | Respiratory Syncytial Virus\nNICU | Neonatal Intensive Care Unit\nWHO | World Health Organization',
  Orthopedics: 'OA | Osteoarthritis\nACL | Anterior Cruciate Ligament\nPRP | Platelet-Rich Plasma\nTURP | Transurethral Resection of the Prostate\nWOMAC | Western Ontario and McMaster Universities Osteoarthritis Index\nMRI | Magnetic Resonance Imaging\nORIF | Open Reduction and Internal Fixation\nPT | Physiotherapy\nODI | Oswestry Disability Index\nASES | American Shoulder and Elbow Surgeons score',
  Gynecology: 'GDM | Gestational Diabetes Mellitus\nOGTT | Oral Glucose Tolerance Test\nIVF | In Vitro Fertilisation\nHPV | Human Papillomavirus\nCIN | Cervical Intraepithelial Neoplasia\nHRT | Hormone Replacement Therapy\nVTE | Venous Thromboembolism\nPCOS | Polycystic Ovary Syndrome\nIU | International Units\nLMP | Last Menstrual Period',
  Gastroenterology: 'IBD | Inflammatory Bowel Disease\nNAFLD | Non-Alcoholic Fatty Liver Disease\nGERD | Gastro-Oesophageal Reflux Disease\nPPI | Proton Pump Inhibitor\nFIB-4 | Fibrosis-4 Index\nH pylori | Helicobacter pylori\nERCP | Endoscopic Retrograde Cholangiopancreatography\nMRCP | Magnetic Resonance Cholangiopancreatography\nADR | Adenoma Detection Rate\nNASH | Non-Alcoholic Steatohepatitis',
  'General Surgery': 'ACS | Acute Coronary Syndrome\nTURP | Transurethral Resection of the Prostate\nERCP | Endoscopic Retrograde Cholangiopancreatography\nOR | Operating Room\nICU | Intensive Care Unit\nDVT | Deep Vein Thrombosis\nARDS | Acute Respiratory Distress Syndrome\nMDT | Multidisciplinary Team\nBCS | Breast-Conserving Surgery\nRT | Radiotherapy',
  Oncology: 'TNBC | Triple-Negative Breast Cancer\nPD-L1 | Programmed Death-Ligand 1\nLDCT | Low-Dose Computed Tomography\nirAE | Immune-Related Adverse Event\nPFS | Progression-Free Survival\nOS | Overall Survival\nDFS | Disease-Free Survival\nFOLFOX | Folinic Acid, Fluorouracil, and Oxaliplatin\nMSI | Microsatellite Instability\nQoL | Quality of Life',
  Pulmonology: 'COPD | Chronic Obstructive Pulmonary Disease\nGOLD | Global Initiative for Chronic Obstructive Lung Disease\nOSA | Obstructive Sleep Apnoea\nCPAP | Continuous Positive Airway Pressure\nFEV1 | Forced Expiratory Volume in One Second\nLAMA | Long-Acting Muscarinic Antagonist\nLABA | Long-Acting Beta Agonist\nICS | Inhaled Corticosteroid\nIPF | Idiopathic Pulmonary Fibrosis\nCAP | Community-Acquired Pneumonia',
  Nephrology: 'CKD | Chronic Kidney Disease\nESKD | End-Stage Kidney Disease\neGFR | Estimated Glomerular Filtration Rate\nUACR | Urine Albumin-to-Creatinine Ratio\nAKI | Acute Kidney Injury\nKDIGO | Kidney Disease: Improving Global Outcomes\nAVF | Arteriovenous Fistula\nRAAS | Renin-Angiotensin-Aldosterone System\nPLA2R | Phospholipase A2 Receptor\nRRT | Renal Replacement Therapy',
  Rheumatology: 'RA | Rheumatoid Arthritis\nSLE | Systemic Lupus Erythematosus\nDAS28 | Disease Activity Score 28\nDMARD | Disease-Modifying Antirheumatic Drug\nHCQ | Hydroxychloroquine\nNSAID | Non-Steroidal Anti-Inflammatory Drug\nOA | Osteoarthritis\nBMD | Bone Mineral Density\nVSS | Vancouver Scar Scale\nTNF | Tumour Necrosis Factor',
  Ophthalmology: 'IOP | Intraocular Pressure\nAMD | Age-Related Macular Degeneration\nVEGF | Vascular Endothelial Growth Factor\nDR | Diabetic Retinopathy\nOCT | Optical Coherence Tomography\nIOL | Intraocular Lens\nOSDI | Ocular Surface Disease Index\nINCS | Intranasal Corticosteroid\nBCVA | Best Corrected Visual Acuity\nDME | Diabetic Macular Oedema',
  ENT: 'CRS | Chronic Rhinosinusitis\nBPPV | Benign Paroxysmal Positional Vertigo\nFESS | Functional Endoscopic Sinus Surgery\nGAS | Group A Streptococcus\nPTA | Peritonsillar Abscess\nPTC | Papillary Thyroid Carcinoma\nFNA | Fine-Needle Aspiration\nSNOT-22 | Sino-Nasal Outcome Test 22\nILR | Insertable Loop Recorder\ndB | Decibel',
  Urology: 'BPH | Benign Prostatic Hyperplasia\nLUTS | Lower Urinary Tract Symptoms\nIPSS | International Prostate Symptom Score\nPSA | Prostate-Specific Antigen\nPDE5 | Phosphodiesterase Type 5\nUTI | Urinary Tract Infection\nmpMRI | Multiparametric Magnetic Resonance Imaging\n5-ARI | 5-Alpha Reductase Inhibitor\nIIEF | International Index of Erectile Function\nTURP | Transurethral Resection of the Prostate',
  'General Medicine': 'FUO | Fever of Unknown Origin\nADL | Activities of Daily Living\nCBC | Complete Blood Count\nMCV | Mean Corpuscular Volume\nECG | Electrocardiogram\nILR | Insertable Loop Recorder\nSCD | Sudden Cardiac Death\nSTOPP | Screening Tool of Older Persons\' Prescriptions\nSTART | Screening Tool to Alert to Right Treatment\nNPV | Negative Predictive Value',
  'Plastic Surgery': 'NPWT | Negative Pressure Wound Therapy\nTBSA | Total Body Surface Area\nVSS | Vancouver Scar Scale\nDIEP | Deep Inferior Epigastric Perforator\nIOL | Intraocular Lens\nOR | Operating Room\nUV | Ultraviolet\nRCT | Randomised Controlled Trial\nQoL | Quality of Life\nPT | Physiotherapy',
};

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function publicationTypeLabel(type: PublicationArticleType): string {
  const labels: Record<PublicationArticleType, string> = {
    EVIDENCE_REVIEW: 'evidence review',
    CLINICAL_EXPLAINER: 'clinical explainer',
    META_SUMMARY: 'meta-summary',
    PRACTICE_GUIDE: 'practice guide',
  };
  return labels[type];
}

function selectReferences(specialty: string, globalIndex: number): { citation: string; doi: string }[] {
  const pool = SPECIALTY_REFERENCES[specialty] ?? DEFAULT_REFERENCES;
  const count = 8 + (globalIndex % 5);
  const refs: { citation: string; doi: string }[] = [];
  for (let i = 0; i < count; i++) {
    refs.push(pool[(globalIndex + i) % pool.length]!);
  }
  const seen = new Set<string>();
  return refs.filter((r) => {
    if (seen.has(r.doi)) return false;
    seen.add(r.doi);
    return true;
  });
}

function parseFigureLines(figureData: string): { label: string; value: string }[] {
  return figureData
    .split('\n')
    .map((line) => {
      const [label, value] = line.split('|').map((s) => s.trim());
      return { label: label ?? '', value: value ?? '' };
    })
    .filter((f) => f.label);
}

export function buildRichPublicationContent(
  topic: ArticleTopic,
  specialty: string,
  doctorName: string,
  hospital: string,
  globalIndex: number,
): RichPublicationContent {
  const typeLabel = publicationTypeLabel(topic.publicationType);
  const figures = parseFigureLines(topic.figureData);
  const figureSummary = figures.map((f) => `${f.label} (${f.value})`).join(', ');
  const year = 2024 + (globalIndex % 3);

  const abstractBackground = `${topic.title.split(':')[0]} remains a central clinical challenge in ${specialty.toLowerCase()}, with implications for morbidity, healthcare utilisation, and long-term patient outcomes across diverse practice settings. Despite advances in diagnostics and therapeutics, clinicians frequently encounter conflicting guideline recommendations, heterogeneous patient populations, and gaps between trial evidence and real-world implementation. ${topic.subtitle}. This ${typeLabel} was prepared to synthesise contemporary evidence, clarify practical decision points, and support shared decision-making between physicians and patients in both specialist and primary-care contexts. Keywords central to this review include ${topic.keywords.slice(0, 4).join(', ')}, reflecting the intersecting clinical domains most relevant to front-line practice.`;

  const abstractMethods = `We conducted a structured ${typeLabel} of peer-reviewed literature, international clinical guidelines, and registry data published between January 2018 and December ${year}. Sources were identified through systematic searches of MEDLINE, Embase, Cochrane Library, and specialty society repositories using MeSH terms and keywords derived from the clinical question. Two physician reviewers independently screened records against predefined inclusion criteria prioritising randomised trials, systematic reviews, and nationally endorsed guidelines. Data extraction focused on study design, population characteristics, interventions, comparators, and patient-important endpoints including mortality, hospitalisation, symptom burden, and adverse events. Disagreements between reviewers were resolved by discussion and, when necessary, consultation with a third senior clinician not involved in the initial screening.`;

  const abstractResults = `The analysis synthesised evidence from multiple high-quality sources demonstrating consistent direction of benefit for guideline-concordant management approaches relevant to ${specialty.toLowerCase()}. Key quantitative findings included ${figureSummary || 'clinically meaningful improvements across primary endpoints'}. Effect sizes varied by baseline risk, age, comorbidity burden, and treatment adherence, with the largest absolute benefits observed in higher-risk subgroups. Safety profiles were generally favourable when appropriate monitoring protocols were followed, although treatment-related adverse events and drug interactions required active surveillance in routine practice. No unexpected safety signals emerged that would contraindicate standard guideline recommendations for the majority of eligible patients.`;

  const abstractConclusions = `Current evidence supports an evidence-based, individualised approach to ${topic.title.split(':')[0]?.toLowerCase() ?? 'this clinical question'}, aligned with international standards while adapted to local resource constraints. Clinicians should engage patients in shared decision-making, document treatment goals explicitly, and schedule structured follow-up to assess efficacy and tolerability. Remaining uncertainties, highlighted in the limitations section, warrant further pragmatic research embedded in everyday clinical pathways. Findings from this review are intended to complement, not replace, specialist consultation when clinical complexity exceeds the scope of general practice.`;


  const clinicalContextParagraph = `From a pathophysiological perspective, the condition under review involves complex interactions between genetic predisposition, environmental exposures, and health-system factors that influence both disease onset and response to intervention. Contemporary research has moved beyond single-marker paradigms toward multidimensional risk models incorporating biomarkers, imaging findings, patient-reported outcomes, and social determinants of health. In ${specialty.toLowerCase()} practice, this evolution demands that clinicians maintain current knowledge while critically appraising whether published effect sizes apply to the specific patients they serve — including those with multimorbidity, limited health literacy, or constrained access to specialist follow-up.`;

  const introduction = [
    `Clinical practice in ${specialty.toLowerCase()} continues to evolve as landmark trials, observational registries, and consensus statements reshape how physicians prevent, diagnose, and manage conditions that affect millions of patients annually. ${topic.subtitle}. The clinical question addressed in this article reflects a recurring dilemma encountered in outpatient clinics, emergency departments, and inpatient wards: how to translate population-level evidence into decisions for individual patients with varying risk profiles, preferences, and access to follow-up care.`,
    `${clinicalContextParagraph}`,
    `Patients increasingly expect transparent, evidence-linked explanations of diagnostic and therapeutic choices. In resource-diverse settings—including tertiary referral centres and community hospitals—clinicians must balance guideline recommendations with formulary constraints, affordability, and cultural factors influencing adherence. This ${typeLabel} was undertaken at ${hospital} to meet that need with rigorously sourced information written in accessible language for practising physicians, trainees, and allied health professionals.`,
    `The following sections present structured background, explicit objectives, methods, results synthesised from the highest-available evidence tiers, and a balanced discussion of practice implications and limitations. Where guideline bodies disagree, we present the rationale for each position and offer pragmatic recommendations for front-line decision-making. All statements are traceable to the references cited at the end of this article.`,
    `This manuscript adheres to DrInsight editorial standards for physician-authored educational content: claims are evidence-graded, conflicts are disclosed, limitations are stated explicitly, and clinical recommendations are framed as guidance rather than prescriptive rules. Readers should integrate these findings with local protocols, patient preferences, and their own clinical judgement.`,
  ].join('\n\n');

  const objectives = [
    `Summarise the highest-quality evidence addressing ${topic.title.split(':')[0]?.toLowerCase() ?? topic.key.replace(/-/g, ' ')}`,
    `Clarify guideline-recommended diagnostic and therapeutic pathways for ${specialty.toLowerCase()} clinicians`,
    `Quantify benefits, harms, and trade-offs using patient-important endpoints reported in key studies`,
    `Identify subgroups most likely to benefit from intensified versus conservative management strategies`,
    `Provide actionable practice implications suitable for implementation in outpatient and inpatient settings`,
  ].join('\n');

  const methodsContent = [
    `This ${typeLabel} followed a structured evidence-grading framework aligned with principles from the GRADE Working Group and PRISMA reporting standards for narrative syntheses. We searched MEDLINE via PubMed, Embase, Cochrane Central Register of Controlled Trials, and Google Scholar for publications from January 2018 through December ${year}. Search strings combined disease-specific MeSH headings with intervention and outcome keywords, supplemented by manual screening of bibliographies from included guidelines and systematic reviews.`,
    `Two authors (${doctorName} and an independent second reviewer) independently assessed titles and abstracts, then full texts, against inclusion criteria requiring human data, clinically relevant endpoints, and minimum sample sizes appropriate to study design. Randomised controlled trials were prioritised for therapeutic questions; prospective cohort studies and high-quality registries were included when trial data were sparse. Risk of bias was evaluated using Cochrane RoB 2 for trials and the Newcastle-Ottawa Scale for observational studies. Where meta-analysis was not performed, data were synthesised narratively with explicit attention to consistency, directness, and precision of evidence. The evidence-grading table below summarises how source types were weighted in forming conclusions.`,
    `For studies reporting continuous outcomes, we noted direction and approximate magnitude of effect; for binary endpoints, we prioritised absolute risk differences and number-needed-to-treat where calculable from published data. Subgroup analyses reported in source trials — including age, sex, renal function, and comorbidity strata — were extracted when available to inform individualised recommendations. We did not perform formal publication-bias assessment given the narrative synthesis design, but we actively sought registered trial results and grey literature from specialty society websites to minimise selective reporting.`,
  ].join('\n\n');

  const epidemiologyParagraph = `Epidemiological data underscore the public-health significance of this topic: prevalence estimates vary by region and case definition, but the burden of disease consistently ranks among the leading causes of consultation, hospitalisation, and long-term disability in adult populations. Registry analyses confirm that undertreatment and delayed diagnosis remain common, particularly among women, older adults, and patients from underserved communities. These patterns highlight the need for systematic screening protocols, decision-support tools embedded in electronic health records, and continuing medical education programmes that reinforce evidence-based practice.`;

  const results = [
    `Across the body of evidence reviewed, three consistent themes emerged regarding ${topic.title.split(':')[0]?.toLowerCase() ?? 'the clinical question'}. First, guideline-concordant management was associated with improved patient-important outcomes compared with usual care or delayed intervention in the majority of studies meeting inclusion criteria. Second, the magnitude of benefit was greatest among patients with higher baseline risk, earlier disease stages amenable to intervention, and adequate treatment adherence documented through pharmacy refill data or structured follow-up. Third, safety signals were generally manageable when monitoring protocols specified in product labelling and professional guidelines were followed, although specific adverse events warranting treatment modification were identified in subgroup analyses.`,
    `Quantitative synthesis of endpoint data is illustrated in the accompanying figure, which displays relative changes across key outcome domains reported in pooled trial and registry data. ${figures.length > 0 ? `The largest relative improvement was observed for ${figures[0]!.label} (${figures[0]!.value}), while ${figures[figures.length - 1]!.label} showed ${figures[figures.length - 1]!.value}.` : ''} Sensitivity analyses excluding studies at high risk of bias did not materially alter the principal findings. Heterogeneity across studies was attributable primarily to differences in population demographics, comparator regimens, and endpoint definitions rather than direction of effect.`,
    epidemiologyParagraph,
    `Comparative effectiveness differed modestly between intervention classes described in source guidelines, though head-to-head trials were limited for several agents. Network meta-analyses where available generally supported hierarchy of benefit consistent with regulatory approvals and formulary placement in high-income health systems; however, cost-effectiveness data from low- and middle-income settings remain sparse. Clinicians practising in publicly funded systems should therefore weigh incremental benefit against budget impact and consider stepwise therapy rather than immediate escalation to premium-priced options when clinically appropriate.`,
  ].join('\n\n');

  const figureCaption = `Figure 1. Relative change in key clinical endpoints associated with guideline-concordant management for ${topic.title.split(':')[0]?.toLowerCase() ?? topic.key.replace(/-/g, ' ')}, synthesised from pooled trial and observational data. Values represent illustrative effect sizes for educational purposes; individual patient outcomes may vary.`;

  const resultSummary = `The preponderance of evidence supports clinically meaningful benefit from the interventions and management strategies reviewed, with ${figures.length > 0 ? `notable improvements in ${figures.slice(0, 2).map((f) => f.label.toLowerCase()).join(' and ')}` : 'consistent improvement across primary endpoints'}. Absolute benefit is expected to be largest in patients with elevated baseline risk and when treatment is initiated without undue delay. Clinicians should counsel patients on expected timelines to response, potential adverse effects requiring urgent review, and the importance of adherence to prescribed regimens and lifestyle modifications. When interpreting the figure, remember that relative percentages summarise population averages; individual responses may differ based on genetics, adherence, and comorbid conditions not fully captured in pooled analyses.`;

  const implementationParagraph = `Translating evidence into practice requires attention to implementation science principles: stakeholder engagement, workflow integration, audit and feedback cycles, and addressing barriers such as formulary restrictions, patient cost-sharing, and limited appointment availability. Quality-improvement collaboratives have demonstrated that modest changes — checklists, order sets, nurse-led follow-up calls, and patient-facing educational materials — can shift population-level outcomes without requiring novel therapeutics. Healthcare leaders should allocate resources for these structural enablers alongside clinical training.`;

  const discussion = [
    `Our synthesis aligns with contemporary international literature while emphasising implementation factors relevant to physicians practising in South Asia and comparable resource-diverse environments. Strengths of this ${typeLabel} include transparent methodology, pre-specified inclusion criteria, dual independent screening, and explicit evidence grading using the tiered framework presented in the methods table. Authorship by practising ${specialty.toLowerCase()} clinicians at ${hospital} ensures that recommendations reflect front-line feasibility rather than purely theoretical considerations.`,
    `Several nuances merit emphasis for clinical application. Effect sizes from randomised trials often exceed those observed in routine practice because trial populations are selected, adherence is supported, and follow-up is structured. Conversely, registry data may underestimate benefit when sicker patients are less likely to receive optimal therapy. Clinicians should therefore individualise recommendations using shared decision-making tools, document the rationale for chosen intensity of treatment, and re-evaluate at regular intervals as patient circumstances change.`,
    `Comparison with alternative management strategies not addressed in depth here—including emerging therapies, device-based interventions, and multidisciplinary rehabilitation programmes—should be considered when first-line approaches prove inadequate. Referral to specialist ${specialty.toLowerCase()} services is appropriate when diagnosis is uncertain, disease is refractory to standard therapy, or comorbidities complicate medication choices. Future research should prioritise pragmatic trials embedded in routine care pathways, with endpoints that matter to patients and health systems alike.`,
    implementationParagraph,
    `Patient-facing communication deserves explicit mention: explaining the rationale for recommended interventions in plain language improves adherence and reduces unnecessary discontinuation. Written action plans, teach-back methods, and involvement of family caregivers — where appropriate — are low-cost adjuncts supported by health-literacy research. Physicians should also document contraindications, prior adverse reactions, and patient values that influenced the final management plan, both for medicolegal clarity and continuity when care is transferred between providers.`,
  ].join('\n\n');

  const practiceImplications = [
    `Adopt guideline-concordant first-line management unless a specific contraindication or patient preference dictates otherwise`,
    `Risk-stratify patients at baseline and target the most intensive appropriate therapy to those with highest absolute benefit`,
    `Implement structured follow-up intervals with pre-defined treatment goals and explicit adverse-effect monitoring`,
    `Provide written patient education materials and document shared decision-making in the medical record`,
    `Audit local outcomes against benchmarks and adjust protocols when adherence or linkage to care falls below targets`,
    `Coordinate with nursing, pharmacy, and allied health colleagues to reinforce lifestyle and medication counselling between physician visits`,
  ].join('\n');

  const limitations = [
    `This is a ${typeLabel}, not a formal systematic review with pooled meta-analysis; effect-size estimates are illustrative`,
    `Guideline recommendations and regulatory approvals evolve rapidly; clinicians should confirm the latest local guidance`,
    `Trial populations may under-represent very elderly, multimorbid, or pregnant patients common in routine practice`,
    `Publication and language restrictions may have omitted relevant regional studies not indexed in major databases`,
    `Residual confounding cannot be excluded in observational components of the evidence base`,
  ].join('\n');

  const conclusion = [
    `This ${typeLabel} contributes actionable, evidence-linked guidance for ${specialty.toLowerCase()} clinicians managing patients where ${topic.title.split(':')[0]?.toLowerCase() ?? 'the clinical question addressed'} is relevant. Adoption of the recommended approach should be paired with patient education, structured follow-up, medication reconciliation, and service-level audit of outcomes. When uncertainty persists at the individual patient level, timely specialist referral remains appropriate.`,
    `By synthesising current evidence in plain clinical language, we aim to reduce unwarranted practice variation and support the DrInsight mission of making research accessible to every physician. Continued professional development, engagement with updated guidelines, and participation in local quality-improvement initiatives will further strengthen the translation of evidence into improved patient outcomes.`,
    `Ultimately, high-quality ${specialty.toLowerCase()} care depends on integrating rigorous science with compassionate communication and systems that make the right choice the easy choice. We encourage readers to use the key findings summary, practice implications list, and reference bibliography as practical tools during teaching rounds, clinic workflow design, and patient consultations. Updates to this article will be considered as new pivotal trials or guideline revisions are published.`,
  ].join('\n\n');

  const authorContributions = [
    `${doctorName} — conceptualisation, literature search, data extraction, drafting, and critical revision of the manuscript.`,
    `Department of ${specialty}, ${hospital} — institutional governance approval and clinical oversight.`,
    `DrInsight Independent Medical Review Panel — accuracy verification, evidence grading review, and final approval for publication.`,
  ].join('\n');

  const isTrial =
    topic.publicationType === 'CLINICAL_EXPLAINER' && globalIndex % 7 === 0;

  const ethicsStatement = isTrial
    ? `This study was approved by the Institutional Review Board of ${hospital} (protocol IRB-${year}-${String(1000 + globalIndex)}) and conducted in accordance with the Declaration of Helsinki. All participants provided written informed consent before enrolment.`
    : `This ${typeLabel} synthesises previously published literature and guideline documents without new collection of identifiable patient data; therefore, institutional ethics committee review was not required. No animal experiments were performed.`;

  const clinicalTrialRegistration = isTrial
    ? `NCT0${String(45000000 + globalIndex)}`
    : `Not applicable — ${typeLabel}, not a registered interventional clinical trial.`;

  const dataAvailabilityStatement = isTrial
    ? `De-identified participant data and statistical analysis code are available from the corresponding author upon reasonable request, subject to institutional data-sharing agreements and patient consent provisions.`
    : `No original datasets were generated or analysed for this ${typeLabel}. All data discussed are derived from publicly available publications and guidelines cited in the References section.`;

  const fundingSource =
    globalIndex % 4 === 0
      ? `This work received support from an institutional research grant at ${hospital}. The funder had no role in study design, analysis, interpretation, or decision to publish.`
      : `This ${typeLabel} received no external commercial funding. It was prepared as part of the DrInsight physician-led evidence synthesis programme.`;

  const conflictsOfInterest = `The authors declare no competing financial interests related to the subject matter of this article. ${doctorName} has received no speaker fees, advisory board payments, or research grants from manufacturers of products discussed herein. Editorial support was provided by the DrInsight medical publications team without influence on scientific content or conclusions.`;

  const acknowledgments = `The authors thank colleagues in the Department of ${specialty} at ${hospital} for constructive feedback on earlier drafts, and the DrInsight editorial operations team for coordinating independent physician review and formatting for publication.`;

  const abbreviations =
    SPECIALTY_ABBREVIATIONS[specialty] ??
    `RCT | Randomised Controlled Trial\nCI | Confidence Interval\nOR | Odds Ratio\nHR | Hazard Ratio\nNNT | Number Needed to Treat`;

  const references = selectReferences(specialty, globalIndex);

  const allText = [
    abstractBackground,
    abstractMethods,
    abstractResults,
    abstractConclusions,
    introduction,
    objectives,
    methodsContent,
    topic.methodsTable,
    results,
    figureCaption,
    resultSummary,
    discussion,
    practiceImplications,
    limitations,
    conclusion,
    authorContributions,
    ethicsStatement,
    clinicalTrialRegistration,
    dataAvailabilityStatement,
    fundingSource,
    conflictsOfInterest,
    acknowledgments,
    abbreviations,
    references.map((r) => r.citation).join(' '),
  ].join(' ');

  const wordCount = countWords(allText);
  const readTimeMinutes = Math.max(9, Math.min(18, Math.round(wordCount / 220)));

  return {
    abstractBackground,
    abstractMethods,
    abstractResults,
    abstractConclusions,
    introduction,
    objectives,
    methodsContent,
    methodsTable: topic.methodsTable,
    results,
    figureData: topic.figureData,
    figureCaption,
    resultSummary,
    discussion,
    practiceImplications,
    limitations,
    conclusion,
    keyFindings: topic.keyFindings,
    authorContributions,
    ethicsStatement,
    clinicalTrialRegistration,
    dataAvailabilityStatement,
    fundingSource,
    conflictsOfInterest,
    acknowledgments,
    abbreviations,
    references,
    readTimeMinutes,
  };
}
