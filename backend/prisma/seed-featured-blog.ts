import { BlogStatus, DoctorAvailability, Prisma, PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { SEED_DOMAIN, SEED_PASSWORD } from './seed-data';

const BCRYPT_ROUNDS = 12;

export const FEATURED_BLOG_CATEGORIES = [
  {
    name: 'Cardiology',
    slug: 'cardiology',
    description: 'Heart disease prevention, cardiovascular risk, and cardiac care guidance.',
  },
  {
    name: 'Neurology',
    slug: 'neurology',
    description: 'Brain health, migraines, stroke awareness, and neurological disorders.',
  },
  {
    name: 'Endocrinology',
    slug: 'endocrinology',
    description: 'Diabetes, thyroid disorders, hormones, and metabolic health.',
  },
] as const;

const FEATURED_AUTHORS = [
  {
    email: `sarah.mitchell@${SEED_DOMAIN}`,
    firstName: 'Sarah',
    lastName: 'Mitchell',
    specialty: 'Cardiology',
    subSpecialty: 'Interventional Cardiology',
    gender: 'Female',
    licenseNumber: 'FEATURED-CARD-001',
    credentials: 'MBBS, FCPS (Cardiology)',
  },
  {
    email: `james.okafor@${SEED_DOMAIN}`,
    firstName: 'James',
    lastName: 'Okafor',
    specialty: 'Neurology',
    subSpecialty: 'Headache Medicine',
    gender: 'Male',
    licenseNumber: 'FEATURED-NEURO-001',
    credentials: 'MBBS, MD, MRCP (Neurology)',
  },
  {
    email: `priya.sharma@${SEED_DOMAIN}`,
    firstName: 'Priya',
    lastName: 'Sharma',
    specialty: 'Endocrinology',
    subSpecialty: 'Diabetes & Metabolic Medicine',
    gender: 'Female',
    licenseNumber: 'FEATURED-ENDO-001',
    credentials: 'MBBS, FCPS (Endocrinology)',
  },
  {
    email: `javed.kumbhar@${SEED_DOMAIN}`,
    firstName: 'Javed',
    lastName: 'Kumbhar',
    specialty: 'Internal Medicine',
    subSpecialty: 'Medical Leadership',
    gender: 'Male',
    licenseNumber: 'FEATURED-IM-001',
    credentials: 'MBBS, MD — Internal Medicine',
    platformRole: 'Founder & Medical Director',
    editorialBoard: true,
  },
] as const;

const CARDIOLOGY_CONTENT = `
<p>Heart disease remains the leading cause of death worldwide, yet many warning signs are subtle enough to dismiss as stress, indigestion, or simply getting older. Cardiologists emphasize that early recognition saves lives — and that patients who seek evaluation at the first red flag often have far better outcomes than those who wait.</p>
<h2>1. Chest Discomfort or Pressure</h2>
<p>Chest pain is the most recognized heart symptom, but it does not always feel dramatic. Many patients describe a squeezing, fullness, or pressure in the center of the chest that lasts more than a few minutes or goes away and returns. Pain may radiate to the arm, jaw, neck, or back. Any new or unexplained chest discomfort warrants urgent medical evaluation.</p>
<h2>2. Shortness of Breath</h2>
<p>Feeling winded during activities that were previously easy — climbing stairs, walking to the mailbox, or lying flat at night — can signal heart failure, valve disease, or coronary artery blockages. Sudden severe breathlessness, especially with chest pain, requires emergency care.</p>
<h2>3. Unexplained Fatigue</h2>
<p>Persistent exhaustion that does not improve with rest may reflect reduced blood flow to the heart muscle. Women, in particular, often report fatigue as a primary symptom of heart disease rather than classic chest pain.</p>
<h2>4. Irregular Heartbeat</h2>
<p>Palpitations, a racing heart, or the sensation of skipped beats can indicate atrial fibrillation or other arrhythmias. While occasional palpitations are common, frequent or sustained episodes should be evaluated with an ECG and clinical assessment.</p>
<h2>5. Swelling in Legs, Ankles, or Feet</h2>
<p>Fluid retention in the lower extremities may suggest the heart is not pumping effectively. Swelling accompanied by weight gain, reduced exercise tolerance, or shortness of breath points toward possible heart failure.</p>
<h2>6. Dizziness or Lightheadedness</h2>
<p>Frequent dizziness, fainting, or near-fainting can result from abnormal heart rhythms or dangerously low blood pressure. These symptoms should never be ignored, especially if they occur during exertion.</p>
<h2>7. Cold Sweats</h2>
<p>Breaking out in a cold sweat without fever or exertion — particularly alongside chest discomfort — is a classic sign of a heart attack. Seek emergency care immediately if this occurs.</p>
<h2>8. Nausea or Indigestion</h2>
<p>Gastrointestinal symptoms can mimic heart disease, and heart attacks can present as nausea, vomiting, or upper abdominal pain. When these symptoms appear with other cardiac warning signs, cardiac evaluation is essential.</p>
<h2>9. Persistent Cough or Wheezing</h2>
<p>A chronic cough producing white or pink-tinged mucus may indicate fluid backing up into the lungs due to heart failure. Wheezing that does not respond to asthma treatment should also prompt cardiac assessment.</p>
<h2>10. Pain in the Jaw, Neck, or Back</h2>
<p>Referred pain from the heart can appear in the jaw, neck, shoulders, or upper back — especially in women and older adults. New pain in these areas without an obvious musculoskeletal cause deserves attention.</p>
<h2>Know Your Risk Factors</h2>
<p>High blood pressure, high cholesterol, diabetes, smoking, obesity, family history of premature heart disease, and a sedentary lifestyle all increase cardiovascular risk. Regular screening and lifestyle modification remain the foundation of prevention.</p>
<h2>When to Seek Emergency Care</h2>
<p>Call emergency services immediately if you experience severe chest pain, sudden shortness of breath, fainting, or symptoms that worsen rapidly. Time is muscle — early treatment during a heart attack preserves heart function and saves lives.</p>
<h2>Conclusion</h2>
<p>Your body often signals distress long before a crisis occurs. Listening to these warning signs and consulting a board-certified cardiologist can prevent progression from manageable risk to life-threatening emergency. If you recognize any of these symptoms, schedule an evaluation — your heart will thank you.</p>
`.trim();

const NEUROLOGY_CONTENT = `
<p>Migraine is far more than a bad headache. It is a complex neurological disorder affecting over one billion people worldwide, characterized by recurrent attacks that can last hours to days and significantly impair work, relationships, and quality of life. Understanding triggers, evidence-based treatments, and prevention strategies empowers patients to regain control.</p>
<h2>What Is a Migraine?</h2>
<p>Migraine typically involves moderate to severe throbbing pain, often on one side of the head, accompanied by nausea, vomiting, and sensitivity to light and sound. Some patients experience aura — visual disturbances, tingling, or speech changes — before the headache phase begins. Migraine is diagnosed clinically based on symptom patterns and frequency.</p>
<h2>Common Triggers</h2>
<p>Triggers vary between individuals, but frequently reported factors include:</p>
<ul>
<li><strong>Hormonal changes</strong> — menstrual cycles, pregnancy, and hormonal medications</li>
<li><strong>Dietary factors</strong> — skipped meals, caffeine withdrawal, aged cheeses, alcohol (especially red wine)</li>
<li><strong>Sleep disruption</strong> — both too little and too much sleep</li>
<li><strong>Stress</strong> — and paradoxically, relaxation after intense stress ("letdown headache")</li>
<li><strong>Environmental factors</strong> — bright lights, loud sounds, strong odors, weather changes</li>
<li><strong>Dehydration and physical exertion</strong></li>
</ul>
<p>Keeping a headache diary for 4–8 weeks helps identify personal triggers and patterns.</p>
<h2>Acute Treatment Options</h2>
<p>Acute therapy should be taken at the earliest sign of an attack for best results:</p>
<ul>
<li><strong>NSAIDs</strong> — ibuprofen or naproxen for mild to moderate attacks</li>
<li><strong>Triptans</strong> — sumatriptan and related medications for moderate to severe migraine</li>
<li><strong>Anti-nausea medications</strong> — when vomiting limits oral medication absorption</li>
<li><strong>Gepants and ditans</strong> — newer options for patients who cannot use triptans</li>
</ul>
<p>Overuse of acute medications more than 10–15 days per month can cause medication-overuse headache — a critical reason to discuss prevention with your neurologist.</p>
<h2>Preventive Treatment</h2>
<p>Patients with four or more migraine days per month, or debilitating attacks, benefit from preventive therapy:</p>
<ul>
<li>Beta-blockers, topiramate, or valproate</li>
<li>Tricyclic antidepressants such as amitriptyline</li>
<li>CGRP monoclonal antibodies (erenumab, fremanezumab, galcanezumab)</li>
<li>Botulinum toxin injections for chronic migraine (15+ days per month)</li>
</ul>
<h2>Lifestyle and Non-Pharmacological Strategies</h2>
<p>Regular sleep schedules, consistent meals, hydration, stress management techniques (CBT, mindfulness, biofeedback), and moderate regular exercise all reduce migraine frequency. Identifying and avoiding confirmed triggers is equally important.</p>
<h2>When to See a Neurologist</h2>
<p>Consult a specialist if headaches are increasing in frequency or severity, do not respond to over-the-counter treatments, are accompanied by neurological symptoms (weakness, vision loss, confusion), or significantly impact daily functioning. Sudden "thunderclap" headache — the worst headache of your life — requires emergency evaluation to rule out subarachnoid hemorrhage.</p>
<h2>Conclusion</h2>
<p>Migraine is treatable. With accurate diagnosis, trigger management, appropriate acute and preventive therapies, most patients achieve meaningful reduction in attack frequency and severity. Partner with a neurologist to develop a personalized plan that fits your life.</p>
`.trim();

const ENDOCRINOLOGY_CONTENT = `
<p>Type 2 diabetes affects hundreds of millions of people globally and is rising rapidly in South Asia due to genetic predisposition, dietary shifts, and increasingly sedentary lifestyles. The good news: lifestyle changes combined with appropriate medical therapy can prevent complications and, in early stages, even achieve remission. This guide covers the essentials every patient should know.</p>
<h2>Understanding Type 2 Diabetes</h2>
<p>Type 2 diabetes develops when the body becomes resistant to insulin and the pancreas cannot produce enough insulin to maintain normal blood glucose. It is diagnosed by fasting glucose ≥126 mg/dL, HbA1c ≥6.5%, or random glucose ≥200 mg/dL with symptoms. Many patients are diagnosed incidentally during routine screening.</p>
<h2>Diet: Practical Guidance for Daily Meals</h2>
<p>Nutrition is the cornerstone of diabetes management. Focus on:</p>
<ul>
<li><strong>Portion control</strong> — use the plate method: half non-starchy vegetables, quarter lean protein, quarter whole grains</li>
<li><strong>Carbohydrate quality</strong> — choose whole grains, legumes, and high-fiber foods over refined flour and sugary drinks</li>
<li><strong>Regular meal timing</strong> — avoid long fasting gaps that trigger rebound hyperglycemia</li>
<li><strong>Limit added sugars</strong> — sweets, sweetened chai, juices, and desserts raise glucose rapidly</li>
<li><strong>Healthy fats</strong> — nuts, olive oil, and fish in moderation; limit trans fats and fried foods</li>
</ul>
<p>Work with a dietitian to personalize your plan based on culture, preferences, and medication regimen.</p>
<h2>Exercise and Physical Activity</h2>
<p>Aim for at least 150 minutes of moderate aerobic activity per week (brisk walking, cycling, swimming) plus resistance training twice weekly. Exercise improves insulin sensitivity, aids weight management, and lowers cardiovascular risk. Start gradually if you have been inactive, and check blood glucose before and after exercise if on insulin or sulfonylureas.</p>
<h2>Weight Management</h2>
<p>Even a 5–7% reduction in body weight significantly improves glucose control and lipid profiles. Sustainable changes outperform crash diets. For patients with obesity, discuss whether GLP-1 receptor agonists or other weight-loss medications are appropriate alongside lifestyle intervention.</p>
<h2>Medication Management</h2>
<p>When lifestyle changes alone are insufficient, medications are added stepwise:</p>
<ul>
<li><strong>Metformin</strong> — first-line for most patients</li>
<li><strong>SGLT2 inhibitors</strong> — glucose lowering plus cardiovascular and kidney protection</li>
<li><strong>GLP-1 receptor agonists</strong> — glucose lowering, weight loss, and cardiovascular benefits</li>
<li><strong>Insulin</strong> — when oral agents are inadequate or during illness</li>
</ul>
<p>Never adjust or stop medications without consulting your physician. Report side effects promptly.</p>
<h2>Monitoring and Targets</h2>
<p>Regular monitoring guides treatment decisions:</p>
<ul>
<li><strong>HbA1c</strong> — every 3–6 months; target generally &lt;7% for most adults (individualized)</li>
<li><strong>Home glucose monitoring</strong> — frequency depends on therapy type and control</li>
<li><strong>Blood pressure</strong> — target &lt;130/80 mmHg for most patients with diabetes</li>
<li><strong>Lipid panel</strong> — annual screening; statin therapy for most patients over 40</li>
<li><strong>Kidney function and urine albumin</strong> — annual screening for nephropathy</li>
<li><strong>Eye examination</strong> — annual dilated exam for retinopathy</li>
<li><strong>Foot examination</strong> — daily self-check; annual professional exam</li>
</ul>
<h2>Preventing Complications</h2>
<p>Long-term hyperglycemia damages blood vessels and nerves, leading to heart disease, stroke, kidney failure, blindness, and amputation. Tight glucose control, blood pressure management, statin therapy, and smoking cessation dramatically reduce these risks. Early detection through regular screening is essential.</p>
<h2>Living Well with Diabetes</h2>
<p>Diabetes requires daily attention but should not define your life. Build a support team — endocrinologist, primary care physician, dietitian, diabetes educator — and involve family in meal planning and activity goals. Mental health matters too; diabetes distress is common and treatable.</p>
<h2>Conclusion</h2>
<p>Managing type 2 diabetes is a marathon, not a sprint. With informed lifestyle choices, consistent monitoring, and appropriate medical therapy, most patients lead full, active lives while preventing serious complications. Partner with your healthcare team to create a sustainable plan tailored to you.</p>
`.trim();

export const FEATURED_BLOG_POSTS = [
  {
    title: '10 Warning Signs of Heart Disease You Should Never Ignore',
    slug: '10-warning-signs-heart-disease',
    excerpt:
      "Cardiologists reveal the subtle symptoms that often go unnoticed until it's too late.",
    content: CARDIOLOGY_CONTENT,
    coverImageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
    categorySlug: 'cardiology',
    authorEmail: `sarah.mitchell@${SEED_DOMAIN}`,
    readTimeMinutes: 5,
    featuredOrder: 1,
    tags: [
      'heart disease',
      'cardiology',
      'chest pain',
      'heart attack warning signs',
      'cardiovascular health',
      'preventive cardiology',
    ],
    publishedAt: new Date('2026-05-28T10:00:00.000Z'),
    viewCount: 2840,
  },
  {
    title: 'Understanding Migraine: Triggers, Treatments & Prevention',
    slug: 'understanding-migraine-triggers-treatments-prevention',
    subtitle:
      'From tension headaches to complex aura — a neurologist\'s comprehensive breakdown of one of the world\'s most disabling neurological conditions.',
    excerpt: 'A comprehensive guide to managing chronic migraines from a neurological perspective.',
    content: NEUROLOGY_CONTENT,
    coverImageUrl: 'https://images.unsplash.com/photo-1506126615695-1746f858f06f?w=800&q=80',
    coverImageAlt: 'Illustration of migraine neural pathways',
    coverImageCaption:
      'Illustration of migraine neural pathways. Image credit: DrInsight Medical Illustration Team',
    categorySlug: 'neurology',
    specialty: 'Neurology',
    authorEmail: `james.okafor@${SEED_DOMAIN}`,
    reviewerEmail: `javed.kumbhar@${SEED_DOMAIN}`,
    readTimeMinutes: 8,
    featuredOrder: 2,
    tags: ['Neurology', 'Migraine', 'Headache Disorders', 'Chronic Pain', 'Triptans'],
    summaryPoints: [
      'The clinical definition and types of migraine (with and without aura)',
      'How migraines are diagnosed using International Headache Society criteria',
      'Evidence-based treatment options — acute, preventive, and emerging therapies',
      'Identified triggers and how to manage them with a personalised action plan',
      'When to seek urgent medical attention and red flag symptoms',
    ],
    keyTakeaways: [
      'Migraine is a neurological disorder affecting 1 billion people — not simply a "bad headache"',
      'Diagnosis is clinical, based on ICHD-3 criteria — no specific imaging or blood test exists',
      'Triptans and CGRP gepants are first-line acute treatments; anti-CGRP mAbs are highly effective preventive options',
      'Keeping a migraine diary is essential for identifying personal triggers and monitoring treatment response',
      'Red flag features require immediate emergency evaluation — do not dismiss sudden severe headache',
    ],
    references: [
      {
        text: 'GBD 2023 Headache Collaborators. Global, regional, and national burden of migraine. Lancet Neurology, 2023.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/',
      },
      {
        text: 'Headache Classification Committee of the IHS. The International Classification of Headache Disorders, 3rd edition. Cephalalgia, 2018.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/',
      },
      {
        text: 'NICE Guidelines [NG150]: Headaches in over 12s: diagnosis and management, 2023.',
        url: 'https://www.nice.org.uk/',
      },
    ],
    glossary: [
      { term: 'Aura', definition: 'Transient neurological symptoms that precede migraine headache' },
      { term: 'CGRP', definition: 'Calcitonin Gene-Related Peptide — key target of newer migraine medications' },
      { term: 'MOH', definition: 'Medication Overuse Headache from overuse of acute treatments' },
    ],
    peerReviewed: true,
    lastReviewedAt: new Date('2026-06-01T10:00:00.000Z'),
    seoTitle: 'Migraine Diagnosis & Treatment Guide | DrInsight',
    seoDescription:
      'Complete neurologist-reviewed guide to migraine types, triggers, diagnosis, and evidence-based treatments.',
    metaKeywords: ['migraine', 'neurology', 'headache', 'triptans', 'CGRP'],
    publishedAt: new Date('2026-05-28T10:00:00.000Z'),
    viewCount: 24891,
    averageRating: 4.8,
    ratingCount: 2341,
  },
  {
    title: 'Managing Type 2 Diabetes: A Complete Lifestyle Guide',
    slug: 'managing-type-2-diabetes-complete-lifestyle-guide',
    excerpt: 'From diet and exercise to medication management—everything you need to know.',
    content: ENDOCRINOLOGY_CONTENT,
    coverImageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    categorySlug: 'endocrinology',
    authorEmail: `priya.sharma@${SEED_DOMAIN}`,
    readTimeMinutes: 6,
    featuredOrder: 3,
    tags: [
      'type 2 diabetes',
      'endocrinology',
      'diabetes management',
      'HbA1c',
      'blood sugar',
      'diabetes diet',
      'diabetes lifestyle',
    ],
    publishedAt: new Date('2026-05-22T10:00:00.000Z'),
    viewCount: 3210,
  },
] as const;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function upsertFeaturedAuthors(prisma: PrismaClient) {
  const passwordHash = await hashPassword(SEED_PASSWORD);
  const authorByEmail = new Map<string, { id: string }>();

  for (const author of FEATURED_AUTHORS) {
    const user = await prisma.user.upsert({
      where: { email: author.email },
      create: {
        email: author.email,
        passwordHash,
        firstName: author.firstName,
        lastName: author.lastName,
        role: UserRole.DOCTOR,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        phone: '+923001234567',
      },
      update: {
        firstName: author.firstName,
        lastName: author.lastName,
        role: UserRole.DOCTOR,
        status: UserStatus.ACTIVE,
        emailVerified: true,
      },
    });

    await prisma.doctorProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        specialty: author.specialty,
        subSpecialty: author.subSpecialty,
        licenseNumber: author.licenseNumber,
        bio: `Board-certified ${author.specialty.toLowerCase()} specialist and medical author for DrInsight.`,
        experienceYears: 12,
        consultationFee: new Prisma.Decimal(3500),
        rating: 4.9,
        reviewCount: 86,
        availability: DoctorAvailability.AVAILABLE,
        languages: ['English', 'Urdu'],
        education: `Aga Khan University — MBBS, FCPS (${author.specialty})`,
        hospital: 'DrInsight Medical Center',
        city: 'Karachi',
        country: 'Pakistan',
        gender: author.gender,
        credentials: (author as { credentials?: string }).credentials ?? `MBBS, FCPS (${author.specialty})`,
        platformRole: (author as { platformRole?: string }).platformRole ?? 'Consultant Physician',
        editorialBoard: (author as { editorialBoard?: boolean }).editorialBoard ?? false,
      },
      update: {
        specialty: author.specialty,
        subSpecialty: author.subSpecialty,
        bio: `Board-certified ${author.specialty.toLowerCase()} specialist and medical author for DrInsight.`,
        credentials: (author as { credentials?: string }).credentials,
        platformRole: (author as { platformRole?: string }).platformRole ?? 'Consultant Physician',
        editorialBoard: (author as { editorialBoard?: boolean }).editorialBoard ?? false,
      },
    });

    authorByEmail.set(author.email, { id: user.id });
  }

  return authorByEmail;
}

async function upsertFeaturedCategories(prisma: PrismaClient) {
  const categoryBySlug = new Map<string, string>();

  for (const category of FEATURED_BLOG_CATEGORIES) {
    const record = await prisma.blogCategory.upsert({
      where: { slug: category.slug },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
      update: {
        name: category.name,
        description: category.description,
      },
    });
    categoryBySlug.set(category.slug, record.id);
  }

  return categoryBySlug;
}

export async function seedFeaturedBlogPosts(prisma: PrismaClient) {
  const [authorByEmail, categoryBySlug] = await Promise.all([
    upsertFeaturedAuthors(prisma),
    upsertFeaturedCategories(prisma),
  ]);

  let created = 0;
  let updated = 0;

  for (const post of FEATURED_BLOG_POSTS) {
    const authorId = authorByEmail.get(post.authorEmail)?.id;
    const categoryId = categoryBySlug.get(post.categorySlug);

    if (!authorId || !categoryId) {
      throw new Error(`Missing author or category for featured blog post "${post.slug}".`);
    }

    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } });

    const reviewerId =
      'reviewerEmail' in post && post.reviewerEmail
        ? authorByEmail.get(post.reviewerEmail)?.id
        : undefined;

    const data = {
      title: post.title,
      subtitle: 'subtitle' in post ? post.subtitle : undefined,
      excerpt: post.excerpt,
      content: post.content,
      coverImageUrl: post.coverImageUrl,
      coverImageAlt: 'coverImageAlt' in post ? post.coverImageAlt : undefined,
      coverImageCaption: 'coverImageCaption' in post ? post.coverImageCaption : undefined,
      specialty: 'specialty' in post ? post.specialty : undefined,
      categoryId,
      authorId,
      reviewerId,
      status: BlogStatus.PUBLISHED,
      readTimeMinutes: post.readTimeMinutes,
      viewCount: post.viewCount,
      tags: [...post.tags],
      summaryPoints: 'summaryPoints' in post ? [...post.summaryPoints] : [],
      keyTakeaways: 'keyTakeaways' in post ? [...post.keyTakeaways] : [],
      references: 'references' in post ? post.references : undefined,
      glossary: 'glossary' in post ? post.glossary : undefined,
      peerReviewed: 'peerReviewed' in post ? post.peerReviewed : false,
      lastReviewedAt: 'lastReviewedAt' in post ? post.lastReviewedAt : undefined,
      seoTitle: 'seoTitle' in post ? post.seoTitle : undefined,
      seoDescription: 'seoDescription' in post ? post.seoDescription : undefined,
      metaKeywords: 'metaKeywords' in post ? [...post.metaKeywords] : [],
      averageRating: 'averageRating' in post ? post.averageRating : undefined,
      ratingCount: 'ratingCount' in post ? post.ratingCount : undefined,
      featured: true,
      featuredOrder: post.featuredOrder,
      publishedAt: post.publishedAt,
    };

    if (existing) {
      await prisma.blogPost.update({ where: { slug: post.slug }, data });
      updated += 1;
    } else {
      await prisma.blogPost.create({ data: { slug: post.slug, ...data } });
      created += 1;
    }
  }

  return { created, updated, total: FEATURED_BLOG_POSTS.length };
}
